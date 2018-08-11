var itemGridEls = [];

function createItemTracker() {
    var container = document.getElementById("item-container");
    for (let i = 0; i < data.item_grid.length; ++i) {
        var cont = document.createElement('DIV');
        cont.classList.add("item-row");
        var sub = data.item_grid[i];
        for (let j = 0; j < sub.length; ++j) {
            var name = sub[j];
            var el = document.createElement('DIV');
            el.id = name;
            el.classList.add("item");
            setImage(el);
            el.addEventListener("click", addItemWrapper(el, name));
            itemGridEls.push(el);
            cont.appendChild(el);
        }
        container.appendChild(cont);
    }
}

function addItemWrapper(el) {
    var max = data.items[el.id].max;
    return function() {
        if (++savestate.items[el.id] > max) {
            savestate.items[el.id] = 0;
        }
        setImage(el);
        updateMap();
    }
}

function setImage(el) {
    if (data.items[el.id].max > 1) {
        el.style.backgroundImage = "url('images/"+el.id+(savestate.items[el.id]||0)+".png')";
    } else {
        el.style.backgroundImage = "url('images/"+el.id+".png')";
    }
    if ((savestate.items[el.id]||0) == 0) {
        el.classList.add("item-inactive");
    } else {
        el.classList.remove("item-inactive");
    }
}

function updateItems() {
    for (var i = 0; i < itemGridEls.length; ++i) {
        setImage(itemGridEls[i], itemGridEls[i].id);
    }
}