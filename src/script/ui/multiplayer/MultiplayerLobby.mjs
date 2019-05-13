import GlobalData from "/deepJS/storage/GlobalData.mjs";
import Template from "/deepJS/util/Template.mjs";
import Dialog from "/deepJS/ui/Dialog.mjs";
import EventBus from "/deepJS/util/EventBus.mjs";
import DeepWebRAT from "/script/client/WebRAT.mjs";
import TrackerLocalState from "/script/util/LocalState.mjs";
import "./MPRoom.mjs";

const TPL = new Template(`
    <style>
        :host {
            display: flex;
            flex-direction: column;
        }
        #lobby_list {
            flex: 1;
            overflox-y: auto;
            overflow-x: hidden;
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
    <slot id="lobby_list">
        <div class="empty-message">No rooms found.<br>Please press refresh!</div>
    </slot>
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

function getState() {
    let state = TrackerLocalState.getState();
    if (!!state.extras && !!state.extras.notes) {
        delete state.extras.notes;
    }
    if (!!state.shops_names) {
        delete state.shops_names;
    }
    return state;
}

function setState(state) {
    for (let i of TrackerLocalState.categories()) {
        if (i === "shops_names") continue;
        for (let j of TrackerLocalState.names(i)) {
            if (i === "extras" && j === "notes") continue;
            if (!!state[i] && !!state[i][j]) {
                TrackerLocalState.write(i, j, state[i][j]);
            } else {
                TrackerLocalState.remove(i, j);
            }
        }
    }
}

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
                let res = await DeepWebRAT.register(host_name.value, host_pass.value, host_desc.value);
                if (res.success === true) {
                    DeepWebRAT.onmessage = function(key, msg) {
                        if (msg.type == "event") {
                            DeepWebRAT.sendButOne(key, msg);
                            EventBus.fire(`net:${msg.data.name}`, msg.data.data);
                        }
                    };
                    DeepWebRAT.onconnect = function(key) {
                        DeepWebRAT.send({
                            type: "state",
                            data: getState()
                        });
                        EventBus.on("state-changed", function(event) {
                            DeepWebRAT.send({
                                type: "state",
                                data: getState()
                            });
                        });
                        EventBus.on([
                            "item-update",
                            "location-update",
                            "gossipstone-update",
                            "dungeon-type-update",
                            "dungeon-reward-update",
                            "song-update",
                            "shop-items-update",
                            "shop-bought-update",
                            "update-settings"
                        ], function(event) {
                            DeepWebRAT.send({
                                type: "event",
                                data: event
                            });
                        });
                    };
                    this.dispatchEvent(new Event('create'));
                } else {
                    // show error message
                }
            }
        }.bind(this));

        let connect = async function(event) {
            let el = event.target;
            let res;
            if (!!el.pass && el.pass != "false") {
                let pass = await Dialog.prompt("pasword required", "please enter password");
                res = await DeepWebRAT.connect(el.name, pass);
            } else {
                res = await DeepWebRAT.connect(el.name);
            }
            if (res.success === true) {
                DeepWebRAT.onmessage = function(key, msg) {
                    if (msg.type == "state") {
                        setState(msg.data);
                        EventBus.fire("force-item-update");
                        EventBus.fire("force-logic-update");
                        EventBus.fire("force-location-update");
                        EventBus.fire("force-shop-update");
                        EventBus.fire("force-song-update");
                        EventBus.fire("force-dungeonstate-update");
                    } else if (msg.type == "event") {
                        EventBus.fire(`net:${msg.data.name}`, msg.data.data);
                    }
                };
                EventBus.on([
                    "item-update",
                    "location-update",
                    "gossipstone-update",
                    "dungeon-type-update",
                    "dungeon-reward-update",
                    "song-update",
                    "shop-items-update",
                    "shop-bought-update",
                    "update-settings"
                ], function(event) {
                    DeepWebRAT.send({
                        type: "event",
                        data: event
                    });
                });
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