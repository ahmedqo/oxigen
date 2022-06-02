function uuid() {
    return "oxi-" + (Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)).slice(0, 20);
}

function isVar(str) {
    return str.trim().startsWith("oxi-") && str.trim().length === 24;
}

function typeOf(value) {
    return value instanceof Node ? "component" : Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}

function getMap(parent, makeKey) {
    const map = {};
    for (let j = 0; j < parent.childNodes.length; j++) {
        const key = makeKey(parent.childNodes[j]);
        if (key) map[key] = parent.childNodes[j];
    }
    return map;
}

function attributes(self) {
    if (!self.attributes) return {};
    const attrs = {};

    for (let i = 0; i < self.attributes.length; i++) {
        const attr = self.attributes[i];
        attrs[attr.name] = attr.value;
    }

    return attrs;
}

export { uuid, isVar, typeOf, getMap, attributes };