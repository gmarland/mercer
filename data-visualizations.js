(function () {
    var tdv = function(data) {
        return {
        	// The div that will contain the visualization
        	_container: null,

        	// Camera settings
        	_fov: 75,
        	_near: 0.1,
        	_far: 2000,

        	// THREE layout
        	_scene: null,
        	_camera: null,
        	_renderer: null,

        	// Lighting
        	_ambientLightColor: 0xfefefe, // ambient lighting
        	_directionalLight: { // directional lighting
        		color: 0xffffff,
        		intensity: 1.0,
        		position: {
        			x: 80,
        			y: 100,
        			z: 250
        		}
        	},

        	//Skybox
        	_skyboxColor: 0x111111,
        	_skySize: 1500,

        	createScene: function() {
        		var containerWidth = parseInt(this._container.style.width,10), 
        			containerHeight = parseInt(this._container.style.height,10);

				this._scene = new THREE.Scene();
				this._camera = new THREE.PerspectiveCamera(this._fov, containerWidth/containerHeight, this._near, this._far);

				this._camera.position.y = 0;
				this._camera.position.z = 380;

				this._camera.lookAt(new THREE.Vector3(0,0,0));

				this._renderer = new THREE.WebGLRenderer({ antialias: true });
				this._renderer.setSize(containerWidth, containerHeight);

				this._container.appendChild(this._renderer.domElement);

				var ambientLight = new THREE.AmbientLight(this._ambientLightColor); 
		      
				var directionalLight = new THREE.DirectionalLight(this._directionalLight.color, this._directionalLight.intensity); 
				directionalLight.position.set(this._directionalLight.position.x, this._directionalLight.position.y, this._directionalLight.position.z);

				this._scene.add(ambientLight); 
		      	this._scene.add(directionalLight);
        	},

        	createSkybox: function() {
				var skyMesh = new THREE.Mesh(new THREE.BoxGeometry(this._skySize, this._skySize, this._skySize), new THREE.MeshBasicMaterial({
					color: this._skyboxColor,
					side:THREE.DoubleSide 
				}));

				this._scene.add(skyMesh); 
        	},

        	bar: function(container, data) {
        		this._container = document.getElementById(container);

        		this.createScene();
        		this.createSkybox();
        	}
        }
    };

    if(!window.tdv) window.tdv = tdv;
})();