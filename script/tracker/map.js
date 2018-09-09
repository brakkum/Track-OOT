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

function populateMap() {
    var map_element = document.getElementById('map');
    
    // populate chest markers
    /////////////////////////////////
    for (let id in data.chests) {
        var s = document.createElement('span');
        var dta = data.chests[id];
        s.style.color = 'black';
        s.id = id;
        s.onclick = new Function('togglePOI("chests", "'+id+'")');
        s.oncontextmenu = new Function('untogglePOI("chests", "'+id+'")');
        s.style.left = dta.x;
        s.style.top = dta.y;

        var ss = document.createElement('span');
        ss.className = "tooltip";
        ss.innerHTML = translate(id);
        if (dta.night) {
            switch(dta.age) {
                case "child": ss.classList.add("child-night"); break;
                case "adult": ss.classList.add("adult-night"); break;
                default: ss.classList.add("night"); break;
            }
        } else {
            switch(dta.age) {
                case "child": ss.classList.add("child"); break;
                case "adult": ss.classList.add("adult"); break;
            }
        }
        s.appendChild(ss);

        poi.chests.push(s);

        map_element.appendChild(s);
    }
    
    // populate dungeon markers
    /////////////////////////////////
    for (let id in data.dungeons) {
        s = document.createElement('span');
        s.id = "dungeon_" + id;

        s.onclick = new Function('clickDungeon(dungeon_'+id+')');
        s.style.left = data.dungeons[id].x;
        s.style.top = data.dungeons[id].y;

        var DCcount = 0;
        for (var i = 0; i < data.dungeons[id].chests.length; ++i) {
            var key = data.dungeons[id].chests[i];
            if (!SaveState.read("chests", key, 0) && checkLogic("chests", key))
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
    for (let id in data.skulltulas) {
        var s = document.createElement('span');
        var dta = data.skulltulas[id];
        s.style.color = 'black';
        s.id = id;
        s.onclick = new Function('togglePOI("skulltulas", "'+id+'")');
        s.oncontextmenu = new Function('untogglePOI("skulltulas", "'+id+'")');
        s.style.left = dta.x;
        s.style.top = dta.y;

        var ss = document.createElement('span');
        ss.className = "tooltip";
        ss.innerHTML = translate(id);
        if (dta.night) {
            switch(dta.age) {
                case "child": ss.classList.add("child-night"); break;
                case "adult": ss.classList.add("adult-night"); break;
                default: ss.classList.add("night"); break;
            }
        } else {
            switch(dta.age) {
                case "child": ss.classList.add("child"); break;
                case "adult": ss.classList.add("adult"); break;
            }
        }
        s.appendChild(ss);

        poi.skulltulas.push(s);

        map_element.appendChild(s);
    }

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
    for (var i in data.dungeons[poi_list.ref][poi_list.mode]) {
        var key = data.dungeons[poi_list.ref][poi_list.mode][i];
        var s = document.createElement('li');
        s.id = key;
        s.innerHTML = translate(key);

        s.onclick = new Function('togglePOI("'+poi_list.mode+'", "'+key+'")');
        s.oncontextmenu = new Function('untogglePOI("'+poi_list.mode+'", "'+key+'")');
        s.style.cursor = "pointer";

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

    for (let ch in data.logic.chests) {
        if (!SaveState.read("chests", ch, 0)) chests_missing++;
    }
    for (let sk in data.logic.skulltulas) {
        if (!SaveState.read("skulltulas", sk, 0)) skulltulas_missing++;
    }
    
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
        }
    }
    
    // update dungeon markers
    /////////////////////////////////
    for (var i = 0; i < poi.dungeons.length; ++i) {
        var x = poi.dungeons[i];
        var ref = x.id.slice(8);
        x.className = "poi dungeon " + checkList(poi_list.mode, ref);

        var DCcount = 0;
        for (var j = 0; j <  data.dungeons[ref].chests.length; ++j) {
            var key = data.dungeons[ref]["chests"][j];
            if (!SaveState.read("chests", key, 0) && checkLogic("chests", key))
                DCcount++;
        }
        chests_available+=DCcount;
        var SKcount = 0;
        for (var j = 0; j <  data.dungeons[ref].skulltulas.length; ++j) {
            var key = data.dungeons[ref]["skulltulas"][j];
            if (!SaveState.read("skulltulas", key, 0) && checkLogic("skulltulas", key))
            SKcount++;
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