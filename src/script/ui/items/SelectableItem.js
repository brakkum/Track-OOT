import FileData from "/emcJS/storage/FileData.js";
import Template from "/emcJS/util/Template.js";
import EventBusSubsetMixin from "/emcJS/mixins/EventBusSubset.js";
import "/emcJS/ui/selection/Option.js";
import StateStorage from "/script/storage/StateStorage.js";

const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
            user-select: none;
        }
        :host {
            display: inline-flex;
            width: 40px;
            height: 40px;
            cursor: pointer;
            background-size: 80%;
            background-repeat: no-repeat;
            background-position: center;
            background-origin: border-box;
        }
        :host(:hover) {
            background-size: 100%;
        }
    </style>
    </div>
`);

class HTMLTrackerSelectableItem extends EventBusSubsetMixin(HTMLElement) {

    constructor() {
        super();
        this.addEventListener("click", this.select);
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        /* event bus */
    }

    get ref() {
        return this.getAttribute('ref');
    }

    set ref(val) {
        this.setAttribute('ref', val);
    }

    static get observedAttributes() {
        return ['ref'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case 'ref':
                    let data = FileData.get("items")[newValue];
                    const bgImage = Array.isArray(data.images) ? data.images[0] : data.images;
                    this.style.backgroundImage = `url("${bgImage}")`;
                break;
            }
        }
    }

    select(event) {
        if (!event) return;
        event.preventDefault();

        this.dispatchEvent(new CustomEvent('select', { detail: this.ref }));
        return false;
    }

}

customElements.define('ootrt-selectableitem', HTMLTrackerSelectableItem);