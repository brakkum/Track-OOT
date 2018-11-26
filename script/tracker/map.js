// @koala-prepend "../UI/Map.js"
// @koala-prepend "../UI/Tooltip.js"

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

var map = new Map(document.getElementById("map-scroll"), "../images/map.png", 825, 466);

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
        var v = !SaveState.read("mq", name, false);
        SaveState.write("mq", name, v);
        updateItems();        
        document.getElementById("dungeon_" + name).click();
    }
}

function addBadge(target, age, time) {
    var el = document.createElement("span");
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
        var s = document.createElement('span');
        var dta = data[category][id];
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
    var map_element = document.getElementById('map');

    fillDungeonList();
    
    // populate chest markers
    /////////////////////////////////
    addPOIs(map_element, "chests");
    
    // populate dungeon markers
    /////////////////////////////////
    for (let id in data.dungeons) {
        var dta = data.dungeons[id];
        s = document.createElement('span');
        s.id = "dungeon_" + id;

        s.onclick = clickDungeon;
        s.style.left = data.dungeons[id].x;
        s.style.top = data.dungeons[id].y;

        var ss = document.createElement('span');
        ss.className = "count";
        s.appendChild(ss);

        new Tooltip(s, translate(id) + (addBadge(false, dta.age, dta.time) || ""), document.getElementById("viewpane"));

        poi.dungeons.push(s);

        map_element.appendChild(s);
    }

    // shops
    /////////////////////////////////
    createShops();

    // populate skulltula markers
    /////////////////////////////////
    addPOIs(map_element, "skulltulas");

    // update markers
    /////////////////////////////////
    updateMap();
}

