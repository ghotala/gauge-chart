module.exports = function(grunt) {
	var configs = require('load-grunt-configs')(grunt);
	grunt.initConfig(configs);
	
	require('load-grunt-tasks')(grunt);	
	
	grunt.registerTask('default',['clean:dist','sass','cssmin','uglify','copy']);
}
