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

	var getDatumWeight = function(datum) {
		var weight = datum.weight
		return typeof(weight) === 'undefined' ? 1 : Math.max(weight, 0);		
	};	
	
	function getTotalWeight(data) {
		var totalWeight = 0;
		for (var i = 0, length = data.length; i < length; i++) {
			totalWeight += getDatumWeight(data[i]);
		}	

		return totalWeight;
	};
	
	function getWeightedAvg(data) {
		var avg = 0,
			totalWeight = getTotalWeight(data);
			
		if (totalWeight > 0) {
			for (var i = 0, length = data.length; i < length; i++) {
				var datum = data[i],
					value = datum.value,
					weight = getDatumWeight(datum);
				avg += value * weight / totalWeight;
			}	
		}

		return avg;		
	};	
	
	function getSeriesOuterRadius(d, i) {
		return _calculations.outerRadius - i * (_options.seriesThickness + _options.seriesSeparation);	
	};
	
	function getSeriesInnerRadius(d, i) {
		return getSeriesOuterRadius(d, i) - _options.seriesThickness;
	};		

	function getSeriesEndAngle(d) {
		var angleMultiplier = _options.renderHalfCircle ? 0.5 : 1;
		return Math.PI * 2 * d.value * angleMultiplier / 100 + _options.startAngle;
	};
	
	function getBackgroundEndAngle() {
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
	
	function renderValue(value, layer) {
		var text = layer
			.selectAll('text.main-value')
			.data([0]);
		
		text
			.enter()
			.append('text')
			.attr('class', 'main-value');
		
		text
			.text(value.toFixed(1) + '%');		
	};
	
	function render() {
		renderFrame(_options.target, _frameElements);
		calculateDimensions(_frameElements.$svg[0][0], _calculations);
		update();
	};
	
	function update() {
		renderArcs(_options.data, _frameElements.$mainLayer, ['background', 'series']);
		renderValue(getWeightedAvg(_options.data), _frameElements.$mainLayer);
	};
	
	render();
	
	return {
		update: update
	};
};