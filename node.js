class Node{
	constructor(data){
		this.pos_vec = new Vec4(0, 0, 0, 1);
		this.scale_vec = new Vec4(1, 1, 1, 1);
		this.rot_vec = new Vec4(0, 0, 0, 0);
		this.data = data;
		this.children = [];
	}

	add_child(){
		let child = new Node();
		this.children.push(child);

		return child;
	}

	roll_by(amount){
		this.rot_vec.x += amount;
	}

	pitch_by(amount){
		this.rot_vec.y += amount;
	}

	yaw_by(amount){
		this.rot_vec.z += amount;
	}

	strafe_by(amount){
		this.pos_vec.x += amount;
	}
	
	move_forward_by(amount){
		this.pos_vec.z += amount;
	}

	move_up_by(amount){
		this.pos_vec.y += amount;
	}
	
	generate_matrix(){
		return (
			Mat4.identity()
				.mul(Mat4.translation(this.pos_vec.x, this.pos_vec.y, this.pos_vec.z))
				.mul(Mat4.rotation_xz(this.rot_vec.z))
				.mul(Mat4.rotation_yz(this.rot_vec.y))
				.mul(Mat4.rotation_xy(this.rot_vec.x))
				.mul(Mat4.scale(this.scale_vec.x, this.scale_vec.y, this.scale_vec.z))
		);
	}

}