
import Logger from "/deepJS/util/Logger.mjs";

const RTC = new WeakMap();
const DCH = new WeakMap();

const EMPTY_FN = function() {};
const ON_MESSAGE = new WeakMap();
const ON_CONNECTED = new WeakMap();
const ON_DISCONNECTED = new WeakMap();

const configuration = {
    iceServers: [{
        urls: 'stun:stun.l.google.com:19302'
    }]
};

export default class DeepRTCClient {

    constructor(sigCh, reciever) {
        ON_MESSAGE.set(this, EMPTY_FN);
        ON_CONNECTED.set(this, EMPTY_FN);
        ON_DISCONNECTED.set(this, EMPTY_FN);
        let rtc = new RTCPeerConnection(configuration);
        RTC.set(this, rtc);
        rtc.onconnectionstatechange = function (event) {
            Logger.info(`STATE: "${rtc.connectionState}"`, "RAT-RTC");
        }.bind(this);
        let dch = rtc.createDataChannel("data");
        dch.onopen = function(event) {
            ON_CONNECTED.get(this)();
        }.bind(this);
        dch.onclose = function(event) {
            ON_DISCONNECTED.get(this)();
        }.bind(this);
        dch.onmessage = function(event) {
            ON_MESSAGE.get(this)(JSON.parse(event.data));
        }.bind(this);
        DCH.set(this, dch);
        rtc.onicecandidate = function(event) {
            sigCh.sendICE(reciever, event.candidate);
        };
        sigCh.onice = function(sender, candidate) {
            if (sender == reciever && !!candidate)  {
                rtc.addIceCandidate(candidate);
            }
        };
        sigCh.onanswer = function(sender, answer) {
            if (sender == reciever)  {
                rtc.setRemoteDescription(answer);
            }
        };
        rtc.createOffer().then(function(offer) {
            rtc.setLocalDescription(offer).then(function() {
                sigCh.sendSDP(reciever, offer);
            });
        });
    }

    close() {
        RTC.get(this).close();
    }

    send(msg) {
        DCH.get(this).send(JSON.stringify(msg));
    }

    set onmessage(value) {
        if (typeof value == "function") {
            ON_MESSAGE.set(this, value);
        } else {
            ON_MESSAGE.set(this, EMPTY_FN);
        }
    }

    set onconnected(value) {
        if (typeof value == "function") {
            ON_CONNECTED.set(this, value);
        } else {
            ON_CONNECTED.set(this, EMPTY_FN);
        }
    }

    set ondisconnected(value) {
        if (typeof value == "function") {
            ON_DISCONNECTED.set(this, value);
        } else {
            ON_DISCONNECTED.set(this, EMPTY_FN);
        }
    }

}