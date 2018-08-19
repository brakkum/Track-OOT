var itemGridEls = [];

function createItemTracker() {
    createGrid(document.getElementById("item-container"), data.item_grid);
    createGrid(document.getElementById("key-container"), data.item_keys);
}

function createGrid(container, grid_data) {
    for (let i = 0; i < grid_data.length; ++i) {
        var cont = document.createElement('DIV');
        cont.classList.add("item-row");
        var sub = grid_data[i];
        for (let j = 0; j < sub.length; ++j) {
            let name = sub[j];
            if (name.startsWith("icon:")) {
                createItemIcon(cont, name.slice(5));
            } else {
                createItemButton(cont, name);
            }
        }
        container.appendChild(cont);
    }
}

function createItemButton(cont, name) {
    var el = document.createElement('DIV');
    el.id = name;
    el.classList.add("item");
    setVisual(el, 0);
    el.onclick = new Function('toggleItem('+name+')');
    el.oncontextmenu = new Function('untoggleItem('+name+')');
    itemGridEls.push(el);
    cont.appendChild(el);
}

function createItemIcon(cont, img) {
    var el = document.createElement('DIV');
    el.classList.add("icon");
    el.style.backgroundImage = "url('images/" + img + "')";
    cont.appendChild(el);
}

function toggleItem(el) {
    var val = savestate.read("items", el.id, 0);
    if (++val > data.items[el.id].max) {
        val = 0;
    }
    savestate.write("items", el.id, val);
    setVisual(el, val);
    updateMap();
    event.preventDefault();
    return false;
}

function untoggleItem(el) {
    var val = savestate.read("items", el.id, 0);
    if (--val < 0) {
        val = data.items[el.id].max;
    }
    savestate.write("items", el.id, val);
    setVisual(el, val);
    updateMap();
    event.preventDefault();
    return false;
}

function setVisual(el, val) {
    let id = el.id;
    if (val == 0) {
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
    setImage(el, val);
}

function setImage(el, val) {
    let id = el.id;
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
        let el = itemGridEls[i];
        setVisual(el, savestate.read("items", el.id, 0));
    }
}