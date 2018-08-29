window.FileLoader = new (function() {

    this.loadText = function(file) {
        return fetch(new Request(file, {
            method: 'GET',
            headers: new Headers({
                "Content-Type": "text/plain",
                "Pragma": "no-cache",
                "Cache-Control": "no-cache"
            }),
            mode: 'cors',
            cache: 'default'
        })).then(r => r.text());
    }

    this.loadAllText = function(files) {
        var data = [];
        for (let i in files) {
            data.push(this.loadText(files[i]));
        }
        return Promise.all(data);
    }
    
    this.loadJSON = function(file) {
        return fetch(new Request(file, {
            method: 'GET',
            headers: new Headers({
                "Content-Type": "application/json",
                "Pragma": "no-cache",
                "Cache-Control": "no-cache"
            }),
            mode: 'cors',
            cache: 'default'
        })).then(r => r.json());
    }

    this.loadAllJSON = function(files) {
        var data = [];
        for (let i in files) {
            data.push(this.loadJSON(files[i]));
        }
        return Promise.all(data);
    }

});