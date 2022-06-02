import { uuid, typeOf } from "../Utils/index.js";

function html(parts, ...args) {
    const template = parts.reduce(
        (acc, part, i) => {
            if (!acc.string) {
                return {
                    components: acc.components,
                    events: acc.events,
                    string: part,
                    props: acc.props,
                };
            }

            const arg = args[i - 1];

            if (arg === null || arg === false || arg === undefined) {
                return {
                    components: acc.components,
                    events: acc.events,
                    string: acc.string + part,
                    props: acc.props,
                };
            }

            if (typeOf(arg) === "component") {
                const id = uuid();
                if (!("__archive__" in arg))
                    arg.__archive__ = {}
                return {
                    components: {...acc.components, [id]: arg },
                    events: acc.events,
                    string: acc.string + `<!--${id}-->` + part,
                    props: acc.props,
                };
            }

            if (typeOf(arg) === "function") {
                const id = uuid();
                return {
                    components: acc.components,
                    events: {...acc.events, [id]: arg },
                    string: acc.string + id + part,
                    props: acc.props,
                };
            }

            if (typeOf(arg) === "array") {
                var allComponents = arg.reduce((acc, a) => {
                    return {...acc, ...a.components };
                }, {});
                var allEvents = arg.reduce((acc, a) => {
                    return {...acc, ...a.events };
                }, {});
                var allProps = arg.reduce((acc, a) => {
                    return {...acc, ...a.props };
                }, {});
                var string = arg.reduce((acc, a) => acc + (a.string || ""), "");
                if (!string.length) {
                    const id = uuid();
                    string = id;
                    allProps = {
                        ...allProps,
                        [id]: arg,
                    };
                }
                return {
                    components: {...acc.components, ...allComponents },
                    events: {...acc.events, ...allEvents },
                    string: acc.string + string + part,
                    props: {...acc.props, ...allProps },
                };
            }

            if (typeOf(arg) === "object") {
                var allComponents = arg.components || {},
                    allEvents = arg.events || {},
                    allProps = arg.props || {};
                var string = arg.string || "";
                if (!string.length) {
                    const id = uuid();
                    string = id;
                    allProps = {
                        ...allProps,
                        [id]: arg,
                    };
                }

                return {
                    components: {...acc.components, ...allComponents },
                    events: {...acc.events, ...allEvents },
                    string: acc.string + string + part,
                    props: {...acc.props, ...allProps },
                };
            }

            if (typeOf(arg) === "generator") {
                for (var obj of arg) {
                    acc = {
                        components: {...acc.components, ...obj.components },
                        events: {...acc.events, ...obj.events },
                        string: acc.string + obj.string,
                        props: {...acc.props, ...obj.props },
                    }
                }

                return {
                    components: {...acc.components },
                    events: {...acc.events },
                    string: acc.string + part,
                    props: {...acc.props },
                };
            }

            return {
                components: {...acc.components },
                events: {...acc.events },
                string: acc.string + args[i - 1] + part,
                props: {...acc.props },
            };
        }, {
            components: {},
            events: {},
            string: null,
            props: {},
        }
    );
    template.string = template.string.trim().replace(/(\t|\n|\r)/gm, " ");
    return template;
}

export default html;