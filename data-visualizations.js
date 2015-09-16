(function () {
    var tdv = function(data) {
        return {
        	// The div that will contain the visualization
        	_container: null,

        	// Camera settings
        	_fov: 75,
        	_near: 0.1,
        	_far: null,

        	// Camera position

        	_cameraX: 0,
        	_cameraY: 0,
        	_cameraZ: 0,

        	// Camera lookatPositions

        	_cameraLookatX: 0,
        	_cameraLookatY: 0,
        	_cameraLookatZ: 0,

        	// THREE layout
        	_scene: null,
        	_camera: null,
        	_renderer: null,

        	// Lighting
        	_directionalLight: { // directional lighting
        		color: 0xffffff,
        		intensity: 1.0,
        		position: {
        			x: 200,
        			y: 300,
        			z: 590
        		}
        	},

        	//Skybox
        	_skyboxColor: 0xffffff,

        	setGlobalOptions: function(options) {
        		if (options) {
        			if (options.background) this._skyboxColor = new THREE.Color(options.background);

        			if (options.camera) {
        				if (options.camera.x) this._cameraX = options.camera.x;
        				if (options.camera.y) this._cameraY = options.camera.y;
        				if (options.camera.z) this._cameraZ = options.camera.z;
        			}

        			if (options.lookAt) {
        				if (options.lookAt.x) this._cameraLookatX = options.lookAt.x;
        				if (options.lookAt.y) this._cameraLookatY = options.lookAt.y;
        				if (options.lookAt.z) this._cameraLookatZ = options.lookAt.z;
        			}
        		}
        	},

        	createScene: function() {
        		var containerWidth = parseInt(this._container.style.width,10), 
        			containerHeight = parseInt(this._container.style.height,10);

				this._scene = new THREE.Scene();

				this._renderer = new THREE.WebGLRenderer({ antialias: true });
				this._renderer.setSize(containerWidth, containerHeight);

				this._container.appendChild(this._renderer.domElement);
		      
				var directionalLight = new THREE.DirectionalLight(this._directionalLight.color, this._directionalLight.intensity); 
				directionalLight.position.set(this._directionalLight.position.x, this._directionalLight.position.y, this._directionalLight.position.z);
 
				this._scene.add(directionalLight);
        	},

        	addCamera: function() {
        		var containerWidth = parseInt(this._container.style.width,10), 
        			containerHeight = parseInt(this._container.style.height,10);

				this._camera = new THREE.PerspectiveCamera(this._fov, this._aspectRatio, this._near, this._far);

				this._camera.position.x = this._cameraX;
				this._camera.position.y = this._cameraY;
				this._camera.position.z = this._cameraZ;

				this._camera.lookAt(new THREE.Vector3(this._cameraLookatX, this._cameraLookatY, this._cameraLookatZ));
        	},

        	createSkybox: function(skySize) {
				var skyMesh = new THREE.Mesh(new THREE.BoxGeometry(skySize, skySize, skySize), new THREE.MeshBasicMaterial({
					color: this._skyboxColor,
					side:THREE.DoubleSide 
				}));

				this._scene.add(skyMesh);
        	},

        	createBase: function(baseWidth, baseLength, color) {
	    		// Create the base (a simple plane should do)
				var base = new THREE.Mesh(new THREE.PlaneGeometry(baseWidth, baseLength), new THREE.MeshBasicMaterial({ 
					color: color, 
					side: THREE.DoubleSide
				}));

				// rotate it 90 degrees so it's flat
				base.rotation.x = (Math.PI/2);

				return base;
        	},

        	degreesToRadians: function(degrees) {
			  return degrees * Math.PI / 180;
			},

        	// Calling will create a standard bar chart
        	bar: function(container, graphData, options) {
				var self = this;

        		// The actual graph object
        		var graphObject = new THREE.Object3D();

        		// The bars to the graph
        		var bars = [];

				// This is the maximum value allowed to be reached before it starts to factor
				var maxValueBeforeFactor = 150;

        		// Set up the basic configuration for the bar
        		var barWidth = 15, // the width of the bar
        			barOpacity = 0.65, // how opaque the bars are
        			columnSpace = 10, // the space between each column in a row
        			rowSpace = 30, // the space between each row
        			rowLabelFont = "helvetiker", // the font for the row label
        			rowLabelSize = 6, // the font size for the row label
        			rowLabelColor = 0x000000, // the default color for the row label
        			colLabelFont = "helvetiker", // the font for the col label
        			colLabelSize = 6, // the font size for the col label
        			colLabelColor = 0x000000, // the default color for the col label
        			baseColor = 0xaaaaaa, // the color for the base
        			baseEdge = 10, // the distance around the graphing area for the base
        			baseWidth = 200, // the base width which will be show if no data is added
        			baseLength = 200, // the base length which will be show if no data is added
        			locked = false, // whether or not to allow the rotation of the graph
        			showMeasurementLines = true, // whether or not to show measurement lines
        			measurementLineColor = 0x222222, // the default color of the measurement lines
        			measurementLabelFont = "helvetiker", // the font for the measurement label
        			measurementLabelSize = 6, // the font size for the measurement label
        			measurementLabelColor = 0x000000, // the default color for the measurement label
        			targetRotationX = null,
        			startRotation = -0.4;

        		// Allow the override using the options if they exist
        		if (options) {
        			if (options.maxValueBeforeFactor) maxValueBeforeFactor = options.maxValueBeforeFactor;

        			if (options.barWidth) barWidth = options.barWidth;

        			if (options.barOpacity) barOpacity = options.barOpacity;
        			
        			if (options.rowSpace) rowSpace = options.rowSpace;

        			if (options.columnSpace) columnSpace = options.columnSpace;

        			if (options.baseColor) baseColor = new THREE.Color(options.baseColor);

        			if (options.baseEdge) baseEdge = options.baseEdge;

        			if (options.baseWidth) baseWidth = options.baseWidth;

        			if (options.baseLength) baseLength = options.baseLength;

        			if (options.locked) locked = options.locked;

        			if (options.showMeasurementLines) showMeasurementLines = options.showMeasurementLines;

        			if (options.measurementLineColor) measurementLineColor = new THREE.Color(options.measurementLineColor);

        			if (options.measurementLabelFont) measurementLabelFont = options.measurementLabelFont;

        			if (options.measurementLabelSize) measurementLabelSize = options.measurementLabelSize;

        			if (options.measurementLabelColor) measurementLabelColor = new THREE.Color(options.measurementLabelColor);

        			if (options.startRotation) startRotation = options.startRotation;

        			this.setGlobalOptions(options);
        		}

        		// Update label fonts. Do it here just so all things are configured in the same place
        		if (graphData) {
        			if (graphData.rowLabels) {
	        			if (graphData.rowLabels.family) rowLabelFont = graphData.rowLabels.family;

	        			if (graphData.rowLabels.size) rowLabelSize = graphData.rowLabels.size;

	        			if (graphData.rowLabels.color) rowLabelColor = new THREE.Color(graphData.rowLabels.color);
        			}

        			if (graphData.columnLabels) {
	        			if (graphData.columnLabels.family) colLabelFont = graphData.columnLabels.family;

	        			if (graphData.columnLabels.size) colLabelSize = graphData.columnLabels.size;

	        			if (graphData.columnLabels.color) colLabelColor = new THREE.Color(graphData.columnLabels.color);
        			}
        		}

        		// The method to create the bar. Actually easier to plot the verticies than use available shapes
				var createBar = function(row, col, val, color) {						
	        		var barObject = new THREE.Object3D();

					// First, calculate the bar geometry

					var xPos = ((baseWidth/2)*-1), // this is our zero
						zPos = ((baseLength/2)*-1);

					xPos += ((col*columnSpace) + (col*barWidth)) + baseEdge + (barWidth/2);
					zPos += ((row*rowSpace) + (row*barWidth)) + baseEdge + (barWidth/2);

					var barGeometry = new THREE.Geometry();

					// Plot the verticies
					barGeometry.vertices.push(new THREE.Vector3(xPos-(barWidth/2), 0, zPos-(barWidth/2)));
					barGeometry.vertices.push(new THREE.Vector3(xPos-(barWidth/2), 0, zPos+(barWidth/2)));

					barGeometry.vertices.push(new THREE.Vector3(xPos+(barWidth/2), 0, zPos-(barWidth/2)));
					barGeometry.vertices.push(new THREE.Vector3(xPos+(barWidth/2), 0, zPos+(barWidth/2)));

					barGeometry.vertices.push(new THREE.Vector3(xPos-(barWidth/2), val, zPos-(barWidth/2)));
					barGeometry.vertices.push(new THREE.Vector3(xPos-(barWidth/2), val, zPos+(barWidth/2)));

					barGeometry.vertices.push(new THREE.Vector3(xPos+(barWidth/2), val, zPos-(barWidth/2)));
					barGeometry.vertices.push(new THREE.Vector3(xPos+(barWidth/2), val, zPos+(barWidth/2)));

					// Add the faces
					barGeometry.faces.push( new THREE.Face3( 0, 1, 4 ) );
					barGeometry.faces.push( new THREE.Face3( 4, 5, 1 ) );

					barGeometry.faces.push( new THREE.Face3( 3, 2, 7 ) );
					barGeometry.faces.push( new THREE.Face3( 7, 6, 2 ) );

					barGeometry.faces.push( new THREE.Face3( 1, 3, 5 ) );
					barGeometry.faces.push( new THREE.Face3( 5, 7, 3 ) );

					barGeometry.faces.push( new THREE.Face3( 0, 2, 4 ) );
					barGeometry.faces.push( new THREE.Face3( 4, 6, 2 ) );

					barGeometry.faces.push( new THREE.Face3( 4, 5, 7 ) );
					barGeometry.faces.push( new THREE.Face3( 6, 7, 4 ) );

					barGeometry.faces.push( new THREE.Face3( 0, 1, 3 ) );
					barGeometry.faces.push( new THREE.Face3( 0, 2, 3 ) );

					barGeometry.computeFaceNormals();

					var barMesh = new THREE.Mesh(barGeometry, new THREE.MeshLambertMaterial({
						color: color, 
						side: THREE.DoubleSide,
						transparent: true,
						opacity: barOpacity
					}));

					barObject.add(barMesh);

					// Generate the outlines
					var front = new THREE.Geometry();
					front.vertices.push(new THREE.Vector3(xPos-(barWidth/2), 0, zPos+(barWidth/2)));
					front.vertices.push(new THREE.Vector3(xPos-(barWidth/2), val, zPos+(barWidth/2)));
					front.vertices.push(new THREE.Vector3(xPos+(barWidth/2), val, zPos+(barWidth/2)));
					front.vertices.push(new THREE.Vector3(xPos+(barWidth/2), 0, zPos+(barWidth/2)));

					var frontLine = new THREE.Line(front, new THREE.LineBasicMaterial({
						color: color
					}));

					barObject.add(frontLine);

					var back = new THREE.Geometry();
					back.vertices.push(new THREE.Vector3(xPos-(barWidth/2), 0, zPos-(barWidth/2)));
					back.vertices.push(new THREE.Vector3(xPos-(barWidth/2), val, zPos-(barWidth/2)));
					back.vertices.push(new THREE.Vector3(xPos+(barWidth/2), val, zPos-(barWidth/2)));
					back.vertices.push(new THREE.Vector3(xPos+(barWidth/2), 0, zPos-(barWidth/2)));

					var backLine = new THREE.Line(back, new THREE.LineBasicMaterial({
						color: color
					}));

					barObject.add(backLine);

					var left = new THREE.Geometry();
					left.vertices.push(new THREE.Vector3(xPos+(barWidth/2), 0, zPos+(barWidth/2)));
					left.vertices.push(new THREE.Vector3(xPos+(barWidth/2), val, zPos+(barWidth/2)));
					left.vertices.push(new THREE.Vector3(xPos+(barWidth/2), val, zPos-(barWidth/2)));
					left.vertices.push(new THREE.Vector3(xPos+(barWidth/2), 0, zPos-(barWidth/2)));

					var leftLine = new THREE.Line(left, new THREE.LineBasicMaterial({
						color: color
					}));

					barObject.add(leftLine);

					var right = new THREE.Geometry();
					right.vertices.push(new THREE.Vector3(xPos-(barWidth/2), 0, zPos+(barWidth/2)));
					right.vertices.push(new THREE.Vector3(xPos-(barWidth/2), val, zPos+(barWidth/2)));
					right.vertices.push(new THREE.Vector3(xPos-(barWidth/2), val, zPos-(barWidth/2)));
					right.vertices.push(new THREE.Vector3(xPos-(barWidth/2), 0, zPos-(barWidth/2)));

					var rightLine = new THREE.Line(right, new THREE.LineBasicMaterial({
						color: color,
						side: THREE.DoubleSide
					}));

					barObject.add(rightLine);

					graphObject.add(barObject);

					// Return the created bar

					return barObject;
				};

				var createMeasurementsLines = function(maxDataValue) {
					if (originalMaxValue < 10) maxDataValue = 10;

					var stepsEachLine = Math.ceil(maxValueBeforeFactor/10);

					for (var i=1; i<=10; i++) {
						var mesurementLineObject = new THREE.Object3D();

						var measureLineGeometry = new THREE.Geometry();
						measureLineGeometry.vertices.push(new THREE.Vector3((baseWidth/2)*-1, (stepsEachLine*i), (baseLength/2)));
						measureLineGeometry.vertices.push(new THREE.Vector3((baseWidth/2)*-1, (stepsEachLine*i), (baseLength/2)*-1));
						measureLineGeometry.vertices.push(new THREE.Vector3((baseWidth/2), (stepsEachLine*i), (baseLength/2)*-1));

						var measureLine = new THREE.Line(measureLineGeometry, new THREE.LineBasicMaterial({
							color: measurementLineColor,
							side: THREE.DoubleSide
						}));

						mesurementLineObject.add(measureLine);

						var textGeometry = new THREE.TextGeometry(Math.round((maxDataValue/10)*i), {
							font: measurementLabelFont,
	    	 				size: measurementLabelSize,
							height: .2
						});
						
						var textMesh = new THREE.Mesh(textGeometry, new THREE.MeshBasicMaterial({
							color: measurementLabelColor
						}));

						var textBoxArea = new THREE.Box3().setFromObject(textMesh);

						textMesh.position.x += ((baseWidth/2)+5);
						textMesh.position.y += ((stepsEachLine*i)-(textBoxArea.size().y/2));
						textMesh.position.z -= (baseLength/2);

						mesurementLineObject.add(textMesh);

						graphObject.add(mesurementLineObject);
					}
				};

				var createColumnLabel = function(col, text) {
					var textGeometry = new THREE.TextGeometry(text, {
						font: colLabelFont,
    	 				size: colLabelSize,
						height: .2
					});
					
					var textMesh = new THREE.Mesh(textGeometry, new THREE.MeshBasicMaterial({
						color: colLabelColor
					}) );

					textMesh.rotation.x = (Math.PI/2)*-1;
					textMesh.rotation.z += (Math.PI/2);

					var textBoxArea = new THREE.Box3().setFromObject(textMesh);

					textMesh.position.z += (baseLength/2) + textBoxArea.size().z + 3;

					textMesh.position.x = (baseWidth/2)*-1;
					textMesh.position.x += (baseEdge + (barWidth/2) + (textBoxArea.size().x/2)) + (col*columnSpace) + (col*barWidth);

					graphObject.add(textMesh);
				};

				var createRowLabel = function(row, text) {
					var textGeometry = new THREE.TextGeometry(text, {
						font: rowLabelFont,
    	 				size: rowLabelSize,
						height: .2
					});
					
					var textMesh = new THREE.Mesh( textGeometry, new THREE.MeshBasicMaterial({
						color: rowLabelColor
					}) );

					textMesh.rotation.x = (Math.PI/2)*-1;

					var textBoxArea = new THREE.Box3().setFromObject(textMesh);

					textMesh.position.x += (baseWidth/2) + 3;

					textMesh.position.z -= (baseLength/2);
					textMesh.position.z += baseEdge + (barWidth/2) + (row*rowSpace) + (row*barWidth) + (textBoxArea.size().z/2);

					graphObject.add(textMesh);
				};
				
				// This attempts to find a camera position based on 
				var calculateCamera = function() {
					var graphObjectArea = new THREE.Box3().setFromObject(graphObject);

        			self._cameraX = 0;
        			self._cameraY = (maxValueBeforeFactor);
        			self._cameraZ = (graphObjectArea.size().x/2)+(graphObjectArea.size().z);

        			self._far = (Math.max(self._cameraX, self._cameraY, self._cameraZ)+1000)*2;
	        	};

	        	// Attempts to determine where the camera should be looking based on the graph settings
	        	var calculateLookAt = function() {
		        	self._cameraLookatX = 0;
		        	self._cameraLookatY = maxValueBeforeFactor/2;
		        	self._cameraLookatZ = 0;
	        	};

	        	// These variables are required for rotating the graph
        		var startPositionX = null,
        			startRotationX = null;

	        	var bindEvents = function() {
	        		// mouse events
	        		self._renderer.domElement.addEventListener("mousedown", function(e) {
	        			e.preventDefault();
	        			e.stopPropagation();

        			 	startPositionX = e.clientX-(window.innerWidth/2);
	        			startRotationX = graphObject.rotation.y;
	        		}, false );

        			self._renderer.domElement.addEventListener( "mousemove", function(e) {
	        			e.preventDefault();
	        			e.stopPropagation();

        				if (startPositionX) {
	      	  				var mouseX = e.clientX-(window.innerWidth/2);
	      	  				targetRotationX = startRotationX+(mouseX - startPositionX) * 0.02;
	      	  			}
			        }, false );

			        self._renderer.domElement.addEventListener( "mouseup", function(e) {
	        			e.preventDefault();
	        			e.stopPropagation();

			        	startPositionX = null;
	        			targetRotationX = null;
			        }, false );
        			
        			self._renderer.domElement.removeEventListener( "mouseout", function(e) {
			        	startPositionX = null;
	        			targetRotationX = null;
			        }, false );

			        // touch events
	        		self._renderer.domElement.addEventListener("touchstart", function(e) {
				        if (e.touches.length == 1) {
			                e.preventDefault();

	        			 	startPositionX = e.touches[0].pageX-(window.innerWidth/2);
	        				startRotationX = graphObject.rotation.y;
		        		}
	        		}, false );

        			self._renderer.domElement.addEventListener( "touchmove", function(e) {
        				if (startPositionX) {
					        if (e.touches.length == 1) {
				                e.preventDefault();

		      	  				var mouseX = e.touches[0].pageX-(window.innerWidth/2);
		      	  				targetRotationX = (mouseX - startPositionX) * 0.05;
		      	  			}
	      	  			}
			        }, false );

			        self._renderer.domElement.addEventListener( "touchend", function(e) {
			        	startPositionX = null;
	        			targetRotationX = null;
			        }, false );

			        self._renderer.domElement.addEventListener( "touchcancel", function(e) {
			        	startPositionX = null;
	        			targetRotationX = null;
			        }, false );
	        	};

	        	var update = function() {
	        		if ((targetRotationX) && (graphObject)) {
	        			var newRotation = ( targetRotationX - graphObject.rotation.y ) * 0.1;

	        			graphObject.rotation.y += newRotation;
	        		}
	        	};

				var startRenderScene = function() {
					var render = function () {
						requestAnimationFrame( render );

						update();

						self._renderer.render(self._scene, self._camera);
					};

					render();
				};

        		this._container = document.getElementById(container);

        		this.createScene();

        		// Give it a name just for simplicity
        		if ((options) && (options.name)) graphObject.name = options.name;
        		else graphObject.name = "barGraph";

        		// Setting up the base plane for the bar chart (assuming that there is data)
    			if (graphData) {
    				// Get the length (the z axis)
    				if ((graphData.rowLabels) && (graphData.rowLabels.values)) {
    					if (graphData.data.length > graphData.rowLabels.values.length) baseLength = (barWidth*graphData.data.length) + (rowSpace*graphData.data.length) - rowSpace + (baseEdge*2);
						else baseLength = (barWidth*graphData.rowLabels.values.length) + (rowSpace*graphData.rowLabels.values.length) - rowSpace + (baseEdge*2);
    				}
    				else if (graphData.data) baseLength = (barWidth*graphData.data.length) + (rowSpace*graphData.data.length) - rowSpace + (baseEdge*2);

    				// Figure out what the base length should be (the x axis)
    				var maxData = 0;

    				for (var i=0; i<graphData.data.length; i++) {
						if ((graphData.data[i].values) && (graphData.data[i].values.length > maxData)) maxData = graphData.data[i].values.length;
					}

					if ((graphData.columnLabels) && (graphData.columnLabels.values)) {
						if (maxData) {
							if (maxData > graphData.columnLabels.values.length) baseWidth = (barWidth*maxData) + (columnSpace*maxData) - columnSpace + (baseEdge*2);
							else baseWidth = (barWidth*graphData.columnLabels.values.length) + (columnSpace*graphData.columnLabels.values.length) - columnSpace + (baseEdge*2);
						}
						else baseWidth = (barWidth*graphData.columnLabels.values.length) + (columnSpace*graphData.columnLabels.values.length) - columnSpace + (baseEdge*2);
					}
					else if (maxData) baseWidth = (barWidth*maxData) + (columnSpace*maxData) - columnSpace + (baseEdge*2);
        		}

				// add it to the scene
				graphObject.add(this.createBase(baseWidth, baseLength, baseColor));

				var maxDataVal = 0;

				// check that we've have some data passed in
				if (graphData) {
					// First get the max value so we can factor values
    				for (var i=0; i<graphData.data.length; i++) {
    					for (var j=0; j<graphData.data[i].values.length; j++) {
							if (graphData.data[i].values[j] > maxDataVal) maxDataVal = graphData.data[i].values[j];
    					}
					}

					// Normalize the data so that the max value is at 100 units tall
					var originalMaxValue = maxDataVal;

					maxDataVal = maxValueBeforeFactor;

    				for (var i=0; i<graphData.data.length; i++) {
    					for (var j=0; j<graphData.data[i].values.length; j++) {
    						var percentageOfMax = graphData.data[i].values[j]/originalMaxValue;

							graphData.data[i].values[j] = maxDataVal*percentageOfMax;			
    					}
					}

    				for (var i=0; i<graphData.data.length; i++) {
    					// Figure out the color for the bar. Pick a random one is one isn't defined
    					var barColor = null;

    					if (graphData.data[i].color) barColor = new THREE.Color(graphData.data[i].color);
    					else barColor = new THREE.Color("#"+Math.floor(Math.random()*16777215).toString(16));

    					for (var j=0; j<graphData.data[i].values.length; j++) {
							bars.push(createBar(i, j, graphData.data[i].values[j], barColor));
    					}
					}

					if ((graphData.rowLabels) && (graphData.rowLabels.values)) {
						for (var i=0; i<graphData.rowLabels.values.length; i++) {
							createRowLabel(i, graphData.rowLabels.values[i]);
						}
					}

					if ((graphData.columnLabels) && (graphData.columnLabels.values)) {
	    				for (var i=0; i<graphData.columnLabels.values.length; i++) {
	    					createColumnLabel(i, graphData.columnLabels.values[i]);
						}
					}

					if (showMeasurementLines) createMeasurementsLines(originalMaxValue);
				}

				// Add the graph to the scene
				this._scene.add(graphObject);

				// We need to make the skybox big enough that it contains the graph but not so big that it goes beyond the _far setting
        		this.createSkybox((Math.max(baseWidth, baseLength, maxValueBeforeFactor)+500)*2);

        		// If we don't have camera options then we'll try and determine the camera position 
    			if ((!options) || (!options.camera)) calculateCamera();

    			// If we don't have camera options then we'll try and determine the cameras lookat 
    			if ((!options) || (!options.lookAt)) calculateLookAt();

				// Set the initial rotation
				if (startRotation) graphObject.rotation.y = startRotation;

    			// bind all mouse/touch events
				if (!locked) bindEvents()

				this.addCamera();

        		if (this._camera) startRenderScene();
        	}
        }
    };

    if(!window.tdv) window.tdv = tdv;
})();