const CONVERTER_FN = [];

CONVERTER_FN[0] = function(data) {
    let res = {};
    for (let i of Object.keys(data)) {
        for (let j of Object.keys(data[i])) {
            if (i != "meta") {
                if (i == "extras") {
                    res[j] = data[i][j];
                } else {
                    res[`${i}.${j}`] = data[i][j];
                }
            } else {
                res.name = data["meta"]["active_state"];
            }
        }
    }
    res.lastchanged = new Date();
    res.version = 1;
    return res;
};

const TARGET_VERSION = new WeakMap()

class StateConverter {

    constructor(targetVersion) {
        TARGET_VERSION.set(this, targetVersion);
    }

    convert(data, version = 0) {
        let tmp = data;
        for (let i = version; i < TARGET_VERSION.get(this); ++i) {
            if (typeof CONVERTER_FN[i] == "function") {
                tmp = CONVERTER_FN[i](tmp);
            }
        }
        return tmp;
    }

}

export default StateConverter;