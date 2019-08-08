
import Dialog from "/deepJS/ui/Dialog.js";
import EventBus from "/deepJS/util/EventBus/EventBus.js";
import EventBusModuleGeneric from "/deepJS/util/EventBus/EventBusModuleGeneric.js";
import DeepWebRAT from "/script/client/WebRAT.js";
import LocalState from "/script/util/LocalState.js";

const eventModule = new EventBusModuleGeneric();
eventModule.mute("logic");
EventBus.addModule(eventModule);

let username = "";
let clients = new Map;
let spectators = new Map;
let reverseLookup = new Map;

const EMPTY_FN = function() {};
let ON_ROOMUPDATE = EMPTY_FN;

function getState() {
    let state = LocalState.getState();
    if (!!state.extras && !!state.extras.notes) {
        delete state.extras.notes;
    }
    if (!!state.shops_names) {
        delete state.shops_names;
    }
    return state;
}

function setState(state) {
    for (let i in state) {
        if (i === "shops_names") continue;
        for (let j in state[i]) {
            if (i === "extras" && j === "notes") continue;
            if (!!state[i] && !!state[i][j]) {
                LocalState.write(`${i}.${j}`, state[i][j]);
            } else {
                LocalState.remove(`${i}.${j}`);
            }
        }
    }
    // TODO use eventbus plugin
    eventModule.trigger("state", LocalState.getState());
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
        } else if (msg.type == "event") {
            eventModule.trigger(msg.data.name, msg.data.data);
        }
    };
    eventModule.register(function(event) {
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
                eventModule.trigger(msg.data.name, msg.data.data);
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
    eventModule.register(function(event) {
        DeepWebRAT.send({
            type: "event",
            data: event
        });
    });
    ON_ROOMUPDATE(getClientNameList());
}