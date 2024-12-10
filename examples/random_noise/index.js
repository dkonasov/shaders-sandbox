import { ShaderSandbox } from "../sandbox.js";

const elem = document.getElementById("app");

if (elem instanceof HTMLCanvasElement) {
    elem.width = window.innerWidth;
    elem.height = window.innerHeight;
    await new Promise(
        /**
         * 
         * @param {(arg: void) => void} resolve 
         * @param {(err: Error) => void} reject 
         */
        (resolve, reject) => {
        new ShaderSandbox({
            renderSurface: elem,
            vertexShaderUrl: '/random_noise/vertex.glsl',
            fragmentShaderUrl: '/random_noise/fragment.glsl',
            onLoad: resolve,
            onError: reject,
        });
    });
}