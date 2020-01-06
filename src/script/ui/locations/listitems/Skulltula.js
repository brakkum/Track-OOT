import GlobalData from "/script/storage/GlobalData.js";
import Template from "/deepJS/util/Template.js";
import AbstractElement from "/deepJS/util/logic/elements/AbstractElement.js";
import EventBus from "/deepJS/util/events/EventBus.js";
import Logger from "/deepJS/util/Logger.js";
import Helper from "/deepJS/util/Helper.js";
import Dialog from "/deepJS/ui/Dialog.js";
import "/deepJS/ui/ContextMenu.js";
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
            align-items: center;
            width: 100%;
            cursor: pointer;
            padding: 5px;
        }
        :host(:hover) {
            background-color: var(--main-hover-color, #ffffff32);
        }
        #text {
            flex: 1;
            color: var(--location-status-unavailable-color, #000000);
        }
        #text.avail {
            color: var(--location-status-available-color, #000000);
        }
        :host([checked="true"]) #text {
            color: var(--location-status-opened-color, #000000);
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
        #badge deep-icon {
            width: 20px;
            height: 20px;
        }
        .menu-tip {
            font-size: 0.7em;
            color: #777777;
            margin-left: 15px;
            float: right;
        }
    </style>
    <div id="text"></div>
    <div id="badge">
        <deep-icon src="images/skulltula.svg"></deep-icon>
        <deep-icon id="badge-time" src="images/time_always.svg"></deep-icon>
        <deep-icon id="badge-era" src="images/era_none.svg"></deep-icon>
    </div>
    <deep-contextmenu id="menu">
        <div id="menu-check" class="item">Check<span class="menu-tip">(leftclick)</span></div>
        <div id="menu-uncheck" class="item">Uncheck<span class="menu-tip">(ctrl + rightclick)</span></div>
        <div class="splitter"></div>
        <div id="menu-logic" class="item">Show Logic</div>
        <div id="menu-logic-image" class="item">Create Logic Image</div>
    </deep-contextmenu>
`);

function locationUpdate(event) {
    if (this.ref === event.data.name && this.checked !== event.data.value) {
        EventBus.mute("skulltula");
        this.checked = event.data.value;
        EventBus.unmute("skulltula");
    }
}

function stateChanged(event) {
    EventBus.mute("skulltula");
    let value = !!event.data[this.ref];
    if (typeof value == "undefined") {
        value = false;
    }
    this.checked = value;
    EventBus.unmute("skulltula");
}

function logicUpdate(event) {
    if (event.data.hasOwnProperty(this.access)) {
        let el = this.shadowRoot.getElementById("text");
        el.classList.toggle("avail", !!event.data[this.access]);
    }
}

function showLogic(ref, title) {
    let l = Logic.getLogicView(ref);
    if (!!l) {
        let d = new Dialog({
            title: I18n.translate(title),
            submit: "OK"
        });
        d.value = ref;
        d.append(l);
        d.show();
    }
}

async function printLogic(ref) {
    let svg = Logic.getLogicSVG(ref);
    let png = await Helper.svg2png(svg);
    let svg_win = window.open("", "_blank", "menubar=no,location=no,resizable=yes,scrollbars=yes,status=no");
    let img = document.createElement("img");
    img.src = png;
    svg_win.document.body.append(img);
}

function click(event) {
    this.check();
    event.preventDefault();
    return false;
}

function unclick(event) {
    this.uncheck();
    event.preventDefault();
    return false;
}

function contextMenu(event) {
    if (event.ctrlKey) {
        this.uncheck();
    } else {
        this.shadowRoot.getElementById("menu").show(event.clientX, event.clientY);
    }
    event.preventDefault();
    return false;
}

class HTMLTrackerSkulltula extends HTMLElement {

    constructor() {
        super();
        this.addEventListener("click", click.bind(this));
        this.addEventListener("contextmenu", contextMenu.bind(this));
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        this.visible = function (){return true};
        /* context menu */
        this.shadowRoot.getElementById("menu-check").addEventListener("click", click.bind(this));
        this.shadowRoot.getElementById("menu-uncheck").addEventListener("click", unclick.bind(this));
        this.shadowRoot.getElementById("menu-logic").addEventListener("click", function(event) {
            showLogic(this.access, this.ref);
        }.bind(this));
        this.shadowRoot.getElementById("menu-logic-image").addEventListener("click", function(event) {
            printLogic(this.access);
        }.bind(this));
        /* event bus */
        EVENT_BINDER.register("skulltula", locationUpdate.bind(this));
        EVENT_BINDER.register("state", stateChanged.bind(this));
        EVENT_BINDER.register("logic", logicUpdate.bind(this));
    }

    get ref() {
        return this.getAttribute('ref');
    }

    set ref(val) {
        this.setAttribute('ref', val);
    }

    get checked() {
        return this.getAttribute('checked');
    }

    set checked(val) {
        this.setAttribute('checked', val);
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
        return ['ref', 'checked', 'era', 'time', 'access'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'ref':
                if (oldValue != newValue) {
                    let txt = this.shadowRoot.getElementById("text");
                    txt.innerHTML = I18n.translate(this.ref);
                    this.checked = StateStorage.read(this.ref, false);
                }
            break;
            case 'checked':
                if (oldValue != newValue) {
                    if (!newValue || newValue === "false") {
                        let el = this.shadowRoot.getElementById("text");
                        el.classList.toggle("avail", Logic.getValue(this.access));
                    }
                    StateStorage.write(this.ref, newValue === "false" ? false : !!newValue);
                    EventBus.trigger("skulltula", {
                        name: this.ref,
                        value: newValue
                    });
                }
            break;
            case 'era':
                if (oldValue != newValue) {
                    let el_era = this.shadowRoot.getElementById("badge-era");
                    el_era.src = `images/era_${newValue}.svg`;
                }
            break;
            case 'time':
                if (oldValue != newValue) {
                    let el_time = this.shadowRoot.getElementById("badge-time");
                    el_time.src = `images/time_${newValue}.svg`;
                }
            break;
            case 'access':
                if (oldValue != newValue) {
                    let txt = this.shadowRoot.getElementById("text");
                    txt.classList.toggle("avail", Logic.getValue(newValue));
                }
            break;
        }
    }

    check() {
        Logger.log(`check location "${this.ref}"`, "Location");
        this.checked = true;
    }
    
    uncheck() {
        Logger.log(`uncheck location "${this.ref}"`, "Location");
        this.checked = false;
    }

}

customElements.define('ootrt-list-skulltula', HTMLTrackerSkulltula);