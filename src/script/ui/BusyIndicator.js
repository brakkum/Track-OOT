import Template from "/emcJS/util/Template.js";

const TPL = new Template(`
    <style>
        @keyframes rotate {
            0% { transform: rotate(0deg) }
            100% { transform: rotate(360deg) }
        }
        :host {
            position: absolute;
            display: none;
            justify-content: center;
            align-items: center;
            left: 0;
            top: 0;
            right: 0;
            bottom: 0;
            cursor: pointer;
            pointer-events: none;
            z-index: 9999999999;
            background: rgba(0,0,0,0.3);
        }
        #default-animation {
            width: 50vmin;
            height: 50vmin;
            border-radius: 50%;
            background: conic-gradient(rgba(255, 255, 255, 0) 220deg, rgba(255, 255, 255, 1) 360deg);
            animation: rotate 1s linear infinite;
        }
    </style>
    <slot>
        <div id="default-animation">
        </div>
    </slot>
`);

let EL = null;
let COUNT = 0;

class BusyIndicator {

    constructor() {
        EL = document.createElement("DIV");
        EL.className = "busy-indicator";
        EL.attachShadow({mode: 'open'});
        EL.shadowRoot.append(TPL.generate());
        document.body.append(EL);
    }

    busy() {
        return new Promise(function(resolve) {
            if (COUNT++ == 0) {
                EL.style.display = "flex";
                setTimeout(resolve, 10);
            } else {
                resolve();
            }
        });
    }

    unbusy() {
        return new Promise(function(resolve) {
            if (COUNT > 0 && --COUNT == 0) {
                EL.style.display = null;
                setTimeout(resolve, 10);
            } else {
                resolve();
            }
        });
    }

    setIndicator(element) {
        if (element instanceof HTMLElement) {
            EL.append(element);
        }
    }

}

export default new BusyIndicator;