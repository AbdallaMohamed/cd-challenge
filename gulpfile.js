var gulp = require('gulp'),
    concat = require('gulp-concat'),
    watch = require('gulp-watch'),
    templateCache = require('gulp-angular-templatecache'),
    sass = require('gulp-sass'),
    mainBowerFiles = require('main-bower-files'),
    uglify = require('gulp-uglify'),
    minifyHTML = require('gulp-minify-html'),
    ngAnnotate = require('gulp-ng-annotate'),
    minifyCss = require('gulp-minify-css'),
    angularFilesort = require('gulp-angular-filesort'),
    gulpFilter = require('gulp-filter'),
    wiredep = require('wiredep').stream,
    sourcemaps = require('gulp-sourcemaps'),
    browserSync = require('browser-sync').create();



// ----------------------------------------------------------------- //

// Compiling all the third-part libraries JS files, HTML Files and CSS/SASS files into main.js, partials.js and main.css

gulp.task('app:JS', function () {
    gulp.src([
        './app/src/**/*.js'
    ])
        .pipe(ngAnnotate())
        .pipe(angularFilesort())
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./app/cache'));
});


gulp.task('app:CSS', function () {
    return gulp.src(['./app/src/**/*.scss'])
        .pipe(sass())
        .pipe(minifyCss())
        .pipe(concat('main.css'))
        .pipe(gulp.dest('./app/cache'));
});



gulp.task('app:HTML', function () {
    return gulp.src('./app/src/**/*.html')
        .pipe(minifyHTML())
        .pipe(templateCache('partials.js', { module: 'ngChurchDesk', standalone: false }))
        .pipe(uglify())
        .pipe(gulp.dest('./app/cache'));
});

// ----------------------------------------------------------------- //

// Compiling all the third-part libraries JS files and CSS files into 3rdParty.js and 3rdParty.css

gulp.task('3rdParty:JS', function () {
    return gulp.src(mainBowerFiles())
        .pipe(gulpFilter('**/*.js'))
        .pipe(wiredep())
        .pipe(uglify())
        .pipe(concat('3rdParty.js'))
        .pipe(gulp.dest('./app/cache'));

});

gulp.task('3rdParty:CSS', function () {
    return gulp.src(mainBowerFiles())
        .pipe(wiredep())
        .pipe(gulpFilter('**/*.css'))
        .pipe(minifyCss())
        .pipe(concat('3rdParty.css'))
        .pipe(gulp.dest('./app/cache'));
});



// for development purposes
gulp.task('watch', function () {
    watch('./app/src/**/*.js', run('app:JS'));
    watch('./app/**/*.html', run('app:HTML'));
    watch(['./app/src/**/*.scss', './app/src/**/*.css'], run('app:CSS'));
    watch('./bower.json', run('3rdParty:JS'));
    watch('./bower.json', run('3rdParty:CSS'));
});


function run(taskName) {
    return function () {
        gulp.start(taskName);
    }
}


// for deployment

gulp.task('deployApp', [
    'app:JS',
    'app:HTML',
    'app:CSS',
    '3rdParty:JS',
    '3rdParty:CSS'
], function () {
    // final packaging
    // concatenate all JS files into 1 JS file and all CSS files into 1 CSS file
    gulp.src([
            './app/cache/3rdParty.js',
            './app/cache/main.js',
            './app/cache/partials.js',
        ])
        .pipe(concat('dist.js'))
        .pipe(gulp.dest('./app/release/'));

    gulp.src([
            './app/cache/main.css',
            './app/cache/3rdParty.css'
        ])
        .pipe(concat('dist.css'))
        .pipe(gulp.dest('./app/release/'));
});