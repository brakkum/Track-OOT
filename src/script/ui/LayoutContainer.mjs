import GlobalData from "/deepJS/storage/GlobalData.mjs";
import Template from "/deepJS/util/Template.mjs";

import "/deepJS/ui/layout/Layout.mjs";
import "/script/ui/items/ItemGrid.mjs";
import "/script/ui/dungeonstate/DungeonState.mjs";
import "/script/ui/locations/LocationList.mjs";
import "/script/ui/map/Map.mjs";

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
    <deep-layout id="layout">
    </deep-layout>
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
                        this.shadowRoot.getElementById("layout").loadLayout(layout);
                    }
                }
            break;
        }
    }

}

customElements.define('ootrt-layoutcontainer', HTMLTrackerLayoutContainer);