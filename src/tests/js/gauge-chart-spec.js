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
			
			it('should have update function', function() {
				expect(typeof(chart.update)).toBe('function');
			});			
		});		
		
		describe('with a proper target', function() {			
			var options = {
				target: document.getElementsByTagName('body')[0]
			};
			
			beforeEach(function() {
				d3.selectAll('svg.gh-gauge-chart').remove();
			});
			
			it('should render frame elements', function() {							
				var chart = GaugeChart(options);
				chart.render();					
				expect(d3.selectAll('svg.gh-gauge-chart')[0].length).toEqual(1);
				expect(d3.selectAll('svg.gh-gauge-chart')[0][0]).not.toBeNull();
				expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer')[0].length).toEqual(1);
				expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer')[0][0]).not.toBeNull();				
			});
			
			it('should render background arcs', function() {
				var data = [{id: 1, value: 10}, {id: 2, value: 20}, {id: 3, value: 50}];
				options.data = data;
				var chart = GaugeChart(options);
				chart.render();								
				expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer path.background')[0].length).toEqual(3);				
				expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer path.background.background-1')[0].length).toEqual(1);				
				expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer path.background.background-2')[0].length).toEqual(1);				
				expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer path.background.background-3')[0].length).toEqual(1);								
			});
			
			it('should render series arcs', function() {
				var data = [{id: 1, value: 10}, {id: 2, value: 20}, {id: 3, value: 50}];
				options.data = data;
				var chart = GaugeChart(options);
				chart.render();								
				expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer path.series')[0].length).toEqual(3);				
				expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer path.series.series-1')[0].length).toEqual(1);				
				expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer path.series.series-2')[0].length).toEqual(1);				
				expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer path.series.series-3')[0].length).toEqual(1);								
			});			
		});
	});
	
	
})