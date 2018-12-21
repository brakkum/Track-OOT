// @koala-prepend "../UI/Map.js"
// @koala-prepend "../UI/Tooltip.js"
// @koala-prepend "../UI/SongBuilder.js"
// @koala-prepend "../UI/ShopBuilder.js"
// @koala-prepend "../UI/SelectBox.js"

let poi = {
    chests: [],
    dungeons: [],
    skulltulas: []
};

let poi_list = {
    mode: "chests",
    ref: "",
    entries: []
}

let map = new Map(document.getElementById("map-scroll"), "../images/map.png", 825, 466);

document.getElementById('dungeon-name').addEventListener("click", function(ev) {
    toogleDungeonMQ(ev.currentTarget.ref);
});

document.getElementById('dungeon-switch').addEventListener("click", function(ev) {
    poi_list.mode = poi_list.mode == "chests" ? "skulltulas" : "chests";
    ev.currentTarget.setAttribute("data-mode", poi_list.mode);
    document.getElementById('map-container').setAttribute("data-mode", poi_list.mode);
    reloadDungeonList();
});

function toogleDungeonMQ(name) {
    if (!!name && !!data.dungeons[name].hasmq) {
        let v = !SaveState.read("mq", name, false);
        SaveState.write("mq", name, v);
        updateItems();        
        document.getElementById("dungeon_" + name).click();
    }
}

function addBadge(target, age, time) {
    let el = document.createElement("span");
    if (!age && !time) {
        el.className = "hint-badge empty-hint";
    } else {
        el.className = "hint-badge";
    }
    switch(age) {
        case "child": el.innerHTML += "C"; break;
        case "adult": el.innerHTML += "A"; break;
    }
    switch(time) {
        case "night": el.innerHTML += "N"; break;
        case "day": el.innerHTML += "D"; break;
    }
    if (!!target) {
        target.appendChild(el);
    } else {
        return el.outerHTML;
    }
}

function addPOIs(target, category) {
    for (let id in data[category]) {
        let s = document.createElement('span');
        let dta = data[category][id];
        s.style.color = 'black';
        s.id = id;
        s.setAttribute("data-category", category);
        s.onclick = togglePOI;
        s.oncontextmenu = untogglePOI;
        s.style.left = dta.x;
        s.style.top = dta.y;
        if (!!dta.mode) {
            s.setAttribute("data-mode", dta.mode);
        }

        new Tooltip(s, translate(id) + (addBadge(false, dta.age, dta.time) || ""), document.getElementById("viewpane"));

        poi[category].push(s);

        target.appendChild(s);
    }
}

function populateMap() {
    let map_element = document.getElementById('map');

    fillDungeonList();
    
    // populate chest markers
    /////////////////////////////////
    addPOIs(map_element, "chests");
    
    // populate dungeon markers
    /////////////////////////////////
    for (let id in data.dungeons) {
        let dta = data.dungeons[id];
        s = document.createElement('span');
        s.id = "dungeon_" + id;

        s.onclick = clickDungeon;
        s.style.left = data.dungeons[id].x;
        s.style.top = data.dungeons[id].y;

        let ss = document.createElement('span');
        ss.className = "count";
        s.appendChild(ss);

        new Tooltip(s, translate(id) + (addBadge(false, dta.age, dta.time) || ""), document.getElementById("viewpane"));

        poi.dungeons.push(s);

        map_element.appendChild(s);
    }

    // overlays
    /////////////////////////////////
    createShops();
    createSongs();
    createHints();

    // populate skulltula markers
    /////////////////////////////////
    addPOIs(map_element, "skulltulas");

    // update markers
    /////////////////////////////////
    updateMap();
}

