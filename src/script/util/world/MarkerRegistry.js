const WORLD = new Map();

class MarkerRegistry {

    set(ref, entry) {
        WORLD.set(ref, entry);
    }

    get(ref) {
        return WORLD.get(ref);
    }

}

export default new MarkerRegistry();