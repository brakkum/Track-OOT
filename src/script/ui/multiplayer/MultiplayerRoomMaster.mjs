import GlobalData from "/deepJS/storage/GlobalData.mjs";
import Template from "/deepJS/util/Template.mjs";
import DeepWebRAT from "/script/client/WebRAT.mjs";

const TPL = new Template(`
    <style>
        :host {
            display: flex;
        }
    </style>
    <div id="online-room-container">
        <div id="room-list" class="view-container-title">Room (proof of concept) <button id="close_button">close</button></div>
        <div id="room-peer-list">

        </div>
    </div>
`);

class HTMLMultiplayerRoomMaster extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(TPL.generate());

        let close_button = this.shadowRoot.getElementById("close_button");

        close_button.addEventListener("click", async function() {
            await DeepWebRAT.unregister();
            await DeepWebRAT.disconnect();
            this.dispatchEvent(new Event('close'));
        }.bind(this));
    }

}

customElements.define('ootrt-multiplayerroommaster', HTMLMultiplayerRoomMaster);