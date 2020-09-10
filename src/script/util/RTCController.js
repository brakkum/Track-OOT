
import Dialog from "/emcJS/ui/Dialog.js";
import Toast from "/emcJS/ui/Toast.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import EventBusModuleGeneric from "/emcJS/util/events/EventBusModuleGeneric.js";
import RTCClient from "/rtc/RTCClient.js";
import StateStorage from "/script/storage/StateStorage.js";

// TODO create listentry editor for using custom stun/turn server config

const CONFIG = {
    iceTransportPolicy: "all", // all | relay
    iceServers: [{
        urls: 'stun:stun.zidargs.net:18001'
    },{
        urls: 'stun:stun.l.google.com:19302'
    },{
        urls: 'turn:turn.zidargs.net:18001',
        credential: 'fHNsIeqdgVcUAypvaxDVE6tywaMlP1fA',
        username: 'iamgroot'
    }]
};

const rtcClient = new RTCClient(window.location.hostname == "localhost" ? 8001 : "", CONFIG, ["data"]);

const EVENT_BLACKLIST = [
    "logic",
    "filter",
    "location_change",
    "location_mode",
    "statechange_shops_names",
    "state"
];
const eventModule = new EventBusModuleGeneric();
EventBus.addModule(eventModule, {
    blacklist: EVENT_BLACKLIST
});

let silent = false;
let username = "";
let clients = new Map();
let spectators = new Map();
let reverseLookup = new Map();

const EMPTY_FN = function() {};
let ON_ROOMUPDATE = EMPTY_FN;

function getState() {
    let state = StateStorage.getAll();
    let extra = StateStorage.getAllExtra();
    let res = {};
    for (let i in extra) {
        if (!i.endsWith("Names")) {
            res[i] = extra[i];
        }
    }
    return {
        state: state,
        extra: res
    };
}

function setState(data) {
    let buffer = {};
    for (let i in data.extra) {
        if (!i.endsWith("Names")) {
            buffer[i] =  data.extra[i];
        }
    }
    StateStorage.reset(data.state, buffer);
}

function getClientNameList() {
    return {
        host: username,
        peers: Array.from(clients.values()),
        viewer: Array.from(spectators.values())
    };
}

class RTCController {

    setLogger(value) {
        RTCClient.setLogger(value);
    }
    
    async getInstances(supressError) {
        let res = await rtcClient.getInstances();
        if (res == null || !res.success) {
            if (!supressError) {
                await Dialog.alert("Connection error", "There seems to be an connection issue trying to refresh the instance list.\nPlease try again later.");
            }
            if (res.error != null) {
                console.error(res.error);
            }
            return [];
        }
        return res.data;
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
                    onHosting(this);
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
        let res = await rtcClient.unregister();
        if (!res.success) {
            await Dialog.alert("Error closing Room", "The Room could not be closed.");
            return false;
        }
        return true;
    }

    connect(name, pass) {
        return new Promise(async function(resolve) {
            rtcClient.onfailed = async function() {
                await Dialog.alert("Connection failed", "Something went wrong connecting to the host.\nPlease try again later!");
                rtcClient.onfailed = undefined;
                resolve(false);
            };
            let res = await rtcClient.connect(name, pass);
            if (res.success === true) {
                rtcClient.setMessageHandler("data", async function(key, msg) {
                    if (msg.type == "name") {
                        if (!!msg.data) {
                            rtcClient.onfailed = undefined;
                            rtcClient.ondisconnect = async function(key) {
                                await Dialog.alert("Disconnected from host", "The connection to the host closed unexpectedly.");
                            };
                            onJoined(this);
                            resolve(true);
                        } else {
                            await Dialog.alert("Username taken", `The username "${username}" is already taken.\nPlease choose another one!`);
                            if (!await promptPeerName()) {
                                rtcClient.onfailed = undefined;
                                resolve(false);
                            }
                        }
                    }
                });
                rtcClient.onconnect = async function(key) {
                    if (!await promptPeerName()) {
                        rtcClient.onfailed = undefined;
                        resolve(false);
                    }
                };
            } else {
                await Dialog.alert("Connection refused", "You have no permission to enter the room.\nDid you enter the correct password?");
                rtcClient.onfailed = undefined;
                resolve(false);
            }
        });
    }

