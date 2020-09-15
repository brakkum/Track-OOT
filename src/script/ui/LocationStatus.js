import FileData from "/emcJS/storage/FileData.js";
import Template from "/emcJS/util/Template.js";
import EventBusSubsetMixin from "/emcJS/mixins/EventBusSubset.js";
import "/emcJS/ui/input/Option.js";
import StateStorage from "/script/storage/StateStorage.js";
import ListLogic from "/script/util/ListLogic.js";

const TPL = new Template(`
    <style>
        .state {
            display: inline;
            padding: 0 5px;
            white-space: nowrap;
        }
    </style>
    <div class="state">
        <span id="locations-done">#</span> done / <span id="locations-available">#</span> avail / <span id="locations-missing">#</span> miss
    </div>
`);

function updateStates(doneEl, availEl, missEl) {
    let access_min = 0;
    let access_max = 0;
    let todo_min = 0;
    let todo_max = 0;
    let done = 0;
    let data = FileData.get("world_lists");
    if (!!data) {
        Object.keys(data).forEach(name => {
            if (name == "#" || name == "") return;
            let buff = data[name];
            let dType = StateStorage.read(`dungeonTypes.${name}`, buff.lists.hasOwnProperty("mq") ? "n" : "v");
            if (dType == "n") {
                let cv = ListLogic.check(buff.lists.v.filter(ListLogic.filterUnusedChecks));
                let cm = ListLogic.check(buff.lists.mq.filter(ListLogic.filterUnusedChecks));
                if (cv.reachable < cm.reachable) {
                    access_min += cv.reachable;
                    access_max += cm.reachable;
                } else {
                    access_min += cm.reachable;
                    access_max += cv.reachable;
                }
                if (cv.unopened < cm.unopened) {
                    todo_min += cv.unopened;
                    todo_max += cm.unopened;
                } else {
                    todo_min += cm.unopened;
                    todo_max += cv.unopened;
                }
                done += cv.done;
                done += cm.done;
            } else {
                let c = ListLogic.check(buff.lists[dType].filter(ListLogic.filterUnusedChecks));
                access_min += c.reachable;
                access_max += c.reachable;
                todo_min += c.unopened;
                todo_max += c.unopened;
                done += c.done;
            }
        });
    }
    if (access_min == access_max) {
        availEl.innerHTML = access_min;
    } else {
        availEl.innerHTML = `[${access_min}..${access_max}]`;
    }
    if (todo_min == todo_max) {
        missEl.innerHTML = todo_min;
    } else {
        missEl.innerHTML = `[${todo_min}..${todo_max}]`;
    }
    doneEl.innerHTML = done;
}

class HTMLLocationState extends EventBusSubsetMixin(HTMLElement) {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        let locationsDone = this.shadowRoot.getElementById("locations-done");
        let locationsAvail = this.shadowRoot.getElementById("locations-available");
        let locationsMiss = this.shadowRoot.getElementById("locations-missing");
        updateStates(locationsDone, locationsAvail, locationsMiss, "locations");
        /* event bus */
        this.registerGlobal([
            "logic",
            "statechange",
            "settings",
            "randomizer_options"
        ], () => {
            updateStates(locationsDone, locationsAvail, locationsMiss);
        });
    }

}

customElements.define('ootrt-locationstate', HTMLLocationState);