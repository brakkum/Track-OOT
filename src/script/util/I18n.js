import FileLoader from "/deepJS/util/FileLoader.js";
import Logger from "/deepJS/util/Logger.js";

/*
let mutationObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        console.log(mutation);
    });
});

mutationObserver.observe(document.documentElement, {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true,
    attributeOldValue: true,
    characterDataOldValue: true
});
*/

let languages = {};
let active_language = {};

class I18n {

    async init() {
        languages = await FileLoader.json("/i18n/_meta.json")
    }

    async load(code) {
        Logger.log(`load language code "${code}"`, "I18n");
        try {
            active_language = (await FileLoader.ini(`/i18n/${code}.lang`))[""];
            Logger.log(`lang "${code}" loaded as LANG`, "I18n");
        } catch(e) {
            Logger.error((new Error(`could not load lang ${code}`)), "I18n");
        }
    }

    getLanguages() {
        return Object.keys(languages);
    }

    translate(index) {
        if (typeof languages[index] == "string") {
            return languages[index].trim();
        }
        if (typeof active_language == "object" && typeof active_language[index] == "string") {
            return active_language[index].trim();
        }
        Logger.warn(`translation for "${index}" missing`, "I18n");
        return index;
    }

}

export default new I18n;