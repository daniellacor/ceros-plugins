module.exports = function(grunt) {

    var fs = require('fs');
    var _ = require('lodash');

    var awsConfig = {
        accessKey: false,
        secretKey: false,
        region: false,
        s3Bucket: false
    };

    // Breaks out the keys and also gives us a nice reference of what
    // needs to be in here without being able to be changed.
    var awsConfigKeys = _.keys(awsConfig);

    // Take inputs for the awsConfig, prefixed with 'aws.'.
    // For example accessKey can be inputted with '--aws.accessKey=accessKey'
    _.each(awsConfigKeys, function(awsConfigKey){
        var optionKey = 'aws.' + awsConfigKey;
        var optionValue = grunt.option(optionKey);
        if (optionValue) {
            // Use the original key to update it.
            awsConfig[awsConfigKey] = optionValue;
        }
    });


    grunt.file.move = function(from,to) {
        grunt.log.writeln('Moved '+from.cyan+' to '+to.cyan);
        grunt.file.copy(from,to);
        grunt.file.delete(from);
    };

    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-version');
    grunt.loadNpmTasks('grunt-aws');
    grunt.loadNpmTasks('grunt-fastly');
    grunt.loadNpmTasks('grunt-git');

    grunt.initConfig({
        aws: awsConfig,
        version: {
            options: {
                pkg: grunt.file.readJSON('package.json')
            },
            eloqua: {
                options: {
                    prefix: '@version *'
                },
                src: ['dist/plugins/**/*.js']
            }
        },
        watch: {
            js : {
                files: ['./src/*.js'],
                tasks: ['compileJS'],
                options: {
                    spawn: false,
                    debounceDelay: 250,
                    interrupt: true
                }
            }
        },
        requirejs: {
            compile_eloqua_plugin: {
                options: {
                    baseUrl: './src',
                    include: ['eloqua'],
                    optimize: 'none',
                    out: './dist/plugins/eloqua/main.js',
                    skipSemiColonInsertion: true
                }

            }
        },
        compress: {
            release: {
                options: {
                    mode: 'gzip'
                },
                files: [
                    {src: ['dist/plugins/eloqua/main.js'], dest: 'dist/plugins/eloqua/main.js.gz', filter: 'isFile'}
                ]
            }
        },
        md5: {
            release: {
                src:['dist/plugins/**/*.*']
            }
        },
        s3: {
            releaseNonGzip: {
                options: {
                    accessKeyId: "<%= aws.accessKey %>",
                    secretAccessKey: "<%= aws.secretKey %>",
                    region: "<%= aws.region %>",
                    bucket: "<%= aws.s3Bucket %>",
                    access: 'public-read',
                    // This flag auto gzips all files it uploads,
                    // since we handle it ourselves we disable it.
                    gzip: false,
                    cache: false, // Always upload, even if it's the same etag
                    headers: {
                        CacheControl: 86400 * 30 // 1 month
                    }
                },
                cwd: "./dist/plugins/",
                src: ["**/*.*", "!**.js.gz"]
            },
            // Gzip files need to have the content encoding header.
            releaseGzip: {
                options: {
                    accessKeyId: "<%= aws.accessKey %>",
                    secretAccessKey: "<%= aws.secretKey %>",
                    region: "<%= aws.region %>",
                    bucket: "<%= aws.s3Bucket %>",
                    access: 'public-read',
                    // This flag auto gzips all files it uploads,
                    // since we handle it ourselves we disable it.
                    gzip: false,
                    cache: false, // Always upload, even if it's the same etag
                    headers: {
                        ContentEncoding: 'gzip',
                        CacheControl: 86400 * 30 // 1 month
                    }
                },
                cwd: "./dist/plugins/",
                src: ['**/*.js.gz']
            }
        },
        gittag: {
            tagRelease: {
                options: {
                    cwd: './',
                    verbose: true,
                    tag: String(grunt.file.readJSON('package.json').version)
                }
            }
        },
        gitpush: {
            pushReleaseTag: {
                options: {
                    cwd: './',
                    verbose: true,
                    tags: true
                }
            }
        },
        fastly: {
            options: {
                key: grunt.option('fastly.key')
            },
            plugins: {
                options: {
                    urls: [],
                    host: grunt.option('fastly.host')
                }
            }
        }

    });

    /**
     * This is kind of a hack, because we want to dynamically invalidate fastly based on the files we
     * have created in a directory, we have to set them AFTER they are created.  This updates the config
     * in order to invalidate the correct files.
     */
    grunt.registerTask('updateFastlyOptions', 'Update the Fastly Inputs', function() {
        var fastly = grunt.config.get('fastly');

        /**
         * This reads all the files we are releasing (both major and specific versions)
         * We technically only need to invalidate the major version since there was a file there before
         * but since this is easy to do and may help if someone ever mistags, we invalidate all.
         */
        fastly.plugins.options.urls = fs.readdirSync('./dist/').map(function(value, key, array) {
            return '/' + value;
        });

        grunt.log.writeln('Purging cache for host ' + fastly.plugins.options.host);
        grunt.log.writeln('Purging cache for urls ' + fastly.plugins.options.urls);

        // Set the config back.
        grunt.config.set('fastly', fastly);
    });

    grunt.registerTask('clean','Cleans build artifacts',function(){
        grunt.file.delete('dist/');
        grunt.log.writeln('Removed '+'dist/'.green);
    });

    grunt.registerTask('rename','Renames build artifacts to include version number',function(){
        // If pushing to develop or a feature branch, codeship sends in the branch name so that builds can
        // be pushed to S3 with the branch name included to assist multi-branch development
        var branchFileModifier = '';
        if(grunt.option('branch')) {
            branchFileModifier = '-' + grunt.option('branch').replace('/', '-');
        }

        var version = String(grunt.file.readJSON('package.json').version);
        var versionArray = version.split('.');
        if (versionArray.length < 3) {
            grunt.fail.warn('Version should be specified in Major.Minor.Patch (1.0.0)');
        }
        var majorVersion = versionArray[0];

        var plugins = ['eloqua'];
        _.each(plugins, function(type){
            /**
             * Output files for specific Version (when version = 1.3.0)
             * These should never overwrite files in our s3 bucket, always should be unique.
             * Code changes require update to version.
             *
             * plugins/eloqua/main-1.0.0.js
             * plugins/eloqua/main-1.0.0.gz.js
             */
            grunt.file.move('dist/plugins/' + type + '/main.js', 'dist/plugins/' + type + '/main' + branchFileModifier + '-' + version + '.js');
            grunt.file.move('dist/plugins/' + type + '/main.js.gz', 'dist/plugins/' + type + '/main' + branchFileModifier + '-' + version + '.js.gz');

            /**
             * Output files for Major Version (when version = 1.3.0 -- majorVersion = 1)
             * These replace the existing major release version.  The concept is that customers
             * can use v1 and we can update it with non-breaking changes without them having to update their
             * source.
             *
             * plugins/eloqua/main-v1.js
             * plugins/eloqua/main-v1.gz.js
             */
            grunt.file.copy('dist/plugins/' + type + '/main' + branchFileModifier + '-' + version + '.js', 'dist/plugins/' + type + '/main' + branchFileModifier + '-v' + majorVersion + '.js');
            grunt.file.copy('dist/plugins/' + type + '/main' + branchFileModifier + '-' + version + '.js.gz', 'dist/plugins/' + type + '/main' + branchFileModifier + '-v' + majorVersion + '.js.gz');

        });
    });


    grunt.registerMultiTask('md5', 'Generates MD5 for build artifacts', function() {
        _.each(this.files, function(file) {
            if (typeof file.src === 'undefined') {
                grunt.fail.warn('Files object doesn\'t exist');
            }

            var srcFiles = grunt.file.expand(file.src);

            _.each(srcFiles, function(srcFile) {
                try {
                    var srcCode = grunt.file.read(srcFile);
                    var md5 = require('crypto').createHash('md5').update(srcCode).digest('hex');
                    grunt.log.writeln(srcFile+' '+md5.green);
                } catch(err) {
                    grunt.log.error(err);
                    grunt.fail.warn('Fail to generate an MD5 file name');
                }
            });
        });
    });

    /**
     * Checks to make sure the AWS Credentials have been passed in.
     * This allows us to check right away to make sure we can complete this task.
     */
    grunt.registerTask('awsInputCheck', 'Checks to make sure we have the correct AWS Inputs', function() {
        var aws = grunt.config.get('aws');

        var hasAllKeys = true;
        // Loop through the array of values here and make sure they are all set.
        _.each(awsConfigKeys, function(key) {

            if (!awsConfig[key]) {
                grunt.log.error('Missing input [' + key + '] Please use --aws.' + key + '=<value>');
                hasAllKeys = false;
            }
        });

        if (!hasAllKeys) {
            grunt.fail.warn('Missing required AWS Inputs');
        }

    });

    grunt.registerTask('compileJS',
        "Resolves all requirejs dependencies and compiles javascript into file for the embedded and standalone SDKs",
        [
            'requirejs',
            'version'
        ]
    );

    grunt.registerTask('dev', ['watch:js']);

    grunt.registerTask('default',['test']);

    grunt.registerTask('test',[
        'clean',
        'compileJS'
    ]);

    // Should only be run via CodeShip.
    // Does everything the regular 'release' task does EXCEPT tagging the repo
    // Codeship should be setup to push this to a dev bucket
    grunt.registerTask('dev-release',[
        // Make sure we have the s3 credentials needed to release this.
        'awsInputCheck',
        // Remove working files and created files.
        'clean',
        // Version and create the files in the /dist folder
        'compileJS',
        'compress',
        'rename',
        // Show the md5 of the files
        'md5',
        // Push to S3
        's3:releaseNonGzip',
        's3:releaseGzip',
        // Invalidate the Files on Fastly
        'updateFastlyOptions',
        'fastly'
    ]);

    // Should only be run via CodeShip.
    grunt.registerTask('release',[
        // Make sure we have the s3 credentials needed to release this.
        'awsInputCheck',
        // Remove working files and created files.
        'clean',
        // Version and create the files in the /dist folder
        'compileJS',
        'compress',
        'rename',
        // Show the md5 of the files
        'md5',
        // Create the tag from the version.  Will fail if already exists.
        'gittag:tagRelease',
        // Push the tag to github
        'gitpush:pushReleaseTag',
        // Push to S3
        's3:releaseNonGzip',
        's3:releaseGzip',
        // Invalidate the Files on Fastly
        'updateFastlyOptions',
        'fastly'
    ]);


};
