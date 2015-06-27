function GaugeChart(target) {
	'use strict';

	var self = {
	};

	var isRendered = false;
	var isTransformSupported = false;
	
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
				var oldValue = parseFloat(this.getAttribute('data-current-value')),
					oldIndex = parseFloat(this.getAttribute('data-current-index'));
				if (direction === 'in') {
					var interpolateValue = d3.interpolate(oldValue, d.value);				
					var interpolateIndex = d3.interpolate(oldIndex, i);				
				}
				else {
					var interpolateValue = d3.interpolate(oldValue, 0);				
					var interpolateIndex = d3.interpolate(oldIndex, _calculations.seriesToFit);					
				}
				var arc = getArcFunction(arcType);
				var that = this;
				var cachedArc;
				return function(t) {
					var newValue = interpolateValue(t).toFixed(1);
					var newIndex = interpolateIndex(t).toFixed(2);
					var dataClone = cloneObject(d);
					dataClone.value = newValue;
					if (oldValue !== newValue) {
						that.setAttribute('data-current-value', newValue);
					}
					if (oldIndex !== newIndex) {
						that.setAttribute('data-current-index', newIndex);
					}
					if (!cachedArc || oldValue !== newValue || oldIndex !== newIndex) {
						cachedArc = arc(dataClone, newIndex);
					}
					return cachedArc;
				};
			});
		};
	};		
	
	function valueTextTween(transition) {
		var oldValue = parseFloat(this.getAttribute('data-current-value')),
			interpolate = d3.interpolate(oldValue, getWeightedAvg(_options.data)),
			that = this;
		return function(t) {
			var newValue = interpolate(t).toFixed(1);
			if (oldValue !== newValue) {
				that.setAttribute('data-current-value', newValue);
				d3.select(this).text(newValue + '%');
			}
		}	
	};	
	/*** <--- Helper functions ***/

	var _calculations = {};
	var _frameElements = {};
	var _dataElements = {};
	
	function renderFrame(target) {			
		// Chart container
		_frameElements.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		_frameElements.svg
			.setAttribute('class', 'gh-gauge-chart');
		target
			.appendChild(_frameElements.svg);			
			
		// Main layer
		_frameElements.mainLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		_frameElements.mainLayer
			.setAttribute('class', 'gh-gauge-chart-main-layer');
		_frameElements.svg
			.appendChild(_frameElements.mainLayer);

		// Main layer overlay
		_frameElements.mainLayerOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
		_frameElements.mainLayerOverlay
			.setAttribute('class', 'gh-gauge-chart-overlay gh-gauge-chart-main-layer-overlay');
		_frameElements.mainLayer
			.appendChild(_frameElements.mainLayerOverlay);
			
		// Series layer
		_frameElements.seriesLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		_frameElements.seriesLayer
			.setAttribute('class', 'gh-gauge-chart-series-layer');
		_frameElements.mainLayer
			.appendChild(_frameElements.seriesLayer);				
		_frameElements.$seriesLayer	= d3.select(_frameElements.seriesLayer);

		// Text layer
		_frameElements.textLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		_frameElements.textLayer
			.setAttribute('class', 'gh-gauge-chart-text-layer');			
		_frameElements.mainLayer
			.appendChild(_frameElements.textLayer);							
		_frameElements.$textLayer = d3.select(_frameElements.textLayer);
	};
	
	function applyTransforms() {
		if (!('transform' in _frameElements.svg)) {
			var mainLayerStyle = getComputedStyle(_frameElements.mainLayer);
			_frameElements.mainLayer
				.setAttribute('transform', mainLayerStyle.msTransform);
			
			var mainLayerOverlayStyle = getComputedStyle(_frameElements.mainLayerOverlay);
			_frameElements.mainLayerOverlay
				.setAttribute('transform', mainLayerOverlayStyle.msTransform);				
				
			var seriesLayerStyle = getComputedStyle(_frameElements.seriesLayer);
			_frameElements.seriesLayer
				.setAttribute('transform', seriesLayerStyle.msTransform);								

			var textLayerStyle = getComputedStyle(_frameElements.textLayer);
			_frameElements.textLayer
				.setAttribute('transform', textLayerStyle.msTransform);
		}
	};
	
	function calculateDimensions() {
		var container = _frameElements.svg;		
		_calculations.outerSize = Math.min(container.clientWidth, container.clientHeight);
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
		if (!isRendered) {	
			var frag = document.createDocumentFragment();
			renderFrame(frag);
			_options.target
				.appendChild(frag);
			applyTransforms();
			calculateDimensions();
		}
		update();
		isRendered = true;
		return self;
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