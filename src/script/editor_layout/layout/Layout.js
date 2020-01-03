import Template from "/script/util/Template.js";
import HBox from "/script/layouteditor/layout/HBox.js";
import VBox from "/script/layouteditor/layout/VBox.js";
import Panel from "/script/layouteditor/layout/Panel.js";

const TPL = new Template(`
    <style>
        :host {
            display: flex;
            --item-size: 40px;
            justify-content: stretch;
            align-items: stretch;
        }
        ::slotted(:not(:first-child)) {
            display: none;
        }
        ::slotted(.panel) {
            border-style: solid;
            border-width: 2px;
            border-color: var(--page-border-color, #ffffff);
            overflow: hidden;
        }
    </style>
    <slot>
    </slot>
`);

const PANEL_CACHE = new WeakMap();

function getPanel(cache, name) {
    if (!!cache.has(name)) {
        return cache.get(name);
    }
    let el = new (Panel.getReference(name));
    cache.set(name, el);
    return el;
}

function loadLayout(cache, layout) {
    if (!!layout) {
        if (layout.type == "panel") {
            let el = getPanel(cache, layout.name);
            el.classList.add("panel");
            for (let i in layout.options) {
                el.setAttribute(i, layout.options[i]);
            }
            return el;
        } else {
            let el = document.createElement(`deep-${layout.type}`);
            for (let item of layout.items) {
                el.append(loadLayout(cache, item));
            }
            return el;
        }
    }
}

export default class HTMLTrackerLayout extends HTMLElement {

    constructor() {
        super();
        PANEL_CACHE.set(this, new Map());
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
    }

    loadLayout(layout) {
        this.innerHTML = "";
        if (!layout) return;
        this.appendChild(loadLayout(PANEL_CACHE.get(this), layout));
    }

}

customElements.define('ootrt-layout', HTMLTrackerLayout);