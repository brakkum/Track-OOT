"use strict";

!function() {
    const PARSER = new DOMParser();

    async function getFile(url) {
        const r = await fetch(url);
        if (r.status < 200 || r.status >= 300) {
            throw new Error(`error loading file "${url}" - status: ${r.status}`);
        }
        return r;
    }
    
    function getHTML(url) {
        return getFile(url)
            .then(r => r.text())
            .then(r => PARSER.parseFromString(r, "text/html"))
            .then(r => r.body.childNodes);
    }

    class Importer {

        async module(url) {
            if (Array.isArray(url)) {
                const res = [];
                for (const i of url) {
                    res.push(import(i).then(e=>e.default).catch(err=>{throw new Error(`Error appending module "${i}" ${err}`)}));
                }
                return await Promise.all(res);
            } else {
                return await import(url).then(e=>e.default).catch(err=>{throw new Error(`Error appending module "${url}" ${err}`)});
            }
        }

        async html(url) {
            if (Array.isArray(url)) {
                const res = [];
                for (const i of url) {
                    res.push(getHTML(i));
                }
                return await Promise.all(res);
            } else {
                return await getHTML(url);
            }
        }
    
        addStyle(url) {
            return new Promise((res, rej) => {
                const t = document.createElement("link");
                t.rel = "stylesheet";
                t.type = "text/css";
                t.onload = function() {
                    res(t);
                };
                t.onerror = function() {
                    getFile(url).then(function() {
                        rej(`error appending style "${url}"`);
                    }, function(r) {
                        rej(r);
                    })
                };
                t.href = url;
                document.head.append(t);
            });
        }
        
        addScript(url) {
            return new Promise((res, rej) => {
                const t = document.createElement("script");
                t.type = "text/javascript";
                t.onload = function() {
                    res(t);
                };
                t.onerror = function() {
                    getFile(url).then(function() {
                        rej(`error appending script "${url}"`);
                    }, function(r) {
                        rej(r);
                    })
                };
                t.src = url;
                document.head.append(t);
            });
        }
        
        addModule(url) {
            return new Promise((res, rej) => {
                const t = document.createElement("script");
                t.type = "module";
                t.onload = function() {
                    res(t);
                };
                t.onerror = function() {
                    getFile(url).then(function() {
                        rej(`error appending module "${url}"`);
                    }, function(r) {
                        rej(r);
                    })
                };
                t.src = url;
                document.head.append(t);
            });
        }

    }

    window.$import = Object.freeze(new Importer);
}();
