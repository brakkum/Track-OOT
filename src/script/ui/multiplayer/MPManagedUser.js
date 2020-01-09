import Template from "/emcJS/util/Template.js";

const TPL = new Template(`
    <style>       
        :host {
            display: flex;
            height: 50px;
            margin: 10px;
            background-color: #111111;
        }
        #icon {
            width: 4px;
            margin-right: 10px;
        }
        #icon[title="host"] {
            background-color: #f9cd2d;
        }
        #icon[title="client"] {
            background-color: #c5d6d8;
        }
        #icon[title="spectator"] {
            background-color: #c5d6d8;
        }
        #detail {
            display: flex;
            flex-wrap: wrap;
            flex: 1; 
        }
        #name {
            display: flex;
            align-items: center;
            flex: 1;
            min-width: 200px;
            color: #ffffff;
        }
        #actions {
            display: flex;
            align-items: center;
            padding: 10px;
        }
    </style>
    <div id="icon" title="none"></div>
    <div id="detail">
        <div id="name"></div>
        <div id="actions">
            <button id="editor" disabled>editor</button>
            <button id="spectator" disabled>spectator</button>
            <button id="kick">kick</button>
        </div>
    </div>
`);

class HTMLMultiplayerManagedUser extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
        this.shadowRoot.getElementById('editor').addEventListener("click", function() {
            this.dispatchEvent(new Event("editor"));
        }.bind(this));
        this.shadowRoot.getElementById('spectator').addEventListener("click", function() {
            this.dispatchEvent(new Event("spectator"));
        }.bind(this));
        this.shadowRoot.getElementById('kick').addEventListener("click", function() {
            this.dispatchEvent(new Event("kick"));
        }.bind(this));
    }

    get name() {
        return this.getAttribute('name');
    }

    set name(val) {
        this.setAttribute('name', val);
    }

    get role() {
        return this.getAttribute('role');
    }

    set role(val) {
        this.setAttribute('role', val);
    }

    static get observedAttributes() {
        return ['name', 'role'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case 'name':
                    this.shadowRoot.getElementById("name").innerHTML = newValue;
                break;
                case 'role':
                    this.shadowRoot.getElementById("icon").setAttribute("title", newValue);
                break;
            }
        }
    }

}

customElements.define('ootrt-mpmanageduser', HTMLMultiplayerManagedUser);