var poi = {
    chests: [],
    dungeons: [],
    skulltulas: []
};

var poi_list = {
    mode: "",
    ref: "",
    entries: []
}

function populateMap() {
    var map_element = document.getElementById('map');
    
    // populate chest markers
    /////////////////////////////////
    for(let k=0; k<data.chests.length; k++){
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
    
    // populate dungeon markers
    /////////////////////////////////
    for(let k=0; k<data.dungeons.length; k++){
        var id = data.dungeons[k].name;
        s = document.createElement('span');
        s.id = "dungeon_" + id;

        s.onclick = new Function('clickDungeon(dungeon_'+id+')');
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

    // populate skulltula markers
    /////////////////////////////////
    for (let key in data.skulltulas) {
        var entry = data.skulltulas[key];
        s = document.createElement('span');
        s.id = "skulltula_" + key;

        s.onclick = new Function('clickSkulltulas(skulltula_'+key+')');
        s.style.left = entry.x;
        s.style.top = entry.y;

        var ss = document.createElement('span');
        ss.className = "count";
        s.appendChild(ss);

        var ss = document.createElement('span');
        ss.className = "tooltip";
        ss.innerHTML = translate(key);
        s.appendChild(ss);

        poi.skulltulas.push(s);

        map_element.appendChild(s);
    }

    // update markers
    /////////////////////////////////
    updateMap();
}

function toggleChest(x) {
    var val = !savestate.read("chests", x.id, 0);
    savestate.write("chests", x.id, val);
    updateMap();
}

function toggleDungeon(x){
    var val = !savestate.read("chests", x.id, 0);
    savestate.write("chests", x.id, val);
    updateMap();
}

function toggleSkulltula(x){
    var val = !savestate.read("skulltulas", x.id, 0);
    savestate.write("skulltulas", x.id, val);
    updateMap();
}

function clickDungeon(d) {
    poi_list.mode = "d";
    var ref = poi_list.ref = d.id.slice(8);
    var dn = document.getElementById('dungeon-name');
    dn.innerHTML = translate(ref);
    var list = document.getElementById('dungeon-list');
    dn.setAttribute("data-mode", "dungeon");
    list.innerHTML = "";
    poi_list.entries = [];
    for (var i in data.dungeon_chests[ref]) {
        var key = data.dungeon_chests[ref][i];
        var s = document.createElement('li');
        s.id = key;
        s.innerHTML = translate(key);          

        s.onclick = new Function('toggleDungeon(this,"'+key+'")');
        s.style.cursor = "pointer";

        poi_list.entries.push(s);

        list.appendChild(s)
    }
    updateMap();
}

function clickSkulltulas(d) {
    poi_list.mode = "s";
    var ref = poi_list.ref = d.id.slice(10);
    var dn = document.getElementById('dungeon-name');
    dn.innerHTML = translate(ref);
    dn.setAttribute("data-ref", ref);
    var list = document.getElementById('dungeon-list');
    dn.setAttribute("data-mode", "skulltula");
    list.innerHTML = "";
    poi_list.entries = [];
    for (var i in data.skulltulas[ref].items) {
        var key = data.skulltulas[ref].items[i];
        var s = document.createElement('li');
        s.id = key;
        s.innerHTML = translate(key);          

        s.onclick = new Function('toggleSkulltula(this,"'+key+'")');
        s.style.cursor = "pointer";

        poi_list.entries.push(s);

        list.appendChild(s)
    }
    updateMap();
}

function checkChestAvailable(name) {
    return checkLogic(data.chest_logic[name]) ? "available" : "unavailable";
}

function checkChestList(name) {
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

function checkSulltulaList(name) {
    var list = data.skulltulas[name].items;
    var canGet = 0;
    var unopened = 0
    for (var i = 0; i < list.length; ++i) {
        var key = list[i];
        if (!savestate.read("skulltulas", key, 0)) {
            unopened++;
            if (checkLogic(data.skulltula_logic[key])) {
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
        return checkChestList(name);

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
    
    // update chest markers
    /////////////////////////////////
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
    
    // update dungeon markers
    /////////////////////////////////
    for (var i = 0; i < poi.dungeons.length; ++i) {
        var x = poi.dungeons[i];
        var ref = x.id.slice(8);
        x.className = "poi dungeon " + checkChestList(ref);

        var DCcount = 0;
        for (var j = 0; j <  data.dungeon_chests[ref].length; ++j) {
            var key = data.dungeon_chests[ref][j];
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
    
    // update skulltula markers
    /////////////////////////////////
    for (var i = 0; i < poi.skulltulas.length; ++i) {
        var x = poi.skulltulas[i];
        var ref = x.id.slice(10);
        x.className = "poi skulltula " + checkSulltulaList(ref);

        var SKcount = 0;
        for (var j = 0; j <  data.skulltulas[ref].items.length; ++j) {
            var key = data.skulltulas[ref].items[j];
            if (!savestate.read("skulltulas", key, 0) && checkLogic(data.skulltula_logic[key]))
            SKcount++;
        }
        skulltulas_available += SKcount;

        var ss = x.children[0];
        if (SKcount == 0)
            ss.innerHTML = "";
        else
            ss.innerHTML = SKcount;

    }
    
    // update list entries
    /////////////////////////////////
    var dn = document.getElementById('dungeon-name');
    switch (poi_list.mode) {
        case "s":
            dn.className = "DCavailable";
            for (var i = 0; i < poi_list.entries.length; ++i) {
                var x = poi_list.entries[i];
                if (savestate.read("skulltulas", x.id, 0))
                    x.className = "dungeon-chest DCopened";               
                else {
                    if (checkLogic(data.skulltula_logic[x.id])) {
                        x.className = "dungeon-chest DCavailable";
                    } else {
                        x.className = "dungeon-chest DCunavailable"; 
                    }
                }
            }
        break;
        case "d":
            dn.className = "DC" + checkBeatList(poi_list.ref);
            for (var i = 0; i < poi_list.entries.length; ++i) {
                var x = poi_list.entries[i];
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
        break;
    }

    setStatus("chests-available", chests_available);
    setStatus("chests-missing", chests_missing);
    setStatus("skulltulas-available", skulltulas_available);
    setStatus("skulltulas-missing", skulltulas_missing);
}