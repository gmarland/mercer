(function () {
    var tdv = function(data) {
        return {
        	// The div that will contain the visualization
        	_container: null,

        	// Camera settings
        	_fov: 75,
        	_near: 0.1,
        	_far: 2000,

        	// Camera position

        	_cameraX: -200,
        	_cameraY: 200,
        	_cameraZ: 130,

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
        	_skySize: 1500,

        	createScene: function() {
        		var containerWidth = parseInt(this._container.style.width,10), 
        			containerHeight = parseInt(this._container.style.height,10);

				this._scene = new THREE.Scene();

				this._camera = new THREE.PerspectiveCamera(this._fov, containerWidth/containerHeight, this._near, this._far);

				if (this._cameraX) this._camera.position.x = this._cameraX;
				if (this._cameraY) this._camera.position.y = this._cameraY;
				if (this._cameraZ) this._camera.position.z = this._cameraZ;

				this._camera.lookAt(new THREE.Vector3(0,0,0));

				this._renderer = new THREE.WebGLRenderer({ antialias: true });
				this._renderer.setSize(containerWidth, containerHeight);

				this._container.appendChild(this._renderer.domElement);

				var directionalLight = new THREE.DirectionalLight(this._directionalLight.color, this._directionalLight.intensity); 
				directionalLight.position.set(this._directionalLight.position.x, this._directionalLight.position.y, this._directionalLight.position.z);
 
				this._scene.add(directionalLight);
        	},

			startRenderScene: function() {
				var that = this;

				var render = function () {
					requestAnimationFrame( render );

					that._renderer.render(that._scene, that._camera);
				};

				render();
			},

        	createSkybox: function() {
				var skyMesh = new THREE.Mesh(new THREE.BoxGeometry(this._skySize, this._skySize, this._skySize), new THREE.MeshBasicMaterial({
					color: this._skyboxColor,
					side:THREE.DoubleSide 
				}));

				this._scene.add(skyMesh); 
        	},

        	createBase: function(baseWidth, baseLength, color) {
	    		// Create the base (a simple plane should do)
				var base = new THREE.Mesh(new THREE.PlaneGeometry(baseWidth, baseLength), new THREE.MeshBasicMaterial({ 
					color: 0x323738, 
					side: THREE.DoubleSide
				}));

				// rotate it 90 degrees so it's flat
				base.rotation.x = (Math.PI/2);

				return base;
        	},

        	bar: function(container, data, options) {
        		// Set up the basic configuration for the bar
        		var columnWidth = 20,
        			baseColor = 0x323738,
        			baseEdge = 10,
        			columnSpace = 5,
        			rowSpace = 40,
        			baseWidth = 200,
        			baseLength = 200;

        		// Allow the override using the options if they exist
        		if (options) {
        			if (options.columnWidth) columnWidth = options.columnWidth;

        			if (options.baseColor) baseColor = new THREE.Color(options.baseColor);

        			if (options.baseEdge) baseEdge = options.baseEdge;

        			if (options.columnSpace) columnSpace = options.columnSpace;
        			
        			if (options.rowSpace) rowSpace = options.rowSpace;

        			if (options.baseWidth) baseWidth = options.baseWidth;

        			if (options.baseLength) baseLength = options.baseLength;

        			if (options.background) this._skyboxColor = new THREE.Color(options.background);
        		}

        		// The method to create the bar. Actually easier to plot the verticies than use available shapes
				var createBar = function(row, col, val, color) {
					// First, calculate the bar geometry

					var xPos = ((baseWidth/2)*-1), // this is our zero
						zPos = ((baseLength/2)*-1);

					xPos += ((col*columnSpace) + (col*columnWidth)) + baseEdge + (columnWidth/2);
					zPos += ((row*rowSpace) + (row*columnWidth)) + baseEdge + (columnWidth/2);


					var barGeometry = new THREE.Geometry();

					// Plot the verticies
					barGeometry.vertices.push(new THREE.Vector3(xPos-(columnWidth/2), 0, zPos-(columnWidth/2)));
					barGeometry.vertices.push(new THREE.Vector3(xPos-(columnWidth/2), 0, zPos+(columnWidth/2)));

					barGeometry.vertices.push(new THREE.Vector3(xPos+(columnWidth/2), 0, zPos-(columnWidth/2)));
					barGeometry.vertices.push(new THREE.Vector3(xPos+(columnWidth/2), 0, zPos+(columnWidth/2)));

					barGeometry.vertices.push(new THREE.Vector3(xPos-(columnWidth/2), val, zPos-(columnWidth/2)));
					barGeometry.vertices.push(new THREE.Vector3(xPos-(columnWidth/2), val, zPos+(columnWidth/2)));

					barGeometry.vertices.push(new THREE.Vector3(xPos+(columnWidth/2), val, zPos-(columnWidth/2)));
					barGeometry.vertices.push(new THREE.Vector3(xPos+(columnWidth/2), val, zPos+(columnWidth/2)));

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
						side: THREE.DoubleSide 
					}));

					return barMesh;
				}

        		this._container = document.getElementById(container);

        		this.createScene();
        		this.createSkybox();
        		this.startRenderScene();

        		// Setting up the base plane for the bar chart (assuming that there is data)
    			if (data) {
    				// Get the length (the z axis)
    				baseLength = (columnWidth*data.length) + (rowSpace*data.length) - rowSpace + (baseEdge*2);

    				// Figure out what the base length should be (the x axis)
    				var maxData = 0;

    				for (var i=0; i<data.length; i++) {
						if ((data[i].data) && (data[i].data.length > maxData)) maxData = data[i].data.length;
					}

    				if (maxData) baseWidth = (columnWidth*maxData) + (columnSpace*maxData) - columnSpace + (baseEdge*2);
        		}

				// add it to the scene
				this._scene.add(this.createBase(baseWidth, baseLength, baseColor));

				// check that we've have some data passed in
				if (data) {
    				for (var i=0; i<data.length; i++) {
    					// Figure out the color for the bar. Pick a random one is one isn't defined
    					var barColor = null;

    					if (data[i].color) barColor = new THREE.Color(data[i].color);
    					else barColor = new THREE.Color("#"+Math.floor(Math.random()*16777215).toString(16));

    					for (var j=0; j<data[i].data.length; j++) {
							this._scene.add(createBar(i, j, data[i].data[j], barColor));
    					}
					}
				}
        	}
        }
    };

    if(!window.tdv) window.tdv = tdv;
})();