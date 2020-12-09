import FileData from "/emcJS/storage/FileData.js";
import Template from "/emcJS/util/Template.js";
import GlobalStyle from "/emcJS/util/GlobalStyle.js";
import Panel from "/emcJS/ui/layout/Panel.js";
import Language from "/script/util/Language.js";
import "./components/SelectableItem.js";

const TPL = new Template(`
<div id="content">
</div>
`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
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

function createItem(value) {        
    const el = document.createElement('ootrt-selectableitem');
    el.className = "item";
    el.title = Language.translate(value);
    el.setAttribute('i18n-tooltip', value);
    el.setAttribute('ref', value);
    return el;
}

function createEmpty() {
    const el = document.createElement('DIV');
    el.classList.add("empty");
    return el;
}

class HTMLTrackerItemPicker extends Panel {

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
                        for (const element of row) {
                            if (element.type == "item") {
                                const item = createItem(element.value);
                                item.addEventListener("select", event => {
                                    this.dispatchEvent(new CustomEvent('pick', { detail: event.item }));
                                    event.preventDefault();
                                    return false;
                                });
                                cnt.append(item);
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

customElements.define('ootrt-itempicker', HTMLTrackerItemPicker);