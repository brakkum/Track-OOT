const EXITS = new Map();

class ExitRegistry {

    set(ref, entry) {
        EXITS.set(ref, entry);
    }

    get(ref) {
        if (!EXITS.has(ref)) {
            ref = ref.split(" -> ").reverse().join(" -> ");
        }
        return EXITS.get(ref);
    }

}

export default new ExitRegistry();
