import Template from "/deepJS/util/Template.mjs";
import EventBus from "/deepJS/util/EventBus.mjs";
import DeepLogicAbstractElement from "/deepJS/ui/logic/elements/LogicAbstractElement.mjs";
import Dialog from "/deepJS/ui/Dialog.mjs";
import Logic from "/script/util/Logic.mjs";
import I18n from "/script/util/I18n.mjs";

const TPL = new Template(`
    <style>
        :host {
            --logic-color-back: #b4e2d1;
            --logic-color-border: #3228bf;
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
const SVG = new Template(`
    <div class="logic-element" style="--logic-color-back: #b4e2d1; --logic-color-border: #3228bf;">
        <div class="header">MIXIN</div>
        <div class="body"></div>
    </div>
`);

function showLogic(ref) {
    let d = new Dialog({
        title: `MIXIN - ${ref}`,
        submit: "OK"
    });
    d.value = ref;
    d.append(Logic.getLogicView("mixins", ref));
    d.show();
}

export default class TrackerLogicMixin extends DeepLogicAbstractElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        EventBus.on("logic", function(event) {
            if ("mixins" == event.data.type && this.ref == event.data.ref) {
                this.update();
            }
        }.bind(this));
        this.shadowRoot.getElementById("view").addEventListener("click", function(event) {
            showLogic(this.ref);
        }.bind(this));
    }

    update() {
        this.value = Logic.getValue("mixins", this.ref);
    }

    toJSON() {
        return {
            type: "mixin",
            el: this.ref
        };
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
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
            case 'ref':
                if (oldValue != newValue) {
                    this.shadowRoot.getElementById("ref").innerHTML = I18n.translate(this.ref);
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

    static getSVG(logic) {
        let el = SVG.generate().children[0];
        let cnt = el.querySelector(".body");
        let hdr = el.querySelector(".header");
        if (!!logic) {
            cnt.innerHTML = I18n.translate(logic.el);
            let itm = Logic.getLogicSVG("mixins", logic.el);
            cnt.append(itm.querySelector(".logic-element"));
            let value = +Logic.getValue("mixins", logic.el);
            el.dataset.value = value;
            hdr.dataset.value = value;
        }
        return el;
    }

}

DeepLogicAbstractElement.registerReference("mixin", TrackerLogicMixin);
customElements.define('tracker-logic-mixin', TrackerLogicMixin);