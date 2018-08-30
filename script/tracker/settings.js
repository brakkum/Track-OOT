
function buildSettings() {
    var settingsEdit = document.getElementById("edit-settings");
    var settingsCancel = document.getElementById("settings-cancel");
    var settingsSave = document.getElementById("settings-save");
    
    var settings_container = document.getElementById('settings');
    var settings_randomizer = document.getElementById("settings-randomizer");
    var settings_skips = document.getElementById("settings-skips");
    
    var settings_show_map = settings_container.querySelector('#show_map');
    var settings_use_custom_logic = settings_container.querySelector('#use_custom_logic');
    
    settingsEdit.addEventListener("click", function() {
        settings_container.classList.add('active');
    });
    
    settingsCancel.addEventListener("click", function() {
        settings_show_map.checked = settings.show_map;
        settings_use_custom_logic.checked = settings.use_custom_logic;
        settings_container.classList.remove('active');
    });
    
    settingsSave.addEventListener("click", function() {
        settings.use_custom_logic = settings_use_custom_logic.checked;
        Storage.set("settings", "use_custom_logic", settings.use_custom_logic);
        settings.show_map = settings_show_map.checked;
        Storage.set("settings", "show_map", settings.show_map);
        if (settings.show_map) {
            document.getElementById('map').style.display = "";
            document.getElementById('dungeon-container').style.display = "";
            updateMap();
        } else {
            document.getElementById('map').style.display = "none";
            document.getElementById('dungeon-container').style.display = "none";
        }
        data.logic_patched = Storage.get("settings", "logic", {});
        document.getElementById('settings').classList.remove('active');
    });
    
    var buttons = Array.from(settings_container.querySelectorAll(".card-button"));
    buttons.forEach(function(el) {
        el.addEventListener("click", function(e) {
            if (e.target.classList.contains("disabled")) return;
            Array.from(settings_container.querySelectorAll(".card-body, .card-button")).forEach(function(el) {
                el.classList.remove("active");
            });
            var el = settings_container.querySelector("#"+e.target.getAttribute("data-target"));
            el.classList.add("active");
            e.target.classList.add("active");
        });
    });
    
    for (let i in data.rom_options.settings) {
        var el = document.createElement("label");
        el.className = "settings-option";
        var text = document.createElement("span");
        text.innerHTML = translate(i);
        text.className = "option-text";
        el.appendChild(text);
        switch (data.rom_options.settings[i].type) {
            case "check":
                var input = document.createElement("input");
                input.id = i;
                input.setAttribute("type", "checkbox");
                // TODO read setting
                el.appendChild(input);
            break;
            case "choice":
                var select = document.createElement("select");
                select.id = i;
                for (let j in data.rom_options.settings[i].values) {
                    var option = document.createElement("option");
                    option.innerHTML = data.rom_options.settings[i].values[j];
                    select.appendChild(option);
                }
                // TODO read setting
                el.appendChild(select);
            break;
        }
        settings_randomizer.appendChild(el);
    }
    
    for (let i in data.rom_options.skips) {
        var el = document.createElement("label");
        el.className = "settings-option";
        var text = document.createElement("span");
        text.innerHTML = translate(i);
        text.className = "option-text";
        el.appendChild(text);
        switch (data.rom_options.skips[i].type) {
            case "check":
                var input = document.createElement("input");
                input.id = i;
                input.setAttribute("type", "checkbox");
                // TODO read setting
                el.appendChild(input);
            break;
            case "choice":
                var select = document.createElement("select");
                select.id = i;
                for (let j in data.rom_options.skips[i].values) {
                    var option = document.createElement("option");
                    option.innerHTML = data.rom_options.skips[i].values[j];
                    select.appendChild(option);
                }
                // TODO read setting
                el.appendChild(select);
            break;
        }
        settings_skips.appendChild(el);
    }

    settings.show_map = Storage.get("settings", "show_map", true);
    settings.use_custom_logic = Storage.get("settings", "use_custom_logic", false);
    settings_show_map.checked = settings.show_map;
    settings_use_custom_logic.checked = settings.use_custom_logic;
    if (!settings.show_map) {
        document.getElementById('map').style.display = "none";
        document.getElementById('dungeon-container').style.display = "none";
    }
}