// hints
/////////////////////////////////////
function createHints() {
    let hints = document.getElementById('hint-view-body');
    data.hints.stones.sort(compareByTranslation);
    data.hints.locations.sort(compareByTranslation);
    data.hints.items.sort(compareByTranslation);
    for (let i = 0; i < data.hints.stones.length; ++i) {
        let stone = data.hints.stones[i];
        let el = document.createElement("div");
        el.className = "stone";
        let ttl = document.createElement("div");
        ttl.className = "stone-title";
        ttl.innerHTML = translate(stone);
        let bdy = document.createElement("div");
        bdy.className = "stone-body";
        bdy.id = "stonelist_"+stone;

        let lbl_loc = document.createElement('label');
        lbl_loc.innerHTML = translate("location");
        let slt_loc = new SelectBox();
        slt_loc.id = "stonelist_location_"+stone;
        slt_loc.addOption("["+translate("empty")+"]", "0x01");
        slt_loc.addOption("["+translate("junk")+"]", "0x02");
        for (let j = 0; j < data.hints.locations.length; ++j) {
            let loc = data.hints.locations[j];
            slt_loc.addOption(translate(loc), loc);
        }
        slt_loc.setAttribute("data-ref", stone);
        slt_loc.onchange = saveHintChange;
        lbl_loc.appendChild(slt_loc);

        let lbl_itm = document.createElement('label');
        lbl_itm.innerHTML = translate("item");
        let slt_itm = new SelectBox();
        slt_itm.id = "stonelist_item_"+stone;
        slt_itm.addOption("["+translate("empty")+"]", "0x01");
        for (let j = 0; j < data.hints.items.length; ++j) {
            let itm = data.hints.items[j];
            slt_itm.addOption(translate(itm), itm);
        }
        slt_itm.setAttribute("data-ref", stone);
        slt_itm.onchange = saveHintChange;
        lbl_itm.appendChild(slt_itm);

        bdy.appendChild(lbl_loc);
        bdy.appendChild(lbl_itm);
        el.appendChild(ttl);
        el.appendChild(bdy);
        hints.appendChild(el);
    }
}

function saveHintChange(event) {
    let el = event.target;
    let id = el.getAttribute("data-ref");
    let buf = SaveState.read("hints", id, {location:"0x01",item:"0x01"});
    buf[el.id.split("_")[1]] = el.value;
    SaveState.write("hints", id, buf);
}

function rebuildAllHints() {
    for (let i in data.hints.stones) {
        let stone = data.hints.stones[i];
        let buf = SaveState.read("hints", stone, {location:"0x01",item:"0x01"});
        document.getElementById("stonelist_location_"+stone).value = buf.location;
        document.getElementById("stonelist_item_"+stone).value = buf.item;
    }
}

// songs
/////////////////////////////////////
function createSongs() {
    let songs = document.getElementById('song-view-body');
    for (let i in data.songs) {
        let song = data.songs[i];
        let el = document.createElement("div");
        el.className = "song";
        let ttl = document.createElement("div");
        ttl.className = "song-title";
        ttl.innerHTML = translate(i);
        let bdy = document.createElement("div");
        bdy.className = "song-body stave";
        bdy.id = "songlist_"+i;
        var notes = SaveState.read("songs", i, song.notes);
        for (let j = 0; j < notes.length; ++j) {
            var note = song.notes[j];
            var nt = document.createElement("div");
            nt.className = "note note_"+note;
            bdy.appendChild(nt);
        }
        if (!!song.editable) {
            let edt = document.createElement('button');
            edt.className = "song-edit";
            edt.innerHTML = "✎";
            edt.onclick = editSong;
            edt.setAttribute("data-ref", i);
            ttl.appendChild(edt);
        }
        el.appendChild(ttl);
        el.appendChild(bdy);
        songs.appendChild(el);
    }
}

function rebuildAllSongs() {
    for (let i in data.songs) {
        rebuildSong(i);
    }
}

function rebuildSong(id) {
    let song = document.getElementById("songlist_"+id);
    song.innerHTML = "";
    var notes = SaveState.read("songs", id, data.songs[id].notes);
    for (let j = 0; j < notes.length; ++j) {
        let note = notes[j];
        let nt = document.createElement("div");
        nt.className = "note note_"+note;
        song.appendChild(nt);
    }
}

function editSong(event) {
    let id = event.currentTarget.getAttribute("data-ref");
    let song = SaveState.read("songs", id, data.songs[id].notes);
    let song_builder = new SongBuilder(song);
    let d = new Dialog(function(result) {
        if (!!result) {
            let res = song_builder.getSong();
            SaveState.write("songs", id, res);
            rebuildSong(id);
        }
    });
    d.setTitle(translate(id));
    d.setSubmitText("SUBMIT");
    d.setAbortText("CANCEL");
    d.addElement(song_builder);
}

