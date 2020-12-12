import FileData from "/emcJS/storage/FileData.js";
import Template from "/emcJS/util/Template.js";
import GlobalStyle from "/emcJS/util/GlobalStyle.js";
import Panel from "/emcJS/ui/layout/Panel.js";
import Language from "/script/util/Language.js";
import "/script/state/items/ItemState.js";
import "/script/state/items/ItemInfState.js";
import "/script/state/items/ItemKeyState.js";
import "/script/state/items/ItemRewardState.js";
import "/script/state/items/ItemStartState.js";
import "./components/Item.js";
import "./components/ItemKey.js";
import "./components/InfiniteItem.js";
import "./components/RewardItem.js";

const TPL = new Template(`
<div id="content">
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
    display: block;
    min-width: min-content;
    min-height: min-content;
}
#content {
    display: content;
}
.item-row {
    display: flex;
}
.item {
    display: flex;
    padding: 2px;
}
.text,
.icon,
.empty {
    display: inline-block;
    width: 40px;
    height: 40px;
    padding: 2px;
}
`);

function createItem(value, data) {
    let type = 'ootrt-item';
    if (data.type === "infinite") {
        type = 'ootrt-infiniteitem';
    } else if (data.type === "dungeonreward") {
        type = 'ootrt-rewarditem';
    } else if (data.type === "key") {
        type = 'ootrt-itemkey';
    }
        
    const el = document.createElement(type);
    el.className = "item";
    el.title = Language.translate(value);
    el.setAttribute('i18n-tooltip', value);
    el.setAttribute('ref', value);
    return el;
}

function createText(value) {
    const el = document.createElement('DIV');
    el.classList.add("text");
    el.innerHTML = value;
    return el;
}

function createIcon(value) {
    const el = document.createElement('DIV');
    el.classList.add("icon");
    el.dataset.icon = value;
    return el;
}

function createEmpty() {
    const el = document.createElement('DIV');
    el.classList.add("empty");
    return el;
}

class HTMLTrackerItemGrid extends Panel {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
    }

    connectedCallback() {
        this.setAttribute("data-fontmod", "items");
        if (!this.items && !!this.grid) {
            this.items = JSON.stringify(FileData.get(`grids/${this.grid}`));
        }
    }

    get grid() {
        return this.getAttribute('grid');
    }

    set grid(val) {
        this.setAttribute('grid', val);
    }

    get items() {
        return this.getAttribute('items');
    }

    set items(val) {
        this.setAttribute('items', val);
    }

    static get observedAttributes() {
        return ['items', 'grid'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'grid':
                if (oldValue != newValue) {
                    if (!this.items && !!newValue) {
                        this.items = JSON.stringify(FileData.get(`grids/${newValue}`));
                    }
                }
                break;
            case 'items':
                if (oldValue != newValue) {
                    const content = this.shadowRoot.getElementById("content");
                    content.innerHTML = "";
                    const config = JSON.parse(newValue);
                    for (const row of config) {
                        const cnt = document.createElement('div');
                        cnt.classList.add("item-row");
                        const items = FileData.get("items");
                        for (const element of row) {
                            if (element.type == "item") {
                                const data = items[element.value];
                                cnt.append(createItem(element.value, data));
                            } else if (element.type == "text") {
                                cnt.append(createText(element.value));
                            } else if (element.type == "icon") {
                                cnt.append(createIcon(element.value));
                            } else {
                                cnt.append(createEmpty());
                            }
                        }
                        content.append(cnt);
                    }
                }
                break;
        }
    }

}

Panel.registerReference("item-grid", HTMLTrackerItemGrid);
customElements.define('ootrt-itemgrid', HTMLTrackerItemGrid);
