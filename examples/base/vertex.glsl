// an attribute will receive data from a buffer
attribute vec2 a_position;
 
// uniform variable for screen resolution
uniform vec2 u_resolution;
 
// all shaders have a main function
void main() {
 
    // converting screen coordinates to clip space coordinates
    vec2 zeroToOne = a_position / u_resolution;
 
    vec2 zeroToTwo = zeroToOne * 2.0;
 
    vec2 clipSpace = zeroToTwo - 1.0;
 
    gl_Position = vec4(clipSpace, 0, 1);
}