// shops
/////////////////////////////////////
function createShops() {
    let shops = document.getElementById('shop-view-body');
    for (let i in data.shops) {
        let shop = data.shops[i];
        let el = document.createElement("div");
        el.className = "shop";
        let ttl = document.createElement("div");
        ttl.className = "shop-title";
        ttl.innerHTML = translate(i);
        let bdy = document.createElement("div");
        bdy.className = "shop-body";
        bdy.id = i;
        for (let j = 0; j < shop.length; ++j) {
            let item = shop[j];
            let shop_item = data.shop_items[item.item];
            let itm = document.createElement("div");
            itm.setAttribute("data-shop", i);
            itm.setAttribute("data-slot", j);
            itm.onclick = clickShopItem;
            itm.oncontextmenu = clickShopReItem;
            itm.className = "shop-item";
            let img = document.createElement("div");
            img.className = "shop-item-image";
            img.style.backgroundImage = "url('images/" + shop_item.image + "')";
            itm.appendChild(img);
            let iam = document.createElement("div");
            iam.innerHTML = translate(item.item) + (shop_item.refill ? "" : " " + translate("special_deal"));
            iam.className = "shop-item-title";
            itm.appendChild(iam);
            let ipr = document.createElement("div");
            ipr.innerHTML = item.price;
            ipr.className = "shop-item-price";
            itm.appendChild(ipr);
            bdy.appendChild(itm);
        }
        let edt = document.createElement('button');
        edt.className = "shop-edit";
        edt.innerHTML = "✎";
        edt.onclick = editShop;
        edt.setAttribute("data-ref", i);
        ttl.appendChild(edt);
        el.appendChild(ttl);
        el.appendChild(bdy);
        shops.appendChild(el);
    }
}

function clickShopItem(event) {
    let t = event.currentTarget;
    let id = t.getAttribute("data-shop");
    let slot = t.getAttribute("data-slot");
    let bought = SaveState.read("shops_bought", id, [0,0,0,0,0,0,0,0]);
    bought[slot] = 1;
    SaveState.write("shops_bought", id, bought);
    rebuildShop(id);
}

function clickShopReItem(event) {
    let t = event.currentTarget;
    let id = t.getAttribute("data-shop");
    let slot = t.getAttribute("data-slot");
    let bought = SaveState.read("shops_bought", id, [0,0,0,0,0,0,0,0]);
    bought[slot] = 0;
    SaveState.write("shops_bought", id, bought);
    rebuildShop(id);
}

function rebuildAllShops() {
    for (let i in data.shops) {
        rebuildShop(i);
    }
}

function rebuildShop(id) {
    let itms = document.getElementById(id).querySelectorAll(".shop-item");
    let shop = SaveState.read("shops", id, data.shops[id]);
    let bought = SaveState.read("shops_bought", id, [0,0,0,0,0,0,0,0]);
    for (let i = 0; i < 8; ++i) {
        let shop_slot = shop[i];
        let shop_item = data.shop_items[shop_slot.item];
        let slot = itms[i];
        if (shop_item.refill || !bought[i]) {
            slot.querySelector(".shop-item-image").style.backgroundImage = "url('images/" + shop_item.image + "')";
        } else { 
            slot.querySelector(".shop-item-image").style.backgroundImage = "url('images/sold_out.png')";
        }
        slot.querySelector(".shop-item-title").innerHTML = translate(shop_slot.item) + (shop_item.refill ? "" : " " + translate("special_deal"));
        slot.querySelector(".shop-item-price").innerHTML = shop_slot.price;
    }
}

function editShop(event) {
    let id = event.currentTarget.getAttribute("data-ref");
    let itms = Object.keys(data.shop_items);
    let shop = SaveState.read("shops", id, data.shops[id]);
    let chooser = [];
    let pricer = [];
    let cont = new ShopBuilder(shop);
    let d = new Dialog(function(result) {
        if (!!result) {
            SaveState.write("shops", id, cont.getShop());
            rebuildShop(id);
        }
    });
    d.setTitle(translate(id));
    d.setSubmitText("SUBMIT");
    d.setAbortText("CANCEL");
    d.addElement(cont);
}

