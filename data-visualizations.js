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

        	// THREE layout
        	_scene: null,
        	_camera: null,
        	_renderer: null,

        	// Lighting
        	_directionalLight: { // directional lighting
        		color: 0xffffff,
        		intensity: 1.0,
        		position: {
        			x: 80,
        			y: 300,
        			z: 590
        		}
        	},

        	//Skybox
        	_skyboxColor: 0xffffff,

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

				if (this._cameraX) this._camera.position.x = this._cameraX;
				if (this._cameraY) this._camera.position.y = this._cameraY;
				if (this._cameraZ) this._camera.position.z = this._cameraZ;
        	},

			startRenderScene: function() {
				var that = this;

				var render = function () {
					requestAnimationFrame( render );

					that._renderer.render(that._scene, that._camera);
				};

				render();
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

        	bar: function(container, data, options) {
				var self = this;

				// This is the maximum value allowed to be reached before it starts to factor
				var maxValueBeforeFactor = 150;

        		// Set up the basic configuration for the bar
        		var barWidth = 15,
        			barOpacity = 0.65,
        			columnSpace = 10,
        			rowSpace = 30,
        			baseColor = 0xaaaaaa,
        			baseEdge = 10,
        			baseWidth = 200,
        			baseLength = 200;

        		// Allow the override using the options if they exist
        		if (options) {
        			if (options.maxValueBeforeFactor) maxValueBeforeFactor = options.maxValueBeforeFactor;

        			if (options.barWidth) barWidth = options.barWidth;

        			if (options.barWidth) barWidth = options.barWidth;

        			if (options.barOpacity) barOpacity = options.barOpacity;

        			if (options.columnSpace) columnSpace = options.columnSpace;
        			
        			if (options.rowSpace) rowSpace = options.rowSpace;

        			if (options.baseColor) baseColor = new THREE.Color(options.baseColor);

        			if (options.baseEdge) baseEdge = options.baseEdge;

        			if (options.baseWidth) baseWidth = options.baseWidth;

        			if (options.baseLength) baseLength = options.baseLength;

        			if (options.background) this._skyboxColor = new THREE.Color(options.background);

        			if (options.camera) {
        				if (options.camera.x) this._cameraX = 0;
        				if (options.camera.y) this._cameraY = 0;
        				if (options.camera.z) this._cameraZ = 0;
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
						color: color
					}));

					barObject.add(rightLine);

					return barObject;
				}
				
				// This attempts to find a camera position based on data
				var calculateCamera = function(baseX, baseZ, maxBarHeight) {
        			self._cameraX = (baseX);
        			self._cameraY = (maxBarHeight+40);
        			self._cameraZ = (baseZ+100);

        			self._far = (Math.max(baseX, baseZ, maxBarHeight)+1000)*2;
	        	};

	        	var calculateLookAt = function(centerx, centerY, centerZ) {
	        		if (self._camera) self._camera.lookAt(new THREE.Vector3(centerx,centerY,centerZ));
	        	}

        		this._container = document.getElementById(container);

        		this.createScene();

        		// The actual graph object
        		var graphObject = new THREE.Object3D();

        		// Give it a name just for simplicity
        		if ((options) && (options.name)) graphObject.name = options.name;
        		else graphObject.name = "barGraph";

        		// Setting up the base plane for the bar chart (assuming that there is data)
    			if (data) {
    				// Get the length (the z axis)
    				baseLength = (barWidth*data.length) + (rowSpace*data.length) - rowSpace + (baseEdge*2);

    				// Figure out what the base length should be (the x axis)
    				var maxData = 0;

    				for (var i=0; i<data.length; i++) {
						if ((data[i].data) && (data[i].data.length > maxData)) maxData = data[i].data.length;
					}

    				if (maxData) baseWidth = (barWidth*maxData) + (columnSpace*maxData) - columnSpace + (baseEdge*2);
        		}

				// add it to the scene
				graphObject.add(this.createBase(baseWidth, baseLength, baseColor));

				var maxDataVal = 0,
					factor = 1;

				// check that we've have some data passed in
				if (data) {
					// First get the max value so we can factor values
    				for (var i=0; i<data.length; i++) {
    					for (var j=0; j<data[i].data.length; j++) {
							if (data[i].data[j] > maxDataVal) maxDataVal = data[i].data[j];
    					}
					}

					// Normalize the data so that the max value is at 100 units tall
					var originalMaxValue = maxDataVal;

					maxDataVal = maxValueBeforeFactor;

    				for (var i=0; i<data.length; i++) {
    					for (var j=0; j<data[i].data.length; j++) {
    						var percentageOfMax = data[i].data[j]/originalMaxValue;

							data[i].data[j] = maxDataVal*percentageOfMax;			
    					}
					}

    				for (var i=0; i<data.length; i++) {
    					// Figure out the color for the bar. Pick a random one is one isn't defined
    					var barColor = null;

    					if (data[i].color) barColor = new THREE.Color(data[i].color);
    					else barColor = new THREE.Color("#"+Math.floor(Math.random()*16777215).toString(16));

    					for (var j=0; j<data[i].data.length; j++) {
							graphObject.add(createBar(i, j, (data[i].data[j]/factor), barColor));
    					}
					}
				}

				// Add the graph to the scene
				this._scene.add(graphObject)

        		// If we don't have camera options then we'll try and determine the camera position 
    			if ((!options) || (!options.camera)) calculateCamera((baseWidth/2), (baseLength/2), maxValueBeforeFactor);

				this.addCamera();

				calculateLookAt(0, maxValueBeforeFactor/2, 0);

        		this.createSkybox(Math.max((baseWidth, baseLength, (maxDataVal/factor))+500)*2);

        		if (this._camera) this.startRenderScene();
        	}
        }
    };

    if(!window.tdv) window.tdv = tdv;
})();