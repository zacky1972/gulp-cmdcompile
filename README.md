gulp-parcel ![NPM version](https://img.shields.io/npm/v/gulp-parcel.svg?style=flat)
====================================================================================================================================================

By Susumu Yamazaki &lt;zacky1972@gmail.com&gt;

gulp-parcel is a gulp plugin to exec parcel command.


Installation
--------------
### NPM
```bash
$ npm install --global parcel-bundler
```
### Yarn
```bash
$ yarn global add parcel-bundler
```

Example
-------
```coffee
gulp = require 'gulp'
parcel = require 'gulp-parcel'

gulp.task 'build:js', () ->
  gulp.src 'source/javascripts/all.js', {read:false}
    .pipe parcel()
    .pipe gulp.dest('build/javascripts/')
```

```coffee
gulp = require 'gulp'
parcel = require 'gulp-parcel'

gulp.task 'build', () ->
  gulp.src 'build/**/*.html', {read:false}
    .pipe parcel({outDir: 'dist', publicURL: './'}, {source: 'build'})
    .pipe gulp.dest('dist')
```

Documentation
-------
### parcel([options[, g_options]])

call parcel `gulp.src` with options and g_options

#### options (optional)

*Type: Object*

Currently the following options are supported:

* **watch:** *true or false* (default: false)
* **outDir:** *string* (default: temporary directory)
* **cache:** *true or false* (default: true)
* **cacheDir:** *true or false* (default: '.cache')
* **killWorkers:** *true or false* (default: true)
* **minify:** *true or false* (default: !watch)
* **sourceMaps:** *true or false* (default: false)
* **hmr:** *true or false* (default: watch)
* **logLevel:** *number* (default: 3)
* **publicURL:** *string*

#### g_options (optional)

*Type: Object*

Currently one option are supported:

* **source:** *string*


MIT License
----------------------------
Copyright (c) 2017 Susumu Yamazaki &lt;zacky1972@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the &quot;Software&quot;), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

