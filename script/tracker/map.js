var poi = {
    chests: [],
    dungeons: [],
    skulltulas: []
};

var poi_list = {
    mode: "chests",
    ref: "",
    entries: []
}

function addBadge(target, age, time) {
    if (!age && !time) return;
    var el = document.createElement("span");
    el.className = "hint-badge";
    switch(age) {
        case "child": el.innerHTML += "C"; break;
        case "adult": el.innerHTML += "A"; break;
    }
    switch(time) {
        case "night": el.innerHTML += "N"; break;
        case "day": el.innerHTML += "D"; break;
    }
    target.appendChild(el);
}

function addPOIs(target, category) {
    for (let id in data[category]) {
        var s = document.createElement('span');
        var dta = data[category][id];
        s.style.color = 'black';
        s.id = id;
        s.onclick = new Function('togglePOI("'+category+'", "'+id+'")');
        s.oncontextmenu = new Function('untogglePOI("'+category+'", "'+id+'")');
        s.style.left = dta.x;
        s.style.top = dta.y;
        if (!!dta.mode) {
            s.setAttribute("data-mode", dta.mode);
        }

        var ss = document.createElement('span');
        ss.className = "tooltip";
        ss.innerHTML = translate(id);
        addBadge(ss, dta.age, dta.time);
        s.appendChild(ss);

        poi[category].push(s);

        target.appendChild(s);
    }
}

function populateMap() {
    var map_element = document.getElementById('map');
    
    // populate chest markers
    /////////////////////////////////
    addPOIs(map_element, "chests");
    
    // populate dungeon markers
    /////////////////////////////////
    for (let id in data.dungeons) {
        s = document.createElement('span');
        s.id = "dungeon_" + id;

        s.onclick = new Function('clickDungeon(dungeon_'+id+')');
        s.style.left = data.dungeons[id].x;
        s.style.top = data.dungeons[id].y;

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
    addPOIs(map_element, "skulltulas");

    // update markers
    /////////////////////////////////
    updateMap();
}

function togglePOI(category, key){
    SaveState.write(category, key, true);
    updateMap();
    event.preventDefault();
    return false;
}

function untogglePOI(category, key){
    SaveState.write(category, key, false);
    updateMap();
    event.preventDefault();
    return false;
}

function clickDungeon(ref) {
    var dn = document.getElementById('dungeon-name');
    poi_list.ref = ref.id.slice(8);
    dn.innerHTML = translate(poi_list.ref);
    var list = document.getElementById('dungeon-list');
    dn.setAttribute("data-mode", poi_list.mode);
    list.innerHTML = "";
    poi_list.entries = [];
    for (let i in data.dungeons[poi_list.ref][poi_list.mode]) {
        var dta = data.dungeons[poi_list.ref][poi_list.mode][i];
        var s = document.createElement('li');
        s.id = i;
        s.innerHTML = translate(i);
        addBadge(s, dta.age, dta.time);
        s.onclick = new Function('togglePOI("'+poi_list.mode+'", "'+i+'")');
        s.oncontextmenu = new Function('untogglePOI("'+poi_list.mode+'", "'+i+'")');
        s.style.cursor = "pointer";
        if (!!dta.mode) {
            s.setAttribute("data-mode", dta.mode);
        }

        poi_list.entries.push(s);

        list.appendChild(s)
    }
    updateMap();
}

function updateMap() {
    var chests_available = 0;
    var chests_missing = 0;
    var skulltulas_available = 0;
    var skulltulas_missing = 0;
    
    // update chest markers
    /////////////////////////////////
    for (var i = 0; i < poi.chests.length; ++i) {
        var x = poi.chests[i];
        if(SaveState.read("chests", x.id, 0)) {
            x.className = "poi chest opened";
        } else {
            var avail = checkAvailable("chests", x.id);
            if (avail == "available") chests_available++;
            x.className = "poi chest " + avail;
            if (!data.chests[x.id].mode || data.chests[x.id].mode != "shopsanity" || SaveState.read("options", "shopsanity", false)) {
                chests_missing++;
            }
        }
    }
    
    // update dungeon markers
    /////////////////////////////////
    for (var i = 0; i < poi.dungeons.length; ++i) {
        var x = poi.dungeons[i];
        var ref = x.id.slice(8);
        x.className = "poi dungeon " + checkList(poi_list.mode, ref);

        var DCcount = 0;
        for (let j in data.dungeons[ref].chests) {
            if (!data.dungeons[ref].chests[j].mode || data.dungeons[ref].chests[j].mode != "shopsanity" || SaveState.read("options", "shopsanity", false)) {
                if (!SaveState.read("chests", j, 0) && checkLogic("chests", j)) {
                    DCcount++;
                }
                chests_missing++;
            }
        }
        chests_available+=DCcount;
        var SKcount = 0;
        for (let j in data.dungeons[ref].skulltulas) {
            if (!SaveState.read("skulltulas", j, 0) && checkLogic("skulltulas", j)) {
                SKcount++;
            }
            skulltulas_missing++;
        }
        skulltulas_available+=SKcount;
        if (poi_list.mode == "chests") {
            var ss = x.children[0];
            if (DCcount == 0)
                ss.innerHTML = "";
            else
                ss.innerHTML = DCcount;
        } else if (poi_list.mode == "skulltulas") {
            var ss = x.children[0];
            if (SKcount == 0)
                ss.innerHTML = "";
            else
                ss.innerHTML = SKcount;
        }

    }
    
    // update skulltula markers
    /////////////////////////////////
    for (var i = 0; i < poi.skulltulas.length; ++i) {
        var x = poi.skulltulas[i];
        if(SaveState.read("skulltulas", x.id, 0)) {
            x.className = "poi skulltula opened";
        } else {
            var avail = checkAvailable("skulltulas", x.id);
            if (avail == "available") skulltulas_available++;
            x.className = "poi skulltula " + avail;
            skulltulas_missing++;
        }
    }
    
    // update list entries
    /////////////////////////////////
    var dn = document.getElementById('dungeon-name');
    if (poi_list.mode == "chests" && poi_list.ref != "") {
        dn.className = "DC" + checkBeatList(poi_list.ref);
    } else {
        dn.className = "DCavailable";
    }
    for (var i = 0; i < poi_list.entries.length; ++i) {
        var x = poi_list.entries[i];
        if (SaveState.read(poi_list.mode, x.id, 0))
            x.className = "dungeon-entry DCopened";               
        else {
            if (checkLogic(poi_list.mode, x.id)) {
                x.className = "dungeon-entry DCavailable";
            } else {
                x.className = "dungeon-entry DCunavailable"; 
            }
        }
    }

    setStatus("chests-available", chests_available);
    setStatus("chests-missing", chests_missing);
    setStatus("skulltulas-available", skulltulas_available);
    setStatus("skulltulas-missing", skulltulas_missing);
}