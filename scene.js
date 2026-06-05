class Scene{
	constructor(root, camera){
		this.root = root
		this.camera = camera
		this.node_refs = new Map();
		this.meshes = new Map();
	}
}