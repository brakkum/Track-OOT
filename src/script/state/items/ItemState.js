import EventBus from "/emcJS/util/events/EventBus.js";
import ItemStates from "../ItemStates.js";
import AbstractItemState from "/script/state/items/AbstractItemState.js";

function stateLoaded(event) {
    const ref = this.ref;
    // savesatate
    this.value = parseInt(event.data.state[ref]) || 0;
}

function stateChanged(event) {
    const ref = this.ref;
    // savesatate
    const change = event.data[ref];
    if (change != null) {
        this.value = parseInt(change.newValue) || 0;
    }
}

export default class ItemState extends AbstractItemState {

    constructor(ref, props) {
        super(ref, props, props.max, 0);
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

}

ItemStates.register("item", ItemState);