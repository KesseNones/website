
let canvas = document.getElementById( 'the-canvas' );

/** @type {WebGLRenderingContext} */
let gl = canvas.getContext( 'webgl2' );

//Creates new world with basic scene graph root and camera node.
let WORLD = new Scene(new Node(null), new Node(null));

//Scootches camera back a bit to start.
WORLD.camera.move_forward_by(-10);
WORLD.camera.move_up_by(-2);
WORLD.camera.data = {'synched': false, 'current_height': WORLD.camera.pos_vec.y};

const ROTATION_RATE = 1 / 120;
const MOVE_SPEED = 1/60 * 15;

//Adds terrain map
WORLD.node_refs.set('ground', WORLD.root.add_child());
WORLD.node_refs.get('ground').move_forward_by(22);
WORLD.node_refs.get('ground').move_up_by(-7);

WORLD.node_refs.set('terra1', WORLD.node_refs.get('ground').add_child());
WORLD.node_refs.get('terra1').data = {'mesh_name': 'terrain'};

WORLD.node_refs.set('blood', WORLD.node_refs.get('ground').add_child());
WORLD.node_refs.get('blood').data = {'mesh_name': 'water'};
WORLD.node_refs.get('blood').move_forward_by(-20)
WORLD.node_refs.get('blood').scale_vec = new Vec4(2, 0.01, 1.4, 1);

//SPACESHIP MESH CODE
WORLD.node_refs.set('spaceship', WORLD.root.add_child());
WORLD.node_refs.get('spaceship').scale_vec = new Vec4(0.2, 0.2, 0.2, 1);
WORLD.node_refs.get('spaceship').move_up_by(-1.9);
WORLD.node_refs.get('spaceship').data = {
	"up_and_down_count": 0, 
	'base_height': WORLD.node_refs.get('spaceship').pos_vec.y
};

WORLD.node_refs.set('green_ball_ring', WORLD.node_refs.get('spaceship').add_child());
WORLD.node_refs.set('red_ball_ring', WORLD.node_refs.get('spaceship').add_child());
WORLD.node_refs.set('blue_ball_ring', WORLD.node_refs.get('spaceship').add_child());
WORLD.node_refs.set('cube_ring', WORLD.node_refs.get('spaceship').add_child());
WORLD.node_refs.set('outer_cube_ring', WORLD.node_refs.get('spaceship').add_child());

make_ring(WORLD, WORLD.node_refs.get('green_ball_ring'), 'ringA', 3, 'sphere_mesh1', 1, false);
make_ring(WORLD, WORLD.node_refs.get('red_ball_ring'), 'ringB', 3, 'sphere_mesh2', 1, false);
make_ring(WORLD, WORLD.node_refs.get('blue_ball_ring'), 'ringC', 3, 'sphere_mesh3', 1, false);
make_ring(WORLD, WORLD.node_refs.get('cube_ring'), 'out_ring', 12, 'CUBE', 1, false, 'ringAlight');
make_ring(WORLD, WORLD.node_refs.get('outer_cube_ring'), 'outmost_ring', 12, 'CUBE', 2, true, 'ringBlight');

//Blue lights for innermost reactor part.
WORLD.node_refs.set('blue_light0', WORLD.node_refs.get('ringC0').add_child());
WORLD.node_refs.get('blue_light0').data = {'color': [0, 0, 1, 1]};

WORLD.node_refs.set('blue_light1', WORLD.node_refs.get('ringC1').add_child());
WORLD.node_refs.get('blue_light1').data = {'color': [0, 0, 1, 1]};

WORLD.node_refs.set('blue_light2', WORLD.node_refs.get('ringC2').add_child());
WORLD.node_refs.get('blue_light2').data = {'color': [0, 0, 1, 1]};

//Green lights for middle reactor chunk.
WORLD.node_refs.set('green_light0', WORLD.node_refs.get('ringA0').add_child());
WORLD.node_refs.get('green_light0').data = {'color': [0, 1, 0, 1]};

WORLD.node_refs.set('green_light1', WORLD.node_refs.get('ringA1').add_child());
WORLD.node_refs.get('green_light1').data = {'color': [0, 1, 0, 1]};

