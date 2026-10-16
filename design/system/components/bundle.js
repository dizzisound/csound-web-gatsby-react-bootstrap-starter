/* @ds-bundle: {"format":4,"namespace":"CsoundWebUI","components":[{"name":"Panel"},{"name":"SubPanel"},{"name":"PanelSwitch"},{"name":"TabPanel"},{"name":"Label"},{"name":"ValueBox"},{"name":"StatusBadge"},{"name":"Fader"},{"name":"HFader"},{"name":"Knob"},{"name":"Spinner"},{"name":"NumberInput"},{"name":"Select"},{"name":"XYPad"},{"name":"Button"},{"name":"Dropdown"},{"name":"Icon"}]} */
(function () {
  "use strict";
  var React = window.React;
  var h = React.createElement;
  var useState = React.useState, useRef = React.useRef, useEffect = React.useEffect;

  // ---- helpers -------------------------------------------------------------
  function decimalsOf(step) {
    var s = String(step == null ? 1 : step);
    var i = s.indexOf(".");
    return i < 0 ? 0 : s.length - i - 1;
  }
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  function snap(v, min, step) {
    var d = decimalsOf(step);
    return Number((Math.round((v - min) / step) * step + min).toFixed(d));
  }
  function cx() { return Array.prototype.filter.call(arguments, Boolean).join(" "); }
  // controlled when `value` is given, otherwise keeps its own state from `defaultValue`
  function useValue(value, defaultValue, onChange) {
    var st = useState(defaultValue);
    var controlled = value !== undefined;
    var current = controlled ? value : st[0];
    function set(v) {
      if (!controlled) st[1](v);
      if (onChange) onChange(v);
    }
    return [current, set];
  }
  // pointer drag that reports the pointer position relative to `ref`'s box
  function useDrag(ref, onMove) {
    return function onPointerDown(e) {
      if (e.button !== undefined && e.button !== 0) return;
      var el = ref.current;
      if (!el) return;
      e.preventDefault();
      el.setPointerCapture && el.setPointerCapture(e.pointerId);
      function report(ev) {
        var r = el.getBoundingClientRect();
        onMove(ev.clientX - r.left, ev.clientY - r.top, r, ev);
      }
      report(e);
      function move(ev) { report(ev); }
      function up() {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerup", up);
        el.removeEventListener("pointercancel", up);
      }
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerup", up);
      el.addEventListener("pointercancel", up);
    };
  }
  function stepKeys(e, value, min, max, step, set) {
    var big = (max - min) / 10;
    var map = { ArrowUp: step, ArrowRight: step, ArrowDown: -step, ArrowLeft: -step, PageUp: big, PageDown: -big };
    if (e.key in map) { e.preventDefault(); set(clamp(snap(value + map[e.key], min, step), min, max)); }
    else if (e.key === "Home") { e.preventDefault(); set(min); }
    else if (e.key === "End") { e.preventDefault(); set(max); }
  }

  // ---- icons (src/components/lib/icons.js) ---------------------------------
  var ICONS = {
    save: [["path", { d: "M8 2v8M4.5 6.5 8 10l3.5-3.5M2.5 11v2.5h11V11" }]],
    load: [["path", { d: "M1.5 4.5v8h11l2-6h-11l-2 6M1.5 4.5v-1.5h4l1.5 1.5h5.5v2" }]],
    keyboard: [["rect", { x: 1.5, y: 4, width: 13, height: 8, rx: 1.5 }], ["path", { d: "M4 6.5h1M7.5 6.5h1M11 6.5h1M5 9.5h6" }]]
  };
  function Icon(props) {
    var parts = ICONS[props.name] || [];
    return h("svg", {
      className: cx("btn-icon", props.className), width: 14, height: 14, viewBox: "0 0 16 16", fill: "none",
      stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true"
    }, parts.map(function (p, i) { return h(p[0], Object.assign({ key: i }, p[1])); }));
  }

  // ---- text and read-outs --------------------------------------------------
  function Label(props) {
    return h("span", { className: "widget-label", title: props.tooltip || undefined }, props.children);
  }

  function format(v, step, unit) {
    var s = String(Number(Number(v).toFixed(decimalsOf(step))));
    return unit ? s + " " + unit : s;
  }

  // editable read-out under a fader: commits on Enter or blur
  function ValueBox(props) {
    var text = format(props.value, props.step, props.unit);
    var st = useState(null), editing = st[0], setEditing = st[1];
    function commit() {
      if (editing === null) return;
      var v = parseFloat(editing);
      setEditing(null);
      if (!isNaN(v) && props.onChange) props.onChange(v);
    }
    return h("input", {
      className: "valuebox", "aria-label": props.ariaLabel || "value",
      size: Math.max(props.size || 2, text.length), value: editing === null ? text : editing,
      onChange: function (e) { setEditing(e.target.value); },
      onFocus: function () { setEditing(String(props.value)); },
      onBlur: commit,
      onKeyDown: function (e) { if (e.key === "Enter") { e.preventDefault(); commit(); e.target.blur(); } }
    });
  }

  function StatusBadge(props) {
    return h("span", { className: cx("status-badge", props.level || "muted"), title: props.title },
      h("span", { className: "status-dot" }), props.children);
  }

  // ---- panels ----------------------------------------------------------------
  function PanelSwitch(props) {
    var v = useValue(props.on, props.defaultOn || false, props.onChange);
    return h("button", {
      type: "button", className: cx("patswitch", v[0] && "on"), role: "switch", "aria-checked": !!v[0],
      onClick: function () { v[1](!v[0]); }
    }, h("span", { className: "patswitch-track" }, h("span", { className: "patswitch-thumb" })),
      h("span", { className: "patswitch-label" }, props.label));
  }

  function Panel(props) {
    var title = props.label;
    if (props.switchable) {
      title = h(PanelSwitch, { label: props.label, on: props.on, defaultOn: props.defaultOn, onChange: props.onSwitch });
    }
    var body = props.vertical
      ? h("div", { className: "patvertical" }, props.children)
      : h("div", { className: "patbody", style: { flexWrap: props.wrap ? "wrap" : "nowrap" } }, props.children);
    return h("div", { className: cx("patcol", props.className), style: props.style },
      props.label != null ? h("div", { className: "patlabel" }, title) : null, body);
  }

  function SubPanel(props) {
    return h(Panel, Object.assign({ vertical: true }, props));
  }

  function TabPanel(props) {
    var tabs = props.tabs || [];
    var st = useState(props.defaultIndex || 0), active = st[0], setActive = st[1];
    return h("div", { className: "tabpanel" },
      h("div", { className: "nav-tabs", role: "tablist" }, tabs.map(function (t, i) {
        return h("button", {
          key: i, type: "button", role: "tab", "aria-selected": i === active,
          className: cx("nav-link", i === active && "active"), onClick: function () { setActive(i); }
        }, t.label);
      })),
      h("div", { role: "tabpanel" }, tabs[active] ? tabs[active].content : null));
  }

  // ---- controls --------------------------------------------------------------
  function Fader(props) {
    var min = props.min != null ? props.min : 0, max = props.max != null ? props.max : 1;
    var step = props.step || 0.01, height = props.height || 200;
    var v = useValue(props.value, props.defaultValue != null ? props.defaultValue : min, props.onChange);
    var ref = useRef(null);
    var log = props.log && min > 0;
    function toPos(x) { return log ? Math.log(x / min) / Math.log(max / min) : (x - min) / (max - min); }
    function fromPos(p) { return log ? min * Math.exp(p * Math.log(max / min)) : min + p * (max - min); }
    function set(x) { v[1](clamp(log ? Number(x.toFixed(3)) : snap(x, min, step), min, max)); }
    var down = useDrag(ref, function (x, y, r) { set(fromPos(clamp(1 - y / r.height, 0, 1))); });
    var pos = clamp(toPos(v[0]), 0, 1);
    return h("div", { className: "cs-col colfader" },
      props.label != null ? h(Label, { tooltip: props.tooltip }, props.label) : null,
      h("div", {
        ref: ref, className: "fader", style: { height: height }, tabIndex: 0, role: "slider",
        "aria-label": props.label, "aria-valuemin": min, "aria-valuemax": max, "aria-valuenow": v[0],
        onPointerDown: down, onKeyDown: function (e) { stepKeys(e, v[0], min, max, step, set); }
      }, h("div", { className: "fader-rail" }), h("div", { className: "fader-handle", style: { top: (1 - pos) * 100 + "%" } })),
      h(ValueBox, { value: v[0], step: step, unit: props.unit, size: props.size, onChange: set, ariaLabel: props.label }));
  }

  function HFader(props) {
    var min = props.min != null ? props.min : 0, max = props.max != null ? props.max : 127, step = props.step || 1;
    var v = useValue(props.value, props.defaultValue != null ? props.defaultValue : min, props.onChange);
    var ref = useRef(null);
    function set(x) { v[1](clamp(snap(x, min, step), min, max)); }
    var down = useDrag(ref, function (x, y, r) { set(min + clamp(x / r.width, 0, 1) * (max - min)); });
    var pct = function (x) { return ((x - min) / (max - min)) * 100 + "%"; };
    var vals = props.vals || [];
    return h("div", {
      ref: ref, className: "hfader", tabIndex: 0, role: "slider", "aria-label": props.label,
      "aria-valuemin": min, "aria-valuemax": max, "aria-valuenow": v[0],
      onPointerDown: down, onKeyDown: function (e) { stepKeys(e, v[0], min, max, step, set); }
    }, h("div", { className: "hfader-rail" }),
      vals.map(function (t) {
        return h(React.Fragment, { key: t },
          h("div", { className: "hfader-tick", style: { left: pct(t) } }),
          h("div", { className: "hfader-label", style: { left: pct(t) } }, t));
      }),
      h("div", { className: "hfader-handle", style: { left: pct(v[0]) } }));
  }

  // 300° arc from 7 o'clock, stroke 35% of the radius (basicknob.js defaults)
  function arcPath(f0, f1, r, c) {
    function pt(a) { var t = a * Math.PI / 180; return [c + r * Math.sin(t), c - r * Math.cos(t)]; }
    var a0 = 210 + 300 * f0, a1 = 210 + 300 * f1, p0 = pt(a0), p1 = pt(a1);
    return "M" + p0[0].toFixed(2) + " " + p0[1].toFixed(2) + " A" + r + " " + r + " 0 " + (a1 - a0 > 180 ? 1 : 0) + " 1 " + p1[0].toFixed(2) + " " + p1[1].toFixed(2);
  }
  function Knob(props) {
    var min = props.min != null ? props.min : 0, max = props.max != null ? props.max : 1;
    var step = props.step || 0.01, size = props.size || 50;
    var v = useValue(props.value, props.defaultValue != null ? props.defaultValue : min, props.onChange);
    var ref = useRef(null), start = useRef(null);
    function set(x) { v[1](clamp(snap(x, min, step), min, max)); }
    // drag up/right to increase: 150px of travel covers the whole range
    var down = useDrag(ref, function (x, y, r, ev) {
      if (ev.type === "pointerdown") { start.current = { x: x, y: y, v: v[0] }; return; }
      var s = start.current; if (!s) return;
      set(s.v + ((x - s.x) - (y - s.y)) / 150 * (max - min));
    });
    var f = clamp((v[0] - min) / (max - min), 0, 1);
    var lw = size / 2 * 0.35, r = size / 2 - lw / 2, c = size / 2;
    var digits = props.digits || Math.max(String(min).length, String(max).length, 2);
    var text = String(Number(Number(v[0]).toFixed(decimalsOf(step))));
    return h("div", { className: "cs-col colknob" },
      props.label != null ? h(Label, { tooltip: props.tooltip }, props.label) : null,
      h("svg", {
        ref: ref, className: "knob", width: size, height: size, viewBox: "0 0 " + size + " " + size,
        tabIndex: 0, role: "slider", "aria-label": props.label, "aria-valuemin": min, "aria-valuemax": max, "aria-valuenow": v[0],
        onPointerDown: down, onKeyDown: function (e) { stepKeys(e, v[0], min, max, step, set); }
      },
        h("path", { className: "arc-bg", d: arcPath(0, 1, r, c), fill: "none", strokeWidth: lw }),
        f > 0.001 ? h("path", { className: "arc-value", d: arcPath(0, f, r, c), fill: "none", strokeWidth: lw }) : null,
        h("text", { x: c, y: c, textAnchor: "middle", dominantBaseline: "central", style: { fontSize: Math.min(20, Math.floor(size / digits * 0.8)) } }, text)),
      props.unit ? h("span", { className: "unit" }, props.unit) : null);
  }

  // number field with up/down buttons, arrow keys and press-and-hold repeat (lib/spinner.js)
  function Spinner(props) {
    var min = props.min != null ? props.min : -Infinity, max = props.max != null ? props.max : Infinity;
    var step = props.step || 1, d = decimalsOf(step);
    var v = useValue(props.value, props.defaultValue != null ? props.defaultValue : 0, props.onChange);
    var st = useState(null), typed = st[0], setTyped = st[1];
    var timer = useRef(null), valueRef = useRef(v[0]);
    valueRef.current = v[0];
    function commit(x) { setTyped(null); var c = clamp(Number(x.toFixed(d)), min, max); if (c !== valueRef.current) { valueRef.current = c; v[1](c); } }
    function stepBy(n) { commit((Number(valueRef.current) || 0) + n * step); }
    function stop() { clearTimeout(timer.current); clearInterval(timer.current); timer.current = null; }
    useEffect(function () { return stop; }, []);
    function hold(n) {
      return function (e) {
        if (e.button !== undefined && e.button !== 0) return;
        e.preventDefault(); stop(); stepBy(n);
        timer.current = setTimeout(function () { timer.current = setInterval(function () { stepBy(n); }, 50); }, 400);
      };
    }
    function commitTyped() { if (typed === null) return; var x = parseFloat(typed); if (isNaN(x)) setTyped(null); else commit(x); }
    var pending = typed !== null && parseFloat(typed) !== v[0];
    var shown = typed !== null ? typed : String(v[0]) + (props.unit ? " " + props.unit : "");
    var btn = function (n, glyph, label) {
      return h("button", { type: "button", tabIndex: -1, "aria-label": label, onPointerDown: hold(n), onPointerUp: stop, onPointerLeave: stop, onPointerCancel: stop }, glyph);
    };
    return h("span", { className: "spinner" },
      h("input", {
        value: shown, className: pending ? "spinner-pending" : undefined, title: pending ? "Press Enter to apply" : undefined,
        style: { width: (props.size || 4) + (props.unit ? props.unit.length + 1 : 0) + "ch" }, "aria-label": props.ariaLabel || "value",
        onChange: function (e) { setTyped(e.target.value.replace(/[^0-9.\-]/g, "")); },
        onBlur: commitTyped,
        onKeyDown: function (e) {
          if (e.key === "ArrowUp") { e.preventDefault(); stepBy(1); }
          else if (e.key === "ArrowDown") { e.preventDefault(); stepBy(-1); }
          else if (e.key === "Enter") { e.preventDefault(); commitTyped(); }
        }
      }),
      h("span", { className: "spinner-buttons" }, btn(1, "▲", "increment"), btn(-1, "▼", "decrement")));
  }

  function NumberInput(props) {
    return h("div", { className: "cs-col colnumberinput" },
      props.label != null ? h(Label, { tooltip: props.tooltip }, props.label) : null,
      h(Spinner, Object.assign({}, props, { label: undefined, ariaLabel: props.label })));
  }

  function Select(props) {
    var items = props.items || [];
    var v = useValue(props.value, props.defaultValue != null ? props.defaultValue : (items[0] && items[0].value), props.onChange);
    return h("div", { className: "cs-col colselect" },
      props.label != null ? h(Label, { tooltip: props.tooltip }, props.label) : null,
      h("div", { className: cx("selectbtngroup", props.vertical && "vertical"), role: "radiogroup", "aria-label": props.label },
        items.map(function (it) {
          var on = it.value === v[0];
          return h("button", { key: it.name, type: "button", role: "radio", "aria-checked": on, className: cx("btn", on && "checked"), onClick: function () { v[1](it.value); } }, it.name);
        })));
  }

  function XYPad(props) {
    var minX = props.minX != null ? props.minX : 0, maxX = props.maxX != null ? props.maxX : 1;
    var minY = props.minY != null ? props.minY : 0, maxY = props.maxY != null ? props.maxY : 1;
    var step = props.step || 0.01, size = props.size || 200;
    var v = useValue(props.value, props.defaultValue || { x: minX, y: minY }, props.onChange);
    var ref = useRef(null);
    var down = useDrag(ref, function (x, y, r) {
      var px = clamp(x / r.width, 0, 1), py = clamp(y / r.height, 0, 1);
      if (props.sum && px + py > 1) py = 1 - px;
      v[1]({ x: snap(minX + px * (maxX - minX), minX, step), y: snap(minY + py * (maxY - minY), minY, step) });
    });
    var fx = (v[0].x - minX) / (maxX - minX), fy = (v[0].y - minY) / (maxY - minY);
    var r3 = function (n) { return Math.round(n * 1000) / 1000; };
    return h("div", { className: "cs-col colxy", style: { alignItems: "stretch" } },
      h("div", { className: "xyvalues" }, h(Label, null, "x:"), h("span", { className: "xyvalue" }, r3(v[0].x)), h(Label, null, "y:"), h("span", { className: "xyvalue" }, r3(v[0].y))),
      h("div", { ref: ref, className: "xypad", style: { width: size + 2, height: size + 2 }, onPointerDown: down, role: "group", "aria-label": props.label || "xy pad" },
        h("div", { className: "xypad-handle", style: { left: fx * size + 1, top: fy * size + 1 } })));
  }

  function Button(props) {
    var rest = Object.assign({}, props);
    delete rest.variant; delete rest.icon; delete rest.children; delete rest.className;
    return h("button", Object.assign({ type: "button" }, rest, { className: cx("btn", "btn-" + (props.variant || "secondary"), props.className) }),
      props.icon ? h(Icon, { name: props.icon }) : null, props.children);
  }

  // react-select look-alike: control, separator, chevron, menu
  function Dropdown(props) {
    var options = props.options || [];
    var v = useValue(props.value, props.defaultValue != null ? props.defaultValue : (options[0] && options[0].value), props.onChange);
    var st = useState(false), open = st[0], setOpen = st[1];
    var fs = useState(-1), focus = fs[0], setFocus = fs[1];
    var ref = useRef(null);
    useEffect(function () {
      if (!open) return;
      function away(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
      document.addEventListener("pointerdown", away);
      return function () { document.removeEventListener("pointerdown", away); };
    }, [open]);
    var current = options.filter(function (o) { return o.value === v[0]; })[0];
    function pick(o) { v[1](o.value); setOpen(false); }
    return h("div", { ref: ref, className: "cs-select", style: { minWidth: props.minWidth || "10rem" } },
      h("button", {
        type: "button", className: cx("cs-select__control", open && "cs-select__control--is-focused"), "aria-haspopup": "listbox", "aria-expanded": open,
        onClick: function () { setOpen(!open); setFocus(options.indexOf(current)); },
        onKeyDown: function (e) {
          if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setFocus(Math.min(options.length - 1, focus + 1)); }
          else if (e.key === "ArrowUp") { e.preventDefault(); setFocus(Math.max(0, focus - 1)); }
          else if (e.key === "Enter" && open && options[focus]) { e.preventDefault(); pick(options[focus]); }
          else if (e.key === "Escape") setOpen(false);
        }
      },
        h("span", { className: "cs-select__value" }, current ? current.label : ""),
        h("span", { className: "cs-select__sep" }),
        h("span", { className: "cs-select__indicator" },
          h("svg", { width: 20, height: 20, viewBox: "0 0 20 20", "aria-hidden": "true" },
            h("path", { d: "M4.5 7.5 10 13l5.5-5.5", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" })))),
      open ? h("div", { className: "cs-select__menu", role: "listbox" }, options.map(function (o, i) {
        return h("div", {
          key: o.value, role: "option", "aria-selected": o.value === v[0],
          className: cx("cs-select__option", o.value === v[0] ? "cs-select__option--is-selected" : (i === focus && "cs-select__option--is-focused")),
          onPointerEnter: function () { setFocus(i); }, onClick: function () { pick(o); }
        }, o.label);
      })) : null);
  }

  window.CsoundWebUI = Object.assign(window.CsoundWebUI || {}, {
    Panel: Panel, SubPanel: SubPanel, PanelSwitch: PanelSwitch, TabPanel: TabPanel,
    Label: Label, ValueBox: ValueBox, StatusBadge: StatusBadge,
    Fader: Fader, HFader: HFader, Knob: Knob, Spinner: Spinner, NumberInput: NumberInput,
    Select: Select, XYPad: XYPad, Button: Button, Dropdown: Dropdown, Icon: Icon
  });
})();
