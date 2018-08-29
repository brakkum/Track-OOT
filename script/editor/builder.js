function fillLogics() {
    var cont;
    cont = document.getElementById("chest-panel").querySelector('.panel-body');
    for (let i in data.chests) {
        var el = document.createElement("div");
        el.className = "list-item";
        el.innerHTML = translate(i);
        el.id = "chests_"+i;
        el.setAttribute("title", i);
        el.onclick = new Function("loadLogic('chests', '"+i+"')");
        if (data.logic_patched.hasOwnProperty('chests') && data.logic_patched.chests.hasOwnProperty(i))
            el.classList.add('has-custom-logic');
        cont.appendChild(el);
    }
    for (let i in data.dungeons) {
        var chests = data.dungeons[i].chests;
        for (let j = 0; j < chests.length; ++j) {
            var el = document.createElement("div");
            el.className = "list-item";
            el.innerHTML = translate(i) + ": " + translate(chests[j]);
            el.id = "chests_"+chests[j];
            el.setAttribute("title", chests[j]);
            el.onclick = new Function("loadLogic('chests', '"+chests[j]+"')");
            if (data.logic_patched.hasOwnProperty('chests') && data.logic_patched.chests.hasOwnProperty(chests[j]))
                el.classList.add('has-custom-logic');
            cont.appendChild(el);
        }
    }
    cont = document.getElementById("skulltula-panel").querySelector('.panel-body');
    for (let i in data.logic.skulltulas) {
        var el = document.createElement("div");
        el.className = "list-item";
        el.innerHTML = translate(i);
        el.id = "skulltulas_"+i;
        el.setAttribute("title", i);
        el.onclick = new Function("loadLogic('skulltulas', '"+i+"')");
        if (data.logic_patched.hasOwnProperty('skulltulas') && data.logic_patched.skulltulas.hasOwnProperty(i))
            el.classList.add('has-custom-logic');
        cont.appendChild(el);
    }
    cont = document.getElementById("dungeon-panel").querySelector('.panel-body');
    for (let i in data.logic.dungeons) {
        var el = document.createElement("div");
        el.className = "list-item";
        el.innerHTML = translate(i);
        el.id = "dungeons_"+i;
        el.setAttribute("title", i);
        el.onclick = new Function("loadLogic('dungeons', '"+i+"')");
        if (data.logic_patched.hasOwnProperty('dungeons') && data.logic_patched.dungeons.hasOwnProperty(i))
            el.classList.add('has-custom-logic');
        cont.appendChild(el);
    }
}

function fillItems() {
    var cont = document.getElementById("item-panel").querySelector('.panel-body');
    for (let i in data.items) {
        var el = document.createElement("div");
        el.className = "logic-item";
        el.id = "item_" + i;
        el.innerHTML = translate(i);
        el.setAttribute("title", i);
        el.setAttribute("draggable", true);
        el.ondragstart = dragNewElement;
        cont.appendChild(el);
    }
}

function fillMixins() {
    var cont = document.getElementById("mixin-panel").querySelector('.panel-body');
    for (let i in data.logic.mixins) {
        var el = document.createElement("div");
        el.className = "logic-mixin";
        el.id = "mixin_" + i;
        el.innerHTML = translate(i);
        el.setAttribute("title", i);
        el.setAttribute("draggable", true);
        el.ondragstart = dragNewElement;
        cont.appendChild(el);
    }
}

function fillSettings() {
    var cont = document.getElementById("settings-panel").querySelector('.panel-body');
    for (let i in data.settings) {
        var el = document.createElement("div");
        el.className = "logic-setting";
        el.id = "setting_" + i;
        el.innerHTML = translate(i);
        el.setAttribute("title", i);
        el.setAttribute("draggable", true);
        el.ondragstart = dragNewElement;
        cont.appendChild(el);
    }
}