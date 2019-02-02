const CACHE_INDEX = "/index.json";
const CACHE_NAME = 'track-oot';
const HEADER_CONFIG = new Headers({
    "Content-Type": "text/plain",
    "Pragma": "no-cache",
    "Cache-Control": "no-cache"
});
const R_LN = /\r\n|\r|\n/;

let cmd = {
    start: install,
    check: checkUpdateAvailable,
    update: updateFiles,
    forceupdate: updateFilesForced
};

self.addEventListener('install', function(event) {
    return self.skipWaiting();
});

self.addEventListener('activate', function(event) {
	return self.clients.claim();
});

self.addEventListener('fetch', function(event) {
    if ((new URL(event.request.url)).searchParams.get("nosw") !== null) {
        return false;
    } else {
        if (event.request.url == self.location.origin + "/version.json") {
            event.respondWith(getVersion(event.request));
        } else {
            event.respondWith(getResponse(event.request));
        }
    }
});

async function getResponse(request) {
    var cache = await caches.open(CACHE_NAME);
    let response = await cache.match(request.url);
    if (!response) {
        response = await fetch(request);
    }
    return response;
}

async function getVersion(request) {
    var cache = await caches.open(CACHE_NAME);
    let response = await cache.match(CACHE_INDEX);
    let version = await cache.match(request.url);
    if (!!response) {
        let ver = await version.json();
        ver.date = new Date(response.headers.get("Last-Modified"));
        return new Response(JSON.stringify(ver));
    }
    return version;
}

self.addEventListener('message', async event => {
    let src = event.source;
    let dta = event.data;
    if (!src) return;
    if (!!cmd[dta]) {
        try {
            await cmd[dta](src);
        } catch(e) {
            src.postMessage({
                type: "error",
                cmd: dta,
                msg: e
            });
        }
    }
});

function fetchFile(url, method = "GET") {
    return fetch(url, {
        method: method,
        headers: HEADER_CONFIG,
        mode: 'cors'
    });
}

async function overwriteCachedFile(cache, request, file) {
    await cache.delete(request);
    await cache.put(request, file);
}

async function install(client) {
    let cache = await caches.open(CACHE_NAME);
    let response = await cache.match(CACHE_INDEX);
    if (!!response) {
        client.postMessage({
            type: "state",
            msg: "start"
        });
    } else {
        let filelist = await fetchFile(CACHE_INDEX);
        let downloadlist = await filelist.clone().json();
        client.postMessage({
            type: "state",
            msg: "need_download",
            value: downloadlist.length
        });
        await updateFileList(client, cache, downloadlist);
        await cache.put(CACHE_INDEX, filelist);
        client.postMessage({
            type: "state",
            msg: "start"
        });
    }
}

async function checkUpdateAvailable(client) {
    let cache = await caches.open(CACHE_NAME);
    let response = await cache.match(CACHE_INDEX);
    let message = "update_available";
    if (!!response) {
        let loc = new Date(response.headers.get("Last-Modified"));
        if (loc > new Date(0)) {
            let rem = new Date((await fetchFile(CACHE_INDEX, "HEAD")).headers.get("Last-Modified"));
            if (rem <= loc) {
                message = "update_unavailable";
            }
        }
    }
    client.postMessage({
        type: "state",
        msg: message
    });
}

async function removeUnusedFiles(client, cache, downloadlist) {
    client.postMessage({
        type: "state",
        msg: "cleaning"
    });
    let filelist = await fetchFile(CACHE_INDEX);
    let removelist = diff(await filelist.json(), downloadlist);
    let w = [];
    for (let i in removelist) {
        w.push(await cache.delete(removelist[i]));
    }
    await Promise.all(w);
}

async function updateFiles(client) {
    let cache = await caches.open(CACHE_NAME);
    let filelist = await fetchFile(CACHE_INDEX);
    client.postMessage({
        type: "state",
        msg: "check_update"
    });
    let allfileslist = await filelist.clone().json();
    let downloadlist = await checkUpdateNeeded(cache, allfileslist);
    client.postMessage({
        type: "state",
        msg: "need_download",
        value: downloadlist.length
    });
    await updateFileList(client, cache, downloadlist);
    await removeUnusedFiles(client, cache, allfileslist);
    await cache.put(CACHE_INDEX, filelist);
    client.postMessage({
        type: "state",
        msg: "update_finished"
    });
}

async function updateFilesForced(client) {
    let cache = await caches.open(CACHE_NAME);
    let filelist = await fetchFile(CACHE_INDEX);
    client.postMessage({
        type: "state",
        msg: "check_update"
    });
    let downloadlist = await filelist.clone().json();
    client.postMessage({
        type: "state",
        msg: "need_download",
        value: downloadlist.length
    });
    await updateFileList(client, cache, downloadlist);
    await cache.put(CACHE_INDEX, filelist);
    client.postMessage({
        type: "state",
        msg: "update_finished"
    });
}

async function checkUpdateNeeded(cache, filelist) {
    let r = [], p = [];
    filelist.forEach(element => {
        p.push(addFileIfNeeded(cache, element, r));
    });
    await Promise.all(p); 
    return r;
}

async function addFileIfNeeded(cache, element, arr) {
    if (await checkFile(cache, element)) {
        arr.push(element);
    }
}

async function checkFile(cache, url) {
  let response = await cache.match(url);
  if (!!response) {
    let local = new Date(response.headers.get("Last-Modified"));
    let remote = new Date((await fetchFile(url, "HEAD")).headers.get("Last-Modified"));
    return remote > local;
  } else {
    return true;
  }
}

async function updateFileList(client, cache, filelist) {
    let r = [];
    let files = {};
    filelist.forEach(element => {
        r.push(downloadFile(element).then(file => {
            files[element] = file;
            client.postMessage({
                type: "state",
                msg: "file_downloaded"
            });
        }));
    });
    await Promise.all(r);
    let w = [];
    for (let i in files) {
        w.push(overwriteCachedFile(cache, i, files[i]));
    }
    await Promise.all(w);
}

async function downloadFile(url, tries = 3) {
    if (!tries) throw new Error("could not load file " + url);
    try {
        return await fetchFile(url);
    } catch(e) {
        return await downloadFile(url, tries-1);
    }
}

function diff(a, b) {
    var c = new Set(b);
    return a.filter(d =>!c.has(d));
}