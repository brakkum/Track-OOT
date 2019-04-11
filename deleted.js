!function() {

    const fs = require('fs');
    const path = require("path");
    const glob = require("glob-all");
    const through = require("through");
    const del = require("del");

    const FILES = new Set();

    class Deleted {

        register(src = "/", dest = "/") {
            let files = [];
            return through(function(file) {
                FILES.add(path.resolve(dest, path.relative(src, file.path)));
                this.push(file);
                return files.push(file);
            }, function() {
                return this.emit("end");
            });
        }

        cleanup(dest = "/") {
            let files = [];
            return through(function(file) {
                this.push(file);
                return files.push(file);
            }, function() {
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

                FILES.clear();

                return this.emit("end");
            });
        }

    }

    module.exports = new Deleted;

}();