WORLD.node_refs.set('green_light2', WORLD.node_refs.get('ringA2').add_child());
WORLD.node_refs.get('green_light2').data = {'color': [0, 1, 0, 1]};

//Red lights for outer reactor chunk
WORLD.node_refs.set('red_light0', WORLD.node_refs.get('ringB0').add_child());
WORLD.node_refs.get('red_light0').data = {'color': [1, 0, 0, 1]};

WORLD.node_refs.set('red_light1', WORLD.node_refs.get('ringB1').add_child());
WORLD.node_refs.get('red_light1').data = {'color': [1, 0, 0, 1]};

WORLD.node_refs.set('red_light2', WORLD.node_refs.get('ringB2').add_child());
WORLD.node_refs.get('red_light2').data = {'color': [1, 0, 0, 1]};

//Reactor and outer cube ring established.
WORLD.node_refs.get('green_ball_ring').scale_vec = new Vec4(3, 3, 3, 1);
WORLD.node_refs.get('red_ball_ring').scale_vec = new Vec4(5, 5, 5, 1);
WORLD.node_refs.get('cube_ring').scale_vec = new Vec4(12, 2, 12, 1);

WORLD.node_refs.get('outer_cube_ring').scale_vec = new Vec4(12, 2, 12, 1);

//Establishes control sphere.
WORLD.node_refs.set('CONTROL', WORLD.node_refs.get('spaceship').add_child());
WORLD.node_refs.get('CONTROL').data = {'mesh_name': 'control_mesh'};
WORLD.node_refs.get('CONTROL').move_up_by(10);
WORLD.node_refs.get('CONTROL').scale_vec = new Vec4(25, 5, 25, 1);

//Orbama
WORLD.node_refs.set('orbama pilot', WORLD.node_refs.get('spaceship').add_child());
WORLD.node_refs.get('orbama pilot').data = {'mesh_name': 'ORBAMA'};
WORLD.node_refs.get('orbama pilot').move_up_by(10);
WORLD.node_refs.get('orbama pilot').scale_vec = new Vec4(3, 3, 3, 1);
WORLD.node_refs.get('orbama pilot').yaw_by(-0.25);

//Borg sphere at center of reactor because it looks cool.
WORLD.node_refs.set('borg sphere', WORLD.node_refs.get('spaceship').add_child());
WORLD.node_refs.get('borg sphere').data = {'mesh_name': 'BORG'};


//Generates a series of cube nodes that form a ring.
function make_ring(graph, parent_node, name, piece_count, desired_mesh_name, radius, isCube, light_name){
	const tau = 2 * Math.PI;

	for (let i = 0; i < piece_count; i++){
		let piece_name = `${name}${i}`;

		graph.node_refs.set(piece_name, parent_node.add_child());
		graph.node_refs.get(piece_name).data = {'mesh_name': desired_mesh_name};

		//Scales cube down slightly if it's on an odd section of the ring.
		graph.node_refs.get(piece_name).scale_vec = new Vec4(0.6, 0.6 * ([1.0, 0.95][i % 2]), 0.6, 1);

		graph.node_refs.get(piece_name).yaw_by((i / piece_count) * tau);

		graph.node_refs.get(piece_name).pos_vec.x = Math.cos((i / piece_count) * tau) * radius;
		graph.node_refs.get(piece_name).pos_vec.z = Math.sin((i / piece_count) * tau) * radius;

		//Adds thruster light to cube mesh.
		if (isCube){
			let licht_name = `${light_name}${i}`;
			graph.node_refs.set(licht_name, graph.node_refs.get(piece_name).add_child());
			graph.node_refs.get(licht_name).data = {"color": [0.5, 1, 1, 1]};
			graph.node_refs.get(licht_name).move_up_by(-1);
		}

	}
}


