function GaugeChart(options) {
	
	options = options || {};
	
	// TODO: replace with object merger
	var _options = {
		target: options.target || document.getElementsByTagName('body')[0],
		data: options.data || [{id: 1, value: 10}, {id: 2, value: 20}, {id: 3, value: 50}],		
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
		return _options.startAngle + Math.PI * 2 * d.value / 100;
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
		_calculations.outerSize = Math.min(container.clientWidth, container.clientHeight);
		_calculations.outerRadius = _calculations.outerSize / 2;
	};
	
	function renderBackground(data, layer) {
		var backgroudArc = d3
			.svg
			.arc()
			.innerRadius(getSeriesInnerRadius)
			.outerRadius(getSeriesOuterRadius)
			.startAngle(0)
			.endAngle(Math.PI * 2);
		
		var bg = layer
			.selectAll('path.background')
			.data(data, function(d) { return d.id; });

		bg
			.exit()
			.remove();
			
		bg
			.enter()
			.append('path');
			
		bg			
			.attr('class', function(d, i) { return 'background background-' + (i + 1); })			
			.attr('d', backgroudArc);			
	};
	
	function renderSeries(data, layer) {
		var seriesArc = d3
			.svg
			.arc()
			.innerRadius(getSeriesInnerRadius)
			.outerRadius(getSeriesOuterRadius)
			.startAngle(_options.startAngle)
			.endAngle(getSeriesEndAngle);
		
		var s = layer
			.selectAll('path.series')
			.data(data, function(d) { return d.id; });

		s
			.exit()
			.remove();
			
		s
			.enter()
			.append('path');
			
		s			
			.attr('class', function(d, i) { return 'series series-' + (i + 1); })			
			.attr('d', seriesArc);			
	};	
	
	function render() {
		renderFrame(_options.target, _frameElements);
		calculateDimensions(_frameElements.$svg[0][0], _calculations);
		update();
	};
	
	function update() {
		renderBackground(_options.data, _frameElements.$mainLayer);	
		renderSeries(_options.data, _frameElements.$mainLayer);	
	};
	
	return {
		render: render,
		update: update
	};
};