import GlobalData from "deepJS/storage/GlobalData.mjs";
import Template from "deepJS/util/Template.mjs";
import "./SongField.mjs";

const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
        }
        :host {
            display: inline-block;
        }
    </style>
`);

export default class HTMLTrackerSongList extends HTMLElement {
    
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(TPL.generate());
        let songs = GlobalData.get("songs");
        for (let i in songs) {
            let el = document.createElement("ootrt-songfield");
            el.ref = i;
            this.shadowRoot.appendChild(el);
        }
    }

}

customElements.define('ootrt-songlist', HTMLTrackerSongList);