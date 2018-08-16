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
    var max = data.items[el.id].max;
    var val = savestate.read("items", el.id, 0);
    if (++val > max) {
        val = 0;
    }
    savestate.write("items", el.id, val);
    setVisual(el, val);
    updateMap();
}

function setVisual(el, val) {
    let id = el.id;
    // update counting
    if (data.items[el.id].type == "counting") {
        el.innerHTML = val;
    }
    // update (in-)active
    if (val == 0) {
        el.classList.add("item-inactive");
    } else {
        el.classList.remove("item-inactive");
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
        if (data.items[id].max > 1) {
            el.style.backgroundImage = "url('images/" + id + val + ".png')";
        } else {
            el.style.backgroundImage = "url('images/" + id + ".png')";
        }
    }
}

function updateItems() {
    for (var i = 0; i < itemGridEls.length; ++i) {
        let el = itemGridEls[i];
        setVisual(el, savestate.read("items", el.id, 0));
    }
}