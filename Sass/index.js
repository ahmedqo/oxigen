import { isPresent, isNumber, kebabCase } from "../Types/index.js";
import { unitless } from "../Const/index.js";
import { uuid } from "../Utils/index.js";

var isVariable = function(str) {
    return str.trim()[0] === "$";
};

var isMixin = function(str) {
    return str.trim().slice(0, 6) === "@mixin";
};

var isMedia = function(str) {
    return str.trim().slice(0, 6) === "@media";
};

var isInclude = function(str) {
    return str.trim().slice(0, 8) === "@include";
};

var addGlobal = function(scssVar, tree) {
    if (tree.parent === null || tree.parent === undefined) {
        tree._context[scssVar.key] = scssVar;
        return true;
    }
    return addGlobal(scssVar, tree.parent);
};

var addMixin = function(propertyName, block, tree) {
    var parsedPropertyName = getMixin(propertyName);
    tree._mixins[parsedPropertyName] = block;
    return true;
};

var addMedia = function(propertyName, block, tree) {
    var parsedPropertyName = getMedia(propertyName).replace(/\s/g, "");
    tree._medias.push({
        condition: parsedPropertyName,
        block: block,
    });
    return true;
};

var getName = function(str) {
    var varName = str.trim();
    if (isVariable(varName)) return varName.slice(1);
    return varName;
};

var getValue = function(varName, tree) {
    if (tree._context[varName] !== undefined) {
        return tree._context[varName].getValue();
    }
    if (tree.parent !== null && tree.parent !== undefined) {
        return getValue(varName, tree.parent);
    }
    throw new Error("Variable $" + varName + " not defined");
};

var getMixin = function(str) {
    return str
        .replace("@mixin", "")
        .replace(/\({1}[^/)]*\){1}/g, "")
        .trim();
};

var getMedia = function(str) {
    return str.replace("@media", "").trim().slice(1, -1).trim();
};

var getInclude = function(str) {
    return str
        .replace("@include", "")
        .replace(/\({1}[^/)]*\){1}/g, "")
        .trim();
};

function Loop(isTree) {
    return function(scssTree) {
        var str = "";
        for (var ii = 0; ii < scssTree.properties.length; ii += 1) {
            var _t = scssTree.properties[ii];
            if (_t.isTree === isTree) {
                str += _t.getString(0, scssTree);
            }
        }
        return str;
    };
}

var LoopProperties = Loop(false);
var LoopTrees = Loop(true);
const frames = {};

var Variable = function(str) {
    this.isCssProperty = true;
    this.isTree = false;
    this._property = this.parse(str);
    this.key = this._property.key;
    this.value = this._property.value;
    this.global = this.checkIfGlobal();
};

Variable.prototype.parse = function(str) {
    var _property = str.split(":");
    var key = _property[0].trim().slice(1); // Remove $ Sign
    var value = _property[1].trim();
    return {
        key: key,
        value: value,
    };
};

Variable.prototype.checkIfGlobal = function() {
    if (this.value.substring(this.value.length - 7) === "!global") {
        this.value = this.value.substring(0, this.value.length - 7).trim();
        return true;
    }
    return false;
};

Variable.prototype.getValue = function() {
    return this.value;
};

Variable.prototype.isGlobal = function() {
    return this.global;
};

var Property = function(str) {
    this.isCssProperty = true;
    this.isTree = false;
    this._property = this.parse(str);
    this.key = this._property.key;
    this.value = this._property.value;
};

Property.prototype.parse = function(str) {
    var _property = str.split(":");
    var key = _property[0].trim();
    var value = _property[1].trim();
    return {
        key: key,
        value: value,
    };
};

Property.prototype.getString = function(indentationLevel, scssTree) {
    const val = this.getValue(this.value, scssTree);
    if (val.length && val !== "null" && val !== "undefined") return this.key + ":" + val + ";";
    return "";
};

Property.prototype.getValue = function(val, scssTree) {
    if (isVariable(val)) {
        var varName = getName(val);
        return getValue(varName, scssTree);
    }
    return val;
};

var Comment = function(str) {
    this.isComment = true;
    this.isTree = false;
    var foundEndingStar = false;
    if (str[0] === "*") {
        str = str.substring(1, str.length);
    }
    if (!foundEndingStar && str[str.length - 1] === "*") {
        foundEndingStar = true;
        str = str.substring(0, str.length - 1);
    }
    this.str = str;
};

Comment.prototype.getString = function() {
    return "/*" + this.str + "*/";
};

