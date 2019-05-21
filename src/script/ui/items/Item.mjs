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
            display: inline-block;
            width: 40px;
            height: 40px;
            cursor: pointer;
        }
        slot {
            width: 100%;
            height: 100%;
        }
        ::slotted(:not([value])),
        ::slotted([value]:not(.active)) {
            display: none !important;
        }
        ::slotted([value]) {
            display: inline-flex;
            align-items: flex-end;
            justify-content: flex-end;
            width: 100%;
            height: 100%;
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
        }
        ::slotted([value].mark) {
            color: #54ff54;
        }
    </style>
    <slot>
    </slot>
`);

function updateCall(event) {
    EventBus.mute("item-update");
    // savesatate
    this.value = TrackerLocalState.read("items", this.ref, 0);
    // settings
    let data = GlobalData.get("items")[this.ref];
    if (data.hasOwnProperty("start_settings")) {
        let stsp = data.start_settings.split(".");
        this.startvalue = TrackerLocalState.read(stsp[0], stsp[1], 1);
    } else {
        this.fillItemChoices();
    }
    EventBus.unmute("item-update");
}

function itemUpdate(event) {
    if (this.ref === event.data.name && this.value !== event.data.value) {
        EventBus.mute("item-update");
        this.value = event.data.value;
        EventBus.unmute("item-update");
    }
}

function updateDungeon(event) {
    // XXX WTF is this empty?
}

class HTMLTrackerItem extends HTMLElement {

    constructor() {
        super();
        this.addEventListener("click", this.next);
        this.addEventListener("contextmenu", this.prev);
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        /* event bus */
        EventBus.on(["item-update", "net:item-update"], itemUpdate.bind(this));
        EventBus.on("force-item-update", updateCall.bind(this));
        EventBus.on(["dungeon-type-update","net:dungeon-type-update"], updateDungeon.bind(this));
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

    get startvalue() {
        return this.getAttribute('startvalue');
    }

    set startvalue(val) {
        this.setAttribute('startvalue', val);
    }

    get readonly() {
        return this.getAttribute('readonly');
    }

    set readonly(val) {
        this.setAttribute('readonly', val);
    }

    static get observedAttributes() {
        return ['ref', 'value', 'startvalue'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case 'ref':
                    updateCall.call(this);
                break;
                case 'startvalue':
                    this.fillItemChoices();
                break;
                case 'value':
                    let oe = this.querySelector(`.active`);
                    if (!!oe) {
                        oe.classList.remove("active");
                    }
                    let ne = this.querySelector(`[value="${newValue}"]`);
                    if (!!ne) {
                        ne.classList.add("active");
                    }
                    TrackerLocalState.write("items", this.ref, parseInt(newValue));
                    EventBus.fire("item-update", {
                        name: this.ref,
                        value: newValue
                    });
                break;
            }
        }
    }

    fillItemChoices() {
        this.innerHTML = "";
        let data = GlobalData.get("items")[this.ref];
        if (!data) return;
        let start_value = parseInt(this.startvalue);
        if (isNaN(start_value) || start_value < 0) {
            start_value = 0;
        }
        let current_value = this.value || 0;
        if (current_value <= start_value) {
            current_value = 0;
        }

        let max_value = 0;
        if (data.hasOwnProperty("related_dungeon") && data.hasOwnProperty("maxmq")) {
            let type = TrackerLocalState.read("dungeonTypes", data.related_dungeon, "n");
            if (type == "v") {
                max_value = data.max;
            } else if (type == "mq") {
                max_value = data.maxmq;
            } else {
                max_value = Math.max(data.maxmq, data.max);
            }
        } else {
            max_value = data.max;
        }

        if (current_value > max_value) {
            current_value = max_value;
        }

        for (let i = 0; i <= max_value; ++i) {
            if (i != 0 && i <= start_value) continue;
            let img = data.images;
            if (Array.isArray(img)) {
                img = img[i];
            }
            let opt = createOption(i, `/images/${img}`, data, max_value);
            if (i == current_value) {
                opt.classList.add("active");
            }
            this.append(opt);
        }

        this.value = current_value;
    }

    next(event) {
        if (!this.readonly) {
            let data = GlobalData.get("items")[this.ref];
            if ((event.shiftKey || event.ctrlKey) && !!data.alternate_counting) {
                Logger.log(`get next alternative value for "${this.ref}"`, "Item");
                for (let i = 0; i < data.alternate_counting.length; ++i) {
                    let alt = parseInt(data.alternate_counting[i]);
                    if (isNaN(alt)) {
                        alt = 0;
                    }
                    if (alt > parseInt(this.value)) {
                        this.value = data.alternate_counting[i];
                        break;
                    }
                }
            } else {
                Logger.log(`get next value for "${this.ref}"`, "Item");
                let all = this.querySelectorAll("[value]");
                if (!!all.length) {
                    let opt = this.querySelector(`[value="${this.value}"]`);
                    if (!!opt) {
                        if (!!opt.nextElementSibling) {
                            this.value = opt.nextElementSibling.getAttribute("value");
                        }
                    } else {
                        this.value = all[0].getAttribute("value");
                    }
                }
            }
        }
        if (!event) return;
        event.preventDefault();
        return false;
    }

    prev(event) {
        if (!this.readonly) {
            let data = GlobalData.get("items")[this.ref];
            if ((event.shiftKey || event.ctrlKey) && !!data.alternate_counting) {
                Logger.log(`get previous alternative value for "${this.ref}"`, "Item");
                for (let i = data.alternate_counting.length - 1; i >= 0; --i) {
                    let alt = parseInt(data.alternate_counting[i]);
                    if (isNaN(alt)) {
                        alt = parseInt(data.max);
                    }
                    if (alt < parseInt(this.value)) {
                        this.value = data.alternate_counting[i];
                        break;
                    }
                }
            } else {
                Logger.log(`get previous value for "${this.ref}"`, "Item");
                let all = this.querySelectorAll("[value]");
                if (!!all.length) {
                    let opt = this.querySelector(`[value="${this.value}"]`);
                    if (!!opt) {
                        if (!!opt.previousElementSibling) {
                            this.value = opt.previousElementSibling.getAttribute("value");
                        }
                    } else {
                        this.value = all[0].value;
                    }
                }
            }
        }
        if (!event) return;
        event.preventDefault();
        return false;
    }

}

customElements.define('ootrt-item', HTMLTrackerItem);

function createOption(value, img, data, max_value) {
    let opt = document.createElement('deep-option');
    opt.value = value;
    opt.style.backgroundImage = `url("${img}"`;
    if (value == 0 && !data.always_active) {
        opt.style.filter = "contrast(0.8) grayscale(0.5)";
        opt.style.opacity= "0.4";
    }
    if (!!data.counting) {
        if (Array.isArray(data.counting)) {
            opt.innerHTML = data.counting[value];
        } else {
            if (value > 0 || data.always_active) {
                opt.innerHTML = value;
            }
        }
        if (data.mark !== false) {
            let mark = parseInt(data.mark);
            if (value >= max_value || !isNaN(mark) && value >= mark) {
                opt.classList.add("mark");
            }
        }
    }
    return opt;
}