function createShops() {
    var shops = document.getElementById('shop-view-body');
    for (let i in data.shops) {
        var shop = data.shops[i];
        var el = document.createElement("div");
        el.className = "shop";
        var ttl = document.createElement("div");
        ttl.className = "shop-title";
        ttl.innerHTML = translate(i);
        var bdy = document.createElement("div");
        bdy.className = "shop-body";
        bdy.id = i;
        for (let j = 0; j < shop.length; ++j) {
            var item = shop[j];
            var shop_item = data.shop_items[item.item];
            var itm = document.createElement("div");
            itm.setAttribute("data-shop", i);
            itm.setAttribute("data-slot", j);
            itm.onclick = clickShopItem;
            itm.oncontextmenu = clickShopReItem;
            itm.className = "shop-item";
            var img = document.createElement("div");
            img.className = "shop-item-image";
            img.style.backgroundImage = "url('images/" + shop_item.image + "')";
            itm.appendChild(img);
            var iam = document.createElement("div");
            iam.innerHTML = translate(item.item) + (shop_item.refill ? "" : " " + translate("special_deal"));
            iam.className = "shop-item-title";
            itm.appendChild(iam);
            var ipr = document.createElement("div");
            ipr.innerHTML = item.price;
            ipr.className = "shop-item-price";
            itm.appendChild(ipr);
            bdy.appendChild(itm);
        }
        var edt = document.createElement('button');
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
    var t = event.currentTarget;
    var id = t.getAttribute("data-shop");
    var slot = t.getAttribute("data-slot");
    var bought = SaveState.read("shops_bought", id, [0,0,0,0,0,0,0,0]);
    bought[slot] = 1;
    SaveState.write("shops_bought", id, bought);
    rebuildShop(id);
}

function clickShopReItem(event) {
    var t = event.currentTarget;
    var id = t.getAttribute("data-shop");
    var slot = t.getAttribute("data-slot");
    var bought = SaveState.read("shops_bought", id, [0,0,0,0,0,0,0,0]);
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
    var itms = document.getElementById(id).querySelectorAll(".shop-item");
    var shop = SaveState.read("shops", id, data.shops[id]);
    var bought = SaveState.read("shops_bought", id, [0,0,0,0,0,0,0,0]);
    for (let i = 0; i < 8; ++i) {
        var shop_slot = shop[i];
        var shop_item = data.shop_items[shop_slot.item];
        var slot = itms[i];
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
    var id = event.currentTarget.getAttribute("data-ref");
    var itms = Object.keys(data.shop_items);
    var shop = SaveState.read("shops", id, data.shops[id]);
    var chooser = [];
    var pricer = [];
    var cont = document.createElement("div");
    cont.className = "shop";
    for (let i = 0; i < 8; ++i) {
        var itm = document.createElement("div"),
            chs = document.createElement("select"),
            prc = document.createElement("input"),
            rpy = document.createElement("span");
        itm.className = "shop-item";
        for (let j = 0; j < itms.length; ++j) {
            var opt = document.createElement("option");
            opt.innerHTML = translate(itms[j]) + (data.shop_items[itms[j]].refill ? "" : " " + translate("special_deal"));
            opt.setAttribute("value", itms[j]);
            chs.appendChild(opt);
        }
        chs.value = shop[i].item;
        chs.className = "shop-item-title";
        prc.setAttribute("type", "number");
        prc.setAttribute("min-value", 1);
        prc.setAttribute("max-value", 999);
        prc.value = shop[i].price;
        prc.className = "shop-item-price";
        chooser.push(chs);
        pricer.push(prc);
        rpy.innerHTML = "Rupee(s)";
        itm.appendChild(chs);
        itm.appendChild(prc);
        itm.appendChild(rpy);
        cont.appendChild(itm);
    }
    var d = new Dialog(function(result) {
        if (!!result) {
            var res = [];
            for (let i = 0; i < 8; ++i) {
                res.push({
                    item: chooser[i].value,
                    price: pricer[i].value
                });
            }
            SaveState.write("shops", id, res);
            rebuildShop(id);
        }
    });
    d.setTitle(translate(id));
    d.setSubmitText("SUBMIT");
    d.setAbortText("ABORT");
    d.addElement(cont);
}

function togglePOI(event){
    var key = event.currentTarget.id;
    var category = event.currentTarget.getAttribute("data-category");
    SaveState.write(category, key, true);
    updateMap();
    event.preventDefault();
    return false;
}

function untogglePOI(event){
    var key = event.currentTarget.id;
    var category = event.currentTarget.getAttribute("data-category");
    SaveState.write(category, key, false);
    updateMap();
    event.preventDefault();
    return false;
}

function clickDungeon(event) {
    loadDungeonList(event.currentTarget.id.slice(8));
}

function loadDungeonList(event) {
    var ref_id = event;
    if (typeof ref_id != "string") {
        ref_id = event.currentTarget.getAttribute("data-ref");
    }
    var dn = document.getElementById('dungeon-name');
    poi_list.ref = ref_id;
    dn.ref = ref_id;
    dn.innerHTML = translate(poi_list.ref);
    var dd;
    if (ref_id == "overworld") {
        dd = data[poi_list.mode];
        dn.removeAttribute("data-mode");
    } else {
        var dun = data.dungeons[poi_list.ref];
        if (dun.hasmq) {
            var mq = SaveState.read("mq", ref_id, false);
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
    var list = document.getElementById('dungeon-list');
    list.innerHTML = "";
    poi_list.entries = [];
    if (!!dd) {
        var r = document.createElement('li');
        var n = document.createElement('span');
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
            var dta = dd[i];
            var s = document.createElement('li');
            s.id = i;
            var n = document.createElement('span');
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
        var dn = document.getElementById('dungeon-name');
        poi_list.ref = "";
        dn.ref = null;
        dn.innerHTML = "Hyrule";

        var r = document.createElement('li');
        var n = document.createElement('span');
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
            var dta = dd[i];
            var s = document.createElement('li');
            var n = document.createElement('span');
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
            var avail = checkLogic("chests", x.id);
            x.className = "poi chest " + (avail ? "available" : "unavailable");
            if (!data.chests[x.id].mode || data.chests[x.id].mode != "scrubsanity" || SaveState.read("options", "scrubsanity", false)) {
                chests_missing++;
                if (avail) chests_available++;
            }
        }
    }
    
    // update dungeon markers
    /////////////////////////////////
    for (var i = 0; i < poi.dungeons.length; ++i) {
        var x = poi.dungeons[i];
        var ref = x.id.slice(8);
        x.className = "poi dungeon " + checkList(poi_list.mode, ref);

        var chests = data.dungeons[ref].chests;
        var skulltulas = data.dungeons[ref].skulltulas;

        if (!!data.dungeons[ref].hasmq && SaveState.read("mq", ref, false)) {
            chests = data.dungeons[ref].chests_mq;
            skulltulas = data.dungeons[ref].skulltulas_mq;
        }

        var DCcount = 0;
        for (let j in chests) {
            if (!SaveState.read("chests", j, 0)) {
                if (!chests[j].mode || chests[j].mode != "scrubsanity" || SaveState.read("options", "scrubsanity", false)) {
                    chests_missing++;
                    if (checkLogic("chests", j)) DCcount++;
                }
            }
        }
        chests_available+=DCcount;
        var SKcount = 0;
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
            var avail = checkLogic("skulltulas", x.id);
            if (avail) skulltulas_available++;
            x.className = "poi skulltula " + (avail ? "available" : "unavailable");
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
            var ref = x.getAttribute("data-ref");
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