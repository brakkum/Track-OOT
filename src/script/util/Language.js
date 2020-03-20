import FileLoader from "/emcJS/util/FileLoader.js";
import Logger from "/emcJS/util/Logger.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import I18n from "/emcJS/util/I18n.js";

let languages = null;

class Language {

    constructor() {
        EventBus.register("settings", event => {
            if (event.data.hasOwnProperty('language')) {
                I18n.setLanguage(event.data.language);
            }
        });
    }

    async load(code) {
        if (languages == null) {
            try {
                languages = await FileLoader.json("/i18n/_meta.json");
                for (let key in languages) {
                    try {
                        let trans = await FileLoader.properties(`/i18n/${key}.lang`);
                        I18n.setTranslation(key, Object.assign(trans, languages));
                    } catch(e) {
                        Logger.error((new Error(`could not load lang ${key}`)), "I18n");
                    }
                    I18n.setLanguage(code);
                }
            } catch(e) {
                Logger.error((new Error(`could not load language names`)), "I18n");
            }
        }
    }

    getLanguages() {
        return Object.keys(languages);
    }

    translate(index) {
        return I18n.translate(index);
    }

}

export default new Language();