
import Logger from "/deepJS/util/Logger.js";

const CLIENT = new WeakMap();
const TIMEOUT = new WeakMap();
const READY_AWAIT = new WeakMap();

const pingOut = 3000;

export default class DeepLobbyClient {

    constructor(url, onMessage) {
        let client = new WebSocket(`${url}/lobby`);
        READY_AWAIT.set(this, []);
        client.addEventListener('open', function() {
            CLIENT.set(this, client);
            clearTimeout(TIMEOUT.get(this));
            TIMEOUT.set(this, setTimeout(client.close, pingOut));
        }.bind(this));
        client.addEventListener('close', function() {
            CLIENT.delete(this);
            clearTimeout(TIMEOUT.get(this));
            TIMEOUT.delete(this);
        }.bind(this));
        client.addEventListener('message', function(event) {
            let msg = JSON.parse(event.data);
            switch(msg.type) {
                case "ping":
                    clearTimeout(TIMEOUT.get(this));
                    TIMEOUT.set(this, setTimeout(client.close, pingOut));
                    CLIENT.get(this).send(JSON.stringify({
                        type:"pong",
                        time:msg.time
                    }));
                break;
                case "uuid":
                    Logger.info(`UUID: ${JSON.stringify(msg.body)}`, "RAT-LOBBY");
                    this.UUID = msg.body;
                    READY_AWAIT.get(this).forEach(function(fn) {
                        fn(true);
                    });
                    READY_AWAIT.delete(this);
                break;
                default:
                    onMessage(msg.body).then(function(answer) {
                        CLIENT.get(this).send(JSON.stringify({
                            requestID:msg.requestID,
                            body:answer
                        }));
                    }.bind(this));
                break;
            }
        }.bind(this));
    }

    isReady() {
        return new Promise(function(resolve) {
            if (READY_AWAIT.has(this)) {
                READY_AWAIT.get(this).push(resolve);
            } else {
                resolve(true);
            }
        }.bind(this));
    }

}