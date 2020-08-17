import Template from "/emcJS/util/Template.js";
import AbstractElement from "/editors/ui/logic/AbstractElement.js";
import LogicViewer from "./LogicViewer.js";

const TPL_CAPTION = "MIXIN";
const TPL_BACKGROUND = "#ffffff";
const TPL_BORDER = "#777777";

const TPL = new Template(`
    <style>
        :host {
            --logic-color-back: ${TPL_BACKGROUND};
            --logic-color-border: ${TPL_BORDER};
        }
        #view {
            margin-left: 8px;
            padding: 5px;
            background: #cccccc;
            cursor: pointer;
        }
        .body.blank {
            font-style: italic;
        }
    </style>
    <div id="header" class="header"><span id="header-name">${TPL_CAPTION}</span><span id="view">view</span></div>
    <div id="ref" class="body"></div>
`);
const SVG = new Template(`
    <div class="logic-element" style="--logic-color-back: ${TPL_BACKGROUND}; --logic-color-border: ${TPL_BORDER};">
        <div class="header" data-value="0">${TPL_CAPTION}</div>
    </div>
`);

export default class LiteralMixin extends AbstractElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        this.shadowRoot.getElementById("view").addEventListener("click", function(event) {
            let title = this.ref;
            LogicViewer.show(this.ref, title);
        }.bind(this));
    }

    get ref() {
        return this.getAttribute('ref');
    }

    set ref(val) {
        this.setAttribute('ref', val);
    }

    get type() {
        return this.getAttribute('type');
    }

    set type(val) {
        this.setAttribute('type', val);
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
        this.type = logic.type;
    }

    toJSON() {
        return {
            type: this.type,
            el: this.ref
        };
    }

    static getSVG(logic) {
        return SVG.generate().children[0];
    }

    static get observedAttributes() {
        let attr = AbstractElement.observedAttributes;
        attr.push('ref', 'type');
        return attr;
    }
      
    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
            case 'ref':
                if (oldValue != newValue) {
                    if (typeof newValue == "string") {
                        if (!!newValue) {
                            this.shadowRoot.getElementById('ref').innerHTML = newValue;
                            this.shadowRoot.getElementById('ref').classList.remove("blank");
                        } else {
                            this.shadowRoot.getElementById('ref').innerHTML = "[blank]";
                            this.shadowRoot.getElementById('ref').classList.add("blank");
                        }
                    } else {
                        this.shadowRoot.getElementById('ref').innerHTML = "";
                    }
                }
                break;
            case 'type':
                if (oldValue != newValue) {
                    if (!!newValue) {
                        this.shadowRoot.getElementById('header-name').innerHTML = newValue.toUpperCase();
                    } else {
                        this.shadowRoot.getElementById('header-name').innerHTML = TPL_CAPTION;
                    }
                }
                break;
        }
    }

}

AbstractElement.registerReference("mixin", LiteralMixin);
AbstractElement.registerReference("function", LiteralMixin);

customElements.define(`tracker-logic-mixin`, LiteralMixin);