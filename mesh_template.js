
const VERTEX_STRIDE = 48;

class Mesh {
    /** 
     * Creates a new mesh and loads it into video memory.
     * 
     * @param {WebGLRenderingContext} gl  
     * @param {number} program
     * @param {number[]} vertices
     * @param {number[]} indices
    */
    constructor( gl, program, vertices, indices, material ) {
        this.verts = create_and_load_vertex_buffer( gl, vertices, gl.STATIC_DRAW );
        this.indis = create_and_load_elements_buffer( gl, indices, gl.STATIC_DRAW );

        this.n_verts = vertices.length;
        this.n_indis = indices.length;
        this.program = program;
        this.material = material;
    }

    static _color(height, min, max){
        const MIN_HEIGHT_COLOR = 0.2;
        let normed_height = (height - min) / (max - min);
        return MIN_HEIGHT_COLOR + normed_height;
    }

    static _push_vert(verts, pos, u, v, normal, min, max){
        verts.push(pos.x, pos.y, pos.z);
        const color = Mesh._color(pos.y, min, max);
        verts.push(0, 0, 0, 1);
        verts.push(u, v);
        verts.push(normal.x, normal.y, normal.z);
    }

    //Takes in height map and generates terrain mesh.
    static make_height_map(gl, program, heights, min, max, material){
        const rows = heights.length;
        const cols = heights[0].length;

        const center_z = rows / 2;
        const center_x = cols / 2;

        let verts = [];
        let inds = [];

        let indices_defined = 0;

        for (let row = 1; row < rows; row++){
            for (let col = 1; col < cols; col++){
                let position_top_left = heights[row - 1][col - 1];
                let position_top_right = heights[row - 1][col];
                let position_bottom_left = heights[row][col - 1];
                let position_bottom_right = heights[row][col];

                let vector_top_left = new Vec4(-1, position_top_left, -1);
                let vector_top_right = new Vec4(0, position_top_right, -1);
                let vector_bottom_left = new Vec4(-1, position_bottom_left, 0);
                let vector_bottom_right = new Vec4(0, position_bottom_right, 0);                

                let normal_triangle_1 = Vec4.normal_of_triangle(
                    vector_top_left, vector_top_right, vector_bottom_left);

                let normal_triangle_2 = Vec4.normal_of_triangle(
                    vector_bottom_right, vector_bottom_left, vector_top_right);

                //Avoids drawing polygons on top of each other. 
                // THIS CALCULATION IS QUITE SUS.
                vector_top_left.x += col - (center_x);
                vector_top_left.z += row - (center_z);

                vector_top_right.x += col - (center_x);
                vector_top_right.z += row - (center_z);

                vector_bottom_left.x += col - (center_x);
                vector_bottom_left.z += row - (center_z);

                vector_bottom_right.x += col - (center_x);
                vector_bottom_right.z += row - (center_z);

                //Adds vertices.
                Mesh._push_vert(verts, vector_top_left, 0, 1, normal_triangle_1, min, max);
                Mesh._push_vert(verts, vector_top_right, 1, 1, normal_triangle_1, min, max);
                Mesh._push_vert(verts, vector_bottom_left, 0, 0, normal_triangle_1, min, max);

                Mesh._push_vert(verts, vector_bottom_right, 1, 0, normal_triangle_2, min, max);
                Mesh._push_vert(verts, vector_bottom_left, 0, 0, normal_triangle_2, min, max);
                Mesh._push_vert(verts, vector_top_right, 1, 1, normal_triangle_2, min, max);

                inds.push(
                    indices_defined,
                    indices_defined + 1,
                    indices_defined + 2,
                    indices_defined + 3,
                    indices_defined + 4, 
                    indices_defined + 5
                );

                indices_defined += 6;

            }
        }

        return new Mesh(gl, program, verts, inds, material);
    }

    //Creates a uv sphere mesh with the desired subdivisions and material.
    static make_uv_sphere(gl, program, subdivisions, material){
        const tau = Math.PI * 2;
        let verts  = [];
        let inds = [];

        for (let layer = 0; layer <= subdivisions; layer ++){
            let y_turns = layer / subdivisions / 2;
            let radius_scale = Math.sin(tau * y_turns);
            let y = Math.cos(y_turns * tau) / 2;
            
            for (let subdiv = 0; subdiv <= subdivisions; subdiv++){
                let curr_angle = (subdiv / subdivisions) * tau;
                let x = (Math.cos(curr_angle) / 2) * radius_scale;
                let z = (Math.sin(curr_angle) / 2) * radius_scale;

                //Adds coords
                verts.push(x, y, z);

                //Adds colors (all verts set to black).
                verts.push(0, 0, 0, 1);
                
                //Adds UV coords.
                verts.push((subdiv / (subdivisions) ), (layer / (subdivisions) ));

                //Adds normal vector components for given point.
                verts.push(x / radius_scale, y / radius_scale, z / radius_scale);

                //Sets up appropriate indicies for given sphere face.
                if (layer > 0 && (subdiv < subdivisions)){
                    let offset = ((layer - 1) * (subdivisions + 1) );
                    
                    let topLeft = offset + subdiv;
                    let topRight = (topLeft + 1);
                    let bottomLeft = topLeft + (subdivisions + 1);
                    let bottomRight = (bottomLeft + 1);

                    //console.log(topLeft, topRight, bottomLeft, bottomRight);

                    //First triangle of given face.
                    inds.push(bottomRight, topRight, topLeft);

                    //Second triangle of face.
                    inds.push(topLeft, bottomLeft, bottomRight);
                }
            }
        }

        return new Mesh(gl, program, verts, inds, material);

    }

