import GlobalData from "/emcJS/storage/GlobalData.js";
import Template from "/emcJS/util/Template.js";
import ManagedEventBinder from "/script/util/ManagedEventBinder.js";

import "/emcJS/ui/layout/Layout.js";
import "/script/ui/items/ItemGrid.js";
import "/script/ui/dungeonstate/DungeonState.js";
import "/script/ui/locations/LocationList.js";
import "/script/ui/map/Map.js";

const EVENT_BINDER = new ManagedEventBinder("layout");

const TPL = new Template(`
    <style>
        :host {
            display: flex;
            --item-size: 40px;
            justify-content: stretch;
            align-items: stretch;
        }
        #layout {
            flex: 1;
        }
    </style>
    <emc-layout id="layout">
    </emc-layout>
`);

class HTMLTrackerLayoutContainer extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
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
                    let layout = GlobalData.get("layouts")[newValue];
                    if (!!layout) {
                        EVENT_BINDER.reset();
                        this.shadowRoot.getElementById("layout").loadLayout(layout);
                    }
                }
            break;
        }
    }

}

customElements.define('ootrt-layoutcontainer', HTMLTrackerLayoutContainer);