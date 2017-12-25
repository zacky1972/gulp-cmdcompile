const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;
const through = require('through2');

const gutil = require('gulp-util');

function removeDirectory(dir)
{
    try {
        var files = fs.readdirSync(dir);
        for (var file in files) {
            fs.unlinkSync(dir + '/' + files[file])
        }
        fs.rmdirSync(dir);
    } catch (err) {
        if(err.code === 'ENOENT') {
            return false;
        }
    }
}

module.exports = function GulpParcel(...extra_args)
{
    const PLUGIN_NAME = 'gulp-parcel';
    const PluginError = gutil.PluginError;
    const pid = process.pid.toString();

    let pre_args, post_args, options = {};
    if (extra_args.length > 0) {
        const last_e = extra_args[extra_args.length-1];
        if (typeof last_e === 'object' && !Array.isArray(last_e)) {
            options = extra_args[extra_args.length-1];
            extra_args = extra_args.slice(0, -1)
        }

        [pre_args, post_args] = extra_args;
    }

    pre_args = pre_args || [];
    post_args = post_args || [];

    const wd = options.wd || '.';

    return through.obj(function (file, encoding, cb) {
        // file.path
        if (!!file.contents) {
            // file has already been loaded or processed
            //console.log(util.inspect(file.contents));
            this.emit('error', new PluginError(PLUGIN_NAME, "File has already been processed"));
            cb();
            return;
        }

        const out_dir = wd + '/.tmp-gulp-compile-' + pid;
        const out_flname = out_dir + '/' + file.path.substring(file.path.lastIndexOf('/')+1, file.path.length);

        let proc = spawn('parcel', pre_args.concat([file.path], post_args, '--out-dir .tmp-gulp-compile-' + pid), {shell: true, cwd: wd});
        proc.stdout.pipe(process.stdout);
        proc.stderr.pipe(process.stderr);
        proc.on('error', (err) => this.emit('error', new PluginError(PLUGIN_NAME, err.toString())));
        proc.on('close', (code) => {
            if (code === 0) {
                // succeed
                fs.readFile(out_flname, (err, data) => {
                    file.contents = data;
                    fs.unlinkSync(out_flname);
                    this.push(file);
                    removeDirectory(out_dir);
                    cb();
                });
                file.stat = fs.lstatSync(out_flname);
            } else {
                // fail
                removeDirectory(out_dir);
                this.emit('error', new PluginError(PLUGIN_NAME, "Build FAIL: " + file.path));
                cb();
            }
        });
        
    });
}


