import Template from "/emcJS/util/Template.js";
import FileData from "/emcJS/storage/FileData.js";
import Language from "/script/util/Language.js";
import Panel from "/emcJS/ui/layout/Panel.js";
import "./DungeonReward.js";
import "./DungeonType.js";

const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
            cursor: default;
        }
        :host {
            display: flex;
            flex-direction: row;
            min-width: min-content;
            min-height: min-content;
        }
        :host([orientation="column"]) {
            flex-direction: column;
        }
        div.item-row {
            display: flex;
            flex-direction: column;
        }
        div.item-row:hover {
            background-color: var(--main-hover-color, #ffffff32);
        }
        :host([orientation="column"]) div.item-row {
            flex-direction: row;
        }
        ootrt-item {
            display: block;
            padding: 2px;
        }
        ootrt-dungeonreward,
        ootrt-dungeontype {
            display: block;
            padding: 5px;
        }
        ootrt-dungeonreward:hover,
        ootrt-dungeontype:hover {
            padding: 2px;
        }
        div.text {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 20px;
            padding: 2px;
            font-size: 1em;
            -moz-user-select: none;
            user-select: none;
        }
        :host([orientation="column"]) div.text {
            height: 40px;
        }
        div.placeholder {
            width: 40px;
            height: 40px;
        }
        div.placeholder.inactive,
        div.item-row.inactive,
        ootrt-item.inactive,
        ootrt-dungeonreward.inactive,
        ootrt-dungeontype.inactive {
            display: none;
        }
    </style>
`);

function createItemText(text) {
    let el = document.createElement('DIV');
    el.classList.add("text");
    el.innerHTML = text;
    return el;
}

function createItemPlaceholder() {
    let el = document.createElement('DIV');
    el.classList.add("placeholder");
    return el;
}

class HTMLTrackerDungeonState extends Panel {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());

        let data = FileData.get("dungeonstate/entries");
        for (let i = 0; i < data.length; ++i) {
            this.shadowRoot.append(createRow(data[i]));
        }
        switchActive.call(this, this.active);
    }

    connectedCallback() {
        this.setAttribute("data-fontmod", "items");
    }

    get active() {
        return this.getAttribute('active');
    }

    set active(val) {
        this.setAttribute('active', val);
    }

    get orientation() {
        return this.getAttribute('orientation');
    }

    set orientation(val) {
        this.setAttribute('orientation', val);
    }

    static get observedAttributes() {
        return ['active'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'active':
                if (oldValue != newValue) {
                    switchActive.call(this, newValue);
                }
            break;
        }
    }

}

Panel.registerReference("dungeon-status", HTMLTrackerDungeonState);
customElements.define('ootrt-dungeonstate', HTMLTrackerDungeonState);

function switchActive(value) {
    if (typeof value === "string") {
        value = value.split(/,\s*/);
    } else {
        value = [];
    }
    this.shadowRoot.querySelectorAll("[type]").forEach(j => {
        j.classList.add("inactive");
    });
    value.forEach(i => {
        if (!i) return;
        this.shadowRoot.querySelectorAll(`[type~=${i}]`).forEach(j => {
            j.classList.remove("inactive");
        });
    });
}

function createRow(data) {

    let el = document.createElement('DIV');
    el.classList.add("item-row");
    el.classList.add("inactive");
    let types = [];

    //////////////////////////////////
    // title
    let title = createItemText(data.title);
    title.style.color = data.color;
    el.append(title);
    //////////////////////////////////
    // small key
    if (!!data.keys) {
        let itm = document.createElement('ootrt-itemkey');
        itm.classList.add("inactive");
        itm.setAttribute("type", "key");
        types.push("key");
        itm.setAttribute('ref', data.keys);
        itm.title = Language.translate(data.keys);
        el.append(itm);
    } else {
        let itm = createItemPlaceholder();
        itm.classList.add("inactive");
        itm.setAttribute("type", "key");
        el.append(itm);
    }
    //////////////////////////////////
    // boss key
    if (!!data.bosskey) {
        let itm = document.createElement('ootrt-item');
        itm.classList.add("inactive");
        itm.setAttribute("type", "bosskey");
        types.push("bosskey");
        itm.setAttribute('ref', data.bosskey);
        itm.title = Language.translate(data.bosskey);
        el.append(itm);
    } else {
        let itm = createItemPlaceholder();
        itm.classList.add("inactive");
        itm.setAttribute("type", "bosskey");
        el.append(itm);
    }
    //////////////////////////////////
    // map
    if (!!data.map) {
        let itm = document.createElement('ootrt-item');
        itm.classList.add("inactive");
        itm.setAttribute("type", "map");
        types.push("map");
        itm.setAttribute('ref', data.map);
        itm.title = Language.translate(data.map);
        el.append(itm);
    } else {
        let itm = createItemPlaceholder();
        itm.classList.add("inactive");
        itm.setAttribute("type", "map");
        el.append(itm);
    }
    //////////////////////////////////
    // compass
    if (!!data.compass) {
        let itm = document.createElement('ootrt-item');
        itm.classList.add("inactive");
        itm.setAttribute("type", "compass");
        types.push("compass");
        itm.setAttribute('ref', data.compass);
        itm.title = Language.translate(data.compass);
        el.append(itm);
    } else {
        let itm = createItemPlaceholder();
        itm.classList.add("inactive");
        itm.setAttribute("type", "compass");
        el.append(itm);
    }
    //////////////////////////////////
    // reward
    if (!!data.boss_reward) {
        let itm = document.createElement('ootrt-dungeonreward');
        itm.classList.add("inactive");
        itm.setAttribute("type", "reward");
        types.push("reward");
        itm.setAttribute('ref', data.ref);
        itm.title = Language.translate(data.ref) + " " + Language.translate("dun_reward");
        el.append(itm);
    } else {
        let itm = createItemPlaceholder();
        itm.classList.add("inactive");
        itm.setAttribute("type", "reward");
        el.append(itm);
    }
    //////////////////////////////////
    // mode
    if (!!data.hasmq) {
        let itm = document.createElement('ootrt-dungeontype');
        itm.classList.add("inactive");
        itm.setAttribute("type", "type");
        types.push("type");
        itm.setAttribute('ref', data.ref);
        itm.title = Language.translate(data.ref) + " " + Language.translate("dun_type");
        el.append(itm);
    } else {
        let itm = createItemPlaceholder();
        itm.classList.add("inactive");
        itm.setAttribute("type", "type");
        el.append(itm);
    }

    el.setAttribute("type", types.join(' '));

    return el;

}