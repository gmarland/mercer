#Mercer

Mercer is a 3D data visualization library built using three.js. 

It is named after a character in the book “Do Androids Dream of Electric Sheep?” and is a work in progress. Any suggestions on functionality can sent to my twitter @garethmarland and would be greatly appreciated.

##Installation

###Manual

Download the minified three.js library from the GitHub repository https://github.com/mrdoob/three.js

Download the basic three.js example font “helvetiker_regular.typeface.js” from the GitHub repository (this is the default mercer font) https://github.com/mrdoob/three.js/tree/master/examples/fonts

Download the mercer.js library in this repository.

Once you have this libraries you need to include them on the page is going to use Mercer.

```html
<script src="js/three.min.js"></script>
<script src="js/helvetiker_regular.typeface.js"></script>
<script src="js/mercer.js"></script>
```

###Bower

Coming soon

##Configuration

###Line Graph

####Getting Started

<b>HTML</b>

Currently, a width and height need to be defined on the container div. This was to make getting the size for rendering on the page easier. This should probably be made better in the future.

```html
<div id="line-graph-container" style="width:800px;height:600px;"></div>
```

<b>JavaScript</b>

This is a very basic example that renders a line graph into a container div. Further configuration may be applied to modify the appearance.

```javascript
var lineData = { 
	data: [{ 
		title: "2013", 
		values: [{ 
			x: 100, 
			y: 200 
		}, { 
			x: 200, 
			y: 400 
		}, { 
			x: 300, 
			y: 200 
		}, { 
			x: 400, 
			y: 400 
		}]
	}, {
		title: "2014", 
		values: [{ 
			x: 300, 
			y: 200 
		}, { 
			x: 200, 
			y: 800 
		}, { 
			x: 100, 
			y: 300 
		}] 
	}]
};

var lineMercer = new Mercer();
lineMercer.LineGraph("line-graph-container", lineData);
```

####Configuration

<b>Row</b>

<ul>
	<li><b>data.title (optional) - </b> The title of the data series as it will appear on the graph.</li>
	<li><b>data.color (optional) - </b> The hex color of the graph line for the data series. If this isn't specified then a random color is selected.</li>
</ul>

<b>Global</b>

<ul>
	<li><b>lineWidth -</b> the width of the lines as they appear on the graph.</li>
	<li><b>rowSpace -</b> the amount of space between each row on the graph</li>
	<li><b>rowLabelFont -</b> the font for the row label. Changing this will require including a different .js file than the default 'helvetiker_regular.typeface.js'.</li>
	<li><b>rowLabelSize -</b> the font size for the row labels.</li>
	<li><b>rowLabelColor -</b> the default color for the row labels.</li>
	<li><b>pointSpace -</b> the space between point marker on the X axis.</li>
</ul>

###Area Chart

####Getting Started

<b>HTML</b>

Currently, a width and height need to be defined on the container div. This was to make getting the size for rendering on the page easier. This should probably be made better in the future.

```html
<div id="area-chart-container" style="width:800px;height:600px;"></div>
```

<b>JavaScript</b> 

This is a very basic example that randers an area chart into a container div. Further configuration may be applied to modify the appearance.

```javascript
var areaData = { 
	data: [{ 
		title: "2013", 
		values: [{ 
			x: 100, 
			y: 200 
		}, { 
			x: 200, 
			y: 400 
		}, { 
			x: 300, 
			y: 200 
		}] 
	}. {
		title: "2014", 
		values: [{ 
			x: 300, 
			y: 200 
		}, { 
			x: 200, 
			y: 800 
		}, { 
			x: 100, 
			y: 300 
		}] 
	}]
};

var areaMercer = new Mercer();
areaMercer.AreaChart("area-chart-container", areaData);
```

####Configuration

<b>Row</b>

<ul>
	<li><b>data.title (optional) - </b> The title of the data series as it will appear on the graph.</li>
	<li><b>data.color (optional) - </b> The hex color of the graph line for the data series. If this isn't specified then a random color is selected.</li>
</ul>

<b>Global</b>

<ul>
	<li><b>areaWidth -</b> the width of each area seaction as it appears on the graph.</li>
	<li><b>rowSpace -</b> the amount of space between each row on the graph</li>
	<li><b>rowLabelFont -</b> the font for the row label. Changing this will require including a different .js file than the default 'helvetiker_regular.typeface.js'.</li>
	<li><b>rowLabelSize -</b> the font size for the row labels.</li>
	<li><b>rowLabelColor -</b> the default color for the row labels.</li>
	<li><b>pointSpace -</b> the space between point marker on the X axis.</li>
</ul>

###Bar Chart

####Getting Started

<b>HTML</b> 

Currently, a width and height need to be defined on the container div. This was to make getting the size for rendering on the page easier. This should probably be made better in the future.

```html
<div id="bar-chart-container" style="width:800px;height:600px;"></div>
```

<b>JavaScript</b> 

This is a very basic example that renders a bar chart into a container div. Further configuration may be applied to modify the appearance.

```javascript
var barData = {
	rowLabels: {
		values: ["2013", "2014", "2015" ]
	},
	columnLabels: {
		values: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Apr", "Sept", "Oct", "Nov", "Dec" ]
	},
	data: [{
		color: "#0000ff",
		values: [ 100, 200, 400, 400, 300, 200, 200, 400, 400, 300, 200, 100 ]
	}, {
		color: "#ff0000",
		values: [ 300, 200, 200, 800, 100, 300, 200, 200, 800, 100, 300, 100 ]
	}, {
		color: "#00ff00",
		values: [ 170, 200, 150, 140, 140, 130, 120, 180, 110, 130, 120, 190 ]
	}]
};

var barMercer = new Mercer();
barMercer.BarChart("bar-chart-container", barData);
```

####Elements

###Scatter Graph

####Getting Started

<b>HTML</b>

Currently, a width and height need to be defined on the container div. This was to make getting the size for rendering on the page easier. This should probably be made better in the future.

```html
<div id=" scatter-graph-container" style="width:800px;height:600px;"></div>
```

<b>JavaScript</b>

This is a very basic example that renders a scatter graph into a container div. Further configuration may be applied to modify the appearance.

```javascript
var scatterData = {
	data: [{
		values: [{ 
			x: 300, 
			y: 200, 
			z: 200
		}, {
			x: 310, 
			y: 100, 
			z: 300
		}, {
			x: 200, 
			y: 200, 
			z: 150
		}, {
			x: 100, 
			y: 300, 
			z: 100
		}]
	}, {
		values: [{
			x: 170, 
			y: 200, 
			z: 150
		}, {
			x: 140, 
			y: 140, 
			z: 130
		}, {
			x: 120, 
			y: 180, 
			z: 110
		}, {
			x: 130, 
			y: 120, 
			z: 190
		}]
	}]
};

var scatterMercer = new Mercer();
scatterMercer.ScatterGraph("scatter-graph-container", scatterData);
```

###Elements

##Global Configuration

##Author

My name is Gareth Marland. I’m a British programmer who currently lives in Toronto, Canada with my lovely Canadian wife.