//Additions to make Gouraud shading work.
const vertex_source = 
`   #version 300 es
	precision mediump float;

	const int NUM_LIGHTS = 21;
	
	uniform mat4 modelview;
	uniform mat4 model;

	uniform float mat_ambient;
	uniform float mat_diffuse;
	uniform float mat_specular;
	uniform float mat_shininess;

	uniform float attenuation;

	uniform vec3 sun_dir;
	uniform vec3 sun_color;

	uniform vec3 point_light_positions[NUM_LIGHTS];
	uniform vec3 point_light_colors[NUM_LIGHTS];

	uniform vec3 camera_position;


	in vec3 coordinates;
	in vec4 color;
	in vec2 uv;
	in vec3 normal;

	out vec2 v_uv;

	out vec4 v_color;

	vec3 diff_color(
		vec3 normal,
		vec3 light_dir,
		vec3 light_color,
		float mat_diffuse
	){
		return mat_diffuse * light_color * 
			max(dot(normal, light_dir), 0.0);
	}

	vec3 calc_specular(
		vec3 normal, 
		vec3 dir_to_light,
		vec3 color_of_light,
		vec3 camera_dir,
		float specular,
		float shininess
	){

		float cos_light_surf_normal = dot(normal, dir_to_light);

		vec3 reflection = 2.0 * dot(normalize(dir_to_light), normalize(normal)) 
			* normalize(normal) - normalize(dir_to_light);

		vec3 spec = specular * pow( max((dot(reflection, 
			normalize(camera_dir))), 0.0) , shininess) * color_of_light;

		return spec;
	}                

	void main( void ) {
		vec4 ambient_color = vec4(
			mat_ambient, mat_ambient, mat_ambient, 1.0
		);

		vec3 normal_tx = normalize(mat3(model) * normal);
		vec3 coords_tx = (model * vec4(coordinates, 1.0)).xyz;
		vec3 camera_direction = normalize(camera_position - coords_tx);

		//Diffuse and specular for sun.
		vec4 sun_diffuse = vec4(diff_color(normal_tx, normalize(sun_dir), 
			sun_color, mat_diffuse), 1.0);
		vec4 sun_specular = vec4(calc_specular(normal_tx, normalize(sun_dir), 
			sun_color, camera_direction, mat_specular, mat_shininess), 1.0);

		vec4 net_point_light = vec4(0.0, 0.0, 0.0, 0.0);

		//Adds the colors to v_color;
		for (int i = 0; i < NUM_LIGHTS; i++){
			vec3 shifted = point_light_positions[i] - coords_tx;
			float distance = length(shifted);

			//Diffuse and specular for point light.
			vec4 point_diffuse = vec4(diff_color(normal_tx, 
				normalize(shifted), point_light_colors[i], mat_diffuse), 1.0);
			vec4 point_specular = vec4(calc_specular(normal_tx, normalize(shifted),
				point_light_colors[i], camera_direction, mat_specular, mat_shininess), 1.0);

			float att = 1.0 / (1.0 + (distance * distance));

			net_point_light += (point_diffuse + point_specular) * att;

		}

		gl_Position = modelview * vec4( coordinates, 1.0 );
		v_color = color + ambient_color 
			+ sun_diffuse + sun_specular + net_point_light;
		v_uv = uv;
	}
`;

const fragment_source = 
`   #version 300 es
	precision mediump float;

	in vec4 v_color;
	in vec2 v_uv;

	uniform sampler2D tex;

	out vec4 f_color;

	void main( void ) {
		f_color = texture(tex, v_uv) * v_color;
	}
`;

//Loads new buffer and recompiles and links programs.
const shader_program = create_compile_and_link_program(gl, vertex_source, fragment_source);

gl.useProgram(shader_program);

//Establishes THE SUN.
set_uniform_vec3(gl, shader_program, 'sun_color', 0.0, 0.0, 0.0);
set_uniform_vec3(gl, shader_program, 'sun_dir', 1.4, 1.4, 0.0);
set_uniform_scalar(gl, shader_program, 'attenuation', 1.0);

//Starts listening to keyboard input.
let keyboard = Keys.start_listenting();

//Performs necessary math to get frustum.
let aspect_ratio = canvas.width / canvas.height;
let near = 0.1;
let far = 1000;
const top_screen = Math.tan(((0.25 / aspect_ratio) * (Math.PI * 2)) / 2) * near;
let bottom = -1 * top_screen;
let right = top_screen * aspect_ratio;
let left = -1 * right;
const frustum = Mat4.frustum(left, right, bottom, top_screen, near, far);

