import Template from "/emcJS/util/Template.js";
import AbstractElement from "/emcJS/ui/logic/elements/AbstractElement.js";
import Dialog from "/emcJS/ui/Dialog.js";
import Logic from "/script/util/Logic.js";
import Language from "/script/util/Language.js";
import LogicViewer from "/script/ui/LogicViewer.js";

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
    </style>
    <div id="header" class="header">MIXIN<span id="view">view</span></div>
    <div id="ref" class="body"></div>
`);
const SVG = new Template(`
    <div class="logic-element" style="--logic-color-back: ${TPL_BACKGROUND}; --logic-color-border: ${TPL_BORDER};">
        <div class="header" data-value="0">${TPL_CAPTION}</div>
    </div>
`);

function showLogic(ref, calculate) {
    let d = new Dialog({
        title: `MIXIN - ${ref}`,
        submit: "OK"
    });
    d.value = ref;
    d.append(Logic.getLogicView(ref, calculate));
    d.show();
}

export default class LiteralMixin extends AbstractElement {

    constructor() {
        super();
        this.shadowRoot.append(TPL.generate());
        this.shadowRoot.getElementById("view").addEventListener("click", function(event) {
            let title = Language.translate(this.ref);
            LogicViewer.show(this.ref, title);
        }.bind(this));
    }

    get ref() {
        return this.getAttribute('ref');
    }

    set ref(val) {
        this.setAttribute('ref', val);
    }

    calculate(state = {}) {
        if (state.hasOwnProperty(this.ref)) {
            let val = +!!state[this.ref];
            this.shadowRoot.getElementById('header').setAttribute('value', val);
            return val;
        } else {
            this.shadowRoot.getElementById('header').setAttribute('value', "0");
            return 0;
        }
    }

    loadLogic(logic) {
        this.ref = logic.el;
        this.shadowRoot.getElementById("ref").innerHTML = Language.translate(this.ref);
    }

    toJSON() {
        return {
            type: "number",
            el: this.ref,
            category: "mixin"
        };
    }

    static getSVG(logic) {
        return SVG.generate().children[0];
    }

    static get observedAttributes() {
        let attr = AbstractElement.observedAttributes;
        attr.push('ref');
        return attr;
    }
      
    attributeChangedCallback(name, oldValue, newValue) {
        super.attributeChangedCallback(name, oldValue, newValue);
        if (name == "ref") {
            if (oldValue != newValue) {
                if (!!newValue) {
                    this.shadowRoot.getElementById('ref').innerHTML = Language.translate(newValue);
                } else {
                    this.shadowRoot.getElementById('ref').innerHTML = "";
                }
            }
        }
    }

}

AbstractElement.registerReference("mixin", LiteralMixin);
customElements.define(`tracker-logic-mixin`, LiteralMixin);