import FileData from "/emcJS/storage/FileData.js";
import Template from "/emcJS/util/Template.js";
import GlobalStyle from "/emcJS/util/GlobalStyle.js";
import EventBusSubsetMixin from "/emcJS/mixins/EventBusSubset.js";
import Logger from "/emcJS/util/Logger.js";
import "/emcJS/ui/overlay/ContextMenu.js";
import "/emcJS/ui/Icon.js";
import StateStorage from "/script/storage/StateStorage.js";
import ListLogic from "/script/util/logic/ListLogic.js";
import Logic from "/script/util/logic/Logic.js";
import ExitRegistry from "/script/util/world/ExitRegistry.js";
import Language from "/script/util/Language.js";
import MarkerRegistry from "/script/util/world/MarkerRegistry.js";
import iOSTouchHandler from "/script/util/iOSTouchHandler.js";


const TPL = new Template(`
<div class="textarea">
    <div id="text"></div>
    <div id="badge">
        <emc-icon src="images/icons/entrance.svg"></emc-icon>
        <emc-icon id="badge-time" src="images/icons/time_always.svg"></emc-icon>
        <emc-icon id="badge-era" src="images/icons/era_none.svg"></emc-icon>
    </div>
</div>
<div class="textarea">
    <div id="value"></div>
</div>
<div id="list">
    <slot></slot>
</div>
`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
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
.textarea + .textarea {
    margin-top: 5px;
}
#value:empty:after {
    display: inline;
    font-style: italic;
    content: "no association";
}
#text {
    display: flex;
    flex: 1;
    color: #ffffff;
    align-items: center;
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
:host(:empty) #list {
    display: none;
}
`);

const TPL_MNU_CTX = new Template(`
<emc-contextmenu id="menu">
    <div id="menu-check" class="item">Check All</div>
    <div id="menu-uncheck" class="item">Uncheck All</div>
    <div class="splitter"></div>
    <div id="menu-associate" class="item">Bind Entrance</div>
    <div id="menu-deassociate" class="item">Unbind Entrance</div>
</emc-contextmenu>
`);

const TPL_MNU_EXT = new Template(`
<emc-contextmenu id="menu">
    <emc-listselect id="select"></emc-listselect>
