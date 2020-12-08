import FileData from "/emcJS/storage/FileData.js";
import Template from "/emcJS/util/Template.js";
import GlobalStyle from "/emcJS/util/GlobalStyle.js";
import EventBusSubsetMixin from "/emcJS/mixins/EventBusSubset.js";
import "/emcJS/ui/input/Option.js";
import StateStorage from "/script/storage/StateStorage.js";
import iOSTouchHandler from "/script/util/iOSTouchHandler.js";

const TPL = new Template(`
<emc-option value="n" style="background-image: url('images/dungeontype/undefined.svg')"></emc-option>
<emc-option value="v" style="background-image: url('images/dungeontype/vanilla.svg')"></emc-option>
<emc-option value="mq" style="background-image: url('images/dungeontype/masterquest.svg')"></emc-option>
`);

const STYLE = new GlobalStyle(`
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
`);

function stateChanged(event) {
    if (!!this.ref) {
        const area = FileData.get(`world/${this.ref}/lists`);
        let value = "v";
        if (area.hasOwnProperty("mq")) {
            value = "n";
        }
        if (event.data.extra.dungeontype != null) {
            const state = event.data.extra.dungeontype[this.ref];
            if (typeof state != "undefined" && state != "") {
                value = state;
            }
        }
        this.value = value;
    } else {
        this.value = "n";
    }
}

function dungeonTypeUpdate(event) {
    let data;
    if (event.data != null) {
        data = event.data[this.ref];
    }
    if (data != null) {
        this.value = data.newValue;
    }
}

class HTMLTrackerDungeonType extends EventBusSubsetMixin(HTMLElement) {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.addEventListener("click", event => this.next(event));
        this.addEventListener("contextmenu", event => this.revert(event));
        /* event bus */
        this.registerGlobal("state", stateChanged.bind(this));
        this.registerGlobal("statechange_dungeontype", dungeonTypeUpdate.bind(this));
        /* fck iOS */
        iOSTouchHandler.register(this);
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
        let val = this.getAttribute('readonly');
        return !!val && val != "false";
    }

    set readonly(val) {
        this.setAttribute('readonly', val);
    }

    static get observedAttributes() {
        return ['ref', 'value'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'ref':
                if (oldValue != newValue) {
                    if (!!newValue) {
                        const area = FileData.get(`world/${this.ref}/lists`);
                        let value = "v";
                        let readonly = true;
                        if (area.hasOwnProperty("mq")) {
                            value = StateStorage.readExtra("dungeontype", newValue, "n");
                            readonly = false;
                        }
                        this.value = value;
                        this.readonly = readonly;
                    } else {
                        this.value = "n";
                        this.readonly = true;
                    }
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
            StateStorage.writeExtra("dungeontype", this.ref, this.value);
        }
        event.preventDefault();
        return false;
    }

    revert(event) {
        if (!this.readonly) {
            this.value = "n";
            StateStorage.writeExtra("dungeontype", this.ref, 'n');
        }
        event.preventDefault();
        return false;
    }

}

customElements.define('ootrt-dungeontype', HTMLTrackerDungeonType);