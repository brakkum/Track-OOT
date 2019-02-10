window.Storage = new (function Storage() {

    this.set = function(category, name, data) {
        localStorage.setItem(category+"\0"+name, JSON.stringify(data));
    }

    this.get = function(category, name, _default = null) {
        try {
            var res = localStorage.getItem(category+"\0"+name);
            if (!res || res == null) return _default;
            return JSON.parse(res);
        } catch(e) {
            return _default;
        }
    }

    this.has = function(category, name) {
        return localStorage.hasOwnProperty(category+"\0"+name);
    }

    this.remove = function(category, name) {
        localStorage.removeItem(category+"\0"+name);
    }

    this.categories = function() {
        var k = Object.keys(localStorage);
        return Array.from(new Set(k.map(function(v) {
            return v.split('\0')[0];
        })));
    }

    this.names = function(category) {
        var k = Object.keys(localStorage);
        return Array.from(new Set(k.filter(function(v) {
            return v.startsWith(category+'\0');
        }).map(function(v) {
            return v.split('\0')[1];
        })));
    }
})();