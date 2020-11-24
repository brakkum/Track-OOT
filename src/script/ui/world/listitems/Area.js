import FileData from "/emcJS/storage/FileData.js";
import Template from "/emcJS/util/Template.js";
import GlobalStyle from "/emcJS/util/GlobalStyle.js";
import EventBusSubsetMixin from "/emcJS/mixins/EventBusSubset.js";
import Logger from "/emcJS/util/Logger.js";
import "/emcJS/ui/overlay/ContextMenu.js";
import "/emcJS/ui/Icon.js";
import StateStorage from "/script/storage/StateStorage.js";
import IDBStorage from "/emcJS/storage/IDBStorage.js";
import ListLogic from "/script/util/logic/ListLogic.js";
import Language from "/script/util/Language.js";

const SettingsStorage = new IDBStorage('settings');

const TPL = new Template(`
<div class="textarea">
    <div id="entrances"></div>
    <div id="text"></div>
    <div id="hint"></div>
    <div id="badge">
        <emc-icon src="images/icons/area.svg"></emc-icon>
        <emc-icon id="badge-time" src="images/icons/time_always.svg"></emc-icon>
        <emc-icon id="badge-era" src="images/icons/era_both.svg"></emc-icon>
    </div>
</div>
`);

const STYLE = new GlobalStyle(`
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
#hint {
    margin-left: 5px;
}
#hint:empty {
    display: none;
}
#hint img {
    width: 25px;
    height: 25px;
}
#entrances {
    margin-right: 5px;
}
#entrances:empty {
    display: none;
}
#entrances img {
    width: 25px;
    height: 25px;
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

function setAllListEntries(list, value = true) {
    if (!!list && Array.isArray(list)) {
        for (let entry of list) {
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

const VALUE_STATES = [
    "opened",
    "unavailable",
    "possible",
    "available"
];

const MNU_CTX = new WeakMap();

export default class ListArea extends EventBusSubsetMixin(HTMLElement) {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */

        /* context menu */
        let mnu_ctx = document.createElement("div");
        mnu_ctx.attachShadow({mode: 'open'});
        mnu_ctx.shadowRoot.append(TPL_MNU_CTX.generate());
        let mnu_ctx_el = mnu_ctx.shadowRoot.getElementById("menu");
        MNU_CTX.set(this, mnu_ctx);
        
        mnu_ctx.shadowRoot.getElementById("menu-check").addEventListener("click", event => {
            let data = FileData.get(`world/${this.ref}/lists`);
            for (const type in data) {
                setAllListEntries(data[type], true);
            }
            event.preventDefault();
            return false;
        });
        mnu_ctx.shadowRoot.getElementById("menu-uncheck").addEventListener("click", event => {
            let data = FileData.get(`world/${this.ref}/lists`);
            for (const type in data) {
                setAllListEntries(data[type], false);
            }
            event.preventDefault();
            return false;
        });
        mnu_ctx.shadowRoot.getElementById("menu-setwoth").addEventListener("click", event => {
            const item = event.detail;
            this.item = item;
            StateStorage.writeExtra("area_hint", this.ref, "woth");
            event.preventDefault();
            return false;
        });
        mnu_ctx.shadowRoot.getElementById("menu-setbarren").addEventListener("click", event => {
            const item = event.detail;
            this.item = item;
            StateStorage.writeExtra("area_hint", this.ref, "barren");
            event.preventDefault();
            return false;
        });
        mnu_ctx.shadowRoot.getElementById("menu-clearhint").addEventListener("click", event => {
            const item = event.detail;
            this.item = item;
            StateStorage.writeExtra("area_hint", this.ref, "");
            event.preventDefault();
            return false;
        });

        /* mouse events */
        this.addEventListener("click", event => {
            this.triggerGlobal("location_change", {
                name: this.ref
            });
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
            // update exit
            this.hint = StateStorage.readExtra("area_hint", this.ref, "");
            // update state
            this.update();
        });
        this.registerGlobal("statechange_area_hint", event => {
            let data;
            if (event.data != null) {
                data = event.data[this.ref];
            }
            if (data != null) {
                this.hint = data.newValue;
            }
        });
        //this.registerGlobal("dungeontype", dungeonTypeUpdate.bind(this));
    }

    connectedCallback() {
        super.connectedCallback();
        let el = this;
        while (el.parentElement != null && !el.classList.contains("panel")) {
            el = el.parentElement;
        }
        el.append(MNU_CTX.get(this));
        // update exit
        this.hint = StateStorage.readExtra("area_hint", this.ref, "");
        // update state
        this.update();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        MNU_CTX.get(this).remove();
    }

    async update() {
        if (!!this.ref) {
            let dType = StateStorage.readExtra("dungeontype", this.ref, 'v');
            if (dType == "n") {
                let data_v = FileData.get(`world/${this.ref}/lists/v`);
                let data_m = FileData.get(`world/${this.ref}/lists/mq`);
                let res_v = ListLogic.check(data_v.filter(ListLogic.filterUnusedChecks));
                let res_m = ListLogic.check(data_m.filter(ListLogic.filterUnusedChecks));
                if (await SettingsStorage.get("unknown_dungeon_need_both", false)) {
                    this.shadowRoot.getElementById("text").dataset.state = VALUE_STATES[Math.min(res_v.value, res_m.value)];
                } else {
                    this.shadowRoot.getElementById("text").dataset.state = VALUE_STATES[Math.max(res_v.value, res_m.value)];
                }
                this.setEntrances(res_v.entrances || res_v.entrances);
            } else {
                let data = FileData.get(`world/${this.ref}/lists/${dType}`);
                let res = ListLogic.check(data.filter(ListLogic.filterUnusedChecks));
                this.shadowRoot.getElementById("text").dataset.state = VALUE_STATES[res.value];
                this.setEntrances(res.entrances);
            }
        } else {
            this.shadowRoot.getElementById("text").dataset.state = "unavailable";
        }
    }

    setEntrances(active) {
        const entrances = this.shadowRoot.getElementById("entrances");
        entrances.innerHTML = "";
        if (active) {
            let el_icon = document.createElement("img");
            el_icon.src = `images/icons/entrance.svg`;
            entrances.append(el_icon);
        }
    }

    get ref() {
        return this.getAttribute('ref');
    }

    set ref(val) {
        this.setAttribute('ref', val);
    }

    get hint() {
        return this.getAttribute('hint');
    }

    set hint(val) {
        this.setAttribute('hint', val);
    }

    static get observedAttributes() {
        return ['ref', 'hint'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'ref':
                if (oldValue != newValue) {
                    this.update();
                    let txt = this.shadowRoot.getElementById("text");
                    txt.innerHTML = Language.translate(newValue);
                    this.hint = StateStorage.readExtra("area_hint", newValue, "");
                }
            break;
            case 'hint':
                if (oldValue != newValue) {
                    let hintEl = this.shadowRoot.getElementById("hint");
                    hintEl.innerHTML = "";
                    if (!!newValue && newValue != "") {
                        let el_icon = document.createElement("img");
                        el_icon.src = `images/icons/area_${newValue}.svg`;
                        hintEl.append(el_icon);
                    }
                }
            break;
        }
    }

    // TODO make generic using badge value in filter
    setFilterData(data) {
        let el_era = this.shadowRoot.getElementById("badge-era");
        if (!data["filter.era/child"]) {
            el_era.src = "images/icons/era_adult.svg";
        } else if (!data["filter.era/adult"]) {
            el_era.src = "images/icons/era_child.svg";
        } else {
            el_era.src = "images/icons/era_both.svg";
        }
        let el_time = this.shadowRoot.getElementById("badge-time");
        if (!data["filter.time/day"]) {
            el_time.src = "images/icons/time_night.svg";
        } else if (!data["filter.time/night"]) {
            el_time.src = "images/icons/time_day.svg";
        } else {
            el_time.src = "images/icons/time_always.svg";
        }
    }

}

customElements.define('ootrt-list-area', ListArea);