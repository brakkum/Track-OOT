"use strict";

const PATHS = {
    app: {
        base: "./src",
        js: "./src/script",
        css: "./src/style/app.scss"
    },
    deepJS: "node_modules/deepjs-modules",
    target: {
        dev: "./dev",
        prod: "./prod"
    }
};

const gulp         = require("gulp");
const terser       = require('gulp-terser');
const htmlmin      = require('gulp-htmlmin');
const jsonminify   = require('gulp-jsonminify');
const svgo         = require('gulp-svgo');
const sass         = require('gulp-sass');
const newer        = require('gulp-newer');
const deleted      = require('gulp-deleted');
const filelist     = require('gulp-filelist');
const autoprefixer = require('gulp-autoprefixer');

function copyHTML_prod() {
    return gulp.src(PATHS.app.base + "/**/*.html")
        .pipe(newer(PATHS.target.prod))
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(PATHS.target.prod));
}

function copyHTML_dev() {
    return gulp.src(PATHS.app.base + "/**/*.html")
        .pipe(newer(PATHS.target.dev))
        .pipe(gulp.dest(PATHS.target.dev));
}

function copyJSON_prod() {
    return gulp.src(PATHS.app.base + "/**/*.json")
        .pipe(newer(PATHS.target.prod))
        .pipe(jsonminify())
        .pipe(gulp.dest(PATHS.target.prod));
}

function copyJSON_dev() {
    return gulp.src(PATHS.app.base + "/**/*.json")
        .pipe(newer(PATHS.target.dev))
        .pipe(gulp.dest(PATHS.target.dev));
}

function copyI18N_prod() {
    return gulp.src(PATHS.app.base + "/i18n/*.lang")
        .pipe(newer(PATHS.target.prod + "/i18n"))
        .pipe(gulp.dest(PATHS.target.prod + "/i18n"));
}

function copyI18N_dev() {
    return gulp.src(PATHS.app.base + "/i18n/*.lang")
        .pipe(newer(PATHS.target.dev + "/i18n"))
        .pipe(gulp.dest(PATHS.target.dev + "/i18n"));
}

function copyImg_prod() {
    return gulp.src([PATHS.app.base + "/images/**/*.svg", PATHS.app.base + "/images/**/*.png"])
        .pipe(newer(PATHS.target.prod + "/images"))
        .pipe(svgo())
        .pipe(gulp.dest(PATHS.target.prod + "/images"));
}

function copyImg_dev() {
    return gulp.src([PATHS.app.base + "/images/**/*.svg", PATHS.app.base + "/images/**/*.png"])
        .pipe(newer(PATHS.target.dev + "/images"))
        .pipe(gulp.dest(PATHS.target.dev + "/images"));
}

function copyChangelog_prod() {
    return gulp.src(PATHS.app.base + "/CHANGELOG.MD")
        .pipe(newer(PATHS.target.prod))
        .pipe(gulp.dest(PATHS.target.prod));
}

function copyChangelog_dev() {
    return gulp.src(PATHS.app.base + "/CHANGELOG.MD")
        .pipe(newer(PATHS.target.dev))
        .pipe(gulp.dest(PATHS.target.dev));
}

function copySCSS_prod() {
    return gulp.src(PATHS.app.base + "/style/app.scss")
        .pipe(newer(PATHS.target.prod + "/style"))
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(gulp.dest(PATHS.target.prod + "/style"));
}

function copySCSS_dev() {
    return gulp.src(PATHS.app.base + "/style/app.scss", {sourcemaps: true})
        .pipe(newer(PATHS.target.dev  + "/style"))
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(gulp.dest(PATHS.target.dev + "/style", {sourcemaps: "."}));
}

function copyCSS_prod() {
    return gulp.src(PATHS.app.base + "/style/**/*.css")
        .pipe(newer(PATHS.target.prod + "/style"))
        .pipe(autoprefixer())
        .pipe(gulp.dest(PATHS.target.prod + "/style"));
}

function copyCSS_dev() {
    return gulp.src(PATHS.app.base + "/style/**/*.css")
        .pipe(newer(PATHS.target.dev + "/style"))
        .pipe(autoprefixer())
        .pipe(gulp.dest(PATHS.target.dev + "/style"));
}

