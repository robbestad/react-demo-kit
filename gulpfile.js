var gulp = require('gulp');
var webserver = require('gulp-webserver');
var concat = require('gulp-concat');
var php2html = require("gulp-php2html");
var scss = require('gulp-sass');
var less = require('gulp-less');
var uglify = require('gulp-uglify');
var prettify = require('gulp-prettify');
var cssmin = require('gulp-cssmin');
var autoprefixer = require('gulp-autoprefixer');
var imagemin = require('gulp-imagemin');
var notify = require("gulp-notify");
var pngcrush = require('imagemin-pngcrush');
var react = require('gulp-react');
var git = require('gulp-git');
var shell = require('gulp-shell');

var paths = {
    scripts: 'src/js/**/*',
    jslibs: [
        'bower_components/jquery/dist/jquery.min.js',
        'bower_components/react/react.min.js',
        'bower_components/bootstrap/js/**/*'
    ],
    images: 'src/img/**/*',
    jsx: 'src/jsx/**/*',
    html: 'src/**/*.html',
    php: 'src/*.php',
    phpscripts: 'src/**/*.php',
    less: 'src/bootstrap/less/bootstrap.less',
    fonts: [
      'src/fonts/**/*', 
      'bower_components/font-awesome/fonts/**/*', 
      'bower_components/bootstrap/fonts/**/*'
    ],
    scss: ['bower_components/font-awesome/scss/font-awesome.scss',
        'src/scss/main.scss'
    ]
};

gulp.task('jsx', function () {
    return gulp.src(paths.jsx)
        .pipe(react())
        .pipe(gulp.dest('src/js'));
});



gulp.task('phpscripts', function () {
    return gulp.src(paths.phpscripts)
        .pipe(gulp.dest('dist'))
        .pipe(gulp.dest('build'));
});

gulp.task('php2html', function () {
    return gulp.src(paths.php)
        .pipe(php2html())
        .pipe(prettify())
        .pipe(gulp.dest('dist'));
});

gulp.task('fonts', function () {
    return gulp.src(paths.fonts)
        .pipe(gulp.dest('dist/fonts'))
        .pipe(gulp.dest('build/fonts'));
});

gulp.task('sass', function () {
    return gulp.src(paths.scss)
        .pipe(scss())
        .pipe(autoprefixer())
        .pipe(cssmin())
        .pipe(gulp.dest('src/css'));
});

gulp.task('less', function () {
    return gulp.src(paths.less)
        .pipe(less())
        .pipe(autoprefixer())
        .pipe(cssmin())
        .pipe(gulp.dest('src/css'));
});

gulp.task('css', ['less', 'sass'], function () {
    return gulp.src([
          'src/css/bootstrap.css', 
          'src/css/font-awesome.css',
          'src/css/main.css'
    ])
        .pipe(concat('style.min.css'))
        .pipe(gulp.dest('dist/css'))
        .pipe(gulp.dest('build/css'));
});


// Render all the JavaScript files
gulp.task('javascript', ['jsx'], function () {
    return gulp.src(paths.scripts)
        .pipe(uglify({'mangle': false}))
        .pipe(concat('scripts.min.js'))
        .pipe(gulp.dest('dist/js'))
        .pipe(gulp.dest('build/js'));
});

// Copy all static libraries
gulp.task('jslibs', function () {
    return gulp.src(paths.jslibs)
        .pipe(concat('libs.min.js'))
        .pipe(gulp.dest('dist/js'))
        .pipe(gulp.dest('build/js'));
});

// Run git add
// src is the file(s) to add (or ./*)
gulp.task('git-add', function(){
    return gulp.src('./src/*')
        .pipe(git.add());
});

// Run git commit
// src are the files to commit (or ./*)
gulp.task('git-commit', ['git-add'], function(){
    return gulp.src('.')
        .pipe(git.commit('auto-commit'));
});

// Copy all static images
gulp.task('images', function () {
    return gulp.src(paths.images)
        // Pass in options to the task
        .pipe(imagemin({
            optimizationLevel: 5,
            progressive: true,
            svgoPlugins: [
                {removeViewBox: false}
            ],
            use: [pngcrush()]
        }))
        .pipe(gulp.dest('dist/img'))
        .pipe(gulp.dest('build/img'));
});


gulp.task('heroku', shell.task([
    'git add .',
    'git commit -am"autocommit"',
    'git push',
    'git subtree push --prefix dist heroku master'
]));

// Execute the built-in webserver
gulp.task('webserver', function () {
    gulp.src('dist')
        .pipe(webserver({
            livereload: true,
            path: 'dist',
            port: '8085',
            directoryListing: false,
            open: true
        }));
});

// Rerun the task when a file changes
gulp.task('watch', function () {
    gulp.watch(paths.scripts, ['javascript']);
    gulp.watch(paths.jsx, ['javascript']);
    gulp.watch(paths.scss, ['css']);
    gulp.watch(paths.html, ['html']);
    gulp.watch(paths.php, ['php2html']);
    gulp.watch(paths.phpscripts, ['phpscripts']);
    gulp.watch(paths.images, ['images']);
});

// gulp main tasks
gulp.task('default', ['css','javascript','php2html','images','jslibs','phpscripts']);
gulp.task('serve', ['watch', 'php2html', 'css', 'fonts', 'javascript', 'images', 'jslibs', 'jsx', 'phpscripts', 'webserver']);
gulp.task('git-deploy', ['php2html', 'css', 'fonts', 'javascript', 'images', 'jslibs', 'jsx', 'phpscripts', 'heroku']);
