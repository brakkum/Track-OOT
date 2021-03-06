import Template from "/emcJS/util/Template.js";
import AbstractElement from "/editors/ui/logic/AbstractElement.js";

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
        .body.blank {
            font-style: italic;
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

export default class LogicElement extends AbstractElement {

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
        if (typeof val != "undefined" && val != null) {
            this.setAttribute('value', val);
        } else {
            this.removeAttribute('value');
        }
    }

    calculate(state = {}) {
        if (state.hasOwnProperty(this.ref)) {
            let val = !!this.value ? +(state[this.ref] == this.value) : +!!state[this.ref];
            this.shadowRoot.getElementById('header').setAttribute('value', val);
            return val;
        } else {
            this.shadowRoot.getElementById('header').setAttribute('value', "0");
            return 0;
        }
    }

    loadLogic(logic) {
        this.ref = logic.el;
        this.value = logic.value;
        this.category = logic.category;
    }

    toJSON() {
        if (!!this.value) {
            return {
                type: "state",
                el: this.ref,
                value: this.value,
                category: this.category
            };
        } else {
            return {
                type: "value",
                el: this.ref,
                category: this.category
            };
        }
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
                    if (typeof newValue == "string") {
                        if (!!newValue) {
                            this.shadowRoot.getElementById(name).innerHTML = newValue;
                            this.shadowRoot.getElementById(name).classList.remove("blank");
                        } else {
                            this.shadowRoot.getElementById(name).innerHTML = "[blank]";
                            this.shadowRoot.getElementById(name).classList.add("blank");
                        }
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

AbstractElement.registerReference("chest", LogicElement);
AbstractElement.registerReference("skulltula", LogicElement);
AbstractElement.registerReference("item", LogicElement);
AbstractElement.registerReference("skip", LogicElement);
AbstractElement.registerReference("option", LogicElement);
AbstractElement.registerReference("filter", LogicElement);
AbstractElement.registerReference("location", LogicElement);

customElements.define("tracker-logic-custom", LogicElement);