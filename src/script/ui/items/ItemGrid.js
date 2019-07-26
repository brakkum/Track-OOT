import GlobalData from "/deepJS/storage/GlobalData.js";
import Template from "/deepJS/util/Template.js";
import Panel from "/deepJS/ui/layout/Panel.js";
import I18n from "/script/util/I18n.js";
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
        div.text {
            display: inline-block;
            width: 40px;
            height: 40px;
            padding: 2px;
        }
    </style>
`);

function createItemText(text) {
    let el = document.createElement('DIV');
    el.classList.add("text");
    el.innerHTML = text;
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
            this.items = GlobalData.get("grids")["items"].map(e=>e.join(" ")).join(",");
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
                    let els = newValue.split(",").map(e=>e.split(" "));
                    for (let i of els) {
                        let cnt = document.createElement('div');
                        cnt.classList.add("item-row");
                        for (let j of i) {
                            if (j.startsWith("text:")) {
                                cnt.append(createItemText(j.slice(5)));
                            } else {
                                let data = GlobalData.get("items")[j];
                                if (data.max === false) {
                                    let itm = document.createElement('ootrt-infiniteitem');
                                    itm.title = I18n.translate(j);
                                    itm.setAttribute('ref', j);
                                    cnt.append(itm);
                                } else {
                                    let itm = document.createElement('ootrt-item');
                                    itm.title = I18n.translate(j);
                                    itm.setAttribute('ref', j);
                                    cnt.append(itm);
                                }
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