//Traverses the scene graph and renders all the desired nodes.
function generate_render_jobs(parent_mat, curr_node, mesh_jobs, light_jobs){
	let curr_mat = parent_mat.mul(curr_node.generate_matrix());

	if (curr_node.data != null && curr_node.data.mesh_name){
		let mesh = WORLD.meshes.get(curr_node.data.mesh_name);
		if (mesh){
			mesh_jobs.push(new RenderMesh(curr_mat, mesh));
		}
	}

	if (curr_node.data != null && curr_node.data.color){
		light_jobs.push(new RenderLight(curr_mat.transform_vec(curr_node.pos_vec), curr_node.data.color));
	}

	for (let child of curr_node.children){
		generate_render_jobs(curr_mat, child, mesh_jobs, light_jobs);
	}
}

//Helper method found on slides.
/**
 * @param {WebFLRenderingContext} gl
 * @param {WebGLProgram} program
 * @param {string} name
 * @param {number[]} data
 * */
function set_uniform_matrix4(gl, program, name, data){
	const loc = gl.getUniformLocation(program, name);
	gl.uniformMatrix4fv(loc, true, data);
}

gl.enable(gl.DEPTH_TEST);
//Animates the triangle by rotating it around the desired axis.
function render(){
	requestAnimationFrame(render);

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	let net_rotation = Mat4.rotation_xz(WORLD.camera.rot_vec.z)
		.mul( Mat4.rotation_yz(WORLD.camera.rot_vec.y)
		.mul(Mat4.rotation_xy(WORLD.camera.rot_vec.x))); 

	//Flattens scene graph into back-end render jobs.
	let mesh_jobs = [];
	let light_jobs = [];
	generate_render_jobs(Mat4.identity(), WORLD.root, mesh_jobs, light_jobs);

	//Renders all the meshes involved.
	for (let i = 0; i < mesh_jobs.length; i++){
		//Derives final modelview matrix.
		const modelview = frustum
			.mul( (Mat4.translation(WORLD.camera.pos_vec.x, WORLD.camera.pos_vec.y, WORLD.camera.pos_vec.z)
			.mul(net_rotation) )
			.inverse()
			.mul(mesh_jobs[i].matrix) );

		//Renders data.
		set_uniform_matrix4(gl, shader_program, "modelview", modelview.data);
		set_uniform_matrix4(gl, shader_program, "model", mesh_jobs[i].matrix.data);
		mesh_jobs[i].mesh.render(gl);
	}

	let light_positions = [];
	let light_colors = [];

	for (let i = 0; i < light_jobs.length; i++){
		light_positions.push(
			light_jobs[i].position.x, 
			light_jobs[i].position.y, 
			light_jobs[i].position.z
		);
		light_colors.push(
			light_jobs[i].color[0], 
			light_jobs[i].color[1], 
			light_jobs[i].color[2]
		);

	}

	const pos_loc = gl.getUniformLocation(shader_program, 'point_light_positions');
	const color_loc = gl.getUniformLocation(shader_program, 'point_light_colors');

	gl.uniform3fv(pos_loc, light_positions);
	gl.uniform3fv(color_loc, light_colors);

}

//Called once mesh exists and calls render function.
function post_load_func(mesh, texture_file_name, mesh_name, material, program){
	if (mesh != null){
		WORLD.meshes.set(mesh_name, mesh);
		mesh.material = material
		mesh.material.load_texture(gl, program, texture_file_name);
	}
}

