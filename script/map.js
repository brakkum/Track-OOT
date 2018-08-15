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
        s.style.color = 'black';
        s.id = id;
        s.onclick = new Function('togglePOI("chests", '+id+')');
        s.style.left = data.chests[id].x;
        s.style.top = data.chests[id].y;

        var ss = document.createElement('span');
        ss.className = "tooltip";
        ss.innerHTML = translate(id);
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
            if (!savestate.read("chests", key, 0) && checkLogic("chests", key))
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
        s.style.color = 'black';
        s.id = id;
        s.onclick = new Function('togglePOI("skulltulas", '+id+')');
        s.style.left = data.skulltulas[id].x;
        s.style.top = data.skulltulas[id].y;

        var ss = document.createElement('span');
        ss.className = "tooltip";
        ss.innerHTML = translate(id);
        s.appendChild(ss);

        poi.skulltulas.push(s);

        map_element.appendChild(s);
    }

    // update markers
    /////////////////////////////////
    updateMap();
}

function togglePOI(category, x){
    var val = !savestate.read(category, x.id, 0);
    savestate.write(category, x.id, val);
    updateMap();
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

        s.onclick = new Function('togglePOI(this, "'+poi_list.mode+'", "'+key+'")');
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
        if (!savestate.read("chests", ch, 0)) chests_missing++;
    }
    for (let sk in data.logic.skulltulas) {
        if (!savestate.read("skulltulas", sk, 0)) skulltulas_missing++;
    }
    
    // update chest markers
    /////////////////////////////////
    for (var i = 0; i < poi.chests.length; ++i) {
        var x = poi.chests[i];
        if(savestate.read("chests", x.id, 0)) {
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
        for (var j = 0; j <  data.dungeons[ref][poi_list.mode].length; ++j) {
            var key = data.dungeons[ref][poi_list.mode][j];
            if (!savestate.read(poi_list.mode, key, 0) && checkLogic(poi_list.mode, key))
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
        if(savestate.read("skulltulas", x.id, 0)) {
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
        if (savestate.read(poi_list.mode, x.id, 0))
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