</emc-contextmenu>
`);

const STYLE_MNU_EXT = new GlobalStyle(`
#select {
    height: 300px;
    width: 300px;
}
`);

function setAllListEntries(list, value = true) {
    if (!!list && Array.isArray(list)) {
        for (const entry of list) {
            const category = entry.category;
            const id = entry.id;
            if (category == "location") {
                StateStorage.write(`${category}/${id}`, value);
            } else if (category == "subarea") {
                const subarea = FileData.get(`world/subarea/${id}/list`);
                setAllListEntries(subarea, value);
            } else if (category == "subexit") {
                const subexit = FileData.get(`world/marker/subexit/${id}`);
                const bound = StateStorage.readExtra("exits", subexit.access);
                if (!bound) {
                    continue;
                }
                let entrance = FileData.get(`world/exit/${bound}`);
                if (entrance == null) {
                    entrance = FileData.get(`world/exit/${bound.split(" -> ").reverse().join(" -> ")}`)
                }
                if (entrance != null) {
                    const subarea = FileData.get(`world/${entrance.area}/list`);
                    setAllListEntries(subarea, value);
                }
            } else {
                Logger.error((new Error(`unknown category "${category}" for entry "${id}"`)), "Area");
            }
        }
    }
}

function exitUpdate(event) {
    if (this.ref === event.data.name && this.value !== event.data.value) {
        let value = event.data.value;
        if (typeof value != "string") {
            value = "";
        }
        this.value = value;
    }
}

function fillEntranceSelection() {
    // retrieve bound
    const current = this.value;
    const exits = StateStorage.readAllExtra("exits");
    const bound = new Set();
    for (const key in exits) {
        if (exits[key] == current) continue;
        bound.add(exits[key]);
    }
    // add options
    const exit = EXIT.get(this);
    const exitEntry = ExitRegistry.get(exit);
    const entrances = FileData.get("world/exit");
    const selectEl = MNU_EXT.get(this).shadowRoot.getElementById("select");
    selectEl.value = this.value;
    selectEl.innerHTML = "";
    const empty = document.createElement('emc-option');
    empty.value = "";
    const emptyText = document.createElement('span');
    emptyText.innerHTML = "unbind";
    emptyText.style.fontStyle = "italic";
    empty.append(emptyText);
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

const VALUE_STATES = [
    "opened",
    "unavailable",
    "possible",
    "available"
];

const EXIT = new WeakMap();
const AREA = new WeakMap();
const ACCESS = new WeakMap();
const MNU_CTX = new WeakMap();
const MNU_EXT = new WeakMap();

export default class ListSubExit extends EventBusSubsetMixin(HTMLElement) {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        EXIT.set(this, "");
        AREA.set(this, "");
        ACCESS.set(this, "");

        /* context menu */
        const fillEntrances = fillEntranceSelection.bind(this);
        
        const mnu_ctx = document.createElement("div");
        mnu_ctx.attachShadow({mode: 'open'});
        mnu_ctx.shadowRoot.append(TPL_MNU_CTX.generate());
        const mnu_ctx_el = mnu_ctx.shadowRoot.getElementById("menu");
        MNU_CTX.set(this, mnu_ctx);

        const mnu_ext = document.createElement("div");
        mnu_ext.attachShadow({mode: 'open'});
        mnu_ext.shadowRoot.append(TPL_MNU_EXT.generate());
        STYLE_MNU_EXT.apply(mnu_ext.shadowRoot);
        const selectEl = mnu_ext.shadowRoot.getElementById("select");
        const mnu_ext_el = mnu_ext.shadowRoot.getElementById("menu");
        MNU_EXT.set(this, mnu_ext);

        selectEl.addEventListener("change", event => {
            const exit = EXIT.get(this);
            if (exit != "") {
                StateStorage.writeExtra("exits", exit, event.value);
                /*this.triggerGlobal("exit", {
                    name: this.ref,
                    value: event.value
                });*/
            }
        });
        selectEl.addEventListener("click", event => {
            event.stopPropagation();
            event.preventDefault();
            return false;
        });
        mnu_ext_el.addEventListener("close", function() {
            selectEl.resetSearch();
        });
        mnu_ctx.shadowRoot.getElementById("menu-check").addEventListener("click", event => {
            const area = AREA.get(this);
            const data = FileData.get(`world/${area}/list`);
            if (data != null) {
                setAllListEntries(data, true);
            }
            event.preventDefault();
            return false;
        });
        mnu_ctx.shadowRoot.getElementById("menu-uncheck").addEventListener("click", event => {
            const area = AREA.get(this);
            const data = FileData.get(`world/${area}/list`);
            if (data != null) {
                setAllListEntries(data, false);
            }
            event.preventDefault();
            return false;
        });
        mnu_ctx.shadowRoot.getElementById("menu-associate").addEventListener("click", event => {
            fillEntrances();
            // show menu
            mnu_ext_el.show(mnu_ctx_el.left, mnu_ctx_el.top);
            event.preventDefault();
            return false;
        });
        mnu_ctx.shadowRoot.getElementById("menu-deassociate").addEventListener("click", () => {
            const exit = EXIT.get(this);
            if (exit != "") {
                StateStorage.writeExtra("exits", exit, "");
            }
        });

        /* mouse events */
        this.addEventListener("click", event => {
            const area = AREA.get(this);
            if (!area) {
                fillEntrances();
                mnu_ext_el.show(event.clientX, event.clientY);
            }
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
        this.registerGlobal("exit", exitUpdate.bind(this));
        this.registerGlobal("state", event => {
            const exit = EXIT.get(this);
            const exitEntry = ExitRegistry.get(exit);
            selectEl.readonly = !exitEntry.active();
            if (event.data.extra.exits != null && event.data.extra.exits[exit] != null) {
                this.value = event.data.extra.exits[exit];
            } else {
                this.value = "";
            }
        });
        this.registerGlobal("randomizer_options", () => {
            const exit = EXIT.get(this);
            const exitEntry = ExitRegistry.get(exit);
            selectEl.readonly = !exitEntry.active();
            this.update();
        });
        this.registerGlobal("statechange_exits", event => {
            const exit = EXIT.get(this);
            let data;
            if (event.data != null) {
                data = event.data[exit];
            }
            if (data != null) {
                this.value = data.newValue;
                selectEl.value = data.newValue;
            }
        });
        this.registerGlobal(["statechange", "settings", "logic", "filter"], () => {
            // update exit
            const exit = EXIT.get(this);
            this.value = StateStorage.readExtra("exits", exit, "");
            const area = AREA.get(this);
            if (area) {
                this.hint = StateStorage.readExtra("area_hint", area, "");
            }
            // update state
            this.update();
        });
        
        /* fck iOS */
        iOSTouchHandler.register(this);
    }

    connectedCallback() {
        super.connectedCallback();
        let el = this;
        while (el.parentElement != null && !el.classList.contains("panel")) {
            el = el.parentElement;
        }
        el.append(MNU_CTX.get(this));
        el.append(MNU_EXT.get(this));
        // update exit
        const exit = EXIT.get(this);
        this.value = StateStorage.readExtra("exits", exit, "");
        const area = AREA.get(this);
        if (area) {
            this.hint = StateStorage.readExtra("area_hint", area, "");
        }
        // update state
        this.update();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        MNU_CTX.get(this).remove();
        MNU_EXT.get(this).remove();
    }

    async update() {
        const area = AREA.get(this);
        if (!area) {
            const access = ACCESS.get(this);
            if (!!access && (!!Logic.getValue(`${access}[child]`) || !!Logic.getValue(`${access}[adult]`))) {
                this.shadowRoot.getElementById("text").dataset.state = "available";
            } else {
                this.shadowRoot.getElementById("text").dataset.state = "unavailable";
            }
        } else {
            const data = FileData.get(`world/${area}`);
            if (data) {
                // check access logic
                const res = ListLogic.check(data.list.filter(ListLogic.filterUnusedChecks));
                this.shadowRoot.getElementById("text").dataset.state = VALUE_STATES[res.value];
                // create list entries
                data.list.forEach(record => {
                    const loc = MarkerRegistry.get(`${record.category}/${record.id}`);
                    if (!!loc && loc.visible()) {
                        const el = loc.listItem;
                        this.append(el);
                    }
                });
            }
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

    static get observedAttributes() {
        return ['ref', 'value'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'ref':
                if (oldValue != newValue) {
                    const data = FileData.get(`world/marker/${newValue}`);
                    const txt = this.shadowRoot.getElementById("text");
                    if (!data.access) {
                        console.warn(`missing subexit access for "${newValue}"`);
                    }
                    txt.innerHTML = Language.translate(data.access);
                    txt.setAttribute('i18n-content', data.access);
                    EXIT.set(this, data.access);
                    ACCESS.set(this, data.access.split(" -> ")[0]);
                    this.value = StateStorage.readExtra("exits", data.access, "");
                    // update state
                    this.update();
                }
                break;
            case 'value':
                if (oldValue != newValue) {
                    const el = this.shadowRoot.getElementById("value");
                    this.innerHTML = "";
                    if (newValue) {
                        let entrance = FileData.get(`world/exit/${newValue}`);
                        if (entrance == null) {
                            entrance = FileData.get(`world/exit/${newValue.split(" -> ").reverse().join(" -> ")}`)
                        }
                        el.innerHTML = Language.translate(newValue);
                        AREA.set(this, entrance.area);
                        this.hint = StateStorage.readExtra("area_hint", entrance.area, "");
                    } else {
                        el.innerHTML = "";
                        AREA.set(this, "");
                        this.hint = "";
                    }
                    this.update();
                }
                break;
        }
    }

    setFilterData(data) {
        const el_era = this.shadowRoot.getElementById("badge-era");
        if (!data["filter.era/child"]) {
            el_era.src = "images/icons/era_adult.svg";
        } else if (!data["filter.era/adult"]) {
            el_era.src = "images/icons/era_child.svg";
        } else {
            el_era.src = "images/icons/era_both.svg";
        }
        const el_time = this.shadowRoot.getElementById("badge-time");
        if (!data["filter.time/day"]) {
            el_time.src = "images/icons/time_night.svg";
        } else if (!data["filter.time/night"]) {
            el_time.src = "images/icons/time_day.svg";
        } else {
            el_time.src = "images/icons/time_always.svg";
        }
    }

}

customElements.define('ootrt-list-subexit', ListSubExit);
