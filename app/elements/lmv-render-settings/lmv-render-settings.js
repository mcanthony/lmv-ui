(function() {
  LMVUI.RenderSettings = Polymer({
    is: "lmv-render-settings",

    properties: {
      env: { type:String, observer:"_envChanged" },
      explode: { type:Number, observer:"_explodeChanged" },
      fov: { type:Number, observer:"_fovChanged" },
      ortho: { type:Boolean, observer:"_orthoChanged" },
      aa: { type:Boolean, observer:"_aaChanged" },
      ssao: { type:Boolean, observer:"_ssaoChanged" },
      shadows: { type:Boolean, observer:"_shadowsChanged" },
      reflections: { type:Boolean, observer:"_reflectionsChanged" },
    },

    attached: function() {
      if (!LMVUI._getViewerReference(this))
        return;

      if (this.viewer.model)
        this._initParams();
      else {
        var self = this;
        this.viewer.addEventListener(Autodesk.Viewing.MODEL_ROOT_LOADED_EVENT, function() {
          self._initParams();
        });
      }
    },

    _initParams: function() {
      this.aa = this.viewer.prefs.antialiasing;
      this.ssao = this.viewer.prefs.ambientShadows;
      this.shadows = this.viewer.prefs.groundShadow;
      this.reflections = this.viewer.prefs.groundReflection;
      this.cel = this.viewer.prefs.celShaded;

      var avp = Autodesk.Viewing.Private;
      this.envlist = [];
      for (var i=0; i<avp.LightPresets.length; i++) {
        this.envlist.push({
          value: i, label: avp.LightPresets[i].name
        });
      }
      this.$.env.options = this.envlist;
      this.env = this.viewer.impl.currentLightPreset();

      this.exposure = this.viewer.impl.renderer().getExposureBias();
      this.ortho = !this.viewer.getCamera().isPerspective;
      this.fov = this.viewer.getFOV();
      this.explode = 0;
    },

    _envChanged: function() {
      if (this.viewer && this.env !== this.viewer.impl.currentLightPreset())
        this.viewer.setLightPreset(this.env);
    },
    _aaChanged: function() {
      if (this.viewer) this.viewer.setQualityLevel(this.ssao, this.aa);
    },
    _ssaoChanged: function() {
      if (this.viewer) this.viewer.setQualityLevel(this.ssao, this.aa);
    },
    _shadowsChanged: function() {
      if (this.viewer) this.viewer.setGroundShadow(this.shadows);
    },
    _reflectionsChanged: function() {
      if (this.viewer) this.viewer.setGroundReflection(this.reflections);
    },
    _celChanged: function() {
      if (this.viewer) this.viewer.impl.toggleCelShading(this.cel);
    },
    _exposureChanged: function() {
      if (this.viewer) this.viewer.impl.setTonemapExposureBias(this.exposure, 0);
    },
    _fovChanged: function() {
      if (this.viewer) this.viewer.setFOV(this.fov);
    },
    _orthoChanged: function() {
      if (!this.viewer)
        return;
      if (this.ortho)
        this.viewer.navigation.toOrthographic();
      else
        this.viewer.navigation.toPerspective();
    },
    _explodeChanged: function() {
      if (this.viewer) this.viewer.explode(this.explode);
    }
  });
})();