var gulp = require('gulp');
var babel = require('gulp-babel');
var plumber = require('gulp-plumber');

var path = './src/app.js';
var output = './client/dist';



gulp.task('babel', function () {
  return gulp.src(path)
    .pipe(plumber())
    .pipe(babel())
    .pipe(gulp.dest(output)) // 最適化した js ファイルを dist/js へ出力
});

gulp.task('watch', function () {
  gulp.watch(path, ['babel']);
});

gulp.task('default', ['babel','watch']);