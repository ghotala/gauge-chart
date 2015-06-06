describe('Gauge chart', function() {
	
	it('should exist', function() {
		expect(typeof(GaugeChart)).toBe('function');
	});	

	it('should expect one parameter', function() {
		expect(GaugeChart.length).toBe(1);
	});
	
	describe('when created', function() {
		describe('should expose proper interface', function() {
			var chart;
			beforeEach(function() {
				chart = GaugeChart();
			});
			
			it('should have render function', function() {
				expect(typeof(chart.render)).toBe('function');
			});
		});		
		
		describe('with a proper target', function() {			
			var options = {};
			var chart;
			beforeEach(function() {							
				options.target = document.getElementsByTagName('body')[0];
			});
			
			beforeEach(function() {
				chart = GaugeChart(options);
			});
			
			it('should rander frame elements', function() {			
				chart.render();
				expect(d3.selectAll('svg.gh-gauge-chart')[0].length).toEqual(1);
				expect(d3.selectAll('svg.gh-gauge-chart')[0][0]).not.toBeNull();
				expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer')[0].length).toEqual(1);
				expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer')[0][0]).not.toBeNull();				
			});
		});
	});
	
	
})