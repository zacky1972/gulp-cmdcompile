gulp-parcel ![NPM version](https://img.shields.io/npm/v/gulp-parcel.svg?style=flat)
====================================================================================================================================================

By Susumu Yamazaki &lt;zacky1972@gmail.com&gt; 

gulp-parcel is a gulp plugin to exec parcel command.


Installation
--------------
### NPM
```bash
$ npm install --global parcel-bundler
$ npm install --save-dev gulp-parcel
```
### Yarn
```bash
$ yarn global add parcel-bundler
$ yarn add --dev gulp-parcel
```

Example
-------
```coffee
parcel = require 'gulp-parcel'

gulp.task 'build:js', () ->
  gulp.src 'source/javascripts/all.js', {read:false}
    .pipe parcel(['build'], [], {
      wd: './source'
    })
    .pipe gulp.dest('build/javascripts/')
```

Documentation
-------
### parcel([pre_arglist][, post_arglist][, options])

Calling parcel as follows:

```
parcel [pre_arglist] src [post_arglist]
```

For example, when pre_arglist = `['build']` and when post_arglist = `['--no-minify']`, parcel will be called as follows:

```
parcel build src --no-minify
```

#### pre_arglist (optional)

*Type: Array of String*

List of arguments that would passed to parcel before source file. You can specify a command here.

#### post_arglist (optional)

*Type: Array of String*

List of arguments that would passed to parcel after source file. You can specify any options for parcel here.

#### options (optional)

*Type: Object*

Currently one option is supported.

**wd:** *string*
working directory for parcel

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

