import Template from "/emcJS/util/Template.js";
import FileData from "/emcJS/storage/FileData.js";
import StateStorage from "/script/storage/StateStorage.js";
import EventBusSubsetMixin from "/emcJS/mixins/EventBusSubset.js";
import Dialog from "/emcJS/ui/Dialog.js";
import Language from "/script/util/Language.js";
import "./SongStave.js";
import "./SongBuilder.js";

const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
        }
        :host {
            display: inline-block;
            width: 500px;
            padding: 10px;
            margin: 5px;
            border: solid 2px white;
        }
        #title {
            display: flex;
            align-items: center;
            height: 30px;
        }
        #title button {
            appearance: none;
            color: white;
            background-color: black;
            border: solid 1px white;
            margin-left: 15px;
            cursor: pointer;
        }
        #title button:hover {
            color: black;
            background-color: white;
        }
    </style>
    <div id="title"></div>
    <ootrt-stave id="stave"></ootrt-stave>
`);

function editSong(event) {
    let builder = document.createElement("ootrt-songbuilder");
    builder.value = this.shadowRoot.getElementById("stave").value;
    let d = new Dialog({title: Language.translate(this.ref), submit: true, cancel: true});
    d.addEventListener("submit", function(result) {
        if (!!result) {
            let res = builder.value;
            this.shadowRoot.getElementById("stave").value = res;
            StateStorage.writeExtra("songs", this.ref, res);
        }
    }.bind(this));
    d.append(builder);
    d.show();
}

function stateChanged(event) {
    let value = event.data.state[this.ref];
    if (typeof value == "undefined") {
        value = FileData.get("songs")[this.ref].notes;
    }
    this.shadowRoot.getElementById("stave").value = value;
}

function songUpdate(event) {
    let data;
    if (event.data != null) {
        data = event.data[this.ref];
    }
    if (data != null) {
        this.shadowRoot.getElementById("stave").value = data.newValue;
    }
}

export default class HTMLTrackerSongField extends EventBusSubsetMixin(HTMLElement) {
    
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        /* event bus */
        this.registerGlobal("statechange_songs", songUpdate.bind(this));
        this.registerGlobal("state", stateChanged.bind(this));
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
            let data = FileData.get("songs")[newValue];
            let title = this.shadowRoot.getElementById("title");
            title.innerHTML = Language.translate(newValue);
            this.shadowRoot.getElementById("stave").value = StateStorage.readExtra("songs", newValue, data.notes);
            if (data.editable) {
                let edt = document.createElement('button');
                edt.innerHTML = "✎";
                edt.onclick = editSong.bind(this);
                title.append(edt);
            }
        }
    }

}

customElements.define('ootrt-songfield', HTMLTrackerSongField);