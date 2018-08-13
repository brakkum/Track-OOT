var poi = {
    chests: [],
    dungeons: [],
    dungeon_chests: []
};

function populateMap() {
    var map_element = document.getElementById('map');
    populateChests(map_element);
    populateDungeons(map_element);
    updateMap();
}

function populateChests(map_element) {
    for(k=0; k<data.chests.length; k++){
        var id = data.chests[k].name;
        var s = document.createElement('span');
        s.style.color = 'black';
        s.id = id;
        s.onclick = new Function('toggleChest('+id+')');
        s.style.left = data.chests[k].x;
        s.style.top = data.chests[k].y;

        var ss = document.createElement('span');
        ss.className = "tooltip";
        ss.innerHTML = translate(id);
        s.appendChild(ss);

        poi.chests.push(s);

        map_element.appendChild(s);
    }
}

function toggleChest(x) {
    var val = !savestate.read("chests", x.id, 0);
    savestate.write("chests", x.id, val);
    if(val) {
        x.className = "poi chest opened";
    } else {
        x.className = "poi chest " + checkChestAvailable(x.id)
    }
}

function populateDungeons(map_element) {
    for(k=0; k<data.dungeons.length; k++){
        var id = data.dungeons[k].name;
        s = document.createElement('span');
        s.id = id;

        s.onclick = new Function('clickDungeon('+id+')');
        s.style.left = data.dungeons[k].x;
        s.style.top = data.dungeons[k].y;

        var DCcount = 0;
        for (var i = 0; i <  data.dungeon_chests[id].length; ++i) {
            var key = data.dungeon_chests[id][i];
            if (!savestate.read("chests", key, 0) && checkLogic(data.chest_logic[key]))
                DCcount++;
        }

        var ss = document.createElement('span');
        ss.className = "count";
        s.appendChild(ss);

        var ss = document.createElement('span');
        ss.className = "tooltip";
        ss.innerHTML = translate(id);
        s.appendChild(ss);

        poi.dungeons.push(s);

        map_element.appendChild(s);
    }
}

function clickDungeon(d) {
    var dn = document.getElementById('dungeon-name');
    dn.innerHTML = translate(d.id);
    dn.setAttribute("data-ref", d.id);
    dn.className = "DC" + checkBeatList(d.id);
    var DClist = document.getElementById('dungeon-list');
    DClist.innerHTML = ""

    poi.dungeon_chests = [];
    for (var i in data.dungeon_chests[d.id]) {
        var key = data.dungeon_chests[d.id][i];
        var s = document.createElement('li');
        s.id = key;
        s.innerHTML = translate(key);

        if (savestate.read("chests", key, 0))
            s.className = "dungeon-chest DCopened";               
        else if (checkLogic(data.chest_logic[key]))
            s.className = "dungeon-chest DCavailable";               
        else
            s.className = "dungeon-chest DCunavailable";              

        s.onclick = new Function('toggleDungeonChest(this,"'+key+'")');
        s.style.cursor = "pointer";

        poi.dungeon_chests.push(s);

        DClist.appendChild(s)
    }
}

function toggleDungeonChest(x, key){
    var val = !savestate.read("chests", x.id, 0);
    savestate.write("chests", x.id, val);
    if(val)
        x.className = "dungeon-chest DCopened";               
    else if (checkLogic(data.chest_logic[key]))
        x.className = "dungeon-chest DCavailable";               
    else
        x.className = "dungeon-chest DCunavailable"; 

    updateMap();
}

function checkChestAvailable(name) {
    return checkLogic(data.chest_logic[name]) ? "available" : "unavailable";
}

function checkChestlist(name) {
    var chestlist = data.dungeon_chests[name];
    var canGet = 0;
    var unopened = 0
    for (var i = 0; i < chestlist.length; ++i) {
        var key = chestlist[i];
        if (!savestate.read("chests", key, 0)) {
            unopened++;
            if (checkLogic(data.chest_logic[key])) {
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


function checkBeatList(name) {
    if (data.dungeon_logic[name].length == 0)
        return checkChestlist(name);

    var chestlist = data.dungeon_chests[name];
    var unopened = false;
    for (var i = 0; i < chestlist.length; ++i) {
        var key = chestlist[i];
        if (!savestate.read("chests", key, 0)) {
            unopened = true;
            break;
        }
    }

    if (unopened) return checkLogic(data.dungeon_logic[name]) ? "available" : "unavailable";
    return "opened";
}

function checkLogic(logic) {
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

function updateMap() {
    var chests_available = 0;
    var chests_missing = 0;
    var skulltulas_available = 0;
    var skulltulas_missing = 0;

    for (let ch in data.chest_logic) {
        if (!savestate.read("chests", ch, 0)) chests_missing++;
    }
    for (let sk in data.skulltula_logic) {
        if (!savestate.read("skulltulas", sk, 0)) skulltulas_missing++;
    }

    for (var i = 0; i < poi.chests.length; ++i) {
        var x = poi.chests[i];
        if(savestate.read("chests", x.id, 0)) {
            x.className = "poi chest opened";
        } else {
            var avail = checkChestAvailable(x.id);
            if (avail == "available") chests_available++;
            x.className = "poi chest " + avail;
        }
    }
    for (var i = 0; i < poi.dungeons.length; ++i) {
        var x = poi.dungeons[i];
        x.className = "poi dungeon " + checkChestlist(x.id);

        var DCcount = 0;
        for (var j = 0; j <  data.dungeon_chests[x.id].length; ++j) {
            var key = data.dungeon_chests[x.id][j];
            if (!savestate.read("chests", key, 0) && checkLogic(data.chest_logic[key]))
                DCcount++;
        }
        chests_available+=DCcount;

        var ss = x.children[0];
        if (DCcount == 0)
            ss.innerHTML = "";
        else
            ss.innerHTML = DCcount;

    }
    for (var i = 0; i < poi.dungeon_chests.length; ++i) {
        var x = poi.dungeon_chests[i];
        if (savestate.read("chests", x.id, 0))
            x.className = "dungeon-chest DCopened";               
        else {
            if (checkLogic(data.chest_logic[x.id])) {
                x.className = "dungeon-chest DCavailable";
            } else {
                x.className = "dungeon-chest DCunavailable"; 
            }
        }
    }

    var dn = document.getElementById('dungeon-name');
    if (!!dn.getAttribute("data-ref")) dn.className = "DC" + checkBeatList(dn.getAttribute("data-ref"));

    setStatus("chests-available", chests_available);
    setStatus("chests-missing", chests_missing);
    setStatus("skulltulas-available", skulltulas_available);
    setStatus("skulltulas-missing", skulltulas_missing);
}