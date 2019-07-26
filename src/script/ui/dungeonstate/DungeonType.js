import Template from "/deepJS/util/Template.js";
import EventBus from "/deepJS/util/EventBus/EventBus.js";
import "/deepJS/ui/selection/Option.js";
import TrackerLocalState from "/script/util/LocalState.js";

const EVENT_LISTENERS = new WeakMap();
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

function stateChanged(event) {
    EventBus.mute("dungeontype");
    let value = parseInt(event.data.dungeonTypes[this.ref]);
    if (typeof value == "undefined" || value == "") {
        value = "n";
    }
    this.value = value;
    EventBus.unmute("dungeontype");
}

function dungeonTypeUpdate(event){
    if (this.ref === event.data.name && this.value !== event.data.value) {
        EventBus.mute("dungeontype");
        this.value = event.data.value;
        EventBus.unmute("dungeontype");
    }
}

class HTMLTrackerDungeonType extends HTMLElement {

    constructor() {
        super();
        this.addEventListener("click", this.next);
        this.addEventListener("contextmenu", this.revert);
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        /* event bus */
        let events = new Map();
        events.set("state", stateChanged.bind(this));
        events.set("dungeontype", dungeonTypeUpdate.bind(this));
        EVENT_LISTENERS.set(this, events);
    }

    connectedCallback() {
        if (!this.value) {
            let all = this.querySelectorAll("[value]");
            if (!!all.length) {
                this.value = all[0].value;
            }
        }
        /* event bus */
        EVENT_LISTENERS.get(this).forEach(function(value, key) {
            EventBus.register(key, value);
        });
    }

    disconnectedCallback() {
        /* event bus */
        EVENT_LISTENERS.get(this).forEach(function(value, key) {
            EventBus.unregister(key, value);
        });
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
                        EventBus.mute("dungeontype");
                        this.value = "";
                        EventBus.unmute("dungeontype");
                    } else if (oldValue === null || oldValue === undefined || oldValue === "") {
                        this.append(createOption("n", "/images/type_undefined.svg"));
                        this.append(createOption("v", "/images/type_vanilla.svg"));
                        this.append(createOption("mq", "/images/type_masterquest.svg"));
                        EventBus.mute("dungeontype");
                        this.value = TrackerLocalState.read("dungeonTypes", newValue, "n");
                        EventBus.unmute("dungeontype");
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
                    TrackerLocalState.write("dungeonTypes", this.ref, newValue);
                    EventBus.trigger("dungeontype", {
                        name: this.ref,
                        value: newValue
                    });
                }
            break;
        }
    }

    next(ev) {
        let all = this.querySelectorAll("[value]");
        if (!!all.length) {
            let opt = this.querySelector(`[value="${this.value}"]`);
            if (!!opt) {
                if (!!opt.nextElementSibling) {
                    this.value = opt.nextElementSibling.getAttribute("value");
                } else {
                    this.value = all[1].getAttribute("value");
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

function createOption(value, img) {
    let opt = document.createElement('deep-option');
    opt.value = value;
    opt.style.backgroundImage = `url("${img}"`;
    return opt;
}