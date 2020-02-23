import GlobalData from "/emcJS/storage/GlobalData.js";
import StateStorage from "/script/storage/StateStorage.js";
import Logic from "/script/util/Logic.js";
import World from "/script/util/World.js";

class ListLogic {
    
    check(list) {
        let world = GlobalData.get("world");
        let res = {
            done: 0,
            unopened: 0,
            reachable: 0,
            value: 0
        };
        if (!!list && Array.isArray(list)) {
            for (let entry of list) {
                let buffer = world[entry.id];
                if (buffer.category == "location") {
                    let access = buffer.access;
                    if (!StateStorage.read(entry.id, 0)) {
                        res.unopened++;
                        if (Logic.getValue(access)) {
                            res.reachable++;
                        }
                    } else {
                        res.done++;
                    }
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
        let loc = World.getLocation(check.id);
        return !!loc && loc.visible();
    }

}

export default new ListLogic();