import GlobalData from "/deepJS/storage/GlobalData.mjs";
import Template from "/deepJS/util/Template.mjs";
import "./Item.mjs";

const TPL = new Template(`
    <style>
        * {
            position: relative;
            box-sizing: border-box;
        }
        :host {
            display: inline-block;
        }
        div.item-row {
            display: flex;
        }
        ootrt-item {
            display: block;
            padding: 5px;
        }
        ootrt-item:hover {
            padding: 2px;
        }
        div.text {
            display: inline-block;
            width: 40px;
            height: 40px;
            padding: 2px;
        }
    </style>
`);

function createItemText(text) {
    var el = document.createElement('DIV');
    el.classList.add("text");
    el.innerHTML = text;
    return el;
}

class HTMLTrackerItemGrid extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(TPL.generate());

        let data = GlobalData.get("grids")["items"];
        for (let i of data) {
            let cnt = document.createElement('div');
            cnt.classList.add("item-row");
            for (let j of i) {
                if (j.startsWith("text:")) {
                    cnt.appendChild(createItemText(j.slice(5)));
                } else {
                    let itm = document.createElement('ootrt-item');
                    itm.setAttribute('ref', j);
                    cnt.appendChild(itm);
                }
            }
            this.shadowRoot.appendChild(cnt);
        }
    }

}

customElements.define('ootrt-itemgrid', HTMLTrackerItemGrid);