function togglePOI(event){
    let key = event.currentTarget.id;
    let category = event.currentTarget.getAttribute("data-category");
    SaveState.write(category, key, true);
    updateMap();
    event.preventDefault();
    return false;
}

function untogglePOI(event){
    let key = event.currentTarget.id;
    let category = event.currentTarget.getAttribute("data-category");
    SaveState.write(category, key, false);
    updateMap();
    event.preventDefault();
    return false;
}

function clickDungeon(event) {
    loadDungeonList(event.currentTarget.id.slice(8));
}

function loadDungeonList(event) {
    let ref_id = event;
    if (typeof ref_id != "string") {
        ref_id = event.currentTarget.getAttribute("data-ref");
    }
    let dn = document.getElementById('dungeon-name');
    poi_list.ref = ref_id;
    dn.ref = ref_id;
    dn.innerHTML = translate(poi_list.ref);
    let dd;
    if (ref_id == "overworld") {
        dd = data[poi_list.mode];
        dn.removeAttribute("data-mode");
    } else {
        let dun = data.dungeons[poi_list.ref];
        if (dun.hasmq) {
            let mq = SaveState.read("mq", ref_id, false);
            dn.setAttribute("data-mode", mq ? "mq" : "v");
            dd = dun[poi_list.mode + (mq?"_mq":"")];
            if (!dd) dd = dun[poi_list.mode];
        } else {
            dd = dun[poi_list.mode];
            dn.removeAttribute("data-mode");
        }
    }
    fillDungeonList(dd);
}

function fillDungeonList(dd) {
    let list = document.getElementById('dungeon-list');
    list.innerHTML = "";
    poi_list.entries = [];
    if (!!dd) {
        let r = document.createElement('li');
        let n = document.createElement('span');
        n.className = "hint-name";
        n.innerHTML = "(back)";
        r.appendChild(n);
        addBadge(r);
        r.className = "dungeon-entry";
        r.onclick = function() {
            fillDungeonList();
            document.getElementById('dungeon-name').removeAttribute("data-mode");
        };
        r.style.cursor = "pointer";
        list.appendChild(r);

        for (let i in dd) {
            let dta = dd[i];
            let s = document.createElement('li');
            s.id = i;
            let n = document.createElement('span');
            n.className = "hint-name";
            n.innerHTML = translate(i);
            s.appendChild(n);
            addBadge(s, dta.age, dta.time);
            s.setAttribute("data-category", poi_list.mode);
            s.onclick = togglePOI;
            s.oncontextmenu = untogglePOI;
            s.style.cursor = "pointer";
            if (!!dta.mode) {
                s.setAttribute("data-mode", dta.mode);
            }
            poi_list.entries.push(s);
            list.appendChild(s);
        }
    } else {
        let dn = document.getElementById('dungeon-name');
        poi_list.ref = "";
        dn.ref = null;
        dn.innerHTML = "Hyrule";

        let r = document.createElement('li');
        let n = document.createElement('span');
        n.className = "hint-name";
        n.innerHTML = "Overworld";
        r.appendChild(n);
        addBadge(r);
        r.setAttribute("data-ref", "overworld");
        r.onclick = loadDungeonList;
        r.style.cursor = "pointer";
        r.className = "dungeon-entry DCAvailable";
        poi_list.entries.push(r);
        list.appendChild(r);

        dd = data.dungeons;

        for (let i in dd) {
            let dta = dd[i];
            let s = document.createElement('li');
            let n = document.createElement('span');
            n.className = "hint-name";
            n.innerHTML = translate(i);
            s.appendChild(n);
            addBadge(s, dta.age, dta.time);
            s.setAttribute("data-ref", i);
            s.onclick = loadDungeonList;
            s.style.cursor = "pointer";
            s.className = "dungeon-entry DCAvailable";
            poi_list.entries.push(s);
            list.appendChild(s);
        }
    }
    updateMap();
}

function reloadDungeonList() {
    if (!!poi_list.ref && !!poi_list.ref.length) {
        loadDungeonList(poi_list.ref);
    } else {
        updateMap();
    }
}

