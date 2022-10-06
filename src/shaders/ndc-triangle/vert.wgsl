@group(0) @binding(1) var<uniform> mvp:mat4x4<f32>;
@vertex
fn main(@location(0) xyz: vec3<f32>) -> @builtin(position) vec4<f32> {
    return mvp * vec4<f32>(xyz, 1.0);
}