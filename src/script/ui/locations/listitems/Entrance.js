import GlobalData from "/script/storage/GlobalData.js";
import MemoryStorage from "/emcJS/storage/MemoryStorage.js";
import Template from "/emcJS/util/Template.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import Logger from "/emcJS/util/Logger.js";
import Helper from "/emcJS/util/Helper.js";
import Dialog from "/emcJS/ui/Dialog.js";
import "/emcJS/ui/ContextMenu.js";
import StateStorage from "/script/storage/StateStorage.js";
import ManagedEventBinder from "/script/util/ManagedEventBinder.js";
import Logic from "/script/util/Logic.js";
import I18n from "/script/util/I18n.js";

const EVENT_BINDER = new ManagedEventBinder("layout");
const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
        }
        :host {
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            width: 100%;
            cursor: pointer;
            padding: 5px;
        }
        :host(:hover) {
            background-color: var(--main-hover-color, #ffffff32);
        }
        .textarea {
            display: flex;
            align-items: center;
            justify-content: flex-start;
            width: 100%;
            min-height: 35px;
            word-break: break-word;
        }
        .textarea:empty {
            display: none;
        }
        #text {
            display: flex;
            flex: 1;
            color: #ffffff;
            align-items: center;
            -moz-user-select: none;
            user-select: none;
        }
        #text[data-state="available"] {
            color: var(--location-status-available-color, #000000);
        }
        #text[data-state="unavailable"] {
            color: var(--location-status-unavailable-color, #000000);
        }
        :host([value]:not([value=""])) #text {
            color: var(--location-status-opened-color, #000000);
        }
        #value[data-state="opened"] {
            color: var(--location-status-opened-color, #000000);
        }
        #value[data-state="available"] {
            color: var(--location-status-available-color, #000000);
        }
        #value[data-state="unavailable"] {
            color: var(--location-status-unavailable-color, #000000);
        }
        #value[data-state="possible"] {
            color: var(--location-status-possible-color, #000000);
        }
        #badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 2px;
            flex-shrink: 0;
            margin-left: 5px;
            border: 1px solid var(--navigation-background-color, #ffffff);
            border-radius: 2px;
        }
        #badge emc-icon {
            width: 25px;
            height: 25px;
        }
        .menu-tip {
            font-size: 0.7em;
            color: #777777;
            margin-left: 15px;
            float: right;
        }
    </style>
    <div class="textarea">
        <div id="text"></div>
        <div id="badge">
            <emc-icon src="images/world/icons/entrance.svg"></emc-icon>
            <emc-icon id="badge-time" src="images/world/time/always.svg"></emc-icon>
            <emc-icon id="badge-era" src="images/world/era/none.svg"></emc-icon>
        </div>
    </div>
    <div id="value" class="textarea">
    </div>
`);

function translate(value) {
    switch (value) {
        case 0b100: return "available";
        case 0b010: return "possible";
        case 0b001: return "unavailable";
        default: return "opened";
    }
}

export default class ListEntrance extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());

        /* mouse events */
        this.addEventListener("click", event => {
            if (!!this.value) {
                EventBus.trigger("location_change", {
                    name: this.value
                });
            } else {
                entranceDialog(this.ref).then(r => {
                    this.value = r;
                    EventBus.trigger("entrance", {
                        name: this.ref,
                        value: r
                    });
                });
            }
            event.preventDefault();
            return false;
        });
        this.addEventListener("contextmenu", event => {
            this.value = "";
            StateStorage.write(this.ref, "");
            EventBus.trigger("entrance", {
                name: this.ref,
                value: ""
            });
            event.preventDefault();
            return false;
        });

        /* event bus */
        EVENT_BINDER.register("state", event => {
            EventBus.mute("entrance");
            let value = event.data[this.ref];
            if (typeof value == "undefined") {
                value = "";
            }
            this.value = value;
            EventBus.unmute("entrance");
        });
        EVENT_BINDER.register(["settings", "logic"], event => {
            this.update()
        });
        EVENT_BINDER.register("entrance", event => {
            if (this.ref === event.data.name && this.value !== event.data.value) {
                EventBus.mute("entrance");
                this.value = event.data.value;
                EventBus.unmute("entrance");
            }
        });
    }

    async update() {
        if (!!this.value) {
            let val = await Logic.checkLogicList(this.value);
            this.shadowRoot.getElementById("value").dataset.state = translate(val);
            this.shadowRoot.getElementById("text").dataset.state = "unavailable";
        } else if (!!this.access && !!Logic.getValue(this.access)) {
            this.shadowRoot.getElementById("text").dataset.state = "available";
        } else {
            this.shadowRoot.getElementById("text").dataset.state = "unavailable";
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

    get era() {
        return this.getAttribute('era');
    }

    set era(val) {
        this.setAttribute('era', val);
    }

    get time() {
        return this.getAttribute('time');
    }

    set time(val) {
        this.setAttribute('time', val);
    }

    get access() {
        return this.getAttribute('access');
    }

    set access(val) {
        this.setAttribute('access', val);
    }

    static get observedAttributes() {
        return ['ref', 'value', 'era', 'time', 'access'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'ref':
                if (oldValue != newValue) {
                    let txt = this.shadowRoot.getElementById("text");
                    txt.innerHTML = I18n.translate(newValue);
                    this.value = StateStorage.read(newValue, "");
                    this.update();
                }
            break;
            case 'value':
                if (oldValue != newValue) {
                    if (!!newValue) {
                        this.shadowRoot.getElementById("value").innerHTML = I18n.translate(newValue);
                    } else {
                        this.shadowRoot.getElementById("value").innerHTML = "";
                    }
                    this.update();
                }
            break;
            case 'era':
                if (oldValue != newValue) {
                    let el_era = this.shadowRoot.getElementById("badge-era");
                    el_era.src = `images/world/era/${newValue}.svg`;
                }
            break;
            case 'time':
                if (oldValue != newValue) {
                    let el_time = this.shadowRoot.getElementById("badge-time");
                    el_time.src = `images/world/time/${newValue}.svg`;
                }
            break;
            case 'access':
                if (oldValue != newValue) {
                    this.update();
                }
            break;
        }
    }

}

customElements.define('ootrt-list-entrance', ListEntrance);

function entranceDialog(ref) {
    return new Promise(resolve => {
        let value = StateStorage.read(`entrance.${ref}`, "");
        let type = GlobalData.get(`world/entrances/${ref}/type`);
        let data = GlobalData.get('world/areas');
    
        let loc = document.createElement('label');
        loc.style.display = "flex";
        loc.style.justifyContent = "space-between";
        loc.style.alignItems = "center";
        loc.style.padding = "5px";
        loc.innerHTML = I18n.translate("location");
        let slt = document.createElement("select");

        for (let i in data) {
            let loc = data[i];
            if (loc.type == type && !!loc.use_entrance) {
                slt.append(createOption(i, I18n.translate(i)));
            }
        }
        slt.style.width = "200px";
        slt.value = value;
        loc.append(slt);
        
        let d = new Dialog({title: I18n.translate(ref), submit: true, cancel: true});
        d.onsubmit = function(ref, result) {
            if (!!result) {
                let res = slt.value;
                StateStorage.write(ref, res);
                resolve(res);
            } else {
                resolve(false);
            }
        }.bind(this, ref);
        d.append(loc);
        d.show();
    });
}

function createOption(value, content) {
    let opt = document.createElement('option');
    opt.value = value;
    opt.innerHTML = content;
    return opt;
}