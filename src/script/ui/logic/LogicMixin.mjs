import Template from "/deepJS/util/Template.mjs";
import DeepLogicAbstractElement from "/deepJS/ui/logic/elements/LogicAbstractElement.mjs";
import TrackerLogic from "/script/util/Logic.mjs";

const TPL = new Template(`
    <style>
        :host {
            --logic-color-back: white;
            --logic-color-border: lightgrey;
        }
    </style>
    <div class="header">MIXIN</div>
    <div id="ref" class="body"></div>
`);

export default class TrackerLogicMixin extends DeepLogicAbstractElement {

    constructor() {
        super();
        this.shadowRoot.appendChild(TPL.generate());
    }

    update() {
        this.value = TrackerLogic.getValue(this.ref);
        this.shadowRoot.getElementById("head").dataset.value = this.value;
    }

    toJSON() {
        if (this.children.length > 0) {
            let el = this.children[0];
            if (!!el) {
                el = el.toJSON();
            }
            return {
                type: "item",
                item: this.ref
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

DeepLogicAbstractElement.registerReference("mixin", TrackerLogicMixin);
customElements.define('tracker-logic-mixin', TrackerLogicMixin);