function update(){
	//Fetches down keys.
	let active_keys = keyboard.keys_down_list();

	let net_rotation = Mat4.rotation_xz(WORLD.camera.rot_vec.z)
		.mul( Mat4.rotation_yz(WORLD.camera.rot_vec.y)
		.mul(Mat4.rotation_xy(WORLD.camera.rot_vec.x))); 

	//Performs actions based on all keys present.
	for (let i = 0; i < active_keys.length; i++){
		switch(active_keys[i]){
			//Move forward case.
			case "KeyW":
				WORLD.camera.strafe_by(MOVE_SPEED * net_rotation.rc(0, 2));
				WORLD.camera.move_up_by(MOVE_SPEED * net_rotation.rc(1, 2));
				WORLD.camera.move_forward_by(MOVE_SPEED * net_rotation.rc(2, 2));
				break;
			//Moving backward case.
			case "KeyS":
				WORLD.camera.strafe_by(-1 * MOVE_SPEED * net_rotation.rc(0, 2));
				WORLD.camera.move_up_by(-1 * MOVE_SPEED * net_rotation.rc(1, 2));
				WORLD.camera.move_forward_by(-1 * MOVE_SPEED * net_rotation.rc(2, 2));
				break;
			//Straifing left case.
			case "KeyA":
				WORLD.camera.strafe_by(-1 * MOVE_SPEED * net_rotation.rc(0, 0));
				WORLD.camera.move_up_by(-1 * MOVE_SPEED * net_rotation.rc(1, 0));
				WORLD.camera.move_forward_by(-1 * MOVE_SPEED * net_rotation.rc(2, 0));
				break;
			//Straifing right case.
			case "KeyD":
				WORLD.camera.strafe_by(MOVE_SPEED * net_rotation.rc(0, 0));
				WORLD.camera.move_up_by(MOVE_SPEED * net_rotation.rc(1, 0));
				WORLD.camera.move_forward_by(MOVE_SPEED * net_rotation.rc(2, 0));
				break;
			//Rolling left case.
			case "KeyQ":
				WORLD.camera.roll_by(-1 * ROTATION_RATE);
				break;
			//Rolling right case.
			case "KeyE":
				WORLD.camera.roll_by(ROTATION_RATE);
				break;
			//Absolute moving up case.
			case "Space": 
				WORLD.camera.move_up_by(MOVE_SPEED);
				break;
			//Absolute moving down case.
			case "KeyC":
				WORLD.camera.move_up_by(-1 * MOVE_SPEED);
				break;
			//Pitching down case.
			case "ArrowUp":
				WORLD.camera.pitch_by(ROTATION_RATE);
				break;
			//Pitching up case.
			case "ArrowDown":
				WORLD.camera.pitch_by(-1 * ROTATION_RATE);
				break;
			//Left yaw case.
			case "ArrowLeft":
				WORLD.camera.yaw_by(-1 * ROTATION_RATE);
				break;
			//Right yaw case.
			case "ArrowRight":
				WORLD.camera.yaw_by(ROTATION_RATE);
				break;
			case "KeyK":
				WORLD.camera.data.synched = true;
				break;
			case "KeyL":
				WORLD.camera.data.synched = false;
				break;
			default:
		}
	}

	//Updates all the components of the scene appropriately.

	set_uniform_vec3(gl, shader_program, 'camera_position', WORLD.camera.pos_vec.x, WORLD.camera.pos_vec.y, WORLD.camera.pos_vec.z);

	const tau = Math.PI * 2;

	//Rotates spaceship.
	WORLD.node_refs.get('spaceship').yaw_by(ROTATION_RATE);
	WORLD.node_refs.get('spaceship').data.up_and_down_count += 1;
	
	//Bobs spaceship up and down.
	WORLD.node_refs.get('spaceship').pos_vec.y = 
		WORLD.node_refs.get('spaceship').data.base_height + 
			0.7 * Math.sin(((WORLD.node_refs.get('spaceship')
				.data.up_and_down_count % 100) / 100) * tau);

	//If the camera is synche with the spaceship motion, 
	// move the camera with the spaceship up and down.
	if (WORLD.camera.data.synched === true){
		WORLD.camera.pos_vec.y = WORLD.camera.data.current_height + 
			0.7 * Math.sin(((WORLD.node_refs.get('spaceship')
				.data.up_and_down_count % 100) / 100) * tau);
	}else{
		WORLD.camera.data.current_height = WORLD.camera.pos_vec.y;
	}
	
	//Rotates sphere rings.
	WORLD.node_refs.get('green_ball_ring').pitch_by(ROTATION_RATE);
	WORLD.node_refs.get('red_ball_ring').roll_by(ROTATION_RATE);
	WORLD.node_refs.get('blue_ball_ring').yaw_by(-2 * ROTATION_RATE);
	WORLD.node_refs.get('blue_ball_ring').roll_by(ROTATION_RATE);
	WORLD.node_refs.get('blue_ball_ring').pitch_by(ROTATION_RATE);
	WORLD.node_refs.get('outer_cube_ring').yaw_by(-2 * ROTATION_RATE);

	//Makes cube rings bob up and down.
	WORLD.node_refs.get('outer_cube_ring').pos_vec.y = 1 * Math.sin(((WORLD.node_refs.get('spaceship').data.up_and_down_count % 100) / 100) * tau);
	WORLD.node_refs.get('cube_ring').pos_vec.y = 1 * Math.cos(((WORLD.node_refs.get('spaceship').data.up_and_down_count % 100) / 100) * tau);
	
	//Makes blood bob up and down.
	WORLD.node_refs.get('blood').pos_vec.y = 0.13 * Math.sin(((WORLD.node_refs.get('spaceship').data.up_and_down_count % 200) / 200) * tau);

	//ORBAMA
	WORLD.node_refs.get('orbama pilot').yaw_by(-1 * ROTATION_RATE);

	//Rotates borg sphere in the center of reactor.
	WORLD.node_refs.get('borg sphere').yaw_by(-5 * ROTATION_RATE);
	WORLD.node_refs.get('borg sphere').pitch_by(ROTATION_RATE);
	WORLD.node_refs.get('borg sphere').roll_by(2 * ROTATION_RATE);

}

