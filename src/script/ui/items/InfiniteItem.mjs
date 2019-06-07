import GlobalData from "/deepJS/storage/GlobalData.mjs";
import Template from "/deepJS/util/Template.mjs";
import EventBus from "/deepJS/util/EventBus.mjs";
import Logger from "/deepJS/util/Logger.mjs";
import "/deepJS/ui/selection/Option.mjs";
import TrackerLocalState from "/script/util/LocalState.mjs";

const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
        }
        :host {
            display: inline-flex;
            align-items: flex-end;
            justify-content: flex-end;
            color: white;
            font-size: 0.8em;
            text-shadow: -1px 0 1px black, 0 1px 1px black, 1px 0 1px black, 0 -1px 1px black;
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            background-origin: content-box;
            flex-grow: 0;
            flex-shrink: 0;
            min-height: 0;
            white-space: normal;
            padding: 0;
            line-height: 0.7em;
            width: 40px;
            height: 40px;
            cursor: pointer;
        }
    </style>
    <slot>
    </slot>
`);

function updateCall(event) {
    EventBus.mute("item-update");
    // savesatate
    this.value = TrackerLocalState.read("items", this.ref, 0);
    EventBus.unmute("item-update");
}

function itemUpdate(event) {
    if (this.ref === event.data.name && this.value !== event.data.value) {
        EventBus.mute("item-update");
        this.value = event.data.value;
        EventBus.unmute("item-update");
    }
}

class HTMLTrackerInfiniteItem extends HTMLElement {

    constructor() {
        super();
        this.addEventListener("click", this.next);
        this.addEventListener("contextmenu", this.prev);
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        /* event bus */
        EventBus.on(["item-update", "net:item-update"], itemUpdate.bind(this));
        EventBus.on("force-item-update", updateCall.bind(this));
    }

    connectedCallback() {
        if (!this.value) {
            let all = this.querySelectorAll("[value]");
            if (!!all.length) {
                this.value = all[0].value;
            }
        }
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
                    let data = GlobalData.get("items")[newValue];
                    this.style.backgroundImage = `url("/images/${data.images}"`;
                    updateCall.call(this);
                break;
                case 'value':
                    this.innerHTML = newValue;
                    TrackerLocalState.write("items", this.ref, parseInt(newValue));
                    EventBus.fire("item-update", {
                        name: this.ref,
                        value: newValue
                    });
                break;
            }
        }
    }

    next(event) {
        if (!this.readonly) {
            this.value = parseInt(this.value) + 1;
        }
        if (!event) return;
        event.preventDefault();
        return false;
    }

    prev(event) {
        if (!this.readonly) {
            if ((event.shiftKey || event.ctrlKey)) {
                this.value = 0;
            } else {
                this.value = parseInt(this.value) - 1;
            }
        }
        if (!event) return;
        event.preventDefault();
        return false;
    }

}

customElements.define('ootrt-infiniteitem', HTMLTrackerInfiniteItem);