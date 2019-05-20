import Template from "/deepJS/util/Template.mjs";

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
            background-color: #f9cd2d;
            margin-right: 10px;
        }
        #detail {
            display: flex;
            flex-direction: column;
            height: 100px;
            width: 500px;
        }
        #name {
            flex: 1;
            display: flex;
            align-items: center;
            color: #ffffff;
        }
        #actions {
            flex: 1;
            display: flex;
            align-items: center;
        }
    </style>
    <div id="icon"></div>
    <div id="detail">
        <div id="name"></div>
        <div id="actions"></div>
    </div>
`);

class HTMLMultiplayerHost extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(TPL.generate());
    }

    get name() {
        return this.getAttribute('name');
    }

    set name(val) {
        this.setAttribute('name', val);
    }

    static get observedAttributes() {
        return ['name'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case 'name':
                    this.shadowRoot.getElementById("name").innerHTML = newValue;
                break;
            }
        }
    }

}

customElements.define('ootrt-mphost', HTMLMultiplayerHost);