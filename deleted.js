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

    class Deleted {

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

        cleanup(dest = "/") {
            let destFiles = glob.sync("./**/*", {
                nodir: true,
                cwd: dest,
                absolute: true
            });

            let srcFiles = Array.from(FILES);

            // fs.writeFileSync("src.txt", srcFiles.sort().join("\n"));
            // fs.writeFileSync("dst.txt", destFiles.sort().join("\n"));
            
            for (let i in destFiles) {
                let fName = destFiles[i];
                if (!(srcFiles.indexOf(fName) + 1)) {
                    console.log(`delete file: ${fName}`);
                    del.sync(fName);
                }
            }

            // TODO remove empty folders

            FILES.clear();
        }

    }

    module.exports = new Deleted;

}();