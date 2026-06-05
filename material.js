class Material{
	constructor(ambient, diffuse, specular, shine){
		this.ambient = ambient;
		this.diffuse = diffuse;
		this.specular = specular;
		this.shine = shine;
		this.texture = null;
	}

	load_texture(gl, program, texture_name){
		//Sets up desired texture.
	    let image = new Image();
	    let tex = gl.createTexture();
	    
	    image.onload = () => {
	        gl.bindTexture(gl.TEXTURE_2D, tex);
	        gl.texImage2D(
	            gl.TEXTURE_2D, 0, gl.RGBA,
	            gl.RGBA, gl.UNSIGNED_BYTE, image
	        );
	        gl.generateMipmap(gl.TEXTURE_2D);
	    };
	    image.src = texture_name;
	   
	   this.texture = tex;
	}
}
