#Mercer

Mercer is a 3D data visualization library built using three.js. 

It is named after a character in the book “Do Androids Dream of Electric Sheep?” and is a work in progress. Any suggestions on functionality can sent to my twitter <a href="https://twitter.com/GarethMarland">@garethmarland</a> and would be greatly appreciated.

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

##Graphs

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
	<li><b>data.title - </b> The title of the data series as it will appear on the graph.</li>
	<li><b>data.color - </b> The hex color of the graph line for the data series. If this isn't specified then a random color is selected.</li>
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
	<li><b>data.title - </b> The title of the data series as it will appear on the graph.</li>
	<li><b>data.color - </b> The hex color of the graph area for the data series. If this isn't specified then a random color is selected.</li>
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
	columnLabels: {
		values: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "July", "Apr", "Sept", "Oct", "Nov", "Dec" ]
	},
	data: [{
		title: "2013",
		color: "#0000ff",
		values: [ 100, 200, 400, 400, 300, 200, 200, 400, 400, 300, 200, 100 ]
	}, {
		title: "2014",
		color: "#ff0000",
		values: [ 300, 200, 200, 800, 100, 300, 200, 200, 800, 100, 300, 100 ]
	}, {
		title: "2015",
		values: [ 170, 200, 150, 140, 140, 130, 120, 180, 110, 130, 120, 190 ]
	}]
};

var barMercer = new Mercer();
barMercer.BarChart("bar-chart-container", barData);
```

####Configuration

<b>Row</b>

<ul>
	<li><b>data.title - </b> The title of the data series as it will appear on the graph.</li>
	<li><b>data.color - </b> The hex color of the bar for the data series. If this isn't specified then a random color is selected.</li>
	<li><b>data.showBarLabels - </b> this is the individual setting for the bar which determines if the value should be shown above each bar.</li>
</ul>

<b>Global</b>

<ul>
	<li><b>barWidth -</b> the width of the bar within the graph.</li>
	<li><b>barOpacity -</b> the transparency of the bars as they appear within the graph</li>
	<li><b>showBarLabels -</b> this is the global setting which defines if the value should be shown above each bar.</li>
	<li><b>barLabelFont -</b> the font for the value of the bar if visible. Changing this will require including a different .js file than the default 'helvetiker_regular.typeface.js'.</li>
	<li><b>barLabelSize -</b> the font size for the value of the bar if visible.</li>
	<li><b>barLabelColor -</b> the color of the value above the bar if visible</li>
	<li><b>rowSpace -</b> the amount of space between each row on the graph</li>
	<li><b>rowLabelFont -</b> the font for the row label along the Z axis. Changing this will require including a different .js file than the default 'helvetiker_regular.typeface.js'.</li>
	<li><b>rowLabelSize -</b> the font size for the row label</li>
	<li><b>rowLabelColor -</b> the default color for the row label</li>
	<li><b>columnSpace -</b> the space between each column in a row</li>
	<li><b>columnLabelFont -</b> the font for the bar label along the X axis. Changing this will require including a different .js file than the default 'helvetiker_regular.typeface.js'.</li>
	<li><b>columnLabelSize -</b> the font size for the column label</li>
	<li><b>columnLabelColor -</b> the default color for the column label</li>
</ul>

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

###Configuration

<b>Row</b>

<ul>
	<li><b>data.color - </b> The hex color of the points for the data series. If this isn't specified then a random color is selected.</li>
</ul>

<b>Global</b>

<ul>
	<li><b>pointSize -</b> the size of each point on the graph</li>
	<li><b>pointSpace -</b> the space between each measurement point section along the x, y and z axis</li>
</ul>

##Global Configuration

###General Display Settings

<ul>
	<li><b>showMeasurementLines -</b> a boolean settig that dermines if the measurement lines on the Y axis should be shown</li>
	<li><b>startRotation -</b> the initial rotation of the graph as it when it is initially rendered</li>
	<li><b>locked -</b> if the graph can be rotated by dragging. Default is false.</li>
</ul>

### Background Settings

<ul>
	<li><b>background -</b> this is an optional hex color that can be specified to change the graph background.</li>
	<li><b>backgroundTransparent -</b> this is how transparent the background of the graph should be.</li>
</ul>

###Graph Layout Settings

<ul>
	<li><b>baseColor -</b> the default base color for the graph.</li>
	<li><b>baseThickness -</b> the thickness of the base of the graph.</li>
	<li><b>baseEdge -</b> the edge in the base of the graph before the data visualization starts drawing.</li>
	<li><b>baseWidth -</b> the width of the base. This automatically figures itself out so usually shouldn't be set.</li>
	<li><b>baseLength -</b> the length of the base. This automatically figures itself out so usually shouldn't be set.</li>
	<li><b>graphHeight -</b> the height of the graph as it appeat. This automatically figures itself out so usually shouldn't be set.</li>
</ul>

###Measurement Line Settings

<ul>
	<li><b>measurementLineColor -</b> the color of the measurement lines if they are visible on the graph.</li>
	<li><b>measurementLabelFont -</b> the font for the measurement label along the Y axis. Changing this will require including a different .js file than the default 'helvetiker_regular.typeface.js'.</li>
	<li><b>measurementLabelSize -</b> the size of the label along the measurement line if it is visible.</li>
	<li><b>measurementLabelColor -</b> the color of the label along the measurement line if it is vible.</li>
</ul>

###Directional Light Settings

These are the settings for the directional light and probably don't need to be touched unless you have a specific need.

<ul>
	<li><b>directionalLight.color -</b> the color of the directional light.</li>
	<li><b>directionalLight.intensity -</b> the intensity of the directional light.</li>
	<li><b>directionalLight.position.x -</b> the X position of the directional light.</li>
	<li><b>directionalLight.position.y -</b> the Y position of the directional light.</li>
	<li><b>directionalLight.position.z -</b> the Z position of the directional light.</li>
</ul>

###Camera Settings

These settings are a little low level and control the positioning of the camera. The camera usually figures itself out but you might want to set this to get the position you need.

<ul>
	<li><b>cameraX -</b> the X position of the camera.</li>
	<li><b>cameraY -</b> the Y position of the camera.</li>
	<li><b>cameraZ -</b> the Z position of the camera.</li>
</ul>

###Look At Settings

These, like camera settings, are a little low level and control the position the camera looks at. This is usually automatically determined but just in case you have a specific neeed.

<ul>
	<li><b>lookAtX -</b> the X position that the camera should be looking at.</li>
	<li><b>lookAtY -</b> the Y position that the camera should be looking at.</li>
	<li><b>lookAtZ -</b> the Z position that the camera should be looking at.</li>
</ul>

##Author

My name is Gareth Marland. I’m a British programmer who currently lives in Toronto, Canada with my lovely Canadian wife.