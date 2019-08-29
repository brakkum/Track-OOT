import GlobalData from "/script/storage/GlobalData.js";
import Template from "/deepJS/util/Template.js";
import EventBus from "/deepJS/util/EventBus/EventBus.js";
import "/deepJS/ui/selection/Option.js";
import SaveState from "/script/util/LocalState.js";
import Logic from "/script/util/Logic.js";

const TPL = new Template(`
    <style>
        .state {
            display: inline;
            padding: 0 5px;
            white-space: nowrap;
        }
    </style>
    <div class="state">
        chests <span id="chests-done">#</span> done / <span id="chests-available">#</span> avail / <span id="chests-missing">#</span> miss
    </div>
    <div class="state">
        skulltulas <span id="skulltulas-done">#</span> done / <span id="skulltulas-available">#</span> avail / <span id="skulltulas-missing">#</span> miss
    </div>
`);

function canGet(name, category, dType) {
    let list = GlobalData.get("locations")[name][`${category}_${dType}`];
    let res = {
        done: 0,
        access: 0,
        open: 0
    };
    for (let i in list) {
        if (!list[i].mode || SaveState.read("options", list[i].mode, false)) {
            if (!SaveState.read(category, i, 0)) {
                if (Logic.getValue(category, i)) {
                    res.access++;
                }
                res.open++;
            } else {
                res.done++;
            }
        }
    }
    return res;
}

function updateStates(doneEl, availEl, missEl, type) {
    let access_min = 0;
    let access_max = 0;
    let open_min = 0;
    let open_max = 0;
    let done = 0;
    let data = GlobalData.get("locations");
    if (!!data) {
        Object.keys(data).forEach(name => {
            let buff = GlobalData.get("locations")[name];
            if (!buff.mode || SaveState.read("options", buff.mode, false)) {
                let dType = SaveState.read("dungeonTypes", name, buff.hasmq ? "n" : "v");
                if (dType == "n") {
                    let cv = canGet(name, type, "v");
                    let cm = canGet(name, type, "mq");
                    if (cv.access < cm.access) {
                        access_min += cv.access;
                        access_max += cm.access;
                    } else {
                        access_min += cm.access;
                        access_max += cv.access;
                    }
                    if (cv.open < cm.open) {
                        open_min += cv.open;
                        open_max += cm.open;
                    } else {
                        open_min += cm.open;
                        open_max += cv.open;
                    }
                    done += cv.done;
                    done += cm.done;
                } else {
                    let c = canGet(name, type, dType);
                    access_min += c.access;
                    access_max += c.access;
                    open_min += c.open;
                    open_max += c.open;
                    done += c.done;
                }
            }
        });
    }
    if (access_min == access_max) {
        availEl.innerHTML = access_min;
    } else {
        availEl.innerHTML = `(${access_min} - ${access_max})`;
    }
    if (open_min == open_max) {
        missEl.innerHTML = open_min;
    } else {
        missEl.innerHTML = `(${open_min} - ${open_max})`;
    }
    doneEl.innerHTML = done;
}

class HTMLLocationState extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        let chestsDone = this.shadowRoot.getElementById("chests-done");
        let chestsAvail = this.shadowRoot.getElementById("chests-available");
        let chestsMiss = this.shadowRoot.getElementById("chests-missing");
        let skulltulasDone = this.shadowRoot.getElementById("skulltulas-done");
        let skulltulasAvail = this.shadowRoot.getElementById("skulltulas-available");
        let skulltulasMiss = this.shadowRoot.getElementById("skulltulas-missing");
        updateStates(chestsDone, chestsAvail, chestsMiss, "chests");
        updateStates(skulltulasDone, skulltulasAvail, skulltulasMiss, "skulltulas");
        /* event bus */
        EventBus.register([
            "logic",
            "state",
            "settings",
            "dungeontype"
        ], () => {
            updateStates(chestsDone, chestsAvail, chestsMiss, "chests");
            updateStates(skulltulasDone, skulltulasAvail, skulltulasMiss, "skulltulas");
        });
        EventBus.register("chest", () => {
            updateStates(chestsDone, chestsAvail, chestsMiss, "chests");
        });
        EventBus.register("skulltula", () => {
            updateStates(skulltulasDone, skulltulasAvail, skulltulasMiss, "skulltulas");
        });
    }

}

customElements.define('ootrt-locationstate', HTMLLocationState);