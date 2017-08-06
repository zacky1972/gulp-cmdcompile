const fs = require('fs');
const path = require('path');
const spawn = require('child_process').spawn;
const through = require('through2');

const gutil = require('gulp-util');

module.exports = function GulpCmdCompile(pgm, add_args = [], options = {})
{
    const PLUGIN_NAME = 'gulp-cmdcompile';
    const PluginError = gutil.PluginError;
    const pid = process.pid.toString();

    const print_build = options.print_build || false;
    const fn_trans = options.filename_transform || 'none';

    return through.obj(function (file, encoding, cb) {
        // file.path
        if (!!file.contents) {
            // file has already been loaded or processed
            //console.log(util.inspect(file.contents));
            this.emit('error', new PluginError(PLUGIN_NAME, "File has already been processed"));
            cb();
            return;
        }

        const out_flname = file.path + '.' + pid + '.gulpcompile';
        const out_arg = (options.output_opt || '-o') + ' ' + out_flname;

        let proc = spawn(pgm, add_args.concat([file.path, out_arg]), {shell: true});
        if (options.print_build) {
            proc.stdout.pipe(process.stdout);
            proc.stderr.pipe(process.stderr);
        }
        proc.on('error', (err) => this.emit('error', new PluginError(PLUGIN_NAME, err.toString())));
        proc.on('close', (code) => {
            if (code === 0) {
                // succeed
                fs.readFile(out_flname, (err, data) => {
                    file.contents = data;
                    fs.unlinkSync(out_flname);
                    this.push(file);
                    cb();
                });
                file.stat = fs.lstatSync(out_flname);

                if (fn_trans !== 'none') {
                    if (fn_trans === 'stripext') {
                        let fpath = path.parse(file.path);
                        file.path = path.join(fpath.root, fpath.dir, fpath.name);
                    } else if (typeof fn_trans === 'function') {
                        let fpath = path.parse(file.path);
                        file.path = path.join(fpath.root, fpath.dir, fn_trans(fpath.base));
                    } else {
                        this.emit('error', new PluginError(PLUGIN_NAME, "invalid filename_transform option, omit."));
                    }
                }
                
            } else {
                // fail
                this.emit('error', new PluginError(PLUGIN_NAME, "Build FAIL: %s", file.path));
                cb();
            }
        });
        
    });
}


