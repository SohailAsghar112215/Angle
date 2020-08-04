/// <binding Clean='clean' />
'use strict';

var gulp = require('gulp'),
    $ = require('gulp-load-plugins')(),
    del = require('del'),
    saveLicense = require('uglify-save-license'),
    cssnano = require('cssnano');

var paths = {
    css: './Content/css/',
    sass: './Content/sass/',
    scripts: './Scripts/'
};

// Sources
paths.scriptsSource = [
    paths.scripts + 'modules/common/wrapper.js',
    paths.scripts + 'app.init.js',
    paths.scripts + 'modules/**/*.js',
    paths.scripts + 'custom/**/*.js'
];

paths.sassBootstrap = paths.sass + 'bootstrap.scss';
paths.sassApp = paths.sass + 'app.scss';
paths.sassThemes = paths.sass + 'themes/*.scss';
paths.sassWatch = paths.sass + '**/*.scss';


// VENDOR CONFIG
var vendor = {
    source: require('./vendor.json'),
    dest: './Vendor'
};

var cssnanoOpts = {
    safe: true,
    discardUnused: false, // no remove @font-face
    reduceIdents: false, // no change on @keyframes names
    zindex: false // no change z-index
}

var vendorUglifyOpts = {
    output: {
        comments: false,
    },
    mangle: {
        reserved: ['$super'] // rickshaw requires this
    }
};


gulp.task('vendor', function() {

    return gulp.src(vendor.source, {
            base: 'node_modules'
        })
        .pipe(gulp.dest(vendor.dest));

});

gulp.task('min:vendor', function() {

    var jsFilter = $.filter('**/*.js', {
        restore: true
    });
    var cssFilter = $.filter('**/*.css', {
        restore: true
    });

    return gulp.src(vendor.source, {
            base: 'node_modules'
        })
        .pipe(jsFilter)
        .pipe($.uglify(vendorUglifyOpts))
        .on('error', handleError)
        .pipe(jsFilter.restore)
        .pipe(cssFilter)
        .pipe($.postcss([cssnano(cssnanoOpts)]))
        .pipe(cssFilter.restore)
        .pipe(gulp.dest(vendor.dest));

});

gulp.task('clean:js', function(cb) {
    return del([paths.scripts+'app.js'], { force: true })
});

gulp.task('clean:css', function(cb) {
    return del([paths.css], { force: true })
});

gulp.task('clean:vendor', function(cb) {
    return del(vendor.dest, { force: true });
});

gulp.task('clean', gulp.series('clean:js', 'clean:css'));


gulp.task('js', function() {
    return gulp.src(paths.scriptsSource)
        .pipe($.sourcemaps.init())
        .pipe($.concat('app.js'))
        .pipe($.babel())
        .on('error', handleError)
        .pipe($.sourcemaps.write())
        .pipe(gulp.dest(paths.scripts));
});

gulp.task('min:js', function() {
    return gulp.src(paths.scriptsSource)
        .pipe($.concat('app.js'))
        .pipe($.babel())
        .on('error', handleError)
        .pipe($.uglify({
            output: {
                comments: saveLicense
            }
        }))
        .pipe(gulp.dest(paths.scripts));
});

gulp.task('sass:app', function() {
    return gulp.src(paths.sassApp)
        .pipe($.sass())
        .on('error', $.sass.logError)
        .pipe(gulp.dest(paths.css));
});

gulp.task('sass:bs', function() {
    return gulp.src(paths.sassBootstrap)
        .pipe($.sass())
        .on('error', $.sass.logError)
        .pipe(gulp.dest(paths.css));
});

gulp.task('sass:themes', function() {
    return gulp.src(paths.sassThemes)
        .pipe($.sass())
        .on('error', $.sass.logError)
        .pipe(gulp.dest(paths.css));
});

gulp.task('sass:watch', function() {
    gulp.watch(paths.sassWatch, gulp.task('sass'));
});

gulp.task('sass', gulp.parallel('sass:bs', 'sass:app', 'sass:themes'));

gulp.task('rtl', function() {
    return gulp.src(paths.css+'**/{app,bootstrap}.css')
        .pipe($.rtlcss())
        .pipe($.rename(function(path) {
            path.basename += '-rtl';
            return path;
        }))
        .pipe(gulp.dest(paths.css));
});

gulp.task('min:css', function() {
    return gulp.src(paths.css+'**/*.css')
        .pipe($.postcss([cssnano(cssnanoOpts)]))
        .pipe(gulp.dest(paths.css));
});

gulp.task('min', gulp.series('min:vendor', 'min:css', 'min:js'));
gulp.task('default', gulp.series('vendor', 'js', 'sass', 'rtl'));

// Task names for each ConfigurationName
// see file Angle.csproj
gulp.task('Release', gulp.task('min'));
gulp.task('Debug', gulp.task('default'));


function handleError(err) {
    console.log(err.toString());
    this.emit('end');
}