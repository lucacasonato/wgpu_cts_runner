# wgpu_cts_runner

A minimal JS runtime built on Deno (deno_core / extensions) that can be used to
test WebGPU CTS outside of full Deno.

## How to run code

```shell
$ cargo run examples/hello-compute.js
```

All code is executed as an ES Module. Dynamic imports are supported. No `Deno.*`
APIs are available other than `Deno.core.*`.

Following globals are available:

- Object
- Function
- Array
- Number
- parseFloat
- parseInt
- Infinity
- NaN
- undefined
- Boolean
- String
- Symbol
- Date
- Promise
- RegExp
- Error
- AggregateError
- EvalError
- RangeError
- ReferenceError
- SyntaxError
- TypeError
- URIError
- globalThis
- JSON
- Math
- console
- Intl
- ArrayBuffer
- Uint8Array
- Int8Array
- Uint16Array
- Int16Array
- Uint32Array
- Int32Array
- Float32Array
- Float64Array
- Uint8ClampedArray
- BigUint64Array
- BigInt64Array
- DataView
- Map
- BigInt
- Set
- WeakMap
- WeakSet
- Proxy
- Reflect
- decodeURI
- decodeURIComponent
- encodeURI
- encodeURIComponent
- escape
- unescape
- eval
- isFinite
- isNaN
- Deno
- queueMicrotask
- DOMException
- Event
- EventTarget
- ErrorEvent
- CloseEvent
- MessageEvent
- CustomEvent
- ProgressEvent
- dispatchEvent
- addEventListener
- removeEventListener
- AbortSignal
- AbortController
- TextEncoder
- TextDecoder
- atob
- btoa
- SharedArrayBuffer
- Atomics
- FinalizationRegistry
- WeakRef
- WebAssembly
- Navigator
- navigator
- URL
- URLSearchParams
- GPU
- GPUAdapter
- GPUAdapterLimits
- GPUSupportedFeatures
- GPUDevice
- GPUQueue
- GPUBuffer
- GPUBufferUsage
- GPUMapMode
- GPUTexture
- GPUTextureUsage
- GPUTextureView
- GPUSampler
- GPUBindGroupLayout
- GPUPipelineLayout
- GPUBindGroup
- GPUShaderModule
- GPUShaderStage
- GPUComputePipeline
- GPURenderPipeline
- GPUColorWrite
- GPUCommandEncoder
- GPURenderPassEncoder
- GPUComputePassEncoder
- GPUCommandBuffer
- GPURenderBundleEncoder
- GPURenderBundle
- GPUQuerySet
- GPUOutOfMemoryError
- GPUValidationError
- Window
- window
- self
