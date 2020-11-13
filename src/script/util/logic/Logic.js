import LogicGraph from "/emcJS/util/graph/LogicGraph.js";

const LOGIC_PROCESSOR = new LogicGraph(true);

class TrackerLogic {

    setLogic(logic, root) {
        if (!!logic) {
            LOGIC_PROCESSOR.clearGraph();
            LOGIC_PROCESSOR.load(logic);
            if (root != null) {
                return LOGIC_PROCESSOR.traverse(root);
            }
        }
        return [];
    }

    clearTranslations(root) {
        LOGIC_PROCESSOR.clearTranslations();
        if (root != null) {
            return LOGIC_PROCESSOR.traverse(root);
        }
        return [];
    }

    setTranslation(translations, root) {
        if (Array.isArray(translations)) {
            for (let t of translations) {
                LOGIC_PROCESSOR.setTranslation(t.source, t.target, t.reroute);
            }
        }
        if (root != null) {
            return LOGIC_PROCESSOR.traverse(root);
        }
        return [];
    }

    execute(data, root) {
        if (!!data) {
            LOGIC_PROCESSOR.setAll(data);
            if (root != null) {
                return LOGIC_PROCESSOR.traverse(root);
            }
        }
        return [];
    }

    reset() {
        LOGIC_PROCESSOR.reset();
    }

    getValue(ref) {
        return LOGIC_PROCESSOR.get(ref);
    }

    getAll() {
        return LOGIC_PROCESSOR.getAll();
    }

}

export default new TrackerLogic();