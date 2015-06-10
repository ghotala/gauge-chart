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
				d3.selectAll('svg.gh-gauge-chart').remove();				
				chart = GaugeChart();
			});
						
			it('should have update function', function() {
				expect(typeof(chart.update)).toBe('function');
			});			
			it('should have data function', function() {
				expect(typeof(chart.data)).toBe('function');
			});						
		});		
		
		describe('data function', function() {
			var chart;
			beforeEach(function() {
				d3.selectAll('svg.gh-gauge-chart').remove();				
				chart = GaugeChart();
			});
			
			it('should set and return dataset', function() {
				expect(chart.data()).toEqual([{id: 1, value: 10}, {id: 2, value: 20}, {id: 3, value: 50}]);
				chart.data([{id: 5, value: 55}]);
				expect(chart.data()).toEqual([{id: 5, value: 55}]);
			});
		});
		
		describe('with a proper target', function() {			
			var chart;
			var options = {
				target: d3.select('body')[0][0]
			};
			
			beforeEach(function() {
				options.data = [{id: 1, value: 10}, {id: 2, value: 20}, {id: 3, value: 50}];	
				d3.selectAll('svg.gh-gauge-chart').remove();
			});
			
			describe('regardless of animation', function() {
				beforeEach(function() {
					chart = GaugeChart(options);				
				});			
				
				it('should render frame elements', function() {								
					expect(d3.selectAll('svg.gh-gauge-chart')[0].length).toEqual(1);
					expect(d3.selectAll('svg.gh-gauge-chart')[0][0]).not.toBeNull();
					expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer')[0].length).toEqual(1);
					expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer')[0][0]).not.toBeNull();				
				});
				
				it('should render background arcs', function() {
					expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer path.background')[0].length).toEqual(3);				
					expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer path.background.background-1')[0].length).toEqual(1);				
					expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer path.background.background-2')[0].length).toEqual(1);				
					expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer path.background.background-3')[0].length).toEqual(1);								
				});
				
				it('should render series arcs', function() {
					expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer path.series')[0].length).toEqual(3);				
					expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer path.series.series-1')[0].length).toEqual(1);				
					expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer path.series.series-2')[0].length).toEqual(1);				
					expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer path.series.series-3')[0].length).toEqual(1);								
				});						
				
				it('update method should re-render arcs with current dataset', function() {
					options.data.pop();
					chart.update();
					expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer path.background')[0].length).toEqual(2);				
					expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer path.background.background-1')[0].length).toEqual(1);				
					expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer path.background.background-2')[0].length).toEqual(1);				
					expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer path.background.background-3')[0].length).toEqual(0);
					expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer path.series')[0].length).toEqual(2);	
					expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer path.series.series-1')[0].length).toEqual(1);				
					expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer path.series.series-2')[0].length).toEqual(1);				
					expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer path.series.series-3')[0].length).toEqual(0);			
				});					
			});
							
			
			describe('with animations off', function() {
				beforeEach(function() {
					options.animation = {
						animate: false,
					};				
					chart = GaugeChart(options);				
				});	
						
				it('should render text value', function() {
					expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer text.main-value')[0].length).toEqual(1);								
					expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer text.main-value').text()).toEqual('26.7%');								
				});					
				
				it('update method should re-render text value with current dataset', function() {
					options.data.pop();
					chart.update();
					expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer text.main-value')[0].length).toEqual(1);								
					expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer text.main-value').text()).toEqual('15.0%');
				});								
			});				
			
			describe('with animations on', function() {
				beforeEach(function() {
					options.animation = {
						animate: true
					};							
				});	

				
				it('should render 0 as initial value', function(done) {
					chart = GaugeChart(options);									
					expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer text.main-value')[0].length).toEqual(1);								
					expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer text.main-value').text()).toEqual('0.0%');	
					setTimeout(done, 2100);
				});					
				
				it('should render target value at the end of animation', function(done) {						
					setTimeout(function() { 
						expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer text.main-value').text()).toEqual('26.7%');												
						done(); 
					}, 2100);
					chart = GaugeChart(options);									
				});		

				it('should render target value at the end of animation after update', function(done) {						
					setTimeout(function() { 
						chart.data([{id: 1, value: 20}, {id: 3, value: 65}, {id: 4, value: 35}]);
						chart.update();
						setTimeout(function() {
							expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer text.main-value').text()).toEqual('40.0%');												
							done(); 
						}, 2100);
					}, 2100);
					chart = GaugeChart(options);									
				}, 5000);	
			});					
		});
	});
	
	
})