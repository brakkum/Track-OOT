import FileData from "/emcJS/storage/FileData.js";
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
        #info {
            display: flex;
            height: 20px;
        }
        #name {
            width: 100px;
            background-color: #2b2b2b;
            color: white;
            border: solid 1px #929292;
            padding: 2px;
        }
        #price {
            flex: 1;
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
    <div id="info">
        <input id="name" placeholder="you" autocomplete="off">
        <div id="price"></div>
    </div>
`);

export default class HTMLTrackerShopItem extends HTMLElement {
    
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        this.shadowRoot.getElementById("name").addEventListener("change", event => {
            this.name = event.target.value;
            const e = new Event("namechange");
            e.name = this.name;
            this.dispatchEvent(e);
        });
        this.shadowRoot.getElementById("name").addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            return false;
        }, true);
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

    get name() {
        return this.getAttribute('name');
    }

    set name(val) {
        this.setAttribute('name', val);
    }

    static get observedAttributes() {
        return ['ref', 'price', 'checked', 'name'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'ref':
                if (oldValue != newValue) {
                    this.shadowRoot.getElementById("title").innerHTML = Language.translate(newValue);
                    if (!!this.checked && this.checked == "true") {
                        this.shadowRoot.getElementById("image").style.backgroundImage = `url("/images/items/sold_out.png")`;
                    } else {
                        const data = FileData.get("shop_items")[this.ref];
                        if (data) {
                            this.shadowRoot.getElementById("image").style.backgroundImage = `url("${data.image}")`;
                        } else {
                            this.shadowRoot.getElementById("image").style.backgroundImage = `url("/images/items/unknown.svg")`;
                        }
                    }
                }
                break;
            case 'price':
                newValue = parseInt(newValue) || 0;
                if (oldValue != newValue) {
                    this.shadowRoot.getElementById("price").innerHTML = newValue;
                }
                break;
            case 'checked':
                if (oldValue != newValue) {
                    if (!!this.checked && this.checked == "true") {
                        this.shadowRoot.getElementById("image").style.backgroundImage = `url("/images/items/sold_out.png")`;
                    } else {
                        const data = FileData.get("shop_items")[this.ref];
                        if (data != null) {
                            this.shadowRoot.getElementById("image").style.backgroundImage = `url("${data.image}")`;
                        } else {
                            this.shadowRoot.getElementById("image").style.backgroundImage = `url("/images/items/unknown.svg")`;
                        }
                    }
                }
                break;
            case 'name':
                if (typeof newValue != "string") {
                    newValue = "";
                }
                if (oldValue != newValue) {
                    const el = this.shadowRoot.getElementById("name");
                    el.value = newValue;
                }
                break;
        }
    }

}

customElements.define('ootrt-shopitem', HTMLTrackerShopItem);
