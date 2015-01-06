module.exports = function(grunt) {

	grunt.initConfig({

		// JS TASKS ================================================================
		// check all js files for errors
		jshint: {
			options: {
			smarttabs: true
		},
			all: ['public/js/**/*.js'] 
		},

		// take all the js files and minify them into app.min.js
		uglify: {
			options: {
				mangle: false
			},
			build: {
				files: {
					'public/dist/js/app.min.js': ['public/js/**/*.js', 'public/js/*.js']
				}
			}
		},

		// CSS TASKS ===============================================================
		// process the less file to style.css
		less: {
			build: {
				files: {
					'public/dist/css/style.css': 'public/css/style.less'
				}
			}
		},

		// take the processed style.css file and minify
		cssmin: {
			build: {
				files: {
					'public/dist/css/style.min.css': 'public/dist/css/style.css'
				}
			}
		},

		// COOL TASKS ==============================================================
		// watch css and js files and process the above tasks
		watch: {
			css: {
				files: ['public/css/**/*.less'],
				tasks: ['less', 'cssmin']
			},
			js: {
				files: ['public/js/**/*.js', 'public/js/*.js'],
				tasks: ['jshint', 'uglify']
			}
		},

		// watch our node server for changes
		nodemon: {
			dev: {
				script: 'server.js'
			}
		},

		// run watch and nodemon at the same time
		concurrent: {
			options: {
				logConcurrentOutput: true
			},
			tasks: ['nodemon', 'watch']
		}   

	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-nodemon');
	grunt.loadNpmTasks('grunt-concurrent');

	grunt.registerTask('default', ['less', 'cssmin', 'jshint', 'uglify', 'concurrent']);

};