describe('Gauge chart', function() {
	
	it('should exist', function() {
		expect(typeof(GaugeChart)).toBe('function');
	});	

	it('should expect one parameter', function() {
		expect(GaugeChart.length).toBe(1);
	});
	
	describe('when created', function() {
		var chart;
		beforeEach(function() {
			d3.selectAll('svg.gh-gauge-chart').remove();		
			chart = GaugeChart(document.getElementsByTagName('body')[0]);
		});	
		
		describe('should expose proper interface', function() {						
			it('should have data function', function() {
				expect(typeof(chart.data)).toBe('function');
			});						
			it('should have renderHalfCircle function', function() {
				expect(typeof(chart.renderHalfCircle)).toBe('function');
			});			
			it('should have seriesThickness function', function() {
				expect(typeof(chart.seriesThickness)).toBe('function');
			});		
			it('should have seriesSeparation function', function() {
				expect(typeof(chart.seriesSeparation)).toBe('function');
			});			
			it('should have animate function', function() {
				expect(typeof(chart.animate)).toBe('function');
			});		
			it('should have animationDelay function', function() {
				expect(typeof(chart.animationDelay)).toBe('function');
			});			
			it('should have animationDuration function', function() {
				expect(typeof(chart.animationDuration)).toBe('function');
			});		
			it('should have render function', function() {
				expect(typeof(chart.render)).toBe('function');
			});					
		});		
		
		describe('data function', function() {			
			it('should set and return dataset', function() {
				expect(chart.data()).toEqual([]);
				chart.data([{id: 5, value: 55}]);
				expect(chart.data()).toEqual([{id: 5, value: 55}]);
			});
			it('should accept array of plain integers', function() {
				chart.data([11, 22, 33]);
				expect(chart.data()).toEqual([{id: 1, value: 11}, {id: 2, value: 22}, {id: 3, value: 33}]);
			});			
			it('should throw when data cannot be parsed', function() {
				var errorMessage = 'Data is not in the correct format';
				expect(function() { chart.data([{value:11}, 22, 33]); }).toThrow(errorMessage);
				expect(function() { chart.data([{id: 1, value:11}, { id: 2 }]); }).toThrow(errorMessage);
				expect(function() { chart.data([{id: 1, value:11}, { id: 2, value: 22, weight: null }]); }).toThrow(errorMessage);
			});						
		});	
		
		describe('renderHalfCircle function', function() {			
			it('should set and return renderHalfCircle', function() {
				expect(chart.renderHalfCircle()).toEqual(false);
				chart.renderHalfCircle(true);
				expect(chart.renderHalfCircle()).toEqual(true);
			});		
			
			it('should default to false for non-boolean values', function() {
				chart.renderHalfCircle(1);
				expect(chart.renderHalfCircle()).toEqual(false);
				chart.renderHalfCircle('true');
				expect(chart.renderHalfCircle()).toEqual(false);				
				chart.renderHalfCircle(null);
				expect(chart.renderHalfCircle()).toEqual(false);								
			});					
		});		
				
		describe('when rendered', function() {				
			beforeEach(function() {
				chart.data([{id: 1, value: 10}, {id: 2, value: 20}, {id: 3, value: 50}]);	
			});
			
			describe('regardless of animation', function() {			
				beforeEach(function() {					
					chart.render();	
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
				
				it('should re-render arcs with current dataset', function() {
					chart.data([{id: 1, value: 10}, {id: 2, value: 20}])
					chart.render();
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
					chart.animate(false);
					chart.render();	
				});	
						
				it('should render text value', function() {
					expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer text.main-value')[0].length).toEqual(1);								
					expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer text.main-value').text()).toEqual('26.7%');								
				});					
				
				it('should re-render text value with current dataset', function() {
					chart.data([{id: 1, value: 10}, {id: 2, value: 20}])
					chart.render();
					expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer text.main-value')[0].length).toEqual(1);								
					expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer text.main-value').text()).toEqual('15.0%');
				});								
			});				
			
			describe('with animations on', function() {
				beforeEach(function() {
					chart.animate(true);
				});		

				it('should render 0 as initial value', function(done) {
					chart.render();	
					expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer text.main-value')[0].length).toEqual(1);								
					expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer text.main-value').text()).toEqual('0.0%');	
					setTimeout(done, 2100);
				});					
				
				it('should render target value at the end of animation', function(done) {						
					setTimeout(function() { 
						expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer text.main-value').text()).toEqual('26.7%');												
						done(); 
					}, 2100);
					chart.render();										
				});		

				it('should render target value at the end of animation after update', function(done) {						
					setTimeout(function() { 
						chart.data([{id: 1, value: 20}, {id: 3, value: 65}, {id: 4, value: 35}]);
						chart.render();	
						setTimeout(function() {
							expect(d3.selectAll('svg.gh-gauge-chart g.gh-gauge-chart-main-layer text.main-value').text()).toEqual('40.0%');												
							done(); 
						}, 2100);
					}, 2100);
					chart.render();	
				}, 5000);	
			});					
		});
	});
	
	
})