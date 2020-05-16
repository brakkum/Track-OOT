import Template from "/emcJS/util/Template.js";
import DateUtil from "/emcJS/util/DateUtil.js";
import FileSystem from "/emcJS/util/FileSystem.js";
import Dialog from "/emcJS/ui/Dialog.js";
import Toast from "/emcJS/ui/Toast.js";
import StateManager from "/script/storage/StateManager.js";

const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
        }
        :host,
        .footer,
        .button {
            display: -webkit-box;
            display: -ms-flexbox;
            display: flex;
        }
        :host {
            position: absolute !important;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.3);
            align-items: flex-start;
            justify-content: center;
            backdrop-filter: blur(2px);
            -webkit-backdrop-filter: blur(2px);
            z-index: 1000000;
        }
        #window {
            display: flex;
            flex-direction: column;
            width: 100%;
            max-width: 1000px;
            margin-top: 100px;
            color: black;
            background-color: white;
            border: solid 2px #cccccc;
            border-radius: 4px;
            resize: both;
        }
        #header {
            display: flex;
            border-bottom: solid 2px #cccccc;
        }
        #title {
            display: flex;
            align-items: center;
            flex: 1;
            height: 30px;
            padding: 0 10px;
            font-weight: bold;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 1em;
            line-height: 1em;
        }
        #body {
            display: block;
            padding: 20px;
            min-height: 10vh;
            max-height: 50vh;
            overflow: auto;
        }
        :focus {
            outline: none;
            box-shadow: blue 0 0px 3px 4px;
        }
        #close {
            display: flex;
            width: 40px;
            height: 30px;
            border: none;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            -webkit-appearance: none;
            font-size: 1.2em;
            line-height: 1em;
        }
        #close:hover {
            color: white;
            background-color: red;
        }
        #close:focus {
            outline: none;
            box-shadow: inset red 0 0px 3px 4px;
        }
        #footer,
        .button {
            display: flex;
        }
        #footer {
            height: 50px;
            padding: 10px 30px 10px;
            justify-content: flex-end;
            border-top: solid 2px #cccccc;
        }
        .button {
            margin-left: 10px;
            padding: 5px;
            border: solid 1px black;
            border-radius: 2px;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            -webkit-appearance: none;
        }
        .button:hover {
            color: white;
            background-color: black;
        }
        #statename {
            display: block;
            flex: 1;
            padding: 5px;
        }
        #statelist {
            height: 40vh;
            border: solid 2px #ccc;
        }
        emc-option .name {
            flex: 1;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
        emc-option .date,
        emc-option .version {
            margin-left: 10px;
            font-size: 0.8em;
            opacity: 0.4;
        }
        emc-option .auto {
            margin-right: 4px;
            opacity: 0.4;
            font-style: italic;
        }
    </style>
    <div id="focus_catcher_top" tabindex="0"></div>
    <div id="window" role="dialog" aria-modal="true" aria-labelledby="title" aria-describedby="title">
        <div id="header">
            <div id="title">Manage States</div>
            <button id="close" title="close">✖</button>
        </div>
        <div id="body">
            <emc-listselect id="statelist"></emc-listselect>
        </div>
        <div id="footer">
            <input type="hidden" id="statename" placeholder="Please select a state..." readonly />
            <button id="delete" class="button" title="delete state">
                DELETE
            </button>
            <button id="rename" class="button" title="rename state">
                RENAME
            </button>
            <button id="import" class="button" title="import state">
                IMPORT
            </button>
            <button id="import-string" class="button" title="import state from string">
                IMPORT STRING
            </button>
            <button id="export" class="button" title="export state">
                EXPORT
            </button>
        </div>
    </div>
    <div id="focus_catcher_bottom" tabindex="0"></div>
`);

const Q_TAB = [
    'button:not([tabindex="-1"])',
    '[href]:not([tabindex="-1"])',
    'input:not([tabindex="-1"])',
    'select:not([tabindex="-1"])',
    'textarea:not([tabindex="-1"])',
    '[tabindex]:not([tabindex="-1"])'
].join(',');

async function fillStates(list) {
    list.innerHTML = "";
    let states = await StateManager.getStates();
    for (let state in states) {
        list.append(createOption(state, states[state]));
    }
}

export default class ManageWindow extends HTMLElement {

    constructor() {
        super();
        this.onkeydown = function(event) {
            let key = event.which || event.keyCode;
            if (key == 27) {
                this.close();
            }
            event.stopPropagation();
        }.bind(this);
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());

        let cls = this.shadowRoot.getElementById('close');
        cls.onclick = this.close.bind(this);
        this.shadowRoot.getElementById('focus_catcher_top').onfocus = this.focusLast.bind(this);
        this.shadowRoot.getElementById('focus_catcher_bottom').onfocus = this.focusFirst.bind(this);
        
        let lst = this.shadowRoot.getElementById('statelist');
        let snm = this.shadowRoot.getElementById('statename');
        lst.addEventListener("change", function(event) {
            snm.value = event.newValue;
        });
        
        // DELETE
        let dlt = this.shadowRoot.getElementById('delete');
        dlt.onclick = async () => {
            let stateName = snm.value;
            if (!snm.value) {
                await Dialog.alert("No state selected", "Please select a state to delete!");
                return;
            }
            if (!await Dialog.confirm("Warning", `Do you really want to delete "${stateName}"? This can not be undone.`)) {
                return;
            }
            await StateManager.delete(stateName);
            Toast.show(`State "${stateName}" deleted.`);
            snm.value = "";
            await fillStates(lst);
        };
        // RENAME
        let rnm = this.shadowRoot.getElementById('rename');
        rnm.onclick = async () => {
            let stateName = snm.value;
            if (!snm.value) {
                await Dialog.alert("No state selected", "Please select a state to rename!");
                return;
            }
            let newName = "";
            while (!newName) {
                let name = await Dialog.prompt("New state", `Please enter a new name for "${stateName}"!`);
                if (name === false) {
                    return;
                }
                if (name == "") {
                    await Dialog.alert("Warning", "The name can not be empty.");
                    continue;
                }
                if (await StateManager.exists(name)) {
                    if (!await Dialog.confirm("Warning", `The name "${name}" already exists. Do you want to overwrite it?`)) {
                        continue;
                    }
                }
                newName = name;
            }
            await StateManager.rename(stateName, newName);
            Toast.show(`State "${stateName}" renamed to "${newName}".`);
            snm.value = "";
            await fillStates(lst);
        };
        // IMPORT
        let imp = this.shadowRoot.getElementById('import');
        imp.onclick = async () => {
            let res = await FileSystem.load(".json");
            if (!res || !res.data || !res.data.data || !res.data.name) {
                await Dialog.alert("Warning", "Did not find any data to import.");
                return;
            }
            let name = "";
            while (name == "") {
                name = await Dialog.prompt("Import state", `Please enter a new name for the imported state!`, res.data.name);
                if (name === false) {
                    return;
                }
                if (await StateManager.exists(name)) {
                    if (!await Dialog.confirm("Warning", `The name "${name}" already exists. Do you want to overwrite it?`)) {
                        name = "";
                    }
                }
            }
            res.data.name = name;
            await StateManager.import(res.data);
            Toast.show(`State "${name}" imported.`);
            snm.value = "";
            await fillStates(lst);
        };
        // IMPORT STRING
        let ist = this.shadowRoot.getElementById('import-string');
        ist.onclick = async () => {
            let data = await Dialog.prompt("Import", "Please enter export string!");
            if (data === false) {
                return;
            }
            try {
                data = JSON.parse(atob(data));
            } catch(e) {
                await Dialog.alert("Warning", "Did not find any data to import.");
                return;
            }
            if (!data || !data.data || !data.name) {
                await Dialog.alert("Warning", "Did not find any data to import.");
                return;
            }
            let name = "";
            while (name == "") {
                name = await Dialog.prompt("Import state", `Please enter a new name for the imported state!`, data.name);
                if (name === false) {
                    return;
                }
                if (await StateManager.exists(name)) {
                    if (!await Dialog.confirm("Warning", `The name "${name}" already exists. Do you want to overwrite it?`)) {
                        name = "";
                    }
                }
            }
            data.name = name;
            await StateManager.import(data);
            Toast.show(`State "${name}" imported.`);
            snm.value = "";
            await fillStates(lst);
        };
        // EXPORT
        let exp = this.shadowRoot.getElementById('export');
        exp.onclick = async () => {
            let stateName = snm.value;
            if (!snm.value) {
                await Dialog.alert("No state selected", "Please select a state to export!");
                return;
            }
            let data = await StateManager.export(stateName);
            FileSystem.save(JSON.stringify(data, " ", 4), `track-oot-state.${stateName}.${DateUtil.convert(new Date(data.timestamp), "YMDhms")}.json`);
        };
    }

    async show(activeState) {
        let lst = this.shadowRoot.getElementById('statelist');
        let snm = this.shadowRoot.getElementById('statename');
        await fillStates(lst);
        if (activeState != null) {
            lst.value = activeState;
            snm.value = activeState;
        }
        document.body.append(this);
        this.initialFocus();
    }

    close() {
        document.body.removeChild(this);
        this.dispatchEvent(new Event('close'));
    }

    initialFocus() {
        let a = Array.from(this.querySelectorAll(Q_TAB));
        a.push(this.shadowRoot.getElementById('close'));
        a[0].focus();
    }

    focusFirst() {
        let a = Array.from(this.querySelectorAll(Q_TAB));
        a.unshift(this.shadowRoot.getElementById('close'));
        a[0].focus();
    }
    
    focusLast() {
        let a = Array.from(this.querySelectorAll(Q_TAB));
        a.unshift(this.shadowRoot.getElementById('close'));
        a[a.length-1].focus();
    }

}

function createOption(key, state) {
    let opt = document.createElement('emc-option');
    opt.value = key;
    // autosave
    if (!!state.autosave) {
        let ato = document.createElement("span");
        ato.className = "auto";
        ato.innerHTML = "[auto]";
        opt.append(ato);
    }
    // name
    let nme = document.createElement("span");
    nme.className = "name";
    nme.innerHTML = state.name;
    opt.append(nme);
    // date
    let dte = document.createElement("span");
    dte.className = "date";
    if (state.timestamp != null) {
        dte.innerHTML = DateUtil.convert(new Date(state.timestamp), "D.M.Y h:m:s");
    } else {
        dte.innerHTML = "no date";
    }
    opt.append(dte);
    // version
    let vrs = document.createElement("span");
    vrs.className = "version";
    if (state.version != null) {
        vrs.innerHTML = `(v-${("00"+state.version).slice(-3)})`;
    } else {
        vrs.innerHTML = "(v-000)";
    }
    opt.append(vrs);
    return opt;
}

customElements.define('tootr-state-window-manage', ManageWindow);