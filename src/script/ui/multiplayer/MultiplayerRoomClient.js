import Template from "/emcJS/util/Template.js";
import RTCController from "/script/util/RTCController.js";
import "./MPUser.js";
import "./MPLogger.js";

const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
        }
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
        this.shadowRoot.append(TPL.generate());

        const leave_button = this.shadowRoot.getElementById("leave_button");

        leave_button.addEventListener("click", async function() {
            await RTCController.disconnect();
            this.dispatchEvent(new Event('leave'));
        }.bind(this));
    }

    updateRoom(data) {
        this.innerHTML = "";
        if (data.host) {
            const el = document.createElement("ootrt-mpuser");
            el.name = data.host;
            el.role = 'host';
            this.append(el);
        }
        if (data.peers) {
            data.peers.forEach(function(inst) {
                const el = document.createElement("ootrt-mpuser");
                el.name = inst;
                el.role = 'client';
                if (inst == RTCController.getUsername()) {
                    this.prepend(el);
                } else {
                    this.append(el);
                }
            }.bind(this));
        }
        if (data.viewer) {
            data.viewer.forEach(function(inst) {
                const el = document.createElement("ootrt-mpuser");
                el.name = inst;
                el.role = 'spectator';
                if (inst == RTCController.getUsername()) {
                    this.prepend(el);
                } else {
                    this.append(el);
                }
            }.bind(this));
        }
    }

}

customElements.define('ootrt-multiplayerroomclient', HTMLMultiplayerRoomClient);
