"use strict";

const fs = require('fs');
const path = require("path");

const PATHS = {
    appBase: path.resolve(__dirname, "./src"),
    deepJS: path.resolve(__dirname, "node_modules/deepjs-modules"),
    targetDev: path.resolve(__dirname, "./dev"),
    targetProd: path.resolve(__dirname, "./prod")
};

function fileExists(filename) {
    try {
        fs.accessSync(filename);
        return true;
    } catch (e) {
        return false;
    }
}

!function () {
    let deepJS = path.resolve(__dirname, '../deepjs.2deep4real.de');
    if (fileExists(deepJS)) {
        PATHS.deepJS = deepJS;
    }
}();

const gulp = require("gulp");
const terser = require('gulp-terser');
const htmlmin = require('gulp-htmlmin');
const jsonminify = require('gulp-jsonminify');
const svgo = require('gulp-svgo');
const sass = require('gulp-sass');
const newer = require('gulp-newer');
const filelist = require('gulp-filelist');
const autoprefixer = require('gulp-autoprefixer');
const deleted = require("./deleted");

function copyHTML_prod() {
    return gulp.src(PATHS.appBase + "/**/*.html")
        .pipe(deleted.register(PATHS.appBase, PATHS.targetProd))
        .pipe(newer(PATHS.targetProd))
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest(PATHS.targetProd));
}

function copyHTML_dev() {
    return gulp.src(PATHS.appBase + "/**/*.html")
        .pipe(deleted.register(PATHS.appBase, PATHS.targetDev))
        .pipe(newer(PATHS.targetDev))
        .pipe(gulp.dest(PATHS.targetDev));
}

function copyJSON_prod() {
    return gulp.src(PATHS.appBase + "/**/*.json")
        .pipe(deleted.register(PATHS.appBase, PATHS.targetProd))
        .pipe(newer(PATHS.targetProd))
        .pipe(jsonminify())
        .pipe(gulp.dest(PATHS.targetProd));
}

function copyJSON_dev() {
    return gulp.src(PATHS.appBase + "/**/*.json")
        .pipe(deleted.register(PATHS.appBase, PATHS.targetDev))
        .pipe(newer(PATHS.targetDev))
        .pipe(gulp.dest(PATHS.targetDev));
}

function copyI18N_prod() {
    return gulp.src(PATHS.appBase + "/i18n/*.lang")
        .pipe(deleted.register(PATHS.appBase + "/i18n", PATHS.targetProd + "/i18n"))
        .pipe(newer(PATHS.targetProd + "/i18n"))
        .pipe(gulp.dest(PATHS.targetProd + "/i18n"));
}

function copyI18N_dev() {
    return gulp.src(PATHS.appBase + "/i18n/*.lang")
        .pipe(deleted.register(PATHS.appBase + "/i18n", PATHS.targetDev + "/i18n"))
        .pipe(newer(PATHS.targetDev + "/i18n"))
        .pipe(gulp.dest(PATHS.targetDev + "/i18n"));
}

function copyImg_prod() {
    return gulp.src([PATHS.appBase + "/images/**/*.svg", PATHS.appBase + "/images/**/*.png"])
        .pipe(deleted.register(PATHS.appBase + "/images", PATHS.targetProd + "/images"))
        .pipe(newer(PATHS.targetProd + "/images"))
        .pipe(svgo())
        .pipe(gulp.dest(PATHS.targetProd + "/images"));
}

function copyImg_dev() {
    return gulp.src([PATHS.appBase + "/images/**/*.svg", PATHS.appBase + "/images/**/*.png"])
        .pipe(deleted.register(PATHS.appBase + "/images", PATHS.targetDev + "/images"))
        .pipe(newer(PATHS.targetDev + "/images"))
        .pipe(gulp.dest(PATHS.targetDev + "/images"));
}

