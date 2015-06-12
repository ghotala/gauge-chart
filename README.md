# Gauge chart

This is a D3-powered implementation of a gauge chart.

## Key features:

* works with **multiple series** - every value will get a separate micro-gauge, radiating around the weighted average of all values displayed in the center
* renders a **half-circle** or **full-circle** chart
* **css-styled** - you can redecorate or rearrange elements with pure css. Prefer a different color set? Override the existing one with custom style. Want a different starting angle? Control it with a css transformation
* **animated** - you can turn animations on to get better visibility of changes when datasource gets updated

## Known issues

### IE support

Proper display depends on css transitions on `<g>` element, which is not supported in IE<=11. Workaround will arrive in the next release, but the subset of options controlled via css may be limited

## Install

To install, clone the source `git clone git://github.com/ghotala/gauge-chart.git` and do one of the following:

* get `chart-gauge.min.js` and `chart-gauge.min.css` from `dist` folder **Not available yet**
* build it yourself with `npm install` and `grunt`

## Examples

### Chart creation

#### `GaugeChart(Element)`
To create a chart, call `GaugeChart` with a target DOM element as an argument
```javascript
var targetElement = document.getElementById('chartContainer');
var chart = GaugeChart(targetElement);
```

Before you render it, you can (and should) set up its options. Functions can be used as chainable setters if called with an argument. Call them without arguments to retrieve the current value.

#### `.data(array)`
Set or retrieves dataset for the chart. Accepts:
* an array of raw values
* array of objets with unique IDs
* objects with optional data weight (defaults to 1)

```javascript
var targetElement = document.getElementById('chartContainer');
var chart = GaugeChart(targetElement);
chart
  .data([20, 40, 60]) // or
  .data([{id: 1, value: 20}, {id: 6, value: 40}, {id: 22, value: 60}]) // or
  .data([{id: 1, value: 20, weight: 0.6}, {id: 6, value: 40}, {id: 22, value: 1.2}])
  .render();
  
chart.data() // returns [{id: 1, value: 20, weight: 0.6}, {id: 6, value: 40}, {id: 22, value: 1.2}]
```

#### `.renderHalfCircle(boolean)`
Switches between a full-circle (default) and half-circle mode.
```javascript
chart
  .renderHalfCircle(true);
```

#### `.seriesThickness(number)`
#### `.seriesSeparation(number)`
Control the thickness of gauges and width of separation between them. Thickness needs to be positive, and separation cannot be negative.

```javascript
chart
  .seriesThickness(5)
  .seriesSeparation(3);
```

#### `.animate(boolean)`
#### `.animationDelay(number)`
#### `.animationDuration(number)`
Control animation switch and settings. Both the delay (default 0) and the duration (default 2000) must be non-negative values. They only come into play if animation is turned on.

```javascript
chart
  .animate(true)
  .animationDelay(1000)
  .animationDuration(1000);
```

### Chart display
There's only one method responsible for displaying chart on the screen:

#### `.render()`
Displays data with respect to the settings provided. Call it also to update the chart if the dataset changed.

### Putting it all together
All methods are chainable, so you can set up and display chart all in one go:

```javascript
var chartHalf = GaugeChart(document.getElementById('chartContainer'))
  .data([{id: 1, value: 20}, {id: 6, value: 40}, {id: 22, value: 60}])
  .renderHalfCircle(true)
  .seriesThickness(15)
  .seriesSeparation(5)  
  .animate(true)
  .animationDelay(1000)
  .animationDuration(2500)
  .render();
```

### Styling
TBD
