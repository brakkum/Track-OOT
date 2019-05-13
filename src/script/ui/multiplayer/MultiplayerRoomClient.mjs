import GlobalData from "/deepJS/storage/GlobalData.mjs";
import Template from "/deepJS/util/Template.mjs";
import DeepWebRAT from "/script/client/WebRAT.mjs";
import "./MPHost.mjs";
import "./MPClient.mjs";

const TPL = new Template(`
    <style>
        :host {
            display: flex;
        }
        .empty-message {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
            color: #ffffff;
        }
    </style>
    <div id="online-room-container">
        <div id="room-list" class="view-container-title">Room (proof of concept) <button id="leave_button">leave</button></div>
        <slot id="room-peer-list">
            <div class="empty-message">The room is empty</div>
        </slot>
    </div>
`);

class HTMLMultiplayerRoomClient extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(TPL.generate());

        let leave_button = this.shadowRoot.getElementById("leave_button");

        leave_button.addEventListener("click", async function() {
            await DeepWebRAT.disconnect();
            this.dispatchEvent(new Event('leave'));
        }.bind(this));
    }

}

customElements.define('ootrt-multiplayerroomclient', HTMLMultiplayerRoomClient);