function copyChangelog_prod() {
    return gulp.src(PATHS.appBase + "/CHANGELOG.MD")
        .pipe(deleted.register(PATHS.appBase, PATHS.targetProd))
        .pipe(newer(PATHS.targetProd))
        .pipe(gulp.dest(PATHS.targetProd));
}

function copyChangelog_dev() {
    return gulp.src(PATHS.appBase + "/CHANGELOG.MD")
        .pipe(deleted.register(PATHS.appBase, PATHS.targetDev))
        .pipe(newer(PATHS.targetDev))
        .pipe(gulp.dest(PATHS.targetDev));
}

function copySCSS_prod() {
    return gulp.src(PATHS.appBase + "/style/**/*.scss")
        .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
        .pipe(deleted.register(PATHS.appBase + "/style", PATHS.targetProd + "/style"))
        .pipe(newer(PATHS.targetProd + "/style"))
        .pipe(autoprefixer())
        .pipe(gulp.dest(PATHS.targetProd + "/style"));
}

function copySCSS_dev() {
    return gulp.src(PATHS.appBase + "/style/**/*.scss", { sourcemaps: true })
        .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
        .pipe(deleted.register(PATHS.appBase + "/style", PATHS.targetDev + "/style"))
        .pipe(newer(PATHS.targetDev + "/style"))
        .pipe(autoprefixer())
        .pipe(gulp.dest(PATHS.targetDev + "/style", { sourcemaps: true }));
}

function copyCSS_prod() {
    return gulp.src(PATHS.appBase + "/style/**/*.css")
        .pipe(deleted.register(PATHS.appBase + "/style", PATHS.targetProd + "/style"))
        .pipe(newer(PATHS.targetProd + "/style"))
        .pipe(autoprefixer())
        .pipe(gulp.dest(PATHS.targetProd + "/style"));
}

function copyCSS_dev() {
    return gulp.src(PATHS.appBase + "/style/**/*.css")
        .pipe(deleted.register(PATHS.appBase + "/style", PATHS.targetDev + "/style"))
        .pipe(newer(PATHS.targetDev + "/style"))
        .pipe(autoprefixer())
        .pipe(gulp.dest(PATHS.targetDev + "/style"));
}

function copyFonts_prod() {
    return gulp.src([
        PATHS.appBase + "/fonts/**/*.ttf",
        PATHS.appBase + "/fonts/**/*.eot",
        PATHS.appBase + "/fonts/**/*.otf",
        PATHS.appBase + "/fonts/**/*.woff",
        PATHS.appBase + "/fonts/**/*.woff2",
        PATHS.appBase + "/fonts/**/*.svg"
    ])
        .pipe(deleted.register(PATHS.appBase + "/fonts", PATHS.targetProd + "/fonts"))
        .pipe(newer(PATHS.targetProd + "/fonts"))
        .pipe(gulp.dest(PATHS.targetProd + "/fonts"));
}

function copyFonts_dev() {
    return gulp.src([
        PATHS.appBase + "/fonts/**/*.ttf",
        PATHS.appBase + "/fonts/**/*.eot",
        PATHS.appBase + "/fonts/**/*.otf",
        PATHS.appBase + "/fonts/**/*.woff",
        PATHS.appBase + "/fonts/**/*.woff2",
        PATHS.appBase + "/fonts/**/*.svg"
    ])
        .pipe(deleted.register(PATHS.appBase + "/fonts", PATHS.targetDev + "/fonts"))
        .pipe(newer(PATHS.targetDev + "/fonts"))
        .pipe(gulp.dest(PATHS.targetDev + "/fonts"));
}

function copyScript_prod() {
    return gulp.src([PATHS.appBase + "/script/**/*.js", PATHS.appBase + "/script/**/*.mjs"])
        .pipe(deleted.register(PATHS.appBase + "/script", PATHS.targetProd + "/script"))
        .pipe(newer(PATHS.targetProd + "/script"))
        .pipe(terser())
        .pipe(gulp.dest(PATHS.targetProd + "/script"));
}

