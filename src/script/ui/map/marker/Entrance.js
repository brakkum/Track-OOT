import GlobalData from "/script/storage/GlobalData.js";
import MemoryStorage from "/emcJS/storage/MemoryStorage.js";
import Template from "/emcJS/util/Template.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import Logger from "/emcJS/util/Logger.js";
import Dialog from "/emcJS/ui/Dialog.js";
import StateStorage from "/script/storage/StateStorage.js";
import ManagedEventBinder from "/script/util/ManagedEventBinder.js";
import Logic from "/script/util/Logic.js";
import I18n from "/script/util/I18n.js";

const EVENT_BINDER = new ManagedEventBinder("layout");
const TPL = new Template(`
    <style>
        :host {
            position: absolute;
            display: inline-flex;
            width: 48px;
            height: 48px;
            box-sizing: border-box;
            transform: translate(-24px, -24px);
        }
        :host(:hover) {
            z-index: 1000;
        }
        #marker {
            display: flex;
            justify-content: center;
            align-items: center;
            box-sizing: border-box;
            width: 100%;
            height: 100%;
            border: solid 4px black;
            border-radius: 25%;
            color: black;
            font-size: 30px;
            font-weight: bold;
            cursor: pointer;
        }
        .opened {
            background-color: var(--location-status-opened-color, #000000);
        }
        .available {
            background-color: var(--location-status-available-color, #000000);
        }
        .unavailable {
            background-color: var(--location-status-unavailable-color, #000000);
        }
        .possible {
            background-color: var(--location-status-possible-color, #000000);
        }
        #marker:hover {
            box-shadow: 0 0 2px 4px #67ffea;
        }
        #marker:hover + #tooltip {
            display: block;
        }
        #tooltip {
            padding: 5px 12px;
            -moz-user-select: none;
            user-select: none;
            white-space: nowrap;
            font-size: 30px;
        }
        #value,
        .textarea {
            display: flex;
            align-items: center;
            height: 46px;
        }
        #value:empty,
        .textarea:empty {
            display: none;
        }
        #text {
            display: inline-flex;
            align-items: center;
            -moz-user-select: none;
            user-select: none;
            white-space: nowrap;
        }
        #badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.1em;
            flex-shrink: 0;
            margin-left: 0.3em;
            border: 0.1em solid var(--navigation-background-color, #ffffff);
            border-radius: 0.3em;
        }
        #badge emc-icon {
            width: 30px;
            height: 30px;
        }
    </style>
    <div id="marker" class="unavailable"></div>
    <emc-tooltip position="top" id="tooltip">
        <div class="textarea">
            <div id="text"></div>
            <div id="badge">
                <emc-icon src="images/world/icons/entrance.svg"></emc-icon>
                <emc-icon id="badge-time" src="images/world/time/always.svg"></emc-icon>
                <emc-icon id="badge-era" src="images/world/era/none.svg"></emc-icon>
            </div>
        </div>
        <div id="value"></div>
    </emc-tooltip>
`);

function translate(value) {
    switch (value) {
        case 0b100: return "available";
        case 0b010: return "possible";
        case 0b001: return "unavailable";
        default: return "opened";
    }
}

function stateChanged(event) {
    EventBus.mute("entrance");
    let value = event.data[this.ref];
    if (typeof value == "undefined") {
        value = "";
    }
    this.value = value;
    EventBus.unmute("entrance");
}

function entranceUpdate(event) {
    if (this.ref === event.data.name && this.value !== event.data.value) {
        EventBus.mute("entrance");
        this.value = event.data.value;
        EventBus.unmute("entrance");
    }
}

export default class HTMLMarkerArea extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        this.addEventListener("click", () => {
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
        });
        this.addEventListener("contextmenu", () => {
            this.value = "";
            EventBus.trigger("entrance", {
                name: this.ref,
                value: ""
            });
        });
        /* event bus */
        EVENT_BINDER.register("state", stateChanged.bind(this));
        EVENT_BINDER.register(["settings", "logic"], event => this.update());
        EVENT_BINDER.register("entrance", entranceUpdate.bind(this));
    }

    async update() {
        if (!!this.value) {
            let val = await Logic.checkLogicList(this.value);
            this.shadowRoot.getElementById("marker").className = translate(val);
            if (val > 0b001) {
                this.shadowRoot.getElementById("marker").innerHTML = await Logic.getAccessibleNumber(this.value);
            } else {
                this.shadowRoot.getElementById("marker").innerHTML = "";
            }
        } else if (!!this.ref) {
            this.shadowRoot.getElementById("marker").innerHTML = "";
            if (Logic.getValue(this.access)) {
                this.shadowRoot.getElementById("marker").className = "available";
            } else {
                this.shadowRoot.getElementById("marker").className = "unavailable";
            }
        } else {
            this.shadowRoot.getElementById("marker").className = "unavailable";
            this.shadowRoot.getElementById("marker").innerHTML = "";
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

    get left() {
        return this.getAttribute('left');
    }

    set left(val) {
        this.setAttribute('left', val);
    }

    get top() {
        return this.getAttribute('top');
    }

    set top(val) {
        this.setAttribute('top', val);
    }

    static get observedAttributes() {
        return ['ref', 'value', 'era', 'time', 'access', 'left', 'top'];
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
            case 'top':
            case 'left':
                if (oldValue != newValue) {
                    this.style.left = `${this.left}px`;
                    this.style.top = `${this.top}px`;
                    let tooltip = this.shadowRoot.getElementById("tooltip");
                    if (this.left < 30) {
                        if (this.top < 30) {
                            tooltip = "bottomright";
                        } else if (this.top > 70) {
                            tooltip = "topright";
                        } else {
                            tooltip = "right";
                        }
                    } else if (this.left > 70) {
                        if (this.top < 30) {
                            tooltip = "bottomleft";
                        } else if (this.top > 70) {
                            tooltip = "topleft";
                        } else {
                            tooltip = "left";
                        }
                    } else {
                        if (this.top < 30) {
                            tooltip = "bottom";
                        } else {
                            tooltip = "top";
                        }
                    }
                }
            break;
        }
    }

}

customElements.define('ootrt-marker-entrance', HTMLMarkerArea);

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
            if (loc.type == type) {
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