const parcelBundler = require('parcel-bundler');
const fs = require('fs');
const path = require('path');
const through = require('through2');
const PluginError = require('plugin-error');

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
    const pid = process.pid.toString();

    let g_options = {};
    if(options.length > 0) {
        if(options.length > 1) {
            g_options = options[1];
        }
        options = options[0];
    }

    options.watch = (typeof(options.watch) == "undefined") ? false : options.watch;
    options.production = (typeof(options.production) == "undefined") ? !options.watch : options.production;
    const isTmp = options.outDir ? false : true;
    options.outDir = options.outDir ? options.outDir : ('.tmp-gulp-compile-' + pid);
    options.sourceMaps = (typeof(options.sourceMaps) == "undefined") ? false : options.sourceMaps;

    const source = g_options.source ? g_options.source : '';

    return through.obj(function (file, encoding, cb) {
        if (!!file.contents) {
            const error = new PluginError(PLUGIN_NAME, "File has already been processed");
            this.emit('error', error);
            cb(error, file);
            return;
        }

        // slashes on unix os
        // backslashes on windows
        let slashes = '/';

        if( file.path.lastIndexOf(slashes) === -1){
            slashes = '\\';
        }

        let out_flname;
        if(g_options.source && !isTmp) {
            out_flname = file.path.replace(source, options.outDir);
        } else {
            out_flname = options.outDir + slashes + file.path.substr(file.path.lastIndexOf(slashes) + 1);
        }

        let options_c = {}, outDir;
        Object.assign(options_c, options);
        outDir = file.path.substr(file.path.lastIndexOf(source));
        let position = outDir.lastIndexOf(slashes) - 1;
        position = outDir.lastIndexOf(slashes, position);
        if(position < 0) {
            outDir = options.outDir;
        } else {
            outDir = outDir.substr(position + 1);
            outDir = outDir.substr(0, outDir.lastIndexOf(slashes));
            outDir = options.outDir + slashes + outDir;
        }
        options_c.outDir = outDir;

        process.on('SIGINT', () => {
            if(isTmp) {
                removeDirectory(options.outDir);
            }
            process.exit();
        });

        const parcel = new parcelBundler(file.path, options_c);
        parcel.bundle().then(bundle => {
            if(parcel.error) {
                if(isTmp) {
                    removeDirectory(options.outDir);
                }
                const error = new PluginError(PLUGIN_NAME, "Build FAIL:" + file.path);
                this.emit('error', error);
                cb(error, file);
            }

            try {
                const readFile = (bundleName, finish = true) => {
                    const newFile = file.clone();
                    fs.readFile(bundleName, (err, data) => {
                        // when out file name isn't correct/readable/accessible
                        // data can be undefined
                        if(data === undefined){
                            var err = 'Unable to read to ' + bundleName;
                            throw err;
                        }
                        newFile.contents = data;
                        this.push(newFile);
                        if(options.production && isTmp) {
                            removeDirectory(options.outDir);
                        }
                        if (finish) cb();
                    });
                    newFile.stat = fs.lstatSync(bundleName);
                    newFile.basename = path.basename(bundleName);
                    newFile.extname = path.extname(bundleName);
                }
                readFile(bundle.name, !options.sourceMaps);
                if (options.sourceMaps) {
                    const mapBundle = bundle.getSiblingBundle('map');
                    readFile(mapBundle.name, true);
                }
            } catch (err) {
                if(isTmp) {
                    removeDirectory(options.outDir);
                }
                const error = new PluginError(PLUGIN_NAME, "Build FAIL:" + file.path);
                this.emit('error', error);
                cb(error, file);
            }
        }).catch((error) => {
            cb(error, file);
        });
    });
}


