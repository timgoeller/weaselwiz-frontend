
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
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

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
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
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
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
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
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
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.23.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
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
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\components\Codeview.svelte generated by Svelte v3.23.2 */

    const { console: console_1 } = globals;
    const file = "src\\components\\Codeview.svelte";

    function create_fragment(ctx) {
    	let div2;
    	let div0;
    	let t;
    	let div1;
    	let textarea;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			textarea = element("textarea");
    			attr_dev(div0, "id", "line-numbers");
    			attr_dev(div0, "class", "svelte-1t2bl5g");
    			add_location(div0, file, 19, 1, 327);
    			textarea.disabled = /*inputDisabled*/ ctx[1];
    			attr_dev(textarea, "id", "code-area");
    			attr_dev(textarea, "class", "svelte-1t2bl5g");
    			add_location(textarea, file, 23, 2, 393);
    			attr_dev(div1, "id", "text-container");
    			attr_dev(div1, "class", "svelte-1t2bl5g");
    			add_location(div1, file, 22, 1, 364);
    			attr_dev(div2, "id", "code-container");
    			attr_dev(div2, "class", "svelte-1t2bl5g");
    			add_location(div2, file, 18, 0, 299);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div2, t);
    			append_dev(div2, div1);
    			append_dev(div1, textarea);
    			set_input_value(textarea, /*code*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[4]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*inputDisabled*/ 2) {
    				prop_dev(textarea, "disabled", /*inputDisabled*/ ctx[1]);
    			}

    			if (dirty & /*code*/ 1) {
    				set_input_value(textarea, /*code*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
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
    	let { foo } = $$props;
    	let { code } = $$props;

    	// Values that are passed in as props
    	// are immediately available
    	console.log({ foo });

    	let inputDisabled = false;

    	function disableCodeView() {
    		$$invalidate(1, inputDisabled = true);
    	}

    	const writable_props = ["foo", "code"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Codeview> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Codeview", $$slots, []);

    	function textarea_input_handler() {
    		code = this.value;
    		$$invalidate(0, code);
    	}

    	$$self.$set = $$props => {
    		if ("foo" in $$props) $$invalidate(2, foo = $$props.foo);
    		if ("code" in $$props) $$invalidate(0, code = $$props.code);
    	};

    	$$self.$capture_state = () => ({
    		foo,
    		code,
    		inputDisabled,
    		disableCodeView
    	});

    	$$self.$inject_state = $$props => {
    		if ("foo" in $$props) $$invalidate(2, foo = $$props.foo);
    		if ("code" in $$props) $$invalidate(0, code = $$props.code);
    		if ("inputDisabled" in $$props) $$invalidate(1, inputDisabled = $$props.inputDisabled);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [code, inputDisabled, foo, disableCodeView, textarea_input_handler];
    }

    class Codeview extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { foo: 2, code: 0, disableCodeView: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Codeview",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*foo*/ ctx[2] === undefined && !("foo" in props)) {
    			console_1.warn("<Codeview> was created without expected prop 'foo'");
    		}

    		if (/*code*/ ctx[0] === undefined && !("code" in props)) {
    			console_1.warn("<Codeview> was created without expected prop 'code'");
    		}
    	}

    	get foo() {
    		return this.$$.ctx[2];
    	}

    	set foo(foo) {
    		this.$set({ foo });
    		flush();
    	}

    	get code() {
    		return this.$$.ctx[0];
    	}

    	set code(code) {
    		this.$set({ code });
    		flush();
    	}

    	get disableCodeView() {
    		return this.$$.ctx[3];
    	}

    	set disableCodeView(value) {
    		throw new Error("<Codeview>: Cannot set read-only property 'disableCodeView'");
    	}
    }

    /* src\components\Taskbar.svelte generated by Svelte v3.23.2 */
    const file$1 = "src\\components\\Taskbar.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "Run Typecheck";
    			add_location(button, file$1, 6, 2, 151);
    			attr_dev(div, "id", "taskbar-container");
    			attr_dev(div, "class", "svelte-1sq528l");
    			add_location(div, file$1, 5, 0, 119);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
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
    	const dispatch = createEventDispatcher();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Taskbar> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Taskbar", $$slots, []);
    	const click_handler = () => dispatch("runTypecheckClicked");
    	$$self.$capture_state = () => ({ createEventDispatcher, dispatch });
    	return [dispatch, click_handler];
    }

    class Taskbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Taskbar",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.23.2 */

    const { console: console_1$1 } = globals;
    const file$2 = "src\\App.svelte";

    // (19:2) <Codeview bind:this={codeview}>
    function create_default_slot(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text(">");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(19:2) <Codeview bind:this={codeview}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let main;
    	let div0;
    	let codeview_1;
    	let t0;
    	let div1;
    	let taskbar;
    	let t1;
    	let div2;
    	let t2;
    	let div3;
    	let current;

    	let codeview_1_props = {
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	};

    	codeview_1 = new Codeview({ props: codeview_1_props, $$inline: true });
    	/*codeview_1_binding*/ ctx[2](codeview_1);
    	taskbar = new Taskbar({ $$inline: true });
    	taskbar.$on("runTypecheckClicked", /*runTypechecker*/ ctx[1]);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div0 = element("div");
    			create_component(codeview_1.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			create_component(taskbar.$$.fragment);
    			t1 = space();
    			div2 = element("div");
    			t2 = space();
    			div3 = element("div");
    			attr_dev(div0, "id", "code-view");
    			attr_dev(div0, "class", "svelte-1t902fu");
    			add_location(div0, file$2, 17, 1, 429);
    			attr_dev(div1, "id", "taskbar");
    			attr_dev(div1, "class", "svelte-1t902fu");
    			add_location(div1, file$2, 20, 1, 508);
    			attr_dev(div2, "id", "environment-view");
    			attr_dev(div2, "class", "svelte-1t902fu");
    			add_location(div2, file$2, 23, 1, 601);
    			attr_dev(div3, "id", "some-view");
    			attr_dev(div3, "class", "svelte-1t902fu");
    			add_location(div3, file$2, 24, 1, 637);
    			attr_dev(main, "id", "layout");
    			attr_dev(main, "class", "svelte-1t902fu");
    			add_location(main, file$2, 16, 0, 408);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			mount_component(codeview_1, div0, null);
    			append_dev(main, t0);
    			append_dev(main, div1);
    			mount_component(taskbar, div1, null);
    			append_dev(main, t1);
    			append_dev(main, div2);
    			append_dev(main, t2);
    			append_dev(main, div3);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const codeview_1_changes = {};

    			if (dirty & /*$$scope*/ 8) {
    				codeview_1_changes.$$scope = { dirty, ctx };
    			}

    			codeview_1.$set(codeview_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(codeview_1.$$.fragment, local);
    			transition_in(taskbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(codeview_1.$$.fragment, local);
    			transition_out(taskbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			/*codeview_1_binding*/ ctx[2](null);
    			destroy_component(codeview_1);
    			destroy_component(taskbar);
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
    	let codeview;

    	function runTypechecker() {
    		// console.log(codeview.code)
    		codeview.disableCodeView();

    		fetch("http://localhost:37105/compile", { method: "POST", body: codeview.code }).then(response => response.json()).then(data => console.log(data));
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	function codeview_1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			codeview = $$value;
    			$$invalidate(0, codeview);
    		});
    	}

    	$$self.$capture_state = () => ({
    		Codeview,
    		Taskbar,
    		codeview,
    		runTypechecker
    	});

    	$$self.$inject_state = $$props => {
    		if ("codeview" in $$props) $$invalidate(0, codeview = $$props.codeview);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [codeview, runTypechecker, codeview_1_binding];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    const app = new App({
      target: document.body,
      props: {
        name: 'world'
      }
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
