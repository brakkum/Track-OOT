"use strict";

!function() {

    const PARSER = new DOMParser();

    async function getFile(url) {
        let r = await fetch(url);
        if (r.status < 200 || r.status >= 300) {
            throw new Error(`error loading file "${url}" - status: ${r.status}`);
        }
        return r;
    }

    class Importer {

        importHTML(url) {
            return getFile(url)
                .then(r => r.text())
                .then(r => PARSER.parseFromString(r, "text/html"))
                .then(r => r.body.childNodes);
        }

        importCSS(url) {
            return new Promise((res, rej) => {
                let t = document.createElement("link");
                t.href = url;
                t.rel = "stylesheet";
                t.type = "text/css";
                t.onload = function() {
                    res(t);
                };
                t.onerror = function() {
                    getFile(url).then(function() {
                        rej(`error appending style "${url}"`);
                    }, function(e) {
                        rej(e);
                    })
                };
                document.head.appendChild(t);
            });
        }
    
        importModule(url) {
            return new Promise((res, rej) => {
                let t = document.createElement("script");
                t.src = url;
                t.type = "module";
                t.onload = function() {
                    res(t);
                };
                t.onerror = function(e) {
                    getFile(url).then(function() {
                        rej(`error appending module "${url}"`);
                    }, function(e) {
                        rej(e);
                    })
                };
                document.head.appendChild(t);
            });
        }

    }

    window.$import = Object.freeze(new Importer);

}();