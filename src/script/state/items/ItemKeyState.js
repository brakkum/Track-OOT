import EventBus from "/emcJS/util/events/EventBus.js";
import ItemStates from "../ItemStates.js";
import StateStorage from "/script/storage/StateStorage.js";
import AbstractItemState from "/script/state/items/AbstractItemState.js";

const TYPE = new WeakMap();

function stateLoaded(event) {
    const ref = this.ref;
    const props = this.props;
    // savesatate
    this.value = parseInt(event.data.state[ref]) || 0;
    // type
    if (props["maxmq"] != null && props.hasOwnProperty["related_dungeon"] != null) {
        const types = event.data.extra.dungeontype;
        if (types != null) {
            this.type = types[props.related_dungeon];
        } else {
            this.type = "n";
        }
    }
}

function stateChanged(event) {
    const ref = this.ref;
    // savesatate
    const change = event.data[ref];
    if (change != null) {
        this.value = parseInt(change.newValue) || 0;
    }
}

function dungeonTypeUpdate(event) {
    const props = this.props;
    if (props["maxmq"] != null && props["related_dungeon"] != null) {
        const change = event.data[props.related_dungeon];
        if (change != null) {
            this.type = StateStorage.readExtra("dungeontype", props.related_dungeon, "n");
        }
    }
}

export default class ItemKeyState extends AbstractItemState {

    constructor(ref, props) {
        super(ref, props, props.max, 0);
        if (props["maxmq"] != null && props["related_dungeon"] != null) {
            this.type = StateStorage.readExtra("dungeontype", props.related_dungeon, "n");
        } else {
            this.type = "v";
        }
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

    set type(value) {
        const type = TYPE.get(this);
        TYPE.set(this, value);
        if (type != value) {
            const props = this.props;
            if (value == "v") {
                this.max = props.max;
            } else if (value == "mq") {
                this.max = props.maxmq;
            } else {
                this.max = Math.max(props.maxmq, props.max);
            }
            const event = new Event("type");
            event.data = value;
            this.dispatchEvent(event);
        }
    }

    get type() {
        return TYPE.get(this);
    }

}

ItemStates.register("key", ItemKeyState);
