function GaugeChart(options) {
	'use strict';
	
	options = options || {};
	options.animation = options.animation || {};
		
	var _options = {
		target: options.target || document.getElementsByTagName('body')[0],
		data: options.data || [{id: 1, value: 10}, {id: 2, value: 20}, {id: 3, value: 50}],		
		renderHalfCircle: options.renderHalfCircle || false,
		seriesThickness: options.seriesThickness || 9,
		seriesSeparation: options.seriesSeparation || 1,
		startAngle: options.startAngle === 0 ? 0 : (options.startAngle || -Math.PI / 2),
		animation: {
			animate: options.animation.animate || false,
			delay: options.animation.delay || 0,
			duration: options.animation.duration === 0 ? 0 : (options.animation.duration || 2000)
		},
	};

	function cloneObject(source) {
		return JSON.parse(JSON.stringify(source));
	};	
	
	function getDatumWeight(datum) {
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
	var _dataElements = {};
	
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
	
	function getArcFunction(arcType) {
		return (d3
			.svg
			.arc()
			.innerRadius(getSeriesInnerRadius)
			.outerRadius(getSeriesOuterRadius)
			.startAngle(_options.startAngle)
			.endAngle(arcType === 'series' ? getSeriesEndAngle : getBackgroundEndAngle));	
	}
	
	function renderArcs(data, layer, arcType, renderFinalValue) {
		var arcFunction = getArcFunction(arcType);
			
		var arcs = layer
			.selectAll('path.' + arcType)
			.data(data, function(d) { return d.id; });

		if (_options.animation.animate) {
			arcs
				.exit()
				.transition()
					.duration(2000)
					.delay(0)
					.style('opacity', 0)
					.remove();
		}
		else {
			arcs
				.exit()
				.remove();
		}
			
		arcs
			.enter()
			.append('path')
			.attr('data-current-value', function(d) { return renderFinalValue ? d.value : 0; })	
			.attr('data-current-index', function(d, i) { return renderFinalValue ? i : 0; });			
			
		arcs			
			.attr('class', function(d, i) { return arcType + ' ' + arcType + '-' + (i + 1); });
			
		if (renderFinalValue) {
			arcs				
				.attr('d', arcFunction);		
		}
		
		return arcs;
	};
	
	function renderText(value, layer) {
		var text = layer
			.selectAll('text.main-value')
			.data([0]);
		
		text
			.enter()
			.append('text')
			.attr('data-current-value', value)			
			.attr('class', 'main-value');
		
		text
			.text(value.toFixed(1) + '%');		
			
		return text;
	};
	
	function seriesArcTween(transition) {
		transition.attrTween('d', function(d, i) {
			var interpolateValue = d3.interpolate(this.getAttribute('data-current-value'), d.value);				
			var interpolateIndex = d3.interpolate(this.getAttribute('data-current-index'), i);				
			var arc = getArcFunction('series');
			var that = this;
			return function(t) {
				var newValue = interpolateValue(t);
				var newIndex = interpolateIndex(t);
				var dataClone = cloneObject(d);
				dataClone.value = newValue;
				that.setAttribute('data-current-value', newValue);
				that.setAttribute('data-current-index', newIndex);
				return arc(dataClone, newIndex);
			};
		});
	};	
	
	function valueTextTween(transition) {
		var interpolate = d3.interpolate(this.getAttribute('data-current-value'), getWeightedAvg(_options.data));
		var that = this;
		return function(t) {
			var newValue = interpolate(t);
			that.setAttribute('data-current-value', newValue);
			d3.select(this).text(newValue.toFixed(1) + '%');
		}	
	};
	
	function animateSeries($series, duration, delay, tween) {
		$series
			.transition()
				.duration(duration)
				.delay(delay)	
				.call(tween);	
	};
	
	function animateText($text, duration, delay, tween) {
		$text
			.transition()
				.duration(duration)
				.delay(delay)
				.tween('text', tween);	
	};
	
	function render() {
		renderFrame(_options.target, _frameElements);
		calculateDimensions(_frameElements.$svg[0][0], _calculations);
		update(true);
	};
		
	function update(renderInitialValues) {
		_dataElements.$background = renderArcs(_options.data, _frameElements.$mainLayer, 'background', true);
		if (_options.animation.animate) {
			_dataElements.$series = renderArcs(_options.data, _frameElements.$mainLayer, 'series', false);
			_dataElements.$text = renderText(renderInitialValues ? 0 : parseFloat(_dataElements.$text.attr('data-current-value')), _frameElements.$mainLayer);			
			animateSeries(_dataElements.$series, _options.animation.duration, _options.animation.delay, seriesArcTween);
			animateText(_dataElements.$text, _options.animation.duration, _options.animation.delay, valueTextTween);			
		}
		else {
			_dataElements.$series = renderArcs(_options.data, _frameElements.$mainLayer, 'series', true);					
			_dataElements.$text = renderText(getWeightedAvg(_options.data), _frameElements.$mainLayer);			
		};	
	};
	
	render();
	
	return {
		update: update
	};
};