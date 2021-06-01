// Adapted from https://github.com/denoland/deno/blob/6abf126c2a7a451cded8c6b5e6ddf1b69c84055d/runtime/js/99_main.js

// Removes the `__proto__` for security reasons.  This intentionally makes
// Deno non compliant with ECMA-262 Annex B.2.2.1
//
delete Object.prototype.__proto__;

((window) => {
  const core = Deno.core;
  const webidl = window.__bootstrap.webidl;
  const eventTarget = window.__bootstrap.eventTarget;
  const globalInterfaces = window.__bootstrap.globalInterfaces;
  const { Console } = window.__bootstrap.console;
  const url = window.__bootstrap.url;
  const webgpu = window.__bootstrap.webgpu;

  const util = {
    writable(value) {
      return {
        value,
        writable: true,
        enumerable: true,
        configurable: true,
      };
    },
    nonEnumerable(value) {
      return {
        value,
        writable: true,
        configurable: true,
      };
    },
    readOnly(value) {
      return {
        value,
        enumerable: true,
      };
    },
  };

  class Navigator {
    constructor() {
      webidl.illegalConstructor();
    }

    [Symbol.for("Deno.customInspect")](inspect) {
      return `${this.constructor.name} ${inspect({})}`;
    }
  }

  const navigator = webidl.createBranded(Navigator);

  Object.defineProperties(Navigator.prototype, {
    gpu: {
      configurable: true,
      enumerable: true,
      get() {
        webidl.assertBranded(this, Navigator);
        return webgpu.gpu;
      },
    },
  });

  core.registerErrorBuilder(
    "DOMExceptionOperationError",
    function DOMExceptionOperationError(msg) {
      return new DOMException(msg, "OperationError");
    },
  );

  const windowOrWorkerGlobalScope = {
    CloseEvent: util.nonEnumerable(CloseEvent),
    CustomEvent: util.nonEnumerable(CustomEvent),
    DOMException: util.nonEnumerable(DOMException),
    ErrorEvent: util.nonEnumerable(ErrorEvent),
    Event: util.nonEnumerable(Event),
    EventTarget: util.nonEnumerable(EventTarget),
    Navigator: util.nonEnumerable(Navigator),
    navigator: {
      configurable: true,
      enumerable: true,
      get: () => navigator,
    },
    TextDecoder: util.nonEnumerable(TextDecoder),
    TextEncoder: util.nonEnumerable(TextEncoder),
    URL: util.nonEnumerable(url.URL),
    URLSearchParams: util.nonEnumerable(url.URLSearchParams),
    atob: util.writable(atob),
    btoa: util.writable(btoa),
    console: util.writable(new Console(core.print)),

    GPU: util.nonEnumerable(webgpu.GPU),
    GPUAdapter: util.nonEnumerable(webgpu.GPUAdapter),
    GPUAdapterLimits: util.nonEnumerable(webgpu.GPUAdapterLimits),
    GPUSupportedFeatures: util.nonEnumerable(webgpu.GPUSupportedFeatures),
    GPUDevice: util.nonEnumerable(webgpu.GPUDevice),
    GPUQueue: util.nonEnumerable(webgpu.GPUQueue),
    GPUBuffer: util.nonEnumerable(webgpu.GPUBuffer),
    GPUBufferUsage: util.nonEnumerable(webgpu.GPUBufferUsage),
    GPUMapMode: util.nonEnumerable(webgpu.GPUMapMode),
    GPUTexture: util.nonEnumerable(webgpu.GPUTexture),
    GPUTextureUsage: util.nonEnumerable(webgpu.GPUTextureUsage),
    GPUTextureView: util.nonEnumerable(webgpu.GPUTextureView),
    GPUSampler: util.nonEnumerable(webgpu.GPUSampler),
    GPUBindGroupLayout: util.nonEnumerable(webgpu.GPUBindGroupLayout),
    GPUPipelineLayout: util.nonEnumerable(webgpu.GPUPipelineLayout),
    GPUBindGroup: util.nonEnumerable(webgpu.GPUBindGroup),
    GPUShaderModule: util.nonEnumerable(webgpu.GPUShaderModule),
    GPUShaderStage: util.nonEnumerable(webgpu.GPUShaderStage),
    GPUComputePipeline: util.nonEnumerable(webgpu.GPUComputePipeline),
    GPURenderPipeline: util.nonEnumerable(webgpu.GPURenderPipeline),
    GPUColorWrite: util.nonEnumerable(webgpu.GPUColorWrite),
    GPUCommandEncoder: util.nonEnumerable(webgpu.GPUCommandEncoder),
    GPURenderPassEncoder: util.nonEnumerable(webgpu.GPURenderPassEncoder),
    GPUComputePassEncoder: util.nonEnumerable(webgpu.GPUComputePassEncoder),
    GPUCommandBuffer: util.nonEnumerable(webgpu.GPUCommandBuffer),
    GPURenderBundleEncoder: util.nonEnumerable(webgpu.GPURenderBundleEncoder),
    GPURenderBundle: util.nonEnumerable(webgpu.GPURenderBundle),
    GPUQuerySet: util.nonEnumerable(webgpu.GPUQuerySet),
    GPUOutOfMemoryError: util.nonEnumerable(webgpu.GPUOutOfMemoryError),
    GPUValidationError: util.nonEnumerable(webgpu.GPUValidationError),
  };

  windowOrWorkerGlobalScope.console.enumerable = false;

  const mainRuntimeGlobalProperties = {
    Window: globalInterfaces.windowConstructorDescriptor,
    window: util.readOnly(globalThis),
    self: util.readOnly(globalThis),
  };

  let hasBootstrapped = false;

  function bootstrapRuntime() {
    if (hasBootstrapped) {
      throw new Error("Runtime has already been bootstrapped.");
    }
    delete globalThis.__bootstrap;
    delete globalThis.bootstrap;
    hasBootstrapped = true;

    Object.defineProperties(globalThis, windowOrWorkerGlobalScope);
    Object.defineProperties(globalThis, mainRuntimeGlobalProperties);
    Object.setPrototypeOf(globalThis, Window.prototype);
    eventTarget.setEventTargetData(globalThis);

    core.ops();
    Error.prepareStackTrace = core.createPrepareStackTrace();
  }

  Object.defineProperties(globalThis, {
    bootstrap: {
      value: bootstrapRuntime,
      configurable: true,
    },
  });
})(globalThis);