import FileData from "/emcJS/storage/FileData.js";
import Template from "/emcJS/util/Template.js";
import "/emcJS/ui/ContextMenu.js";
import "/script/ui/FilterButton.js";

const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
        }
        :host {
            display: inline-block;
            width: 20px;
            height: 20px;
            -webkit-user-select: none;
            -moz-user-select: none;
            user-select: none;
            cursor: pointer;
        }
        #icon {
            width: 100%;
            height: 100%;
            min-height: auto;
            background-repeat: no-repeat;
            background-size: contain;
            background-position: center;
            background-origin: content-box;
        }
        #menu ootrt-filterbutton {
            width: 38px;
            min-width: initial;
            height: 38px;
            padding: 4px;
            margin: 5px;
            border: solid 2px var(--navigation-background-color, #ffffff);
            border-radius: 10px;
        }
    </style>
    <emc-contextmenu id="menu">
    </emc-contextmenu>
    <emc-icon id="icon" src="images/icons/filter.svg"></emc-icon>
`);

const STORED = new WeakMap();

class FilterMenu extends HTMLElement {

    constructor() {
        super();
        STORED.set(this, false);
        this.addEventListener("click", event => {
            this.showContextMenu();
        });
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        // generate filters
        let menu = this.shadowRoot.getElementById("menu");
        let data = FileData.get("filter");
        for (let name in data) {
            if (!!data[name].choice) {
                let el = document.createElement("ootrt-filterbutton");
                el.ref = name;
                el.onclick = function(event) {
                    event.stopPropagation();
                };
                menu.append(el);
            }
        }
    }

    showContextMenu() {
        let rect = this.getBoundingClientRect();
        if (this.classList.contains("map-menu")) {
            this.shadowRoot.getElementById("menu").show(rect.left, rect.top - 60);
        } else {
            this.shadowRoot.getElementById("menu").show(rect.left, rect.bottom + 5);
        }
    }

}

customElements.define('ootrt-filtermenu', FilterMenu);