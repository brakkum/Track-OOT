import GlobalData from "/deepJS/storage/GlobalData.mjs";
import Template from "/deepJS/util/Template.mjs";
import Dialog from "/deepJS/ui/Dialog.mjs";
import EventBus from "/deepJS/util/EventBus.mjs";
import Logger from "/deepJS/util/Logger.mjs";
import DeepWebRAT from "/script/client/WebRAT.mjs";
import TrackerLocalState from "/script/util/LocalState.mjs";

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
    <div id="lobby_list">
        <div class="empty-message">No rooms found.<br>Please press refresh!</div>
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
        let lobby_list = this.shadowRoot.getElementById("lobby_list");

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
                            //"location-update",
                            "external-location-update", // quick fix
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
                    //"location-update",
                    "external-location-update", // quick fix
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

            lobby_list.innerHTML = "";

            if (!!res) {
                res.forEach(function(inst) {
                    let el = document.createElement("ootrt-multiplayerlobbyroom");
                    el.name = inst.name;
                    el.pass = inst.pass;
                    el.desc = inst.desc;
                    el.addEventListener("click", connect);
                    lobby_list.appendChild(el);
                });
            } else {
                let el = document.createElement("div");
                el.className = "empty-message";
                el.innerHTML = "No rooms found.<br>Please press refresh!";
                lobby_list.appendChild(el);
            }
        };

        refresh_button.addEventListener("click", refresh);
        refresh();
    }

}

customElements.define('ootrt-multiplayerlobby', HTMLMultiplayerLobby);

/* room elements */
const ROOM_TPL = new Template(`
    <style>       
        :host {
            display: flex;
            height: 50px;
            margin: 10px;
            background-color: #111111;
        }
        :host(:hover) {
            background-color: #333333;
        }
        #icon {
            display: flex;
            width: 50px;
            color: #ffffff;
            font-size: 30px;
            justify-content: center;
            align-items: center;
        }
        #detail {
            display: flex;
            flex-direction: column;
        }
        #name {
            flex: 1;
            display: flex;
            align-items: center;
            color: #ffffff;
        }
        #desc {
            flex: 1;
            display: flex;
            align-items: center;
            color: #808080;
            font-size: 0.8em;
        }
        .lock-closed {
            background-position: center;
            background-size: 90% auto;
            background-repeat: no-repeat;
            background-image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMWUzIiBoZWlnaHQ9IjFlMyIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgMjY0LjU4IDI2NC41OCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwIC0zMi40MTcpIj48cGF0aCBkPSJtMTMyLjI5IDc1LjQxMmMtMjIuNzY5IDAtNDEuMzg5IDE4LjYyLTQxLjM4OSA0MS4zODl2MzEuNTk4aDE4LjUyMXYtMzEuNTk4YzAtMTIuODI5IDEwLjAzOS0yMi44NjkgMjIuODY3LTIyLjg2OSAxMi44MjkgMCAyMi44NjcgMTAuMDQxIDIyLjg2NyAyMi44Njl2MzEuNTk4aDE4LjUyMXYtMzEuNTk4YzAtMjIuNzY5LTE4LjYyLTQxLjM4OS00MS4zODktNDEuMzg5em0tNDUuMDA5IDc2LjM2NmMtOS4yMTYyIDAtMTYuNjM2IDguMjg0MS0xNi42MzYgMTguNTc0djY1LjA3OWMwIDEwLjI5IDcuNDE5NCAxOC41NzQgMTYuNjM2IDE4LjU3NGg5MC4wMTdjOS4yMTYyIDAgMTYuNjM2LTguMjg0MSAxNi42MzYtMTguNTc0di02NS4wNzljMC0xMC4yOS03LjQxOTQtMTguNTc0LTE2LjYzNi0xOC41NzR6bTQ1LjAwOSAxMS41MTJhMjAuNzI4IDIwLjcyOCAwIDAgMSAyMC43MjcgMjAuNzI3IDIwLjcyOCAyMC43MjggMCAwIDEtMTIuMTc3IDE4Ljg1NHYxNi4xMjVjMCA0LjczNjgtMy44MTM2IDguNTQ5OS04LjU1MDQgOC41NDk5LTQuNzM2OCAwLTguNTUwNC0zLjgxMzEtOC41NTA0LTguNTQ5OXYtMTYuMTE4YTIwLjcyOCAyMC43MjggMCAwIDEtMTIuMTc3LTE4Ljg2MSAyMC43MjggMjAuNzI4IDAgMCAxIDIwLjcyNy0yMC43Mjd6IiBmaWxsPSIjZmZmIi8+PC9nPjwvc3ZnPg==);
        }
    </style>
    <div id="icon"></div>
    <div id="detail">
        <div id="name">Test</div>
        <div id="desc">Test room no 1</div>
    </div>
`);

class HTMLMultiplayerLobbyRoom extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(ROOM_TPL.generate());
    }

    get pass() {
        return this.getAttribute('pass');
    }

    set pass(val) {
        this.setAttribute('pass', val);
    }

    get name() {
        return this.getAttribute('name');
    }

    set name(val) {
        this.setAttribute('name', val);
    }

    get desc() {
        return this.getAttribute('desc');
    }

    set desc(val) {
        this.setAttribute('desc', val);
    }

    static get observedAttributes() {
        return ['pass', 'name', 'desc'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case 'pass':
                    if (!!newValue && newValue != "false") {
                        this.shadowRoot.getElementById("icon").classList.add("lock-closed")
                    } else {
                        this.shadowRoot.getElementById("icon").classList.remove("lock-closed")
                    }
                break;
                case 'name':
                    this.shadowRoot.getElementById("name").innerHTML = newValue;
                break;
                case 'desc':
                    this.shadowRoot.getElementById("desc").innerHTML = newValue;
                break;
            }
        }
    }

}

customElements.define('ootrt-multiplayerlobbyroom', HTMLMultiplayerLobbyRoom);