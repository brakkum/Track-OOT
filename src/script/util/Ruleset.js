import EventBus from "/emcJS/util/events/EventBus.js";
import FileData from "/emcJS/storage/FileData.js";
import StateStorage from "/script/storage/StateStorage.js";

class Ruleset {

  constructor() {
    EventBus.register("settings", event => {
        this.buildOptionsFromRuleset(event.data.ruleset);
    });
  }

  buildOptionsFromRuleset = name => {
    const ruleset = FileData.get("rulesets")[name];
    if (!ruleset) { return }

    let settings = {};
    let options = FileData.get("randomizer_options");
    for (let i in ruleset) {
        for (let j in ruleset[i]) {
            let v = ruleset[i][j];
            settings[j] = v;
        }
    }
    StateStorage.write(settings);
    EventBus.trigger("randomizer_options", settings);
  }
}

export default new Ruleset();