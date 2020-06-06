const { app, protocol, BrowserWindow } = require('electron');
const path = require("path");

let OPTIONS = {
    debug: false
};
if (process.argv.indexOf('-debug') >= 1) {
    OPTIONS.debug = true;
}

function createWindow() {
    protocol.interceptFileProtocol("file", (request, callback) => {
        let url = request.url.replace(/file\:\/+(:?[a-z]\:)?/i, "");
        url = url.replace(/^\/src\//i, "../src/");
        url = url.replace(/^\/images\//i, "../src/images/");
        url = url.replace(/^\/emcjs\//i, "../node_modules/emcjs/");
        url = url.replace(/^\/editors\//i, "../node_modules/jseditors/");
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