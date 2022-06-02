import { isAbsent, isFunction, isPresent, kebabCase } from "../Types/index.js";

/**
 * get the type of provided object
 * @param {Any} v 
 * @returns {String}
 */
function type(v) {
    return Object.prototype.toString.call(v).slice(8).slice(0, -1).toLowerCase();
}

/**
 * define elements
 * @param  {...Class|Array} el 
 */
function define(...el) {
    el.forEach(e => {
        var _name, _class;
        if (type(e) === "function" && e.taged) {
            _name = e.taged;
            _class = e;
        }
        if (type(e) === "array") {
            _class = e[0];
            _name = e[1];
        }
        if (!customElements.get(_name)) customElements.define(_name, _class);
    })
}

/**
 * check if provided value exists
 * @param {Any} value 
 * @returns {Boolean}
 */
function exist(value) {
    return isPresent(value) ?
        true :
        false;
}

/**
 * return the case of provided value
 * @param {String} value 
 * @param {Object} cases 
 * @param {Any} any 
 * @returns 
 */
function choose(value, cases, any) {
    for (const c in cases) {
        if (c === value) {
            const fn = cases[c];
            return isFunction(fn) ? fn() : fn;
        }
    }
    return isFunction(any) ? any() : any;
}

/**
 * like if statment
 * @param {Any} condition 
 * @param {Any} trueCase 
 * @param {Any} falseCase 
 * @returns {Any}
 */
function when(condition, trueCase, falseCase) {
    return condition ? (isFunction(trueCase) ? trueCase() : trueCase) : isFunction(falseCase) ? falseCase() : falseCase || null;
}

/**
 * join array 
 * @param {Array} items 
 * @param {Function|String} joiner 
 */
function* join(items, joiner) {
    if (items !== undefined) {
        let i = -1;
        for (const value of items) {
            if (i > -1) {
                yield isFunction(joiner) ? joiner(value, i) : joiner;
            }
            i++;
            yield value;
        }
    }
}

/**
 * loop true array
 * @param {Array} items 
 * @param {Function} callback 
 */
function* each(items, callback) {
    if (items !== undefined) {
        let i = 0;
        for (const value of items) {
            yield callback(value, i++);
        }
    }
}

/**
 * create agenerator range
 * @param {Number} startOrEnd 
 * @param {Number} end 
 * @param {Number} step 
 */
function* range(startOrEnd, end, step = 1) {
    const start = isAbsent(end) ? 0 : startOrEnd;
    end = isPresent(end) ? end : startOrEnd;
    for (let i = start; step > 0 ? i < end : end < i; i += step) {
        yield i;
    }
}

export { define, choose, exist, when, join, each, range }