//Makes it so user doesn't move at warp 10.
setInterval(update, 1000 / 60);

//Loads in all meshes used.
post_load_func(Mesh.make_uv_sphere(gl, shader_program, 16, null), 'assets/greenReactorSphere.png', 'sphere_mesh1', new Material(5, 1.0, 2.0, 64.0), shader_program);

post_load_func(Mesh.make_uv_sphere(gl, shader_program, 16, null), 'assets/redReactorSphere.png', 'sphere_mesh2', new Material(5, 1.0, 2.0, 64.0), shader_program);

post_load_func(Mesh.make_uv_sphere(gl, shader_program, 16, null), 'assets/blueReactorSphere.png', 'sphere_mesh3', new Material(5, 1.0, 2.0, 64.0), shader_program);

post_load_func(Mesh.make_uv_sphere(gl, shader_program, 16, null), 'assets/controlSphere.png', 'control_mesh', new Material(0.25, 4.0, 4.0, 1.0), shader_program);

post_load_func(Mesh.box(gl, shader_program, 1, 1, 1, null), 'assets/shipBlockTexture.png', 'CUBE', new Material(0.25, 2, 4.0, 4.0), shader_program);

//Performs the diamond square algorithm 
// on a height map to make some nice terrain.
function diamond_square(radius, tl, tr, bl, br, min, max){
	//Creates initial 2^n + 1 by 2^n + 1 heightmap.
	const dim = (2 ** radius) + 1
	let height_map = [];
	for (let row = 0; row < dim; row++){
		let height_row = [];
		for (let col = 0; col < dim; col++){
			height_row.push(0);
		}
		height_map.push(height_row);
	}

	//Sets up the seed values of the height map.
	height_map[0][0] = tl;
	height_map[0][dim - 1] = tr;
	height_map[dim - 1][0] = bl;
	height_map[dim - 1][dim - 1] = br;

	_diamond_square_recurse(height_map, radius, 
		Math.floor(dim / 2), Math.floor(dim / 2), min, max);

	return height_map;

}

//If the index fits in the range of the matrix, 
// returns the indexed item, otherwise returns default value of 0.
function _index_or(map, row, col){
	const row_max = map.length;
	const col_max = map[0].length;

	if ( (row > -1) && (row < row_max) && (col > -1) && (col < col_max) ){
		return map[row][col];
	}else{
		return 0;
	}
}