function Parser(str, selector, parent, context) {
    var result = {};
    result.isTree = true;
    result.properties = []; // .hello { font-size: 12px; }
    result._context = parent !== undefined ? parent._context : {}; // Variables
    result._medias = []; // Medias
    result._mixins = parent !== undefined ? parent._mixins : {}; // Variables
    result.parent = parent;
    result.selector = selector;

    result.getString = function() {
        return Stringifier(result);
    };

    var inInlineComment = false;
    var inComment = false;
    var object_open = false;
    var object_bracket_count = 0;
    var curr_block = "";
    var curr_property = "";

    for (var i = 0; i < str.length; i += 1) {
        var prevCh = str[i - 1] || "";
        var nextCh = str[i + 1] || "";
        var ch = str[i];

        if (inInlineComment && prevCh === "\n") {
            inInlineComment = false;
        } else if (!inInlineComment && ch === "/" && nextCh === "/") {
            inInlineComment = true;
        }
        if (!inInlineComment) {
            if (!inComment && ch === "/" && nextCh === "*") {
                inComment = true;
                curr_property = "";
            } else if (inComment && prevCh === "*" && ch === "/") {
                inComment = false;
                result.properties.push(new Comment(curr_property));
                curr_property = "";
            } else if (inComment) {
                curr_property += ch;
            } else if (ch === ";" && !object_open) {
                if (isInclude(curr_property)) {
                    var propertyName = getInclude(curr_property);
                    if (result._mixins[propertyName] !== undefined) {
                        var mixin = result._mixins[propertyName];
                        result.properties.push(Parser(mixin, " ", result));
                    }
                } else if (isVariable(curr_property)) {
                    var variable = new Variable(curr_property);
                    if (variable.isGlobal()) {
                        addGlobal(variable, result);
                    } else {
                        result._context[variable.key] = variable;
                    }
                } else {
                    result.properties.push(new Property(curr_property));
                }
                curr_property = "";
            } else if (ch === "{") {
                object_bracket_count += 1;
                object_open = true;
                if (object_bracket_count === 0) {
                    curr_block = "";
                } else if (object_bracket_count !== 1) {
                    curr_block += ch;
                }
            } else if (ch === "}") {
                object_bracket_count -= 1;
                if (object_bracket_count === 0) {
                    if (curr_block.trim() !== "") {
                        var property_name = curr_property.trim();
                        if (isMixin(property_name)) {
                            addMixin(property_name, curr_block, result);
                        } else if (isMedia(property_name)) {
                            addMedia(property_name, curr_block, result);
                        } else {
                            result.properties.push(Parser(curr_block, property_name, result));
                        }
                    }
                    curr_block = "";
                    curr_property = "";
                    object_open = false;
                } else {
                    curr_block += ch;
                }
            } else {
                if (object_open) {
                    curr_block += ch;
                } else {
                    curr_property += ch;
                }
            }
        }
    }
    return result;
}

function Stringifier(scssTree) {
    var str = "";
    if (scssTree.properties.length > 0) {
        if (scssTree.selector !== null && scssTree.selector !== undefined && scssTree.selector !== "") {
            var data = LoopProperties(scssTree);
            if (data.length) {
                str += Selector(scssTree) + "{";
                str += data;
                str += "}";
            }
        }
    }
    str += LoopTrees(scssTree);
    if (scssTree._medias.length > 0) {
        for (const m of scssTree._medias) {
            str += "@media(" + m.condition + "){" + Parser(m.block, undefined, scssTree).getString() + "}";
        }
    }
    return str;
}

function Selector(scssTree) {
    var _selector = "";
    if (scssTree.selector !== null && scssTree.selector !== undefined) {
        if (scssTree.parent.selector !== null && scssTree.parent.selector !== undefined) {
            if (scssTree.selector.includes("&")) {
                _selector = scssTree.selector.replaceAll("&", Selector(scssTree.parent));
            } else {
                _selector = Selector(scssTree.parent) + " " + scssTree.selector;
            }
        } else {
            _selector = scssTree.selector;
        }
    }
    return _selector.trim();
}

function sass(parts, ...args) {
    var key = "",
        sass = parts.reduce((acc, part, i) => {
            Object.keys(frames).forEach((f) => {
                if (args[i] && args[i].includes(f)) {
                    key += frames[f].replace(/ {2,}|\r\n|\n|\r/gm, "");
                }
            });
            return acc + part + (args[i] || "");
        }, "");
    return Parser(sass).getString() + key;
}

function keyframes(parts, ...args) {
    var sass = parts.reduce((acc, part, i) => {
            return acc + part + (args[i] || "");
        }, ""),
        name = `_${uuid()}`;
    sass = sass.trim().replace(/(\t|\n|\r)/gm, "");
    frames[name] = ["@-webkit-keyframes", "@-moz-keyframes", "@-o-keyframes", "@-ms-keyframes", "@keyframes"]
        .reduce((acc, key) => {
            return acc + key + " " + name + " {" + sass + "}";
        }, "")
        .trim()
        .replace(/(\t|\n|\r)/gm, "");

    return name;
}

function style(obj) {
    var str = "";
    for (var key in obj) {
        if (isPresent(obj[key])) {
            var _val = obj[key],
                _key = kebabCase(key);
            isNumber(_val) && !unitless.includes(_key) && (_val += "px");
            str += `${_key}:${_val};`;
        }
    }
    return str.trim();
}

export { keyframes, style };
export default sass;