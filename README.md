# wgpu_cts_runner

A minimal JS runtime built on Deno (deno_core / extensions) that can be used to
test WebGPU CTS outside of full Deno.

## How to run code

```shell
$ cargo run examples/hello-compute.js
```

All code is executed as an ES Module. Dynamic imports are supported. No `Deno.*`
APIs are available other than `Deno.core.*`.

Following globals are available