import GlobalData from "/emcJS/storage/GlobalData.js";
import Template from "/emcJS/util/Template.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import "/emcJS/ui/selection/Option.js";
import FilterStorage from "/script/storage/FilterStorage.js";

const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
        }
        :host {
            display: inline-block;
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
    </style>
    <slot>
    </slot>
`);

class FilterButton extends HTMLElement {

    constructor() {
        super();
        this.addEventListener("click", this.next);
        this.addEventListener("contextmenu", this.revert);
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        /* event bus */
        EventBus.register("filter", event => {
            if (event.data.name == this.ref) {
                this.value = event.data.value;
            }
        });
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
                    let data = GlobalData.get(`filter/${this.ref}`);
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
                    let event = new Event('change');
                    event.oldValue = oldValue;
                    event.value = newValue;
                    this.dispatchEvent(event);
                }
            break;
        }
    }

    next(event) {
        if (!this.readonly) {
            let all = this.querySelectorAll("[value]");
            let value = this.value;
            if (!!all.length) {
                let opt = this.querySelector(`[value="${this.value}"]`);
                if (!!opt && !!opt.nextElementSibling) {
                    value = opt.nextElementSibling.getAttribute("value");
                } else {
                    value = all[0].getAttribute("value");
                }
            }
            FilterStorage.set(this.ref, value);
            this.value = value;
            EventBus.trigger("filter", {
                name: this.ref,
                value: this.value
            });
        }
        event.preventDefault();
        return false;
    }

    revert(event) {
        if (!this.readonly) {
            let all = this.querySelectorAll("[value]");
            let value = this.value;
            if (!!all.length) {
                let opt = this.querySelector(`[value="${this.value}"]`);
                if (!!opt && !!opt.previousElementSibling) {
                    value = opt.previousElementSibling.getAttribute("value");
                } else {
                    value = all[all.length-1].getAttribute("value");
                }
            }
            FilterStorage.set(this.ref, this.value);
            this.value = value;
            EventBus.trigger("filter", {
                name: this.ref,
                value: this.value
            });
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