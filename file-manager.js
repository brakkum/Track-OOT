!function() {

    const fs = require('fs');
    const path = require("path");
    const glob = require("glob-all");
    const through = require("through");
    const del = require("del");

    const FILES = new Set();

    function normalizePath(path) {
        return path.replace(/\\/g, "/");
    }

    class FileManager {

        register(src = "/", dest = "/", sourcemaps = false) {
            let files = [];
            return through(function(file) {
                FILES.add(normalizePath(path.resolve(dest, path.relative(src, file.path))));
                if (!!sourcemaps) {
                    FILES.add(normalizePath(path.resolve(dest, path.relative(src, `${file.path}.map`))));
                }
                this.push(file);
                return files.push(file);
            }, function() {
                return this.emit("end");
            });
        }

        finish(dest = "/", index = "index.json") {
            let destFiles = glob.sync("./**/*", {
                nodir: true,
                cwd: dest,
                absolute: true
            });

            let srcFiles = Array.from(FILES);
            
            for (let i in destFiles) {
                let fName = destFiles[i];
                if (!(srcFiles.indexOf(fName) + 1)) {
                    console.log(`delete file: ${fName}`);
                    del.sync(fName);
                }
            }

            // TODO remove empty folders

            let files = Array.from(FILES).map(el=>`/${path.relative(dest, el)}`);
            files.push("/");
            // TODO generate file structure object for sorting
            fs.writeFileSync(path.resolve(dest, index), JSON.stringify(files, null, 4));

            FILES.clear();
        }

    }

    module.exports = new FileManager();

}();