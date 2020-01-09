import Dialog from "/emcJS/ui/Dialog.js";
import LogicAbstractElement from "/emcJS/ui/logic/elements/AbstractElement.js";
import "/emcJS/ui/logic/EditorClipboard.js";
import "/emcJS/ui/logic/EditorTrashcan.js";
import "/emcJS/ui/logic/EditorWorkingarea.js";
import "/emcJS/ui/CaptionPanel.js";
import "/emcJS/ui/CollapsePanel.js";

import "/emcJS/ui/logic/elements/LiteralFalse.js";
import "/emcJS/ui/logic/elements/LiteralTrue.js";
import "/emcJS/ui/logic/elements/LiteralNumber.js";
import "/emcJS/ui/logic/elements/LiteralValue.js";
import "/emcJS/ui/logic/elements/OperatorAnd.js";
import "/emcJS/ui/logic/elements/OperatorNand.js";
import "/emcJS/ui/logic/elements/OperatorOr.js";
import "/emcJS/ui/logic/elements/OperatorNor.js";
import "/emcJS/ui/logic/elements/OperatorXor.js";
import "/emcJS/ui/logic/elements/OperatorNot.js";
import "/emcJS/ui/logic/elements/OperatorMin.js";
import "/emcJS/ui/logic/elements/OperatorMax.js";
import "./LiteralMixin.js";
import "./LiteralCustom.js";

import TrackerStorage from "/script/storage/TrackerStorage.js";
import GlobalData from "/script/storage/GlobalData.js";
import I18n from "/script/util/I18n.js";

import "./Navigation.js";

const SettingsStorage = new TrackerStorage('settings');
const LogicsStorage = new TrackerStorage('logics');

const LOGIC_OPERATORS = [
    "deep-logic-false",
    "deep-logic-true",
    "deep-logic-not",
    "deep-logic-and",
    "deep-logic-nand",
    "deep-logic-or",
    "deep-logic-nor",
    "deep-logic-xor",
    "deep-logic-min",
    "deep-logic-max"
];

