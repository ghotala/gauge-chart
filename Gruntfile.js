module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		sass: {
			src: {
				files: {
					'src/public/css/gauge-chart.css' : 'src/public/scss/gauge-chart.scss',
					'src/public/css/example-page.css' : 'src/public/scss/example-page.scss'					
				}
			},		
			tmp: {
				files: {
					'tmp/public/css/gauge-chart.css' : 'src/public/scss/gauge-chart.scss',
					'tmp/public/css/example-page.css' : 'src/public/scss/example-page.scss'					
				}
			}
		},
	});
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.registerTask('default',['sass']);
}