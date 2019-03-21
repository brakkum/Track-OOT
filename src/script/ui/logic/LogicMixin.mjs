import Template from "/deepJS/util/Template.mjs";
import EventBus from "/deepJS/util/EventBus.mjs";
import DeepLogicAbstractElement from "/deepJS/ui/logic/elements/LogicAbstractElement.mjs";
import Dialog from "/deepJS/ui/Dialog.mjs";
import Logic from "/script/util/Logic.mjs";
import I18n from "/script/util/I18n.mjs";

const TPL = new Template(`
    <style>
        :host {
            --logic-color-back: white;
            --logic-color-border: lightgrey;
        }
        :host(:not([visualize])) #view,
        :host([visualize="false"]) #view {
            display: none;
        }
        #view {
            margin-left: 8px;
            padding: 5px;
            background: #cccccc;
            cursor: pointer;
        }
    </style>
    <div id="head" class="header">MIXIN<span id="view">view</span></div>
    <div id="ref" class="body"></div>
`);

function showLogic(ref) {
    let d = new Dialog({
        title: `MIXIN - ${ref}`,
        submit: "OK"
    });
    d.value = ref;
    d.appendChild(Logic.getLogicView("mixins", ref));
    d.show();
}

export default class TrackerLogicMixin extends DeepLogicAbstractElement {

    constructor() {
        super();
        this.shadowRoot.appendChild(TPL.generate());
        EventBus.on("logic", function(type, ref) {
            if ("mixins" == type && this.ref == ref) {
                this.update();
            }
        }.bind(this));
        this.shadowRoot.getElementById("view").addEventListener("click", function(event) {
            showLogic(this.ref);
        }.bind(this));
    }

    update() {
        this.value = Logic.getValue("mixins", this.ref);
        this.shadowRoot.getElementById("head").dataset.value = this.value;
    }

    toJSON() {
        if (this.children.length > 0) {
            let el = this.children[0];
            if (!!el) {
                el = el.toJSON();
            }
            return {
                type: "mixin",
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
        let attr = DeepLogicAbstractElement.observedAttributes;
        attr.push('ref');
        return attr;
    }
      
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'ref':
                if (oldValue != newValue) {
                    this.shadowRoot.getElementById("ref").innerHTML = I18n.translate(this.ref);
                    this.update();
                }
                break;
            default: 
                super.attributeChangedCallback(name, oldValue, newValue);
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