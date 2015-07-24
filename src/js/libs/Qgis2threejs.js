var THREE = require('three')
var OrbitControls = require('./Orbit.js')(THREE);
var detach = require('./detach.js');

  "use strict";

  // Qgis2threejs.js
  // (C) 2014 Minoru Akagi | MIT License
  // https://github.com/minorua/Qgis2threejs

  var Q3D = {VERSION: "1.3"};
  Q3D.Options = {
    bgcolor: null,
    light: {
      directional: {
        azimuth: 220,   // note: default light azimuth of gdaldem hillshade is 315.
        altitude: 45    // altitude angle
      }
    },
    side: {color: 0xc7ac92, bottomZ: -1.5},
    frame: {color: 0, bottomZ: -1.5},
    label: {visible: true, connectorColor: 0xc0c0d0, autoSize: false, minFontSize: 10},
    qmarker: {r: 0.25, c: 0xffff00, o: 0.8},
    debugMode: location.search.indexOf("debug"),
    exportMode: false,
    jsonLoader: "JSONLoader"  // JSONLoader or ObjectLoader
  };

  if (location.search.indexOf("debug") > 0) {
  	Q3D.Controls = {

  	  type: "OrbitControls",

  	  keyList: [ ],

  	  create: function (camera, domElement) {
        return new OrbitControls(camera, domElement);
  	  }

  	};
  }

  Q3D.LayerType = {DEM: "dem", Point: "point", Line: "line", Polygon: "polygon"};
  Q3D.MaterialType = {MeshLambert: 0, MeshPhong: 1, LineBasic: 2, Sprite: 3, Unknown: -1};
  Q3D.uv = {i: new THREE.Vector3(1, 0, 0), j: new THREE.Vector3(0, 1, 0), k: new THREE.Vector3(0, 0, 1)};

  Q3D.ua = window.navigator.userAgent.toLowerCase();
  Q3D.isIE = (Q3D.ua.indexOf("msie") != -1 || Q3D.ua.indexOf("trident") != -1);

  Q3D.$ = function (elementId) {
    return document.getElementById(elementId);
  };

  /*
  Q3D.Project - Project data holder

  params: title, crs, proj, baseExtent, rotation, width, zExaggeration, zShift, wgs84Center
  */
  Q3D.Project = function (params) {
    for (var k in params) {
      this[k] = params[k];
    }

    var w = (this.baseExtent[2] - this.baseExtent[0]),
        h = (this.baseExtent[3] - this.baseExtent[1]);

    this.height = this.width * h / w;
    this.scale = this.width / w;
    this.zScale = this.scale * this.zExaggeration;

    this.origin = {x: this.baseExtent[0] + w / 2,
                   y: this.baseExtent[1] + h / 2,
                   z: -this.zShift};

    this.layers = [];
    this.models = [];
    this.images = [];
  };

  Q3D.Project.prototype = {

    constructor: Q3D.Project,

    addLayer: function (layer) {
      layer.index = this.layers.length;
      layer.project = this;
      this.layers.push(layer);
      return layer;
    },

    layerCount: function () {
      return this.layers.length;
    },

    getLayerByName: function (name) {
      for (var i = 0, l = this.layers.length; i < l; i++) {
        var layer = this.layers[i];
        if (layer.name == name) return layer;
      }
      return null;
    },

    _rotatePoint: function (point, degrees, origin) {
      // Rotate point around the origin
      var theta = degrees * Math.PI / 180,
          c = Math.cos(theta),
          s = Math.sin(theta),
          x = point.x,
          y = point.y;

      if (origin) {
        x -= origin.x;
        y -= origin.y;
      }

      // rotate counter-clockwise
      var xd = x * c - y * s,
          yd = x * s + y * c;

      if (origin) {
        xd += origin.x;
        yd += origin.y;
      }
      return {x: xd, y: yd};
    },

    toMapCoordinates: function (x, y, z) {
      if (this.rotation) {
        var pt = this._rotatePoint({x: x, y: y}, this.rotation);
        x = pt.x;
        y = pt.y;
      }
      return {x: x / this.scale + this.origin.x,
              y: y / this.scale + this.origin.y,
              z: z / this.zScale + this.origin.z};
    }

  };


  /*
  the application

  limitations:
  - one renderer
  - one scene
  */
  Q3D.application = {

    init: function (container) {
      this.container = container;
      this.running = false;

      // URL parameters
      this.urlParams = this.parseUrlParameters();

      if (container.clientWidth >= 0 && container.clientHeight >= 0) {
        this.initial_height = container.clientHeight;
        this.width = container.clientWidth;
        this.height = container.clientHeight;
        this._fullWindow = false;
      } else {
        this.initial_height = window.innerHeight;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this._fullWindow = true;
      }



      // WebGLRenderer
      var bgcolor = Q3D.Options.bgcolor;
      this.renderer = new THREE.WebGLRenderer({ alpha: true,  antialias: false });
      this.renderer.setSize(this.width, this.height);
      this.renderer.setClearColor(bgcolor || 0, (bgcolor === null) ? 0 : 1);
      this.container.appendChild(this.renderer.domElement);
      //this.renderer.setPixelRatio( window.devicePixelRatio );

      // scene
      this.scene = new THREE.Scene();

      this._queryableObjects = [];
      this.queryObjNeedsUpdate = true;

      // label
      this.labelVisibility = Q3D.Options.label.visible;
      this.labelConnectorGroup = new THREE.Group();
      this.labels = [];     // labels of visible layers

      // root element for labels
      var e = document.createElement("div");
      e.style.display = (this.labelVisibility) ? "block" : "none";
      this.container.appendChild(e);
      this.labelRootElement = e;

      this.modelBuilders = [];
      this._wireframeMode = false;

    },


    toScreenPosition: function(obj, camera) {
          var vector = new THREE.Vector3();
          var widthHalf = 0.5 * this.width;
          var heightHalf = 0.5 * this.height;

          obj.updateMatrixWorld();
          vector.setFromMatrixPosition(obj.matrixWorld);
          vector.project(camera);

          vector.x = ( vector.x * widthHalf ) + widthHalf;
          vector.y = - ( vector.y * heightHalf ) + heightHalf;

          return {
              x: vector.x,
              y: vector.y
          };

    },

    parseUrlParameters: function () {
      var p, vars = {};
      var params = window.location.search.substring(1).split('&').concat(window.location.hash.substring(1).split('&'));
      params.forEach(function (param) {
        p = param.split('=');
        vars[p[0]] = p[1];
      });
      return vars;
    },

    loadProject: function (project) {
      this.project = project;

      // light
      if (project.buildCustomLights) project.buildCustomLights(this.scene);
      else this.buildDefaultLights(this.scene);

      // camera
      if (project.buildCustomCamera) project.buildCustomCamera();
      else this.buildDefaultCamera();

      // restore view (camera position and its target) from URL parameters
      var vars = this.urlParams;
      if (vars.cx !== undefined) this.camera.position.set(parseFloat(vars.cx), parseFloat(vars.cy), parseFloat(vars.cz));
      if (vars.ux !== undefined) this.camera.up.set(parseFloat(vars.ux), parseFloat(vars.uy), parseFloat(vars.uz));
      if (vars.tx !== undefined) this.camera.lookAt(parseFloat(vars.tx), parseFloat(vars.ty), parseFloat(vars.tz));

      // controls
      if (Q3D.Controls) {
        this.controls = Q3D.Controls.create(this.camera, this.renderer.domElement);
        if (vars.tx !== undefined) {
          // this.controls.target.set(parseFloat(vars.tx), parseFloat(vars.ty), parseFloat(vars.tz));
          // this.controls.target0.copy(this.controls.target);   // for reset
        }
      }

      // load models
      if (project.models.length > 0) {
        project.models.forEach(function (model, index) {
          if (model.type == "COLLADA") {
            this.modelBuilders[index] = new Q3D.ModelBuilder.COLLADA(this.project, model);
          }
          else if (Q3D.Options.jsonLoader == "ObjectLoader") {
            this.modelBuilders[index] = new Q3D.ModelBuilder.JSONObject(this.project, model);
          }
          else {
            this.modelBuilders[index] = new Q3D.ModelBuilder.JSON(this.project, model);
          }
        }, this);
      }

      // build models
      project.layers.forEach(function (layer) {
        layer.initMaterials();
        layer.build(this.scene);

        // build labels
        if (layer.l) {
          layer.buildLabels(this.labelConnectorGroup, this.labelRootElement);
          this.labels = this.labels.concat(layer.labels);
        }
      }, this);

      if (this.labels.length) this.scene.add(this.labelConnectorGroup);

      // wireframe mode setting
      if ("wireframe" in this.urlParams) this.setWireframeMode(true);

      // create a marker for queried point
      var opt = Q3D.Options.qmarker;
      this.queryMarker = new THREE.Mesh(new THREE.SphereGeometry(opt.r),
                                        new THREE.MeshLambertMaterial({color: opt.c, ambient: opt.c, opacity: opt.o, transparent: (opt.o < 1)}));
      this.queryMarker.visible = false;
      this.scene.add(this.queryMarker);

      this.highlightMaterial = new THREE.MeshLambertMaterial({emissive: 0x999900, transparent: true, opacity: 0.5});
      if (!Q3D.isIE) this.highlightMaterial.side = THREE.DoubleSide;    // Shader compilation error occurs with double sided material on IE11

      this.selectedLayerId = null;
      this.selectedFeatureId = null;
      this.highlightObject = null;
    },

    addEventListeners: function () {
      window.addEventListener("resize", this.eventListener.resize.bind(this));
    },

    eventListener: {
      resize: function () {
          this.setCanvasSize(this.container.clientWidth,this.container.clientHeight);
      }
    },

    setCanvasSize: function (width, height) {
      this.width = width;
      this.height = height;
      this.camera.aspect = width / height;

      this.camera.fov = ( 360 / Math.PI ) * Math.atan( this.tanFOV * ( window.innerHeight / this.initial_height ) );

      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);

    },

    buildDefaultLights: function (parent) {
      var deg2rad = Math.PI / 180;

      // ambient light
      parent.add(new THREE.AmbientLight(0x999999));

      // directional lights
      var opt = Q3D.Options.light.directional;
      var lambda = (90 - opt.azimuth) * deg2rad;
      var phi = opt.altitude * deg2rad;

      var x = Math.cos(phi) * Math.cos(lambda),
          y = Math.cos(phi) * Math.sin(lambda),
          z = Math.sin(phi);

      var light1 = new THREE.DirectionalLight(0xffffff, 0.5);
      light1.position.set(x, y, z);
      parent.add(light1);

      // thin light from the opposite direction
      var light2 = new THREE.DirectionalLight(0xffffff, 0.1);
      light2.position.set(-x, -y, -z);
      parent.add(light2);
    },

    buildDefaultCamera: function () {
      this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000);
      // this.camera = new THREE.CombinedCamera(this.width, this.height, 45, 0.1, 1000, 0.1, 1000);
      this.camera.position.set(0, -100, 100);

      var aspect = this.width / this.height;
      this.camera.fov = 50 - (aspect * 7);
      this.tanFOV = Math.tan( ( ( Math.PI / 180 ) * this.camera.fov / 2 ) );
    },

    currentViewUrl: function () {
      var c = this.camera.position, t = this.controls.target, u = this.camera.up;
      var hash = "#cx=" + c.x + "&cy=" + c.y + "&cz=" + c.z;
      if (t.x || t.y || t.z) hash += "&tx=" + t.x + "&ty=" + t.y + "&tz=" + t.z;
      if (u.x || u.y || u.z != 1) hash += "&ux=" + u.x + "&uy=" + u.y + "&uz=" + u.z;
      return window.location.href.split("#")[0] + hash;
    },

    // start rendering loop
    start: function () {
      this.running = true;
      if (this.controls) this.controls.enabled = true;
      this.animate();
    },

    // animation loop
    animate: function () {
      if (this.running) requestAnimationFrame(this.animate.bind(this));
      if (this.controls) this.controls.update();
      this.render();
    },

    render: function () {
      if (this.isAnimating) {
        this.renderer.render(this.scene, this.camera);
        this.updateLabelPosition();
      }
    },

    updateLabelPosition: function() {
      if (this.labelsEl.style.opacity == "0") { return ;}

      detach(this.labelsEl, function() {
        this.ref.bendGroup.children.forEach(function(bend, i) {
          var pos = this.toScreenPosition(bend, this.camera);
          this.labelEls[i].style.transform = 'translate(' + pos.x + 'px, ' + pos.y + 'px)';
          this.labelEls[i].style.webkitTransform = 'translate(' + pos.x + 'px, ' + pos.y + 'px)';
          this.labelEls[i].style.msTransform = 'translate(' + pos.x + 'px, ' + pos.y + 'px)';
        }.bind(this));
      }.bind(this));
    },



    _offset: function (elm) {
      var top = 0, left = 0;
      do {
        top += elm.offsetTop || 0; left += elm.offsetLeft || 0; elm = elm.offsetParent;
      } while (elm);
      return {top: top, left: left};
    },



  };



  /*
  Q3D.MapLayer
  */
  Q3D.MapLayer = function (params) {

    this.visible = true;
    this.opacity = 1;

    this.m = [];
    for (var k in params) {
      this[k] = params[k];
    }

    // this.materials = undefined;
    this.objectGroup = new THREE.Group();
    this.queryableObjects = [];

  };

  Q3D.MapLayer.prototype = {

    constructor: Q3D.MapLayer,

    addObject: function (object, queryable) {
      if (queryable === undefined) queryable = this.q;

      this.objectGroup.add(object);
      if (queryable) this._addQueryableObject(object);
    },

    _addQueryableObject: function (object) {
      this.queryableObjects.push(object);
      for (var i = 0, l = object.children.length; i < l; i++) {
        this._addQueryableObject(object.children[i]);
      }
    },

    initMaterials: function () {
      this.materials = [];
      if (this.m.length == 0) return;

      var mat, sum_opacity = 0;
      for (var i = 0, l = this.m.length; i < l; i++) {
        var m = this.m[i];

        var opt = {};
        if (m.ds && !Q3D.isIE) opt.side = THREE.DoubleSide;
        if (m.flat) opt.shading = THREE.FlatShading;
        if (m.i !== undefined) {
          var image = this.project.images[m.i];
          if (image.texture === undefined) {
            if (image.src !== undefined) image.texture = THREE.ImageUtils.loadTexture(image.src);
            else image.texture = Q3D.Utils.loadTextureData(image.data);
          }
          opt.map = image.texture;
        }
        if (m.o !== undefined && m.o < 1) {
          opt.opacity = m.o;
          opt.transparent = true;
        }
        if (m.t) opt.transparent = true;
        if (m.w) opt.wireframe = true;

        if (m.type == Q3D.MaterialType.MeshLambert) {
          if (m.c !== undefined) opt.color = opt.ambient = m.c;
          mat = new THREE.MeshLambertMaterial(opt);
        }
        else if (m.type == Q3D.MaterialType.MeshPhong) {
          if (m.c !== undefined) opt.color = opt.ambient = m.c;
          mat = new THREE.MeshBasicMaterial(opt);
        }
        else if (m.type == Q3D.MaterialType.LineBasic) {
          opt.color = m.c;
          mat = new THREE.LineBasicMaterial(opt);
        }
        else {
          opt.color = 0xffffff;
          mat = new THREE.SpriteMaterial(opt);
        }

        m.m = mat;
        this.materials.push(m);
        sum_opacity += mat.opacity;
      }

      // layer opacity is the average opacity of materials
      this.opacity = sum_opacity / this.materials.length;
    },

    setOpacity: function (opacity) {
      this.opacity = opacity;
      this.materials.forEach(function (m) {
        m.m.transparent = Boolean(m.t) || (opacity < 1);
        m.m.opacity = opacity;
      });
    },

    setVisible: function (visible) {
      this.visible = visible;
      this.objectGroup.visible = visible;
      Q3D.application.queryObjNeedsUpdate = true;
    },

    setWireframeMode: function (wireframe) {
      this.materials.forEach(function (m) {
        if (m.w) return;
        if (m.type != Q3D.MaterialType.LineBasic) m.m.wireframe = wireframe;
      });
    }

  };





  /*
  Q3D.VectorLayer --> Q3D.MapLayer
  */
  Q3D.VectorLayer = function (params) {
    this.f = [];
    Q3D.MapLayer.call(this, params);

    this.labels = [];
  };

  Q3D.VectorLayer.prototype = Object.create(Q3D.MapLayer.prototype);
  Q3D.VectorLayer.prototype.constructor = Q3D.VectorLayer;

  Q3D.VectorLayer.prototype.build = function (parent) {};



  /*
  Q3D.PointLayer --> Q3D.VectorLayer
  */
  Q3D.PointLayer = function (params) {
    Q3D.VectorLayer.call(this, params);
    this.type = Q3D.LayerType.Point;
  };

  Q3D.PointLayer.prototype = Object.create(Q3D.VectorLayer.prototype);
  Q3D.PointLayer.prototype.constructor = Q3D.PointLayer;

  Q3D.PointLayer.prototype.build = function (parent) {
    if (this.objType == "Icon") { this.buildIcons(parent); return; }
    if (this.objType == "JSON model" || this.objType == "COLLADA model") { this.buildModels(parent); return; }

    var materials = this.materials;
    var deg2rad = Math.PI / 180;
    var createGeometry, scaleZ = 1;
    if (this.objType == "Sphere") createGeometry = function (f) { return new THREE.SphereGeometry(f.r); };
    else if (this.objType == "Box") createGeometry = function (f) { return new THREE.BoxGeometry(f.w, f.h, f.d); };
    else if (this.objType == "Disk") {
      createGeometry = function (f) {
        var geom = new THREE.CylinderGeometry(f.r, f.r, 0, 32), m = new THREE.Matrix4();
        if (90 - f.d) geom.applyMatrix(m.makeRotationX((90 - f.d) * deg2rad));
        if (f.dd) geom.applyMatrix(m.makeRotationZ(-f.dd * deg2rad));
        return geom;
      };
      if (this.ns === undefined || this.ns == false) scaleZ = this.project.zExaggeration;
    }
    else createGeometry = function (f) { return new THREE.CylinderGeometry(f.rt, f.rb, f.h); };   // Cylinder or Cone

    // each feature in this layer
    this.f.forEach(function (f, fid) {
      f.objs = [];
      var z_addend = (f.h) ? f.h / 2 : 0;
      for (var i = 0, l = f.pts.length; i < l; i++) {
        var mesh = new THREE.Mesh(createGeometry(f), materials[f.m].m);

        var pt = f.pts[i];
        mesh.position.set(pt[0], pt[1], pt[2] + z_addend);
        if (f.rotateX) mesh.rotation.x = f.rotateX * deg2rad;
        if (scaleZ != 1) mesh.scale.z = scaleZ;
        mesh.userData.layerId = this.index;
        mesh.userData.featureId = fid;

        this.addObject(mesh);
        f.objs.push(mesh);
      }
    }, this);

    if (parent) parent.add(this.objectGroup);
  };


  Q3D.PointLayer.prototype.buildModels = function (parent) {
    // each feature in this layer
    this.f.forEach(function (f, fid) {
      Q3D.application.modelBuilders[f.model_index].addFeature(this.index, fid);
    }, this);

    if (parent) parent.add(this.objectGroup);
  };


  /*
  Q3D.LineLayer --> Q3D.VectorLayer
  */
  Q3D.LineLayer = function (params) {
    Q3D.VectorLayer.call(this, params);
    this.type = Q3D.LayerType.Line;
  };

  Q3D.LineLayer.prototype = Object.create(Q3D.VectorLayer.prototype);
  Q3D.LineLayer.prototype.constructor = Q3D.LineLayer;

  Q3D.LineLayer.prototype.build = function (parent) {
    var materials = this.materials;
    if (this.objType == "Line") {
      var createObject = function (f, line) {
        var geom = new THREE.Geometry(), pt;
        for (var i = 0, l = line.length; i < l; i++) {
          pt = line[i];
          geom.vertices.push(new THREE.Vector3(pt[0], pt[1], pt[2]));
        }
        return new THREE.Line(geom, materials[f.m].m);
      };
    }

    // each feature in this layer
    this.f.forEach(function (f, fid) {
      f.objs = [];
      for (var i = 0, l = f.lines.length; i < l; i++) {
        var obj = createObject(f, f.lines[i]);
        obj.userData.layerId = this.index;
        obj.userData.featureId = fid;
        this.addObject(obj);
        f.objs.push(obj);
      }
    }, this);

    if (parent) parent.add(this.objectGroup);
  };


module.exports = Q3D;
