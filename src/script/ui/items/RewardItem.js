import FileData from "/emcJS/storage/FileData.js";
import Language from "/script/util/Language.js";
import Template from "/emcJS/util/Template.js";
import EventBusSubsetMixin from "/emcJS/mixins/EventBusSubset.js";
import "/emcJS/ui/input/Option.js";
import StateStorage from "/script/storage/StateStorage.js";

const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
            user-select: none;
        }
        :host {
            display: inline-flex;
            width: 40px;
            height: 40px;
            cursor: pointer;
            background-size: 80%;
            background-repeat: no-repeat;
            background-position: center;
            background-origin: border-box;
        }
        :host(:hover) {
            background-size: 100%;
        }
        :host([value="0"]) {
            filter: contrast(0.8) grayscale(0.5);
            opacity: 0.4;
        }
        #value {
            width: 100%;
            height: 100%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            padding: 2px;
            color: white;
            font-size: 0.8em;
            text-shadow: -1px 0 1px black, 0 1px 1px black, 1px 0 1px black, 0 -1px 1px black;
            flex-grow: 0;
            flex-shrink: 0;
            min-height: 0;
            white-space: normal;
            line-height: 0.7em;
            font-weight: bold;
            -moz-user-select: none;
            user-select: none;
        }
    </style>
    <div id="value">
    </div>
`);

const ALL_DUNGEONS = [
    'area/pocket',
    'area/deku',
    'area/dodongo',
    'area/jabujabu',
    'area/temple_forest',
    'area/temple_fire',
    'area/temple_shadow',
    'area/temple_water',
    'area/temple_spirit'
];

function getDisplayDungeon(reward, data) {
    for (let dungeon of ALL_DUNGEONS) {
        let rewardValue = StateStorage.readExtra("dungeonreward", dungeon, "");
        if (rewardValue == reward) {
            return dungeon;
        }
    }
    return "";
}

function getAlign(value) {
    switch (value) {
        case 'start':
            return "flex-start";
        case 'end':
            return "flex-end";
        default:
            return "center";
    }
}
    
function stateLoaded(event) {
    let value = parseInt(event.data.state[this.ref]);
    if (isNaN(value)) {
        value = 0;
    }
    this.value = value;
    /* dungeon */
    if (event.data.extra.dungeonreward != null) {
        for (let dungeon of ALL_DUNGEONS) {
            let rewardValue = event.data.extra.dungeonreward[dungeon];
            if (rewardValue == this.ref) {
                this.dungeon = dungeon;
                return;
            }
        }
    }
    this.dungeon = "";
}
    
function stateChanged(event) {
    const change = event.data[this.ref];
    if (change != null) {
        let value = parseInt(change.newValue);
        if (isNaN(value)) {
            value = 0;
        }
        this.value = value;
    }
}

function itemUpdate(event) {
    if (this.ref === event.data.name && this.value !== event.data.value) {
        let value = parseInt(event.data.value);
        if (typeof value == "undefined" || isNaN(value)) {
            value = 0;
        }
        this.value = value;
    }
}

function dungeonRewardUpdate(event) {
    const data = event.data[this.dungeon];
    if (data != null && data.newValue != this.ref) {
        this.dungeon = "";
    } else {
        for (const name in event.data) {
            if (this.ref == event.data[name].newValue) {
                this.dungeon = name;
                return;
            }
        }
    }
}

class HTMLTrackerRewardItem extends EventBusSubsetMixin(HTMLElement) {

    constructor() {
        super();
        this.addEventListener("click", this.next);
        this.addEventListener("contextmenu", this.prev);
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        /* event bus */
        this.registerGlobal("item", itemUpdate.bind(this));
        this.registerGlobal("state", stateLoaded.bind(this));
        this.registerGlobal("statechange", stateChanged.bind(this));
        this.registerGlobal("statechange_dungeonreward", dungeonRewardUpdate.bind(this));
    }

    connectedCallback() {
        super.connectedCallback();
        if (this.ref != null) {
            this.dungeon = getDisplayDungeon(this.ref);
        }
    }

    get ref() {
        return this.getAttribute('ref');
    }

    set ref(val) {
        this.setAttribute('ref', val);
    }

    get value() {
        return this.getAttribute('value');
    }

    set value(val) {
        this.setAttribute('value', val);
    }

    get readonly() {
        return this.getAttribute('readonly');
    }

    set readonly(val) {
        this.setAttribute('readonly', val);
    }

    get halign() {
        return this.getAttribute('halign');
    }

    set halign(val) {
        this.setAttribute('halign', val);
    }

    get valign() {
        return this.getAttribute('halign');
    }

    set valign(val) {
        this.setAttribute('valign', val);
    }

    get dungeon() {
        return this.getAttribute('dungeon');
    }

    set dungeon(val) {
        this.setAttribute('dungeon', val);
    }

    static get observedAttributes() {
        return ['ref', 'dungeon', 'halign', 'valign'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case 'ref':
                    let data = FileData.get("items")[newValue];
                    if (data.halign != null) {
                        this.halign = data.halign;
                    }
                    if (data.valign != null) {
                        this.valign = data.valign;
                    }
                    this.style.backgroundImage = `url("${data.images}")`;
                    this.value = StateStorage.read(this.ref, 0);
                    this.dungeon = getDisplayDungeon(this.ref);
                break;
                case 'dungeon':
                    let el = this.shadowRoot.getElementById("value");
                    if (newValue != "") {
                        el.innerHTML = Language.translate(`${newValue}.short`);
                    } else {
                        el.innerHTML = "";
                    }
                break;
                case 'halign':
                    this.shadowRoot.getElementById("value").style.justifyContent = getAlign(newValue);
                break;
                case 'valign':
                    this.shadowRoot.getElementById("value").style.alignItems = getAlign(newValue);
                break;
            }
        }
    }

    next(event) {
        if (!this.readonly) {
            this.value = 1;
            StateStorage.write(this.ref, 1);
            this.triggerGlobal("item", {
                name: this.ref,
                value: 1
            });
        }
        if (!event) return;
        event.preventDefault();
        return false;
    }

    prev(event) {
        if (!this.readonly) {
            this.value = 0;
            StateStorage.write(this.ref, 0);
            this.triggerGlobal("item", {
                name: this.ref,
                value: 0
            });
        }
        if (!event) return;
        event.preventDefault();
        return false;
    }

}

customElements.define('ootrt-rewarditem', HTMLTrackerRewardItem);