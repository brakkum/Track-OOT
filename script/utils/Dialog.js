!function() {

    const Q_TAB = [
        'button:not([tabindex="-1"])',
        '[href]:not([tabindex="-1"])',
        'input:not([tabindex="-1"])',
        'select:not([tabindex="-1"])',
        'textarea:not([tabindex="-1"])',
        '[tabindex]:not([tabindex="-1"])'
    ].join(',');

    var cnt = 0;
    function getNewID() {
        return "dialog_" + (++cnt);
    }

    function createWindow() {
        var id = getNewID();
        var res = {
            container: document.createElement('DIV'),
            window: document.createElement('DIV'),
            focusCT : document.createElement('DIV'),
            focusCB : document.createElement('DIV'),
            title : document.createElement('DIV'),
            text : document.createElement('DIV'),
            body : document.createElement('DIV'),
            footer : document.createElement('DIV'),
            submit : document.createElement('BUTTON'),
            abort : document.createElement('BUTTON'),
            close: document.createElement('button')
        };
        /* buttons */
        res.close.className = "dialog-close";
        res.close.setAttribute("title", "close");
        res.submit.className = "hidden";
        res.submit.setAttribute("type", "submit");
        res.abort.className = "hidden";
        res.abort.setAttribute("type", "reset");
        /* title */
        res.title.id = id + "_title";
        res.title.className = "dialog-title hidden";
        /* text */
        res.text.id = id + "_text";
        res.text.className = "dialog-text hidden";
        /* body */
        res.body.className = "dialog-body";
        res.body.appendChild(res.text);
        /* footer */
        res.footer.className = "dialog-footer";
        res.footer.appendChild(res.submit);
        res.footer.appendChild(res.abort);
        /* focus-catcher */
        res.focusCT.setAttribute("tabindex", "0");
        res.focusCB.setAttribute("tabindex", "0");
        /* window */
        res.window.className = "dialog-window";
        res.window.id = id;
        res.window.setAttribute("role", "dialog");
        res.window.setAttribute("aria-modal", "true");
        res.window.appendChild(res.title);
        res.window.appendChild(res.body);
        res.window.appendChild(res.footer);
        res.window.appendChild(res.close);
        /* container */
        res.container.className = "dialog";
        res.container.appendChild(res.focusCT);
        res.container.appendChild(res.window);
        res.container.appendChild(res.focusCB);
        ///////////////////////////////////////
        return res;
    }

    window.Dialog = function Dialog(callback, focus) {

        var w = createWindow();
        var tab_itms = [];

        function closeWindow(v) {
            if (typeof callback == "function") callback(!!v);
            document.body.removeChild(w.container);
            if (!!focus) focus.focus();
        }
    
        w.focusCT.onfocus = function() {
            if (!!tab_itms.length) tab_itms[tab_itms.length-1].focus();
        };
        w.focusCB.onfocus = function() {
            if (!!tab_itms.length) tab_itms[0].focus();
        };
        w.container.onkeydown = function(ev) {
            var key = ev.which || ev.keyCode;
            if (key == 27) {
                closeWindow();
            }
            ev.stopPropagation();
        };
        w.submit.onclick = function(){closeWindow(true)};
        w.abort.onclick = function(){closeWindow()};
        w.close.onclick = function(){closeWindow()};
    
        this.setTitle = function(t) {
            if (typeof t == "undefined") {
                w.title.classList.add("hidden");
                target.removeAttribute("aria-labelledby");
            } else {
                w.title.classList.remove("hidden");
                w.title.innerHTML = t;
                w.window.setAttribute("aria-labelledby", w.title.id);
            }
            return this;
        }
    
        this.setText = function(t) {
            if (typeof t == "undefined") {
                w.text.classList.add("hidden");
                target.removeAttribute("aria-describedby");
            } else {
                w.text.classList.remove("hidden");
                w.text.innerHTML = t;
                w.window.setAttribute("aria-describedby", w.text.id);
            }
            return this;
        }

        this.setSubmitText = function(t) {
            w.submit.classList.remove("hidden");
            w.submit.innerHTML = t.toUpperCase();
            w.submit.setAttribute("title", t);
            tab_itms = Array.from(w.window.querySelectorAll(Q_TAB));
            return this;
        }

        this.setAbortText = function(t) {
            w.abort.classList.remove("hidden");
            w.abort.innerHTML = t.toUpperCase();
            w.abort.setAttribute("title", t);
            tab_itms = Array.from(w.window.querySelectorAll(Q_TAB));
            return this;
        }

        this.setCloseText = function(t) {
            w.close.setAttribute("title", t);
            tab_btns.push(w.close);
            return this;
        }

        this.addElement = function(el) {
            w.body.appendChild(el);
            tab_itms = Array.from(w.window.querySelectorAll(Q_TAB));
            return this;
        }

        tab_itms = Array.from(w.window.querySelectorAll(Q_TAB));
        document.body.appendChild(w.container);

    };

    Dialog.alert = function(ttl, msg, ret) {
        return new Promise(function(resolve) {
            (new Dialog(resolve, ret))
                .setTitle(ttl)
                .setText(msg)
                .setSubmitText("OK");
        });
    };

    Dialog.confirm = function(ttl, msg, ret) {
        return new Promise(function(resolve) {
            (new Dialog(resolve, ret))
                .setTitle(ttl)
                .setText(msg)
                .setSubmitText("YES")
                .setAbortText("NO");
        });
    };

    Dialog.prompt = function(ttl, msg, ret) {
        return new Promise(function(resolve) {
            var el = document.createElement("input");
            el.className = "dialog-input";
            (new Dialog(function(v) {
                resolve(!!v && el.value);
            }, ret))
                .setTitle(ttl)
                .setText(msg)
                .setSubmitText("SUBMIT")
                .setAbortText("CANCEL")
                .addElement(el);
        });
    };

}();
