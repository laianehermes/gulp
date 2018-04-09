/*
    Gulpfile para algumas ações clássicas de otimização.
 */

var gulp                = require('gulp'),
    $                   = require('gulp-load-plugins')({rename: {'gulp-rev-delete-original':'revdel', 
                                                                 'gulp-if': 'if', 
                                                                 'gulp-html-replace': 'htmlReplace',
                                                                 'gulp-inline-source': 'inlinesource'}});

var projectName         = './',
    projectNew          = './version-client',
    input               = projectName + '/public/',
    output              = projectNew + '/public/',
    nameFileCss = '',
    nameFileJs = '',
    scriptsCss = [
        input + ''
    ],
    scriptsJs = [
        input + ''
    ];


/* Tasks base */
gulp.task('copy', ['clean'], function() {
    return gulp.src([projectName + '//**', 
            '!' + projectName + '/app/{config,config/**}', 
            '!' + projectName + '/app/{storage,storage/**}',
            '!' + projectName + '/{nbproject,nbproject/**}',
            '!' + projectName + '/{node_modules,node_modules/**}',
            '!' + projectName + '/{Scripts,Scripts/**}',
            '!' + projectName + '/*',
            ], {base: projectName})
        .pipe(gulp.dest(projectNew));
});

gulp.task('clean', function() {
    return gulp.src(projectNew, {read: false})
        .pipe($.clean({force: true}));
});

/* Imagens */
gulp.task('imagemin', function() {
    return gulp.src(projectName + '/public/img/**/*')
        .pipe($.imagemin({
            progressive: true,
            svgoPlugins: [
                {removeViewBox: false},
                {cleanupIDs: false}
            ]
        }))
        .pipe(gulp.dest(projectNew+'/public/img'));
});

/* Minificação */
gulp.task('minify-js', function() {
    return gulp.src(scriptsJs)
        .pipe($.uglify())
        .pipe($.concat('index.min.js'))
        .pipe($.rev())
        .pipe(gulp.dest(output + 'js'))
});

gulp.task('minify-css', function() {
    return gulp.src(scriptsCss)
        .pipe($.autoprefixer({browsers: ['last 30 versions']}))
        .pipe($.cssnano({safe: true}))
        .pipe($.concat('index.min.css'))
        .pipe($.rev())
        .pipe(gulp.dest(output + 'css'))
});

gulp.task('minify-html', function() {
    return gulp.src(projectName +'/app/views/**/*.php')
        .pipe($.htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(projectNew + '/app/views/'))
});

/* Concatenação */
gulp.task('useref', ['defCSSref', 'defJSref'], function () { 
    gulp.src(projectNew + '/app/views/shared/defaultAssetsCss.blade.php')
        .pipe($.htmlReplace({ 
            css: '<link type="text/css" rel="stylesheet" href="{{asset(\'css/' + nameFileCss + '\')}}" rel="preload" as="style" onload="this.rel=\'stylesheet\'" />' })) 
        .pipe($.inlinesource({rootpath: './public/'}))
        .pipe(gulp.dest(projectNew + '/app/views/shared/')) 

    gulp.src(projectNew + '/app/views/shared/defaultAssetsJs.blade.php')
        .pipe($.htmlReplace({ 
            js: '<script async type="text/javascript" src="{{asset(\'js/' + nameFileJs + '\')}}"></script>' })) 
        .pipe(gulp.dest(projectNew + '/app/views/shared/')) 
});

gulp.task('defCSSref', function () { 
    return gulp.src([output + '/css/index*.min.css']) 
        .pipe($.tap(function(file, t) { 
            nameFileCss = file.relative; 
        })); 
});  
        
gulp.task('defJSref', function () { 
    return gulp.src([output + '/js/index*.min.js']) 
        .pipe($.tap(function(file, t) { 
            nameFileJs = file.relative; 
        })); 
});  

/* Apagar arquivos desnecessários */
gulp.task('clean-files', function() {
    return gulp.src([
            projectNew + '/public/js/**/*.js',
            projectNew + '/public/js/**/*.js.map',
            '!' + projectNew + '/public/js/**/index-*.min.js',
            projectNew + '/public/css/**/*.css',
            projectNew + '/public/css/**/*.css.map',
            '!' + projectNew + '/public/css/**/index-*.min.css'])
        .pipe($.clean());
});

/* Revisão de arquivos */
gulp.task('rev', function(){
    return gulp.src([projectNew + '/public/**/*.{css,js,jpg,jpeg,png,svg}'])
        .pipe($.rev())
        .pipe($.revdel())
        .pipe(gulp.dest(projectNew + '/public/'))
        .pipe($.rev.manifest())
        .pipe(gulp.dest(projectNew + '/public/'))
})

gulp.task('revreplace', ['rev'], function(){
    return gulp.src([projectNew + '/**/*'])
    .pipe($.revReplace({
        manifest: gulp.src(projectNew + '/public/rev-manifest.json'),
        replaceInExtensions: ['.blade.php', '.js', '.css']
    }))
    .pipe(gulp.dest(projectNew + '/'));
});

/* Alias */
gulp.task('minify', ['imagemin', 'minify-js', 'minify-css', 'minify-html']);
gulp.task('build', $.sequence('minify', /* 'revreplace',  */'useref', 'clean-files'));
gulp.task('default', $.sequence('copy', 'build'));