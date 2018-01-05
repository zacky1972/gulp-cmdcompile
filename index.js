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

    options.watch = {
        value: 'watch' in options ? options.watch : false
    };
    options.production = !options.watch || true;
    options.outDir = 'outDir' in options ? options.outDir : ('.tmp-gulp-compile-' + pid);

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
        
        let out_flname = options.outDir + slashes + file.path.substr(file.path.lastIndexOf(slashes) + 1);

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
			
			// In case dealing with Pug files
			// at this stage Pub files should've been transformed to html
			if( out_flname.substr(out_flname.lastIndexOf('.') + 1).trim().toLowerCase() === 'pug' ){
				out_flname = out_flname.substr(0,out_flname.lastIndexOf('.') + 1) + 'html';
			}
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


