import FileData from "/emcJS/storage/FileData.js";
import Template from "/emcJS/util/Template.js";
import "./SongField.js";

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
        this.shadowRoot.append(TPL.generate());
        const songs = FileData.get("songs");
        for (const i in songs) {
            const el = document.createElement("ootrt-songfield");
            el.ref = i;
            this.shadowRoot.append(el);
        }
    }

}

customElements.define('ootrt-songlist', HTMLTrackerSongList);
