import FileData from "/emcJS/storage/FileData.js";
import Template from "/emcJS/util/Template.js";
import EventBusSubsetMixin from "/emcJS/mixins/EventBusSubset.js";
import Panel from "/emcJS/ui/layout/Panel.js";

import "./ExitChoice.js";
import "./SubExitChoice.js";

const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
        }
        :host {
            display: block;
        }
    </style>
`);

export default class HTMLTrackerExitList extends EventBusSubsetMixin(Panel) {
    
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());

        let exits = FileData.get("world/exit");
        for (let exit in exits) {
            let el;
            if (exits[exit].type == "dungeon") {
                el = document.createElement('ootrt-exitchoice');
            } else {
                el = document.createElement('ootrt-subexitchoice');
            }
            el.ref = exit;
            this.shadowRoot.append(el);
        }

        /* event bus */
        this.registerGlobal("state", event => {
            if (event.data.state.hasOwnProperty("option.entrance_shuffle")) {
                this.active = event.data.state["option.entrance_shuffle"]
            }
        });
        this.registerGlobal("randomizer_options", event => {
            if (event.data.hasOwnProperty("option.entrance_shuffle")) {
                this.active = event.data["option.entrance_shuffle"]
            }
        });
    }

}

customElements.define('ootrt-exitlist', HTMLTrackerExitList);