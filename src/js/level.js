/**
* A basic level class
* @param {string} name name of the level.
* @param {Render} render Link to the renderer.
*/
class Level {
  // TODO: Allow this class to load a saved level from a file.
  constructor(levelName, render) {
    this.scene = new THREE.Scene();
    this.levelName = levelName;

    this.mainCamera = new THREE.PerspectiveCamera( 75, render.aspect, 0.1, 1000 );
    this.mainCamera.position.set(5, 5, 5);
    this.mainCamera.lookAt(new THREE.Vector3(0, 0, 0));
	//this.mainCamera.lookAt(player.position);

    render.setClearColor(0xCCCCFF, 1);

    // this.controls = new THREE.OrbitControls(this.mainCamera, render.domElement);
    // this.controls.userPanSpeed = 0.1;


    let gridSize = 200;
    let gridDivisions = 200;

    //Texture loader
    this.loader = new THREE.TextureLoader();
    this.floorTexture = this.loader.load("img/floorTexture1.png");

    //Create plane
    this.geometry = new THREE.PlaneGeometry( 200, 200, 1 );
    this.material = new THREE.MeshBasicMaterial( {map: this.floorTexture} );
    this.plane = new THREE.Mesh( this.geometry, this.material );
    this.plane.rotation.x = -1.5708;
    this.scene.add( this.plane );

    var lamp = new THREE.DirectionalLight(0xffffff, 1, 50, 0);
    var aLight = new THREE.AmbientLight(0x404040);
    this.scene.add(lamp, aLight);

    this.chest = new Model("chest_01", true);
    this.chest.load(this.scene);
  }

  update() {

    let loader = new THREE.ObjectLoader();
    // load a resource
    loader.load(
      // resource URL
      'obj/cube.obj',
      // Function when resource is loaded
      function ( object ) {

        this.scene.add( object );
      }
    );
  }

  add (mesh) {
    this.scene.add(mesh);
  }

}
