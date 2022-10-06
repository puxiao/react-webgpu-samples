@vertex
fn main(@location(0) xy: vec2<f32>, @location(1) z: f32) -> @builtin(position) vec4<f32> {
    return vec4<f32>(xy, z, 1.0);
}