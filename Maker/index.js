import { isVar, getMap, attributes } from "../Utils/index.js";
import { lookup, regex, empty, svg } from "../Const/index.js";
import { isObject, kebabCase } from "../Types/index.js";
import { style } from "../Sass/index.js";

function getTag(tag) {
    const res = {
        type: "tag",
        name: "",
        voidElement: false,
        attrs: {},
        children: [],
    };

    const tagMatch = tag.match(/<\/?([^\s]+?)[/\s>]/);
    if (tagMatch) {
        res.name = tagMatch[1];
        if (lookup[tagMatch[1]] || tag.charAt(tag.length - 2) === "/") {
            res.voidElement = true;
        }

        if (res.name.startsWith("!--")) {
            const endIndex = tag.indexOf("-->");
            return {
                type: "comment",
                comment: endIndex !== -1 ? tag.slice(4, endIndex) : "",

            };
        }
    }

    const reg = new RegExp(regex.attr);
    let result = null;
    for (;;) {
        result = reg.exec(tag);

        if (result === null) {
            break;
        }

        if (!result[0].trim()) {
            continue;
        }

        if (result[1]) {
            const attr = result[1].trim();
            let arr = [attr, ""];

            if (attr.indexOf("=") > -1) {
                arr = attr.split("=");
            }

            res.attrs[arr[0]] = arr[1];
            reg.lastIndex--;
        } else if (result[2]) {
            res.attrs[result[2]] = result[3].trim().substring(1, result[3].length - 1);
        }
    }
    return res;
}

function addEvent(node, name, call) {
    const ev = name.split(":");
    const eventName = ev[0].slice(1);
    node.__handlers__ = node.__handlers__ || {};
    var isSameFunction = false;
    if (node.__handlers__[ev[0]]) {
        for (const _ev of node.__handlers__[ev[0]]) {
            if (_ev.toString() === call.toString()) {
                isSameFunction = true;
                return;
            }
        }
    }
    if (!isSameFunction) {
        node.__handlers__[ev[0]] = [call];
        node.addEventListener(kebabCase(eventName), function(e) {
            event(ev, e);
            call(e);
        });
    }
}

function addProp(node, prop, val) {
    let _prop = prop.split(".").reduce((a, e) => (a += `["${e}"]`), "");
    new Function(`return (node, val)=>{
            try {
                if (!val.length && typeof node${_prop} === "boolean")
                    val = true;
                node${_prop} = val;
            } catch(e){
                console.log(e);
                return;
            }
        }`)()(node, val);
}

function addProps(node, obj, props, events) {
    for (const attr in obj) {
        const isProp = attr in node;
        const isEvent = attr.startsWith("@");
        if (isEvent) {
            addEvent(node, attr, events[obj[attr]]);
            continue;
        }

        if (attr === "style") {
            var val = obj[attr];
            if (isVar(val)) val = props[val];
            if (isObject(val)) {
                node.setAttribute(attr, style(val));
                continue;
            }
        }

        if (attr.split(".").length > 1) {
            var val = obj[attr];
            if (isVar(val)) val = props[val];
            addProp(node, attr, val);
            continue;
        }

        if (isProp && !svg.includes(node.tagName.toLowerCase())) {
            var val = obj[attr];
            if (isVar(val)) val = props[val] || events[val];
            if (!val.length && typeof node[attr] === "boolean")
                val = true;
            node[attr] = node.__archive__[attr] = val;
            continue;
        }

        var name = attr,
            val = obj[attr];
        if (isVar(val)) val = props[val];
        if (!["viewBox"].includes(attr)) name = kebabCase(attr);
        node.setAttribute(name, val);
    }
}

function event(ev, e) {
    ev.forEach(function(_e) {
        switch (_e) {
            case "prevent":
                e.preventDefault();
            case "propagation":
                e.stopPropagation();
            case "immediate":
                e.stopImmediatePropagation();
        }
    });
}