function _rand_range(low, high, div){
	//Safeguards against dividing by undefined.
	if (!div) {div = 1}

	return ((Math.random() * (high - low + 1)) + low) / div;
}

function _diamond_square_recurse(map, radius, center_row, center_col, min, max){
	//DIAMOND STEP

	const dim = (2 ** radius) + 1;
	const offset = Math.floor(dim / 2);

	const rand_div = 6;

	//Calculates center's average height.
	map[center_row][center_col] = ((
		map[center_row - offset][center_col - offset] +
		map[center_row - offset][center_col + offset] +
		map[center_row + offset][center_col - offset] +
		map[center_row + offset][center_col + offset]
	) / 4) + _rand_range(min, max, rand_div);

	//SQUARE STEP

	//Value of northern height found.
	map[center_row - offset][center_col] = ((
		_index_or(map, center_row - offset - offset, center_col) +
		_index_or(map, center_row - offset, center_col + offset) +
		_index_or(map, center_row - offset + offset, center_col) +
		_index_or(map, center_row - offset, center_col - offset)
	) / 4) +  _rand_range(min, max, rand_div);

	//Value of eastern height found.
	map[center_row][center_col + offset] = ((
		_index_or(map, center_row - offset, center_col + offset) +
		_index_or(map, center_row, center_col + offset + offset) +
		_index_or(map, center_row + offset, center_col + offset) +
		_index_or(map, center_row, center_col - offset + offset)
	) / 4) +  _rand_range(min, max, rand_div);

	//Value of southern height found.
	map[center_row + offset][center_col] = ((
		_index_or(map, center_row + offset - offset, center_col) +
		_index_or(map, center_row + offset, center_col + offset) +
		_index_or(map, center_row + offset + offset, center_col) +
		_index_or(map, center_row + offset, center_col - offset)
	) / 4) +  _rand_range(min, max, rand_div);

	//Value of western height found.
	map[center_row][center_col - offset] = ((
		_index_or(map, center_row - offset, center_col - offset) +
		_index_or(map, center_row, center_col + offset - offset) +
		_index_or(map, center_row + offset, center_col - offset) +
		_index_or(map, center_row, center_col - offset - offset)
	) / 4) + _rand_range(min, max, rand_div);

	
	//RECURSIVE STEP

	if (radius > 1){
		const new_offset = Math.floor(offset / 2);
		
		//Northwest square
		_diamond_square_recurse(
			map, radius - 1, 
			center_row - new_offset, 
			center_col - new_offset, 
			min, max
		);

		//Northeast square
		_diamond_square_recurse(
			map, radius - 1, 
			center_row - new_offset, 
			center_col + new_offset, 
			min, max
		);

		//Southwest square
		_diamond_square_recurse(
			map, radius - 1, 
			center_row + new_offset, 
			center_col - new_offset, 
			min, max
		);

		//Southest square
		_diamond_square_recurse(
			map, radius - 1, 
			center_row + new_offset, 
			center_col + new_offset, 
			min, max
		);

	}

}

//Makes heightmap with base seeds and then two more height maps to be stitched to original.
let height_map = diamond_square(7, 1, 1, 1, 1, -6, 6);

//Makes all height maps involved.
post_load_func(Mesh.make_height_map(gl, shader_program, height_map, -6, 5, null), 'assets/terrain.png', 'terrain',
	new Material(0.25, 3.0, 6.0, 2.0), shader_program);

//Makes the blood water.
post_load_func(Mesh.box(gl, shader_program, 64, 64, 64, null), 'assets/bloodTexMap.png',
	'water', new Material(0.6, 1.0, 2.0, 4.0), shader_program);

//Makes orbama and borg sphere.
post_load_func(Mesh.make_uv_sphere(gl, shader_program, 16, null), 'assets/obama.png', 'ORBAMA',
	new Material(0.6, 1.0, 2.0, 128.0), shader_program);

post_load_func(Mesh.make_uv_sphere(gl, shader_program, 16, null), 'assets/boorgg.png', 'BORG',
	new Material(0.25, 1.0, 3.0, 8.0), shader_program);

gl.clearColor( 0, 0, 0, 1.0 );
render();

