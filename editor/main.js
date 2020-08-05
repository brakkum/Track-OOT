const { app, protocol, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require("path");

let OPTIONS = {
    debug: false
};
if (process.argv.indexOf('-debug') >= 1) {
    OPTIONS.debug = true;
}

const MODULE_PATHS = {
    emcJS: "../node_modules/emcjs/",
    trackerEditor: "../node_modules/jseditors/"
};

function fileExists(filename) {
    try {
        fs.accessSync(filename);
        return true;
    } catch (e) {
        return false;
    }
}

if (process.argv.indexOf('-nolocal') < 0) {
    let emcJS = path.resolve(__dirname, '../../emcJS');
    if (fileExists(emcJS)) {
        MODULE_PATHS.emcJS = '../../emcJS/';
    }
    let trackerEditor = path.resolve(__dirname, '../../JSEditors');
    if (fileExists(trackerEditor)) {
        MODULE_PATHS.trackerEditor = '../../JSEditors/';
    }
}

console.log(MODULE_PATHS);

function createWindow() {
    protocol.interceptFileProtocol("file", (request, callback) => {
        let url = request.url.replace(/file\:\/+(:?[a-z]\:)?/i, "");
        url = url.replace(__dirname, "");
        url = url.replace(/^\/?src\//i, "../src/");
        url = url.replace(/^\/?images\//i, "../src/images/");
        url = url.replace(/^\/?emcjs\//i, MODULE_PATHS.emcJS);
        url = url.replace(/^\/?editors\//i, MODULE_PATHS.trackerEditor);
        url = path.join(__dirname, ".", url);
        url = path.normalize(url);
        callback({path: url});
    });
    let win = new BrowserWindow({
        width: 800,
        height: 700,
        show: false,
        webPreferences: {
            nativeWindowOpen: true,
            //nodeIntegration: true
            //preload: `${__dirname}/../webutils/_preload.js`
        }
        //icon: __dirname + "/icon.png"
    });
    win.maximize();
    win.setMenu(null);
    win.loadFile("/index.html");
    if (!!OPTIONS.debug) {
        win.toggleDevTools();
    }
    win.once('ready-to-show', () => {
        win.show();
    });
    win.on('closed', () => {
        app.quit();
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});