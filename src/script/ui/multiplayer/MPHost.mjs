import Template from "/deepJS/util/Template.mjs";

const img_url = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMWUzIiBoZWlnaHQ9IjFlMyIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgMjY0LjU4IDI2NC41OCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwIC0zMi40MTcpIj48cGF0aCBkPSJtMTMyLjI5IDc1LjQxMmMtMjIuNzY5IDAtNDEuMzg5IDE4LjYyLTQxLjM4OSA0MS4zODl2MzEuNTk4aDE4LjUyMXYtMzEuNTk4YzAtMTIuODI5IDEwLjAzOS0yMi44NjkgMjIuODY3LTIyLjg2OSAxMi44MjkgMCAyMi44NjcgMTAuMDQxIDIyLjg2NyAyMi44Njl2MzEuNTk4aDE4LjUyMXYtMzEuNTk4YzAtMjIuNzY5LTE4LjYyLTQxLjM4OS00MS4zODktNDEuMzg5em0tNDUuMDA5IDc2LjM2NmMtOS4yMTYyIDAtMTYuNjM2IDguMjg0MS0xNi42MzYgMTguNTc0djY1LjA3OWMwIDEwLjI5IDcuNDE5NCAxOC41NzQgMTYuNjM2IDE4LjU3NGg5MC4wMTdjOS4yMTYyIDAgMTYuNjM2LTguMjg0MSAxNi42MzYtMTguNTc0di02NS4wNzljMC0xMC4yOS03LjQxOTQtMTguNTc0LTE2LjYzNi0xOC41NzR6bTQ1LjAwOSAxMS41MTJhMjAuNzI4IDIwLjcyOCAwIDAgMSAyMC43MjcgMjAuNzI3IDIwLjcyOCAyMC43MjggMCAwIDEtMTIuMTc3IDE4Ljg1NHYxNi4xMjVjMCA0LjczNjgtMy44MTM2IDguNTQ5OS04LjU1MDQgOC41NDk5LTQuNzM2OCAwLTguNTUwNC0zLjgxMzEtOC41NTA0LTguNTQ5OXYtMTYuMTE4YTIwLjcyOCAyMC43MjggMCAwIDEtMTIuMTc3LTE4Ljg2MSAyMC43MjggMjAuNzI4IDAgMCAxIDIwLjcyNy0yMC43Mjd6IiBmaWxsPSIjZmZmIi8+PC9nPjwvc3ZnPg==";

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
            background-position: center;
            background-size: 90% auto;
            background-repeat: no-repeat;
            background-image: url(${img_url});
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