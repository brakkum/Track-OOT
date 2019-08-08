import Template from "/deepJS/util/Template.js";
import GlobalData from "/deepJS/storage/GlobalData.js";
import LocalState from "/script/util/LocalState.js";
import ManagedEventBinder from "/script/util/ManagedEventBinder.js";
import EventBus from "/deepJS/util/EventBus/EventBus.js";
import Dialog from "/deepJS/ui/Dialog.js";
import I18n from "/script/util/I18n.js";
import "./ShopItem.js";
import "./ShopBuilder.js";

const EVENT_BINDER = new ManagedEventBinder("layout");
const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
        }
        :host {
            display: inline-block;
            padding: 10px;
            margin: 5px;
            background-color: #222222;
        }
        #title {
            display: flex;
            align-items: center;
            height: 30px;
        }
        #title button {
            appearance: none;
            color: white;
            background-color: black;
            border: solid 1px white;
            margin-left: 15px;
            cursor: pointer;
        }
        #title button:hover {
            color: black;
            background-color: white;
        }
        #body {
            display: grid;
            grid-template-columns: auto auto auto auto;
            grid-template-rows: auto auto;
        }
    </style>
    <div id="title">
        <span id="title-text"></span>
        <button id="edit">✎</button>
    </div>
    <div id="body">
        <ootrt-shopitem id="slot0"></ootrt-shopitem>
        <ootrt-shopitem id="slot1"></ootrt-shopitem>
        <ootrt-shopitem id="slot2"></ootrt-shopitem>
        <ootrt-shopitem id="slot3"></ootrt-shopitem>
        <ootrt-shopitem id="slot4"></ootrt-shopitem>
        <ootrt-shopitem id="slot5"></ootrt-shopitem>
        <ootrt-shopitem id="slot6"></ootrt-shopitem>
        <ootrt-shopitem id="slot7"></ootrt-shopitem>
    </div>
`);

function editShop(event) {
    let builder = document.createElement("ootrt-shopbuilder");
    builder.value = LocalState.read(`shops.${this.ref}`, GlobalData.get("shops")[this.ref]);
    let d = new Dialog({title: I18n.translate(this.ref), submit: true, cancel: true});
    d.addEventListener("submit", function(result) {
        if (!!result) {
            let res = builder.value;
            LocalState.write(`shops.${this.ref}`, res);
            for (let i = 0; i < 8; ++i) {
                let el = this.shadowRoot.getElementById(`slot${i}`);
                el.ref = res[i].item;
                el.price = res[i].price;
            }
            EventBus.trigger("shop-items-update", {
                name: this.ref,
                value: res
            });
        }
    }.bind(this));
    d.append(builder);
    d.show();
}

function checkSlot(event) {
    if ((!event.target.checked || event.target.checked == "false") && !GlobalData.get("shop_items")[event.target.ref].refill) {
        event.target.checked = true;
        let ch = LocalState.read(`shops_bought.${this.ref}`, [0,0,0,0,0,0,0,0]);
        ch[parseInt(event.target.id.slice(-1))] = 1;
        LocalState.write(`shops_bought.${this.ref}`, ch);
        EventBus.trigger("shop_bought", {
            name: this.ref,
            value: ch
        });
    }
    event.preventDefault();
    return false;
}

function uncheckSlot(event) {
    if (!!event.target.checked && event.target.checked == "true") {
        event.target.checked = false;
        let ch = LocalState.read(`shops_bought.${this.ref}`, [0,0,0,0,0,0,0,0]);
        ch[parseInt(event.target.id.slice(-1))] = 0;
        LocalState.write(`shops_bought.${this.ref}`, ch);
        EventBus.trigger("shop_bought", {
            name: this.ref,
            value: ch
        });
    }
    event.preventDefault();
    return false;
}

function renameSlot(event) {
    let names = LocalState.read(`shops_names.${this.ref}`, ["","","","","","","",""]);
    names[parseInt(event.target.id.slice(-1))] = event.name;
    LocalState.write(`shops_names.${this.ref}`, names);
    event.preventDefault();
    return false;
}

function stateChanged(event) {
    /* shop items */
    let data = !!event.data[`shops.${this.ref}`];
    if (typeof data == "undefined") {
        data = GlobalData.get("shops")[this.ref];
    }
    /* shop bought */
    let ch;
    if (!!event.data.shops_bought) {
        ch = event.data.shops_bought[this.ref];
    }
    if (typeof ch == "undefined") {
        ch = [0,0,0,0,0,0,0,0];
    }
    /* shop names */
    let names;
    if (!!event.data.shops_names) {
        names = event.data.shops_names[this.ref];
    }
    if (typeof names == "undefined") {
        names = ["","","","","","","",""];
    }
    /* update shop */
    for (let i = 0; i < 8; ++i) {
        let el = this.shadowRoot.getElementById(`slot${i}`);
        el.ref = data[i].item;
        el.price = data[i].price;
        el.checked = !!ch[i];
        el.name = names[i];
    }
}

function shopItemUpdate(event) {
    if (this.ref === event.data.name) {
        LocalState.write(`shops.${this.ref}`, event.data.value);
        for (let i = 0; i < 8; ++i) {
            let el = this.shadowRoot.getElementById(`slot${i}`);
            el.ref = event.data.value[i].item;
            el.price = event.data.value[i].price;
        }
    }
}

function shopBoughtUpdate(event) {
    if (this.ref === event.data.name) {
        LocalState.write(`shops_bought.${this.ref}`, event.data.value);
        for (let i = 0; i < 8; ++i) {
            let el = this.shadowRoot.getElementById(`slot${i}`);
            el.checked = !!event.data.value[i];
        }
    }
}

export default class HTMLTrackerShopField extends HTMLElement {
    
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        this.shadowRoot.getElementById("edit").onclick = editShop.bind(this);
        for (let i = 0; i < 8; ++i) {
            let el = this.shadowRoot.getElementById(`slot${i}`);
            el.onclick = checkSlot.bind(this);
            el.oncontextmenu = uncheckSlot.bind(this);
            el.addEventListener("namechange", renameSlot.bind(this));
        }
        /* event bus */
        EVENT_BINDER.register("shop_items", shopItemUpdate.bind(this));
        EVENT_BINDER.register("shop_bought", shopBoughtUpdate.bind(this));
        EVENT_BINDER.register("state", stateChanged.bind(this));
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
        if (oldValue != newValue) {
            let data = LocalState.read(`shops.${newValue}`, GlobalData.get("shops")[newValue]);
            let title = this.shadowRoot.getElementById("title-text");
            title.innerHTML = I18n.translate(newValue);
            let names = LocalState.read(`shops_names.${this.ref}`, ["","","","","","","",""]);
            let checked = LocalState.read(`shops_bought.${this.ref}`, [0,0,0,0,0,0,0,0]);
            for (let i = 0; i < 8; ++i) {
                let el = this.shadowRoot.getElementById(`slot${i}`);
                el.ref = data[i].item;
                el.price = data[i].price;
                el.checked = !!checked[i];
                el.name = names[i];
            }
        }
    }

}

customElements.define('ootrt-shopfield', HTMLTrackerShopField);