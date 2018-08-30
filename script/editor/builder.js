function createListItem(category, id) {
    var el = document.createElement("div");
    el.className = "list-item";
    el.innerHTML = translate(id);
    el.id = category+"_"+id;
    el.setAttribute("title", id);
    el.onclick = new Function("loadLogic('"+category+"', '"+id+"')");
    if (data.logic_patched.hasOwnProperty(category) && data.logic_patched[category].hasOwnProperty(id))
        el.classList.add('has-custom-logic');
    return el;
}

function createElement(category, id) {
    var el = document.createElement("div");
    el.className = "logic-element logic-"+category;
    el.id = category+"_"+id;
    el.innerHTML = translate(id);
    el.setAttribute("title", id);
    el.setAttribute("draggable", true);
    el.ondragstart = dragNewElement;
    return el;
}

function createOption(category, id, val) {
    var el = createElement(category, id);
    if (val.type == "choice") {
        el.classList.add("logic-choice");
        var sel = document.createElement("select");
        sel.setAttribute("disabled", "true");
        for (let i in val.values) {
            var opt = document.createElement("option");
            opt.innerHTML = val.values[i];
            sel.appendChild(opt);
        }
        sel.value = val.default;
        el.appendChild(sel);
    }
    return el;
}

function fillEditor() {
    for (let i in data.chests) {
        chest_panel.appendChild(createListItem("chests", i));
    }
    for (let i in data.skulltulas) {
        skulltula_panel.appendChild(createListItem("skulltulas", i));
    }
    for (let i in data.dungeons) {
        dungeon_panel.appendChild(createListItem("dungeons", i));
        var chests = data.dungeons[i].chests;
        var skulltulas = data.dungeons[i].skulltulas;
        for (let j = 0; j < chests.length; ++j) {
            var el = createListItem("chests", chests[j]);
            el.innerHTML = translate(i) + ": " + el.innerHTML;
            chest_panel.appendChild(el);
        }
        for (let j = 0; j < skulltulas.length; ++j) {
            var el = createListItem("skulltulas", skulltulas[j]);
            el.innerHTML = translate(i) + ": " + el.innerHTML;
            skulltula_panel.appendChild(el);
        }
    }
    for (let i in data.logic.mixins) {
        mixins_panel.insertBefore(createListItem("mixins", i), create_mixin_button);
        mixin_panel.appendChild(createElement("mixin", i));
    }
    for (let i in data.logic_patched.mixins) {
        if (typeof data.logic.mixins[i] == "undefined") {
            var el = document.createElement("div");
            el.className = "list-item";
            el.innerHTML = translate(i);
            el.id = "mixins_"+i;
            el.setAttribute("title", i);
            el.onclick = new Function("loadLogic('mixins', '"+i+"')");
            el.classList.add('has-new-logic');
            mixins_panel.insertBefore(el, create_mixin_button);
            
            mixin_panel.appendChild(createElement("mixin", i));
        }
    }
    for (let i in data.items) {
        item_panel.appendChild(createElement("item", i));
    }
    for (let i in data.rom_options.settings) {
        settings_panel.appendChild(createOption("setting", i, data.rom_options.settings[i]));
    }
    for (let i in data.rom_options.skips) {
        skips_panel.appendChild(createOption("skip", i, data.rom_options.skips[i]));
    }
}