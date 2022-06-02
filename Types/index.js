import { chars } from "../Const/index.js";
import jsonic from "./json.js";

function type(v) {
    return Object.prototype.toString.call(v).slice(8).slice(0, -1).toLowerCase();
}

function fnReg() {
    return /^function\s*([\w$]*)\s*\(([\w\s,$]*)\)\s*\{([\w\W\s\S]*)\}$/;
};

function arReg() {
    return /^([\w$]*)\s*\(([\w\s,$]*)\)\s*=>\s*\{([\w\W\s\S]*)\}$/;
};

function isUndefined(v) {
    return type(v) === "undefined"
}

function isNull(v) {
    return type(v) === "null";
}

function isString(v) {
    return type(v) === "string";
}

function isBoolean(v) {
    return type(v) === "boolean";
}

function isNumber(v) {
    return type(v) === "number";
}

function isInteger(v) {
    return isNumber(v) && /^[-+]?[0-9]+$/.test(v);
}

function isFloat(v) {
    return isNumber(v) && /^[-+]?[0-9]+\.[0-9]+$/.test(v);
}

function isDate(v) {
    return type(v) === "date"
}

function isObject(v) {
    return type(v) === "object"
}

function isArray(v) {
    return type(v) === "array"
}

function isPresent(v) {
    return !isAbsent(v);
}

function isFunction(v) {
    return type(v) === "function";
}

function isAbsent(v) {
    return (
        isUndefined(v) ||
        isNull(v) ||
        (isNumber(v) && isNaN(v)) ||
        (isString(v) && v === "") ||
        (isArray(v) && v.length === 0) ||
        (isObject(v) && Object.keys(v).length === 0)
    );
}

function toString(v) {
    if (isString(v)) {
        return v;
    } else if (isUndefined(v) || isNull(v)) {
        return null;
    } else {
        return toString(v.toString());
    }
}

function toBoolean(v) {
    if (isBoolean(v)) {
        return v;
    } else if (isUndefined(v) || isNull(v)) {
        return false;
    } else {
        return parseFloat(v) > 0 || v === "1" || v === "true" || v === "yes" || v === "+";
    }
}

function toInteger(v) {
    if (isInteger(v)) {
        return v;
    } else if (isUndefined(v) || isNull(v)) {
        return null;
    } else if (isFloat(v)) {
        return parseInt(v);
    } else {
        var pv = parseInt(v);
        if (isInteger(pv)) {
            return pv;
        } else if (toBoolean(v)) {
            return 1;
        } else {
            return 0;
        }
    }
}

function toFloat(v) {
    if (isFloat(v)) {
        return v;
    } else if (isUndefined(v) || isNull(v)) {
        return null;
    } else {
        var pv = parseFloat(v);
        if (isInteger(pv)) {
            return pv;
        } else if (toBoolean(v)) {
            return 1;
        } else {
            return 0;
        }
    }
}

function toNumber(v) {
    return toFloat(v);
}

function toDate(v) {
    var date = isDate(v) ? v : new Date(v);
    var time = date.getTime();
    var isValid = isPresent(v) && isInteger(time);

    return isValid ? date : null;
}

function toJson(v) {
    v = JSON.stringify(toObject(v));
    return JSON.parse(v);
}

function toArray(v) {
    if (isArray(v)) return v;
    else if (isString(v)) return jsonic(v)
    else return Array.from([]);
}

function toObject(v) {
    if (isObject(v)) return v;
    else if (isString(v)) return jsonic(v);
    else return Object.create({});
}

function toFunction(v) {
    if (isFunction(v)) return v;
    else if (isString(v)) {
        var all;
        const fn = v.match(fnReg());
        const ar = v.match(arReg());
        if (fn) all = fn;
        if (ar) all = ar;
        if (all)
            return new Function(`return function(${all[2]}) {${all[3]}}`)();
        else return () => {}
    } else return () => {}
}

function kebabCase(str) {
    return str
        .replace(/([a-z])([A-Z])/g, (match) => match[0] + "-" + match[1])
        .replace(chars, "-")
        .toLowerCase();
}

function camelCase(str) {
    return str
        .replace(/_/g, (_, index) => (index === 0 ? _ : "-"))
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) => (index === 0 ? letter.toLowerCase() : letter.toUpperCase()))
        .replace(chars, "");
}

function typeCase(str) {
    str = toString(str || "");
    return ({
        string: toString,
        boolean: toBoolean,
        integer: toInteger,
        float: toFloat,
        number: toNumber,
        date: toDate,
        json: toJson,
        object: toObject,
        array: toArray,
        function: toFunction,
    }[str.toLowerCase()] || ((x) => x));
}

export {
    isObject,
    camelCase,
    typeCase,
    isAbsent,
    isBoolean,
    isFunction,
    isPresent,
    isNumber,
    kebabCase,
};