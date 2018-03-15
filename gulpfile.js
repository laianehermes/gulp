//#region requires
var projectName         = 'projeto',
    gulp                = require('gulp'),
    imagemin            = require('gulp-imagemin'),
    clean               = require('gulp-clean'),
    concat              = require('gulp-concat'),
    htmlReplace         = require('gulp-html-replace'),
    uglify              = require('gulp-uglify'),
    cssmin              = require('gulp-cssmin'),
    browserSync         = require('browser-sync').create(),
    jshint              = require('gulp-jshint'),
    jshintStylish       = require('jshint-stylish'),
    cssLint             = require('gulp-csslint'),
    autoprefixer        = require('gulp-autoprefixer'),
    less                = require('gulp-less'),
    tap                 = require('gulp-tap');
//#endregion

gulp.task('default', ['copy'], function(){
    gulp.start(['build-img', 'clean-files']);
});

//#region duplica-pasta
gulp.task('copy', ['clean'], function(){
    return gulp.src([projectName + '//**', 
        '!' + projectName + '/app/{config,config/**}', 
        '!' + projectName + '/app/{storage,storage/**}',
        '!' + projectName + '/{nbproject,nbproject/**}',
        '!' + projectName + '/{Scripts,Scripts/**}'
        ])
        .pipe(gulp.dest('version-client'));
});

gulp.task('clean', function(){
    return gulp.src('version-client')
        .pipe(clean());
});
//#endregion

//#region files
var input  = projectName + '/public/',
    output = 'version-client/public/',
    nameFileCss = '',
    nameFileJs = '';

var scriptsCss = [
    input + 'css/bootstrap.min.css',
    input + 'css/bootstrap-datetimepicker.min.css',
    input + 'css/bootstrap-theme.min.css',
    input + 'css/style.css',
    input + 'assets/font-awesome-4.7.0/css/font-awesome.min.css',
    input + 'assets/jquery-ui-1.12.1/jquery-ui.css',
    input + 'css/multiple-select.css'
];

var scriptsJs = [
    input + 'js/jquery-3.2.1.js',
    input + 'js/bootstrap.min.js',
    input + 'js/moment.min.js',
    input + 'assets/highcharts/highcharts.src.js',
    input + 'js/knockout-3.4.2.min.js',
    input + 'js/transition.js',
    input + 'js/collapse.js',
    input + 'js/bootstrap-datetimepicker.min.js',
    input + 'js/knockout.validation.min.js',
    input + 'assets/knockout.mapping/build/output/knockout.mapping-latest.js',
    input + 'js/progressbar.min.js',
    input + 'js/system/systemComponents.js',
    input + 'assets/jquery-ui-1.12.1/jquery-ui.min.js',
    input + 'assets/knockout-jqAutocomplete/build/knockout-jqAutocomplete.js',
    input + 'assets/Knockout.LazyLoad-master/ko.lazyload.js',
    input + 'js/multiple-select.js'
];
//#endregion

//#region tasks
gulp.task('build-img', function(){
    return gulp.src('version-client/public/img/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('version-client/public/img'));    
});

gulp.task('clean-files', ['build-html'], function() {
    return gulp.src([
        'version-client/public/js/**/*.js',
        'version-client/public/js/**/*.js.map',
        '!version-client/public/js/**/index-*.min.js',
        'version-client/public/css/**/*.css',
        'version-client/public/css/**/*.css.map',
        '!version-client/public/css/**/index-*.min.css',
        ])
        .pipe(clean());
});

gulp.task('build-html', ['build-css', 'build-js'], function(){
    return gulp.src(['version-client/public/css/index-*.min.css',
                     'version-client/public/js/index-*.min.js'])
        .pipe(tap(function(file, t) {
            var extencao = new RegExp(/\.min\.css|\.min\.js/g).exec(file.relative)[0];
            
            if(extencao == '.min.css'){
                nameFileCss = file.relative;
            }else if(extencao == '.min.js'){
                nameFileJs = file.relative;
            }
            
            gulp.src('version-client/app/views/shared/**/*.blade.php')
                .pipe(htmlReplace({
                    css: '<link type="text/css" rel="stylesheet" href="{{asset(\'css/' + nameFileCss + '\')}}" />',
                    js: '<script type="text/javascript" src="{{asset(\'js/' + nameFileJs + '\')}}"></script>'
                }))
                .pipe(gulp.dest('version-client/app/views/shared'));
            
        }));
});

gulp.task('build-css', function() {
    var nameCss = 'index-' + textoAleatorio(10) + '.min.css';
    
    return gulp.src(scriptsCss)
        .pipe(concat(nameCss))
        .pipe(cssmin())
        .pipe(autoprefixer())
        .pipe(gulp.dest(output + 'css'));
});

gulp.task('build-js', function() {
    var nameJs = 'index-' + textoAleatorio(10) + '.min.js';

    return gulp.src(scriptsJs)
        .pipe(concat(nameJs))
        .pipe(uglify())
        .pipe(gulp.dest(output + 'js'));
});
//#endregion

gulp.task('server', function(){
    gulp.task('server', function() {
        browserSync.init({
            proxy: 'localhost:8000'
        });
    });

    gulp.watch(projectName + '/public/js/*.js').on('change', function(event){
        gulp.src(event.path)
            .pipe(jshint())
            .pipe(jshint.reporter(jshintStylish));
    });

    gulp.watch(projectName + '/public/css/*.css').on('change', function(event){
        gulp.src(event.path)
            .pipe(cssLint())
            .pipe(cssLint.reporter());
    });

    gulp.watch(projectName + '/public/less/**/*.less').on('change', function(event) {
        var stream = gulp.src(event.path)
            .pipe(less().on('error', function(erro) {
            console.log('LESS, erro compilação: ' + erro.filename);
            console.log(erro.message);
            }))
            .pipe(gulp.dest(projectName + '/public/css'));
    });
    gulp.watch(projectName + '/**/*').on('change', browserSync.reload);
});

function textoAleatorio(tamanho)
{
    var letras = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
    var aleatorio = '';
    for (var i = 0; i < tamanho; i++) {
        var rnum = Math.floor(Math.random() * letras.length);
        aleatorio += letras.substring(rnum, rnum + 1);
    }
    return aleatorio;
}