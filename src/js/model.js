"use strict"
class Model {
  constructor(name = "", diffuse = false, glow = false, tiling = 1, startPos = new THREE.Vector2(0, 0), startRot = 0) {
    this.name = name;
    this.mesh;
    this.mixer;
    this.diffuse = diffuse;
    this.glow = glow;
    this.tiling = tiling;
    this.startX = startPos.x;
    this.startZ = startPos.y;
    this.startRot = startRot;

    this.path = "models/" + name + "/";
    this.texturePath = this.path + "textures/";

    this.load(window.scene);
  }

  load(scene) {
    let self = this;

    var mesh = this.mesh;
    var name = this.name;
    var diffuse = this.diffuse;
    var glow = this.glow;

    var jsonPath = this.path + name + ".json";
    var texturePath = this.texturePath;

    var loader = new THREE.JSONLoader();
    loader.load(jsonPath, handleLoad);

    function handleLoad(geometry, materials) {
      var texloader = new THREE.TextureLoader();

      // Load in the proper textures
      if (diffuse) {
        let tex = texloader.load(texturePath + name + "_diff.png");
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(self.tiling, self.tiling);
        materials[0].map = tex;
      }
      if (glow) { // TODO: make the emissive map work like it should...
        materials[0].emissiveMap = texloader.load(texturePath + name + "_glow.png");
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(self.tiling, self.tiling);
        materials[0].map = tex;

        materials[0].emissive.set(0xffffff);
      }

      materials[0].skinning = true;
      materials[0].morphTargets = true;
      materials[0].side = THREE.FrontSide;

      self.mesh = new THREE.Mesh(geometry, materials[0]);

      if (self.mesh.geometry.animations) {
        self.mesh = new THREE.SkinnedMesh(geometry, materials[0]);
        self.mixer = new THREE.AnimationMixer( self.mesh );
        self.clipActions = new Array();

        for (let e of self.mesh.geometry.animations) {
          self.clipActions[e.name] = self.mixer.clipAction(e);

          // Set animation looping
          switch (e.name) {
            case ANIMATION_TYPE.ATTACK:
              self.clipActions[e.name].setLoop(THREE.loopOnce, 0);
              break;
            case ANIMATION_TYPE.BLOCK:
              self.clipActions[e.name].setLoop(THREE.loopOnce, 0);
              break;
            case ANIMATION_TYPE.DIE:
              self.clipActions[e.name].setLoop(THREE.loopOnce, 0);
              self.clipActions[e.name].clampWhenFinished = true;
              break;
            case ANIMATION_TYPE.OPEN:
              self.clipActions[e.name].setLoop(THREE.loopOnce, 0);
              self.clipActions[e.name].clampWhenFinished = true;
              break;
            default:
              break;
          }
        }
      }

      self.mesh.name = name;
      self.mesh.rotation.y += self.startRot;
      self.mesh.position.set(self.startX, 0 , self.startZ);
      window.scene.add(self.mesh);
    }
  }

  animationStopAllButThis(animationType) {
    for (let key in this.clipActions) {
      if (key != animationType) {
        this.clipActions[key].stop();
      }
    }
  }

  animationStop(animationType) {
    for (var key in this.clipActions) {
      if (key === animationType){
        this.clipActions[key].stop();
      }
    }
  }

  animationSwitch(animationType) {
    if (!this.clipActions) {
      console.log("ERROR: no animations loaded for this model!");
      return;
    }

    if (this.clipActions[animationType]) {
      this.clipActions[animationType].play();
    }
  }

  update(dt) {
    if (this.mixer) {
      this.mixer.update(dt);
    }
  }
}