function copyFonts_prod() {
    return gulp.src(PATHS.app.base + "/fonts/**/*.ttf")
        .pipe(newer(PATHS.target.prod + "/fonts"))
        .pipe(gulp.dest(PATHS.target.prod + "/fonts"));
}

function copyFonts_dev() {
    return gulp.src(PATHS.app.base + "/fonts/**/*.ttf")
        .pipe(newer(PATHS.target.dev + "/fonts"))
        .pipe(gulp.dest(PATHS.target.dev + "/fonts"));
}

function copyAppJS_prod() {
    return gulp.src(PATHS.app.js + "/**/*.mjs")
        .pipe(newer(PATHS.target.prod + "/script"))
        .pipe(terser())
        .pipe(gulp.dest(PATHS.target.prod + "/script"));
}

function copyAppJS_dev() {
    return gulp.src(PATHS.app.js + "/**/*.mjs")
        .pipe(newer(PATHS.target.dev + "/script"))
        .pipe(gulp.dest(PATHS.target.dev + "/script"));
}

function copyDeepJS_prod() {
    return gulp.src(PATHS.deepJS + "/**/*.mjs")
        .pipe(newer(PATHS.target.prod + "/deepJS"))
        .pipe(terser())
        .pipe(gulp.dest(PATHS.target.prod + "/deepJS"));
}

function copyDeepJS_dev() {
    return gulp.src(PATHS.deepJS + "/**/*.mjs")
        .pipe(newer(PATHS.target.dev + "/deepJS"))
        .pipe(gulp.dest(PATHS.target.dev + "/deepJS"));
}

function copyVendorJS_prod() {
    return gulp.src(PATHS.app.js + "/_vendor/**/*.js")
        .pipe(newer(PATHS.target.prod + "/script/_vendor"))
        .pipe(gulp.dest(PATHS.target.prod + "/script/_vendor"));
}

function copyVendorJS_dev() {
    return gulp.src(PATHS.app.js + "/_vendor/**/*.js")
        .pipe(newer(PATHS.target.dev + "/script/_vendor"))
        .pipe(gulp.dest(PATHS.target.dev + "/script/_vendor"));
}

function copyOldJS_prod() {
    return gulp.src(PATHS.app.js + "/editor/**/*.js")
        .pipe(newer(PATHS.target.prod + "/script/editor"))
        .pipe(terser())
        .pipe(gulp.dest(PATHS.target.prod + "/script/editor"));
}

function copyOldJS_dev() {
    return gulp.src(PATHS.app.js + "/editor/**/*.js")
        .pipe(newer(PATHS.target.dev + "/script/editor"))
        .pipe(gulp.dest(PATHS.target.dev + "/script/editor"));
}

function copySW_prod() {
    return gulp.src(PATHS.app.base + "/sw.js")
        .pipe(newer(PATHS.target.prod))
        .pipe(terser())
        .pipe(gulp.dest(PATHS.target.prod));
}

function copySW_dev() {
    return gulp.src(PATHS.app.base + "/sw.js")
        .pipe(newer(PATHS.target.dev))
        .pipe(gulp.dest(PATHS.target.dev));
}

function writeTOC_prod() {
    return gulp.src([PATHS.target.prod + "/**/*", "!" + PATHS.target.prod + "/index.json"])
        .pipe(filelist("index.json", {relative:true}))
        .pipe(gulp.dest(PATHS.target.prod));
}

function writeTOC_dev() {
    return gulp.src([PATHS.target.dev + "/**/*", "!" + PATHS.target.dev + "/index.json"])
        .pipe(filelist("index.json", {relative:true}))
        .pipe(gulp.dest(PATHS.target.dev));
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
        copyAppJS_prod,
        copyDeepJS_prod,
        copyVendorJS_prod,
        copyOldJS_prod,
        copySW_prod,
        copyChangelog_prod
    ),
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
        copyAppJS_dev,
        copyDeepJS_dev,
        copyVendorJS_dev,
        copyOldJS_dev,
        copySW_dev,
        copyChangelog_dev
    ),
    writeTOC_dev
);

exports.watch = function() {
    return gulp.watch(
        PATHS.app.base + "/**/*",
        gulp.series(
            gulp.parallel(
                copyHTML_dev,
                copyJSON_dev,
                copyI18N_dev,
                copyImg_dev,
                copySCSS_dev,
                copyCSS_dev,
                copyFonts_dev,
                copyAppJS_dev,
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
