import EventBus from "/emcJS/util/events/EventBus.js";
import ItemStates from "../ItemStates.js";
import StateStorage from "/script/storage/StateStorage.js";
import AbstractItemState from "/script/state/items/AbstractItemState.js";

function stateLoaded(event) {
    const ref = this.ref;
    // savesatate
    let value = parseInt(event.data.state[ref]);
    if (isNaN(value)) {
        value = 0;
    }
    this.value = value;
}

function stateChanged(event) {
    const ref = this.ref;
    // savesatate
    const change = event.data[ref];
    if (change != null) {
        let value = parseInt(change.newValue);
        if (isNaN(value)) {
            value = 0;
        }
        this.value = value;
    }
}

function dungeonTypeUpdate(event) {
    const props = this.props;
    if (props.hasOwnProperty("maxmq") && props.hasOwnProperty("related_dungeon")) {
        const change = event.data[props.related_dungeon];
        if (change != null) {
            const type = StateStorage.readExtra("dungeontype", data.related_dungeon, "n");
            if (type == "v") {
                this.max = data.max;
            } else if (type == "mq") {
                this.max = data.maxmq;
            } else {
                this.max = Math.max(data.maxmq, data.max);
            }
        }
    }
}

export default class ItemKeyState extends AbstractItemState {

    constructor(ref, props) {
        super(ref, props, props.max, 0);
        /* EVENTS */
        EventBus.register("state", stateLoaded.bind(this));
        EventBus.register("statechange", stateChanged.bind(this));
        EventBus.register("statechange_dungeontype", dungeonTypeUpdate.bind(this));
    }

    set min(value) {
        // no action
    }

    get min() {
        return super.min;
    }

}

ItemStates.register("key", ItemKeyState);