(async function main() {

    let world = GlobalData.get("world");
    let logicContainer = document.getElementById("logics");
    let elementContainer = document.getElementById("elements");

    let items = GlobalData.get("items");
    let settings = GlobalData.get("settings");
    let filter = GlobalData.get("filter");

    let mixins = {};

    let logic = GlobalData.get("logic");
    let custom_logic = await SettingsStorage.get("logic", {});

    if (!!logic.mixins) {
        for (let i in logic.mixins) {
            mixins[i] = logic.mixins[i];
        }
    }
    if (!!custom_logic.mixins) {
        for (let i in custom_logic.mixins) {
            mixins[i] = custom_logic.mixins[i];
        }
    }

    let workingarea = document.getElementById('workingarea');

    workingarea.addEventListener("placeholderclicked", function(event) {
        createAddLogicDialog();
    });

    // LOGICS
    createLocationLogicCategory(world);
    createEntranceLogicCategory(world);
    createMixinLogicCategory(logic);

    // OPERATORS
    createDefaultOperatorCategory();
    createOperatorCategory(items, "item");
    createOperatorCategory(settings.options, "option");
    createOperatorCategory(settings.skips, "skip");
    createOperatorCategory(filter, "filter");
    createOperatorCategory(world.locations, "location");
    // createOperatorCategory(skulltulas, "tracker-logic-skulltula", "skulltulas");
    createOperatorMixins(logic);


    function createDefaultOperatorCategory() {
        let ocnt = document.createElement("deep-collapsepanel");
        ocnt.caption = I18n.translate("operators_default");
        for (let i in LOGIC_OPERATORS) {
            let el = document.createElement(LOGIC_OPERATORS[i]);
            el.template = "true";
            ocnt.append(el);
        }
        elementContainer.append(ocnt);
    }

    function createOperatorCategory(data, ref) {
        let ocnt = document.createElement("deep-collapsepanel");
        ocnt.caption = I18n.translate(`operators_${ref}`);
        for (let i in data) {
            let opt = data[i];
            if (opt.type === "list") {
                for (let j of opt.values) {
                    let el = document.createElement("tracker-logic-custom");
                    el.ref = j;
                    el.category = ref;
                    el.template = "true";
                    ocnt.append(el);
                }
            } else if (opt.type === "choice") {
                for (let j of opt.values) {
                    let el = document.createElement("tracker-logic-custom");
                    el.ref = i;
                    el.value = j;
                    el.category = ref;
                    el.template = "true";
                    ocnt.append(el);
                }
            } else {
                let el = document.createElement("tracker-logic-custom");
                el.ref = i;
                el.category = ref;
                el.template = "true";
                ocnt.append(el);
            }
        }
        elementContainer.append(ocnt);
    }

    function createOperatorMixins(data) {
        let ocnt = document.createElement("deep-collapsepanel");
        ocnt.caption = I18n.translate("operators_mixin");
        for (let ref in data) {
            if (!ref.startsWith("mixin.")) continue;
            let el = document.createElement("tracker-logic-mixin");
            el.ref = ref;
            el.category = "mixin";
            el.template = "true";
            ocnt.append(el);
        }
        elementContainer.append(ocnt);
    }

    function createLocationLogicCategory(data) {
        let ocnt = document.createElement("deep-collapsepanel");
        ocnt.caption = I18n.translate("logics_location");
        for (let i in data.areas) {
            let loc = data.areas[i];
            if (!!loc) {
                if (!!loc.locations) {
                    let cnt = document.createElement("deep-collapsepanel");
                    cnt.caption = I18n.translate(i);
                    for (let j of loc.locations) {
                        let el = document.createElement("div");
                        el.dataset.ref = data.locations[j].access;
                        el.dataset.cat = data.locations[j].type;
                        el.className = "logic-location";
                        el.onclick = loadLogic;
                        el.innerHTML = I18n.translate(j);
                        cnt.append(el);
                    }
                    ocnt.append(cnt);
                }
                if (!!loc.locations_mq) {
                    let cnt = document.createElement("deep-collapsepanel");
                    cnt.caption = `${I18n.translate(i)} (MQ)`;
                    for (let j of loc.locations_mq) {
                        let el = document.createElement("div");
                        el.dataset.ref = data.locations[j].access;
                        el.dataset.cat = data.locations[j].type;
                        el.className = "logic-location";
                        el.onclick = loadLogic;
                        el.innerHTML = I18n.translate(j);
                        cnt.append(el);
                    }
                    ocnt.append(cnt);
                }
            }
        }
        logicContainer.append(ocnt);
    }

    function createEntranceLogicCategory(data) {
        let ocnt = document.createElement("deep-collapsepanel");
        ocnt.caption = I18n.translate("logics_entrance");
        for (let i in data.areas) {
            let loc = data.areas[i];
            if (!!loc && !!loc.entrances) {
                let cnt = document.createElement("deep-collapsepanel");
                cnt.caption = I18n.translate(i);
                for (let j of loc.entrances) {
                    let el = document.createElement("div");
                    el.dataset.ref = data.entrances[j].access;
                    el.dataset.cat = data.entrances[j].type;
                    el.className = "logic-location";
                    el.onclick = loadLogic;
                    el.innerHTML = I18n.translate(j);
                    cnt.append(el);
                }
                ocnt.append(cnt);
            }
        }
        logicContainer.append(ocnt);
    }

    function createMixinLogicCategory(logic) {
        let cnt = document.createElement("deep-collapsepanel");
        cnt.caption = I18n.translate("logics_mixin");
        for (let ref in logic) {
            if (!ref.startsWith("mixin.")) continue;
            let el = document.createElement("div");
            el.dataset.ref = ref;
            el.dataset.cat = "mixin";
            el.className = "logic-location";
            el.onclick = loadLogic;
            el.innerHTML = ref;
            cnt.append(el);
        }
        logicContainer.append(cnt);
    }

    function createAddLogicDialog() {
        let dialogElement = document.createElement('div');
        let d = new Dialog({
            title: "Add element to logic",
            submit: "OK"
        });
        d.onsubmit = function(reciever, slot, result) {
            if (!!result) {
                let res = dialogElement.dataset.choice;
                if (!!res) {
                    let el = LogicAbstractElement.buildLogic(JSON.parse(res));
                    if (!!slot) {
                        el.slot = slot;
                    }
                    reciever.append(el);
                }
            }
        }.bind(this, event.reciever, event.name);
        let last = null;
        fillOperators(dialogElement, items, settings, filter, logic, function(event) {
            if (last != null) {
                last.style.boxShadow = "";
            }
            dialogElement.dataset.choice = JSON.stringify(event.target.toJSON());
            last = event.target;
            last.style.boxShadow = "0 0 0 5px black";
        });
        d.append(dialogElement);
        d.show();
    }
        
    async function loadLogic(event) {
        let ref = event.target.dataset.ref;
        let cat = event.target.dataset.cat;
        workingarea.dataset.logicType = cat;
        workingarea.dataset.logicKey = ref;
        workingarea.loadLogic(await getLogic(ref));
        document.getElementById("workingarea-panel").caption = `${event.target.innerHTML} [${cat}]`;
    }

    async function refreshLogic(event) {
        let ref = workingarea.dataset.logicKey;
        workingarea.loadLogic(await getLogic(ref));
        event.preventDefault();
        return false;
    }

    async function storeLogic(event) {
        let key = workingarea.dataset.logicKey;
        await LogicsStorage.set(key, workingarea.getLogic());
        return refreshLogic(event);
    }

    async function removeLogic(event) {
        let key = workingarea.dataset.logicKey;
        await LogicsStorage.remove(key);
        return refreshLogic(event);
    }

    async function getLogic(ref) {
        let logic = await LogicsStorage.get(ref, null);
        if (!!logic) {
            return logic;
        }
        return GlobalData.get(`logic/${ref}`);
    }

    workingarea.addEventListener('save', storeLogic);
    workingarea.addEventListener('load', refreshLogic);
    workingarea.addEventListener('clear', removeLogic);
    //window.addEventListener('focus', refreshLogic);

    //TODO
    //logicContainer.querySelector('.logic-location').click();
}());
