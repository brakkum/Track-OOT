!function() {

    function getFile(url) {
        return fetch(url)
            .then(function(r) {
                if (r.status < 200 || r.status >= 300) {
                    throw new Error(`error loading file "${url}" - status: ${r.status}`);
                }
                return r;
            });
    }

    class Importer {

        importHTML(url) {
            return getFile(url)
                .then(r => r.text())
                .then(r => (new DOMParser()).parseFromString(r, "text/html"))
                .then(r => {
                    while (r.body.childNodes.length > 0) {
                        document.body.appendChild(r.body.childNodes[0]);
                    }
                }).catch(e => {
                    updateLoadingMessage(e);
                });
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
                t.onerror = function(e) {
                    getFile(url).then(function() {
                        rej(`error appending style "${url}"`);
                    }, function(r) {
                        rej(r);
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
                        rej(`error appending style "${url}"`);
                    }, function(r) {
                        rej(r);
                    })
                };
                document.head.appendChild(t);
            });
        }

    }

    window.$import = Object.freeze(new Importer);

}();