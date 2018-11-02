function ToggleReward(ref, cont) {

    var rewards = [
        false,
        "stone_forest",
        "stone_fire",
        "stone_water",
        "medallion_forest",
        "medallion_fire",
        "medallion_water",
        "medallion_spirit",
        "medallion_shadow",
        "medallion_light"
    ];
    var val = 0;

    var el = document.createElement('DIV');
    el.id = name;
    el.classList.add("switch");
    el.onclick = toggleItem;
    el.oncontextmenu = untoggleItem;
    cont.appendChild(el);

    this.update = function() {
        val = SaveState.read("rewards", ref, 0);
        el.innerHTML = val ? "" : "?";
        el.style.backgroundImage = val ? "url('images/" + data.items[rewards[val]].images + "')" : "";
    }

    function toggleItem(ev) {
        if (++val >= rewards.length) val = 1;
        SaveState.write("rewards", ref, val);
        el.innerHTML = "";
        el.style.backgroundImage = "url('images/" + data.items[rewards[val]].images + "')";
        ev.preventDefault();
        return false;
    }
    
    function untoggleItem(ev) {
        val = 0;
        SaveState.write("rewards", ref, val);
        el.innerHTML = "?";
        el.style.backgroundImage = "";
        ev.preventDefault();
        return false;
    }

    this.update();

}