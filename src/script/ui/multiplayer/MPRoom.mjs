import Template from "/deepJS/util/Template.mjs";

const img_url = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMWUzIiBoZWlnaHQ9IjFlMyIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgMjY0LjU4IDI2NC41OCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwIC0zMi40MTcpIj48cGF0aCBkPSJtMTMyLjI5IDc1LjQxMmMtMjIuNzY5IDAtNDEuMzg5IDE4LjYyLTQxLjM4OSA0MS4zODl2MzEuNTk4aDE4LjUyMXYtMzEuNTk4YzAtMTIuODI5IDEwLjAzOS0yMi44NjkgMjIuODY3LTIyLjg2OSAxMi44MjkgMCAyMi44NjcgMTAuMDQxIDIyLjg2NyAyMi44Njl2MzEuNTk4aDE4LjUyMXYtMzEuNTk4YzAtMjIuNzY5LTE4LjYyLTQxLjM4OS00MS4zODktNDEuMzg5em0tNDUuMDA5IDc2LjM2NmMtOS4yMTYyIDAtMTYuNjM2IDguMjg0MS0xNi42MzYgMTguNTc0djY1LjA3OWMwIDEwLjI5IDcuNDE5NCAxOC41NzQgMTYuNjM2IDE4LjU3NGg5MC4wMTdjOS4yMTYyIDAgMTYuNjM2LTguMjg0MSAxNi42MzYtMTguNTc0di02NS4wNzljMC0xMC4yOS03LjQxOTQtMTguNTc0LTE2LjYzNi0xOC41NzR6bTQ1LjAwOSAxMS41MTJhMjAuNzI4IDIwLjcyOCAwIDAgMSAyMC43MjcgMjAuNzI3IDIwLjcyOCAyMC43MjggMCAwIDEtMTIuMTc3IDE4Ljg1NHYxNi4xMjVjMCA0LjczNjgtMy44MTM2IDguNTQ5OS04LjU1MDQgOC41NDk5LTQuNzM2OCAwLTguNTUwNC0zLjgxMzEtOC41NTA0LTguNTQ5OXYtMTYuMTE4YTIwLjcyOCAyMC43MjggMCAwIDEtMTIuMTc3LTE4Ljg2MSAyMC43MjggMjAuNzI4IDAgMCAxIDIwLjcyNy0yMC43Mjd6IiBmaWxsPSIjZmZmIi8+PC9nPjwvc3ZnPg==";

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
            margin-right: 10px;
        }
        #detail {
            display: flex;
            flex-direction: column;
            color: #ffffff;
        }
        #name {
            flex: 1;
            display: flex;
            align-items: center;
        }
        #desc {
            flex: 1;
            display: flex;
            align-items: center;
            opacity: 0.4;
        }
        #actions {
            flex: 1;
            display: flex;
            align-items: center;
        }
        .lock-closed {
            background-position: center;
            background-size: 90% auto;
            background-repeat: no-repeat;
            background-image: url(${img_url});
        }
    </style>
    <div id="icon"></div>
    <div id="detail">
        <div id="name"></div>
        <div id="desc"></div>
    </div>
`);

class HTMLMultiplayerLobbyRoom extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());
    }

    get pass() {
        return this.getAttribute('pass');
    }

    set pass(val) {
        this.setAttribute('pass', val);
    }

    get name() {
        return this.getAttribute('name');
    }

    set name(val) {
        this.setAttribute('name', val);
    }

    get desc() {
        return this.getAttribute('desc');
    }

    set desc(val) {
        this.setAttribute('desc', val);
    }

    static get observedAttributes() {
        return ['pass', 'name', 'desc'];
    }
    
    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue != newValue) {
            switch (name) {
                case 'pass':
                    if (!!newValue && newValue != "false") {
                        this.shadowRoot.getElementById("icon").classList.add("lock-closed")
                    } else {
                        this.shadowRoot.getElementById("icon").classList.remove("lock-closed")
                    }
                break;
                case 'name':
                    this.shadowRoot.getElementById("name").innerHTML = newValue;
                break;
                case 'desc':
                    this.shadowRoot.getElementById("desc").innerHTML = newValue;
                break;
            }
        }
    }

}

customElements.define('ootrt-mproom', HTMLMultiplayerLobbyRoom);