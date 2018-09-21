window.FileLoader = new (function() {

    var required = 0;
    var loaded = 0;
    this.onupdate = null;

    this.addFont = function(name, file, style = "normal", weight = 400) {
        required++;
        if (typeof this.onupdate == "function") this.onupdate(required, loaded);
        var font = new FontFace(name, 'url('+file+')', {
            style: style,
            weight: weight
        });
        document.fonts.add(font);
        return font.loaded.then(function(fontFace) {
            loaded++;
            if (typeof this.onupdate == "function") this.onupdate(required, loaded);
            return fontFace;
        }.bind(this));
    }

    this.loadText = function(file) {
        required++;
        if (typeof this.onupdate == "function") this.onupdate(required, loaded);
        return fetch(new Request(file, {
            method: 'GET',
            headers: new Headers({
                "Content-Type": "text/plain",
                "Pragma": "no-cache",
                "Cache-Control": "no-cache"
            }),
            mode: 'cors',
            cache: 'default'
        })).then(function(r) {
            loaded++;
            if (typeof this.onupdate == "function") this.onupdate(required, loaded);
            return r.text();
        }.bind(this));
    }

    this.loadAllText = function(files) {
        var data = [];
        for (let i in files) {
            data.push(this.loadText(files[i]));
        }
        return Promise.all(data);
    }
    
    this.loadJSON = function(file) {
        required++;
        if (typeof this.onupdate == "function") this.onupdate(required, loaded);
        return fetch(new Request(file, {
            method: 'GET',
            headers: new Headers({
                "Content-Type": "application/json",
                "Pragma": "no-cache",
                "Cache-Control": "no-cache"
            }),
            mode: 'cors',
            cache: 'default'
        })).then(function(r) {
            loaded++;
            if (typeof this.onupdate == "function") this.onupdate(required, loaded);
            return r.json();
        }.bind(this));
    }

    this.loadAllJSON = function(files) {
        var data = [];
        for (let i in files) {
            data.push(this.loadJSON(files[i]));
        }
        return Promise.all(data);
    }

});