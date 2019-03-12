import Template from "/deepJS/util/Template.mjs";
import EventBus from "/deepJS/util/EventBus.mjs";
import DeepLogicAbstractElement from "/deepJS/ui/logic/elements/LogicAbstractElement.mjs";
import GlobalData from "/deepJS/storage/GlobalData.mjs";
import MemoryStorage from "/deepJS/storage/MemoryStorage.mjs";

const TPL = new Template(`
    <style>
        :host {
            --logic-color-back: white;
            --logic-color-border: lightgrey;
        }
    </style>
    <div id="head" class="header">FILTER</div>
    <div id="ref" class="body"></div>
`);

export default class TrackerLogicFilter extends DeepLogicAbstractElement {

    constructor() {
        super();
        this.shadowRoot.appendChild(TPL.generate());
        EventBus.on("filter", ref => {
            if (ref == this.ref) {
                this.update();
            }
        });
    }

    update() {
        this.value = MemoryStorage.get("active_filter", this.ref, GlobalData.get("filter")[this.ref].default);
        this.shadowRoot.getElementById("head").dataset.value = this.value;
    }

    toJSON() {
        if (this.children.length > 0) {
            let el = this.children[0];
            if (!!el) {
                el = el.toJSON();
            }
            return {
                type: "filter",
                el: this.ref
            };
        }
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
        switch (name) {
            case 'ref':
                if (oldValue != newValue) {
                    this.shadowRoot.getElementById("ref").innerHTML = this.ref;
                    this.update();
                }
                break;
        }
    }

    loadLogic(logic) {
        if (!!logic) {
            this.ref = logic.el;
        }
    }

}

DeepLogicAbstractElement.registerReference("filter", TrackerLogicFilter);
customElements.define('tracker-logic-filter', TrackerLogicFilter);