function updateMap() {
    let chests_available = 0;
    let chests_missing = 0;
    let skulltulas_available = 0;
    let skulltulas_missing = 0;
    
    // update chest markers
    /////////////////////////////////
    for (let i = 0; i < poi.chests.length; ++i) {
        let x = poi.chests[i];
        if(SaveState.read("chests", x.id, 0)) {
            x.className = "poi chest opened";
        } else {
            let avail = checkLogic("chests", x.id);
            x.className = "poi chest " + (avail ? "available" : "unavailable");
            if (!data.chests[x.id].mode || data.chests[x.id].mode != "scrubsanity" || SaveState.read("options", "scrubsanity", false)) {
                chests_missing++;
                if (avail) chests_available++;
            }
        }
    }
    
    // update dungeon markers
    /////////////////////////////////
    for (let i = 0; i < poi.dungeons.length; ++i) {
        let x = poi.dungeons[i];
        let ref = x.id.slice(8);
        x.className = "poi dungeon " + checkList(poi_list.mode, ref);

        let chests = data.dungeons[ref].chests;
        let skulltulas = data.dungeons[ref].skulltulas;

        if (!!data.dungeons[ref].hasmq && SaveState.read("mq", ref, false)) {
            chests = data.dungeons[ref].chests_mq;
            skulltulas = data.dungeons[ref].skulltulas_mq;
        }

        let DCcount = 0;
        for (let j in chests) {
            if (!SaveState.read("chests", j, 0)) {
                if (!chests[j].mode || chests[j].mode != "scrubsanity" || SaveState.read("options", "scrubsanity", false)) {
                    chests_missing++;
                    if (checkLogic("chests", j)) DCcount++;
                }
            }
        }
        chests_available+=DCcount;
        let SKcount = 0;
        for (let j in skulltulas) {
            if (!SaveState.read("skulltulas", j, 0)) {
                if (checkLogic("skulltulas", j)) {
                    SKcount++;
                }
                skulltulas_missing++;
            }
        }
        skulltulas_available+=SKcount;
        if (poi_list.mode == "chests") {
            let ss = x.children[0];
            if (DCcount == 0)
                ss.innerHTML = "";
            else
                ss.innerHTML = DCcount;
        } else if (poi_list.mode == "skulltulas") {
            let ss = x.children[0];
            if (SKcount == 0)
                ss.innerHTML = "";
            else
                ss.innerHTML = SKcount;
        }

    }
    
    // update skulltula markers
    /////////////////////////////////
    for (let i = 0; i < poi.skulltulas.length; ++i) {
        let x = poi.skulltulas[i];
        if(SaveState.read("skulltulas", x.id, 0)) {
            x.className = "poi skulltula opened";
        } else {
            let avail = checkLogic("skulltulas", x.id);
            if (avail) skulltulas_available++;
            x.className = "poi skulltula " + (avail ? "available" : "unavailable");
            skulltulas_missing++;
        }
    }
    
    // update list entries
    /////////////////////////////////
    let dn = document.getElementById('dungeon-name');
    if (poi_list.mode == "chests" && poi_list.ref != "") {
        dn.className = "DC" + checkBeatList(poi_list.ref);
    } else {
        dn.className = "DCavailable";
    }
    for (let i = 0; i < poi_list.entries.length; ++i) {
        let x = poi_list.entries[i];
        if (SaveState.read(poi_list.mode, x.id, 0))
            x.className = "dungeon-entry DCopened";               
        else {
            let ref = x.getAttribute("data-ref");
            if (!ref) {
                ref = x.id;
                if (checkLogic(poi_list.mode, ref)) {
                    x.className = "dungeon-entry DCavailable";
                } else {
                    x.className = "dungeon-entry DCunavailable"; 
                }
            } else {
                x.className = "dungeon-entry DC" + checkList(poi_list.mode, ref);
            }
        }
    }

    setStatus("chests-available", chests_available);
    setStatus("chests-missing", chests_missing);
    setStatus("skulltulas-available", skulltulas_available);
    setStatus("skulltulas-missing", skulltulas_missing);
}