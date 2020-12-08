import FileData from "/emcJS/storage/FileData.js";
import Template from "/emcJS/util/Template.js";
import GlobalStyle from "/emcJS/util/GlobalStyle.js";
import EventBusSubsetMixin from "/emcJS/mixins/EventBusSubset.js";
import "/emcJS/ui/input/Option.js";
import StateStorage from "../storage/StateStorage.js";
import FilterStorage from "../storage/FilterStorage.js";
import iOSTouchHandler from "/script/util/iOSTouchHandler.js";

const TPL = new Template(`
<slot>
</slot>
`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
}
:host {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
}
:host(:not([readonly])),
:host([readonly="false"]) {
    cursor: pointer;
}
slot {
    width: 100%;
    height: 100%;
}
::slotted(:not([value])),
::slotted([value]:not(.active)) {
    display: none !important;
}
::slotted([value]) {
    width: 100%;
    height: 100%;
    min-height: auto;
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
    background-origin: content-box;
}
`);

const PERSIST = new WeakMap();

class FilterButton extends EventBusSubsetMixin(HTMLElement) {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        PERSIST.set(this, false);
        this.addEventListener("click", event => this.next(event));
        this.addEventListener("contextmenu", event => this.revert(event));
        /* event bus */
        this.registerGlobal("filter", event => {
            if (event.data.name == this.ref) {
                this.value = event.data.value;
            }
        });
        /* fck iOS */
        iOSTouchHandler.register(this);
    }

    get ref() {
        return this.getAttribute('ref');
    }

    set ref(val) {
        this.setAttribute('ref', val);
    }

    get value() {
        return this.getAttribute('value');
    }

    set value(val) {
        this.setAttribute('value', val);
    }

    get readonly() {
        let val = this.getAttribute('readonly');
        return !!val && val != "false";
    }

    set readonly(val) {
        this.setAttribute('readonly', val);
    }

    static get observedAttributes() {
        return ['ref', 'value'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'ref':
                if (oldValue != newValue) {
                    let data = FileData.get(`filter/${this.ref}`);
                    PERSIST.set(this, data.persist != null && !!data.persist);
                    this.value = FilterStorage.get(this.ref, data.default);
                    for (let i in data.values) {
                        let img = data.images;
                        if (Array.isArray(img)) {
                            img = img[i];
                        }
                        let opt = createOption(data.values[i], img);
                        if (data.values[i] == this.value) {
                            opt.classList.add("active");
                        }
                        this.append(opt);
                    }
                }
            break;
            case 'value':
                if (oldValue != newValue) {
                    let oe = this.querySelector(`.active`);
                    if (!!oe) {
                        oe.classList.remove("active");
                    }
                    let ne = this.querySelector(`[value="${newValue}"]`);
                    if (!!ne) {
                        ne.classList.add("active");
                    }
                    let ev = new Event('change');
                    ev.oldValue = oldValue;
                    ev.value = newValue;
                    this.dispatchEvent(ev);
                }
            break;
        }
    }

    next(event) {
        if (!this.readonly) {
            let all = this.querySelectorAll("[value]");
            let oldValue = this.value;
            let value = oldValue;
            if (!!all.length) {
                let opt = this.querySelector(`[value="${oldValue}"]`);
                if (!!opt && !!opt.nextElementSibling) {
                    value = opt.nextElementSibling.getAttribute("value");
                } else {
                    value = all[0].getAttribute("value");
                }
            }
            if (value != oldValue) {
                let persist = PERSIST.get(this);
                this.value = value;
                FilterStorage.set(this.ref, value);
                if (persist) {
                    StateStorage.write(this.ref, value);
                }
                this.triggerGlobal("filter", {
                    name: this.ref,
                    value: value
                });
            }
        }
        event.preventDefault();
        return false;
    }

    revert(event) {
        if (!this.readonly) {
            let all = this.querySelectorAll("[value]");
            let oldValue = this.value;
            let value = oldValue;
            if (!!all.length) {
                let opt = this.querySelector(`[value="${oldValue}"]`);
                if (!!opt && !!opt.previousElementSibling) {
                    value = opt.previousElementSibling.getAttribute("value");
                } else {
                    value = all[all.length-1].getAttribute("value");
                }
            }
            if (value != oldValue) {
                let persist = PERSIST.get(this);
                this.value = value;
                FilterStorage.set(this.ref, value);
                if (persist) {
                    StateStorage.write(this.ref, value);
                }
                this.triggerGlobal("filter", {
                    name: this.ref,
                    value: value
                });
            }
        }
        event.preventDefault();
        return false;
    }

}

customElements.define('ootrt-filterbutton', FilterButton);

function createOption(value, img) {
    let opt = document.createElement('emc-option');
    opt.value = value;
    opt.style.backgroundImage = `url("${img}"`;
    return opt;
}