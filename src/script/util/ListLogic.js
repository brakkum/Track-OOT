import GlobalData from "/emcJS/storage/GlobalData.js";
import StateStorage from "/script/storage/StateStorage.js";
import Logic from "/script/util/Logic.js";

class ListLogic {
    
    check(list) {
        let world = GlobalData.get("world");
        let res = {
            unopened: 0,
            reachable: 0,
            value: 0
        };
        if (!!list && Array.isArray(list)) {
            for (let name of list) {
                let access = world[name].access;
                if (!StateStorage.read(name, 0)) {
                    res.unopened++;
                    if (Logic.getValue(access)) {
                        res.reachable++;
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

}

export default new ListLogic();