    /**
     * Create a box mesh with the given dimensions and colors.
     * @param {WebGLRenderingContext} gl 
     * @param {number} width 
     * @param {number} height 
     * @param {number} depth 
     */

    static box( gl, program, width, height, depth, material ) {
        let hwidth = width / 2.0; //0.5
        let hheight = height / 2.0; //0.5
        let hdepth = depth / 2.0; //0.5

        let verts = [
            hwidth, -hheight, -hdepth,      0.0, 0.0, 0.0, 1.0, 0.25, 0.5, 0, 0, -1,
            hwidth, -hheight, -hdepth,      0.0, 0.0, 0.0, 1.0, 0.5, 0.75, 0, -1, 0,
            hwidth, -hheight, -hdepth,      0.0, 0.0, 0.0, 1.0, 0.25, 0.5, 1, 0, 0,
            
            hwidth, hheight, -hdepth,       0.0, 0.0, 0.0, 1.0, 0.25, 0.25, 0, 0, -1,
            hwidth, hheight, -hdepth,       0.0, 0.0, 0.0, 1.0, 0.5, 0,     0, 1, 0,
            hwidth, hheight, -hdepth,       0.0, 0.0, 0.0, 1.0, 0.25, 0.25, 1, 0, 0,
            
            -hwidth, hheight, -hdepth,      0.0, 0.0, 0.0, 1.0, 0, 0.25, 0, 0, -1,
            -hwidth, hheight, -hdepth,      0.0, 0.0, 0.0, 1.0, 0.75, 0, 0, 1, 0,
            -hwidth, hheight, -hdepth,      0.0, 0.0, 0.0, 1.0, 1, 0.25, -1, 0, 0,
            
            -hwidth, -hheight, -hdepth,     0.0, 0.0, 0.0, 1.0, 0, 0.5,     0, 0, -1,
            -hwidth, -hheight, -hdepth,     0.0, 0.0, 0.0, 1.0, 0.75, 0.75, 0, -1, 0,
            -hwidth, -hheight, -hdepth,     0.0, 0.0, 0.0, 1.0, 1, 0.5,     -1, 0, 0,

            hwidth, -hheight, hdepth,       0.0, 0.0, 0.0, 1.0, 0.5, 0.5, 0, 0, 1,
            hwidth, -hheight, hdepth,       0.0, 0.0, 0.0, 1.0, 0.5, 0.5, 0, -1, 0,
            hwidth, -hheight, hdepth,       0.0, 0.0, 0.0, 1.0, 0.5, 0.5, 1, 0, 0,

            hwidth, hheight, hdepth,        0.0, 0.0, 0.0, 1.0, 0.5, 0.25, 0, 0, 1, 
            hwidth, hheight, hdepth,        0.0, 0.0, 0.0, 1.0, 0.5, 0.25, 0, 1, 0,
            hwidth, hheight, hdepth,        0.0, 0.0, 0.0, 1.0, 0.5, 0.25, 1, 0, 0,
            
            -hwidth, hheight, hdepth,       0.0, 0.0, 0.0, 1.0, 0.75, 0.25, 0, 0, 1,  
            -hwidth, hheight, hdepth,       0.0, 0.0, 0.0, 1.0, 0.75, 0.25, 0, 1, 0,
            -hwidth, hheight, hdepth,       0.0, 0.0, 0.0, 1.0, 0.75, 0.25, -1, 0, 0,
            
            -hwidth, -hheight, hdepth,      0.0, 0.0, 0.0, 1.0, 0.75, 0.5, 0, 0, 1,
            -hwidth, -hheight, hdepth,      0.0, 0.0, 0.0, 1.0, 0.75, 0.5, 0, -1, 0,
            -hwidth, -hheight, hdepth,      0.0, 0.0, 0.0, 1.0, 0.75, 0.5, -1, 0, 0,


        ];

        let indis = [

            // counter-clockwise winding
            
            //Front face
            0, 3, 6, // 1 2 3
            6, 9, 0, // 3 4 1
            
            //Back face
            12, 21, 18, //5 8 7 
            18, 15, 12, //7 6 5
            
            //Top face
            4, 16, 19, //2 6 7
            19, 7, 4, //7 3 2
            
            //Bottom face
            22, 13, 1, //8 5 1
            1, 10, 22, //1 4 8
            
            //Left face
            11, 8, 20, //4 3 7
            20, 23, 11, //7 8 4
            
            //Right face
            2, 14, 17, //1 5 6
            17, 5, 2, //6 2 1
        ];

        return new Mesh( gl, program, verts, indis, material );
    }


