import FileData from "/emcJS/storage/FileData.js";
import Template from "/emcJS/util/Template.js";
import EventBusSubsetMixin from "/emcJS/mixins/EventBusSubset.js";
import "/emcJS/ui/selection/SearchSelect.js";
import StateStorage from "/script/storage/StateStorage.js";
import Language from "/script/util/Language.js";

const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
        }
        :host {
            display: block;
            padding: 10px;
            margin: 5px;
            background-color: #222222;
        }
        #title {
            display: block;
            height: 20px;
            margin-bottom: 5px;
        }
    </style>
    <label>
        <span id="title"></span>
        <emc-searchselect id="select"></emc-searchselect>
    </label>
`);

const ACTIVE = new WeakMap();

export default class HTMLTrackerExitChoice extends EventBusSubsetMixin(HTMLElement) {
    
    constructor() {
        super();
        ACTIVE.set(this, []);
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());

        let selectEl = this.shadowRoot.getElementById("select");
        selectEl.addEventListener("change", event => {
            if (this.ref != "") {
                StateStorage.writeExtra("exits", this.ref, event.value);
            }
        });
        /* event bus */
        this.registerGlobal("state", event => {
            let active = ACTIVE.get(this);
            if (event.data.state.hasOwnProperty("option.entrance_shuffle")) {
                selectEl.readonly = active.indexOf(event.data.state["option.entrance_shuffle"]) < 0;
            }
            if (event.data.extra.exits != null && event.data.extra.exits[this.ref] != null) {
                selectEl.value = event.data.extra.exits[this.ref];
            } else {
                let data = FileData.get(`exits/${this.ref}`);
                selectEl.value = data.target;
            }
        });
        this.registerGlobal("randomizer_options", event => {
            let active = ACTIVE.get(this);
            if (event.data.hasOwnProperty("option.entrance_shuffle")) {
                selectEl.readonly = active.indexOf(event.data["option.entrance_shuffle"]) < 0;
            }
        });
        this.registerGlobal("statechange_exits", event => {
            let data;
            if (event.data != null) {
                data = event.data[this.ref];
            }
            if (data != null) {
                selectEl.value = data.newValue;
            }
        });
    }

    get ref() {
        return this.getAttribute('ref');
    }

    set ref(val) {
        this.setAttribute('ref', val);
    }

    static get observedAttributes() {
        return ['ref'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case 'ref':
                    let exit = FileData.get(`exits/${newValue}`);
                    let entrances = FileData.get("entrances");
                    // savesatate
                    let title = this.shadowRoot.getElementById("title");
                    title.innerHTML = Language.translate(newValue);
                    title.setAttribute('i18n-content', newValue);
                    let selectEl = this.shadowRoot.getElementById("select");
                    selectEl.value = StateStorage.readExtra("exits", newValue, exit.target);
                    ACTIVE.set(this, exit.active);
                    // readonly
                    selectEl.readonly = exit.active.indexOf(StateStorage.read("option.entrance_shuffle")) < 0;
                    // options
                    for (let key in entrances) {
                        let value = entrances[key];
                        if (value.type == exit.type) {
                            let opt = document.createElement('emc-option');
                            opt.value = key;
                            opt.innerHTML = Language.translate(key);
                            opt.setAttribute('i18n-content', key);
                            selectEl.append(opt);
                        }
                    }
                break;
            }
        }
    }

}

customElements.define('ootrt-exitchoice', HTMLTrackerExitChoice);