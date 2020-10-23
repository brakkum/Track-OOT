const WORLD = new Map();

class WorldRegistry {

    set(ref, entry) {
        WORLD.set(ref, entry);
    }

    get(ref) {
        return WORLD.get(ref);
    }

}

export default new WorldRegistry();