import Template from "/emcJS/util/Template.js";
import GlobalStyle from "/emcJS/util/GlobalStyle.js";
import "/emcJS/ui/input/Option.js";
import ItemStates from "/script/state/ItemStates.js";
import iOSTouchHandler from "/script/util/iOSTouchHandler.js";

const TPL = new Template(`
<slot id="slot">
</slot>
`);

const STYLE = new GlobalStyle(`
* {
    position: relative;
    box-sizing: border-box;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
}
:host {
    display: inline-flex;
    width: 40px;
    height: 40px;
    cursor: pointer;
}
#slot {
    width: 100%;
    height: 100%;
    font-size: 1em;
    --halign: center;
    --valign: center;
}
::slotted(:not([value])),
::slotted([value]:not(.active)) {
    display: none !important;
}
::slotted([value]) {
    display: inline-flex;
    align-items: var(--valign, center);
    justify-content: var(--halign, center);
    width: 100%;
    height: 100%;
    padding: 2px;
    color: white;
    font-size: 0.8em;
    text-shadow: -1px 0 1px black, 0 1px 1px black, 1px 0 1px black, 0 -1px 1px black;
    background-size: 80%;
    background-repeat: no-repeat;
    background-position: center;
    background-origin: border-box;
    flex-grow: 0;
    flex-shrink: 0;
    min-height: 0;
    white-space: normal;
    line-height: 0.7em;
    font-weight: bold;
}
::slotted([value]:hover) {
    background-size: 100%;
}
::slotted([value].mark) {
    color: #54ff54;
}
`);

function getAlign(value) {
    switch (value) {
        case 'start':
            return "flex-start";
        case 'end':
            return "flex-end";
        default:
            return "center";
    }
}

const FN_VALUE = new WeakMap();
const FN_TYPE = new WeakMap();

export default class Item extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        FN_VALUE.set(this, event => {
            this.value = event.data;
        });
        FN_TYPE.set(this, event => {
            this.fillItemChoices();
        });
        this.addEventListener("click", event => this.next(event));
        this.addEventListener("contextmenu", event => this.prev(event));
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
        return this.getAttribute('readonly');
    }

    set readonly(val) {
        this.setAttribute('readonly', val);
    }

    get halign() {
        return this.getAttribute('halign');
    }

    set halign(val) {
        this.setAttribute('halign', val);
    }

    get valign() {
        return this.getAttribute('halign');
    }

    set valign(val) {
        this.setAttribute('valign', val);
    }

    static get observedAttributes() {
        return ['ref', 'value', 'halign', 'valign'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case 'ref':
                    // state
                    if (oldValue != null) {
                        const oldState = ItemStates.get(oldValue);
                        oldState.removeEventListener("value", FN_VALUE.get(this));
                        oldState.removeEventListener("type", FN_TYPE.get(this));
                    }
                    const state = ItemStates.get(this.ref);
                    state.addEventListener("value", FN_VALUE.get(this));
                    state.addEventListener("type", FN_TYPE.get(this));
                    const data = state.props;
                    this.value = state.value;
                    // settings
                    if (data.halign != null) {
                        this.halign = data.halign;
                    }
                    if (data.valign != null) {
                        this.valign = data.valign;
                    }
                    this.fillItemChoices();
                break;
                case 'halign':
                    this.shadowRoot.getElementById("slot").style.setProperty("--halign", getAlign(newValue));
                break;
                case 'valign':
                    this.shadowRoot.getElementById("slot").style.setProperty("--valign", getAlign(newValue));
                break;
                case 'value':
                    let oe = this.querySelector(`.active`);
                    if (!!oe) {
                        oe.classList.remove("active");
                    }
                    let ne = this.querySelector(`[value="${newValue}"]`);
                    if (!!ne) {
                        ne.classList.add("active");
                    }
                break;
            }
        }
    }

    fillItemChoices() {
        this.innerHTML = "";

        const state = ItemStates.get(this.ref);
        const data = state.props;
        if (!data) return;

        for (let i = 0; i <= state.max; ++i) {
            let img = data.images;
            if (Array.isArray(img)) {
                img = img[i];
            }
            const opt = createOption(i, img, data, state.max);
            if (i == this.value) {
                opt.classList.add("active");
            }
            this.append(opt);
        }
    }

    next(event) {
        if (!this.readonly) {
            const state = ItemStates.get(this.ref);
            const data = state.props;

            const oldValue = state.value;
            let value = oldValue;
            
            if ((event.shiftKey || event.ctrlKey)) {
                if (!!data.alternate_counting) {
                    for (let i = 0; i < data.alternate_counting.length; ++i) {
                        let alt = parseInt(data.alternate_counting[i]);
                        if (isNaN(alt)) {
                            alt = 0;
                        }
                        if (alt > oldValue) {
                            value = data.alternate_counting[i];
                            break;
                        }
                    }
                } else {
                    value = parseInt(data.max);
                }
            } else {
                value++;
            }
            if (value != oldValue) {
                state.value = value;
            }
        }
        if (!event) return;
        event.preventDefault();
        return false;
    }

    prev(event) {
        if (!this.readonly) {
            const state = ItemStates.get(this.ref);
            const data = state.props;

            const oldValue = state.value;
            let value = oldValue;

            if ((event.shiftKey || event.ctrlKey)) {
                if (!!data.alternate_counting) {
                    for (let i = data.alternate_counting.length - 1; i >= 0; --i) {
                        let alt = parseInt(data.alternate_counting[i]);
                        if (isNaN(alt)) {
                            alt = data.max;
                        }
                        if (alt < parseInt(oldValue)) {
                            value = data.alternate_counting[i];
                            break;
                        }
                    }
                } else {
                    value = 0;
                }
            } else {
                value--;
            }
            if (value != oldValue) {
                state.value = value;
            }
        }
        if (!event) return;
        event.preventDefault();
        return false;
    }

}

customElements.define('ootrt-itemkey', Item);

function createOption(value, img, data, max_value) {
    let opt = document.createElement('emc-option');
    opt.value = value;
    opt.style.backgroundImage = `url("${img}"`;
    if (value == 0 && !data.always_active) {
        opt.style.filter = "contrast(0.8) grayscale(0.5)";
        opt.style.opacity= "0.4";
    }
    if (!!data.counting) {
        if (Array.isArray(data.counting)) {
            opt.innerHTML = data.counting[value];
        } else {
            if (value > 0 || data.always_active) {
                opt.innerHTML = value;
            }
        }
        if (data.mark !== false) {
            let mark = parseInt(data.mark);
            if (value >= max_value || !isNaN(mark) && value >= mark) {
                opt.classList.add("mark");
            }
        }
    }
    // radial-gradient(ellipse at center, rgb(24, 241, 21) 0%,rgb(24, 241, 21) 45%,rgba(0,255,255,0) 72%,rgba(0,255,255,0) 87%)
    return opt;
}