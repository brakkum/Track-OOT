import Template from "/emcJS/util/Template.js";
import GlobalStyle from "/emcJS/util/GlobalStyle.js";
import FileData from "/emcJS/storage/FileData.js";
import StateStorage from "/script/storage/StateStorage.js";
import EventBusSubsetMixin from "/emcJS/mixins/EventBusSubset.js";
import Dialog from "/emcJS/ui/overlay/Dialog.js";
import Language from "/script/util/Language.js";
import "./ShopItem.js";
import "./ShopBuilder.js";
import iOSTouchHandler from "/script/util/iOSTouchHandler.js";

const TPL = new Template(`
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

const STYLE = new GlobalStyle(`
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
`);

function editShop(event) {
    let builder = document.createElement("ootrt-shopbuilder");
    builder.value = StateStorage.readExtra("shops_items", this.ref, FileData.get("shops")[this.ref]);
    let d = new Dialog({title: Language.translate(this.ref), submit: true, cancel: true});
    d.addEventListener("submit", function(result) {
        if (!!result) {
            let res = builder.value;
            StateStorage.writeExtra("shops_items", this.ref, res);
            for (let i = 0; i < 8; ++i) {
                let el = this.shadowRoot.getElementById(`slot${i}`);
                el.ref = res[i].item;
                el.price = res[i].price;
            }
        }
    }.bind(this));
    d.append(builder);
    d.show();
}

function checkSlot(event) {
    if ((!event.target.checked || event.target.checked == "false") && !FileData.get("shop_items")[event.target.ref].refill) {
        event.target.checked = true;
        let ch = StateStorage.readExtra("shops_bought", this.ref, [0,0,0,0,0,0,0,0]);
        ch[parseInt(event.target.id.slice(-1))] = 1;
        StateStorage.writeExtra("shops_bought", this.ref, ch);
    }
    event.preventDefault();
    return false;
}

function uncheckSlot(event) {
    if (!!event.target.checked && event.target.checked == "true") {
        event.target.checked = false;
        let ch = StateStorage.readExtra("shops_bought", this.ref, [0,0,0,0,0,0,0,0]);
        ch[parseInt(event.target.id.slice(-1))] = 0;
        StateStorage.writeExtra("shops_bought", this.ref, ch);
    }
    event.preventDefault();
    return false;
}

function renameSlot(event) {
    let names = StateStorage.readExtra("shops_names", this.ref, ["","","","","","","",""]);
    names[parseInt(event.target.id.slice(-1))] = event.name;
    StateStorage.writeExtra("shops_names", this.ref, names);
    event.preventDefault();
    return false;
}

function stateChanged(event) {
    let data;
    let bought;
    let names;
    if (event.data != null && event.data.extra != null) {
        if (event.data.extra.shops_items != null) {
            data = event.data.extra.shops_items[this.ref];
        }
        if (event.data.extra.shops_bought != null) {
            bought = event.data.extra.shops_bought[this.ref];
        }
        if (event.data.extra.shops_names != null) {
            names = event.data.extra.shops_names[this.ref];
        }
    }
    /* shop items */
    if (data == null) {
        data = FileData.get("shops")[this.ref];
    }
    /* shop bought */
    if (bought == null) {
        bought = [0,0,0,0,0,0,0,0];
    }
    /* shop names */
    if (names == null) {
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
    let data;
    if (event.data != null) {
        data = event.data[this.ref];
    }
    if (data != null) {
        for (let i = 0; i < 8; ++i) {
            let el = this.shadowRoot.getElementById(`slot${i}`);
            el.ref = data.newValue[i].item;
            el.price = data.newValue[i].price;
        }
    }
}

function shopBoughtUpdate(event) {
    let data;
    if (event.data != null) {
        data = event.data[this.ref];
    }
    if (data != null) {
        for (let i = 0; i < 8; ++i) {
            let el = this.shadowRoot.getElementById(`slot${i}`);
            el.checked = !!data.newValue[i];
        }
    }
}

export default class HTMLTrackerShopField extends EventBusSubsetMixin(HTMLElement) {
    
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.shadowRoot.getElementById("edit").onclick = editShop.bind(this);
        for (let i = 0; i < 8; ++i) {
            const el = this.shadowRoot.getElementById(`slot${i}`);
            el.addEventListener("click", event => checkSlot(event));
            el.addEventListener("contextmenu", event => uncheckSlot(event));
            el.addEventListener("namechange", renameSlot.bind(this));
            /* fck iOS */
            iOSTouchHandler.register(el);
        }
        /* event bus */
        this.registerGlobal("statechange_shops_items", shopItemUpdate.bind(this));
        this.registerGlobal("statechange_shops_bought", shopBoughtUpdate.bind(this));
        this.registerGlobal("state", stateChanged.bind(this));
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
            const data = StateStorage.readExtra("shops_items", newValue, FileData.get("shops")[newValue]);
            const title = this.shadowRoot.getElementById("title-text");
            title.innerHTML = Language.translate(newValue);
            const names = StateStorage.readExtra("shops_names", this.ref, ["","","","","","","",""]);
            const checked = StateStorage.readExtra("shops_bought", this.ref, [0,0,0,0,0,0,0,0]);
            for (let i = 0; i < 8; ++i) {
                const el = this.shadowRoot.getElementById(`slot${i}`);
                el.ref = data[i].item;
                el.price = data[i].price;
                el.checked = !!checked[i];
                el.name = names[i];
            }
        }
    }

}

customElements.define('ootrt-shopfield', HTMLTrackerShopField);