/**
 * get a unique id string
 * @returns {String}
 */
function uuid() {
    return "oxi-" + (Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)).slice(0, 20);
}

/**
 * check if the provided string is a custom variable
 * @param {String} str 
 * @returns {Boolean}
 */
function isVar(str) {
    return str.trim().startsWith("oxi-") && str.trim().length === 24;
}

/**
 * get type of provided value
 * @param {Any} value 
 * @returns {String}
 */
function typeOf(value) {
    return value instanceof Node ? "component" : Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}

/**
 * make map from children of provided node
 * @param {Node} parent 
 * @param {Function} makeKey 
 * @returns {Object}
 */
function getMap(parent, makeKey) {
    const map = {};
    for (let j = 0; j < parent.childNodes.length; j++) {
        const key = makeKey(parent.childNodes[j]);
        if (key) map[key] = parent.childNodes[j];
    }
    return map;
}

/**
 * make object of attribute of the provided Node
 * @param {Node} self 
 * @returns {Object}
 */
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