import DeepWindow from "deepJS/ui/Window.mjs";
import Dialog from "deepJS/ui/Dialog.mjs";
import Template from "deepJS/util/Template.mjs";
import GlobalData from "deepJS/storage/GlobalData.mjs";
import I18n from "util/I18n.mjs";
import "./ShopEditItem.mjs";

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
        ootrt-shopitem.active {
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
    let ev = new Event('submit');
    let el = this.shadowRoot.querySelector(`ootrt-shopedititem[ref="${this.value}"]`);
    if (!!el) {
        ev.ref = el.ref;
        if (!isNaN(parseInt(el.price))) {
            ev.price = el.price;
            this.dispatchEvent(ev);
            document.body.removeChild(this);
        } else {
            let shop_price = document.createElement('input');
            shop_price.setAttribute("type", "number");
            shop_price.setAttribute("min-value", 1);
            shop_price.setAttribute("max-value", 999);
            shop_price.value = 0;
            let d = new Dialog({title: "Price", submit: true, cancel: true});
            d.onsubmit = function(result) {
                if (!!result) {
                    ev.price = parseInt(shop_price.value);
                    this.dispatchEvent(ev);
                    document.body.removeChild(this);
                }
            }.bind(this);
            d.appendChild(shop_price);
            d.show();
        }
    }
}

function clickItem(event) {
    this.value = event.target.ref;
}

export default class HTMLTrackerShopItemChoice extends DeepWindow {
    
    constructor(title = "Item Choice", options = {}) {
        super(title, options.close);
        let els = TPL.generate();
        let window = this.shadowRoot.getElementById('window');
        this.shadowRoot.getElementById('body').innerHTML = "";
        this.shadowRoot.insertBefore(els.children[0], this.shadowRoot.getElementById('focus_catcher_top'));
        this.shadowRoot.getElementById('body').appendChild(els.getElementById('panel_about'));
        let ctgrs = els.getElementById('categories');
        window.insertBefore(ctgrs, this.shadowRoot.getElementById('body'));
        window.appendChild(els.getElementById('footer'));

        ctgrs.onclick = (event) => {
            let t = event.target.getAttribute('target');
            if (!!t) {
                this.active = t;
                event.preventDefault();
                return false;
            }
        }

        let sbm = this.shadowRoot.getElementById('submit');
        if (!!options.submit && typeof options.submit === "string") {
            sbm.innerHTML = options.submit;
            sbm.setAttribute("title", options.submit);
        }
        sbm.onclick = settingsSubmit.bind(this);

        let ccl = this.shadowRoot.getElementById('cancel');
        if (!!options.cancel && typeof options.cancel === "string") {
            ccl.innerHTML = options.cancel;
            ccl.setAttribute("title", options.cancel);
        }
        ccl.onclick = () => this.close();
        
        let items = GlobalData.get("shop_items");
        for (let item in items) {
            let values = items[item];
            this.addTab(I18n.translate(values.category), values.category);
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
                    let ol = this.shadowRoot.getElementById(`panel_${oldValue}`);
                    if (!!ol) {
                        ol.classList.remove("active");
                    }
                    let ob = this.shadowRoot.querySelector(`[target="${oldValue}"`);
                    if (!!ob) {
                        ob.classList.remove("active");
                    }
                    let nl = this.shadowRoot.getElementById(`panel_${newValue}`);
                    if (!!nl) {
                        nl.classList.add("active");
                    }
                    let nb = this.shadowRoot.querySelector(`[target="${newValue}"`);
                    if (!!nb) {
                        nb.classList.add("active");
                    }
                }
            break;
            case 'value':
                if (oldValue != newValue) {
                    let ol = this.shadowRoot.querySelector(`ootrt-shopedititem[ref="${oldValue}"]`);
                    if (!!ol) {
                        ol.classList.remove("active");
                    }
                    let nl = this.shadowRoot.querySelector(`ootrt-shopedititem[ref="${newValue}"]`);
                    if (!!nl) {
                        nl.classList.add("active");
                    }
                }
            break;
        }
    }

    show(data = {}, category) {
        super.show();
        for (let i in data) {
            let b = this.shadowRoot.getElementById(`panel_${i}`);
            if (!b) continue;
            for (let j in data[i]) {
                let e = b.querySelector(`[data-ref="${j}"]`);
                if (!e) continue;
                if (e.type === "checkbox") {
                    e.checked = !!data[i][j];
                } else {
                    e.value = data[i][j];
                }
            }
        }
        if (!!category) {
            this.active = category;
        } else {
            let ctg = this.shadowRoot.getElementById('categories').children;
            if (!!ctg.length) {
                this.active = ctg[0].getAttribute('target')
            }
        }
    }

    initialFocus() {
        let a = Array.from(this.querySelectorAll(Q_TAB));
        a.push(this.shadowRoot.getElementById('submit'));
        a.push(this.shadowRoot.getElementById('cancel'));
        a.push(this.shadowRoot.getElementById('close'));
        a[0].focus();
    }

    focusFirst() {
        let a = Array.from(this.querySelectorAll(Q_TAB));
        a.push(this.shadowRoot.getElementById('submit'));
        a.push(this.shadowRoot.getElementById('cancel'));
        a.unshift(this.shadowRoot.getElementById('close'));
        a[0].focus();
    }
    
    focusLast() {
        let a = Array.from(this.querySelectorAll(Q_TAB));
        a.push(this.shadowRoot.getElementById('submit'));
        a.push(this.shadowRoot.getElementById('cancel'));
        a.unshift(this.shadowRoot.getElementById('close'));
        a[a.length-1].focus();
    }

    addTab(title, id) {
        if (!this.shadowRoot.getElementById(`panel_${id}`)) {
            let pnl = document.createElement('div');
            pnl.className = "panel";
            pnl.id = `panel_${id}`;
            pnl.dataset.ref = id;
            this.shadowRoot.getElementById('body').appendChild(pnl);
            let cb = document.createElement('div');
            cb.className = "category";
            cb.setAttribute('target', id);
            cb.innerHTML = title;
            let cbt = this.shadowRoot.getElementById('categories');
            cbt.appendChild(cb);
        }
    }

    addItem(category, ref, price) {
        let item = document.createElement("ootrt-shopedititem");
        item.ref = ref;
        item.price = price;
        item.onclick = clickItem.bind(this);
        this.shadowRoot.getElementById(`panel_${category}`).appendChild(item);
    }

}

customElements.define('ootrt-shopitemchoice', HTMLTrackerShopItemChoice);