    async kick(name) {
        if (reverseLookup.has(name)) {
            let reason = await Dialog.prompt("Please provide a reason", "Please provide a reason for kicking the client.");
            if (typeof reason == "string") {
                let key = reverseLookup.get(name);
                rtcClient.sendOne("data", key, {
                    type: "kick",
                    data: reason
                });
                await rtcClient.cut(key);
            }
        }
    }

    async disconnect() {
        rtcClient.ondisconnect = EMPTY_FN;
        await rtcClient.disconnect();
        clients.clear();
        spectators.clear();
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
    rtcClient.send("data", {
        type: "name",
        data: name
    });
    return true;
}

function onJoined() {
    silent = false;
    rtcClient.setMessageHandler("data", async function(key, msg) {
        if (msg.type == "join") {
            Toast.show(`Multiplayer: "${msg.data}" joined`);
        } else if (msg.type == "leave") {
            Toast.show(`Multiplayer: "${msg.data}" left`);
        } else if (msg.type == "kick") {
            await Dialog.alert("You have been kicked", `You have been kicked by the host: ${!!msg.data ? msg.data : "no reason provided"}.`);
        } else if (msg.type == "room") {
            ON_ROOMUPDATE(msg.data);
        } else if (msg.type == "state") {
            setState(msg.data);
        } else if (msg.type == "event") {
            if (EVENT_BLACKLIST.indexOf(msg.data.name) < 0) {
                silent = true;
                if (!StateStorage.resolveNetworkStateEvent(msg.data.name, msg.data.data)) {
                    eventModule.trigger(msg.data.name, msg.data.data);
                }
                silent = false;
            }
        }
    });
    eventModule.register(function(event) {
        if (!silent) {
            rtcClient.send("data", {
                type: "event",
                data: event
            });
        }
    });
}

async function onHosting() {
    silent = false;
    rtcClient.setMessageHandler("data", function(key, msg) {
        if (msg.type == "name") {
            if (msg.data == username || reverseLookup.has(msg.data)) {
                rtcClient.sendOne("data", key, {
                    type: "name",
                    data: false
                });
            } else {
                rtcClient.sendOne("data", key, {
                    type: "name",
                    data: true
                });
                rtcClient.sendOne("data", key, {
                    type: "state",
                    data: getState()
                });
                clients.set(key, msg.data);
                // or spectators.set(key, msg.data);
                reverseLookup.set(msg.data, key);
                Toast.show(`Multiplayer: "${msg.data}" joined`);
                rtcClient.sendButOne("data", key, {
                    type: "join",
                    data: msg.data
                });
                let data = getClientNameList();
                rtcClient.send("data", {
                    type: "room",
                    data: data
                });
                ON_ROOMUPDATE(data);
            }
        } else if (msg.type == "event") {
            if (clients.has(key)) {
                if (EVENT_BLACKLIST.indexOf(msg.data.name) < 0) {
                    rtcClient.sendButOne("data", key, msg);
                    silent = true;
                    if (!StateStorage.resolveNetworkStateEvent(msg.data.name, msg.data.data)) {
                        eventModule.trigger(msg.data.name, msg.data.data);
                    }
                    silent = false;
                }
            }
        }
    });
    rtcClient.onconnect = function(key) {
        // nothing
    };
    rtcClient.ondisconnect = function(key) {
        let name = "";
        if (clients.has(key)) {
            name = clients.get(key);
            clients.delete(key);
        } else if (spectators.has(key)) {
            name = spectators.get(key);
            spectators.delete(key);
        } else {
            return;
        }
        Toast.show(`Multiplayer: "${name}" left`);
        rtcClient.send("data", {
            type: "leave",
            data: name
        });
        reverseLookup.delete(name);
        let data = getClientNameList();
        rtcClient.send("data", {
            type: "room",
            data: data
        });
        ON_ROOMUPDATE(data);
    };
    eventModule.register(function(event) {
        if (!silent) {
            rtcClient.send("data", {
                type: "event",
                data: event
            });
        }
    });
    ON_ROOMUPDATE(getClientNameList());
}