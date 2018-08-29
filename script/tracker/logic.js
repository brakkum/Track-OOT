
function checkLogicObject(logic) {
    if (!logic || logic == null) return true;
    switch(logic.type) {
        case "and":
            if (!logic.el.length) return true;
            for (let i = 0; i < logic.el.length; ++i) {
                var el = logic.el[i];
                if (!!el && el != null) {
                    if (!checkLogicObject(el)) return false;
                }
            }
            return true;
        case "or":
            if (!logic.el.length) return true;
            for (let i = 0; i < logic.el.length; ++i) {
                var el = logic.el[i];
                if (!!el && el != null) {
                    if (checkLogicObject(el)) return true;
                }
            }
            return false;
        case "not":
            return !checkLogicObject(logic.el);
        case "value":
            return checkLogicObject(logic.el) >= logic.value;
        case "mixin":
            return checkLogic("mixins", logic.el);
        case "settings":
            return true; // TODO: add settings to imitade randomizer settings
            //return checkLogic("mixins", logic.el);
        case "item":
            return SaveState.read("items", logic.el, 0);
    }
    return true;
}

function checkLogicArray(logic) {
    if (logic.length == 0) {
        return true;
    } else {
        next_test:
        for (var i = 0; i < logic.length; ++i) {
            var test = logic[i];
            for (var j = 0; j < test.length; ++j) {
                var member = test[j];
                var check = true;
                if (member.startsWith("!")) {
                    check = false;
                    member = member.slice(1);
                }
                var [ch, tstel] = member.split(":");
                ch = ch.split(".");
                var val = SaveState.read(ch[0], ch[1], 0);
                if (!!tstel) {
                    if (val < tstel == check) continue next_test;
                } else {
                    if (!val == check) continue next_test;
                }
            }
            return true;
        }
    }
    return false;
}

function checkLogic(category, name) {
    if (!data.logic.hasOwnProperty(category) || !data.logic[category].hasOwnProperty(name)) return false;
    var logic;
    
    if (settings.use_custom_logic && data.logic_patched.hasOwnProperty(category) && data.logic_patched[category].hasOwnProperty(name)) {
        logic = data.logic_patched[category][name];
        return checkLogicObject(logic);
    } else {
        logic = data.logic[category][name];
    }

    if (!Array.isArray(logic)) return checkLogicObject(logic);
    return checkLogicArray(logic);
}

function checkAvailable(category, name) {
    return checkLogic(category, name) ? "available" : "unavailable";
}

function checkOpened(category, name) {
    var list = data.dungeons[name][category];
    for (var i = 0; i < list.length; ++i) {
        var key = list[i];
        if (!SaveState.read(category, key, 0)) {
            return false;
        }
    }
    return true;
}

function checkBeatList(name) {
    var logic = data.logic.dungeons[name];
    if ((Array.isArray(logic) && logic.length == 0) || logic == null) {
        return checkList("chests", name);
    }

    if (!checkOpened("chests", name)) return checkLogic("dungeons", name) ? "available" : "unavailable";
    return "opened";
}

function checkList(category, name) {
    var list = data.dungeons[name][category];
    var canGet = 0;
    var unopened = 0
    for (var i = 0; i < list.length; ++i) {
        var key = list[i];
        if (!SaveState.read(category, key, 0)) {
            unopened++;
            if (checkLogic(category, key)) {
                canGet++;
            }
        }
    }
    if (unopened == 0)
        return "opened"
    if (canGet == unopened)
        return "available";
    if (canGet == 0)
        return "unavailable"
    return "possible"
}