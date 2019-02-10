import GlobalData from "/deepJS/storage/GlobalData.mjs";
import Template from "/deepJS/util/Template.mjs";
import EventBus from "/deepJS/util/EventBus.mjs";
import {createOption} from "/deepJS/ui/UIHelper.mjs";
import TrackerLocalState from "/script/util/LocalState.mjs";

const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
        }
        :host {
            display: inline-block;
            width: 40px;
            height: 40px;
            cursor: pointer;
        }
        slot {
            width: 100%;
            height: 100%;
        }
        ::slotted(option) {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            color: white;
            overflow: hidden;
            font-size: 1em;
            text-shadow: -1px 0 1px black, 0 1px 1px black, 1px 0 1px black, 0 -1px 1px black;
            background-size: 80% auto;
            background-repeat: no-repeat;
            background-position: center;
            background-origin: content-box;
        }
        ::slotted(option:hover) {
            background-size: contain;
            font-size: 1.2em;
        }
    </style>
    <slot name="value">
    </slot>
`);

const REWARDS = [
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

function updateCall() {
    this.value = TrackerLocalState.read("dungeonRewards", this.ref, 0);
}

class HTMLTrackerDungeonReward extends HTMLElement {

    constructor() {
        super();
        this.addEventListener("click", this.next);
        this.addEventListener("contextmenu", this.revert);
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(TPL.generate());
        EventBus.on("global-update", updateCall.bind(this));
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
                        this.appendChild(createOption(0, "", {
                            backgroundImage: `url("/images/unknown.svg")`
                        }));
                        for (let i = 0; i < REWARDS.length; ++i) {
                            let j = GlobalData.get("items")[REWARDS[i]].images;
                            if (Array.isArray(j)) {
                                j = j[0];
                            }
                            this.appendChild(createOption(i+1, "", {
                                backgroundImage: `url("/images/${j}")`
                            }));
                        }
                        this.value = TrackerLocalState.read("dungeonRewards", newValue, 0);
                    }
                }
            break;
            case 'value':
                if (oldValue != newValue) {
                    let ol = this.querySelector(`option[value="${oldValue}"]`);
                    if (!!ol) {
                        ol.removeAttribute("slot");
                    }
                    let nl = this.querySelector(`option[value="${newValue}"]`);
                    if (!!nl) {
                        nl.setAttribute("slot", "value");
                    }
                    TrackerLocalState.write("dungeonRewards", this.ref, newValue);
                    EventBus.post("dungeon-reward-update", this.ref, newValue);
                }
            break;
        }
    }

    next(ev) {
        let all = this.querySelectorAll("option");
        if (!!all.length) {
            let opt = this.querySelector(`option[value="${this.value}"]`);
            if (!!opt) {
                if (!!opt.nextElementSibling) {
                    this.value = opt.nextElementSibling.value;
                } else {
                    this.value = all[1].value;
                }
            }
        }
        ev.preventDefault();
        return false;
    }

    revert(ev) {
        this.value = 0;
        ev.preventDefault();
        return false;
    }

}

customElements.define('ootrt-dungeonreward', HTMLTrackerDungeonReward);