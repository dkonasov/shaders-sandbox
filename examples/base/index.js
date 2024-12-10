import { ShaderSandbox } from "../sandbox.js";

const elem = document.getElementById("app");

if (elem instanceof HTMLCanvasElement) {
    await new Promise(
        /**
         * 
         * @param {(arg: void) => void} resolve 
         * @param {(err: Error) => void} reject 
         */
        (resolve, reject) => {
        new ShaderSandbox({
            renderSurface: elem,
            vertexShaderUrl: '/base/vertex.glsl',
            fragmentShaderUrl: '/base/fragment.glsl',
            onLoad: resolve,
            onError: reject,
        });
    });
}