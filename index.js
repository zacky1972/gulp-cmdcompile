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

    const source = g_options.source ? g_options.source : '';

    return through.obj(function (file, encoding, cb) {
        if (!!file.contents) {
            this.emit('error', new PluginError(PLUGIN_NAME, "File has already been processed"));
            cb(null, file);
            return;
        }

        // slashes on unix os
        // backslashes on windows
		let slashes = '/';

		if( file.path.lastIndexOf(slashes) === -1){
			slashes = '\\';
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
            if(parcel.errored) {
                if(isTmp) {
                    removeDirectory(options.outDir);
                }
                this.emit('error', new PluginError(PLUGIN_NAME, "Build FAIL:" + file.path));
                cb(null, file);
            }

            // use the filename parcel assigned which will exist
            const out_flname = bundle.name

            try {
                fs.readFile(out_flname, (err, data) => {
                    // when out file name isn't correct/readable/accessible
                    // data can be undefined
					if(data === undefined){
						var err = 'Unable to read to ' + out_flname;
						throw err;
					}
                    file.contents = data;
                    this.push(file);
                    if(options.production && isTmp) {
                        removeDirectory(options.outDir);
                    }
                    cb(null, file);
                });
                file.stat = fs.lstatSync(out_flname);
            } catch (err) {
                if(isTmp) {
                    removeDirectory(options.outDir);
                }
                this.emit('error', new PluginError(PLUGIN_NAME, "Build FAIL:" + file.path));
                cb(null, file);
            }
        });
    });
}


