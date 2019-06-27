import Template from "/script/util/Template.mjs";
import I18n from "/script/util/I18n.mjs";

const TPL = new Template(`
    <style>
        #name {
            border-style: solid;
            border-width: 2px;
            border-color: #fff;
            overflow: hidden;
        }
    </style>
    <div id="name">
    </div>
`);

export default class HTMLTrackerPanel extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
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
                    let title = I18n.translate(newValue);
                    let el = this.shadowRoot.getElementById("name");
                    el.innerHTML = title;
                    el.setAttribute("title", title);
                }
            break;
        }
    }

}

customElements.define('ootrt-panel', HTMLTrackerPanel);