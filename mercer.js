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

            var createMeasurementsLines = function(graphWidth, graphLength, graphHeight, numberOfMeasurementLines, lineColor, labelSize, labelColor, minValue, maxValue) {
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

                    var textGeometry = new THREE.TextGeometry((minValue+Math.round((maxValue-minValue)/numberOfMeasurementLines)*i).toString(), {
                        font: _font,
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

            // Figures out the closet 10, 100, 100 etc the distance between the min and max meets
            var getRoundingInteger = function(min, max) {
                var diff = max-min;

                if (diff === 0) return 1;
                else {
                    var multiplier = 0;

                    while (true) {
                        if ((diff >= Math.pow(10, multiplier)) && (diff < Math.pow(10, multiplier+1))) return Math.pow(10, (multiplier));

                        multiplier++;
                    }
                }
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
            this._graphWidth = null; // the base width which will be show if no data is added
            this._graphLength = null; // the base length which will be show if no data is added

            this._baseEdge = 10; // the distance around the graphing area for the base
            this._baseThickness = 1; // the thickness of the graph base
            this._baseColor = 0xececec; // the color for the base

            this._locked = false; // whether or not to allow the rotation of the graph

            this._showMeasurementLines = true; // whether or not to show measurement lines
            this._numberOfMeasurementLines = 10;
            this._measurementLineColor = 0x222222; // the default color of the measurement lines
            this._measurementLabelSize = 5; // the font size for the measurement label
            this._measurementLabelColor = 0x000000; // the default color for the measurement label

            // Skybox
            this._skyboxColor = 0xffffff;
            this._skyboxOpacity = 1;

            // Determine if there are any global options set
            if (graphData !== undefined) {
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

                if (graphData.measurementLabelSize !== undefined) this._measurementLabelSize = graphData.measurementLabelSize;

                if (graphData.measurementLabelColor !== undefined) this._measurementLabelColor = new THREE.Color(graphData.measurementLabelColor);
            }

            // Now we have everything is defined, set up the scene

            this._scene = new THREE.Scene();


            var minValueY = this._rowCollection.getMinY(),
                maxValueY = this._rowCollection.getMaxY(),
                rangeStepY = getRoundingInteger(minValueY, maxValueY);

            var minGraphRangeY = (minValueY - minValueY %  rangeStepY);
            if (minGraphRangeY != 0) minGraphRangeY -= rangeStepY;

            var maxGraphRangeY = (rangeStepY - maxValueY % rangeStepY) + maxValueY;

            var containerWidth = parseInt(this._container.style.width,10), 
                containerHeight = parseInt(this._container.style.height,10),
                aspect = containerWidth /containerHeight,
                graphWidth = this._rowCollection.getWidth(),
                graphLength = this._rowCollection.getLength();

            this._baseMesh = createBase(graphWidth, graphLength, this._baseEdge, this._baseThickness, this._baseColor);
        
            this._measurementLines = null;
            if (this._showMeasurementLines) this._measurementLines = createMeasurementsLines(graphWidth+(this._baseEdge*2), graphLength+(this._baseEdge*2), maxGraphRangeY, this._numberOfMeasurementLines, this._measurementLineColor, this._measurementLabelSize, this._measurementLabelColor, minGraphRangeY, maxGraphRangeY);

            this._graphObject.add(this._baseMesh);
            if (this._measurementLines) this._graphObject.add(this._measurementLines);

            var rowCollectionObject = this._rowCollection.drawRows(minGraphRangeY, maxGraphRangeY);
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

        var loadFont = function(callback) {
            var loader = new THREE.FontLoader();
            
            loader.load(_fontLocation, function (response) {
                _font = response;

                callback();
            });
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

        RowCollection.prototype.getMinX = function() {
            var min = null;

            for (var i=0; i<this._rows.length; i++) {
                var minValue = this._rows[i].getMinX();

                if ((min === null) || (minValue < min)) min = minValue;
            }

            return min;
        };

        RowCollection.prototype.getMaxX = function() {
            var max = null;

            for (var i=0; i<this._rows.length; i++) {
                var maxValue = this._rows[i].getMaxX();

                if ((max === null) || (maxValue > max)) max = maxValue;
            }

            return max;
        };

        RowCollection.prototype.getMinY = function() {
            var min = null;

            for (var i=0; i<this._rows.length; i++) {
                var minValue = this._rows[i].getMinY();

                if ((min === null) || (minValue < min)) min = minValue;
            }

            return min;
        };

        RowCollection.prototype.getMaxY = function() {
            var max = null;

            for (var i=0; i<this._rows.length; i++) {
                var maxValue = this._rows[i].getMaxY();

                if ((max === null) || (maxValue > max)) max = maxValue;
            }

            return max;
        };

        RowCollection.prototype.getMinZ = function() {
            var min = null;

            for (var i=0; i<this._rows.length; i++) {
                var minValue = this._rows[i].getMinZ();

                if ((min === null) || (minValue < min)) min = minValue;
            }

            return min;
        };

        RowCollection.prototype.getMaxZ = function() {
            var max = null;

            for (var i=0; i<this._rows.length; i++) {
                var maxValue = this._rows[i].getMaxZ();

                if ((max === null) || (maxValue > max)) max = maxValue;
            }

            return max;
        };

        RowCollection.prototype.getWidth = function() {
            var maxWidth = 0;

            for (var i=0; i<this._rows.length; i++) {
                var rowWidth = this._rows[i].getWidth();

                if (rowWidth > maxWidth) maxWidth = rowWidth;
            }

            return maxWidth;
        };

        RowCollection.prototype.getLength = function() {
            if (this._rowSpace) {
                var totalLength = 0;

                for (var i=0; i<this._rows.length; i++) {
                    totalLength += this._rows[i].getLength();

                    if (i != (this._rows.length-1)) totalLength += this._rowSpace;
                }

                return totalLength;
            }
            else {
                var maxLength = 0;

                for (var i=0; i<this._rows.length; i++) {
                    var rowLength = this._rows[i].getLength();

                    if (rowLength > maxLength) maxLength = rowLength;
                }

                return maxLength;
            }
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

        RowCollection.prototype.drawRows = function(graphMinY, graphMaxY) {
            var collectionObjects = new THREE.Object3D();

            for (var i=0; i<this._rows.length; i++) {
                var row = this._rows[i].draw(this.getMinX(), graphMinY, this.getMinZ());

                if (this._rowSpace) row.position.z += ((this._rows[i].getRow()*this._rowSpace) + (this._rows[i].getRow()*this._rows[i].getLength())) + (this._rows[i].getLength()/2);

                collectionObjects.add(row);
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

        var RowLabel = function(row, rowSpace, rowWidth, size, color, text) {
            this._row = row; 
            this._rowSpace = rowSpace; 
            this._rowWidth = rowWidth; 
            this._size = size; 
            this._color = color; 
            this._text = text;
        };

        RowLabel.prototype.draw = function() {
            var textGeometry = new THREE.TextGeometry(this._text, {
                font: _font,
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

        var ColumnLabel = function(column, columnSpace, columnWidth, size, color, text) {
            this._column = column; 
            this._columnSpace = columnSpace; 
            this._columnWidth = columnWidth; 
            this._size = size; 
            this._color = color; 
            this._text = text;
        };

        ColumnLabel.prototype.draw = function() {
            var textGeometry = new THREE.TextGeometry(this._text, {
                font: _font,
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

        var _fontLocation = "fonts/helvetiker_regular.typeface.json";
        var _font = null;

        return {
            // Calling will create a standard line graph
            LineGraph: function(container, graphData, loaded) {
                // -----------------------------------------------
                // Area chart object definitions
                // -----------------------------------------------

                // ***** Code for building and manipulating the rows *****
                var Row = function(row, dataRow, pointSpace, width) {
                    this._id = dataRow.id.toString();
                    this._row = row;

                    this._linePoints = [];

                    this._pointSpace = pointSpace;
                    this._color = dataRow.color;
                    this._lineWidth = width;
                };

                // ----- Getters

                Row.prototype.getRow = function() {
                    return this._row;
                };

                Row.prototype.getMinX = function() {
                    var min = null;

                    for (var i=0; i<this._linePoints.length; i++) {
                        var dataValue = this._linePoints[i].getX();

                        if ((min === null) || (dataValue < min)) min = dataValue;
                    }

                    return min;
                };

                Row.prototype.getMaxX = function() {
                    var max = null;

                    for (var i=0; i<this._linePoints.length; i++) {
                        var dataValue = this._linePoints[i].getX();

                        if ((max === null) || (dataValue > max)) max = dataValue;
                    }

                    return max;
                };

                Row.prototype.getMinY = function() {
                    var min = null;

                    for (var i=0; i<this._linePoints.length; i++) {
                        var dataValue = this._linePoints[i].getY();

                        if ((min === null) || (dataValue < min)) min = dataValue;
                    }

                    return min;
                };

                Row.prototype.getMaxY = function() {
                    var max = null;

                    for (var i=0; i<this._linePoints.length; i++) {
                        var dataValue = this._linePoints[i].getY();

                        if ((max === null) || (dataValue > max)) max = dataValue;
                    }

                    return max;
                };

                Row.prototype.getMinZ = function() {
                    return 0;
                };

                Row.prototype.getMaxZ = function() {
                    return 0;
                };

                Row.prototype.getWidth = function() {
                    return this.getMaxX()-this.getMinX();
                };

                Row.prototype.getLength = function() {
                    return this._lineWidth;
                };

                // ----- Public Methods

                Row.prototype.addLinePoint = function(linePoint) {
                    this._linePoints.push(linePoint);
                }

                Row.prototype.draw = function(graphMinX, graphMinY, graphMinZ) {    
                    var lineObject = new THREE.Object3D();

                    // Generate the outline
                    var lineGeometry = new THREE.Geometry();
                    for (var i=0; i<this._linePoints.length; i++) {
                        lineGeometry.vertices.push(new THREE.Vector3(this._linePoints[i].getX(), this._linePoints[i].getY()-graphMinY, (this._lineWidth/2)));
                    }

                    var areaLine = new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({
                        color: this._color
                    }));

                    lineObject.add(areaLine);

                    lineObject.position.x -= graphMinX;

                    return lineObject;
                };

                // ***** Code for building and manipulating the rows *****
                var LinePoint = function(x, y) {
                    this._x = x;
                    this._y = y;
                };

                LinePoint.prototype.getX = function() {
                    return this._x;
                };

                LinePoint.prototype.getY = function() {
                    return this._y;
                };

                var lineWidth = 2.5, // the width of the lines on the graph
                    rowSpace = 30, // the space between each row
                    rowLabelSize = 4, // the font size for the row label
                    rowLabelColor = 0x000000, // the default color for the row label
                    pointSpace = 5; // the space between each column in a row

                // Allow the override using the graphData options if they exist
                if (graphData !== undefined) {
                    if (graphData.font !== undefined) _fontLocation = graphData.font;

                    if (graphData.lineWidth !== undefined) lineWidth = graphData.lineWidth;
                    
                    if (graphData.rowSpace !== undefined) rowSpace = graphData.rowSpace;

                    if (graphData.rowLabels !== undefined) {
                        if (graphData.rowLabels.size !== undefined) rowLabelSize = graphData.rowLabels.size;

                        if (graphData.rowLabels.color !== undefined) rowLabelColor = new THREE.Color(graphData.rowLabels.color);
                    }

                    if (graphData.pointSpace !== undefined) pointSpace = graphData.pointSpace;
                }

                // Load the font first, we need it
                loadFont(function() {
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

                            var row = new Row(i, graphData.data[i], pointSpace, lineWidth);

                            graphData.data[i].values.sort(function(a,b) {
                                return a.x > b.x ? 1 : a.x < b.x ? -1 : 0;
                            });

                            for (var j=0; j<graphData.data[i].values.length; j++) {
                                var linePoint = new LinePoint(graphData.data[i].values[j].x, graphData.data[i].values[j].y);

                                row.addLinePoint(linePoint);
                            }

                            rowCollection.addRow(row);

                            if (graphData.data[i].title) {
                                var rowLabel = new RowLabel(i, rowSpace, lineWidth, rowLabelSize, rowLabelColor, graphData.data[i].title);

                                rowCollection.addRowLabel(rowLabel);
                            }
                        }
                    }

                    // Give it a name just for simplicity
                    var graphName = "lineGraph";
                    if ((graphData) && (graphData.name)) graphName = graphData.name;
                    
                    // The graph we will be building
                    var graph = new Graph(containerElement, graphName, graphData, rowCollection);

                    return graph;
                });
            },

            // Calling will create a standard area chart
            AreaChart: function(container, graphData, loaded) {
                // -----------------------------------------------
                // Area chart object definitions
                // -----------------------------------------------

                // ***** Code for building and manipulating the rows *****
                var Row = function(row, dataRow, pointSpace, width) {
                    this._id = dataRow.id.toString();
                    this._row = row;

                    this._areaPoints = [];

                    this._pointSpace = pointSpace;
                    this._color = dataRow.color;
                    this._areaWidth = width;
                };

                // ----- Getters

                Row.prototype.getRow = function() {
                    return this._row;
                };

                Row.prototype.getMinX = function() {
                    var min = null;

                    for (var i=0; i<this._areaPoints.length; i++) {
                        var dataValue = this._areaPoints[i].getX();

                        if ((min === null) || (dataValue < min)) min = dataValue;
                    }

                    return min;
                };

                Row.prototype.getMaxX = function() {
                    var max = null;

                    for (var i=0; i<this._areaPoints.length; i++) {
                        var dataValue = this._areaPoints[i].getX();

                        if ((max === null) || (dataValue > max)) max = dataValue;
                    }

                    return max;
                };

                Row.prototype.getMinY = function() {
                    var min = null;

                    for (var i=0; i<this._areaPoints.length; i++) {
                        var dataValue = this._areaPoints[i].getY();

                        if ((min === null) || (dataValue < min)) min = dataValue;
                    }

                    return min;
                };

                Row.prototype.getMaxY = function() {
                    var max = null;

                    for (var i=0; i<this._areaPoints.length; i++) {
                        var dataValue = this._areaPoints[i].getY();

                        if ((max === null) || (dataValue > max)) max = dataValue;
                    }

                    return max;
                };

                Row.prototype.getMinZ = function() {
                    return 0;
                };

                Row.prototype.getMaxZ = function() {
                    return 0;
                };

                Row.prototype.getWidth = function() {
                    return this.getMaxX()-this.getMinX();
                };

                Row.prototype.getLength = function() {
                    return this._areaWidth;
                };

                // ----- Public Methods

                Row.prototype.addAreaPoint = function(areaPoint) {
                    this._areaPoints.push(areaPoint);
                }

                Row.prototype.draw = function(graphMinX, graphMinY, graphMinZ) {    
                    var areaObject = new THREE.Object3D();

                    var frontVertices = [],
                        backVertices = [];

                    var areaGeometry = new THREE.Geometry();

                    // create the front verticies

                    for (var i=0; i<this._areaPoints.length; i++) {
                        frontVertices.push(new THREE.Vector3(this._areaPoints[i].getX(), 0, (this._areaWidth/2)));
                        frontVertices.push(new THREE.Vector3(this._areaPoints[i].getX(), this._areaPoints[i].getY()-graphMinY, (this._areaWidth/2)));
                        backVertices.push(new THREE.Vector3(this._areaPoints[i].getX(), 0, (this._areaWidth/2)*-1));
                        backVertices.push(new THREE.Vector3(this._areaPoints[i].getX(), this._areaPoints[i].getY()-graphMinY, (this._areaWidth/2)*-1));
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
                        color: this._color, 
                        side: THREE.DoubleSide,
                        transparent: true,
                        opacity: 0.65
                    }));

                    areaObject.add(areaMesh);

                    // Generate the outline
                    var areaLineGeometry = new THREE.Geometry();
                    for (var i=0; i<this._areaPoints.length; i++) {
                        areaLineGeometry.vertices.push(new THREE.Vector3(this._areaPoints[i].getX(), this._areaPoints[i].getY()-graphMinY, (this._areaWidth/2)));
                    }

                    var areaLine = new THREE.Line(areaLineGeometry, new THREE.LineBasicMaterial({
                        color: this._color
                    }));

                    areaObject.add(areaLine);

                    areaObject.position.x -= graphMinX;

                    return areaObject;
                };

                // ***** Code for building and manipulating the rows *****
                var AreaPoint = function(x, y) {
                    this._x = x;
                    this._y = y;
                };

                AreaPoint.prototype.getX = function() {
                    return this._x;
                };

                AreaPoint.prototype.getY = function() {
                    return this._y;
                };

                var areaWidth = 4, // the width of the area graph
                    rowSpace = 30, // the space between each row
                    rowLabelSize = 4, // the font size for the row label
                    rowLabelColor = 0x000000, // the default color for the row label
                    pointSpace = 5; // the space between each column in a row

                // Allow the override using the graphData options if they exist
                if (graphData !== undefined) {
                    if (graphData.font !== undefined) _fontLocation = graphData.font;

                    if (graphData.areaWidth !== undefined) areaWidth = graphData.areaWidth;
                    
                    if (graphData.rowSpace !== undefined) rowSpace = graphData.rowSpace;

                    if (graphData.rowLabels !== undefined) {
                        if (graphData.rowLabels.size !== undefined) rowLabelSize = graphData.rowLabels.size;

                        if (graphData.rowLabels.color !== undefined) rowLabelColor = new THREE.Color(graphData.rowLabels.color);
                    }

                    if (graphData.pointSpace !== undefined) pointSpace = graphData.pointSpace;
                }

                // Load the font first, we need it
                loadFont(function() {
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

                            var row = new Row(i, graphData.data[i], pointSpace, areaWidth);

                            graphData.data[i].values.sort(function(a,b) {
                                return a.x > b.x ? 1 : a.x < b.x ? -1 : 0;
                            });

                            for (var j=0; j<graphData.data[i].values.length; j++) {
                                var areaPoint = new AreaPoint(graphData.data[i].values[j].x, graphData.data[i].values[j].y);

                                row.addAreaPoint(areaPoint);
                            }

                            rowCollection.addRow(row);

                            if (graphData.data[i].title) {
                                var rowLabel = new RowLabel(i, rowSpace, areaWidth, rowLabelSize, rowLabelColor, graphData.data[i].title);

                                rowCollection.addRowLabel(rowLabel);
                            }
                        }
                    }

                    // Give it a name just for simplicity
                    var graphName = "areaGraph";
                    if ((graphData) && (graphData.name)) graphName = graphData.name;
                    
                    // The graph we will be building
                    var graph = new Graph(containerElement, graphName, graphData, rowCollection);

                    return graph;
                });
            },

            // Calling will create a standard line graph
            ScatterGraph: function(container, graphData, loaded) {
                // -----------------------------------------------
                // Area chart object definitions
                // -----------------------------------------------

                // ***** Code for building and manipulating the rows *****
                var Row = function(row, dataRow) {
                    this._id = dataRow.id.toString();
                    this._row = row;

                    this._scatterPoints = [];

                    this._color = dataRow.color;
                };

                // ----- Getters

                Row.prototype.getRow = function() {
                    return this._row;
                };

                Row.prototype.getMinX = function() {
                    var min = null;

                    for (var i=0; i<this._scatterPoints.length; i++) {
                        var dataValue = this._scatterPoints[i].getX();

                        if ((min === null) || (dataValue < min)) min = dataValue;
                    }

                    return min;
                };

                Row.prototype.getMaxX = function() {
                    var max = null;

                    for (var i=0; i<this._scatterPoints.length; i++) {
                        var dataValue = this._scatterPoints[i].getX();

                        if ((max === null) || (dataValue > max)) max = dataValue;
                    }

                    return max;
                };

                Row.prototype.getMinY = function() {
                    var min = null;

                    for (var i=0; i<this._scatterPoints.length; i++) {
                        var dataValue = this._scatterPoints[i].getY();

                        if ((min === null) || (dataValue < min)) min = dataValue;
                    }

                    return min;
                };

                Row.prototype.getMaxY = function() {
                    var max = null;

                    for (var i=0; i<this._scatterPoints.length; i++) {
                        var dataValue = this._scatterPoints[i].getY();

                        if ((max === null) || (dataValue > max)) max = dataValue;
                    }

                    return max;
                };

                Row.prototype.getMinZ = function() {
                    var min = null;

                    for (var i=0; i<this._scatterPoints.length; i++) {
                        var dataValue = this._scatterPoints[i].getZ();

                        if ((min === null) || (dataValue < min)) min = dataValue;
                    }

                    return min;
                };

                Row.prototype.getMaxZ = function() {
                    var max = null;

                    for (var i=0; i<this._scatterPoints.length; i++) {
                        var dataValue = this._scatterPoints[i].getZ();

                        if ((max === null) || (dataValue > max)) max = dataValue;
                    }

                    return max;
                };

                Row.prototype.getWidth = function() {
                    return this.getMaxX()-this.getMinX();
                };

                Row.prototype.getLength = function() {
                    return this.getMaxZ()-this.getMinZ();
                };

                // ----- Public Methods

                Row.prototype.addScatterPoint = function(linePoint) {
                    this._scatterPoints.push(linePoint);
                }

                Row.prototype.draw = function(graphMinX, graphMinY, graphMinZ) {    
                    var rowObject = new THREE.Object3D();

                    for (var i=0; i<this._scatterPoints.length; i++) {
                        rowObject.add(this._scatterPoints[i].draw(this._color));
                    }

                    rowObject.position.x -= graphMinX;
                    rowObject.position.z -= graphMinZ;

                    return rowObject;
                };

                // ***** Code for building and manipulating the rows *****
                var ScatterPoint = function(x, y, z, pointSize) {
                    this._x = x;
                    this._y = y;
                    this._z = z;
                    this._pointSize = pointSize;
                };

                ScatterPoint.prototype.getX = function() {
                    return this._x;
                };

                ScatterPoint.prototype.getY = function() {
                    return this._y;
                };

                ScatterPoint.prototype.getZ = function() {
                    return this._z;
                };

                ScatterPoint.prototype.draw = function(color) {
                    var pointGeometry = new THREE.SphereGeometry(this._pointSize, 100, 100),
                        pointMaterial = new THREE.MeshLambertMaterial({
                            color: color,
                            side:THREE.DoubleSide, 
                            transparent: true,
                            opacity: 0.8
                        });

                    var pointMesh = new THREE.Mesh(pointGeometry, pointMaterial)

                    pointMesh.position.x = this._x;
                    pointMesh.position.y = this._y;
                    pointMesh.position.z = this._z;

                    return pointMesh;
                };

                var pointSize = 6; // the space between each column in a row

                // Allow the ovesride using the graphData options if they exist
                if (graphData !== undefined) {
                    if (graphData.font !== undefined) _fontLocation = graphData.font;

                    if (graphData.pointSize !== undefined) pointSize = graphData.pointSize;
                }

                // Load the font first, we need it
                loadFont(function() {
                    var containerElement = document.getElementById(container),
                        containerWidth = parseInt(containerElement.style.width,10), 
                        containerHeight = parseInt(containerElement.style.height,10);

                    var rowCollection = new RowCollection(null);

                    // check that we've have some data passed in
                    if (graphData) {
                        for (var i=0; i<graphData.data.length; i++) {
                            if (graphData.data[i].id == undefined) graphData.data[i].id = i.toString();

                            if (graphData.data[i].color !== undefined) graphData.data[i].color = new THREE.Color(graphData.data[i].color);
                            else graphData.data[i].color = new THREE.Color("#"+Math.floor(Math.random()*16777215).toString(16));

                            var row = new Row(i, graphData.data[i]);

                            graphData.data[i].values.sort(function(a,b) {
                                return a.x > b.x ? 1 : a.x < b.x ? -1 : 0;
                            });

                            for (var j=0; j<graphData.data[i].values.length; j++) {
                                var scatterPoint = new ScatterPoint(graphData.data[i].values[j].x, graphData.data[i].values[j].y, graphData.data[i].values[j].z, pointSize);

                                row.addScatterPoint(scatterPoint);
                            }

                            rowCollection.addRow(row);
                        }
                    }

                    // Give it a name just for simplicity
                    var graphName = "scatterGraph";
                    if ((graphData) && (graphData.name)) graphName = graphData.name;
                    
                    // The graph we will be building
                    var graph = new Graph(containerElement, graphName, graphData, rowCollection);

                    return graph;
                });
            },

            // Calling will create a standard bar chart
            BarChart: function(container, graphData, loaded) {
                // -----------------------------------------------
                // Bar chart object definitions
                // -----------------------------------------------

                // ***** Code for building and manipulating the rows *****
                var Row = function(row, dataRow, columnSpace, width) {
                    this._id = dataRow.id.toString();
                    this._row = row;

                    this._bars = [];

                    this._barWidth = width;

                    this._columnSpace = columnSpace;

                    this._barLabels = dataRow.showBarLabels;
                };

                // ----- Getters

                Row.prototype.getRow = function() {
                    return this._row;
                };

                Row.prototype.getMinX = function() {
                    return 0;
                };

                Row.prototype.getMaxX = function() {
                    return 0;
                };

                Row.prototype.getMinY = function() {
                    var min = null;

                    for (var i=0; i<this._bars.length; i++) {
                        var dataValue = this._bars[i].getDataValue();

                        if ((min === null) || (dataValue < min)) min = dataValue;
                    }

                    return min;
                };

                Row.prototype.getMaxY = function() {
                    var max = null;

                    for (var i=0; i<this._bars.length; i++) {
                        var dataValue = this._bars[i].getDataValue();

                        if ((max === null) || (dataValue > max)) max = dataValue;
                    }

                    return max;
                };

                Row.prototype.getMinZ = function() {
                    return 0;
                };

                Row.prototype.getMaxZ = function() {
                    return 0;
                };

                Row.prototype.getWidth = function() {
                    var totalWidth = 0;

                    for (var i=0; i<this._bars.length; i++) {
                        totalWidth += this._barWidth;

                        if (i != (this._bars.length-1)) totalWidth += this._columnSpace;
                    }

                    return totalWidth;
                };

                Row.prototype.getLength = function() {
                    var maxLength = 0;

                    for (var i=0; i<this._bars.length; i++) {
                        var barWidth = this._barWidth;

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

                Row.prototype.draw = function(graphMinX, graphMinY, graphMinZ) {
                    var barObjects = new THREE.Object3D();

                    for (var i=0; i<this._bars.length; i++) {
                        barObjects.add(this._bars[i].draw(graphMinY, this._barWidth));
                    }

                    return barObjects;
                };

                // ***** Code for building and manipulating the bars *****

                var Bar = function(column, barWidth, dataValue, color, showLabels, labelSize, labelColor) {
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

                    this._column = column;
                    this._barWidth = barWidth;
                    this._color = color;
                    this._dataValue = dataValue;
                    this._showLabels = showLabels;
                    this._labelSize = labelSize;
                    this._labelColor = labelColor;
                }

                // ----- Getters

                Bar.prototype.getDataValue = function() {
                    return this._dataValue;
                };

                Bar.prototype.getHeight = function() {
                    return this._height;
                };

                Bar.prototype.getBarWidth = function() {
                    return this._barWidth;
                };

                Bar.prototype.getBarObject = function() {
                    return this._barObject;
                }

                // ----- Public Methods

                Bar.prototype.draw = function(graphMinY, barWidth) {
                    this._barObject = new THREE.Object3D();

                    // Calculate the bar geometry
                    var xPos = ((this._column*columnSpace) + (this._column*barWidth)) + (barWidth/2),
                        height = (this._dataValue-graphMinY);

                    var barGeometry = new THREE.Geometry();
                    barGeometry.dynamic = true;

                    // Plot the verticies
                    barGeometry.vertices = this.getBarVertices(xPos, 0, height, barWidth);

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
                        color: this._color, 
                        side: THREE.DoubleSide,
                        transparent: true,
                        opacity: barOpacity
                    }));
                    barMesh.name = "bar";

                    this._barObject.add(barMesh);

                    var barOutline = new THREE.Object3D();
                    barOutline.name = "outline";

                    // Generate the outlines

                    barOutline.add(this.getOutlineMesh("front", xPos, 0, height, barWidth, this._color));
                    barOutline.add(this.getOutlineMesh("back", xPos, 0, height, barWidth, this._color));
                    barOutline.add(this.getOutlineMesh("left", xPos, 0, height, barWidth, this._color));
                    barOutline.add(this.getOutlineMesh("right", xPos, 0, height, barWidth, this._color));

                    this._barObject.add(barOutline);

                    if (this._showLabels) {
                        var valueGeometry = new THREE.TextGeometry(this._dataValue, {
                            font: _font,
                            size: this._labelSize,
                            height: .2
                        });
                        
                        var valueMesh = new THREE.Mesh(valueGeometry, new THREE.MeshBasicMaterial({
                            color: this._labelColor
                        }));

                        var valueArea = new THREE.Box3().setFromObject(valueMesh);

                        valueMesh.position.x = xPos-(valueArea.size().x/2);
                        valueMesh.position.y = this._height + 2;
                        valueMesh.position.z = zPos;

                        this._barObject.add(valueMesh);
                    }

                    return this._barObject;
                };

                // Set up the basic configuration for the bar
                var barWidth = 15, // the width of the bar
                    barOpacity = 0.65, // how opaque the bars are
                    showBarLabels = false, // global setting, should bar labels be visible
                    barLabelSize = 6, // the font size for the row label
                    barLabelColor = 0x000000, // the default color for the row label
                    rowSpace = 30, // the space between each row
                    rowLabelSize = 4, // the font size for the row label
                    rowLabelColor = 0x000000, // the default color for the row label
                    columnSpace = 10, // the space between each column in a row
                    columnLabelSize = 4, // the font size for the col label
                    columnLabelColor = 0x000000; // the default color for the col label

                // Allow the override using the graphData options if they exist
                if (graphData !== undefined) {
                    if (graphData.font !== undefined) _fontLocation = graphData.font;

                    if (graphData.barWidth !== undefined) barWidth = graphData.barWidth;

                    if (graphData.barOpacity !== undefined) barOpacity = graphData.barOpacity;

                    if (graphData.showBarLabels !== undefined) showBarLabels = graphData.showBarLabels;

                    if (graphData.barLabelSize !== undefined) barLabelSize = graphData.barLabelSize;

                    if (graphData.barLabelColor !== undefined) barLabelColor = new THREE.Color(graphData.barLabelColor);
                    
                    if (graphData.rowSpace !== undefined) rowSpace = graphData.rowSpace;

                    if (graphData.rowLabels !== undefined) {
                        if (graphData.rowLabels.size !== undefined) rowLabelSize = graphData.rowLabels.size;

                        if (graphData.rowLabels.color !== undefined) rowLabelColor = new THREE.Color(graphData.rowLabels.color);
                    }

                    if (graphData.columnSpace !== undefined) columnSpace = graphData.columnSpace;

                    if (graphData.columnLabels !== undefined) {
                        if (graphData.columnLabels.size !== undefined) columnLabelSize = graphData.columnLabels.size;

                        if (graphData.columnLabels.color !== undefined) columnLabelColor = new THREE.Color(graphData.columnLabels.color);
                    }
                }

                // Load the font first, we need it
                loadFont(function() {
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

                            var row = new Row(i, graphData.data[i], columnSpace, barWidth);

                            for (var j=0; j<graphData.data[i].values.length; j++) {
                                var bar = new Bar(j, barWidth, graphData.data[i].values[j], graphData.data[i].color, graphData.data[i].showBarLabels, barLabelSize, barLabelColor);

                                row.addBar(bar);
                            }

                            rowCollection.addRow(row);

                            if (graphData.data[i].title) {
                                var rowLabel = new RowLabel(i, rowSpace, barWidth, rowLabelSize, rowLabelColor, graphData.data[i].title);

                                rowCollection.addRowLabel(rowLabel);
                            }
                        }

                        for (var i=0; i<graphData.columnLabels.values.length; i++) {
                            var columnLabel = new ColumnLabel(i, columnSpace, barWidth, columnLabelSize, columnLabelColor, graphData.columnLabels.values[i]);

                            rowCollection.addColumnLabel(columnLabel);
                        }
                    }

                    // Give it a name just for simplicity
                    var graphName = "barGraph";
                    if ((graphData) && (graphData.name)) graphName = graphData.name;
                    
                    // The graph we will be building
                    var graph = new Graph(containerElement, graphName, graphData, rowCollection);

                    return graph;
                });
            }
        }
    };

    if(!window.Mercer) window.Mercer = Mercer;
})();