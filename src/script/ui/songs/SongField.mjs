import Template from "/deepJS/util/Template.mjs";
import GlobalData from "/deepJS/storage/GlobalData.mjs";
import TrackerLocalState from "/script/util/LocalState.mjs";
import EventBus from "/deepJS/util/EventBus.mjs";
import Dialog from "/deepJS/ui/Dialog.mjs";
import I18n from "/script/util/I18n.mjs";
import "./SongStave.mjs";
import "./SongBuilder.mjs";

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
            TrackerLocalState.write("songs", this.ref, res);
            this.shadowRoot.getElementById("stave").value = res;
            EventBus.fire("song-update", {
                name: this.ref,
                value: res
            });
        }
    }.bind(this));
    d.append(builder);
    d.show();
}

function globalUpdate(event) {
    let data = GlobalData.get("songs")[this.ref];
    this.shadowRoot.getElementById("stave").value = TrackerLocalState.read("songs", this.ref, data.notes)
}

function songUpdate(event) {
    if (this.ref === event.data.name) {
        TrackerLocalState.write("songs", this.ref, event.data.value);
        this.shadowRoot.getElementById("stave").value = event.data.value;
    }
}

export default class HTMLTrackerSongField extends HTMLElement {
    
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        EventBus.on("force-song-update", globalUpdate.bind(this));
        EventBus.on("net:song-update", songUpdate.bind(this));
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
            this.shadowRoot.getElementById("stave").value = TrackerLocalState.read("songs", newValue, data.notes);
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