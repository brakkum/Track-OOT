import Template from "/deepJS/util/Template.js";
import EventBus from "/deepJS/util/events/EventBus.js";
import LogicAbstractElement from "/deepJS/ui/logic/elements/LogicAbstractElement.js";
import StateStorage from "/script/storage/StateStorage.js";
import I18n from "/script/util/I18n.js";

const TPL = new Template(`
    <style>
        :host {
            --logic-color-back: white;
            --logic-color-border: lightgrey;
        }
        :host([visualize]:not([visualize="false"])[value]) .header:before {
            background-color: #85ff85;
            content: attr(data-value);
        }
        :host([visualize]:not([visualize="false"])[value="0"]) .header:before {
            background-color: #ff8585;
        }
    </style>
    <div id="head" class="header">SKULLTULA</div>
    <div id="ref" class="body"></div>
`);
const SVG = new Template(`
    <div class="logic-element" style="--logic-color-back: white; --logic-color-border: lightgrey;">
        <div class="header">SKULLTULA</div>
        <div class="body"></div>
    </div>
`);

export default class TrackerLogicSkulltula extends LogicAbstractElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        EventBus.register("skulltula", function(event) {
            if (event.data.name == this.ref) {
                this.update(event.data.value);
            }
        }.bind(this));
        EventBus.register("state", function(event) {
            this.update(event.data[`skulltulas.${this.ref}`]);
            this.update(value);
        }.bind(this));
    }

    update(value) {
        if (typeof value == "undefined") {
            value = StateStorage.read(`skulltulas.${this.ref}`, false);
        }
        this.value = value;
    }

    toJSON() {
        return {
            type: "skulltula",
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
        let attr = LogicAbstractElement.observedAttributes;
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
            let value = +StateStorage.read(`skulltulas.${logic.el}`, false);
            el.dataset.value = value;
            hdr.dataset.value = value;
        }
        return el;
    }

}

LogicAbstractElement.registerReference("skulltula", TrackerLogicSkulltula);
customElements.define('tracker-logic-skulltula', TrackerLogicSkulltula);