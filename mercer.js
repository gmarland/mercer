(function () {
    var tdv = function(data) {
        return {
        	// The div that will contain the visualization
        	_container: null,

        	// Switch to dermine if the renderer should keep ticking to allow animations
        	_keepRenderingScene: false,

        	// Camera settings
        	_fov: 75,
        	_near: 0.1,
        	_far: null,

        	_cameraSettings: {
        		position: {
        			x: 0,
        			y: 0,
        			z: 0
        		},
        		lookAt: {
        			x: 0,
        			y: 0,
        			z: 0
        		}
        	},

			// Default setting for rotation
        	_startRotation: 0,

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


        	// Details of the base
			_baseEdge: 10, // the distance around the graphing area for the base
			_baseThickness: 1, // the thickness of the graph base
			_baseWidth: 200, // the base width which will be show if no data is added
			_baseLength: 200, // the base length which will be show if no data is added
			_baseColor: 0xaaaaaa, // the color for the base

        	//Skybox
        	_skyboxColor: 0xffffff,
        	_skyboxOpacity: 1,

        	setGlobalOptions: function(graphData) {
        		if (graphData !== undefined) {
        			if (graphData.background !== undefined) this._skyboxColor = new THREE.Color(graphData.background);
        			if (graphData.backgroundTransparent !== undefined) {
        				if (graphData.backgroundTransparent) this._skyboxOpacity = 0;
        				else this._skyboxOpacity = 1;
        			}

        			if (graphData.cameraX != undefined) this._cameraSettings.position.x = graphData.cameraX;
        			if (graphData.cameraY != undefined) this._cameraSettings.position.y = graphData.cameraY;
        			if (graphData.cameraZ != undefined) this._cameraSettings.position.z = graphData.cameraZ;

        			if (graphData.lookAtX != undefined) this._cameraSettings.lookAt.x = graphData.lookAtX;
        			if (graphData.lookAtY != undefined) this._cameraSettings.lookAt.y = graphData.lookAtY;
        			if (graphData.lookAtZ != undefined) this._cameraSettings.lookAt.z = graphData.lookAtZ;

        			if (graphData.startRotation !== undefined) startRotation = graphData.startRotation;

        			if (graphData.directionalLight !== undefined) {
	        			if (graphData.directionalLight.color !== undefined) _directionalLight.color = graphData.directionalLight.color;
	        			
	        			if (graphData.directionalLight.intensity !== undefined) _directionalLight.intensity = graphData.directionalLight.intensity;

	        			if (graphData.directionalLight.position !== undefined) {
		        			if (graphData.directionalLight.position.x !== undefined) _directionalLight.position.x = graphData.directionalLight.position.x;
		        			if (graphData.directionalLight.position.y !== undefined) _directionalLight.position.y = graphData.directionalLight.position.y;
		        			if (graphData.directionalLight.position.z !== undefined) _directionalLight.position.z = graphData.directionalLight.position.z;
		        		}
	        		}

        			if (graphData.baseEdge !== undefined) this._baseEdge = graphData.baseEdge;

        			if (graphData.baseWidth !== undefined) this._baseWidth = graphData.baseWidth;

        			if (graphData.baseLength !== undefined) this._baseLength = graphData.baseLength;

        			if (graphData.baseColor !== undefined) this._baseColor = graphData.baseColor
        		}
        	},

        	createScene: function() {
        		var containerWidth = parseInt(this._container.style.width,10), 
        			containerHeight = parseInt(this._container.style.height,10);

				this._scene = new THREE.Scene();

				this._renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
				this._renderer.setSize(containerWidth, containerHeight);
				this._renderer.setClearColor(this._skyboxColor, this._skyboxOpacity);

				this._container.appendChild(this._renderer.domElement);
		      
				var directionalLight = new THREE.DirectionalLight(this._directionalLight.color, this._directionalLight.intensity); 
				directionalLight.position.set(this._directionalLight.position.x, this._directionalLight.position.y, this._directionalLight.position.z);
 
				this._scene.add(directionalLight);
        	},

        	addCamera: function() {
        		var containerWidth = parseInt(this._container.style.width,10), 
        			containerHeight = parseInt(this._container.style.height,10);

				this._camera = new THREE.PerspectiveCamera(this._fov, this._aspectRatio, this._near, this._far);

				this._camera.position.x = this._cameraSettings.position.x;
				this._camera.position.y = this._cameraSettings.position.y;
				this._camera.position.z = this._cameraSettings.position.z;

				this._camera.lookAt(new THREE.Vector3(this._cameraSettings.lookAt.x, this._cameraSettings.lookAt.y, this._cameraSettings.lookAt.z));
        	},
				
			// This attempts to find a camera position based on 
			calculateCamera: function(graphObject) {
				var graphObjectArea = new THREE.Box3().setFromObject(graphObject);

    			this._cameraSettings.position.x = 0;
    			this._cameraSettings.position.y = graphObjectArea.size().y;
    			this._cameraSettings.position.z = (graphObjectArea.size().x/2)+(graphObjectArea.size().z);

    			this._far = (Math.max(this._cameraSettings.position.x, this._cameraSettings.position.y, this._cameraSettings.position.z)+1000)*2;
        	},

        	// Attempts to determine where the camera should be looking based on the graph settings
        	calculateLookAt: function(graphObject) {
				var graphObjectArea = new THREE.Box3().setFromObject(graphObject);

	        	this._cameraSettings.lookAt.x = 0;
	        	this._cameraSettings.lookAt.y = (graphObjectArea.size().y/2);
	        	this._cameraSettings.lookAt.z = 0;
        	},

        	createBase: function(graphObject) {
	    		// Create the base (a simple plane should do)
				var base = new THREE.Mesh(new THREE.PlaneGeometry(this._baseWidth, this._baseLength), new THREE.MeshBasicMaterial({ 
					color: this._baseColor, 
					side: THREE.DoubleSide
				}));

				// rotate it 90 degrees so it's flat
				base.rotation.x = (Math.PI/2);

				graphObject.add(base);
        	},

			createMeasurementsLines: function(graphObject, lineColor, labelFont, labelSize, labelColor, graphHeight, barValue) {
				if (barValue < 10) barValue = 10;

				var stepsEachLine = Math.ceil(graphHeight/10);

				for (var i=1; i<=10; i++) {
					var mesurementLineObject = new THREE.Object3D();

					var measureLineGeometry = new THREE.Geometry();
					measureLineGeometry.vertices.push(new THREE.Vector3((this._baseWidth/2)*-1, (stepsEachLine*i), (this._baseLength/2)));
					measureLineGeometry.vertices.push(new THREE.Vector3((this._baseWidth/2)*-1, (stepsEachLine*i), (this._baseLength/2)*-1));
					measureLineGeometry.vertices.push(new THREE.Vector3((this._baseWidth/2), (stepsEachLine*i), (this._baseLength/2)*-1));

					var measureLine = new THREE.Line(measureLineGeometry, new THREE.LineBasicMaterial({
						color: lineColor,
						side: THREE.DoubleSide
					}));

					mesurementLineObject.add(measureLine);

					var textGeometry = new THREE.TextGeometry(Math.round((barValue/10)*i), {
						font: labelFont,
    	 				size: labelSize,
						height: .2
					});
					
					var textMesh = new THREE.Mesh(textGeometry, new THREE.MeshBasicMaterial({
						color: labelColor
					}));

					var textBoxArea = new THREE.Box3().setFromObject(textMesh);

					textMesh.position.x += ((this._baseWidth/2)+5);
					textMesh.position.y += ((stepsEachLine*i)-(textBoxArea.size().y/2));
					textMesh.position.z -= (this._baseLength/2);

					mesurementLineObject.add(textMesh);

					graphObject.add(mesurementLineObject);
				}
			},

        	// Calling will create a standard ares chart
        	AreaChart: function(container, graphData) {
				var self = this;

        		// The actual graph object
        		var graphObject = new THREE.Object3D();

        		// The areas to the graph
        		var areas = [];

				// This is the maximum value allowed to be reached before it starts to factor
				var maxDataValBeforeFactor = 150;

        		var targetRotationX = null; // used for rotations

        		var areaWidth = 4,
        			rowSpace = 30, // the space between each row
        			rowLabelFont = "helvetiker", // the font for the row label
        			rowLabelSize = 4, // the font size for the row label
        			rowLabelColor = 0x000000, // the default color for the row label
        			pointSpace = 15, // the space between each column in a row
        			locked = false, // whether or not to allow the rotation of the graph
        			showMeasurementLines = true, // whether or not to show measurement lines
        			measurementLineColor = 0x222222, // the default color of the measurement lines
        			measurementLabelFont = "helvetiker", // the font for the measurement label
        			measurementLabelSize = 2.5, // the font size for the measurement label
        			measurementLabelColor = 0x000000; // the default color for the measurement label

        		// Allow the override using the graphData options if they exist
        		if (graphData !== undefined) {
        			if (graphData.maxDataValBeforeFactor !== undefined) maxDataValBeforeFactor = graphData.maxDataValBeforeFactor;

        			if (graphData.areaWidth !== undefined) areaWidth = graphData.areaWidth;
        			
        			if (graphData.rowSpace !== undefined) rowSpace = graphData.rowSpace;

        			if (graphData.rowLabels !== undefined) {
	        			if (graphData.rowLabels.fontFamily !== undefined) rowLabelFont = graphData.rowLabels.fontFamily;

	        			if (graphData.rowLabels.size !== undefined) rowLabelSize = graphData.rowLabels.size;

	        			if (graphData.rowLabels.color !== undefined) rowLabelColor = new THREE.Color(graphData.rowLabels.color);
	        		}

        			if (graphData.pointSpace !== undefined) locked = graphData.locked;

        			if (graphData.locked !== undefined) locked = graphData.locked;

        			if (graphData.showMeasurementLines !== undefined) showMeasurementLines = graphData.showMeasurementLines;

        			if (graphData.measurementLineColor !== undefined) measurementLineColor = new THREE.Color(graphData.measurementLineColor);

        			if (graphData.measurementLabelFont !== undefined) measurementLabelFont = graphData.measurementLabelFont;

        			if (graphData.measurementLabelSize !== undefined) measurementLabelSize = graphData.measurementLabelSize;

        			if (graphData.measurementLabelColor !== undefined) measurementLabelColor = new THREE.Color(graphData.measurementLabelColor);

        			this.setGlobalOptions(graphData);
        		}


        		// The method to create the bar. Actually easier to plot the verticies than use available shapes
				var createAreaGraph = function(row, factoredValues, originalValues, color) {	
	        		var areaObject = new THREE.Object3D();

					var xPosStart = (((self._baseWidth/2)*-1) + self._baseEdge), // this is our zero
						zPosStart = (((self._baseLength/2)*-1) + self._baseEdge);

					var frontVertices = [],
						backVertices = [];

					var areaGeometry = new THREE.Geometry();

					// create the front verticies

					for (var i=0; i<factoredValues.length; i++) {
						frontVertices.push(new THREE.Vector3(xPosStart+(i*pointSpace), 0, zPosStart+(row*rowSpace)+(row*areaWidth)+(areaWidth/2)));
						frontVertices.push(new THREE.Vector3(xPosStart+(i*pointSpace), factoredValues[i], zPosStart+(row*rowSpace)+(row*areaWidth)+(areaWidth/2)));
						backVertices.push(new THREE.Vector3(xPosStart+(i*pointSpace), 0, zPosStart+(row*rowSpace)+(row*areaWidth)-(areaWidth/2)));
						backVertices.push(new THREE.Vector3(xPosStart+(i*pointSpace), factoredValues[i], zPosStart+(row*rowSpace)+(row*areaWidth)-(areaWidth/2)));
					}

					for (var i=0; i<frontVertices.length; i++) {
						areaGeometry.vertices.push(frontVertices[i]);
					}

					for (var i=0; i<backVertices.length; i++) {
						areaGeometry.vertices.push(backVertices[i]);
					}

					// Add the front face
					for (var i=0; i<frontVertices.length-2; i+=2) {
						areaGeometry.faces.push( new THREE.Face3( i, (i+1), (i+3) ) );
						areaGeometry.faces.push( new THREE.Face3( i, (i+2), (i+3) ) );
					}

					// Add the back face
					for (var i=frontVertices.length; i<(frontVertices.length+backVertices.length)-2; i+=2) {
						areaGeometry.faces.push( new THREE.Face3( i, (i+1), (i+3) ) );
						areaGeometry.faces.push( new THREE.Face3( i, (i+2), (i+3) ) );
					}
						
					// add the opening face
					areaGeometry.faces.push( new THREE.Face3( 0, (frontVertices.length), (frontVertices.length+1) ) );
					areaGeometry.faces.push( new THREE.Face3( 0, 1, (frontVertices.length+1) ) );

					// Add the joining face
					for (var i=0; i<frontVertices.length-2; i+=2) {
						areaGeometry.faces.push( new THREE.Face3( (i+1), (i+3), (i+(frontVertices.length+3)) ) );
						areaGeometry.faces.push( new THREE.Face3( (i+1), (i+(frontVertices.length+1)), (i+(frontVertices.length+3)) ) );
					}

					// add the end face
					areaGeometry.faces.push( new THREE.Face3( (frontVertices.length-2), (frontVertices.length-1), (frontVertices.length+backVertices.length-2) ) );
					areaGeometry.faces.push( new THREE.Face3( (frontVertices.length-1), (frontVertices.length+backVertices.length-1), (frontVertices.length+backVertices.length-2) ) );

					areaGeometry.computeFaceNormals();

					var areaMesh = new THREE.Mesh(areaGeometry, new THREE.MeshLambertMaterial({
						color: color, 
						side: THREE.DoubleSide,
						transparent: true,
						opacity: 0.65
					}));

					areaObject.add(areaMesh);

					// Generate the outline
					var areaLineGeometry = new THREE.Geometry();
					for (var i=0; i<factoredValues.length; i++) {
						areaLineGeometry.vertices.push(new THREE.Vector3(xPosStart+(i*pointSpace), factoredValues[i], zPosStart+(row*rowSpace)+(row*areaWidth)+(areaWidth/2)));
					}

					var areaLine = new THREE.Line(areaLineGeometry, new THREE.LineBasicMaterial({
						color: color
					}));

					areaObject.add(areaLine);

					graphObject.add(areaObject);

					return areaObject;
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

					textMesh.position.x += (self._baseWidth/2) + 3;

					textMesh.position.z -= (self._baseLength/2);
					textMesh.position.z += self._baseEdge + (row*rowSpace) + (row*areaWidth) + (textBoxArea.size().z/2);

					graphObject.add(textMesh);
				};

	        	var bindEvents = function() {
		        	// These variables are required for rotating the graph
	        		var startPositionX = null,
	        			startRotationX = null;

	        		// mouse events
	        		self._renderer.domElement.addEventListener("mousedown", function(e) {
	        			e.preventDefault();
	        			e.stopPropagation();

        			 	startPositionX = e.clientX-(window.innerWidth/2);
	        			startRotationX = graphObject.rotation.y;

	        			startRendering();
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

	        			stopRendering();
			        }, false );
        			
        			self._renderer.domElement.addEventListener( "mouseout", function(e) {
			        	startPositionX = null;
	        			targetRotationX = null;

	        			stopRendering();
			        }, false );

			        // touch events
	        		self._renderer.domElement.addEventListener("touchstart", function(e) {
				        if (e.touches.length == 1) {
			                e.preventDefault();

	        			 	startPositionX = e.touches[0].pageX-(window.innerWidth/2);
	        				startRotationX = graphObject.rotation.y;

	        				startRendering();
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

	        			stopRendering();
			        }, false );

			        self._renderer.domElement.addEventListener( "touchcancel", function(e) {
			        	startPositionX = null;
	        			targetRotationX = null;

	        			stopRendering();
			        }, false );
	        	};

	        	var update = function() {
	        		if ((targetRotationX) && (graphObject)) {
	        			var newRotation = ( targetRotationX - graphObject.rotation.y ) * 0.1;

	        			graphObject.rotation.y += newRotation;
	        		}
	        	};

	        	var startRendering = function() {
	        		this._keepRenderingScene = true;

	        		render();
	        	};

	        	var stopRendering = function() {
	        		this._keepRenderingScene = false;
	        	};

				var render = function () {
					if (this._keepRenderingScene) requestAnimationFrame( render );

					update();

					self._renderer.render(self._scene, self._camera);
				};

        		this._container = document.getElementById(container);

        		this.createScene();

        		// Give it a name just for simplicity
        		if ((graphData) && (graphData.name)) graphObject.name = graphData.name;
        		else graphObject.name = "areaGraph";

				// check that we've have some data passed in
				if (graphData) {
        			// Setting up the base plane for the area chart
    				// Get the length (the z axis)
					if ((graphData.rowLabels) && (graphData.rowLabels.values)) {
						if (graphData.data.length > graphData.rowLabels.values.length) this._baseLength = (areaWidth*graphData.data.length) + (rowSpace*graphData.data.length) - rowSpace + (this._baseEdge*2);
						else this._baseLength = (areaWidth*graphData.rowLabels.values.length) + (rowSpace*graphData.rowLabels.values.length) - rowSpace + (this._baseEdge*2);
					}
					else if (graphData.data) this._baseLength = (barWidth*graphData.data.length) + (rowSpace*graphData.data.length) - rowSpace + (this._baseEdge*2);

    				// Figure out what the base width should be (the x axis)
    				var maxData = 0;

    				for (var i=0; i<graphData.data.length; i++) {
						if ((graphData.data[i].values) && (graphData.data[i].values.length > maxData)) maxData = graphData.data[i].values.length;
					}

					if ((graphData.columnLabels) && (graphData.columnLabels.values)) {
						if (maxData) {
							if (maxData > graphData.columnLabels.values.length) this._baseWidth = (pointSpace*maxData) - pointSpace + (this._baseEdge*2);
							else this._baseWidth = (pointSpace*graphData.columnLabels.values.length) - pointSpace + (this._baseEdge*2);
						}
						else this._baseWidth = (pointSpace*graphData.columnLabels.values.length) - pointSpace + (this._baseEdge*2);
					}
					else if (maxData) this._baseWidth = (pointSpace*maxData) - pointSpace + (this._baseEdge*2);

					// add it to the scene
					this.createBase(graphObject);

					// Get the max value so we can factor values
					var maxDataVal = 0;

    				for (var i=0; i<graphData.data.length; i++) {
    					for (var j=0; j<graphData.data[i].values.length; j++) {
							if (graphData.data[i].values[j] > maxDataVal) maxDataVal = graphData.data[i].values[j];
    					}
					}

					// Normalize the data so that the max value is at 100 units tall
					var originalMaxValue = maxDataVal;

					maxDataVal = maxDataValBeforeFactor;

    				for (var i=0; i<graphData.data.length; i++) {
    					graphData.data[i].factoredValues = [];

    					for (var j=0; j<graphData.data[i].values.length; j++) {
    						var percentageOfMax = graphData.data[i].values[j]/originalMaxValue;

							graphData.data[i].factoredValues.push(maxDataVal*percentageOfMax);			
    					}
					}

					// Add the measurement lines
					if (showMeasurementLines) this.createMeasurementsLines(graphObject, measurementLineColor, measurementLabelFont, measurementLabelSize, measurementLabelColor, maxDataValBeforeFactor, originalMaxValue);

					for (var i=0; i<graphData.data.length; i++) {
    					// Figure out the color for the bar. Pick a random one is one isn't defined
    					var areaColor = null;

    					if (graphData.data[i].color !== undefined) areaColor = new THREE.Color(graphData.data[i].color);
    					else areaColor = new THREE.Color("#"+Math.floor(Math.random()*16777215).toString(16));

						areas.push(createAreaGraph(i, graphData.data[i].factoredValues, graphData.data[i].values, areaColor));
					}

					if ((graphData.rowLabels) && (graphData.rowLabels.values)) {
						for (var i=0; i<graphData.rowLabels.values.length; i++) {
							createRowLabel(i, graphData.rowLabels.values[i]);
						}
					}
				}

				// Add the graph to the scene
				this._scene.add(graphObject);

        		// If we don't have camera graphData then we'll try and determine the camera position 
    			if ((!graphData) || (!graphData.camera)) this.calculateCamera(graphObject);

    			// If we don't have camera graphData then we'll try and determine the cameras lookat 
    			if ((!graphData) || (!graphData.lookAt)) this.calculateLookAt(graphObject);

				// Set the initial rotation
				if (this._startRotation) graphObject.rotation.y = this._startRotation;

    			// bind all mouse/touch events
				if (!locked) bindEvents();

				this.addCamera();

        		if (this._camera) render();
        	},

        	// Calling will create a standard bar chart
        	BarChart: function(container, graphData) {
				var self = this;

        		// The actual graph object
        		var graphObject = new THREE.Object3D();

        		// The bars to the graph
        		var bars = [];

        		// set the default rotation
        		this._startRotation = -0.65;

				// This is the maximum value allowed to be reached before it starts to factor
				var maxDataValBeforeFactor = 150;

        		var targetRotationX = null; // used for rotations

        		// Set up the basic configuration for the bar
        		var barWidth = 15, // the width of the bar
        			barOpacity = 0.65, // how opaque the bars are
        			showBarLabels = false, // global setting, should bar labels be visible
        			barLabelFont = "helvetiker", // the font for the row label
        			barLabelSize = 6, // the font size for the row label
        			barLabelColor = 0x000000, // the default color for the row label
        			rowSpace = 30, // the space between each row
        			rowLabelFont = "helvetiker", // the font for the row label
        			rowLabelSize = 4, // the font size for the row label
        			rowLabelColor = 0x000000, // the default color for the row label
        			columnSpace = 10, // the space between each column in a row
        			columnLabelFont = "helvetiker", // the font for the col label
        			columnLabelSize = 4, // the font size for the col label
        			columnLabelColor = 0x000000, // the default color for the col label
        			locked = false, // whether or not to allow the rotation of the graph
        			showMeasurementLines = true, // whether or not to show measurement lines
        			measurementLineColor = 0x222222, // the default color of the measurement lines
        			measurementLabelFont = "helvetiker", // the font for the measurement label
        			measurementLabelSize = 2.5, // the font size for the measurement label
        			measurementLabelColor = 0x000000; // the default color for the measurement label

        		// Allow the override using the graphData options if they exist
        		if (graphData !== undefined) {
        			if (graphData.maxDataValBeforeFactor !== undefined) maxDataValBeforeFactor = graphData.maxDataValBeforeFactor;

        			if (graphData.barWidth !== undefined) barWidth = graphData.barWidth;

        			if (graphData.barOpacity !== undefined) barOpacity = graphData.barOpacity;

        			if (graphData.showBarLabels !== undefined) showBarLabels = graphData.showBarLabels;

        			if (graphData.barLabelFont !== undefined) barLabelFont = graphData.barLabelFont;

        			if (graphData.barLabelSize !== undefined) barLabelSize = graphData.barLabelSize;

        			if (graphData.barLabelColor !== undefined) barLabelColor = new THREE.Color(graphData.barLabelColor);
        			
        			if (graphData.rowSpace !== undefined) rowSpace = graphData.rowSpace;

        			if (graphData.rowLabels !== undefined) {
	        			if (graphData.rowLabels.fontFamily !== undefined) rowLabelFont = graphData.rowLabels.fontFamily;

	        			if (graphData.rowLabels.size !== undefined) rowLabelSize = graphData.rowLabels.size;

	        			if (graphData.rowLabels.color !== undefined) rowLabelColor = new THREE.Color(graphData.rowLabels.color);
	        		}

        			if (graphData.columnSpace !== undefined) columnSpace = graphData.columnSpace;

        			if (graphData.rowLabels !== undefined) {
	        			if (graphData.columnLabels.fontFamily !== undefined) columnLabelFont = graphData.columnLabels.fontFamily;

	        			if (graphData.columnLabels.size !== undefined) columnLabelSize = graphData.columnLabels.size;

	        			if (graphData.columnLabels.color !== undefined) columnLabelColor = new THREE.Color(graphData.columnLabels.color);
	        		}

        			if (graphData.showMeasurementLines !== undefined) showMeasurementLines = graphData.showMeasurementLines;

        			if (graphData.measurementLineColor !== undefined) measurementLineColor = new THREE.Color(graphData.measurementLineColor);

        			if (graphData.measurementLabelFont !== undefined) measurementLabelFont = graphData.measurementLabelFont;

        			if (graphData.measurementLabelSize !== undefined) measurementLabelSize = graphData.measurementLabelSize;

        			if (graphData.measurementLabelColor !== undefined) measurementLabelColor = new THREE.Color(graphData.measurementLabelColor);

        			if (graphData.locked !== undefined) locked = graphData.locked;

        			this.setGlobalOptions(graphData);
        		}

        		// Update label fonts. Do it here just so all things are configured in the same place
        		if (graphData) {
        			if (graphData.rowLabels) {
	        			if (graphData.rowLabels.family) rowLabelFont = graphData.rowLabels.family;

	        			if (graphData.rowLabels.size) rowLabelSize = graphData.rowLabels.size;

	        			if (graphData.rowLabels.color) rowLabelColor = new THREE.Color(graphData.rowLabels.color);
        			}

        			if (graphData.columnLabels) {
	        			if (graphData.columnLabels.family) columnLabelFont = graphData.columnLabels.family;

	        			if (graphData.columnLabels.size) columnLabelSize = graphData.columnLabels.size;

	        			if (graphData.columnLabels.color) columnLabelColor = new THREE.Color(graphData.columnLabels.color);
        			}
        		}

        		// The method to create the bar. Actually easier to plot the verticies than use available shapes
				var createBar = function(row, col, factoredValue, originalValue, color, viewLabels) {		
	        		var barObject = new THREE.Object3D();

					// First, calculate the bar geometry

					var xPos = (((self._baseWidth/2)*-1) + self._baseEdge), // this is our zero
						zPos = (((self._baseLength/2)*-1) + self._baseEdge);

					xPos += ((col*columnSpace) + (col*barWidth)) + (barWidth/2);
					zPos += ((row*rowSpace) + (row*barWidth)) + (barWidth/2);

					var barGeometry = new THREE.Geometry();

					// Plot the verticies
					barGeometry.vertices.push(new THREE.Vector3(xPos-(barWidth/2), 0, zPos-(barWidth/2)));
					barGeometry.vertices.push(new THREE.Vector3(xPos-(barWidth/2), 0, zPos+(barWidth/2)));

					barGeometry.vertices.push(new THREE.Vector3(xPos+(barWidth/2), 0, zPos-(barWidth/2)));
					barGeometry.vertices.push(new THREE.Vector3(xPos+(barWidth/2), 0, zPos+(barWidth/2)));

					barGeometry.vertices.push(new THREE.Vector3(xPos-(barWidth/2), factoredValue, zPos-(barWidth/2)));
					barGeometry.vertices.push(new THREE.Vector3(xPos-(barWidth/2), factoredValue, zPos+(barWidth/2)));

					barGeometry.vertices.push(new THREE.Vector3(xPos+(barWidth/2), factoredValue, zPos-(barWidth/2)));
					barGeometry.vertices.push(new THREE.Vector3(xPos+(barWidth/2), factoredValue, zPos+(barWidth/2)));

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
					front.vertices.push(new THREE.Vector3(xPos-(barWidth/2), factoredValue, zPos+(barWidth/2)));
					front.vertices.push(new THREE.Vector3(xPos+(barWidth/2), factoredValue, zPos+(barWidth/2)));
					front.vertices.push(new THREE.Vector3(xPos+(barWidth/2), 0, zPos+(barWidth/2)));

					var frontLine = new THREE.Line(front, new THREE.LineBasicMaterial({
						color: color
					}));

					barObject.add(frontLine);

					var back = new THREE.Geometry();
					back.vertices.push(new THREE.Vector3(xPos-(barWidth/2), 0, zPos-(barWidth/2)));
					back.vertices.push(new THREE.Vector3(xPos-(barWidth/2), factoredValue, zPos-(barWidth/2)));
					back.vertices.push(new THREE.Vector3(xPos+(barWidth/2), factoredValue, zPos-(barWidth/2)));
					back.vertices.push(new THREE.Vector3(xPos+(barWidth/2), 0, zPos-(barWidth/2)));

					var backLine = new THREE.Line(back, new THREE.LineBasicMaterial({
						color: color
					}));

					barObject.add(backLine);

					var left = new THREE.Geometry();
					left.vertices.push(new THREE.Vector3(xPos+(barWidth/2), 0, zPos+(barWidth/2)));
					left.vertices.push(new THREE.Vector3(xPos+(barWidth/2), factoredValue, zPos+(barWidth/2)));
					left.vertices.push(new THREE.Vector3(xPos+(barWidth/2), factoredValue, zPos-(barWidth/2)));
					left.vertices.push(new THREE.Vector3(xPos+(barWidth/2), 0, zPos-(barWidth/2)));

					var leftLine = new THREE.Line(left, new THREE.LineBasicMaterial({
						color: color
					}));

					barObject.add(leftLine);

					var right = new THREE.Geometry();
					right.vertices.push(new THREE.Vector3(xPos-(barWidth/2), 0, zPos+(barWidth/2)));
					right.vertices.push(new THREE.Vector3(xPos-(barWidth/2), factoredValue, zPos+(barWidth/2)));
					right.vertices.push(new THREE.Vector3(xPos-(barWidth/2), factoredValue, zPos-(barWidth/2)));
					right.vertices.push(new THREE.Vector3(xPos-(barWidth/2), 0, zPos-(barWidth/2)));

					var rightLine = new THREE.Line(right, new THREE.LineBasicMaterial({
						color: color,
						side: THREE.DoubleSide
					}));

					barObject.add(rightLine);

					if (viewLabels) {
						var valueGeometry = new THREE.TextGeometry(originalValue, {
							font: barLabelFont,
	    	 				size: barLabelSize,
							height: .2
						});
						
						var valueMesh = new THREE.Mesh(valueGeometry, new THREE.MeshBasicMaterial({
							color: barLabelColor
						}));

						var valueArea = new THREE.Box3().setFromObject(valueMesh);

						valueMesh.position.x = xPos-(valueArea.size().x/2);
						valueMesh.position.y = factoredValue + 2;
						valueMesh.position.z = zPos;

						barObject.add(valueMesh);
					}

					graphObject.add(barObject);

					// Return the created bar

					return barObject;
				};

				var createColumnLabel = function(col, text) {
					var textGeometry = new THREE.TextGeometry(text, {
						font: columnLabelFont,
    	 				size: columnLabelSize,
						height: .2
					});
					
					var textMesh = new THREE.Mesh(textGeometry, new THREE.MeshBasicMaterial({
						color: columnLabelColor
					}) );

					textMesh.rotation.x = (Math.PI/2)*-1;
					textMesh.rotation.z += (Math.PI/2);

					var textBoxArea = new THREE.Box3().setFromObject(textMesh);

					textMesh.position.z += (self._baseLength/2) + textBoxArea.size().z + 3;

					textMesh.position.x = (self._baseWidth/2)*-1;
					textMesh.position.x += (self._baseEdge + (barWidth/2) + (textBoxArea.size().x/2)) + (col*columnSpace) + (col*barWidth);

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

					textMesh.position.x += (self._baseWidth/2) + 3;

					textMesh.position.z -= (self._baseLength/2);
					textMesh.position.z += self._baseEdge + (barWidth/2) + (row*rowSpace) + (row*barWidth) + (textBoxArea.size().z/2);

					graphObject.add(textMesh);
				};

	        	var bindEvents = function() {
		        	// These variables are required for rotating the graph
	        		var startPositionX = null,
	        			startRotationX = null;

	        		// mouse events
	        		self._renderer.domElement.addEventListener("mousedown", function(e) {
	        			e.preventDefault();
	        			e.stopPropagation();

        			 	startPositionX = e.clientX-(window.innerWidth/2);
	        			startRotationX = graphObject.rotation.y;

	        			startRendering();
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

	        			stopRendering();
			        }, false );
        			
        			self._renderer.domElement.addEventListener( "mouseout", function(e) {
			        	startPositionX = null;
	        			targetRotationX = null;

	        			stopRendering();
			        }, false );

			        // touch events
	        		self._renderer.domElement.addEventListener("touchstart", function(e) {
				        if (e.touches.length == 1) {
			                e.preventDefault();

	        			 	startPositionX = e.touches[0].pageX-(window.innerWidth/2);
	        				startRotationX = graphObject.rotation.y;

	        				startRendering();
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

	        			stopRendering();
			        }, false );

			        self._renderer.domElement.addEventListener( "touchcancel", function(e) {
			        	startPositionX = null;
	        			targetRotationX = null;

	        			stopRendering();
			        }, false );
	        	};

	        	var update = function() {
	        		if ((targetRotationX) && (graphObject)) {
	        			var newRotation = ( targetRotationX - graphObject.rotation.y ) * 0.1;

	        			graphObject.rotation.y += newRotation;
	        		}
	        	};

	        	var startRendering = function() {
	        		this._keepRenderingScene = true;

	        		render();
	        	};

	        	var stopRendering = function() {
	        		this._keepRenderingScene = false;
	        	};

				var render = function () {
					if (this._keepRenderingScene) requestAnimationFrame( render );

					update();

					self._renderer.render(self._scene, self._camera);
				};

        		this._container = document.getElementById(container);

        		this.createScene();

        		// Give it a name just for simplicity
        		if ((graphData) && (graphData.name)) graphObject.name = graphData.name;
        		else graphObject.name = "barGraph";

				// check that we've have some data passed in
				if (graphData) {
	        		// Setting up the base plane for the bar chart
					// Get the length (the z axis)
					if ((graphData.rowLabels) && (graphData.rowLabels.values)) {
						if (graphData.data.length > graphData.rowLabels.values.length) this._baseLength = (barWidth*graphData.data.length) + (rowSpace*graphData.data.length) - rowSpace + (this._baseEdge*2);
						else this._baseLength = (barWidth*graphData.rowLabels.values.length) + (rowSpace*graphData.rowLabels.values.length) - rowSpace + (this._baseEdge*2);
					}
					else if (graphData.data) this._baseLength = (barWidth*graphData.data.length) + (rowSpace*graphData.data.length) - rowSpace + (this._baseEdge*2);

					// Figure out what the base width should be (the x axis)
					var maxData = 0;

					for (var i=0; i<graphData.data.length; i++) {
						if ((graphData.data[i].values) && (graphData.data[i].values.length > maxData)) maxData = graphData.data[i].values.length;
					}

					if ((graphData.columnLabels) && (graphData.columnLabels.values)) {
						if (maxData) {
							if (maxData > graphData.columnLabels.values.length) this._baseWidth = (barWidth*maxData) + (columnSpace*maxData) - columnSpace + (this._baseEdge*2);
							else this._baseWidth = (barWidth*graphData.columnLabels.values.length) + (columnSpace*graphData.columnLabels.values.length) - columnSpace + (this._baseEdge*2);
						}
						else this._baseWidth = (barWidth*graphData.columnLabels.values.length) + (columnSpace*graphData.columnLabels.values.length) - columnSpace + (this._baseEdge*2);
					}
					else if (maxData) this._baseWidth = (barWidth*maxData) + (columnSpace*maxData) - columnSpace + (this._baseEdge*2);

					// add it to the scene
					this.createBase(graphObject);

					// Get the max value so we can factor values
					var maxDataVal = 0;

    				for (var i=0; i<graphData.data.length; i++) {
    					for (var j=0; j<graphData.data[i].values.length; j++) {
							if (graphData.data[i].values[j] > maxDataVal) maxDataVal = graphData.data[i].values[j];
    					}
					}

					// Normalize the data so that the max value is at 100 units tall
					var originalMaxValue = maxDataVal;

					maxDataVal = maxDataValBeforeFactor;

    				for (var i=0; i<graphData.data.length; i++) {
    					graphData.data[i].factoredValues = [];

    					for (var j=0; j<graphData.data[i].values.length; j++) {
    						var percentageOfMax = graphData.data[i].values[j]/originalMaxValue;

							graphData.data[i].factoredValues.push(maxDataVal*percentageOfMax);			
    					}
					}

					// Add the measurement lines to the grap assuming it has been configured
					if (showMeasurementLines) this.createMeasurementsLines(graphObject, measurementLineColor, measurementLabelFont, measurementLabelSize, measurementLabelColor, maxDataValBeforeFactor, originalMaxValue);

    				for (var i=0; i<graphData.data.length; i++) {
    					// Figure out the color for the bar. Pick a random one is one isn't defined
    					var barColor = null;

    					if (graphData.data[i].color !== undefined) barColor = new THREE.Color(graphData.data[i].color);
    					else barColor = new THREE.Color("#"+Math.floor(Math.random()*16777215).toString(16));

    					// Local bar settings for labels overwrite global ones
    					var makeBarsLabelsVisible = showBarLabels;
    					if (graphData.data[i].showBarLabels !== undefined) makeBarsLabelsVisible = graphData.data[i].showBarLabels;

    					for (var j=0; j<graphData.data[i].values.length; j++) {
							bars.push(createBar(i, j, graphData.data[i].factoredValues[j], graphData.data[i].values[j], barColor, makeBarsLabelsVisible));
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
				}

				// Add the graph to the scene
				this._scene.add(graphObject);

        		// If we don't have camera graphData then we'll try and determine the camera position 
    			if ((!graphData) || (!graphData.camera)) this.calculateCamera(graphObject);

    			// If we don't have camera graphData then we'll try and determine the cameras lookat 
    			if ((!graphData) || (!graphData.lookAt)) this.calculateLookAt(graphObject);

				// Set the initial rotation
				if (this._startRotation) graphObject.rotation.y = this._startRotation;

    			// bind all mouse/touch events
				if (!locked) bindEvents();

				this.addCamera();

        		if (this._camera) render();
        	}
        }
    };

    if(!window.tdv) window.tdv = tdv;
})();