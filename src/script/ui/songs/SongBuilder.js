import Template from "/emcJS/util/Template.js";
import "./SongStave.js";

const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
        }
        :host {
            display: inline-block;
            width: 320px;
            padding: 10px;
            margin: 5px;
            background-color: black;
        }
        #buttons {
            display: flex;
            justify-content: center;
        }
        #buttons div {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background-repeat: no-repeat;
            background-size: contain;
            background-position: center;
            margin: 5px;
        }
        #buttons div:hover {
            box-shadow: 0 0 3px 2px #cb9c3d, inset 0 0 3px 0px #cb9c3d;
        }
        #buttons #A {
            background-image: url("/images/songs/note_A.svg");
        }
        #buttons #D {
            background-image: url("/images/songs/note_D.svg");
        }
        #buttons #R {
            background-image: url("/images/songs/note_R.svg");
        }
        #buttons #L {
            background-image: url("/images/songs/note_L.svg");
        }
        #buttons #U {
            background-image: url("/images/songs/note_U.svg");
        }
        #buttons #X {
            background-image: url("/images/songs/note_X.svg");
        }
    </style>
    <div id="title"></div>
    <ootrt-stave id="stave"></ootrt-stave>
    <div id="buttons">
        <div id="A"></div>
        <div id="D"></div>
        <div id="R"></div>
        <div id="L"></div>
        <div id="U"></div>
        <div id="X"></div>
    </div>
`);

function buttonClick(event) {
    switch (event.target.id) {
        case "X":
            if (this.value.length) {
                this.value = this.value.slice(0, -1);
            }
            break;
        case "A":
        case "D":
        case "R":
        case "L":
        case "U":
            if (this.value.length < 8) {
                this.value += event.target.id;
            }
            break;
    }
}

export default class HTMLTrackerSongBuilder extends HTMLElement {
    
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        this.shadowRoot.getElementById("buttons").onclick = buttonClick.bind(this);
    }

    get value() {
        return this.shadowRoot.getElementById("stave").value;
    }

    set value(val) {
        this.shadowRoot.getElementById("stave").value = val;
    }

}

customElements.define('ootrt-songbuilder', HTMLTrackerSongBuilder);
