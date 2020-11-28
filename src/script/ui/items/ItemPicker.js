import FileData from "/emcJS/storage/FileData.js";
import Template from "/emcJS/util/Template.js";
import Panel from "/emcJS/ui/layout/Panel.js";
import Language from "/script/util/Language.js";
import "./components/SelectableItem.js";

const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
        }
        :host {
            display: block;
            min-width: min-content;
            min-height: min-content;
        }
        div.item-row {
            display: flex;
        }
        .item {
            display: flex;
            padding: 2px;
        }
        div.text,
        div.icon,
        div.empty {
            display: inline-block;
            width: 40px;
            height: 40px;
            padding: 2px;
        }
    </style>
`);

function createItem(value) {        
    let el = document.createElement('ootrt-selectableitem');
    el.className = "item";
    el.title = Language.translate(value);
    el.setAttribute('i18n-tooltip', value);
    el.setAttribute('ref', value);
    return el;
}

function createEmpty() {
    let el = document.createElement('DIV');
    el.classList.add("empty");
    return el;
}

class HTMLTrackerItemPicker extends Panel {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
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
                    let config = JSON.parse(newValue);
                    for (let row of config) {
                        let cnt = document.createElement('div');
                        cnt.classList.add("item-row");
                        for (let element of row) {
                            if (element.type == "item") {
                                let item = createItem(element.value);
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
                        this.shadowRoot.append(cnt);
                    }
                }
            break;
        }
    }

}

customElements.define('ootrt-itempicker', HTMLTrackerItemPicker);