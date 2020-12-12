import FileData from "/emcJS/storage/FileData.js";
import Template from "/emcJS/util/Template.js";
import "./ShopField.js";

const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
        }
        :host {
            display: inline-block;
            padding: 20px;
        }
    </style>
`);

export default class HTMLTrackerShopList extends HTMLElement {
    
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        const shops = FileData.get("shops");
        for (const i in shops) {
            const el = document.createElement("ootrt-shopfield");
            el.ref = i;
            this.shadowRoot.append(el);
        }
    }

}

customElements.define('ootrt-shoplist', HTMLTrackerShopList);
