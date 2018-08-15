window.Dialogue = new (function() {
    var dlg         = document.getElementById("dialogue");
    var dlg_ttl     = document.getElementById("dialogue_title");
    var dlg_txt     = document.getElementById("dialogue_text");
    var dlg_ok      = document.getElementById("dialogue_submit");
    var dlg_abort   = document.getElementById("dialogue_abort");
    var dlg_input   = document.getElementById("dialogue_input");

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