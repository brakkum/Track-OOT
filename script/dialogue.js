window.Dialogue = new (function() {
    var dlg         = document.getElementById("dialogue");
    var dlg_ttl     = document.getElementById("dialogue_title");
    var dlg_txt     = document.getElementById("dialogue_text");
    var dlg_ok      = document.getElementById("dialogue_submit");
    var dlg_abort   = document.getElementById("dialogue_abort");
    var dlg_input   = document.getElementById("dialogue_input");

    function createDialogue(options) {
        return new Promise(function(resolve) {
            var container = document.createElement('DIV');
            var dialogue = document.createElement('DIV');
            dialogue.className = "dialogue-window";
            if (!!options.title) {
                let title = document.createElement('DIV');
                title.innerHTML = options.title;
                dialogue.appendChild(title);
            }
            if (!!options.message) {
                let message = document.createElement('DIV');
                message.innerHTML = options.message;
                dialogue.appendChild(message);
            }
            switch(options.buttons) {
                case "YES_NO":
                let button_no = document.createElement('BUTTON');
                let button_yes = document.createElement('BUTTON');
                button_yes.innerHTML = "No";
                button_yes.innerHTML = "Yes";
                button_no.onclick = function() {
                    document.body.removeChild(dialogue);
                    resolve(false);
                };
                button_yes.onclick = function() {
                    document.body.removeChild(dialogue);
                    resolve(true);
                };
                dialogue.appendChild(button_no);
                dialogue.appendChild(button_yes);
                break;
                case "OK":
                default:
                let button_ok = document.createElement('BUTTON');
                button_ok.innerHTML = "Accept";
                button_ok.onclick = function() {
                    document.body.removeChild(dialogue);
                    resolve(true);
                };
                dialogue.appendChild(button_ok);
                break;
            }
            container.appendChild(dialogue);
            document.body.appendChild(container);
        });
    }

    this.alert = function(ttl, msg) {
        return new Promise(function(resolve) {
            dlg.className = "alert";
            if (!msg) {
                dlg_txt.className = "empty";
            } else {
                dlg_txt.className = "";
                dlg_txt.innerHTML = msg;
            }
            dlg_ttl.innerHTML = ttl;
            dlg_ok.onclick = function() {
                resolve(true);
                dlg.className = "";
            };
        });
    };

    this.confirm = function(ttl, msg) {
        return new Promise(function(resolve) {
            dlg.className = "confirm";
            if (!msg) {
                dlg_txt.className = "empty";
            } else {
                dlg_txt.className = "";
                dlg_txt.innerHTML = msg;
            }
            dlg_ttl.innerHTML = ttl;
            dlg_ok.onclick = function() {
                resolve(true);
                dlg.className = "";
            };
            dlg_abort.onclick = function() {
                resolve(false);
                dlg.className = "";
            };
        });
    };

    this.prompt = function(ttl, msg) {
        return new Promise(function(resolve, reject) {
            dlg.className = "prompt";
            if (!msg) {
                dlg_txt.className = "empty";
            } else {
                dlg_txt.className = "";
                dlg_txt.innerHTML = msg;
            }
            dlg_ttl.innerHTML = ttl;
            dlg_ok.onclick = function() {
                resolve(dlg_input.value);
                dlg.className = "";
                dlg_input.value = "";
            };
            dlg_abort.onclick = function() {
                resolve(null);
                dlg.className = "";
                dlg_input.value = "";
            };
        });
    };
})();