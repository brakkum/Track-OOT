import FileData from "/emcJS/storage/FileData.js";
import Template from "/emcJS/util/Template.js";

import Layout from "/emcJS/ui/layout/Layout.js";
import "/script/ui/items/ItemGrid.js";
import "/script/ui/dungeonstate/DungeonState.js";
import "/script/ui/world/LocationList.js";
import "/script/ui/world/Map.js";

const TPL = new Template(`
    <style>
        :host {
            --item-size: 40px;
            min-width: 100%;
            min-height: 100%;
        }
    </style>
`);

class HTMLTrackerLayoutContainer extends Layout {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
    }

    get layout() {
        return this.getAttribute('layout');
    }

    set layout(val) {
        this.setAttribute('layout', val);
    }

    static get observedAttributes() {
        return ['layout'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'layout':
                if (oldValue != newValue) {
                    const layout = FileData.get("layouts")[newValue];
                    if (layout) {
                        super.loadLayout(layout);
                    }
                }
                break;
        }
    }

}

customElements.define('ootrt-layoutcontainer', HTMLTrackerLayoutContainer);
