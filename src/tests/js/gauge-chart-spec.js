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
				chart = new GaugeChart();
			});
			
			it('should have render function', function() {
				expect(typeof(chart.render)).toBe('function');
			});
		});		
	});
})