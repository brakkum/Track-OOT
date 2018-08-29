window.Dialogue = new (function() {

    this.createDialogue = function(options) {
        return new Promise(function(resolve) {
            if (!options.title && !options.message) {
                resolve(false);
                return;
            }
            var container = document.createElement('DIV');
            var dialogue = document.createElement('DIV');
            let button_no, button_yes;
            container.className = "dialogue";
            dialogue.className = "dialogue-window";
            if (!!options.title) {
                let title = document.createElement('DIV');
                title.className = "dialogue-title";
                title.innerHTML = options.title;
                dialogue.appendChild(title);
                dialogue.appendChild(document.createElement('HR'));
            }
            if (!!options.message) {
                let message = document.createElement('DIV');
                message.className = "dialogue-text";
                message.innerHTML = options.message;
                dialogue.appendChild(message);
            }
            let input;
            if (!!options.prompt) {
                var input_box = document.createElement('DIV');
                input_box.className = "dialogue-input-box";
                input = document.createElement('input');
                input.className = "dialogue-input";
                input_box.appendChild(input);
                dialogue.appendChild(input_box);
            }
            var buttons = document.createElement('DIV');
            buttons.className = "dialogue-buttons";
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
            dialogue.appendChild(document.createElement('HR'));
            dialogue.appendChild(buttons);
            container.appendChild(dialogue);
            document.body.appendChild(container);
        });
    }

    this.alert = function(ttl, msg) {
        return this.createDialogue({
            title: ttl,
            message: msg
        });
    };

    this.confirm = function(ttl, msg) {
        return this.createDialogue({
            title: ttl,
            message: msg,
            buttons: "YES_NO"
        });
    };

    this.prompt = function(ttl, msg) {
        return this.createDialogue({
            title: ttl,
            message: msg,
            prompt: true,
            yes_text: "Submit",
            no_text: "Abort",
            buttons: "YES_NO"
        });
    };
})();