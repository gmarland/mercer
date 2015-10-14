(function () {
    var Mercer = function(data) {
        // -----------------------------------------------
        // The basic graph object
        // -----------------------------------------------

        var Graph = function(container, graphName, graphData, rowCollection) {
            var that = this;

            // ----- Functions for setting up the scene

            var createBase = function(graphWidth, graphLength, baseEdge, baseThickness, baseColor) {
                var baseWidth = graphWidth+(baseEdge*2),
                    baseLength = graphLength+(baseEdge*2);

                var baseGeometry = new THREE.BoxGeometry(baseWidth, baseThickness, baseLength),
                    baseMaterial = new THREE.MeshLambertMaterial({
                        color: baseColor, 
                        side: THREE.DoubleSide
                    });

                var baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
                baseMesh.position.x = (baseWidth/2);
                baseMesh.position.y -= ((baseThickness/2)+0.1);
                baseMesh.position.z = (baseLength/2);

                return baseMesh
            };

            var createMeasurementsLines = function(graphWidth, graphLength, graphHeight, numberOfMeasurementLines, lineColor, labelFont, labelSize, labelColor, minValue, maxValue) {
                var measurementLineObject = new THREE.Object3D();

                var stepsEachLine = Math.ceil(graphHeight/numberOfMeasurementLines);

                for (var i=1; i<=numberOfMeasurementLines; i++) {
                    var measureLineGeometry = new THREE.Geometry();
                    measureLineGeometry.vertices.push(new THREE.Vector3((graphWidth/2)*-1, (stepsEachLine*i), (graphLength/2)));
                    measureLineGeometry.vertices.push(new THREE.Vector3((graphWidth/2)*-1, (stepsEachLine*i), (graphLength/2)*-1));
                    measureLineGeometry.vertices.push(new THREE.Vector3((graphWidth/2), (stepsEachLine*i), (graphLength/2)*-1));

                    var measureLine = new THREE.Line(measureLineGeometry, new THREE.LineBasicMaterial({
                        color: lineColor,
                        side: THREE.DoubleSide
                    }));

                    measurementLineObject.add(measureLine);

                    var textGeometry = new THREE.TextGeometry(minValue+Math.round((maxValue-minValue)/numberOfMeasurementLines)*i, {
                        font: labelFont,
                        size: labelSize,
                        height: .2
                    });
                    
                    var textMesh = new THREE.Mesh(textGeometry, new THREE.MeshBasicMaterial({
                        color: labelColor
                    }));

                    var textBoxArea = new THREE.Box3().setFromObject(textMesh);

                    textMesh.position.x += ((graphWidth/2)+5);
                    textMesh.position.y += ((stepsEachLine*i)-(textBoxArea.size().y/2));
                    textMesh.position.z -= (graphLength/2);

                    measurementLineObject.add(textMesh);
                }

                measurementLineObject.position.x = (graphWidth/2);
                measurementLineObject.position.z = (graphLength/2);

                return measurementLineObject;
            };

            // ----- Functions for setting up the camera
                
            // This attempts to find a camera position based on the graph object dimensions
            var calculateCamera = function(cameraSettings, graphObjectArea) {
                var maxDimension = Math.max(graphObjectArea.size().x, graphObjectArea.size().y);

                var vFOV = cameraSettings.fov * Math.PI / 180,
                    dist = (maxDimension/aspect)/2/Math.tan((vFOV / 2));

                that._cameraSettings.position = {
                    x: 0,
                    y: 0,
                    z: (dist*2)+(graphObjectArea.size().z/2)
                };
            };

            // Attempts to determine where the camera should be looking based on the graph settings
            var calculateLookAt = function() {
                that._cameraSettings.lookAt = {
                    x: 0,
                    y: 0,
                    z: 0
                };
            };

            var getDirectionalLight = function(cameraSettings, directionalLightSettings) {               
                var directionalLight = new THREE.PointLight(directionalLightSettings.color, directionalLightSettings.intensity); 
                directionalLight.position.set(cameraSettings.position.x, cameraSettings.position.y, cameraSettings.position.z);
 
                return directionalLight;
            }

            // Add the camera to the scene
            var getCamera = function(cameraSettings) {
                // take the maximum distance from the camera add 100 and double it
                var far = ((Math.max(cameraSettings.position.x, cameraSettings.position.y, cameraSettings.position.z)+1000)*2);

                var camera = new THREE.PerspectiveCamera(cameraSettings.fov, aspect, 0.1, far);

                camera.position.x = cameraSettings.position.x;
                camera.position.y = cameraSettings.position.y;
                camera.position.z = cameraSettings.position.z;

                camera.lookAt(new THREE.Vector3(cameraSettings.lookAt.x, cameraSettings.lookAt.y, cameraSettings.lookAt.z));

                return camera;
            };

            // Binding mouse events
            var bindEvents = function() {
                // These variables are required for rotating the graph
                var startPositionX = null,
                    startRotationX = null;

                // mouse events
                that._renderer.domElement.addEventListener("mousedown", function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    startPositionX = e.clientX-(window.innerWidth/2);
                    startRotationX = that._graphObject.rotation.y;

                    that.startRendering();
                }, false );

                that._renderer.domElement.addEventListener( "mousemove", function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    if (startPositionX) {
                        var mouseX = e.clientX-(window.innerWidth/2);
                        that._targetRotationX = startRotationX+(mouseX - startPositionX) * 0.02;
                    }
                }, false );

                that._renderer.domElement.addEventListener( "mouseup", function(e) {
                    e.preventDefault();
                    e.stopPropagation();

                    startPositionX = null;
                    that._targetRotationX = null;

                    that.stopRendering();
                }, false );
                
                that._renderer.domElement.addEventListener( "mouseout", function(e) {
                    startPositionX = null;
                    that._targetRotationX = null;

                    that.stopRendering();
                }, false );

                // touch events
                that._renderer.domElement.addEventListener("touchstart", function(e) {
                    if (e.touches.length == 1) {
                        startPositionX = e.touches[0].pageX-(window.innerWidth/2);
                        startRotationX = that._graphObject.rotation.y;

                        that.startRendering();
                    }
                }, false );

                that._renderer.domElement.addEventListener( "touchmove", function(e) {
                    if (startPositionX) {
                        if (e.touches.length == 1) {
                            var mouseX = e.touches[0].pageX-(window.innerWidth/2);
                            that._targetRotationX = (mouseX - startPositionX) * 0.05;
                        }
                    }
                }, false );

                that._renderer.domElement.addEventListener( "touchend", function(e) {
                    startPositionX = null;
                    that._targetRotationX = null;

                    that.stopRendering();
                }, false );

                that._renderer.domElement.addEventListener( "touchcancel", function(e) {
                    startPositionX = null;
                    that._targetRotationX = null;

                    that.stopRendering();
                }, false );
            };

            // The div that will contain the visualization
            this._container = container;

            this._name = graphName;

            this._rowCollection = rowCollection;

            // The actual graph object
            this._graphObject = new THREE.Object3D();

            // Switch to dermine if the renderer should keep ticking to allow animations
            this._keepRenderingScene = false;

            // Used when rotating the graph
            this._targetRotationX = null;

            // Camera settings
            this._cameraSettings = {
                fov: 75,
                position: null,
                lookAt: null
            };

            // Default setting for rotation
            this._startRotation = 0;

            // THREE layout
            this._scene = null;
            this._directionalLight = null;
            this._camera = null;
            this._renderer = null;

            // Lighting
            this._directionalLightSettings = { // directional lighting
                color: 0xffffff,
                intensity: 1.0,
                position: {
                    x: 200,
                    y: 300,
                    z: 590
                }
            };

            // Details of the graph
            this._graphHeight = 150;
            this._graphWidth = null; // the base width which will be show if no data is added
            this._graphLength = null; // the base length which will be show if no data is added

            this._baseEdge = 10; // the distance around the graphing area for the base
            this._baseThickness = 1; // the thickness of the graph base
            this._baseColor = 0xececec; // the color for the base

            this._locked = false; // whether or not to allow the rotation of the graph

            this._showMeasurementLines = true; // whether or not to show measurement lines
            this._numberOfMeasurementLines = 10;
            this._measurementLineColor = 0x222222; // the default color of the measurement lines
            this._measurementLabelFont = "helvetiker"; // the font for the measurement label
            this._measurementLabelSize = 5; // the font size for the measurement label
            this._measurementLabelColor = 0x000000; // the default color for the measurement label

            // Skybox
            this._skyboxColor = 0xffffff;
            this._skyboxOpacity = 1;

            // Determine if there are any global options set
            if (graphData !== undefined) {
                if (graphData.graphHeight !== undefined) this._graphHeight = graphData.graphHeight;

                if (graphData.background !== undefined) this._skyboxColor = new THREE.Color(graphData.background);
                if (graphData.backgroundTransparent !== undefined) {
                    if (graphData.backgroundTransparent) this._skyboxOpacity = 0;
                    else this._skyboxOpacity = 1;
                }

                if ((graphData.cameraX != undefined) || (graphData.cameraY != undefined) || (graphData.cameraZ != undefined)) {
                    this._cameraSettings.position = {
                        x: 0,
                        y: 0,
                        z: 0
                    };

                    if (graphData.cameraX != undefined) this._cameraSettings.position.x = graphData.cameraX;
                    if (graphData.cameraY != undefined) this._cameraSettings.position.y = graphData.cameraY;
                    if (graphData.cameraZ != undefined) this._cameraSettings.position.z = graphData.cameraZ;
                }

                if ((graphData.lookAtX != undefined) || (graphData.lookAtY != undefined) || (graphData.lookAtZ != undefined)) {
                    this._cameraSettings.lookAt = {
                        x: 0,
                        y: 0,
                        z: 0
                    };

                    if (graphData.lookAtX != undefined) this._cameraSettings.lookAt.x = graphData.lookAtX;
                    if (graphData.lookAtY != undefined) this._cameraSettings.lookAt.y = graphData.lookAtY;
                    if (graphData.lookAtZ != undefined) this._cameraSettings.lookAt.z = graphData.lookAtZ;
                }

                if (graphData.startRotation !== undefined) this._startRotation = graphData.startRotation;

                if (graphData.directionalLight !== undefined) {
                    if (graphData.directionalLight.color !== undefined) this._directionalLightSettings.color = graphData.directionalLight.color;
                    
                    if (graphData.directionalLight.intensity !== undefined) this._directionalLightSettings.intensity = graphData.directionalLight.intensity;

                    if (graphData.directionalLight.position !== undefined) {
                        if (graphData.directionalLight.position.x !== undefined) this._directionalLightSettings.position.x = graphData.directionalLight.position.x;
                        if (graphData.directionalLight.position.y !== undefined) this._directionalLightSettings.position.y = graphData.directionalLight.position.y;
                        if (graphData.directionalLight.position.z !== undefined) this._directionalLightSettings.position.z = graphData.directionalLight.position.z;
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

            // Now we have everything is defined, set up the scene

            this._scene = new THREE.Scene();

            var minValue = this._rowCollection.getMinY(),
                maxValue = this._rowCollection.getMaxY();

            var containerWidth = parseInt(this._container.style.width,10), 
                containerHeight = parseInt(this._container.style.height,10),
                aspect = containerWidth /containerHeight,
                graphWidth = this._rowCollection.getWidth(),
                graphLength = this._rowCollection.getLength(),
                graphHeight = this._rowCollection.getHeight();

            // Create the base and measurement lines

            this._baseMesh = createBase(graphWidth, graphLength, this._baseEdge, this._baseThickness, this._baseColor);
        
            this._measurementLines = null;
            if (this._showMeasurementLines) this._measurementLines = createMeasurementsLines(graphWidth+(this._baseEdge*2), graphLength+(this._baseEdge*2), graphHeight, this._numberOfMeasurementLines, this._measurementLineColor, this._measurementLabelFont, this._measurementLabelSize, this._measurementLabelColor, minValue, maxValue)

            this._graphObject.add(this._baseMesh);
            if (this._measurementLines) this._graphObject.add(this._measurementLines);

            var rowCollectionObject = this._rowCollection.drawRows();
            rowCollectionObject.position.x += this._baseEdge;
            rowCollectionObject.position.z += this._baseEdge;

            this._graphObject.add(rowCollectionObject);

            var rowLabelsCollectionObject = this._rowCollection.drawRowLabels();
            rowLabelsCollectionObject.position.z += this._baseEdge;
            rowLabelsCollectionObject.position.x += (graphWidth+(this._baseEdge*2));

            this._graphObject.add(rowLabelsCollectionObject);

            var columnLabelsCollectionObject = this._rowCollection.drawColumnLabels();
            columnLabelsCollectionObject.position.z += (graphLength+(this._baseEdge*2));
            columnLabelsCollectionObject.position.x += this._baseEdge;

            this._graphObject.add(columnLabelsCollectionObject);

            var graphObjectArea = new THREE.Box3().setFromObject(this._graphObject);

            // position the object so it will view well
            this._graphObject.position.x = ((graphObjectArea.size().x/2)*-1);
            this._graphObject.position.y = ((graphObjectArea.size().y/2)*-1);
            this._graphObject.position.z = ((graphObjectArea.size().z/2)*-1);

            this._sceneObject = new THREE.Object3D();
            this._sceneObject.add(this._graphObject);

            // Add the graph to the scene
            this._scene.add(this._sceneObject);

            this._renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            this._renderer.setSize(containerWidth, containerHeight);
            this._renderer.setClearColor(this._skyboxColor, this._skyboxOpacity);

            this._container.appendChild(this._renderer.domElement);

            // If we don't have camera graphData then we'll try and determine the camera position 
            if (!this._cameraSettings.position) calculateCamera(this._cameraSettings, graphObjectArea);

            // If we don't have camera graphData then we'll try and determine the cameras lookat 
            if (!this._cameraSettings.lookAt) calculateLookAt(this._cameraSettings, this._directionalLight);

            this._directionalLight = getDirectionalLight(this._cameraSettings, this._directionalLightSettings);
            this._camera = getCamera(this._cameraSettings);

            this._scene.add(this._directionalLight);
            this._scene.add(this._camera);

            // Set the initial rotation
            if (this._startRotation) this._graphObject.rotation.y = this._startRotation;

            // bind all mouse/touch events
            if (!this._locked) bindEvents();

            if (this._camera) this.render();
        };

        // ----- Getters

        Graph.prototype.getBaseEdge = function() {
            return this._baseEdge;
        };

        Graph.prototype.getGraphHeight = function() {
            return this._graphHeight;
        };

        Graph.prototype.getGraphWidth = function() {
            return this._graphWidth;
        };

        Graph.prototype.getGraphLength = function() {
            return this._graphLength;
        };

        // ----- Public Methods

        Graph.prototype.startRendering = function() {
            this._keepRenderingScene = true;

            this.render();
        };

        Graph.prototype.stopRendering = function() {
            this._keepRenderingScene = false;
        };

        Graph.prototype.render = function () {
            var that = this;

            var updateScene = function() {
                if ((that._targetRotationX) && (that._sceneObject)) {
                    var newRotation = (that._targetRotationX-that._sceneObject.rotation.y)*0.1;

                    that._sceneObject.rotation.y += newRotation;
                }
            };

            var renderScene = function () {
                if (that._keepRenderingScene) requestAnimationFrame( renderScene );

                updateScene();

                that._renderer.render(that._scene, that._camera);
            };

            renderScene();
        };

        // -----------------------------------------------
        // A row collection
        // -----------------------------------------------

        var RowCollection = function(rowSpace) {
            this._rowSpace = rowSpace;

            this._rows = [];
            this._rowLabels = [];
            this._columnLabels = [];
        };

        // ----- Getters

        RowCollection.prototype.getMinY = function() {
            var min = null;

            for (var i=0; i<this._rows.length; i++) {
                var minValue = this._rows[i].getMinY();

                if ((min === null) || (minValue < min)) min = minValue;
            }

            return min;
        }

        RowCollection.prototype.getMaxY = function() {
            var max = null;

            for (var i=0; i<this._rows.length; i++) {
                var maxValue = this._rows[i].getMaxY();

                if ((max === null) || (maxValue > max)) max = maxValue;
            }

            return max;
        }

        RowCollection.prototype.getWidth = function() {
            var maxWidth = 0;

            for (var i=0; i<this._rows.length; i++) {
                var rowWidth = this._rows[i].getWidth();

                if (rowWidth > maxWidth) maxWidth = rowWidth;
            }

            return maxWidth;
        };

        RowCollection.prototype.getLength = function() {
            var totalWidth = 0;

            for (var i=0; i<this._rows.length; i++) {
                totalWidth += this._rows[i].getLength();

                if (i != (this._rows.length-1)) totalWidth += this._rowSpace;
            }

            return totalWidth;
        };

        RowCollection.prototype.getHeight = function() {
            return this.getMaxY()-this.getMinY();
        };

        // ----- Public Methods

        RowCollection.prototype.addRow = function(row) {
            this._rows.push(row);
        };

        RowCollection.prototype.addRowLabel = function(rowLabel) {
            this._rowLabels.push(rowLabel);
        };

        RowCollection.prototype.addColumnLabel = function(columnLabel) {
            this._columnLabels.push(columnLabel);
        };

        RowCollection.prototype.drawRows = function() {
            var collectionObjects = new THREE.Object3D();

            for (var i=0; i<this._rows.length; i++) {
                var rowObjects = this._rows[i].draw(this.getMinY()); 

                for (var j=0; j<rowObjects.length; j++) {
                    collectionObjects.add(rowObjects[j]);
                }
            }

            return collectionObjects;
        };

        RowCollection.prototype.drawRowLabels = function() {
            var rowLabelObjects = new THREE.Object3D();

            for (var i=0; i<this._rowLabels.length; i++) {
                rowLabelObjects.add(this._rowLabels[i].draw());
            }

            return rowLabelObjects;
        };

        RowCollection.prototype.drawColumnLabels = function() {
            var columnLabelObjects = new THREE.Object3D();

            for (var i=0; i<this._columnLabels.length; i++) {
                columnLabelObjects.add(this._columnLabels[i].draw());
            }

            return columnLabelObjects;
        };

        // -----------------------------------------------
        // Row labels that are attached to the graph
        // -----------------------------------------------

        var RowLabel = function(row, rowSpace, rowWidth, font, size, color, text) {
            this._row = row; 
            this._rowSpace = rowSpace; 
            this._rowWidth = rowWidth; 
            this._font = font; 
            this._size = size; 
            this._color = color; 
            this._text = text;
        };

        RowLabel.prototype.draw = function() {
            var textGeometry = new THREE.TextGeometry(this._text, {
                font: this._font,
                size: this._size,
                height: .2
            });
            
            var textMaterial = new THREE.MeshBasicMaterial({
                color: this._color
            });

            this.textMesh = new THREE.Mesh(textGeometry, textMaterial);

            this.textMesh.rotation.x = (Math.PI/2)*-1;

            var textBoxArea = new THREE.Box3().setFromObject(this.textMesh);

            this.textMesh.position.x = 3;
            this.textMesh.position.z = ((this._row*this._rowSpace) + (this._row*this._rowWidth) + (this._rowWidth/2) + (textBoxArea.size().z/2));

            return this.textMesh;
        };
        
        // -----------------------------------------------
        // Column labels that are attached to the graph
        // -----------------------------------------------

        var ColumnLabel = function(column, columnSpace, columnWidth, font, size, color, text) {
            this._column = column; 
            this._columnSpace = columnSpace; 
            this._columnWidth = columnWidth; 
            this._font = font; 
            this._size = size; 
            this._color = color; 
            this._text = text;
        };

        ColumnLabel.prototype.draw = function() {
            var textGeometry = new THREE.TextGeometry(this._text, {
                font: this._font,
                size: this._size,
                height: .2
            });

            var textMaterial = new THREE.MeshBasicMaterial({
                color: this._color
            });
            
            this.textMesh = new THREE.Mesh(textGeometry, textMaterial);

            this.textMesh.rotation.x = (Math.PI/2)*-1;
            this.textMesh.rotation.z += (Math.PI/2);

            var textBoxArea = new THREE.Box3().setFromObject(this.textMesh);

            this.textMesh.position.z = (3 + textBoxArea.size().z);
            this.textMesh.position.x = ((this._column*this._columnSpace) + (this._column*this._columnWidth) + (this._columnWidth/2) + (textBoxArea.size().x/2));

            return this.textMesh;
        };

        return {
        	// Calling will create a standard bar chart
        	BarChart: function(container, graphData) {
                // -----------------------------------------------
                // Bar chart object definitions
                // -----------------------------------------------

                // ***** Code for building and manipulating the rows *****
                var Row = function(dataRow) {
                    this._id = dataRow.id.toString();

                    this._bars = [];

                    this._columnSpace = columnSpace;

                    this._barLabels = dataRow.showBarLabels;
                };

                // ----- Getters

                Row.prototype.getMinY = function() {
                    var min = null;

                    for (var i=0; i<this._bars.length; i++) {
                        var dataValue = this._bars[i].getDataValue();

                        if ((min === null) || (dataValue < min)) min = dataValue;
                    }

                    return min;
                }

                Row.prototype.getMaxY = function() {
                    var max = null;

                    for (var i=0; i<this._bars.length; i++) {
                        var dataValue = this._bars[i].getDataValue();

                        if ((max === null) || (dataValue > max)) max = dataValue;
                    }

                    return max;
                }

                Row.prototype.getWidth = function() {
                    var totalWidth = 0;

                    for (var i=0; i<this._bars.length; i++) {
                        totalWidth += this._bars[i].getBarWidth();

                        if (i != (this._bars.length-1)) totalWidth += this._columnSpace;
                    }

                    return totalWidth;
                };

                Row.prototype.getLength = function() {
                    var maxLength = 0;

                    for (var i=0; i<this._bars.length; i++) {
                        var barWidth = this._bars[i].getBarWidth();

                        if (barWidth > maxLength) maxLength = barWidth;
                    }

                    return maxLength;
                };

                Row.prototype.getHeight = function() {
                    var maxHeight = 0;

                    for (var i=0; i<this._bars.length; i++) {
                        var height = this._bars[i].getHeight();

                        if (height > maxHeight) maxHeight = height;
                    }

                    return maxHeight;
                };

                // ----- Public Methods

                Row.prototype.addBar = function(bar) {
                    this._bars.push(bar);
                }

                Row.prototype.draw = function(yOffset) {
                    var barObjects = [];

                    for (var i=0; i<this._bars.length; i++) {
                        barObjects.push(this._bars[i].draw(yOffset));
                    }

                    return barObjects;
                };

                // ***** Code for building and manipulating the bars *****

                var Bar = function(row, column, barWidth, dataValue, color, showLabels, labelFont, labelSize, labelColor) {
                    var that = this;

                    // ----- Private Methods

                    this.getBarVertices = function(xPos, zPos, height, width) {
                        var vertices = [];

                        vertices.push(new THREE.Vector3(xPos-(width/2), 0, zPos-(width/2)));
                        vertices.push(new THREE.Vector3(xPos-(width/2), 0, zPos+(width/2)));

                        vertices.push(new THREE.Vector3(xPos+(width/2), 0, zPos-(width/2)));
                        vertices.push(new THREE.Vector3(xPos+(width/2), 0, zPos+(width/2)));

                        vertices.push(new THREE.Vector3(xPos-(width/2), height, zPos-(width/2)));
                        vertices.push(new THREE.Vector3(xPos-(width/2), height, zPos+(width/2)));

                        vertices.push(new THREE.Vector3(xPos+(width/2), height, zPos-(width/2)));
                        vertices.push(new THREE.Vector3(xPos+(width/2), height, zPos+(width/2)));

                        return vertices;
                    };

                    this.getLineGeometry = function(type, xPos, zPos, height, width) {
                        var vertices = [];

                        switch(type) {
                            case "front":
                                vertices.push(new THREE.Vector3(xPos-(width/2), 0, zPos+(width/2)));
                                vertices.push(new THREE.Vector3(xPos-(width/2), height, zPos+(width/2)));
                                vertices.push(new THREE.Vector3(xPos+(width/2), height, zPos+(width/2)));
                                vertices.push(new THREE.Vector3(xPos+(width/2), 0, zPos+(width/2)));
                                break;
                            case "back":
                                vertices.push(new THREE.Vector3(xPos-(width/2), 0, zPos-(width/2)));
                                vertices.push(new THREE.Vector3(xPos-(width/2), height, zPos-(width/2)));
                                vertices.push(new THREE.Vector3(xPos+(width/2), height, zPos-(width/2)));
                                vertices.push(new THREE.Vector3(xPos+(width/2), 0, zPos-(width/2)));
                                break;
                            case "left":
                                vertices.push(new THREE.Vector3(xPos+(width/2), 0, zPos+(width/2)));
                                vertices.push(new THREE.Vector3(xPos+(width/2), height, zPos+(width/2)));
                                vertices.push(new THREE.Vector3(xPos+(width/2), height, zPos-(width/2)));
                                vertices.push(new THREE.Vector3(xPos+(width/2), 0, zPos-(width/2)));
                                break;
                            case "right":
                                vertices.push(new THREE.Vector3(xPos-(width/2), 0, zPos+(width/2)));
                                vertices.push(new THREE.Vector3(xPos-(width/2), height, zPos+(width/2)));
                                vertices.push(new THREE.Vector3(xPos-(width/2), height, zPos-(width/2)));
                                vertices.push(new THREE.Vector3(xPos-(width/2), 0, zPos-(width/2)));
                                break;
                        }

                        return vertices;
                    };

                    this.getOutlineMesh = function(type, xPos, zPos, height, width, color) {
                        var outlineGeometry = new THREE.Geometry();
                        outlineGeometry.vertices = that.getLineGeometry(type, xPos, zPos, height, width);

                        var outline = new THREE.Line(outlineGeometry, new THREE.LineBasicMaterial({
                            color: color
                        }));
                        outline.name = type;

                        return outline;
                    };

                    this.row = row;
                    this.column = column;
                    this.barWidth = barWidth;
                    this.color = color;
                    this.dataValue = dataValue;
                    this.showLabels = showLabels;
                    this.labelFont = labelFont;
                    this.labelSize = labelSize;
                    this.labelColor = labelColor;
                }

                // ----- Getters

                Bar.prototype.getDataValue = function() {
                    return this.dataValue;
                };

                Bar.prototype.getHeight = function() {
                    return this.height;
                };

                Bar.prototype.getBarWidth = function() {
                    return this.barWidth;
                };

                Bar.prototype.getBarObject = function() {
                    return this.barObject;
                }

                // ----- Public Methods

                Bar.prototype.draw = function(yOffset) {
                    this.barObject = new THREE.Object3D();

                    // Calculate the bar geometry
                    var xPos = ((this.column*columnSpace) + (this.column*this.barWidth)) + (this.barWidth/2),
                        zPos = ((this.row*rowSpace) + (this.row*this.barWidth)) + (this.barWidth/2),
                        height = (this.dataValue-yOffset);

                    var barGeometry = new THREE.Geometry();
                    barGeometry.dynamic = true;

                    // Plot the verticies
                    barGeometry.vertices = this.getBarVertices(xPos, zPos, height, this.barWidth);

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
                        color: this.color, 
                        side: THREE.DoubleSide,
                        transparent: true,
                        opacity: barOpacity
                    }));
                    barMesh.name = "bar";

                    this.barObject.add(barMesh);

                    var barOutline = new THREE.Object3D();
                    barOutline.name = "outline";

                    // Generate the outlines

                    barOutline.add(this.getOutlineMesh("front", xPos, zPos, height, this.barWidth, this.color));
                    barOutline.add(this.getOutlineMesh("back", xPos, zPos, height, this.barWidth, this.color));
                    barOutline.add(this.getOutlineMesh("left", xPos, zPos, height, this.barWidth, this.color));
                    barOutline.add(this.getOutlineMesh("right", xPos, zPos, height, this.barWidth, this.color));

                    this.barObject.add(barOutline);

                    if (this.showLabels) {
                        var valueGeometry = new THREE.TextGeometry(this.dataValue, {
                            font: this.labelFont,
                            size: this.labelSize,
                            height: .2
                        });
                        
                        var valueMesh = new THREE.Mesh(valueGeometry, new THREE.MeshBasicMaterial({
                            color: this.labelColor
                        }));

                        var valueArea = new THREE.Box3().setFromObject(valueMesh);

                        valueMesh.position.x = xPos-(valueArea.size().x/2);
                        valueMesh.position.y = this.height + 2;
                        valueMesh.position.z = zPos;

                        this.barObject.add(valueMesh);
                    }

                    return this.barObject;
                };

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
        		}

                var containerElement = document.getElementById(container),
                    containerWidth = parseInt(containerElement.style.width,10), 
                    containerHeight = parseInt(containerElement.style.height,10);

                var rowCollection = new RowCollection(rowSpace);

				// check that we've have some data passed in
				if (graphData) {
                    for (var i=0; i<graphData.data.length; i++) {
                        if (graphData.data[i].id == undefined) graphData.data[i].id = i.toString();

                        if (graphData.data[i].color !== undefined) graphData.data[i].color = new THREE.Color(graphData.data[i].color);
                        else graphData.data[i].color = new THREE.Color("#"+Math.floor(Math.random()*16777215).toString(16));

                        // Local bar settings for labels overwrite global one
                        if (graphData.data[i].showBarLabels == undefined) graphData.data[i].showBarLabels = showBarLabels;

                        var row = new Row(graphData.data[i]);

                        for (var j=0; j<graphData.data[i].values.length; j++) {
                            var bar = new Bar(i, j, barWidth, graphData.data[i].values[j], graphData.data[i].color, graphData.data[i].showBarLabels, barLabelFont, barLabelSize, barLabelColor);

                            row.addBar(bar);
                        }

                        rowCollection.addRow(row);

                        if (graphData.data[i].title) {
                            var rowLabel = new RowLabel(i, rowSpace, barWidth, rowLabelFont, rowLabelSize, rowLabelColor, graphData.data[i].title);

                            rowCollection.addRowLabel(rowLabel);
                        }
                    }

                    for (var i=0; i<graphData.columnLabels.values.length; i++) {
                        var columnLabel = new ColumnLabel(i, columnSpace, barWidth, columnLabelFont, columnLabelSize, columnLabelColor, graphData.columnLabels.values[i]);

                        rowCollection.addColumnLabel(columnLabel);
                    }
				}

                // Give it a name just for simplicity
                var graphName = "barGraph";
                if ((graphData) && (graphData.name)) graphName = graphData.name;
                
                // The graph we will be building
                var graph = new Graph(containerElement, graphName, graphData, rowCollection);

                return graph;
        	}
        }
    };

    if(!window.Mercer) window.Mercer = Mercer;
})();