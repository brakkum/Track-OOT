function Item(name, cont) {

    var ref = data.items[name];
    var val = SaveState.read("items", name, 0);

    var el = document.createElement('DIV');
    el.id = name;
    el.classList.add("item");
    setVisual(el, 0);
    el.onclick = toggleItem;
    el.oncontextmenu = untoggleItem;
    itemGridEls.push(el);
    cont.appendChild(el);

    this.update = function() {
        val = SaveState.read("items", name, 0);
        setVisual();
    }

    function toggleItem(ev) {
        var m = ref.max;
        if (ref.hasOwnProperty("related_dungeon")) {
            if (!!SaveState.read("mq", ref.related_dungeon, false)) {
                m = ref.maxmq || m;
            }
        }
        if (val < m) {
            SaveState.write("items", name, ++val);
            setVisual(el, val);
            updateMap();
        }
        ev.preventDefault();
        return false;
    }
    
    function untoggleItem(ev) {
        var val = SaveState.read("items", name, 0);
        if (val > 0) {
            SaveState.write("items", name, --val);
            setVisual(el, val);
            updateMap();
        }
        ev.preventDefault();
        return false;
    }

    function setVisual() {
        if (!ref.always_active && val == 0) {
            el.classList.add("item-inactive");
        } else {
            el.classList.remove("item-inactive");
        }
        if (!!data.items[el.id].counting) {
            if (Array.isArray(data.items[name].counting)) {
                el.innerHTML = data.items[name].counting[val];
            } else {
                if (val == 0) {
                    el.innerHTML = "";
                } else {
                    el.innerHTML = val;
                }
            }
        }
        setImage();
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
    
    function setImage() {
        if (data.items[name].hasOwnProperty("images")) {
            let imgs = data.items[name].images;
            if (Array.isArray(imgs)) {
                el.style.backgroundImage = "url('images/" + imgs[val]+ "')";
            } else if (typeof imgs == "string") {
                el.style.backgroundImage = "url('images/" + imgs + "')";
            }
        }
    }

}