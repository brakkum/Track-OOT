import FileData from "/emcJS/storage/FileData.js";
import Template from "/emcJS/util/Template.js";
import EventBusSubsetMixin from "/emcJS/mixins/EventBusSubset.js";
import "/emcJS/ui/ContextMenu.js";
import "/emcJS/ui/Icon.js";
import StateStorage from "/script/storage/StateStorage.js";
import IDBStorage from "/emcJS/storage/IDBStorage.js";
import ListLogic from "/script/util/logic/ListLogic.js";
import Language from "/script/util/Language.js";
import WorldRegistry from "/script/util/WorldRegistry.js";

const SettingsStorage = new IDBStorage('settings');

const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
        }
        :host {
            display: contents;
            width: 100%;
        }
    </style>
    <slot id="list"></slot>
`);

export default class ListSubArea extends EventBusSubsetMixin(HTMLElement) {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());

        /* event bus */
        this.registerGlobal(["state", "statechange", "settings", "randomizer_options", "logic", "filter"], event => {
            this.refresh();
        });
    }

    connectedCallback() {
        super.connectedCallback();
        this.refresh();
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
        switch (name) {
            case 'ref':
                if (oldValue != newValue) {
                    this.refresh();
                }
            break;
        }
    }

    refresh() {
        // TODO do not use specialized code. make generic
        let cnt = this.shadowRoot.getElementById("list");
        cnt.innerHTML = "";
        let data = FileData.get(`world_lists/${this.ref}`);
        if (!!data) {
            if (data.lists.mq == null) {
                data.lists.v.forEach(record => {
                    let loc = WorldRegistry.get(record.id);
                    if (!!loc && loc.visible()) {
                        let el = loc.listItem;
                        cnt.append(el);
                    }
                });
            }
        }
    }

    setFilterData(data) {
        // nothing
    }

}

customElements.define('ootrt-list-subarea', ListSubArea);