const empty = Object.create(null);
const chars = /[^a-zA-Z0-9:]+/g;

const regex = {
    attr: /\s([^'"/\s><]+?)[\s/>]|([^\s=]+)=\s?(".*?"|'.*?')/g,
    tag: /<[a-zA-Z0-9\-\!\/](?:"[^"]*"|'[^']*'|[^'">])*>/g,
    space: /^\s*$/,
};

const lookup = {
    area: true,
    base: true,
    br: true,
    col: true,
    embed: true,
    hr: true,
    img: true,
    input: true,
    link: true,
    meta: true,
    param: true,
    source: true,
    track: true,
    wbr: true,
};

const svg = [
    "svg",
    "animate",
    "animateMotion",
    "animateTransform",
    "circle",
    "clipPath",
    "defs",
    "desc",
    "discard",
    "ellipse",
    "feBlend",
    "feColorMatrix",
    "feComponentTransfer",
    "feComposite",
    "feConvolveMatrix",
    "feDiffuseLighting",
    "feDisplacementMap",
    "feDistantLight",
    "feDropShadow",
    "feFlood",
    "feFuncA",
    "feFuncB",
    "feFuncG",
    "feFuncR",
    "feGaussianBlur",
    "feImage",
    "feMerge",
    "feMergeNode",
    "feMorphology",
    "feOffset",
    "fePointLight",
    "feSpecularLighting",
    "feSpotLight",
    "feTile",
    "feTurbulence",
    "filter",
    "foreignObject",
    "g",
    "hatch",
    "hatchpath",
    "image",
    "line",
    "linearGradient",
    "marker",
    "mask",
    "metadata",
    "mpath",
    "path",
    "pattern",
    "polygon",
    "polyline",
    "radialGradient",
    "rect",
    "script",
    "set",
    "stop",
    "style",
    "switch",
    "symbol",
    "text",
    "textPath",
    "title",
    "tspan",
    "use",
    "view",
    "animateColor",
    "missing-glyph",
    "font",
    "font-face",
    "font-face-format",
    "font-face-name",
    "font-face-src",
    "font-face-uri",
    "hkern",
    "vkern",
    "solidcolor",
    "altGlyph",
    "altGlyphDef",
    "altGlyphItem",
    "glyph",
    "glyphRef",
    "tref",
    "cursor",
];

const unitless = [
    "animation-iteration-count",
    "border-image-slice",
    "border-image-width",
    "column-count",
    "counter-increment",
    "counter-reset",
    "flex",
    "flex-grow",
    "flex-shrink",
    "font-size-adjust",
    "font-weight",
    "line-height",
    "nav-index",
    "opacity",
    "order",
    "orphans",
    "tab-size",
    "widows",
    "z-index",
    "pitch-range",
    "richness",
    "speech-rate",
    "stress",
    "volume",
    "lood-opacity",
    "mask-box-outset",
    "mask-border-outset",
    "mask-box-width",
    "mask-border-width",
    "shape-image-threshold",
];

export { lookup, regex, empty, chars, svg, unitless };