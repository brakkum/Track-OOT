import FileLoader from "/deepJS/util/FileLoader.mjs";
import Logger from "/deepJS/util/Logger.mjs";

let lang = {};

/*
var mutationObserver = new MutationObserver(function(mutations) {
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

const LANGUAGES = {
    "us_en": "English",
    "us_en.easy": "English (Discriptive names)"
};

class I18n {

    async load(code) {
        Logger.log(`load language code "${code}"`, "I18n");
        try {
            lang = (await FileLoader.ini(`/i18n/${code}.lang`, "I18n"))[""];
            Logger.log(`lang "${code}" loaded as LANG`, "I18n");
        } catch(e) {
            try {
                lang = await FileLoader.json(`/i18n/${code}.json`, "I18n");
                Logger.log(`lang "${code}" loaded as JSON`, "I18n");
            } catch(e) {
                Logger.error((new Error(`could not load lang ${code}`)), "I18n");
            }
        }
    }

    translate(index) {
        if (typeof LANGUAGES[index] == "string") {
            return LANGUAGES[index].trim();
        }
        if (typeof lang == "object" && typeof lang[index] == "string") {
            return lang[index].trim();
        }
        Logger.warn(`translation for "${index}" missing`, "I18n");
        return index;
    }

}

export default new I18n;