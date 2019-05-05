import Template from "/deepJS/util/Template.mjs";
import DeepWebRAT from "/script/client/WebRAT.mjs";
import "./MultiplayerLobby.mjs";
import "./MultiplayerRoomClient.mjs";
import "./MultiplayerRoomMaster.mjs";

const TPL = new Template(`
    <style>
        :host {
            display: flex;
            flex: 1;
        }
        * {
            flex: 1;
        }
        :not(.active) {
            display: none;
        }
    </style>
    <ootrt-multiplayerlobby id="lobby_view" class="active"></ootrt-multiplayerlobby>
    <ootrt-multiplayerroommaster id="room_master"></ootrt-multiplayerroommaster>
    <ootrt-multiplayerroomclient id="room_client"></ootrt-multiplayerroomclient>
`);

class HTMLMultiplayer extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(TPL.generate());
        
        let lobby_view = this.shadowRoot.getElementById("lobby_view");
        let room_master = this.shadowRoot.getElementById("room_master");
        let room_client = this.shadowRoot.getElementById("room_client");

        lobby_view.addEventListener("create", function() {
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