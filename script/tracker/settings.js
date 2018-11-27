function generateSettingsPage(category, target) {
    for (let i in data.rom_options[category]) {
        var el = document.createElement("label");
        var val = data.rom_options[category][i];
        el.className = "settings-option";
        var text = document.createElement("span");
        text.innerHTML = translate(i);
        text.className = "option-text";
        el.appendChild(text);
        var input;
        switch (val.type) {
            case "check":
                input = document.createElement("input");
                input.className = "settings-input";
                input.setAttribute("type", "checkbox");
                input.checked = SaveState.read(category, i, val.default);
            break;
            case "choice":
                input = document.createElement("select");
                input.className = "settings-input";
                for (let j in val.values) {
                    var option = document.createElement("option");
                    option.innerHTML = translate(val.values[j]);
                    option.setAttribute("value", val.values[j]);
                    input.appendChild(option);
                }
                input.value = SaveState.read(category, i, val.default);
            break;
        }
        input.setAttribute("data-ref", i);
        el.appendChild(input);
        target.appendChild(el);
    }
}

function resetSettingsPage(category, target) {
    var buf = Array.from(target.querySelectorAll(".settings-option"));
    for (let i in buf) {
        var el = buf[i].querySelector(".settings-input");
        var id = el.getAttribute("data-ref");
        var val = data.rom_options[category][id];
        switch (el.nodeName) {
            case "INPUT":
                el.checked = SaveState.read(category, id, val.default);
            break;
            case "SELECT":
                el.value = SaveState.read(category, id, val.default);
            break;
        }
    }
}

function readSettingsPage(category, target) {
    var buf = Array.from(target.querySelectorAll(".settings-option"));
    for (let i in buf) {
        var el = buf[i].querySelector(".settings-input");
        var id = el.getAttribute("data-ref");
        switch (el.nodeName) {
            case "INPUT":
                SaveState.write(category, id, el.checked);
            break;
            case "SELECT":
                SaveState.write(category, id, el.value);
            break;
        }
    }
}

function buildSettings() {
    var settingsEdit = document.getElementById("edit-settings");
    var settingsCancel = document.getElementById("settings-cancel");
    var settingsSave = document.getElementById("settings-save");
    
    var settings_container = document.getElementById('settings');
    var settings_options = document.getElementById("settings-options");
    var settings_skips = document.getElementById("settings-skips");
    
    var settings_font = settings_container.querySelector('#font');
    var settings_layout = settings_container.querySelector('#layout');
    var settings_itemsize = settings_container.querySelector('#item-scale-slider');
    var settings_show_hint_badges = settings_container.querySelector('#show_hint_badges');
    var settings_use_custom_logic = settings_container.querySelector('#use_custom_logic');

    settings_itemsize.addEventListener("input", function(ev) {
        settings_container.querySelector('#item-scale-slider+.input-value').innerHTML = ev.currentTarget.value + "px";
    });
    
    settingsEdit.addEventListener("click", function() {
        settings_container.classList.add('active');
    });
    
    settingsCancel.addEventListener("click", function() {
        settings_font.value = Storage.get("settings", "font", "");
        settings_layout.value = Storage.get("settings", "layout", "map-compact");
        settings_itemsize.value = Storage.get("settings", "itemsize", 40);
        settings_show_hint_badges.checked = Storage.get("settings", "show_hint_badges", false);
        settings_use_custom_logic.checked = Storage.get("settings", "use_custom_logic", false);
        resetSettingsPage("options", settings_options);
        resetSettingsPage("skips", settings_skips);
        settings_container.classList.remove('active');
    });
    
    settingsSave.addEventListener("click", function() {
        Storage.set("settings", "use_custom_logic", settings_use_custom_logic.checked);
        Storage.set("settings", "show_hint_badges", settings_show_hint_badges.checked);
        Storage.set("settings", "font", settings_font.value);
        Storage.set("settings", "layout", settings_layout.value);
        Storage.set("settings", "itemsize", settings_itemsize.value);
        readSettingsPage("options", settings_options);
        readSettingsPage("skips", settings_skips);
        applySettingsChoices();
        reloadDungeonList();
        updateMap();
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
    
    generateSettingsPage("options", settings_options);
    generateSettingsPage("skips", settings_skips);

    settings_font.value = Storage.get("settings", "font", "");
    settings_layout.value = Storage.get("settings", "layout", "map-compact");
    settings_itemsize.value = Storage.get("settings", "itemsize", 40);
    settings_show_hint_badges.checked = Storage.get("settings", "show_hint_badges", false);
    settings_use_custom_logic.checked = Storage.get("settings", "use_custom_logic", false);

    applySettingsChoices();
}

function applySettingsChoices() {
    var viewpane = document.getElementById("viewpane");
    viewpane.setAttribute("data-font", Storage.get("settings", "font", ""));
    var layout_container = document.querySelector(".layout-container[data-layout]");
    layout_container.setAttribute("data-layout", Storage.get("settings", "layout", "map-compact"));
    layout_container.style.setProperty("--item-size", Storage.get("settings", "itemsize", 40));
    if (Storage.get("settings", "show_hint_badges", false)) {
        document.body.setAttribute("data-hint-badges", "true");
    } else {
        document.body.setAttribute("data-hint-badges", "false");
    }
    if (SaveState.read("options", "scrubsanity", false)) {
        document.body.setAttribute("data-scrubsanity", "true");
    } else {
        document.body.setAttribute("data-scrubsanity", "false");
    }
}
