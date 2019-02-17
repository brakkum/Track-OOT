import GlobalData from "/deepJS/storage/GlobalData.mjs";
import Template from "/deepJS/util/Template.mjs";
import I18n from "/script/util/I18n.mjs";
import "./DungeonReward.mjs";
import "./DungeonType.mjs";

const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
        }
        :host {
            display: inline-flex;
            flex-direction: row;
        }
        :host([orientation="column"]) {
            flex-direction: column;
        }
        div.item-row {
            display: flex;
            flex-direction: column;
        }
        div.item-row:hover {
            background-color: var(--dungeon-status-hover-color, #ffffff32);
        }
        :host([orientation="column"]) div.item-row {
            flex-direction: row;
        }
        ootrt-item {
            display: block;
            padding: 5px;
        }
        ootrt-item:hover {
            padding: 2px;
        }
        div.text {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 20px;
            padding: 2px;
            font-size: 0.8em;
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
    var el = document.createElement('DIV');
    el.classList.add("text");
    el.innerHTML = text;
    return el;
}

function createItemPlaceholder() {
    var el = document.createElement('DIV');
    el.classList.add("placeholder");
    return el;
}

class HTMLTrackerDungeonState extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(TPL.generate());

        let data = GlobalData.get("grids")["dungeons"];
        for (let i = 0; i < data.length; ++i) {
            this.shadowRoot.appendChild(createRow(data[i]));
        }

        switchActive.call(this, "", this.active);
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

customElements.define('ootrt-dungeonstate', HTMLTrackerDungeonState);

function switchActive(value) {
    if (typeof value === "string") {
        value = value.split(" ");
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
    el.appendChild(title);
    //////////////////////////////////
    // small key
    if (!!data.keys) {
        let itm = document.createElement('ootrt-item');
        itm.classList.add("inactive");
        itm.setAttribute("type", "key");
        types.push("key");
        itm.setAttribute('ref', data.keys);
        itm.title = I18n.translate(data.keys);
        el.appendChild(itm);
    } else {
        let itm = createItemPlaceholder();
        itm.classList.add("inactive");
        itm.setAttribute("type", "key");
        el.appendChild(itm);
    }
    //////////////////////////////////
    // boss key
    if (!!data.bosskey) {
        let itm = document.createElement('ootrt-item');
        itm.classList.add("inactive");
        itm.setAttribute("type", "bosskey");
        types.push("bosskey");
        itm.setAttribute('ref', data.bosskey);
        itm.title = I18n.translate(data.bosskey);
        el.appendChild(itm);
    } else {
        let itm = createItemPlaceholder();
        itm.classList.add("inactive");
        itm.setAttribute("type", "bosskey");
        el.appendChild(itm);
    }
    //////////////////////////////////
    // map
    if (!!data.map) {
        let itm = document.createElement('ootrt-item');
        itm.classList.add("inactive");
        itm.setAttribute("type", "map");
        types.push("map");
        itm.setAttribute('ref', data.map);
        itm.title = I18n.translate(data.map);
        el.appendChild(itm);
    } else {
        let itm = createItemPlaceholder();
        itm.classList.add("inactive");
        itm.setAttribute("type", "map");
        el.appendChild(itm);
    }
    //////////////////////////////////
    // compass
    if (!!data.compass) {
        let itm = document.createElement('ootrt-item');
        itm.classList.add("inactive");
        itm.setAttribute("type", "compass");
        types.push("compass");
        itm.setAttribute('ref', data.compass);
        itm.title = I18n.translate(data.compass);
        el.appendChild(itm);
    } else {
        let itm = createItemPlaceholder();
        itm.classList.add("inactive");
        itm.setAttribute("type", "compass");
        el.appendChild(itm);
    }
    //////////////////////////////////
    // reward
    if (!!data.boss_reward) {
        let itm = document.createElement('ootrt-dungeonreward');
        itm.classList.add("inactive");
        itm.setAttribute("type", "reward");
        types.push("reward");
        itm.setAttribute('ref', data.ref);
        itm.title = I18n.translate(data.ref) + I18n.translate("dun_reward");
        el.appendChild(itm);
    } else {
        let itm = createItemPlaceholder();
        itm.classList.add("inactive");
        itm.setAttribute("type", "reward");
        el.appendChild(itm);
    }
    //////////////////////////////////
    // mode
    if (!!data.hasmq) {
        let itm = document.createElement('ootrt-dungeontype');
        itm.classList.add("inactive");
        itm.setAttribute("type", "type");
        types.push("type");
        itm.setAttribute('ref', data.ref);
        itm.title = I18n.translate(data.ref) + I18n.translate("dun_type");
        el.appendChild(itm);
    } else {
        let itm = createItemPlaceholder();
        itm.classList.add("inactive");
        itm.setAttribute("type", "type");
        el.appendChild(itm);
    }

    el.setAttribute("type", types.join(' '));

    return el;

}