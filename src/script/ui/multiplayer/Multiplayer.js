import Template from "/emcJS/util/Template.js";
import RTCController from "/script/util/RTCController.js";
import "./MultiplayerLobby.js";
import "./MultiplayerRoomClient.js";
import "./MultiplayerRoomMaster.js";

const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
        }
        :host {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            padding: 10px;
        }
        :host > * {
            flex: 1;
        }
        :host > :not(.active) {
            display: none;
        }
        #logger {
            max-height: 30vh;
            min-height: 20vh;
        }
    </style>
    <ootrt-multiplayerlobby id="lobby_view" class="active"></ootrt-multiplayerlobby>
    <ootrt-multiplayerroommaster id="room_master"></ootrt-multiplayerroommaster>
    <ootrt-multiplayerroomclient id="room_client"></ootrt-multiplayerroomclient>
    <ootrt-mplogger id="logger" class="active"></ootrt-mplogger>
`);

class HTMLMultiplayer extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        
        const lobby_view = this.shadowRoot.getElementById("lobby_view");
        const room_master = this.shadowRoot.getElementById("room_master");
        const room_client = this.shadowRoot.getElementById("room_client");
        const logger = this.shadowRoot.getElementById("logger");

        RTCController.setLogger(logger);

        RTCController.onroomupdate = function(data) {
            room_master.updateRoom(data);
            room_client.updateRoom(data);
        }

        lobby_view.addEventListener("host", function() {
            lobby_view.classList.remove("active");
            room_master.classList.add("active");
        });

        lobby_view.addEventListener("join", function() {
            lobby_view.classList.remove("active");
            room_client.classList.add("active");
        });

        room_master.addEventListener("close", function() {
            room_master.classList.remove("active");
            lobby_view.classList.add("active");
        });

        room_client.addEventListener("leave", function() {
            room_client.classList.remove("active");
            lobby_view.classList.add("active");
        });
    }

}

customElements.define('ootrt-multiplayer', HTMLMultiplayer);
