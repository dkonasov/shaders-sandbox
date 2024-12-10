/**
 * @typedef {Object} SandboxConfig
 * @property { HTMLCanvasElement } renderSurface
 * @property { string } vertexShaderUrl
 * @property { string } fragmentShaderUrl
 * @property { () => void } onLoad
 * @property { (err: Error) => void } onError
 */

export class ShaderSandbox {
    /**
     * 
     * @param {SandboxConfig} config 
     */
    constructor(config) {
        this.#init(config);
    }

    /**
     * @type {WebGL2RenderingContext}
     */
    #gl;

   /**
    * @type  { (err: Error) => void }
    */
   #onError;

   /**
    * @type {WebGLShader[]}
    */
   #shaders = [];

   /**
    * @type { WebGLProgram }
    */
   #program;

   /**
    * @type { number }
    */
   #positionAttributeLocation;

   /**
    * @type { WebGLUniformLocation }
    */
   #resolutionUniformLocation;


    /**
     * 
     * @param {number} type
     * @param {string} source
     */
    #createShader(type, source) {
        const shader = this.#gl.createShader(type);
        
        if (shader) {
            this.#gl.shaderSource(shader, source);

            this.#gl.compileShader(shader);

            if (this.#gl.getShaderParameter(shader, this.#gl.COMPILE_STATUS)) {
                this.#shaders.push(shader);
                return;
            } else {
                const err = new Error("Unable to compile shader");
                err.cause = this.#gl.getShaderInfoLog(shader);

                this.#gl.deleteShader(shader);

                throw err;
            }
        } else {
            throw new Error("Failed to create shader");
        }
    }

    #createProgram() {
        const program = this.#gl.createProgram();

        if (program) {
            this.#shaders.forEach((shader) => {
                this.#gl.attachShader(program, shader);
            });

            this.#gl.linkProgram(program);
            if (this.#gl.getProgramParameter(program, this.#gl.LINK_STATUS)) {
                this.#program = program;
                this.#gl.useProgram(program);
                return;
            }

            const err = new Error("Failed to link a program");
            err.cause = this.#gl.getProgramInfoLog(program);
            throw err;
            this.#gl.deleteProgram(program);
        } else {
            throw new Error("Failed to create a program");
        }
    }

    /**
     * 
     * @param {number} width 
     * @param {number} height 
     */
    #setResolution(width, height) {
        this.#gl.uniform2f(this.#resolutionUniformLocation, width, height);
        this.#gl.viewport(0, 0, width, height);

        const positionBuffer = this.#gl.createBuffer();
        this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, positionBuffer);
        const positions = [
            0, height,
            width, height,
            0, 0,
            0, 0,
            width, height,
            width, 0,
        ];
        this.#gl.bufferData(this.#gl.ARRAY_BUFFER, new Float32Array(positions), this.#gl.STATIC_DRAW);
        this.#gl.enableVertexAttribArray(this.#positionAttributeLocation);
        this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, positionBuffer);

        const size = 2;
        const type = this.#gl.FLOAT;
        const normalize = false;
        const stride = 0;
        const offset = 0;
        this.#gl.vertexAttribPointer(
                this.#positionAttributeLocation,
                size,
                type,
                normalize,
                stride,
                offset
            );
    }

    #draw() {
        const primitiveType = WebGL2RenderingContext.TRIANGLES;
        const drawOffset = 0;
        const count = 6;
        this.#gl.drawArrays(primitiveType, drawOffset, count);
    }

    #clearScreen() {
        this.#gl.clearColor(0, 0, 0, 0);
        this.#gl.clear(this.#gl.COLOR_BUFFER_BIT);
    }

    /**
     * 
     * @param {string} url 
     */
    async #loadShaderSource(url) {
        const res = await fetch(url);
        return await res.text();
    }

    #initBindings() {
        this.#positionAttributeLocation = this.#gl.getAttribLocation(this.#program, "a_position");

        const resolutionUniformLocation = this.#gl.getUniformLocation(this.#program, "u_resolution");

        if(resolutionUniformLocation) {
            this.#resolutionUniformLocation = resolutionUniformLocation;
        } else {
            throw new Error("Unable to load resolution uniform location");
        }
    }

    /**
     * 
     * @param {SandboxConfig} config 
     */
    async #init(config) {
        const { renderSurface, fragmentShaderUrl, vertexShaderUrl, onError } = config;

        this.#onError = onError;
        
        const gl = renderSurface.getContext("webgl2");

        if (gl instanceof WebGL2RenderingContext) {
            this.#gl = gl;

            try {
                const vertexShaderSource = await this.#loadShaderSource(vertexShaderUrl);
                const fragmentShaderSource = await this.#loadShaderSource(fragmentShaderUrl);
    
                this.#createShader(gl.VERTEX_SHADER, vertexShaderSource);
                this.#createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
                this.#createProgram();
                this.#initBindings();
                this.#setResolution(renderSurface.width, renderSurface.height);
                this.#clearScreen();
                this.#draw();
            } catch(e) {
                this.#onError(e);
            }
        } else {
            this.#onError(new Error("Unable to create rendering context"));
        }
    }
}
