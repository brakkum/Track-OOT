function checkLogic(category, name) {
    if (!data.logic.hasOwnProperty(category) || !data.logic[category].hasOwnProperty(name)) return false;
    var logic = data.logic[category][name];
    if (logic.length == 0) {
        return true;
    } else {
        next_test:
        for (var i = 0; i < logic.length; ++i) {
            var test = logic[i];
            for (var j = 0; j < test.length; ++j) {
                var [ch, tstel] = test[j].split(":");
                ch = ch.split(".");
                var val = savestate.read(ch[0], ch[1], 0);
                if (!!tstel) {
                    if (val < tstel) continue next_test;
                } else {
                    if (val == 0) continue next_test;
                }
            }
            return true;
        }
    }
    return false;
}

function checkAvailable(category, name) {
    return checkLogic(category, name) ? "available" : "unavailable";
}

function checkBeatList(name) {
    if (data.logic.dungeons[name].length == 0)
        return checkList("chests", name);

    var list = data.dungeons[name].chests;
    var unopened = false;
    for (var i = 0; i < list.length; ++i) {
        var key = list[i];
        if (!savestate.read("chests", key, 0)) {
            unopened = true;
            break;
        }
    }

    if (unopened) return checkLogic("dungeons", name) ? "available" : "unavailable";
    return "opened";
}

function checkList(category, name) {
    var list = data.dungeons[name][category];
    var canGet = 0;
    var unopened = 0
    for (var i = 0; i < list.length; ++i) {
        var key = list[i];
        if (!savestate.read(category, key, 0)) {
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