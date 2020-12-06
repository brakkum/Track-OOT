import EventBus from "/emcJS/util/events/EventBus.js";
import ItemStates from "../ItemStates.js";
import StateStorage from "/script/storage/StateStorage.js";
import AbstractItemState from "/script/state/items/AbstractItemState.js";

const STARTVALUE = new WeakMap();

function stateLoaded(event) {
    const ref = this.ref;
    const props = this.props;
    // savesatate
    this.value = parseInt(event.data.state[ref]) || 0;
    // settings
    if (props.hasOwnProperty("start_settings")) {
        const startvalue = parseInt(event.data.state[props.start_settings]) || 0;
        this.startvalue = startvalue > 0 ? startvalue : 1;
    }
}

function stateChanged(event) {
    const ref = this.ref;
    const props = this.props;
    // savesatate
    const change = event.data[ref];
    if (change != null) {
        this.value = parseInt(change.newValue) || 0;
    }
    // settings
    if (props.hasOwnProperty("start_settings")) {
        const start = event.data[props.start_settings];
        if (start != null) {
            const startvalue = parseInt(start.newValue) || 0;
            this.startvalue = startvalue > 0 ? startvalue : 1;
        }
    }
}

export default class ItemStartState extends AbstractItemState {

    constructor(ref, props) {
        super(ref, props, props.max, 0);
        STARTVALUE.set(this, parseInt(StateStorage.read(props.start_settings, 1)));
        /* EVENTS */
        EventBus.register("state", stateLoaded.bind(this));
        EventBus.register("statechange", stateChanged.bind(this));
    }

    set max(value) {
        // no action
    }

    get max() {
        return super.max;
    }

    set min(value) {
        // no action
    }

    get min() {
        return super.min;
    }

    set value(value) {
        if (typeof value != "number") value = 0;
        if (!!value && value < this.startvalue) {
            if (super.value > value) {
                value = 0;
            } else {
                value = this.startvalue;
            }
        }
        super.value = value;
    }

    get value() {
        return super.value;
    }

    set startvalue(value) {
        if (typeof value != "number") value = 0;
        const max = this.max;
        if (value > max) {
            value = max;
        }
        if (value != this.startvalue) {
            STARTVALUE.set(this, value);
            const event = new Event("startvalue");
            event.data = value;
            this.dispatchEvent(event);
            const state = this.value;
            if (!!state && state < value) {
                this.value = value;
            }
        }
    }

    get startvalue() {
        return STARTVALUE.get(this);
    }

}

ItemStates.register("item_startsettings", ItemStartState);