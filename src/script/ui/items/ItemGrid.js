import GlobalData from "/emcJS/storage/GlobalData.js";
import Template from "/emcJS/util/Template.js";
import Panel from "/emcJS/ui/layout/Panel.js";
import Language from "/script/util/Language.js";
import "./Item.js";
import "./InfiniteItem.js";

// TODO use same method as in DungeonState (no extra container)

const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
        }
        :host {
            display: inline-block;
            min-width: min-content;
            min-height: min-content;
        }
        div.item-row {
            display: flex;
        }
        ootrt-item,
        ootrt-infiniteitem {
            display: block;
            padding: 5px;
        }
        ootrt-item:hover,
        ootrt-infiniteitem:hover {
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

function createItem(value, data) {
    if (data.max === false) {
        let el = document.createElement('ootrt-infiniteitem');
        el.title = Language.translate(value);
        el.setAttribute('i18n-tooltip', value);
        el.setAttribute('ref', value);
        return el;
    } else {
        let el = document.createElement('ootrt-item');
        el.title = Language.translate(value);
        el.setAttribute('i18n-tooltip', value);
        el.setAttribute('ref', value);
        return el;
    }
}

function createText(value) {
    let el = document.createElement('DIV');
    el.classList.add("text");
    el.innerHTML = value;
    return el;
}

function createIcon(value) {
    let el = document.createElement('DIV');
    el.classList.add("icon");
    el.dataset.icon = value;
    return el;
}

function createEmpty() {
    let el = document.createElement('DIV');
    el.classList.add("empty");
    return el;
}

class HTMLTrackerItemGrid extends Panel {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
    }

    connectedCallback() {
        if (!this.items) {
            this.items = JSON.stringify(GlobalData.get("grids/items"));
        }
    }

    get items() {
        return this.getAttribute('items');
    }

    set items(val) {
        this.setAttribute('items', val);
    }

    static get observedAttributes() {
        return ['items'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'items':
                if (oldValue != newValue) {
                    let config = JSON.parse(newValue);
                    for (let row of config) {
                        let cnt = document.createElement('div');
                        cnt.classList.add("item-row");
                        let items = GlobalData.get("items");
                        for (let element of row) {
                            if (element.type == "item") {
                                let data = items[element.value];
                                cnt.append(createItem(element.value, data));
                            } else if (element.type == "text") {
                                cnt.append(createText(element.value));
                            } else if (element.type == "icon") {
                                cnt.append(createIcon(element.value));
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

Panel.registerReference("item-grid", HTMLTrackerItemGrid);
customElements.define('ootrt-itemgrid', HTMLTrackerItemGrid);