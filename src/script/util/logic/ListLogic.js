import FileData from "/emcJS/storage/FileData.js";
import Logger from "/emcJS/util/Logger.js";
import StateStorage from "/script/storage/StateStorage.js";
import Logic from "/script/util/logic/Logic.js";
import MarkerRegistry from "/script/util/world/MarkerRegistry.js";

class ListLogic {
    
    check(list) {
        const world = FileData.get("world/marker");
        const res = {
            done: 0,
            unopened: 0,
            reachable: 0,
            entrances: false,
            value: 0
        };
        if (!!list && Array.isArray(list)) {
            for (const entry of list) {
                const category = entry.category;
                const id = entry.id;
                const buffer = world[category][id];
                if (category == "location") {
                    const access = buffer.access;
                    if (!StateStorage.read(`${category}/${id}`, 0)) {
                        res.unopened++;
                        if (Logic.getValue(access)) {
                            res.reachable++;
                        }
                    } else {
                        res.done++;
                    }
                } else if (category == "subarea") {
                    const subarea = FileData.get(`world/subarea/${id}/list`).filter(this.filterUnusedChecks);
                    const {done, unopened, reachable} = this.check(subarea);
                    res.done += done;
                    res.unopened += unopened;
                    res.reachable += reachable;
                } else if (category == "subexit") {
                    const exitData = FileData.get(`world/marker/subexit/${id}`);
                    const [source] = exitData.access.split(" -> ");
                    const bound = StateStorage.readExtra("exits", exitData.access);
                    if (!bound) {
                        if (!!Logic.getValue(`${source}[child]`) || !!Logic.getValue(`${source}[adult]`)) {
                            res.entrances = true;
                        }
                        continue;
                    }
                    let entranceData = FileData.get(`world/exit/${bound}`);
                    if (entranceData == null) {
                        const [reroute, entrance] = bound.split(" -> ");
                        entranceData = FileData.get(`world/exit/${entrance} -> ${reroute}`)
                    }
                    if (entranceData != null) {
                        const subarea = FileData.get(`world/${entranceData.area}/list`).filter(this.filterUnusedChecks);
                        const {done, unopened, reachable} = this.check(subarea);
                        res.done += done;
                        res.unopened += unopened;
                        res.reachable += reachable;
                    }
                } else {
                    Logger.error((new Error(`unknown category "${category}" for entry "${id}"`)), "ListLogic");
                }
            }
        }
        if (res.unopened > 0) {
            if (res.reachable > 0) {
                if (res.unopened == res.reachable) {
                    res.value = 3;
                } else {
                    res.value = 2;
                }
            } else {
                res.value = 1;
            }
        }
        return res;
    }

    filterUnusedChecks(check) {
        const loc = MarkerRegistry.get(`${check.category}/${check.id}`);
        return !!loc && loc.visible();
    }

}

export default new ListLogic();
