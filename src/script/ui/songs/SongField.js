import Template from "/deepJS/util/Template.js";
import GlobalData from "/script/storage/GlobalData.js";
import StateStorage from "/script/storage/StateStorage.js";
import EventBus from "/deepJS/util/EventBus/EventBus.js";
import Dialog from "/deepJS/ui/Dialog.js";
import I18n from "/script/util/I18n.js";
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
    let d = new Dialog({title: I18n.translate(this.ref), submit: true, cancel: true});
    d.addEventListener("submit", function(result) {
        if (!!result) {
            let res = builder.value;
            StateStorage.write(`songs.${this.ref}`, res);
            this.shadowRoot.getElementById("stave").value = res;
            EventBus.trigger("song", {
                name: this.ref,
                value: res
            });
        }
    }.bind(this));
    d.append(builder);
    d.show();
}

function stateChanged(event) {
    let value = event.data[`songs.${this.ref}`];
    if (typeof value == "undefined") {
        value = GlobalData.get("songs")[this.ref].notes;
    }
    this.shadowRoot.getElementById("stave").value = value;
}

function songUpdate(event) {
    if (this.ref === event.data.name) {
        StateStorage.write(`songs.${this.ref}`, event.data.value);
        this.shadowRoot.getElementById("stave").value = event.data.value;
    }
}

export default class HTMLTrackerSongField extends HTMLElement {
    
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        /* event bus */
        EventBus.register("song", songUpdate.bind(this));
        EventBus.register("state", stateChanged.bind(this));
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
            let data = GlobalData.get("songs")[newValue];
            let title = this.shadowRoot.getElementById("title");
            title.innerHTML = I18n.translate(newValue);
            this.shadowRoot.getElementById("stave").value = StateStorage.read(`songs.${newValue}`, data.notes);
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