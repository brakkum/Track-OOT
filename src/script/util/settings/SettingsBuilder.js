import GlobalData from "/script/storage/GlobalData.js";
import I18n from "/script/util/I18n.js";

const VARS = {
    "I18n.languages": I18n.getLanguages
};

function convertValueList(values = [], names = []) {
    let opt = {};
    if (typeof values == "string") {
        values = VARS[values]();
    }
    if (typeof values == "object") {
        for (let k in values) {
            if (names.hasOwnProperty(k)) {
                opt[values[k]] = I18n.translate(names[k]);
            } else {
                opt[values[k]] = I18n.translate(values[k]);
            }
        }
    }
    return opt;
}

function buildSettings(settings) {
    let options = GlobalData.get("settings");
    for (let i in options) {
        settings.addTab(I18n.translate(i), i);
        for (let j in options[i]) {
            let val = options[i][j];
            let label = I18n.translate(j);
            let min = parseFloat(val.min);
            let max = parseFloat(val.max);
            switch (val.type) {
                case "string":
                    settings.addStringInput(i, label, j, val.default);
                break;
                case "number":
                    settings.addNumberInput(i, label, j, val.default, min, max);
                break;
                case "range":
                    settings.addRangeInput(i, label, j, val.default, min, max);
                break;
                case "check":
                    settings.addCheckInput(i, label, j, val.default);
                break;
                case "choice":
                    settings.addChoiceInput(i, label, j, val.default, convertValueList(val.values, val.names));
                break;
                case "list":
                    settings.addListSelectInput(i, label, j, val.default, true, convertValueList(val.values, val.names));
                break;
                case "button":
                    if (!!val.view) {
                        settings.addButton(i, label, j, I18n.translate(val.text), switchView.bind(this, val.view));
                    } else if (!!val.url) {
                        settings.addButton(i, label, j, I18n.translate(val.text), () => {
                            window.open(val.url, val.target || "_blank");
                        });
                    } else {
                        settings.addButton(i, label, j, I18n.translate(val.text), alert.bind(window, "not functionality bound"));
                    }
                break;
            }
        }
    }
    function switchView(view) {
        document.getElementById('view-pager').setAttribute("active", view);
        settings.close();
    }
}

export { buildSettings };