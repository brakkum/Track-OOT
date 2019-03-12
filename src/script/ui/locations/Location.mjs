import GlobalData from "/deepJS/storage/GlobalData.mjs";
import Template from "/deepJS/util/Template.mjs";
import EventBus from "/deepJS/util/EventBus.mjs";
import Logger from "/deepJS/util/Logger.mjs";
import TrackerLocalState from "/script/util/LocalState.mjs";
import Logic from "/script/util/Logic.mjs";
import I18n from "/script/util/I18n.mjs";

const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
        }
        :host {
            display: flex;
            width: 100%;
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
    </style>
    <div id="text"></div>
    <div id="badge"></div>
`);

function locationUpdate(name, value) {
    if (this.ref === name && this.checked !== value) {
        EventBus.mute("location-update");
        this.checked = value;
        EventBus.unmute("location-update");
    }
}

function globalUpdate() {
    let path = this.ref.split(".");
    EventBus.mute("location-update");
    this.checked = TrackerLocalState.read(path[1], path[2], false);
    EventBus.unmute("location-update");
}

function logicUpdate(type, ref, value) {
    let path = this.ref.split(".");
    if (path[1] == type && path[2] == ref) {
        let el = this.shadowRoot.getElementById("text");
        if (!!value) {
            el.classList.add("avail");
        } else {
            el.classList.remove("avail");
        }
    }
}

class HTMLTrackerLocation extends HTMLElement {

    constructor() {
        super();
        this.addEventListener("click", this.check);
        this.addEventListener("contextmenu", this.uncheck);
        EventBus.on("location-update", locationUpdate.bind(this));
        EventBus.on("logic", logicUpdate.bind(this));
        EventBus.onafter("global-update", globalUpdate.bind(this));
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(TPL.generate());
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

    static get observedAttributes() {
        return ['ref', 'checked'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'ref':
                if (oldValue != newValue) {
                    let path = newValue.split('.');
                    let data = GlobalData.get("locations")[path[0]]
                    let dType = TrackerLocalState.read("dungeonTypes", path[0], data.hasmq ? "n" : "v");
                    data = data[`${path[1]}_${dType}`][path[2]];
                    let txt = this.shadowRoot.getElementById("text");
                    txt.innerHTML = I18n.translate(path[2]);

                    this.shadowRoot.getElementById("badge").innerHTML = "";

                    let el_time = document.createElement("deep-icon");
                    el_time.src = `images/time_${data.time || "both"}.svg`;
                    this.shadowRoot.getElementById("badge").appendChild(el_time);

                    let el_era = document.createElement("deep-icon");
                    el_era.src = `images/era_${data.era ||"both"}.svg`;
                    this.shadowRoot.getElementById("badge").appendChild(el_era);

                    if (Logic.checkLogic(path[1], path[2])) {
                        txt.classList.add("avail");
                    } else {
                        txt.classList.remove("avail");
                    }

                    this.checked = TrackerLocalState.read(path[1], path[2], false);
                }
            break;
            case 'checked':
                if (oldValue != newValue) {
                    let path = this.ref.split(".");
                    if (!newValue || newValue === "false") {
                        let el = this.shadowRoot.getElementById("text");
                        if (Logic.checkLogic(path[1], path[2])) {
                            el.classList.add("avail");
                        } else {
                            el.classList.remove("avail");
                        }
                    }
                    TrackerLocalState.write(path[1], path[2], newValue === "false" ? false : !!newValue);
                    EventBus.post("location-update", this.ref, newValue);
                }
            break;
        }
    }

    check(event) {
        Logger.log(`check location "${this.ref}"`, "Location");
        this.checked = true;
        if (!event) return;
        event.preventDefault();
        return false;
    }
    
    uncheck(event) {
        Logger.log(`uncheck location "${this.ref}"`, "Location");
        this.checked = false;
        if (!event) return;
        event.preventDefault();
        return false;
    }

}

customElements.define('ootrt-listlocation', HTMLTrackerLocation);