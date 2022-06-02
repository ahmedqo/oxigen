import { isAbsent, isFunction, isPresent, kebabCase } from "../Types/index.js";

function type(v) {
    return Object.prototype.toString.call(v).slice(8).slice(0, -1).toLowerCase();
}

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

function exist(value) {
    return isPresent(value) ?
        value :
        null;
}

function choose(value, cases, any) {
    for (const c in cases) {
        if (c === value) {
            const fn = cases[c];
            return isFunction(fn) ? fn() : fn;
        }
    }
    return isFunction(any) ? any() : any;
}

function when(condition, trueCase, falseCase) {
    return condition ? (isFunction(trueCase) ? trueCase() : trueCase) : isFunction(falseCase) ? falseCase() : falseCase || null;
}

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

function* each(items, callback) {
    if (items !== undefined) {
        let i = 0;
        for (const value of items) {
            yield callback(value, i++);
        }
    }
}

function* range(startOrEnd, end, step = 1) {
    const start = isAbsent(end) ? 0 : startOrEnd;
    end = isPresent(end) ? end : startOrEnd;
    for (let i = start; step > 0 ? i < end : end < i; i += step) {
        yield i;
    }
}

export { define, choose, exist, when, join, each, range }