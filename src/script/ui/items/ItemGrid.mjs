import GlobalData from "/deepJS/storage/GlobalData.mjs";
import Template from "/deepJS/util/Template.mjs";
import I18n from "/script/util/I18n.mjs";
import "./Item.mjs";
import "./InfiniteItem.mjs";

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
    let el = document.createElement('DIV');
    el.classList.add("text");
    el.innerHTML = text;
    return el;
}

class HTMLTrackerItemGrid extends HTMLElement {

    constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this.shadowRoot.append(TPL.generate());

        let data = GlobalData.get("grids")["items"];
        for (let i of data) {
            let cnt = document.createElement('div');
            cnt.classList.add("item-row");
            for (let j of i) {
                if (j.startsWith("text:")) {
                    cnt.append(createItemText(j.slice(5)));
                } else {
                    let data = GlobalData.get("items")[j];
                    if (data.max === false) {
                        let itm = document.createElement('ootrt-infiniteitem');
                        itm.title = I18n.translate(j);
                        itm.setAttribute('ref', j);
                        cnt.append(itm);
                    } else {
                        let itm = document.createElement('ootrt-item');
                        itm.title = I18n.translate(j);
                        itm.setAttribute('ref', j);
                        cnt.append(itm);
                    }
                }
            }
            this.shadowRoot.append(cnt);
        }
    }

}

customElements.define('ootrt-itemgrid', HTMLTrackerItemGrid);