
import Logger from "/deepJS/util/Logger.js";
import DeepSigClient from "./SigClient.js";
import DeepRTCClient from "./RTCClient.js";
import DeepRTCHost from "./RTCHost.js";
import DeepLobbyClient from "./LobbyClient.js";

const SEC = window.location.protocol == "https:";

async function getFile(url, data) {
    let r = await fetch(url, {
        method: !!data?"POST":"GET",
        cache: "no-cache",
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
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
        Logger.info(`REGISTER_ROOM: ${name}`, "RAT-LOBBY");
        if (MASTER_NAME.has(this)) return;
        MASTER_NAME.set(this, name);
        let client = new DeepLobbyClient(LOBBY_WS.get(this), async function(key) {
            Logger.info(`REQUESTED_CONNECTION: ${key}`, "RAT-LOBBY");
            let sig = new DeepSigClient(SIG_WS.get(this));
            await sig.isReady();
            let rtc = new DeepRTCHost(sig, key);
            rtc.key = key;
            rtc.onmessage = function(msg) {
                Logger.info(`${rtc.key}: ${JSON.stringify(msg)}`, "RAT-MSG");
                ON_MESSAGE.get(this)(rtc.key, msg);
            }.bind(this);
            RTC_INST.get(this).set(key, rtc);
            rtc.onconnected = function() {
                sig.close();
                ON_CONNECT.get(this)(rtc.key);
                Logger.info(`CONNECTED: ${rtc.key}`, "RAT-RTC");
            }.bind(this);
            rtc.ondisconnected = function() {
                RTC_INST.get(this).delete(rtc.key);
                ON_DISCONNECT.get(this)(rtc.key);
                Logger.info(`DISCONNECTED: ${rtc.key}`, "RAT-RTC");
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
        Logger.info("UNREGISTER_ROOM", "RAT-LOBBY");
        let res = await getFile(`${LOBBY_HTTP.get(this)}/lobby?action=unregister&name=${MASTER_NAME.get(this)}&pass=${MASTER_KEY.get(this)}`);
        res = await res.json();
        if (res.success === true) {
            MASTER_NAME.delete(this);
        }
        return res;
    }
    
    async connect(name, pass = "") {
        Logger.info(`GET_HOST_UUID: ${name}`, "RAT-LOBBY");
        let sig = new DeepSigClient(SIG_WS.get(this));
        await sig.isReady();
        let res = await getFile(`${LOBBY_HTTP.get(this)}/lobby?action=resolve&name=${name}&pass=${pass}`, sig.UUID);
        res = await res.json();
        if (res.success === true) {
            Logger.info(`CONNECT_TO: ${res.key}`, "RAT-RTC");
            let rtc = new DeepRTCClient(sig, res.key);
            rtc.key = res.key;
            rtc.onmessage = function(msg) {
                Logger.info(`${rtc.key}: ${JSON.stringify(msg)}`, "RAT-MSG");
                ON_MESSAGE.get(this)(rtc.key, msg);
            }.bind(this);
            rtc.onconnected = function() {
                sig.close();
                ON_CONNECT.get(this)(rtc.key);
                Logger.info(`CONNECTED: ${rtc.key}`, "RAT-RTC");
            }.bind(this);
            rtc.ondisconnected = function() {
                RTC_INST.get(this).delete(rtc.key);
                ON_DISCONNECT.get(this)(rtc.key);
                Logger.info(`DISCONNECTED: ${rtc.key}`, "RAT-RTC");
            }.bind(this);
            RTC_INST.get(this).set(res.key, rtc);
        }
        return {success: res.success};
    }

    async cut(key) {
        Logger.info(`CUT: ${key}`, "RAT-RTC");
        RTC_INST.get(this).get(key).close();
    }

    async disconnect() {
        Logger.info("DISCONNECT", "RAT-RTC");
        RTC_INST.get(this).forEach(function(rtc) {
            rtc.close();
        });
    }
    
    async getInstances() {
        Logger.info("REFRESH_INSTANCES", "RAT-LOBBY");
        let res = await getFile(`${LOBBY_HTTP.get(this)}/lobby`);
        return await res.json();
    }

    send(msg) {
        Array.from(RTC_INST.get(this).values()).forEach(function(rtc) {
            rtc.send(msg)
        });
    }

    sendOne(key, msg) {
        RTC_INST.get(this).get(key).send(msg);
    }

    sendButOne(key, msg) {
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