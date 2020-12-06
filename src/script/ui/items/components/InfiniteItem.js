import Template from "/emcJS/util/Template.js";
import GlobalStyle from "/emcJS/util/GlobalStyle.js";
import ItemStates from "/script/state/ItemStates.js";
import "/emcJS/ui/input/Option.js";
import iOSTouchHandler from "/script/util/iOSTouchHandler.js";

const TPL = new Template(`
<div id="value">
</div>
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
    background-size: 80%;
    background-repeat: no-repeat;
    background-position: center;
    background-origin: border-box;
}
:host(:hover) {
    background-size: 100%;
}
#value {
    width: 100%;
    height: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 2px;
    color: white;
    font-size: 0.8em;
    text-shadow: -1px 0 1px black, 0 1px 1px black, 1px 0 1px black, 0 -1px 1px black;
    flex-grow: 0;
    flex-shrink: 0;
    min-height: 0;
    white-space: normal;
    line-height: 0.7em;
    font-weight: bold;
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

class InfiniteItem extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        FN_VALUE.set(this, event => {
            this.value = event.data;
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
                    }
                    const state = ItemStates.get(this.ref);
                    state.addEventListener("value", FN_VALUE.get(this));
                    const data = state.props;
                    this.value = state.value;
                    // settings
                    if (data.halign != null) {
                        this.halign = data.halign;
                    }
                    if (data.valign != null) {
                        this.valign = data.valign;
                    }
                    this.style.backgroundImage = `url("${data.images}")`;
                break;
                case 'value':
                    this.shadowRoot.getElementById("value").innerHTML = newValue;
                break;
                case 'halign':
                    this.shadowRoot.getElementById("value").style.justifyContent = getAlign(newValue);
                break;
                case 'valign':
                    this.shadowRoot.getElementById("value").style.alignItems = getAlign(newValue);
                break;
            }
        }
    }

    next(event) {
        if (!this.readonly) {
            const state = ItemStates.get(this.ref);

            const oldValue = state.value;
            let value = oldValue;

            if (value < 9999) {
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

            const oldValue = state.value;
            let value = oldValue;

            if ((event.shiftKey || event.ctrlKey)) {
                value = 0;
            } else if (value > 0) {
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

customElements.define('ootrt-infiniteitem', InfiniteItem);