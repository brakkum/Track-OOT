import FileData from "/emcJS/storage/FileData.js";
import Template from "/emcJS/util/Template.js";
import EventBusSubsetMixin from "/emcJS/mixins/EventBusSubset.js";
import "/emcJS/ui/selection/SearchSelect.js";
import StateStorage from "/script/storage/StateStorage.js";

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

        this.shadowRoot.getElementById("select").addEventListener("change", event => {
            if (this.ref != "") {
                StateStorage.writeExtra("exits", this.ref, event.value);
            }
        });
        /* event bus */
        this.registerGlobal("state", event => {
            if (event.data.state.hasOwnProperty("option.entrance_shuffle")) {
                this.active = event.data.state["option.entrance_shuffle"]
            }
        });
        this.registerGlobal("randomizer_options", event => {
            if (event.data.hasOwnProperty("option.entrance_shuffle")) {
                this.active = event.data["option.entrance_shuffle"]
            }
        });
        this.registerGlobal("statechange_exits", event => {
            let data;
            if (event.data != null) {
                data = event.data[this.ref];
            }
            if (data != null) {
                this.shadowRoot.getElementById("select").value = data.newValue;
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
                    let exits = FileData.get("exits");
                    let data = exits[newValue];
                    // savesatate
                    this.shadowRoot.getElementById("title").innerHTML = newValue;
                    let select = this.shadowRoot.getElementById("select");
                    select.value = StateStorage.readExtra("exits", this.ref, data.target);
                    ACTIVE.set(this, data.active);
                    // options
                    for (let key in exits) {
                        let value = exits[key];
                        if (value.type == data.type) {
                            let opt = document.createElement('emc-option');
                            opt.value = value.target;
                            opt.innerHTML = value.target;
                            select.append(opt);
                        }
                    }
                break;
            }
        }
    }

}

customElements.define('ootrt-exitchoice', HTMLTrackerExitChoice);