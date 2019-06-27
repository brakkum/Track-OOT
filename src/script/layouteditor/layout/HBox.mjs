import Template from "../../util/Template.mjs";

const TPL = new Template(`
    <style>
        :host {
            display: flex;
            flex-direction: row;
            flex-grow: 1;
        }
        ::slotted(*) {
            flex-grow: 0;
            flex-shrink: 0;
        }
        ::slotted(:last-child) {
            flex-grow: 1;
            flex-shrink: 1;
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
    <div id="placeholder">
        +
    </div>
`);

export default class HTMLTrackerHBox extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
    }

}

customElements.define('ootrt-hbox', HTMLTrackerHBox);