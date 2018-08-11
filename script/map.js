var poi = {
    chests: [],
    dungeons: [],
    dungeon_chests: []
};

function populateMap() {
    var map_element = document.getElementById('map');
    populateChests(map_element);
    populateDungeons(map_element);
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
        if(data.chests[k].isOpened)
            s.className = "poi chest opened";
        else
            s.className = "poi chest " + checkChestAvailable(id)

        var ss = document.createElement('span');
        ss.className = "tooltip";
        ss.innerHTML = translate(id);
        s.appendChild(ss);

        poi.chests.push(s);

        map_element.appendChild(s);
    }
}

function toggleChest(x){
    savestate.chests[x.id] = !savestate.chests[x.id];
    if(savestate.chests[x.id]) {
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
        s.className = "poi dungeon " + checkBeatList(id);

        var DCcount = 0;
        for (var i = 0; i <  data.dungeon_chests[id].length; ++i) {
            var key = data.dungeon_chests[id][i];
            if (!savestate.chests[key] && checkLogic(data.chest_logic[key]))
                DCcount++;
        }

        var ss = document.createElement('span');
        ss.className = "chestCount";
        if (DCcount == 0)
            ss.innerHTML = "";
        else
            ss.innerHTML = DCcount;
        ss.style.color = "black"
        s.style.textAlign = "center";
        ss.display = "inline-block";
        ss.style.lineHeight = "24px";
        s.appendChild(ss);

        var ss = document.createElement('span');
        ss.className = "tooltipgray";
        ss.innerHTML = translate(id);
        s.appendChild(ss);

        poi.dungeons.push(s);

        map_element.appendChild(s);
    }
}

function clickDungeon(d){

    document.getElementById('dungeon-name').innerHTML = translate(d.id);
    document.getElementById('dungeon-name').className = "DC" + checkBeatList(d.id);
    var DClist = document.getElementById('dungeon-list');
    DClist.innerHTML = ""

    poi.dungeon_chests = [];
    for (var i in data.dungeon_chests[d.id]) {
        var key = data.dungeon_chests[d.id][i];
        var s = document.createElement('li');
        s.id = key;
        s.innerHTML = translate(key);

        if (savestate.chests[key])
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
    savestate.chests[key] = !savestate.chests[key];

    if (savestate.chests[key])
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
        if (!savestate.chests[key]) {
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
    if (data.dungeon_logic[name].length > 0)
        return checkLogic(data.dungeon_logic[name]) ? "available" : "unavailable";
    return checkChestlist(name) ? "available" : "unavailable";
}

function checkLogic(logic) {
    if (logic.length == 0) {
        return true;
    } else {
        next_test:
        for (var i = 0; i < logic.length; ++i) {
            var test = logic[i];
            for (var j = 0; j < test.length; ++j) {
                var testel = test[j].split(":");
                if (!!testel[1]) {
                    if (savestate.items[testel[0]] < testel[1]) continue next_test;
                } else {
                    if (savestate.items[testel[0]] == 0) continue next_test;
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

    for (let ch in savestate.chests) {
        if (!savestate.chests[ch]) chests_missing++;
    }

    for (var i = 0; i < poi.chests.length; ++i) {
        var x = poi.chests[i];
        if(savestate.chests[x.id]) {
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
            if (!savestate.chests[key] && checkLogic(data.chest_logic[key]))
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
        if (savestate.chests[x.id])
            x.className = "dungeon-chest DCopened";               
        else {
            if (checkLogic(data.chest_logic[x.id])) {
                x.className = "dungeon-chest DCavailable";
            } else {
                x.className = "dungeon-chest DCunavailable"; 
            }
        }
    }
    setStatus("chests-available", chests_available);
    setStatus("chests-missing", chests_missing);
    setStatus("skulltulas-available", skulltulas_available);
    setStatus("skulltulas-missing", skulltulas_missing);
}