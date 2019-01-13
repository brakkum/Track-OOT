import GlobalData from "deepJS/storage/GlobalData.mjs";
import Template from "deepJS/util/Template.mjs";
import EventBus from "deepJS/util/EventBus.mjs";
import {createOption} from "deepJS/ui/UIHelper.mjs";
import TrackerLocalState from "util/LocalState.mjs";

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

function updateCall() {
    this.value = TrackerLocalState.read("dungeonTypes", this.ref, "n");
}

function dungeonTypeUppdate(ref, value){
    if (this.ref === ref && this.value !== value) {
        EventBus.mute("dungeon-type-update");
        this.value = value;
        EventBus.unmute("dungeon-type-update");
    }
}

class HTMLTrackerDungeonType extends HTMLElement {

    constructor() {
        super();
        this.addEventListener("click", this.next);
        this.addEventListener("contextmenu", this.revert);
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(TPL.generate());
        EventBus.on("global-update", updateCall.bind(this));
        EventBus.on("dungeon-type-update", dungeonTypeUppdate.bind(this));
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
                        EventBus.mute("dungeon-type-update");
                        this.value = "";
                        EventBus.unmute("dungeon-type-update");
                    } else if (oldValue === null || oldValue === undefined || oldValue === "") {
                        this.appendChild(createOption("n", "N"));
                        this.appendChild(createOption("v", "V"));
                        this.appendChild(createOption("mq", "MQ"));
                        EventBus.mute("dungeon-type-update");
                        this.value = TrackerLocalState.read("dungeonTypes", newValue, "n");
                        EventBus.unmute("dungeon-type-update");
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
                    TrackerLocalState.write("dungeonTypes", this.ref, newValue);
                    EventBus.post("dungeon-type-update", this.ref, newValue);
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
        this.value = "n";
        ev.preventDefault();
        return false;
    }

}

customElements.define('ootrt-dungeontype', HTMLTrackerDungeonType);