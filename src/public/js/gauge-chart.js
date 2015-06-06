function GaugeChart(options) {
	
	// TODO: replace with object merger
	var _options = options;
	var _frameElements = {};
	
	function renderFrame(target) {
		_frameElements.svg = d3.select(target)
			.append('svg')
			.attr('class', 'gh-gauge-chart');
			
		_frameElements.g = _frameElements.svg
			.append('g')
			.attr('class', 'gh-gauge-chart-main-layer');
	}
	
	function render() {
		renderFrame(_options.target);
	}
	
	return {
		render: render
	}
};