// @koala-prepend "Item.js"

var itemGridEls = [];

function createItemTracker() {
    createGrid(document.getElementById("item-container"), data.item_grid);
    createGrid(document.getElementById("key-container"), data.item_keys);

    document.getElementById('toggle_deku_mq').onclick = function(ev) {
        toogleDungeonMQ("deku");
    };

    document.getElementById('toggle_dodongo_mq').onclick = function(ev) {
        toogleDungeonMQ("dodongo");
    };

    document.getElementById('toggle_jabu_mq').onclick = function(ev) {
        toogleDungeonMQ("jabujabu");
    };

    document.getElementById('toggle_forest_mq').onclick = function(ev) {
        toogleDungeonMQ("temple_forest");
    };
    
    document.getElementById('toggle_fire_mq').onclick = function(ev) {
        toogleDungeonMQ("temple_fire");
    };
    
    document.getElementById('toggle_water_mq').onclick = function(ev) {
        toogleDungeonMQ("temple_water");
    };
    
    document.getElementById('toggle_shadow_mq').onclick = function(ev) {
        toogleDungeonMQ("temple_shadow");
    };
    
    document.getElementById('toggle_spirit_mq').onclick = function(ev) {
        toogleDungeonMQ("temple_spirit");
    };
    
    document.getElementById('toggle_ganon_mq').onclick = function(ev) {
        toogleDungeonMQ("castle_ganon");
    };
    
    document.getElementById('toggle_training_mq').onclick = function(ev) {
        toogleDungeonMQ("gerudo_training");
    };
    
    document.getElementById('toggle_well_mq').onclick = function(ev) {
        toogleDungeonMQ("well");
    };
    
    document.getElementById('toggle_ice_mq').onclick = function(ev) {
        toogleDungeonMQ("ice_cavern");
    };
}

function createGrid(container, grid_data) {
    for (let i = 0; i < grid_data.length; ++i) {
        var cont = document.createElement('DIV');
        cont.classList.add("item-row");
        var sub = grid_data[i];
        for (let j = 0; j < sub.length; ++j) {
            let name = sub[j];
            if (name.startsWith("icon:")) {
                name = name.split("#");
                createItemIcon(cont, name[0].slice(5), name[1]);
            } else if (name.startsWith("text:")) {
                name = name.split("#");
                createItemText(cont, name[0].slice(5), name[1]);
            } else {
                createItemButton(cont, name);
            }
        }
        container.appendChild(cont);
    }
}

function createItemButton(cont, name) {
    itemGridEls.push(new Item(name, cont));
}

function createItemIcon(cont, img, ident) {
    var el = document.createElement('DIV');
    el.classList.add("icon");
    if (!!ident) {
        el.id = ident;
    }
    el.style.backgroundImage = "url('images/" + img + "')";
    cont.appendChild(el);
}

function createItemText(cont, text, ident) {
    var el = document.createElement('DIV');
    el.classList.add("text");
    if (!!ident) {
        el.id = ident;
    }
    el.innerHTML = text;
    cont.appendChild(el);
}

function toggleItem(ev) {
    var el = ev.currentTarget;
    var val = SaveState.read("items", el.id, 0);
    var ref = data.items[el.id];
    var m = ref.max;
    if (ref.hasOwnProperty("related_dungeon")) {
        if (!!SaveState.read("mq", ref.related_dungeon, false)) {
            m = ref.maxmq || m;
        }
    }
    if (val < m) {
        SaveState.write("items", el.id, ++val);
        setVisual(el, val);
        updateMap();
    }
    ev.preventDefault();
    return false;
}

function untoggleItem(ev) {
    var el = ev.currentTarget;
    var val = SaveState.read("items", el.id, 0);
    var ref = data.items[el.id];
    if (val > 0) {
        SaveState.write("items", el.id, --val);
        setVisual(el, val);
        updateMap();
    }
    ev.preventDefault();
    return false;
}

function setVisual(el, val) {
    var ref = data.items[el.id];
    if (!ref.always_active && val == 0) {
        el.classList.add("item-inactive");
    } else {
        el.classList.remove("item-inactive");
    }
    if (!!data.items[el.id].counting) {
        if (Array.isArray(data.items[el.id].counting)) {
            el.innerHTML = data.items[el.id].counting[val];
        } else {
            if (val == 0) {
                el.innerHTML = "";
            } else {
                el.innerHTML = val;
            }
        }
    }
    setImage(el, el.id, val);
    var m = ref.max;
    if (ref.hasOwnProperty("related_dungeon")) {
        if (!!SaveState.read("mq", ref.related_dungeon, false)) {
            m = ref.maxmq || m;
        }
    }
    if ((ref.hasOwnProperty("mark") && val >= ref.mark) || val >= m) {
        el.classList.add("mark");
    } else {
        el.classList.remove("mark");
    }
}

function setImage(el, id, val) {
    if (data.items[id].hasOwnProperty("images")) { // no image file defined
        let imgs = data.items[id].images;
        if (Array.isArray(imgs)) {
            el.style.backgroundImage = "url('images/" + imgs[val]+ "')";
        } else if (typeof imgs == "string") {
            el.style.backgroundImage = "url('images/" + imgs + "')";
        }
    } else { // no image file defined
        el.style.backgroundImage = "url('images/unknown.png')";
    }
}

function updateItems() {
    for (var i = 0; i < itemGridEls.length; ++i) {
        itemGridEls[i].update();
    }
}