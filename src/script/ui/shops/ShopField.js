import Template from "/emcJS/util/Template.js";
import GlobalData from "/emcJS/storage/GlobalData.js";
import StateStorage from "/script/storage/StateStorage.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import Dialog from "/emcJS/ui/Dialog.js";
import I18n from "/script/util/I18n.js";
import "./ShopItem.js";
import "./ShopBuilder.js";

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
    builder.value = StateStorage.read(this.ref, GlobalData.get("shops")[this.ref]);
    let d = new Dialog({title: I18n.translate(this.ref), submit: true, cancel: true});
    d.addEventListener("submit", function(result) {
        if (!!result) {
            let res = builder.value;
            StateStorage.write(this.ref, res);
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
        let ch = StateStorage.read(`${this.ref}.bought`, [0,0,0,0,0,0,0,0]);
        ch[parseInt(event.target.id.slice(-1))] = 1;
        StateStorage.write(`${this.ref}.bought`, ch);
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
        let ch = StateStorage.read(`${this.ref}.bought`, [0,0,0,0,0,0,0,0]);
        ch[parseInt(event.target.id.slice(-1))] = 0;
        StateStorage.write(`${this.ref}.bought`, ch);
        EventBus.trigger("shop_bought", {
            name: this.ref,
            value: ch
        });
    }
    event.preventDefault();
    return false;
}

function renameSlot(event) {
    let names = StateStorage.read(`${this.ref}.names`, ["","","","","","","",""]);
    names[parseInt(event.target.id.slice(-1))] = event.name;
    StateStorage.write(`${this.ref}.names`, names);
    event.preventDefault();
    return false;
}

function stateChanged(event) {
    let data;
    let bought;
    let names;
    if (!!event.data) {
        data = event.data[this.ref];
        bought = event.data[`${this.ref}.bought`];
        names = event.data[`${this.ref}.names`];
    }
    /* shop items */
    if (typeof data == "undefined") {
        data = GlobalData.get("shops")[this.ref];
    }
    /* shop bought */
    if (typeof bought == "undefined") {
        bought = [0,0,0,0,0,0,0,0];
    }
    /* shop names */
    if (typeof names == "undefined") {
        names = ["","","","","","","",""];
    }
    /* update shop */
    for (let i = 0; i < 8; ++i) {
        let el = this.shadowRoot.getElementById(`slot${i}`);
        el.ref = data[i].item;
        el.price = data[i].price;
        el.checked = !!bought[i];
        el.name = names[i];
    }
}

function shopItemUpdate(event) {
    if (this.ref === event.data.name) {
        StateStorage.write(this.ref, event.data.value);
        for (let i = 0; i < 8; ++i) {
            let el = this.shadowRoot.getElementById(`slot${i}`);
            el.ref = event.data.value[i].item;
            el.price = event.data.value[i].price;
        }
    }
}

function shopBoughtUpdate(event) {
    if (this.ref === event.data.name) {
        StateStorage.write(`${this.ref}.bought`, event.data.value);
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
        EventBus.register("shop_items", shopItemUpdate.bind(this));
        EventBus.register("shop_bought", shopBoughtUpdate.bind(this));
        EventBus.register("state", stateChanged.bind(this));
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
            let data = StateStorage.read(newValue, GlobalData.get("shops")[newValue]);
            let title = this.shadowRoot.getElementById("title-text");
            title.innerHTML = I18n.translate(newValue);
            let names = StateStorage.read(`${this.ref}.names`, ["","","","","","","",""]);
            let checked = StateStorage.read(`${this.ref}.bought`, [0,0,0,0,0,0,0,0]);
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