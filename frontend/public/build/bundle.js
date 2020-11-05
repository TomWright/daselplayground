
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.4' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/VersionSelector.svelte generated by Svelte v3.29.4 */

    const { console: console_1 } = globals;
    const file = "src/VersionSelector.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (34:12) {#if versions}
    function create_if_block(ctx) {
    	let each_1_anchor;
    	let each_value = /*versions*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*versions*/ 2) {
    				each_value = /*versions*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(34:12) {#if versions}",
    		ctx
    	});

    	return block;
    }

    // (35:16) {#each versions as v}
    function create_each_block(ctx) {
    	let option;
    	let t_value = /*v*/ ctx[4] + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*v*/ ctx[4];
    			option.value = option.__value;
    			add_location(option, file, 35, 20, 848);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*versions*/ 2 && t_value !== (t_value = /*v*/ ctx[4] + "")) set_data_dev(t, t_value);

    			if (dirty & /*versions*/ 2 && option_value_value !== (option_value_value = /*v*/ ctx[4])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(35:16) {#each versions as v}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let label;
    	let select;
    	let mounted;
    	let dispose;
    	let if_block = /*versions*/ ctx[1] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			label = element("label");
    			select = element("select");
    			if (if_block) if_block.c();
    			attr_dev(select, "name", "version");
    			if (/*version*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[3].call(select));
    			add_location(select, file, 32, 8, 718);
    			add_location(label, file, 31, 4, 702);
    			add_location(main, file, 30, 0, 691);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, label);
    			append_dev(label, select);
    			if (if_block) if_block.m(select, null);
    			select_option(select, /*version*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[3]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*versions*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(select, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*version, versions*/ 3) {
    				select_option(select, /*version*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("VersionSelector", slots, []);
    	let versions = [];

    	onMount(async () => {
    		$$invalidate(2, loading = true);

    		await fetch("http://localhost:8080/versions").then(r => r.json()).then(data => {
    			console.log("Loaded versions", data.versions);
    			$$invalidate(1, versions = data.versions);
    			$$invalidate(0, version = versions[0]);
    		}).finally(() => {
    			$$invalidate(2, loading = false);
    		});
    	});

    	afterUpdate(() => {
    		if (!version) {
    			// console.log(versions)
    			$$invalidate(0, version = versions[0]);
    		}
    	});

    	let { version } = $$props;
    	let { loading = false } = $$props;
    	const writable_props = ["version", "loading"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<VersionSelector> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		version = select_value(this);
    		$$invalidate(0, version);
    		$$invalidate(1, versions);
    	}

    	$$self.$$set = $$props => {
    		if ("version" in $$props) $$invalidate(0, version = $$props.version);
    		if ("loading" in $$props) $$invalidate(2, loading = $$props.loading);
    	};

    	$$self.$capture_state = () => ({
    		afterUpdate,
    		onMount,
    		versions,
    		version,
    		loading
    	});

    	$$self.$inject_state = $$props => {
    		if ("versions" in $$props) $$invalidate(1, versions = $$props.versions);
    		if ("version" in $$props) $$invalidate(0, version = $$props.version);
    		if ("loading" in $$props) $$invalidate(2, loading = $$props.loading);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [version, versions, loading, select_change_handler];
    }

    class VersionSelector extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { version: 0, loading: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "VersionSelector",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*version*/ ctx[0] === undefined && !("version" in props)) {
    			console_1.warn("<VersionSelector> was created without expected prop 'version'");
    		}
    	}

    	get version() {
    		throw new Error("<VersionSelector>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set version(value) {
    		throw new Error("<VersionSelector>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loading() {
    		throw new Error("<VersionSelector>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loading(value) {
    		throw new Error("<VersionSelector>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/FileTypeSelector.svelte generated by Svelte v3.29.4 */
    const file$1 = "src/FileTypeSelector.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (39:3) {#if fileTypes}
    function create_if_block$1(ctx) {
    	let each_1_anchor;
    	let each_value = /*fileTypes*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fileTypes*/ 2) {
    				each_value = /*fileTypes*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(39:3) {#if fileTypes}",
    		ctx
    	});

    	return block;
    }

    // (40:4) {#each fileTypes as v}
    function create_each_block$1(ctx) {
    	let option;
    	let t_value = /*v*/ ctx[3].label + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*v*/ ctx[3].value;
    			option.value = option.__value;
    			add_location(option, file$1, 40, 5, 546);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*fileTypes*/ 2 && t_value !== (t_value = /*v*/ ctx[3].label + "")) set_data_dev(t, t_value);

    			if (dirty & /*fileTypes*/ 2 && option_value_value !== (option_value_value = /*v*/ ctx[3].value)) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(40:4) {#each fileTypes as v}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let main;
    	let label;
    	let select;
    	let mounted;
    	let dispose;
    	let if_block = /*fileTypes*/ ctx[1] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			label = element("label");
    			select = element("select");
    			if (if_block) if_block.c();
    			attr_dev(select, "name", "file-type");
    			if (/*fileType*/ ctx[0] === void 0) add_render_callback(() => /*select_change_handler*/ ctx[2].call(select));
    			add_location(select, file$1, 37, 2, 447);
    			add_location(label, file$1, 36, 1, 437);
    			add_location(main, file$1, 35, 0, 429);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, label);
    			append_dev(label, select);
    			if (if_block) if_block.m(select, null);
    			select_option(select, /*fileType*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*select_change_handler*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*fileTypes*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(select, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*fileType, fileTypes*/ 3) {
    				select_option(select, /*fileType*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("FileTypeSelector", slots, []);

    	let { fileTypes = [
    		{ "label": "None", "value": null },
    		{ "label": "JSON", "value": "json" },
    		{ "label": "YAML", "value": "yaml" },
    		{ "label": "TOML", "value": "toml" },
    		{ "label": "XML", "value": "xml" }
    	] } = $$props;

    	afterUpdate(() => {
    		if (!fileType) {
    			$$invalidate(0, fileType = fileTypes[0].value);
    		}
    	});

    	let { fileType } = $$props;
    	const writable_props = ["fileTypes", "fileType"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<FileTypeSelector> was created with unknown prop '${key}'`);
    	});

    	function select_change_handler() {
    		fileType = select_value(this);
    		$$invalidate(0, fileType);
    		$$invalidate(1, fileTypes);
    	}

    	$$self.$$set = $$props => {
    		if ("fileTypes" in $$props) $$invalidate(1, fileTypes = $$props.fileTypes);
    		if ("fileType" in $$props) $$invalidate(0, fileType = $$props.fileType);
    	};

    	$$self.$capture_state = () => ({ afterUpdate, fileTypes, fileType });

    	$$self.$inject_state = $$props => {
    		if ("fileTypes" in $$props) $$invalidate(1, fileTypes = $$props.fileTypes);
    		if ("fileType" in $$props) $$invalidate(0, fileType = $$props.fileType);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [fileType, fileTypes, select_change_handler];
    }

    class FileTypeSelector extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { fileTypes: 1, fileType: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FileTypeSelector",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*fileType*/ ctx[0] === undefined && !("fileType" in props)) {
    			console.warn("<FileTypeSelector> was created without expected prop 'fileType'");
    		}
    	}

    	get fileTypes() {
    		throw new Error("<FileTypeSelector>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fileTypes(value) {
    		throw new Error("<FileTypeSelector>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fileType() {
    		throw new Error("<FileTypeSelector>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fileType(value) {
    		throw new Error("<FileTypeSelector>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/FullCommand.svelte generated by Svelte v3.29.4 */
    const file$2 = "src/FullCommand.svelte";

    function create_fragment$2(ctx) {
    	let main;
    	let code;
    	let t;

    	const block = {
    		c: function create() {
    			main = element("main");
    			code = element("code");
    			t = text(/*command*/ ctx[0]);
    			add_location(code, file$2, 24, 1, 415);
    			attr_dev(main, "class", "svelte-uypmwe");
    			add_location(main, file$2, 23, 0, 407);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, code);
    			append_dev(code, t);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*command*/ 1) set_data_dev(t, /*command*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("FullCommand", slots, []);
    	let { snippet } = $$props;
    	let { command = "" } = $$props;

    	afterUpdate(() => {
    		let cmd = "dasel";

    		if (snippet.fileType) {
    			cmd += ` -p ${snippet.fileType}`;
    		}

    		if (snippet.args && snippet.args.length > 0) {
    			snippet.args.forEach(arg => {
    				cmd += ` ${arg.name}`;

    				if (arg.hasValue) {
    					cmd += ` ${arg.value}`;
    				}
    			});
    		}

    		$$invalidate(0, command = cmd);
    	});

    	const writable_props = ["snippet", "command"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<FullCommand> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("snippet" in $$props) $$invalidate(1, snippet = $$props.snippet);
    		if ("command" in $$props) $$invalidate(0, command = $$props.command);
    	};

    	$$self.$capture_state = () => ({ afterUpdate, snippet, command });

    	$$self.$inject_state = $$props => {
    		if ("snippet" in $$props) $$invalidate(1, snippet = $$props.snippet);
    		if ("command" in $$props) $$invalidate(0, command = $$props.command);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [command, snippet];
    }

    class FullCommand extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { snippet: 1, command: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FullCommand",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*snippet*/ ctx[1] === undefined && !("snippet" in props)) {
    			console.warn("<FullCommand> was created without expected prop 'snippet'");
    		}
    	}

    	get snippet() {
    		throw new Error("<FullCommand>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set snippet(value) {
    		throw new Error("<FullCommand>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get command() {
    		throw new Error("<FullCommand>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set command(value) {
    		throw new Error("<FullCommand>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/FileContent.svelte generated by Svelte v3.29.4 */

    const file$3 = "src/FileContent.svelte";

    function create_fragment$3(ctx) {
    	let main;
    	let label;
    	let t;
    	let textarea;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			label = element("label");
    			t = text("Input File\n\t\t");
    			textarea = element("textarea");
    			attr_dev(textarea, "name", "file-content");
    			attr_dev(textarea, "autocorrect", "off");
    			attr_dev(textarea, "autocomplete", "off");
    			attr_dev(textarea, "autocapitalize", "off");
    			attr_dev(textarea, "spellcheck", "false");
    			attr_dev(textarea, "class", "svelte-1n2r60j");
    			add_location(textarea, file$3, 7, 2, 84);
    			add_location(label, file$3, 5, 4, 55);
    			add_location(main, file$3, 4, 0, 44);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, label);
    			append_dev(label, t);
    			append_dev(label, textarea);
    			set_input_value(textarea, /*content*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[1]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*content*/ 1) {
    				set_input_value(textarea, /*content*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("FileContent", slots, []);
    	let { content } = $$props;
    	const writable_props = ["content"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<FileContent> was created with unknown prop '${key}'`);
    	});

    	function textarea_input_handler() {
    		content = this.value;
    		$$invalidate(0, content);
    	}

    	$$self.$$set = $$props => {
    		if ("content" in $$props) $$invalidate(0, content = $$props.content);
    	};

    	$$self.$capture_state = () => ({ content });

    	$$self.$inject_state = $$props => {
    		if ("content" in $$props) $$invalidate(0, content = $$props.content);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [content, textarea_input_handler];
    }

    class FileContent extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { content: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FileContent",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*content*/ ctx[0] === undefined && !("content" in props)) {
    			console.warn("<FileContent> was created without expected prop 'content'");
    		}
    	}

    	get content() {
    		throw new Error("<FileContent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set content(value) {
    		throw new Error("<FileContent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/CommandOutput.svelte generated by Svelte v3.29.4 */

    const file$4 = "src/CommandOutput.svelte";

    function create_fragment$4(ctx) {
    	let main;
    	let label;
    	let t;
    	let textarea;

    	const block = {
    		c: function create() {
    			main = element("main");
    			label = element("label");
    			t = text("Output\n\t\t");
    			textarea = element("textarea");
    			attr_dev(textarea, "name", "command-output");
    			attr_dev(textarea, "autocorrect", "off");
    			attr_dev(textarea, "autocomplete", "off");
    			textarea.disabled = "disabled";
    			attr_dev(textarea, "autocapitalize", "off");
    			attr_dev(textarea, "spellcheck", "false");
    			textarea.value = /*output*/ ctx[0];
    			attr_dev(textarea, "class", "svelte-11pfr9q");
    			add_location(textarea, file$4, 7, 2, 67);
    			add_location(label, file$4, 5, 1, 48);
    			add_location(main, file$4, 4, 0, 40);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, label);
    			append_dev(label, t);
    			append_dev(label, textarea);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*output*/ 1) {
    				prop_dev(textarea, "value", /*output*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CommandOutput", slots, []);
    	let { output } = $$props;
    	const writable_props = ["output"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CommandOutput> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("output" in $$props) $$invalidate(0, output = $$props.output);
    	};

    	$$self.$capture_state = () => ({ output });

    	$$self.$inject_state = $$props => {
    		if ("output" in $$props) $$invalidate(0, output = $$props.output);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [output];
    }

    class CommandOutput extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { output: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CommandOutput",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*output*/ ctx[0] === undefined && !("output" in props)) {
    			console.warn("<CommandOutput> was created without expected prop 'output'");
    		}
    	}

    	get output() {
    		throw new Error("<CommandOutput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set output(value) {
    		throw new Error("<CommandOutput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Arg.svelte generated by Svelte v3.29.4 */

    const file$5 = "src/Arg.svelte";

    // (13:1) {#if hasValue}
    function create_if_block$2(ctx) {
    	let span;
    	let t1;
    	let label;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "=";
    			t1 = space();
    			label = element("label");
    			input = element("input");
    			add_location(span, file$5, 13, 2, 208);
    			attr_dev(input, "type", "text");
    			add_location(input, file$5, 15, 3, 236);
    			attr_dev(label, "class", "svelte-37c22");
    			add_location(label, file$5, 14, 2, 225);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, label, anchor);
    			append_dev(label, input);
    			set_input_value(input, /*value*/ ctx[1]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[5]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*value*/ 2 && input.value !== /*value*/ ctx[1]) {
    				set_input_value(input, /*value*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(label);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(13:1) {#if hasValue}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let main;
    	let label0;
    	let input0;
    	let t0;
    	let t1;
    	let button;
    	let t3;
    	let label1;
    	let t4;
    	let input1;
    	let mounted;
    	let dispose;
    	let if_block = /*hasValue*/ ctx[2] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			label0 = element("label");
    			input0 = element("input");
    			t0 = space();
    			if (if_block) if_block.c();
    			t1 = space();
    			button = element("button");
    			button.textContent = "Delete";
    			t3 = space();
    			label1 = element("label");
    			t4 = text("Has value\n\t\t");
    			input1 = element("input");
    			attr_dev(input0, "type", "text");
    			add_location(input0, file$5, 10, 2, 142);
    			attr_dev(label0, "class", "svelte-37c22");
    			add_location(label0, file$5, 9, 1, 132);
    			add_location(button, file$5, 18, 1, 294);
    			attr_dev(input1, "type", "checkbox");
    			add_location(input1, file$5, 21, 2, 362);
    			attr_dev(label1, "class", "svelte-37c22");
    			add_location(label1, file$5, 19, 1, 340);
    			add_location(main, file$5, 8, 0, 124);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, label0);
    			append_dev(label0, input0);
    			set_input_value(input0, /*name*/ ctx[0]);
    			append_dev(main, t0);
    			if (if_block) if_block.m(main, null);
    			append_dev(main, t1);
    			append_dev(main, button);
    			append_dev(main, t3);
    			append_dev(main, label1);
    			append_dev(label1, t4);
    			append_dev(label1, input1);
    			input1.checked = /*hasValue*/ ctx[2];

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[4]),
    					listen_dev(
    						button,
    						"click",
    						function () {
    							if (is_function(/*deleteArg*/ ctx[3])) /*deleteArg*/ ctx[3].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(input1, "change", /*input1_change_handler*/ ctx[6]),
    					listen_dev(input1, "change", /*change_handler*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*name*/ 1 && input0.value !== /*name*/ ctx[0]) {
    				set_input_value(input0, /*name*/ ctx[0]);
    			}

    			if (/*hasValue*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(main, t1);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*hasValue*/ 4) {
    				input1.checked = /*hasValue*/ ctx[2];
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Arg", slots, []);
    	let { name = null } = $$props;
    	let { value = null } = $$props;
    	let { hasValue = false } = $$props;
    	let { deleteArg } = $$props;
    	const writable_props = ["name", "value", "hasValue", "deleteArg"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Arg> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		name = this.value;
    		$$invalidate(0, name);
    	}

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(1, value);
    	}

    	function input1_change_handler() {
    		hasValue = this.checked;
    		$$invalidate(2, hasValue);
    	}

    	const change_handler = () => {
    		if (!hasValue) {
    			$$invalidate(1, value = null);
    		} else {
    			$$invalidate(1, value = "");
    		}
    	};

    	$$self.$$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("value" in $$props) $$invalidate(1, value = $$props.value);
    		if ("hasValue" in $$props) $$invalidate(2, hasValue = $$props.hasValue);
    		if ("deleteArg" in $$props) $$invalidate(3, deleteArg = $$props.deleteArg);
    	};

    	$$self.$capture_state = () => ({ name, value, hasValue, deleteArg });

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("value" in $$props) $$invalidate(1, value = $$props.value);
    		if ("hasValue" in $$props) $$invalidate(2, hasValue = $$props.hasValue);
    		if ("deleteArg" in $$props) $$invalidate(3, deleteArg = $$props.deleteArg);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		name,
    		value,
    		hasValue,
    		deleteArg,
    		input0_input_handler,
    		input_input_handler,
    		input1_change_handler,
    		change_handler
    	];
    }

    class Arg extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			name: 0,
    			value: 1,
    			hasValue: 2,
    			deleteArg: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Arg",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*deleteArg*/ ctx[3] === undefined && !("deleteArg" in props)) {
    			console.warn("<Arg> was created without expected prop 'deleteArg'");
    		}
    	}

    	get name() {
    		throw new Error("<Arg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Arg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Arg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Arg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hasValue() {
    		throw new Error("<Arg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hasValue(value) {
    		throw new Error("<Arg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get deleteArg() {
    		throw new Error("<Arg>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set deleteArg(value) {
    		throw new Error("<Arg>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Args.svelte generated by Svelte v3.29.4 */

    const { console: console_1$1 } = globals;
    const file$6 = "src/Args.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[8] = list;
    	child_ctx[9] = i;
    	return child_ctx;
    }

    // (29:8) {#if args}
    function create_if_block$3(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*args*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*removeArg, args*/ 5) {
    				each_value = /*args*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(29:8) {#if args}",
    		ctx
    	});

    	return block;
    }

    // (30:12) {#each args as v, index}
    function create_each_block$2(ctx) {
    	let arg;
    	let updating_value;
    	let updating_name;
    	let updating_hasValue;
    	let current;

    	function func(...args) {
    		return /*func*/ ctx[3](/*index*/ ctx[9], ...args);
    	}

    	function arg_value_binding(value) {
    		/*arg_value_binding*/ ctx[4].call(null, value, /*v*/ ctx[7]);
    	}

    	function arg_name_binding(value) {
    		/*arg_name_binding*/ ctx[5].call(null, value, /*v*/ ctx[7]);
    	}

    	function arg_hasValue_binding(value) {
    		/*arg_hasValue_binding*/ ctx[6].call(null, value, /*v*/ ctx[7]);
    	}

    	let arg_props = { deleteArg: func };

    	if (/*v*/ ctx[7].value !== void 0) {
    		arg_props.value = /*v*/ ctx[7].value;
    	}

    	if (/*v*/ ctx[7].name !== void 0) {
    		arg_props.name = /*v*/ ctx[7].name;
    	}

    	if (/*v*/ ctx[7].hasValue !== void 0) {
    		arg_props.hasValue = /*v*/ ctx[7].hasValue;
    	}

    	arg = new Arg({ props: arg_props, $$inline: true });
    	binding_callbacks.push(() => bind(arg, "value", arg_value_binding));
    	binding_callbacks.push(() => bind(arg, "name", arg_name_binding));
    	binding_callbacks.push(() => bind(arg, "hasValue", arg_hasValue_binding));

    	const block = {
    		c: function create() {
    			create_component(arg.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(arg, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const arg_changes = {};

    			if (!updating_value && dirty & /*args*/ 1) {
    				updating_value = true;
    				arg_changes.value = /*v*/ ctx[7].value;
    				add_flush_callback(() => updating_value = false);
    			}

    			if (!updating_name && dirty & /*args*/ 1) {
    				updating_name = true;
    				arg_changes.name = /*v*/ ctx[7].name;
    				add_flush_callback(() => updating_name = false);
    			}

    			if (!updating_hasValue && dirty & /*args*/ 1) {
    				updating_hasValue = true;
    				arg_changes.hasValue = /*v*/ ctx[7].hasValue;
    				add_flush_callback(() => updating_hasValue = false);
    			}

    			arg.$set(arg_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(arg.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(arg.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(arg, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(30:12) {#each args as v, index}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let main;
    	let div0;
    	let input;
    	let t;
    	let div1;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*args*/ ctx[0] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			input = element("input");
    			t = space();
    			div1 = element("div");
    			if (if_block) if_block.c();
    			attr_dev(input, "type", "button");
    			input.value = "Add argument";
    			add_location(input, file$6, 25, 8, 483);
    			add_location(div0, file$6, 24, 4, 469);
    			add_location(div1, file$6, 27, 4, 559);
    			add_location(main, file$6, 23, 0, 458);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(div0, input);
    			append_dev(main, t);
    			append_dev(main, div1);
    			if (if_block) if_block.m(div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input, "click", /*addArg*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*args*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*args*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Args", slots, []);
    	let { args = [] } = $$props;

    	function addArg() {
    		console.log("adding arg");
    		$$invalidate(0, args = [...args, { name: "", value: null, hasValue: false }]);
    	}

    	function removeArg(index) {
    		console.log("removing arg" + index);
    		$$invalidate(0, args = [...args.slice(0, index), ...args.slice(index + 1, args.length)]);
    	}

    	const writable_props = ["args"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Args> was created with unknown prop '${key}'`);
    	});

    	const func = index => {
    		removeArg(index);
    	};

    	function arg_value_binding(value, v) {
    		v.value = value;
    		$$invalidate(0, args);
    	}

    	function arg_name_binding(value, v) {
    		v.name = value;
    		$$invalidate(0, args);
    	}

    	function arg_hasValue_binding(value, v) {
    		v.hasValue = value;
    		$$invalidate(0, args);
    	}

    	$$self.$$set = $$props => {
    		if ("args" in $$props) $$invalidate(0, args = $$props.args);
    	};

    	$$self.$capture_state = () => ({ Arg, args, addArg, removeArg });

    	$$self.$inject_state = $$props => {
    		if ("args" in $$props) $$invalidate(0, args = $$props.args);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		args,
    		addArg,
    		removeArg,
    		func,
    		arg_value_binding,
    		arg_name_binding,
    		arg_hasValue_binding
    	];
    }

    class Args extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { args: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Args",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get args() {
    		throw new Error("<Args>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set args(value) {
    		throw new Error("<Args>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Run.svelte generated by Svelte v3.29.4 */

    const { Error: Error_1, console: console_1$2 } = globals;
    const file$7 = "src/Run.svelte";

    function create_fragment$7(ctx) {
    	let main;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			input = element("input");
    			attr_dev(input, "type", "button");
    			input.value = "Run";
    			add_location(input, file$7, 47, 4, 1205);
    			add_location(main, file$7, 46, 0, 1194);
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, input);

    			if (!mounted) {
    				dispose = listen_dev(input, "click", /*run*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Run", slots, []);
    	let { snippet } = $$props;
    	let { output } = $$props;
    	let { loading } = $$props;

    	async function run() {
    		$$invalidate(2, loading = true);

    		await fetch("http://localhost:8080/execute", {
    			method: "POST",
    			body: JSON.stringify({ snippet })
    		}).then(r => {
    			return r.json().then(data => {
    				return { r, data };
    			});
    		}).then(data => {
    			if (data.data.error) {
    				throw new Error(data.data.error);
    			}

    			if (!data.r.ok) {
    				throw new Error(`${data.r.status} ${data.r.statusText}`);
    			}

    			return data.data.data;
    		}).then(data => {
    			console.log("Executed", data);
    			$$invalidate(1, output = data);
    		}).catch(err => {
    			$$invalidate(1, output = err);
    		}).finally(() => {
    			$$invalidate(2, loading = false);
    		});
    	}

    	const writable_props = ["snippet", "output", "loading"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<Run> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("snippet" in $$props) $$invalidate(3, snippet = $$props.snippet);
    		if ("output" in $$props) $$invalidate(1, output = $$props.output);
    		if ("loading" in $$props) $$invalidate(2, loading = $$props.loading);
    	};

    	$$self.$capture_state = () => ({ snippet, output, loading, run });

    	$$self.$inject_state = $$props => {
    		if ("snippet" in $$props) $$invalidate(3, snippet = $$props.snippet);
    		if ("output" in $$props) $$invalidate(1, output = $$props.output);
    		if ("loading" in $$props) $$invalidate(2, loading = $$props.loading);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [run, output, loading, snippet];
    }

    class Run extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { snippet: 3, output: 1, loading: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Run",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*snippet*/ ctx[3] === undefined && !("snippet" in props)) {
    			console_1$2.warn("<Run> was created without expected prop 'snippet'");
    		}

    		if (/*output*/ ctx[1] === undefined && !("output" in props)) {
    			console_1$2.warn("<Run> was created without expected prop 'output'");
    		}

    		if (/*loading*/ ctx[2] === undefined && !("loading" in props)) {
    			console_1$2.warn("<Run> was created without expected prop 'loading'");
    		}
    	}

    	get snippet() {
    		throw new Error_1("<Run>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set snippet(value) {
    		throw new Error_1("<Run>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get output() {
    		throw new Error_1("<Run>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set output(value) {
    		throw new Error_1("<Run>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loading() {
    		throw new Error_1("<Run>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loading(value) {
    		throw new Error_1("<Run>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Save.svelte generated by Svelte v3.29.4 */

    const { console: console_1$3 } = globals;
    const file$8 = "src/Save.svelte";

    function create_fragment$8(ctx) {
    	let main;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			input = element("input");
    			attr_dev(input, "type", "button");
    			input.value = "Save";
    			add_location(input, file$8, 24, 4, 575);
    			add_location(main, file$8, 23, 0, 564);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, input);

    			if (!mounted) {
    				dispose = listen_dev(input, "click", /*save*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Save", slots, []);
    	let { snippet } = $$props;
    	let { loading } = $$props;

    	async function save() {
    		$$invalidate(1, loading = true);

    		await fetch("http://localhost:8080/snippet", {
    			method: "POST",
    			body: JSON.stringify({ snippet })
    		}).then(r => r.json()).then(data => {
    			console.log("Saved", data.snippet);
    			window.location = `/s/${data.snippet.id}`;
    		}).finally(() => {
    			$$invalidate(1, loading = false);
    		});
    	}

    	const writable_props = ["snippet", "loading"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<Save> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("snippet" in $$props) $$invalidate(2, snippet = $$props.snippet);
    		if ("loading" in $$props) $$invalidate(1, loading = $$props.loading);
    	};

    	$$self.$capture_state = () => ({ snippet, loading, save });

    	$$self.$inject_state = $$props => {
    		if ("snippet" in $$props) $$invalidate(2, snippet = $$props.snippet);
    		if ("loading" in $$props) $$invalidate(1, loading = $$props.loading);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [save, loading, snippet];
    }

    class Save extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { snippet: 2, loading: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Save",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*snippet*/ ctx[2] === undefined && !("snippet" in props)) {
    			console_1$3.warn("<Save> was created without expected prop 'snippet'");
    		}

    		if (/*loading*/ ctx[1] === undefined && !("loading" in props)) {
    			console_1$3.warn("<Save> was created without expected prop 'loading'");
    		}
    	}

    	get snippet() {
    		throw new Error("<Save>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set snippet(value) {
    		throw new Error("<Save>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get loading() {
    		throw new Error("<Save>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loading(value) {
    		throw new Error("<Save>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Loader.svelte generated by Svelte v3.29.4 */

    const file$9 = "src/Loader.svelte";

    // (7:8) {#if loading}
    function create_if_block$4(ctx) {
    	let div1;
    	let div0;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			attr_dev(div0, "class", "loader-spinner svelte-13v2blt");
    			add_location(div0, file$9, 8, 16, 173);
    			attr_dev(div1, "class", "loader-overlay svelte-13v2blt");
    			add_location(div1, file$9, 7, 12, 128);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(7:8) {#if loading}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let main;
    	let div;
    	let t;
    	let current;
    	let if_block = /*loading*/ ctx[0] && create_if_block$4(ctx);
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "loader-container svelte-13v2blt");
    			add_location(div, file$9, 5, 4, 63);
    			add_location(main, file$9, 4, 0, 52);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*loading*/ ctx[0]) {
    				if (if_block) ; else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					if_block.m(div, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Loader", slots, ['default']);
    	let { loading = false } = $$props;
    	const writable_props = ["loading"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Loader> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("loading" in $$props) $$invalidate(0, loading = $$props.loading);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ loading });

    	$$self.$inject_state = $$props => {
    		if ("loading" in $$props) $$invalidate(0, loading = $$props.loading);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [loading, $$scope, slots];
    }

    class Loader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { loading: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Loader",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get loading() {
    		throw new Error("<Loader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set loading(value) {
    		throw new Error("<Loader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.29.4 */

    const { Error: Error_1$1, console: console_1$4 } = globals;
    const file$a = "src/App.svelte";

    // (82:4) <Loader loading="{snippetLoading || versionsLoading || executeLoading || saveLoading}">
    function create_default_slot(ctx) {
    	let versionselector;
    	let updating_version;
    	let updating_loading;
    	let t0;
    	let filetypeselector;
    	let updating_fileType;
    	let t1;
    	let filecontent;
    	let updating_content;
    	let t2;
    	let args;
    	let updating_args;
    	let t3;
    	let fullcommand;
    	let updating_command;
    	let t4;
    	let run_1;
    	let updating_snippet;
    	let updating_output;
    	let updating_loading_1;
    	let t5;
    	let save;
    	let updating_snippet_1;
    	let updating_loading_2;
    	let t6;
    	let commandoutput;
    	let current;

    	function versionselector_version_binding(value) {
    		/*versionselector_version_binding*/ ctx[7].call(null, value);
    	}

    	function versionselector_loading_binding(value) {
    		/*versionselector_loading_binding*/ ctx[8].call(null, value);
    	}

    	let versionselector_props = {};

    	if (/*snippet*/ ctx[0].version !== void 0) {
    		versionselector_props.version = /*snippet*/ ctx[0].version;
    	}

    	if (/*versionsLoading*/ ctx[3] !== void 0) {
    		versionselector_props.loading = /*versionsLoading*/ ctx[3];
    	}

    	versionselector = new VersionSelector({
    			props: versionselector_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(versionselector, "version", versionselector_version_binding));
    	binding_callbacks.push(() => bind(versionselector, "loading", versionselector_loading_binding));

    	function filetypeselector_fileType_binding(value) {
    		/*filetypeselector_fileType_binding*/ ctx[9].call(null, value);
    	}

    	let filetypeselector_props = {};

    	if (/*snippet*/ ctx[0].fileType !== void 0) {
    		filetypeselector_props.fileType = /*snippet*/ ctx[0].fileType;
    	}

    	filetypeselector = new FileTypeSelector({
    			props: filetypeselector_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(filetypeselector, "fileType", filetypeselector_fileType_binding));

    	function filecontent_content_binding(value) {
    		/*filecontent_content_binding*/ ctx[10].call(null, value);
    	}

    	let filecontent_props = {};

    	if (/*snippet*/ ctx[0].file !== void 0) {
    		filecontent_props.content = /*snippet*/ ctx[0].file;
    	}

    	filecontent = new FileContent({ props: filecontent_props, $$inline: true });
    	binding_callbacks.push(() => bind(filecontent, "content", filecontent_content_binding));

    	function args_args_binding(value) {
    		/*args_args_binding*/ ctx[11].call(null, value);
    	}

    	let args_props = {};

    	if (/*snippet*/ ctx[0].args !== void 0) {
    		args_props.args = /*snippet*/ ctx[0].args;
    	}

    	args = new Args({ props: args_props, $$inline: true });
    	binding_callbacks.push(() => bind(args, "args", args_args_binding));

    	function fullcommand_command_binding(value) {
    		/*fullcommand_command_binding*/ ctx[12].call(null, value);
    	}

    	let fullcommand_props = { snippet: /*snippet*/ ctx[0] };

    	if (/*command*/ ctx[6] !== void 0) {
    		fullcommand_props.command = /*command*/ ctx[6];
    	}

    	fullcommand = new FullCommand({ props: fullcommand_props, $$inline: true });
    	binding_callbacks.push(() => bind(fullcommand, "command", fullcommand_command_binding));

    	function run_1_snippet_binding(value) {
    		/*run_1_snippet_binding*/ ctx[13].call(null, value);
    	}

    	function run_1_output_binding(value) {
    		/*run_1_output_binding*/ ctx[14].call(null, value);
    	}

    	function run_1_loading_binding(value) {
    		/*run_1_loading_binding*/ ctx[15].call(null, value);
    	}

    	let run_1_props = {};

    	if (/*snippet*/ ctx[0] !== void 0) {
    		run_1_props.snippet = /*snippet*/ ctx[0];
    	}

    	if (/*output*/ ctx[1] !== void 0) {
    		run_1_props.output = /*output*/ ctx[1];
    	}

    	if (/*executeLoading*/ ctx[4] !== void 0) {
    		run_1_props.loading = /*executeLoading*/ ctx[4];
    	}

    	run_1 = new Run({ props: run_1_props, $$inline: true });
    	binding_callbacks.push(() => bind(run_1, "snippet", run_1_snippet_binding));
    	binding_callbacks.push(() => bind(run_1, "output", run_1_output_binding));
    	binding_callbacks.push(() => bind(run_1, "loading", run_1_loading_binding));

    	function save_snippet_binding(value) {
    		/*save_snippet_binding*/ ctx[16].call(null, value);
    	}

    	function save_loading_binding(value) {
    		/*save_loading_binding*/ ctx[17].call(null, value);
    	}

    	let save_props = {};

    	if (/*snippet*/ ctx[0] !== void 0) {
    		save_props.snippet = /*snippet*/ ctx[0];
    	}

    	if (/*saveLoading*/ ctx[5] !== void 0) {
    		save_props.loading = /*saveLoading*/ ctx[5];
    	}

    	save = new Save({ props: save_props, $$inline: true });
    	binding_callbacks.push(() => bind(save, "snippet", save_snippet_binding));
    	binding_callbacks.push(() => bind(save, "loading", save_loading_binding));

    	commandoutput = new CommandOutput({
    			props: { output: /*output*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(versionselector.$$.fragment);
    			t0 = space();
    			create_component(filetypeselector.$$.fragment);
    			t1 = space();
    			create_component(filecontent.$$.fragment);
    			t2 = space();
    			create_component(args.$$.fragment);
    			t3 = space();
    			create_component(fullcommand.$$.fragment);
    			t4 = space();
    			create_component(run_1.$$.fragment);
    			t5 = space();
    			create_component(save.$$.fragment);
    			t6 = space();
    			create_component(commandoutput.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(versionselector, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(filetypeselector, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(filecontent, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(args, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(fullcommand, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(run_1, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(save, target, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(commandoutput, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const versionselector_changes = {};

    			if (!updating_version && dirty & /*snippet*/ 1) {
    				updating_version = true;
    				versionselector_changes.version = /*snippet*/ ctx[0].version;
    				add_flush_callback(() => updating_version = false);
    			}

    			if (!updating_loading && dirty & /*versionsLoading*/ 8) {
    				updating_loading = true;
    				versionselector_changes.loading = /*versionsLoading*/ ctx[3];
    				add_flush_callback(() => updating_loading = false);
    			}

    			versionselector.$set(versionselector_changes);
    			const filetypeselector_changes = {};

    			if (!updating_fileType && dirty & /*snippet*/ 1) {
    				updating_fileType = true;
    				filetypeselector_changes.fileType = /*snippet*/ ctx[0].fileType;
    				add_flush_callback(() => updating_fileType = false);
    			}

    			filetypeselector.$set(filetypeselector_changes);
    			const filecontent_changes = {};

    			if (!updating_content && dirty & /*snippet*/ 1) {
    				updating_content = true;
    				filecontent_changes.content = /*snippet*/ ctx[0].file;
    				add_flush_callback(() => updating_content = false);
    			}

    			filecontent.$set(filecontent_changes);
    			const args_changes = {};

    			if (!updating_args && dirty & /*snippet*/ 1) {
    				updating_args = true;
    				args_changes.args = /*snippet*/ ctx[0].args;
    				add_flush_callback(() => updating_args = false);
    			}

    			args.$set(args_changes);
    			const fullcommand_changes = {};
    			if (dirty & /*snippet*/ 1) fullcommand_changes.snippet = /*snippet*/ ctx[0];

    			if (!updating_command && dirty & /*command*/ 64) {
    				updating_command = true;
    				fullcommand_changes.command = /*command*/ ctx[6];
    				add_flush_callback(() => updating_command = false);
    			}

    			fullcommand.$set(fullcommand_changes);
    			const run_1_changes = {};

    			if (!updating_snippet && dirty & /*snippet*/ 1) {
    				updating_snippet = true;
    				run_1_changes.snippet = /*snippet*/ ctx[0];
    				add_flush_callback(() => updating_snippet = false);
    			}

    			if (!updating_output && dirty & /*output*/ 2) {
    				updating_output = true;
    				run_1_changes.output = /*output*/ ctx[1];
    				add_flush_callback(() => updating_output = false);
    			}

    			if (!updating_loading_1 && dirty & /*executeLoading*/ 16) {
    				updating_loading_1 = true;
    				run_1_changes.loading = /*executeLoading*/ ctx[4];
    				add_flush_callback(() => updating_loading_1 = false);
    			}

    			run_1.$set(run_1_changes);
    			const save_changes = {};

    			if (!updating_snippet_1 && dirty & /*snippet*/ 1) {
    				updating_snippet_1 = true;
    				save_changes.snippet = /*snippet*/ ctx[0];
    				add_flush_callback(() => updating_snippet_1 = false);
    			}

    			if (!updating_loading_2 && dirty & /*saveLoading*/ 32) {
    				updating_loading_2 = true;
    				save_changes.loading = /*saveLoading*/ ctx[5];
    				add_flush_callback(() => updating_loading_2 = false);
    			}

    			save.$set(save_changes);
    			const commandoutput_changes = {};
    			if (dirty & /*output*/ 2) commandoutput_changes.output = /*output*/ ctx[1];
    			commandoutput.$set(commandoutput_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(versionselector.$$.fragment, local);
    			transition_in(filetypeselector.$$.fragment, local);
    			transition_in(filecontent.$$.fragment, local);
    			transition_in(args.$$.fragment, local);
    			transition_in(fullcommand.$$.fragment, local);
    			transition_in(run_1.$$.fragment, local);
    			transition_in(save.$$.fragment, local);
    			transition_in(commandoutput.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(versionselector.$$.fragment, local);
    			transition_out(filetypeselector.$$.fragment, local);
    			transition_out(filecontent.$$.fragment, local);
    			transition_out(args.$$.fragment, local);
    			transition_out(fullcommand.$$.fragment, local);
    			transition_out(run_1.$$.fragment, local);
    			transition_out(save.$$.fragment, local);
    			transition_out(commandoutput.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(versionselector, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(filetypeselector, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(filecontent, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(args, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(fullcommand, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(run_1, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(save, detaching);
    			if (detaching) detach_dev(t6);
    			destroy_component(commandoutput, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(82:4) <Loader loading=\\\"{snippetLoading || versionsLoading || executeLoading || saveLoading}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let p;
    	let t2;
    	let a;
    	let t4;
    	let t5;
    	let loader;
    	let current;

    	loader = new Loader({
    			props: {
    				loading: /*snippetLoading*/ ctx[2] || /*versionsLoading*/ ctx[3] || /*executeLoading*/ ctx[4] || /*saveLoading*/ ctx[5],
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Dasel Playground";
    			t1 = space();
    			p = element("p");
    			t2 = text("Playground environment for ");
    			a = element("a");
    			a.textContent = "Dasel";
    			t4 = text(".");
    			t5 = space();
    			create_component(loader.$$.fragment);
    			attr_dev(h1, "class", "svelte-1y0uilm");
    			add_location(h1, file$a, 79, 4, 2346);
    			attr_dev(a, "href", "https://github.com/TomWright/dasel");
    			attr_dev(a, "target", "_blank");
    			add_location(a, file$a, 80, 34, 2406);
    			add_location(p, file$a, 80, 4, 2376);
    			attr_dev(main, "class", "svelte-1y0uilm");
    			add_location(main, file$a, 78, 0, 2335);
    		},
    		l: function claim(nodes) {
    			throw new Error_1$1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, p);
    			append_dev(p, t2);
    			append_dev(p, a);
    			append_dev(p, t4);
    			append_dev(main, t5);
    			mount_component(loader, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const loader_changes = {};
    			if (dirty & /*snippetLoading, versionsLoading, executeLoading, saveLoading*/ 60) loader_changes.loading = /*snippetLoading*/ ctx[2] || /*versionsLoading*/ ctx[3] || /*executeLoading*/ ctx[4] || /*saveLoading*/ ctx[5];

    			if (dirty & /*$$scope, output, snippet, saveLoading, executeLoading, command, versionsLoading*/ 262267) {
    				loader_changes.$$scope = { dirty, ctx };
    			}

    			loader.$set(loader_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(loader.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(loader.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(loader);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	let { snippet = {
    		id: null,
    		file: `{"name": "Tom"}`,
    		fileType: "json",
    		args: [
    			{
    				name: ".name",
    				value: null,
    				hasValue: false
    			}
    		],
    		version: null
    	} } = $$props;

    	onMount(async () => {
    		const splitPath = window.location.pathname.split("/");

    		if (splitPath.length === 3) {
    			$$invalidate(2, snippetLoading = true);
    			const id = splitPath[2];
    			console.log(`loading snippet ${id}`);

    			await fetch(`http://localhost:8080/snippet?id=${id}`).then(r => {
    				return r.json().then(data => {
    					return { r, data };
    				});
    			}).then(data => {
    				console.log(data.data);

    				if (data.data.error) {
    					throw new Error(data.data.error);
    				}

    				if (!data.r.ok) {
    					throw new Error(`${data.r.status} ${data.r.statusText}`);
    				}

    				return data.data.snippet;
    			}).then(s => {
    				console.log(`loaded snippet`, s);
    				$$invalidate(0, snippet = s);
    				return s;
    			}).catch(err => {
    				$$invalidate(1, output = err);
    			}).finally(() => {
    				$$invalidate(2, snippetLoading = false);
    			});
    		}
    	});

    	let { output = null } = $$props;
    	let snippetLoading = false;
    	let versionsLoading = false;
    	let executeLoading = false;
    	let saveLoading = false;
    	let command;
    	const writable_props = ["snippet", "output"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$4.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function versionselector_version_binding(value) {
    		snippet.version = value;
    		$$invalidate(0, snippet);
    	}

    	function versionselector_loading_binding(value) {
    		versionsLoading = value;
    		$$invalidate(3, versionsLoading);
    	}

    	function filetypeselector_fileType_binding(value) {
    		snippet.fileType = value;
    		$$invalidate(0, snippet);
    	}

    	function filecontent_content_binding(value) {
    		snippet.file = value;
    		$$invalidate(0, snippet);
    	}

    	function args_args_binding(value) {
    		snippet.args = value;
    		$$invalidate(0, snippet);
    	}

    	function fullcommand_command_binding(value) {
    		command = value;
    		$$invalidate(6, command);
    	}

    	function run_1_snippet_binding(value) {
    		snippet = value;
    		$$invalidate(0, snippet);
    	}

    	function run_1_output_binding(value) {
    		output = value;
    		$$invalidate(1, output);
    	}

    	function run_1_loading_binding(value) {
    		executeLoading = value;
    		$$invalidate(4, executeLoading);
    	}

    	function save_snippet_binding(value) {
    		snippet = value;
    		$$invalidate(0, snippet);
    	}

    	function save_loading_binding(value) {
    		saveLoading = value;
    		$$invalidate(5, saveLoading);
    	}

    	$$self.$$set = $$props => {
    		if ("snippet" in $$props) $$invalidate(0, snippet = $$props.snippet);
    		if ("output" in $$props) $$invalidate(1, output = $$props.output);
    	};

    	$$self.$capture_state = () => ({
    		VersionSelector,
    		FileTypeSelector,
    		FullCommand,
    		FileContent,
    		CommandOutput,
    		Args,
    		Run,
    		Save,
    		onMount,
    		Loader,
    		snippet,
    		output,
    		snippetLoading,
    		versionsLoading,
    		executeLoading,
    		saveLoading,
    		command
    	});

    	$$self.$inject_state = $$props => {
    		if ("snippet" in $$props) $$invalidate(0, snippet = $$props.snippet);
    		if ("output" in $$props) $$invalidate(1, output = $$props.output);
    		if ("snippetLoading" in $$props) $$invalidate(2, snippetLoading = $$props.snippetLoading);
    		if ("versionsLoading" in $$props) $$invalidate(3, versionsLoading = $$props.versionsLoading);
    		if ("executeLoading" in $$props) $$invalidate(4, executeLoading = $$props.executeLoading);
    		if ("saveLoading" in $$props) $$invalidate(5, saveLoading = $$props.saveLoading);
    		if ("command" in $$props) $$invalidate(6, command = $$props.command);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		snippet,
    		output,
    		snippetLoading,
    		versionsLoading,
    		executeLoading,
    		saveLoading,
    		command,
    		versionselector_version_binding,
    		versionselector_loading_binding,
    		filetypeselector_fileType_binding,
    		filecontent_content_binding,
    		args_args_binding,
    		fullcommand_command_binding,
    		run_1_snippet_binding,
    		run_1_output_binding,
    		run_1_loading_binding,
    		save_snippet_binding,
    		save_loading_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { snippet: 0, output: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get snippet() {
    		throw new Error_1$1("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set snippet(value) {
    		throw new Error_1$1("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get output() {
    		throw new Error_1$1("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set output(value) {
    		throw new Error_1$1("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
