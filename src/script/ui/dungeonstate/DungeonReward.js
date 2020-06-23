import Template from "/emcJS/util/Template.js";
import EventBusSubsetMixin from "/emcJS/mixins/EventBusSubset.js";
import "/emcJS/ui/selection/Option.js";
import FileData from "/emcJS/storage/FileData.js";
import StateStorage from "/script/storage/StateStorage.js";

const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
        }
        :host {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            cursor: pointer;
        }
        slot {
            width: 100%;
            height: 100%;
        }
        ::slotted(:not([value])),
        ::slotted([value]:not(.active)) {
            display: none !important;
        }
        ::slotted([value]) {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            color: white;
            font-size: 1em;
            text-shadow: -1px 0 1px black, 0 1px 1px black, 1px 0 1px black, 0 -1px 1px black;
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            background-origin: content-box;
            flex-grow: 0;
            flex-shrink: 0;
            min-height: 0;
            white-space: normal;
            padding: 0;
            line-height: 0.7em;
        }
    </style>
    <slot>
    </slot>
`);

const REWARDS = [
    "item.stone_forest",
    "item.stone_fire",
    "item.stone_water",
    "item.medallion_forest",
    "item.medallion_fire",
    "item.medallion_water",
    "item.medallion_spirit",
    "item.medallion_shadow",
    "item.medallion_light"
];
const TAKEN_REWARDS = new Set();

function stateChanged(event) {
    let value = event.data[`dungeonRewards.${this.ref}`];
    if (value != null) {
        this.value = value;
    } else {
        this.value = "";
    }
}

function dungeonRewardUpdate(event){
    if (this.ref === event.data.name && this.value !== event.data.value) {
        this.value = event.data.value;
    }
}

class HTMLTrackerDungeonReward extends EventBusSubsetMixin(HTMLElement) {

    constructor() {
        super();
        this.addEventListener("click", this.next);
        this.addEventListener("contextmenu", this.revert);
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        /* event bus */
        this.registerGlobal("state", stateChanged.bind(this));
        this.registerGlobal("dungeonreward", dungeonRewardUpdate.bind(this));
    }

    connectedCallback() {
        super.connectedCallback();
        this.value = StateStorage.read(`dungeonRewards.${this.ref}`, "");
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

    static get observedAttributes() {
        return ['ref', 'value'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'ref':
                if (oldValue != newValue) {
                    if (newValue === "") {
                        this.innerHTML = "";
                    } else if (oldValue === null || oldValue === undefined || oldValue === "") {
                        this.append(createOption("", "/images/items/unknown.png"));
                        let items = FileData.get("items");
                        for (let i = 0; i < REWARDS.length; ++i) {
                            let name = REWARDS[i];
                            let j = items[name].images;
                            if (Array.isArray(j)) {
                                j = j[0];
                            }
                            this.append(createOption(name, j));
                        }
                        this.value = StateStorage.read(`dungeonRewards.${newValue}`, "");
                    }
                }
            break;
            case 'value':
                if (oldValue != newValue) {
                    let oe = this.querySelector(`.active`);
                    if (!!oe) {
                        oe.classList.remove("active");
                    }
                    let ne = this.querySelector(`[value="${newValue}"]`);
                    if (!!ne) {
                        ne.classList.add("active");
                    }
                    if (oldValue != "") {
                        TAKEN_REWARDS.delete(oldValue);
                    }
                    if (newValue != "") {
                        TAKEN_REWARDS.add(newValue);
                    }
                }
            break;
        }
    }

    next(ev) {
        let oldValue = this.value;
        let value = oldValue;
        let idx = REWARDS.indexOf(oldValue);
        while (true) {
            if (++idx >= REWARDS.length) {
                idx = 0;
            }
            value = REWARDS[idx];
            if (!TAKEN_REWARDS.has(value) || value == oldValue) {
                break;
            }
        }
        if (value != oldValue) {
            this.value = value;
            StateStorage.write(`dungeonRewards.${this.ref}`, value);
            this.triggerGlobal("dungeonreward", {
                name: this.ref,
                value: value
            });
        }
        ev.preventDefault();
        return false;
    }

    revert(ev) {
        if (this.value != "") {
            this.value = "";
            StateStorage.write(`dungeonRewards.${this.ref}`, "");
            this.triggerGlobal("dungeonreward", {
                name: this.ref,
                value: ""
            });
        }
        ev.preventDefault();
        return false;
    }

}

customElements.define('ootrt-dungeonreward', HTMLTrackerDungeonReward);

function createOption(value, img) {
    let opt = document.createElement('emc-option');
    opt.value = value;
    opt.style.backgroundImage = `url("${img}"`;
    return opt;
}