import Template from "/deepJS/util/Template.js";
import Dialog from "/script/ui/shops/ShopItemChoice.js";
import I18n from "/script/util/I18n.js";
import "./ShopEditItem.js";

const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
        }
        :host {
            display: inline-grid;
            grid-template-columns: auto auto auto auto;
            grid-template-rows: auto auto;
            padding: 10px;
            margin: 5px;
            color: white;
            background-color: #222222;
        }
    </style>
    <ootrt-shopedititem id="slot0"></ootrt-shopedititem>
    <ootrt-shopedititem id="slot1"></ootrt-shopedititem>
    <ootrt-shopedititem id="slot2"></ootrt-shopedititem>
    <ootrt-shopedititem id="slot3"></ootrt-shopedititem>
    <ootrt-shopedititem id="slot4"></ootrt-shopedititem>
    <ootrt-shopedititem id="slot5"></ootrt-shopedititem>
    <ootrt-shopedititem id="slot6"></ootrt-shopedititem>
    <ootrt-shopedititem id="slot7"></ootrt-shopedititem>
`);

function editSlot(event) {
    let d = new Dialog(I18n.translate(this.ref));
    d.value = event.target.ref;
    d.addEventListener("submit", function(target, result) {
        if (!!result) {
            this[target] = `${result.ref},${result.price}`;
        }
    }.bind(this, event.target.id));
    d.show();
}

export default class HTMLTrackerShopBuilder extends HTMLElement {
    
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        for (let i = 0; i < 8; ++i) {
            let el = this.shadowRoot.getElementById(`slot${i}`);
            el.onclick = editSlot.bind(this);
        }
    }

    get value() {
        let res = [];
        for (let i = 0; i < 8; ++i) {
            let buf = this[`slot${i}`].split(",");
            res.push({
                item: buf[0],
                price: buf[1]
            });
        }
        return res;
    }

    set value(val) {
        for (let i = 0; i < 8; ++i) {
            this[`slot${i}`] = `${val[i].item},${val[i].price}`;
        }
    }

    get slot0() {
        return this.getAttribute('slot0');
    }

    set slot0(val) {
        this.setAttribute('slot0', val);
    }

    get slot1() {
        return this.getAttribute('slot1');
    }

    set slot1(val) {
        this.setAttribute('slot1', val);
    }

    get slot2() {
        return this.getAttribute('slot2');
    }

    set slot2(val) {
        this.setAttribute('slot2', val);
    }

    get slot3() {
        return this.getAttribute('slot3');
    }

    set slot3(val) {
        this.setAttribute('slot3', val);
    }

    get slot4() {
        return this.getAttribute('slot4');
    }

    set slot4(val) {
        this.setAttribute('slot4', val);
    }

    get slot5() {
        return this.getAttribute('slot5');
    }

    set slot5(val) {
        this.setAttribute('slot5', val);
    }

    get slot6() {
        return this.getAttribute('slot6');
    }

    set slot6(val) {
        this.setAttribute('slot6', val);
    }

    get slot7() {
        return this.getAttribute('slot7');
    }

    set slot7(val) {
        this.setAttribute('slot7', val);
    }

    static get observedAttributes() {
        return ['slot0', 'slot1', 'slot2', 'slot3', 'slot4', 'slot5', 'slot6', 'slot7'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            let el = this.shadowRoot.getElementById(name);
            let val = newValue.split(",");
            el.ref = val[0];
            el.price = val[1];
        }
    }

}

customElements.define('ootrt-shopbuilder', HTMLTrackerShopBuilder);