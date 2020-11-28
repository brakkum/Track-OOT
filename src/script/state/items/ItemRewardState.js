import EventBus from "/emcJS/util/events/EventBus.js";
import ItemStates from "../ItemStates.js";
import AbstractItemState from "/script/state/items/AbstractItemState.js";
import StateStorage from "/script/storage/StateStorage.js";

const ALL_DUNGEONS = [
    'area/pocket',
    'area/deku',
    'area/dodongo',
    'area/jabujabu',
    'area/temple_forest',
    'area/temple_fire',
    'area/temple_shadow',
    'area/temple_water',
    'area/temple_spirit'
];

const DUNGEON = new WeakMap();

function getDisplayDungeon(ref) {
    for (let dungeon of ALL_DUNGEONS) {
        let rewardValue = StateStorage.readExtra("dungeonreward", dungeon, "");
        if (rewardValue == ref) {
            return dungeon;
        }
    }
    return "";
}

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

function dungeonRewardUpdate(event) {
    const ref = this.ref;
    const dungeon = this.dungeon;
    const data = event.data[dungeon];
    if (data != null && data.newValue != ref) {
        this.dungeon = "";
    } else {
        for (const name in event.data) {
            if (ref == event.data[name].newValue) {
                this.dungeon = name;
                return;
            }
        }
    }
}

export default class ItemRewardState extends AbstractItemState {

    constructor(ref, props) {
        super(ref, props, props.max, 0);
        DUNGEON.set(this, getDisplayDungeon(ref));
        /* EVENTS */
        EventBus.register("state", stateLoaded.bind(this));
        EventBus.register("statechange", stateChanged.bind(this));
        EventBus.register("statechange_dungeonreward", dungeonRewardUpdate.bind(this));
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

    set dungeon(value) {
        const dungeon = DUNGEON.get(this);
        DUNGEON.set(this, value);
        if (dungeon != value) {
            const event = new Event("dungeon");
            event.data = value;
            this.dispatchEvent(event);
        }
    }

    get dungeon() {
        return DUNGEON.get(this);
    }

}

ItemStates.register("dungeonreward", ItemRewardState);