import FileData from "/emcJS/storage/FileData.js";
import Template from "/emcJS/util/Template.js";
import EventBus from "/emcJS/util/events/EventBus.js";
import EventBusSubsetMixin from "/emcJS/mixins/EventBusSubset.js";
import "/emcJS/ui/selection/Option.js";
import StateStorage from "/script/storage/StateStorage.js";

const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
        }
        :host {
            display: inline-block;
            width: 40px;
            height: 40px;
            cursor: pointer;
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            background-origin: content-box;
        }
        #value {
            width: 100%;
            height: 100%;
            display: inline-flex;
            align-items: flex-end;
            justify-content: flex-end;
            width: 100%;
            height: 100%;
            color: white;
            font-size: 0.8em;
            text-shadow: -1px 0 1px black, 0 1px 1px black, 1px 0 1px black, 0 -1px 1px black;
            flex-grow: 0;
            flex-shrink: 0;
            min-height: 0;
            white-space: normal;
            padding: 0;
            line-height: 0.7em;
            font-weight: bold;
        }
    </style>
    <div id="value"></div>
`);
    
function stateChanged(event) {
    if (event.data[this.ref] != null) {
        let value = parseInt(event.data[this.ref]);
        if (isNaN(value)) {
            value = 0;
        }
        this.value = value;
    }
}

function itemUpdate(event) {
    if (this.ref === event.data.name && this.value !== event.data.value) {
        let value = parseInt(event.data.value);
        if (typeof value == "undefined" || isNaN(value)) {
            value = 0;
        }
        this.value = value;
    }
}

function dungeonTypeUpdate(event) {
    let data = FileData.get("items")[this.ref];
    if (data.hasOwnProperty("maxmq") && data.hasOwnProperty("related_dungeon") && event.data.name === data.related_dungeon) {
        this.fillItemChoices();
    }
}

class HTMLTrackerInfiniteItem extends EventBusSubsetMixin(HTMLElement) {

    constructor() {
        super();
        this.addEventListener("click", this.next);
        this.addEventListener("contextmenu", this.prev);
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        /* event bus */
        this.registerGlobal("item", itemUpdate.bind(this));
        this.registerGlobal("state", stateChanged.bind(this));
        this.registerGlobal("dungeontype", dungeonTypeUpdate.bind(this));
    }

    get ref() {
        return this.getAttribute('ref');
    }

    set ref(val) {
        this.setAttribute('ref', val);
    }

    get value() {
        return this.getAttribute('value');
    }

    set value(val) {
        this.setAttribute('value', val);
    }

    get readonly() {
        return this.getAttribute('readonly');
    }

    set readonly(val) {
        this.setAttribute('readonly', val);
    }

    static get observedAttributes() {
        return ['ref', 'value'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case 'ref':
                    let data = FileData.get("items")[newValue];
                    this.style.backgroundImage = `url("${data.images}")`;
                    this.value = StateStorage.read(this.ref, 0);
                break;
                case 'value':
                    this.shadowRoot.getElementById("value").innerHTML = newValue;
                break;
            }
        }
    }

    next(event) {
        if (!this.readonly) {
            let val = parseInt(this.value) + 1;
            if (val <= 9999) {
                this.value = val;
                StateStorage.write(this.ref, val);
                this.triggerGlobal("item", {
                    name: this.ref,
                    value: val
                });
            } else {
                this.value = 9999;
            }
        }
        if (!event) return;
        event.preventDefault();
        return false;
    }

    prev(event) {
        if (!this.readonly) {
            let val = parseInt(this.value) - 1;
            if (val >= 0) {
                if ((event.shiftKey || event.ctrlKey)) {
                    val = 0;
                }
                this.value = val;
                StateStorage.write(this.ref, val);
                this.triggerGlobal("item", {
                    name: this.ref,
                    value: val
                });
            } else {
                this.value = 0;
            }
        }
        if (!event) return;
        event.preventDefault();
        return false;
    }

}

customElements.define('ootrt-infiniteitem', HTMLTrackerInfiniteItem);