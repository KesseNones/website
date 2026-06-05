
class Vec4 {

    constructor( x, y, z, w ) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w ?? 0;
    }

    /**
     * Returns the vector that is this vector scaled by the given scalar.
     * @param {number} by the scalar to scale with 
     * @returns {Vec4}
     */
    scaled( by ) {
        return (new Vec4(
            this.x * by, 
            this.y * by, 
            this.z * by, 
            this.w * by));

    }

    /**
     * Returns the dot product between this vector and other
     * @param {Vec4} other the other vector 
     * @returns {number}
     */
    dot( other ) {
        return (
            (this.x * other.x) + 
            (this.y * other.y) + 
            (this.z * other.z) + 
            (this.w * other.w));
    }

    /**
     * Returns the length of this vector
     * @returns {number}
     */
    length() {
        let x = this.x; let y = this.y;
        let z = this.z; let w = this.w;
        return (
            Math.sqrt((x * x) + (y * y) + (z * z) + (w * w))
        );
    }

    /**
     * Returns a normalized version of this vector
     * @returns {Vec4}
     */
    norm() {
        let magnitude = this.length();
        return (
            new Vec4(
                this.x / magnitude,
                this.y / magnitude,
                this.z / magnitude,
                this.w / magnitude
            )
        );
        
    }

    /**
     * Returns the vector sum between this and other.
     * @param {Vec4} other 
     */
    add( other ) {
        return (
            new Vec4(
                this.x + other.x,
                this.y + other.y,
                this.z + other.z,
                this.w + other.w
            )
        );
    }

    sub( other ) {
        return this.add( other.scaled( -1 ) );
    }

    //Takes the normal of a triangle for a height map.
    static normal_of_triangle(left_vec, middle_vec, right_vec){
        let left_sub = left_vec.sub(middle_vec);
        let right_sub = right_vec.sub(middle_vec);
        return (left_sub.cross(right_sub)).norm();
    }

    cross( other ) {
        let x = this.y * other.z - this.z * other.y;
        let y = this.x * other.z - this.z * other.x;
        let z = this.x * other.y - this.y * other.x;

        return new Vec4( x, y, z, 0 );
    }
	
	toString() {
		return [ '[', this.x, this.y, this.z, this.w, ']' ].join( ' ' );
	}
}