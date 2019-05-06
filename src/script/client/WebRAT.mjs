import DeepSigClient from "./SigClient.mjs";
import DeepRTCClient from "./RTCClient.mjs";
import DeepRTCHost from "./RTCHost.mjs";
import DeepLobbyClient from "./LobbyClient.mjs";

const SEC = window.location.protocol == "https:";

async function getFile(url, data) {
    let r = await fetch(url, {
        method: !!data?"POST":"GET",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    if (r.status < 200 || r.status >= 300) {
        throw new Error(`error loading file "${url}" - status: ${r.status}`);
    }
    return r;
}

const EMPTY_FN = function() {};

const MASTER_KEY = new WeakMap();
const MASTER_NAME = new WeakMap();
const RTC_INST = new WeakMap();
const ON_MESSAGE = new WeakMap();
const ON_CONNECT = new WeakMap();
const ON_DISCONNECT = new WeakMap();

const SIG_WS = new WeakMap();
const LOBBY_WS = new WeakMap();
const LOBBY_HTTP = new WeakMap();

class DeepWebRAT {

    constructor() {
        if (window.location.hostname == "localhost") {
            LOBBY_HTTP.set(this, `http${SEC?"s":""}://${window.location.hostname}:8001`);
            LOBBY_WS.set(this, `ws${SEC?"s":""}://${window.location.hostname}:8001`);
            SIG_WS.set(this, `${window.location.hostname}:8002`);
        } else {
            LOBBY_HTTP.set(this, `http${SEC?"s":""}://${window.location.hostname}`);
            LOBBY_WS.set(this, `ws${SEC?"s":""}://${window.location.hostname}`);
            SIG_WS.set(this, window.location.hostname);
        }
        ON_MESSAGE.set(this, EMPTY_FN);
        ON_CONNECT.set(this, EMPTY_FN);
        ON_DISCONNECT.set(this, EMPTY_FN);
        RTC_INST.set(this, new Map);
        MASTER_KEY.set(this, btoa(crypto.getRandomValues(new Uint8Array(16)).join("")));
    }

    async register(name, pass = "", desc = "") {
        console.log("LOBBY:REGISTER_ROOM", name, pass, desc);
        if (MASTER_NAME.has(this)) return;
        MASTER_NAME.set(this, name);
        let client = new DeepLobbyClient(LOBBY_WS.get(this), async function(key) {
            console.log("LOBBY:REQUESTED_CONNECTION", key);
            let sig = new DeepSigClient(SIG_WS.get(this));
            await sig.isReady();
            let rtc = new DeepRTCHost(sig, key);
            rtc.key = key;
            rtc.onmessage = function(msg) {
                console.log("RECIEVE", rtc.key, msg);
                ON_MESSAGE.get(this)(rtc.key, msg);
            }.bind(this);
            RTC_INST.get(this).set(key, rtc);
            rtc.onconnected = function() {
                sig.close();
                ON_CONNECT.get(this)(rtc.key);
                console.log(`connected to client ${key}`);
            }.bind(this);
            rtc.ondisconnected = function() {
                RTC_INST.get(this).delete(rtc.key);
                ON_DISCONNECT.get(this)(rtc.key);
                console.log(`disconnected from client ${key}`);
            }.bind(this);
            return sig.UUID;
        }.bind(this));
        await client.isReady();
        let res = await getFile(`${LOBBY_HTTP.get(this)}/lobby?action=register&pass=${MASTER_KEY.get(this)}`, {
            pass: pass,
            name: name,
            desc: desc,
            uuid: client.UUID,
        });
        return await res.json();
    }
    
    async unregister() {
        console.log("LOBBY:UNREGISTER_ROOM");
        let res = await getFile(`${LOBBY_HTTP.get(this)}/lobby?action=unregister&name=${MASTER_NAME.get(this)}&pass=${MASTER_KEY.get(this)}`);
        res = await res.json();
        if (res.success === true) {
            MASTER_NAME.delete(this);
        }
        return res;
    }
    
    async connect(name, pass = "") {
        console.log("LOBBY:GET_HOST_UUID", name, pass);
        let sig = new DeepSigClient(SIG_WS.get(this));
        await sig.isReady();
        let res = await getFile(`${LOBBY_HTTP.get(this)}/lobby?action=resolve&name=${name}&pass=${pass}`, sig.UUID);
        res = await res.json();
        if (res.success === true) {
            console.log("LOBBY:CONNECT_TO_HOST", res.key);
            let rtc = new DeepRTCClient(sig, res.key);
            rtc.key = res.key;
            rtc.onmessage = function(msg) {
                console.log("RECIEVE", rtc.key, msg);
                ON_MESSAGE.get(this)(rtc.key, msg);
            }.bind(this);
            rtc.onconnected = function() {
                sig.close();
                ON_CONNECT.get(this)(rtc.key);
                console.log(`connected to host ${res.key}`);
            }.bind(this);
            rtc.ondisconnected = function() {
                RTC_INST.get(this).delete(rtc.key);
                ON_DISCONNECT.get(this)(rtc.key);
                console.log(`disconnected from host ${res.key}`);
            }.bind(this);
            RTC_INST.get(this).set(res.key, rtc);
        }
        return {success: res.success};
    }

    async disconnect() {
        console.log("LOBBY:DISCONNECT");
        RTC_INST.get(this).forEach(function(rtc) {
            rtc.close();
        });
    }
    
    async getInstances() {
        console.log("LOBBY:REFRESH_INSTANCES");
        let res = await getFile(`${LOBBY_HTTP.get(this)}/lobby`);
        return await res.json();
    }

    send(msg) {
        console.log("SEND[BC]", msg);
        Array.from(RTC_INST.get(this).values()).forEach(function(rtc) {
            rtc.send(msg)
        });
    }

    sendOne(key, msg) {
        console.log("SEND[uc]", key, msg);
        RTC_INST.get(this).get(key).send(msg);
    }

    sendButOne(key, msg) {
        console.log("SEND[mc] (exclude)", key, msg);
        Array.from(RTC_INST.get(this).values()).forEach(function(rtc) {
            if (rtc.key == key) return;
            rtc.send(msg);
        });
    }

    set onmessage(value) {
        if (typeof value == "function") {
            ON_MESSAGE.set(this, value);
        } else {
            ON_MESSAGE.set(this, EMPTY_FN);
        }
    }

    set onconnect(value) {
        if (typeof value == "function") {
            ON_CONNECT.set(this, value);
        } else {
            ON_CONNECT.set(this, EMPTY_FN);
        }
    }

    set ondisconnect(value) {
        if (typeof value == "function") {
            ON_DISCONNECT.set(this, value);
        } else {
            ON_DISCONNECT.set(this, EMPTY_FN);
        }
    }

}

export default new DeepWebRAT;