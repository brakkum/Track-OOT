import Template from "/deepJS/util/Template.mjs";

/* room elements */
const TPL = new Template(`
    <style>       
        :host {
            display: flex;
            height: 50px;
            margin: 10px;
            background-color: #111111;
        }
        :host(:hover) {
            background-color: #333333;
        }
        #icon {
            display: flex;
            flex-wrap: wrap;
            width: 50px;
            color: #ffffff;
            font-size: 30px;
            justify-content: center;
            align-items: center;
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

class HTMLMultiplayerClient extends HTMLElement {

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

customElements.define('ootrt-mpclient', HTMLMultiplayerClient);