function copyScript_dev() {
    return gulp.src([PATHS.appBase + "/script/**/*.js", PATHS.appBase + "/script/**/*.mjs"])
        .pipe(deleted.register(PATHS.appBase + "/script", PATHS.targetDev + "/script"))
        .pipe(newer(PATHS.targetDev + "/script"))
        .pipe(gulp.dest(PATHS.targetDev + "/script"));
}

function copyDeepJS_prod() {
    return gulp.src(PATHS.deepJS + "/**/*.mjs")
        .pipe(deleted.register(PATHS.deepJS, PATHS.targetProd + "/deepJS"))
        .pipe(newer(PATHS.targetProd + "/deepJS"))
        .pipe(terser())
        .pipe(gulp.dest(PATHS.targetProd + "/deepJS"));
}

function copyDeepJS_dev() {
    return gulp.src(PATHS.deepJS + "/**/*.mjs")
        .pipe(deleted.register(PATHS.deepJS, PATHS.targetDev + "/deepJS"))
        .pipe(newer(PATHS.targetDev + "/deepJS"))
        .pipe(gulp.dest(PATHS.targetDev + "/deepJS"));
}

function copySW_prod() {
    return gulp.src(PATHS.appBase + "/sw.js")
        .pipe(deleted.register(PATHS.appBase, PATHS.targetProd))
        .pipe(newer(PATHS.targetProd))
        .pipe(terser())
        .pipe(gulp.dest(PATHS.targetProd));
}

function copySW_dev() {
    return gulp.src(PATHS.appBase + "/sw.js")
        .pipe(deleted.register(PATHS.appBase, PATHS.targetDev))
        .pipe(newer(PATHS.targetDev))
        .pipe(gulp.dest(PATHS.targetDev));
}

function writeTOC_prod() {
    return gulp.src([PATHS.targetProd + "/**/*", "!" + PATHS.targetProd + "/index.json"])
        .pipe(filelist("index.json", { relative: true }))
        .pipe(gulp.dest(PATHS.targetProd));
}

function writeTOC_dev() {
    return gulp.src([PATHS.targetDev + "/**/*", "!" + PATHS.targetDev + "/index.json"])
        .pipe(filelist("index.json", { relative: true }))
        .pipe(gulp.dest(PATHS.targetDev));
}

function cleanup_prod(done) {
    deleted.cleanup(PATHS.targetProd);
    done();
}

function cleanup_dev(done) {
    deleted.cleanup(PATHS.targetDev);
    done();
}

exports.build = gulp.series(
    gulp.parallel(
        copyHTML_prod,
        copyJSON_prod,
        copyI18N_prod,
        copyImg_prod,
        copySCSS_prod,
        copyCSS_prod,
        copyFonts_prod,
        copyScript_prod,
        copyDeepJS_prod,
        copySW_prod,
        copyChangelog_prod
    ),
    cleanup_prod,
    writeTOC_prod
);

exports.buildDev = gulp.series(
    gulp.parallel(
        copyHTML_dev,
        copyJSON_dev,
        copyI18N_dev,
        copyImg_dev,
        copySCSS_dev,
        copyCSS_dev,
        copyFonts_dev,
        copyScript_dev,
        copyDeepJS_dev,
        copySW_dev,
        copyChangelog_dev
    ),
    cleanup_dev,
    writeTOC_dev
);

exports.watch = function () {
    return gulp.watch(
        PATHS.appBase + "/**/*",
        gulp.series(
            gulp.parallel(
                copyHTML_dev,
                copyJSON_dev,
                copyI18N_dev,
                copyImg_dev,
                copySCSS_dev,
                copyCSS_dev,
                copyFonts_dev,
                copyScript_dev,
                copyDeepJS_dev,
                copyVendorJS_dev,
                copyOldJS_dev,
                copySW_dev,
                copyChangelog_dev
            ),
            writeTOC_dev
        )
    );
}
