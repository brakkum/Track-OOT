import FileData from "/emcJS/storage/FileData.js";
import Template from "/emcJS/util/Template.js";
import GlobalStyle from "/emcJS/util/GlobalStyle.js";
import EventBusSubsetMixin from "/emcJS/mixins/EventBusSubset.js";
import "/emcJS/ui/overlay/ContextMenu.js"
import "/emcJS/ui/input/ListSelect.js"
import MarkerRegistry from "/script/util/world/MarkerRegistry.js";
import Language from "/script/util/Language.js";


const TPL = new Template(`
<emc-contextmenu id="menu">
    <emc-listselect id="select"></emc-listselect>
</emc-contextmenu>
`);

const STYLE = new GlobalStyle(`
#select {
    height: 300px;
    width: 300px;
}
`);

export default class ExitChoiceCtxMenu extends EventBusSubsetMixin(HTMLElement) {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        STYLE.apply(this.shadowRoot);
        /* --- */
        const selectEl = this.shadowRoot.getElementById("select");
        selectEl.addEventListener("change", event => {
            const ev = new Event('change');
            ev.oldValue = event.oldValue;
            ev.newValue = event.newValue;
            ev.value = event.value;
            this.dispatchEvent(ev);
        });
        selectEl.addEventListener("click", event => {
            event.stopPropagation();
            event.preventDefault();
            return false;
        });

        /* event bus */
        this.registerGlobal(["state", "statechange_exits"], event => {
            this.refresh();
        });
    }

    connectedCallback() {
        super.connectedCallback();
        this.refresh();
    }

    show(posX, posY, exitRef) {
        const mnu_ext_el = this.shadowRoot.getElementById("menu");

        const exit = FileData.get(`world/exit/${exitRef}`);
        const entrances = FileData.get("world/exit");
        // TODO remove used entrances
        const selectEl = this.shadowRoot.getElementById("select");
        for (const key in entrances) {
            const value = entrances[key];
            if (value.type == exit.type) {
                const opt = document.createElement('emc-option');
                opt.value = value.target;
                opt.innerHTML = Language.translate(value.target);
                opt.setAttribute('i18n-content', value.target);
                selectEl.append(opt);
            }
        }

        mnu_ext_el.show(posX, posY);
    }

    get ref() {
        return this.getAttribute('ref');
    }

    set ref(val) {
        this.setAttribute('ref', val);
    }

    static get observedAttributes() {
        return ['ref'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        switch (name) {
            case 'ref':
                if (oldValue != newValue) {
                    this.refresh();
                }
                break;
        }
    }

    refresh() {
        // TODO do not use specialized code. make generic
        const cnt = this.shadowRoot.getElementById("list");
        cnt.innerHTML = "";
        const data = FileData.get(`exit/${this.ref}`);
        if (data) {
            if (data.lists.mq == null) {
                data.lists.v.forEach(record => {
                    const loc = MarkerRegistry.get(record.id);
                    if (!!loc && loc.visible()) {
                        const el = loc.listItem;
                        cnt.append(el);
                    }
                });
            }
        }
    }

}

customElements.define('ootrt-exitchoice-ctxmenu', ExitChoiceCtxMenu);
