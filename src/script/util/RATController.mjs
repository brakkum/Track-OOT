
import Dialog from "/deepJS/ui/Dialog.mjs";
import EventBus from "/deepJS/util/EventBus.mjs";
import DeepWebRAT from "/script/client/WebRAT.mjs";
import TrackerLocalState from "/script/util/LocalState.mjs";

let username = "";
let clients = new Map;
let spectators = new Map;
let reverseLookup = new Map;

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
        peers: Array.from(clients.values()),
        viewer: Array.from(spectators.values())
    };
}

class RATController {
    
    getInstances() {
        return DeepWebRAT.getInstances();
    }

    getUsername() {
        return username;
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
                if (!await promtName()) {
                    await Dialog.alert("Aborted Lobby creation", "Lobby will be closed now.");
                    await this.close();
                } else {
                    onHosting.call(this);
                    return true;
                }
            } else {
                await Dialog.alert("Error registering to Lobby", "An error occured while registering your room to the lobby.\nCheck if the room already exists and try again!");
                return false;
            }
        } else {
            await Dialog.alert("Error registering to Lobby", "Can not register a room without a name.");
            return false;
        }
    }

    async close() {
        await DeepWebRAT.unregister();
    }

    connect(name, pass) {
        return new Promise(async function(resolve) {
            let res = await DeepWebRAT.connect(name, pass);
            if (res.success === true) {
                DeepWebRAT.onmessage = async function(key, msg) {
                    if (msg.type == "name") {
                        if (!!msg.data) {
                            onJoined.call(this);
                            resolve(true);
                        } else {
                            await Dialog.alert("Username taken", `The username "${username}" is already taken.\nPlease choose another one!`);
                            if (!promptPeerName()) {
                                resolve(false);
                            }
                        }
                    }
                };
                if (!promptPeerName()) {
                    resolve(false);
                }
            } else {
                await Dialog.alert("Connection refused", "You have no permission to enter the room.\nDid you enter the correct password?");
                resolve(false);
            }
        });
    }

    async kick(name) {
        if (reverseLookup.has(name)) {
            let reason = await Dialog.prompt("Please provide a reason", "Please provide a reason for kicking the client.");
            if (typeof reason == "string") {
                let key = reverseLookup.get(name);
                DeepWebRAT.sendOne(key, {
                    type: "kick",
                    data: reason
                });
                await DeepWebRAT.cut(key);
            }
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
        return false;
    }
    if (username.length < 3) {
        await Dialog.alert("Invalid username", "Username can not be less then 3 characters.");
        return await promtName();
    }
    return username;
}

async function promptPeerName() {
    let name = await promtName();
    if (!name) {
        return false;
    }
    DeepWebRAT.send({
        type: "name",
        data: name
    });
    return true;
}

function onJoined() {
    DeepWebRAT.onmessage = async function(key, msg) {
        if (msg.type == "join") {
            // TODO toast a join message
        } else if (msg.type == "leave") {
            // TODO toast a leave message
        } else if (msg.type == "kick") {
            await Dialog.alert("You have been kicked", `You have been kicked by the host: ${!!msg.data ? msg.data : "no reason provided"}.`);
        } else if (msg.type == "room") {
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
            if (msg.data == username || reverseLookup.has(msg.data)) {
                DeepWebRAT.sendOne(key, {
                    type: "name",
                    data: false
                });
            } else {
                DeepWebRAT.sendOne(key, {
                    type: "name",
                    data: true
                });
                DeepWebRAT.sendOne(key, {
                    type: "state",
                    data: getState()
                });
                clients.set(key, msg.data);
                // or spectators.set(key, msg.data);
                reverseLookup.set(msg.data, key);
                // TODO toast a join message
                DeepWebRAT.sendButOne(key, {
                    type: "join",
                    data: msg.data
                });
                let data = getClientNameList();
                DeepWebRAT.send({
                    type: "room",
                    data: data
                });
                ON_ROOMUPDATE(data);
            }
        } else if (msg.type == "event") {
            if (clients.has(key)) {
                DeepWebRAT.sendButOne(key, msg);
                EventBus.fire(`net:${msg.data.name}`, msg.data.data);
            }
        }
    };
    DeepWebRAT.onconnect = function(key) {
        DeepWebRAT.sendOne(key, {
            type: "state",
            data: getState()
        });
    };
    DeepWebRAT.ondisconnect = function(key) {
        let name = "";
        if (clients.has(key)) {
            name = clients.get(key);
            clients.delete(key);
        } else if (spectators.has(key)) {
            name = spectators.get(key);
            clients.delete(key);
        } else {
            return;
        }
        // TODO toast a leave message
        DeepWebRAT.send({
            type: "leave",
            data: name
        });
        reverseLookup.delete(name);
        let data = getClientNameList();
        DeepWebRAT.send({
            type: "room",
            data: data
        });
        ON_ROOMUPDATE(data);
    };
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
    ON_ROOMUPDATE(getClientNameList());
}