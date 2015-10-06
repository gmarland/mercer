(function () {
    var Mercer = function(data) {
        return {
        	// The div that will contain the visualization
        	_container: null,

			// The actual graph object
			_graphObject: new THREE.Object3D(),


        	// Switch to dermine if the renderer should keep ticking to allow animations
        	_keepRenderingScene: false,

        	// Used when rotating the graph
        	_targetRotationX: null,

            _fov: 75,

        	// Camera settings

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

        	// Details of the graph
            _graphHeight: 150,
            _graphWidth: null, // the base width which will be show if no data is added
            _graphLength: null, // the base length which will be show if no data is added

			_baseEdge: 10, // the distance around the graphing area for the base
			_baseThickness: 1, // the thickness of the graph base
			_baseColor: 0xececec, // the color for the base

			_locked: false, // whether or not to allow the rotation of the graph

			_showMeasurementLines: true, // whether or not to show measurement lines
			_numberOfMeasurementLines: 10,
			_measurementLineColor: 0x222222, // the default color of the measurement lines
			_measurementLabelFont: "helvetiker", // the font for the measurement label
			_measurementLabelSize: 3.5, // the font size for the measurement label
			_measurementLabelColor: 0x000000, // the default color for the measurement label

        	//Skybox
        	_skyboxColor: 0xffffff,
        	_skyboxOpacity: 1,

        	// ----- Method to overwrite the global options 

        	setGlobalOptions: function(graphData) {
        		if (graphData !== undefined) {
        			if (graphData.graphHeight !== undefined) this._graphHeight = graphData.graphHeight;

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

        			if (graphData.baseThickness !== undefined) this._baseThickness = graphData.baseThickness;

        			if (graphData.baseWidth !== undefined) this._graphWidth = graphData.baseWidth;

        			if (graphData.baseLength !== undefined) this._graphLength = graphData.baseLength;

        			if (graphData.baseColor !== undefined) this._baseColor = graphData.baseColor;

        			if (graphData.locked !== undefined) this._locked = graphData.locked;

        			if (graphData.showMeasurementLines !== undefined) this._showMeasurementLines = graphData.showMeasurementLines;

        			if (graphData.measurementLineColor !== undefined) this._measurementLineColor = new THREE.Color(graphData.measurementLineColor);

        			if (graphData.measurementLabelFont !== undefined) this._measurementLabelFont = graphData.measurementLabelFont;

        			if (graphData.measurementLabelSize !== undefined) this._measurementLabelSize = graphData.measurementLabelSize;

        			if (graphData.measurementLabelColor !== undefined) this._measurementLabelColor = new THREE.Color(graphData.measurementLabelColor);
        		}
        	},

        	// -----  Function for creating the scene

        	createScene: function() {
        		var containerWidth = parseInt(this._container.style.width,10), 
        			containerHeight = parseInt(this._container.style.height,10);

				this._scene = new THREE.Scene();

				this._renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
				this._renderer.setSize(containerWidth, containerHeight);
				this._renderer.setClearColor(this._skyboxColor, this._skyboxOpacity);

				this._container.appendChild(this._renderer.domElement);
        	},

        	// ----- Functions for setting up the camera

        	// Add the camera to the scene
        	addCamera: function() {
        		var containerWidth = parseInt(this._container.style.width,10), 
        			containerHeight = parseInt(this._container.style.height,10),
                    aspect = containerWidth /containerHeight;
		      
				var directionalLight = new THREE.PointLight(this._directionalLight.color, this._directionalLight.intensity); 
				directionalLight.position.set(this._cameraSettings.position.x, this._cameraSettings.position.y, this._cameraSettings.position.z);
 
				this._scene.add(directionalLight);

                // take the maximum distance from the camera add 100 and double it
                var far = ((Math.max(this._cameraSettings.position.x, this._cameraSettings.position.y, this._cameraSettings.position.z)+1000)*2);

				this._camera = new THREE.PerspectiveCamera(this._fov, aspect, 0.1, this._far);

				this._camera.position.x = this._cameraSettings.position.x;
				this._camera.position.y = this._cameraSettings.position.y;
				this._camera.position.z = this._cameraSettings.position.z;

				this._camera.lookAt(new THREE.Vector3(this._cameraSettings.lookAt.x, this._cameraSettings.lookAt.y, this._cameraSettings.lookAt.z));
        	},
				
			// This attempts to find a camera position based on the graph object dimensions
			calculateCamera: function() {
                var containerWidth = parseInt(this._container.style.width,10), 
                    containerHeight = parseInt(this._container.style.height,10),
                    aspect = containerWidth /containerHeight;

                var containerWidth = parseInt(this._container.style.width,10), 
                    containerHeight = parseInt(this._container.style.height,10);

				var graphObjectArea = new THREE.Box3().setFromObject(this._graphObject);

    			this._cameraSettings.position.x = 0;
    			this._cameraSettings.position.y = (graphObjectArea.size().y/2);

                var vFOV = this._fov * Math.PI / 180; 

                var dist = (graphObjectArea.size().x/aspect)/2/Math.tan((vFOV / 2));

                this._cameraSettings.position.z = dist+(graphObjectArea.size().z/2)+(graphObjectArea.size().y/4);
        	},

        	// Attempts to determine where the camera should be looking based on the graph settings
        	calculateLookAt: function() {
				var graphObjectArea = new THREE.Box3().setFromObject(this._graphObject);

	        	this._cameraSettings.lookAt.x = 0;
	        	this._cameraSettings.lookAt.y = 0;
	        	this._cameraSettings.lookAt.z = 0;
        	},

        	// ----- Functions for drawing the base

        	createBase: function() {
        		var baseGeometry = new THREE.BoxGeometry(this._graphWidth, this._baseThickness, this._graphLength),
					baseMesh = new THREE.Mesh(baseGeometry, new THREE.MeshLambertMaterial({
						color: this._baseColor, 
						side: THREE.DoubleSide
					}));

				baseMesh.position.y -= (this._baseThickness/2);

				this._graphObject.add(baseMesh);
        	},

        	// ----- Functions for drawing the measurement lines

			createMeasurementsLines: function(minValue, maxValue) {
				var stepsEachLine = Math.ceil(this._graphHeight/this._numberOfMeasurementLines);

				for (var i=1; i<=this._numberOfMeasurementLines; i++) {
					var mesurementLineObject = new THREE.Object3D();

					var measureLineGeometry = new THREE.Geometry();
					measureLineGeometry.vertices.push(new THREE.Vector3((this._graphWidth/2)*-1, (stepsEachLine*i), (this._graphLength/2)));
					measureLineGeometry.vertices.push(new THREE.Vector3((this._graphWidth/2)*-1, (stepsEachLine*i), (this._graphLength/2)*-1));
					measureLineGeometry.vertices.push(new THREE.Vector3((this._graphWidth/2), (stepsEachLine*i), (this._graphLength/2)*-1));

					var measureLine = new THREE.Line(measureLineGeometry, new THREE.LineBasicMaterial({
						color: this._measurementLineColor,
						side: THREE.DoubleSide
					}));

					mesurementLineObject.add(measureLine);

					var textGeometry = new THREE.TextGeometry(minValue+Math.round((maxValue-minValue)/this._numberOfMeasurementLines)*i, {
						font: this._measurementLabelFont,
    	 				size: this._measurementLabelSize,
						height: .2
					});
					
					var textMesh = new THREE.Mesh(textGeometry, new THREE.MeshBasicMaterial({
						color: this._measurementLabelColor
					}));

					var textBoxArea = new THREE.Box3().setFromObject(textMesh);

					textMesh.position.x += ((this._graphWidth/2)+5);
					textMesh.position.y += ((stepsEachLine*i)-(textBoxArea.size().y/2));
					textMesh.position.z -= (this._graphLength/2);

					mesurementLineObject.add(textMesh);

					this._graphObject.add(mesurementLineObject);
				}
			},

			// ----- Event binding

			// Binding mouse events
        	bindEvents: function() {
        		var self = this;

	        	// These variables are required for rotating the graph
        		var startPositionX = null,
        			startRotationX = null;

        		// mouse events
        		this._renderer.domElement.addEventListener("mousedown", function(e) {
        			e.preventDefault();
        			e.stopPropagation();

    			 	startPositionX = e.clientX-(window.innerWidth/2);
        			startRotationX = self._graphObject.rotation.y;

        			self.startRendering();
        		}, false );

    			this._renderer.domElement.addEventListener( "mousemove", function(e) {
        			e.preventDefault();
        			e.stopPropagation();

    				if (startPositionX) {
      	  				var mouseX = e.clientX-(window.innerWidth/2);
      	  				self._targetRotationX = startRotationX+(mouseX - startPositionX) * 0.02;
      	  			}
		        }, false );

		        this._renderer.domElement.addEventListener( "mouseup", function(e) {
        			e.preventDefault();
        			e.stopPropagation();

		        	startPositionX = null;
        			self._targetRotationX = null;

        			self.stopRendering();
		        }, false );
    			
    			this._renderer.domElement.addEventListener( "mouseout", function(e) {
		        	startPositionX = null;
        			self._targetRotationX = null;

        			self.stopRendering();
		        }, false );

		        // touch events
        		this._renderer.domElement.addEventListener("touchstart", function(e) {
			        if (e.touches.length == 1) {
		                e.preventDefault();

        			 	startPositionX = e.touches[0].pageX-(window.innerWidth/2);
        				startRotationX = self._graphObject.rotation.y;

        				self.startRendering();
	        		}
        		}, false );

    			this._renderer.domElement.addEventListener( "touchmove", function(e) {
    				if (startPositionX) {
				        if (e.touches.length == 1) {
			                e.preventDefault();

	      	  				var mouseX = e.touches[0].pageX-(window.innerWidth/2);
	      	  				self._targetRotationX = (mouseX - startPositionX) * 0.05;
	      	  			}
      	  			}
		        }, false );

		        this._renderer.domElement.addEventListener( "touchend", function(e) {
		        	startPositionX = null;
        			self._targetRotationX = null;

        			self.stopRendering();
		        }, false );

		        this._renderer.domElement.addEventListener( "touchcancel", function(e) {
		        	startPositionX = null;
        			self._targetRotationX = null;

        			self.stopRendering();
		        }, false );
        	},

        	// ----- Functions for rendering the graphs

        	updateScene: function() {
        		if ((this._targetRotationX) && (this._graphObject)) {
        			var newRotation = ( this._targetRotationX - this._graphObject.rotation.y ) * 0.1;

        			this._graphObject.rotation.y += newRotation;
        		}
        	},

        	startRendering: function() {
        		this._keepRenderingScene = true;

        		this.render();
        	},

        	stopRendering: function() {
        		this._keepRenderingScene = false;
        	},

			render: function () {
				var self = this;

				var renderScene = function () {
					if (self._keepRenderingScene) requestAnimationFrame( renderScene );

					self.updateScene();

					self._renderer.render(self._scene, self._camera);
				};

				renderScene();
			},

			// ----- Some random functions used through graphs

			// Figures out the closet 10, 100, 100 etc the distance between the min and max meets
			getRoundingInteger: function(min, max) {
				var diff = max-min;

				if (diff === 0) return 1;
				else {
					var multiplier = 0;

					while (true) {
						if ((diff >= Math.pow(10, multiplier)) && (diff < Math.pow(10, multiplier+1))) return Math.pow(10, (multiplier));

						multiplier++;
					}
				}
			},

            getMaxValueCount: function(data) {
                var maxValueCount = 0;

                for (var i=0; i<data.length; i++) {
                    if ((data[i].values != undefined) && (data[i].values.length > maxValueCount)) maxValueCount = data[i].values.length;
                }

                return maxValueCount;
            },

			// Returns the maximum value in a data set
			getMaxDataValue: function(data) {		
				var maxDataVal = 0;

				for (var i=0; i<data.length; i++) {
					for (var j=0; j<data[i].values.length; j++) {
						if (data[i].values[j] > maxDataVal) maxDataVal = data[i].values[j];
					}
				}

				return maxDataVal;
			},

            // Returns the maximum value in a data set for x, y or z
            getMaxDataValues: function (data) {
                var maxXDataVal = null,
                    maxYDataVal = null,
                    maxZDataVal = null;

                for (var i=0; i<data.length; i++) {
                    for (var j=0; j<data[i].values.length; j++) {
                        if ((data[i].values[j].x != undefined) && ((!maxXDataVal) || (data[i].values[j].x > maxXDataVal))) maxXDataVal = data[i].values[j].x;
                        if ((data[i].values[j].y != undefined) && ((!maxYDataVal) || (data[i].values[j].y > maxYDataVal))) maxYDataVal = data[i].values[j].y;
                        if ((data[i].values[j].z != undefined) && ((!maxZDataVal) || (data[i].values[j].z > maxZDataVal))) maxZDataVal = data[i].values[j].z;
                    }
                }

                return {
                    x: maxXDataVal,
                    y: maxYDataVal,
                    z: maxZDataVal
                };
            },

            // Returns the minimum value in a data set
            getMinDataValue: function(data) {       
                var minDataVal = null;

                for (var i=0; i<data.length; i++) {
                    for (var j=0; j<data[i].values.length; j++) {
                        if ((!minDataVal) || (data[i].values[j] < minDataVal)) minDataVal = data[i].values[j];
                    }
                }

                return minDataVal;
            },

            // Returns the minimum value in a data set for x, y or z
            getMinDataValues: function(data) {       
                var minXDataVal = null,
                    minYDataVal = null,
                    minZDataVal = null;

                for (var i=0; i<data.length; i++) {
                    for (var j=0; j<data[i].values.length; j++) {
                        if ((data[i].values[j].x != undefined) && ((!minXDataVal) || (data[i].values[j].x < minXDataVal))) minXDataVal = data[i].values[j].x;
                        if ((data[i].values[j].y != undefined) && ((!minYDataVal) || (data[i].values[j].y < minYDataVal))) minYDataVal = data[i].values[j].y;
                        if ((data[i].values[j].z != undefined) && ((!minZDataVal) || (data[i].values[j].z < minZDataVal))) minZDataVal = data[i].values[j].z;
                    }
                }

                return {
                    x: minXDataVal,
                    y: minYDataVal,
                    z: minZDataVal
                };
            },


			// ----- Functions for drawing the graphs

        	// Calling will create a standard line graph
        	LineGraph: function(container, graphData) {
				var self = this;

        		var lineWidth = 2.5, // the width of the lines on the graph
        			rowSpace = 30, // the space between each row
        			rowLabelFont = "helvetiker", // the font for the row label
        			rowLabelSize = 4, // the font size for the row label
        			rowLabelColor = 0x000000, // the default color for the row label
        			pointSpace = 5; // the space between each column in a row

        		// Allow the override using the graphData options if they exist
        		if (graphData !== undefined) {
        			if (graphData.lineWidth !== undefined) lineWidth = graphData.lineWidth;
        			
        			if (graphData.rowSpace !== undefined) rowSpace = graphData.rowSpace;

        			if (graphData.rowLabels !== undefined) {
	        			if (graphData.rowLabels.fontFamily !== undefined) rowLabelFont = graphData.rowLabels.fontFamily;

	        			if (graphData.rowLabels.size !== undefined) rowLabelSize = graphData.rowLabels.size;

	        			if (graphData.rowLabels.color !== undefined) rowLabelColor = new THREE.Color(graphData.rowLabels.color);
	        		}

        			if (graphData.pointSpace !== undefined) pointSpace = graphData.pointSpace;

        			this.setGlobalOptions(graphData);
        		}

        		// The method to create the lines
				var createLineGraph = function(row, factoredValues, originalValues, color) {	
	        		var lineObject = new THREE.Object3D();

	        		// this is our zero
					var xPosStart = (((self._graphWidth/2)*-1) + self._baseEdge), 
						zPosStart = (((self._graphLength/2)*-1) + self._baseEdge);

					// Generate the outline
					var lineGeometry = new THREE.Geometry();
					for (var i=0; i<factoredValues.length; i++) {
						lineGeometry.vertices.push(new THREE.Vector3(factoredValues[i].x-(self._graphWidth/2), factoredValues[i].y, zPosStart+(row*rowSpace)+(row*lineWidth)));
					}

					var lineMesh = new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({
						color: color,
					 	linewidth: lineWidth
					}));

					lineObject.add(lineMesh);

					self._graphObject.add(lineObject);
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

					textMesh.position.x += (self._graphWidth/2) + 3;

					textMesh.position.z -= (self._graphLength/2);
					textMesh.position.z += self._baseEdge + (row*rowSpace) + (row*lineWidth) + (textBoxArea.size().z/2);

					self._graphObject.add(textMesh);
				};

        		this._container = document.getElementById(container);

        		this.createScene();

        		// Give it a name just for simplicity
        		if ((graphData) && (graphData.name)) this._graphObject.name = graphData.name;
        		else this._graphObject.name = "LineGraph";

				// check that we've have some data passed in
				if (graphData) {
                    var maxValueCount = this.getMaxValueCount(graphData.data),
                        minValues = this.getMinDataValues(graphData.data),
                        maxValues = this.getMaxDataValues(graphData.data);

					var rangeStepX = this.getRoundingInteger(minValues.x, maxValues.x),
                        rangeStepY = this.getRoundingInteger(minValues.y, maxValues.y);

                    var minGraphRangeX = (minValues.x - minValues.x %  rangeStepX);
                    if (minGraphRangeX != 0) minGraphRangeX -= rangeStepX;

                    var maxGraphRangeX = (rangeStepX - maxValues.x % rangeStepX) + maxValues.x;

                    var minGraphRangeY = (minValues.y - minValues.y %  rangeStepY);
                    if (minGraphRangeY != 0) minGraphRangeY -= rangeStepY;

                    var maxGraphRangeY = (rangeStepY - maxValues.y % rangeStepY) + maxValues.y;

                    // Setting up the base for the line graph

                    if (!this._graphLength) {
                        // Get the length (the z axis)
                        if ((graphData.rowLabels) && (graphData.rowLabels.values)) {
                            if (graphData.data.length > graphData.rowLabels.values.length) this._graphLength = (lineWidth*graphData.data.length) + (rowSpace*graphData.data.length) - rowSpace + (this._baseEdge*2);
                            else this._graphLength = (lineWidth*graphData.rowLabels.values.length) + (rowSpace*graphData.rowLabels.values.length) - rowSpace + (this._baseEdge*2);
                        }
                        else if (graphData.data) this._graphLength = (lineWidth*graphData.data.length) + (rowSpace*graphData.data.length) - rowSpace + (this._baseEdge*2);
                    }

                    if (!this._graphWidth) {
                        var widthRangeStep = rangeStepX;
                        if (widthRangeStep >= 10) widthRangeStep = (widthRangeStep/10)*2;

                        this._graphWidth = ((maxGraphRangeX-minGraphRangeX)/widthRangeStep)*pointSpace;
                    }

                    // add it to the scene
                    this.createBase();

                    // Figure out how we need to modify the points to fit on the graph
					var pointModifierX = this._graphWidth/(maxGraphRangeX-minGraphRangeX),
                        pointModifierY = this._graphHeight/(maxGraphRangeY-minGraphRangeY);

    				for (var i=0; i<graphData.data.length; i++) {
                        // sort byt the x value, we have to do this so they arent crazy placed
                        graphData.data[i].values.sort(function(a,b) {
                            return a.x > b.x ? 1 : a.x < b.x ? -1 : 0;
                        });

                        // we have x values ordered so we need to modify them to sit on the graph
	    				graphData.data[i].factoredValues = [];

	    				for (var j=0; j<graphData.data[i].values.length; j++) {
	    					graphData.data[i].factoredValues.push({
                                x: (graphData.data[i].values[j].x-minGraphRangeX)*pointModifierX,
                                y: (graphData.data[i].values[j].y-minGraphRangeY)*pointModifierY
                            });
	    				}
					}

					// Add the measurement lines
					if (this._showMeasurementLines) this.createMeasurementsLines(minGraphRangeY, maxGraphRangeY, rangeStepY);

					for (var i=0; i<graphData.data.length; i++) {
    					// Figure out the color for the bar. Pick a random one is one isn't defined
    					var areaColor = null;

    					if (graphData.data[i].color !== undefined) areaColor = new THREE.Color(graphData.data[i].color);
    					else areaColor = new THREE.Color("#"+Math.floor(Math.random()*16777215).toString(16));

						createLineGraph(i, graphData.data[i].factoredValues, graphData.data[i].values, areaColor);

                        if (graphData.data[i].title) createRowLabel(i, graphData.data[i].title);
					}
				}

                // position the object so it will view well
                var graphObjectArea = new THREE.Box3().setFromObject(this._graphObject);
                this._graphObject.position.y -= ((graphObjectArea.size().y/2)-(graphObjectArea.size().y/6));

				// Add the graph to the scene
				this._scene.add(this._graphObject);

        		// If we don't have camera graphData then we'll try and determine the camera position 
    			if ((!graphData) || (!graphData.camera)) this.calculateCamera();

    			// If we don't have camera graphData then we'll try and determine the cameras lookat 
    			if ((!graphData) || (!graphData.lookAt)) this.calculateLookAt();

    			// bind all mouse/touch events
				if (!this._locked) this.bindEvents();

				this.addCamera();

                // Set the initial rotation
                if (this._startRotation) this._graphObject.rotation.y = this._startRotation;

        		if (this._camera) this.render();
        	},

        	// Calling will create a standard area chart
        	AreaChart: function(container, graphData) {
				var self = this;

        		var areaWidth = 4, // the width of the area graph
        			rowSpace = 30, // the space between each row
        			rowLabelFont = "helvetiker", // the font for the row label
        			rowLabelSize = 4, // the font size for the row label
        			rowLabelColor = 0x000000, // the default color for the row label
        			pointSpace = 15; // the space between each column in a row

        		// Allow the override using the graphData options if they exist
        		if (graphData !== undefined) {
        			if (graphData.areaWidth !== undefined) areaWidth = graphData.areaWidth;
        			
        			if (graphData.rowSpace !== undefined) rowSpace = graphData.rowSpace;

        			if (graphData.rowLabels !== undefined) {
	        			if (graphData.rowLabels.fontFamily !== undefined) rowLabelFont = graphData.rowLabels.fontFamily;

	        			if (graphData.rowLabels.size !== undefined) rowLabelSize = graphData.rowLabels.size;

	        			if (graphData.rowLabels.color !== undefined) rowLabelColor = new THREE.Color(graphData.rowLabels.color);
	        		}

        			if (graphData.pointSpace !== undefined) pointSpace = graphData.pointSpace;

        			this.setGlobalOptions(graphData);
        		}


        		// The method to create the area chart.
				var createAreaChart = function(row, factoredValues, originalValues, color) {	
	        		var areaObject = new THREE.Object3D();

					var xPosStart = (((self._graphWidth/2)*-1) + self._baseEdge), // this is our zero
						zPosStart = (((self._graphLength/2)*-1) + self._baseEdge);

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

					self._graphObject.add(areaObject);
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

					textMesh.position.x += (self._graphWidth/2) + 3;

					textMesh.position.z -= (self._graphLength/2);
					textMesh.position.z += self._baseEdge + (row*rowSpace) + (row*areaWidth) + (textBoxArea.size().z/2);

					self._graphObject.add(textMesh);
				};

        		this._container = document.getElementById(container);

        		this.createScene();

        		// Give it a name just for simplicity
        		if ((graphData) && (graphData.name)) this._graphObject.name = graphData.name;
        		else this._graphObject.name = "areaChart";

				// check that we've have some data passed in
				if (graphData) {
        			// Setting up the base plane for the area chart
    				// Get the length (the z axis)
					if ((graphData.rowLabels) && (graphData.rowLabels.values)) {
						if (graphData.data.length > graphData.rowLabels.values.length) this._graphLength = (areaWidth*graphData.data.length) + (rowSpace*graphData.data.length) - rowSpace + (this._baseEdge*2);
						else this._graphLength = (areaWidth*graphData.rowLabels.values.length) + (rowSpace*graphData.rowLabels.values.length) - rowSpace + (this._baseEdge*2);
					}
					else if (graphData.data) this._graphLength = (areaWidth*graphData.data.length) + (rowSpace*graphData.data.length) - rowSpace + (this._baseEdge*2);

    				// Figure out what the base width should be (the x axis)
    				var maxData = 0;

    				for (var i=0; i<graphData.data.length; i++) {
						if ((graphData.data[i].values) && (graphData.data[i].values.length > maxData)) maxData = graphData.data[i].values.length;
					}

					if ((graphData.columnLabels) && (graphData.columnLabels.values)) {
						if (maxData) {
							if (maxData > graphData.columnLabels.values.length) this._graphWidth = (pointSpace*maxData) - pointSpace + (this._baseEdge*2);
							else this._graphWidth = (pointSpace*graphData.columnLabels.values.length) - pointSpace + (this._baseEdge*2);
						}
						else this._graphWidth = (pointSpace*graphData.columnLabels.values.length) - pointSpace + (this._baseEdge*2);
					}
					else if (maxData) this._graphWidth = (pointSpace*maxData) - pointSpace + (this._baseEdge*2);

					// add it to the scene
					this.createBase();

					// Get the max value so we can factor values
					var minDataValue = this.getMinDataValue(graphData.data),
						maxDataValue = this.getMaxDataValue(graphData.data);

					var rangeStep = this.getRoundingInteger(minDataValue, maxDataValue);

					var minGraphRange = (minDataValue - minDataValue %  rangeStep);
					if (minGraphRange != 0) minGraphRange -= rangeStep;

					var maxGraphRange = (rangeStep - maxDataValue % rangeStep) + maxDataValue;

					var pointModifier = this._graphHeight/(maxGraphRange-minGraphRange);

    				for (var i=0; i<graphData.data.length; i++) {
	    				graphData.data[i].factoredValues = [];

	    				for (var j=0; j<graphData.data[i].values.length; j++) {
	    					graphData.data[i].factoredValues.push((graphData.data[i].values[j]-minGraphRange)*pointModifier);
	    				}
					}

					// Add the measurement lines
					if (this._showMeasurementLines) this.createMeasurementsLines(minGraphRange, maxGraphRange);

					for (var i=0; i<graphData.data.length; i++) {
    					// Figure out the color for the bar. Pick a random one is one isn't defined
    					var areaColor = null;

    					if (graphData.data[i].color !== undefined) areaColor = new THREE.Color(graphData.data[i].color);
    					else areaColor = new THREE.Color("#"+Math.floor(Math.random()*16777215).toString(16));

						createAreaChart(i, graphData.data[i].factoredValues, graphData.data[i].values, areaColor);
					}

					if ((graphData.rowLabels) && (graphData.rowLabels.values)) {
						for (var i=0; i<graphData.rowLabels.values.length; i++) {
							createRowLabel(i, graphData.rowLabels.values[i]);
						}
					}
				}

                // position the object so it will view well
                var graphObjectArea = new THREE.Box3().setFromObject(this._graphObject);
                this._graphObject.position.y -= ((graphObjectArea.size().y/2)-(graphObjectArea.size().y/6));

				// Add the graph to the scene
				this._scene.add(this._graphObject);

        		// If we don't have camera graphData then we'll try and determine the camera position 
    			if ((!graphData) || (!graphData.camera)) this.calculateCamera();

    			// If we don't have camera graphData then we'll try and determine the cameras lookat 
    			if ((!graphData) || (!graphData.lookAt)) this.calculateLookAt();

				// Set the initial rotation
				if (this._startRotation) this._graphObject.rotation.y = this._startRotation;

    			// bind all mouse/touch events
				if (!this._locked) this.bindEvents();

				this.addCamera();

        		if (this._camera) this.render();
        	},

        	// Calling will create a standard bar chart
        	BarChart: function(container, graphData) {
				var self = this;

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
        			columnLabelColor = 0x000000; // the default color for the col label

        		// Allow the override using the graphData options if they exist
        		if (graphData !== undefined) {
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

        			if (graphData.columnLabels !== undefined) {
	        			if (graphData.columnLabels.fontFamily !== undefined) columnLabelFont = graphData.columnLabels.fontFamily;

	        			if (graphData.columnLabels.size !== undefined) columnLabelSize = graphData.columnLabels.size;

	        			if (graphData.columnLabels.color !== undefined) columnLabelColor = new THREE.Color(graphData.columnLabels.color);
	        		}

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

					var xPos = (((self._graphWidth/2)*-1) + self._baseEdge), // this is our zero
						zPos = (((self._graphLength/2)*-1) + self._baseEdge);

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

					self._graphObject.add(barObject);
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

					textMesh.position.z += (self._graphLength/2) + textBoxArea.size().z + 3;

					textMesh.position.x = (self._graphWidth/2)*-1;
					textMesh.position.x += (self._baseEdge + (barWidth/2) + (textBoxArea.size().x/2)) + (col*columnSpace) + (col*barWidth);

					self._graphObject.add(textMesh);
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

					textMesh.position.x += (self._graphWidth/2) + 3;

					textMesh.position.z -= (self._graphLength/2);
					textMesh.position.z += self._baseEdge + (barWidth/2) + (row*rowSpace) + (row*barWidth) + (textBoxArea.size().z/2);

					self._graphObject.add(textMesh);
				};

        		this._container = document.getElementById(container);

        		this.createScene();

        		// Give it a name just for simplicity
        		if ((graphData) && (graphData.name)) this._graphObject.name = graphData.name;
        		else this._graphObject.name = "barGraph";

				// check that we've have some data passed in
				if (graphData) {
	        		// Setting up the base plane for the bar chart
					// Get the length (the z axis)
					if ((graphData.rowLabels) && (graphData.rowLabels.values)) {
						if (graphData.data.length > graphData.rowLabels.values.length) this._graphLength = (barWidth*graphData.data.length) + (rowSpace*graphData.data.length) - rowSpace + (this._baseEdge*2);
						else this._graphLength = (barWidth*graphData.rowLabels.values.length) + (rowSpace*graphData.rowLabels.values.length) - rowSpace + (this._baseEdge*2);
					}
					else if (graphData.data) this._graphLength = (barWidth*graphData.data.length) + (rowSpace*graphData.data.length) - rowSpace + (this._baseEdge*2);

					// Figure out what the base width should be (the x axis)
					var maxData = 0;

					for (var i=0; i<graphData.data.length; i++) {
						if ((graphData.data[i].values) && (graphData.data[i].values.length > maxData)) maxData = graphData.data[i].values.length;
					}

					if ((graphData.columnLabels) && (graphData.columnLabels.values)) {
						if (maxData) {
							if (maxData > graphData.columnLabels.values.length) this._graphWidth = (barWidth*maxData) + (columnSpace*maxData) - columnSpace + (this._baseEdge*2);
							else this._graphWidth = (barWidth*graphData.columnLabels.values.length) + (columnSpace*graphData.columnLabels.values.length) - columnSpace + (this._baseEdge*2);
						}
						else this._graphWidth = (barWidth*graphData.columnLabels.values.length) + (columnSpace*graphData.columnLabels.values.length) - columnSpace + (this._baseEdge*2);
					}
					else if (maxData) this._graphWidth = (barWidth*maxData) + (columnSpace*maxData) - columnSpace + (this._baseEdge*2);

					// add it to the scene
					this.createBase();

					// Get the max value so we can factor values
					var minDataValue = this.getMinDataValue(graphData.data),
						maxDataValue = this.getMaxDataValue(graphData.data);

					var rangeStep = this.getRoundingInteger(minDataValue, maxDataValue);

					var minGraphRange = (minDataValue - minDataValue %  rangeStep);
					if (minGraphRange != 0) minGraphRange -= rangeStep;

					var maxGraphRange = (rangeStep - maxDataValue % rangeStep) + maxDataValue;

					var pointModifier = this._graphHeight/(maxGraphRange-minGraphRange);

    				for (var i=0; i<graphData.data.length; i++) {
	    				graphData.data[i].factoredValues = [];

	    				for (var j=0; j<graphData.data[i].values.length; j++) {
	    					graphData.data[i].factoredValues.push((graphData.data[i].values[j]-minGraphRange)*pointModifier);
	    				}
					}

					// Add the measurement lines
					if (this._showMeasurementLines) this.createMeasurementsLines(minGraphRange, maxGraphRange);

    				for (var i=0; i<graphData.data.length; i++) {
    					// Figure out the color for the bar. Pick a random one is one isn't defined
    					var barColor = null;

    					if (graphData.data[i].color !== undefined) barColor = new THREE.Color(graphData.data[i].color);
    					else barColor = new THREE.Color("#"+Math.floor(Math.random()*16777215).toString(16));

    					// Local bar settings for labels overwrite global ones
    					var makeBarsLabelsVisible = showBarLabels;
    					if (graphData.data[i].showBarLabels !== undefined) makeBarsLabelsVisible = graphData.data[i].showBarLabels;

    					for (var j=0; j<graphData.data[i].values.length; j++) {
							createBar(i, j, graphData.data[i].factoredValues[j], graphData.data[i].values[j], barColor, makeBarsLabelsVisible);
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

                // position the object so it will view well
                var graphObjectArea = new THREE.Box3().setFromObject(this._graphObject);
                this._graphObject.position.y -= ((graphObjectArea.size().y/2)-(graphObjectArea.size().y/4));

				// Add the graph to the scene
				this._scene.add(this._graphObject);

        		// If we don't have camera graphData then we'll try and determine the camera position 
    			if ((!graphData) || (!graphData.camera)) this.calculateCamera();

    			// If we don't have camera graphData then we'll try and determine the cameras lookat 
    			if ((!graphData) || (!graphData.lookAt)) this.calculateLookAt();

				// Set the initial rotation
				if (this._startRotation) this._graphObject.rotation.y = this._startRotation;

    			// bind all mouse/touch events
				if (!this._locked) this.bindEvents();

				this.addCamera();

        		if (this._camera) this.render();
        	},

        	// Calling will create a standard line graph
        	ScatterGraph: function(container, graphData) {
				var self = this;

        		var pointSize = 4; // the size of each point on the graph

        		// Allow the override using the graphData options if they exist
        		if (graphData !== undefined) {
        			if (graphData.pointSize !== undefined) pointSize = graphData.pointSize;

        			this.setGlobalOptions(graphData);
        		}

        		// The method to create the lines
				var plotScatterGraph = function(data, factoredData, color) {	
                    for (var i=0; i<factoredData.length; i++) {
                        var pointObject = new THREE.Object3D();

                        var pointSphere = new THREE.Mesh(new THREE.SphereGeometry(pointSize, 100, 100), new THREE.MeshLambertMaterial({
                            color: color,
                            side:THREE.DoubleSide
                        }));

                        pointObject.add(pointSphere);

                        pointObject.position.x = factoredData[i].x-(self._graphWidth/2)+self._baseEdge;
                        pointObject.position.y = factoredData[i].y;
                        pointObject.position.z = factoredData[i].z-(self._graphLength/2)+self._baseEdge;

                        self._graphObject.add(pointObject);
                    }
				};

        		this._container = document.getElementById(container);

        		this.createScene();

        		// Give it a name just for simplicity
        		if ((graphData) && (graphData.name)) this._graphObject.name = graphData.name;
        		else this._graphObject.name = "ScatterGraph";

				// check that we've have some data passed in
				if (graphData) {
                    // add the base to the scene
                    this.createBase();

                    // Get the min and max data values
                    var minValues = this.getMinDataValues(graphData.data),
                        maxValues = this.getMaxDataValues(graphData.data);

                    // Figure out the range step
                    var rangeStepX = this.getRoundingInteger(minValues.x, maxValues.x),
                        rangeStepY = this.getRoundingInteger(minValues.y, maxValues.y),
                        rangeStepZ = this.getRoundingInteger(minValues.z, maxValues.z);

                    var minGraphRangeX = (minValues.x - minValues.x % rangeStepX);
                    if (minGraphRangeX != 0) minGraphRangeX -= rangeStepX;

                    var maxGraphRangeX = (rangeStepX - maxValues.x % rangeStepX) + maxValues.x;

                    var minGraphRangeY = (minValues.y - minValues.y % rangeStepY);
                    if (minGraphRangeY != 0) minGraphRangeY -= rangeStepY;

                    var maxGraphRangeY = (rangeStepY - maxValues.y % rangeStepY) + maxValues.y;

                    var minGraphRangeZ = (minValues.z - minValues.z % rangeStepZ);
                    if (minGraphRangeZ != 0) minGraphRangeZ -= rangeStepZ;

                    var maxGraphRangeZ = (rangeStepZ - maxValues.z % rangeStepZ) + maxValues.z;

                    // Add the measurement lines
                    if (this._showMeasurementLines) this.createMeasurementsLines(minGraphRangeY, maxGraphRangeY);

                    var pointModifierX = this._graphWidth/(maxGraphRangeX-minGraphRangeX),
                        pointModifierY = this._graphHeight/(maxGraphRangeY-minGraphRangeY),
                        pointModifierZ = this._graphLength/(maxGraphRangeZ-minGraphRangeZ);

                    for (var i=0; i<graphData.data.length; i++) {
                        graphData.data[i].factoredValues = [];

                        for (var j=0; j<graphData.data[i].values.length; j++) {
                            graphData.data[i].factoredValues.push({
                                x: (graphData.data[i].values[j].x-minGraphRangeX)*pointModifierX,
                                y: (graphData.data[i].values[j].y-minGraphRangeY)*pointModifierY,
                                z: (graphData.data[i].values[j].z-minGraphRangeZ)*pointModifierZ
                            });
                        }

                        var pointColor = null;

                        if (graphData.data[i].color !== undefined) pointColor = new THREE.Color(graphData.data[i].color);
                        else pointColor = new THREE.Color("#"+Math.floor(Math.random()*16777215).toString(16));

                        plotScatterGraph(graphData.data[i].values, graphData.data[i].factoredValues, pointColor);
                    }
                }

                // position the object so it will view well
                var graphObjectArea = new THREE.Box3().setFromObject(this._graphObject);
                this._graphObject.position.y -= ((graphObjectArea.size().y/2)-(graphObjectArea.size().y/6));

				// Add the graph to the scene
				this._scene.add(this._graphObject);

        		// If we don't have camera graphData then we'll try and determine the camera position 
    			if ((!graphData) || (!graphData.camera)) this.calculateCamera();

    			// If we don't have camera graphData then we'll try and determine the cameras lookat 
    			if ((!graphData) || (!graphData.lookAt)) this.calculateLookAt();

    			// bind all mouse/touch events
				if (!this._locked) this.bindEvents();

				this.addCamera();

                // Set the initial rotation
                if (this._startRotation) this._graphObject.rotation.y = this._startRotation;

        		if (this._camera) this.render();
        	}
        }
    };

    if(!window.Mercer) window.Mercer = Mercer;
})();