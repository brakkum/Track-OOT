import Template from "/emcJS/util/Template.js";

const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
        }
        :host {
            display: flex;
            height: 100px;
            background-repeat: repeat-x;
            background-size: contain;
            background-image: url("/images/stave_lines.svg");
        }
        :host:before {
            width: 50px;
            height: 100px;
            background-repeat: no-repeat;
            background-size: auto 100%;
            background-position: center;
            background-image: url("/images/stave_key.svg");
            content: " ";
        }
        #notes {
            flex: 1;
        }
        .note {
            display: inline-block;
            height: 100px;
            width: 30px;
            background-repeat: no-repeat;
            background-size: contain;
            background-position-x: center;
        }
    
        .note.note_A {
            background-image: url("/images/note_A.svg");
            background-position-y: 90%;
        }

        .note.note_D {
            background-image: url("/images/note_D.svg");
            background-position-y: 75%;
        }

        .note.note_R {
            background-image: url("/images/note_R.svg");
            background-position-y: 60%;
        }

        .note.note_L {
            background-image: url("/images/note_L.svg");
            background-position-y: 45%;
        }

        .note.note_U {
            background-image: url("/images/note_U.svg");
            background-position-y: 30%;
        }
    </style>
    <div id="notes">
    </div>
`);

export default class HTMLTrackerStave extends HTMLElement {
    
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
    }

    get value() {
        return this.getAttribute('value');
    }

    set value(val) {
        this.setAttribute('value', val);
    }

    static get observedAttributes() {
        return ['value'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            let notes = this.shadowRoot.getElementById("notes");
            notes.innerHTML = "";
            for (let i = 0; i < newValue.length; ++i) {
                let el = document.createElement("div");
                el.className = `note note_${newValue[i]}`;
                notes.append(el);
            }
        }
    }

}

customElements.define('ootrt-stave', HTMLTrackerStave);