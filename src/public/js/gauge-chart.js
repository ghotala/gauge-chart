function GaugeChart(target) {
	'use strict';

	var self = {
	};

	var isRendered = false;
	
	var _options = {
		target: target,
		data: [],		
		renderHalfCircle: false,
		seriesThickness: 9,
		seriesSeparation: 1,
		startAngle: -Math.PI / 2,
		animate: false,
		animationDelay: 0,
		animationDuration: 2000
	};

	/*** Chaining API ---> ***/
	function createChainingMethodForProperty(propertyName, parseFunction) {
		if (parseFunction) {
			return function() {
				if (arguments.length > 0) {
					_options[propertyName] = parseFunction(arguments[0]);
					return self;
				}
				else {
					return _options[propertyName];
				}				
			};		
		}
		else {
			return function() {
				if (arguments.length > 0) {
					_options[propertyName] = arguments[0];
					return self;
				}
				else {
					return _options[propertyName];
				}				
			};			
		}
	};
	
	function validateData(data) {
		var errorMessage = 'Data is not in the correct format';
		var plainNumbersCount = data.filter(function(datum) { return typeof datum === 'number'; });		
		if (plainNumbersCount > 0 && plainNumbersCount < data.length) {
			throw errorMessage;
		}
		for (var i = 0, length = data.length; i < length; i++) {
			var datum = data[i];
			if (typeof datum !== 'number' &&
				(typeof datum.id !== 'number' ||
					typeof datum.value !== 'number' ||
					['undefined', 'number'].indexOf(typeof datum.weight) === -1))
			{
				throw errorMessage;
			}			
		}	
	};
	
	function parseData(data) {		
		validateData(data);	
		if (data.filter(function(datum) { return typeof datum === 'number'; }).length > 0) {
			for (var i = 0, length = data.length; i < length; i++) {
				data[i] = { id: i + 1, value: data[i] };
			}
		}
		return data;
	};

	function getBoolOrDefaultParser(def) {
		return function(value) {				
			if (typeof value !== 'boolean') {
				return def;
			}
			
			return value;	
		}
	};
	
	function getIntOrDefaultParser(def, allowNegative, allowZero) {		
		return function(value) {
			var parsedValue = parseInt(value);
			if (isNaN(parsedValue) ||
				(!allowNegative && parsedValue < 0) ||
				(!allowZero && parsedValue === 0)) {
				return def;
			}
			
			return parsedValue;	
		}
	};
	
	self.data = createChainingMethodForProperty('data', parseData);
	self.renderHalfCircle = createChainingMethodForProperty('renderHalfCircle', getBoolOrDefaultParser(false));
	self.seriesThickness = createChainingMethodForProperty('seriesThickness', getIntOrDefaultParser(9, false, false));
	self.seriesSeparation = createChainingMethodForProperty('seriesSeparation', getIntOrDefaultParser(1, false, true));	
	self.animate = createChainingMethodForProperty('animate', getBoolOrDefaultParser(true));	
	self.animationDelay = createChainingMethodForProperty('animationDelay', getIntOrDefaultParser(0, false, true));	
	self.animationDuration = createChainingMethodForProperty('animationDuration', getIntOrDefaultParser(2000, false, true));	
	/*** <--- Chaining API ***/

	/*** Helper functions ---> ***/
	function cloneObject(source) {
		return JSON.parse(JSON.stringify(source));
	};	
	
	function getDatumWeight(datum) {
		var weight = datum.weight
		return typeof(weight) === 'undefined' ? 1 : Math.max(weight, 0);		
	};	
	
	function getTotalWeight() {
		var data = _options.data;
		var totalWeight = 0;
		for (var i = 0, length = data.length; i < length; i++) {
			totalWeight += getDatumWeight(data[i]);
		}	

		return totalWeight;
	};
	
	function getWeightedAvg() {
		var data = _options.data;
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
	
	function getArcFunction(arcType) {
		return (d3
			.svg
			.arc()
			.innerRadius(getSeriesInnerRadius)
			.outerRadius(getSeriesOuterRadius)
			.startAngle(_options.startAngle)
			.endAngle(arcType === 'series' ? getSeriesEndAngle : getBackgroundEndAngle));	
	};	
	
	function arcTween(arcType, direction) {		
		return function(transition) {		
			transition.attrTween('d', function(d, i) {
				if (direction === 'in') {
					var interpolateValue = d3.interpolate(this.getAttribute('data-current-value'), d.value);				
					var interpolateIndex = d3.interpolate(this.getAttribute('data-current-index'), i);				
				}
				else {
					var interpolateValue = d3.interpolate(this.getAttribute('data-current-value'), 0);				
					var interpolateIndex = d3.interpolate(this.getAttribute('data-current-index'), _calculations.seriesToFit);					
				}
				var arc = getArcFunction(arcType);
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
	/*** <--- Helper functions ***/

	var _calculations = {};
	var _frameElements = {};
	var _dataElements = {};
	
	function renderFrame() {
		var target = _options.target;
		
		if (!isRendered) {
			// Chart container
			_frameElements.$svg = d3.select(target)
				.append('svg')
				.attr('class', 'gh-gauge-chart');	
				
			// Main layer
			_frameElements.$mainLayer = _frameElements.$svg
				.append('g')
				.attr('class', 'gh-gauge-chart-main-layer');				

			// Main layer overlay
			_frameElements.$mainLayerOverlay = _frameElements.$mainLayer
				.append('rect')
				.attr('class', 'gh-gauge-chart-overlay gh-gauge-chart-main-layer-overlay');																			
				
			// Series layer
			_frameElements.$seriesLayer = _frameElements.$mainLayer
				.append('g')
				.attr('class', 'gh-gauge-chart-series-layer');							

			// Text layer
			_frameElements.$textLayer = _frameElements.$mainLayer
				.append('g')
				.attr('class', 'gh-gauge-chart-text-layer');								
		}
	};
	
	function calculateDimensions() {
		var container = _frameElements.$svg[0][0];
		_calculations.outerSize = Math.max(container.clientWidth, container.clientHeight);
		_calculations.outerRadius = _calculations.outerSize / 2;
		_calculations.seriesToFit = Math.ceil(_calculations.outerRadius / (_options.seriesThickness + _options.seriesSeparation));
	};
	
	function renderArcs(arcType, renderFinalValue, renderFinalPosition) {
		var data = _options.data
		var layer = _frameElements.$seriesLayer;
		var arcFunction = getArcFunction(arcType);
			
		var arcs = layer
			.selectAll('path.gh-gauge-chart-' + arcType)
			.data(data, function(d) { return d.id; });

		if (_options.animate) {
			animateArcs(arcs.exit(), arcTween(arcType, 'out'), true);		
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
			.attr('data-current-index', function(d, i) { return renderFinalPosition ? i : _calculations.seriesToFit; });			
			
		arcs			
			.attr('class', function(d, i) { return 'gh-gauge-chart-' + arcType + ' ' + 'gh-gauge-chart-' + arcType + '-' + (i + 1); });
			
		if (renderFinalValue && renderFinalPosition) {
			arcs				
				.attr('d', arcFunction);		
		}
		
		return arcs;
	};
	
	function renderText(value) {
		var layer =  _frameElements.$textLayer;
		var text = layer
			.selectAll('text.gh-gauge-chart-main-value')
			.data([0]);
		
		text
			.enter()
			.append('text')
			.attr('data-current-value', value)			
			.attr('class', 'gh-gauge-chart-main-value');
		
		text
			.text(value.toFixed(1) + '%');		
		
		return text;
	};	
	
	function animateArcs($arcs, tween, remove) {
		var transition = $arcs
			.transition()
				.duration(_options.animationDuration)
				.delay(_options.animationDelay);
		if (remove) {
			transition
				.remove();
		}
		transition
			.call(tween);	
	};
	
	function animateText($text, tween) {
		$text
			.transition()
				.duration(_options.animationDuration)
				.delay(_options.animationDelay)
				.tween('text', tween);	
	};
	
	function render() {
		renderFrame();
		calculateDimensions();
		update();
		isRendered = true;
	};
		
	function update() {
		if (_options.animate) {
			_dataElements.$background = renderArcs('background', true, false);		
			_dataElements.$series = renderArcs('series', false, false);
			_dataElements.$text = renderText(isRendered ? parseFloat(_dataElements.$text.attr('data-current-value')) : 0);			
			animateArcs(_dataElements.$background, arcTween('background', 'in'), false);
			animateArcs(_dataElements.$series, arcTween('series', 'in'), false);
			animateText(_dataElements.$text, valueTextTween);			
		}
		else {
			_dataElements.$background = renderArcs('background', true, true);
			_dataElements.$series = renderArcs('series', true, true);					
			_dataElements.$text = renderText(getWeightedAvg(_options.data));			
		};	
	};
	
	self.render = render;
	return self;
};