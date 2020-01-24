
import Dialog from "/emcJS/ui/Dialog.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import EventBusModuleGeneric from "/emcJS/util/events/EventBusModuleGeneric.js";
import RTCClient from "/rtc/RTCClient.js";
import StateStorage from "/script/storage/StateStorage.js";

const rtcClient = new RTCClient(window.location.hostname == "localhost" ? 8001 : "");

const eventModule = new EventBusModuleGeneric();
eventModule.mute("logic");
eventModule.mute("filter");
eventModule.mute("location_change");
eventModule.mute("location_mode");
eventModule.mute("state_change");
EventBus.addModule(eventModule);

let username = "";
let clients = new Map;
let spectators = new Map;
let reverseLookup = new Map;

const EMPTY_FN = function() {};
let ON_ROOMUPDATE = EMPTY_FN;

function getState() {
    let state = StateStorage.getAll();
    let res = {};
    for (let i in state) {
        if (i != "notes" && !i.endsWith(".names")) {
            res[i] = state[i];
        }
    }
    return res;
}

function setState(state) {
    let buffer = {};
    for (let i in state) {
        if (i != "notes" && !i.endsWith(".names")) {
            buffer[i] =  state[i];
        }
    }
    StateStorage.write(buffer);
}

function getClientNameList() {
    return {
        host: username,
        peers: Array.from(clients.values()),
        viewer: Array.from(spectators.values())
    };
}

class RTCController {
    
    getInstances() {
        return rtcClient.getInstances();
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
            let res = await rtcClient.register(name, pass, desc);
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
        await rtcClient.unregister();
    }

    connect(name, pass) {
        return new Promise(async function(resolve) {
            let res = await rtcClient.connect(name, pass);
            if (res.success === true) {
                rtcClient.onmessage = async function(key, msg) {
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
                rtcClient.sendOne(key, {
                    type: "kick",
                    data: reason
                });
                await rtcClient.cut(key);
            }
        }
    }

    async disconnect() {
        await rtcClient.disconnect();
    }

}

export default new RTCController;

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
    rtcClient.send({
        type: "name",
        data: name
    });
    return true;
}

function onJoined() {
    rtcClient.onmessage = async function(key, msg) {
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
        rtcClient.send({
            type: "event",
            data: event
        });
    });
}

async function onHosting() {
    rtcClient.onmessage = function(key, msg) {
        if (msg.type == "name") {
            if (msg.data == username || reverseLookup.has(msg.data)) {
                rtcClient.sendOne(key, {
                    type: "name",
                    data: false
                });
            } else {
                rtcClient.sendOne(key, {
                    type: "name",
                    data: true
                });
                rtcClient.sendOne(key, {
                    type: "state",
                    data: getState()
                });
                clients.set(key, msg.data);
                // or spectators.set(key, msg.data);
                reverseLookup.set(msg.data, key);
                // TODO toast a join message
                rtcClient.sendButOne(key, {
                    type: "join",
                    data: msg.data
                });
                let data = getClientNameList();
                rtcClient.send({
                    type: "room",
                    data: data
                });
                ON_ROOMUPDATE(data);
            }
        } else if (msg.type == "event") {
            if (clients.has(key)) {
                rtcClient.sendButOne(key, msg);
                eventModule.trigger(msg.data.name, msg.data.data);
            }
        }
    };
    rtcClient.onconnect = function(key) {
        rtcClient.sendOne(key, {
            type: "state",
            data: getState()
        });
    };
    rtcClient.ondisconnect = function(key) {
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
        rtcClient.send({
            type: "leave",
            data: name
        });
        reverseLookup.delete(name);
        let data = getClientNameList();
        rtcClient.send({
            type: "room",
            data: data
        });
        ON_ROOMUPDATE(data);
    };
    eventModule.register(function(event) {
        rtcClient.send({
            type: "event",
            data: event
        });
    });
    ON_ROOMUPDATE(getClientNameList());
}