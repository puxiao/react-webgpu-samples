@vertex
fn main(@location(0) xyz: vec3<f32>) -> @builtin(position) vec4<f32> {
    return vec4<f32>(xyz, 1.0);
}