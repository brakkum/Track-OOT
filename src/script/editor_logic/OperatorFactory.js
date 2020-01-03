
function getLocations() {
    let res = [];
    let locations = GlobalData.get("locations");
    for (let i in locations) {
        for (let j in locations[i]) {
            for (let k in locations[i][j]) {
                res.push(`${i}.${j}.${k}`);
            }
        }
    }
}

function getMixins() {
    let res = [];

    let logic = GlobalData.get("logic");
    let custom_logic = GlobalData.get("logic_patched");

    if (!!logic.mixins) {
        for (let i in logic.mixins) {
            mixins[i] = logic.mixins[i];
        }
    }
    if (!!custom_logic.mixins) {
        for (let i in custom_logic.mixins) {
            mixins[i] = custom_logic.mixins[i];
        }
    }
}


function createDefaultOperatorCategory(onclick) {
    let ocnt = document.createElement("deep-collapsepanel");
    ocnt.caption = "default";
    for (let i in LOGIC_OPERATORS) {
        let el = document.createElement(LOGIC_OPERATORS[i]);
        el.template = "true";
        if (typeof onclick == "function") {
            el.onclick = onclick;
            el.readonly = "true";
        }
        ocnt.append(el);
    }
    return ocnt;
}

function createOperatorCategory(data, type, ref, onclick) {
    let ocnt = document.createElement("deep-collapsepanel");
    ocnt.caption = ref;
    for (let i in data) {
        if (typeof data[i].logic_editor_visible != "boolean" || data[i].logic_editor_visible) {
            let el = document.createElement(type);
            el.ref = i;
            el.template = "true";
            if (typeof onclick == "function") {
                el.onclick = onclick;
                el.readonly = "true";
            }
            ocnt.append(el);
        }
    }
    return ocnt;
}