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
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            width: 100%;
            cursor: pointer;
            padding: 5px;
        }
        :host(:not([data-headless="true"]):hover) {
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
        .textarea + .textarea {
            margin-top: 5px;
        }
        :host([data-headless="true"]) .textarea {
            display: none;
        }
        #text {
            flex: 1;
            color: #ffffff;
            -moz-user-select: none;
            user-select: none;
        }
        #text[data-state="opened"] {
            color: var(--location-status-opened-color, #000000);
        }
        #text[data-state="available"] {
            color: var(--location-status-available-color, #000000);
        }
        #text[data-state="unavailable"] {
            color: var(--location-status-unavailable-color, #000000);
        }
        #text[data-state="possible"] {
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
        #list {
            width: 100%;
            margin-top: 5px;
        }
    </style>
    <div class="textarea">
        <div id="text"></div>
        <div id="badge">
            <emc-icon src="images/icons/entrance.svg"></emc-icon>
            <emc-icon id="badge-time" src="images/icons/time_always.svg"></emc-icon>
            <emc-icon id="badge-era" src="images/icons/era_none.svg"></emc-icon>
        </div>
    </div>
    <div id="list">
        <slot></slot>
    </div>
`);

const TPL_MNU_CTX = new Template(`
    <emc-contextmenu id="menu">
        <div id="menu-check" class="item">Check All</div>
        <div id="menu-uncheck" class="item">Uncheck All</div>
        <div class="splitter"></div>
        <div id="menu-setwoth" class="item">Set WOTH</div>
        <div id="menu-setbarren" class="item">Set Barren</div>
        <div id="menu-clearhint" class="item">Clear Hint</div>
    </emc-contextmenu>
`);

const VALUE_STATES = [
    "opened",
    "unavailable",
    "possible",
    "available"
];

const MNU_CTX = new WeakMap();

export default class ListSubArea extends EventBusSubsetMixin(HTMLElement) {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());

        /* context menu */
        const mnu_ctx = document.createElement("div");
        mnu_ctx.attachShadow({mode: 'open'});
        mnu_ctx.shadowRoot.append(TPL_MNU_CTX.generate());
        const mnu_ctx_el = mnu_ctx.shadowRoot.getElementById("menu");
        MNU_CTX.set(this, mnu_ctx);
        
        mnu_ctx.shadowRoot.getElementById("menu-check").addEventListener("click", event => {
            const data = FileData.get(`world/${this.ref}/lists`);
            if (data.v != null) {
                for (const loc of data.v) {
                    StateStorage.write(loc.id, true);
                }
            }
            if (data.mq != null) {
                for (const loc of data.mq) {
                    StateStorage.write(loc.id, true);
                }
            }
            event.preventDefault();
            return false;
        });
        mnu_ctx.shadowRoot.getElementById("menu-uncheck").addEventListener("click", event => {
            const data = FileData.get(`world/${this.ref}/lists`);
            if (data.v != null) {
                for (const loc of data.v) {
                    StateStorage.write(loc.id, false);
                }
            }
            if (data.mq != null) {
                for (const loc of data.mq) {
                    StateStorage.write(loc.id, false);
                }
            }
            event.preventDefault();
            return false;
        });

        /* mouse events */
        this.addEventListener("click", event => {
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
        this.addEventListener("contextmenu", event => {
            mnu_ctx_el.show(event.clientX, event.clientY);
            event.stopPropagation();
            event.preventDefault();
            return false;
        });

        /* event bus */
        this.registerGlobal(["state", "statechange", "settings", "randomizer_options", "logic", "filter"], event => {
            this.refresh();
        });
    }

    connectedCallback() {
        super.connectedCallback();
        let el = this;
        while (el.parentElement != null) {
            el = el.parentElement;
        }
        el.append(MNU_CTX.get(this));
        el.append(MNU_ITM.get(this));
        // update state
        this.refresh();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        MNU_CTX.get(this).remove();
        this.dataset.headless = "";
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
                    const txt = this.shadowRoot.getElementById("text");
                    txt.innerHTML = Language.translate(newValue);
                }
            break;
        }
    }

    refresh() {
        // TODO do not use specialized code. make generic
        if (!!this.ref) {
            const data = FileData.get(`world/${this.ref}`);
            this.innerHTML = "";
            if (!!data) {
                // check access logic
                const res = ListLogic.check(data.list.filter(ListLogic.filterUnusedChecks));
                this.shadowRoot.getElementById("text").dataset.state = VALUE_STATES[res.value];
                // create list entries
                data.list.forEach(record => {
                    const loc = WorldRegistry.get(`${record.category}/${record.id}`);
                    if (!!loc && loc.visible()) {
                        const el = loc.listItem;
                        this.append(el);
                    }
                });
            }
        } else {
            this.shadowRoot.getElementById("text").dataset.state = "unavailable";
        }
    }

    setFilterData(data) {
        // nothing
    }

}

customElements.define('ootrt-list-subarea', ListSubArea);