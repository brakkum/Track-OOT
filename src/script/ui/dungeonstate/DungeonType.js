import GlobalData from "/emcJS/storage/GlobalData.js";
import Template from "/emcJS/util/Template.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import "/emcJS/ui/selection/Option.js";
import StateStorage from "/script/storage/StateStorage.js";
import ManagedEventBinder from "/script/util/ManagedEventBinder.js";

const EVENT_BINDER = new ManagedEventBinder("layout");
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
        :not([value]),
        [value]:not(.active) {
            display: none !important;
        }
        [value] {
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
    <emc-option value="n" style="background-image: url('images/dungeontype/undefined.svg')"></emc-option>
    <emc-option value="v" style="background-image: url('images/dungeontype/vanilla.svg')"></emc-option>
    <emc-option value="mq" style="background-image: url('images/dungeontype/masterquest.svg')"></emc-option>
`);

function stateChanged(event) {
    let value = event.data[`dungeonTypes.${this.ref}`];
    if (typeof value == "undefined" || value == "") {
        value = "v";
        if (!!this.ref) {
            let area = GlobalData.get(`world_lists/${newValue}/lists`);
            if (area.hasOwnProperty("mq")) {
                value = "n";
            }
        }
    }
    this.value = value;
}

function dungeonTypeUpdate(event){
    if (this.ref === event.data.name && this.value !== event.data.value) {
        this.value = event.data.value;
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
        EVENT_BINDER.register("state", stateChanged.bind(this));
        EVENT_BINDER.register("dungeontype", dungeonTypeUpdate.bind(this));
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
                    let value = "v";
                    let readonly = true;
                    if (!!newValue) {
                        let area = GlobalData.get(`world_lists/${newValue}/lists`);
                        if (area.hasOwnProperty("mq")) {
                            value = StateStorage.read(`dungeonTypes.${newValue}`, "n");
                            readonly = false;
                        }
                    }
                    this.value = value;
                    this.readonly = readonly;
                }
            break;
            case 'value':
                if (oldValue != newValue) {
                    let oe = this.shadowRoot.querySelector(`.active`);
                    if (!!oe) {
                        oe.classList.remove("active");
                    }
                    let ne = this.shadowRoot.querySelector(`[value="${newValue}"]`);
                    if (!!ne) {
                        ne.classList.add("active");
                    }
                }
            break;
        }
    }

    next(event) {
        if (!this.readonly) {
            if (this.value == 'v') {
                this.value = 'mq';
            } else {
                this.value = 'v';
            }
            StateStorage.write(`dungeonTypes.${this.ref}`, this.value);
            EventBus.trigger("dungeontype", {
                name: this.ref,
                value: this.value
            });
        }
        event.preventDefault();
        return false;
    }

    revert(event) {
        if (!this.readonly) {
            this.value = "n";
            StateStorage.write(`dungeonTypes.${this.ref}`, 'n');
            EventBus.trigger("dungeontype", {
                name: this.ref,
                value: 'n'
            });
        }
        event.preventDefault();
        return false;
    }

}

customElements.define('ootrt-dungeontype', HTMLTrackerDungeonType);