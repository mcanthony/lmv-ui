(function() {
  Polymer({
    is: "lmv-ui",

    attached: function() {
      if (!LMVUI._getViewerReference(this)) return;
      this.viewerElem = this.viewerElem || LMVUI.getViewerElem();

      this.hasAnimation = false;
      this.hasModelRoot = false;
      this.docName = "";

      var self = this;

      // hook up to viewer events

      // load progress
      LMVUI._addViewerListener(this, Autodesk.Viewing.PROGRESS_UPDATE_EVENT, function(event) {
        self.loadProgress = event.percent / 100.0;
        self.isLoading = self.loadProgress < 1;
      });

      // init 2D/3D nav tool
      // TODO_NOP: should this be handled by viewer?
      LMVUI._addViewerListener(this, Autodesk.Viewing.MODEL_ROOT_LOADED_EVENT, function() {
        self.viewer.setDefaultNavigationTool(
          self.viewer.navigation.getIs2D() ? "pan" : "orbit"
        );
      });

      // property db loaded
      LMVUI._addViewerListener(this, Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, function() {
        self.hasAnimation = !!self.viewer.impl.model.myData.animations;
        self.hasModelRoot = !!self.viewer.model.getRoot();
        if (self.viewerElem.doc)
          self.docName = self.viewerElem.doc.getRootItem().children[0].name;
      });

      // geometry complete
      LMVUI._addViewerListener(this, Autodesk.Viewing.GEOMETRY_LOADED_EVENT, function() {
        // set render stats
        var geomList = self.viewer.impl.modelQueue().getGeometryList();
        self.renderStats = [];
        self.renderStats.push(["Meshes",          geomList.geoms.length]);
        self.renderStats.push(["Fragments",       self.viewer.impl.modelQueue().getFragmentList().getCount()]);
        self.renderStats.push(["Instanced Polys", geomList.instancePolyCount.toLocaleString()]);
        self.renderStats.push(["Geometry Polys",  geomList.geomPolyCount.toLocaleString()]);
        self.renderStats.push(["Geometry Size",   (geomList.geomMemory/(1024*1024)).toFixed(2) + " MB"]);
        // self.renderStats.push(["Load time",       (self.viewer.impl.svfloader.loadTime/1000).toFixed(2) + " s"]);
      });
    },

    createPanel: function(title, elems) {
      var panel = new LMVUI.Panel(title);

      if (Array.isArray(elems)) {
        elems.forEach(function(e) {
          Polymer.dom(panel).appendChild(e);
        });
      }
      else {
        Polymer.dom(panel).appendChild(elems);
      }

      Polymer.dom(this.$["panels-wrap"]).appendChild(panel);

      return panel;
    },

    createRenderStats: function() {
      var elem = new LMVUI.Table(this.renderStats);
      elem.right = true;
      return this.createPanel("Render Stats", elem);
    },

    createModelTree: function() {
      var modelTree = new LMVUI.ModelTree();
      modelTree.viewer = this.viewer;
      return this.createPanel("Model Structure", modelTree);
    },

    createModelProperty: function() {
      var elem = new LMVUI.ModelProperty();
      elem.viewer = this.viewer;
      return this.createPanel("Model Property", elem);
    },

    createRenderSettings: function() {
      var elem = new LMVUI.RenderSettings();
      elem.viewer = this.viewer;
      return this.createPanel("Render Settings", elem);
    },

    createRenderEnvs: function() {
      var elem = new LMVUI.RenderEnvs();
      elem.viewer = this.viewer;
      return this.createPanel("Environments", elem);
    },

    createAnimationPlayer: function() {
      var elem = new LMVUI.AnimationPlayer();
      elem.viewer = this.viewer;
      return this.createPanel("Animation", elem);
    },

    createLiveReview: function() {
      var elem = new LMVUI.CollabView();
      elem.viewer = this.viewer;
      elem.viewerElem = this.viewerElem;
      return this.createPanel("Live Review", elem);
    },

    createModelSection: function() {
      var elem = new LMVUI.ModelSection();
      elem.viewer = this.viewer;
      return this.createPanel("Model Section", elem);
    },

    togglePanel: function(e) {
      var button = e.currentTarget;
      var name = button.getAttribute("cmd");

      if (!this._openedPanels)
        this._openedPanels = {};

      var panels = this._openedPanels;

      if (!e.detail.active) {
        if (panels[name])
          panels[name].hidden = true;
      }
      else {
        if (panels[name]) {
          panels[name].hidden = false;
        }
        else {
          var panel = panels[name] = this["create"+name]();
          panel.close = function() {
            this.hidden = true;
            button.active = false;
          };
        }
      }
    },

    // hackiest code i've ever written
    toggleTool: function(e) {
      var tools = {};

      if (e.detail.active) {
        var button = e.currentTarget;
        var name = button.getAttribute("cmd");
        tools[name] = button;

        var keys = Object.keys(this._toolarea);
        if (keys.length)
          this._toolarea[keys[0]].active = false;
      }

      this._toolarea = tools;
    },

    _onExplode: function(e) {
      if (this.viewer) this.viewer.explode(e.detail.value);
    },

    takeScreenshot: function() {
      window.open(this.viewer.getScreenShot());
    },

    detached: function() {
      LMVUI._cleanupListeners(this);
    },

  });
})();
