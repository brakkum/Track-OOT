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

function switchView(view) {
    document.getElementById('view-pager').setAttribute("active", view);
    window.close();
}

class SettingsBuilder {

    build(window, options) {
        for (let i in options) {
            window.addTab(I18n.translate(i), i);
            for (let j in options[i]) {
                let val = options[i][j];
                let label = I18n.translate(j);
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
                        if (!!val.view) {
                            window.addButton(i, label, j, I18n.translate(val.text), switchView.bind(this, val.view));
                        } else if (!!val.url) {
                            window.addButton(i, label, j, I18n.translate(val.text), () => {
                                window.open(val.url, val.target || "_blank");
                            });
                        } else {
                            window.addButton(i, label, j, I18n.translate(val.text), alert.bind(window, "not functionality bound"));
                        }
                    break;
                }
            }
        }
    }

}

export default new SettingsBuilder();