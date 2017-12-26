const parcelBundler = require('parcel-bundler');
const fs = require('fs');
const path = require('path');
const through = require('through2');

const gutil = require('gulp-util');

function removeDirectory(dir)
{
    try {
        if(fs.statSync(dir).isDirectory()) {
           var files = fs.readdirSync(dir);
            for (var file in files) {
                removeDirectory(dir + '/' + files[file])
            }
            fs.rmdirSync(dir);
        } else {
            fs.unlink(dir, (err) => {});
        }
    } catch (err) {
        if(err.code === 'ENOENT') {
            return false;
        }
    }
}

module.exports = function GulpParcel(...options)
{
    const PLUGIN_NAME = 'gulp-parcel';
    const PluginError = gutil.PluginError;
    const pid = process.pid.toString();

    options.watch = {
        value: 'watch' in options ? options.watch : false
    };
    options.production = !options.watch || true;

    options.outDir = '.tmp-gulp-compile-' + pid;

    return through.obj(function (file, encoding, cb) {
        if (!!file.contents) {
            this.emit('error', new PluginError(PLUGIN_NAME, "File has already been processed"));
            cb(null, file);
            return;
        }

        const out_flname = options.outDir + '/' + file.path.substring(file.path.lastIndexOf('/') + 1, file.path.length);

        process.on('SIGINT', () => {
            removeDirectory(options.outDir);
            process.exit();
        });

        const parcel = new parcelBundler(file.path, options);
        parcel.bundle().then(bundle => {
            if(parcel.errored) {
                removeDirectory(options.outDir);
                this.emit('error', new PluginError(PLUGIN_NAME, "Build FAIL:" + file.path));
                cb(null, file);
            }
            try {
                fs.readFile(out_flname, (err, data) => {
                    file.contents = data;
                    this.push(file);
                    if(options.production) {
                        removeDirectory(options.outDir);                
                    }
                    cb(null, file);
                });
                file.stat = fs.lstatSync(out_flname);
            } catch (err) {
                removeDirectory(options.outDir);
                this.emit('error', new PluginError(PLUGIN_NAME, "Build FAIL:" + file.path));
                cb(null, file);
            }
        });
    });
}


