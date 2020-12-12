import Window from "/emcJS/ui/overlay/Window.js";
import Dialog from "/emcJS/ui/overlay/Dialog.js";
import Template from "/emcJS/util/Template.js";
import FileData from "/emcJS/storage/FileData.js";
import Language from "/script/util/Language.js";
import "./ShopEditItem.js";

const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
        }
        #footer,
        #submit,
        #cancel {
            display: flex;
        }
        #categories {
            padding: 5px;
            overflow-x: auto;
            overflow-y: none;
            border-bottom: solid 2px #cccccc;
        }
        .category {
            display: inline-flex;
            margin: 0 2px;
        }
        .panel {
            display: none;
            word-wrap: break-word;
            resize: none;
        }
        .panel.active {
            display: block;
        }
        #footer {
            height: 50px;
            padding: 10px 30px 10px;
            justify-content: flex-end;
            border-top: solid 2px #cccccc;
        }
        #submit,
        #cancel {
            margin-left: 10px;
            padding: 5px;
            border: solid 1px black;
            border-radius: 2px;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            -webkit-appearance: none;
        }
        .category {
            padding: 5px;
            border: solid 1px black;
            border-radius: 2px;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            -webkit-appearance: none;
        }
        .category:hover {
            background-color: gray;
        }
        #submit:hover,
        #cancel:hover,
        .category.active {
            color: white;
            background-color: black;
        }
        ootrt-shopedititem.active {
            box-shadow: 0 0 2px 2px red;
        }
    </style>
    <div id="categories">
    </div>
    <div class="panel" id="panel_about">
    </div>
    <div id="footer">
        <button id="submit" title="submit">
            submit
        </button>
        <button id="cancel" title="cancel">
            cancel
        </button>
    </div>
