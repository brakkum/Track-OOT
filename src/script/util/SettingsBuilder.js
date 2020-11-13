import Language from "/script/util/Language.js";

const VARS = {
    "I18n.languages": Language.getLanguages
};

function convertValueList(values = [], names = []) {
    let opt = {};
    if (typeof values == "string") {
        values = VARS[values]();
    }
    if (typeof values == "object") {
        for (let k in values) {
            if (names.hasOwnProperty(k)) {
                opt[values[k]] = Language.translate(names[k]);
            } else {
                opt[values[k]] = Language.translate(values[k]);
            }
        }
    }
    return opt;
}

class SettingsBuilder {

    build(window, options) {
        for (let i in options) {
            window.addTab(Language.translate(i), i);
            for (let j in options[i]) {
                let val = options[i][j];
                let label = Language.translate(j);
                let min = parseFloat(val.min);
                let max = parseFloat(val.max);
                switch (val.type) {
                    case "string":
                        window.addStringInput(i, label, j, val.default);
                    break;
                    case "number":
                        window.addNumberInput(i, label, j, val.default, min, max);
                    break;
                    case "range":
                        window.addRangeInput(i, label, j, val.default, min, max);
                    break;
                    case "check":
                        window.addCheckInput(i, label, j, val.default);
                    break;
                    case "choice":
                        window.addChoiceInput(i, label, j, val.default, convertValueList(val.values, val.names));
                    break;
                    case "list":
                        window.addListSelectInput(i, label, j, val.default, true, convertValueList(val.values, val.names));
                    break;
                    case "button":
                        window.addButton(i, label, j, Language.translate(val.text), alert.bind(window, "not functionality bound"));
                    break;
                }
            }
        }
    }

}

export default new SettingsBuilder();