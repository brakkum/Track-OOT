window.Dialog = new (function() {

    var cnt = 0;
    function getNewID() {
        return "dialog_element_ID_" + (++cnt);
    }

    function createTitle(target, txt) {
        var el = document.createElement('DIV');
        el.id = getNewID();
        el.className = "dialog-title";
        el.innerHTML = txt || "";
        target.appendChild(el);
        target.setAttribute("aria-labelledby", el.id);
        return el;
    }

    function createText(target, txt) {
        var el = document.createElement('DIV');
        el.id = getNewID();
        el.className = "dialog-text";
        el.innerHTML = txt || "";
        target.appendChild(el);
        target.setAttribute("aria-describedby", el.id);
        return el;
    }

    function createButton(target, txt, onclick) {
        var el = document.createElement('BUTTON');
        el.innerHTML = txt || "";
        el.onclick = onclick;
        target.appendChild(el);
        return el;
    }

    function createTextInput(target, placeholder) {
        var el = document.createElement('INPUT');
        el.className = "dialog-input";
        el.setAttribute("placeholder", placeholder || "");
        target.appendChild(el);
        return el;
    }

    this.createDialog = function(options) {
        return new Promise(function(resolve) {
            if (!options.title && !options.message) {
                resolve(false);
                if (!!options.return) options.return.focus();
                return;
            }

            function closeDialog(value) {
                document.body.removeChild(container);
                if (!!options.return) options.return.focus();
                resolve(value);
            }

            var focuables = [];
            var container = document.createElement('DIV');
            // focuscatcher
            var focusCatcherTop = document.createElement('DIV');
            focusCatcherTop.setAttribute("tabindex", "0");
            container.appendChild(focusCatcherTop);
            // dialog
            var dialog = document.createElement('DIV');
            let button_no, button_yes;
            container.className = "dialog";
            dialog.className = "dialog-window";
            dialog.setAttribute("role", "dialog");
            dialog.setAttribute("aria-modal", "true");
            if (!!options.title) {
                createTitle(dialog, options.title);
            }
            if (!!options.message) {
                createText(dialog, options.message);
            }
            var input;
            if (!!options.prompt) {
                var wrap = document.createElement('DIV');
                wrap.className = "dialog-input-box";
                input = createTextInput(wrap, "enter text");
                focuables.push(input);
                dialog.appendChild(wrap);
            }
            var buttons = document.createElement('DIV');
            buttons.className = "dialog-buttons";
            switch(options.buttons) {
                case "YES_NO":
                    focuables.push(createButton(buttons, options.no_text || "NO", function() {
                        closeDialog(false);
                    }));
                    focuables.push(createButton(buttons, options.yes_text || "YES", function() {
                        closeDialog(!!input ? input.value : true);
                    }));
                break;
                case "YES":
                default:
                    focuables.push(createButton(buttons, options.yes_text || "ACCEPT", function() {
                        closeDialog(!!input ? input.value : true);
                    }));
                break;
            }
            dialog.appendChild(buttons);
            container.appendChild(dialog);
            document.body.appendChild(container);
            focuables[0].focus();
            // focuscatcher
            var focusCatcherBottom = document.createElement('DIV');
            focusCatcherBottom.setAttribute("tabindex", "0");
            container.appendChild(focusCatcherBottom);

            focusCatcherTop.onfocus = function() {
                focuables[focuables.length-1].focus();
            }
            focusCatcherBottom.onfocus = function() {
                focuables[0].focus();
            }
            dialog.onkeydown = function(ev) {
                var key = ev.which || ev.keyCode;
                if (key == 27) {
                    closeDialog(false);
                }
            }
        });
    }

    this.alert = function(ttl, msg, ret) {
        return this.createDialog({
            title: ttl,
            message: msg,
            return: ret
        });
    };

    this.confirm = function(ttl, msg, ret) {
        return this.createDialog({
            title: ttl,
            message: msg,
            buttons: "YES_NO",
            return: ret
        });
    };

    this.prompt = function(ttl, msg, ret) {
        return this.createDialog({
            title: ttl,
            message: msg,
            prompt: true,
            yes_text: "SUBMIT",
            no_text: "ABORT",
            buttons: "YES_NO",
            return: ret
        });
    };
})();