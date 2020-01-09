import Template from "/emcJS/util/Template.js";

const TPL = new Template(`
    <div id="update-check" style="padding: 5px;">
        checking for new version...
    </div>
    <div id="update-available" style="padding: 5px; display: none;">
        newer version found <button id="download-update">download</button>
        <br>
        <a href="CHANGELOG.MD?nosw" target="_BLANK">see the changelog</a>
    </div>
    <div id="update-unavailable" style="padding: 5px; display: none;">
        already up to date <button id="check-update">check again</button>
    </div>
    <div id="update-running" style="padding: 5px; display: none;">
        <progress id="update-progress" value="0" max="0"></progress>
        <span id="update-progress-text">0/0</span>
    </div>
    <div id="update-finished" style="padding: 5px; display: none;">
        you need to reload for the new version to apply...
        <button onclick="window.location.reload()">reload now</button>
    </div>
    <div id="update-force" style="padding: 5px; display: none;">
        if files seem corrupt, you can try to 
        <button id="download-forced">force download</button>
    </div>
`);

export default class UpdateHandler extends HTMLElement {

    constructor() {
        super();
        if ('serviceWorker' in navigator) {
            this.attachShadow({mode: 'open'});
            this.shadowRoot.append(TPL.generate());

            let prog = this.shadowRoot.getElementById("update-progress");
            let progtext = this.shadowRoot.getElementById("update-progress-text");

            let check = this.shadowRoot.getElementById("update-check");
            let force = this.shadowRoot.getElementById("update-force");
            let avail = this.shadowRoot.getElementById("update-available");
            let unavail = this.shadowRoot.getElementById("update-unavailable");
            let running = this.shadowRoot.getElementById("update-running");
            let finished = this.shadowRoot.getElementById("update-finished");

            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data.type == "state") {
                    switch(event.data.msg) {
                        case "update_available":
                            check.style.display = "none";
                            force.style.display = "block";
                            avail.style.display = "block";
                            unavail.style.display = "none";
                            running.style.display = "none";
                            finished.style.display = "none";
                            this.dispatchEvent(new Event('updateavailable'));
                        break;
                        case "update_unavailable":
                            check.style.display = "none";
                            force.style.display = "block";
                            avail.style.display = "none";
                            unavail.style.display = "block";
                            running.style.display = "none";
                            finished.style.display = "none";
                        break;
                        case "need_download":
                            prog.value = 0;
                            prog.max = event.data.value;
                            progtext.innerHTML = `${prog.value}/${prog.max}`;
                        break;
                        case "file_downloaded":
                            prog.value = parseInt(prog.value) + 1;
                            progtext.innerHTML = `${prog.value}/${prog.max}`;
                        break;
                        case "update_finished":
                            prog.value = 0;
                            prog.max = 0;
                            progtext.innerHTML = `0/0`;
                            check.style.display = "none";
                            force.style.display = "none";
                            avail.style.display = "none";
                            unavail.style.display = "none";
                            running.style.display = "none";
                            finished.style.display = "block";
                        break;
                    }
                } else if (event.data.type == "error") {
                    check.style.display = "none";
                    force.style.display = "block";
                    avail.style.display = "none";
                    unavail.style.display = "block";
                    running.style.display = "none";
                    finished.style.display = "none";
                    this.dispatchEvent(new Event('noconnection'));
                }
            
                this.shadowRoot.getElementById("check-update").onclick = function() {
                    this.checkUpdate();
                }.bind(this);
            
                this.shadowRoot.getElementById("download-update").onclick = function() {
                    check.style.display = "none";
                    force.style.display = "none";
                    avail.style.display = "none";
                    unavail.style.display = "none";
                    running.style.display = "block";
                    finished.style.display = "none";
                    navigator.serviceWorker.getRegistration().then(function(registration) {
                        registration.active.postMessage("update");
                    });
                }
            
                this.shadowRoot.getElementById("download-forced").onclick = function() {
                    check.style.display = "none";
                    force.style.display = "none";
                    avail.style.display = "none";
                    unavail.style.display = "none";
                    running.style.display = "block";
                    finished.style.display = "none";
                    navigator.serviceWorker.getRegistration().then(function(registration) {
                        registration.active.postMessage("forceupdate");
                    });
                }
            });
        }
    }

    checkUpdate() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration().then(function(registration) {
                registration.active.postMessage("check");
            });
        }
    }

}

customElements.define('ootrt-updatehandler', UpdateHandler);