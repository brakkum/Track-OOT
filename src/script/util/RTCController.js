
import Dialog from "/emcJS/ui/Dialog.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import EventBusModuleGeneric from "/emcJS/util/events/EventBusModuleGeneric.js";
import RTCClient from "/rtc/RTCClient.js";
import StateStorage from "/script/storage/StateStorage.js";

const CONFIG = [{
    urls: 'stun:stun.zidargs.net:18001'
},{
    urls: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
        'stun:stun3.l.google.com:19302',
        'stun:stun4.l.google.com:19302'
    ]
},{
    urls: 'turn:turn.zidargs.net:18001',
    credential: 'fHNsIeqdgVcUAypvaxDVE6tywaMlP1fA',
    username: 'iamgroot'
}];

const rtcClient = new RTCClient(window.location.hostname == "localhost" ? 8001 : "", CONFIG, ["data"]);

const EVENT_BLACKLIST = [
    "logic",
    "filter",
    "location_change",
    "location_mode",
    "state_change"
];
const eventModule = new EventBusModuleGeneric();
EventBus.addModule(eventModule, {
    blacklist: EVENT_BLACKLIST
});

let username = "";
let clients = new Map();
let spectators = new Map();
let reverseLookup = new Map();

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
    EventBus.trigger("state", StateStorage.getAll());
}

function getClientNameList() {
    return {
        host: username,
        peers: Array.from(clients.values()),
        viewer: Array.from(spectators.values())
    };
}

class RTCController {
    
    async getInstances() {
        let res = await rtcClient.getInstances();
        if (res == null || !res.success) {
            await Dialog.alert("Connection error", "There seems to be an connection issue trying to refresh the instance list.\nPlease try again later.");
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
        await rtcClient.unregister();
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
    rtcClient.send("data", {
        type: "name",
        data: name
    });
    return true;
}

function onJoined() {
    rtcClient.setMessageHandler("data", async function(key, msg) {
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
            if (EVENT_BLACKLIST.indexOf(msg.data.name) < 0) {
                eventModule.trigger(msg.data.name, msg.data.data);
                StateStorage.write(msg.data.data.name, msg.data.data.value);
            }
        }
    });
    eventModule.register(function(event) {
        rtcClient.send("data", {
            type: "event",
            data: event
        });
    });
}

async function onHosting() {
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
                // TODO toast a join message
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
                    eventModule.trigger(msg.data.name, msg.data.data);
                    StateStorage.write(msg.data.data.name, msg.data.data.value);
                }
            }
        }
    });
    rtcClient.onconnect = function(key) {
        /*rtcClient.sendOne("data", key, {
            type: "state",
            data: getState()
        });*/
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
        rtcClient.send("data", {
            type: "event",
            data: event
        });
    });
    ON_ROOMUPDATE(getClientNameList());
}