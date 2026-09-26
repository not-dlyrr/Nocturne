#version 330
#extension GL_ARB_separate_shader_objects : require

layout(location = 0) in vec2 texCoord;
layout(location = 0) out vec4 fragColor;

uniform sampler2D texture0;
uniform sampler2D overlay;
layout(std140) uniform BlurData {
    float alphaBlendMin;
    float alphaBlendMax;
};

layout(std140) uniform BlurKernelData {
    vec4 weightVecs[23];
    int kernelRadius;
};

// Liquid Glass lens, ported from santi.harbor's lq.js (per-element SVG displacement map) to a per-pixel
// search: the overlay's alpha is the only thing that knows where a glass shape is, so the edge distance,
// the edge normal and the pixel's position inside the shape are all read back from it.
const float ALPHA_EMPTY = 0.01;
const float SEARCH_STEP = 4.0;      // px, coarse march before a 1px refine
const float SEARCH_MAX = 160.0;     // px, how far the centre (magnify) term can see
const float BEVEL_MAX = 16.0;       // px, width of the bent rim
const float LENS_STRENGTH = 18.0;   // px, displacement at full bend
const float MAGNIFY = 0.12;         // pull towards the centre across the body (~6% magnification)
const vec3 DISPERSION = vec3(1.0, 1.08, 1.16); // red bends least, blue most
const float SATURATION = 1.35;

vec2 overlayTexel;

float getWeight(int idx) {
    vec4 v = weightVecs[idx / 4];
    int comp = idx - (idx / 4) * 4;
    if (comp == 0) return v.x;
    if (comp == 1) return v.y;
    if (comp == 2) return v.z;
    return v.w;
}

bool isEmpty(vec2 offsetPx) {
    return texture(overlay, texCoord + offsetPx * overlayTexel).a <= ALPHA_EMPTY;
}

// Distance (px) from this pixel to the first empty overlay pixel along dir, or maxDist if none.
float edgeDistance(vec2 dir, float maxDist) {
    for (float d = SEARCH_STEP; d <= maxDist; d += SEARCH_STEP) {
        if (isEmpty(dir * d)) {
            float refined = d;
            for (float r = d - SEARCH_STEP + 1.0; r < d; r += 1.0) {
                if (isEmpty(dir * r)) {
                    refined = r;
                    break;
                }
            }
            return refined;
        }
    }
    return maxDist;
}

vec3 verticalBlur(vec2 uv) {
    vec2 texelSize = vec2(1.0) / textureSize(texture0, 0).xy;
    vec3 blurred = vec3(0.0);
    for (int i = 0; i < kernelRadius * 2 + 1; i++) {
        float offset = float(i - kernelRadius);
        blurred += texture(texture0, uv + vec2(0.0, texelSize.y * offset)).rgb * getWeight(i);
    }
    return blurred;
}

void main() {
    vec4 overlayColor = texture(overlay, texCoord);

    // Almost transparent -> skip blur.
    // Opaque -> the overlay blit covers this pixel completely, so the blur would never be seen
    // (Nocturne's HUD chrome is solid; only glass elements are translucent).
    if (overlayColor.a <= ALPHA_EMPTY || overlayColor.a >= 0.99) {
        fragColor = vec4(0.0);
        return;
    }

    float a = overlayColor.a;
    float range = alphaBlendMax - alphaBlendMin;
    float opacity = range > 0.0
        ? clamp((a - alphaBlendMin) / range, 0.0, 1.0)
        : 1.0;
    opacity = clamp(opacity, 0.1, 1.0);

    overlayTexel = vec2(1.0) / textureSize(overlay, 0).xy;

    // Shape probe: 4 cardinal directions far enough to find the element's extent (for the centre
    // term), 4 diagonals only as far as the bevel (they matter for the rounded corners).
    float dRight = edgeDistance(vec2(1.0, 0.0), SEARCH_MAX);
    float dLeft = edgeDistance(vec2(-1.0, 0.0), SEARCH_MAX);
    float dUp = edgeDistance(vec2(0.0, 1.0), SEARCH_MAX);
    float dDown = edgeDistance(vec2(0.0, -1.0), SEARCH_MAX);

    float width = dLeft + dRight;
    float height = dUp + dDown;
    float bevel = min(BEVEL_MAX, 0.5 * min(width, height));
    float diagMax = bevel * 1.5;

    const float D = 0.70710678;
    float dNE = edgeDistance(vec2(D, D), diagMax);
    float dNW = edgeDistance(vec2(-D, D), diagMax);
    float dSE = edgeDistance(vec2(D, -D), diagMax);
    float dSW = edgeDistance(vec2(-D, -D), diagMax);

    float dist = min(min(min(dRight, dLeft), min(dUp, dDown)), min(min(dNE, dNW), min(dSE, dSW)));

    // Outward normal: towards the nearby edges, weighted by how close each one is.
    float reach = bevel * 1.5;
    vec2 normal = vec2(1.0, 0.0) * max(0.0, 1.0 - dRight / reach)
        + vec2(-1.0, 0.0) * max(0.0, 1.0 - dLeft / reach)
        + vec2(0.0, 1.0) * max(0.0, 1.0 - dUp / reach)
        + vec2(0.0, -1.0) * max(0.0, 1.0 - dDown / reach)
        + vec2(D, D) * max(0.0, 1.0 - dNE / reach)
        + vec2(-D, D) * max(0.0, 1.0 - dNW / reach)
        + vec2(D, -D) * max(0.0, 1.0 - dSE / reach)
        + vec2(-D, -D) * max(0.0, 1.0 - dSW / reach);
    normal = length(normal) > 0.0001 ? normalize(normal) : vec2(0.0);

    // Harbor's convex lens profile: bends hard right at the rim, flattens out by the bevel's depth.
    float u = clamp(dist / max(bevel, 1.0), 0.0, 1.0);
    float bend = 1.0 - pow(1.0 - pow(1.0 - u, 4.0), 0.25);

    // Position inside the shape, -1..1 from the centre (unknown past SEARCH_MAX, so no magnify there).
    vec2 rel = vec2(
        (dRight < SEARCH_MAX && dLeft < SEARCH_MAX) ? (dLeft - dRight) / max(width, 1.0) : 0.0,
        (dUp < SEARCH_MAX && dDown < SEARCH_MAX) ? (dDown - dUp) / max(height, 1.0) : 0.0
    );

    // Sample inwards at the rim and towards the centre across the body. Small shapes get a gentler lens.
    float strength = min(LENS_STRENGTH, bevel * 1.4);
    vec2 displacement = clamp(-normal * bend - rel * MAGNIFY, -1.0, 1.0) * strength * overlayTexel;

    vec3 refracted = vec3(
        verticalBlur(texCoord + displacement * DISPERSION.r).r,
        verticalBlur(texCoord + displacement * DISPERSION.g).g,
        verticalBlur(texCoord + displacement * DISPERSION.b).b
    );

    float luma = dot(refracted, vec3(0.2126, 0.7152, 0.0722));
    refracted = clamp(mix(vec3(luma), refracted, SATURATION), 0.0, 1.0);

    fragColor = vec4(refracted, opacity);
}
