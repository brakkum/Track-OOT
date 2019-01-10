window.FileSystem = new (function() {

    var dl = document.createElement("a");
    dl.style = "display: none";

    var ul = document.createElement("input");
    ul.setAttribute("type", "file");
    ul.style = "display: none";

    this.load = function () {
        return new Promise(function(resolve, reject) {
            ul.onchange = function() {
                var file = this.files[0];
                var reader = new FileReader();
                reader.onload = function(e) {
                    resolve(e.target.result);
                }
                reader.onabort = resolve;
                reader.onerror = reject;
                reader.readAsDataURL(file);
            };
            ul.onerror = reject;
            ul.click();
        });
    }
    
    this.save = function (data, fileName) {
        var url = window.URL.createObjectURL(new Blob([data], {type: "octet/stream"}));
        dl.href = url;
        dl.download = fileName;
        dl.click();
        window.URL.revokeObjectURL(url);
    }
});