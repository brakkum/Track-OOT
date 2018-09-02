window.Dialog = new (function() {

    this.createDialog = function(options) {
        return new Promise(function(resolve) {
            var focuables;
            if (!options.title && !options.message) {
                resolve(false);
                return;
            }
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
                let title = document.createElement('DIV');
                title.className = "dialog-title";
                title.innerHTML = options.title;
                dialog.appendChild(title);
                dialog.appendChild(document.createElement('HR'));
            }
            if (!!options.message) {
                let message = document.createElement('DIV');
                message.className = "dialog-text";
                message.innerHTML = options.message;
                dialog.appendChild(message);
            }
            let input;
            if (!!options.prompt) {
                var input_box = document.createElement('DIV');
                input_box.className = "dialog-input-box";
                input = document.createElement('INPUT');
                input.className = "dialog-input";
                input.setAttribute("placeholder", "enter text");
                input_box.appendChild(input);
                dialog.appendChild(input_box);
            }
            var buttons = document.createElement('DIV');
            buttons.className = "dialog-buttons";
            switch(options.buttons) {
                case "YES_NO":
                    button_no = document.createElement('BUTTON');
                    button_yes = document.createElement('BUTTON');
                    button_no.innerHTML = options.no_text || "No";
                    button_yes.innerHTML = options.yes_text || "Yes";
                    button_no.onclick = function() {
                        document.body.removeChild(container);
                        resolve(false);
                    };
                    button_yes.onclick = function() {
                        document.body.removeChild(container);
                        resolve(!!input ? input.value : true);
                    };
                    buttons.appendChild(button_no);
                    buttons.appendChild(button_yes);
                break;
                case "YES":
                default:
                    button_yes = document.createElement('BUTTON');
                    button_yes.innerHTML = options.yes_text || "Accept";
                    button_yes.onclick = function() {
                        document.body.removeChild(container);
                        resolve(!!input ? input.value : true);
                    };
                    buttons.appendChild(button_yes);
                break;
            }
            dialog.appendChild(document.createElement('HR'));
            dialog.appendChild(buttons);
            container.appendChild(dialog);
            document.body.appendChild(container);
            focuables = dialog.querySelectorAll("input, select, button");
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
                    document.body.removeChild(container);
                    resolve(false);
                }
            }
        });
    }

    this.alert = function(ttl, msg) {
        return this.createDialog({
            title: ttl,
            message: msg
        });
    };

    this.confirm = function(ttl, msg) {
        return this.createDialog({
            title: ttl,
            message: msg,
            buttons: "YES_NO"
        });
    };

    this.prompt = function(ttl, msg) {
        return this.createDialog({
            title: ttl,
            message: msg,
            prompt: true,
            yes_text: "Submit",
            no_text: "Abort",
            buttons: "YES_NO"
        });
    };
})();