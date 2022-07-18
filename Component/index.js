import { camelCase, kebabCase, typeCase, isPresent, isFunction } from "../Types/index.js";
import { define as def } from "../Helpers/index.js";
import { attributes } from "../Utils/index.js";
import exec from "../Maker/index.js";

/**
 * make a proxy from provided object
 * @param {Object} object 
 * @param {Function} callback 
 * @returns {Proxy}
 */
function onChange(object, callback, types) {
    const handler = {
        get(target, property, receiver) {
            const desc = Object.getOwnPropertyDescriptor(target, property);

            if (desc && !desc.writable && !desc.configurable) {
                return Reflect.get(target, property, receiver);
            }

            try {
                return new Proxy(target[property], handler);
            } catch (err) {
                return Reflect.get(target, property, receiver);
            }
        },

        defineProperty(target, property, descriptor) {
            var type = types[property];
            descriptor = { value: typeCase(type)(descriptor.value) }
            callback(property, descriptor.value);
            return Reflect.defineProperty(target, property, descriptor);
        },

        deleteProperty(target, property) {
            callback();
            return Reflect.deleteProperty(target, property);
        },
    };
    return new Proxy(object, handler);
}

/**
 * create a custom component
 * @param {Object} param0 
 * @param {Class} Class 
 * @returns {Class}
 */