    /**
     * Render the mesh. Does NOT preserve array/index buffer or program bindings! 
     * 
     * @param {WebGLRenderingContext} gl 
     */
    render( gl ) {
        gl.cullFace( gl.BACK );
        gl.enable( gl.CULL_FACE );

        gl.useProgram( this.program );
        gl.bindBuffer( gl.ARRAY_BUFFER, this.verts );
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.indis );

        set_vertex_attrib_to_buffer( 
            gl, this.program, 
            "coordinates", 
            this.verts, 3, 
            gl.FLOAT, false, VERTEX_STRIDE, 0 
        );

        set_vertex_attrib_to_buffer( 
            gl, this.program, 
            "color", 
            this.verts, 4, 
            gl.FLOAT, false, VERTEX_STRIDE, 12
        );

        set_vertex_attrib_to_buffer(
            gl, this.program,
            "uv",
            this.verts, 2,
            gl.FLOAT, false, VERTEX_STRIDE, 28);

        set_vertex_attrib_to_buffer(
            gl, this.program,
            "normal", this.verts, 3,
            gl.FLOAT, false, VERTEX_STRIDE, 36);

        set_uniform_scalar(gl, this.program, 'mat_ambient', this.material.ambient);
        set_uniform_scalar(gl, this.program, 'mat_diffuse', this.material.diffuse);
        set_uniform_scalar(gl, this.program, 'mat_specular', this.material.specular);
        set_uniform_scalar(gl, this.program, 'mat_shininess', this.material.shine);

        const sampler_location = gl.getUniformLocation(this.program, "tex");
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.material.texture);
        gl.uniform1i(sampler_location, 0);

        gl.drawElements( gl.TRIANGLES, this.n_indis, gl.UNSIGNED_SHORT, 0 ); 
    }

    /**
     * Parse the given text as the body of an obj file.
     * @param {WebGLRenderingContext} gl
     * @param {WebGLProgram} program
     * @param {string} text
     */
    static from_obj_text( gl, program, text ) {
        let vertexes = [];
        let indices = [];

        //Splits file text into separate lines.
        let text_lines = text.split(/\r?\n/);
        
        //Goes through lines of file data and builds up vertices and indices.
        for (let i = 0 ; i < text_lines.length; i++){
            text_lines[i] = text_lines[i].trim();
            
            //If line isn't empty, filter out whitepsace strings 
            // and extract data appropriately.
            if (text_lines[i].length != 0){

                //Splits on white space and removes white space strings.
                let items = text_lines[i]
                    .split(/(\s+)/)
                    .filter((el) => el != " ");

                let rev_index = items.length - 1;
                //Adds to vertices or indices based on line data.
                for (let j = 1; j < items.length ; j++){

                    if (items[0] == "v"){
                        vertexes.push(parseFloat(items[j]));

                    }
                    if (items[0] == "f"){
                        indices.push(parseFloat(items[j]) - 1);
                        rev_index -= 1;
                    }
                }

                //Pushes colors for each vertex.
                //Prof said I could do this with the color!
                if (items[0] == "v") {
                    let random_grey = Math.random();
                    vertexes.push(random_grey);
                    vertexes.push(random_grey);
                    vertexes.push(random_grey);
                    vertexes.push(1);

                }

            }
        }

        return new Mesh(gl, program, vertexes, indices, null);
    }

    /**
     * Asynchronously load the obj file as a mesh.
     * @param {WebGLRenderingContext} gl
     * @param {string} file_name 
     * @param {WebGLProgram} program
     * @param {function} f the function to call and give mesh to when finished.
     */
    static from_obj_file( gl, mesh_file_name, mesh_storage_name, material, program, f ) {
        let request = new XMLHttpRequest();
        
        // the function that will be called when the file is being loaded
        request.onreadystatechange = function() {
            // console.log( request.readyState );

            if( request.readyState != 4 ) { return; }
            if( request.status != 200 ) { 
                throw new Error( 'HTTP error when opening .obj file: ', request.statusText ); 
            }

            // now we know the file exists and is ready
            let loaded_mesh = Mesh.from_obj_text( gl, program, request.responseText );

            console.log( 'loaded ', file_name );
            f( loaded_mesh, mesh_name, material, program );
        };

        
        request.open( 'GET', file_name ); // initialize request. 
        request.send();                   // execute request
    }
}
