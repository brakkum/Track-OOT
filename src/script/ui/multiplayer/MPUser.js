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
    </style>
    <div id="icon" title="none"></div>
    <div id="detail">
        <div id="name"></div>
    </div>
`);

class HTMLMultiplayerUser extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
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

customElements.define('ootrt-mpuser', HTMLMultiplayerUser);