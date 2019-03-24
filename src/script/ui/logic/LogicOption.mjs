import Template from "/deepJS/util/Template.mjs";
import EventBus from "/deepJS/util/EventBus.mjs";
import {createOption} from "/deepJS/ui/UIHelper.mjs";
import DeepLogicAbstractElement from "/deepJS/ui/logic/elements/LogicAbstractElement.mjs";
import GlobalData from "/deepJS/storage/GlobalData.mjs";
import TrackerLocalState from "/script/util/LocalState.mjs";
import I18n from "/script/util/I18n.mjs";

const TPL = new Template(`
    <style>
        :host {
            --logic-color-back: white;
            --logic-color-border: lightgrey;
        }
        #selection.body.hidden {
            display: none;
        }
    </style>
    <div id="head" class="header">OPTION</div>
    <div id="ref" class="body"></div>
    <div id="selection" class="body hidden">
        <select id="select"></select>
    </div>
`);

const SELECTOR_VALUE = new WeakMap;

export default class TrackerLogicOption extends DeepLogicAbstractElement {

    constructor() {
        super();
        this.shadowRoot.appendChild(TPL.generate());
        EventBus.on("settings", () => {
            this.update();
        });
        let select = this.shadowRoot.getElementById('select');
        select.addEventListener('change', function(event) {
            SELECTOR_VALUE.set(this, select.value);
        }.bind(this));
    }

    update() {
        let value = TrackerLocalState.read("options", this.ref, GlobalData.get("settings").options[this.ref].default);
        if (SELECTOR_VALUE.has(this)) {
            value = value == SELECTOR_VALUE.get(this);
        }
        this.value = value;
        this.shadowRoot.getElementById("head").dataset.value = value;
    }

    toJSON() {
        if (this.children.length > 0) {
            let el = this.children[0];
            if (!!el) {
                el = el.toJSON();
            }
            let value;
            if (SELECTOR_VALUE.has(this)) {
                value = SELECTOR_VALUE.get(this);
            }
            return {
                type: "option",
                el: this.ref,
                value: value
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
        super.attributeChangedCallback(name, oldValue, newValue);
        switch (name) {
            case 'ref':
                if (oldValue != newValue) {
                    let bdy = this.shadowRoot.getElementById("ref");
                    bdy.innerHTML = I18n.translate(this.ref);
                    let data = GlobalData.get("settings").options[this.ref];
                    let el = this.shadowRoot.getElementById('select');
                    let slc = this.shadowRoot.getElementById('selection');
                    if (Array.isArray(data.values)) {
                        slc.classList.remove('hidden');
                        el.innerHTML = "";
                        for (let i of data.values) {
                            el.appendChild(createOption(i, I18n.translate(i)));
                        }
                        if (SELECTOR_VALUE.has(this)) {
                            el.value = SELECTOR_VALUE.get(this);
                        } else {
                            el.value = data.default;
                        }
                    } else {
                        slc.classList.add('hidden');
                        el.innerHTML = "";
                        el.value = "";
                    }
                    this.update();
                }
                break;
            case 'readonly':
                if (oldValue != newValue) {
                    let select = this.shadowRoot.getElementById('select');
                    select.readOnly = newValue != null && newValue != "false";
                }
                break;
        }
    }

    loadLogic(logic) {
        if (!!logic) {
            if (!!logic.value) {
                SELECTOR_VALUE.set(this, logic.value);
            } else if (SELECTOR_VALUE.has(this)) {
                SELECTOR_VALUE.remove(this);
            }
            this.ref = logic.el;
        }
    }

}

DeepLogicAbstractElement.registerReference("option", TrackerLogicOption);
customElements.define('tracker-logic-option', TrackerLogicOption);