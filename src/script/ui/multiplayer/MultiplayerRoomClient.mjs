import Template from "/deepJS/util/Template.mjs";
import RATController from "/script/util/RATController.mjs";
import "./MPHost.mjs";
import "./MPClient.mjs";

const TPL = new Template(`
    <style>
        :host {
            display: flex;
            flex-direction: column;
        }
        #content {
            position: relative;
            display: flex;
            flex: 1;
            flex-direction: column;
            padding: 0 0 20px;
            overflow-y: auto;
            overflow-x: hidden;
        }
        .empty-message {
            display: flex;
            justify-content: center;
            align-items: center;
            flex: 1;
            height: 100%;
            color: #ffffff;
        }
    </style>
    <div id="room-list" class="view-container-title">Room (proof of concept) <button id="leave_button">leave</button></div>
    <div id="content">
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
            await RATController.disconnect();
            this.dispatchEvent(new Event('leave'));
        }.bind(this));
    }

    updateRoom(data) {
        this.innerHTML = "";
        if (!!data.host) {
            let el = document.createElement("ootrt-mphost");
            el.name = data.host;
            this.appendChild(el);
        }
        if (!!data.peers) {
            data.peers.forEach(function(inst) {
                let el = document.createElement("ootrt-mpclient");
                el.name = inst.name;
                this.appendChild(el);
            }.bind(this));
        }
    }

}

customElements.define('ootrt-multiplayerroomclient', HTMLMultiplayerRoomClient);