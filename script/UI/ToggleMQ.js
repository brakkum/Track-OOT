function ToggleMQ(ref, cont) {

    var val = SaveState.read("mq", ref, false);

    var el = document.createElement('DIV');
    el.id = name;
    el.classList.add("text");
    el.innerHTML = val ? "MQ" : "V";
    el.onclick = toggleItem;
    cont.appendChild(el);

    this.update = function() {
        val = SaveState.read("mq", ref, false);
        el.innerHTML = val ? "MQ" : "V";
    }

    function toggleItem(ev) {
        val = !val;
        SaveState.write("mq", ref, val);
        el.innerHTML = val ? "MQ" : "V";
        reloadDungeonList();
        ev.preventDefault();
        return false;
    }

}