# Gauge chart

This is a D3-powered implementation of a gauge chart.

## Key features:

* works with **multiple series** - every value will get a separate micro-gauge, radiating around the weighted average of all values displayed in the center
* renders a **half-circle** or **full-circle** chart
* **css-styled** - you can redecorate or rearrange elements with pure css. Prefer a different color set? Override the existing one with custom style. Want a different starting angle? Control it with a css transformation. ***Important:*** css transformations on <g> elements in IE will be translated into attributes
* **animated** - you can turn animations on to get better visibility of changes when datasource gets updated

## Install

To install, clone the source `git clone git://github.com/ghotala/gauge-chart.git` and do one of the following:

* get `chart-gauge.js` and `chart-gauge.css` from `dist` folder
* build it yourself with `npm install` and `grunt`
