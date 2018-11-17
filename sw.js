const CACHE_NAME_MAIN = 'track-oot:main';
const CACHE_NAME_DLC = 'track-oot:dlc';

var CACHE_URLS = [
  self.location.origin + '/',
  self.location.origin + '/manifest.json',
  self.location.origin + '/style/normalize.css',
  self.location.origin + '/images/favicons/icon-16x16.png',
  self.location.origin + '/images/favicons/icon-32x32.png',
  self.location.origin + '/images/favicons/icon-36x36.png',
  self.location.origin + '/images/favicons/icon-48x48.png',
  self.location.origin + '/images/favicons/icon-72x72.png',
  self.location.origin + '/images/favicons/icon-96x96.png',
  self.location.origin + '/images/favicons/icon-144x144.png',
  self.location.origin + '/images/favicons/icon-192x192.png',
  self.location.origin + '/images/logo.min.svg',
  self.location.origin + '/favicon.ico'
];

var WHITELIST_URLS = [
  self.location.origin + '/editor',
  self.location.origin + '/editor.html',
  self.location.origin + '/script/editor/main.min.js',
  self.location.origin + '/style/editor.css',
  self.location.origin + '/uninstall.html',
  self.location.origin + '/uninstall'
];

var cmd = {
  update: function(client) {
    return updateFiles(client).then(function() {
      client.postMessage({
        type: "state",
        msg: "update success"
      });
    });
  }
};

var version = new Date(0);

self.addEventListener('install', function(event) {
  console.log('[ServiceWorker] Install');
  return self.skipWaiting();
});

self.addEventListener('fetch', function(event) {
  if (event.request.url == self.location.origin + "/version") {
    event.respondWith(
      new Response(version.getFullYear()
                +("00"+(version.getMonth()+1)).slice(-2)
                +("00"+version.getDate()).slice(-2)
                +("00"+version.getHours()).slice(-2)
                +("00"+version.getMinutes()).slice(-2))
    );
  } else if (WHITELIST_URLS.indexOf(event.request.url)>=0) {
    return false;
  } else if (CACHE_URLS.indexOf(event.request.url)>=0) {
    event.respondWith(getMainFile(event.request));
  } else {
    event.respondWith(caches.open(CACHE_NAME_DLC).then(function(cache) {
      return cache.match(event.request.url);
    }));
  }
});

self.addEventListener('message', event => {
  if (!event.source) return;
  if (!!cmd[event.data]) {
    cmd[event.data](event.source).catch(e => {
      console.error("[ServiceWorker] " + e);
    });
  }
});

async function getMainFile(request) {
  var cache = await caches.open(CACHE_NAME_MAIN);
  var response;
  try {
    response = await fetch(request);
    if (!!response.ok) {
      await cache.put(request.url, response.clone());
    } else {
      response = await cache.match(request.clone());
    }
  } catch(e) {
    response = await cache.match(request.clone());
  }
  var local = new Date(response.headers.get("Last-Modified"));
  if (local > version) version = local;
  return response;
}

async function updateFiles(client) {
  try {
    var files = await fetch("cache.index", {
      method: 'HEAD',
      headers: new Headers({
          "Content-Type": "text/plain",
          "Pragma": "no-cache",
          "Cache-Control": "no-cache, max-age=0, must-revalidate"
      }),
      mode: 'cors',
      cache: 'default'
    }).then(r => r.text());
    files = files.split(/\r\n|\r|\n/);
    client.postMessage({
      type: "update",
      msg: files.length
    });
    var updates = [];
    for (let i = 0; i < files.length; ++i) {
      updates.push(updateFile(client, files[i]));
    }
    await Promise.all(updates);
  } catch(e) {
    console.error(e);
  }
}

async function updateFile(client, file) {
  var cache = await caches.open(CACHE_NAME_DLC);
  if (await checkFile(cache, file)) {
    await cache.put(file, await loadFile(file));
    client.postMessage({
      type: "update",
      msg: "loaded"
    });
  } else {
    client.postMessage({
      type: "update",
      msg: "loaded"
    });
  }
}

async function checkFile(cache, url) {
  var response = await cache.match(url);
  if (!!response) {
    var local = new Date(response.headers.get("Last-Modified"));
    if (local > version) version = local;
    var remote = new Date((await fetch(url, {
      method: 'HEAD',
      headers: new Headers({
          "Content-Type": "text/plain",
          "Pragma": "no-cache",
          "Cache-Control": "no-cache"
      }),
      mode: 'cors',
      cache: 'default'
    })).headers.get("Last-Modified"));
    return remote > local;
  } else {
    return true;
  }
}

async function loadFile(url) {
  return fetch(url, {
    method: 'GET',
    headers: new Headers({
        "Content-Type": "text/plain",
        "Pragma": "no-cache",
        "Cache-Control": "no-cache"
    }),
    mode: 'cors',
    cache: 'default'
  }).then(function(response) {
    if (!response.ok) {
      throw new TypeError('Bad response status');
    }
    var local = new Date(response.headers.get("Last-Modified"));
    if (local > version) version = local;
    return response;
  })
}