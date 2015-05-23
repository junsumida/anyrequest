'use strict';

var gulp = require('gulp');
var ts   = require('gulp-typescript');

gulp.task('default', function(){
   var tsResult = gulp.src('lib/**/*.ts')
       .pipe(ts({
           noImplicitAny: true,
           out: 'output.js'
       }));
   return tsResult.js.pipe(gulp.dest('out'));
});

