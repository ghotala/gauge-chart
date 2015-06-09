function GaugeChart(options) {
	'use strict';
	
	options = options || {};
	
	var _options = {
		target: options.target || document.getElementsByTagName('body')[0],
		data: options.data || [{id: 1, value: 10}, {id: 2, value: 20}, {id: 3, value: 50}],		
		renderHalfCircle: options.renderHalfCircle || false,
		seriesThickness: options.seriesThickness || 9,
		seriesSeparation: options.seriesSeparation || 1,
		startAngle: options.startAngle || 0,
	};

	var getSeriesOuterRadius = function(d, i) {
		return _calculations.outerRadius - i * (_options.seriesThickness + _options.seriesSeparation);	
	};
	
	var getSeriesInnerRadius = function(d, i) {
		return getSeriesOuterRadius(d, i) - _options.seriesThickness;
	};		

	var getSeriesEndAngle = function(d) {
		var angleMultiplier = _options.renderHalfCircle ? 0.5 : 1;
		return (_options.startAngle + Math.PI * 2 * d.value / 100) * angleMultiplier;
	};
	
	var getBackgroundEndAngle = function() {
		return getSeriesEndAngle({value: 100});
	};
	
	var _calculations = {};
	var _frameElements = {};
	
	function renderFrame(target, _frameElements) {
		_frameElements.$svg = d3.select(target)
			.append('svg')
			.attr('class', 'gh-gauge-chart');
			
		_frameElements.$mainLayer = _frameElements.$svg
			.append('g')
			.attr('class', 'gh-gauge-chart-main-layer');			
	};
	
	function calculateDimensions(container, _calculations) {
		_calculations.outerSize = Math.max(container.clientWidth, container.clientHeight);
		_calculations.outerRadius = _calculations.outerSize / 2;
	};
	
	function renderArcs(data, layer, arcTypes) {
		for (var i = 0, length = arcTypes.length; i < length; i++) {		
			var arcType = arcTypes[i];
			
			var arcFunction = d3
				.svg
				.arc()
				.innerRadius(getSeriesInnerRadius)
				.outerRadius(getSeriesOuterRadius)
				.startAngle(_options.startAngle)
				.endAngle(arcType === 'series' ? getSeriesEndAngle : getBackgroundEndAngle);
				
			var arcs = layer
				.selectAll('path.' + arcType)
				.data(data, function(d) { return d.id; });

			arcs
				.exit()
				.remove();
				
			arcs
				.enter()
				.append('path');
				
			arcs			
				.attr('class', function(d, i) { return arcType + ' ' + arcType + '-' + (i + 1); })			
				.attr('d', arcFunction);		
		}
	};
	
	function render() {
		renderFrame(_options.target, _frameElements);
		calculateDimensions(_frameElements.$svg[0][0], _calculations);
		update();
	};
	
	function update() {
		renderArcs(_options.data, _frameElements.$mainLayer, ['background', 'series']);
	};
	
	render();
	
	return {
		update: update
	};
};