function parse(html, options) {
    options || (options = {});
    options.components || (options.components = empty);
    const result = [];
    const arr = [];
    let current;
    let level = -1;
    let inComponent = false;

    if (html.indexOf("<") !== 0) {
        var end = html.indexOf("<");
        result.push({
            type: "text",
            content: end === -1 ? html : html.substring(0, end),
        });
    }

    html.replace(regex.tag, function(tag, index) {
        if (inComponent) {
            if (tag !== "</" + current.name + ">") {
                return;
            } else {
                inComponent = false;
            }
        }

        const isOpen = tag.charAt(1) !== "/";
        const isComment = tag.startsWith("<!--");
        const start = index + tag.length;
        const nextChar = html.charAt(start);
        let parent;

        if (isComment) {
            const comment = getTag(tag);

            if (level < 0) {
                result.push(comment);
                return result;
            }
            parent = arr[level];
            parent.children.push(comment);
            return result;
        }

        if (isOpen) {
            level++;

            current = getTag(tag);
            if (current.type === "tag" && options.components[current.name]) {
                current.type = "component";
                inComponent = true;
            }

            if (!current.voidElement && !inComponent && nextChar && nextChar !== "<") {
                current.children.push({
                    type: "text",
                    content: html.slice(start, html.indexOf("<", start)),
                });
            }

            if (level === 0) {
                result.push(current);
            }
            parent = arr[level - 1];

            if (parent) {
                parent.children.push(current);
            }
            arr[level] = current;
        }

        if (!isOpen || current.voidElement) {
            if (level > -1 && (current.voidElement || current.name === tag.slice(2, -1))) {
                level--;
                current = level === -1 ? result : arr[level];
            }
            if (!inComponent && nextChar !== "<" && nextChar) {
                parent = level === -1 ? result : arr[level].children;
                const end = html.indexOf("<", start);
                let content = html.slice(start, end === -1 ? undefined : end);
                if (regex.space.test(content)) {
                    content = " ";
                }
                if ((end > -1 && level + parent.length >= 0) || content !== " ") {
                    parent.push({
                        type: "text",
                        content: content,
                    });
                }
            }
        }
    });

    return result;
}

function compile(el, arr, props, events, comps) {
    for (const obj of arr) {
        switch (obj.type) {
            case "tag":
                var _el = svg.includes(obj.name) ? document.createElementNS("http://www.w3.org/2000/svg", obj.name) : document.createElement(obj.name);
                _el.__archive__ = {};
                addProps(_el, obj.attrs, props, events);
                compile(_el, obj.children, props, events, comps);
                el.appendChild(_el);
                break;
            case "text":
                if (obj.content.length) {
                    var _el = document.createTextNode(obj.content);
                    el.appendChild(_el);
                }
                break;
            case "comment":
                if (isVar(obj.comment)) {
                    const id = obj.comment.trim();
                    el.appendChild(comps[id]);
                }
                break;
        }
    }
}

function exec(el, str, props, events, comps) {
    const opts = { key: (node) => node.id };
    if (!el.childNodes.length && typeof str === "string") {
        const arr = parse(str);
        compile(el, arr, props, events, comps);
        return el;
    }

    if (typeof str === "string") {
        const arr = parse(str);
        str = document.createDocumentFragment();
        compile(str, arr, props, events, comps);
    }

    const nodesByKey = {
        old: getMap(el, opts.key),
        new: getMap(str, opts.key),
    };

    let idx;
    for (idx = 0; str.firstChild; idx++) {
        const newNode = str.removeChild(str.firstChild);
        if (idx >= el.childNodes.length) {
            el.appendChild(newNode);
            continue;
        }

        let baseNode = el.childNodes[idx];
        const newKey = opts.key(newNode);

        if (opts.key(baseNode) || newKey) {
            const match = newKey && newKey in nodesByKey.old ? nodesByKey.old[newKey] : newNode;
            if (match !== baseNode) {
                baseNode = el.insertBefore(match, baseNode);
            }
        }

        if (baseNode.nodeType !== newNode.nodeType || baseNode.tagName !== newNode.tagName) {
            el.replaceChild(newNode, baseNode);
        } else if ([Node.TEXT_NODE, Node.COMMENT_NODE].indexOf(baseNode.nodeType) >= 0) {
            if (baseNode.textContent === newNode.textContent) continue;
            baseNode.textContent = newNode.textContent;
        } else if (baseNode !== newNode) {
            const attrs = {
                base: attributes(baseNode),
                new: attributes(newNode),
            };

            for (const attr in attrs.base) {
                if (attr in attrs.new) continue;
                baseNode.removeAttribute(attr);
            }

            addProps(baseNode, attrs.new, props, events);

            for (const prop in newNode.__archive__) {
                if (baseNode[prop] !== newNode.__archive__[prop]) {
                    baseNode[prop] = newNode.__archive__[prop];
                }
            }

            exec(baseNode, newNode, props, events, comps);
        }
    }

    while (el.childNodes.length > idx) {
        el.removeChild(el.lastChild);
    }

    return el;
}

export default exec;