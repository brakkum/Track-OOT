import Template from "/emcJS/util/Template.js";
import Dialog from "/emcJS/ui/overlay/Dialog.js";
import RTCController from "/script/util/RTCController.js";
import "./MPRoom.js";

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
        #overlay {
            position: absolute;
            left: 0;
            top: 0;
            right: 0;
            bottom: 0;
            display: none;
        }
        #lobby_register {
            display: flex;
            font-size: 0.8em;
        }
        .flex {
            flex: 1;
        }
        .flex-100px {
            width: 100px;
        }
        .flex-200px {
            width: 200px;
        }
        .label-top {
            display: flex;
            flex-direction: column;
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
    <div class="view-container-title">Multiplayer Lobby (proof of concept) <button id="refresh_button">refresh</button></div>
    <div id="content">
        <slot id="lobby_list">
            <div class="empty-message">No rooms found.<br>Please press refresh!</div>
        </slot>
        <div id="overlay"></div>
    </div>
    <div id="lobby_register">
        <label class="label-top flex-200px">
            <span>Room name:</span>
            <input id="host_name">
        </label>
        <label class="label-top flex-200px">
            <span>Room password:</span>
            <input id="host_pass">
        </label>
        <label class="label-top flex">
            <span>Room description:</span>
            <input id="host_desc">
        </label>
        <button id="host_button" class="flex-100px">CREATE</button>
    </div>
`);

class HTMLMultiplayerLobby extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());

        const host_name = this.shadowRoot.getElementById("host_name");
        const host_pass = this.shadowRoot.getElementById("host_pass");
        const host_desc = this.shadowRoot.getElementById("host_desc");
        const host_button = this.shadowRoot.getElementById("host_button");

        const refresh_button = this.shadowRoot.getElementById("refresh_button");

        host_button.addEventListener("click", async function() {
            if (host_name.value) {
                const res = await RTCController.host(host_name.value, host_pass.value, host_desc.value);
                if (res) {
                    this.dispatchEvent(new Event('host'));
                }
            }
        }.bind(this));

        const connect = async function(event) {
            const el = event.target;
            let res;
            if (!!el.pass && el.pass != "false") {
                const pass = await Dialog.prompt("password required", "please enter password");
                res = await RTCController.connect(el.name, pass);
            } else {
                res = await RTCController.connect(el.name);
            }
            if (res) {
                this.dispatchEvent(new Event('join'));
            }
        }.bind(this);

        const refresh = async function(supressError) {
            const res = await RTCController.getInstances(supressError);
            if (res != null) {
                this.innerHTML = "";
                res.forEach(function(inst) {
                    const el = document.createElement("ootrt-mproom");
                    el.name = inst.name;
                    el.pass = inst.pass;
                    el.desc = inst.desc;
                    el.addEventListener("click", connect);
                    this.append(el);
                }.bind(this));
            }
        }.bind(this);

        refresh_button.addEventListener("click", function() {
            refresh(false);
        });
        refresh(true);
    }

}

customElements.define('ootrt-multiplayerlobby', HTMLMultiplayerLobby);
