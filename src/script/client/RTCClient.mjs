const RTC = new WeakMap();
const DCH = new WeakMap();

const EMPTY_FN = function() {};
const ON_MESSAGE = new WeakMap();
const ON_CONNECTED = new WeakMap();
const ON_DISCONNECTED = new WeakMap();

const configuration = {
    iceServers: [{
        urls: 'stun:stun.l.google.com'
    }, {
        urls: 'turn:192.158.29.39:3478?transport=udp',
        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        username: '28224511:1379330808'
    }, {
        urls: 'turn:192.158.29.39:3478?transport=tcp',
        credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
        username: '28224511:1379330808'
    }]
};

export default class DeepRTCClient {

    constructor(sigCh, reciever) {
        ON_MESSAGE.set(this, EMPTY_FN);
        ON_CONNECTED.set(this, EMPTY_FN);
        ON_DISCONNECTED.set(this, EMPTY_FN);
        let rtc = new RTCPeerConnection(configuration);
        RTC.set(this, rtc);
        let dch = rtc.createDataChannel("data");
        dch.onmessage = function(event) {
            ON_MESSAGE.get(this)(JSON.parse(event.data));
        }.bind(this);
        DCH.set(this, dch);
        rtc.onconnectionstatechange = function (event) {
            switch (rtc.connectionState) {
                case "connected": ON_CONNECTED.get(this)();
                break;
                case "disconnected": ON_DISCONNECTED.get(this)();
                break;
            }
        }.bind(this);
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