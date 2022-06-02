import { camelCase, kebabCase, typeCase, isPresent, isBoolean } from "../Types/index.js";
import { define as def } from "../Helpers/index.js";
import { attributes } from "../Utils/index.js";
import exec from "../Maker/index.js";

function onChange(object, onChange) {
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
            onChange(descriptor);
            return Reflect.defineProperty(target, property, descriptor);
        },

        deleteProperty(target, property) {
            onChange();
            return Reflect.deleteProperty(target, property);
        },
    };
    return new Proxy(object, handler);
}

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

        static define(name) {
            if (name) def([this, name])
            else def(this);
        }

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
            this.setup = {};
            this.refs = {};

            this.__root__ = this.attachShadow({
                mode
            });

            this.__initAttrs__();
            this.__initProps__();
            this.__initState__();
            this.__initLogic__();
            this.__initSetup__();

            this.setup.created();
        }

        attributeChangedCallback(name, oldValue, newValue) {
            var _name = camelCase(name);
            if (_name in this.attrs) {
                var _type = this.__attrsType__[_name];
                this.attrs[_name] = typeCase(_type)(newValue);
                this.setup.changed(name, typeCase(_type)(oldValue), typeCase(_type)(newValue));
            }
        }

        connectedCallback() {
            for (var attr in this.attrs) {
                var name = kebabCase(attr);
                var valu = typeCase(this.__attrsType__[attr])(this.attrs[attr]);
                if (isPresent(valu)) this.setAttribute(name, valu);
            }
            def(...define);
            this.__render__();
            this.setup.mounted();
        }

        disconnectedCallback() {
            this.setup.removed();
        }

        adoptedCallback() {
            this.setup.adopted();
        }

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

        __initAttrs__() {
            Object.keys(attrs).forEach((key) => {
                this.__attrsType__[key] = attrs[key].type;
                this.attrs[key] = typeCase(this.__attrsType__[key])(attrs[key].value);
            });

            this.attrs = onChange(this.attrs, () => {
                setTimeout(() => {
                    this.__render__();
                }, 0);
            });
        }

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

            this.props = onChange(this.props, () => {
                setTimeout(() => {
                    this.__render__();
                }, 0);
            });
        }

        __initState__() {
            Object.keys(state).forEach((key) => {
                this.__stateType__[key] = state[key].type;
                this.state[key] = typeCase(this.__stateType__[key])(state[key].value);
            });

            this.state = onChange(this.state, () => {
                setTimeout(() => {
                    this.__render__();
                }, 0);
            });
        }

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

        __initSetup__() {
            var _setup = {
                created() {},
                mounted() {},
                adopted() {},
                changed() {},
                updated() {},
                removed() {},
                ...setup
            }
            Object.keys(_setup).map((a) => {
                this.setup[a] = _setup[a].bind(this);
            });
        }

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

        __refs__() {
            var ids = [];
            Array.from(this.__root__.querySelectorAll("*"))
                .forEach((e) => {
                    if (e.hasAttribute("ref")) {
                        var ref = e.getAttribute("ref");
                        ids.push(ref);
                        ids = [...new Set(ids)];
                    }
                });
            ids.forEach((e) => {
                var id = Array.from(this.__root__.querySelectorAll("[ref='" + e + "']"));
                this.refs[e] = (id.length > 1) ? id : id[0];
                id.forEach((e) => e.removeAttribute("ref"));
            });
        }

        async __render__() {
            this.__updateAttrs__();
            const template = await this.render();
            if (template) {
                var style = await this.styles();
                style = style ? `<style>${style}</style>` : "";
                const temp = style + template.string;
                const components = template.components;
                const events = template.events;
                const props = template.props;
                exec(this.__root__, temp, props, events, components);
                this.__refs__();
            }
            this.setup.updated();
        }
    }
}

export default Component;