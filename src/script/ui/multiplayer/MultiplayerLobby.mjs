import GlobalData from "/deepJS/storage/GlobalData.mjs";
import Template from "/deepJS/util/Template.mjs";
import Dialog from "/deepJS/ui/Dialog.mjs";
import EventBus from "/deepJS/util/EventBus.mjs";
import RATController from "/script/util/RATController.mjs";
import TrackerLocalState from "/script/util/LocalState.mjs";
import "./MPRoom.mjs";

const TPL = new Template(`
    <style>
        :host {
            display: flex;
            flex-direction: column;
        }
        #content {
            display: flex;
            flex: 1;
            padding: 0 0 20px;
        }
        #lobby_list {
            flex: 1;
            overflox-y: auto;
            overflow-x: hidden;
        }
        #overlay {
            position: absolute;
            left: 0;
            top: 0;
            right: 0;
            bottom: 0;
        }
        #lobby_register {
            display: flex;
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
        this.shadowRoot.appendChild(TPL.generate());

        let host_name = this.shadowRoot.getElementById("host_name");
        let host_pass = this.shadowRoot.getElementById("host_pass");
        let host_desc = this.shadowRoot.getElementById("host_desc");
        let host_button = this.shadowRoot.getElementById("host_button");

        let refresh_button = this.shadowRoot.getElementById("refresh_button");

        host_button.addEventListener("click", async function() {
            if (!!host_name.value) {
                let res = await RATController.host(host_name.value, host_pass.value, host_desc.value);
                if (!!res) {
                    this.dispatchEvent(new Event('host'));
                }
            }
        }.bind(this));

        let connect = async function(event) {
            let el = event.target;
            let res;
            if (!!el.pass && el.pass != "false") {
                let pass = await Dialog.prompt("pasword required", "please enter password");
                res = await RATController.connect(el.name, pass);
            } else {
                res = await RATController.connect(el.name);
            }
            if (!!res) {
                this.dispatchEvent(new Event('join'));
            }
        }.bind(this);

        let refresh = async function() {
            let res = await DeepWebRAT.getInstances();
            this.innerHTML = "";
            if (!!res) {
                res.forEach(function(inst) {
                    let el = document.createElement("ootrt-mproom");
                    el.name = inst.name;
                    el.pass = inst.pass;
                    el.desc = inst.desc;
                    el.addEventListener("click", connect);
                    this.appendChild(el);
                });
            }
        }.bind(this);

        refresh_button.addEventListener("click", refresh);
        refresh();
    }

}

customElements.define('ootrt-multiplayerlobby', HTMLMultiplayerLobby);