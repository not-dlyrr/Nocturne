#version 330
#extension GL_ARB_separate_shader_objects : require

layout(location = 0) in vec2 texCoord;
layout(location = 0) out vec4 fragColor;

// Rendered at 1/DOWNSAMPLE resolution with a bilinear sampler: each tap lands between source texels and
// averages a 2x2 block, so this pass downsamples and blurs at once. Must match BlurEffectRenderer.DOWNSAMPLE.
const float DOWNSAMPLE = 2.0;

uniform sampler2D texture0;
layout(std140) uniform BlurKernelData {
    vec4 weightVecs[23];
    int kernelRadius;
};

float getWeight(int idx) {
    vec4 v = weightVecs[idx / 4];
    int comp = idx - (idx / 4) * 4;
    if (comp == 0) return v.x;
    if (comp == 1) return v.y;
    if (comp == 2) return v.z;
    return v.w;
}

void main() {
    // One kernel step is one texel of the half-res target, i.e. DOWNSAMPLE texels of the source.
    vec2 texelSize = vec2(DOWNSAMPLE) / textureSize(texture0, 0).xy;

    vec4 result = vec4(0.0);

    for (int i = 0; i < kernelRadius * 2 + 1; i++) {
        float offset = float(i - kernelRadius);
        result += texture(texture0, texCoord + vec2(texelSize.x * offset, 0.0)) * getWeight(i);
    }

    fragColor = result;
}
