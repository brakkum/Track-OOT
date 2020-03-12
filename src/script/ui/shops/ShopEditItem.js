import GlobalData from "/emcJS/storage/GlobalData.js";
import Template from "/emcJS/util/Template.js";
import Language from "/script/util/Language.js";

const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
        }
        :host {
            display: inline-flex;
            flex-direction: column;
            width: 200px;
            height: 150px;
            padding: 10px;
            margin: 5px;
            color: white;
            background-color: black;
            cursor: pointer;
        }
        #image {
            height: 40px;
            margin-bottom: 5px;
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            background-origin: content-box;
        }
        #title {
            flex: 1;
        }
        #price {
            height: 10px;
            text-align: right;
        }
        #price:after {
            display: inline-block;
            width: 10px;
            height: 10px;
            margin-left: 5px;
            background-image: url('/images/items/rupees.png');
            background-size: 14px;
            background-position: center;
            background-repeat: no-repeat;
            content: " ";
        }
    </style>
    <div id="image"></div>
    <div id="title"></div>
    <div id="price"></div>
`);

export default class HTMLTrackerShopEditItem extends HTMLElement {
    
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

    get price() {
        return this.getAttribute('price');
    }

    set price(val) {
        this.setAttribute('price', val);
    }

    get checked() {
        return this.getAttribute('checked');
    }

    set checked(val) {
        this.setAttribute('checked', val);
    }

    static get observedAttributes() {
        return ['ref', 'price', 'checked'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'ref':
                if (oldValue != newValue) {
                    this.shadowRoot.getElementById("title").innerHTML = Language.translate(newValue);
                    if (!!this.checked && this.checked == "true") {
                        this.shadowRoot.getElementById("image").style.backgroundImage = `url("/images/items/sold_out.png")`;
                    } else {
                        let img = GlobalData.get("shop_items")[this.ref].image;
                        this.shadowRoot.getElementById("image").style.backgroundImage = `url("${img}")`;
                    }
                }
            break;
            case 'price':
                if (oldValue != newValue) {
                    this.shadowRoot.getElementById("price").innerHTML = newValue;
                }
            break;
            case 'checked':
                if (oldValue != newValue) {
                    if (!!this.checked && this.checked == "true") {
                        this.shadowRoot.getElementById("image").style.backgroundImage = `url("/images/items/sold_out.png")`;
                    } else {
                        let img = GlobalData.get("shop_items")[this.ref].image;
                        this.shadowRoot.getElementById("image").style.backgroundImage = `url("${img}")`;
                    }
                }
            break;
        }
    }

}

customElements.define('ootrt-shopedititem', HTMLTrackerShopEditItem);