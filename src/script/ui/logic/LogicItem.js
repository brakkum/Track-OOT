import Template from "/deepJS/util/Template.js";
import EventBus from "/deepJS/util/EventBus/EventBus.js";
import DeepLogicAbstractElement from "/deepJS/ui/logic/elements/LogicAbstractElement.js";
import TrackerLocalState from "/script/util/LocalState.js";
import I18n from "/script/util/I18n.js";

const TPL = new Template(`
    <style>
        :host {
            --logic-color-back: white;
            --logic-color-border: lightgrey;
        }
    </style>
    <div id="head" class="header">ITEM</div>
    <div id="ref" class="body"></div>
`);
const SVG = new Template(`
    <div class="logic-element" style="--logic-color-back: white; --logic-color-border: lightgrey;">
        <div class="header">ITEM</div>
        <div class="body"></div>
    </div>
`);

export default class TrackerLogicItem extends DeepLogicAbstractElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        EventBus.register("item", function(event) {
            if (event.data.name == this.ref) {
                this.update(event.data.value);
            }
        }.bind(this));
        EventBus.register("state", function(event) {
            let value;
            if (!!event.data.items) {
                value = event.data.items[this.ref];
            }
            this.update(value);
        }.bind(this));
    }

    update(value) {
        if (typeof value == "undefined") {
            value = TrackerLocalState.read("items", this.ref, 0);
        }
        this.value = value;
    }

    toJSON() {
        return {
            type: "item",
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
            let value = +TrackerLocalState.read("items", logic.el, 0);
            el.dataset.value = value;
            hdr.dataset.value = value;
        }
        return el;
    }

}

DeepLogicAbstractElement.registerReference("item", TrackerLogicItem);
customElements.define('tracker-logic-item', TrackerLogicItem);