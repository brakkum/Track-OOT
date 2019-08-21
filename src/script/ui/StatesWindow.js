import Window from "/deepJS/ui/Window.js";
import Template from "/deepJS/util/Template.js";
import "/deepJS/ui/selection/ListSelect.js";
import SaveState from "/script/storage/SaveState.js";
import TrackerStorage from "/script/storage/TrackerStorage.js";

const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
        }
        #footer,
        #submit,
        #cancel {
            display: flex;
        }
        #footer {
            height: 50px;
            padding: 10px 30px 10px;
            justify-content: flex-end;
            border-top: solid 2px #cccccc;
        }
        #submit,
        #cancel {
            margin-left: 10px;
            padding: 5px;
            border: solid 1px black;
            border-radius: 2px;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            -webkit-appearance: none;
        }
        #submit:hover,
        #cancel:hover {
            color: white;
            background-color: black;
        }
        #statename {
            display: block;
            flex: 1;
            padding: 5px;
        }
        #body {
            padding: 20px;
        }
        #statelist {
            height: 40vh;
            overflow-y: scroll;
            border: solid 2px #ccc;
        }
    </style>
    <div id="avtionbar">
        <button id="rename" title="rename state">
            RENAME
        </button>
        <button id="impexp" title="import or export state">
            IMPORT/EXPORT
        </button>
        <!-- missing sub-function-panel (impexp button arrow up symbol + div containing additional buttons) for import/export as string/file -->
    </div>

    <nav class="menu">
        <ul>
            <li>
                <button class="button" id="delete-savegame">DELETE</button>
            </li>
            <li>
                <button class="button" id="rename-savegame">RENAME</button>
            </li>
            <li>
                <button class="button hamburger-hide">IMPORT/EXPORT</button>
                <ul>
                    <li>
                        <button class="button" id="export-savegame">EXPORT</button>
                    </li>
                    <li>
                        <button class="button" id="import-savegame">IMPORT</button>
                    </li>
                </ul>
            </li>
        </ul>
    </nav>
    <deep-listselect id="statelist"></deep-listselect>
    <div id="footer">
        <input type=text" id="statename" placeholder="Please enter a name..." />
        <button id="submit" title="load state">
            LOAD
        </button>
        <button id="cancel" title="cancel">
            CANCEL
        </button>
    </div>
`);

const Q_TAB = [
    'button:not([tabindex="-1"])',
    '[href]:not([tabindex="-1"])',
    'input:not([tabindex="-1"])',
    'select:not([tabindex="-1"])',
    'textarea:not([tabindex="-1"])',
    '[tabindex]:not([tabindex="-1"])'
].join(',');

/*
    TODO
    add all functionalities: load, save, rename, import... [as string, as file], export... [as string, as file]
    in options get name for button and visibility.
    add more events to window.
*/

export default class StatesWindow extends Window {

    constructor(title = "Load state", options = {}) {
        super(title, options.close);
        let els = TPL.generate();
        let window = this.shadowRoot.getElementById('window');
        this.shadowRoot.getElementById('body').innerHTML = "";
        this.shadowRoot.insertBefore(els.children[0], this.shadowRoot.getElementById('focus_catcher_top'));
        let lst = els.getElementById('statelist');
        this.shadowRoot.getElementById('body').append(lst);
        window.append(els.getElementById('footer'));
        let snm = this.shadowRoot.getElementById('statename');
        lst.addEventListener("change", function(event) {
            snm.value = event.newValue;
        });
        let smt = this.shadowRoot.getElementById('submit');
        smt.onclick = () => {
            let ev = new Event('submit');
            ev.value = snm.value;
            this.dispatchEvent(ev);
            this.close();
        };
        let ccl = this.shadowRoot.getElementById('cancel');
        ccl.onclick = () => {
            this.dispatchEvent(new Event('cancel'));
            this.close();
        };
        if (!options.edit) {
            snm.readonly = "true";
            smt.innerHTML = "SAVE";
        }
    }

    get active() {
        return this.getAttribute('active');
    }

    set active(val) {
        this.setAttribute('active', val);
    }

    static get observedAttributes() {
        return ['active'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            if (!!oldValue) {
                let ol = this.shadowRoot.getElementById(`panel_${oldValue}`);
                if (!!ol) {
                    ol.classList.remove("active");
                }
                let ob = this.shadowRoot.querySelector(`[target="${oldValue}"]`);
                if (!!ob) {
                    ob.classList.remove("active");
                }
            }
            let nl = this.shadowRoot.getElementById(`panel_${newValue}`);
            if (!!nl) {
                nl.classList.add("active");
            }
            let nb = this.shadowRoot.querySelector(`[target="${newValue}"]`);
            if (!!nb) {
                nb.classList.add("active");
            }
        }
    }

    async show() {
        let states = await TrackerStorage.StatesStorage.keys();
        let list = this.shadowRoot.getElementById('statelist');
        list.innerHTML = "";
        for (let name of states) {
            list.append(createDeepOption(name));
        }
        super.show();
    }

    initialFocus() {
        let a = Array.from(this.querySelectorAll(Q_TAB));
        a.push(this.shadowRoot.getElementById('submit'));
        a.push(this.shadowRoot.getElementById('cancel'));
        a.push(this.shadowRoot.getElementById('close'));
        a[0].focus();
    }

    focusFirst() {
        let a = Array.from(this.querySelectorAll(Q_TAB));
        a.push(this.shadowRoot.getElementById('submit'));
        a.push(this.shadowRoot.getElementById('cancel'));
        a.unshift(this.shadowRoot.getElementById('close'));
        a[0].focus();
    }
    
    focusLast() {
        let a = Array.from(this.querySelectorAll(Q_TAB));
        a.push(this.shadowRoot.getElementById('submit'));
        a.push(this.shadowRoot.getElementById('cancel'));
        a.unshift(this.shadowRoot.getElementById('close'));
        a[a.length-1].focus();
    }

    

}

function createDeepOption(value) {
    let opt = document.createElement('deep-option');
    opt.value = value;
    opt.innerHTML = value;
    return opt;
}

customElements.define('ootrt-stateswindow', StatesWindow);