import FileData from "/emcJS/storage/FileData.js";
import Template from "/emcJS/util/Template.js";
import EventBusSubsetMixin from "/emcJS/mixins/EventBusSubset.js";
import "/emcJS/ui/input/SearchSelect.js";
import StateStorage from "/script/storage/StateStorage.js";
import Language from "/script/util/Language.js";
import ExitRegistry from "/script/util/world/ExitRegistry.js";

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

export default class HTMLTrackerExitChoice extends EventBusSubsetMixin(HTMLElement) {
    
    constructor() {
        super();
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
            const exitEntry = ExitRegistry.get(this.ref);
            selectEl.readonly = !exitEntry.active();
            if (event.data.extra.exits != null && event.data.extra.exits[this.ref] != null) {
                selectEl.value = event.data.extra.exits[this.ref];
            } else {
                selectEl.value = "";
            }
            this.refreshExits();
        });
        this.registerGlobal("randomizer_options", event => {
            const exitEntry = ExitRegistry.get(this.ref);
            selectEl.readonly = !exitEntry.active();
            this.refreshExits();
        });
        this.registerGlobal("statechange_exits", event => {
            let data;
            if (event.data != null) {
                data = event.data[this.ref];
            }
            if (data != null) {
                selectEl.value = data.newValue;
            }
            this.refreshExits();
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
                    let data = FileData.get(`world/exit/${newValue}`);
                    // savesatate
                    let title = this.shadowRoot.getElementById("title");
                    title.innerHTML = Language.translate(newValue);
                    title.setAttribute('i18n-content', newValue);
                    let selectEl = this.shadowRoot.getElementById("select");
                    selectEl.value = StateStorage.readExtra("exits", newValue, "");
                    // readonly
                    const exitEntry = ExitRegistry.get(newValue);
                    selectEl.readonly = !exitEntry.active();
                    this.refreshExits();
                break;
            }
        }
    }

    refreshExits() {
        const selectEl = this.shadowRoot.getElementById("select");
        // retrieve bound
        const current = selectEl.value;
        const exits = StateStorage.readAllExtra("exits");
        const bound = new Set();
        for (const key in exits) {
            if (exits[key] == current) continue;
            bound.add(exits[key]);
        }
        // add options
        const exitEntry = ExitRegistry.get(this.ref);
        const entrances = FileData.get("world/exit");
        selectEl.innerHTML = "";
        const empty = document.createElement('emc-option');
        empty.value = "";
        empty.innerHTML = "unbound";
        selectEl.append(empty);
        for (const key in entrances) {
            const value = entrances[key];
            const entranceEntry = ExitRegistry.get(key);
            if (entranceEntry.getType() == exitEntry.getType() && !bound.has(value.target) && entranceEntry.active()) {
                const opt = document.createElement('emc-option');
                opt.value = value.target;
                opt.innerHTML = Language.translate(value.target);
                opt.setAttribute('i18n-content', value.target);
                selectEl.append(opt);
            }
        }
    }

}

customElements.define('ootrt-exitchoice', HTMLTrackerExitChoice);