function Component({
    mode = "closed",
    define = [],
    taged = null,
    attrs = {},
    props = {},
    state = {},
    logic = {},
    setup = {},
    styles = () => {},
    render = () => {}
}, Class = HTMLElement) {
    return class extends Class {
        static get observedAttributes() {
            return Object.keys(attrs).map((attr) => kebabCase(attr));
        }

        static get taged() {
            return taged;
        }

        /**
         * define the element
         * @param {Array|String} name 
         */
        static define(name) {
            if (name) def([this, name])
            else def(this) && (name = this.taged);
            return document.createElement(name)
        }

        /**
         * constructor of element runs all nessisery fns
         */
        constructor() {
            super();

            this.styles = styles.bind(this);
            this.render = render.bind(this);

            this.__attrsType__ = {};
            this.__propsType__ = {};
            this.__stateType__ = {};

            this.attrs = {};
            this.props = {};
            this.state = {};
            this.logic = {};
            this.setup = {
                changed: {}
            };
            this.refs = {};

            this.__root__ = this.attachShadow({
                mode
            });

	    const slot = document.createElement("slot");
            this.__root__.append(slot);
          

            this.__initAttrs__();
            this.__initProps__();
            this.__initState__();
            this.__initLogic__();
            this.__initSetup__();

            this.setup.created();
        }

        /**
         * set the attribute when its change's
         * @param {String} name 
         * @param {String} _ 
         * @param {String} newValue 
         */
        attributeChangedCallback(name, _, value) {
            var _name = camelCase(name);
            var _type = this.__attrsType__[name];
            if (_name in this.attrs && this.attrs[_name] !== typeCase(_type)(value)) {
                this.attrs[_name] = (value);
            }
        }

        /**
         * set the attribute 
         * define the elemts
         * frist render 
         */
        connectedCallback() {
            for (var attr in this.attrs) {
                var name = kebabCase(attr);
                if (isPresent(this.attrs[attr])) this.setAttribute(name, this.attrs[attr]);
            }
            def(...define);
            this.__render__();
            this.setup.mounted();
        }

        /**
         * called when element removed
         */
        disconnectedCallback() {
            if (this.__css__) document.querySelector("[oxi-id='" + this.__css__ + "']").remove();
            this.setup.removed();
        }

        adoptedCallback() {
            this.setup.adopted();
        }

        /**
         * create a custom event
         * @param {String} name 
         * @param {Object|null} data 
         * @param {Function} fn 
         */
        emit(name, data, fn) {
            const ev = new CustomEvent(name, {
                bubbles: true,
                cancelable: true,
                composed: true,
                isTrusted: true,
                detail: data,
            });
            Object.defineProperty(ev, 'target', { writable: false, value: this });
            this.dispatchEvent(ev);
            if (!ev.defaultPrevented && fn) {
                fn.bind(this)(ev);
            }
        }

        /**
         * init the element attribute on creation
         */
        __initAttrs__() {
            Object.keys(attrs).forEach((key) => {
                this.__attrsType__[key] = attrs[key].type;
                this.attrs[key] = typeCase(this.__attrsType__[key])(attrs[key].value);
            });

            this.attrs = onChange(this.attrs, (name, value) => {
                setTimeout(() => {
                    this.__render__();
                    this.setup.changed.attrs(name, value);
                }, 0);
            }, this.__attrsType__);
        }

        /**
         * init the element propreties on creation
         */
        __initProps__() {
            Object.keys(props).forEach((key) => {
                this.__propsType__[key] = props[key].type;
                this.props[key] = typeCase(this.__propsType__[key])(props[key].value);

                Object.defineProperty(this, key, {
                    set(val) {
                        this.props[key] = typeCase(this.__propsType__[key])(val);
                        this.__render__();
                    },
                    get() {
                        return this.props[key];
                    }
                })
            });

            this.props = onChange(this.props, (name, value) => {
                setTimeout(() => {
                    this.__render__();
                    this.setup.changed.props(name, value);
                }, 0);
            }, this.__propsType__);
        }

        /**
         * init the element state on creation
         */
        __initState__() {
            Object.keys(state).forEach((key) => {
                this.__stateType__[key] = state[key].type;
                this.state[key] = typeCase(this.__stateType__[key])(state[key].value);
            });

            this.state = onChange(this.state, (name, value) => {
                setTimeout(() => {
                    this.__render__();
                    this.setup.changed.state(name, value);
                }, 0);
            }, this.__stateType__);
        }

        /**
         * init the element logic on creation
         */
        __initLogic__() {
            Object.keys(logic).map((a) => {
                const boundAction = logic[a].bind(this);

                function actionWithData(params) {
                    if (!params) return boundAction();
                    else return boundAction(params);
                }

                this.logic[a] = actionWithData;
            });
        }

        /**
         * init the element setup on creation
         */
        __initSetup__() {
            var _setup = {
                created() {},
                mounted() {},
                adopted() {},
                updated() {},
                removed() {},
                ...setup,
                changed: {
                    attrs() {},
                    props() {},
                    state() {},
                    ...(setup.changed || {})
                }
            }
            Object.keys(_setup).map((a) => {
                if (isFunction(_setup[a])) this.setup[a] = _setup[a].bind(this);
            });

            Object.keys(_setup.changed).map((a) => {
                if (isFunction(_setup.changed[a])) this.setup.changed[a] = _setup.changed[a].bind(this);
            });
        }

        /**
         * update the attributes
         */
        __updateAttrs__() {
            const attrs = attributes(this);
            for (const attr in attrs) {
                const name = kebabCase(attr);
                const valu = typeCase(this.__attrsType__[camelCase(attr)])(this.attrs[camelCase(attr)]);
                const old = typeCase(this.__attrsType__[camelCase(attr)])(attrs[attr]);
                if (old !== valu) {
                    if (isPresent(valu)) this.setAttribute(name, valu);
                }
            }
            for (const attr in this.attrs) {
                const name = kebabCase(attr);
                if (name in attrs) continue;
                const valu = typeCase(this.__attrsType__[attr])(this.attrs[attr]);
                if (isPresent(valu)) this.setAttribute(name, valu);
            }
        }

        /**
         * create the refs object
         */
        __refs__() {
            var ids = [];
            Array.from(this.querySelectorAll("*"))
                .forEach((e) => {
                    if (e.hasAttribute("ref")) {
                        var ref = e.getAttribute("ref");
                        ids.push(ref);
                        ids = [...new Set(ids)];
                    }
                });
            ids.forEach((e) => {
                var id = Array.from(this.querySelectorAll("[ref='" + e + "']"));
                this.refs[camelCase(e)] = (id.length > 1) ? id : id[0];
                id.forEach((e) => e.removeAttribute("ref"));
            });
        }

        /**
         * render the elemnt view
         */
        async __render__() {
            this.__updateAttrs__();
            const template = await this.render();
		if (template) {
		if (this.__css__) {
			 const el = document.querySelector("[oxi-id='" + this.__css__ + "']")
                    el && el.remove();
			this.classList.remove(this.__css__);
		}		
                this.__css__ = await this.styles();
                this.classList.add(this.__css__);
                const temp = template.string;
                const components = template.components;
                const events = template.events;
                const props = template.props;
                exec(this, temp, props, events, components);
                this.__refs__();
}
            this.setup.updated();
        }
    }
}

export default Component;