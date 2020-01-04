import Template from "/deepJS/util/Template.js";
import AbstractElement from "/deepJS/ui/logic/elements/AbstractElement.js";
import I18n from "/script/util/I18n.js";

const TPL_CAPTION = "CUSTOM";
const TPL_BACKGROUND = "#ffffff";
const TPL_BORDER = "#777777";

const TPL = new Template(`
    <style>
        :host {
            --logic-color-back: ${TPL_BACKGROUND};
            --logic-color-border: ${TPL_BORDER};
        }
        #value:empty {
            display: none;
        }
    </style>
    <div id="header" class="header">${TPL_CAPTION}</div>
    <div id="ref" class="body"></div>
    <div id="value" class="body"></div>
`);
const SVG = new Template(`
    <div class="logic-element" style="--logic-color-back: ${TPL_BACKGROUND}; --logic-color-border: ${TPL_BORDER};">
        <div class="header" data-value="0">${TPL_CAPTION}</div>
    </div>
`);

export default class LiteralCustom extends AbstractElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
    }

    get ref() {
        return this.getAttribute('ref');
    }

    set ref(val) {
        this.setAttribute('ref', val);
    }

    get category() {
        return this.getAttribute('category');
    }

    set category(val) {
        this.setAttribute('category', val);
    }

    get value() {
        return this.getAttribute('value');
    }

    set value(val) {
        this.setAttribute('value', val);
    }

    calculate(state = {}) {
        if (state.hasOwnProperty(this.ref)) {
            let val = !!this.expects ? +(state[this.ref] == this.expects) : +!!state[this.ref];
            this.shadowRoot.getElementById('header').setAttribute('value', val);
            return val;
        } else {
            this.shadowRoot.getElementById('header').setAttribute('value', "0");
            return 0;
        }
    }

    loadLogic(logic) {
        this.ref = logic.el;
        this.value = logic.value || "";
        this.category = logic.category;
    }

    toJSON() {
        if (!!this.value) {
            return {
                type: "value",
                el: this.ref,
                value: this.value,
                category: this.category
            };
        } else {
            return {
                type: "number",
                el: this.ref,
                category: this.category
            };
        }
    }

    static getSVG(logic) {
        return SVG.generate().children[0];
    }

    static get observedAttributes() {
        let attr = AbstractElement.observedAttributes;
        attr.push('ref', 'category', 'value');
        return attr;
    }
      
    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
            case 'ref':
            case 'value':
                if (oldValue != newValue) {
                    if (!!newValue) {
                        this.shadowRoot.getElementById(name).innerHTML = I18n.translate(newValue);
                    } else {
                        this.shadowRoot.getElementById(name).innerHTML = "";
                    }
                }
                break;
            case 'category':
                if (oldValue != newValue) {
                    if (!!newValue) {
                        this.shadowRoot.getElementById('header').innerHTML = newValue.toUpperCase();
                    } else {
                        this.shadowRoot.getElementById('header').innerHTML = TPL_CAPTION;
                    }
                }
                break;
        }
    }

}

AbstractElement.registerReference("chest", LiteralCustom);
AbstractElement.registerReference("skulltula", LiteralCustom);
AbstractElement.registerReference("item", LiteralCustom);
AbstractElement.registerReference("skip", LiteralCustom);
AbstractElement.registerReference("option", LiteralCustom);
AbstractElement.registerReference("filter", LiteralCustom);
customElements.define(`tracker-logic-custom`, LiteralCustom);