`);

const Q_TAB = [
    'button:not([tabindex="-1"])',
    '[href]:not([tabindex="-1"])',
    'input:not([tabindex="-1"])',
    'select:not([tabindex="-1"])',
    'textarea:not([tabindex="-1"])',
    '[tabindex]:not([tabindex="-1"])'
].join(',');

async function settingsSubmit() {
    const ev = new Event('submit');
    const el = this.shadowRoot.querySelector(`ootrt-shopedititem[ref="${this.value}"]`);
    if (el) {
        ev.ref = el.ref;
        if (!isNaN(parseInt(el.price))) {
            ev.price = el.price;
            this.dispatchEvent(ev);
            document.body.removeChild(this);
        } else {
            const shop_price = document.createElement('input');
            shop_price.setAttribute("type", "number");
            shop_price.setAttribute("min-value", 1);
            shop_price.setAttribute("max-value", 999);
            shop_price.value = 0;
            const d = new Dialog({title: "Price", submit: true, cancel: true});
            d.onsubmit = function(result) {
                if (result) {
                    ev.price = parseInt(shop_price.value);
                    this.dispatchEvent(ev);
                    document.body.removeChild(this);
                }
            }.bind(this);
            d.append(shop_price);
            d.show();
        }
    }
}

function clickItem(event) {
    this.value = event.target.ref;
}

export default class HTMLTrackerShopItemChoice extends Window {
    
    constructor(title = "Item Choice", options = {}) {
        super(title, options.close);
        const els = TPL.generate();
        const window = this.shadowRoot.getElementById('window');
        this.shadowRoot.getElementById('body').innerHTML = "";
        this.shadowRoot.insertBefore(els.children[0], this.shadowRoot.getElementById('focus_catcher_top'));
        this.shadowRoot.getElementById('body').append(els.getElementById('panel_about'));
        const ctgrs = els.getElementById('categories');
        window.insertBefore(ctgrs, this.shadowRoot.getElementById('body'));
        window.append(els.getElementById('footer'));

        ctgrs.onclick = (event) => {
            const t = event.target.getAttribute('target');
            if (t) {
                this.active = t;
                event.preventDefault();
                return false;
            }
        }

        const sbm = this.shadowRoot.getElementById('submit');
        if (!!options.submit && typeof options.submit === "string") {
            sbm.innerHTML = options.submit;
            sbm.setAttribute("title", options.submit);
        }
        sbm.onclick = settingsSubmit.bind(this);

        const ccl = this.shadowRoot.getElementById('cancel');
        if (!!options.cancel && typeof options.cancel === "string") {
            ccl.innerHTML = options.cancel;
            ccl.setAttribute("title", options.cancel);
        }
        ccl.onclick = () => this.close();
        
        const items = FileData.get("shop_items");
        for (const item in items) {
            const values = items[item];
            this.addTab(Language.translate(values.category), values.category);
            this.addItem(values.category, item, values.price || "???");
        }
    }

    get active() {
        return this.getAttribute('active');
    }

    set active(val) {
        this.setAttribute('active', val);
    }

    get value() {
        return this.getAttribute('value');
    }

    set value(val) {
        this.setAttribute('value', val);
    }

    static get observedAttributes() {
        return ['active', 'value'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'active':
                if (oldValue != newValue) {
                    const ol = this.shadowRoot.getElementById(`panel_${oldValue}`);
                    if (ol) {
                        ol.classList.remove("active");
                    }
                    const ob = this.shadowRoot.querySelector(`[target="${oldValue}"]`);
                    if (ob) {
                        ob.classList.remove("active");
                    }
                    const nl = this.shadowRoot.getElementById(`panel_${newValue}`);
                    if (nl) {
                        nl.classList.add("active");
                    }
                    const nb = this.shadowRoot.querySelector(`[target="${newValue}"]`);
                    if (nb) {
                        nb.classList.add("active");
                    }
                }
                break;
            case 'value':
                if (oldValue != newValue) {
                    const ol = this.shadowRoot.querySelector(`ootrt-shopedititem[ref="${oldValue}"]`);
                    if (ol) {
                        ol.classList.remove("active");
                    }
                    const nl = this.shadowRoot.querySelector(`ootrt-shopedititem[ref="${newValue}"]`);
                    if (nl) {
                        nl.classList.add("active");
                    }
                }
                break;
        }
    }

    show(data = {}, category = "") {
        super.show();
        for (const i in data) {
            const b = this.shadowRoot.getElementById(`panel_${i}`);
            if (!b) continue;
            for (const j in data[i]) {
                const e = b.querySelector(`[data-ref="${j}"]`);
                if (!e) continue;
                if (e.type === "checkbox") {
                    e.checked = !!data[i][j];
                } else {
                    e.value = data[i][j];
                }
            }
        }
        if (category) {
            this.active = category;
        } else {
            const ctg = this.shadowRoot.getElementById('categories').children;
            if (ctg.length) {
                this.active = ctg[0].getAttribute('target')
            }
        }
    }

    initialFocus() {
        const a = Array.from(this.querySelectorAll(Q_TAB));
        a.push(this.shadowRoot.getElementById('submit'));
        a.push(this.shadowRoot.getElementById('cancel'));
        a.push(this.shadowRoot.getElementById('close'));
        a[0].focus();
    }

    focusFirst() {
        const a = Array.from(this.querySelectorAll(Q_TAB));
        a.push(this.shadowRoot.getElementById('submit'));
        a.push(this.shadowRoot.getElementById('cancel'));
        a.unshift(this.shadowRoot.getElementById('close'));
        a[0].focus();
    }
    
    focusLast() {
        const a = Array.from(this.querySelectorAll(Q_TAB));
        a.push(this.shadowRoot.getElementById('submit'));
        a.push(this.shadowRoot.getElementById('cancel'));
        a.unshift(this.shadowRoot.getElementById('close'));
        a[a.length - 1].focus();
    }

    addTab(title, id) {
        if (!this.shadowRoot.getElementById(`panel_${id}`)) {
            const pnl = document.createElement('div');
            pnl.className = "panel";
            pnl.id = `panel_${id}`;
            pnl.dataset.ref = id;
            this.shadowRoot.getElementById('body').append(pnl);
            const cb = document.createElement('div');
            cb.className = "category";
            cb.setAttribute('target', id);
            cb.innerHTML = title;
            const cbt = this.shadowRoot.getElementById('categories');
            cbt.append(cb);
        }
    }

    addItem(category, ref, price) {
        const item = document.createElement("ootrt-shopedititem");
        item.ref = ref;
        item.price = price;
        item.onclick = clickItem.bind(this);
        this.shadowRoot.getElementById(`panel_${category}`).append(item);
    }

}

customElements.define('ootrt-shopitemchoice', HTMLTrackerShopItemChoice);
