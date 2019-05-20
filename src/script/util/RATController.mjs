
import Dialog from "/deepJS/ui/Dialog.mjs";
import EventBus from "/deepJS/util/EventBus.mjs";
import DeepWebRAT from "/script/client/WebRAT.mjs";
import TrackerLocalState from "/script/util/LocalState.mjs";

let username = "";
let clients = new Map;
let clientData = new Map;

const EMPTY_FN = function() {};
let ON_ROOMUPDATE = EMPTY_FN;

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

function getClientNameList() {
    return {
        host: username,
        peers: Array.from(clientData.values())
    };
}

class RATController {
    
    getInstances() {
        return DeepWebRAT.getInstances();
    }

    set onroomupdate(value) {
        if (typeof value == "function") {
            ON_ROOMUPDATE = value;
        } else {
            ON_ROOMUPDATE = EMPTY_FN;
        }
    }

    async host(name, pass, desc) {
        if (!!name) {
            let res = await DeepWebRAT.register(name, pass, desc);
            if (res.success === true) {
                username = name;
                await promtName();
                onHosting.call(this);
            } else {
                await Dialog.alert("Error registering to Lobby", "An error occured while registering your room to the lobby.\nCheck if the room already exists and try again!");
            }
        } else {
            await Dialog.alert("Error registering to Lobby", "Can not register a room without a name.");
        }
    }

    async close() {
        await DeepWebRAT.unregister();
    }

    async connect(name, pass) {
        let res = await DeepWebRAT.connect(name, pass);
        if (res.success === true) {
            DeepWebRAT.onmessage = async function(key, msg) {
                if (msg.type == "name") {
                    if (!!msg.data) {
                        onJoined.call(this);
                    } else {
                        await Dialog.alert("Username taken", `The username "${username}" is already taken.\nPlease choose another one!`);
                        DeepWebRAT.send({
                            type: "name",
                            data: await promtName()
                        });
                    }
                }
            };
            DeepWebRAT.send({
                type: "name",
                data: await promtName()
            });
        } else {
            await Dialog.alert("Connection refused", "You have no permission to enter the room.\nDid you enter the correct password?");
        }
    }

    async disconnect() {
        await DeepWebRAT.disconnect();
    }

}

export default new RATController;

async function promtName() {
    username = await Dialog.prompt("Please select a username", "Please enter a name (at least 3 characters).", username);
    if (typeof username != "string") {
        
    }
    if (username.length < 3) {
        await Dialog.alert("Invalid username", "Username can not be less then 3 characters.");
        return await promtPeerName();
    }
    return username;
}

function onJoined() {
    DeepWebRAT.onmessage = function(key, msg) {
        if (msg.type == "room") {
            ON_ROOMUPDATE(msg.data);
        } else if (msg.type == "state") {
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
}

async function onHosting() {
    DeepWebRAT.onmessage = function(key, msg) {
        if (msg.type == "name") {
            if (msg.data == username || clients.has(msg.data)) {
                DeepWebRAT.sendOne(key, {
                    type: "name",
                    data: false
                });
            } else {
                DeepWebRAT.sendOne(key, {
                    type: "name",
                    data: true
                });
                clients.set(msg.data, key);
                clientData.set(key, {
                    name: msg.data,
                    write: true // TODO
                });
                ON_ROOMUPDATE(msg.data);
            }
        } else if (msg.type == "event") {
            if (permissions)
            DeepWebRAT.sendButOne(key, msg);
            EventBus.fire(`net:${msg.data.name}`, msg.data.data);
        }
    };
    DeepWebRAT.onconnect = function(key) {
        DeepWebRAT.send({
            type: "room",
            data: getClientNameList()
        });
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
}