import GlobalStyle from "/emcJS/util/GlobalStyle.js";
import ItemStates from "/script/state/ItemStates.js";
import iOSTouchHandler from "/script/util/iOSTouchHandler.js";

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
`);

class HTMLTrackerSelectableItem extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        STYLE.apply(this.shadowRoot);
        /* --- */
        this.addEventListener("click", event => this.select(event));
        /* fck iOS */
        iOSTouchHandler.register(this);
        this.addEventListener("shortpress", event => this.select(event));
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
            switch (name) {
                case 'ref':
                    // state
                    const state = ItemStates.get(this.ref);
                    const data = state.props;
                    // settings
                    const bgImage = Array.isArray(data.images) ? data.images[0] : data.images;
                    this.style.backgroundImage = `url("${bgImage}")`;
                break;
            }
        }
    }

    select(event) {
        if (!event) return;
        event.preventDefault();

        const ev = new Event("select");
        ev.item = this.ref;
        this.dispatchEvent(ev);

        return false;
    }

}

customElements.define('ootrt-selectableitem', HTMLTrackerSelectableItem);