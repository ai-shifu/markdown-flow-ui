import * as We from "react";
import Wr, { useState as Ge, useRef as Pe, useCallback as tt, useEffect as Qe, forwardRef as $o, createElement as Sr } from "react";
function Vr(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var wn = { exports: {} }, Qt = {};
/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var vi;
function Js() {
  if (vi) return Qt;
  vi = 1;
  var e = Symbol.for("react.transitional.element"), t = Symbol.for("react.fragment");
  function n(r, i, a) {
    var o = null;
    if (a !== void 0 && (o = "" + a), i.key !== void 0 && (o = "" + i.key), "key" in i) {
      a = {};
      for (var s in i)
        s !== "key" && (a[s] = i[s]);
    } else a = i;
    return i = a.ref, {
      $$typeof: e,
      type: r,
      key: o,
      ref: i !== void 0 ? i : null,
      props: a
    };
  }
  return Qt.Fragment = t, Qt.jsx = n, Qt.jsxs = n, Qt;
}
var Jt = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Ti;
function el() {
  return Ti || (Ti = 1, process.env.NODE_ENV !== "production" && function() {
    function e(g) {
      if (g == null) return null;
      if (typeof g == "function")
        return g.$$typeof === x ? null : g.displayName || g.name || null;
      if (typeof g == "string") return g;
      switch (g) {
        case h:
          return "Fragment";
        case y:
          return "Profiler";
        case k:
          return "StrictMode";
        case A:
          return "Suspense";
        case _:
          return "SuspenseList";
        case R:
          return "Activity";
      }
      if (typeof g == "object")
        switch (typeof g.tag == "number" && console.error(
          "Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."
        ), g.$$typeof) {
          case m:
            return "Portal";
          case w:
            return (g.displayName || "Context") + ".Provider";
          case S:
            return (g._context.displayName || "Context") + ".Consumer";
          case N:
            var G = g.render;
            return g = g.displayName, g || (g = G.displayName || G.name || "", g = g !== "" ? "ForwardRef(" + g + ")" : "ForwardRef"), g;
          case L:
            return G = g.displayName || null, G !== null ? G : e(g.type) || "Memo";
          case v:
            G = g._payload, g = g._init;
            try {
              return e(g(G));
            } catch {
            }
        }
      return null;
    }
    function t(g) {
      return "" + g;
    }
    function n(g) {
      try {
        t(g);
        var G = !1;
      } catch {
        G = !0;
      }
      if (G) {
        G = console;
        var j = G.error, b = typeof Symbol == "function" && Symbol.toStringTag && g[Symbol.toStringTag] || g.constructor.name || "Object";
        return j.call(
          G,
          "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.",
          b
        ), t(g);
      }
    }
    function r(g) {
      if (g === h) return "<>";
      if (typeof g == "object" && g !== null && g.$$typeof === v)
        return "<...>";
      try {
        var G = e(g);
        return G ? "<" + G + ">" : "<...>";
      } catch {
        return "<...>";
      }
    }
    function i() {
      var g = O.A;
      return g === null ? null : g.getOwner();
    }
    function a() {
      return Error("react-stack-top-frame");
    }
    function o(g) {
      if (F.call(g, "key")) {
        var G = Object.getOwnPropertyDescriptor(g, "key").get;
        if (G && G.isReactWarning) return !1;
      }
      return g.key !== void 0;
    }
    function s(g, G) {
      function j() {
        $ || ($ = !0, console.error(
          "%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)",
          G
        ));
      }
      j.isReactWarning = !0, Object.defineProperty(g, "key", {
        get: j,
        configurable: !0
      });
    }
    function l() {
      var g = e(this.type);
      return Q[g] || (Q[g] = !0, console.error(
        "Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."
      )), g = this.props.ref, g !== void 0 ? g : null;
    }
    function c(g, G, j, b, le, _e, be, me) {
      return j = _e.ref, g = {
        $$typeof: p,
        type: g,
        key: G,
        props: _e,
        _owner: le
      }, (j !== void 0 ? j : null) !== null ? Object.defineProperty(g, "ref", {
        enumerable: !1,
        get: l
      }) : Object.defineProperty(g, "ref", { enumerable: !1, value: null }), g._store = {}, Object.defineProperty(g._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: 0
      }), Object.defineProperty(g, "_debugInfo", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: null
      }), Object.defineProperty(g, "_debugStack", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: be
      }), Object.defineProperty(g, "_debugTask", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: me
      }), Object.freeze && (Object.freeze(g.props), Object.freeze(g)), g;
    }
    function u(g, G, j, b, le, _e, be, me) {
      var ge = G.children;
      if (ge !== void 0)
        if (b)
          if (U(ge)) {
            for (b = 0; b < ge.length; b++)
              d(ge[b]);
            Object.freeze && Object.freeze(ge);
          } else
            console.error(
              "React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead."
            );
        else d(ge);
      if (F.call(G, "key")) {
        ge = e(g);
        var Ne = Object.keys(G).filter(function(Ke) {
          return Ke !== "key";
        });
        b = 0 < Ne.length ? "{key: someKey, " + Ne.join(": ..., ") + ": ...}" : "{key: someKey}", fe[ge + b] || (Ne = 0 < Ne.length ? "{" + Ne.join(": ..., ") + ": ...}" : "{}", console.error(
          `A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`,
          b,
          ge,
          Ne,
          ge
        ), fe[ge + b] = !0);
      }
      if (ge = null, j !== void 0 && (n(j), ge = "" + j), o(G) && (n(G.key), ge = "" + G.key), "key" in G) {
        j = {};
        for (var Te in G)
          Te !== "key" && (j[Te] = G[Te]);
      } else j = G;
      return ge && s(
        j,
        typeof g == "function" ? g.displayName || g.name || "Unknown" : g
      ), c(
        g,
        ge,
        _e,
        le,
        i(),
        j,
        be,
        me
      );
    }
    function d(g) {
      typeof g == "object" && g !== null && g.$$typeof === p && g._store && (g._store.validated = 1);
    }
    var f = Wr, p = Symbol.for("react.transitional.element"), m = Symbol.for("react.portal"), h = Symbol.for("react.fragment"), k = Symbol.for("react.strict_mode"), y = Symbol.for("react.profiler"), S = Symbol.for("react.consumer"), w = Symbol.for("react.context"), N = Symbol.for("react.forward_ref"), A = Symbol.for("react.suspense"), _ = Symbol.for("react.suspense_list"), L = Symbol.for("react.memo"), v = Symbol.for("react.lazy"), R = Symbol.for("react.activity"), x = Symbol.for("react.client.reference"), O = f.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, F = Object.prototype.hasOwnProperty, U = Array.isArray, D = console.createTask ? console.createTask : function() {
      return null;
    };
    f = {
      react_stack_bottom_frame: function(g) {
        return g();
      }
    };
    var $, Q = {}, se = f.react_stack_bottom_frame.bind(
      f,
      a
    )(), I = D(r(a)), fe = {};
    Jt.Fragment = h, Jt.jsx = function(g, G, j, b, le) {
      var _e = 1e4 > O.recentlyCreatedOwnerStacks++;
      return u(
        g,
        G,
        j,
        !1,
        b,
        le,
        _e ? Error("react-stack-top-frame") : se,
        _e ? D(r(g)) : I
      );
    }, Jt.jsxs = function(g, G, j, b, le) {
      var _e = 1e4 > O.recentlyCreatedOwnerStacks++;
      return u(
        g,
        G,
        j,
        !0,
        b,
        le,
        _e ? Error("react-stack-top-frame") : se,
        _e ? D(r(g)) : I
      );
    };
  }()), Jt;
}
var Ni;
function tl() {
  return Ni || (Ni = 1, process.env.NODE_ENV === "production" ? wn.exports = Js() : wn.exports = el()), wn.exports;
}
var ae = tl();
async function nl(e, t) {
  const n = e.getReader();
  let r;
  for (; !(r = await n.read()).done; )
    t(r.value);
}
function rl(e) {
  let t, n, r, i = !1;
  return function(o) {
    t === void 0 ? (t = o, n = 0, r = -1) : t = ol(t, o);
    const s = t.length;
    let l = 0;
    for (; n < s; ) {
      i && (t[n] === 10 && (l = ++n), i = !1);
      let c = -1;
      for (; n < s && c === -1; ++n)
        switch (t[n]) {
          case 58:
            r === -1 && (r = n - l);
            break;
          case 13:
            i = !0;
          case 10:
            c = n;
            break;
        }
      if (c === -1)
        break;
      e(t.subarray(l, c), r), l = n, r = -1;
    }
    l === s ? t = void 0 : l !== 0 && (t = t.subarray(l), n -= l);
  };
}
function il(e, t, n) {
  let r = Ai();
  const i = new TextDecoder();
  return function(o, s) {
    if (o.length === 0)
      n?.(r), r = Ai();
    else if (s > 0) {
      const l = i.decode(o.subarray(0, s)), c = s + (o[s + 1] === 32 ? 2 : 1), u = i.decode(o.subarray(c));
      switch (l) {
        case "data":
          r.data = r.data ? r.data + `
` + u : u;
          break;
        case "event":
          r.event = u;
          break;
        case "id":
          e(r.id = u);
          break;
        case "retry":
          const d = parseInt(u, 10);
          isNaN(d) || t(r.retry = d);
          break;
      }
    }
  };
}
function ol(e, t) {
  const n = new Uint8Array(e.length + t.length);
  return n.set(e), n.set(t, e.length), n;
}
function Ai() {
  return {
    data: "",
    event: "",
    id: "",
    retry: void 0
  };
}
var al = function(e, t) {
  var n = {};
  for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var i = 0, r = Object.getOwnPropertySymbols(e); i < r.length; i++)
      t.indexOf(r[i]) < 0 && Object.prototype.propertyIsEnumerable.call(e, r[i]) && (n[r[i]] = e[r[i]]);
  return n;
};
const vr = "text/event-stream", sl = 1e3, Ci = "last-event-id";
function ll(e, t) {
  var { signal: n, headers: r, onopen: i, onmessage: a, onclose: o, onerror: s, openWhenHidden: l, fetch: c } = t, u = al(t, ["signal", "headers", "onopen", "onmessage", "onclose", "onerror", "openWhenHidden", "fetch"]);
  return new Promise((d, f) => {
    const p = Object.assign({}, r);
    p.accept || (p.accept = vr);
    let m;
    function h() {
      m.abort(), document.hidden || A();
    }
    l || document.addEventListener("visibilitychange", h);
    let k = sl, y = 0;
    function S() {
      document.removeEventListener("visibilitychange", h), window.clearTimeout(y), m.abort();
    }
    n?.addEventListener("abort", () => {
      S(), d();
    });
    const w = c ?? window.fetch, N = i ?? cl;
    async function A() {
      var _;
      m = new AbortController();
      try {
        const L = await w(e, Object.assign(Object.assign({}, u), { headers: p, signal: m.signal }));
        await N(L), await nl(L.body, rl(il((v) => {
          v ? p[Ci] = v : delete p[Ci];
        }, (v) => {
          k = v;
        }, a))), o?.(), S(), d();
      } catch (L) {
        if (!m.signal.aborted)
          try {
            const v = (_ = s?.(L)) !== null && _ !== void 0 ? _ : k;
            window.clearTimeout(y), y = window.setTimeout(A, v);
          } catch (v) {
            S(), f(v);
          }
      }
    }
    A();
  });
}
function cl(e) {
  const t = e.headers.get("content-type");
  if (!t?.startsWith(vr))
    throw new Error(`Expected content-type to be ${vr}, Actual: ${t}`);
}
const ul = "[DONE]", dl = (e, t = {}) => {
  const [n, r] = Ge(null), [i, a] = Ge(!1), [o, s] = Ge(null), [l, c] = Ge(null), u = Pe(null), d = Pe(!1), f = Pe(!0), p = Pe(!1), m = Pe(-1), h = Pe(""), { autoConnect: k = !0 } = t, y = tt(async () => {
    if (!(d.current || !f.current || p.current))
      try {
        a(!0), s(null), p.current = !1, d.current = !0;
        const w = ++m.current;
        c(w), h.current = "";
        const N = new AbortController();
        u.current = N, await ll(e, {
          ...t,
          method: "POST",
          headers: {
            Accept: "text/event-stream",
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            ...Object.entries(t.headers || {}).reduce(
              (A, [_, L]) => (A[_] = String(L), A),
              {}
            )
          },
          signal: N.signal,
          openWhenHidden: !0,
          onopen: async (A) => {
            f.current && !p.current && (a(!1), s(null));
          },
          onmessage: (A) => {
            if (f.current && !p.current) {
              if (A.data.toUpperCase() === ul) {
                t.onFinish?.(h.current, w), S();
                return;
              }
              try {
                let _ = A.data;
                h.current += _, r(h.current);
              } catch {
              }
            }
          },
          onclose: () => {
            f.current && !p.current && a(!1);
          },
          onerror: (A) => {
            f.current && !p.current && (s(A), a(!1));
          }
        });
      } catch (w) {
        f.current && !p.current && (s(w), a(!1));
      }
  }, [e, JSON.stringify(t)]), S = tt(() => {
    p.current = !0, u.current && (u.current.abort(), u.current = null), d.current = !1, f.current && a(!1);
  }, []);
  return Qe(() => {
    if (f.current = !0, p.current = !1, d.current = !1, k) {
      const w = setTimeout(() => {
        d.current || y();
      }, 100);
      return () => {
        f.current = !1, p.current = !0, clearTimeout(w), S();
      };
    } else
      return () => {
        f.current = !1, p.current = !0, S();
      };
  }, [y, S, k]), Qe(() => {
    if (d.current) {
      S(), d.current = !1, p.current = !1, r(null), s(null), a(!0), h.current = "";
      const w = setTimeout(() => {
        d.current || y();
      }, 100);
      return () => {
        clearTimeout(w);
      };
    }
  }, [e, JSON.stringify(t), y, S]), {
    data: n,
    isLoading: i,
    error: o,
    sseIndex: l,
    connect: y,
    close: S
  };
}, pl = (e) => {
  const [t, n] = Ge(null), [r, i] = Ge(!0), [a, o] = Ge(null);
  return Qe(() => {
    e && (async () => {
      try {
        i(!0);
        const l = await fetch("https://play.dev.pillowai.cn/api/v1/playground/markdownflow_info", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ content: e }),
          // Next.js fetch 的缓存选项
          cache: "no-store"
          // 或者使用 next: { revalidate: 0 } 来禁用缓存
        });
        if (!l.ok)
          throw new Error(`HTTP error! status: ${l.status}`);
        const c = await l.json();
        c.code === 200 ? n(c.data) : o(c.message || "请求失败");
      } catch (l) {
        o(l.message || "网络错误");
      } finally {
        i(!1);
      }
    })();
  }, [e]), { data: t, loading: r, error: a };
};
function fl(e, t) {
  const n = {};
  return (e[e.length - 1] === "" ? [...e, ""] : e).join(
    (n.padRight ? " " : "") + "," + (n.padLeft === !1 ? "" : " ")
  ).trim();
}
const gl = /^[$_\p{ID_Start}][$_\u{200C}\u{200D}\p{ID_Continue}]*$/u, ml = /^[$_\p{ID_Start}][-$_\u{200C}\u{200D}\p{ID_Continue}]*$/u, hl = {};
function Ri(e, t) {
  return (hl.jsx ? ml : gl).test(e);
}
const bl = /[ \t\n\f\r]/g;
function yl(e) {
  return typeof e == "object" ? e.type === "text" ? Oi(e.value) : !1 : Oi(e);
}
function Oi(e) {
  return e.replace(bl, "") === "";
}
class pn {
  /**
   * @param {SchemaType['property']} property
   *   Property.
   * @param {SchemaType['normal']} normal
   *   Normal.
   * @param {Space | undefined} [space]
   *   Space.
   * @returns
   *   Schema.
   */
  constructor(t, n, r) {
    this.normal = n, this.property = t, r && (this.space = r);
  }
}
pn.prototype.normal = {};
pn.prototype.property = {};
pn.prototype.space = void 0;
function Ho(e, t) {
  const n = {}, r = {};
  for (const i of e)
    Object.assign(n, i.property), Object.assign(r, i.normal);
  return new pn(n, r, t);
}
function Tr(e) {
  return e.toLowerCase();
}
class Ve {
  /**
   * @param {string} property
   *   Property.
   * @param {string} attribute
   *   Attribute.
   * @returns
   *   Info.
   */
  constructor(t, n) {
    this.attribute = n, this.property = t;
  }
}
Ve.prototype.attribute = "";
Ve.prototype.booleanish = !1;
Ve.prototype.boolean = !1;
Ve.prototype.commaOrSpaceSeparated = !1;
Ve.prototype.commaSeparated = !1;
Ve.prototype.defined = !1;
Ve.prototype.mustUseProperty = !1;
Ve.prototype.number = !1;
Ve.prototype.overloadedBoolean = !1;
Ve.prototype.property = "";
Ve.prototype.spaceSeparated = !1;
Ve.prototype.space = void 0;
let El = 0;
const re = Rt(), Oe = Rt(), Nr = Rt(), M = Rt(), ve = Rt(), $t = Rt(), Xe = Rt();
function Rt() {
  return 2 ** ++El;
}
const Ar = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  boolean: re,
  booleanish: Oe,
  commaOrSpaceSeparated: Xe,
  commaSeparated: $t,
  number: M,
  overloadedBoolean: Nr,
  spaceSeparated: ve
}, Symbol.toStringTag, { value: "Module" })), nr = (
  /** @type {ReadonlyArray<keyof typeof types>} */
  Object.keys(Ar)
);
class Yr extends Ve {
  /**
   * @constructor
   * @param {string} property
   *   Property.
   * @param {string} attribute
   *   Attribute.
   * @param {number | null | undefined} [mask]
   *   Mask.
   * @param {Space | undefined} [space]
   *   Space.
   * @returns
   *   Info.
   */
  constructor(t, n, r, i) {
    let a = -1;
    if (super(t, n), Ii(this, "space", i), typeof r == "number")
      for (; ++a < nr.length; ) {
        const o = nr[a];
        Ii(this, nr[a], (r & Ar[o]) === Ar[o]);
      }
  }
}
Yr.prototype.defined = !0;
function Ii(e, t, n) {
  n && (e[t] = n);
}
function Gt(e) {
  const t = {}, n = {};
  for (const [r, i] of Object.entries(e.properties)) {
    const a = new Yr(
      r,
      e.transform(e.attributes || {}, r),
      i,
      e.space
    );
    e.mustUseProperty && e.mustUseProperty.includes(r) && (a.mustUseProperty = !0), t[r] = a, n[Tr(r)] = r, n[Tr(a.attribute)] = r;
  }
  return new pn(t, n, e.space);
}
const Go = Gt({
  properties: {
    ariaActiveDescendant: null,
    ariaAtomic: Oe,
    ariaAutoComplete: null,
    ariaBusy: Oe,
    ariaChecked: Oe,
    ariaColCount: M,
    ariaColIndex: M,
    ariaColSpan: M,
    ariaControls: ve,
    ariaCurrent: null,
    ariaDescribedBy: ve,
    ariaDetails: null,
    ariaDisabled: Oe,
    ariaDropEffect: ve,
    ariaErrorMessage: null,
    ariaExpanded: Oe,
    ariaFlowTo: ve,
    ariaGrabbed: Oe,
    ariaHasPopup: null,
    ariaHidden: Oe,
    ariaInvalid: null,
    ariaKeyShortcuts: null,
    ariaLabel: null,
    ariaLabelledBy: ve,
    ariaLevel: M,
    ariaLive: null,
    ariaModal: Oe,
    ariaMultiLine: Oe,
    ariaMultiSelectable: Oe,
    ariaOrientation: null,
    ariaOwns: ve,
    ariaPlaceholder: null,
    ariaPosInSet: M,
    ariaPressed: Oe,
    ariaReadOnly: Oe,
    ariaRelevant: null,
    ariaRequired: Oe,
    ariaRoleDescription: ve,
    ariaRowCount: M,
    ariaRowIndex: M,
    ariaRowSpan: M,
    ariaSelected: Oe,
    ariaSetSize: M,
    ariaSort: null,
    ariaValueMax: M,
    ariaValueMin: M,
    ariaValueNow: M,
    ariaValueText: null,
    role: null
  },
  transform(e, t) {
    return t === "role" ? t : "aria-" + t.slice(4).toLowerCase();
  }
});
function Ko(e, t) {
  return t in e ? e[t] : t;
}
function qo(e, t) {
  return Ko(e, t.toLowerCase());
}
const _l = Gt({
  attributes: {
    acceptcharset: "accept-charset",
    classname: "class",
    htmlfor: "for",
    httpequiv: "http-equiv"
  },
  mustUseProperty: ["checked", "multiple", "muted", "selected"],
  properties: {
    // Standard Properties.
    abbr: null,
    accept: $t,
    acceptCharset: ve,
    accessKey: ve,
    action: null,
    allow: null,
    allowFullScreen: re,
    allowPaymentRequest: re,
    allowUserMedia: re,
    alt: null,
    as: null,
    async: re,
    autoCapitalize: null,
    autoComplete: ve,
    autoFocus: re,
    autoPlay: re,
    blocking: ve,
    capture: null,
    charSet: null,
    checked: re,
    cite: null,
    className: ve,
    cols: M,
    colSpan: null,
    content: null,
    contentEditable: Oe,
    controls: re,
    controlsList: ve,
    coords: M | $t,
    crossOrigin: null,
    data: null,
    dateTime: null,
    decoding: null,
    default: re,
    defer: re,
    dir: null,
    dirName: null,
    disabled: re,
    download: Nr,
    draggable: Oe,
    encType: null,
    enterKeyHint: null,
    fetchPriority: null,
    form: null,
    formAction: null,
    formEncType: null,
    formMethod: null,
    formNoValidate: re,
    formTarget: null,
    headers: ve,
    height: M,
    hidden: Nr,
    high: M,
    href: null,
    hrefLang: null,
    htmlFor: ve,
    httpEquiv: ve,
    id: null,
    imageSizes: null,
    imageSrcSet: null,
    inert: re,
    inputMode: null,
    integrity: null,
    is: null,
    isMap: re,
    itemId: null,
    itemProp: ve,
    itemRef: ve,
    itemScope: re,
    itemType: ve,
    kind: null,
    label: null,
    lang: null,
    language: null,
    list: null,
    loading: null,
    loop: re,
    low: M,
    manifest: null,
    max: null,
    maxLength: M,
    media: null,
    method: null,
    min: null,
    minLength: M,
    multiple: re,
    muted: re,
    name: null,
    nonce: null,
    noModule: re,
    noValidate: re,
    onAbort: null,
    onAfterPrint: null,
    onAuxClick: null,
    onBeforeMatch: null,
    onBeforePrint: null,
    onBeforeToggle: null,
    onBeforeUnload: null,
    onBlur: null,
    onCancel: null,
    onCanPlay: null,
    onCanPlayThrough: null,
    onChange: null,
    onClick: null,
    onClose: null,
    onContextLost: null,
    onContextMenu: null,
    onContextRestored: null,
    onCopy: null,
    onCueChange: null,
    onCut: null,
    onDblClick: null,
    onDrag: null,
    onDragEnd: null,
    onDragEnter: null,
    onDragExit: null,
    onDragLeave: null,
    onDragOver: null,
    onDragStart: null,
    onDrop: null,
    onDurationChange: null,
    onEmptied: null,
    onEnded: null,
    onError: null,
    onFocus: null,
    onFormData: null,
    onHashChange: null,
    onInput: null,
    onInvalid: null,
    onKeyDown: null,
    onKeyPress: null,
    onKeyUp: null,
    onLanguageChange: null,
    onLoad: null,
    onLoadedData: null,
    onLoadedMetadata: null,
    onLoadEnd: null,
    onLoadStart: null,
    onMessage: null,
    onMessageError: null,
    onMouseDown: null,
    onMouseEnter: null,
    onMouseLeave: null,
    onMouseMove: null,
    onMouseOut: null,
    onMouseOver: null,
    onMouseUp: null,
    onOffline: null,
    onOnline: null,
    onPageHide: null,
    onPageShow: null,
    onPaste: null,
    onPause: null,
    onPlay: null,
    onPlaying: null,
    onPopState: null,
    onProgress: null,
    onRateChange: null,
    onRejectionHandled: null,
    onReset: null,
    onResize: null,
    onScroll: null,
    onScrollEnd: null,
    onSecurityPolicyViolation: null,
    onSeeked: null,
    onSeeking: null,
    onSelect: null,
    onSlotChange: null,
    onStalled: null,
    onStorage: null,
    onSubmit: null,
    onSuspend: null,
    onTimeUpdate: null,
    onToggle: null,
    onUnhandledRejection: null,
    onUnload: null,
    onVolumeChange: null,
    onWaiting: null,
    onWheel: null,
    open: re,
    optimum: M,
    pattern: null,
    ping: ve,
    placeholder: null,
    playsInline: re,
    popover: null,
    popoverTarget: null,
    popoverTargetAction: null,
    poster: null,
    preload: null,
    readOnly: re,
    referrerPolicy: null,
    rel: ve,
    required: re,
    reversed: re,
    rows: M,
    rowSpan: M,
    sandbox: ve,
    scope: null,
    scoped: re,
    seamless: re,
    selected: re,
    shadowRootClonable: re,
    shadowRootDelegatesFocus: re,
    shadowRootMode: null,
    shape: null,
    size: M,
    sizes: null,
    slot: null,
    span: M,
    spellCheck: Oe,
    src: null,
    srcDoc: null,
    srcLang: null,
    srcSet: null,
    start: M,
    step: null,
    style: null,
    tabIndex: M,
    target: null,
    title: null,
    translate: null,
    type: null,
    typeMustMatch: re,
    useMap: null,
    value: Oe,
    width: M,
    wrap: null,
    writingSuggestions: null,
    // Legacy.
    // See: https://html.spec.whatwg.org/#other-elements,-attributes-and-apis
    align: null,
    // Several. Use CSS `text-align` instead,
    aLink: null,
    // `<body>`. Use CSS `a:active {color}` instead
    archive: ve,
    // `<object>`. List of URIs to archives
    axis: null,
    // `<td>` and `<th>`. Use `scope` on `<th>`
    background: null,
    // `<body>`. Use CSS `background-image` instead
    bgColor: null,
    // `<body>` and table elements. Use CSS `background-color` instead
    border: M,
    // `<table>`. Use CSS `border-width` instead,
    borderColor: null,
    // `<table>`. Use CSS `border-color` instead,
    bottomMargin: M,
    // `<body>`
    cellPadding: null,
    // `<table>`
    cellSpacing: null,
    // `<table>`
    char: null,
    // Several table elements. When `align=char`, sets the character to align on
    charOff: null,
    // Several table elements. When `char`, offsets the alignment
    classId: null,
    // `<object>`
    clear: null,
    // `<br>`. Use CSS `clear` instead
    code: null,
    // `<object>`
    codeBase: null,
    // `<object>`
    codeType: null,
    // `<object>`
    color: null,
    // `<font>` and `<hr>`. Use CSS instead
    compact: re,
    // Lists. Use CSS to reduce space between items instead
    declare: re,
    // `<object>`
    event: null,
    // `<script>`
    face: null,
    // `<font>`. Use CSS instead
    frame: null,
    // `<table>`
    frameBorder: null,
    // `<iframe>`. Use CSS `border` instead
    hSpace: M,
    // `<img>` and `<object>`
    leftMargin: M,
    // `<body>`
    link: null,
    // `<body>`. Use CSS `a:link {color: *}` instead
    longDesc: null,
    // `<frame>`, `<iframe>`, and `<img>`. Use an `<a>`
    lowSrc: null,
    // `<img>`. Use a `<picture>`
    marginHeight: M,
    // `<body>`
    marginWidth: M,
    // `<body>`
    noResize: re,
    // `<frame>`
    noHref: re,
    // `<area>`. Use no href instead of an explicit `nohref`
    noShade: re,
    // `<hr>`. Use background-color and height instead of borders
    noWrap: re,
    // `<td>` and `<th>`
    object: null,
    // `<applet>`
    profile: null,
    // `<head>`
    prompt: null,
    // `<isindex>`
    rev: null,
    // `<link>`
    rightMargin: M,
    // `<body>`
    rules: null,
    // `<table>`
    scheme: null,
    // `<meta>`
    scrolling: Oe,
    // `<frame>`. Use overflow in the child context
    standby: null,
    // `<object>`
    summary: null,
    // `<table>`
    text: null,
    // `<body>`. Use CSS `color` instead
    topMargin: M,
    // `<body>`
    valueType: null,
    // `<param>`
    version: null,
    // `<html>`. Use a doctype.
    vAlign: null,
    // Several. Use CSS `vertical-align` instead
    vLink: null,
    // `<body>`. Use CSS `a:visited {color}` instead
    vSpace: M,
    // `<img>` and `<object>`
    // Non-standard Properties.
    allowTransparency: null,
    autoCorrect: null,
    autoSave: null,
    disablePictureInPicture: re,
    disableRemotePlayback: re,
    prefix: null,
    property: null,
    results: M,
    security: null,
    unselectable: null
  },
  space: "html",
  transform: qo
}), kl = Gt({
  attributes: {
    accentHeight: "accent-height",
    alignmentBaseline: "alignment-baseline",
    arabicForm: "arabic-form",
    baselineShift: "baseline-shift",
    capHeight: "cap-height",
    className: "class",
    clipPath: "clip-path",
    clipRule: "clip-rule",
    colorInterpolation: "color-interpolation",
    colorInterpolationFilters: "color-interpolation-filters",
    colorProfile: "color-profile",
    colorRendering: "color-rendering",
    crossOrigin: "crossorigin",
    dataType: "datatype",
    dominantBaseline: "dominant-baseline",
    enableBackground: "enable-background",
    fillOpacity: "fill-opacity",
    fillRule: "fill-rule",
    floodColor: "flood-color",
    floodOpacity: "flood-opacity",
    fontFamily: "font-family",
    fontSize: "font-size",
    fontSizeAdjust: "font-size-adjust",
    fontStretch: "font-stretch",
    fontStyle: "font-style",
    fontVariant: "font-variant",
    fontWeight: "font-weight",
    glyphName: "glyph-name",
    glyphOrientationHorizontal: "glyph-orientation-horizontal",
    glyphOrientationVertical: "glyph-orientation-vertical",
    hrefLang: "hreflang",
    horizAdvX: "horiz-adv-x",
    horizOriginX: "horiz-origin-x",
    horizOriginY: "horiz-origin-y",
    imageRendering: "image-rendering",
    letterSpacing: "letter-spacing",
    lightingColor: "lighting-color",
    markerEnd: "marker-end",
    markerMid: "marker-mid",
    markerStart: "marker-start",
    navDown: "nav-down",
    navDownLeft: "nav-down-left",
    navDownRight: "nav-down-right",
    navLeft: "nav-left",
    navNext: "nav-next",
    navPrev: "nav-prev",
    navRight: "nav-right",
    navUp: "nav-up",
    navUpLeft: "nav-up-left",
    navUpRight: "nav-up-right",
    onAbort: "onabort",
    onActivate: "onactivate",
    onAfterPrint: "onafterprint",
    onBeforePrint: "onbeforeprint",
    onBegin: "onbegin",
    onCancel: "oncancel",
    onCanPlay: "oncanplay",
    onCanPlayThrough: "oncanplaythrough",
    onChange: "onchange",
    onClick: "onclick",
    onClose: "onclose",
    onCopy: "oncopy",
    onCueChange: "oncuechange",
    onCut: "oncut",
    onDblClick: "ondblclick",
    onDrag: "ondrag",
    onDragEnd: "ondragend",
    onDragEnter: "ondragenter",
    onDragExit: "ondragexit",
    onDragLeave: "ondragleave",
    onDragOver: "ondragover",
    onDragStart: "ondragstart",
    onDrop: "ondrop",
    onDurationChange: "ondurationchange",
    onEmptied: "onemptied",
    onEnd: "onend",
    onEnded: "onended",
    onError: "onerror",
    onFocus: "onfocus",
    onFocusIn: "onfocusin",
    onFocusOut: "onfocusout",
    onHashChange: "onhashchange",
    onInput: "oninput",
    onInvalid: "oninvalid",
    onKeyDown: "onkeydown",
    onKeyPress: "onkeypress",
    onKeyUp: "onkeyup",
    onLoad: "onload",
    onLoadedData: "onloadeddata",
    onLoadedMetadata: "onloadedmetadata",
    onLoadStart: "onloadstart",
    onMessage: "onmessage",
    onMouseDown: "onmousedown",
    onMouseEnter: "onmouseenter",
    onMouseLeave: "onmouseleave",
    onMouseMove: "onmousemove",
    onMouseOut: "onmouseout",
    onMouseOver: "onmouseover",
    onMouseUp: "onmouseup",
    onMouseWheel: "onmousewheel",
    onOffline: "onoffline",
    onOnline: "ononline",
    onPageHide: "onpagehide",
    onPageShow: "onpageshow",
    onPaste: "onpaste",
    onPause: "onpause",
    onPlay: "onplay",
    onPlaying: "onplaying",
    onPopState: "onpopstate",
    onProgress: "onprogress",
    onRateChange: "onratechange",
    onRepeat: "onrepeat",
    onReset: "onreset",
    onResize: "onresize",
    onScroll: "onscroll",
    onSeeked: "onseeked",
    onSeeking: "onseeking",
    onSelect: "onselect",
    onShow: "onshow",
    onStalled: "onstalled",
    onStorage: "onstorage",
    onSubmit: "onsubmit",
    onSuspend: "onsuspend",
    onTimeUpdate: "ontimeupdate",
    onToggle: "ontoggle",
    onUnload: "onunload",
    onVolumeChange: "onvolumechange",
    onWaiting: "onwaiting",
    onZoom: "onzoom",
    overlinePosition: "overline-position",
    overlineThickness: "overline-thickness",
    paintOrder: "paint-order",
    panose1: "panose-1",
    pointerEvents: "pointer-events",
    referrerPolicy: "referrerpolicy",
    renderingIntent: "rendering-intent",
    shapeRendering: "shape-rendering",
    stopColor: "stop-color",
    stopOpacity: "stop-opacity",
    strikethroughPosition: "strikethrough-position",
    strikethroughThickness: "strikethrough-thickness",
    strokeDashArray: "stroke-dasharray",
    strokeDashOffset: "stroke-dashoffset",
    strokeLineCap: "stroke-linecap",
    strokeLineJoin: "stroke-linejoin",
    strokeMiterLimit: "stroke-miterlimit",
    strokeOpacity: "stroke-opacity",
    strokeWidth: "stroke-width",
    tabIndex: "tabindex",
    textAnchor: "text-anchor",
    textDecoration: "text-decoration",
    textRendering: "text-rendering",
    transformOrigin: "transform-origin",
    typeOf: "typeof",
    underlinePosition: "underline-position",
    underlineThickness: "underline-thickness",
    unicodeBidi: "unicode-bidi",
    unicodeRange: "unicode-range",
    unitsPerEm: "units-per-em",
    vAlphabetic: "v-alphabetic",
    vHanging: "v-hanging",
    vIdeographic: "v-ideographic",
    vMathematical: "v-mathematical",
    vectorEffect: "vector-effect",
    vertAdvY: "vert-adv-y",
    vertOriginX: "vert-origin-x",
    vertOriginY: "vert-origin-y",
    wordSpacing: "word-spacing",
    writingMode: "writing-mode",
    xHeight: "x-height",
    // These were camelcased in Tiny. Now lowercased in SVG 2
    playbackOrder: "playbackorder",
    timelineBegin: "timelinebegin"
  },
  properties: {
    about: Xe,
    accentHeight: M,
    accumulate: null,
    additive: null,
    alignmentBaseline: null,
    alphabetic: M,
    amplitude: M,
    arabicForm: null,
    ascent: M,
    attributeName: null,
    attributeType: null,
    azimuth: M,
    bandwidth: null,
    baselineShift: null,
    baseFrequency: null,
    baseProfile: null,
    bbox: null,
    begin: null,
    bias: M,
    by: null,
    calcMode: null,
    capHeight: M,
    className: ve,
    clip: null,
    clipPath: null,
    clipPathUnits: null,
    clipRule: null,
    color: null,
    colorInterpolation: null,
    colorInterpolationFilters: null,
    colorProfile: null,
    colorRendering: null,
    content: null,
    contentScriptType: null,
    contentStyleType: null,
    crossOrigin: null,
    cursor: null,
    cx: null,
    cy: null,
    d: null,
    dataType: null,
    defaultAction: null,
    descent: M,
    diffuseConstant: M,
    direction: null,
    display: null,
    dur: null,
    divisor: M,
    dominantBaseline: null,
    download: re,
    dx: null,
    dy: null,
    edgeMode: null,
    editable: null,
    elevation: M,
    enableBackground: null,
    end: null,
    event: null,
    exponent: M,
    externalResourcesRequired: null,
    fill: null,
    fillOpacity: M,
    fillRule: null,
    filter: null,
    filterRes: null,
    filterUnits: null,
    floodColor: null,
    floodOpacity: null,
    focusable: null,
    focusHighlight: null,
    fontFamily: null,
    fontSize: null,
    fontSizeAdjust: null,
    fontStretch: null,
    fontStyle: null,
    fontVariant: null,
    fontWeight: null,
    format: null,
    fr: null,
    from: null,
    fx: null,
    fy: null,
    g1: $t,
    g2: $t,
    glyphName: $t,
    glyphOrientationHorizontal: null,
    glyphOrientationVertical: null,
    glyphRef: null,
    gradientTransform: null,
    gradientUnits: null,
    handler: null,
    hanging: M,
    hatchContentUnits: null,
    hatchUnits: null,
    height: null,
    href: null,
    hrefLang: null,
    horizAdvX: M,
    horizOriginX: M,
    horizOriginY: M,
    id: null,
    ideographic: M,
    imageRendering: null,
    initialVisibility: null,
    in: null,
    in2: null,
    intercept: M,
    k: M,
    k1: M,
    k2: M,
    k3: M,
    k4: M,
    kernelMatrix: Xe,
    kernelUnitLength: null,
    keyPoints: null,
    // SEMI_COLON_SEPARATED
    keySplines: null,
    // SEMI_COLON_SEPARATED
    keyTimes: null,
    // SEMI_COLON_SEPARATED
    kerning: null,
    lang: null,
    lengthAdjust: null,
    letterSpacing: null,
    lightingColor: null,
    limitingConeAngle: M,
    local: null,
    markerEnd: null,
    markerMid: null,
    markerStart: null,
    markerHeight: null,
    markerUnits: null,
    markerWidth: null,
    mask: null,
    maskContentUnits: null,
    maskUnits: null,
    mathematical: null,
    max: null,
    media: null,
    mediaCharacterEncoding: null,
    mediaContentEncodings: null,
    mediaSize: M,
    mediaTime: null,
    method: null,
    min: null,
    mode: null,
    name: null,
    navDown: null,
    navDownLeft: null,
    navDownRight: null,
    navLeft: null,
    navNext: null,
    navPrev: null,
    navRight: null,
    navUp: null,
    navUpLeft: null,
    navUpRight: null,
    numOctaves: null,
    observer: null,
    offset: null,
    onAbort: null,
    onActivate: null,
    onAfterPrint: null,
    onBeforePrint: null,
    onBegin: null,
    onCancel: null,
    onCanPlay: null,
    onCanPlayThrough: null,
    onChange: null,
    onClick: null,
    onClose: null,
    onCopy: null,
    onCueChange: null,
    onCut: null,
    onDblClick: null,
    onDrag: null,
    onDragEnd: null,
    onDragEnter: null,
    onDragExit: null,
    onDragLeave: null,
    onDragOver: null,
    onDragStart: null,
    onDrop: null,
    onDurationChange: null,
    onEmptied: null,
    onEnd: null,
    onEnded: null,
    onError: null,
    onFocus: null,
    onFocusIn: null,
    onFocusOut: null,
    onHashChange: null,
    onInput: null,
    onInvalid: null,
    onKeyDown: null,
    onKeyPress: null,
    onKeyUp: null,
    onLoad: null,
    onLoadedData: null,
    onLoadedMetadata: null,
    onLoadStart: null,
    onMessage: null,
    onMouseDown: null,
    onMouseEnter: null,
    onMouseLeave: null,
    onMouseMove: null,
    onMouseOut: null,
    onMouseOver: null,
    onMouseUp: null,
    onMouseWheel: null,
    onOffline: null,
    onOnline: null,
    onPageHide: null,
    onPageShow: null,
    onPaste: null,
    onPause: null,
    onPlay: null,
    onPlaying: null,
    onPopState: null,
    onProgress: null,
    onRateChange: null,
    onRepeat: null,
    onReset: null,
    onResize: null,
    onScroll: null,
    onSeeked: null,
    onSeeking: null,
    onSelect: null,
    onShow: null,
    onStalled: null,
    onStorage: null,
    onSubmit: null,
    onSuspend: null,
    onTimeUpdate: null,
    onToggle: null,
    onUnload: null,
    onVolumeChange: null,
    onWaiting: null,
    onZoom: null,
    opacity: null,
    operator: null,
    order: null,
    orient: null,
    orientation: null,
    origin: null,
    overflow: null,
    overlay: null,
    overlinePosition: M,
    overlineThickness: M,
    paintOrder: null,
    panose1: null,
    path: null,
    pathLength: M,
    patternContentUnits: null,
    patternTransform: null,
    patternUnits: null,
    phase: null,
    ping: ve,
    pitch: null,
    playbackOrder: null,
    pointerEvents: null,
    points: null,
    pointsAtX: M,
    pointsAtY: M,
    pointsAtZ: M,
    preserveAlpha: null,
    preserveAspectRatio: null,
    primitiveUnits: null,
    propagate: null,
    property: Xe,
    r: null,
    radius: null,
    referrerPolicy: null,
    refX: null,
    refY: null,
    rel: Xe,
    rev: Xe,
    renderingIntent: null,
    repeatCount: null,
    repeatDur: null,
    requiredExtensions: Xe,
    requiredFeatures: Xe,
    requiredFonts: Xe,
    requiredFormats: Xe,
    resource: null,
    restart: null,
    result: null,
    rotate: null,
    rx: null,
    ry: null,
    scale: null,
    seed: null,
    shapeRendering: null,
    side: null,
    slope: null,
    snapshotTime: null,
    specularConstant: M,
    specularExponent: M,
    spreadMethod: null,
    spacing: null,
    startOffset: null,
    stdDeviation: null,
    stemh: null,
    stemv: null,
    stitchTiles: null,
    stopColor: null,
    stopOpacity: null,
    strikethroughPosition: M,
    strikethroughThickness: M,
    string: null,
    stroke: null,
    strokeDashArray: Xe,
    strokeDashOffset: null,
    strokeLineCap: null,
    strokeLineJoin: null,
    strokeMiterLimit: M,
    strokeOpacity: M,
    strokeWidth: null,
    style: null,
    surfaceScale: M,
    syncBehavior: null,
    syncBehaviorDefault: null,
    syncMaster: null,
    syncTolerance: null,
    syncToleranceDefault: null,
    systemLanguage: Xe,
    tabIndex: M,
    tableValues: null,
    target: null,
    targetX: M,
    targetY: M,
    textAnchor: null,
    textDecoration: null,
    textRendering: null,
    textLength: null,
    timelineBegin: null,
    title: null,
    transformBehavior: null,
    type: null,
    typeOf: Xe,
    to: null,
    transform: null,
    transformOrigin: null,
    u1: null,
    u2: null,
    underlinePosition: M,
    underlineThickness: M,
    unicode: null,
    unicodeBidi: null,
    unicodeRange: null,
    unitsPerEm: M,
    values: null,
    vAlphabetic: M,
    vMathematical: M,
    vectorEffect: null,
    vHanging: M,
    vIdeographic: M,
    version: null,
    vertAdvY: M,
    vertOriginX: M,
    vertOriginY: M,
    viewBox: null,
    viewTarget: null,
    visibility: null,
    width: null,
    widths: null,
    wordSpacing: null,
    writingMode: null,
    x: null,
    x1: null,
    x2: null,
    xChannelSelector: null,
    xHeight: M,
    y: null,
    y1: null,
    y2: null,
    yChannelSelector: null,
    z: null,
    zoomAndPan: null
  },
  space: "svg",
  transform: Ko
}), Wo = Gt({
  properties: {
    xLinkActuate: null,
    xLinkArcRole: null,
    xLinkHref: null,
    xLinkRole: null,
    xLinkShow: null,
    xLinkTitle: null,
    xLinkType: null
  },
  space: "xlink",
  transform(e, t) {
    return "xlink:" + t.slice(5).toLowerCase();
  }
}), Vo = Gt({
  attributes: { xmlnsxlink: "xmlns:xlink" },
  properties: { xmlnsXLink: null, xmlns: null },
  space: "xmlns",
  transform: qo
}), Yo = Gt({
  properties: { xmlBase: null, xmlLang: null, xmlSpace: null },
  space: "xml",
  transform(e, t) {
    return "xml:" + t.slice(3).toLowerCase();
  }
}), xl = {
  classId: "classID",
  dataType: "datatype",
  itemId: "itemID",
  strokeDashArray: "strokeDasharray",
  strokeDashOffset: "strokeDashoffset",
  strokeLineCap: "strokeLinecap",
  strokeLineJoin: "strokeLinejoin",
  strokeMiterLimit: "strokeMiterlimit",
  typeOf: "typeof",
  xLinkActuate: "xlinkActuate",
  xLinkArcRole: "xlinkArcrole",
  xLinkHref: "xlinkHref",
  xLinkRole: "xlinkRole",
  xLinkShow: "xlinkShow",
  xLinkTitle: "xlinkTitle",
  xLinkType: "xlinkType",
  xmlnsXLink: "xmlnsXlink"
}, wl = /[A-Z]/g, Mi = /-[a-z]/g, Sl = /^data[-\w.:]+$/i;
function vl(e, t) {
  const n = Tr(t);
  let r = t, i = Ve;
  if (n in e.normal)
    return e.property[e.normal[n]];
  if (n.length > 4 && n.slice(0, 4) === "data" && Sl.test(t)) {
    if (t.charAt(4) === "-") {
      const a = t.slice(5).replace(Mi, Nl);
      r = "data" + a.charAt(0).toUpperCase() + a.slice(1);
    } else {
      const a = t.slice(4);
      if (!Mi.test(a)) {
        let o = a.replace(wl, Tl);
        o.charAt(0) !== "-" && (o = "-" + o), t = "data" + o;
      }
    }
    i = Yr;
  }
  return new i(r, t);
}
function Tl(e) {
  return "-" + e.toLowerCase();
}
function Nl(e) {
  return e.charAt(1).toUpperCase();
}
const Al = Ho([Go, _l, Wo, Vo, Yo], "html"), jr = Ho([Go, kl, Wo, Vo, Yo], "svg");
function Cl(e) {
  return e.join(" ").trim();
}
var Dt = {}, rr, Li;
function Rl() {
  if (Li) return rr;
  Li = 1;
  var e = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g, t = /\n/g, n = /^\s*/, r = /^(\*?[-#/*\\\w]+(\[[0-9a-z_-]+\])?)\s*/, i = /^:\s*/, a = /^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^)]*?\)|[^};])+)/, o = /^[;\s]*/, s = /^\s+|\s+$/g, l = `
`, c = "/", u = "*", d = "", f = "comment", p = "declaration";
  rr = function(h, k) {
    if (typeof h != "string")
      throw new TypeError("First argument must be a string");
    if (!h) return [];
    k = k || {};
    var y = 1, S = 1;
    function w(U) {
      var D = U.match(t);
      D && (y += D.length);
      var $ = U.lastIndexOf(l);
      S = ~$ ? U.length - $ : S + U.length;
    }
    function N() {
      var U = { line: y, column: S };
      return function(D) {
        return D.position = new A(U), v(), D;
      };
    }
    function A(U) {
      this.start = U, this.end = { line: y, column: S }, this.source = k.source;
    }
    A.prototype.content = h;
    function _(U) {
      var D = new Error(
        k.source + ":" + y + ":" + S + ": " + U
      );
      if (D.reason = U, D.filename = k.source, D.line = y, D.column = S, D.source = h, !k.silent) throw D;
    }
    function L(U) {
      var D = U.exec(h);
      if (D) {
        var $ = D[0];
        return w($), h = h.slice($.length), D;
      }
    }
    function v() {
      L(n);
    }
    function R(U) {
      var D;
      for (U = U || []; D = x(); )
        D !== !1 && U.push(D);
      return U;
    }
    function x() {
      var U = N();
      if (!(c != h.charAt(0) || u != h.charAt(1))) {
        for (var D = 2; d != h.charAt(D) && (u != h.charAt(D) || c != h.charAt(D + 1)); )
          ++D;
        if (D += 2, d === h.charAt(D - 1))
          return _("End of comment missing");
        var $ = h.slice(2, D - 2);
        return S += 2, w($), h = h.slice(D), S += 2, U({
          type: f,
          comment: $
        });
      }
    }
    function O() {
      var U = N(), D = L(r);
      if (D) {
        if (x(), !L(i)) return _("property missing ':'");
        var $ = L(a), Q = U({
          type: p,
          property: m(D[0].replace(e, d)),
          value: $ ? m($[0].replace(e, d)) : d
        });
        return L(o), Q;
      }
    }
    function F() {
      var U = [];
      R(U);
      for (var D; D = O(); )
        D !== !1 && (U.push(D), R(U));
      return U;
    }
    return v(), F();
  };
  function m(h) {
    return h ? h.replace(s, d) : d;
  }
  return rr;
}
var Di;
function Ol() {
  if (Di) return Dt;
  Di = 1;
  var e = Dt && Dt.__importDefault || function(r) {
    return r && r.__esModule ? r : { default: r };
  };
  Object.defineProperty(Dt, "__esModule", { value: !0 }), Dt.default = n;
  var t = e(Rl());
  function n(r, i) {
    var a = null;
    if (!r || typeof r != "string")
      return a;
    var o = (0, t.default)(r), s = typeof i == "function";
    return o.forEach(function(l) {
      if (l.type === "declaration") {
        var c = l.property, u = l.value;
        s ? i(c, u, l) : u && (a = a || {}, a[c] = u);
      }
    }), a;
  }
  return Dt;
}
var en = {}, Pi;
function Il() {
  if (Pi) return en;
  Pi = 1, Object.defineProperty(en, "__esModule", { value: !0 }), en.camelCase = void 0;
  var e = /^--[a-zA-Z0-9_-]+$/, t = /-([a-z])/g, n = /^[^-]+$/, r = /^-(webkit|moz|ms|o|khtml)-/, i = /^-(ms)-/, a = function(c) {
    return !c || n.test(c) || e.test(c);
  }, o = function(c, u) {
    return u.toUpperCase();
  }, s = function(c, u) {
    return "".concat(u, "-");
  }, l = function(c, u) {
    return u === void 0 && (u = {}), a(c) ? c : (c = c.toLowerCase(), u.reactCompat ? c = c.replace(i, s) : c = c.replace(r, s), c.replace(t, o));
  };
  return en.camelCase = l, en;
}
var tn, Bi;
function Ml() {
  if (Bi) return tn;
  Bi = 1;
  var e = tn && tn.__importDefault || function(i) {
    return i && i.__esModule ? i : { default: i };
  }, t = e(Ol()), n = Il();
  function r(i, a) {
    var o = {};
    return !i || typeof i != "string" || (0, t.default)(i, function(s, l) {
      s && l && (o[(0, n.camelCase)(s, a)] = l);
    }), o;
  }
  return r.default = r, tn = r, tn;
}
var Ll = Ml();
const Dl = /* @__PURE__ */ Vr(Ll), jo = Zo("end"), Zr = Zo("start");
function Zo(e) {
  return t;
  function t(n) {
    const r = n && n.position && n.position[e] || {};
    if (typeof r.line == "number" && r.line > 0 && typeof r.column == "number" && r.column > 0)
      return {
        line: r.line,
        column: r.column,
        offset: typeof r.offset == "number" && r.offset > -1 ? r.offset : void 0
      };
  }
}
function Pl(e) {
  const t = Zr(e), n = jo(e);
  if (t && n)
    return { start: t, end: n };
}
function sn(e) {
  return !e || typeof e != "object" ? "" : "position" in e || "type" in e ? Fi(e.position) : "start" in e || "end" in e ? Fi(e) : "line" in e || "column" in e ? Cr(e) : "";
}
function Cr(e) {
  return zi(e && e.line) + ":" + zi(e && e.column);
}
function Fi(e) {
  return Cr(e && e.start) + "-" + Cr(e && e.end);
}
function zi(e) {
  return e && typeof e == "number" ? e : 1;
}
class ze extends Error {
  /**
   * Create a message for `reason`.
   *
   * > 🪦 **Note**: also has obsolete signatures.
   *
   * @overload
   * @param {string} reason
   * @param {Options | null | undefined} [options]
   * @returns
   *
   * @overload
   * @param {string} reason
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {string} reason
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {string} reason
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {string | null | undefined} [origin]
   * @returns
   *
   * @param {Error | VFileMessage | string} causeOrReason
   *   Reason for message, should use markdown.
   * @param {Node | NodeLike | Options | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
   *   Configuration (optional).
   * @param {string | null | undefined} [origin]
   *   Place in code where the message originates (example:
   *   `'my-package:my-rule'` or `'my-rule'`).
   * @returns
   *   Instance of `VFileMessage`.
   */
  // eslint-disable-next-line complexity
  constructor(t, n, r) {
    super(), typeof n == "string" && (r = n, n = void 0);
    let i = "", a = {}, o = !1;
    if (n && ("line" in n && "column" in n ? a = { place: n } : "start" in n && "end" in n ? a = { place: n } : "type" in n ? a = {
      ancestors: [n],
      place: n.position
    } : a = { ...n }), typeof t == "string" ? i = t : !a.cause && t && (o = !0, i = t.message, a.cause = t), !a.ruleId && !a.source && typeof r == "string") {
      const l = r.indexOf(":");
      l === -1 ? a.ruleId = r : (a.source = r.slice(0, l), a.ruleId = r.slice(l + 1));
    }
    if (!a.place && a.ancestors && a.ancestors) {
      const l = a.ancestors[a.ancestors.length - 1];
      l && (a.place = l.position);
    }
    const s = a.place && "start" in a.place ? a.place.start : a.place;
    this.ancestors = a.ancestors || void 0, this.cause = a.cause || void 0, this.column = s ? s.column : void 0, this.fatal = void 0, this.file = "", this.message = i, this.line = s ? s.line : void 0, this.name = sn(a.place) || "1:1", this.place = a.place || void 0, this.reason = this.message, this.ruleId = a.ruleId || void 0, this.source = a.source || void 0, this.stack = o && a.cause && typeof a.cause.stack == "string" ? a.cause.stack : "", this.actual = void 0, this.expected = void 0, this.note = void 0, this.url = void 0;
  }
}
ze.prototype.file = "";
ze.prototype.name = "";
ze.prototype.reason = "";
ze.prototype.message = "";
ze.prototype.stack = "";
ze.prototype.column = void 0;
ze.prototype.line = void 0;
ze.prototype.ancestors = void 0;
ze.prototype.cause = void 0;
ze.prototype.fatal = void 0;
ze.prototype.place = void 0;
ze.prototype.ruleId = void 0;
ze.prototype.source = void 0;
const Xr = {}.hasOwnProperty, Bl = /* @__PURE__ */ new Map(), Fl = /[A-Z]/g, zl = /* @__PURE__ */ new Set(["table", "tbody", "thead", "tfoot", "tr"]), Ul = /* @__PURE__ */ new Set(["td", "th"]), Xo = "https://github.com/syntax-tree/hast-util-to-jsx-runtime";
function $l(e, t) {
  if (!t || t.Fragment === void 0)
    throw new TypeError("Expected `Fragment` in options");
  const n = t.filePath || void 0;
  let r;
  if (t.development) {
    if (typeof t.jsxDEV != "function")
      throw new TypeError(
        "Expected `jsxDEV` in options when `development: true`"
      );
    r = jl(n, t.jsxDEV);
  } else {
    if (typeof t.jsx != "function")
      throw new TypeError("Expected `jsx` in production options");
    if (typeof t.jsxs != "function")
      throw new TypeError("Expected `jsxs` in production options");
    r = Yl(n, t.jsx, t.jsxs);
  }
  const i = {
    Fragment: t.Fragment,
    ancestors: [],
    components: t.components || {},
    create: r,
    elementAttributeNameCase: t.elementAttributeNameCase || "react",
    evaluater: t.createEvaluater ? t.createEvaluater() : void 0,
    filePath: n,
    ignoreInvalidStyle: t.ignoreInvalidStyle || !1,
    passKeys: t.passKeys !== !1,
    passNode: t.passNode || !1,
    schema: t.space === "svg" ? jr : Al,
    stylePropertyNameCase: t.stylePropertyNameCase || "dom",
    tableCellAlignToStyle: t.tableCellAlignToStyle !== !1
  }, a = Qo(i, e, void 0);
  return a && typeof a != "string" ? a : i.create(
    e,
    i.Fragment,
    { children: a || void 0 },
    void 0
  );
}
function Qo(e, t, n) {
  if (t.type === "element")
    return Hl(e, t, n);
  if (t.type === "mdxFlowExpression" || t.type === "mdxTextExpression")
    return Gl(e, t);
  if (t.type === "mdxJsxFlowElement" || t.type === "mdxJsxTextElement")
    return ql(e, t, n);
  if (t.type === "mdxjsEsm")
    return Kl(e, t);
  if (t.type === "root")
    return Wl(e, t, n);
  if (t.type === "text")
    return Vl(e, t);
}
function Hl(e, t, n) {
  const r = e.schema;
  let i = r;
  t.tagName.toLowerCase() === "svg" && r.space === "html" && (i = jr, e.schema = i), e.ancestors.push(t);
  const a = ea(e, t.tagName, !1), o = Zl(e, t);
  let s = Jr(e, t);
  return zl.has(t.tagName) && (s = s.filter(function(l) {
    return typeof l == "string" ? !yl(l) : !0;
  })), Jo(e, o, a, t), Qr(o, s), e.ancestors.pop(), e.schema = r, e.create(t, a, o, n);
}
function Gl(e, t) {
  if (t.data && t.data.estree && e.evaluater) {
    const r = t.data.estree.body[0];
    return r.type, /** @type {Child | undefined} */
    e.evaluater.evaluateExpression(r.expression);
  }
  un(e, t.position);
}
function Kl(e, t) {
  if (t.data && t.data.estree && e.evaluater)
    return (
      /** @type {Child | undefined} */
      e.evaluater.evaluateProgram(t.data.estree)
    );
  un(e, t.position);
}
function ql(e, t, n) {
  const r = e.schema;
  let i = r;
  t.name === "svg" && r.space === "html" && (i = jr, e.schema = i), e.ancestors.push(t);
  const a = t.name === null ? e.Fragment : ea(e, t.name, !0), o = Xl(e, t), s = Jr(e, t);
  return Jo(e, o, a, t), Qr(o, s), e.ancestors.pop(), e.schema = r, e.create(t, a, o, n);
}
function Wl(e, t, n) {
  const r = {};
  return Qr(r, Jr(e, t)), e.create(t, e.Fragment, r, n);
}
function Vl(e, t) {
  return t.value;
}
function Jo(e, t, n, r) {
  typeof n != "string" && n !== e.Fragment && e.passNode && (t.node = r);
}
function Qr(e, t) {
  if (t.length > 0) {
    const n = t.length > 1 ? t : t[0];
    n && (e.children = n);
  }
}
function Yl(e, t, n) {
  return r;
  function r(i, a, o, s) {
    const c = Array.isArray(o.children) ? n : t;
    return s ? c(a, o, s) : c(a, o);
  }
}
function jl(e, t) {
  return n;
  function n(r, i, a, o) {
    const s = Array.isArray(a.children), l = Zr(r);
    return t(
      i,
      a,
      o,
      s,
      {
        columnNumber: l ? l.column - 1 : void 0,
        fileName: e,
        lineNumber: l ? l.line : void 0
      },
      void 0
    );
  }
}
function Zl(e, t) {
  const n = {};
  let r, i;
  for (i in t.properties)
    if (i !== "children" && Xr.call(t.properties, i)) {
      const a = Ql(e, i, t.properties[i]);
      if (a) {
        const [o, s] = a;
        e.tableCellAlignToStyle && o === "align" && typeof s == "string" && Ul.has(t.tagName) ? r = s : n[o] = s;
      }
    }
  if (r) {
    const a = (
      /** @type {Style} */
      n.style || (n.style = {})
    );
    a[e.stylePropertyNameCase === "css" ? "text-align" : "textAlign"] = r;
  }
  return n;
}
function Xl(e, t) {
  const n = {};
  for (const r of t.attributes)
    if (r.type === "mdxJsxExpressionAttribute")
      if (r.data && r.data.estree && e.evaluater) {
        const a = r.data.estree.body[0];
        a.type;
        const o = a.expression;
        o.type;
        const s = o.properties[0];
        s.type, Object.assign(
          n,
          e.evaluater.evaluateExpression(s.argument)
        );
      } else
        un(e, t.position);
    else {
      const i = r.name;
      let a;
      if (r.value && typeof r.value == "object")
        if (r.value.data && r.value.data.estree && e.evaluater) {
          const s = r.value.data.estree.body[0];
          s.type, a = e.evaluater.evaluateExpression(s.expression);
        } else
          un(e, t.position);
      else
        a = r.value === null ? !0 : r.value;
      n[i] = /** @type {Props[keyof Props]} */
      a;
    }
  return n;
}
function Jr(e, t) {
  const n = [];
  let r = -1;
  const i = e.passKeys ? /* @__PURE__ */ new Map() : Bl;
  for (; ++r < t.children.length; ) {
    const a = t.children[r];
    let o;
    if (e.passKeys) {
      const l = a.type === "element" ? a.tagName : a.type === "mdxJsxFlowElement" || a.type === "mdxJsxTextElement" ? a.name : void 0;
      if (l) {
        const c = i.get(l) || 0;
        o = l + "-" + c, i.set(l, c + 1);
      }
    }
    const s = Qo(e, a, o);
    s !== void 0 && n.push(s);
  }
  return n;
}
function Ql(e, t, n) {
  const r = vl(e.schema, t);
  if (!(n == null || typeof n == "number" && Number.isNaN(n))) {
    if (Array.isArray(n) && (n = r.commaSeparated ? fl(n) : Cl(n)), r.property === "style") {
      let i = typeof n == "object" ? n : Jl(e, String(n));
      return e.stylePropertyNameCase === "css" && (i = ec(i)), ["style", i];
    }
    return [
      e.elementAttributeNameCase === "react" && r.space ? xl[r.property] || r.property : r.attribute,
      n
    ];
  }
}
function Jl(e, t) {
  try {
    return Dl(t, { reactCompat: !0 });
  } catch (n) {
    if (e.ignoreInvalidStyle)
      return {};
    const r = (
      /** @type {Error} */
      n
    ), i = new ze("Cannot parse `style` attribute", {
      ancestors: e.ancestors,
      cause: r,
      ruleId: "style",
      source: "hast-util-to-jsx-runtime"
    });
    throw i.file = e.filePath || void 0, i.url = Xo + "#cannot-parse-style-attribute", i;
  }
}
function ea(e, t, n) {
  let r;
  if (!n)
    r = { type: "Literal", value: t };
  else if (t.includes(".")) {
    const i = t.split(".");
    let a = -1, o;
    for (; ++a < i.length; ) {
      const s = Ri(i[a]) ? { type: "Identifier", name: i[a] } : { type: "Literal", value: i[a] };
      o = o ? {
        type: "MemberExpression",
        object: o,
        property: s,
        computed: !!(a && s.type === "Literal"),
        optional: !1
      } : s;
    }
    r = o;
  } else
    r = Ri(t) && !/^[a-z]/.test(t) ? { type: "Identifier", name: t } : { type: "Literal", value: t };
  if (r.type === "Literal") {
    const i = (
      /** @type {string | number} */
      r.value
    );
    return Xr.call(e.components, i) ? e.components[i] : i;
  }
  if (e.evaluater)
    return e.evaluater.evaluateExpression(r);
  un(e);
}
function un(e, t) {
  const n = new ze(
    "Cannot handle MDX estrees without `createEvaluater`",
    {
      ancestors: e.ancestors,
      place: t,
      ruleId: "mdx-estree",
      source: "hast-util-to-jsx-runtime"
    }
  );
  throw n.file = e.filePath || void 0, n.url = Xo + "#cannot-handle-mdx-estrees-without-createevaluater", n;
}
function ec(e) {
  const t = {};
  let n;
  for (n in e)
    Xr.call(e, n) && (t[tc(n)] = e[n]);
  return t;
}
function tc(e) {
  let t = e.replace(Fl, nc);
  return t.slice(0, 3) === "ms-" && (t = "-" + t), t;
}
function nc(e) {
  return "-" + e.toLowerCase();
}
const ir = {
  action: ["form"],
  cite: ["blockquote", "del", "ins", "q"],
  data: ["object"],
  formAction: ["button", "input"],
  href: ["a", "area", "base", "link"],
  icon: ["menuitem"],
  itemId: null,
  manifest: ["html"],
  ping: ["a", "area"],
  poster: ["video"],
  src: [
    "audio",
    "embed",
    "iframe",
    "img",
    "input",
    "script",
    "source",
    "track",
    "video"
  ]
}, rc = {};
function ei(e, t) {
  const n = rc, r = typeof n.includeImageAlt == "boolean" ? n.includeImageAlt : !0, i = typeof n.includeHtml == "boolean" ? n.includeHtml : !0;
  return ta(e, r, i);
}
function ta(e, t, n) {
  if (ic(e)) {
    if ("value" in e)
      return e.type === "html" && !n ? "" : e.value;
    if (t && "alt" in e && e.alt)
      return e.alt;
    if ("children" in e)
      return Ui(e.children, t, n);
  }
  return Array.isArray(e) ? Ui(e, t, n) : "";
}
function Ui(e, t, n) {
  const r = [];
  let i = -1;
  for (; ++i < e.length; )
    r[i] = ta(e[i], t, n);
  return r.join("");
}
function ic(e) {
  return !!(e && typeof e == "object");
}
const $i = document.createElement("i");
function ti(e) {
  const t = "&" + e + ";";
  $i.innerHTML = t;
  const n = $i.textContent;
  return (
    // @ts-expect-error: TypeScript is wrong that `textContent` on elements can
    // yield `null`.
    n.charCodeAt(n.length - 1) === 59 && e !== "semi" || n === t ? !1 : n
  );
}
function Je(e, t, n, r) {
  const i = e.length;
  let a = 0, o;
  if (t < 0 ? t = -t > i ? 0 : i + t : t = t > i ? i : t, n = n > 0 ? n : 0, r.length < 1e4)
    o = Array.from(r), o.unshift(t, n), e.splice(...o);
  else
    for (n && e.splice(t, n); a < r.length; )
      o = r.slice(a, a + 1e4), o.unshift(t, 0), e.splice(...o), a += 1e4, t += 1e4;
}
function et(e, t) {
  return e.length > 0 ? (Je(e, e.length, 0, t), e) : t;
}
const Hi = {}.hasOwnProperty;
function na(e) {
  const t = {};
  let n = -1;
  for (; ++n < e.length; )
    oc(t, e[n]);
  return t;
}
function oc(e, t) {
  let n;
  for (n in t) {
    const i = (Hi.call(e, n) ? e[n] : void 0) || (e[n] = {}), a = t[n];
    let o;
    if (a)
      for (o in a) {
        Hi.call(i, o) || (i[o] = []);
        const s = a[o];
        ac(
          // @ts-expect-error Looks like a list.
          i[o],
          Array.isArray(s) ? s : s ? [s] : []
        );
      }
  }
}
function ac(e, t) {
  let n = -1;
  const r = [];
  for (; ++n < t.length; )
    (t[n].add === "after" ? e : r).push(t[n]);
  Je(e, 0, 0, r);
}
function ra(e, t) {
  const n = Number.parseInt(e, t);
  return (
    // C0 except for HT, LF, FF, CR, space.
    n < 9 || n === 11 || n > 13 && n < 32 || // Control character (DEL) of C0, and C1 controls.
    n > 126 && n < 160 || // Lone high surrogates and low surrogates.
    n > 55295 && n < 57344 || // Noncharacters.
    n > 64975 && n < 65008 || /* eslint-disable no-bitwise */
    (n & 65535) === 65535 || (n & 65535) === 65534 || /* eslint-enable no-bitwise */
    // Out of range
    n > 1114111 ? "�" : String.fromCodePoint(n)
  );
}
function it(e) {
  return e.replace(/[\t\n\r ]+/g, " ").replace(/^ | $/g, "").toLowerCase().toUpperCase();
}
const He = St(/[A-Za-z]/), Fe = St(/[\dA-Za-z]/), sc = St(/[#-'*+\--9=?A-Z^-~]/);
function Bn(e) {
  return (
    // Special whitespace codes (which have negative values), C0 and Control
    // character DEL
    e !== null && (e < 32 || e === 127)
  );
}
const Rr = St(/\d/), lc = St(/[\dA-Fa-f]/), cc = St(/[!-/:-@[-`{-~]/);
function X(e) {
  return e !== null && e < -2;
}
function xe(e) {
  return e !== null && (e < 0 || e === 32);
}
function ue(e) {
  return e === -2 || e === -1 || e === 32;
}
const Kn = St(new RegExp("\\p{P}|\\p{S}", "u")), Ct = St(/\s/);
function St(e) {
  return t;
  function t(n) {
    return n !== null && n > -1 && e.test(String.fromCharCode(n));
  }
}
function Kt(e) {
  const t = [];
  let n = -1, r = 0, i = 0;
  for (; ++n < e.length; ) {
    const a = e.charCodeAt(n);
    let o = "";
    if (a === 37 && Fe(e.charCodeAt(n + 1)) && Fe(e.charCodeAt(n + 2)))
      i = 2;
    else if (a < 128)
      /[!#$&-;=?-Z_a-z~]/.test(String.fromCharCode(a)) || (o = String.fromCharCode(a));
    else if (a > 55295 && a < 57344) {
      const s = e.charCodeAt(n + 1);
      a < 56320 && s > 56319 && s < 57344 ? (o = String.fromCharCode(a, s), i = 1) : o = "�";
    } else
      o = String.fromCharCode(a);
    o && (t.push(e.slice(r, n), encodeURIComponent(o)), r = n + i + 1, o = ""), i && (n += i, i = 0);
  }
  return t.join("") + e.slice(r);
}
function pe(e, t, n, r) {
  const i = r ? r - 1 : Number.POSITIVE_INFINITY;
  let a = 0;
  return o;
  function o(l) {
    return ue(l) ? (e.enter(n), s(l)) : t(l);
  }
  function s(l) {
    return ue(l) && a++ < i ? (e.consume(l), s) : (e.exit(n), t(l));
  }
}
const uc = {
  tokenize: dc
};
function dc(e) {
  const t = e.attempt(this.parser.constructs.contentInitial, r, i);
  let n;
  return t;
  function r(s) {
    if (s === null) {
      e.consume(s);
      return;
    }
    return e.enter("lineEnding"), e.consume(s), e.exit("lineEnding"), pe(e, t, "linePrefix");
  }
  function i(s) {
    return e.enter("paragraph"), a(s);
  }
  function a(s) {
    const l = e.enter("chunkText", {
      contentType: "text",
      previous: n
    });
    return n && (n.next = l), n = l, o(s);
  }
  function o(s) {
    if (s === null) {
      e.exit("chunkText"), e.exit("paragraph"), e.consume(s);
      return;
    }
    return X(s) ? (e.consume(s), e.exit("chunkText"), a) : (e.consume(s), o);
  }
}
const pc = {
  tokenize: fc
}, Gi = {
  tokenize: gc
};
function fc(e) {
  const t = this, n = [];
  let r = 0, i, a, o;
  return s;
  function s(w) {
    if (r < n.length) {
      const N = n[r];
      return t.containerState = N[1], e.attempt(N[0].continuation, l, c)(w);
    }
    return c(w);
  }
  function l(w) {
    if (r++, t.containerState._closeFlow) {
      t.containerState._closeFlow = void 0, i && S();
      const N = t.events.length;
      let A = N, _;
      for (; A--; )
        if (t.events[A][0] === "exit" && t.events[A][1].type === "chunkFlow") {
          _ = t.events[A][1].end;
          break;
        }
      y(r);
      let L = N;
      for (; L < t.events.length; )
        t.events[L][1].end = {
          ..._
        }, L++;
      return Je(t.events, A + 1, 0, t.events.slice(N)), t.events.length = L, c(w);
    }
    return s(w);
  }
  function c(w) {
    if (r === n.length) {
      if (!i)
        return f(w);
      if (i.currentConstruct && i.currentConstruct.concrete)
        return m(w);
      t.interrupt = !!(i.currentConstruct && !i._gfmTableDynamicInterruptHack);
    }
    return t.containerState = {}, e.check(Gi, u, d)(w);
  }
  function u(w) {
    return i && S(), y(r), f(w);
  }
  function d(w) {
    return t.parser.lazy[t.now().line] = r !== n.length, o = t.now().offset, m(w);
  }
  function f(w) {
    return t.containerState = {}, e.attempt(Gi, p, m)(w);
  }
  function p(w) {
    return r++, n.push([t.currentConstruct, t.containerState]), f(w);
  }
  function m(w) {
    if (w === null) {
      i && S(), y(0), e.consume(w);
      return;
    }
    return i = i || t.parser.flow(t.now()), e.enter("chunkFlow", {
      _tokenizer: i,
      contentType: "flow",
      previous: a
    }), h(w);
  }
  function h(w) {
    if (w === null) {
      k(e.exit("chunkFlow"), !0), y(0), e.consume(w);
      return;
    }
    return X(w) ? (e.consume(w), k(e.exit("chunkFlow")), r = 0, t.interrupt = void 0, s) : (e.consume(w), h);
  }
  function k(w, N) {
    const A = t.sliceStream(w);
    if (N && A.push(null), w.previous = a, a && (a.next = w), a = w, i.defineSkip(w.start), i.write(A), t.parser.lazy[w.start.line]) {
      let _ = i.events.length;
      for (; _--; )
        if (
          // The token starts before the line ending…
          i.events[_][1].start.offset < o && // …and either is not ended yet…
          (!i.events[_][1].end || // …or ends after it.
          i.events[_][1].end.offset > o)
        )
          return;
      const L = t.events.length;
      let v = L, R, x;
      for (; v--; )
        if (t.events[v][0] === "exit" && t.events[v][1].type === "chunkFlow") {
          if (R) {
            x = t.events[v][1].end;
            break;
          }
          R = !0;
        }
      for (y(r), _ = L; _ < t.events.length; )
        t.events[_][1].end = {
          ...x
        }, _++;
      Je(t.events, v + 1, 0, t.events.slice(L)), t.events.length = _;
    }
  }
  function y(w) {
    let N = n.length;
    for (; N-- > w; ) {
      const A = n[N];
      t.containerState = A[1], A[0].exit.call(t, e);
    }
    n.length = w;
  }
  function S() {
    i.write([null]), a = void 0, i = void 0, t.containerState._closeFlow = void 0;
  }
}
function gc(e, t, n) {
  return pe(e, e.attempt(this.parser.constructs.document, t, n), "linePrefix", this.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4);
}
function Ht(e) {
  if (e === null || xe(e) || Ct(e))
    return 1;
  if (Kn(e))
    return 2;
}
function qn(e, t, n) {
  const r = [];
  let i = -1;
  for (; ++i < e.length; ) {
    const a = e[i].resolveAll;
    a && !r.includes(a) && (t = a(t, n), r.push(a));
  }
  return t;
}
const Or = {
  name: "attention",
  resolveAll: mc,
  tokenize: hc
};
function mc(e, t) {
  let n = -1, r, i, a, o, s, l, c, u;
  for (; ++n < e.length; )
    if (e[n][0] === "enter" && e[n][1].type === "attentionSequence" && e[n][1]._close) {
      for (r = n; r--; )
        if (e[r][0] === "exit" && e[r][1].type === "attentionSequence" && e[r][1]._open && // If the markers are the same:
        t.sliceSerialize(e[r][1]).charCodeAt(0) === t.sliceSerialize(e[n][1]).charCodeAt(0)) {
          if ((e[r][1]._close || e[n][1]._open) && (e[n][1].end.offset - e[n][1].start.offset) % 3 && !((e[r][1].end.offset - e[r][1].start.offset + e[n][1].end.offset - e[n][1].start.offset) % 3))
            continue;
          l = e[r][1].end.offset - e[r][1].start.offset > 1 && e[n][1].end.offset - e[n][1].start.offset > 1 ? 2 : 1;
          const d = {
            ...e[r][1].end
          }, f = {
            ...e[n][1].start
          };
          Ki(d, -l), Ki(f, l), o = {
            type: l > 1 ? "strongSequence" : "emphasisSequence",
            start: d,
            end: {
              ...e[r][1].end
            }
          }, s = {
            type: l > 1 ? "strongSequence" : "emphasisSequence",
            start: {
              ...e[n][1].start
            },
            end: f
          }, a = {
            type: l > 1 ? "strongText" : "emphasisText",
            start: {
              ...e[r][1].end
            },
            end: {
              ...e[n][1].start
            }
          }, i = {
            type: l > 1 ? "strong" : "emphasis",
            start: {
              ...o.start
            },
            end: {
              ...s.end
            }
          }, e[r][1].end = {
            ...o.start
          }, e[n][1].start = {
            ...s.end
          }, c = [], e[r][1].end.offset - e[r][1].start.offset && (c = et(c, [["enter", e[r][1], t], ["exit", e[r][1], t]])), c = et(c, [["enter", i, t], ["enter", o, t], ["exit", o, t], ["enter", a, t]]), c = et(c, qn(t.parser.constructs.insideSpan.null, e.slice(r + 1, n), t)), c = et(c, [["exit", a, t], ["enter", s, t], ["exit", s, t], ["exit", i, t]]), e[n][1].end.offset - e[n][1].start.offset ? (u = 2, c = et(c, [["enter", e[n][1], t], ["exit", e[n][1], t]])) : u = 0, Je(e, r - 1, n - r + 3, c), n = r + c.length - u - 2;
          break;
        }
    }
  for (n = -1; ++n < e.length; )
    e[n][1].type === "attentionSequence" && (e[n][1].type = "data");
  return e;
}
function hc(e, t) {
  const n = this.parser.constructs.attentionMarkers.null, r = this.previous, i = Ht(r);
  let a;
  return o;
  function o(l) {
    return a = l, e.enter("attentionSequence"), s(l);
  }
  function s(l) {
    if (l === a)
      return e.consume(l), s;
    const c = e.exit("attentionSequence"), u = Ht(l), d = !u || u === 2 && i || n.includes(l), f = !i || i === 2 && u || n.includes(r);
    return c._open = !!(a === 42 ? d : d && (i || !f)), c._close = !!(a === 42 ? f : f && (u || !d)), t(l);
  }
}
function Ki(e, t) {
  e.column += t, e.offset += t, e._bufferIndex += t;
}
const bc = {
  name: "autolink",
  tokenize: yc
};
function yc(e, t, n) {
  let r = 0;
  return i;
  function i(p) {
    return e.enter("autolink"), e.enter("autolinkMarker"), e.consume(p), e.exit("autolinkMarker"), e.enter("autolinkProtocol"), a;
  }
  function a(p) {
    return He(p) ? (e.consume(p), o) : p === 64 ? n(p) : c(p);
  }
  function o(p) {
    return p === 43 || p === 45 || p === 46 || Fe(p) ? (r = 1, s(p)) : c(p);
  }
  function s(p) {
    return p === 58 ? (e.consume(p), r = 0, l) : (p === 43 || p === 45 || p === 46 || Fe(p)) && r++ < 32 ? (e.consume(p), s) : (r = 0, c(p));
  }
  function l(p) {
    return p === 62 ? (e.exit("autolinkProtocol"), e.enter("autolinkMarker"), e.consume(p), e.exit("autolinkMarker"), e.exit("autolink"), t) : p === null || p === 32 || p === 60 || Bn(p) ? n(p) : (e.consume(p), l);
  }
  function c(p) {
    return p === 64 ? (e.consume(p), u) : sc(p) ? (e.consume(p), c) : n(p);
  }
  function u(p) {
    return Fe(p) ? d(p) : n(p);
  }
  function d(p) {
    return p === 46 ? (e.consume(p), r = 0, u) : p === 62 ? (e.exit("autolinkProtocol").type = "autolinkEmail", e.enter("autolinkMarker"), e.consume(p), e.exit("autolinkMarker"), e.exit("autolink"), t) : f(p);
  }
  function f(p) {
    if ((p === 45 || Fe(p)) && r++ < 63) {
      const m = p === 45 ? f : d;
      return e.consume(p), m;
    }
    return n(p);
  }
}
const fn = {
  partial: !0,
  tokenize: Ec
};
function Ec(e, t, n) {
  return r;
  function r(a) {
    return ue(a) ? pe(e, i, "linePrefix")(a) : i(a);
  }
  function i(a) {
    return a === null || X(a) ? t(a) : n(a);
  }
}
const ia = {
  continuation: {
    tokenize: kc
  },
  exit: xc,
  name: "blockQuote",
  tokenize: _c
};
function _c(e, t, n) {
  const r = this;
  return i;
  function i(o) {
    if (o === 62) {
      const s = r.containerState;
      return s.open || (e.enter("blockQuote", {
        _container: !0
      }), s.open = !0), e.enter("blockQuotePrefix"), e.enter("blockQuoteMarker"), e.consume(o), e.exit("blockQuoteMarker"), a;
    }
    return n(o);
  }
  function a(o) {
    return ue(o) ? (e.enter("blockQuotePrefixWhitespace"), e.consume(o), e.exit("blockQuotePrefixWhitespace"), e.exit("blockQuotePrefix"), t) : (e.exit("blockQuotePrefix"), t(o));
  }
}
function kc(e, t, n) {
  const r = this;
  return i;
  function i(o) {
    return ue(o) ? pe(e, a, "linePrefix", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(o) : a(o);
  }
  function a(o) {
    return e.attempt(ia, t, n)(o);
  }
}
function xc(e) {
  e.exit("blockQuote");
}
const oa = {
  name: "characterEscape",
  tokenize: wc
};
function wc(e, t, n) {
  return r;
  function r(a) {
    return e.enter("characterEscape"), e.enter("escapeMarker"), e.consume(a), e.exit("escapeMarker"), i;
  }
  function i(a) {
    return cc(a) ? (e.enter("characterEscapeValue"), e.consume(a), e.exit("characterEscapeValue"), e.exit("characterEscape"), t) : n(a);
  }
}
const aa = {
  name: "characterReference",
  tokenize: Sc
};
function Sc(e, t, n) {
  const r = this;
  let i = 0, a, o;
  return s;
  function s(d) {
    return e.enter("characterReference"), e.enter("characterReferenceMarker"), e.consume(d), e.exit("characterReferenceMarker"), l;
  }
  function l(d) {
    return d === 35 ? (e.enter("characterReferenceMarkerNumeric"), e.consume(d), e.exit("characterReferenceMarkerNumeric"), c) : (e.enter("characterReferenceValue"), a = 31, o = Fe, u(d));
  }
  function c(d) {
    return d === 88 || d === 120 ? (e.enter("characterReferenceMarkerHexadecimal"), e.consume(d), e.exit("characterReferenceMarkerHexadecimal"), e.enter("characterReferenceValue"), a = 6, o = lc, u) : (e.enter("characterReferenceValue"), a = 7, o = Rr, u(d));
  }
  function u(d) {
    if (d === 59 && i) {
      const f = e.exit("characterReferenceValue");
      return o === Fe && !ti(r.sliceSerialize(f)) ? n(d) : (e.enter("characterReferenceMarker"), e.consume(d), e.exit("characterReferenceMarker"), e.exit("characterReference"), t);
    }
    return o(d) && i++ < a ? (e.consume(d), u) : n(d);
  }
}
const qi = {
  partial: !0,
  tokenize: Tc
}, Wi = {
  concrete: !0,
  name: "codeFenced",
  tokenize: vc
};
function vc(e, t, n) {
  const r = this, i = {
    partial: !0,
    tokenize: A
  };
  let a = 0, o = 0, s;
  return l;
  function l(_) {
    return c(_);
  }
  function c(_) {
    const L = r.events[r.events.length - 1];
    return a = L && L[1].type === "linePrefix" ? L[2].sliceSerialize(L[1], !0).length : 0, s = _, e.enter("codeFenced"), e.enter("codeFencedFence"), e.enter("codeFencedFenceSequence"), u(_);
  }
  function u(_) {
    return _ === s ? (o++, e.consume(_), u) : o < 3 ? n(_) : (e.exit("codeFencedFenceSequence"), ue(_) ? pe(e, d, "whitespace")(_) : d(_));
  }
  function d(_) {
    return _ === null || X(_) ? (e.exit("codeFencedFence"), r.interrupt ? t(_) : e.check(qi, h, N)(_)) : (e.enter("codeFencedFenceInfo"), e.enter("chunkString", {
      contentType: "string"
    }), f(_));
  }
  function f(_) {
    return _ === null || X(_) ? (e.exit("chunkString"), e.exit("codeFencedFenceInfo"), d(_)) : ue(_) ? (e.exit("chunkString"), e.exit("codeFencedFenceInfo"), pe(e, p, "whitespace")(_)) : _ === 96 && _ === s ? n(_) : (e.consume(_), f);
  }
  function p(_) {
    return _ === null || X(_) ? d(_) : (e.enter("codeFencedFenceMeta"), e.enter("chunkString", {
      contentType: "string"
    }), m(_));
  }
  function m(_) {
    return _ === null || X(_) ? (e.exit("chunkString"), e.exit("codeFencedFenceMeta"), d(_)) : _ === 96 && _ === s ? n(_) : (e.consume(_), m);
  }
  function h(_) {
    return e.attempt(i, N, k)(_);
  }
  function k(_) {
    return e.enter("lineEnding"), e.consume(_), e.exit("lineEnding"), y;
  }
  function y(_) {
    return a > 0 && ue(_) ? pe(e, S, "linePrefix", a + 1)(_) : S(_);
  }
  function S(_) {
    return _ === null || X(_) ? e.check(qi, h, N)(_) : (e.enter("codeFlowValue"), w(_));
  }
  function w(_) {
    return _ === null || X(_) ? (e.exit("codeFlowValue"), S(_)) : (e.consume(_), w);
  }
  function N(_) {
    return e.exit("codeFenced"), t(_);
  }
  function A(_, L, v) {
    let R = 0;
    return x;
    function x($) {
      return _.enter("lineEnding"), _.consume($), _.exit("lineEnding"), O;
    }
    function O($) {
      return _.enter("codeFencedFence"), ue($) ? pe(_, F, "linePrefix", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)($) : F($);
    }
    function F($) {
      return $ === s ? (_.enter("codeFencedFenceSequence"), U($)) : v($);
    }
    function U($) {
      return $ === s ? (R++, _.consume($), U) : R >= o ? (_.exit("codeFencedFenceSequence"), ue($) ? pe(_, D, "whitespace")($) : D($)) : v($);
    }
    function D($) {
      return $ === null || X($) ? (_.exit("codeFencedFence"), L($)) : v($);
    }
  }
}
function Tc(e, t, n) {
  const r = this;
  return i;
  function i(o) {
    return o === null ? n(o) : (e.enter("lineEnding"), e.consume(o), e.exit("lineEnding"), a);
  }
  function a(o) {
    return r.parser.lazy[r.now().line] ? n(o) : t(o);
  }
}
const or = {
  name: "codeIndented",
  tokenize: Ac
}, Nc = {
  partial: !0,
  tokenize: Cc
};
function Ac(e, t, n) {
  const r = this;
  return i;
  function i(c) {
    return e.enter("codeIndented"), pe(e, a, "linePrefix", 5)(c);
  }
  function a(c) {
    const u = r.events[r.events.length - 1];
    return u && u[1].type === "linePrefix" && u[2].sliceSerialize(u[1], !0).length >= 4 ? o(c) : n(c);
  }
  function o(c) {
    return c === null ? l(c) : X(c) ? e.attempt(Nc, o, l)(c) : (e.enter("codeFlowValue"), s(c));
  }
  function s(c) {
    return c === null || X(c) ? (e.exit("codeFlowValue"), o(c)) : (e.consume(c), s);
  }
  function l(c) {
    return e.exit("codeIndented"), t(c);
  }
}
function Cc(e, t, n) {
  const r = this;
  return i;
  function i(o) {
    return r.parser.lazy[r.now().line] ? n(o) : X(o) ? (e.enter("lineEnding"), e.consume(o), e.exit("lineEnding"), i) : pe(e, a, "linePrefix", 5)(o);
  }
  function a(o) {
    const s = r.events[r.events.length - 1];
    return s && s[1].type === "linePrefix" && s[2].sliceSerialize(s[1], !0).length >= 4 ? t(o) : X(o) ? i(o) : n(o);
  }
}
const Rc = {
  name: "codeText",
  previous: Ic,
  resolve: Oc,
  tokenize: Mc
};
function Oc(e) {
  let t = e.length - 4, n = 3, r, i;
  if ((e[n][1].type === "lineEnding" || e[n][1].type === "space") && (e[t][1].type === "lineEnding" || e[t][1].type === "space")) {
    for (r = n; ++r < t; )
      if (e[r][1].type === "codeTextData") {
        e[n][1].type = "codeTextPadding", e[t][1].type = "codeTextPadding", n += 2, t -= 2;
        break;
      }
  }
  for (r = n - 1, t++; ++r <= t; )
    i === void 0 ? r !== t && e[r][1].type !== "lineEnding" && (i = r) : (r === t || e[r][1].type === "lineEnding") && (e[i][1].type = "codeTextData", r !== i + 2 && (e[i][1].end = e[r - 1][1].end, e.splice(i + 2, r - i - 2), t -= r - i - 2, r = i + 2), i = void 0);
  return e;
}
function Ic(e) {
  return e !== 96 || this.events[this.events.length - 1][1].type === "characterEscape";
}
function Mc(e, t, n) {
  let r = 0, i, a;
  return o;
  function o(d) {
    return e.enter("codeText"), e.enter("codeTextSequence"), s(d);
  }
  function s(d) {
    return d === 96 ? (e.consume(d), r++, s) : (e.exit("codeTextSequence"), l(d));
  }
  function l(d) {
    return d === null ? n(d) : d === 32 ? (e.enter("space"), e.consume(d), e.exit("space"), l) : d === 96 ? (a = e.enter("codeTextSequence"), i = 0, u(d)) : X(d) ? (e.enter("lineEnding"), e.consume(d), e.exit("lineEnding"), l) : (e.enter("codeTextData"), c(d));
  }
  function c(d) {
    return d === null || d === 32 || d === 96 || X(d) ? (e.exit("codeTextData"), l(d)) : (e.consume(d), c);
  }
  function u(d) {
    return d === 96 ? (e.consume(d), i++, u) : i === r ? (e.exit("codeTextSequence"), e.exit("codeText"), t(d)) : (a.type = "codeTextData", c(d));
  }
}
class Lc {
  /**
   * @param {ReadonlyArray<T> | null | undefined} [initial]
   *   Initial items (optional).
   * @returns
   *   Splice buffer.
   */
  constructor(t) {
    this.left = t ? [...t] : [], this.right = [];
  }
  /**
   * Array access;
   * does not move the cursor.
   *
   * @param {number} index
   *   Index.
   * @return {T}
   *   Item.
   */
  get(t) {
    if (t < 0 || t >= this.left.length + this.right.length)
      throw new RangeError("Cannot access index `" + t + "` in a splice buffer of size `" + (this.left.length + this.right.length) + "`");
    return t < this.left.length ? this.left[t] : this.right[this.right.length - t + this.left.length - 1];
  }
  /**
   * The length of the splice buffer, one greater than the largest index in the
   * array.
   */
  get length() {
    return this.left.length + this.right.length;
  }
  /**
   * Remove and return `list[0]`;
   * moves the cursor to `0`.
   *
   * @returns {T | undefined}
   *   Item, optional.
   */
  shift() {
    return this.setCursor(0), this.right.pop();
  }
  /**
   * Slice the buffer to get an array;
   * does not move the cursor.
   *
   * @param {number} start
   *   Start.
   * @param {number | null | undefined} [end]
   *   End (optional).
   * @returns {Array<T>}
   *   Array of items.
   */
  slice(t, n) {
    const r = n ?? Number.POSITIVE_INFINITY;
    return r < this.left.length ? this.left.slice(t, r) : t > this.left.length ? this.right.slice(this.right.length - r + this.left.length, this.right.length - t + this.left.length).reverse() : this.left.slice(t).concat(this.right.slice(this.right.length - r + this.left.length).reverse());
  }
  /**
   * Mimics the behavior of Array.prototype.splice() except for the change of
   * interface necessary to avoid segfaults when patching in very large arrays.
   *
   * This operation moves cursor is moved to `start` and results in the cursor
   * placed after any inserted items.
   *
   * @param {number} start
   *   Start;
   *   zero-based index at which to start changing the array;
   *   negative numbers count backwards from the end of the array and values
   *   that are out-of bounds are clamped to the appropriate end of the array.
   * @param {number | null | undefined} [deleteCount=0]
   *   Delete count (default: `0`);
   *   maximum number of elements to delete, starting from start.
   * @param {Array<T> | null | undefined} [items=[]]
   *   Items to include in place of the deleted items (default: `[]`).
   * @return {Array<T>}
   *   Any removed items.
   */
  splice(t, n, r) {
    const i = n || 0;
    this.setCursor(Math.trunc(t));
    const a = this.right.splice(this.right.length - i, Number.POSITIVE_INFINITY);
    return r && nn(this.left, r), a.reverse();
  }
  /**
   * Remove and return the highest-numbered item in the array, so
   * `list[list.length - 1]`;
   * Moves the cursor to `length`.
   *
   * @returns {T | undefined}
   *   Item, optional.
   */
  pop() {
    return this.setCursor(Number.POSITIVE_INFINITY), this.left.pop();
  }
  /**
   * Inserts a single item to the high-numbered side of the array;
   * moves the cursor to `length`.
   *
   * @param {T} item
   *   Item.
   * @returns {undefined}
   *   Nothing.
   */
  push(t) {
    this.setCursor(Number.POSITIVE_INFINITY), this.left.push(t);
  }
  /**
   * Inserts many items to the high-numbered side of the array.
   * Moves the cursor to `length`.
   *
   * @param {Array<T>} items
   *   Items.
   * @returns {undefined}
   *   Nothing.
   */
  pushMany(t) {
    this.setCursor(Number.POSITIVE_INFINITY), nn(this.left, t);
  }
  /**
   * Inserts a single item to the low-numbered side of the array;
   * Moves the cursor to `0`.
   *
   * @param {T} item
   *   Item.
   * @returns {undefined}
   *   Nothing.
   */
  unshift(t) {
    this.setCursor(0), this.right.push(t);
  }
  /**
   * Inserts many items to the low-numbered side of the array;
   * moves the cursor to `0`.
   *
   * @param {Array<T>} items
   *   Items.
   * @returns {undefined}
   *   Nothing.
   */
  unshiftMany(t) {
    this.setCursor(0), nn(this.right, t.reverse());
  }
  /**
   * Move the cursor to a specific position in the array. Requires
   * time proportional to the distance moved.
   *
   * If `n < 0`, the cursor will end up at the beginning.
   * If `n > length`, the cursor will end up at the end.
   *
   * @param {number} n
   *   Position.
   * @return {undefined}
   *   Nothing.
   */
  setCursor(t) {
    if (!(t === this.left.length || t > this.left.length && this.right.length === 0 || t < 0 && this.left.length === 0))
      if (t < this.left.length) {
        const n = this.left.splice(t, Number.POSITIVE_INFINITY);
        nn(this.right, n.reverse());
      } else {
        const n = this.right.splice(this.left.length + this.right.length - t, Number.POSITIVE_INFINITY);
        nn(this.left, n.reverse());
      }
  }
}
function nn(e, t) {
  let n = 0;
  if (t.length < 1e4)
    e.push(...t);
  else
    for (; n < t.length; )
      e.push(...t.slice(n, n + 1e4)), n += 1e4;
}
function sa(e) {
  const t = {};
  let n = -1, r, i, a, o, s, l, c;
  const u = new Lc(e);
  for (; ++n < u.length; ) {
    for (; n in t; )
      n = t[n];
    if (r = u.get(n), n && r[1].type === "chunkFlow" && u.get(n - 1)[1].type === "listItemPrefix" && (l = r[1]._tokenizer.events, a = 0, a < l.length && l[a][1].type === "lineEndingBlank" && (a += 2), a < l.length && l[a][1].type === "content"))
      for (; ++a < l.length && l[a][1].type !== "content"; )
        l[a][1].type === "chunkText" && (l[a][1]._isInFirstContentOfListItem = !0, a++);
    if (r[0] === "enter")
      r[1].contentType && (Object.assign(t, Dc(u, n)), n = t[n], c = !0);
    else if (r[1]._container) {
      for (a = n, i = void 0; a--; )
        if (o = u.get(a), o[1].type === "lineEnding" || o[1].type === "lineEndingBlank")
          o[0] === "enter" && (i && (u.get(i)[1].type = "lineEndingBlank"), o[1].type = "lineEnding", i = a);
        else if (!(o[1].type === "linePrefix" || o[1].type === "listItemIndent")) break;
      i && (r[1].end = {
        ...u.get(i)[1].start
      }, s = u.slice(i, n), s.unshift(r), u.splice(i, n - i + 1, s));
    }
  }
  return Je(e, 0, Number.POSITIVE_INFINITY, u.slice(0)), !c;
}
function Dc(e, t) {
  const n = e.get(t)[1], r = e.get(t)[2];
  let i = t - 1;
  const a = [];
  let o = n._tokenizer;
  o || (o = r.parser[n.contentType](n.start), n._contentTypeTextTrailing && (o._contentTypeTextTrailing = !0));
  const s = o.events, l = [], c = {};
  let u, d, f = -1, p = n, m = 0, h = 0;
  const k = [h];
  for (; p; ) {
    for (; e.get(++i)[1] !== p; )
      ;
    a.push(i), p._tokenizer || (u = r.sliceStream(p), p.next || u.push(null), d && o.defineSkip(p.start), p._isInFirstContentOfListItem && (o._gfmTasklistFirstContentOfListItem = !0), o.write(u), p._isInFirstContentOfListItem && (o._gfmTasklistFirstContentOfListItem = void 0)), d = p, p = p.next;
  }
  for (p = n; ++f < s.length; )
    // Find a void token that includes a break.
    s[f][0] === "exit" && s[f - 1][0] === "enter" && s[f][1].type === s[f - 1][1].type && s[f][1].start.line !== s[f][1].end.line && (h = f + 1, k.push(h), p._tokenizer = void 0, p.previous = void 0, p = p.next);
  for (o.events = [], p ? (p._tokenizer = void 0, p.previous = void 0) : k.pop(), f = k.length; f--; ) {
    const y = s.slice(k[f], k[f + 1]), S = a.pop();
    l.push([S, S + y.length - 1]), e.splice(S, 2, y);
  }
  for (l.reverse(), f = -1; ++f < l.length; )
    c[m + l[f][0]] = m + l[f][1], m += l[f][1] - l[f][0] - 1;
  return c;
}
const Pc = {
  resolve: Fc,
  tokenize: zc
}, Bc = {
  partial: !0,
  tokenize: Uc
};
function Fc(e) {
  return sa(e), e;
}
function zc(e, t) {
  let n;
  return r;
  function r(s) {
    return e.enter("content"), n = e.enter("chunkContent", {
      contentType: "content"
    }), i(s);
  }
  function i(s) {
    return s === null ? a(s) : X(s) ? e.check(Bc, o, a)(s) : (e.consume(s), i);
  }
  function a(s) {
    return e.exit("chunkContent"), e.exit("content"), t(s);
  }
  function o(s) {
    return e.consume(s), e.exit("chunkContent"), n.next = e.enter("chunkContent", {
      contentType: "content",
      previous: n
    }), n = n.next, i;
  }
}
function Uc(e, t, n) {
  const r = this;
  return i;
  function i(o) {
    return e.exit("chunkContent"), e.enter("lineEnding"), e.consume(o), e.exit("lineEnding"), pe(e, a, "linePrefix");
  }
  function a(o) {
    if (o === null || X(o))
      return n(o);
    const s = r.events[r.events.length - 1];
    return !r.parser.constructs.disable.null.includes("codeIndented") && s && s[1].type === "linePrefix" && s[2].sliceSerialize(s[1], !0).length >= 4 ? t(o) : e.interrupt(r.parser.constructs.flow, n, t)(o);
  }
}
function la(e, t, n, r, i, a, o, s, l) {
  const c = l || Number.POSITIVE_INFINITY;
  let u = 0;
  return d;
  function d(y) {
    return y === 60 ? (e.enter(r), e.enter(i), e.enter(a), e.consume(y), e.exit(a), f) : y === null || y === 32 || y === 41 || Bn(y) ? n(y) : (e.enter(r), e.enter(o), e.enter(s), e.enter("chunkString", {
      contentType: "string"
    }), h(y));
  }
  function f(y) {
    return y === 62 ? (e.enter(a), e.consume(y), e.exit(a), e.exit(i), e.exit(r), t) : (e.enter(s), e.enter("chunkString", {
      contentType: "string"
    }), p(y));
  }
  function p(y) {
    return y === 62 ? (e.exit("chunkString"), e.exit(s), f(y)) : y === null || y === 60 || X(y) ? n(y) : (e.consume(y), y === 92 ? m : p);
  }
  function m(y) {
    return y === 60 || y === 62 || y === 92 ? (e.consume(y), p) : p(y);
  }
  function h(y) {
    return !u && (y === null || y === 41 || xe(y)) ? (e.exit("chunkString"), e.exit(s), e.exit(o), e.exit(r), t(y)) : u < c && y === 40 ? (e.consume(y), u++, h) : y === 41 ? (e.consume(y), u--, h) : y === null || y === 32 || y === 40 || Bn(y) ? n(y) : (e.consume(y), y === 92 ? k : h);
  }
  function k(y) {
    return y === 40 || y === 41 || y === 92 ? (e.consume(y), h) : h(y);
  }
}
function ca(e, t, n, r, i, a) {
  const o = this;
  let s = 0, l;
  return c;
  function c(p) {
    return e.enter(r), e.enter(i), e.consume(p), e.exit(i), e.enter(a), u;
  }
  function u(p) {
    return s > 999 || p === null || p === 91 || p === 93 && !l || // To do: remove in the future once we’ve switched from
    // `micromark-extension-footnote` to `micromark-extension-gfm-footnote`,
    // which doesn’t need this.
    // Hidden footnotes hook.
    /* c8 ignore next 3 */
    p === 94 && !s && "_hiddenFootnoteSupport" in o.parser.constructs ? n(p) : p === 93 ? (e.exit(a), e.enter(i), e.consume(p), e.exit(i), e.exit(r), t) : X(p) ? (e.enter("lineEnding"), e.consume(p), e.exit("lineEnding"), u) : (e.enter("chunkString", {
      contentType: "string"
    }), d(p));
  }
  function d(p) {
    return p === null || p === 91 || p === 93 || X(p) || s++ > 999 ? (e.exit("chunkString"), u(p)) : (e.consume(p), l || (l = !ue(p)), p === 92 ? f : d);
  }
  function f(p) {
    return p === 91 || p === 92 || p === 93 ? (e.consume(p), s++, d) : d(p);
  }
}
function ua(e, t, n, r, i, a) {
  let o;
  return s;
  function s(f) {
    return f === 34 || f === 39 || f === 40 ? (e.enter(r), e.enter(i), e.consume(f), e.exit(i), o = f === 40 ? 41 : f, l) : n(f);
  }
  function l(f) {
    return f === o ? (e.enter(i), e.consume(f), e.exit(i), e.exit(r), t) : (e.enter(a), c(f));
  }
  function c(f) {
    return f === o ? (e.exit(a), l(o)) : f === null ? n(f) : X(f) ? (e.enter("lineEnding"), e.consume(f), e.exit("lineEnding"), pe(e, c, "linePrefix")) : (e.enter("chunkString", {
      contentType: "string"
    }), u(f));
  }
  function u(f) {
    return f === o || f === null || X(f) ? (e.exit("chunkString"), c(f)) : (e.consume(f), f === 92 ? d : u);
  }
  function d(f) {
    return f === o || f === 92 ? (e.consume(f), u) : u(f);
  }
}
function ln(e, t) {
  let n;
  return r;
  function r(i) {
    return X(i) ? (e.enter("lineEnding"), e.consume(i), e.exit("lineEnding"), n = !0, r) : ue(i) ? pe(e, r, n ? "linePrefix" : "lineSuffix")(i) : t(i);
  }
}
const $c = {
  name: "definition",
  tokenize: Gc
}, Hc = {
  partial: !0,
  tokenize: Kc
};
function Gc(e, t, n) {
  const r = this;
  let i;
  return a;
  function a(p) {
    return e.enter("definition"), o(p);
  }
  function o(p) {
    return ca.call(
      r,
      e,
      s,
      // Note: we don’t need to reset the way `markdown-rs` does.
      n,
      "definitionLabel",
      "definitionLabelMarker",
      "definitionLabelString"
    )(p);
  }
  function s(p) {
    return i = it(r.sliceSerialize(r.events[r.events.length - 1][1]).slice(1, -1)), p === 58 ? (e.enter("definitionMarker"), e.consume(p), e.exit("definitionMarker"), l) : n(p);
  }
  function l(p) {
    return xe(p) ? ln(e, c)(p) : c(p);
  }
  function c(p) {
    return la(
      e,
      u,
      // Note: we don’t need to reset the way `markdown-rs` does.
      n,
      "definitionDestination",
      "definitionDestinationLiteral",
      "definitionDestinationLiteralMarker",
      "definitionDestinationRaw",
      "definitionDestinationString"
    )(p);
  }
  function u(p) {
    return e.attempt(Hc, d, d)(p);
  }
  function d(p) {
    return ue(p) ? pe(e, f, "whitespace")(p) : f(p);
  }
  function f(p) {
    return p === null || X(p) ? (e.exit("definition"), r.parser.defined.push(i), t(p)) : n(p);
  }
}
function Kc(e, t, n) {
  return r;
  function r(s) {
    return xe(s) ? ln(e, i)(s) : n(s);
  }
  function i(s) {
    return ua(e, a, n, "definitionTitle", "definitionTitleMarker", "definitionTitleString")(s);
  }
  function a(s) {
    return ue(s) ? pe(e, o, "whitespace")(s) : o(s);
  }
  function o(s) {
    return s === null || X(s) ? t(s) : n(s);
  }
}
const qc = {
  name: "hardBreakEscape",
  tokenize: Wc
};
function Wc(e, t, n) {
  return r;
  function r(a) {
    return e.enter("hardBreakEscape"), e.consume(a), i;
  }
  function i(a) {
    return X(a) ? (e.exit("hardBreakEscape"), t(a)) : n(a);
  }
}
const Vc = {
  name: "headingAtx",
  resolve: Yc,
  tokenize: jc
};
function Yc(e, t) {
  let n = e.length - 2, r = 3, i, a;
  return e[r][1].type === "whitespace" && (r += 2), n - 2 > r && e[n][1].type === "whitespace" && (n -= 2), e[n][1].type === "atxHeadingSequence" && (r === n - 1 || n - 4 > r && e[n - 2][1].type === "whitespace") && (n -= r + 1 === n ? 2 : 4), n > r && (i = {
    type: "atxHeadingText",
    start: e[r][1].start,
    end: e[n][1].end
  }, a = {
    type: "chunkText",
    start: e[r][1].start,
    end: e[n][1].end,
    contentType: "text"
  }, Je(e, r, n - r + 1, [["enter", i, t], ["enter", a, t], ["exit", a, t], ["exit", i, t]])), e;
}
function jc(e, t, n) {
  let r = 0;
  return i;
  function i(u) {
    return e.enter("atxHeading"), a(u);
  }
  function a(u) {
    return e.enter("atxHeadingSequence"), o(u);
  }
  function o(u) {
    return u === 35 && r++ < 6 ? (e.consume(u), o) : u === null || xe(u) ? (e.exit("atxHeadingSequence"), s(u)) : n(u);
  }
  function s(u) {
    return u === 35 ? (e.enter("atxHeadingSequence"), l(u)) : u === null || X(u) ? (e.exit("atxHeading"), t(u)) : ue(u) ? pe(e, s, "whitespace")(u) : (e.enter("atxHeadingText"), c(u));
  }
  function l(u) {
    return u === 35 ? (e.consume(u), l) : (e.exit("atxHeadingSequence"), s(u));
  }
  function c(u) {
    return u === null || u === 35 || xe(u) ? (e.exit("atxHeadingText"), s(u)) : (e.consume(u), c);
  }
}
const Zc = [
  "address",
  "article",
  "aside",
  "base",
  "basefont",
  "blockquote",
  "body",
  "caption",
  "center",
  "col",
  "colgroup",
  "dd",
  "details",
  "dialog",
  "dir",
  "div",
  "dl",
  "dt",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "frame",
  "frameset",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hr",
  "html",
  "iframe",
  "legend",
  "li",
  "link",
  "main",
  "menu",
  "menuitem",
  "nav",
  "noframes",
  "ol",
  "optgroup",
  "option",
  "p",
  "param",
  "search",
  "section",
  "summary",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "title",
  "tr",
  "track",
  "ul"
], Vi = ["pre", "script", "style", "textarea"], Xc = {
  concrete: !0,
  name: "htmlFlow",
  resolveTo: eu,
  tokenize: tu
}, Qc = {
  partial: !0,
  tokenize: ru
}, Jc = {
  partial: !0,
  tokenize: nu
};
function eu(e) {
  let t = e.length;
  for (; t-- && !(e[t][0] === "enter" && e[t][1].type === "htmlFlow"); )
    ;
  return t > 1 && e[t - 2][1].type === "linePrefix" && (e[t][1].start = e[t - 2][1].start, e[t + 1][1].start = e[t - 2][1].start, e.splice(t - 2, 2)), e;
}
function tu(e, t, n) {
  const r = this;
  let i, a, o, s, l;
  return c;
  function c(b) {
    return u(b);
  }
  function u(b) {
    return e.enter("htmlFlow"), e.enter("htmlFlowData"), e.consume(b), d;
  }
  function d(b) {
    return b === 33 ? (e.consume(b), f) : b === 47 ? (e.consume(b), a = !0, h) : b === 63 ? (e.consume(b), i = 3, r.interrupt ? t : g) : He(b) ? (e.consume(b), o = String.fromCharCode(b), k) : n(b);
  }
  function f(b) {
    return b === 45 ? (e.consume(b), i = 2, p) : b === 91 ? (e.consume(b), i = 5, s = 0, m) : He(b) ? (e.consume(b), i = 4, r.interrupt ? t : g) : n(b);
  }
  function p(b) {
    return b === 45 ? (e.consume(b), r.interrupt ? t : g) : n(b);
  }
  function m(b) {
    const le = "CDATA[";
    return b === le.charCodeAt(s++) ? (e.consume(b), s === le.length ? r.interrupt ? t : F : m) : n(b);
  }
  function h(b) {
    return He(b) ? (e.consume(b), o = String.fromCharCode(b), k) : n(b);
  }
  function k(b) {
    if (b === null || b === 47 || b === 62 || xe(b)) {
      const le = b === 47, _e = o.toLowerCase();
      return !le && !a && Vi.includes(_e) ? (i = 1, r.interrupt ? t(b) : F(b)) : Zc.includes(o.toLowerCase()) ? (i = 6, le ? (e.consume(b), y) : r.interrupt ? t(b) : F(b)) : (i = 7, r.interrupt && !r.parser.lazy[r.now().line] ? n(b) : a ? S(b) : w(b));
    }
    return b === 45 || Fe(b) ? (e.consume(b), o += String.fromCharCode(b), k) : n(b);
  }
  function y(b) {
    return b === 62 ? (e.consume(b), r.interrupt ? t : F) : n(b);
  }
  function S(b) {
    return ue(b) ? (e.consume(b), S) : x(b);
  }
  function w(b) {
    return b === 47 ? (e.consume(b), x) : b === 58 || b === 95 || He(b) ? (e.consume(b), N) : ue(b) ? (e.consume(b), w) : x(b);
  }
  function N(b) {
    return b === 45 || b === 46 || b === 58 || b === 95 || Fe(b) ? (e.consume(b), N) : A(b);
  }
  function A(b) {
    return b === 61 ? (e.consume(b), _) : ue(b) ? (e.consume(b), A) : w(b);
  }
  function _(b) {
    return b === null || b === 60 || b === 61 || b === 62 || b === 96 ? n(b) : b === 34 || b === 39 ? (e.consume(b), l = b, L) : ue(b) ? (e.consume(b), _) : v(b);
  }
  function L(b) {
    return b === l ? (e.consume(b), l = null, R) : b === null || X(b) ? n(b) : (e.consume(b), L);
  }
  function v(b) {
    return b === null || b === 34 || b === 39 || b === 47 || b === 60 || b === 61 || b === 62 || b === 96 || xe(b) ? A(b) : (e.consume(b), v);
  }
  function R(b) {
    return b === 47 || b === 62 || ue(b) ? w(b) : n(b);
  }
  function x(b) {
    return b === 62 ? (e.consume(b), O) : n(b);
  }
  function O(b) {
    return b === null || X(b) ? F(b) : ue(b) ? (e.consume(b), O) : n(b);
  }
  function F(b) {
    return b === 45 && i === 2 ? (e.consume(b), Q) : b === 60 && i === 1 ? (e.consume(b), se) : b === 62 && i === 4 ? (e.consume(b), G) : b === 63 && i === 3 ? (e.consume(b), g) : b === 93 && i === 5 ? (e.consume(b), fe) : X(b) && (i === 6 || i === 7) ? (e.exit("htmlFlowData"), e.check(Qc, j, U)(b)) : b === null || X(b) ? (e.exit("htmlFlowData"), U(b)) : (e.consume(b), F);
  }
  function U(b) {
    return e.check(Jc, D, j)(b);
  }
  function D(b) {
    return e.enter("lineEnding"), e.consume(b), e.exit("lineEnding"), $;
  }
  function $(b) {
    return b === null || X(b) ? U(b) : (e.enter("htmlFlowData"), F(b));
  }
  function Q(b) {
    return b === 45 ? (e.consume(b), g) : F(b);
  }
  function se(b) {
    return b === 47 ? (e.consume(b), o = "", I) : F(b);
  }
  function I(b) {
    if (b === 62) {
      const le = o.toLowerCase();
      return Vi.includes(le) ? (e.consume(b), G) : F(b);
    }
    return He(b) && o.length < 8 ? (e.consume(b), o += String.fromCharCode(b), I) : F(b);
  }
  function fe(b) {
    return b === 93 ? (e.consume(b), g) : F(b);
  }
  function g(b) {
    return b === 62 ? (e.consume(b), G) : b === 45 && i === 2 ? (e.consume(b), g) : F(b);
  }
  function G(b) {
    return b === null || X(b) ? (e.exit("htmlFlowData"), j(b)) : (e.consume(b), G);
  }
  function j(b) {
    return e.exit("htmlFlow"), t(b);
  }
}
function nu(e, t, n) {
  const r = this;
  return i;
  function i(o) {
    return X(o) ? (e.enter("lineEnding"), e.consume(o), e.exit("lineEnding"), a) : n(o);
  }
  function a(o) {
    return r.parser.lazy[r.now().line] ? n(o) : t(o);
  }
}
function ru(e, t, n) {
  return r;
  function r(i) {
    return e.enter("lineEnding"), e.consume(i), e.exit("lineEnding"), e.attempt(fn, t, n);
  }
}
const iu = {
  name: "htmlText",
  tokenize: ou
};
function ou(e, t, n) {
  const r = this;
  let i, a, o;
  return s;
  function s(g) {
    return e.enter("htmlText"), e.enter("htmlTextData"), e.consume(g), l;
  }
  function l(g) {
    return g === 33 ? (e.consume(g), c) : g === 47 ? (e.consume(g), A) : g === 63 ? (e.consume(g), w) : He(g) ? (e.consume(g), v) : n(g);
  }
  function c(g) {
    return g === 45 ? (e.consume(g), u) : g === 91 ? (e.consume(g), a = 0, m) : He(g) ? (e.consume(g), S) : n(g);
  }
  function u(g) {
    return g === 45 ? (e.consume(g), p) : n(g);
  }
  function d(g) {
    return g === null ? n(g) : g === 45 ? (e.consume(g), f) : X(g) ? (o = d, se(g)) : (e.consume(g), d);
  }
  function f(g) {
    return g === 45 ? (e.consume(g), p) : d(g);
  }
  function p(g) {
    return g === 62 ? Q(g) : g === 45 ? f(g) : d(g);
  }
  function m(g) {
    const G = "CDATA[";
    return g === G.charCodeAt(a++) ? (e.consume(g), a === G.length ? h : m) : n(g);
  }
  function h(g) {
    return g === null ? n(g) : g === 93 ? (e.consume(g), k) : X(g) ? (o = h, se(g)) : (e.consume(g), h);
  }
  function k(g) {
    return g === 93 ? (e.consume(g), y) : h(g);
  }
  function y(g) {
    return g === 62 ? Q(g) : g === 93 ? (e.consume(g), y) : h(g);
  }
  function S(g) {
    return g === null || g === 62 ? Q(g) : X(g) ? (o = S, se(g)) : (e.consume(g), S);
  }
  function w(g) {
    return g === null ? n(g) : g === 63 ? (e.consume(g), N) : X(g) ? (o = w, se(g)) : (e.consume(g), w);
  }
  function N(g) {
    return g === 62 ? Q(g) : w(g);
  }
  function A(g) {
    return He(g) ? (e.consume(g), _) : n(g);
  }
  function _(g) {
    return g === 45 || Fe(g) ? (e.consume(g), _) : L(g);
  }
  function L(g) {
    return X(g) ? (o = L, se(g)) : ue(g) ? (e.consume(g), L) : Q(g);
  }
  function v(g) {
    return g === 45 || Fe(g) ? (e.consume(g), v) : g === 47 || g === 62 || xe(g) ? R(g) : n(g);
  }
  function R(g) {
    return g === 47 ? (e.consume(g), Q) : g === 58 || g === 95 || He(g) ? (e.consume(g), x) : X(g) ? (o = R, se(g)) : ue(g) ? (e.consume(g), R) : Q(g);
  }
  function x(g) {
    return g === 45 || g === 46 || g === 58 || g === 95 || Fe(g) ? (e.consume(g), x) : O(g);
  }
  function O(g) {
    return g === 61 ? (e.consume(g), F) : X(g) ? (o = O, se(g)) : ue(g) ? (e.consume(g), O) : R(g);
  }
  function F(g) {
    return g === null || g === 60 || g === 61 || g === 62 || g === 96 ? n(g) : g === 34 || g === 39 ? (e.consume(g), i = g, U) : X(g) ? (o = F, se(g)) : ue(g) ? (e.consume(g), F) : (e.consume(g), D);
  }
  function U(g) {
    return g === i ? (e.consume(g), i = void 0, $) : g === null ? n(g) : X(g) ? (o = U, se(g)) : (e.consume(g), U);
  }
  function D(g) {
    return g === null || g === 34 || g === 39 || g === 60 || g === 61 || g === 96 ? n(g) : g === 47 || g === 62 || xe(g) ? R(g) : (e.consume(g), D);
  }
  function $(g) {
    return g === 47 || g === 62 || xe(g) ? R(g) : n(g);
  }
  function Q(g) {
    return g === 62 ? (e.consume(g), e.exit("htmlTextData"), e.exit("htmlText"), t) : n(g);
  }
  function se(g) {
    return e.exit("htmlTextData"), e.enter("lineEnding"), e.consume(g), e.exit("lineEnding"), I;
  }
  function I(g) {
    return ue(g) ? pe(e, fe, "linePrefix", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(g) : fe(g);
  }
  function fe(g) {
    return e.enter("htmlTextData"), o(g);
  }
}
const ni = {
  name: "labelEnd",
  resolveAll: cu,
  resolveTo: uu,
  tokenize: du
}, au = {
  tokenize: pu
}, su = {
  tokenize: fu
}, lu = {
  tokenize: gu
};
function cu(e) {
  let t = -1;
  const n = [];
  for (; ++t < e.length; ) {
    const r = e[t][1];
    if (n.push(e[t]), r.type === "labelImage" || r.type === "labelLink" || r.type === "labelEnd") {
      const i = r.type === "labelImage" ? 4 : 2;
      r.type = "data", t += i;
    }
  }
  return e.length !== n.length && Je(e, 0, e.length, n), e;
}
function uu(e, t) {
  let n = e.length, r = 0, i, a, o, s;
  for (; n--; )
    if (i = e[n][1], a) {
      if (i.type === "link" || i.type === "labelLink" && i._inactive)
        break;
      e[n][0] === "enter" && i.type === "labelLink" && (i._inactive = !0);
    } else if (o) {
      if (e[n][0] === "enter" && (i.type === "labelImage" || i.type === "labelLink") && !i._balanced && (a = n, i.type !== "labelLink")) {
        r = 2;
        break;
      }
    } else i.type === "labelEnd" && (o = n);
  const l = {
    type: e[a][1].type === "labelLink" ? "link" : "image",
    start: {
      ...e[a][1].start
    },
    end: {
      ...e[e.length - 1][1].end
    }
  }, c = {
    type: "label",
    start: {
      ...e[a][1].start
    },
    end: {
      ...e[o][1].end
    }
  }, u = {
    type: "labelText",
    start: {
      ...e[a + r + 2][1].end
    },
    end: {
      ...e[o - 2][1].start
    }
  };
  return s = [["enter", l, t], ["enter", c, t]], s = et(s, e.slice(a + 1, a + r + 3)), s = et(s, [["enter", u, t]]), s = et(s, qn(t.parser.constructs.insideSpan.null, e.slice(a + r + 4, o - 3), t)), s = et(s, [["exit", u, t], e[o - 2], e[o - 1], ["exit", c, t]]), s = et(s, e.slice(o + 1)), s = et(s, [["exit", l, t]]), Je(e, a, e.length, s), e;
}
function du(e, t, n) {
  const r = this;
  let i = r.events.length, a, o;
  for (; i--; )
    if ((r.events[i][1].type === "labelImage" || r.events[i][1].type === "labelLink") && !r.events[i][1]._balanced) {
      a = r.events[i][1];
      break;
    }
  return s;
  function s(f) {
    return a ? a._inactive ? d(f) : (o = r.parser.defined.includes(it(r.sliceSerialize({
      start: a.end,
      end: r.now()
    }))), e.enter("labelEnd"), e.enter("labelMarker"), e.consume(f), e.exit("labelMarker"), e.exit("labelEnd"), l) : n(f);
  }
  function l(f) {
    return f === 40 ? e.attempt(au, u, o ? u : d)(f) : f === 91 ? e.attempt(su, u, o ? c : d)(f) : o ? u(f) : d(f);
  }
  function c(f) {
    return e.attempt(lu, u, d)(f);
  }
  function u(f) {
    return t(f);
  }
  function d(f) {
    return a._balanced = !0, n(f);
  }
}
function pu(e, t, n) {
  return r;
  function r(d) {
    return e.enter("resource"), e.enter("resourceMarker"), e.consume(d), e.exit("resourceMarker"), i;
  }
  function i(d) {
    return xe(d) ? ln(e, a)(d) : a(d);
  }
  function a(d) {
    return d === 41 ? u(d) : la(e, o, s, "resourceDestination", "resourceDestinationLiteral", "resourceDestinationLiteralMarker", "resourceDestinationRaw", "resourceDestinationString", 32)(d);
  }
  function o(d) {
    return xe(d) ? ln(e, l)(d) : u(d);
  }
  function s(d) {
    return n(d);
  }
  function l(d) {
    return d === 34 || d === 39 || d === 40 ? ua(e, c, n, "resourceTitle", "resourceTitleMarker", "resourceTitleString")(d) : u(d);
  }
  function c(d) {
    return xe(d) ? ln(e, u)(d) : u(d);
  }
  function u(d) {
    return d === 41 ? (e.enter("resourceMarker"), e.consume(d), e.exit("resourceMarker"), e.exit("resource"), t) : n(d);
  }
}
function fu(e, t, n) {
  const r = this;
  return i;
  function i(s) {
    return ca.call(r, e, a, o, "reference", "referenceMarker", "referenceString")(s);
  }
  function a(s) {
    return r.parser.defined.includes(it(r.sliceSerialize(r.events[r.events.length - 1][1]).slice(1, -1))) ? t(s) : n(s);
  }
  function o(s) {
    return n(s);
  }
}
function gu(e, t, n) {
  return r;
  function r(a) {
    return e.enter("reference"), e.enter("referenceMarker"), e.consume(a), e.exit("referenceMarker"), i;
  }
  function i(a) {
    return a === 93 ? (e.enter("referenceMarker"), e.consume(a), e.exit("referenceMarker"), e.exit("reference"), t) : n(a);
  }
}
const mu = {
  name: "labelStartImage",
  resolveAll: ni.resolveAll,
  tokenize: hu
};
function hu(e, t, n) {
  const r = this;
  return i;
  function i(s) {
    return e.enter("labelImage"), e.enter("labelImageMarker"), e.consume(s), e.exit("labelImageMarker"), a;
  }
  function a(s) {
    return s === 91 ? (e.enter("labelMarker"), e.consume(s), e.exit("labelMarker"), e.exit("labelImage"), o) : n(s);
  }
  function o(s) {
    return s === 94 && "_hiddenFootnoteSupport" in r.parser.constructs ? n(s) : t(s);
  }
}
const bu = {
  name: "labelStartLink",
  resolveAll: ni.resolveAll,
  tokenize: yu
};
function yu(e, t, n) {
  const r = this;
  return i;
  function i(o) {
    return e.enter("labelLink"), e.enter("labelMarker"), e.consume(o), e.exit("labelMarker"), e.exit("labelLink"), a;
  }
  function a(o) {
    return o === 94 && "_hiddenFootnoteSupport" in r.parser.constructs ? n(o) : t(o);
  }
}
const ar = {
  name: "lineEnding",
  tokenize: Eu
};
function Eu(e, t) {
  return n;
  function n(r) {
    return e.enter("lineEnding"), e.consume(r), e.exit("lineEnding"), pe(e, t, "linePrefix");
  }
}
const Dn = {
  name: "thematicBreak",
  tokenize: _u
};
function _u(e, t, n) {
  let r = 0, i;
  return a;
  function a(c) {
    return e.enter("thematicBreak"), o(c);
  }
  function o(c) {
    return i = c, s(c);
  }
  function s(c) {
    return c === i ? (e.enter("thematicBreakSequence"), l(c)) : r >= 3 && (c === null || X(c)) ? (e.exit("thematicBreak"), t(c)) : n(c);
  }
  function l(c) {
    return c === i ? (e.consume(c), r++, l) : (e.exit("thematicBreakSequence"), ue(c) ? pe(e, s, "whitespace")(c) : s(c));
  }
}
const qe = {
  continuation: {
    tokenize: Su
  },
  exit: Tu,
  name: "list",
  tokenize: wu
}, ku = {
  partial: !0,
  tokenize: Nu
}, xu = {
  partial: !0,
  tokenize: vu
};
function wu(e, t, n) {
  const r = this, i = r.events[r.events.length - 1];
  let a = i && i[1].type === "linePrefix" ? i[2].sliceSerialize(i[1], !0).length : 0, o = 0;
  return s;
  function s(p) {
    const m = r.containerState.type || (p === 42 || p === 43 || p === 45 ? "listUnordered" : "listOrdered");
    if (m === "listUnordered" ? !r.containerState.marker || p === r.containerState.marker : Rr(p)) {
      if (r.containerState.type || (r.containerState.type = m, e.enter(m, {
        _container: !0
      })), m === "listUnordered")
        return e.enter("listItemPrefix"), p === 42 || p === 45 ? e.check(Dn, n, c)(p) : c(p);
      if (!r.interrupt || p === 49)
        return e.enter("listItemPrefix"), e.enter("listItemValue"), l(p);
    }
    return n(p);
  }
  function l(p) {
    return Rr(p) && ++o < 10 ? (e.consume(p), l) : (!r.interrupt || o < 2) && (r.containerState.marker ? p === r.containerState.marker : p === 41 || p === 46) ? (e.exit("listItemValue"), c(p)) : n(p);
  }
  function c(p) {
    return e.enter("listItemMarker"), e.consume(p), e.exit("listItemMarker"), r.containerState.marker = r.containerState.marker || p, e.check(
      fn,
      // Can’t be empty when interrupting.
      r.interrupt ? n : u,
      e.attempt(ku, f, d)
    );
  }
  function u(p) {
    return r.containerState.initialBlankLine = !0, a++, f(p);
  }
  function d(p) {
    return ue(p) ? (e.enter("listItemPrefixWhitespace"), e.consume(p), e.exit("listItemPrefixWhitespace"), f) : n(p);
  }
  function f(p) {
    return r.containerState.size = a + r.sliceSerialize(e.exit("listItemPrefix"), !0).length, t(p);
  }
}
function Su(e, t, n) {
  const r = this;
  return r.containerState._closeFlow = void 0, e.check(fn, i, a);
  function i(s) {
    return r.containerState.furtherBlankLines = r.containerState.furtherBlankLines || r.containerState.initialBlankLine, pe(e, t, "listItemIndent", r.containerState.size + 1)(s);
  }
  function a(s) {
    return r.containerState.furtherBlankLines || !ue(s) ? (r.containerState.furtherBlankLines = void 0, r.containerState.initialBlankLine = void 0, o(s)) : (r.containerState.furtherBlankLines = void 0, r.containerState.initialBlankLine = void 0, e.attempt(xu, t, o)(s));
  }
  function o(s) {
    return r.containerState._closeFlow = !0, r.interrupt = void 0, pe(e, e.attempt(qe, t, n), "linePrefix", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(s);
  }
}
function vu(e, t, n) {
  const r = this;
  return pe(e, i, "listItemIndent", r.containerState.size + 1);
  function i(a) {
    const o = r.events[r.events.length - 1];
    return o && o[1].type === "listItemIndent" && o[2].sliceSerialize(o[1], !0).length === r.containerState.size ? t(a) : n(a);
  }
}
function Tu(e) {
  e.exit(this.containerState.type);
}
function Nu(e, t, n) {
  const r = this;
  return pe(e, i, "listItemPrefixWhitespace", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 5);
  function i(a) {
    const o = r.events[r.events.length - 1];
    return !ue(a) && o && o[1].type === "listItemPrefixWhitespace" ? t(a) : n(a);
  }
}
const Yi = {
  name: "setextUnderline",
  resolveTo: Au,
  tokenize: Cu
};
function Au(e, t) {
  let n = e.length, r, i, a;
  for (; n--; )
    if (e[n][0] === "enter") {
      if (e[n][1].type === "content") {
        r = n;
        break;
      }
      e[n][1].type === "paragraph" && (i = n);
    } else
      e[n][1].type === "content" && e.splice(n, 1), !a && e[n][1].type === "definition" && (a = n);
  const o = {
    type: "setextHeading",
    start: {
      ...e[r][1].start
    },
    end: {
      ...e[e.length - 1][1].end
    }
  };
  return e[i][1].type = "setextHeadingText", a ? (e.splice(i, 0, ["enter", o, t]), e.splice(a + 1, 0, ["exit", e[r][1], t]), e[r][1].end = {
    ...e[a][1].end
  }) : e[r][1] = o, e.push(["exit", o, t]), e;
}
function Cu(e, t, n) {
  const r = this;
  let i;
  return a;
  function a(c) {
    let u = r.events.length, d;
    for (; u--; )
      if (r.events[u][1].type !== "lineEnding" && r.events[u][1].type !== "linePrefix" && r.events[u][1].type !== "content") {
        d = r.events[u][1].type === "paragraph";
        break;
      }
    return !r.parser.lazy[r.now().line] && (r.interrupt || d) ? (e.enter("setextHeadingLine"), i = c, o(c)) : n(c);
  }
  function o(c) {
    return e.enter("setextHeadingLineSequence"), s(c);
  }
  function s(c) {
    return c === i ? (e.consume(c), s) : (e.exit("setextHeadingLineSequence"), ue(c) ? pe(e, l, "lineSuffix")(c) : l(c));
  }
  function l(c) {
    return c === null || X(c) ? (e.exit("setextHeadingLine"), t(c)) : n(c);
  }
}
const Ru = {
  tokenize: Ou
};
function Ou(e) {
  const t = this, n = e.attempt(
    // Try to parse a blank line.
    fn,
    r,
    // Try to parse initial flow (essentially, only code).
    e.attempt(this.parser.constructs.flowInitial, i, pe(e, e.attempt(this.parser.constructs.flow, i, e.attempt(Pc, i)), "linePrefix"))
  );
  return n;
  function r(a) {
    if (a === null) {
      e.consume(a);
      return;
    }
    return e.enter("lineEndingBlank"), e.consume(a), e.exit("lineEndingBlank"), t.currentConstruct = void 0, n;
  }
  function i(a) {
    if (a === null) {
      e.consume(a);
      return;
    }
    return e.enter("lineEnding"), e.consume(a), e.exit("lineEnding"), t.currentConstruct = void 0, n;
  }
}
const Iu = {
  resolveAll: pa()
}, Mu = da("string"), Lu = da("text");
function da(e) {
  return {
    resolveAll: pa(e === "text" ? Du : void 0),
    tokenize: t
  };
  function t(n) {
    const r = this, i = this.parser.constructs[e], a = n.attempt(i, o, s);
    return o;
    function o(u) {
      return c(u) ? a(u) : s(u);
    }
    function s(u) {
      if (u === null) {
        n.consume(u);
        return;
      }
      return n.enter("data"), n.consume(u), l;
    }
    function l(u) {
      return c(u) ? (n.exit("data"), a(u)) : (n.consume(u), l);
    }
    function c(u) {
      if (u === null)
        return !0;
      const d = i[u];
      let f = -1;
      if (d)
        for (; ++f < d.length; ) {
          const p = d[f];
          if (!p.previous || p.previous.call(r, r.previous))
            return !0;
        }
      return !1;
    }
  }
}
function pa(e) {
  return t;
  function t(n, r) {
    let i = -1, a;
    for (; ++i <= n.length; )
      a === void 0 ? n[i] && n[i][1].type === "data" && (a = i, i++) : (!n[i] || n[i][1].type !== "data") && (i !== a + 2 && (n[a][1].end = n[i - 1][1].end, n.splice(a + 2, i - a - 2), i = a + 2), a = void 0);
    return e ? e(n, r) : n;
  }
}
function Du(e, t) {
  let n = 0;
  for (; ++n <= e.length; )
    if ((n === e.length || e[n][1].type === "lineEnding") && e[n - 1][1].type === "data") {
      const r = e[n - 1][1], i = t.sliceStream(r);
      let a = i.length, o = -1, s = 0, l;
      for (; a--; ) {
        const c = i[a];
        if (typeof c == "string") {
          for (o = c.length; c.charCodeAt(o - 1) === 32; )
            s++, o--;
          if (o) break;
          o = -1;
        } else if (c === -2)
          l = !0, s++;
        else if (c !== -1) {
          a++;
          break;
        }
      }
      if (t._contentTypeTextTrailing && n === e.length && (s = 0), s) {
        const c = {
          type: n === e.length || l || s < 2 ? "lineSuffix" : "hardBreakTrailing",
          start: {
            _bufferIndex: a ? o : r.start._bufferIndex + o,
            _index: r.start._index + a,
            line: r.end.line,
            column: r.end.column - s,
            offset: r.end.offset - s
          },
          end: {
            ...r.end
          }
        };
        r.end = {
          ...c.start
        }, r.start.offset === r.end.offset ? Object.assign(r, c) : (e.splice(n, 0, ["enter", c, t], ["exit", c, t]), n += 2);
      }
      n++;
    }
  return e;
}
const Pu = {
  42: qe,
  43: qe,
  45: qe,
  48: qe,
  49: qe,
  50: qe,
  51: qe,
  52: qe,
  53: qe,
  54: qe,
  55: qe,
  56: qe,
  57: qe,
  62: ia
}, Bu = {
  91: $c
}, Fu = {
  [-2]: or,
  [-1]: or,
  32: or
}, zu = {
  35: Vc,
  42: Dn,
  45: [Yi, Dn],
  60: Xc,
  61: Yi,
  95: Dn,
  96: Wi,
  126: Wi
}, Uu = {
  38: aa,
  92: oa
}, $u = {
  [-5]: ar,
  [-4]: ar,
  [-3]: ar,
  33: mu,
  38: aa,
  42: Or,
  60: [bc, iu],
  91: bu,
  92: [qc, oa],
  93: ni,
  95: Or,
  96: Rc
}, Hu = {
  null: [Or, Iu]
}, Gu = {
  null: [42, 95]
}, Ku = {
  null: []
}, qu = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  attentionMarkers: Gu,
  contentInitial: Bu,
  disable: Ku,
  document: Pu,
  flow: zu,
  flowInitial: Fu,
  insideSpan: Hu,
  string: Uu,
  text: $u
}, Symbol.toStringTag, { value: "Module" }));
function Wu(e, t, n) {
  let r = {
    _bufferIndex: -1,
    _index: 0,
    line: n && n.line || 1,
    column: n && n.column || 1,
    offset: n && n.offset || 0
  };
  const i = {}, a = [];
  let o = [], s = [];
  const l = {
    attempt: L(A),
    check: L(_),
    consume: S,
    enter: w,
    exit: N,
    interrupt: L(_, {
      interrupt: !0
    })
  }, c = {
    code: null,
    containerState: {},
    defineSkip: h,
    events: [],
    now: m,
    parser: e,
    previous: null,
    sliceSerialize: f,
    sliceStream: p,
    write: d
  };
  let u = t.tokenize.call(c, l);
  return t.resolveAll && a.push(t), c;
  function d(O) {
    return o = et(o, O), k(), o[o.length - 1] !== null ? [] : (v(t, 0), c.events = qn(a, c.events, c), c.events);
  }
  function f(O, F) {
    return Yu(p(O), F);
  }
  function p(O) {
    return Vu(o, O);
  }
  function m() {
    const {
      _bufferIndex: O,
      _index: F,
      line: U,
      column: D,
      offset: $
    } = r;
    return {
      _bufferIndex: O,
      _index: F,
      line: U,
      column: D,
      offset: $
    };
  }
  function h(O) {
    i[O.line] = O.column, x();
  }
  function k() {
    let O;
    for (; r._index < o.length; ) {
      const F = o[r._index];
      if (typeof F == "string")
        for (O = r._index, r._bufferIndex < 0 && (r._bufferIndex = 0); r._index === O && r._bufferIndex < F.length; )
          y(F.charCodeAt(r._bufferIndex));
      else
        y(F);
    }
  }
  function y(O) {
    u = u(O);
  }
  function S(O) {
    X(O) ? (r.line++, r.column = 1, r.offset += O === -3 ? 2 : 1, x()) : O !== -1 && (r.column++, r.offset++), r._bufferIndex < 0 ? r._index++ : (r._bufferIndex++, r._bufferIndex === // Points w/ non-negative `_bufferIndex` reference
    // strings.
    /** @type {string} */
    o[r._index].length && (r._bufferIndex = -1, r._index++)), c.previous = O;
  }
  function w(O, F) {
    const U = F || {};
    return U.type = O, U.start = m(), c.events.push(["enter", U, c]), s.push(U), U;
  }
  function N(O) {
    const F = s.pop();
    return F.end = m(), c.events.push(["exit", F, c]), F;
  }
  function A(O, F) {
    v(O, F.from);
  }
  function _(O, F) {
    F.restore();
  }
  function L(O, F) {
    return U;
    function U(D, $, Q) {
      let se, I, fe, g;
      return Array.isArray(D) ? (
        /* c8 ignore next 1 */
        j(D)
      ) : "tokenize" in D ? (
        // Looks like a construct.
        j([
          /** @type {Construct} */
          D
        ])
      ) : G(D);
      function G(be) {
        return me;
        function me(ge) {
          const Ne = ge !== null && be[ge], Te = ge !== null && be.null, Ke = [
            // To do: add more extension tests.
            /* c8 ignore next 2 */
            ...Array.isArray(Ne) ? Ne : Ne ? [Ne] : [],
            ...Array.isArray(Te) ? Te : Te ? [Te] : []
          ];
          return j(Ke)(ge);
        }
      }
      function j(be) {
        return se = be, I = 0, be.length === 0 ? Q : b(be[I]);
      }
      function b(be) {
        return me;
        function me(ge) {
          return g = R(), fe = be, be.partial || (c.currentConstruct = be), be.name && c.parser.constructs.disable.null.includes(be.name) ? _e() : be.tokenize.call(
            // If we do have fields, create an object w/ `context` as its
            // prototype.
            // This allows a “live binding”, which is needed for `interrupt`.
            F ? Object.assign(Object.create(c), F) : c,
            l,
            le,
            _e
          )(ge);
        }
      }
      function le(be) {
        return O(fe, g), $;
      }
      function _e(be) {
        return g.restore(), ++I < se.length ? b(se[I]) : Q;
      }
    }
  }
  function v(O, F) {
    O.resolveAll && !a.includes(O) && a.push(O), O.resolve && Je(c.events, F, c.events.length - F, O.resolve(c.events.slice(F), c)), O.resolveTo && (c.events = O.resolveTo(c.events, c));
  }
  function R() {
    const O = m(), F = c.previous, U = c.currentConstruct, D = c.events.length, $ = Array.from(s);
    return {
      from: D,
      restore: Q
    };
    function Q() {
      r = O, c.previous = F, c.currentConstruct = U, c.events.length = D, s = $, x();
    }
  }
  function x() {
    r.line in i && r.column < 2 && (r.column = i[r.line], r.offset += i[r.line] - 1);
  }
}
function Vu(e, t) {
  const n = t.start._index, r = t.start._bufferIndex, i = t.end._index, a = t.end._bufferIndex;
  let o;
  if (n === i)
    o = [e[n].slice(r, a)];
  else {
    if (o = e.slice(n, i), r > -1) {
      const s = o[0];
      typeof s == "string" ? o[0] = s.slice(r) : o.shift();
    }
    a > 0 && o.push(e[i].slice(0, a));
  }
  return o;
}
function Yu(e, t) {
  let n = -1;
  const r = [];
  let i;
  for (; ++n < e.length; ) {
    const a = e[n];
    let o;
    if (typeof a == "string")
      o = a;
    else switch (a) {
      case -5: {
        o = "\r";
        break;
      }
      case -4: {
        o = `
`;
        break;
      }
      case -3: {
        o = `\r
`;
        break;
      }
      case -2: {
        o = t ? " " : "	";
        break;
      }
      case -1: {
        if (!t && i) continue;
        o = " ";
        break;
      }
      default:
        o = String.fromCharCode(a);
    }
    i = a === -2, r.push(o);
  }
  return r.join("");
}
function ju(e) {
  const r = {
    constructs: (
      /** @type {FullNormalizedExtension} */
      na([qu, ...(e || {}).extensions || []])
    ),
    content: i(uc),
    defined: [],
    document: i(pc),
    flow: i(Ru),
    lazy: {},
    string: i(Mu),
    text: i(Lu)
  };
  return r;
  function i(a) {
    return o;
    function o(s) {
      return Wu(r, a, s);
    }
  }
}
function Zu(e) {
  for (; !sa(e); )
    ;
  return e;
}
const ji = /[\0\t\n\r]/g;
function Xu() {
  let e = 1, t = "", n = !0, r;
  return i;
  function i(a, o, s) {
    const l = [];
    let c, u, d, f, p;
    for (a = t + (typeof a == "string" ? a.toString() : new TextDecoder(o || void 0).decode(a)), d = 0, t = "", n && (a.charCodeAt(0) === 65279 && d++, n = void 0); d < a.length; ) {
      if (ji.lastIndex = d, c = ji.exec(a), f = c && c.index !== void 0 ? c.index : a.length, p = a.charCodeAt(f), !c) {
        t = a.slice(d);
        break;
      }
      if (p === 10 && d === f && r)
        l.push(-3), r = void 0;
      else
        switch (r && (l.push(-5), r = void 0), d < f && (l.push(a.slice(d, f)), e += f - d), p) {
          case 0: {
            l.push(65533), e++;
            break;
          }
          case 9: {
            for (u = Math.ceil(e / 4) * 4, l.push(-2); e++ < u; ) l.push(-1);
            break;
          }
          case 10: {
            l.push(-4), e = 1;
            break;
          }
          default:
            r = !0, e = 1;
        }
      d = f + 1;
    }
    return s && (r && l.push(-5), t && l.push(t), l.push(null)), l;
  }
}
const Qu = /\\([!-/:-@[-`{-~])|&(#(?:\d{1,7}|x[\da-f]{1,6})|[\da-z]{1,31});/gi;
function Ju(e) {
  return e.replace(Qu, ed);
}
function ed(e, t, n) {
  if (t)
    return t;
  if (n.charCodeAt(0) === 35) {
    const i = n.charCodeAt(1), a = i === 120 || i === 88;
    return ra(n.slice(a ? 2 : 1), a ? 16 : 10);
  }
  return ti(n) || e;
}
const fa = {}.hasOwnProperty;
function td(e, t, n) {
  return typeof t != "string" && (n = t, t = void 0), nd(n)(Zu(ju(n).document().write(Xu()(e, t, !0))));
}
function nd(e) {
  const t = {
    transforms: [],
    canContainEols: ["emphasis", "fragment", "heading", "paragraph", "strong"],
    enter: {
      autolink: a(Mt),
      autolinkProtocol: R,
      autolinkEmail: R,
      atxHeading: a(It),
      blockQuote: a(Te),
      characterEscape: R,
      characterReference: R,
      codeFenced: a(Ke),
      codeFencedFenceInfo: o,
      codeFencedFenceMeta: o,
      codeIndented: a(Ke, o),
      codeText: a(ot, o),
      codeTextData: R,
      data: R,
      codeFlowValue: R,
      definition: a(Yt),
      definitionDestinationString: o,
      definitionLabelString: o,
      definitionTitleString: o,
      emphasis: a(jt),
      hardBreakEscape: a(he),
      hardBreakTrailing: a(he),
      htmlFlow: a(dt, o),
      htmlFlowData: R,
      htmlText: a(dt, o),
      htmlTextData: R,
      image: a(pt),
      label: o,
      link: a(Mt),
      listItem: a(Yn),
      listItemValue: f,
      listOrdered: a(Zt, d),
      listUnordered: a(Zt),
      paragraph: a(jn),
      reference: b,
      referenceString: o,
      resourceDestinationString: o,
      resourceTitleString: o,
      setextHeading: a(It),
      strong: a(hn),
      thematicBreak: a(bn)
    },
    exit: {
      atxHeading: l(),
      atxHeadingSequence: A,
      autolink: l(),
      autolinkEmail: Ne,
      autolinkProtocol: ge,
      blockQuote: l(),
      characterEscapeValue: x,
      characterReferenceMarkerHexadecimal: _e,
      characterReferenceMarkerNumeric: _e,
      characterReferenceValue: be,
      characterReference: me,
      codeFenced: l(k),
      codeFencedFence: h,
      codeFencedFenceInfo: p,
      codeFencedFenceMeta: m,
      codeFlowValue: x,
      codeIndented: l(y),
      codeText: l($),
      codeTextData: x,
      data: x,
      definition: l(),
      definitionDestinationString: N,
      definitionLabelString: S,
      definitionTitleString: w,
      emphasis: l(),
      hardBreakEscape: l(F),
      hardBreakTrailing: l(F),
      htmlFlow: l(U),
      htmlFlowData: x,
      htmlText: l(D),
      htmlTextData: x,
      image: l(se),
      label: fe,
      labelText: I,
      lineEnding: O,
      link: l(Q),
      listItem: l(),
      listOrdered: l(),
      listUnordered: l(),
      paragraph: l(),
      referenceString: le,
      resourceDestinationString: g,
      resourceTitleString: G,
      resource: j,
      setextHeading: l(v),
      setextHeadingLineSequence: L,
      setextHeadingText: _,
      strong: l(),
      thematicBreak: l()
    }
  };
  ga(t, (e || {}).mdastExtensions || []);
  const n = {};
  return r;
  function r(T) {
    let B = {
      type: "root",
      children: []
    };
    const J = {
      stack: [B],
      tokenStack: [],
      config: t,
      enter: s,
      exit: c,
      buffer: o,
      resume: u,
      data: n
    }, ce = [];
    let ye = -1;
    for (; ++ye < T.length; )
      if (T[ye][1].type === "listOrdered" || T[ye][1].type === "listUnordered")
        if (T[ye][0] === "enter")
          ce.push(ye);
        else {
          const Ye = ce.pop();
          ye = i(T, Ye, ye);
        }
    for (ye = -1; ++ye < T.length; ) {
      const Ye = t[T[ye][0]];
      fa.call(Ye, T[ye][1].type) && Ye[T[ye][1].type].call(Object.assign({
        sliceSerialize: T[ye][2].sliceSerialize
      }, J), T[ye][1]);
    }
    if (J.tokenStack.length > 0) {
      const Ye = J.tokenStack[J.tokenStack.length - 1];
      (Ye[1] || Zi).call(J, void 0, Ye[0]);
    }
    for (B.position = {
      start: xt(T.length > 0 ? T[0][1].start : {
        line: 1,
        column: 1,
        offset: 0
      }),
      end: xt(T.length > 0 ? T[T.length - 2][1].end : {
        line: 1,
        column: 1,
        offset: 0
      })
    }, ye = -1; ++ye < t.transforms.length; )
      B = t.transforms[ye](B) || B;
    return B;
  }
  function i(T, B, J) {
    let ce = B - 1, ye = -1, Ye = !1, gt, nt, yt, vt;
    for (; ++ce <= J; ) {
      const Ue = T[ce];
      switch (Ue[1].type) {
        case "listUnordered":
        case "listOrdered":
        case "blockQuote": {
          Ue[0] === "enter" ? ye++ : ye--, vt = void 0;
          break;
        }
        case "lineEndingBlank": {
          Ue[0] === "enter" && (gt && !vt && !ye && !yt && (yt = ce), vt = void 0);
          break;
        }
        case "linePrefix":
        case "listItemValue":
        case "listItemMarker":
        case "listItemPrefix":
        case "listItemPrefixWhitespace":
          break;
        default:
          vt = void 0;
      }
      if (!ye && Ue[0] === "enter" && Ue[1].type === "listItemPrefix" || ye === -1 && Ue[0] === "exit" && (Ue[1].type === "listUnordered" || Ue[1].type === "listOrdered")) {
        if (gt) {
          let Et = ce;
          for (nt = void 0; Et--; ) {
            const je = T[Et];
            if (je[1].type === "lineEnding" || je[1].type === "lineEndingBlank") {
              if (je[0] === "exit") continue;
              nt && (T[nt][1].type = "lineEndingBlank", Ye = !0), je[1].type = "lineEnding", nt = Et;
            } else if (!(je[1].type === "linePrefix" || je[1].type === "blockQuotePrefix" || je[1].type === "blockQuotePrefixWhitespace" || je[1].type === "blockQuoteMarker" || je[1].type === "listItemIndent")) break;
          }
          yt && (!nt || yt < nt) && (gt._spread = !0), gt.end = Object.assign({}, nt ? T[nt][1].start : Ue[1].end), T.splice(nt || ce, 0, ["exit", gt, Ue[2]]), ce++, J++;
        }
        if (Ue[1].type === "listItemPrefix") {
          const Et = {
            type: "listItem",
            _spread: !1,
            start: Object.assign({}, Ue[1].start),
            // @ts-expect-error: we’ll add `end` in a second.
            end: void 0
          };
          gt = Et, T.splice(ce, 0, ["enter", Et, Ue[2]]), ce++, J++, yt = void 0, vt = !0;
        }
      }
    }
    return T[B][1]._spread = Ye, J;
  }
  function a(T, B) {
    return J;
    function J(ce) {
      s.call(this, T(ce), ce), B && B.call(this, ce);
    }
  }
  function o() {
    this.stack.push({
      type: "fragment",
      children: []
    });
  }
  function s(T, B, J) {
    this.stack[this.stack.length - 1].children.push(T), this.stack.push(T), this.tokenStack.push([B, J || void 0]), T.position = {
      start: xt(B.start),
      // @ts-expect-error: `end` will be patched later.
      end: void 0
    };
  }
  function l(T) {
    return B;
    function B(J) {
      T && T.call(this, J), c.call(this, J);
    }
  }
  function c(T, B) {
    const J = this.stack.pop(), ce = this.tokenStack.pop();
    if (ce)
      ce[0].type !== T.type && (B ? B.call(this, T, ce[0]) : (ce[1] || Zi).call(this, T, ce[0]));
    else throw new Error("Cannot close `" + T.type + "` (" + sn({
      start: T.start,
      end: T.end
    }) + "): it’s not open");
    J.position.end = xt(T.end);
  }
  function u() {
    return ei(this.stack.pop());
  }
  function d() {
    this.data.expectingFirstListItemValue = !0;
  }
  function f(T) {
    if (this.data.expectingFirstListItemValue) {
      const B = this.stack[this.stack.length - 2];
      B.start = Number.parseInt(this.sliceSerialize(T), 10), this.data.expectingFirstListItemValue = void 0;
    }
  }
  function p() {
    const T = this.resume(), B = this.stack[this.stack.length - 1];
    B.lang = T;
  }
  function m() {
    const T = this.resume(), B = this.stack[this.stack.length - 1];
    B.meta = T;
  }
  function h() {
    this.data.flowCodeInside || (this.buffer(), this.data.flowCodeInside = !0);
  }
  function k() {
    const T = this.resume(), B = this.stack[this.stack.length - 1];
    B.value = T.replace(/^(\r?\n|\r)|(\r?\n|\r)$/g, ""), this.data.flowCodeInside = void 0;
  }
  function y() {
    const T = this.resume(), B = this.stack[this.stack.length - 1];
    B.value = T.replace(/(\r?\n|\r)$/g, "");
  }
  function S(T) {
    const B = this.resume(), J = this.stack[this.stack.length - 1];
    J.label = B, J.identifier = it(this.sliceSerialize(T)).toLowerCase();
  }
  function w() {
    const T = this.resume(), B = this.stack[this.stack.length - 1];
    B.title = T;
  }
  function N() {
    const T = this.resume(), B = this.stack[this.stack.length - 1];
    B.url = T;
  }
  function A(T) {
    const B = this.stack[this.stack.length - 1];
    if (!B.depth) {
      const J = this.sliceSerialize(T).length;
      B.depth = J;
    }
  }
  function _() {
    this.data.setextHeadingSlurpLineEnding = !0;
  }
  function L(T) {
    const B = this.stack[this.stack.length - 1];
    B.depth = this.sliceSerialize(T).codePointAt(0) === 61 ? 1 : 2;
  }
  function v() {
    this.data.setextHeadingSlurpLineEnding = void 0;
  }
  function R(T) {
    const J = this.stack[this.stack.length - 1].children;
    let ce = J[J.length - 1];
    (!ce || ce.type !== "text") && (ce = ft(), ce.position = {
      start: xt(T.start),
      // @ts-expect-error: we’ll add `end` later.
      end: void 0
    }, J.push(ce)), this.stack.push(ce);
  }
  function x(T) {
    const B = this.stack.pop();
    B.value += this.sliceSerialize(T), B.position.end = xt(T.end);
  }
  function O(T) {
    const B = this.stack[this.stack.length - 1];
    if (this.data.atHardBreak) {
      const J = B.children[B.children.length - 1];
      J.position.end = xt(T.end), this.data.atHardBreak = void 0;
      return;
    }
    !this.data.setextHeadingSlurpLineEnding && t.canContainEols.includes(B.type) && (R.call(this, T), x.call(this, T));
  }
  function F() {
    this.data.atHardBreak = !0;
  }
  function U() {
    const T = this.resume(), B = this.stack[this.stack.length - 1];
    B.value = T;
  }
  function D() {
    const T = this.resume(), B = this.stack[this.stack.length - 1];
    B.value = T;
  }
  function $() {
    const T = this.resume(), B = this.stack[this.stack.length - 1];
    B.value = T;
  }
  function Q() {
    const T = this.stack[this.stack.length - 1];
    if (this.data.inReference) {
      const B = this.data.referenceType || "shortcut";
      T.type += "Reference", T.referenceType = B, delete T.url, delete T.title;
    } else
      delete T.identifier, delete T.label;
    this.data.referenceType = void 0;
  }
  function se() {
    const T = this.stack[this.stack.length - 1];
    if (this.data.inReference) {
      const B = this.data.referenceType || "shortcut";
      T.type += "Reference", T.referenceType = B, delete T.url, delete T.title;
    } else
      delete T.identifier, delete T.label;
    this.data.referenceType = void 0;
  }
  function I(T) {
    const B = this.sliceSerialize(T), J = this.stack[this.stack.length - 2];
    J.label = Ju(B), J.identifier = it(B).toLowerCase();
  }
  function fe() {
    const T = this.stack[this.stack.length - 1], B = this.resume(), J = this.stack[this.stack.length - 1];
    if (this.data.inReference = !0, J.type === "link") {
      const ce = T.children;
      J.children = ce;
    } else
      J.alt = B;
  }
  function g() {
    const T = this.resume(), B = this.stack[this.stack.length - 1];
    B.url = T;
  }
  function G() {
    const T = this.resume(), B = this.stack[this.stack.length - 1];
    B.title = T;
  }
  function j() {
    this.data.inReference = void 0;
  }
  function b() {
    this.data.referenceType = "collapsed";
  }
  function le(T) {
    const B = this.resume(), J = this.stack[this.stack.length - 1];
    J.label = B, J.identifier = it(this.sliceSerialize(T)).toLowerCase(), this.data.referenceType = "full";
  }
  function _e(T) {
    this.data.characterReferenceType = T.type;
  }
  function be(T) {
    const B = this.sliceSerialize(T), J = this.data.characterReferenceType;
    let ce;
    J ? (ce = ra(B, J === "characterReferenceMarkerNumeric" ? 10 : 16), this.data.characterReferenceType = void 0) : ce = ti(B);
    const ye = this.stack[this.stack.length - 1];
    ye.value += ce;
  }
  function me(T) {
    const B = this.stack.pop();
    B.position.end = xt(T.end);
  }
  function ge(T) {
    x.call(this, T);
    const B = this.stack[this.stack.length - 1];
    B.url = this.sliceSerialize(T);
  }
  function Ne(T) {
    x.call(this, T);
    const B = this.stack[this.stack.length - 1];
    B.url = "mailto:" + this.sliceSerialize(T);
  }
  function Te() {
    return {
      type: "blockquote",
      children: []
    };
  }
  function Ke() {
    return {
      type: "code",
      lang: null,
      meta: null,
      value: ""
    };
  }
  function ot() {
    return {
      type: "inlineCode",
      value: ""
    };
  }
  function Yt() {
    return {
      type: "definition",
      identifier: "",
      label: null,
      title: null,
      url: ""
    };
  }
  function jt() {
    return {
      type: "emphasis",
      children: []
    };
  }
  function It() {
    return {
      type: "heading",
      // @ts-expect-error `depth` will be set later.
      depth: 0,
      children: []
    };
  }
  function he() {
    return {
      type: "break"
    };
  }
  function dt() {
    return {
      type: "html",
      value: ""
    };
  }
  function pt() {
    return {
      type: "image",
      title: null,
      url: "",
      alt: null
    };
  }
  function Mt() {
    return {
      type: "link",
      title: null,
      url: "",
      children: []
    };
  }
  function Zt(T) {
    return {
      type: "list",
      ordered: T.type === "listOrdered",
      start: null,
      spread: T._spread,
      children: []
    };
  }
  function Yn(T) {
    return {
      type: "listItem",
      spread: T._spread,
      checked: null,
      children: []
    };
  }
  function jn() {
    return {
      type: "paragraph",
      children: []
    };
  }
  function hn() {
    return {
      type: "strong",
      children: []
    };
  }
  function ft() {
    return {
      type: "text",
      value: ""
    };
  }
  function bn() {
    return {
      type: "thematicBreak"
    };
  }
}
function xt(e) {
  return {
    line: e.line,
    column: e.column,
    offset: e.offset
  };
}
function ga(e, t) {
  let n = -1;
  for (; ++n < t.length; ) {
    const r = t[n];
    Array.isArray(r) ? ga(e, r) : rd(e, r);
  }
}
function rd(e, t) {
  let n;
  for (n in t)
    if (fa.call(t, n))
      switch (n) {
        case "canContainEols": {
          const r = t[n];
          r && e[n].push(...r);
          break;
        }
        case "transforms": {
          const r = t[n];
          r && e[n].push(...r);
          break;
        }
        case "enter":
        case "exit": {
          const r = t[n];
          r && Object.assign(e[n], r);
          break;
        }
      }
}
function Zi(e, t) {
  throw e ? new Error("Cannot close `" + e.type + "` (" + sn({
    start: e.start,
    end: e.end
  }) + "): a different token (`" + t.type + "`, " + sn({
    start: t.start,
    end: t.end
  }) + ") is open") : new Error("Cannot close document, a token (`" + t.type + "`, " + sn({
    start: t.start,
    end: t.end
  }) + ") is still open");
}
function id(e) {
  const t = this;
  t.parser = n;
  function n(r) {
    return td(r, {
      ...t.data("settings"),
      ...e,
      // Note: these options are not in the readme.
      // The goal is for them to be set by plugins on `data` instead of being
      // passed by users.
      extensions: t.data("micromarkExtensions") || [],
      mdastExtensions: t.data("fromMarkdownExtensions") || []
    });
  }
}
function od(e, t) {
  const n = {
    type: "element",
    tagName: "blockquote",
    properties: {},
    children: e.wrap(e.all(t), !0)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function ad(e, t) {
  const n = { type: "element", tagName: "br", properties: {}, children: [] };
  return e.patch(t, n), [e.applyData(t, n), { type: "text", value: `
` }];
}
function sd(e, t) {
  const n = t.value ? t.value + `
` : "", r = {};
  t.lang && (r.className = ["language-" + t.lang]);
  let i = {
    type: "element",
    tagName: "code",
    properties: r,
    children: [{ type: "text", value: n }]
  };
  return t.meta && (i.data = { meta: t.meta }), e.patch(t, i), i = e.applyData(t, i), i = { type: "element", tagName: "pre", properties: {}, children: [i] }, e.patch(t, i), i;
}
function ld(e, t) {
  const n = {
    type: "element",
    tagName: "del",
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function cd(e, t) {
  const n = {
    type: "element",
    tagName: "em",
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function ud(e, t) {
  const n = typeof e.options.clobberPrefix == "string" ? e.options.clobberPrefix : "user-content-", r = String(t.identifier).toUpperCase(), i = Kt(r.toLowerCase()), a = e.footnoteOrder.indexOf(r);
  let o, s = e.footnoteCounts.get(r);
  s === void 0 ? (s = 0, e.footnoteOrder.push(r), o = e.footnoteOrder.length) : o = a + 1, s += 1, e.footnoteCounts.set(r, s);
  const l = {
    type: "element",
    tagName: "a",
    properties: {
      href: "#" + n + "fn-" + i,
      id: n + "fnref-" + i + (s > 1 ? "-" + s : ""),
      dataFootnoteRef: !0,
      ariaDescribedBy: ["footnote-label"]
    },
    children: [{ type: "text", value: String(o) }]
  };
  e.patch(t, l);
  const c = {
    type: "element",
    tagName: "sup",
    properties: {},
    children: [l]
  };
  return e.patch(t, c), e.applyData(t, c);
}
function dd(e, t) {
  const n = {
    type: "element",
    tagName: "h" + t.depth,
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function pd(e, t) {
  if (e.options.allowDangerousHtml) {
    const n = { type: "raw", value: t.value };
    return e.patch(t, n), e.applyData(t, n);
  }
}
function ma(e, t) {
  const n = t.referenceType;
  let r = "]";
  if (n === "collapsed" ? r += "[]" : n === "full" && (r += "[" + (t.label || t.identifier) + "]"), t.type === "imageReference")
    return [{ type: "text", value: "![" + t.alt + r }];
  const i = e.all(t), a = i[0];
  a && a.type === "text" ? a.value = "[" + a.value : i.unshift({ type: "text", value: "[" });
  const o = i[i.length - 1];
  return o && o.type === "text" ? o.value += r : i.push({ type: "text", value: r }), i;
}
function fd(e, t) {
  const n = String(t.identifier).toUpperCase(), r = e.definitionById.get(n);
  if (!r)
    return ma(e, t);
  const i = { src: Kt(r.url || ""), alt: t.alt };
  r.title !== null && r.title !== void 0 && (i.title = r.title);
  const a = { type: "element", tagName: "img", properties: i, children: [] };
  return e.patch(t, a), e.applyData(t, a);
}
function gd(e, t) {
  const n = { src: Kt(t.url) };
  t.alt !== null && t.alt !== void 0 && (n.alt = t.alt), t.title !== null && t.title !== void 0 && (n.title = t.title);
  const r = { type: "element", tagName: "img", properties: n, children: [] };
  return e.patch(t, r), e.applyData(t, r);
}
function md(e, t) {
  const n = { type: "text", value: t.value.replace(/\r?\n|\r/g, " ") };
  e.patch(t, n);
  const r = {
    type: "element",
    tagName: "code",
    properties: {},
    children: [n]
  };
  return e.patch(t, r), e.applyData(t, r);
}
function hd(e, t) {
  const n = String(t.identifier).toUpperCase(), r = e.definitionById.get(n);
  if (!r)
    return ma(e, t);
  const i = { href: Kt(r.url || "") };
  r.title !== null && r.title !== void 0 && (i.title = r.title);
  const a = {
    type: "element",
    tagName: "a",
    properties: i,
    children: e.all(t)
  };
  return e.patch(t, a), e.applyData(t, a);
}
function bd(e, t) {
  const n = { href: Kt(t.url) };
  t.title !== null && t.title !== void 0 && (n.title = t.title);
  const r = {
    type: "element",
    tagName: "a",
    properties: n,
    children: e.all(t)
  };
  return e.patch(t, r), e.applyData(t, r);
}
function yd(e, t, n) {
  const r = e.all(t), i = n ? Ed(n) : ha(t), a = {}, o = [];
  if (typeof t.checked == "boolean") {
    const u = r[0];
    let d;
    u && u.type === "element" && u.tagName === "p" ? d = u : (d = { type: "element", tagName: "p", properties: {}, children: [] }, r.unshift(d)), d.children.length > 0 && d.children.unshift({ type: "text", value: " " }), d.children.unshift({
      type: "element",
      tagName: "input",
      properties: { type: "checkbox", checked: t.checked, disabled: !0 },
      children: []
    }), a.className = ["task-list-item"];
  }
  let s = -1;
  for (; ++s < r.length; ) {
    const u = r[s];
    (i || s !== 0 || u.type !== "element" || u.tagName !== "p") && o.push({ type: "text", value: `
` }), u.type === "element" && u.tagName === "p" && !i ? o.push(...u.children) : o.push(u);
  }
  const l = r[r.length - 1];
  l && (i || l.type !== "element" || l.tagName !== "p") && o.push({ type: "text", value: `
` });
  const c = { type: "element", tagName: "li", properties: a, children: o };
  return e.patch(t, c), e.applyData(t, c);
}
function Ed(e) {
  let t = !1;
  if (e.type === "list") {
    t = e.spread || !1;
    const n = e.children;
    let r = -1;
    for (; !t && ++r < n.length; )
      t = ha(n[r]);
  }
  return t;
}
function ha(e) {
  const t = e.spread;
  return t ?? e.children.length > 1;
}
function _d(e, t) {
  const n = {}, r = e.all(t);
  let i = -1;
  for (typeof t.start == "number" && t.start !== 1 && (n.start = t.start); ++i < r.length; ) {
    const o = r[i];
    if (o.type === "element" && o.tagName === "li" && o.properties && Array.isArray(o.properties.className) && o.properties.className.includes("task-list-item")) {
      n.className = ["contains-task-list"];
      break;
    }
  }
  const a = {
    type: "element",
    tagName: t.ordered ? "ol" : "ul",
    properties: n,
    children: e.wrap(r, !0)
  };
  return e.patch(t, a), e.applyData(t, a);
}
function kd(e, t) {
  const n = {
    type: "element",
    tagName: "p",
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function xd(e, t) {
  const n = { type: "root", children: e.wrap(e.all(t)) };
  return e.patch(t, n), e.applyData(t, n);
}
function wd(e, t) {
  const n = {
    type: "element",
    tagName: "strong",
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
function Sd(e, t) {
  const n = e.all(t), r = n.shift(), i = [];
  if (r) {
    const o = {
      type: "element",
      tagName: "thead",
      properties: {},
      children: e.wrap([r], !0)
    };
    e.patch(t.children[0], o), i.push(o);
  }
  if (n.length > 0) {
    const o = {
      type: "element",
      tagName: "tbody",
      properties: {},
      children: e.wrap(n, !0)
    }, s = Zr(t.children[1]), l = jo(t.children[t.children.length - 1]);
    s && l && (o.position = { start: s, end: l }), i.push(o);
  }
  const a = {
    type: "element",
    tagName: "table",
    properties: {},
    children: e.wrap(i, !0)
  };
  return e.patch(t, a), e.applyData(t, a);
}
function vd(e, t, n) {
  const r = n ? n.children : void 0, a = (r ? r.indexOf(t) : 1) === 0 ? "th" : "td", o = n && n.type === "table" ? n.align : void 0, s = o ? o.length : t.children.length;
  let l = -1;
  const c = [];
  for (; ++l < s; ) {
    const d = t.children[l], f = {}, p = o ? o[l] : void 0;
    p && (f.align = p);
    let m = { type: "element", tagName: a, properties: f, children: [] };
    d && (m.children = e.all(d), e.patch(d, m), m = e.applyData(d, m)), c.push(m);
  }
  const u = {
    type: "element",
    tagName: "tr",
    properties: {},
    children: e.wrap(c, !0)
  };
  return e.patch(t, u), e.applyData(t, u);
}
function Td(e, t) {
  const n = {
    type: "element",
    tagName: "td",
    // Assume body cell.
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, n), e.applyData(t, n);
}
const Xi = 9, Qi = 32;
function Nd(e) {
  const t = String(e), n = /\r?\n|\r/g;
  let r = n.exec(t), i = 0;
  const a = [];
  for (; r; )
    a.push(
      Ji(t.slice(i, r.index), i > 0, !0),
      r[0]
    ), i = r.index + r[0].length, r = n.exec(t);
  return a.push(Ji(t.slice(i), i > 0, !1)), a.join("");
}
function Ji(e, t, n) {
  let r = 0, i = e.length;
  if (t) {
    let a = e.codePointAt(r);
    for (; a === Xi || a === Qi; )
      r++, a = e.codePointAt(r);
  }
  if (n) {
    let a = e.codePointAt(i - 1);
    for (; a === Xi || a === Qi; )
      i--, a = e.codePointAt(i - 1);
  }
  return i > r ? e.slice(r, i) : "";
}
function Ad(e, t) {
  const n = { type: "text", value: Nd(String(t.value)) };
  return e.patch(t, n), e.applyData(t, n);
}
function Cd(e, t) {
  const n = {
    type: "element",
    tagName: "hr",
    properties: {},
    children: []
  };
  return e.patch(t, n), e.applyData(t, n);
}
const Rd = {
  blockquote: od,
  break: ad,
  code: sd,
  delete: ld,
  emphasis: cd,
  footnoteReference: ud,
  heading: dd,
  html: pd,
  imageReference: fd,
  image: gd,
  inlineCode: md,
  linkReference: hd,
  link: bd,
  listItem: yd,
  list: _d,
  paragraph: kd,
  // @ts-expect-error: root is different, but hard to type.
  root: xd,
  strong: wd,
  table: Sd,
  tableCell: Td,
  tableRow: vd,
  text: Ad,
  thematicBreak: Cd,
  toml: Sn,
  yaml: Sn,
  definition: Sn,
  footnoteDefinition: Sn
};
function Sn() {
}
const ba = -1, Wn = 0, cn = 1, Fn = 2, ri = 3, ii = 4, oi = 5, ai = 6, ya = 7, Ea = 8, eo = typeof self == "object" ? self : globalThis, Od = (e, t) => {
  const n = (i, a) => (e.set(a, i), i), r = (i) => {
    if (e.has(i))
      return e.get(i);
    const [a, o] = t[i];
    switch (a) {
      case Wn:
      case ba:
        return n(o, i);
      case cn: {
        const s = n([], i);
        for (const l of o)
          s.push(r(l));
        return s;
      }
      case Fn: {
        const s = n({}, i);
        for (const [l, c] of o)
          s[r(l)] = r(c);
        return s;
      }
      case ri:
        return n(new Date(o), i);
      case ii: {
        const { source: s, flags: l } = o;
        return n(new RegExp(s, l), i);
      }
      case oi: {
        const s = n(/* @__PURE__ */ new Map(), i);
        for (const [l, c] of o)
          s.set(r(l), r(c));
        return s;
      }
      case ai: {
        const s = n(/* @__PURE__ */ new Set(), i);
        for (const l of o)
          s.add(r(l));
        return s;
      }
      case ya: {
        const { name: s, message: l } = o;
        return n(new eo[s](l), i);
      }
      case Ea:
        return n(BigInt(o), i);
      case "BigInt":
        return n(Object(BigInt(o)), i);
      case "ArrayBuffer":
        return n(new Uint8Array(o).buffer, o);
      case "DataView": {
        const { buffer: s } = new Uint8Array(o);
        return n(new DataView(s), o);
      }
    }
    return n(new eo[a](o), i);
  };
  return r;
}, to = (e) => Od(/* @__PURE__ */ new Map(), e)(0), Pt = "", { toString: Id } = {}, { keys: Md } = Object, rn = (e) => {
  const t = typeof e;
  if (t !== "object" || !e)
    return [Wn, t];
  const n = Id.call(e).slice(8, -1);
  switch (n) {
    case "Array":
      return [cn, Pt];
    case "Object":
      return [Fn, Pt];
    case "Date":
      return [ri, Pt];
    case "RegExp":
      return [ii, Pt];
    case "Map":
      return [oi, Pt];
    case "Set":
      return [ai, Pt];
    case "DataView":
      return [cn, n];
  }
  return n.includes("Array") ? [cn, n] : n.includes("Error") ? [ya, n] : [Fn, n];
}, vn = ([e, t]) => e === Wn && (t === "function" || t === "symbol"), Ld = (e, t, n, r) => {
  const i = (o, s) => {
    const l = r.push(o) - 1;
    return n.set(s, l), l;
  }, a = (o) => {
    if (n.has(o))
      return n.get(o);
    let [s, l] = rn(o);
    switch (s) {
      case Wn: {
        let u = o;
        switch (l) {
          case "bigint":
            s = Ea, u = o.toString();
            break;
          case "function":
          case "symbol":
            if (e)
              throw new TypeError("unable to serialize " + l);
            u = null;
            break;
          case "undefined":
            return i([ba], o);
        }
        return i([s, u], o);
      }
      case cn: {
        if (l) {
          let f = o;
          return l === "DataView" ? f = new Uint8Array(o.buffer) : l === "ArrayBuffer" && (f = new Uint8Array(o)), i([l, [...f]], o);
        }
        const u = [], d = i([s, u], o);
        for (const f of o)
          u.push(a(f));
        return d;
      }
      case Fn: {
        if (l)
          switch (l) {
            case "BigInt":
              return i([l, o.toString()], o);
            case "Boolean":
            case "Number":
            case "String":
              return i([l, o.valueOf()], o);
          }
        if (t && "toJSON" in o)
          return a(o.toJSON());
        const u = [], d = i([s, u], o);
        for (const f of Md(o))
          (e || !vn(rn(o[f]))) && u.push([a(f), a(o[f])]);
        return d;
      }
      case ri:
        return i([s, o.toISOString()], o);
      case ii: {
        const { source: u, flags: d } = o;
        return i([s, { source: u, flags: d }], o);
      }
      case oi: {
        const u = [], d = i([s, u], o);
        for (const [f, p] of o)
          (e || !(vn(rn(f)) || vn(rn(p)))) && u.push([a(f), a(p)]);
        return d;
      }
      case ai: {
        const u = [], d = i([s, u], o);
        for (const f of o)
          (e || !vn(rn(f))) && u.push(a(f));
        return d;
      }
    }
    const { message: c } = o;
    return i([s, { name: l, message: c }], o);
  };
  return a;
}, no = (e, { json: t, lossy: n } = {}) => {
  const r = [];
  return Ld(!(t || n), !!t, /* @__PURE__ */ new Map(), r)(e), r;
}, zn = typeof structuredClone == "function" ? (
  /* c8 ignore start */
  (e, t) => t && ("json" in t || "lossy" in t) ? to(no(e, t)) : structuredClone(e)
) : (e, t) => to(no(e, t));
function Dd(e, t) {
  const n = [{ type: "text", value: "↩" }];
  return t > 1 && n.push({
    type: "element",
    tagName: "sup",
    properties: {},
    children: [{ type: "text", value: String(t) }]
  }), n;
}
function Pd(e, t) {
  return "Back to reference " + (e + 1) + (t > 1 ? "-" + t : "");
}
function Bd(e) {
  const t = typeof e.options.clobberPrefix == "string" ? e.options.clobberPrefix : "user-content-", n = e.options.footnoteBackContent || Dd, r = e.options.footnoteBackLabel || Pd, i = e.options.footnoteLabel || "Footnotes", a = e.options.footnoteLabelTagName || "h2", o = e.options.footnoteLabelProperties || {
    className: ["sr-only"]
  }, s = [];
  let l = -1;
  for (; ++l < e.footnoteOrder.length; ) {
    const c = e.footnoteById.get(
      e.footnoteOrder[l]
    );
    if (!c)
      continue;
    const u = e.all(c), d = String(c.identifier).toUpperCase(), f = Kt(d.toLowerCase());
    let p = 0;
    const m = [], h = e.footnoteCounts.get(d);
    for (; h !== void 0 && ++p <= h; ) {
      m.length > 0 && m.push({ type: "text", value: " " });
      let S = typeof n == "string" ? n : n(l, p);
      typeof S == "string" && (S = { type: "text", value: S }), m.push({
        type: "element",
        tagName: "a",
        properties: {
          href: "#" + t + "fnref-" + f + (p > 1 ? "-" + p : ""),
          dataFootnoteBackref: "",
          ariaLabel: typeof r == "string" ? r : r(l, p),
          className: ["data-footnote-backref"]
        },
        children: Array.isArray(S) ? S : [S]
      });
    }
    const k = u[u.length - 1];
    if (k && k.type === "element" && k.tagName === "p") {
      const S = k.children[k.children.length - 1];
      S && S.type === "text" ? S.value += " " : k.children.push({ type: "text", value: " " }), k.children.push(...m);
    } else
      u.push(...m);
    const y = {
      type: "element",
      tagName: "li",
      properties: { id: t + "fn-" + f },
      children: e.wrap(u, !0)
    };
    e.patch(c, y), s.push(y);
  }
  if (s.length !== 0)
    return {
      type: "element",
      tagName: "section",
      properties: { dataFootnotes: !0, className: ["footnotes"] },
      children: [
        {
          type: "element",
          tagName: a,
          properties: {
            ...zn(o),
            id: "footnote-label"
          },
          children: [{ type: "text", value: i }]
        },
        { type: "text", value: `
` },
        {
          type: "element",
          tagName: "ol",
          properties: {},
          children: e.wrap(s, !0)
        },
        { type: "text", value: `
` }
      ]
    };
}
const gn = (
  // Note: overloads in JSDoc can’t yet use different `@template`s.
  /**
   * @type {(
   *   (<Condition extends string>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & {type: Condition}) &
   *   (<Condition extends Props>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & Condition) &
   *   (<Condition extends TestFunction>(test: Condition) => (node: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node & Predicate<Condition, Node>) &
   *   ((test?: null | undefined) => (node?: unknown, index?: number | null | undefined, parent?: Parent | null | undefined, context?: unknown) => node is Node) &
   *   ((test?: Test) => Check)
   * )}
   */
  /**
   * @param {Test} [test]
   * @returns {Check}
   */
  function(e) {
    if (e == null)
      return $d;
    if (typeof e == "function")
      return Vn(e);
    if (typeof e == "object")
      return Array.isArray(e) ? Fd(e) : zd(e);
    if (typeof e == "string")
      return Ud(e);
    throw new Error("Expected function, string, or object as test");
  }
);
function Fd(e) {
  const t = [];
  let n = -1;
  for (; ++n < e.length; )
    t[n] = gn(e[n]);
  return Vn(r);
  function r(...i) {
    let a = -1;
    for (; ++a < t.length; )
      if (t[a].apply(this, i)) return !0;
    return !1;
  }
}
function zd(e) {
  const t = (
    /** @type {Record<string, unknown>} */
    e
  );
  return Vn(n);
  function n(r) {
    const i = (
      /** @type {Record<string, unknown>} */
      /** @type {unknown} */
      r
    );
    let a;
    for (a in e)
      if (i[a] !== t[a]) return !1;
    return !0;
  }
}
function Ud(e) {
  return Vn(t);
  function t(n) {
    return n && n.type === e;
  }
}
function Vn(e) {
  return t;
  function t(n, r, i) {
    return !!(Hd(n) && e.call(
      this,
      n,
      typeof r == "number" ? r : void 0,
      i || void 0
    ));
  }
}
function $d() {
  return !0;
}
function Hd(e) {
  return e !== null && typeof e == "object" && "type" in e;
}
const _a = [], Gd = !0, Ir = !1, Kd = "skip";
function ka(e, t, n, r) {
  let i;
  typeof t == "function" && typeof n != "function" ? (r = n, n = t) : i = t;
  const a = gn(i), o = r ? -1 : 1;
  s(e, void 0, [])();
  function s(l, c, u) {
    const d = (
      /** @type {Record<string, unknown>} */
      l && typeof l == "object" ? l : {}
    );
    if (typeof d.type == "string") {
      const p = (
        // `hast`
        typeof d.tagName == "string" ? d.tagName : (
          // `xast`
          typeof d.name == "string" ? d.name : void 0
        )
      );
      Object.defineProperty(f, "name", {
        value: "node (" + (l.type + (p ? "<" + p + ">" : "")) + ")"
      });
    }
    return f;
    function f() {
      let p = _a, m, h, k;
      if ((!t || a(l, c, u[u.length - 1] || void 0)) && (p = qd(n(l, u)), p[0] === Ir))
        return p;
      if ("children" in l && l.children) {
        const y = (
          /** @type {UnistParent} */
          l
        );
        if (y.children && p[0] !== Kd)
          for (h = (r ? y.children.length : -1) + o, k = u.concat(y); h > -1 && h < y.children.length; ) {
            const S = y.children[h];
            if (m = s(S, h, k)(), m[0] === Ir)
              return m;
            h = typeof m[1] == "number" ? m[1] : h + o;
          }
      }
      return p;
    }
  }
}
function qd(e) {
  return Array.isArray(e) ? e : typeof e == "number" ? [Gd, e] : e == null ? _a : [e];
}
function qt(e, t, n, r) {
  let i, a, o;
  typeof t == "function" && typeof n != "function" ? (a = void 0, o = t, i = n) : (a = t, o = n, i = r), ka(e, a, s, i);
  function s(l, c) {
    const u = c[c.length - 1], d = u ? u.children.indexOf(l) : void 0;
    return o(l, d, u);
  }
}
const Mr = {}.hasOwnProperty, Wd = {};
function Vd(e, t) {
  const n = t || Wd, r = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map(), o = { ...Rd, ...n.handlers }, s = {
    all: c,
    applyData: jd,
    definitionById: r,
    footnoteById: i,
    footnoteCounts: a,
    footnoteOrder: [],
    handlers: o,
    one: l,
    options: n,
    patch: Yd,
    wrap: Xd
  };
  return qt(e, function(u) {
    if (u.type === "definition" || u.type === "footnoteDefinition") {
      const d = u.type === "definition" ? r : i, f = String(u.identifier).toUpperCase();
      d.has(f) || d.set(f, u);
    }
  }), s;
  function l(u, d) {
    const f = u.type, p = s.handlers[f];
    if (Mr.call(s.handlers, f) && p)
      return p(s, u, d);
    if (s.options.passThrough && s.options.passThrough.includes(f)) {
      if ("children" in u) {
        const { children: h, ...k } = u, y = zn(k);
        return y.children = s.all(u), y;
      }
      return zn(u);
    }
    return (s.options.unknownHandler || Zd)(s, u, d);
  }
  function c(u) {
    const d = [];
    if ("children" in u) {
      const f = u.children;
      let p = -1;
      for (; ++p < f.length; ) {
        const m = s.one(f[p], u);
        if (m) {
          if (p && f[p - 1].type === "break" && (!Array.isArray(m) && m.type === "text" && (m.value = ro(m.value)), !Array.isArray(m) && m.type === "element")) {
            const h = m.children[0];
            h && h.type === "text" && (h.value = ro(h.value));
          }
          Array.isArray(m) ? d.push(...m) : d.push(m);
        }
      }
    }
    return d;
  }
}
function Yd(e, t) {
  e.position && (t.position = Pl(e));
}
function jd(e, t) {
  let n = t;
  if (e && e.data) {
    const r = e.data.hName, i = e.data.hChildren, a = e.data.hProperties;
    if (typeof r == "string")
      if (n.type === "element")
        n.tagName = r;
      else {
        const o = "children" in n ? n.children : [n];
        n = { type: "element", tagName: r, properties: {}, children: o };
      }
    n.type === "element" && a && Object.assign(n.properties, zn(a)), "children" in n && n.children && i !== null && i !== void 0 && (n.children = i);
  }
  return n;
}
function Zd(e, t) {
  const n = t.data || {}, r = "value" in t && !(Mr.call(n, "hProperties") || Mr.call(n, "hChildren")) ? { type: "text", value: t.value } : {
    type: "element",
    tagName: "div",
    properties: {},
    children: e.all(t)
  };
  return e.patch(t, r), e.applyData(t, r);
}
function Xd(e, t) {
  const n = [];
  let r = -1;
  for (t && n.push({ type: "text", value: `
` }); ++r < e.length; )
    r && n.push({ type: "text", value: `
` }), n.push(e[r]);
  return t && e.length > 0 && n.push({ type: "text", value: `
` }), n;
}
function ro(e) {
  let t = 0, n = e.charCodeAt(t);
  for (; n === 9 || n === 32; )
    t++, n = e.charCodeAt(t);
  return e.slice(t);
}
function io(e, t) {
  const n = Vd(e, t), r = n.one(e, void 0), i = Bd(n), a = Array.isArray(r) ? { type: "root", children: r } : r || { type: "root", children: [] };
  return i && a.children.push({ type: "text", value: `
` }, i), a;
}
function Qd(e, t) {
  return e && "run" in e ? async function(n, r) {
    const i = (
      /** @type {HastRoot} */
      io(n, { file: r, ...t })
    );
    await e.run(i, r);
  } : function(n, r) {
    return (
      /** @type {HastRoot} */
      io(n, { file: r, ...e || t })
    );
  };
}
function oo(e) {
  if (e)
    throw e;
}
var sr, ao;
function Jd() {
  if (ao) return sr;
  ao = 1;
  var e = Object.prototype.hasOwnProperty, t = Object.prototype.toString, n = Object.defineProperty, r = Object.getOwnPropertyDescriptor, i = function(c) {
    return typeof Array.isArray == "function" ? Array.isArray(c) : t.call(c) === "[object Array]";
  }, a = function(c) {
    if (!c || t.call(c) !== "[object Object]")
      return !1;
    var u = e.call(c, "constructor"), d = c.constructor && c.constructor.prototype && e.call(c.constructor.prototype, "isPrototypeOf");
    if (c.constructor && !u && !d)
      return !1;
    var f;
    for (f in c)
      ;
    return typeof f > "u" || e.call(c, f);
  }, o = function(c, u) {
    n && u.name === "__proto__" ? n(c, u.name, {
      enumerable: !0,
      configurable: !0,
      value: u.newValue,
      writable: !0
    }) : c[u.name] = u.newValue;
  }, s = function(c, u) {
    if (u === "__proto__")
      if (e.call(c, u)) {
        if (r)
          return r(c, u).value;
      } else return;
    return c[u];
  };
  return sr = function l() {
    var c, u, d, f, p, m, h = arguments[0], k = 1, y = arguments.length, S = !1;
    for (typeof h == "boolean" && (S = h, h = arguments[1] || {}, k = 2), (h == null || typeof h != "object" && typeof h != "function") && (h = {}); k < y; ++k)
      if (c = arguments[k], c != null)
        for (u in c)
          d = s(h, u), f = s(c, u), h !== f && (S && f && (a(f) || (p = i(f))) ? (p ? (p = !1, m = d && i(d) ? d : []) : m = d && a(d) ? d : {}, o(h, { name: u, newValue: l(S, m, f) })) : typeof f < "u" && o(h, { name: u, newValue: f }));
    return h;
  }, sr;
}
var ep = Jd();
const lr = /* @__PURE__ */ Vr(ep);
function Lr(e) {
  if (typeof e != "object" || e === null)
    return !1;
  const t = Object.getPrototypeOf(e);
  return (t === null || t === Object.prototype || Object.getPrototypeOf(t) === null) && !(Symbol.toStringTag in e) && !(Symbol.iterator in e);
}
function tp() {
  const e = [], t = { run: n, use: r };
  return t;
  function n(...i) {
    let a = -1;
    const o = i.pop();
    if (typeof o != "function")
      throw new TypeError("Expected function as last argument, not " + o);
    s(null, ...i);
    function s(l, ...c) {
      const u = e[++a];
      let d = -1;
      if (l) {
        o(l);
        return;
      }
      for (; ++d < i.length; )
        (c[d] === null || c[d] === void 0) && (c[d] = i[d]);
      i = c, u ? np(u, s)(...c) : o(null, ...c);
    }
  }
  function r(i) {
    if (typeof i != "function")
      throw new TypeError(
        "Expected `middelware` to be a function, not " + i
      );
    return e.push(i), t;
  }
}
function np(e, t) {
  let n;
  return r;
  function r(...o) {
    const s = e.length > o.length;
    let l;
    s && o.push(i);
    try {
      l = e.apply(this, o);
    } catch (c) {
      const u = (
        /** @type {Error} */
        c
      );
      if (s && n)
        throw u;
      return i(u);
    }
    s || (l && l.then && typeof l.then == "function" ? l.then(a, i) : l instanceof Error ? i(l) : a(l));
  }
  function i(o, ...s) {
    n || (n = !0, t(o, ...s));
  }
  function a(o) {
    i(null, o);
  }
}
const ct = { basename: rp, dirname: ip, extname: op, join: ap, sep: "/" };
function rp(e, t) {
  if (t !== void 0 && typeof t != "string")
    throw new TypeError('"ext" argument must be a string');
  mn(e);
  let n = 0, r = -1, i = e.length, a;
  if (t === void 0 || t.length === 0 || t.length > e.length) {
    for (; i--; )
      if (e.codePointAt(i) === 47) {
        if (a) {
          n = i + 1;
          break;
        }
      } else r < 0 && (a = !0, r = i + 1);
    return r < 0 ? "" : e.slice(n, r);
  }
  if (t === e)
    return "";
  let o = -1, s = t.length - 1;
  for (; i--; )
    if (e.codePointAt(i) === 47) {
      if (a) {
        n = i + 1;
        break;
      }
    } else
      o < 0 && (a = !0, o = i + 1), s > -1 && (e.codePointAt(i) === t.codePointAt(s--) ? s < 0 && (r = i) : (s = -1, r = o));
  return n === r ? r = o : r < 0 && (r = e.length), e.slice(n, r);
}
function ip(e) {
  if (mn(e), e.length === 0)
    return ".";
  let t = -1, n = e.length, r;
  for (; --n; )
    if (e.codePointAt(n) === 47) {
      if (r) {
        t = n;
        break;
      }
    } else r || (r = !0);
  return t < 0 ? e.codePointAt(0) === 47 ? "/" : "." : t === 1 && e.codePointAt(0) === 47 ? "//" : e.slice(0, t);
}
function op(e) {
  mn(e);
  let t = e.length, n = -1, r = 0, i = -1, a = 0, o;
  for (; t--; ) {
    const s = e.codePointAt(t);
    if (s === 47) {
      if (o) {
        r = t + 1;
        break;
      }
      continue;
    }
    n < 0 && (o = !0, n = t + 1), s === 46 ? i < 0 ? i = t : a !== 1 && (a = 1) : i > -1 && (a = -1);
  }
  return i < 0 || n < 0 || // We saw a non-dot character immediately before the dot.
  a === 0 || // The (right-most) trimmed path component is exactly `..`.
  a === 1 && i === n - 1 && i === r + 1 ? "" : e.slice(i, n);
}
function ap(...e) {
  let t = -1, n;
  for (; ++t < e.length; )
    mn(e[t]), e[t] && (n = n === void 0 ? e[t] : n + "/" + e[t]);
  return n === void 0 ? "." : sp(n);
}
function sp(e) {
  mn(e);
  const t = e.codePointAt(0) === 47;
  let n = lp(e, !t);
  return n.length === 0 && !t && (n = "."), n.length > 0 && e.codePointAt(e.length - 1) === 47 && (n += "/"), t ? "/" + n : n;
}
function lp(e, t) {
  let n = "", r = 0, i = -1, a = 0, o = -1, s, l;
  for (; ++o <= e.length; ) {
    if (o < e.length)
      s = e.codePointAt(o);
    else {
      if (s === 47)
        break;
      s = 47;
    }
    if (s === 47) {
      if (!(i === o - 1 || a === 1)) if (i !== o - 1 && a === 2) {
        if (n.length < 2 || r !== 2 || n.codePointAt(n.length - 1) !== 46 || n.codePointAt(n.length - 2) !== 46) {
          if (n.length > 2) {
            if (l = n.lastIndexOf("/"), l !== n.length - 1) {
              l < 0 ? (n = "", r = 0) : (n = n.slice(0, l), r = n.length - 1 - n.lastIndexOf("/")), i = o, a = 0;
              continue;
            }
          } else if (n.length > 0) {
            n = "", r = 0, i = o, a = 0;
            continue;
          }
        }
        t && (n = n.length > 0 ? n + "/.." : "..", r = 2);
      } else
        n.length > 0 ? n += "/" + e.slice(i + 1, o) : n = e.slice(i + 1, o), r = o - i - 1;
      i = o, a = 0;
    } else s === 46 && a > -1 ? a++ : a = -1;
  }
  return n;
}
function mn(e) {
  if (typeof e != "string")
    throw new TypeError(
      "Path must be a string. Received " + JSON.stringify(e)
    );
}
const cp = { cwd: up };
function up() {
  return "/";
}
function Dr(e) {
  return !!(e !== null && typeof e == "object" && "href" in e && e.href && "protocol" in e && e.protocol && // @ts-expect-error: indexing is fine.
  e.auth === void 0);
}
function dp(e) {
  if (typeof e == "string")
    e = new URL(e);
  else if (!Dr(e)) {
    const t = new TypeError(
      'The "path" argument must be of type string or an instance of URL. Received `' + e + "`"
    );
    throw t.code = "ERR_INVALID_ARG_TYPE", t;
  }
  if (e.protocol !== "file:") {
    const t = new TypeError("The URL must be of scheme file");
    throw t.code = "ERR_INVALID_URL_SCHEME", t;
  }
  return pp(e);
}
function pp(e) {
  if (e.hostname !== "") {
    const r = new TypeError(
      'File URL host must be "localhost" or empty on darwin'
    );
    throw r.code = "ERR_INVALID_FILE_URL_HOST", r;
  }
  const t = e.pathname;
  let n = -1;
  for (; ++n < t.length; )
    if (t.codePointAt(n) === 37 && t.codePointAt(n + 1) === 50) {
      const r = t.codePointAt(n + 2);
      if (r === 70 || r === 102) {
        const i = new TypeError(
          "File URL path must not include encoded / characters"
        );
        throw i.code = "ERR_INVALID_FILE_URL_PATH", i;
      }
    }
  return decodeURIComponent(t);
}
const cr = (
  /** @type {const} */
  [
    "history",
    "path",
    "basename",
    "stem",
    "extname",
    "dirname"
  ]
);
class xa {
  /**
   * Create a new virtual file.
   *
   * `options` is treated as:
   *
   * *   `string` or `Uint8Array` — `{value: options}`
   * *   `URL` — `{path: options}`
   * *   `VFile` — shallow copies its data over to the new file
   * *   `object` — all fields are shallow copied over to the new file
   *
   * Path related fields are set in the following order (least specific to
   * most specific): `history`, `path`, `basename`, `stem`, `extname`,
   * `dirname`.
   *
   * You cannot set `dirname` or `extname` without setting either `history`,
   * `path`, `basename`, or `stem` too.
   *
   * @param {Compatible | null | undefined} [value]
   *   File value.
   * @returns
   *   New instance.
   */
  constructor(t) {
    let n;
    t ? Dr(t) ? n = { path: t } : typeof t == "string" || fp(t) ? n = { value: t } : n = t : n = {}, this.cwd = "cwd" in n ? "" : cp.cwd(), this.data = {}, this.history = [], this.messages = [], this.value, this.map, this.result, this.stored;
    let r = -1;
    for (; ++r < cr.length; ) {
      const a = cr[r];
      a in n && n[a] !== void 0 && n[a] !== null && (this[a] = a === "history" ? [...n[a]] : n[a]);
    }
    let i;
    for (i in n)
      cr.includes(i) || (this[i] = n[i]);
  }
  /**
   * Get the basename (including extname) (example: `'index.min.js'`).
   *
   * @returns {string | undefined}
   *   Basename.
   */
  get basename() {
    return typeof this.path == "string" ? ct.basename(this.path) : void 0;
  }
  /**
   * Set basename (including extname) (`'index.min.js'`).
   *
   * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
   * on windows).
   * Cannot be nullified (use `file.path = file.dirname` instead).
   *
   * @param {string} basename
   *   Basename.
   * @returns {undefined}
   *   Nothing.
   */
  set basename(t) {
    dr(t, "basename"), ur(t, "basename"), this.path = ct.join(this.dirname || "", t);
  }
  /**
   * Get the parent path (example: `'~'`).
   *
   * @returns {string | undefined}
   *   Dirname.
   */
  get dirname() {
    return typeof this.path == "string" ? ct.dirname(this.path) : void 0;
  }
  /**
   * Set the parent path (example: `'~'`).
   *
   * Cannot be set if there’s no `path` yet.
   *
   * @param {string | undefined} dirname
   *   Dirname.
   * @returns {undefined}
   *   Nothing.
   */
  set dirname(t) {
    so(this.basename, "dirname"), this.path = ct.join(t || "", this.basename);
  }
  /**
   * Get the extname (including dot) (example: `'.js'`).
   *
   * @returns {string | undefined}
   *   Extname.
   */
  get extname() {
    return typeof this.path == "string" ? ct.extname(this.path) : void 0;
  }
  /**
   * Set the extname (including dot) (example: `'.js'`).
   *
   * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
   * on windows).
   * Cannot be set if there’s no `path` yet.
   *
   * @param {string | undefined} extname
   *   Extname.
   * @returns {undefined}
   *   Nothing.
   */
  set extname(t) {
    if (ur(t, "extname"), so(this.dirname, "extname"), t) {
      if (t.codePointAt(0) !== 46)
        throw new Error("`extname` must start with `.`");
      if (t.includes(".", 1))
        throw new Error("`extname` cannot contain multiple dots");
    }
    this.path = ct.join(this.dirname, this.stem + (t || ""));
  }
  /**
   * Get the full path (example: `'~/index.min.js'`).
   *
   * @returns {string}
   *   Path.
   */
  get path() {
    return this.history[this.history.length - 1];
  }
  /**
   * Set the full path (example: `'~/index.min.js'`).
   *
   * Cannot be nullified.
   * You can set a file URL (a `URL` object with a `file:` protocol) which will
   * be turned into a path with `url.fileURLToPath`.
   *
   * @param {URL | string} path
   *   Path.
   * @returns {undefined}
   *   Nothing.
   */
  set path(t) {
    Dr(t) && (t = dp(t)), dr(t, "path"), this.path !== t && this.history.push(t);
  }
  /**
   * Get the stem (basename w/o extname) (example: `'index.min'`).
   *
   * @returns {string | undefined}
   *   Stem.
   */
  get stem() {
    return typeof this.path == "string" ? ct.basename(this.path, this.extname) : void 0;
  }
  /**
   * Set the stem (basename w/o extname) (example: `'index.min'`).
   *
   * Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
   * on windows).
   * Cannot be nullified (use `file.path = file.dirname` instead).
   *
   * @param {string} stem
   *   Stem.
   * @returns {undefined}
   *   Nothing.
   */
  set stem(t) {
    dr(t, "stem"), ur(t, "stem"), this.path = ct.join(this.dirname || "", t + (this.extname || ""));
  }
  // Normal prototypal methods.
  /**
   * Create a fatal message for `reason` associated with the file.
   *
   * The `fatal` field of the message is set to `true` (error; file not usable)
   * and the `file` field is set to the current file path.
   * The message is added to the `messages` field on `file`.
   *
   * > 🪦 **Note**: also has obsolete signatures.
   *
   * @overload
   * @param {string} reason
   * @param {MessageOptions | null | undefined} [options]
   * @returns {never}
   *
   * @overload
   * @param {string} reason
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns {never}
   *
   * @overload
   * @param {string} reason
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns {never}
   *
   * @overload
   * @param {string} reason
   * @param {string | null | undefined} [origin]
   * @returns {never}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns {never}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns {never}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {string | null | undefined} [origin]
   * @returns {never}
   *
   * @param {Error | VFileMessage | string} causeOrReason
   *   Reason for message, should use markdown.
   * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
   *   Configuration (optional).
   * @param {string | null | undefined} [origin]
   *   Place in code where the message originates (example:
   *   `'my-package:my-rule'` or `'my-rule'`).
   * @returns {never}
   *   Never.
   * @throws {VFileMessage}
   *   Message.
   */
  fail(t, n, r) {
    const i = this.message(t, n, r);
    throw i.fatal = !0, i;
  }
  /**
   * Create an info message for `reason` associated with the file.
   *
   * The `fatal` field of the message is set to `undefined` (info; change
   * likely not needed) and the `file` field is set to the current file path.
   * The message is added to the `messages` field on `file`.
   *
   * > 🪦 **Note**: also has obsolete signatures.
   *
   * @overload
   * @param {string} reason
   * @param {MessageOptions | null | undefined} [options]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {string} reason
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {string} reason
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {string} reason
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @param {Error | VFileMessage | string} causeOrReason
   *   Reason for message, should use markdown.
   * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
   *   Configuration (optional).
   * @param {string | null | undefined} [origin]
   *   Place in code where the message originates (example:
   *   `'my-package:my-rule'` or `'my-rule'`).
   * @returns {VFileMessage}
   *   Message.
   */
  info(t, n, r) {
    const i = this.message(t, n, r);
    return i.fatal = void 0, i;
  }
  /**
   * Create a message for `reason` associated with the file.
   *
   * The `fatal` field of the message is set to `false` (warning; change may be
   * needed) and the `file` field is set to the current file path.
   * The message is added to the `messages` field on `file`.
   *
   * > 🪦 **Note**: also has obsolete signatures.
   *
   * @overload
   * @param {string} reason
   * @param {MessageOptions | null | undefined} [options]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {string} reason
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {string} reason
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {string} reason
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Node | NodeLike | null | undefined} parent
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {Point | Position | null | undefined} place
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @overload
   * @param {Error | VFileMessage} cause
   * @param {string | null | undefined} [origin]
   * @returns {VFileMessage}
   *
   * @param {Error | VFileMessage | string} causeOrReason
   *   Reason for message, should use markdown.
   * @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
   *   Configuration (optional).
   * @param {string | null | undefined} [origin]
   *   Place in code where the message originates (example:
   *   `'my-package:my-rule'` or `'my-rule'`).
   * @returns {VFileMessage}
   *   Message.
   */
  message(t, n, r) {
    const i = new ze(
      // @ts-expect-error: the overloads are fine.
      t,
      n,
      r
    );
    return this.path && (i.name = this.path + ":" + i.name, i.file = this.path), i.fatal = !1, this.messages.push(i), i;
  }
  /**
   * Serialize the file.
   *
   * > **Note**: which encodings are supported depends on the engine.
   * > For info on Node.js, see:
   * > <https://nodejs.org/api/util.html#whatwg-supported-encodings>.
   *
   * @param {string | null | undefined} [encoding='utf8']
   *   Character encoding to understand `value` as when it’s a `Uint8Array`
   *   (default: `'utf-8'`).
   * @returns {string}
   *   Serialized file.
   */
  toString(t) {
    return this.value === void 0 ? "" : typeof this.value == "string" ? this.value : new TextDecoder(t || void 0).decode(this.value);
  }
}
function ur(e, t) {
  if (e && e.includes(ct.sep))
    throw new Error(
      "`" + t + "` cannot be a path: did not expect `" + ct.sep + "`"
    );
}
function dr(e, t) {
  if (!e)
    throw new Error("`" + t + "` cannot be empty");
}
function so(e, t) {
  if (!e)
    throw new Error("Setting `" + t + "` requires `path` to be set too");
}
function fp(e) {
  return !!(e && typeof e == "object" && "byteLength" in e && "byteOffset" in e);
}
const gp = (
  /**
   * @type {new <Parameters extends Array<unknown>, Result>(property: string | symbol) => (...parameters: Parameters) => Result}
   */
  /** @type {unknown} */
  /**
   * @this {Function}
   * @param {string | symbol} property
   * @returns {(...parameters: Array<unknown>) => unknown}
   */
  function(e) {
    const r = (
      /** @type {Record<string | symbol, Function>} */
      // Prototypes do exist.
      // type-coverage:ignore-next-line
      this.constructor.prototype
    ), i = r[e], a = function() {
      return i.apply(a, arguments);
    };
    return Object.setPrototypeOf(a, r), a;
  }
), mp = {}.hasOwnProperty;
class si extends gp {
  /**
   * Create a processor.
   */
  constructor() {
    super("copy"), this.Compiler = void 0, this.Parser = void 0, this.attachers = [], this.compiler = void 0, this.freezeIndex = -1, this.frozen = void 0, this.namespace = {}, this.parser = void 0, this.transformers = tp();
  }
  /**
   * Copy a processor.
   *
   * @deprecated
   *   This is a private internal method and should not be used.
   * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
   *   New *unfrozen* processor ({@linkcode Processor}) that is
   *   configured to work the same as its ancestor.
   *   When the descendant processor is configured in the future it does not
   *   affect the ancestral processor.
   */
  copy() {
    const t = (
      /** @type {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>} */
      new si()
    );
    let n = -1;
    for (; ++n < this.attachers.length; ) {
      const r = this.attachers[n];
      t.use(...r);
    }
    return t.data(lr(!0, {}, this.namespace)), t;
  }
  /**
   * Configure the processor with info available to all plugins.
   * Information is stored in an object.
   *
   * Typically, options can be given to a specific plugin, but sometimes it
   * makes sense to have information shared with several plugins.
   * For example, a list of HTML elements that are self-closing, which is
   * needed during all phases.
   *
   * > **Note**: setting information cannot occur on *frozen* processors.
   * > Call the processor first to create a new unfrozen processor.
   *
   * > **Note**: to register custom data in TypeScript, augment the
   * > {@linkcode Data} interface.
   *
   * @example
   *   This example show how to get and set info:
   *
   *   ```js
   *   import {unified} from 'unified'
   *
   *   const processor = unified().data('alpha', 'bravo')
   *
   *   processor.data('alpha') // => 'bravo'
   *
   *   processor.data() // => {alpha: 'bravo'}
   *
   *   processor.data({charlie: 'delta'})
   *
   *   processor.data() // => {charlie: 'delta'}
   *   ```
   *
   * @template {keyof Data} Key
   *
   * @overload
   * @returns {Data}
   *
   * @overload
   * @param {Data} dataset
   * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
   *
   * @overload
   * @param {Key} key
   * @returns {Data[Key]}
   *
   * @overload
   * @param {Key} key
   * @param {Data[Key]} value
   * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
   *
   * @param {Data | Key} [key]
   *   Key to get or set, or entire dataset to set, or nothing to get the
   *   entire dataset (optional).
   * @param {Data[Key]} [value]
   *   Value to set (optional).
   * @returns {unknown}
   *   The current processor when setting, the value at `key` when getting, or
   *   the entire dataset when getting without key.
   */
  data(t, n) {
    return typeof t == "string" ? arguments.length === 2 ? (gr("data", this.frozen), this.namespace[t] = n, this) : mp.call(this.namespace, t) && this.namespace[t] || void 0 : t ? (gr("data", this.frozen), this.namespace = t, this) : this.namespace;
  }
  /**
   * Freeze a processor.
   *
   * Frozen processors are meant to be extended and not to be configured
   * directly.
   *
   * When a processor is frozen it cannot be unfrozen.
   * New processors working the same way can be created by calling the
   * processor.
   *
   * It’s possible to freeze processors explicitly by calling `.freeze()`.
   * Processors freeze automatically when `.parse()`, `.run()`, `.runSync()`,
   * `.stringify()`, `.process()`, or `.processSync()` are called.
   *
   * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
   *   The current processor.
   */
  freeze() {
    if (this.frozen)
      return this;
    const t = (
      /** @type {Processor} */
      /** @type {unknown} */
      this
    );
    for (; ++this.freezeIndex < this.attachers.length; ) {
      const [n, ...r] = this.attachers[this.freezeIndex];
      if (r[0] === !1)
        continue;
      r[0] === !0 && (r[0] = void 0);
      const i = n.call(t, ...r);
      typeof i == "function" && this.transformers.use(i);
    }
    return this.frozen = !0, this.freezeIndex = Number.POSITIVE_INFINITY, this;
  }
  /**
   * Parse text to a syntax tree.
   *
   * > **Note**: `parse` freezes the processor if not already *frozen*.
   *
   * > **Note**: `parse` performs the parse phase, not the run phase or other
   * > phases.
   *
   * @param {Compatible | undefined} [file]
   *   file to parse (optional); typically `string` or `VFile`; any value
   *   accepted as `x` in `new VFile(x)`.
   * @returns {ParseTree extends undefined ? Node : ParseTree}
   *   Syntax tree representing `file`.
   */
  parse(t) {
    this.freeze();
    const n = Tn(t), r = this.parser || this.Parser;
    return pr("parse", r), r(String(n), n);
  }
  /**
   * Process the given file as configured on the processor.
   *
   * > **Note**: `process` freezes the processor if not already *frozen*.
   *
   * > **Note**: `process` performs the parse, run, and stringify phases.
   *
   * @overload
   * @param {Compatible | undefined} file
   * @param {ProcessCallback<VFileWithOutput<CompileResult>>} done
   * @returns {undefined}
   *
   * @overload
   * @param {Compatible | undefined} [file]
   * @returns {Promise<VFileWithOutput<CompileResult>>}
   *
   * @param {Compatible | undefined} [file]
   *   File (optional); typically `string` or `VFile`]; any value accepted as
   *   `x` in `new VFile(x)`.
   * @param {ProcessCallback<VFileWithOutput<CompileResult>> | undefined} [done]
   *   Callback (optional).
   * @returns {Promise<VFile> | undefined}
   *   Nothing if `done` is given.
   *   Otherwise a promise, rejected with a fatal error or resolved with the
   *   processed file.
   *
   *   The parsed, transformed, and compiled value is available at
   *   `file.value` (see note).
   *
   *   > **Note**: unified typically compiles by serializing: most
   *   > compilers return `string` (or `Uint8Array`).
   *   > Some compilers, such as the one configured with
   *   > [`rehype-react`][rehype-react], return other values (in this case, a
   *   > React tree).
   *   > If you’re using a compiler that doesn’t serialize, expect different
   *   > result values.
   *   >
   *   > To register custom results in TypeScript, add them to
   *   > {@linkcode CompileResultMap}.
   *
   *   [rehype-react]: https://github.com/rehypejs/rehype-react
   */
  process(t, n) {
    const r = this;
    return this.freeze(), pr("process", this.parser || this.Parser), fr("process", this.compiler || this.Compiler), n ? i(void 0, n) : new Promise(i);
    function i(a, o) {
      const s = Tn(t), l = (
        /** @type {HeadTree extends undefined ? Node : HeadTree} */
        /** @type {unknown} */
        r.parse(s)
      );
      r.run(l, s, function(u, d, f) {
        if (u || !d || !f)
          return c(u);
        const p = (
          /** @type {CompileTree extends undefined ? Node : CompileTree} */
          /** @type {unknown} */
          d
        ), m = r.stringify(p, f);
        yp(m) ? f.value = m : f.result = m, c(
          u,
          /** @type {VFileWithOutput<CompileResult>} */
          f
        );
      });
      function c(u, d) {
        u || !d ? o(u) : a ? a(d) : n(void 0, d);
      }
    }
  }
  /**
   * Process the given file as configured on the processor.
   *
   * An error is thrown if asynchronous transforms are configured.
   *
   * > **Note**: `processSync` freezes the processor if not already *frozen*.
   *
   * > **Note**: `processSync` performs the parse, run, and stringify phases.
   *
   * @param {Compatible | undefined} [file]
   *   File (optional); typically `string` or `VFile`; any value accepted as
   *   `x` in `new VFile(x)`.
   * @returns {VFileWithOutput<CompileResult>}
   *   The processed file.
   *
   *   The parsed, transformed, and compiled value is available at
   *   `file.value` (see note).
   *
   *   > **Note**: unified typically compiles by serializing: most
   *   > compilers return `string` (or `Uint8Array`).
   *   > Some compilers, such as the one configured with
   *   > [`rehype-react`][rehype-react], return other values (in this case, a
   *   > React tree).
   *   > If you’re using a compiler that doesn’t serialize, expect different
   *   > result values.
   *   >
   *   > To register custom results in TypeScript, add them to
   *   > {@linkcode CompileResultMap}.
   *
   *   [rehype-react]: https://github.com/rehypejs/rehype-react
   */
  processSync(t) {
    let n = !1, r;
    return this.freeze(), pr("processSync", this.parser || this.Parser), fr("processSync", this.compiler || this.Compiler), this.process(t, i), co("processSync", "process", n), r;
    function i(a, o) {
      n = !0, oo(a), r = o;
    }
  }
  /**
   * Run *transformers* on a syntax tree.
   *
   * > **Note**: `run` freezes the processor if not already *frozen*.
   *
   * > **Note**: `run` performs the run phase, not other phases.
   *
   * @overload
   * @param {HeadTree extends undefined ? Node : HeadTree} tree
   * @param {RunCallback<TailTree extends undefined ? Node : TailTree>} done
   * @returns {undefined}
   *
   * @overload
   * @param {HeadTree extends undefined ? Node : HeadTree} tree
   * @param {Compatible | undefined} file
   * @param {RunCallback<TailTree extends undefined ? Node : TailTree>} done
   * @returns {undefined}
   *
   * @overload
   * @param {HeadTree extends undefined ? Node : HeadTree} tree
   * @param {Compatible | undefined} [file]
   * @returns {Promise<TailTree extends undefined ? Node : TailTree>}
   *
   * @param {HeadTree extends undefined ? Node : HeadTree} tree
   *   Tree to transform and inspect.
   * @param {(
   *   RunCallback<TailTree extends undefined ? Node : TailTree> |
   *   Compatible
   * )} [file]
   *   File associated with `node` (optional); any value accepted as `x` in
   *   `new VFile(x)`.
   * @param {RunCallback<TailTree extends undefined ? Node : TailTree>} [done]
   *   Callback (optional).
   * @returns {Promise<TailTree extends undefined ? Node : TailTree> | undefined}
   *   Nothing if `done` is given.
   *   Otherwise, a promise rejected with a fatal error or resolved with the
   *   transformed tree.
   */
  run(t, n, r) {
    lo(t), this.freeze();
    const i = this.transformers;
    return !r && typeof n == "function" && (r = n, n = void 0), r ? a(void 0, r) : new Promise(a);
    function a(o, s) {
      const l = Tn(n);
      i.run(t, l, c);
      function c(u, d, f) {
        const p = (
          /** @type {TailTree extends undefined ? Node : TailTree} */
          d || t
        );
        u ? s(u) : o ? o(p) : r(void 0, p, f);
      }
    }
  }
  /**
   * Run *transformers* on a syntax tree.
   *
   * An error is thrown if asynchronous transforms are configured.
   *
   * > **Note**: `runSync` freezes the processor if not already *frozen*.
   *
   * > **Note**: `runSync` performs the run phase, not other phases.
   *
   * @param {HeadTree extends undefined ? Node : HeadTree} tree
   *   Tree to transform and inspect.
   * @param {Compatible | undefined} [file]
   *   File associated with `node` (optional); any value accepted as `x` in
   *   `new VFile(x)`.
   * @returns {TailTree extends undefined ? Node : TailTree}
   *   Transformed tree.
   */
  runSync(t, n) {
    let r = !1, i;
    return this.run(t, n, a), co("runSync", "run", r), i;
    function a(o, s) {
      oo(o), i = s, r = !0;
    }
  }
  /**
   * Compile a syntax tree.
   *
   * > **Note**: `stringify` freezes the processor if not already *frozen*.
   *
   * > **Note**: `stringify` performs the stringify phase, not the run phase
   * > or other phases.
   *
   * @param {CompileTree extends undefined ? Node : CompileTree} tree
   *   Tree to compile.
   * @param {Compatible | undefined} [file]
   *   File associated with `node` (optional); any value accepted as `x` in
   *   `new VFile(x)`.
   * @returns {CompileResult extends undefined ? Value : CompileResult}
   *   Textual representation of the tree (see note).
   *
   *   > **Note**: unified typically compiles by serializing: most compilers
   *   > return `string` (or `Uint8Array`).
   *   > Some compilers, such as the one configured with
   *   > [`rehype-react`][rehype-react], return other values (in this case, a
   *   > React tree).
   *   > If you’re using a compiler that doesn’t serialize, expect different
   *   > result values.
   *   >
   *   > To register custom results in TypeScript, add them to
   *   > {@linkcode CompileResultMap}.
   *
   *   [rehype-react]: https://github.com/rehypejs/rehype-react
   */
  stringify(t, n) {
    this.freeze();
    const r = Tn(n), i = this.compiler || this.Compiler;
    return fr("stringify", i), lo(t), i(t, r);
  }
  /**
   * Configure the processor to use a plugin, a list of usable values, or a
   * preset.
   *
   * If the processor is already using a plugin, the previous plugin
   * configuration is changed based on the options that are passed in.
   * In other words, the plugin is not added a second time.
   *
   * > **Note**: `use` cannot be called on *frozen* processors.
   * > Call the processor first to create a new unfrozen processor.
   *
   * @example
   *   There are many ways to pass plugins to `.use()`.
   *   This example gives an overview:
   *
   *   ```js
   *   import {unified} from 'unified'
   *
   *   unified()
   *     // Plugin with options:
   *     .use(pluginA, {x: true, y: true})
   *     // Passing the same plugin again merges configuration (to `{x: true, y: false, z: true}`):
   *     .use(pluginA, {y: false, z: true})
   *     // Plugins:
   *     .use([pluginB, pluginC])
   *     // Two plugins, the second with options:
   *     .use([pluginD, [pluginE, {}]])
   *     // Preset with plugins and settings:
   *     .use({plugins: [pluginF, [pluginG, {}]], settings: {position: false}})
   *     // Settings only:
   *     .use({settings: {position: false}})
   *   ```
   *
   * @template {Array<unknown>} [Parameters=[]]
   * @template {Node | string | undefined} [Input=undefined]
   * @template [Output=Input]
   *
   * @overload
   * @param {Preset | null | undefined} [preset]
   * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
   *
   * @overload
   * @param {PluggableList} list
   * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
   *
   * @overload
   * @param {Plugin<Parameters, Input, Output>} plugin
   * @param {...(Parameters | [boolean])} parameters
   * @returns {UsePlugin<ParseTree, HeadTree, TailTree, CompileTree, CompileResult, Input, Output>}
   *
   * @param {PluggableList | Plugin | Preset | null | undefined} value
   *   Usable value.
   * @param {...unknown} parameters
   *   Parameters, when a plugin is given as a usable value.
   * @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
   *   Current processor.
   */
  use(t, ...n) {
    const r = this.attachers, i = this.namespace;
    if (gr("use", this.frozen), t != null) if (typeof t == "function")
      l(t, n);
    else if (typeof t == "object")
      Array.isArray(t) ? s(t) : o(t);
    else
      throw new TypeError("Expected usable value, not `" + t + "`");
    return this;
    function a(c) {
      if (typeof c == "function")
        l(c, []);
      else if (typeof c == "object")
        if (Array.isArray(c)) {
          const [u, ...d] = (
            /** @type {PluginTuple<Array<unknown>>} */
            c
          );
          l(u, d);
        } else
          o(c);
      else
        throw new TypeError("Expected usable value, not `" + c + "`");
    }
    function o(c) {
      if (!("plugins" in c) && !("settings" in c))
        throw new Error(
          "Expected usable value but received an empty preset, which is probably a mistake: presets typically come with `plugins` and sometimes with `settings`, but this has neither"
        );
      s(c.plugins), c.settings && (i.settings = lr(!0, i.settings, c.settings));
    }
    function s(c) {
      let u = -1;
      if (c != null) if (Array.isArray(c))
        for (; ++u < c.length; ) {
          const d = c[u];
          a(d);
        }
      else
        throw new TypeError("Expected a list of plugins, not `" + c + "`");
    }
    function l(c, u) {
      let d = -1, f = -1;
      for (; ++d < r.length; )
        if (r[d][0] === c) {
          f = d;
          break;
        }
      if (f === -1)
        r.push([c, ...u]);
      else if (u.length > 0) {
        let [p, ...m] = u;
        const h = r[f][1];
        Lr(h) && Lr(p) && (p = lr(!0, h, p)), r[f] = [c, p, ...m];
      }
    }
  }
}
const hp = new si().freeze();
function pr(e, t) {
  if (typeof t != "function")
    throw new TypeError("Cannot `" + e + "` without `parser`");
}
function fr(e, t) {
  if (typeof t != "function")
    throw new TypeError("Cannot `" + e + "` without `compiler`");
}
function gr(e, t) {
  if (t)
    throw new Error(
      "Cannot call `" + e + "` on a frozen processor.\nCreate a new processor first, by calling it: use `processor()` instead of `processor`."
    );
}
function lo(e) {
  if (!Lr(e) || typeof e.type != "string")
    throw new TypeError("Expected node, got `" + e + "`");
}
function co(e, t, n) {
  if (!n)
    throw new Error(
      "`" + e + "` finished async. Use `" + t + "` instead"
    );
}
function Tn(e) {
  return bp(e) ? e : new xa(e);
}
function bp(e) {
  return !!(e && typeof e == "object" && "message" in e && "messages" in e);
}
function yp(e) {
  return typeof e == "string" || Ep(e);
}
function Ep(e) {
  return !!(e && typeof e == "object" && "byteLength" in e && "byteOffset" in e);
}
const _p = "https://github.com/remarkjs/react-markdown/blob/main/changelog.md", uo = [], po = { allowDangerousHtml: !0 }, kp = /^(https?|ircs?|mailto|xmpp)$/i, xp = [
  { from: "astPlugins", id: "remove-buggy-html-in-markdown-parser" },
  { from: "allowDangerousHtml", id: "remove-buggy-html-in-markdown-parser" },
  {
    from: "allowNode",
    id: "replace-allownode-allowedtypes-and-disallowedtypes",
    to: "allowElement"
  },
  {
    from: "allowedTypes",
    id: "replace-allownode-allowedtypes-and-disallowedtypes",
    to: "allowedElements"
  },
  { from: "className", id: "remove-classname" },
  {
    from: "disallowedTypes",
    id: "replace-allownode-allowedtypes-and-disallowedtypes",
    to: "disallowedElements"
  },
  { from: "escapeHtml", id: "remove-buggy-html-in-markdown-parser" },
  { from: "includeElementIndex", id: "#remove-includeelementindex" },
  {
    from: "includeNodeIndex",
    id: "change-includenodeindex-to-includeelementindex"
  },
  { from: "linkTarget", id: "remove-linktarget" },
  { from: "plugins", id: "change-plugins-to-remarkplugins", to: "remarkPlugins" },
  { from: "rawSourcePos", id: "#remove-rawsourcepos" },
  { from: "renderers", id: "change-renderers-to-components", to: "components" },
  { from: "source", id: "change-source-to-children", to: "children" },
  { from: "sourcePos", id: "#remove-sourcepos" },
  { from: "transformImageUri", id: "#add-urltransform", to: "urlTransform" },
  { from: "transformLinkUri", id: "#add-urltransform", to: "urlTransform" }
];
function wp(e) {
  const t = Sp(e), n = vp(e);
  return Tp(t.runSync(t.parse(n), n), e);
}
function Sp(e) {
  const t = e.rehypePlugins || uo, n = e.remarkPlugins || uo, r = e.remarkRehypeOptions ? { ...e.remarkRehypeOptions, ...po } : po;
  return hp().use(id).use(n).use(Qd, r).use(t);
}
function vp(e) {
  const t = e.children || "", n = new xa();
  return typeof t == "string" && (n.value = t), n;
}
function Tp(e, t) {
  const n = t.allowedElements, r = t.allowElement, i = t.components, a = t.disallowedElements, o = t.skipHtml, s = t.unwrapDisallowed, l = t.urlTransform || Np;
  for (const u of xp)
    Object.hasOwn(t, u.from) && ("" + u.from + (u.to ? "use `" + u.to + "` instead" : "remove it") + _p + u.id, void 0);
  return qt(e, c), $l(e, {
    Fragment: ae.Fragment,
    components: i,
    ignoreInvalidStyle: !0,
    jsx: ae.jsx,
    jsxs: ae.jsxs,
    passKeys: !0,
    passNode: !0
  });
  function c(u, d, f) {
    if (u.type === "raw" && f && typeof d == "number")
      return o ? f.children.splice(d, 1) : f.children[d] = { type: "text", value: u.value }, d;
    if (u.type === "element") {
      let p;
      for (p in ir)
        if (Object.hasOwn(ir, p) && Object.hasOwn(u.properties, p)) {
          const m = u.properties[p], h = ir[p];
          (h === null || h.includes(u.tagName)) && (u.properties[p] = l(String(m || ""), p, u));
        }
    }
    if (u.type === "element") {
      let p = n ? !n.includes(u.tagName) : a ? a.includes(u.tagName) : !1;
      if (!p && r && typeof d == "number" && (p = !r(u, d, f)), p && f && typeof d == "number")
        return s && u.children ? f.children.splice(d, 1, ...u.children) : f.children.splice(d, 1), d;
    }
  }
}
function Np(e) {
  const t = e.indexOf(":"), n = e.indexOf("?"), r = e.indexOf("#"), i = e.indexOf("/");
  return (
    // If there is no protocol, it’s relative.
    t === -1 || // If the first colon is after a `?`, `#`, or `/`, it’s not a protocol.
    i !== -1 && t > i || n !== -1 && t > n || r !== -1 && t > r || // It is a protocol, it should be allowed.
    kp.test(e.slice(0, t)) ? e : ""
  );
}
const Ap = /\?\[([^\]]+)\]/;
function Cp() {
  return (e) => {
    qt(
      e,
      "text",
      (t, n, r) => {
        const i = t.value, a = Ap.exec(i);
        if (!a || n === null || r === null) return;
        const o = a.index, s = o + a[0].length, l = [
          {
            type: "text",
            value: i.substring(0, o)
          },
          {
            type: "element",
            data: {
              hName: "custom-button",
              hProperties: { buttonText: a[1] }
            }
          },
          {
            type: "text",
            value: i.substring(s)
          }
        ];
        r.children.splice(n, 1, ...l);
      }
    );
  };
}
function fo(e, t) {
  if (typeof e == "function")
    return e(t);
  e != null && (e.current = t);
}
function Rp(...e) {
  return (t) => {
    let n = !1;
    const r = e.map((i) => {
      const a = fo(i, t);
      return !n && typeof a == "function" && (n = !0), a;
    });
    if (n)
      return () => {
        for (let i = 0; i < r.length; i++) {
          const a = r[i];
          typeof a == "function" ? a() : fo(e[i], null);
        }
      };
  };
}
// @__NO_SIDE_EFFECTS__
function Op(e) {
  const t = /* @__PURE__ */ Mp(e), n = We.forwardRef((r, i) => {
    const { children: a, ...o } = r, s = We.Children.toArray(a), l = s.find(Dp);
    if (l) {
      const c = l.props.children, u = s.map((d) => d === l ? We.Children.count(c) > 1 ? We.Children.only(null) : We.isValidElement(c) ? c.props.children : null : d);
      return /* @__PURE__ */ ae.jsx(t, { ...o, ref: i, children: We.isValidElement(c) ? We.cloneElement(c, void 0, u) : null });
    }
    return /* @__PURE__ */ ae.jsx(t, { ...o, ref: i, children: a });
  });
  return n.displayName = `${e}.Slot`, n;
}
var Ip = /* @__PURE__ */ Op("Slot");
// @__NO_SIDE_EFFECTS__
function Mp(e) {
  const t = We.forwardRef((n, r) => {
    const { children: i, ...a } = n;
    if (We.isValidElement(i)) {
      const o = Bp(i), s = Pp(a, i.props);
      return i.type !== We.Fragment && (s.ref = r ? Rp(r, o) : o), We.cloneElement(i, s);
    }
    return We.Children.count(i) > 1 ? We.Children.only(null) : null;
  });
  return t.displayName = `${e}.SlotClone`, t;
}
var Lp = Symbol("radix.slottable");
function Dp(e) {
  return We.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === Lp;
}
function Pp(e, t) {
  const n = { ...t };
  for (const r in t) {
    const i = e[r], a = t[r];
    /^on[A-Z]/.test(r) ? i && a ? n[r] = (...s) => {
      const l = a(...s);
      return i(...s), l;
    } : i && (n[r] = i) : r === "style" ? n[r] = { ...i, ...a } : r === "className" && (n[r] = [i, a].filter(Boolean).join(" "));
  }
  return { ...e, ...n };
}
function Bp(e) {
  let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
  return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
function wa(e) {
  var t, n, r = "";
  if (typeof e == "string" || typeof e == "number") r += e;
  else if (typeof e == "object") if (Array.isArray(e)) {
    var i = e.length;
    for (t = 0; t < i; t++) e[t] && (n = wa(e[t])) && (r && (r += " "), r += n);
  } else for (n in e) e[n] && (r && (r += " "), r += n);
  return r;
}
function Sa() {
  for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = wa(e)) && (r && (r += " "), r += t);
  return r;
}
const go = (e) => typeof e == "boolean" ? `${e}` : e === 0 ? "0" : e, mo = Sa, Fp = (e, t) => (n) => {
  var r;
  if (t?.variants == null) return mo(e, n?.class, n?.className);
  const { variants: i, defaultVariants: a } = t, o = Object.keys(i).map((c) => {
    const u = n?.[c], d = a?.[c];
    if (u === null) return null;
    const f = go(u) || go(d);
    return i[c][f];
  }), s = n && Object.entries(n).reduce((c, u) => {
    let [d, f] = u;
    return f === void 0 || (c[d] = f), c;
  }, {}), l = t == null || (r = t.compoundVariants) === null || r === void 0 ? void 0 : r.reduce((c, u) => {
    let { class: d, className: f, ...p } = u;
    return Object.entries(p).every((m) => {
      let [h, k] = m;
      return Array.isArray(k) ? k.includes({
        ...a,
        ...s
      }[h]) : {
        ...a,
        ...s
      }[h] === k;
    }) ? [
      ...c,
      d,
      f
    ] : c;
  }, []);
  return mo(e, o, l, n?.class, n?.className);
}, li = "-", zp = (e) => {
  const t = $p(e), {
    conflictingClassGroups: n,
    conflictingClassGroupModifiers: r
  } = e;
  return {
    getClassGroupId: (o) => {
      const s = o.split(li);
      return s[0] === "" && s.length !== 1 && s.shift(), va(s, t) || Up(o);
    },
    getConflictingClassGroupIds: (o, s) => {
      const l = n[o] || [];
      return s && r[o] ? [...l, ...r[o]] : l;
    }
  };
}, va = (e, t) => {
  if (e.length === 0)
    return t.classGroupId;
  const n = e[0], r = t.nextPart.get(n), i = r ? va(e.slice(1), r) : void 0;
  if (i)
    return i;
  if (t.validators.length === 0)
    return;
  const a = e.join(li);
  return t.validators.find(({
    validator: o
  }) => o(a))?.classGroupId;
}, ho = /^\[(.+)\]$/, Up = (e) => {
  if (ho.test(e)) {
    const t = ho.exec(e)[1], n = t?.substring(0, t.indexOf(":"));
    if (n)
      return "arbitrary.." + n;
  }
}, $p = (e) => {
  const {
    theme: t,
    classGroups: n
  } = e, r = {
    nextPart: /* @__PURE__ */ new Map(),
    validators: []
  };
  for (const i in n)
    Pr(n[i], r, i, t);
  return r;
}, Pr = (e, t, n, r) => {
  e.forEach((i) => {
    if (typeof i == "string") {
      const a = i === "" ? t : bo(t, i);
      a.classGroupId = n;
      return;
    }
    if (typeof i == "function") {
      if (Hp(i)) {
        Pr(i(r), t, n, r);
        return;
      }
      t.validators.push({
        validator: i,
        classGroupId: n
      });
      return;
    }
    Object.entries(i).forEach(([a, o]) => {
      Pr(o, bo(t, a), n, r);
    });
  });
}, bo = (e, t) => {
  let n = e;
  return t.split(li).forEach((r) => {
    n.nextPart.has(r) || n.nextPart.set(r, {
      nextPart: /* @__PURE__ */ new Map(),
      validators: []
    }), n = n.nextPart.get(r);
  }), n;
}, Hp = (e) => e.isThemeGetter, Gp = (e) => {
  if (e < 1)
    return {
      get: () => {
      },
      set: () => {
      }
    };
  let t = 0, n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map();
  const i = (a, o) => {
    n.set(a, o), t++, t > e && (t = 0, r = n, n = /* @__PURE__ */ new Map());
  };
  return {
    get(a) {
      let o = n.get(a);
      if (o !== void 0)
        return o;
      if ((o = r.get(a)) !== void 0)
        return i(a, o), o;
    },
    set(a, o) {
      n.has(a) ? n.set(a, o) : i(a, o);
    }
  };
}, Br = "!", Fr = ":", Kp = Fr.length, qp = (e) => {
  const {
    prefix: t,
    experimentalParseClassName: n
  } = e;
  let r = (i) => {
    const a = [];
    let o = 0, s = 0, l = 0, c;
    for (let m = 0; m < i.length; m++) {
      let h = i[m];
      if (o === 0 && s === 0) {
        if (h === Fr) {
          a.push(i.slice(l, m)), l = m + Kp;
          continue;
        }
        if (h === "/") {
          c = m;
          continue;
        }
      }
      h === "[" ? o++ : h === "]" ? o-- : h === "(" ? s++ : h === ")" && s--;
    }
    const u = a.length === 0 ? i : i.substring(l), d = Wp(u), f = d !== u, p = c && c > l ? c - l : void 0;
    return {
      modifiers: a,
      hasImportantModifier: f,
      baseClassName: d,
      maybePostfixModifierPosition: p
    };
  };
  if (t) {
    const i = t + Fr, a = r;
    r = (o) => o.startsWith(i) ? a(o.substring(i.length)) : {
      isExternal: !0,
      modifiers: [],
      hasImportantModifier: !1,
      baseClassName: o,
      maybePostfixModifierPosition: void 0
    };
  }
  if (n) {
    const i = r;
    r = (a) => n({
      className: a,
      parseClassName: i
    });
  }
  return r;
}, Wp = (e) => e.endsWith(Br) ? e.substring(0, e.length - 1) : e.startsWith(Br) ? e.substring(1) : e, Vp = (e) => {
  const t = Object.fromEntries(e.orderSensitiveModifiers.map((r) => [r, !0]));
  return (r) => {
    if (r.length <= 1)
      return r;
    const i = [];
    let a = [];
    return r.forEach((o) => {
      o[0] === "[" || t[o] ? (i.push(...a.sort(), o), a = []) : a.push(o);
    }), i.push(...a.sort()), i;
  };
}, Yp = (e) => ({
  cache: Gp(e.cacheSize),
  parseClassName: qp(e),
  sortModifiers: Vp(e),
  ...zp(e)
}), jp = /\s+/, Zp = (e, t) => {
  const {
    parseClassName: n,
    getClassGroupId: r,
    getConflictingClassGroupIds: i,
    sortModifiers: a
  } = t, o = [], s = e.trim().split(jp);
  let l = "";
  for (let c = s.length - 1; c >= 0; c -= 1) {
    const u = s[c], {
      isExternal: d,
      modifiers: f,
      hasImportantModifier: p,
      baseClassName: m,
      maybePostfixModifierPosition: h
    } = n(u);
    if (d) {
      l = u + (l.length > 0 ? " " + l : l);
      continue;
    }
    let k = !!h, y = r(k ? m.substring(0, h) : m);
    if (!y) {
      if (!k) {
        l = u + (l.length > 0 ? " " + l : l);
        continue;
      }
      if (y = r(m), !y) {
        l = u + (l.length > 0 ? " " + l : l);
        continue;
      }
      k = !1;
    }
    const S = a(f).join(":"), w = p ? S + Br : S, N = w + y;
    if (o.includes(N))
      continue;
    o.push(N);
    const A = i(y, k);
    for (let _ = 0; _ < A.length; ++_) {
      const L = A[_];
      o.push(w + L);
    }
    l = u + (l.length > 0 ? " " + l : l);
  }
  return l;
};
function Xp() {
  let e = 0, t, n, r = "";
  for (; e < arguments.length; )
    (t = arguments[e++]) && (n = Ta(t)) && (r && (r += " "), r += n);
  return r;
}
const Ta = (e) => {
  if (typeof e == "string")
    return e;
  let t, n = "";
  for (let r = 0; r < e.length; r++)
    e[r] && (t = Ta(e[r])) && (n && (n += " "), n += t);
  return n;
};
function Qp(e, ...t) {
  let n, r, i, a = o;
  function o(l) {
    const c = t.reduce((u, d) => d(u), e());
    return n = Yp(c), r = n.cache.get, i = n.cache.set, a = s, s(l);
  }
  function s(l) {
    const c = r(l);
    if (c)
      return c;
    const u = Zp(l, n);
    return i(l, u), u;
  }
  return function() {
    return a(Xp.apply(null, arguments));
  };
}
const Me = (e) => {
  const t = (n) => n[e] || [];
  return t.isThemeGetter = !0, t;
}, Na = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, Aa = /^\((?:(\w[\w-]*):)?(.+)\)$/i, Jp = /^\d+\/\d+$/, ef = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, tf = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, nf = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, rf = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, of = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, Bt = (e) => Jp.test(e), oe = (e) => !!e && !Number.isNaN(Number(e)), wt = (e) => !!e && Number.isInteger(Number(e)), mr = (e) => e.endsWith("%") && oe(e.slice(0, -1)), ht = (e) => ef.test(e), af = () => !0, sf = (e) => (
  // `colorFunctionRegex` check is necessary because color functions can have percentages in them which which would be incorrectly classified as lengths.
  // For example, `hsl(0 0% 0%)` would be classified as a length without this check.
  // I could also use lookbehind assertion in `lengthUnitRegex` but that isn't supported widely enough.
  tf.test(e) && !nf.test(e)
), Ca = () => !1, lf = (e) => rf.test(e), cf = (e) => of.test(e), uf = (e) => !q(e) && !W(e), df = (e) => Wt(e, Ia, Ca), q = (e) => Na.test(e), Nt = (e) => Wt(e, Ma, sf), hr = (e) => Wt(e, hf, oe), yo = (e) => Wt(e, Ra, Ca), pf = (e) => Wt(e, Oa, cf), Nn = (e) => Wt(e, La, lf), W = (e) => Aa.test(e), on = (e) => Vt(e, Ma), ff = (e) => Vt(e, bf), Eo = (e) => Vt(e, Ra), gf = (e) => Vt(e, Ia), mf = (e) => Vt(e, Oa), An = (e) => Vt(e, La, !0), Wt = (e, t, n) => {
  const r = Na.exec(e);
  return r ? r[1] ? t(r[1]) : n(r[2]) : !1;
}, Vt = (e, t, n = !1) => {
  const r = Aa.exec(e);
  return r ? r[1] ? t(r[1]) : n : !1;
}, Ra = (e) => e === "position" || e === "percentage", Oa = (e) => e === "image" || e === "url", Ia = (e) => e === "length" || e === "size" || e === "bg-size", Ma = (e) => e === "length", hf = (e) => e === "number", bf = (e) => e === "family-name", La = (e) => e === "shadow", yf = () => {
  const e = Me("color"), t = Me("font"), n = Me("text"), r = Me("font-weight"), i = Me("tracking"), a = Me("leading"), o = Me("breakpoint"), s = Me("container"), l = Me("spacing"), c = Me("radius"), u = Me("shadow"), d = Me("inset-shadow"), f = Me("text-shadow"), p = Me("drop-shadow"), m = Me("blur"), h = Me("perspective"), k = Me("aspect"), y = Me("ease"), S = Me("animate"), w = () => ["auto", "avoid", "all", "avoid-page", "page", "left", "right", "column"], N = () => [
    "center",
    "top",
    "bottom",
    "left",
    "right",
    "top-left",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "left-top",
    "top-right",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "right-top",
    "bottom-right",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "right-bottom",
    "bottom-left",
    // Deprecated since Tailwind CSS v4.1.0, see https://github.com/tailwindlabs/tailwindcss/pull/17378
    "left-bottom"
  ], A = () => [...N(), W, q], _ = () => ["auto", "hidden", "clip", "visible", "scroll"], L = () => ["auto", "contain", "none"], v = () => [W, q, l], R = () => [Bt, "full", "auto", ...v()], x = () => [wt, "none", "subgrid", W, q], O = () => ["auto", {
    span: ["full", wt, W, q]
  }, wt, W, q], F = () => [wt, "auto", W, q], U = () => ["auto", "min", "max", "fr", W, q], D = () => ["start", "end", "center", "between", "around", "evenly", "stretch", "baseline", "center-safe", "end-safe"], $ = () => ["start", "end", "center", "stretch", "center-safe", "end-safe"], Q = () => ["auto", ...v()], se = () => [Bt, "auto", "full", "dvw", "dvh", "lvw", "lvh", "svw", "svh", "min", "max", "fit", ...v()], I = () => [e, W, q], fe = () => [...N(), Eo, yo, {
    position: [W, q]
  }], g = () => ["no-repeat", {
    repeat: ["", "x", "y", "space", "round"]
  }], G = () => ["auto", "cover", "contain", gf, df, {
    size: [W, q]
  }], j = () => [mr, on, Nt], b = () => [
    // Deprecated since Tailwind CSS v4.0.0
    "",
    "none",
    "full",
    c,
    W,
    q
  ], le = () => ["", oe, on, Nt], _e = () => ["solid", "dashed", "dotted", "double"], be = () => ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"], me = () => [oe, mr, Eo, yo], ge = () => [
    // Deprecated since Tailwind CSS v4.0.0
    "",
    "none",
    m,
    W,
    q
  ], Ne = () => ["none", oe, W, q], Te = () => ["none", oe, W, q], Ke = () => [oe, W, q], ot = () => [Bt, "full", ...v()];
  return {
    cacheSize: 500,
    theme: {
      animate: ["spin", "ping", "pulse", "bounce"],
      aspect: ["video"],
      blur: [ht],
      breakpoint: [ht],
      color: [af],
      container: [ht],
      "drop-shadow": [ht],
      ease: ["in", "out", "in-out"],
      font: [uf],
      "font-weight": ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black"],
      "inset-shadow": [ht],
      leading: ["none", "tight", "snug", "normal", "relaxed", "loose"],
      perspective: ["dramatic", "near", "normal", "midrange", "distant", "none"],
      radius: [ht],
      shadow: [ht],
      spacing: ["px", oe],
      text: [ht],
      "text-shadow": [ht],
      tracking: ["tighter", "tight", "normal", "wide", "wider", "widest"]
    },
    classGroups: {
      // --------------
      // --- Layout ---
      // --------------
      /**
       * Aspect Ratio
       * @see https://tailwindcss.com/docs/aspect-ratio
       */
      aspect: [{
        aspect: ["auto", "square", Bt, q, W, k]
      }],
      /**
       * Container
       * @see https://tailwindcss.com/docs/container
       * @deprecated since Tailwind CSS v4.0.0
       */
      container: ["container"],
      /**
       * Columns
       * @see https://tailwindcss.com/docs/columns
       */
      columns: [{
        columns: [oe, q, W, s]
      }],
      /**
       * Break After
       * @see https://tailwindcss.com/docs/break-after
       */
      "break-after": [{
        "break-after": w()
      }],
      /**
       * Break Before
       * @see https://tailwindcss.com/docs/break-before
       */
      "break-before": [{
        "break-before": w()
      }],
      /**
       * Break Inside
       * @see https://tailwindcss.com/docs/break-inside
       */
      "break-inside": [{
        "break-inside": ["auto", "avoid", "avoid-page", "avoid-column"]
      }],
      /**
       * Box Decoration Break
       * @see https://tailwindcss.com/docs/box-decoration-break
       */
      "box-decoration": [{
        "box-decoration": ["slice", "clone"]
      }],
      /**
       * Box Sizing
       * @see https://tailwindcss.com/docs/box-sizing
       */
      box: [{
        box: ["border", "content"]
      }],
      /**
       * Display
       * @see https://tailwindcss.com/docs/display
       */
      display: ["block", "inline-block", "inline", "flex", "inline-flex", "table", "inline-table", "table-caption", "table-cell", "table-column", "table-column-group", "table-footer-group", "table-header-group", "table-row-group", "table-row", "flow-root", "grid", "inline-grid", "contents", "list-item", "hidden"],
      /**
       * Screen Reader Only
       * @see https://tailwindcss.com/docs/display#screen-reader-only
       */
      sr: ["sr-only", "not-sr-only"],
      /**
       * Floats
       * @see https://tailwindcss.com/docs/float
       */
      float: [{
        float: ["right", "left", "none", "start", "end"]
      }],
      /**
       * Clear
       * @see https://tailwindcss.com/docs/clear
       */
      clear: [{
        clear: ["left", "right", "both", "none", "start", "end"]
      }],
      /**
       * Isolation
       * @see https://tailwindcss.com/docs/isolation
       */
      isolation: ["isolate", "isolation-auto"],
      /**
       * Object Fit
       * @see https://tailwindcss.com/docs/object-fit
       */
      "object-fit": [{
        object: ["contain", "cover", "fill", "none", "scale-down"]
      }],
      /**
       * Object Position
       * @see https://tailwindcss.com/docs/object-position
       */
      "object-position": [{
        object: A()
      }],
      /**
       * Overflow
       * @see https://tailwindcss.com/docs/overflow
       */
      overflow: [{
        overflow: _()
      }],
      /**
       * Overflow X
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-x": [{
        "overflow-x": _()
      }],
      /**
       * Overflow Y
       * @see https://tailwindcss.com/docs/overflow
       */
      "overflow-y": [{
        "overflow-y": _()
      }],
      /**
       * Overscroll Behavior
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      overscroll: [{
        overscroll: L()
      }],
      /**
       * Overscroll Behavior X
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-x": [{
        "overscroll-x": L()
      }],
      /**
       * Overscroll Behavior Y
       * @see https://tailwindcss.com/docs/overscroll-behavior
       */
      "overscroll-y": [{
        "overscroll-y": L()
      }],
      /**
       * Position
       * @see https://tailwindcss.com/docs/position
       */
      position: ["static", "fixed", "absolute", "relative", "sticky"],
      /**
       * Top / Right / Bottom / Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      inset: [{
        inset: R()
      }],
      /**
       * Right / Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-x": [{
        "inset-x": R()
      }],
      /**
       * Top / Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      "inset-y": [{
        "inset-y": R()
      }],
      /**
       * Start
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      start: [{
        start: R()
      }],
      /**
       * End
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      end: [{
        end: R()
      }],
      /**
       * Top
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      top: [{
        top: R()
      }],
      /**
       * Right
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      right: [{
        right: R()
      }],
      /**
       * Bottom
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      bottom: [{
        bottom: R()
      }],
      /**
       * Left
       * @see https://tailwindcss.com/docs/top-right-bottom-left
       */
      left: [{
        left: R()
      }],
      /**
       * Visibility
       * @see https://tailwindcss.com/docs/visibility
       */
      visibility: ["visible", "invisible", "collapse"],
      /**
       * Z-Index
       * @see https://tailwindcss.com/docs/z-index
       */
      z: [{
        z: [wt, "auto", W, q]
      }],
      // ------------------------
      // --- Flexbox and Grid ---
      // ------------------------
      /**
       * Flex Basis
       * @see https://tailwindcss.com/docs/flex-basis
       */
      basis: [{
        basis: [Bt, "full", "auto", s, ...v()]
      }],
      /**
       * Flex Direction
       * @see https://tailwindcss.com/docs/flex-direction
       */
      "flex-direction": [{
        flex: ["row", "row-reverse", "col", "col-reverse"]
      }],
      /**
       * Flex Wrap
       * @see https://tailwindcss.com/docs/flex-wrap
       */
      "flex-wrap": [{
        flex: ["nowrap", "wrap", "wrap-reverse"]
      }],
      /**
       * Flex
       * @see https://tailwindcss.com/docs/flex
       */
      flex: [{
        flex: [oe, Bt, "auto", "initial", "none", q]
      }],
      /**
       * Flex Grow
       * @see https://tailwindcss.com/docs/flex-grow
       */
      grow: [{
        grow: ["", oe, W, q]
      }],
      /**
       * Flex Shrink
       * @see https://tailwindcss.com/docs/flex-shrink
       */
      shrink: [{
        shrink: ["", oe, W, q]
      }],
      /**
       * Order
       * @see https://tailwindcss.com/docs/order
       */
      order: [{
        order: [wt, "first", "last", "none", W, q]
      }],
      /**
       * Grid Template Columns
       * @see https://tailwindcss.com/docs/grid-template-columns
       */
      "grid-cols": [{
        "grid-cols": x()
      }],
      /**
       * Grid Column Start / End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start-end": [{
        col: O()
      }],
      /**
       * Grid Column Start
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-start": [{
        "col-start": F()
      }],
      /**
       * Grid Column End
       * @see https://tailwindcss.com/docs/grid-column
       */
      "col-end": [{
        "col-end": F()
      }],
      /**
       * Grid Template Rows
       * @see https://tailwindcss.com/docs/grid-template-rows
       */
      "grid-rows": [{
        "grid-rows": x()
      }],
      /**
       * Grid Row Start / End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start-end": [{
        row: O()
      }],
      /**
       * Grid Row Start
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-start": [{
        "row-start": F()
      }],
      /**
       * Grid Row End
       * @see https://tailwindcss.com/docs/grid-row
       */
      "row-end": [{
        "row-end": F()
      }],
      /**
       * Grid Auto Flow
       * @see https://tailwindcss.com/docs/grid-auto-flow
       */
      "grid-flow": [{
        "grid-flow": ["row", "col", "dense", "row-dense", "col-dense"]
      }],
      /**
       * Grid Auto Columns
       * @see https://tailwindcss.com/docs/grid-auto-columns
       */
      "auto-cols": [{
        "auto-cols": U()
      }],
      /**
       * Grid Auto Rows
       * @see https://tailwindcss.com/docs/grid-auto-rows
       */
      "auto-rows": [{
        "auto-rows": U()
      }],
      /**
       * Gap
       * @see https://tailwindcss.com/docs/gap
       */
      gap: [{
        gap: v()
      }],
      /**
       * Gap X
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-x": [{
        "gap-x": v()
      }],
      /**
       * Gap Y
       * @see https://tailwindcss.com/docs/gap
       */
      "gap-y": [{
        "gap-y": v()
      }],
      /**
       * Justify Content
       * @see https://tailwindcss.com/docs/justify-content
       */
      "justify-content": [{
        justify: [...D(), "normal"]
      }],
      /**
       * Justify Items
       * @see https://tailwindcss.com/docs/justify-items
       */
      "justify-items": [{
        "justify-items": [...$(), "normal"]
      }],
      /**
       * Justify Self
       * @see https://tailwindcss.com/docs/justify-self
       */
      "justify-self": [{
        "justify-self": ["auto", ...$()]
      }],
      /**
       * Align Content
       * @see https://tailwindcss.com/docs/align-content
       */
      "align-content": [{
        content: ["normal", ...D()]
      }],
      /**
       * Align Items
       * @see https://tailwindcss.com/docs/align-items
       */
      "align-items": [{
        items: [...$(), {
          baseline: ["", "last"]
        }]
      }],
      /**
       * Align Self
       * @see https://tailwindcss.com/docs/align-self
       */
      "align-self": [{
        self: ["auto", ...$(), {
          baseline: ["", "last"]
        }]
      }],
      /**
       * Place Content
       * @see https://tailwindcss.com/docs/place-content
       */
      "place-content": [{
        "place-content": D()
      }],
      /**
       * Place Items
       * @see https://tailwindcss.com/docs/place-items
       */
      "place-items": [{
        "place-items": [...$(), "baseline"]
      }],
      /**
       * Place Self
       * @see https://tailwindcss.com/docs/place-self
       */
      "place-self": [{
        "place-self": ["auto", ...$()]
      }],
      // Spacing
      /**
       * Padding
       * @see https://tailwindcss.com/docs/padding
       */
      p: [{
        p: v()
      }],
      /**
       * Padding X
       * @see https://tailwindcss.com/docs/padding
       */
      px: [{
        px: v()
      }],
      /**
       * Padding Y
       * @see https://tailwindcss.com/docs/padding
       */
      py: [{
        py: v()
      }],
      /**
       * Padding Start
       * @see https://tailwindcss.com/docs/padding
       */
      ps: [{
        ps: v()
      }],
      /**
       * Padding End
       * @see https://tailwindcss.com/docs/padding
       */
      pe: [{
        pe: v()
      }],
      /**
       * Padding Top
       * @see https://tailwindcss.com/docs/padding
       */
      pt: [{
        pt: v()
      }],
      /**
       * Padding Right
       * @see https://tailwindcss.com/docs/padding
       */
      pr: [{
        pr: v()
      }],
      /**
       * Padding Bottom
       * @see https://tailwindcss.com/docs/padding
       */
      pb: [{
        pb: v()
      }],
      /**
       * Padding Left
       * @see https://tailwindcss.com/docs/padding
       */
      pl: [{
        pl: v()
      }],
      /**
       * Margin
       * @see https://tailwindcss.com/docs/margin
       */
      m: [{
        m: Q()
      }],
      /**
       * Margin X
       * @see https://tailwindcss.com/docs/margin
       */
      mx: [{
        mx: Q()
      }],
      /**
       * Margin Y
       * @see https://tailwindcss.com/docs/margin
       */
      my: [{
        my: Q()
      }],
      /**
       * Margin Start
       * @see https://tailwindcss.com/docs/margin
       */
      ms: [{
        ms: Q()
      }],
      /**
       * Margin End
       * @see https://tailwindcss.com/docs/margin
       */
      me: [{
        me: Q()
      }],
      /**
       * Margin Top
       * @see https://tailwindcss.com/docs/margin
       */
      mt: [{
        mt: Q()
      }],
      /**
       * Margin Right
       * @see https://tailwindcss.com/docs/margin
       */
      mr: [{
        mr: Q()
      }],
      /**
       * Margin Bottom
       * @see https://tailwindcss.com/docs/margin
       */
      mb: [{
        mb: Q()
      }],
      /**
       * Margin Left
       * @see https://tailwindcss.com/docs/margin
       */
      ml: [{
        ml: Q()
      }],
      /**
       * Space Between X
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-x": [{
        "space-x": v()
      }],
      /**
       * Space Between X Reverse
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-x-reverse": ["space-x-reverse"],
      /**
       * Space Between Y
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-y": [{
        "space-y": v()
      }],
      /**
       * Space Between Y Reverse
       * @see https://tailwindcss.com/docs/margin#adding-space-between-children
       */
      "space-y-reverse": ["space-y-reverse"],
      // --------------
      // --- Sizing ---
      // --------------
      /**
       * Size
       * @see https://tailwindcss.com/docs/width#setting-both-width-and-height
       */
      size: [{
        size: se()
      }],
      /**
       * Width
       * @see https://tailwindcss.com/docs/width
       */
      w: [{
        w: [s, "screen", ...se()]
      }],
      /**
       * Min-Width
       * @see https://tailwindcss.com/docs/min-width
       */
      "min-w": [{
        "min-w": [
          s,
          "screen",
          /** Deprecated. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          "none",
          ...se()
        ]
      }],
      /**
       * Max-Width
       * @see https://tailwindcss.com/docs/max-width
       */
      "max-w": [{
        "max-w": [
          s,
          "screen",
          "none",
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          "prose",
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          {
            screen: [o]
          },
          ...se()
        ]
      }],
      /**
       * Height
       * @see https://tailwindcss.com/docs/height
       */
      h: [{
        h: ["screen", "lh", ...se()]
      }],
      /**
       * Min-Height
       * @see https://tailwindcss.com/docs/min-height
       */
      "min-h": [{
        "min-h": ["screen", "lh", "none", ...se()]
      }],
      /**
       * Max-Height
       * @see https://tailwindcss.com/docs/max-height
       */
      "max-h": [{
        "max-h": ["screen", "lh", ...se()]
      }],
      // ------------------
      // --- Typography ---
      // ------------------
      /**
       * Font Size
       * @see https://tailwindcss.com/docs/font-size
       */
      "font-size": [{
        text: ["base", n, on, Nt]
      }],
      /**
       * Font Smoothing
       * @see https://tailwindcss.com/docs/font-smoothing
       */
      "font-smoothing": ["antialiased", "subpixel-antialiased"],
      /**
       * Font Style
       * @see https://tailwindcss.com/docs/font-style
       */
      "font-style": ["italic", "not-italic"],
      /**
       * Font Weight
       * @see https://tailwindcss.com/docs/font-weight
       */
      "font-weight": [{
        font: [r, W, hr]
      }],
      /**
       * Font Stretch
       * @see https://tailwindcss.com/docs/font-stretch
       */
      "font-stretch": [{
        "font-stretch": ["ultra-condensed", "extra-condensed", "condensed", "semi-condensed", "normal", "semi-expanded", "expanded", "extra-expanded", "ultra-expanded", mr, q]
      }],
      /**
       * Font Family
       * @see https://tailwindcss.com/docs/font-family
       */
      "font-family": [{
        font: [ff, q, t]
      }],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-normal": ["normal-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-ordinal": ["ordinal"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-slashed-zero": ["slashed-zero"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-figure": ["lining-nums", "oldstyle-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-spacing": ["proportional-nums", "tabular-nums"],
      /**
       * Font Variant Numeric
       * @see https://tailwindcss.com/docs/font-variant-numeric
       */
      "fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
      /**
       * Letter Spacing
       * @see https://tailwindcss.com/docs/letter-spacing
       */
      tracking: [{
        tracking: [i, W, q]
      }],
      /**
       * Line Clamp
       * @see https://tailwindcss.com/docs/line-clamp
       */
      "line-clamp": [{
        "line-clamp": [oe, "none", W, hr]
      }],
      /**
       * Line Height
       * @see https://tailwindcss.com/docs/line-height
       */
      leading: [{
        leading: [
          /** Deprecated since Tailwind CSS v4.0.0. @see https://github.com/tailwindlabs/tailwindcss.com/issues/2027#issuecomment-2620152757 */
          a,
          ...v()
        ]
      }],
      /**
       * List Style Image
       * @see https://tailwindcss.com/docs/list-style-image
       */
      "list-image": [{
        "list-image": ["none", W, q]
      }],
      /**
       * List Style Position
       * @see https://tailwindcss.com/docs/list-style-position
       */
      "list-style-position": [{
        list: ["inside", "outside"]
      }],
      /**
       * List Style Type
       * @see https://tailwindcss.com/docs/list-style-type
       */
      "list-style-type": [{
        list: ["disc", "decimal", "none", W, q]
      }],
      /**
       * Text Alignment
       * @see https://tailwindcss.com/docs/text-align
       */
      "text-alignment": [{
        text: ["left", "center", "right", "justify", "start", "end"]
      }],
      /**
       * Placeholder Color
       * @deprecated since Tailwind CSS v3.0.0
       * @see https://v3.tailwindcss.com/docs/placeholder-color
       */
      "placeholder-color": [{
        placeholder: I()
      }],
      /**
       * Text Color
       * @see https://tailwindcss.com/docs/text-color
       */
      "text-color": [{
        text: I()
      }],
      /**
       * Text Decoration
       * @see https://tailwindcss.com/docs/text-decoration
       */
      "text-decoration": ["underline", "overline", "line-through", "no-underline"],
      /**
       * Text Decoration Style
       * @see https://tailwindcss.com/docs/text-decoration-style
       */
      "text-decoration-style": [{
        decoration: [..._e(), "wavy"]
      }],
      /**
       * Text Decoration Thickness
       * @see https://tailwindcss.com/docs/text-decoration-thickness
       */
      "text-decoration-thickness": [{
        decoration: [oe, "from-font", "auto", W, Nt]
      }],
      /**
       * Text Decoration Color
       * @see https://tailwindcss.com/docs/text-decoration-color
       */
      "text-decoration-color": [{
        decoration: I()
      }],
      /**
       * Text Underline Offset
       * @see https://tailwindcss.com/docs/text-underline-offset
       */
      "underline-offset": [{
        "underline-offset": [oe, "auto", W, q]
      }],
      /**
       * Text Transform
       * @see https://tailwindcss.com/docs/text-transform
       */
      "text-transform": ["uppercase", "lowercase", "capitalize", "normal-case"],
      /**
       * Text Overflow
       * @see https://tailwindcss.com/docs/text-overflow
       */
      "text-overflow": ["truncate", "text-ellipsis", "text-clip"],
      /**
       * Text Wrap
       * @see https://tailwindcss.com/docs/text-wrap
       */
      "text-wrap": [{
        text: ["wrap", "nowrap", "balance", "pretty"]
      }],
      /**
       * Text Indent
       * @see https://tailwindcss.com/docs/text-indent
       */
      indent: [{
        indent: v()
      }],
      /**
       * Vertical Alignment
       * @see https://tailwindcss.com/docs/vertical-align
       */
      "vertical-align": [{
        align: ["baseline", "top", "middle", "bottom", "text-top", "text-bottom", "sub", "super", W, q]
      }],
      /**
       * Whitespace
       * @see https://tailwindcss.com/docs/whitespace
       */
      whitespace: [{
        whitespace: ["normal", "nowrap", "pre", "pre-line", "pre-wrap", "break-spaces"]
      }],
      /**
       * Word Break
       * @see https://tailwindcss.com/docs/word-break
       */
      break: [{
        break: ["normal", "words", "all", "keep"]
      }],
      /**
       * Overflow Wrap
       * @see https://tailwindcss.com/docs/overflow-wrap
       */
      wrap: [{
        wrap: ["break-word", "anywhere", "normal"]
      }],
      /**
       * Hyphens
       * @see https://tailwindcss.com/docs/hyphens
       */
      hyphens: [{
        hyphens: ["none", "manual", "auto"]
      }],
      /**
       * Content
       * @see https://tailwindcss.com/docs/content
       */
      content: [{
        content: ["none", W, q]
      }],
      // -------------------
      // --- Backgrounds ---
      // -------------------
      /**
       * Background Attachment
       * @see https://tailwindcss.com/docs/background-attachment
       */
      "bg-attachment": [{
        bg: ["fixed", "local", "scroll"]
      }],
      /**
       * Background Clip
       * @see https://tailwindcss.com/docs/background-clip
       */
      "bg-clip": [{
        "bg-clip": ["border", "padding", "content", "text"]
      }],
      /**
       * Background Origin
       * @see https://tailwindcss.com/docs/background-origin
       */
      "bg-origin": [{
        "bg-origin": ["border", "padding", "content"]
      }],
      /**
       * Background Position
       * @see https://tailwindcss.com/docs/background-position
       */
      "bg-position": [{
        bg: fe()
      }],
      /**
       * Background Repeat
       * @see https://tailwindcss.com/docs/background-repeat
       */
      "bg-repeat": [{
        bg: g()
      }],
      /**
       * Background Size
       * @see https://tailwindcss.com/docs/background-size
       */
      "bg-size": [{
        bg: G()
      }],
      /**
       * Background Image
       * @see https://tailwindcss.com/docs/background-image
       */
      "bg-image": [{
        bg: ["none", {
          linear: [{
            to: ["t", "tr", "r", "br", "b", "bl", "l", "tl"]
          }, wt, W, q],
          radial: ["", W, q],
          conic: [wt, W, q]
        }, mf, pf]
      }],
      /**
       * Background Color
       * @see https://tailwindcss.com/docs/background-color
       */
      "bg-color": [{
        bg: I()
      }],
      /**
       * Gradient Color Stops From Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from-pos": [{
        from: j()
      }],
      /**
       * Gradient Color Stops Via Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via-pos": [{
        via: j()
      }],
      /**
       * Gradient Color Stops To Position
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to-pos": [{
        to: j()
      }],
      /**
       * Gradient Color Stops From
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-from": [{
        from: I()
      }],
      /**
       * Gradient Color Stops Via
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-via": [{
        via: I()
      }],
      /**
       * Gradient Color Stops To
       * @see https://tailwindcss.com/docs/gradient-color-stops
       */
      "gradient-to": [{
        to: I()
      }],
      // ---------------
      // --- Borders ---
      // ---------------
      /**
       * Border Radius
       * @see https://tailwindcss.com/docs/border-radius
       */
      rounded: [{
        rounded: b()
      }],
      /**
       * Border Radius Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-s": [{
        "rounded-s": b()
      }],
      /**
       * Border Radius End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-e": [{
        "rounded-e": b()
      }],
      /**
       * Border Radius Top
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-t": [{
        "rounded-t": b()
      }],
      /**
       * Border Radius Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-r": [{
        "rounded-r": b()
      }],
      /**
       * Border Radius Bottom
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-b": [{
        "rounded-b": b()
      }],
      /**
       * Border Radius Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-l": [{
        "rounded-l": b()
      }],
      /**
       * Border Radius Start Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ss": [{
        "rounded-ss": b()
      }],
      /**
       * Border Radius Start End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-se": [{
        "rounded-se": b()
      }],
      /**
       * Border Radius End End
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-ee": [{
        "rounded-ee": b()
      }],
      /**
       * Border Radius End Start
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-es": [{
        "rounded-es": b()
      }],
      /**
       * Border Radius Top Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tl": [{
        "rounded-tl": b()
      }],
      /**
       * Border Radius Top Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-tr": [{
        "rounded-tr": b()
      }],
      /**
       * Border Radius Bottom Right
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-br": [{
        "rounded-br": b()
      }],
      /**
       * Border Radius Bottom Left
       * @see https://tailwindcss.com/docs/border-radius
       */
      "rounded-bl": [{
        "rounded-bl": b()
      }],
      /**
       * Border Width
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w": [{
        border: le()
      }],
      /**
       * Border Width X
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-x": [{
        "border-x": le()
      }],
      /**
       * Border Width Y
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-y": [{
        "border-y": le()
      }],
      /**
       * Border Width Start
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-s": [{
        "border-s": le()
      }],
      /**
       * Border Width End
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-e": [{
        "border-e": le()
      }],
      /**
       * Border Width Top
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-t": [{
        "border-t": le()
      }],
      /**
       * Border Width Right
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-r": [{
        "border-r": le()
      }],
      /**
       * Border Width Bottom
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-b": [{
        "border-b": le()
      }],
      /**
       * Border Width Left
       * @see https://tailwindcss.com/docs/border-width
       */
      "border-w-l": [{
        "border-l": le()
      }],
      /**
       * Divide Width X
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-x": [{
        "divide-x": le()
      }],
      /**
       * Divide Width X Reverse
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-x-reverse": ["divide-x-reverse"],
      /**
       * Divide Width Y
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-y": [{
        "divide-y": le()
      }],
      /**
       * Divide Width Y Reverse
       * @see https://tailwindcss.com/docs/border-width#between-children
       */
      "divide-y-reverse": ["divide-y-reverse"],
      /**
       * Border Style
       * @see https://tailwindcss.com/docs/border-style
       */
      "border-style": [{
        border: [..._e(), "hidden", "none"]
      }],
      /**
       * Divide Style
       * @see https://tailwindcss.com/docs/border-style#setting-the-divider-style
       */
      "divide-style": [{
        divide: [..._e(), "hidden", "none"]
      }],
      /**
       * Border Color
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color": [{
        border: I()
      }],
      /**
       * Border Color X
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-x": [{
        "border-x": I()
      }],
      /**
       * Border Color Y
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-y": [{
        "border-y": I()
      }],
      /**
       * Border Color S
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-s": [{
        "border-s": I()
      }],
      /**
       * Border Color E
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-e": [{
        "border-e": I()
      }],
      /**
       * Border Color Top
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-t": [{
        "border-t": I()
      }],
      /**
       * Border Color Right
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-r": [{
        "border-r": I()
      }],
      /**
       * Border Color Bottom
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-b": [{
        "border-b": I()
      }],
      /**
       * Border Color Left
       * @see https://tailwindcss.com/docs/border-color
       */
      "border-color-l": [{
        "border-l": I()
      }],
      /**
       * Divide Color
       * @see https://tailwindcss.com/docs/divide-color
       */
      "divide-color": [{
        divide: I()
      }],
      /**
       * Outline Style
       * @see https://tailwindcss.com/docs/outline-style
       */
      "outline-style": [{
        outline: [..._e(), "none", "hidden"]
      }],
      /**
       * Outline Offset
       * @see https://tailwindcss.com/docs/outline-offset
       */
      "outline-offset": [{
        "outline-offset": [oe, W, q]
      }],
      /**
       * Outline Width
       * @see https://tailwindcss.com/docs/outline-width
       */
      "outline-w": [{
        outline: ["", oe, on, Nt]
      }],
      /**
       * Outline Color
       * @see https://tailwindcss.com/docs/outline-color
       */
      "outline-color": [{
        outline: I()
      }],
      // ---------------
      // --- Effects ---
      // ---------------
      /**
       * Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow
       */
      shadow: [{
        shadow: [
          // Deprecated since Tailwind CSS v4.0.0
          "",
          "none",
          u,
          An,
          Nn
        ]
      }],
      /**
       * Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-shadow-color
       */
      "shadow-color": [{
        shadow: I()
      }],
      /**
       * Inset Box Shadow
       * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-shadow
       */
      "inset-shadow": [{
        "inset-shadow": ["none", d, An, Nn]
      }],
      /**
       * Inset Box Shadow Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-shadow-color
       */
      "inset-shadow-color": [{
        "inset-shadow": I()
      }],
      /**
       * Ring Width
       * @see https://tailwindcss.com/docs/box-shadow#adding-a-ring
       */
      "ring-w": [{
        ring: le()
      }],
      /**
       * Ring Width Inset
       * @see https://v3.tailwindcss.com/docs/ring-width#inset-rings
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-w-inset": ["ring-inset"],
      /**
       * Ring Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-ring-color
       */
      "ring-color": [{
        ring: I()
      }],
      /**
       * Ring Offset Width
       * @see https://v3.tailwindcss.com/docs/ring-offset-width
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-offset-w": [{
        "ring-offset": [oe, Nt]
      }],
      /**
       * Ring Offset Color
       * @see https://v3.tailwindcss.com/docs/ring-offset-color
       * @deprecated since Tailwind CSS v4.0.0
       * @see https://github.com/tailwindlabs/tailwindcss/blob/v4.0.0/packages/tailwindcss/src/utilities.ts#L4158
       */
      "ring-offset-color": [{
        "ring-offset": I()
      }],
      /**
       * Inset Ring Width
       * @see https://tailwindcss.com/docs/box-shadow#adding-an-inset-ring
       */
      "inset-ring-w": [{
        "inset-ring": le()
      }],
      /**
       * Inset Ring Color
       * @see https://tailwindcss.com/docs/box-shadow#setting-the-inset-ring-color
       */
      "inset-ring-color": [{
        "inset-ring": I()
      }],
      /**
       * Text Shadow
       * @see https://tailwindcss.com/docs/text-shadow
       */
      "text-shadow": [{
        "text-shadow": ["none", f, An, Nn]
      }],
      /**
       * Text Shadow Color
       * @see https://tailwindcss.com/docs/text-shadow#setting-the-shadow-color
       */
      "text-shadow-color": [{
        "text-shadow": I()
      }],
      /**
       * Opacity
       * @see https://tailwindcss.com/docs/opacity
       */
      opacity: [{
        opacity: [oe, W, q]
      }],
      /**
       * Mix Blend Mode
       * @see https://tailwindcss.com/docs/mix-blend-mode
       */
      "mix-blend": [{
        "mix-blend": [...be(), "plus-darker", "plus-lighter"]
      }],
      /**
       * Background Blend Mode
       * @see https://tailwindcss.com/docs/background-blend-mode
       */
      "bg-blend": [{
        "bg-blend": be()
      }],
      /**
       * Mask Clip
       * @see https://tailwindcss.com/docs/mask-clip
       */
      "mask-clip": [{
        "mask-clip": ["border", "padding", "content", "fill", "stroke", "view"]
      }, "mask-no-clip"],
      /**
       * Mask Composite
       * @see https://tailwindcss.com/docs/mask-composite
       */
      "mask-composite": [{
        mask: ["add", "subtract", "intersect", "exclude"]
      }],
      /**
       * Mask Image
       * @see https://tailwindcss.com/docs/mask-image
       */
      "mask-image-linear-pos": [{
        "mask-linear": [oe]
      }],
      "mask-image-linear-from-pos": [{
        "mask-linear-from": me()
      }],
      "mask-image-linear-to-pos": [{
        "mask-linear-to": me()
      }],
      "mask-image-linear-from-color": [{
        "mask-linear-from": I()
      }],
      "mask-image-linear-to-color": [{
        "mask-linear-to": I()
      }],
      "mask-image-t-from-pos": [{
        "mask-t-from": me()
      }],
      "mask-image-t-to-pos": [{
        "mask-t-to": me()
      }],
      "mask-image-t-from-color": [{
        "mask-t-from": I()
      }],
      "mask-image-t-to-color": [{
        "mask-t-to": I()
      }],
      "mask-image-r-from-pos": [{
        "mask-r-from": me()
      }],
      "mask-image-r-to-pos": [{
        "mask-r-to": me()
      }],
      "mask-image-r-from-color": [{
        "mask-r-from": I()
      }],
      "mask-image-r-to-color": [{
        "mask-r-to": I()
      }],
      "mask-image-b-from-pos": [{
        "mask-b-from": me()
      }],
      "mask-image-b-to-pos": [{
        "mask-b-to": me()
      }],
      "mask-image-b-from-color": [{
        "mask-b-from": I()
      }],
      "mask-image-b-to-color": [{
        "mask-b-to": I()
      }],
      "mask-image-l-from-pos": [{
        "mask-l-from": me()
      }],
      "mask-image-l-to-pos": [{
        "mask-l-to": me()
      }],
      "mask-image-l-from-color": [{
        "mask-l-from": I()
      }],
      "mask-image-l-to-color": [{
        "mask-l-to": I()
      }],
      "mask-image-x-from-pos": [{
        "mask-x-from": me()
      }],
      "mask-image-x-to-pos": [{
        "mask-x-to": me()
      }],
      "mask-image-x-from-color": [{
        "mask-x-from": I()
      }],
      "mask-image-x-to-color": [{
        "mask-x-to": I()
      }],
      "mask-image-y-from-pos": [{
        "mask-y-from": me()
      }],
      "mask-image-y-to-pos": [{
        "mask-y-to": me()
      }],
      "mask-image-y-from-color": [{
        "mask-y-from": I()
      }],
      "mask-image-y-to-color": [{
        "mask-y-to": I()
      }],
      "mask-image-radial": [{
        "mask-radial": [W, q]
      }],
      "mask-image-radial-from-pos": [{
        "mask-radial-from": me()
      }],
      "mask-image-radial-to-pos": [{
        "mask-radial-to": me()
      }],
      "mask-image-radial-from-color": [{
        "mask-radial-from": I()
      }],
      "mask-image-radial-to-color": [{
        "mask-radial-to": I()
      }],
      "mask-image-radial-shape": [{
        "mask-radial": ["circle", "ellipse"]
      }],
      "mask-image-radial-size": [{
        "mask-radial": [{
          closest: ["side", "corner"],
          farthest: ["side", "corner"]
        }]
      }],
      "mask-image-radial-pos": [{
        "mask-radial-at": N()
      }],
      "mask-image-conic-pos": [{
        "mask-conic": [oe]
      }],
      "mask-image-conic-from-pos": [{
        "mask-conic-from": me()
      }],
      "mask-image-conic-to-pos": [{
        "mask-conic-to": me()
      }],
      "mask-image-conic-from-color": [{
        "mask-conic-from": I()
      }],
      "mask-image-conic-to-color": [{
        "mask-conic-to": I()
      }],
      /**
       * Mask Mode
       * @see https://tailwindcss.com/docs/mask-mode
       */
      "mask-mode": [{
        mask: ["alpha", "luminance", "match"]
      }],
      /**
       * Mask Origin
       * @see https://tailwindcss.com/docs/mask-origin
       */
      "mask-origin": [{
        "mask-origin": ["border", "padding", "content", "fill", "stroke", "view"]
      }],
      /**
       * Mask Position
       * @see https://tailwindcss.com/docs/mask-position
       */
      "mask-position": [{
        mask: fe()
      }],
      /**
       * Mask Repeat
       * @see https://tailwindcss.com/docs/mask-repeat
       */
      "mask-repeat": [{
        mask: g()
      }],
      /**
       * Mask Size
       * @see https://tailwindcss.com/docs/mask-size
       */
      "mask-size": [{
        mask: G()
      }],
      /**
       * Mask Type
       * @see https://tailwindcss.com/docs/mask-type
       */
      "mask-type": [{
        "mask-type": ["alpha", "luminance"]
      }],
      /**
       * Mask Image
       * @see https://tailwindcss.com/docs/mask-image
       */
      "mask-image": [{
        mask: ["none", W, q]
      }],
      // ---------------
      // --- Filters ---
      // ---------------
      /**
       * Filter
       * @see https://tailwindcss.com/docs/filter
       */
      filter: [{
        filter: [
          // Deprecated since Tailwind CSS v3.0.0
          "",
          "none",
          W,
          q
        ]
      }],
      /**
       * Blur
       * @see https://tailwindcss.com/docs/blur
       */
      blur: [{
        blur: ge()
      }],
      /**
       * Brightness
       * @see https://tailwindcss.com/docs/brightness
       */
      brightness: [{
        brightness: [oe, W, q]
      }],
      /**
       * Contrast
       * @see https://tailwindcss.com/docs/contrast
       */
      contrast: [{
        contrast: [oe, W, q]
      }],
      /**
       * Drop Shadow
       * @see https://tailwindcss.com/docs/drop-shadow
       */
      "drop-shadow": [{
        "drop-shadow": [
          // Deprecated since Tailwind CSS v4.0.0
          "",
          "none",
          p,
          An,
          Nn
        ]
      }],
      /**
       * Drop Shadow Color
       * @see https://tailwindcss.com/docs/filter-drop-shadow#setting-the-shadow-color
       */
      "drop-shadow-color": [{
        "drop-shadow": I()
      }],
      /**
       * Grayscale
       * @see https://tailwindcss.com/docs/grayscale
       */
      grayscale: [{
        grayscale: ["", oe, W, q]
      }],
      /**
       * Hue Rotate
       * @see https://tailwindcss.com/docs/hue-rotate
       */
      "hue-rotate": [{
        "hue-rotate": [oe, W, q]
      }],
      /**
       * Invert
       * @see https://tailwindcss.com/docs/invert
       */
      invert: [{
        invert: ["", oe, W, q]
      }],
      /**
       * Saturate
       * @see https://tailwindcss.com/docs/saturate
       */
      saturate: [{
        saturate: [oe, W, q]
      }],
      /**
       * Sepia
       * @see https://tailwindcss.com/docs/sepia
       */
      sepia: [{
        sepia: ["", oe, W, q]
      }],
      /**
       * Backdrop Filter
       * @see https://tailwindcss.com/docs/backdrop-filter
       */
      "backdrop-filter": [{
        "backdrop-filter": [
          // Deprecated since Tailwind CSS v3.0.0
          "",
          "none",
          W,
          q
        ]
      }],
      /**
       * Backdrop Blur
       * @see https://tailwindcss.com/docs/backdrop-blur
       */
      "backdrop-blur": [{
        "backdrop-blur": ge()
      }],
      /**
       * Backdrop Brightness
       * @see https://tailwindcss.com/docs/backdrop-brightness
       */
      "backdrop-brightness": [{
        "backdrop-brightness": [oe, W, q]
      }],
      /**
       * Backdrop Contrast
       * @see https://tailwindcss.com/docs/backdrop-contrast
       */
      "backdrop-contrast": [{
        "backdrop-contrast": [oe, W, q]
      }],
      /**
       * Backdrop Grayscale
       * @see https://tailwindcss.com/docs/backdrop-grayscale
       */
      "backdrop-grayscale": [{
        "backdrop-grayscale": ["", oe, W, q]
      }],
      /**
       * Backdrop Hue Rotate
       * @see https://tailwindcss.com/docs/backdrop-hue-rotate
       */
      "backdrop-hue-rotate": [{
        "backdrop-hue-rotate": [oe, W, q]
      }],
      /**
       * Backdrop Invert
       * @see https://tailwindcss.com/docs/backdrop-invert
       */
      "backdrop-invert": [{
        "backdrop-invert": ["", oe, W, q]
      }],
      /**
       * Backdrop Opacity
       * @see https://tailwindcss.com/docs/backdrop-opacity
       */
      "backdrop-opacity": [{
        "backdrop-opacity": [oe, W, q]
      }],
      /**
       * Backdrop Saturate
       * @see https://tailwindcss.com/docs/backdrop-saturate
       */
      "backdrop-saturate": [{
        "backdrop-saturate": [oe, W, q]
      }],
      /**
       * Backdrop Sepia
       * @see https://tailwindcss.com/docs/backdrop-sepia
       */
      "backdrop-sepia": [{
        "backdrop-sepia": ["", oe, W, q]
      }],
      // --------------
      // --- Tables ---
      // --------------
      /**
       * Border Collapse
       * @see https://tailwindcss.com/docs/border-collapse
       */
      "border-collapse": [{
        border: ["collapse", "separate"]
      }],
      /**
       * Border Spacing
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing": [{
        "border-spacing": v()
      }],
      /**
       * Border Spacing X
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-x": [{
        "border-spacing-x": v()
      }],
      /**
       * Border Spacing Y
       * @see https://tailwindcss.com/docs/border-spacing
       */
      "border-spacing-y": [{
        "border-spacing-y": v()
      }],
      /**
       * Table Layout
       * @see https://tailwindcss.com/docs/table-layout
       */
      "table-layout": [{
        table: ["auto", "fixed"]
      }],
      /**
       * Caption Side
       * @see https://tailwindcss.com/docs/caption-side
       */
      caption: [{
        caption: ["top", "bottom"]
      }],
      // ---------------------------------
      // --- Transitions and Animation ---
      // ---------------------------------
      /**
       * Transition Property
       * @see https://tailwindcss.com/docs/transition-property
       */
      transition: [{
        transition: ["", "all", "colors", "opacity", "shadow", "transform", "none", W, q]
      }],
      /**
       * Transition Behavior
       * @see https://tailwindcss.com/docs/transition-behavior
       */
      "transition-behavior": [{
        transition: ["normal", "discrete"]
      }],
      /**
       * Transition Duration
       * @see https://tailwindcss.com/docs/transition-duration
       */
      duration: [{
        duration: [oe, "initial", W, q]
      }],
      /**
       * Transition Timing Function
       * @see https://tailwindcss.com/docs/transition-timing-function
       */
      ease: [{
        ease: ["linear", "initial", y, W, q]
      }],
      /**
       * Transition Delay
       * @see https://tailwindcss.com/docs/transition-delay
       */
      delay: [{
        delay: [oe, W, q]
      }],
      /**
       * Animation
       * @see https://tailwindcss.com/docs/animation
       */
      animate: [{
        animate: ["none", S, W, q]
      }],
      // ------------------
      // --- Transforms ---
      // ------------------
      /**
       * Backface Visibility
       * @see https://tailwindcss.com/docs/backface-visibility
       */
      backface: [{
        backface: ["hidden", "visible"]
      }],
      /**
       * Perspective
       * @see https://tailwindcss.com/docs/perspective
       */
      perspective: [{
        perspective: [h, W, q]
      }],
      /**
       * Perspective Origin
       * @see https://tailwindcss.com/docs/perspective-origin
       */
      "perspective-origin": [{
        "perspective-origin": A()
      }],
      /**
       * Rotate
       * @see https://tailwindcss.com/docs/rotate
       */
      rotate: [{
        rotate: Ne()
      }],
      /**
       * Rotate X
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-x": [{
        "rotate-x": Ne()
      }],
      /**
       * Rotate Y
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-y": [{
        "rotate-y": Ne()
      }],
      /**
       * Rotate Z
       * @see https://tailwindcss.com/docs/rotate
       */
      "rotate-z": [{
        "rotate-z": Ne()
      }],
      /**
       * Scale
       * @see https://tailwindcss.com/docs/scale
       */
      scale: [{
        scale: Te()
      }],
      /**
       * Scale X
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-x": [{
        "scale-x": Te()
      }],
      /**
       * Scale Y
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-y": [{
        "scale-y": Te()
      }],
      /**
       * Scale Z
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-z": [{
        "scale-z": Te()
      }],
      /**
       * Scale 3D
       * @see https://tailwindcss.com/docs/scale
       */
      "scale-3d": ["scale-3d"],
      /**
       * Skew
       * @see https://tailwindcss.com/docs/skew
       */
      skew: [{
        skew: Ke()
      }],
      /**
       * Skew X
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-x": [{
        "skew-x": Ke()
      }],
      /**
       * Skew Y
       * @see https://tailwindcss.com/docs/skew
       */
      "skew-y": [{
        "skew-y": Ke()
      }],
      /**
       * Transform
       * @see https://tailwindcss.com/docs/transform
       */
      transform: [{
        transform: [W, q, "", "none", "gpu", "cpu"]
      }],
      /**
       * Transform Origin
       * @see https://tailwindcss.com/docs/transform-origin
       */
      "transform-origin": [{
        origin: A()
      }],
      /**
       * Transform Style
       * @see https://tailwindcss.com/docs/transform-style
       */
      "transform-style": [{
        transform: ["3d", "flat"]
      }],
      /**
       * Translate
       * @see https://tailwindcss.com/docs/translate
       */
      translate: [{
        translate: ot()
      }],
      /**
       * Translate X
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-x": [{
        "translate-x": ot()
      }],
      /**
       * Translate Y
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-y": [{
        "translate-y": ot()
      }],
      /**
       * Translate Z
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-z": [{
        "translate-z": ot()
      }],
      /**
       * Translate None
       * @see https://tailwindcss.com/docs/translate
       */
      "translate-none": ["translate-none"],
      // ---------------------
      // --- Interactivity ---
      // ---------------------
      /**
       * Accent Color
       * @see https://tailwindcss.com/docs/accent-color
       */
      accent: [{
        accent: I()
      }],
      /**
       * Appearance
       * @see https://tailwindcss.com/docs/appearance
       */
      appearance: [{
        appearance: ["none", "auto"]
      }],
      /**
       * Caret Color
       * @see https://tailwindcss.com/docs/just-in-time-mode#caret-color-utilities
       */
      "caret-color": [{
        caret: I()
      }],
      /**
       * Color Scheme
       * @see https://tailwindcss.com/docs/color-scheme
       */
      "color-scheme": [{
        scheme: ["normal", "dark", "light", "light-dark", "only-dark", "only-light"]
      }],
      /**
       * Cursor
       * @see https://tailwindcss.com/docs/cursor
       */
      cursor: [{
        cursor: ["auto", "default", "pointer", "wait", "text", "move", "help", "not-allowed", "none", "context-menu", "progress", "cell", "crosshair", "vertical-text", "alias", "copy", "no-drop", "grab", "grabbing", "all-scroll", "col-resize", "row-resize", "n-resize", "e-resize", "s-resize", "w-resize", "ne-resize", "nw-resize", "se-resize", "sw-resize", "ew-resize", "ns-resize", "nesw-resize", "nwse-resize", "zoom-in", "zoom-out", W, q]
      }],
      /**
       * Field Sizing
       * @see https://tailwindcss.com/docs/field-sizing
       */
      "field-sizing": [{
        "field-sizing": ["fixed", "content"]
      }],
      /**
       * Pointer Events
       * @see https://tailwindcss.com/docs/pointer-events
       */
      "pointer-events": [{
        "pointer-events": ["auto", "none"]
      }],
      /**
       * Resize
       * @see https://tailwindcss.com/docs/resize
       */
      resize: [{
        resize: ["none", "", "y", "x"]
      }],
      /**
       * Scroll Behavior
       * @see https://tailwindcss.com/docs/scroll-behavior
       */
      "scroll-behavior": [{
        scroll: ["auto", "smooth"]
      }],
      /**
       * Scroll Margin
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-m": [{
        "scroll-m": v()
      }],
      /**
       * Scroll Margin X
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mx": [{
        "scroll-mx": v()
      }],
      /**
       * Scroll Margin Y
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-my": [{
        "scroll-my": v()
      }],
      /**
       * Scroll Margin Start
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ms": [{
        "scroll-ms": v()
      }],
      /**
       * Scroll Margin End
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-me": [{
        "scroll-me": v()
      }],
      /**
       * Scroll Margin Top
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mt": [{
        "scroll-mt": v()
      }],
      /**
       * Scroll Margin Right
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mr": [{
        "scroll-mr": v()
      }],
      /**
       * Scroll Margin Bottom
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-mb": [{
        "scroll-mb": v()
      }],
      /**
       * Scroll Margin Left
       * @see https://tailwindcss.com/docs/scroll-margin
       */
      "scroll-ml": [{
        "scroll-ml": v()
      }],
      /**
       * Scroll Padding
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-p": [{
        "scroll-p": v()
      }],
      /**
       * Scroll Padding X
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-px": [{
        "scroll-px": v()
      }],
      /**
       * Scroll Padding Y
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-py": [{
        "scroll-py": v()
      }],
      /**
       * Scroll Padding Start
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-ps": [{
        "scroll-ps": v()
      }],
      /**
       * Scroll Padding End
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pe": [{
        "scroll-pe": v()
      }],
      /**
       * Scroll Padding Top
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pt": [{
        "scroll-pt": v()
      }],
      /**
       * Scroll Padding Right
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pr": [{
        "scroll-pr": v()
      }],
      /**
       * Scroll Padding Bottom
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pb": [{
        "scroll-pb": v()
      }],
      /**
       * Scroll Padding Left
       * @see https://tailwindcss.com/docs/scroll-padding
       */
      "scroll-pl": [{
        "scroll-pl": v()
      }],
      /**
       * Scroll Snap Align
       * @see https://tailwindcss.com/docs/scroll-snap-align
       */
      "snap-align": [{
        snap: ["start", "end", "center", "align-none"]
      }],
      /**
       * Scroll Snap Stop
       * @see https://tailwindcss.com/docs/scroll-snap-stop
       */
      "snap-stop": [{
        snap: ["normal", "always"]
      }],
      /**
       * Scroll Snap Type
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      "snap-type": [{
        snap: ["none", "x", "y", "both"]
      }],
      /**
       * Scroll Snap Type Strictness
       * @see https://tailwindcss.com/docs/scroll-snap-type
       */
      "snap-strictness": [{
        snap: ["mandatory", "proximity"]
      }],
      /**
       * Touch Action
       * @see https://tailwindcss.com/docs/touch-action
       */
      touch: [{
        touch: ["auto", "none", "manipulation"]
      }],
      /**
       * Touch Action X
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-x": [{
        "touch-pan": ["x", "left", "right"]
      }],
      /**
       * Touch Action Y
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-y": [{
        "touch-pan": ["y", "up", "down"]
      }],
      /**
       * Touch Action Pinch Zoom
       * @see https://tailwindcss.com/docs/touch-action
       */
      "touch-pz": ["touch-pinch-zoom"],
      /**
       * User Select
       * @see https://tailwindcss.com/docs/user-select
       */
      select: [{
        select: ["none", "text", "all", "auto"]
      }],
      /**
       * Will Change
       * @see https://tailwindcss.com/docs/will-change
       */
      "will-change": [{
        "will-change": ["auto", "scroll", "contents", "transform", W, q]
      }],
      // -----------
      // --- SVG ---
      // -----------
      /**
       * Fill
       * @see https://tailwindcss.com/docs/fill
       */
      fill: [{
        fill: ["none", ...I()]
      }],
      /**
       * Stroke Width
       * @see https://tailwindcss.com/docs/stroke-width
       */
      "stroke-w": [{
        stroke: [oe, on, Nt, hr]
      }],
      /**
       * Stroke
       * @see https://tailwindcss.com/docs/stroke
       */
      stroke: [{
        stroke: ["none", ...I()]
      }],
      // ---------------------
      // --- Accessibility ---
      // ---------------------
      /**
       * Forced Color Adjust
       * @see https://tailwindcss.com/docs/forced-color-adjust
       */
      "forced-color-adjust": [{
        "forced-color-adjust": ["auto", "none"]
      }]
    },
    conflictingClassGroups: {
      overflow: ["overflow-x", "overflow-y"],
      overscroll: ["overscroll-x", "overscroll-y"],
      inset: ["inset-x", "inset-y", "start", "end", "top", "right", "bottom", "left"],
      "inset-x": ["right", "left"],
      "inset-y": ["top", "bottom"],
      flex: ["basis", "grow", "shrink"],
      gap: ["gap-x", "gap-y"],
      p: ["px", "py", "ps", "pe", "pt", "pr", "pb", "pl"],
      px: ["pr", "pl"],
      py: ["pt", "pb"],
      m: ["mx", "my", "ms", "me", "mt", "mr", "mb", "ml"],
      mx: ["mr", "ml"],
      my: ["mt", "mb"],
      size: ["w", "h"],
      "font-size": ["leading"],
      "fvn-normal": ["fvn-ordinal", "fvn-slashed-zero", "fvn-figure", "fvn-spacing", "fvn-fraction"],
      "fvn-ordinal": ["fvn-normal"],
      "fvn-slashed-zero": ["fvn-normal"],
      "fvn-figure": ["fvn-normal"],
      "fvn-spacing": ["fvn-normal"],
      "fvn-fraction": ["fvn-normal"],
      "line-clamp": ["display", "overflow"],
      rounded: ["rounded-s", "rounded-e", "rounded-t", "rounded-r", "rounded-b", "rounded-l", "rounded-ss", "rounded-se", "rounded-ee", "rounded-es", "rounded-tl", "rounded-tr", "rounded-br", "rounded-bl"],
      "rounded-s": ["rounded-ss", "rounded-es"],
      "rounded-e": ["rounded-se", "rounded-ee"],
      "rounded-t": ["rounded-tl", "rounded-tr"],
      "rounded-r": ["rounded-tr", "rounded-br"],
      "rounded-b": ["rounded-br", "rounded-bl"],
      "rounded-l": ["rounded-tl", "rounded-bl"],
      "border-spacing": ["border-spacing-x", "border-spacing-y"],
      "border-w": ["border-w-x", "border-w-y", "border-w-s", "border-w-e", "border-w-t", "border-w-r", "border-w-b", "border-w-l"],
      "border-w-x": ["border-w-r", "border-w-l"],
      "border-w-y": ["border-w-t", "border-w-b"],
      "border-color": ["border-color-x", "border-color-y", "border-color-s", "border-color-e", "border-color-t", "border-color-r", "border-color-b", "border-color-l"],
      "border-color-x": ["border-color-r", "border-color-l"],
      "border-color-y": ["border-color-t", "border-color-b"],
      translate: ["translate-x", "translate-y", "translate-none"],
      "translate-none": ["translate", "translate-x", "translate-y", "translate-z"],
      "scroll-m": ["scroll-mx", "scroll-my", "scroll-ms", "scroll-me", "scroll-mt", "scroll-mr", "scroll-mb", "scroll-ml"],
      "scroll-mx": ["scroll-mr", "scroll-ml"],
      "scroll-my": ["scroll-mt", "scroll-mb"],
      "scroll-p": ["scroll-px", "scroll-py", "scroll-ps", "scroll-pe", "scroll-pt", "scroll-pr", "scroll-pb", "scroll-pl"],
      "scroll-px": ["scroll-pr", "scroll-pl"],
      "scroll-py": ["scroll-pt", "scroll-pb"],
      touch: ["touch-x", "touch-y", "touch-pz"],
      "touch-x": ["touch"],
      "touch-y": ["touch"],
      "touch-pz": ["touch"]
    },
    conflictingClassGroupModifiers: {
      "font-size": ["leading"]
    },
    orderSensitiveModifiers: ["*", "**", "after", "backdrop", "before", "details-content", "file", "first-letter", "first-line", "marker", "placeholder", "selection"]
  };
}, Ef = /* @__PURE__ */ Qp(yf);
function Da(...e) {
  return Ef(Sa(e));
}
const _f = Fp(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive: "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
function Un({
  className: e,
  variant: t,
  size: n,
  asChild: r = !1,
  ...i
}) {
  const a = r ? Ip : "button";
  return /* @__PURE__ */ ae.jsx(
    a,
    {
      "data-slot": "button",
      className: Da(_f({ variant: t, size: n, className: e })),
      ...i
    }
  );
}
const kf = ({
  node: e,
  readonly: t,
  defaultButtonText: n,
  onSend: r
}) => {
  const { buttonText: i, ...a } = e.properties || {}, o = () => {
    r?.({ buttonText: i || "" });
  };
  return /* @__PURE__ */ ae.jsx(
    Un,
    {
      variant: "outline",
      disabled: t,
      size: "sm",
      onClick: o,
      className: `cursor-pointer h-6 text-sm hover:bg-gray-200 ${n === i ? "bg-black text-white" : ""}`,
      ...a,
      children: i
    }
  );
}, Pn = "[|｜]", _o = new RegExp(Pn, "g"), xf = [
  {
    // 格式1: ?[%{{variable}} button1 | button2 | ... placeholder] (按钮+占位符，优先级最高)
    regex: new RegExp(`\\?\\[\\%\\{\\{\\s*(\\w+)\\s*\\}\\}\\s*([^\\]\\|｜]+(?:\\s*${Pn}\\s*[^\\]\\|｜]+)*)\\s*${Pn}\\s*\\.\\.\\.\\s*([^\\]]+)\\]`),
    type: 0
    /* BUTTONS_WITH_PLACEHOLDER */
  },
  {
    // 格式4: ?[%{{variable}} ... placeholder] (只有占位符，提高优先级)
    regex: /\?\[\%\{\{\s*(\w+)\s*\}\}\s*\.\.\.\s*([^\]]+)\]/,
    type: 3
    /* PLACEHOLDER_ONLY */
  },
  {
    // 格式2: ?[%{{variable}} button1 | button2]
    regex: new RegExp(`\\?\\[\\%\\{\\{\\s*(\\w+)\\s*\\}\\}\\s*([^\\]\\|｜]+(?:\\s*${Pn}\\s*[^\\]\\|｜]+)+)\\s*\\]`),
    type: 1
    /* BUTTONS_ONLY */
  },
  {
    // 格式3: ?[%{{variable}} button]
    regex: /\?\[\%\{\{\s*(\w+)\s*\}\}\s*([^\|\]｜]+)\s*\]/,
    type: 2
    /* SINGLE_BUTTON */
  }
];
function wf(e, t) {
  const n = e[1].trim();
  switch (t) {
    case 0:
      return {
        variableName: n,
        buttonTexts: e[2].split(_o).map((i) => i.trim()).filter((i) => i.length > 0),
        placeholder: e[3].trim()
      };
    case 1:
      return {
        variableName: n,
        buttonTexts: e[2].split(_o).map((i) => i.trim()).filter((i) => i.length > 0),
        placeholder: void 0
      };
    case 2:
      const r = e[2].trim();
      return {
        variableName: n,
        buttonTexts: r ? [r] : [],
        placeholder: void 0
      };
    case 3:
      return {
        variableName: n,
        buttonTexts: [],
        placeholder: e[2].trim()
      };
    default:
      throw new Error(`Unsupported format type: ${t}`);
  }
}
function Sf(e) {
  for (const t of xf) {
    t.regex.lastIndex = 0;
    const n = t.regex.exec(e);
    if (n)
      return { match: n, rule: t };
  }
  return null;
}
function vf(e, t, n, r) {
  return [
    {
      type: "text",
      value: e.substring(0, t)
    },
    {
      type: "element",
      data: {
        hName: "custom-variable",
        hProperties: r
      }
    },
    {
      type: "text",
      value: e.substring(n)
    }
  ];
}
function Tf() {
  return (e) => {
    qt(
      e,
      "text",
      (t, n, r) => {
        if (n === null || r === null) return;
        const i = t.value, a = Sf(i);
        if (!a) return;
        const { match: o, rule: s } = a, l = o.index, c = l + o[0].length;
        try {
          const u = wf(o, s.type), d = vf(i, l, c, u);
          r.children.splice(n, 1, ...d);
        } catch (u) {
          console.warn("Failed to parse custom variable syntax:", u);
          return;
        }
      }
    );
  };
}
function Nf({ className: e, type: t, ...n }) {
  return /* @__PURE__ */ ae.jsx(
    "input",
    {
      type: t,
      "data-slot": "input",
      className: Da(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        e
      ),
      ...n
    }
  );
}
/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Af = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), Cf = (e) => e.replace(
  /^([A-Z])|[\s-_]+(\w)/g,
  (t, n, r) => r ? r.toUpperCase() : n.toLowerCase()
), ko = (e) => {
  const t = Cf(e);
  return t.charAt(0).toUpperCase() + t.slice(1);
}, Pa = (...e) => e.filter((t, n, r) => !!t && t.trim() !== "" && r.indexOf(t) === n).join(" ").trim(), Rf = (e) => {
  for (const t in e)
    if (t.startsWith("aria-") || t === "role" || t === "title")
      return !0;
};
/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
var Of = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const If = $o(
  ({
    color: e = "currentColor",
    size: t = 24,
    strokeWidth: n = 2,
    absoluteStrokeWidth: r,
    className: i = "",
    children: a,
    iconNode: o,
    ...s
  }, l) => Sr(
    "svg",
    {
      ref: l,
      ...Of,
      width: t,
      height: t,
      stroke: e,
      strokeWidth: r ? Number(n) * 24 / Number(t) : n,
      className: Pa("lucide", i),
      ...!a && !Rf(s) && { "aria-hidden": "true" },
      ...s
    },
    [
      ...o.map(([c, u]) => Sr(c, u)),
      ...Array.isArray(a) ? a : [a]
    ]
  )
);
/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Ba = (e, t) => {
  const n = $o(
    ({ className: r, ...i }, a) => Sr(If, {
      ref: a,
      iconNode: t,
      className: Pa(
        `lucide-${Af(ko(e))}`,
        `lucide-${e}`,
        r
      ),
      ...i
    })
  );
  return n.displayName = ko(e), n;
};
/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Mf = [["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]], Lf = Ba("chevron-down", Mf);
/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Df = [
  [
    "path",
    {
      d: "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",
      key: "1ffxy3"
    }
  ],
  ["path", { d: "m21.854 2.147-10.94 10.939", key: "12cjpa" }]
], Pf = Ba("send", Df), Bf = ({
  node: e,
  readonly: t,
  defaultButtonText: n,
  defaultInputText: r,
  onSend: i
}) => {
  const [a, o] = Wr.useState(r || ""), s = (d) => {
    i?.({
      variableName: e.properties?.variableName || "",
      buttonText: d
    });
  }, l = (d) => {
    o(d.target.value);
  }, c = (d) => {
    d.key === "Enter" && u();
  }, u = () => {
    i?.({
      variableName: e.properties?.variableName || "",
      inputText: a
    });
  };
  return /* @__PURE__ */ ae.jsxs("span", { className: "custom-variable-container inline-flex items-center gap-2 flex-wrap", children: [
    e.properties?.buttonTexts?.map((d, f) => /* @__PURE__ */ ae.jsx(
      Un,
      {
        disabled: t,
        variant: "outline",
        type: "button",
        size: "sm",
        onClick: () => s(d),
        className: `cursor-pointer h-6 text-sm hover:bg-gray-200 ${n === d ? "bg-black text-white" : ""}`,
        children: d
      },
      f
    )),
    e.properties?.placeholder && /* @__PURE__ */ ae.jsxs("span", { className: "text-sm flex rounded-md border", children: [
      /* @__PURE__ */ ae.jsx(
        Nf,
        {
          type: "text",
          disabled: t,
          placeholder: e.properties?.placeholder,
          value: a,
          onChange: l,
          onKeyPress: c,
          className: "custom-variable-input w-40 h-6 text-sm border-0 shadow-none outline-none ring-0",
          style: {
            border: "none",
            outline: "none",
            boxShadow: "none"
          }
        }
      ),
      /* @__PURE__ */ ae.jsx(
        Un,
        {
          type: "button",
          variant: "ghost",
          size: "icon",
          onClick: u,
          disabled: t,
          className: "h-6 w-6 mr-1 hover:bg-gray-200",
          children: /* @__PURE__ */ ae.jsx(Pf, { className: "h-4 w-4" })
        }
      )
    ] })
  ] });
};
function xo(e, t) {
  const n = String(e);
  if (typeof t != "string")
    throw new TypeError("Expected character");
  let r = 0, i = n.indexOf(t);
  for (; i !== -1; )
    r++, i = n.indexOf(t, i + t.length);
  return r;
}
function Ff(e) {
  if (typeof e != "string")
    throw new TypeError("Expected a string");
  return e.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
}
function Fa(e, t, n) {
  const i = gn((n || {}).ignore || []), a = zf(t);
  let o = -1;
  for (; ++o < a.length; )
    ka(e, "text", s);
  function s(c, u) {
    let d = -1, f;
    for (; ++d < u.length; ) {
      const p = u[d], m = f ? f.children : void 0;
      if (i(
        p,
        m ? m.indexOf(p) : void 0,
        f
      ))
        return;
      f = p;
    }
    if (f)
      return l(c, u);
  }
  function l(c, u) {
    const d = u[u.length - 1], f = a[o][0], p = a[o][1];
    let m = 0;
    const k = d.children.indexOf(c);
    let y = !1, S = [];
    f.lastIndex = 0;
    let w = f.exec(c.value);
    for (; w; ) {
      const N = w.index, A = {
        index: w.index,
        input: w.input,
        stack: [...u, c]
      };
      let _ = p(...w, A);
      if (typeof _ == "string" && (_ = _.length > 0 ? { type: "text", value: _ } : void 0), _ === !1 ? f.lastIndex = N + 1 : (m !== N && S.push({
        type: "text",
        value: c.value.slice(m, N)
      }), Array.isArray(_) ? S.push(..._) : _ && S.push(_), m = N + w[0].length, y = !0), !f.global)
        break;
      w = f.exec(c.value);
    }
    return y ? (m < c.value.length && S.push({ type: "text", value: c.value.slice(m) }), d.children.splice(k, 1, ...S)) : S = [c], k + S.length;
  }
}
function zf(e) {
  const t = [];
  if (!Array.isArray(e))
    throw new TypeError("Expected find and replace tuple or list of tuples");
  const n = !e[0] || Array.isArray(e[0]) ? e : [e];
  let r = -1;
  for (; ++r < n.length; ) {
    const i = n[r];
    t.push([Uf(i[0]), $f(i[1])]);
  }
  return t;
}
function Uf(e) {
  return typeof e == "string" ? new RegExp(Ff(e), "g") : e;
}
function $f(e) {
  return typeof e == "function" ? e : function() {
    return e;
  };
}
const br = "phrasing", yr = ["autolink", "link", "image", "label"];
function Hf() {
  return {
    transforms: [jf],
    enter: {
      literalAutolink: Kf,
      literalAutolinkEmail: Er,
      literalAutolinkHttp: Er,
      literalAutolinkWww: Er
    },
    exit: {
      literalAutolink: Yf,
      literalAutolinkEmail: Vf,
      literalAutolinkHttp: qf,
      literalAutolinkWww: Wf
    }
  };
}
function Gf() {
  return {
    unsafe: [
      {
        character: "@",
        before: "[+\\-.\\w]",
        after: "[\\-.\\w]",
        inConstruct: br,
        notInConstruct: yr
      },
      {
        character: ".",
        before: "[Ww]",
        after: "[\\-.\\w]",
        inConstruct: br,
        notInConstruct: yr
      },
      {
        character: ":",
        before: "[ps]",
        after: "\\/",
        inConstruct: br,
        notInConstruct: yr
      }
    ]
  };
}
function Kf(e) {
  this.enter({ type: "link", title: null, url: "", children: [] }, e);
}
function Er(e) {
  this.config.enter.autolinkProtocol.call(this, e);
}
function qf(e) {
  this.config.exit.autolinkProtocol.call(this, e);
}
function Wf(e) {
  this.config.exit.data.call(this, e);
  const t = this.stack[this.stack.length - 1];
  t.type, t.url = "http://" + this.sliceSerialize(e);
}
function Vf(e) {
  this.config.exit.autolinkEmail.call(this, e);
}
function Yf(e) {
  this.exit(e);
}
function jf(e) {
  Fa(
    e,
    [
      [/(https?:\/\/|www(?=\.))([-.\w]+)([^ \t\r\n]*)/gi, Zf],
      [new RegExp("(?<=^|\\s|\\p{P}|\\p{S})([-.\\w+]+)@([-\\w]+(?:\\.[-\\w]+)+)", "gu"), Xf]
    ],
    { ignore: ["link", "linkReference"] }
  );
}
function Zf(e, t, n, r, i) {
  let a = "";
  if (!za(i) || (/^w/i.test(t) && (n = t + n, t = "", a = "http://"), !Qf(n)))
    return !1;
  const o = Jf(n + r);
  if (!o[0]) return !1;
  const s = {
    type: "link",
    title: null,
    url: a + t + o[0],
    children: [{ type: "text", value: t + o[0] }]
  };
  return o[1] ? [s, { type: "text", value: o[1] }] : s;
}
function Xf(e, t, n, r) {
  return (
    // Not an expected previous character.
    !za(r, !0) || // Label ends in not allowed character.
    /[-\d_]$/.test(n) ? !1 : {
      type: "link",
      title: null,
      url: "mailto:" + t + "@" + n,
      children: [{ type: "text", value: t + "@" + n }]
    }
  );
}
function Qf(e) {
  const t = e.split(".");
  return !(t.length < 2 || t[t.length - 1] && (/_/.test(t[t.length - 1]) || !/[a-zA-Z\d]/.test(t[t.length - 1])) || t[t.length - 2] && (/_/.test(t[t.length - 2]) || !/[a-zA-Z\d]/.test(t[t.length - 2])));
}
function Jf(e) {
  const t = /[!"&'),.:;<>?\]}]+$/.exec(e);
  if (!t)
    return [e, void 0];
  e = e.slice(0, t.index);
  let n = t[0], r = n.indexOf(")");
  const i = xo(e, "(");
  let a = xo(e, ")");
  for (; r !== -1 && i > a; )
    e += n.slice(0, r + 1), n = n.slice(r + 1), r = n.indexOf(")"), a++;
  return [e, n];
}
function za(e, t) {
  const n = e.input.charCodeAt(e.index - 1);
  return (e.index === 0 || Ct(n) || Kn(n)) && // If it’s an email, the previous character should not be a slash.
  (!t || n !== 47);
}
Ua.peek = lg;
function eg() {
  this.buffer();
}
function tg(e) {
  this.enter({ type: "footnoteReference", identifier: "", label: "" }, e);
}
function ng() {
  this.buffer();
}
function rg(e) {
  this.enter(
    { type: "footnoteDefinition", identifier: "", label: "", children: [] },
    e
  );
}
function ig(e) {
  const t = this.resume(), n = this.stack[this.stack.length - 1];
  n.type, n.identifier = it(
    this.sliceSerialize(e)
  ).toLowerCase(), n.label = t;
}
function og(e) {
  this.exit(e);
}
function ag(e) {
  const t = this.resume(), n = this.stack[this.stack.length - 1];
  n.type, n.identifier = it(
    this.sliceSerialize(e)
  ).toLowerCase(), n.label = t;
}
function sg(e) {
  this.exit(e);
}
function lg() {
  return "[";
}
function Ua(e, t, n, r) {
  const i = n.createTracker(r);
  let a = i.move("[^");
  const o = n.enter("footnoteReference"), s = n.enter("reference");
  return a += i.move(
    n.safe(n.associationId(e), { after: "]", before: a })
  ), s(), o(), a += i.move("]"), a;
}
function cg() {
  return {
    enter: {
      gfmFootnoteCallString: eg,
      gfmFootnoteCall: tg,
      gfmFootnoteDefinitionLabelString: ng,
      gfmFootnoteDefinition: rg
    },
    exit: {
      gfmFootnoteCallString: ig,
      gfmFootnoteCall: og,
      gfmFootnoteDefinitionLabelString: ag,
      gfmFootnoteDefinition: sg
    }
  };
}
function ug(e) {
  let t = !1;
  return e && e.firstLineBlank && (t = !0), {
    handlers: { footnoteDefinition: n, footnoteReference: Ua },
    // This is on by default already.
    unsafe: [{ character: "[", inConstruct: ["label", "phrasing", "reference"] }]
  };
  function n(r, i, a, o) {
    const s = a.createTracker(o);
    let l = s.move("[^");
    const c = a.enter("footnoteDefinition"), u = a.enter("label");
    return l += s.move(
      a.safe(a.associationId(r), { before: l, after: "]" })
    ), u(), l += s.move("]:"), r.children && r.children.length > 0 && (s.shift(4), l += s.move(
      (t ? `
` : " ") + a.indentLines(
        a.containerFlow(r, s.current()),
        t ? $a : dg
      )
    )), c(), l;
  }
}
function dg(e, t, n) {
  return t === 0 ? e : $a(e, t, n);
}
function $a(e, t, n) {
  return (n ? "" : "    ") + e;
}
const pg = [
  "autolink",
  "destinationLiteral",
  "destinationRaw",
  "reference",
  "titleQuote",
  "titleApostrophe"
];
Ha.peek = bg;
function fg() {
  return {
    canContainEols: ["delete"],
    enter: { strikethrough: mg },
    exit: { strikethrough: hg }
  };
}
function gg() {
  return {
    unsafe: [
      {
        character: "~",
        inConstruct: "phrasing",
        notInConstruct: pg
      }
    ],
    handlers: { delete: Ha }
  };
}
function mg(e) {
  this.enter({ type: "delete", children: [] }, e);
}
function hg(e) {
  this.exit(e);
}
function Ha(e, t, n, r) {
  const i = n.createTracker(r), a = n.enter("strikethrough");
  let o = i.move("~~");
  return o += n.containerPhrasing(e, {
    ...i.current(),
    before: o,
    after: "~"
  }), o += i.move("~~"), a(), o;
}
function bg() {
  return "~";
}
function yg(e) {
  return e.length;
}
function Eg(e, t) {
  const n = t || {}, r = (n.align || []).concat(), i = n.stringLength || yg, a = [], o = [], s = [], l = [];
  let c = 0, u = -1;
  for (; ++u < e.length; ) {
    const h = [], k = [];
    let y = -1;
    for (e[u].length > c && (c = e[u].length); ++y < e[u].length; ) {
      const S = _g(e[u][y]);
      if (n.alignDelimiters !== !1) {
        const w = i(S);
        k[y] = w, (l[y] === void 0 || w > l[y]) && (l[y] = w);
      }
      h.push(S);
    }
    o[u] = h, s[u] = k;
  }
  let d = -1;
  if (typeof r == "object" && "length" in r)
    for (; ++d < c; )
      a[d] = wo(r[d]);
  else {
    const h = wo(r);
    for (; ++d < c; )
      a[d] = h;
  }
  d = -1;
  const f = [], p = [];
  for (; ++d < c; ) {
    const h = a[d];
    let k = "", y = "";
    h === 99 ? (k = ":", y = ":") : h === 108 ? k = ":" : h === 114 && (y = ":");
    let S = n.alignDelimiters === !1 ? 1 : Math.max(
      1,
      l[d] - k.length - y.length
    );
    const w = k + "-".repeat(S) + y;
    n.alignDelimiters !== !1 && (S = k.length + S + y.length, S > l[d] && (l[d] = S), p[d] = S), f[d] = w;
  }
  o.splice(1, 0, f), s.splice(1, 0, p), u = -1;
  const m = [];
  for (; ++u < o.length; ) {
    const h = o[u], k = s[u];
    d = -1;
    const y = [];
    for (; ++d < c; ) {
      const S = h[d] || "";
      let w = "", N = "";
      if (n.alignDelimiters !== !1) {
        const A = l[d] - (k[d] || 0), _ = a[d];
        _ === 114 ? w = " ".repeat(A) : _ === 99 ? A % 2 ? (w = " ".repeat(A / 2 + 0.5), N = " ".repeat(A / 2 - 0.5)) : (w = " ".repeat(A / 2), N = w) : N = " ".repeat(A);
      }
      n.delimiterStart !== !1 && !d && y.push("|"), n.padding !== !1 && // Don’t add the opening space if we’re not aligning and the cell is
      // empty: there will be a closing space.
      !(n.alignDelimiters === !1 && S === "") && (n.delimiterStart !== !1 || d) && y.push(" "), n.alignDelimiters !== !1 && y.push(w), y.push(S), n.alignDelimiters !== !1 && y.push(N), n.padding !== !1 && y.push(" "), (n.delimiterEnd !== !1 || d !== c - 1) && y.push("|");
    }
    m.push(
      n.delimiterEnd === !1 ? y.join("").replace(/ +$/, "") : y.join("")
    );
  }
  return m.join(`
`);
}
function _g(e) {
  return e == null ? "" : String(e);
}
function wo(e) {
  const t = typeof e == "string" ? e.codePointAt(0) : 0;
  return t === 67 || t === 99 ? 99 : t === 76 || t === 108 ? 108 : t === 82 || t === 114 ? 114 : 0;
}
function kg(e, t, n, r) {
  const i = n.enter("blockquote"), a = n.createTracker(r);
  a.move("> "), a.shift(2);
  const o = n.indentLines(
    n.containerFlow(e, a.current()),
    xg
  );
  return i(), o;
}
function xg(e, t, n) {
  return ">" + (n ? "" : " ") + e;
}
function wg(e, t) {
  return So(e, t.inConstruct, !0) && !So(e, t.notInConstruct, !1);
}
function So(e, t, n) {
  if (typeof t == "string" && (t = [t]), !t || t.length === 0)
    return n;
  let r = -1;
  for (; ++r < t.length; )
    if (e.includes(t[r]))
      return !0;
  return !1;
}
function vo(e, t, n, r) {
  let i = -1;
  for (; ++i < n.unsafe.length; )
    if (n.unsafe[i].character === `
` && wg(n.stack, n.unsafe[i]))
      return /[ \t]/.test(r.before) ? "" : " ";
  return `\\
`;
}
function Sg(e, t) {
  const n = String(e);
  let r = n.indexOf(t), i = r, a = 0, o = 0;
  if (typeof t != "string")
    throw new TypeError("Expected substring");
  for (; r !== -1; )
    r === i ? ++a > o && (o = a) : a = 1, i = r + t.length, r = n.indexOf(t, i);
  return o;
}
function vg(e, t) {
  return !!(t.options.fences === !1 && e.value && // If there’s no info…
  !e.lang && // And there’s a non-whitespace character…
  /[^ \r\n]/.test(e.value) && // And the value doesn’t start or end in a blank…
  !/^[\t ]*(?:[\r\n]|$)|(?:^|[\r\n])[\t ]*$/.test(e.value));
}
function Tg(e) {
  const t = e.options.fence || "`";
  if (t !== "`" && t !== "~")
    throw new Error(
      "Cannot serialize code with `" + t + "` for `options.fence`, expected `` ` `` or `~`"
    );
  return t;
}
function Ng(e, t, n, r) {
  const i = Tg(n), a = e.value || "", o = i === "`" ? "GraveAccent" : "Tilde";
  if (vg(e, n)) {
    const d = n.enter("codeIndented"), f = n.indentLines(a, Ag);
    return d(), f;
  }
  const s = n.createTracker(r), l = i.repeat(Math.max(Sg(a, i) + 1, 3)), c = n.enter("codeFenced");
  let u = s.move(l);
  if (e.lang) {
    const d = n.enter(`codeFencedLang${o}`);
    u += s.move(
      n.safe(e.lang, {
        before: u,
        after: " ",
        encode: ["`"],
        ...s.current()
      })
    ), d();
  }
  if (e.lang && e.meta) {
    const d = n.enter(`codeFencedMeta${o}`);
    u += s.move(" "), u += s.move(
      n.safe(e.meta, {
        before: u,
        after: `
`,
        encode: ["`"],
        ...s.current()
      })
    ), d();
  }
  return u += s.move(`
`), a && (u += s.move(a + `
`)), u += s.move(l), c(), u;
}
function Ag(e, t, n) {
  return (n ? "" : "    ") + e;
}
function ci(e) {
  const t = e.options.quote || '"';
  if (t !== '"' && t !== "'")
    throw new Error(
      "Cannot serialize title with `" + t + "` for `options.quote`, expected `\"`, or `'`"
    );
  return t;
}
function Cg(e, t, n, r) {
  const i = ci(n), a = i === '"' ? "Quote" : "Apostrophe", o = n.enter("definition");
  let s = n.enter("label");
  const l = n.createTracker(r);
  let c = l.move("[");
  return c += l.move(
    n.safe(n.associationId(e), {
      before: c,
      after: "]",
      ...l.current()
    })
  ), c += l.move("]: "), s(), // If there’s no url, or…
  !e.url || // If there are control characters or whitespace.
  /[\0- \u007F]/.test(e.url) ? (s = n.enter("destinationLiteral"), c += l.move("<"), c += l.move(
    n.safe(e.url, { before: c, after: ">", ...l.current() })
  ), c += l.move(">")) : (s = n.enter("destinationRaw"), c += l.move(
    n.safe(e.url, {
      before: c,
      after: e.title ? " " : `
`,
      ...l.current()
    })
  )), s(), e.title && (s = n.enter(`title${a}`), c += l.move(" " + i), c += l.move(
    n.safe(e.title, {
      before: c,
      after: i,
      ...l.current()
    })
  ), c += l.move(i), s()), o(), c;
}
function Rg(e) {
  const t = e.options.emphasis || "*";
  if (t !== "*" && t !== "_")
    throw new Error(
      "Cannot serialize emphasis with `" + t + "` for `options.emphasis`, expected `*`, or `_`"
    );
  return t;
}
function dn(e) {
  return "&#x" + e.toString(16).toUpperCase() + ";";
}
function $n(e, t, n) {
  const r = Ht(e), i = Ht(t);
  return r === void 0 ? i === void 0 ? (
    // Letter inside:
    // we have to encode *both* letters for `_` as it is looser.
    // it already forms for `*` (and GFMs `~`).
    n === "_" ? { inside: !0, outside: !0 } : { inside: !1, outside: !1 }
  ) : i === 1 ? (
    // Whitespace inside: encode both (letter, whitespace).
    { inside: !0, outside: !0 }
  ) : (
    // Punctuation inside: encode outer (letter)
    { inside: !1, outside: !0 }
  ) : r === 1 ? i === void 0 ? (
    // Letter inside: already forms.
    { inside: !1, outside: !1 }
  ) : i === 1 ? (
    // Whitespace inside: encode both (whitespace).
    { inside: !0, outside: !0 }
  ) : (
    // Punctuation inside: already forms.
    { inside: !1, outside: !1 }
  ) : i === void 0 ? (
    // Letter inside: already forms.
    { inside: !1, outside: !1 }
  ) : i === 1 ? (
    // Whitespace inside: encode inner (whitespace).
    { inside: !0, outside: !1 }
  ) : (
    // Punctuation inside: already forms.
    { inside: !1, outside: !1 }
  );
}
Ga.peek = Og;
function Ga(e, t, n, r) {
  const i = Rg(n), a = n.enter("emphasis"), o = n.createTracker(r), s = o.move(i);
  let l = o.move(
    n.containerPhrasing(e, {
      after: i,
      before: s,
      ...o.current()
    })
  );
  const c = l.charCodeAt(0), u = $n(
    r.before.charCodeAt(r.before.length - 1),
    c,
    i
  );
  u.inside && (l = dn(c) + l.slice(1));
  const d = l.charCodeAt(l.length - 1), f = $n(r.after.charCodeAt(0), d, i);
  f.inside && (l = l.slice(0, -1) + dn(d));
  const p = o.move(i);
  return a(), n.attentionEncodeSurroundingInfo = {
    after: f.outside,
    before: u.outside
  }, s + l + p;
}
function Og(e, t, n) {
  return n.options.emphasis || "*";
}
function Ig(e, t) {
  let n = !1;
  return qt(e, function(r) {
    if ("value" in r && /\r?\n|\r/.test(r.value) || r.type === "break")
      return n = !0, Ir;
  }), !!((!e.depth || e.depth < 3) && ei(e) && (t.options.setext || n));
}
function Mg(e, t, n, r) {
  const i = Math.max(Math.min(6, e.depth || 1), 1), a = n.createTracker(r);
  if (Ig(e, n)) {
    const u = n.enter("headingSetext"), d = n.enter("phrasing"), f = n.containerPhrasing(e, {
      ...a.current(),
      before: `
`,
      after: `
`
    });
    return d(), u(), f + `
` + (i === 1 ? "=" : "-").repeat(
      // The whole size…
      f.length - // Minus the position of the character after the last EOL (or
      // 0 if there is none)…
      (Math.max(f.lastIndexOf("\r"), f.lastIndexOf(`
`)) + 1)
    );
  }
  const o = "#".repeat(i), s = n.enter("headingAtx"), l = n.enter("phrasing");
  a.move(o + " ");
  let c = n.containerPhrasing(e, {
    before: "# ",
    after: `
`,
    ...a.current()
  });
  return /^[\t ]/.test(c) && (c = dn(c.charCodeAt(0)) + c.slice(1)), c = c ? o + " " + c : o, n.options.closeAtx && (c += " " + o), l(), s(), c;
}
Ka.peek = Lg;
function Ka(e) {
  return e.value || "";
}
function Lg() {
  return "<";
}
qa.peek = Dg;
function qa(e, t, n, r) {
  const i = ci(n), a = i === '"' ? "Quote" : "Apostrophe", o = n.enter("image");
  let s = n.enter("label");
  const l = n.createTracker(r);
  let c = l.move("![");
  return c += l.move(
    n.safe(e.alt, { before: c, after: "]", ...l.current() })
  ), c += l.move("]("), s(), // If there’s no url but there is a title…
  !e.url && e.title || // If there are control characters or whitespace.
  /[\0- \u007F]/.test(e.url) ? (s = n.enter("destinationLiteral"), c += l.move("<"), c += l.move(
    n.safe(e.url, { before: c, after: ">", ...l.current() })
  ), c += l.move(">")) : (s = n.enter("destinationRaw"), c += l.move(
    n.safe(e.url, {
      before: c,
      after: e.title ? " " : ")",
      ...l.current()
    })
  )), s(), e.title && (s = n.enter(`title${a}`), c += l.move(" " + i), c += l.move(
    n.safe(e.title, {
      before: c,
      after: i,
      ...l.current()
    })
  ), c += l.move(i), s()), c += l.move(")"), o(), c;
}
function Dg() {
  return "!";
}
Wa.peek = Pg;
function Wa(e, t, n, r) {
  const i = e.referenceType, a = n.enter("imageReference");
  let o = n.enter("label");
  const s = n.createTracker(r);
  let l = s.move("![");
  const c = n.safe(e.alt, {
    before: l,
    after: "]",
    ...s.current()
  });
  l += s.move(c + "]["), o();
  const u = n.stack;
  n.stack = [], o = n.enter("reference");
  const d = n.safe(n.associationId(e), {
    before: l,
    after: "]",
    ...s.current()
  });
  return o(), n.stack = u, a(), i === "full" || !c || c !== d ? l += s.move(d + "]") : i === "shortcut" ? l = l.slice(0, -1) : l += s.move("]"), l;
}
function Pg() {
  return "!";
}
Va.peek = Bg;
function Va(e, t, n) {
  let r = e.value || "", i = "`", a = -1;
  for (; new RegExp("(^|[^`])" + i + "([^`]|$)").test(r); )
    i += "`";
  for (/[^ \r\n]/.test(r) && (/^[ \r\n]/.test(r) && /[ \r\n]$/.test(r) || /^`|`$/.test(r)) && (r = " " + r + " "); ++a < n.unsafe.length; ) {
    const o = n.unsafe[a], s = n.compilePattern(o);
    let l;
    if (o.atBreak)
      for (; l = s.exec(r); ) {
        let c = l.index;
        r.charCodeAt(c) === 10 && r.charCodeAt(c - 1) === 13 && c--, r = r.slice(0, c) + " " + r.slice(l.index + 1);
      }
  }
  return i + r + i;
}
function Bg() {
  return "`";
}
function Ya(e, t) {
  const n = ei(e);
  return !!(!t.options.resourceLink && // If there’s a url…
  e.url && // And there’s a no title…
  !e.title && // And the content of `node` is a single text node…
  e.children && e.children.length === 1 && e.children[0].type === "text" && // And if the url is the same as the content…
  (n === e.url || "mailto:" + n === e.url) && // And that starts w/ a protocol…
  /^[a-z][a-z+.-]+:/i.test(e.url) && // And that doesn’t contain ASCII control codes (character escapes and
  // references don’t work), space, or angle brackets…
  !/[\0- <>\u007F]/.test(e.url));
}
ja.peek = Fg;
function ja(e, t, n, r) {
  const i = ci(n), a = i === '"' ? "Quote" : "Apostrophe", o = n.createTracker(r);
  let s, l;
  if (Ya(e, n)) {
    const u = n.stack;
    n.stack = [], s = n.enter("autolink");
    let d = o.move("<");
    return d += o.move(
      n.containerPhrasing(e, {
        before: d,
        after: ">",
        ...o.current()
      })
    ), d += o.move(">"), s(), n.stack = u, d;
  }
  s = n.enter("link"), l = n.enter("label");
  let c = o.move("[");
  return c += o.move(
    n.containerPhrasing(e, {
      before: c,
      after: "](",
      ...o.current()
    })
  ), c += o.move("]("), l(), // If there’s no url but there is a title…
  !e.url && e.title || // If there are control characters or whitespace.
  /[\0- \u007F]/.test(e.url) ? (l = n.enter("destinationLiteral"), c += o.move("<"), c += o.move(
    n.safe(e.url, { before: c, after: ">", ...o.current() })
  ), c += o.move(">")) : (l = n.enter("destinationRaw"), c += o.move(
    n.safe(e.url, {
      before: c,
      after: e.title ? " " : ")",
      ...o.current()
    })
  )), l(), e.title && (l = n.enter(`title${a}`), c += o.move(" " + i), c += o.move(
    n.safe(e.title, {
      before: c,
      after: i,
      ...o.current()
    })
  ), c += o.move(i), l()), c += o.move(")"), s(), c;
}
function Fg(e, t, n) {
  return Ya(e, n) ? "<" : "[";
}
Za.peek = zg;
function Za(e, t, n, r) {
  const i = e.referenceType, a = n.enter("linkReference");
  let o = n.enter("label");
  const s = n.createTracker(r);
  let l = s.move("[");
  const c = n.containerPhrasing(e, {
    before: l,
    after: "]",
    ...s.current()
  });
  l += s.move(c + "]["), o();
  const u = n.stack;
  n.stack = [], o = n.enter("reference");
  const d = n.safe(n.associationId(e), {
    before: l,
    after: "]",
    ...s.current()
  });
  return o(), n.stack = u, a(), i === "full" || !c || c !== d ? l += s.move(d + "]") : i === "shortcut" ? l = l.slice(0, -1) : l += s.move("]"), l;
}
function zg() {
  return "[";
}
function ui(e) {
  const t = e.options.bullet || "*";
  if (t !== "*" && t !== "+" && t !== "-")
    throw new Error(
      "Cannot serialize items with `" + t + "` for `options.bullet`, expected `*`, `+`, or `-`"
    );
  return t;
}
function Ug(e) {
  const t = ui(e), n = e.options.bulletOther;
  if (!n)
    return t === "*" ? "-" : "*";
  if (n !== "*" && n !== "+" && n !== "-")
    throw new Error(
      "Cannot serialize items with `" + n + "` for `options.bulletOther`, expected `*`, `+`, or `-`"
    );
  if (n === t)
    throw new Error(
      "Expected `bullet` (`" + t + "`) and `bulletOther` (`" + n + "`) to be different"
    );
  return n;
}
function $g(e) {
  const t = e.options.bulletOrdered || ".";
  if (t !== "." && t !== ")")
    throw new Error(
      "Cannot serialize items with `" + t + "` for `options.bulletOrdered`, expected `.` or `)`"
    );
  return t;
}
function Xa(e) {
  const t = e.options.rule || "*";
  if (t !== "*" && t !== "-" && t !== "_")
    throw new Error(
      "Cannot serialize rules with `" + t + "` for `options.rule`, expected `*`, `-`, or `_`"
    );
  return t;
}
function Hg(e, t, n, r) {
  const i = n.enter("list"), a = n.bulletCurrent;
  let o = e.ordered ? $g(n) : ui(n);
  const s = e.ordered ? o === "." ? ")" : "." : Ug(n);
  let l = t && n.bulletLastUsed ? o === n.bulletLastUsed : !1;
  if (!e.ordered) {
    const u = e.children ? e.children[0] : void 0;
    if (
      // Bullet could be used as a thematic break marker:
      (o === "*" || o === "-") && // Empty first list item:
      u && (!u.children || !u.children[0]) && // Directly in two other list items:
      n.stack[n.stack.length - 1] === "list" && n.stack[n.stack.length - 2] === "listItem" && n.stack[n.stack.length - 3] === "list" && n.stack[n.stack.length - 4] === "listItem" && // That are each the first child.
      n.indexStack[n.indexStack.length - 1] === 0 && n.indexStack[n.indexStack.length - 2] === 0 && n.indexStack[n.indexStack.length - 3] === 0 && (l = !0), Xa(n) === o && u
    ) {
      let d = -1;
      for (; ++d < e.children.length; ) {
        const f = e.children[d];
        if (f && f.type === "listItem" && f.children && f.children[0] && f.children[0].type === "thematicBreak") {
          l = !0;
          break;
        }
      }
    }
  }
  l && (o = s), n.bulletCurrent = o;
  const c = n.containerFlow(e, r);
  return n.bulletLastUsed = o, n.bulletCurrent = a, i(), c;
}
function Gg(e) {
  const t = e.options.listItemIndent || "one";
  if (t !== "tab" && t !== "one" && t !== "mixed")
    throw new Error(
      "Cannot serialize items with `" + t + "` for `options.listItemIndent`, expected `tab`, `one`, or `mixed`"
    );
  return t;
}
function Kg(e, t, n, r) {
  const i = Gg(n);
  let a = n.bulletCurrent || ui(n);
  t && t.type === "list" && t.ordered && (a = (typeof t.start == "number" && t.start > -1 ? t.start : 1) + (n.options.incrementListMarker === !1 ? 0 : t.children.indexOf(e)) + a);
  let o = a.length + 1;
  (i === "tab" || i === "mixed" && (t && t.type === "list" && t.spread || e.spread)) && (o = Math.ceil(o / 4) * 4);
  const s = n.createTracker(r);
  s.move(a + " ".repeat(o - a.length)), s.shift(o);
  const l = n.enter("listItem"), c = n.indentLines(
    n.containerFlow(e, s.current()),
    u
  );
  return l(), c;
  function u(d, f, p) {
    return f ? (p ? "" : " ".repeat(o)) + d : (p ? a : a + " ".repeat(o - a.length)) + d;
  }
}
function qg(e, t, n, r) {
  const i = n.enter("paragraph"), a = n.enter("phrasing"), o = n.containerPhrasing(e, r);
  return a(), i(), o;
}
const Wg = (
  /** @type {(node?: unknown) => node is Exclude<PhrasingContent, Html>} */
  gn([
    "break",
    "delete",
    "emphasis",
    // To do: next major: removed since footnotes were added to GFM.
    "footnote",
    "footnoteReference",
    "image",
    "imageReference",
    "inlineCode",
    // Enabled by `mdast-util-math`:
    "inlineMath",
    "link",
    "linkReference",
    // Enabled by `mdast-util-mdx`:
    "mdxJsxTextElement",
    // Enabled by `mdast-util-mdx`:
    "mdxTextExpression",
    "strong",
    "text",
    // Enabled by `mdast-util-directive`:
    "textDirective"
  ])
);
function Vg(e, t, n, r) {
  return (e.children.some(function(o) {
    return Wg(o);
  }) ? n.containerPhrasing : n.containerFlow).call(n, e, r);
}
function Yg(e) {
  const t = e.options.strong || "*";
  if (t !== "*" && t !== "_")
    throw new Error(
      "Cannot serialize strong with `" + t + "` for `options.strong`, expected `*`, or `_`"
    );
  return t;
}
Qa.peek = jg;
function Qa(e, t, n, r) {
  const i = Yg(n), a = n.enter("strong"), o = n.createTracker(r), s = o.move(i + i);
  let l = o.move(
    n.containerPhrasing(e, {
      after: i,
      before: s,
      ...o.current()
    })
  );
  const c = l.charCodeAt(0), u = $n(
    r.before.charCodeAt(r.before.length - 1),
    c,
    i
  );
  u.inside && (l = dn(c) + l.slice(1));
  const d = l.charCodeAt(l.length - 1), f = $n(r.after.charCodeAt(0), d, i);
  f.inside && (l = l.slice(0, -1) + dn(d));
  const p = o.move(i + i);
  return a(), n.attentionEncodeSurroundingInfo = {
    after: f.outside,
    before: u.outside
  }, s + l + p;
}
function jg(e, t, n) {
  return n.options.strong || "*";
}
function Zg(e, t, n, r) {
  return n.safe(e.value, r);
}
function Xg(e) {
  const t = e.options.ruleRepetition || 3;
  if (t < 3)
    throw new Error(
      "Cannot serialize rules with repetition `" + t + "` for `options.ruleRepetition`, expected `3` or more"
    );
  return t;
}
function Qg(e, t, n) {
  const r = (Xa(n) + (n.options.ruleSpaces ? " " : "")).repeat(Xg(n));
  return n.options.ruleSpaces ? r.slice(0, -1) : r;
}
const Ja = {
  blockquote: kg,
  break: vo,
  code: Ng,
  definition: Cg,
  emphasis: Ga,
  hardBreak: vo,
  heading: Mg,
  html: Ka,
  image: qa,
  imageReference: Wa,
  inlineCode: Va,
  link: ja,
  linkReference: Za,
  list: Hg,
  listItem: Kg,
  paragraph: qg,
  root: Vg,
  strong: Qa,
  text: Zg,
  thematicBreak: Qg
};
function Jg() {
  return {
    enter: {
      table: em,
      tableData: To,
      tableHeader: To,
      tableRow: nm
    },
    exit: {
      codeText: rm,
      table: tm,
      tableData: _r,
      tableHeader: _r,
      tableRow: _r
    }
  };
}
function em(e) {
  const t = e._align;
  this.enter(
    {
      type: "table",
      align: t.map(function(n) {
        return n === "none" ? null : n;
      }),
      children: []
    },
    e
  ), this.data.inTable = !0;
}
function tm(e) {
  this.exit(e), this.data.inTable = void 0;
}
function nm(e) {
  this.enter({ type: "tableRow", children: [] }, e);
}
function _r(e) {
  this.exit(e);
}
function To(e) {
  this.enter({ type: "tableCell", children: [] }, e);
}
function rm(e) {
  let t = this.resume();
  this.data.inTable && (t = t.replace(/\\([\\|])/g, im));
  const n = this.stack[this.stack.length - 1];
  n.type, n.value = t, this.exit(e);
}
function im(e, t) {
  return t === "|" ? t : e;
}
function om(e) {
  const t = e || {}, n = t.tableCellPadding, r = t.tablePipeAlign, i = t.stringLength, a = n ? " " : "|";
  return {
    unsafe: [
      { character: "\r", inConstruct: "tableCell" },
      { character: `
`, inConstruct: "tableCell" },
      // A pipe, when followed by a tab or space (padding), or a dash or colon
      // (unpadded delimiter row), could result in a table.
      { atBreak: !0, character: "|", after: "[	 :-]" },
      // A pipe in a cell must be encoded.
      { character: "|", inConstruct: "tableCell" },
      // A colon must be followed by a dash, in which case it could start a
      // delimiter row.
      { atBreak: !0, character: ":", after: "-" },
      // A delimiter row can also start with a dash, when followed by more
      // dashes, a colon, or a pipe.
      // This is a stricter version than the built in check for lists, thematic
      // breaks, and setex heading underlines though:
      // <https://github.com/syntax-tree/mdast-util-to-markdown/blob/51a2038/lib/unsafe.js#L57>
      { atBreak: !0, character: "-", after: "[:|-]" }
    ],
    handlers: {
      inlineCode: f,
      table: o,
      tableCell: l,
      tableRow: s
    }
  };
  function o(p, m, h, k) {
    return c(u(p, h, k), p.align);
  }
  function s(p, m, h, k) {
    const y = d(p, h, k), S = c([y]);
    return S.slice(0, S.indexOf(`
`));
  }
  function l(p, m, h, k) {
    const y = h.enter("tableCell"), S = h.enter("phrasing"), w = h.containerPhrasing(p, {
      ...k,
      before: a,
      after: a
    });
    return S(), y(), w;
  }
  function c(p, m) {
    return Eg(p, {
      align: m,
      // @ts-expect-error: `markdown-table` types should support `null`.
      alignDelimiters: r,
      // @ts-expect-error: `markdown-table` types should support `null`.
      padding: n,
      // @ts-expect-error: `markdown-table` types should support `null`.
      stringLength: i
    });
  }
  function u(p, m, h) {
    const k = p.children;
    let y = -1;
    const S = [], w = m.enter("table");
    for (; ++y < k.length; )
      S[y] = d(k[y], m, h);
    return w(), S;
  }
  function d(p, m, h) {
    const k = p.children;
    let y = -1;
    const S = [], w = m.enter("tableRow");
    for (; ++y < k.length; )
      S[y] = l(k[y], p, m, h);
    return w(), S;
  }
  function f(p, m, h) {
    let k = Ja.inlineCode(p, m, h);
    return h.stack.includes("tableCell") && (k = k.replace(/\|/g, "\\$&")), k;
  }
}
function am() {
  return {
    exit: {
      taskListCheckValueChecked: No,
      taskListCheckValueUnchecked: No,
      paragraph: lm
    }
  };
}
function sm() {
  return {
    unsafe: [{ atBreak: !0, character: "-", after: "[:|-]" }],
    handlers: { listItem: cm }
  };
}
function No(e) {
  const t = this.stack[this.stack.length - 2];
  t.type, t.checked = e.type === "taskListCheckValueChecked";
}
function lm(e) {
  const t = this.stack[this.stack.length - 2];
  if (t && t.type === "listItem" && typeof t.checked == "boolean") {
    const n = this.stack[this.stack.length - 1];
    n.type;
    const r = n.children[0];
    if (r && r.type === "text") {
      const i = t.children;
      let a = -1, o;
      for (; ++a < i.length; ) {
        const s = i[a];
        if (s.type === "paragraph") {
          o = s;
          break;
        }
      }
      o === n && (r.value = r.value.slice(1), r.value.length === 0 ? n.children.shift() : n.position && r.position && typeof r.position.start.offset == "number" && (r.position.start.column++, r.position.start.offset++, n.position.start = Object.assign({}, r.position.start)));
    }
  }
  this.exit(e);
}
function cm(e, t, n, r) {
  const i = e.children[0], a = typeof e.checked == "boolean" && i && i.type === "paragraph", o = "[" + (e.checked ? "x" : " ") + "] ", s = n.createTracker(r);
  a && s.move(o);
  let l = Ja.listItem(e, t, n, {
    ...r,
    ...s.current()
  });
  return a && (l = l.replace(/^(?:[*+-]|\d+\.)([\r\n]| {1,3})/, c)), l;
  function c(u) {
    return u + o;
  }
}
function um() {
  return [
    Hf(),
    cg(),
    fg(),
    Jg(),
    am()
  ];
}
function dm(e) {
  return {
    extensions: [
      Gf(),
      ug(e),
      gg(),
      om(e),
      sm()
    ]
  };
}
const pm = {
  tokenize: ym,
  partial: !0
}, es = {
  tokenize: Em,
  partial: !0
}, ts = {
  tokenize: _m,
  partial: !0
}, ns = {
  tokenize: km,
  partial: !0
}, fm = {
  tokenize: xm,
  partial: !0
}, rs = {
  name: "wwwAutolink",
  tokenize: hm,
  previous: os
}, is = {
  name: "protocolAutolink",
  tokenize: bm,
  previous: as
}, bt = {
  name: "emailAutolink",
  tokenize: mm,
  previous: ss
}, ut = {};
function gm() {
  return {
    text: ut
  };
}
let At = 48;
for (; At < 123; )
  ut[At] = bt, At++, At === 58 ? At = 65 : At === 91 && (At = 97);
ut[43] = bt;
ut[45] = bt;
ut[46] = bt;
ut[95] = bt;
ut[72] = [bt, is];
ut[104] = [bt, is];
ut[87] = [bt, rs];
ut[119] = [bt, rs];
function mm(e, t, n) {
  const r = this;
  let i, a;
  return o;
  function o(d) {
    return !zr(d) || !ss.call(r, r.previous) || di(r.events) ? n(d) : (e.enter("literalAutolink"), e.enter("literalAutolinkEmail"), s(d));
  }
  function s(d) {
    return zr(d) ? (e.consume(d), s) : d === 64 ? (e.consume(d), l) : n(d);
  }
  function l(d) {
    return d === 46 ? e.check(fm, u, c)(d) : d === 45 || d === 95 || Fe(d) ? (a = !0, e.consume(d), l) : u(d);
  }
  function c(d) {
    return e.consume(d), i = !0, l;
  }
  function u(d) {
    return a && i && He(r.previous) ? (e.exit("literalAutolinkEmail"), e.exit("literalAutolink"), t(d)) : n(d);
  }
}
function hm(e, t, n) {
  const r = this;
  return i;
  function i(o) {
    return o !== 87 && o !== 119 || !os.call(r, r.previous) || di(r.events) ? n(o) : (e.enter("literalAutolink"), e.enter("literalAutolinkWww"), e.check(pm, e.attempt(es, e.attempt(ts, a), n), n)(o));
  }
  function a(o) {
    return e.exit("literalAutolinkWww"), e.exit("literalAutolink"), t(o);
  }
}
function bm(e, t, n) {
  const r = this;
  let i = "", a = !1;
  return o;
  function o(d) {
    return (d === 72 || d === 104) && as.call(r, r.previous) && !di(r.events) ? (e.enter("literalAutolink"), e.enter("literalAutolinkHttp"), i += String.fromCodePoint(d), e.consume(d), s) : n(d);
  }
  function s(d) {
    if (He(d) && i.length < 5)
      return i += String.fromCodePoint(d), e.consume(d), s;
    if (d === 58) {
      const f = i.toLowerCase();
      if (f === "http" || f === "https")
        return e.consume(d), l;
    }
    return n(d);
  }
  function l(d) {
    return d === 47 ? (e.consume(d), a ? c : (a = !0, l)) : n(d);
  }
  function c(d) {
    return d === null || Bn(d) || xe(d) || Ct(d) || Kn(d) ? n(d) : e.attempt(es, e.attempt(ts, u), n)(d);
  }
  function u(d) {
    return e.exit("literalAutolinkHttp"), e.exit("literalAutolink"), t(d);
  }
}
function ym(e, t, n) {
  let r = 0;
  return i;
  function i(o) {
    return (o === 87 || o === 119) && r < 3 ? (r++, e.consume(o), i) : o === 46 && r === 3 ? (e.consume(o), a) : n(o);
  }
  function a(o) {
    return o === null ? n(o) : t(o);
  }
}
function Em(e, t, n) {
  let r, i, a;
  return o;
  function o(c) {
    return c === 46 || c === 95 ? e.check(ns, l, s)(c) : c === null || xe(c) || Ct(c) || c !== 45 && Kn(c) ? l(c) : (a = !0, e.consume(c), o);
  }
  function s(c) {
    return c === 95 ? r = !0 : (i = r, r = void 0), e.consume(c), o;
  }
  function l(c) {
    return i || r || !a ? n(c) : t(c);
  }
}
function _m(e, t) {
  let n = 0, r = 0;
  return i;
  function i(o) {
    return o === 40 ? (n++, e.consume(o), i) : o === 41 && r < n ? a(o) : o === 33 || o === 34 || o === 38 || o === 39 || o === 41 || o === 42 || o === 44 || o === 46 || o === 58 || o === 59 || o === 60 || o === 63 || o === 93 || o === 95 || o === 126 ? e.check(ns, t, a)(o) : o === null || xe(o) || Ct(o) ? t(o) : (e.consume(o), i);
  }
  function a(o) {
    return o === 41 && r++, e.consume(o), i;
  }
}
function km(e, t, n) {
  return r;
  function r(s) {
    return s === 33 || s === 34 || s === 39 || s === 41 || s === 42 || s === 44 || s === 46 || s === 58 || s === 59 || s === 63 || s === 95 || s === 126 ? (e.consume(s), r) : s === 38 ? (e.consume(s), a) : s === 93 ? (e.consume(s), i) : (
      // `<` is an end.
      s === 60 || // So is whitespace.
      s === null || xe(s) || Ct(s) ? t(s) : n(s)
    );
  }
  function i(s) {
    return s === null || s === 40 || s === 91 || xe(s) || Ct(s) ? t(s) : r(s);
  }
  function a(s) {
    return He(s) ? o(s) : n(s);
  }
  function o(s) {
    return s === 59 ? (e.consume(s), r) : He(s) ? (e.consume(s), o) : n(s);
  }
}
function xm(e, t, n) {
  return r;
  function r(a) {
    return e.consume(a), i;
  }
  function i(a) {
    return Fe(a) ? n(a) : t(a);
  }
}
function os(e) {
  return e === null || e === 40 || e === 42 || e === 95 || e === 91 || e === 93 || e === 126 || xe(e);
}
function as(e) {
  return !He(e);
}
function ss(e) {
  return !(e === 47 || zr(e));
}
function zr(e) {
  return e === 43 || e === 45 || e === 46 || e === 95 || Fe(e);
}
function di(e) {
  let t = e.length, n = !1;
  for (; t--; ) {
    const r = e[t][1];
    if ((r.type === "labelLink" || r.type === "labelImage") && !r._balanced) {
      n = !0;
      break;
    }
    if (r._gfmAutolinkLiteralWalkedInto) {
      n = !1;
      break;
    }
  }
  return e.length > 0 && !n && (e[e.length - 1][1]._gfmAutolinkLiteralWalkedInto = !0), n;
}
const wm = {
  tokenize: Om,
  partial: !0
};
function Sm() {
  return {
    document: {
      91: {
        name: "gfmFootnoteDefinition",
        tokenize: Am,
        continuation: {
          tokenize: Cm
        },
        exit: Rm
      }
    },
    text: {
      91: {
        name: "gfmFootnoteCall",
        tokenize: Nm
      },
      93: {
        name: "gfmPotentialFootnoteCall",
        add: "after",
        tokenize: vm,
        resolveTo: Tm
      }
    }
  };
}
function vm(e, t, n) {
  const r = this;
  let i = r.events.length;
  const a = r.parser.gfmFootnotes || (r.parser.gfmFootnotes = []);
  let o;
  for (; i--; ) {
    const l = r.events[i][1];
    if (l.type === "labelImage") {
      o = l;
      break;
    }
    if (l.type === "gfmFootnoteCall" || l.type === "labelLink" || l.type === "label" || l.type === "image" || l.type === "link")
      break;
  }
  return s;
  function s(l) {
    if (!o || !o._balanced)
      return n(l);
    const c = it(r.sliceSerialize({
      start: o.end,
      end: r.now()
    }));
    return c.codePointAt(0) !== 94 || !a.includes(c.slice(1)) ? n(l) : (e.enter("gfmFootnoteCallLabelMarker"), e.consume(l), e.exit("gfmFootnoteCallLabelMarker"), t(l));
  }
}
function Tm(e, t) {
  let n = e.length;
  for (; n--; )
    if (e[n][1].type === "labelImage" && e[n][0] === "enter") {
      e[n][1];
      break;
    }
  e[n + 1][1].type = "data", e[n + 3][1].type = "gfmFootnoteCallLabelMarker";
  const r = {
    type: "gfmFootnoteCall",
    start: Object.assign({}, e[n + 3][1].start),
    end: Object.assign({}, e[e.length - 1][1].end)
  }, i = {
    type: "gfmFootnoteCallMarker",
    start: Object.assign({}, e[n + 3][1].end),
    end: Object.assign({}, e[n + 3][1].end)
  };
  i.end.column++, i.end.offset++, i.end._bufferIndex++;
  const a = {
    type: "gfmFootnoteCallString",
    start: Object.assign({}, i.end),
    end: Object.assign({}, e[e.length - 1][1].start)
  }, o = {
    type: "chunkString",
    contentType: "string",
    start: Object.assign({}, a.start),
    end: Object.assign({}, a.end)
  }, s = [
    // Take the `labelImageMarker` (now `data`, the `!`)
    e[n + 1],
    e[n + 2],
    ["enter", r, t],
    // The `[`
    e[n + 3],
    e[n + 4],
    // The `^`.
    ["enter", i, t],
    ["exit", i, t],
    // Everything in between.
    ["enter", a, t],
    ["enter", o, t],
    ["exit", o, t],
    ["exit", a, t],
    // The ending (`]`, properly parsed and labelled).
    e[e.length - 2],
    e[e.length - 1],
    ["exit", r, t]
  ];
  return e.splice(n, e.length - n + 1, ...s), e;
}
function Nm(e, t, n) {
  const r = this, i = r.parser.gfmFootnotes || (r.parser.gfmFootnotes = []);
  let a = 0, o;
  return s;
  function s(d) {
    return e.enter("gfmFootnoteCall"), e.enter("gfmFootnoteCallLabelMarker"), e.consume(d), e.exit("gfmFootnoteCallLabelMarker"), l;
  }
  function l(d) {
    return d !== 94 ? n(d) : (e.enter("gfmFootnoteCallMarker"), e.consume(d), e.exit("gfmFootnoteCallMarker"), e.enter("gfmFootnoteCallString"), e.enter("chunkString").contentType = "string", c);
  }
  function c(d) {
    if (
      // Too long.
      a > 999 || // Closing brace with nothing.
      d === 93 && !o || // Space or tab is not supported by GFM for some reason.
      // `\n` and `[` not being supported makes sense.
      d === null || d === 91 || xe(d)
    )
      return n(d);
    if (d === 93) {
      e.exit("chunkString");
      const f = e.exit("gfmFootnoteCallString");
      return i.includes(it(r.sliceSerialize(f))) ? (e.enter("gfmFootnoteCallLabelMarker"), e.consume(d), e.exit("gfmFootnoteCallLabelMarker"), e.exit("gfmFootnoteCall"), t) : n(d);
    }
    return xe(d) || (o = !0), a++, e.consume(d), d === 92 ? u : c;
  }
  function u(d) {
    return d === 91 || d === 92 || d === 93 ? (e.consume(d), a++, c) : c(d);
  }
}
function Am(e, t, n) {
  const r = this, i = r.parser.gfmFootnotes || (r.parser.gfmFootnotes = []);
  let a, o = 0, s;
  return l;
  function l(m) {
    return e.enter("gfmFootnoteDefinition")._container = !0, e.enter("gfmFootnoteDefinitionLabel"), e.enter("gfmFootnoteDefinitionLabelMarker"), e.consume(m), e.exit("gfmFootnoteDefinitionLabelMarker"), c;
  }
  function c(m) {
    return m === 94 ? (e.enter("gfmFootnoteDefinitionMarker"), e.consume(m), e.exit("gfmFootnoteDefinitionMarker"), e.enter("gfmFootnoteDefinitionLabelString"), e.enter("chunkString").contentType = "string", u) : n(m);
  }
  function u(m) {
    if (
      // Too long.
      o > 999 || // Closing brace with nothing.
      m === 93 && !s || // Space or tab is not supported by GFM for some reason.
      // `\n` and `[` not being supported makes sense.
      m === null || m === 91 || xe(m)
    )
      return n(m);
    if (m === 93) {
      e.exit("chunkString");
      const h = e.exit("gfmFootnoteDefinitionLabelString");
      return a = it(r.sliceSerialize(h)), e.enter("gfmFootnoteDefinitionLabelMarker"), e.consume(m), e.exit("gfmFootnoteDefinitionLabelMarker"), e.exit("gfmFootnoteDefinitionLabel"), f;
    }
    return xe(m) || (s = !0), o++, e.consume(m), m === 92 ? d : u;
  }
  function d(m) {
    return m === 91 || m === 92 || m === 93 ? (e.consume(m), o++, u) : u(m);
  }
  function f(m) {
    return m === 58 ? (e.enter("definitionMarker"), e.consume(m), e.exit("definitionMarker"), i.includes(a) || i.push(a), pe(e, p, "gfmFootnoteDefinitionWhitespace")) : n(m);
  }
  function p(m) {
    return t(m);
  }
}
function Cm(e, t, n) {
  return e.check(fn, t, e.attempt(wm, t, n));
}
function Rm(e) {
  e.exit("gfmFootnoteDefinition");
}
function Om(e, t, n) {
  const r = this;
  return pe(e, i, "gfmFootnoteDefinitionIndent", 5);
  function i(a) {
    const o = r.events[r.events.length - 1];
    return o && o[1].type === "gfmFootnoteDefinitionIndent" && o[2].sliceSerialize(o[1], !0).length === 4 ? t(a) : n(a);
  }
}
function Im(e) {
  let n = (e || {}).singleTilde;
  const r = {
    name: "strikethrough",
    tokenize: a,
    resolveAll: i
  };
  return n == null && (n = !0), {
    text: {
      126: r
    },
    insideSpan: {
      null: [r]
    },
    attentionMarkers: {
      null: [126]
    }
  };
  function i(o, s) {
    let l = -1;
    for (; ++l < o.length; )
      if (o[l][0] === "enter" && o[l][1].type === "strikethroughSequenceTemporary" && o[l][1]._close) {
        let c = l;
        for (; c--; )
          if (o[c][0] === "exit" && o[c][1].type === "strikethroughSequenceTemporary" && o[c][1]._open && // If the sizes are the same:
          o[l][1].end.offset - o[l][1].start.offset === o[c][1].end.offset - o[c][1].start.offset) {
            o[l][1].type = "strikethroughSequence", o[c][1].type = "strikethroughSequence";
            const u = {
              type: "strikethrough",
              start: Object.assign({}, o[c][1].start),
              end: Object.assign({}, o[l][1].end)
            }, d = {
              type: "strikethroughText",
              start: Object.assign({}, o[c][1].end),
              end: Object.assign({}, o[l][1].start)
            }, f = [["enter", u, s], ["enter", o[c][1], s], ["exit", o[c][1], s], ["enter", d, s]], p = s.parser.constructs.insideSpan.null;
            p && Je(f, f.length, 0, qn(p, o.slice(c + 1, l), s)), Je(f, f.length, 0, [["exit", d, s], ["enter", o[l][1], s], ["exit", o[l][1], s], ["exit", u, s]]), Je(o, c - 1, l - c + 3, f), l = c + f.length - 2;
            break;
          }
      }
    for (l = -1; ++l < o.length; )
      o[l][1].type === "strikethroughSequenceTemporary" && (o[l][1].type = "data");
    return o;
  }
  function a(o, s, l) {
    const c = this.previous, u = this.events;
    let d = 0;
    return f;
    function f(m) {
      return c === 126 && u[u.length - 1][1].type !== "characterEscape" ? l(m) : (o.enter("strikethroughSequenceTemporary"), p(m));
    }
    function p(m) {
      const h = Ht(c);
      if (m === 126)
        return d > 1 ? l(m) : (o.consume(m), d++, p);
      if (d < 2 && !n) return l(m);
      const k = o.exit("strikethroughSequenceTemporary"), y = Ht(m);
      return k._open = !y || y === 2 && !!h, k._close = !h || h === 2 && !!y, s(m);
    }
  }
}
class Mm {
  /**
   * Create a new edit map.
   */
  constructor() {
    this.map = [];
  }
  /**
   * Create an edit: a remove and/or add at a certain place.
   *
   * @param {number} index
   * @param {number} remove
   * @param {Array<Event>} add
   * @returns {undefined}
   */
  add(t, n, r) {
    Lm(this, t, n, r);
  }
  // To do: add this when moving to `micromark`.
  // /**
  //  * Create an edit: but insert `add` before existing additions.
  //  *
  //  * @param {number} index
  //  * @param {number} remove
  //  * @param {Array<Event>} add
  //  * @returns {undefined}
  //  */
  // addBefore(index, remove, add) {
  //   addImplementation(this, index, remove, add, true)
  // }
  /**
   * Done, change the events.
   *
   * @param {Array<Event>} events
   * @returns {undefined}
   */
  consume(t) {
    if (this.map.sort(function(a, o) {
      return a[0] - o[0];
    }), this.map.length === 0)
      return;
    let n = this.map.length;
    const r = [];
    for (; n > 0; )
      n -= 1, r.push(t.slice(this.map[n][0] + this.map[n][1]), this.map[n][2]), t.length = this.map[n][0];
    r.push(t.slice()), t.length = 0;
    let i = r.pop();
    for (; i; ) {
      for (const a of i)
        t.push(a);
      i = r.pop();
    }
    this.map.length = 0;
  }
}
function Lm(e, t, n, r) {
  let i = 0;
  if (!(n === 0 && r.length === 0)) {
    for (; i < e.map.length; ) {
      if (e.map[i][0] === t) {
        e.map[i][1] += n, e.map[i][2].push(...r);
        return;
      }
      i += 1;
    }
    e.map.push([t, n, r]);
  }
}
function Dm(e, t) {
  let n = !1;
  const r = [];
  for (; t < e.length; ) {
    const i = e[t];
    if (n) {
      if (i[0] === "enter")
        i[1].type === "tableContent" && r.push(e[t + 1][1].type === "tableDelimiterMarker" ? "left" : "none");
      else if (i[1].type === "tableContent") {
        if (e[t - 1][1].type === "tableDelimiterMarker") {
          const a = r.length - 1;
          r[a] = r[a] === "left" ? "center" : "right";
        }
      } else if (i[1].type === "tableDelimiterRow")
        break;
    } else i[0] === "enter" && i[1].type === "tableDelimiterRow" && (n = !0);
    t += 1;
  }
  return r;
}
function Pm() {
  return {
    flow: {
      null: {
        name: "table",
        tokenize: Bm,
        resolveAll: Fm
      }
    }
  };
}
function Bm(e, t, n) {
  const r = this;
  let i = 0, a = 0, o;
  return s;
  function s(x) {
    let O = r.events.length - 1;
    for (; O > -1; ) {
      const D = r.events[O][1].type;
      if (D === "lineEnding" || // Note: markdown-rs uses `whitespace` instead of `linePrefix`
      D === "linePrefix") O--;
      else break;
    }
    const F = O > -1 ? r.events[O][1].type : null, U = F === "tableHead" || F === "tableRow" ? _ : l;
    return U === _ && r.parser.lazy[r.now().line] ? n(x) : U(x);
  }
  function l(x) {
    return e.enter("tableHead"), e.enter("tableRow"), c(x);
  }
  function c(x) {
    return x === 124 || (o = !0, a += 1), u(x);
  }
  function u(x) {
    return x === null ? n(x) : X(x) ? a > 1 ? (a = 0, r.interrupt = !0, e.exit("tableRow"), e.enter("lineEnding"), e.consume(x), e.exit("lineEnding"), p) : n(x) : ue(x) ? pe(e, u, "whitespace")(x) : (a += 1, o && (o = !1, i += 1), x === 124 ? (e.enter("tableCellDivider"), e.consume(x), e.exit("tableCellDivider"), o = !0, u) : (e.enter("data"), d(x)));
  }
  function d(x) {
    return x === null || x === 124 || xe(x) ? (e.exit("data"), u(x)) : (e.consume(x), x === 92 ? f : d);
  }
  function f(x) {
    return x === 92 || x === 124 ? (e.consume(x), d) : d(x);
  }
  function p(x) {
    return r.interrupt = !1, r.parser.lazy[r.now().line] ? n(x) : (e.enter("tableDelimiterRow"), o = !1, ue(x) ? pe(e, m, "linePrefix", r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(x) : m(x));
  }
  function m(x) {
    return x === 45 || x === 58 ? k(x) : x === 124 ? (o = !0, e.enter("tableCellDivider"), e.consume(x), e.exit("tableCellDivider"), h) : A(x);
  }
  function h(x) {
    return ue(x) ? pe(e, k, "whitespace")(x) : k(x);
  }
  function k(x) {
    return x === 58 ? (a += 1, o = !0, e.enter("tableDelimiterMarker"), e.consume(x), e.exit("tableDelimiterMarker"), y) : x === 45 ? (a += 1, y(x)) : x === null || X(x) ? N(x) : A(x);
  }
  function y(x) {
    return x === 45 ? (e.enter("tableDelimiterFiller"), S(x)) : A(x);
  }
  function S(x) {
    return x === 45 ? (e.consume(x), S) : x === 58 ? (o = !0, e.exit("tableDelimiterFiller"), e.enter("tableDelimiterMarker"), e.consume(x), e.exit("tableDelimiterMarker"), w) : (e.exit("tableDelimiterFiller"), w(x));
  }
  function w(x) {
    return ue(x) ? pe(e, N, "whitespace")(x) : N(x);
  }
  function N(x) {
    return x === 124 ? m(x) : x === null || X(x) ? !o || i !== a ? A(x) : (e.exit("tableDelimiterRow"), e.exit("tableHead"), t(x)) : A(x);
  }
  function A(x) {
    return n(x);
  }
  function _(x) {
    return e.enter("tableRow"), L(x);
  }
  function L(x) {
    return x === 124 ? (e.enter("tableCellDivider"), e.consume(x), e.exit("tableCellDivider"), L) : x === null || X(x) ? (e.exit("tableRow"), t(x)) : ue(x) ? pe(e, L, "whitespace")(x) : (e.enter("data"), v(x));
  }
  function v(x) {
    return x === null || x === 124 || xe(x) ? (e.exit("data"), L(x)) : (e.consume(x), x === 92 ? R : v);
  }
  function R(x) {
    return x === 92 || x === 124 ? (e.consume(x), v) : v(x);
  }
}
function Fm(e, t) {
  let n = -1, r = !0, i = 0, a = [0, 0, 0, 0], o = [0, 0, 0, 0], s = !1, l = 0, c, u, d;
  const f = new Mm();
  for (; ++n < e.length; ) {
    const p = e[n], m = p[1];
    p[0] === "enter" ? m.type === "tableHead" ? (s = !1, l !== 0 && (Ao(f, t, l, c, u), u = void 0, l = 0), c = {
      type: "table",
      start: Object.assign({}, m.start),
      // Note: correct end is set later.
      end: Object.assign({}, m.end)
    }, f.add(n, 0, [["enter", c, t]])) : m.type === "tableRow" || m.type === "tableDelimiterRow" ? (r = !0, d = void 0, a = [0, 0, 0, 0], o = [0, n + 1, 0, 0], s && (s = !1, u = {
      type: "tableBody",
      start: Object.assign({}, m.start),
      // Note: correct end is set later.
      end: Object.assign({}, m.end)
    }, f.add(n, 0, [["enter", u, t]])), i = m.type === "tableDelimiterRow" ? 2 : u ? 3 : 1) : i && (m.type === "data" || m.type === "tableDelimiterMarker" || m.type === "tableDelimiterFiller") ? (r = !1, o[2] === 0 && (a[1] !== 0 && (o[0] = o[1], d = Cn(f, t, a, i, void 0, d), a = [0, 0, 0, 0]), o[2] = n)) : m.type === "tableCellDivider" && (r ? r = !1 : (a[1] !== 0 && (o[0] = o[1], d = Cn(f, t, a, i, void 0, d)), a = o, o = [a[1], n, 0, 0])) : m.type === "tableHead" ? (s = !0, l = n) : m.type === "tableRow" || m.type === "tableDelimiterRow" ? (l = n, a[1] !== 0 ? (o[0] = o[1], d = Cn(f, t, a, i, n, d)) : o[1] !== 0 && (d = Cn(f, t, o, i, n, d)), i = 0) : i && (m.type === "data" || m.type === "tableDelimiterMarker" || m.type === "tableDelimiterFiller") && (o[3] = n);
  }
  for (l !== 0 && Ao(f, t, l, c, u), f.consume(t.events), n = -1; ++n < t.events.length; ) {
    const p = t.events[n];
    p[0] === "enter" && p[1].type === "table" && (p[1]._align = Dm(t.events, n));
  }
  return e;
}
function Cn(e, t, n, r, i, a) {
  const o = r === 1 ? "tableHeader" : r === 2 ? "tableDelimiter" : "tableData", s = "tableContent";
  n[0] !== 0 && (a.end = Object.assign({}, Ft(t.events, n[0])), e.add(n[0], 0, [["exit", a, t]]));
  const l = Ft(t.events, n[1]);
  if (a = {
    type: o,
    start: Object.assign({}, l),
    // Note: correct end is set later.
    end: Object.assign({}, l)
  }, e.add(n[1], 0, [["enter", a, t]]), n[2] !== 0) {
    const c = Ft(t.events, n[2]), u = Ft(t.events, n[3]), d = {
      type: s,
      start: Object.assign({}, c),
      end: Object.assign({}, u)
    };
    if (e.add(n[2], 0, [["enter", d, t]]), r !== 2) {
      const f = t.events[n[2]], p = t.events[n[3]];
      if (f[1].end = Object.assign({}, p[1].end), f[1].type = "chunkText", f[1].contentType = "text", n[3] > n[2] + 1) {
        const m = n[2] + 1, h = n[3] - n[2] - 1;
        e.add(m, h, []);
      }
    }
    e.add(n[3] + 1, 0, [["exit", d, t]]);
  }
  return i !== void 0 && (a.end = Object.assign({}, Ft(t.events, i)), e.add(i, 0, [["exit", a, t]]), a = void 0), a;
}
function Ao(e, t, n, r, i) {
  const a = [], o = Ft(t.events, n);
  i && (i.end = Object.assign({}, o), a.push(["exit", i, t])), r.end = Object.assign({}, o), a.push(["exit", r, t]), e.add(n + 1, 0, a);
}
function Ft(e, t) {
  const n = e[t], r = n[0] === "enter" ? "start" : "end";
  return n[1][r];
}
const zm = {
  name: "tasklistCheck",
  tokenize: $m
};
function Um() {
  return {
    text: {
      91: zm
    }
  };
}
function $m(e, t, n) {
  const r = this;
  return i;
  function i(l) {
    return (
      // Exit if there’s stuff before.
      r.previous !== null || // Exit if not in the first content that is the first child of a list
      // item.
      !r._gfmTasklistFirstContentOfListItem ? n(l) : (e.enter("taskListCheck"), e.enter("taskListCheckMarker"), e.consume(l), e.exit("taskListCheckMarker"), a)
    );
  }
  function a(l) {
    return xe(l) ? (e.enter("taskListCheckValueUnchecked"), e.consume(l), e.exit("taskListCheckValueUnchecked"), o) : l === 88 || l === 120 ? (e.enter("taskListCheckValueChecked"), e.consume(l), e.exit("taskListCheckValueChecked"), o) : n(l);
  }
  function o(l) {
    return l === 93 ? (e.enter("taskListCheckMarker"), e.consume(l), e.exit("taskListCheckMarker"), e.exit("taskListCheck"), s) : n(l);
  }
  function s(l) {
    return X(l) ? t(l) : ue(l) ? e.check({
      tokenize: Hm
    }, t, n)(l) : n(l);
  }
}
function Hm(e, t, n) {
  return pe(e, r, "whitespace");
  function r(i) {
    return i === null ? n(i) : t(i);
  }
}
function Gm(e) {
  return na([
    gm(),
    Sm(),
    Im(e),
    Pm(),
    Um()
  ]);
}
const Km = {};
function qm(e) {
  const t = (
    /** @type {Processor<Root>} */
    this
  ), n = e || Km, r = t.data(), i = r.micromarkExtensions || (r.micromarkExtensions = []), a = r.fromMarkdownExtensions || (r.fromMarkdownExtensions = []), o = r.toMarkdownExtensions || (r.toMarkdownExtensions = []);
  i.push(Gm(n)), a.push(um()), o.push(dm(n));
}
const Co = (
  // Note: overloads like this are needed to support optional generics.
  /**
   * @type {(
   *   (<Kind extends UnistParent, Check extends Test>(parent: Kind, index: Child<Kind> | number, test: Check) => Matches<Child<Kind>, Check> | undefined) &
   *   (<Kind extends UnistParent>(parent: Kind, index: Child<Kind> | number, test?: null | undefined) => Child<Kind> | undefined)
   * )}
   */
  /**
   * @param {UnistParent} parent
   * @param {UnistNode | number} index
   * @param {Test} [test]
   * @returns {UnistNode | undefined}
   */
  function(e, t, n) {
    const r = gn(n);
    if (!e || !e.type || !e.children)
      throw new Error("Expected parent node");
    if (typeof t == "number") {
      if (t < 0 || t === Number.POSITIVE_INFINITY)
        throw new Error("Expected positive finite number as index");
    } else if (t = e.children.indexOf(t), t < 0)
      throw new Error("Expected child node or index");
    for (; ++t < e.children.length; )
      if (r(e.children[t], t, e))
        return e.children[t];
  }
), Ot = (
  // Note: overloads in JSDoc can’t yet use different `@template`s.
  /**
   * @type {(
   *   (<Condition extends TestFunction>(test: Condition) => (element: unknown, index?: number | null | undefined, parent?: Parents | null | undefined, context?: unknown) => element is Element & Predicate<Condition, Element>) &
   *   (<Condition extends string>(test: Condition) => (element: unknown, index?: number | null | undefined, parent?: Parents | null | undefined, context?: unknown) => element is Element & {tagName: Condition}) &
   *   ((test?: null | undefined) => (element?: unknown, index?: number | null | undefined, parent?: Parents | null | undefined, context?: unknown) => element is Element) &
   *   ((test?: Test) => Check)
   * )}
   */
  /**
   * @param {Test | null | undefined} [test]
   * @returns {Check}
   */
  function(e) {
    if (e == null)
      return Ym;
    if (typeof e == "string")
      return Vm(e);
    if (typeof e == "object")
      return Wm(e);
    if (typeof e == "function")
      return pi(e);
    throw new Error("Expected function, string, or array as `test`");
  }
);
function Wm(e) {
  const t = [];
  let n = -1;
  for (; ++n < e.length; )
    t[n] = Ot(e[n]);
  return pi(r);
  function r(...i) {
    let a = -1;
    for (; ++a < t.length; )
      if (t[a].apply(this, i)) return !0;
    return !1;
  }
}
function Vm(e) {
  return pi(t);
  function t(n) {
    return n.tagName === e;
  }
}
function pi(e) {
  return t;
  function t(n, r, i) {
    return !!(jm(n) && e.call(
      this,
      n,
      typeof r == "number" ? r : void 0,
      i || void 0
    ));
  }
}
function Ym(e) {
  return !!(e && typeof e == "object" && "type" in e && e.type === "element" && "tagName" in e && typeof e.tagName == "string");
}
function jm(e) {
  return e !== null && typeof e == "object" && "type" in e && "tagName" in e;
}
const Ro = /\n/g, Oo = /[\t ]+/g, Ur = Ot("br"), Io = Ot(rh), Zm = Ot("p"), Mo = Ot("tr"), Xm = Ot([
  // List from: <https://html.spec.whatwg.org/multipage/rendering.html#hidden-elements>
  "datalist",
  "head",
  "noembed",
  "noframes",
  "noscript",
  // Act as if we support scripting.
  "rp",
  "script",
  "style",
  "template",
  "title",
  // Hidden attribute.
  nh,
  // From: <https://html.spec.whatwg.org/multipage/rendering.html#flow-content-3>
  ih
]), ls = Ot([
  "address",
  // Flow content
  "article",
  // Sections and headings
  "aside",
  // Sections and headings
  "blockquote",
  // Flow content
  "body",
  // Page
  "caption",
  // `table-caption`
  "center",
  // Flow content (legacy)
  "dd",
  // Lists
  "dialog",
  // Flow content
  "dir",
  // Lists (legacy)
  "dl",
  // Lists
  "dt",
  // Lists
  "div",
  // Flow content
  "figure",
  // Flow content
  "figcaption",
  // Flow content
  "footer",
  // Flow content
  "form,",
  // Flow content
  "h1",
  // Sections and headings
  "h2",
  // Sections and headings
  "h3",
  // Sections and headings
  "h4",
  // Sections and headings
  "h5",
  // Sections and headings
  "h6",
  // Sections and headings
  "header",
  // Flow content
  "hgroup",
  // Sections and headings
  "hr",
  // Flow content
  "html",
  // Page
  "legend",
  // Flow content
  "li",
  // Lists (as `display: list-item`)
  "listing",
  // Flow content (legacy)
  "main",
  // Flow content
  "menu",
  // Lists
  "nav",
  // Sections and headings
  "ol",
  // Lists
  "p",
  // Flow content
  "plaintext",
  // Flow content (legacy)
  "pre",
  // Flow content
  "section",
  // Sections and headings
  "ul",
  // Lists
  "xmp"
  // Flow content (legacy)
]);
function Qm(e, t) {
  const n = t || {}, r = "children" in e ? e.children : [], i = ls(e), a = ds(e, {
    whitespace: n.whitespace || "normal"
  }), o = [];
  (e.type === "text" || e.type === "comment") && o.push(
    ...us(e, {
      breakBefore: !0,
      breakAfter: !0
    })
  );
  let s = -1;
  for (; ++s < r.length; )
    o.push(
      ...cs(
        r[s],
        // @ts-expect-error: `tree` is a parent if we’re here.
        e,
        {
          whitespace: a,
          breakBefore: s ? void 0 : i,
          breakAfter: s < r.length - 1 ? Ur(r[s + 1]) : i
        }
      )
    );
  const l = [];
  let c;
  for (s = -1; ++s < o.length; ) {
    const u = o[s];
    typeof u == "number" ? c !== void 0 && u > c && (c = u) : u && (c !== void 0 && c > -1 && l.push(`
`.repeat(c) || " "), c = -1, l.push(u));
  }
  return l.join("");
}
function cs(e, t, n) {
  return e.type === "element" ? Jm(e, t, n) : e.type === "text" ? n.whitespace === "normal" ? us(e, n) : eh(e) : [];
}
function Jm(e, t, n) {
  const r = ds(e, n), i = e.children || [];
  let a = -1, o = [];
  if (Xm(e))
    return o;
  let s, l;
  for (Ur(e) || Mo(e) && // @ts-expect-error: something up with types of parents.
  Co(t, e, Mo) ? l = `
` : Zm(e) ? (s = 2, l = 2) : ls(e) && (s = 1, l = 1); ++a < i.length; )
    o = o.concat(
      cs(i[a], e, {
        whitespace: r,
        breakBefore: a ? void 0 : s,
        breakAfter: a < i.length - 1 ? Ur(i[a + 1]) : l
      })
    );
  return Io(e) && // @ts-expect-error: something up with types of parents.
  Co(t, e, Io) && o.push("	"), s && o.unshift(s), l && o.push(l), o;
}
function us(e, t) {
  const n = String(e.value), r = [], i = [];
  let a = 0;
  for (; a <= n.length; ) {
    Ro.lastIndex = a;
    const l = Ro.exec(n), c = l && "index" in l ? l.index : n.length;
    r.push(
      // Any sequence of collapsible spaces and tabs immediately preceding or
      // following a segment break is removed.
      th(
        // […] ignoring bidi formatting characters (characters with the
        // Bidi_Control property [UAX9]: ALM, LTR, RTL, LRE-RLO, LRI-PDI) as if
        // they were not there.
        n.slice(a, c).replace(/[\u061C\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, ""),
        a === 0 ? t.breakBefore : !0,
        c === n.length ? t.breakAfter : !0
      )
    ), a = c + 1;
  }
  let o = -1, s;
  for (; ++o < r.length; )
    r[o].charCodeAt(r[o].length - 1) === 8203 || o < r.length - 1 && r[o + 1].charCodeAt(0) === 8203 ? (i.push(r[o]), s = void 0) : r[o] ? (typeof s == "number" && i.push(s), i.push(r[o]), s = 0) : (o === 0 || o === r.length - 1) && i.push(0);
  return i;
}
function eh(e) {
  return [String(e.value)];
}
function th(e, t, n) {
  const r = [];
  let i = 0, a;
  for (; i < e.length; ) {
    Oo.lastIndex = i;
    const o = Oo.exec(e);
    a = o ? o.index : e.length, !i && !a && o && !t && r.push(""), i !== a && r.push(e.slice(i, a)), i = o ? a + o[0].length : a;
  }
  return i !== a && !n && r.push(""), r.join(" ");
}
function ds(e, t) {
  if (e.type === "element") {
    const n = e.properties || {};
    switch (e.tagName) {
      case "listing":
      case "plaintext":
      case "xmp":
        return "pre";
      case "nobr":
        return "nowrap";
      case "pre":
        return n.wrap ? "pre-wrap" : "pre";
      case "td":
      case "th":
        return n.noWrap ? "nowrap" : t.whitespace;
      case "textarea":
        return "pre-wrap";
    }
  }
  return t.whitespace;
}
function nh(e) {
  return !!(e.properties || {}).hidden;
}
function rh(e) {
  return e.tagName === "td" || e.tagName === "th";
}
function ih(e) {
  return e.tagName === "dialog" && !(e.properties || {}).open;
}
function oh(e) {
  const t = e.regex, n = e.COMMENT("//", "$", { contains: [{ begin: /\\\n/ }] }), r = "decltype\\(auto\\)", i = "[a-zA-Z_]\\w*::", o = "(?!struct)(" + r + "|" + t.optional(i) + "[a-zA-Z_]\\w*" + t.optional("<[^<>]+>") + ")", s = {
    className: "type",
    begin: "\\b[a-z\\d_]*_t\\b"
  }, c = {
    className: "string",
    variants: [
      {
        begin: '(u8?|U|L)?"',
        end: '"',
        illegal: "\\n",
        contains: [e.BACKSLASH_ESCAPE]
      },
      {
        begin: "(u8?|U|L)?'(" + "\\\\(x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4,8}|[0-7]{3}|\\S)" + "|.)",
        end: "'",
        illegal: "."
      },
      e.END_SAME_AS_BEGIN({
        begin: /(?:u8?|U|L)?R"([^()\\ ]{0,16})\(/,
        end: /\)([^()\\ ]{0,16})"/
      })
    ]
  }, u = {
    className: "number",
    variants: [
      // Floating-point literal.
      {
        begin: "[+-]?(?:(?:[0-9](?:'?[0-9])*\\.(?:[0-9](?:'?[0-9])*)?|\\.[0-9](?:'?[0-9])*)(?:[Ee][+-]?[0-9](?:'?[0-9])*)?|[0-9](?:'?[0-9])*[Ee][+-]?[0-9](?:'?[0-9])*|0[Xx](?:[0-9A-Fa-f](?:'?[0-9A-Fa-f])*(?:\\.(?:[0-9A-Fa-f](?:'?[0-9A-Fa-f])*)?)?|\\.[0-9A-Fa-f](?:'?[0-9A-Fa-f])*)[Pp][+-]?[0-9](?:'?[0-9])*)(?:[Ff](?:16|32|64|128)?|(BF|bf)16|[Ll]|)"
      },
      // Integer literal.
      {
        begin: "[+-]?\\b(?:0[Bb][01](?:'?[01])*|0[Xx][0-9A-Fa-f](?:'?[0-9A-Fa-f])*|0(?:'?[0-7])*|[1-9](?:'?[0-9])*)(?:[Uu](?:LL?|ll?)|[Uu][Zz]?|(?:LL?|ll?)[Uu]?|[Zz][Uu]|)"
        // Note: there are user-defined literal suffixes too, but perhaps having the custom suffix not part of the
        // literal highlight actually makes it stand out more.
      }
    ],
    relevance: 0
  }, d = {
    className: "meta",
    begin: /#\s*[a-z]+\b/,
    end: /$/,
    keywords: { keyword: "if else elif endif define undef warning error line pragma _Pragma ifdef ifndef include" },
    contains: [
      {
        begin: /\\\n/,
        relevance: 0
      },
      e.inherit(c, { className: "string" }),
      {
        className: "string",
        begin: /<.*?>/
      },
      n,
      e.C_BLOCK_COMMENT_MODE
    ]
  }, f = {
    className: "title",
    begin: t.optional(i) + e.IDENT_RE,
    relevance: 0
  }, p = t.optional(i) + e.IDENT_RE + "\\s*\\(", m = [
    "alignas",
    "alignof",
    "and",
    "and_eq",
    "asm",
    "atomic_cancel",
    "atomic_commit",
    "atomic_noexcept",
    "auto",
    "bitand",
    "bitor",
    "break",
    "case",
    "catch",
    "class",
    "co_await",
    "co_return",
    "co_yield",
    "compl",
    "concept",
    "const_cast|10",
    "consteval",
    "constexpr",
    "constinit",
    "continue",
    "decltype",
    "default",
    "delete",
    "do",
    "dynamic_cast|10",
    "else",
    "enum",
    "explicit",
    "export",
    "extern",
    "false",
    "final",
    "for",
    "friend",
    "goto",
    "if",
    "import",
    "inline",
    "module",
    "mutable",
    "namespace",
    "new",
    "noexcept",
    "not",
    "not_eq",
    "nullptr",
    "operator",
    "or",
    "or_eq",
    "override",
    "private",
    "protected",
    "public",
    "reflexpr",
    "register",
    "reinterpret_cast|10",
    "requires",
    "return",
    "sizeof",
    "static_assert",
    "static_cast|10",
    "struct",
    "switch",
    "synchronized",
    "template",
    "this",
    "thread_local",
    "throw",
    "transaction_safe",
    "transaction_safe_dynamic",
    "true",
    "try",
    "typedef",
    "typeid",
    "typename",
    "union",
    "using",
    "virtual",
    "volatile",
    "while",
    "xor",
    "xor_eq"
  ], h = [
    "bool",
    "char",
    "char16_t",
    "char32_t",
    "char8_t",
    "double",
    "float",
    "int",
    "long",
    "short",
    "void",
    "wchar_t",
    "unsigned",
    "signed",
    "const",
    "static"
  ], k = [
    "any",
    "auto_ptr",
    "barrier",
    "binary_semaphore",
    "bitset",
    "complex",
    "condition_variable",
    "condition_variable_any",
    "counting_semaphore",
    "deque",
    "false_type",
    "flat_map",
    "flat_set",
    "future",
    "imaginary",
    "initializer_list",
    "istringstream",
    "jthread",
    "latch",
    "lock_guard",
    "multimap",
    "multiset",
    "mutex",
    "optional",
    "ostringstream",
    "packaged_task",
    "pair",
    "promise",
    "priority_queue",
    "queue",
    "recursive_mutex",
    "recursive_timed_mutex",
    "scoped_lock",
    "set",
    "shared_future",
    "shared_lock",
    "shared_mutex",
    "shared_timed_mutex",
    "shared_ptr",
    "stack",
    "string_view",
    "stringstream",
    "timed_mutex",
    "thread",
    "true_type",
    "tuple",
    "unique_lock",
    "unique_ptr",
    "unordered_map",
    "unordered_multimap",
    "unordered_multiset",
    "unordered_set",
    "variant",
    "vector",
    "weak_ptr",
    "wstring",
    "wstring_view"
  ], y = [
    "abort",
    "abs",
    "acos",
    "apply",
    "as_const",
    "asin",
    "atan",
    "atan2",
    "calloc",
    "ceil",
    "cerr",
    "cin",
    "clog",
    "cos",
    "cosh",
    "cout",
    "declval",
    "endl",
    "exchange",
    "exit",
    "exp",
    "fabs",
    "floor",
    "fmod",
    "forward",
    "fprintf",
    "fputs",
    "free",
    "frexp",
    "fscanf",
    "future",
    "invoke",
    "isalnum",
    "isalpha",
    "iscntrl",
    "isdigit",
    "isgraph",
    "islower",
    "isprint",
    "ispunct",
    "isspace",
    "isupper",
    "isxdigit",
    "labs",
    "launder",
    "ldexp",
    "log",
    "log10",
    "make_pair",
    "make_shared",
    "make_shared_for_overwrite",
    "make_tuple",
    "make_unique",
    "malloc",
    "memchr",
    "memcmp",
    "memcpy",
    "memset",
    "modf",
    "move",
    "pow",
    "printf",
    "putchar",
    "puts",
    "realloc",
    "scanf",
    "sin",
    "sinh",
    "snprintf",
    "sprintf",
    "sqrt",
    "sscanf",
    "std",
    "stderr",
    "stdin",
    "stdout",
    "strcat",
    "strchr",
    "strcmp",
    "strcpy",
    "strcspn",
    "strlen",
    "strncat",
    "strncmp",
    "strncpy",
    "strpbrk",
    "strrchr",
    "strspn",
    "strstr",
    "swap",
    "tan",
    "tanh",
    "terminate",
    "to_underlying",
    "tolower",
    "toupper",
    "vfprintf",
    "visit",
    "vprintf",
    "vsprintf"
  ], N = {
    type: h,
    keyword: m,
    literal: [
      "NULL",
      "false",
      "nullopt",
      "nullptr",
      "true"
    ],
    built_in: ["_Pragma"],
    _type_hints: k
  }, A = {
    className: "function.dispatch",
    relevance: 0,
    keywords: {
      // Only for relevance, not highlighting.
      _hint: y
    },
    begin: t.concat(
      /\b/,
      /(?!decltype)/,
      /(?!if)/,
      /(?!for)/,
      /(?!switch)/,
      /(?!while)/,
      e.IDENT_RE,
      t.lookahead(/(<[^<>]+>|)\s*\(/)
    )
  }, _ = [
    A,
    d,
    s,
    n,
    e.C_BLOCK_COMMENT_MODE,
    u,
    c
  ], L = {
    // This mode covers expression context where we can't expect a function
    // definition and shouldn't highlight anything that looks like one:
    // `return some()`, `else if()`, `(x*sum(1, 2))`
    variants: [
      {
        begin: /=/,
        end: /;/
      },
      {
        begin: /\(/,
        end: /\)/
      },
      {
        beginKeywords: "new throw return else",
        end: /;/
      }
    ],
    keywords: N,
    contains: _.concat([
      {
        begin: /\(/,
        end: /\)/,
        keywords: N,
        contains: _.concat(["self"]),
        relevance: 0
      }
    ]),
    relevance: 0
  }, v = {
    className: "function",
    begin: "(" + o + "[\\*&\\s]+)+" + p,
    returnBegin: !0,
    end: /[{;=]/,
    excludeEnd: !0,
    keywords: N,
    illegal: /[^\w\s\*&:<>.]/,
    contains: [
      {
        // to prevent it from being confused as the function title
        begin: r,
        keywords: N,
        relevance: 0
      },
      {
        begin: p,
        returnBegin: !0,
        contains: [f],
        relevance: 0
      },
      // needed because we do not have look-behind on the below rule
      // to prevent it from grabbing the final : in a :: pair
      {
        begin: /::/,
        relevance: 0
      },
      // initializers
      {
        begin: /:/,
        endsWithParent: !0,
        contains: [
          c,
          u
        ]
      },
      // allow for multiple declarations, e.g.:
      // extern void f(int), g(char);
      {
        relevance: 0,
        match: /,/
      },
      {
        className: "params",
        begin: /\(/,
        end: /\)/,
        keywords: N,
        relevance: 0,
        contains: [
          n,
          e.C_BLOCK_COMMENT_MODE,
          c,
          u,
          s,
          // Count matching parentheses.
          {
            begin: /\(/,
            end: /\)/,
            keywords: N,
            relevance: 0,
            contains: [
              "self",
              n,
              e.C_BLOCK_COMMENT_MODE,
              c,
              u,
              s
            ]
          }
        ]
      },
      s,
      n,
      e.C_BLOCK_COMMENT_MODE,
      d
    ]
  };
  return {
    name: "C++",
    aliases: [
      "cc",
      "c++",
      "h++",
      "hpp",
      "hh",
      "hxx",
      "cxx"
    ],
    keywords: N,
    illegal: "</",
    classNameAliases: { "function.dispatch": "built_in" },
    contains: [].concat(
      L,
      v,
      A,
      _,
      [
        d,
        {
          // containers: ie, `vector <int> rooms (9);`
          begin: "\\b(deque|list|queue|priority_queue|pair|stack|vector|map|set|bitset|multiset|multimap|unordered_map|unordered_set|unordered_multiset|unordered_multimap|array|tuple|optional|variant|function|flat_map|flat_set)\\s*<(?!<)",
          end: ">",
          keywords: N,
          contains: [
            "self",
            s
          ]
        },
        {
          begin: e.IDENT_RE + "::",
          keywords: N
        },
        {
          match: [
            // extra complexity to deal with `enum class` and `enum struct`
            /\b(?:enum(?:\s+(?:class|struct))?|class|struct|union)/,
            /\s+/,
            /\w+/
          ],
          className: {
            1: "keyword",
            3: "title.class"
          }
        }
      ]
    )
  };
}
function ah(e) {
  const t = {
    type: [
      "boolean",
      "byte",
      "word",
      "String"
    ],
    built_in: [
      "KeyboardController",
      "MouseController",
      "SoftwareSerial",
      "EthernetServer",
      "EthernetClient",
      "LiquidCrystal",
      "RobotControl",
      "GSMVoiceCall",
      "EthernetUDP",
      "EsploraTFT",
      "HttpClient",
      "RobotMotor",
      "WiFiClient",
      "GSMScanner",
      "FileSystem",
      "Scheduler",
      "GSMServer",
      "YunClient",
      "YunServer",
      "IPAddress",
      "GSMClient",
      "GSMModem",
      "Keyboard",
      "Ethernet",
      "Console",
      "GSMBand",
      "Esplora",
      "Stepper",
      "Process",
      "WiFiUDP",
      "GSM_SMS",
      "Mailbox",
      "USBHost",
      "Firmata",
      "PImage",
      "Client",
      "Server",
      "GSMPIN",
      "FileIO",
      "Bridge",
      "Serial",
      "EEPROM",
      "Stream",
      "Mouse",
      "Audio",
      "Servo",
      "File",
      "Task",
      "GPRS",
      "WiFi",
      "Wire",
      "TFT",
      "GSM",
      "SPI",
      "SD"
    ],
    _hints: [
      "setup",
      "loop",
      "runShellCommandAsynchronously",
      "analogWriteResolution",
      "retrieveCallingNumber",
      "printFirmwareVersion",
      "analogReadResolution",
      "sendDigitalPortPair",
      "noListenOnLocalhost",
      "readJoystickButton",
      "setFirmwareVersion",
      "readJoystickSwitch",
      "scrollDisplayRight",
      "getVoiceCallStatus",
      "scrollDisplayLeft",
      "writeMicroseconds",
      "delayMicroseconds",
      "beginTransmission",
      "getSignalStrength",
      "runAsynchronously",
      "getAsynchronously",
      "listenOnLocalhost",
      "getCurrentCarrier",
      "readAccelerometer",
      "messageAvailable",
      "sendDigitalPorts",
      "lineFollowConfig",
      "countryNameWrite",
      "runShellCommand",
      "readStringUntil",
      "rewindDirectory",
      "readTemperature",
      "setClockDivider",
      "readLightSensor",
      "endTransmission",
      "analogReference",
      "detachInterrupt",
      "countryNameRead",
      "attachInterrupt",
      "encryptionType",
      "readBytesUntil",
      "robotNameWrite",
      "readMicrophone",
      "robotNameRead",
      "cityNameWrite",
      "userNameWrite",
      "readJoystickY",
      "readJoystickX",
      "mouseReleased",
      "openNextFile",
      "scanNetworks",
      "noInterrupts",
      "digitalWrite",
      "beginSpeaker",
      "mousePressed",
      "isActionDone",
      "mouseDragged",
      "displayLogos",
      "noAutoscroll",
      "addParameter",
      "remoteNumber",
      "getModifiers",
      "keyboardRead",
      "userNameRead",
      "waitContinue",
      "processInput",
      "parseCommand",
      "printVersion",
      "readNetworks",
      "writeMessage",
      "blinkVersion",
      "cityNameRead",
      "readMessage",
      "setDataMode",
      "parsePacket",
      "isListening",
      "setBitOrder",
      "beginPacket",
      "isDirectory",
      "motorsWrite",
      "drawCompass",
      "digitalRead",
      "clearScreen",
      "serialEvent",
      "rightToLeft",
      "setTextSize",
      "leftToRight",
      "requestFrom",
      "keyReleased",
      "compassRead",
      "analogWrite",
      "interrupts",
      "WiFiServer",
      "disconnect",
      "playMelody",
      "parseFloat",
      "autoscroll",
      "getPINUsed",
      "setPINUsed",
      "setTimeout",
      "sendAnalog",
      "readSlider",
      "analogRead",
      "beginWrite",
      "createChar",
      "motorsStop",
      "keyPressed",
      "tempoWrite",
      "readButton",
      "subnetMask",
      "debugPrint",
      "macAddress",
      "writeGreen",
      "randomSeed",
      "attachGPRS",
      "readString",
      "sendString",
      "remotePort",
      "releaseAll",
      "mouseMoved",
      "background",
      "getXChange",
      "getYChange",
      "answerCall",
      "getResult",
      "voiceCall",
      "endPacket",
      "constrain",
      "getSocket",
      "writeJSON",
      "getButton",
      "available",
      "connected",
      "findUntil",
      "readBytes",
      "exitValue",
      "readGreen",
      "writeBlue",
      "startLoop",
      "IPAddress",
      "isPressed",
      "sendSysex",
      "pauseMode",
      "gatewayIP",
      "setCursor",
      "getOemKey",
      "tuneWrite",
      "noDisplay",
      "loadImage",
      "switchPIN",
      "onRequest",
      "onReceive",
      "changePIN",
      "playFile",
      "noBuffer",
      "parseInt",
      "overflow",
      "checkPIN",
      "knobRead",
      "beginTFT",
      "bitClear",
      "updateIR",
      "bitWrite",
      "position",
      "writeRGB",
      "highByte",
      "writeRed",
      "setSpeed",
      "readBlue",
      "noStroke",
      "remoteIP",
      "transfer",
      "shutdown",
      "hangCall",
      "beginSMS",
      "endWrite",
      "attached",
      "maintain",
      "noCursor",
      "checkReg",
      "checkPUK",
      "shiftOut",
      "isValid",
      "shiftIn",
      "pulseIn",
      "connect",
      "println",
      "localIP",
      "pinMode",
      "getIMEI",
      "display",
      "noBlink",
      "process",
      "getBand",
      "running",
      "beginSD",
      "drawBMP",
      "lowByte",
      "setBand",
      "release",
      "bitRead",
      "prepare",
      "pointTo",
      "readRed",
      "setMode",
      "noFill",
      "remove",
      "listen",
      "stroke",
      "detach",
      "attach",
      "noTone",
      "exists",
      "buffer",
      "height",
      "bitSet",
      "circle",
      "config",
      "cursor",
      "random",
      "IRread",
      "setDNS",
      "endSMS",
      "getKey",
      "micros",
      "millis",
      "begin",
      "print",
      "write",
      "ready",
      "flush",
      "width",
      "isPIN",
      "blink",
      "clear",
      "press",
      "mkdir",
      "rmdir",
      "close",
      "point",
      "yield",
      "image",
      "BSSID",
      "click",
      "delay",
      "read",
      "text",
      "move",
      "peek",
      "beep",
      "rect",
      "line",
      "open",
      "seek",
      "fill",
      "size",
      "turn",
      "stop",
      "home",
      "find",
      "step",
      "tone",
      "sqrt",
      "RSSI",
      "SSID",
      "end",
      "bit",
      "tan",
      "cos",
      "sin",
      "pow",
      "map",
      "abs",
      "max",
      "min",
      "get",
      "run",
      "put"
    ],
    literal: [
      "DIGITAL_MESSAGE",
      "FIRMATA_STRING",
      "ANALOG_MESSAGE",
      "REPORT_DIGITAL",
      "REPORT_ANALOG",
      "INPUT_PULLUP",
      "SET_PIN_MODE",
      "INTERNAL2V56",
      "SYSTEM_RESET",
      "LED_BUILTIN",
      "INTERNAL1V1",
      "SYSEX_START",
      "INTERNAL",
      "EXTERNAL",
      "DEFAULT",
      "OUTPUT",
      "INPUT",
      "HIGH",
      "LOW"
    ]
  }, n = oh(e), r = (
    /** @type {Record<string,any>} */
    n.keywords
  );
  return r.type = [
    ...r.type,
    ...t.type
  ], r.literal = [
    ...r.literal,
    ...t.literal
  ], r.built_in = [
    ...r.built_in,
    ...t.built_in
  ], r._hints = t._hints, n.name = "Arduino", n.aliases = ["ino"], n.supersetOf = "cpp", n;
}
function $r(e) {
  const t = e.regex, n = {}, r = {
    begin: /\$\{/,
    end: /\}/,
    contains: [
      "self",
      {
        begin: /:-/,
        contains: [n]
      }
      // default values
    ]
  };
  Object.assign(n, {
    className: "variable",
    variants: [
      { begin: t.concat(
        /\$[\w\d#@][\w\d_]*/,
        // negative look-ahead tries to avoid matching patterns that are not
        // Perl at all like $ident$, @ident@, etc.
        "(?![\\w\\d])(?![$])"
      ) },
      r
    ]
  });
  const i = {
    className: "subst",
    begin: /\$\(/,
    end: /\)/,
    contains: [e.BACKSLASH_ESCAPE]
  }, a = e.inherit(
    e.COMMENT(),
    {
      match: [
        /(^|\s)/,
        /#.*$/
      ],
      scope: {
        2: "comment"
      }
    }
  ), o = {
    begin: /<<-?\s*(?=\w+)/,
    starts: { contains: [
      e.END_SAME_AS_BEGIN({
        begin: /(\w+)/,
        end: /(\w+)/,
        className: "string"
      })
    ] }
  }, s = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [
      e.BACKSLASH_ESCAPE,
      n,
      i
    ]
  };
  i.contains.push(s);
  const l = {
    match: /\\"/
  }, c = {
    className: "string",
    begin: /'/,
    end: /'/
  }, u = {
    match: /\\'/
  }, d = {
    begin: /\$?\(\(/,
    end: /\)\)/,
    contains: [
      {
        begin: /\d+#[0-9a-f]+/,
        className: "number"
      },
      e.NUMBER_MODE,
      n
    ]
  }, f = [
    "fish",
    "bash",
    "zsh",
    "sh",
    "csh",
    "ksh",
    "tcsh",
    "dash",
    "scsh"
  ], p = e.SHEBANG({
    binary: `(${f.join("|")})`,
    relevance: 10
  }), m = {
    className: "function",
    begin: /\w[\w\d_]*\s*\(\s*\)\s*\{/,
    returnBegin: !0,
    contains: [e.inherit(e.TITLE_MODE, { begin: /\w[\w\d_]*/ })],
    relevance: 0
  }, h = [
    "if",
    "then",
    "else",
    "elif",
    "fi",
    "time",
    "for",
    "while",
    "until",
    "in",
    "do",
    "done",
    "case",
    "esac",
    "coproc",
    "function",
    "select"
  ], k = [
    "true",
    "false"
  ], y = { match: /(\/[a-z._-]+)+/ }, S = [
    "break",
    "cd",
    "continue",
    "eval",
    "exec",
    "exit",
    "export",
    "getopts",
    "hash",
    "pwd",
    "readonly",
    "return",
    "shift",
    "test",
    "times",
    "trap",
    "umask",
    "unset"
  ], w = [
    "alias",
    "bind",
    "builtin",
    "caller",
    "command",
    "declare",
    "echo",
    "enable",
    "help",
    "let",
    "local",
    "logout",
    "mapfile",
    "printf",
    "read",
    "readarray",
    "source",
    "sudo",
    "type",
    "typeset",
    "ulimit",
    "unalias"
  ], N = [
    "autoload",
    "bg",
    "bindkey",
    "bye",
    "cap",
    "chdir",
    "clone",
    "comparguments",
    "compcall",
    "compctl",
    "compdescribe",
    "compfiles",
    "compgroups",
    "compquote",
    "comptags",
    "comptry",
    "compvalues",
    "dirs",
    "disable",
    "disown",
    "echotc",
    "echoti",
    "emulate",
    "fc",
    "fg",
    "float",
    "functions",
    "getcap",
    "getln",
    "history",
    "integer",
    "jobs",
    "kill",
    "limit",
    "log",
    "noglob",
    "popd",
    "print",
    "pushd",
    "pushln",
    "rehash",
    "sched",
    "setcap",
    "setopt",
    "stat",
    "suspend",
    "ttyctl",
    "unfunction",
    "unhash",
    "unlimit",
    "unsetopt",
    "vared",
    "wait",
    "whence",
    "where",
    "which",
    "zcompile",
    "zformat",
    "zftp",
    "zle",
    "zmodload",
    "zparseopts",
    "zprof",
    "zpty",
    "zregexparse",
    "zsocket",
    "zstyle",
    "ztcp"
  ], A = [
    "chcon",
    "chgrp",
    "chown",
    "chmod",
    "cp",
    "dd",
    "df",
    "dir",
    "dircolors",
    "ln",
    "ls",
    "mkdir",
    "mkfifo",
    "mknod",
    "mktemp",
    "mv",
    "realpath",
    "rm",
    "rmdir",
    "shred",
    "sync",
    "touch",
    "truncate",
    "vdir",
    "b2sum",
    "base32",
    "base64",
    "cat",
    "cksum",
    "comm",
    "csplit",
    "cut",
    "expand",
    "fmt",
    "fold",
    "head",
    "join",
    "md5sum",
    "nl",
    "numfmt",
    "od",
    "paste",
    "ptx",
    "pr",
    "sha1sum",
    "sha224sum",
    "sha256sum",
    "sha384sum",
    "sha512sum",
    "shuf",
    "sort",
    "split",
    "sum",
    "tac",
    "tail",
    "tr",
    "tsort",
    "unexpand",
    "uniq",
    "wc",
    "arch",
    "basename",
    "chroot",
    "date",
    "dirname",
    "du",
    "echo",
    "env",
    "expr",
    "factor",
    // "false", // keyword literal already
    "groups",
    "hostid",
    "id",
    "link",
    "logname",
    "nice",
    "nohup",
    "nproc",
    "pathchk",
    "pinky",
    "printenv",
    "printf",
    "pwd",
    "readlink",
    "runcon",
    "seq",
    "sleep",
    "stat",
    "stdbuf",
    "stty",
    "tee",
    "test",
    "timeout",
    // "true", // keyword literal already
    "tty",
    "uname",
    "unlink",
    "uptime",
    "users",
    "who",
    "whoami",
    "yes"
  ];
  return {
    name: "Bash",
    aliases: [
      "sh",
      "zsh"
    ],
    keywords: {
      $pattern: /\b[a-z][a-z0-9._-]+\b/,
      keyword: h,
      literal: k,
      built_in: [
        ...S,
        ...w,
        // Shell modifiers
        "set",
        "shopt",
        ...N,
        ...A
      ]
    },
    contains: [
      p,
      // to catch known shells and boost relevancy
      e.SHEBANG(),
      // to catch unknown shells but still highlight the shebang
      m,
      d,
      a,
      o,
      y,
      s,
      l,
      c,
      u,
      n
    ]
  };
}
function sh(e) {
  const t = e.regex, n = e.COMMENT("//", "$", { contains: [{ begin: /\\\n/ }] }), r = "decltype\\(auto\\)", i = "[a-zA-Z_]\\w*::", o = "(" + r + "|" + t.optional(i) + "[a-zA-Z_]\\w*" + t.optional("<[^<>]+>") + ")", s = {
    className: "type",
    variants: [
      { begin: "\\b[a-z\\d_]*_t\\b" },
      { match: /\batomic_[a-z]{3,6}\b/ }
    ]
  }, c = {
    className: "string",
    variants: [
      {
        begin: '(u8?|U|L)?"',
        end: '"',
        illegal: "\\n",
        contains: [e.BACKSLASH_ESCAPE]
      },
      {
        begin: "(u8?|U|L)?'(" + "\\\\(x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4,8}|[0-7]{3}|\\S)" + "|.)",
        end: "'",
        illegal: "."
      },
      e.END_SAME_AS_BEGIN({
        begin: /(?:u8?|U|L)?R"([^()\\ ]{0,16})\(/,
        end: /\)([^()\\ ]{0,16})"/
      })
    ]
  }, u = {
    className: "number",
    variants: [
      { match: /\b(0b[01']+)/ },
      { match: /(-?)\b([\d']+(\.[\d']*)?|\.[\d']+)((ll|LL|l|L)(u|U)?|(u|U)(ll|LL|l|L)?|f|F|b|B)/ },
      { match: /(-?)\b(0[xX][a-fA-F0-9]+(?:'[a-fA-F0-9]+)*(?:\.[a-fA-F0-9]*(?:'[a-fA-F0-9]*)*)?(?:[pP][-+]?[0-9]+)?(l|L)?(u|U)?)/ },
      { match: /(-?)\b\d+(?:'\d+)*(?:\.\d*(?:'\d*)*)?(?:[eE][-+]?\d+)?/ }
    ],
    relevance: 0
  }, d = {
    className: "meta",
    begin: /#\s*[a-z]+\b/,
    end: /$/,
    keywords: { keyword: "if else elif endif define undef warning error line pragma _Pragma ifdef ifndef elifdef elifndef include" },
    contains: [
      {
        begin: /\\\n/,
        relevance: 0
      },
      e.inherit(c, { className: "string" }),
      {
        className: "string",
        begin: /<.*?>/
      },
      n,
      e.C_BLOCK_COMMENT_MODE
    ]
  }, f = {
    className: "title",
    begin: t.optional(i) + e.IDENT_RE,
    relevance: 0
  }, p = t.optional(i) + e.IDENT_RE + "\\s*\\(", k = {
    keyword: [
      "asm",
      "auto",
      "break",
      "case",
      "continue",
      "default",
      "do",
      "else",
      "enum",
      "extern",
      "for",
      "fortran",
      "goto",
      "if",
      "inline",
      "register",
      "restrict",
      "return",
      "sizeof",
      "typeof",
      "typeof_unqual",
      "struct",
      "switch",
      "typedef",
      "union",
      "volatile",
      "while",
      "_Alignas",
      "_Alignof",
      "_Atomic",
      "_Generic",
      "_Noreturn",
      "_Static_assert",
      "_Thread_local",
      // aliases
      "alignas",
      "alignof",
      "noreturn",
      "static_assert",
      "thread_local",
      // not a C keyword but is, for all intents and purposes, treated exactly like one.
      "_Pragma"
    ],
    type: [
      "float",
      "double",
      "signed",
      "unsigned",
      "int",
      "short",
      "long",
      "char",
      "void",
      "_Bool",
      "_BitInt",
      "_Complex",
      "_Imaginary",
      "_Decimal32",
      "_Decimal64",
      "_Decimal96",
      "_Decimal128",
      "_Decimal64x",
      "_Decimal128x",
      "_Float16",
      "_Float32",
      "_Float64",
      "_Float128",
      "_Float32x",
      "_Float64x",
      "_Float128x",
      // modifiers
      "const",
      "static",
      "constexpr",
      // aliases
      "complex",
      "bool",
      "imaginary"
    ],
    literal: "true false NULL",
    // TODO: apply hinting work similar to what was done in cpp.js
    built_in: "std string wstring cin cout cerr clog stdin stdout stderr stringstream istringstream ostringstream auto_ptr deque list queue stack vector map set pair bitset multiset multimap unordered_set unordered_map unordered_multiset unordered_multimap priority_queue make_pair array shared_ptr abort terminate abs acos asin atan2 atan calloc ceil cosh cos exit exp fabs floor fmod fprintf fputs free frexp fscanf future isalnum isalpha iscntrl isdigit isgraph islower isprint ispunct isspace isupper isxdigit tolower toupper labs ldexp log10 log malloc realloc memchr memcmp memcpy memset modf pow printf putchar puts scanf sinh sin snprintf sprintf sqrt sscanf strcat strchr strcmp strcpy strcspn strlen strncat strncmp strncpy strpbrk strrchr strspn strstr tanh tan vfprintf vprintf vsprintf endl initializer_list unique_ptr"
  }, y = [
    d,
    s,
    n,
    e.C_BLOCK_COMMENT_MODE,
    u,
    c
  ], S = {
    // This mode covers expression context where we can't expect a function
    // definition and shouldn't highlight anything that looks like one:
    // `return some()`, `else if()`, `(x*sum(1, 2))`
    variants: [
      {
        begin: /=/,
        end: /;/
      },
      {
        begin: /\(/,
        end: /\)/
      },
      {
        beginKeywords: "new throw return else",
        end: /;/
      }
    ],
    keywords: k,
    contains: y.concat([
      {
        begin: /\(/,
        end: /\)/,
        keywords: k,
        contains: y.concat(["self"]),
        relevance: 0
      }
    ]),
    relevance: 0
  }, w = {
    begin: "(" + o + "[\\*&\\s]+)+" + p,
    returnBegin: !0,
    end: /[{;=]/,
    excludeEnd: !0,
    keywords: k,
    illegal: /[^\w\s\*&:<>.]/,
    contains: [
      {
        // to prevent it from being confused as the function title
        begin: r,
        keywords: k,
        relevance: 0
      },
      {
        begin: p,
        returnBegin: !0,
        contains: [e.inherit(f, { className: "title.function" })],
        relevance: 0
      },
      // allow for multiple declarations, e.g.:
      // extern void f(int), g(char);
      {
        relevance: 0,
        match: /,/
      },
      {
        className: "params",
        begin: /\(/,
        end: /\)/,
        keywords: k,
        relevance: 0,
        contains: [
          n,
          e.C_BLOCK_COMMENT_MODE,
          c,
          u,
          s,
          // Count matching parentheses.
          {
            begin: /\(/,
            end: /\)/,
            keywords: k,
            relevance: 0,
            contains: [
              "self",
              n,
              e.C_BLOCK_COMMENT_MODE,
              c,
              u,
              s
            ]
          }
        ]
      },
      s,
      n,
      e.C_BLOCK_COMMENT_MODE,
      d
    ]
  };
  return {
    name: "C",
    aliases: ["h"],
    keywords: k,
    // Until differentiations are added between `c` and `cpp`, `c` will
    // not be auto-detected to avoid auto-detect conflicts between C and C++
    disableAutodetect: !0,
    illegal: "</",
    contains: [].concat(
      S,
      w,
      y,
      [
        d,
        {
          begin: e.IDENT_RE + "::",
          keywords: k
        },
        {
          className: "class",
          beginKeywords: "enum class struct union",
          end: /[{;:<>=]/,
          contains: [
            { beginKeywords: "final class struct" },
            e.TITLE_MODE
          ]
        }
      ]
    ),
    exports: {
      preprocessor: d,
      strings: c,
      keywords: k
    }
  };
}
function lh(e) {
  const t = e.regex, n = e.COMMENT("//", "$", { contains: [{ begin: /\\\n/ }] }), r = "decltype\\(auto\\)", i = "[a-zA-Z_]\\w*::", o = "(?!struct)(" + r + "|" + t.optional(i) + "[a-zA-Z_]\\w*" + t.optional("<[^<>]+>") + ")", s = {
    className: "type",
    begin: "\\b[a-z\\d_]*_t\\b"
  }, c = {
    className: "string",
    variants: [
      {
        begin: '(u8?|U|L)?"',
        end: '"',
        illegal: "\\n",
        contains: [e.BACKSLASH_ESCAPE]
      },
      {
        begin: "(u8?|U|L)?'(" + "\\\\(x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4,8}|[0-7]{3}|\\S)" + "|.)",
        end: "'",
        illegal: "."
      },
      e.END_SAME_AS_BEGIN({
        begin: /(?:u8?|U|L)?R"([^()\\ ]{0,16})\(/,
        end: /\)([^()\\ ]{0,16})"/
      })
    ]
  }, u = {
    className: "number",
    variants: [
      // Floating-point literal.
      {
        begin: "[+-]?(?:(?:[0-9](?:'?[0-9])*\\.(?:[0-9](?:'?[0-9])*)?|\\.[0-9](?:'?[0-9])*)(?:[Ee][+-]?[0-9](?:'?[0-9])*)?|[0-9](?:'?[0-9])*[Ee][+-]?[0-9](?:'?[0-9])*|0[Xx](?:[0-9A-Fa-f](?:'?[0-9A-Fa-f])*(?:\\.(?:[0-9A-Fa-f](?:'?[0-9A-Fa-f])*)?)?|\\.[0-9A-Fa-f](?:'?[0-9A-Fa-f])*)[Pp][+-]?[0-9](?:'?[0-9])*)(?:[Ff](?:16|32|64|128)?|(BF|bf)16|[Ll]|)"
      },
      // Integer literal.
      {
        begin: "[+-]?\\b(?:0[Bb][01](?:'?[01])*|0[Xx][0-9A-Fa-f](?:'?[0-9A-Fa-f])*|0(?:'?[0-7])*|[1-9](?:'?[0-9])*)(?:[Uu](?:LL?|ll?)|[Uu][Zz]?|(?:LL?|ll?)[Uu]?|[Zz][Uu]|)"
        // Note: there are user-defined literal suffixes too, but perhaps having the custom suffix not part of the
        // literal highlight actually makes it stand out more.
      }
    ],
    relevance: 0
  }, d = {
    className: "meta",
    begin: /#\s*[a-z]+\b/,
    end: /$/,
    keywords: { keyword: "if else elif endif define undef warning error line pragma _Pragma ifdef ifndef include" },
    contains: [
      {
        begin: /\\\n/,
        relevance: 0
      },
      e.inherit(c, { className: "string" }),
      {
        className: "string",
        begin: /<.*?>/
      },
      n,
      e.C_BLOCK_COMMENT_MODE
    ]
  }, f = {
    className: "title",
    begin: t.optional(i) + e.IDENT_RE,
    relevance: 0
  }, p = t.optional(i) + e.IDENT_RE + "\\s*\\(", m = [
    "alignas",
    "alignof",
    "and",
    "and_eq",
    "asm",
    "atomic_cancel",
    "atomic_commit",
    "atomic_noexcept",
    "auto",
    "bitand",
    "bitor",
    "break",
    "case",
    "catch",
    "class",
    "co_await",
    "co_return",
    "co_yield",
    "compl",
    "concept",
    "const_cast|10",
    "consteval",
    "constexpr",
    "constinit",
    "continue",
    "decltype",
    "default",
    "delete",
    "do",
    "dynamic_cast|10",
    "else",
    "enum",
    "explicit",
    "export",
    "extern",
    "false",
    "final",
    "for",
    "friend",
    "goto",
    "if",
    "import",
    "inline",
    "module",
    "mutable",
    "namespace",
    "new",
    "noexcept",
    "not",
    "not_eq",
    "nullptr",
    "operator",
    "or",
    "or_eq",
    "override",
    "private",
    "protected",
    "public",
    "reflexpr",
    "register",
    "reinterpret_cast|10",
    "requires",
    "return",
    "sizeof",
    "static_assert",
    "static_cast|10",
    "struct",
    "switch",
    "synchronized",
    "template",
    "this",
    "thread_local",
    "throw",
    "transaction_safe",
    "transaction_safe_dynamic",
    "true",
    "try",
    "typedef",
    "typeid",
    "typename",
    "union",
    "using",
    "virtual",
    "volatile",
    "while",
    "xor",
    "xor_eq"
  ], h = [
    "bool",
    "char",
    "char16_t",
    "char32_t",
    "char8_t",
    "double",
    "float",
    "int",
    "long",
    "short",
    "void",
    "wchar_t",
    "unsigned",
    "signed",
    "const",
    "static"
  ], k = [
    "any",
    "auto_ptr",
    "barrier",
    "binary_semaphore",
    "bitset",
    "complex",
    "condition_variable",
    "condition_variable_any",
    "counting_semaphore",
    "deque",
    "false_type",
    "flat_map",
    "flat_set",
    "future",
    "imaginary",
    "initializer_list",
    "istringstream",
    "jthread",
    "latch",
    "lock_guard",
    "multimap",
    "multiset",
    "mutex",
    "optional",
    "ostringstream",
    "packaged_task",
    "pair",
    "promise",
    "priority_queue",
    "queue",
    "recursive_mutex",
    "recursive_timed_mutex",
    "scoped_lock",
    "set",
    "shared_future",
    "shared_lock",
    "shared_mutex",
    "shared_timed_mutex",
    "shared_ptr",
    "stack",
    "string_view",
    "stringstream",
    "timed_mutex",
    "thread",
    "true_type",
    "tuple",
    "unique_lock",
    "unique_ptr",
    "unordered_map",
    "unordered_multimap",
    "unordered_multiset",
    "unordered_set",
    "variant",
    "vector",
    "weak_ptr",
    "wstring",
    "wstring_view"
  ], y = [
    "abort",
    "abs",
    "acos",
    "apply",
    "as_const",
    "asin",
    "atan",
    "atan2",
    "calloc",
    "ceil",
    "cerr",
    "cin",
    "clog",
    "cos",
    "cosh",
    "cout",
    "declval",
    "endl",
    "exchange",
    "exit",
    "exp",
    "fabs",
    "floor",
    "fmod",
    "forward",
    "fprintf",
    "fputs",
    "free",
    "frexp",
    "fscanf",
    "future",
    "invoke",
    "isalnum",
    "isalpha",
    "iscntrl",
    "isdigit",
    "isgraph",
    "islower",
    "isprint",
    "ispunct",
    "isspace",
    "isupper",
    "isxdigit",
    "labs",
    "launder",
    "ldexp",
    "log",
    "log10",
    "make_pair",
    "make_shared",
    "make_shared_for_overwrite",
    "make_tuple",
    "make_unique",
    "malloc",
    "memchr",
    "memcmp",
    "memcpy",
    "memset",
    "modf",
    "move",
    "pow",
    "printf",
    "putchar",
    "puts",
    "realloc",
    "scanf",
    "sin",
    "sinh",
    "snprintf",
    "sprintf",
    "sqrt",
    "sscanf",
    "std",
    "stderr",
    "stdin",
    "stdout",
    "strcat",
    "strchr",
    "strcmp",
    "strcpy",
    "strcspn",
    "strlen",
    "strncat",
    "strncmp",
    "strncpy",
    "strpbrk",
    "strrchr",
    "strspn",
    "strstr",
    "swap",
    "tan",
    "tanh",
    "terminate",
    "to_underlying",
    "tolower",
    "toupper",
    "vfprintf",
    "visit",
    "vprintf",
    "vsprintf"
  ], N = {
    type: h,
    keyword: m,
    literal: [
      "NULL",
      "false",
      "nullopt",
      "nullptr",
      "true"
    ],
    built_in: ["_Pragma"],
    _type_hints: k
  }, A = {
    className: "function.dispatch",
    relevance: 0,
    keywords: {
      // Only for relevance, not highlighting.
      _hint: y
    },
    begin: t.concat(
      /\b/,
      /(?!decltype)/,
      /(?!if)/,
      /(?!for)/,
      /(?!switch)/,
      /(?!while)/,
      e.IDENT_RE,
      t.lookahead(/(<[^<>]+>|)\s*\(/)
    )
  }, _ = [
    A,
    d,
    s,
    n,
    e.C_BLOCK_COMMENT_MODE,
    u,
    c
  ], L = {
    // This mode covers expression context where we can't expect a function
    // definition and shouldn't highlight anything that looks like one:
    // `return some()`, `else if()`, `(x*sum(1, 2))`
    variants: [
      {
        begin: /=/,
        end: /;/
      },
      {
        begin: /\(/,
        end: /\)/
      },
      {
        beginKeywords: "new throw return else",
        end: /;/
      }
    ],
    keywords: N,
    contains: _.concat([
      {
        begin: /\(/,
        end: /\)/,
        keywords: N,
        contains: _.concat(["self"]),
        relevance: 0
      }
    ]),
    relevance: 0
  }, v = {
    className: "function",
    begin: "(" + o + "[\\*&\\s]+)+" + p,
    returnBegin: !0,
    end: /[{;=]/,
    excludeEnd: !0,
    keywords: N,
    illegal: /[^\w\s\*&:<>.]/,
    contains: [
      {
        // to prevent it from being confused as the function title
        begin: r,
        keywords: N,
        relevance: 0
      },
      {
        begin: p,
        returnBegin: !0,
        contains: [f],
        relevance: 0
      },
      // needed because we do not have look-behind on the below rule
      // to prevent it from grabbing the final : in a :: pair
      {
        begin: /::/,
        relevance: 0
      },
      // initializers
      {
        begin: /:/,
        endsWithParent: !0,
        contains: [
          c,
          u
        ]
      },
      // allow for multiple declarations, e.g.:
      // extern void f(int), g(char);
      {
        relevance: 0,
        match: /,/
      },
      {
        className: "params",
        begin: /\(/,
        end: /\)/,
        keywords: N,
        relevance: 0,
        contains: [
          n,
          e.C_BLOCK_COMMENT_MODE,
          c,
          u,
          s,
          // Count matching parentheses.
          {
            begin: /\(/,
            end: /\)/,
            keywords: N,
            relevance: 0,
            contains: [
              "self",
              n,
              e.C_BLOCK_COMMENT_MODE,
              c,
              u,
              s
            ]
          }
        ]
      },
      s,
      n,
      e.C_BLOCK_COMMENT_MODE,
      d
    ]
  };
  return {
    name: "C++",
    aliases: [
      "cc",
      "c++",
      "h++",
      "hpp",
      "hh",
      "hxx",
      "cxx"
    ],
    keywords: N,
    illegal: "</",
    classNameAliases: { "function.dispatch": "built_in" },
    contains: [].concat(
      L,
      v,
      A,
      _,
      [
        d,
        {
          // containers: ie, `vector <int> rooms (9);`
          begin: "\\b(deque|list|queue|priority_queue|pair|stack|vector|map|set|bitset|multiset|multimap|unordered_map|unordered_set|unordered_multiset|unordered_multimap|array|tuple|optional|variant|function|flat_map|flat_set)\\s*<(?!<)",
          end: ">",
          keywords: N,
          contains: [
            "self",
            s
          ]
        },
        {
          begin: e.IDENT_RE + "::",
          keywords: N
        },
        {
          match: [
            // extra complexity to deal with `enum class` and `enum struct`
            /\b(?:enum(?:\s+(?:class|struct))?|class|struct|union)/,
            /\s+/,
            /\w+/
          ],
          className: {
            1: "keyword",
            3: "title.class"
          }
        }
      ]
    )
  };
}
function ch(e) {
  const t = [
    "bool",
    "byte",
    "char",
    "decimal",
    "delegate",
    "double",
    "dynamic",
    "enum",
    "float",
    "int",
    "long",
    "nint",
    "nuint",
    "object",
    "sbyte",
    "short",
    "string",
    "ulong",
    "uint",
    "ushort"
  ], n = [
    "public",
    "private",
    "protected",
    "static",
    "internal",
    "protected",
    "abstract",
    "async",
    "extern",
    "override",
    "unsafe",
    "virtual",
    "new",
    "sealed",
    "partial"
  ], r = [
    "default",
    "false",
    "null",
    "true"
  ], i = [
    "abstract",
    "as",
    "base",
    "break",
    "case",
    "catch",
    "class",
    "const",
    "continue",
    "do",
    "else",
    "event",
    "explicit",
    "extern",
    "finally",
    "fixed",
    "for",
    "foreach",
    "goto",
    "if",
    "implicit",
    "in",
    "interface",
    "internal",
    "is",
    "lock",
    "namespace",
    "new",
    "operator",
    "out",
    "override",
    "params",
    "private",
    "protected",
    "public",
    "readonly",
    "record",
    "ref",
    "return",
    "scoped",
    "sealed",
    "sizeof",
    "stackalloc",
    "static",
    "struct",
    "switch",
    "this",
    "throw",
    "try",
    "typeof",
    "unchecked",
    "unsafe",
    "using",
    "virtual",
    "void",
    "volatile",
    "while"
  ], a = [
    "add",
    "alias",
    "and",
    "ascending",
    "args",
    "async",
    "await",
    "by",
    "descending",
    "dynamic",
    "equals",
    "file",
    "from",
    "get",
    "global",
    "group",
    "init",
    "into",
    "join",
    "let",
    "nameof",
    "not",
    "notnull",
    "on",
    "or",
    "orderby",
    "partial",
    "record",
    "remove",
    "required",
    "scoped",
    "select",
    "set",
    "unmanaged",
    "value|0",
    "var",
    "when",
    "where",
    "with",
    "yield"
  ], o = {
    keyword: i.concat(a),
    built_in: t,
    literal: r
  }, s = e.inherit(e.TITLE_MODE, { begin: "[a-zA-Z](\\.?\\w)*" }), l = {
    className: "number",
    variants: [
      { begin: "\\b(0b[01']+)" },
      { begin: "(-?)\\b([\\d']+(\\.[\\d']*)?|\\.[\\d']+)(u|U|l|L|ul|UL|f|F|b|B)" },
      { begin: "(-?)(\\b0[xX][a-fA-F0-9']+|(\\b[\\d']+(\\.[\\d']*)?|\\.[\\d']+)([eE][-+]?[\\d']+)?)" }
    ],
    relevance: 0
  }, c = {
    className: "string",
    begin: /"""("*)(?!")(.|\n)*?"""\1/,
    relevance: 1
  }, u = {
    className: "string",
    begin: '@"',
    end: '"',
    contains: [{ begin: '""' }]
  }, d = e.inherit(u, { illegal: /\n/ }), f = {
    className: "subst",
    begin: /\{/,
    end: /\}/,
    keywords: o
  }, p = e.inherit(f, { illegal: /\n/ }), m = {
    className: "string",
    begin: /\$"/,
    end: '"',
    illegal: /\n/,
    contains: [
      { begin: /\{\{/ },
      { begin: /\}\}/ },
      e.BACKSLASH_ESCAPE,
      p
    ]
  }, h = {
    className: "string",
    begin: /\$@"/,
    end: '"',
    contains: [
      { begin: /\{\{/ },
      { begin: /\}\}/ },
      { begin: '""' },
      f
    ]
  }, k = e.inherit(h, {
    illegal: /\n/,
    contains: [
      { begin: /\{\{/ },
      { begin: /\}\}/ },
      { begin: '""' },
      p
    ]
  });
  f.contains = [
    h,
    m,
    u,
    e.APOS_STRING_MODE,
    e.QUOTE_STRING_MODE,
    l,
    e.C_BLOCK_COMMENT_MODE
  ], p.contains = [
    k,
    m,
    d,
    e.APOS_STRING_MODE,
    e.QUOTE_STRING_MODE,
    l,
    e.inherit(e.C_BLOCK_COMMENT_MODE, { illegal: /\n/ })
  ];
  const y = { variants: [
    c,
    h,
    m,
    u,
    e.APOS_STRING_MODE,
    e.QUOTE_STRING_MODE
  ] }, S = {
    begin: "<",
    end: ">",
    contains: [
      { beginKeywords: "in out" },
      s
    ]
  }, w = e.IDENT_RE + "(<" + e.IDENT_RE + "(\\s*,\\s*" + e.IDENT_RE + ")*>)?(\\[\\])?", N = {
    // prevents expressions like `@class` from incorrect flagging
    // `class` as a keyword
    begin: "@" + e.IDENT_RE,
    relevance: 0
  };
  return {
    name: "C#",
    aliases: [
      "cs",
      "c#"
    ],
    keywords: o,
    illegal: /::/,
    contains: [
      e.COMMENT(
        "///",
        "$",
        {
          returnBegin: !0,
          contains: [
            {
              className: "doctag",
              variants: [
                {
                  begin: "///",
                  relevance: 0
                },
                { begin: "<!--|-->" },
                {
                  begin: "</?",
                  end: ">"
                }
              ]
            }
          ]
        }
      ),
      e.C_LINE_COMMENT_MODE,
      e.C_BLOCK_COMMENT_MODE,
      {
        className: "meta",
        begin: "#",
        end: "$",
        keywords: { keyword: "if else elif endif define undef warning error line region endregion pragma checksum" }
      },
      y,
      l,
      {
        beginKeywords: "class interface",
        relevance: 0,
        end: /[{;=]/,
        illegal: /[^\s:,]/,
        contains: [
          { beginKeywords: "where class" },
          s,
          S,
          e.C_LINE_COMMENT_MODE,
          e.C_BLOCK_COMMENT_MODE
        ]
      },
      {
        beginKeywords: "namespace",
        relevance: 0,
        end: /[{;=]/,
        illegal: /[^\s:]/,
        contains: [
          s,
          e.C_LINE_COMMENT_MODE,
          e.C_BLOCK_COMMENT_MODE
        ]
      },
      {
        beginKeywords: "record",
        relevance: 0,
        end: /[{;=]/,
        illegal: /[^\s:]/,
        contains: [
          s,
          S,
          e.C_LINE_COMMENT_MODE,
          e.C_BLOCK_COMMENT_MODE
        ]
      },
      {
        // [Attributes("")]
        className: "meta",
        begin: "^\\s*\\[(?=[\\w])",
        excludeBegin: !0,
        end: "\\]",
        excludeEnd: !0,
        contains: [
          {
            className: "string",
            begin: /"/,
            end: /"/
          }
        ]
      },
      {
        // Expression keywords prevent 'keyword Name(...)' from being
        // recognized as a function definition
        beginKeywords: "new return throw await else",
        relevance: 0
      },
      {
        className: "function",
        begin: "(" + w + "\\s+)+" + e.IDENT_RE + "\\s*(<[^=]+>\\s*)?\\(",
        returnBegin: !0,
        end: /\s*[{;=]/,
        excludeEnd: !0,
        keywords: o,
        contains: [
          // prevents these from being highlighted `title`
          {
            beginKeywords: n.join(" "),
            relevance: 0
          },
          {
            begin: e.IDENT_RE + "\\s*(<[^=]+>\\s*)?\\(",
            returnBegin: !0,
            contains: [
              e.TITLE_MODE,
              S
            ],
            relevance: 0
          },
          { match: /\(\)/ },
          {
            className: "params",
            begin: /\(/,
            end: /\)/,
            excludeBegin: !0,
            excludeEnd: !0,
            keywords: o,
            relevance: 0,
            contains: [
              y,
              l,
              e.C_BLOCK_COMMENT_MODE
            ]
          },
          e.C_LINE_COMMENT_MODE,
          e.C_BLOCK_COMMENT_MODE
        ]
      },
      N
    ]
  };
}
const uh = (e) => ({
  IMPORTANT: {
    scope: "meta",
    begin: "!important"
  },
  BLOCK_COMMENT: e.C_BLOCK_COMMENT_MODE,
  HEXCOLOR: {
    scope: "number",
    begin: /#(([0-9a-fA-F]{3,4})|(([0-9a-fA-F]{2}){3,4}))\b/
  },
  FUNCTION_DISPATCH: {
    className: "built_in",
    begin: /[\w-]+(?=\()/
  },
  ATTRIBUTE_SELECTOR_MODE: {
    scope: "selector-attr",
    begin: /\[/,
    end: /\]/,
    illegal: "$",
    contains: [
      e.APOS_STRING_MODE,
      e.QUOTE_STRING_MODE
    ]
  },
  CSS_NUMBER_MODE: {
    scope: "number",
    begin: e.NUMBER_RE + "(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?",
    relevance: 0
  },
  CSS_VARIABLE: {
    className: "attr",
    begin: /--[A-Za-z_][A-Za-z0-9_-]*/
  }
}), dh = [
  "a",
  "abbr",
  "address",
  "article",
  "aside",
  "audio",
  "b",
  "blockquote",
  "body",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "dd",
  "del",
  "details",
  "dfn",
  "div",
  "dl",
  "dt",
  "em",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hgroup",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "main",
  "mark",
  "menu",
  "nav",
  "object",
  "ol",
  "optgroup",
  "option",
  "p",
  "picture",
  "q",
  "quote",
  "samp",
  "section",
  "select",
  "source",
  "span",
  "strong",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "tr",
  "ul",
  "var",
  "video"
], ph = [
  "defs",
  "g",
  "marker",
  "mask",
  "pattern",
  "svg",
  "switch",
  "symbol",
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feFlood",
  "feGaussianBlur",
  "feImage",
  "feMerge",
  "feMorphology",
  "feOffset",
  "feSpecularLighting",
  "feTile",
  "feTurbulence",
  "linearGradient",
  "radialGradient",
  "stop",
  "circle",
  "ellipse",
  "image",
  "line",
  "path",
  "polygon",
  "polyline",
  "rect",
  "text",
  "use",
  "textPath",
  "tspan",
  "foreignObject",
  "clipPath"
], fh = [
  ...dh,
  ...ph
], gh = [
  "any-hover",
  "any-pointer",
  "aspect-ratio",
  "color",
  "color-gamut",
  "color-index",
  "device-aspect-ratio",
  "device-height",
  "device-width",
  "display-mode",
  "forced-colors",
  "grid",
  "height",
  "hover",
  "inverted-colors",
  "monochrome",
  "orientation",
  "overflow-block",
  "overflow-inline",
  "pointer",
  "prefers-color-scheme",
  "prefers-contrast",
  "prefers-reduced-motion",
  "prefers-reduced-transparency",
  "resolution",
  "scan",
  "scripting",
  "update",
  "width",
  // TODO: find a better solution?
  "min-width",
  "max-width",
  "min-height",
  "max-height"
].sort().reverse(), mh = [
  "active",
  "any-link",
  "blank",
  "checked",
  "current",
  "default",
  "defined",
  "dir",
  // dir()
  "disabled",
  "drop",
  "empty",
  "enabled",
  "first",
  "first-child",
  "first-of-type",
  "fullscreen",
  "future",
  "focus",
  "focus-visible",
  "focus-within",
  "has",
  // has()
  "host",
  // host or host()
  "host-context",
  // host-context()
  "hover",
  "indeterminate",
  "in-range",
  "invalid",
  "is",
  // is()
  "lang",
  // lang()
  "last-child",
  "last-of-type",
  "left",
  "link",
  "local-link",
  "not",
  // not()
  "nth-child",
  // nth-child()
  "nth-col",
  // nth-col()
  "nth-last-child",
  // nth-last-child()
  "nth-last-col",
  // nth-last-col()
  "nth-last-of-type",
  //nth-last-of-type()
  "nth-of-type",
  //nth-of-type()
  "only-child",
  "only-of-type",
  "optional",
  "out-of-range",
  "past",
  "placeholder-shown",
  "read-only",
  "read-write",
  "required",
  "right",
  "root",
  "scope",
  "target",
  "target-within",
  "user-invalid",
  "valid",
  "visited",
  "where"
  // where()
].sort().reverse(), hh = [
  "after",
  "backdrop",
  "before",
  "cue",
  "cue-region",
  "first-letter",
  "first-line",
  "grammar-error",
  "marker",
  "part",
  "placeholder",
  "selection",
  "slotted",
  "spelling-error"
].sort().reverse(), bh = [
  "accent-color",
  "align-content",
  "align-items",
  "align-self",
  "alignment-baseline",
  "all",
  "anchor-name",
  "animation",
  "animation-composition",
  "animation-delay",
  "animation-direction",
  "animation-duration",
  "animation-fill-mode",
  "animation-iteration-count",
  "animation-name",
  "animation-play-state",
  "animation-range",
  "animation-range-end",
  "animation-range-start",
  "animation-timeline",
  "animation-timing-function",
  "appearance",
  "aspect-ratio",
  "backdrop-filter",
  "backface-visibility",
  "background",
  "background-attachment",
  "background-blend-mode",
  "background-clip",
  "background-color",
  "background-image",
  "background-origin",
  "background-position",
  "background-position-x",
  "background-position-y",
  "background-repeat",
  "background-size",
  "baseline-shift",
  "block-size",
  "border",
  "border-block",
  "border-block-color",
  "border-block-end",
  "border-block-end-color",
  "border-block-end-style",
  "border-block-end-width",
  "border-block-start",
  "border-block-start-color",
  "border-block-start-style",
  "border-block-start-width",
  "border-block-style",
  "border-block-width",
  "border-bottom",
  "border-bottom-color",
  "border-bottom-left-radius",
  "border-bottom-right-radius",
  "border-bottom-style",
  "border-bottom-width",
  "border-collapse",
  "border-color",
  "border-end-end-radius",
  "border-end-start-radius",
  "border-image",
  "border-image-outset",
  "border-image-repeat",
  "border-image-slice",
  "border-image-source",
  "border-image-width",
  "border-inline",
  "border-inline-color",
  "border-inline-end",
  "border-inline-end-color",
  "border-inline-end-style",
  "border-inline-end-width",
  "border-inline-start",
  "border-inline-start-color",
  "border-inline-start-style",
  "border-inline-start-width",
  "border-inline-style",
  "border-inline-width",
  "border-left",
  "border-left-color",
  "border-left-style",
  "border-left-width",
  "border-radius",
  "border-right",
  "border-right-color",
  "border-right-style",
  "border-right-width",
  "border-spacing",
  "border-start-end-radius",
  "border-start-start-radius",
  "border-style",
  "border-top",
  "border-top-color",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-top-style",
  "border-top-width",
  "border-width",
  "bottom",
  "box-align",
  "box-decoration-break",
  "box-direction",
  "box-flex",
  "box-flex-group",
  "box-lines",
  "box-ordinal-group",
  "box-orient",
  "box-pack",
  "box-shadow",
  "box-sizing",
  "break-after",
  "break-before",
  "break-inside",
  "caption-side",
  "caret-color",
  "clear",
  "clip",
  "clip-path",
  "clip-rule",
  "color",
  "color-interpolation",
  "color-interpolation-filters",
  "color-profile",
  "color-rendering",
  "color-scheme",
  "column-count",
  "column-fill",
  "column-gap",
  "column-rule",
  "column-rule-color",
  "column-rule-style",
  "column-rule-width",
  "column-span",
  "column-width",
  "columns",
  "contain",
  "contain-intrinsic-block-size",
  "contain-intrinsic-height",
  "contain-intrinsic-inline-size",
  "contain-intrinsic-size",
  "contain-intrinsic-width",
  "container",
  "container-name",
  "container-type",
  "content",
  "content-visibility",
  "counter-increment",
  "counter-reset",
  "counter-set",
  "cue",
  "cue-after",
  "cue-before",
  "cursor",
  "cx",
  "cy",
  "direction",
  "display",
  "dominant-baseline",
  "empty-cells",
  "enable-background",
  "field-sizing",
  "fill",
  "fill-opacity",
  "fill-rule",
  "filter",
  "flex",
  "flex-basis",
  "flex-direction",
  "flex-flow",
  "flex-grow",
  "flex-shrink",
  "flex-wrap",
  "float",
  "flood-color",
  "flood-opacity",
  "flow",
  "font",
  "font-display",
  "font-family",
  "font-feature-settings",
  "font-kerning",
  "font-language-override",
  "font-optical-sizing",
  "font-palette",
  "font-size",
  "font-size-adjust",
  "font-smooth",
  "font-smoothing",
  "font-stretch",
  "font-style",
  "font-synthesis",
  "font-synthesis-position",
  "font-synthesis-small-caps",
  "font-synthesis-style",
  "font-synthesis-weight",
  "font-variant",
  "font-variant-alternates",
  "font-variant-caps",
  "font-variant-east-asian",
  "font-variant-emoji",
  "font-variant-ligatures",
  "font-variant-numeric",
  "font-variant-position",
  "font-variation-settings",
  "font-weight",
  "forced-color-adjust",
  "gap",
  "glyph-orientation-horizontal",
  "glyph-orientation-vertical",
  "grid",
  "grid-area",
  "grid-auto-columns",
  "grid-auto-flow",
  "grid-auto-rows",
  "grid-column",
  "grid-column-end",
  "grid-column-start",
  "grid-gap",
  "grid-row",
  "grid-row-end",
  "grid-row-start",
  "grid-template",
  "grid-template-areas",
  "grid-template-columns",
  "grid-template-rows",
  "hanging-punctuation",
  "height",
  "hyphenate-character",
  "hyphenate-limit-chars",
  "hyphens",
  "icon",
  "image-orientation",
  "image-rendering",
  "image-resolution",
  "ime-mode",
  "initial-letter",
  "initial-letter-align",
  "inline-size",
  "inset",
  "inset-area",
  "inset-block",
  "inset-block-end",
  "inset-block-start",
  "inset-inline",
  "inset-inline-end",
  "inset-inline-start",
  "isolation",
  "justify-content",
  "justify-items",
  "justify-self",
  "kerning",
  "left",
  "letter-spacing",
  "lighting-color",
  "line-break",
  "line-height",
  "line-height-step",
  "list-style",
  "list-style-image",
  "list-style-position",
  "list-style-type",
  "margin",
  "margin-block",
  "margin-block-end",
  "margin-block-start",
  "margin-bottom",
  "margin-inline",
  "margin-inline-end",
  "margin-inline-start",
  "margin-left",
  "margin-right",
  "margin-top",
  "margin-trim",
  "marker",
  "marker-end",
  "marker-mid",
  "marker-start",
  "marks",
  "mask",
  "mask-border",
  "mask-border-mode",
  "mask-border-outset",
  "mask-border-repeat",
  "mask-border-slice",
  "mask-border-source",
  "mask-border-width",
  "mask-clip",
  "mask-composite",
  "mask-image",
  "mask-mode",
  "mask-origin",
  "mask-position",
  "mask-repeat",
  "mask-size",
  "mask-type",
  "masonry-auto-flow",
  "math-depth",
  "math-shift",
  "math-style",
  "max-block-size",
  "max-height",
  "max-inline-size",
  "max-width",
  "min-block-size",
  "min-height",
  "min-inline-size",
  "min-width",
  "mix-blend-mode",
  "nav-down",
  "nav-index",
  "nav-left",
  "nav-right",
  "nav-up",
  "none",
  "normal",
  "object-fit",
  "object-position",
  "offset",
  "offset-anchor",
  "offset-distance",
  "offset-path",
  "offset-position",
  "offset-rotate",
  "opacity",
  "order",
  "orphans",
  "outline",
  "outline-color",
  "outline-offset",
  "outline-style",
  "outline-width",
  "overflow",
  "overflow-anchor",
  "overflow-block",
  "overflow-clip-margin",
  "overflow-inline",
  "overflow-wrap",
  "overflow-x",
  "overflow-y",
  "overlay",
  "overscroll-behavior",
  "overscroll-behavior-block",
  "overscroll-behavior-inline",
  "overscroll-behavior-x",
  "overscroll-behavior-y",
  "padding",
  "padding-block",
  "padding-block-end",
  "padding-block-start",
  "padding-bottom",
  "padding-inline",
  "padding-inline-end",
  "padding-inline-start",
  "padding-left",
  "padding-right",
  "padding-top",
  "page",
  "page-break-after",
  "page-break-before",
  "page-break-inside",
  "paint-order",
  "pause",
  "pause-after",
  "pause-before",
  "perspective",
  "perspective-origin",
  "place-content",
  "place-items",
  "place-self",
  "pointer-events",
  "position",
  "position-anchor",
  "position-visibility",
  "print-color-adjust",
  "quotes",
  "r",
  "resize",
  "rest",
  "rest-after",
  "rest-before",
  "right",
  "rotate",
  "row-gap",
  "ruby-align",
  "ruby-position",
  "scale",
  "scroll-behavior",
  "scroll-margin",
  "scroll-margin-block",
  "scroll-margin-block-end",
  "scroll-margin-block-start",
  "scroll-margin-bottom",
  "scroll-margin-inline",
  "scroll-margin-inline-end",
  "scroll-margin-inline-start",
  "scroll-margin-left",
  "scroll-margin-right",
  "scroll-margin-top",
  "scroll-padding",
  "scroll-padding-block",
  "scroll-padding-block-end",
  "scroll-padding-block-start",
  "scroll-padding-bottom",
  "scroll-padding-inline",
  "scroll-padding-inline-end",
  "scroll-padding-inline-start",
  "scroll-padding-left",
  "scroll-padding-right",
  "scroll-padding-top",
  "scroll-snap-align",
  "scroll-snap-stop",
  "scroll-snap-type",
  "scroll-timeline",
  "scroll-timeline-axis",
  "scroll-timeline-name",
  "scrollbar-color",
  "scrollbar-gutter",
  "scrollbar-width",
  "shape-image-threshold",
  "shape-margin",
  "shape-outside",
  "shape-rendering",
  "speak",
  "speak-as",
  "src",
  // @font-face
  "stop-color",
  "stop-opacity",
  "stroke",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "stroke-opacity",
  "stroke-width",
  "tab-size",
  "table-layout",
  "text-align",
  "text-align-all",
  "text-align-last",
  "text-anchor",
  "text-combine-upright",
  "text-decoration",
  "text-decoration-color",
  "text-decoration-line",
  "text-decoration-skip",
  "text-decoration-skip-ink",
  "text-decoration-style",
  "text-decoration-thickness",
  "text-emphasis",
  "text-emphasis-color",
  "text-emphasis-position",
  "text-emphasis-style",
  "text-indent",
  "text-justify",
  "text-orientation",
  "text-overflow",
  "text-rendering",
  "text-shadow",
  "text-size-adjust",
  "text-transform",
  "text-underline-offset",
  "text-underline-position",
  "text-wrap",
  "text-wrap-mode",
  "text-wrap-style",
  "timeline-scope",
  "top",
  "touch-action",
  "transform",
  "transform-box",
  "transform-origin",
  "transform-style",
  "transition",
  "transition-behavior",
  "transition-delay",
  "transition-duration",
  "transition-property",
  "transition-timing-function",
  "translate",
  "unicode-bidi",
  "user-modify",
  "user-select",
  "vector-effect",
  "vertical-align",
  "view-timeline",
  "view-timeline-axis",
  "view-timeline-inset",
  "view-timeline-name",
  "view-transition-name",
  "visibility",
  "voice-balance",
  "voice-duration",
  "voice-family",
  "voice-pitch",
  "voice-range",
  "voice-rate",
  "voice-stress",
  "voice-volume",
  "white-space",
  "white-space-collapse",
  "widows",
  "width",
  "will-change",
  "word-break",
  "word-spacing",
  "word-wrap",
  "writing-mode",
  "x",
  "y",
  "z-index",
  "zoom"
].sort().reverse();
function ps(e) {
  const t = e.regex, n = uh(e), r = { begin: /-(webkit|moz|ms|o)-(?=[a-z])/ }, i = "and or not only", a = /@-?\w[\w]*(-\w+)*/, o = "[a-zA-Z-][a-zA-Z0-9_-]*", s = [
    e.APOS_STRING_MODE,
    e.QUOTE_STRING_MODE
  ];
  return {
    name: "CSS",
    case_insensitive: !0,
    illegal: /[=|'\$]/,
    keywords: { keyframePosition: "from to" },
    classNameAliases: {
      // for visual continuity with `tag {}` and because we
      // don't have a great class for this?
      keyframePosition: "selector-tag"
    },
    contains: [
      n.BLOCK_COMMENT,
      r,
      // to recognize keyframe 40% etc which are outside the scope of our
      // attribute value mode
      n.CSS_NUMBER_MODE,
      {
        className: "selector-id",
        begin: /#[A-Za-z0-9_-]+/,
        relevance: 0
      },
      {
        className: "selector-class",
        begin: "\\." + o,
        relevance: 0
      },
      n.ATTRIBUTE_SELECTOR_MODE,
      {
        className: "selector-pseudo",
        variants: [
          { begin: ":(" + mh.join("|") + ")" },
          { begin: ":(:)?(" + hh.join("|") + ")" }
        ]
      },
      // we may actually need this (12/2020)
      // { // pseudo-selector params
      //   begin: /\(/,
      //   end: /\)/,
      //   contains: [ hljs.CSS_NUMBER_MODE ]
      // },
      n.CSS_VARIABLE,
      {
        className: "attribute",
        begin: "\\b(" + bh.join("|") + ")\\b"
      },
      // attribute values
      {
        begin: /:/,
        end: /[;}{]/,
        contains: [
          n.BLOCK_COMMENT,
          n.HEXCOLOR,
          n.IMPORTANT,
          n.CSS_NUMBER_MODE,
          ...s,
          // needed to highlight these as strings and to avoid issues with
          // illegal characters that might be inside urls that would tigger the
          // languages illegal stack
          {
            begin: /(url|data-uri)\(/,
            end: /\)/,
            relevance: 0,
            // from keywords
            keywords: { built_in: "url data-uri" },
            contains: [
              ...s,
              {
                className: "string",
                // any character other than `)` as in `url()` will be the start
                // of a string, which ends with `)` (from the parent mode)
                begin: /[^)]/,
                endsWithParent: !0,
                excludeEnd: !0
              }
            ]
          },
          n.FUNCTION_DISPATCH
        ]
      },
      {
        begin: t.lookahead(/@/),
        end: "[{;]",
        relevance: 0,
        illegal: /:/,
        // break on Less variables @var: ...
        contains: [
          {
            className: "keyword",
            begin: a
          },
          {
            begin: /\s/,
            endsWithParent: !0,
            excludeEnd: !0,
            relevance: 0,
            keywords: {
              $pattern: /[a-z-]+/,
              keyword: i,
              attribute: gh.join(" ")
            },
            contains: [
              {
                begin: /[a-z-]+(?=:)/,
                className: "attribute"
              },
              ...s,
              n.CSS_NUMBER_MODE
            ]
          }
        ]
      },
      {
        className: "selector-tag",
        begin: "\\b(" + fh.join("|") + ")\\b"
      }
    ]
  };
}
function yh(e) {
  const t = e.regex;
  return {
    name: "Diff",
    aliases: ["patch"],
    contains: [
      {
        className: "meta",
        relevance: 10,
        match: t.either(
          /^@@ +-\d+,\d+ +\+\d+,\d+ +@@/,
          /^\*\*\* +\d+,\d+ +\*\*\*\*$/,
          /^--- +\d+,\d+ +----$/
        )
      },
      {
        className: "comment",
        variants: [
          {
            begin: t.either(
              /Index: /,
              /^index/,
              /={3,}/,
              /^-{3}/,
              /^\*{3} /,
              /^\+{3}/,
              /^diff --git/
            ),
            end: /$/
          },
          { match: /^\*{15}$/ }
        ]
      },
      {
        className: "addition",
        begin: /^\+/,
        end: /$/
      },
      {
        className: "deletion",
        begin: /^-/,
        end: /$/
      },
      {
        className: "addition",
        begin: /^!/,
        end: /$/
      }
    ]
  };
}
function Eh(e) {
  const a = {
    keyword: [
      "break",
      "case",
      "chan",
      "const",
      "continue",
      "default",
      "defer",
      "else",
      "fallthrough",
      "for",
      "func",
      "go",
      "goto",
      "if",
      "import",
      "interface",
      "map",
      "package",
      "range",
      "return",
      "select",
      "struct",
      "switch",
      "type",
      "var"
    ],
    type: [
      "bool",
      "byte",
      "complex64",
      "complex128",
      "error",
      "float32",
      "float64",
      "int8",
      "int16",
      "int32",
      "int64",
      "string",
      "uint8",
      "uint16",
      "uint32",
      "uint64",
      "int",
      "uint",
      "uintptr",
      "rune"
    ],
    literal: [
      "true",
      "false",
      "iota",
      "nil"
    ],
    built_in: [
      "append",
      "cap",
      "close",
      "complex",
      "copy",
      "imag",
      "len",
      "make",
      "new",
      "panic",
      "print",
      "println",
      "real",
      "recover",
      "delete"
    ]
  };
  return {
    name: "Go",
    aliases: ["golang"],
    keywords: a,
    illegal: "</",
    contains: [
      e.C_LINE_COMMENT_MODE,
      e.C_BLOCK_COMMENT_MODE,
      {
        className: "string",
        variants: [
          e.QUOTE_STRING_MODE,
          e.APOS_STRING_MODE,
          {
            begin: "`",
            end: "`"
          }
        ]
      },
      {
        className: "number",
        variants: [
          {
            match: /-?\b0[xX]\.[a-fA-F0-9](_?[a-fA-F0-9])*[pP][+-]?\d(_?\d)*i?/,
            // hex without a present digit before . (making a digit afterwards required)
            relevance: 0
          },
          {
            match: /-?\b0[xX](_?[a-fA-F0-9])+((\.([a-fA-F0-9](_?[a-fA-F0-9])*)?)?[pP][+-]?\d(_?\d)*)?i?/,
            // hex with a present digit before . (making a digit afterwards optional)
            relevance: 0
          },
          {
            match: /-?\b0[oO](_?[0-7])*i?/,
            // leading 0o octal
            relevance: 0
          },
          {
            match: /-?\.\d(_?\d)*([eE][+-]?\d(_?\d)*)?i?/,
            // decimal without a present digit before . (making a digit afterwards required)
            relevance: 0
          },
          {
            match: /-?\b\d(_?\d)*(\.(\d(_?\d)*)?)?([eE][+-]?\d(_?\d)*)?i?/,
            // decimal with a present digit before . (making a digit afterwards optional)
            relevance: 0
          }
        ]
      },
      {
        begin: /:=/
        // relevance booster
      },
      {
        className: "function",
        beginKeywords: "func",
        end: "\\s*(\\{|$)",
        excludeEnd: !0,
        contains: [
          e.TITLE_MODE,
          {
            className: "params",
            begin: /\(/,
            end: /\)/,
            endsParent: !0,
            keywords: a,
            illegal: /["']/
          }
        ]
      }
    ]
  };
}
function _h(e) {
  const t = e.regex, n = /[_A-Za-z][_0-9A-Za-z]*/;
  return {
    name: "GraphQL",
    aliases: ["gql"],
    case_insensitive: !0,
    disableAutodetect: !1,
    keywords: {
      keyword: [
        "query",
        "mutation",
        "subscription",
        "type",
        "input",
        "schema",
        "directive",
        "interface",
        "union",
        "scalar",
        "fragment",
        "enum",
        "on"
      ],
      literal: [
        "true",
        "false",
        "null"
      ]
    },
    contains: [
      e.HASH_COMMENT_MODE,
      e.QUOTE_STRING_MODE,
      e.NUMBER_MODE,
      {
        scope: "punctuation",
        match: /[.]{3}/,
        relevance: 0
      },
      {
        scope: "punctuation",
        begin: /[\!\(\)\:\=\[\]\{\|\}]{1}/,
        relevance: 0
      },
      {
        scope: "variable",
        begin: /\$/,
        end: /\W/,
        excludeEnd: !0,
        relevance: 0
      },
      {
        scope: "meta",
        match: /@\w+/,
        excludeEnd: !0
      },
      {
        scope: "symbol",
        begin: t.concat(n, t.lookahead(/\s*:/)),
        relevance: 0
      }
    ],
    illegal: [
      /[;<']/,
      /BEGIN/
    ]
  };
}
function kh(e) {
  const t = e.regex, n = {
    className: "number",
    relevance: 0,
    variants: [
      { begin: /([+-]+)?[\d]+_[\d_]+/ },
      { begin: e.NUMBER_RE }
    ]
  }, r = e.COMMENT();
  r.variants = [
    {
      begin: /;/,
      end: /$/
    },
    {
      begin: /#/,
      end: /$/
    }
  ];
  const i = {
    className: "variable",
    variants: [
      { begin: /\$[\w\d"][\w\d_]*/ },
      { begin: /\$\{(.*?)\}/ }
    ]
  }, a = {
    className: "literal",
    begin: /\bon|off|true|false|yes|no\b/
  }, o = {
    className: "string",
    contains: [e.BACKSLASH_ESCAPE],
    variants: [
      {
        begin: "'''",
        end: "'''",
        relevance: 10
      },
      {
        begin: '"""',
        end: '"""',
        relevance: 10
      },
      {
        begin: '"',
        end: '"'
      },
      {
        begin: "'",
        end: "'"
      }
    ]
  }, s = {
    begin: /\[/,
    end: /\]/,
    contains: [
      r,
      a,
      i,
      o,
      n,
      "self"
    ],
    relevance: 0
  }, l = /[A-Za-z0-9_-]+/, c = /"(\\"|[^"])*"/, u = /'[^']*'/, d = t.either(
    l,
    c,
    u
  ), f = t.concat(
    d,
    "(\\s*\\.\\s*",
    d,
    ")*",
    t.lookahead(/\s*=\s*[^#\s]/)
  );
  return {
    name: "TOML, also INI",
    aliases: ["toml"],
    case_insensitive: !0,
    illegal: /\S/,
    contains: [
      r,
      {
        className: "section",
        begin: /\[+/,
        end: /\]+/
      },
      {
        begin: f,
        className: "attr",
        starts: {
          end: /$/,
          contains: [
            r,
            s,
            a,
            i,
            o,
            n
          ]
        }
      }
    ]
  };
}
var zt = "[0-9](_*[0-9])*", Rn = `\\.(${zt})`, On = "[0-9a-fA-F](_*[0-9a-fA-F])*", Lo = {
  className: "number",
  variants: [
    // DecimalFloatingPointLiteral
    // including ExponentPart
    { begin: `(\\b(${zt})((${Rn})|\\.)?|(${Rn}))[eE][+-]?(${zt})[fFdD]?\\b` },
    // excluding ExponentPart
    { begin: `\\b(${zt})((${Rn})[fFdD]?\\b|\\.([fFdD]\\b)?)` },
    { begin: `(${Rn})[fFdD]?\\b` },
    { begin: `\\b(${zt})[fFdD]\\b` },
    // HexadecimalFloatingPointLiteral
    { begin: `\\b0[xX]((${On})\\.?|(${On})?\\.(${On}))[pP][+-]?(${zt})[fFdD]?\\b` },
    // DecimalIntegerLiteral
    { begin: "\\b(0|[1-9](_*[0-9])*)[lL]?\\b" },
    // HexIntegerLiteral
    { begin: `\\b0[xX](${On})[lL]?\\b` },
    // OctalIntegerLiteral
    { begin: "\\b0(_*[0-7])*[lL]?\\b" },
    // BinaryIntegerLiteral
    { begin: "\\b0[bB][01](_*[01])*[lL]?\\b" }
  ],
  relevance: 0
};
function fs(e, t, n) {
  return n === -1 ? "" : e.replace(t, (r) => fs(e, t, n - 1));
}
function gs(e) {
  const t = e.regex, n = "[À-ʸa-zA-Z_$][À-ʸa-zA-Z_$0-9]*", r = n + fs("(?:<" + n + "~~~(?:\\s*,\\s*" + n + "~~~)*>)?", /~~~/g, 2), l = {
    keyword: [
      "synchronized",
      "abstract",
      "private",
      "var",
      "static",
      "if",
      "const ",
      "for",
      "while",
      "strictfp",
      "finally",
      "protected",
      "import",
      "native",
      "final",
      "void",
      "enum",
      "else",
      "break",
      "transient",
      "catch",
      "instanceof",
      "volatile",
      "case",
      "assert",
      "package",
      "default",
      "public",
      "try",
      "switch",
      "continue",
      "throws",
      "protected",
      "public",
      "private",
      "module",
      "requires",
      "exports",
      "do",
      "sealed",
      "yield",
      "permits",
      "goto",
      "when"
    ],
    literal: [
      "false",
      "true",
      "null"
    ],
    type: [
      "char",
      "boolean",
      "long",
      "float",
      "int",
      "byte",
      "short",
      "double"
    ],
    built_in: [
      "super",
      "this"
    ]
  }, c = {
    className: "meta",
    begin: "@" + n,
    contains: [
      {
        begin: /\(/,
        end: /\)/,
        contains: ["self"]
        // allow nested () inside our annotation
      }
    ]
  }, u = {
    className: "params",
    begin: /\(/,
    end: /\)/,
    keywords: l,
    relevance: 0,
    contains: [e.C_BLOCK_COMMENT_MODE],
    endsParent: !0
  };
  return {
    name: "Java",
    aliases: ["jsp"],
    keywords: l,
    illegal: /<\/|#/,
    contains: [
      e.COMMENT(
        "/\\*\\*",
        "\\*/",
        {
          relevance: 0,
          contains: [
            {
              // eat up @'s in emails to prevent them to be recognized as doctags
              begin: /\w+@/,
              relevance: 0
            },
            {
              className: "doctag",
              begin: "@[A-Za-z]+"
            }
          ]
        }
      ),
      // relevance boost
      {
        begin: /import java\.[a-z]+\./,
        keywords: "import",
        relevance: 2
      },
      e.C_LINE_COMMENT_MODE,
      e.C_BLOCK_COMMENT_MODE,
      {
        begin: /"""/,
        end: /"""/,
        className: "string",
        contains: [e.BACKSLASH_ESCAPE]
      },
      e.APOS_STRING_MODE,
      e.QUOTE_STRING_MODE,
      {
        match: [
          /\b(?:class|interface|enum|extends|implements|new)/,
          /\s+/,
          n
        ],
        className: {
          1: "keyword",
          3: "title.class"
        }
      },
      {
        // Exceptions for hyphenated keywords
        match: /non-sealed/,
        scope: "keyword"
      },
      {
        begin: [
          t.concat(/(?!else)/, n),
          /\s+/,
          n,
          /\s+/,
          /=(?!=)/
        ],
        className: {
          1: "type",
          3: "variable",
          5: "operator"
        }
      },
      {
        begin: [
          /record/,
          /\s+/,
          n
        ],
        className: {
          1: "keyword",
          3: "title.class"
        },
        contains: [
          u,
          e.C_LINE_COMMENT_MODE,
          e.C_BLOCK_COMMENT_MODE
        ]
      },
      {
        // Expression keywords prevent 'keyword Name(...)' from being
        // recognized as a function definition
        beginKeywords: "new throw return else",
        relevance: 0
      },
      {
        begin: [
          "(?:" + r + "\\s+)",
          e.UNDERSCORE_IDENT_RE,
          /\s*(?=\()/
        ],
        className: { 2: "title.function" },
        keywords: l,
        contains: [
          {
            className: "params",
            begin: /\(/,
            end: /\)/,
            keywords: l,
            relevance: 0,
            contains: [
              c,
              e.APOS_STRING_MODE,
              e.QUOTE_STRING_MODE,
              Lo,
              e.C_BLOCK_COMMENT_MODE
            ]
          },
          e.C_LINE_COMMENT_MODE,
          e.C_BLOCK_COMMENT_MODE
        ]
      },
      Lo,
      c
    ]
  };
}
const Do = "[A-Za-z$_][0-9A-Za-z$_]*", xh = [
  "as",
  // for exports
  "in",
  "of",
  "if",
  "for",
  "while",
  "finally",
  "var",
  "new",
  "function",
  "do",
  "return",
  "void",
  "else",
  "break",
  "catch",
  "instanceof",
  "with",
  "throw",
  "case",
  "default",
  "try",
  "switch",
  "continue",
  "typeof",
  "delete",
  "let",
  "yield",
  "const",
  "class",
  // JS handles these with a special rule
  // "get",
  // "set",
  "debugger",
  "async",
  "await",
  "static",
  "import",
  "from",
  "export",
  "extends",
  // It's reached stage 3, which is "recommended for implementation":
  "using"
], wh = [
  "true",
  "false",
  "null",
  "undefined",
  "NaN",
  "Infinity"
], ms = [
  // Fundamental objects
  "Object",
  "Function",
  "Boolean",
  "Symbol",
  // numbers and dates
  "Math",
  "Date",
  "Number",
  "BigInt",
  // text
  "String",
  "RegExp",
  // Indexed collections
  "Array",
  "Float32Array",
  "Float64Array",
  "Int8Array",
  "Uint8Array",
  "Uint8ClampedArray",
  "Int16Array",
  "Int32Array",
  "Uint16Array",
  "Uint32Array",
  "BigInt64Array",
  "BigUint64Array",
  // Keyed collections
  "Set",
  "Map",
  "WeakSet",
  "WeakMap",
  // Structured data
  "ArrayBuffer",
  "SharedArrayBuffer",
  "Atomics",
  "DataView",
  "JSON",
  // Control abstraction objects
  "Promise",
  "Generator",
  "GeneratorFunction",
  "AsyncFunction",
  // Reflection
  "Reflect",
  "Proxy",
  // Internationalization
  "Intl",
  // WebAssembly
  "WebAssembly"
], hs = [
  "Error",
  "EvalError",
  "InternalError",
  "RangeError",
  "ReferenceError",
  "SyntaxError",
  "TypeError",
  "URIError"
], bs = [
  "setInterval",
  "setTimeout",
  "clearInterval",
  "clearTimeout",
  "require",
  "exports",
  "eval",
  "isFinite",
  "isNaN",
  "parseFloat",
  "parseInt",
  "decodeURI",
  "decodeURIComponent",
  "encodeURI",
  "encodeURIComponent",
  "escape",
  "unescape"
], Sh = [
  "arguments",
  "this",
  "super",
  "console",
  "window",
  "document",
  "localStorage",
  "sessionStorage",
  "module",
  "global"
  // Node.js
], vh = [].concat(
  bs,
  ms,
  hs
);
function Hr(e) {
  const t = e.regex, n = (I, { after: fe }) => {
    const g = "</" + I[0].slice(1);
    return I.input.indexOf(g, fe) !== -1;
  }, r = Do, i = {
    begin: "<>",
    end: "</>"
  }, a = /<[A-Za-z0-9\\._:-]+\s*\/>/, o = {
    begin: /<[A-Za-z0-9\\._:-]+/,
    end: /\/[A-Za-z0-9\\._:-]+>|\/>/,
    /**
     * @param {RegExpMatchArray} match
     * @param {CallbackResponse} response
     */
    isTrulyOpeningTag: (I, fe) => {
      const g = I[0].length + I.index, G = I.input[g];
      if (
        // HTML should not include another raw `<` inside a tag
        // nested type?
        // `<Array<Array<number>>`, etc.
        G === "<" || // the , gives away that this is not HTML
        // `<T, A extends keyof T, V>`
        G === ","
      ) {
        fe.ignoreMatch();
        return;
      }
      G === ">" && (n(I, { after: g }) || fe.ignoreMatch());
      let j;
      const b = I.input.substring(g);
      if (j = b.match(/^\s*=/)) {
        fe.ignoreMatch();
        return;
      }
      if ((j = b.match(/^\s+extends\s+/)) && j.index === 0) {
        fe.ignoreMatch();
        return;
      }
    }
  }, s = {
    $pattern: Do,
    keyword: xh,
    literal: wh,
    built_in: vh,
    "variable.language": Sh
  }, l = "[0-9](_?[0-9])*", c = `\\.(${l})`, u = "0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*", d = {
    className: "number",
    variants: [
      // DecimalLiteral
      { begin: `(\\b(${u})((${c})|\\.)?|(${c}))[eE][+-]?(${l})\\b` },
      { begin: `\\b(${u})\\b((${c})\\b|\\.)?|(${c})\\b` },
      // DecimalBigIntegerLiteral
      { begin: "\\b(0|[1-9](_?[0-9])*)n\\b" },
      // NonDecimalIntegerLiteral
      { begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b" },
      { begin: "\\b0[bB][0-1](_?[0-1])*n?\\b" },
      { begin: "\\b0[oO][0-7](_?[0-7])*n?\\b" },
      // LegacyOctalIntegerLiteral (does not include underscore separators)
      // https://tc39.es/ecma262/#sec-additional-syntax-numeric-literals
      { begin: "\\b0[0-7]+n?\\b" }
    ],
    relevance: 0
  }, f = {
    className: "subst",
    begin: "\\$\\{",
    end: "\\}",
    keywords: s,
    contains: []
    // defined later
  }, p = {
    begin: ".?html`",
    end: "",
    starts: {
      end: "`",
      returnEnd: !1,
      contains: [
        e.BACKSLASH_ESCAPE,
        f
      ],
      subLanguage: "xml"
    }
  }, m = {
    begin: ".?css`",
    end: "",
    starts: {
      end: "`",
      returnEnd: !1,
      contains: [
        e.BACKSLASH_ESCAPE,
        f
      ],
      subLanguage: "css"
    }
  }, h = {
    begin: ".?gql`",
    end: "",
    starts: {
      end: "`",
      returnEnd: !1,
      contains: [
        e.BACKSLASH_ESCAPE,
        f
      ],
      subLanguage: "graphql"
    }
  }, k = {
    className: "string",
    begin: "`",
    end: "`",
    contains: [
      e.BACKSLASH_ESCAPE,
      f
    ]
  }, S = {
    className: "comment",
    variants: [
      e.COMMENT(
        /\/\*\*(?!\/)/,
        "\\*/",
        {
          relevance: 0,
          contains: [
            {
              begin: "(?=@[A-Za-z]+)",
              relevance: 0,
              contains: [
                {
                  className: "doctag",
                  begin: "@[A-Za-z]+"
                },
                {
                  className: "type",
                  begin: "\\{",
                  end: "\\}",
                  excludeEnd: !0,
                  excludeBegin: !0,
                  relevance: 0
                },
                {
                  className: "variable",
                  begin: r + "(?=\\s*(-)|$)",
                  endsParent: !0,
                  relevance: 0
                },
                // eat spaces (not newlines) so we can find
                // types or variables
                {
                  begin: /(?=[^\n])\s/,
                  relevance: 0
                }
              ]
            }
          ]
        }
      ),
      e.C_BLOCK_COMMENT_MODE,
      e.C_LINE_COMMENT_MODE
    ]
  }, w = [
    e.APOS_STRING_MODE,
    e.QUOTE_STRING_MODE,
    p,
    m,
    h,
    k,
    // Skip numbers when they are part of a variable name
    { match: /\$\d+/ },
    d
    // This is intentional:
    // See https://github.com/highlightjs/highlight.js/issues/3288
    // hljs.REGEXP_MODE
  ];
  f.contains = w.concat({
    // we need to pair up {} inside our subst to prevent
    // it from ending too early by matching another }
    begin: /\{/,
    end: /\}/,
    keywords: s,
    contains: [
      "self"
    ].concat(w)
  });
  const N = [].concat(S, f.contains), A = N.concat([
    // eat recursive parens in sub expressions
    {
      begin: /(\s*)\(/,
      end: /\)/,
      keywords: s,
      contains: ["self"].concat(N)
    }
  ]), _ = {
    className: "params",
    // convert this to negative lookbehind in v12
    begin: /(\s*)\(/,
    // to match the parms with
    end: /\)/,
    excludeBegin: !0,
    excludeEnd: !0,
    keywords: s,
    contains: A
  }, L = {
    variants: [
      // class Car extends vehicle
      {
        match: [
          /class/,
          /\s+/,
          r,
          /\s+/,
          /extends/,
          /\s+/,
          t.concat(r, "(", t.concat(/\./, r), ")*")
        ],
        scope: {
          1: "keyword",
          3: "title.class",
          5: "keyword",
          7: "title.class.inherited"
        }
      },
      // class Car
      {
        match: [
          /class/,
          /\s+/,
          r
        ],
        scope: {
          1: "keyword",
          3: "title.class"
        }
      }
    ]
  }, v = {
    relevance: 0,
    match: t.either(
      // Hard coded exceptions
      /\bJSON/,
      // Float32Array, OutT
      /\b[A-Z][a-z]+([A-Z][a-z]*|\d)*/,
      // CSSFactory, CSSFactoryT
      /\b[A-Z]{2,}([A-Z][a-z]+|\d)+([A-Z][a-z]*)*/,
      // FPs, FPsT
      /\b[A-Z]{2,}[a-z]+([A-Z][a-z]+|\d)*([A-Z][a-z]*)*/
      // P
      // single letters are not highlighted
      // BLAH
      // this will be flagged as a UPPER_CASE_CONSTANT instead
    ),
    className: "title.class",
    keywords: {
      _: [
        // se we still get relevance credit for JS library classes
        ...ms,
        ...hs
      ]
    }
  }, R = {
    label: "use_strict",
    className: "meta",
    relevance: 10,
    begin: /^\s*['"]use (strict|asm)['"]/
  }, x = {
    variants: [
      {
        match: [
          /function/,
          /\s+/,
          r,
          /(?=\s*\()/
        ]
      },
      // anonymous function
      {
        match: [
          /function/,
          /\s*(?=\()/
        ]
      }
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    label: "func.def",
    contains: [_],
    illegal: /%/
  }, O = {
    relevance: 0,
    match: /\b[A-Z][A-Z_0-9]+\b/,
    className: "variable.constant"
  };
  function F(I) {
    return t.concat("(?!", I.join("|"), ")");
  }
  const U = {
    match: t.concat(
      /\b/,
      F([
        ...bs,
        "super",
        "import"
      ].map((I) => `${I}\\s*\\(`)),
      r,
      t.lookahead(/\s*\(/)
    ),
    className: "title.function",
    relevance: 0
  }, D = {
    begin: t.concat(/\./, t.lookahead(
      t.concat(r, /(?![0-9A-Za-z$_(])/)
    )),
    end: r,
    excludeBegin: !0,
    keywords: "prototype",
    className: "property",
    relevance: 0
  }, $ = {
    match: [
      /get|set/,
      /\s+/,
      r,
      /(?=\()/
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      {
        // eat to avoid empty params
        begin: /\(\)/
      },
      _
    ]
  }, Q = "(\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)|" + e.UNDERSCORE_IDENT_RE + ")\\s*=>", se = {
    match: [
      /const|var|let/,
      /\s+/,
      r,
      /\s*/,
      /=\s*/,
      /(async\s*)?/,
      // async is optional
      t.lookahead(Q)
    ],
    keywords: "async",
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      _
    ]
  };
  return {
    name: "JavaScript",
    aliases: ["js", "jsx", "mjs", "cjs"],
    keywords: s,
    // this will be extended by TypeScript
    exports: { PARAMS_CONTAINS: A, CLASS_REFERENCE: v },
    illegal: /#(?![$_A-z])/,
    contains: [
      e.SHEBANG({
        label: "shebang",
        binary: "node",
        relevance: 5
      }),
      R,
      e.APOS_STRING_MODE,
      e.QUOTE_STRING_MODE,
      p,
      m,
      h,
      k,
      S,
      // Skip numbers when they are part of a variable name
      { match: /\$\d+/ },
      d,
      v,
      {
        scope: "attr",
        match: r + t.lookahead(":"),
        relevance: 0
      },
      se,
      {
        // "value" container
        begin: "(" + e.RE_STARTERS_RE + "|\\b(case|return|throw)\\b)\\s*",
        keywords: "return throw case",
        relevance: 0,
        contains: [
          S,
          e.REGEXP_MODE,
          {
            className: "function",
            // we have to count the parens to make sure we actually have the
            // correct bounding ( ) before the =>.  There could be any number of
            // sub-expressions inside also surrounded by parens.
            begin: Q,
            returnBegin: !0,
            end: "\\s*=>",
            contains: [
              {
                className: "params",
                variants: [
                  {
                    begin: e.UNDERSCORE_IDENT_RE,
                    relevance: 0
                  },
                  {
                    className: null,
                    begin: /\(\s*\)/,
                    skip: !0
                  },
                  {
                    begin: /(\s*)\(/,
                    end: /\)/,
                    excludeBegin: !0,
                    excludeEnd: !0,
                    keywords: s,
                    contains: A
                  }
                ]
              }
            ]
          },
          {
            // could be a comma delimited list of params to a function call
            begin: /,/,
            relevance: 0
          },
          {
            match: /\s+/,
            relevance: 0
          },
          {
            // JSX
            variants: [
              { begin: i.begin, end: i.end },
              { match: a },
              {
                begin: o.begin,
                // we carefully check the opening tag to see if it truly
                // is a tag and not a false positive
                "on:begin": o.isTrulyOpeningTag,
                end: o.end
              }
            ],
            subLanguage: "xml",
            contains: [
              {
                begin: o.begin,
                end: o.end,
                skip: !0,
                contains: ["self"]
              }
            ]
          }
        ]
      },
      x,
      {
        // prevent this from getting swallowed up by function
        // since they appear "function like"
        beginKeywords: "while if switch catch for"
      },
      {
        // we have to count the parens to make sure we actually have the correct
        // bounding ( ).  There could be any number of sub-expressions inside
        // also surrounded by parens.
        begin: "\\b(?!function)" + e.UNDERSCORE_IDENT_RE + "\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)\\s*\\{",
        // end parens
        returnBegin: !0,
        label: "func.def",
        contains: [
          _,
          e.inherit(e.TITLE_MODE, { begin: r, className: "title.function" })
        ]
      },
      // catch ... so it won't trigger the property rule below
      {
        match: /\.\.\./,
        relevance: 0
      },
      D,
      // hack: prevents detection of keywords in some circumstances
      // .keyword()
      // $keyword = x
      {
        match: "\\$" + r,
        relevance: 0
      },
      {
        match: [/\bconstructor(?=\s*\()/],
        className: { 1: "title.function" },
        contains: [_]
      },
      U,
      O,
      L,
      $,
      {
        match: /\$[(.]/
        // relevance booster for a pattern common to JS libs: `$(something)` and `$.something`
      }
    ]
  };
}
function ys(e) {
  const t = {
    className: "attr",
    begin: /"(\\.|[^\\"\r\n])*"(?=\s*:)/,
    relevance: 1.01
  }, n = {
    match: /[{}[\],:]/,
    className: "punctuation",
    relevance: 0
  }, r = [
    "true",
    "false",
    "null"
  ], i = {
    scope: "literal",
    beginKeywords: r.join(" ")
  };
  return {
    name: "JSON",
    aliases: ["jsonc"],
    keywords: {
      literal: r
    },
    contains: [
      t,
      n,
      e.QUOTE_STRING_MODE,
      i,
      e.C_NUMBER_MODE,
      e.C_LINE_COMMENT_MODE,
      e.C_BLOCK_COMMENT_MODE
    ],
    illegal: "\\S"
  };
}
var Ut = "[0-9](_*[0-9])*", In = `\\.(${Ut})`, Mn = "[0-9a-fA-F](_*[0-9a-fA-F])*", Th = {
  className: "number",
  variants: [
    // DecimalFloatingPointLiteral
    // including ExponentPart
    { begin: `(\\b(${Ut})((${In})|\\.)?|(${In}))[eE][+-]?(${Ut})[fFdD]?\\b` },
    // excluding ExponentPart
    { begin: `\\b(${Ut})((${In})[fFdD]?\\b|\\.([fFdD]\\b)?)` },
    { begin: `(${In})[fFdD]?\\b` },
    { begin: `\\b(${Ut})[fFdD]\\b` },
    // HexadecimalFloatingPointLiteral
    { begin: `\\b0[xX]((${Mn})\\.?|(${Mn})?\\.(${Mn}))[pP][+-]?(${Ut})[fFdD]?\\b` },
    // DecimalIntegerLiteral
    { begin: "\\b(0|[1-9](_*[0-9])*)[lL]?\\b" },
    // HexIntegerLiteral
    { begin: `\\b0[xX](${Mn})[lL]?\\b` },
    // OctalIntegerLiteral
    { begin: "\\b0(_*[0-7])*[lL]?\\b" },
    // BinaryIntegerLiteral
    { begin: "\\b0[bB][01](_*[01])*[lL]?\\b" }
  ],
  relevance: 0
};
function Nh(e) {
  const t = {
    keyword: "abstract as val var vararg get set class object open private protected public noinline crossinline dynamic final enum if else do while for when throw try catch finally import package is in fun override companion reified inline lateinit init interface annotation data sealed internal infix operator out by constructor super tailrec where const inner suspend typealias external expect actual",
    built_in: "Byte Short Char Int Long Boolean Float Double Void Unit Nothing",
    literal: "true false null"
  }, n = {
    className: "keyword",
    begin: /\b(break|continue|return|this)\b/,
    starts: { contains: [
      {
        className: "symbol",
        begin: /@\w+/
      }
    ] }
  }, r = {
    className: "symbol",
    begin: e.UNDERSCORE_IDENT_RE + "@"
  }, i = {
    className: "subst",
    begin: /\$\{/,
    end: /\}/,
    contains: [e.C_NUMBER_MODE]
  }, a = {
    className: "variable",
    begin: "\\$" + e.UNDERSCORE_IDENT_RE
  }, o = {
    className: "string",
    variants: [
      {
        begin: '"""',
        end: '"""(?=[^"])',
        contains: [
          a,
          i
        ]
      },
      // Can't use built-in modes easily, as we want to use STRING in the meta
      // context as 'meta-string' and there's no syntax to remove explicitly set
      // classNames in built-in modes.
      {
        begin: "'",
        end: "'",
        illegal: /\n/,
        contains: [e.BACKSLASH_ESCAPE]
      },
      {
        begin: '"',
        end: '"',
        illegal: /\n/,
        contains: [
          e.BACKSLASH_ESCAPE,
          a,
          i
        ]
      }
    ]
  };
  i.contains.push(o);
  const s = {
    className: "meta",
    begin: "@(?:file|property|field|get|set|receiver|param|setparam|delegate)\\s*:(?:\\s*" + e.UNDERSCORE_IDENT_RE + ")?"
  }, l = {
    className: "meta",
    begin: "@" + e.UNDERSCORE_IDENT_RE,
    contains: [
      {
        begin: /\(/,
        end: /\)/,
        contains: [
          e.inherit(o, { className: "string" }),
          "self"
        ]
      }
    ]
  }, c = Th, u = e.COMMENT(
    "/\\*",
    "\\*/",
    { contains: [e.C_BLOCK_COMMENT_MODE] }
  ), d = { variants: [
    {
      className: "type",
      begin: e.UNDERSCORE_IDENT_RE
    },
    {
      begin: /\(/,
      end: /\)/,
      contains: []
      // defined later
    }
  ] }, f = d;
  return f.variants[1].contains = [d], d.variants[1].contains = [f], {
    name: "Kotlin",
    aliases: [
      "kt",
      "kts"
    ],
    keywords: t,
    contains: [
      e.COMMENT(
        "/\\*\\*",
        "\\*/",
        {
          relevance: 0,
          contains: [
            {
              className: "doctag",
              begin: "@[A-Za-z]+"
            }
          ]
        }
      ),
      e.C_LINE_COMMENT_MODE,
      u,
      n,
      r,
      s,
      l,
      {
        className: "function",
        beginKeywords: "fun",
        end: "[(]|$",
        returnBegin: !0,
        excludeEnd: !0,
        keywords: t,
        relevance: 5,
        contains: [
          {
            begin: e.UNDERSCORE_IDENT_RE + "\\s*\\(",
            returnBegin: !0,
            relevance: 0,
            contains: [e.UNDERSCORE_TITLE_MODE]
          },
          {
            className: "type",
            begin: /</,
            end: />/,
            keywords: "reified",
            relevance: 0
          },
          {
            className: "params",
            begin: /\(/,
            end: /\)/,
            endsParent: !0,
            keywords: t,
            relevance: 0,
            contains: [
              {
                begin: /:/,
                end: /[=,\/]/,
                endsWithParent: !0,
                contains: [
                  d,
                  e.C_LINE_COMMENT_MODE,
                  u
                ],
                relevance: 0
              },
              e.C_LINE_COMMENT_MODE,
              u,
              s,
              l,
              o,
              e.C_NUMBER_MODE
            ]
          },
          u
        ]
      },
      {
        begin: [
          /class|interface|trait/,
          /\s+/,
          e.UNDERSCORE_IDENT_RE
        ],
        beginScope: {
          3: "title.class"
        },
        keywords: "class interface trait",
        end: /[:\{(]|$/,
        excludeEnd: !0,
        illegal: "extends implements",
        contains: [
          { beginKeywords: "public protected internal private constructor" },
          e.UNDERSCORE_TITLE_MODE,
          {
            className: "type",
            begin: /</,
            end: />/,
            excludeBegin: !0,
            excludeEnd: !0,
            relevance: 0
          },
          {
            className: "type",
            begin: /[,:]\s*/,
            end: /[<\(,){\s]|$/,
            excludeBegin: !0,
            returnEnd: !0
          },
          s,
          l
        ]
      },
      o,
      {
        className: "meta",
        begin: "^#!/usr/bin/env",
        end: "$",
        illegal: `
`
      },
      c
    ]
  };
}
const Ah = (e) => ({
  IMPORTANT: {
    scope: "meta",
    begin: "!important"
  },
  BLOCK_COMMENT: e.C_BLOCK_COMMENT_MODE,
  HEXCOLOR: {
    scope: "number",
    begin: /#(([0-9a-fA-F]{3,4})|(([0-9a-fA-F]{2}){3,4}))\b/
  },
  FUNCTION_DISPATCH: {
    className: "built_in",
    begin: /[\w-]+(?=\()/
  },
  ATTRIBUTE_SELECTOR_MODE: {
    scope: "selector-attr",
    begin: /\[/,
    end: /\]/,
    illegal: "$",
    contains: [
      e.APOS_STRING_MODE,
      e.QUOTE_STRING_MODE
    ]
  },
  CSS_NUMBER_MODE: {
    scope: "number",
    begin: e.NUMBER_RE + "(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?",
    relevance: 0
  },
  CSS_VARIABLE: {
    className: "attr",
    begin: /--[A-Za-z_][A-Za-z0-9_-]*/
  }
}), Ch = [
  "a",
  "abbr",
  "address",
  "article",
  "aside",
  "audio",
  "b",
  "blockquote",
  "body",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "dd",
  "del",
  "details",
  "dfn",
  "div",
  "dl",
  "dt",
  "em",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hgroup",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "main",
  "mark",
  "menu",
  "nav",
  "object",
  "ol",
  "optgroup",
  "option",
  "p",
  "picture",
  "q",
  "quote",
  "samp",
  "section",
  "select",
  "source",
  "span",
  "strong",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "tr",
  "ul",
  "var",
  "video"
], Rh = [
  "defs",
  "g",
  "marker",
  "mask",
  "pattern",
  "svg",
  "switch",
  "symbol",
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feFlood",
  "feGaussianBlur",
  "feImage",
  "feMerge",
  "feMorphology",
  "feOffset",
  "feSpecularLighting",
  "feTile",
  "feTurbulence",
  "linearGradient",
  "radialGradient",
  "stop",
  "circle",
  "ellipse",
  "image",
  "line",
  "path",
  "polygon",
  "polyline",
  "rect",
  "text",
  "use",
  "textPath",
  "tspan",
  "foreignObject",
  "clipPath"
], Oh = [
  ...Ch,
  ...Rh
], Ih = [
  "any-hover",
  "any-pointer",
  "aspect-ratio",
  "color",
  "color-gamut",
  "color-index",
  "device-aspect-ratio",
  "device-height",
  "device-width",
  "display-mode",
  "forced-colors",
  "grid",
  "height",
  "hover",
  "inverted-colors",
  "monochrome",
  "orientation",
  "overflow-block",
  "overflow-inline",
  "pointer",
  "prefers-color-scheme",
  "prefers-contrast",
  "prefers-reduced-motion",
  "prefers-reduced-transparency",
  "resolution",
  "scan",
  "scripting",
  "update",
  "width",
  // TODO: find a better solution?
  "min-width",
  "max-width",
  "min-height",
  "max-height"
].sort().reverse(), Es = [
  "active",
  "any-link",
  "blank",
  "checked",
  "current",
  "default",
  "defined",
  "dir",
  // dir()
  "disabled",
  "drop",
  "empty",
  "enabled",
  "first",
  "first-child",
  "first-of-type",
  "fullscreen",
  "future",
  "focus",
  "focus-visible",
  "focus-within",
  "has",
  // has()
  "host",
  // host or host()
  "host-context",
  // host-context()
  "hover",
  "indeterminate",
  "in-range",
  "invalid",
  "is",
  // is()
  "lang",
  // lang()
  "last-child",
  "last-of-type",
  "left",
  "link",
  "local-link",
  "not",
  // not()
  "nth-child",
  // nth-child()
  "nth-col",
  // nth-col()
  "nth-last-child",
  // nth-last-child()
  "nth-last-col",
  // nth-last-col()
  "nth-last-of-type",
  //nth-last-of-type()
  "nth-of-type",
  //nth-of-type()
  "only-child",
  "only-of-type",
  "optional",
  "out-of-range",
  "past",
  "placeholder-shown",
  "read-only",
  "read-write",
  "required",
  "right",
  "root",
  "scope",
  "target",
  "target-within",
  "user-invalid",
  "valid",
  "visited",
  "where"
  // where()
].sort().reverse(), _s = [
  "after",
  "backdrop",
  "before",
  "cue",
  "cue-region",
  "first-letter",
  "first-line",
  "grammar-error",
  "marker",
  "part",
  "placeholder",
  "selection",
  "slotted",
  "spelling-error"
].sort().reverse(), Mh = [
  "accent-color",
  "align-content",
  "align-items",
  "align-self",
  "alignment-baseline",
  "all",
  "anchor-name",
  "animation",
  "animation-composition",
  "animation-delay",
  "animation-direction",
  "animation-duration",
  "animation-fill-mode",
  "animation-iteration-count",
  "animation-name",
  "animation-play-state",
  "animation-range",
  "animation-range-end",
  "animation-range-start",
  "animation-timeline",
  "animation-timing-function",
  "appearance",
  "aspect-ratio",
  "backdrop-filter",
  "backface-visibility",
  "background",
  "background-attachment",
  "background-blend-mode",
  "background-clip",
  "background-color",
  "background-image",
  "background-origin",
  "background-position",
  "background-position-x",
  "background-position-y",
  "background-repeat",
  "background-size",
  "baseline-shift",
  "block-size",
  "border",
  "border-block",
  "border-block-color",
  "border-block-end",
  "border-block-end-color",
  "border-block-end-style",
  "border-block-end-width",
  "border-block-start",
  "border-block-start-color",
  "border-block-start-style",
  "border-block-start-width",
  "border-block-style",
  "border-block-width",
  "border-bottom",
  "border-bottom-color",
  "border-bottom-left-radius",
  "border-bottom-right-radius",
  "border-bottom-style",
  "border-bottom-width",
  "border-collapse",
  "border-color",
  "border-end-end-radius",
  "border-end-start-radius",
  "border-image",
  "border-image-outset",
  "border-image-repeat",
  "border-image-slice",
  "border-image-source",
  "border-image-width",
  "border-inline",
  "border-inline-color",
  "border-inline-end",
  "border-inline-end-color",
  "border-inline-end-style",
  "border-inline-end-width",
  "border-inline-start",
  "border-inline-start-color",
  "border-inline-start-style",
  "border-inline-start-width",
  "border-inline-style",
  "border-inline-width",
  "border-left",
  "border-left-color",
  "border-left-style",
  "border-left-width",
  "border-radius",
  "border-right",
  "border-right-color",
  "border-right-style",
  "border-right-width",
  "border-spacing",
  "border-start-end-radius",
  "border-start-start-radius",
  "border-style",
  "border-top",
  "border-top-color",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-top-style",
  "border-top-width",
  "border-width",
  "bottom",
  "box-align",
  "box-decoration-break",
  "box-direction",
  "box-flex",
  "box-flex-group",
  "box-lines",
  "box-ordinal-group",
  "box-orient",
  "box-pack",
  "box-shadow",
  "box-sizing",
  "break-after",
  "break-before",
  "break-inside",
  "caption-side",
  "caret-color",
  "clear",
  "clip",
  "clip-path",
  "clip-rule",
  "color",
  "color-interpolation",
  "color-interpolation-filters",
  "color-profile",
  "color-rendering",
  "color-scheme",
  "column-count",
  "column-fill",
  "column-gap",
  "column-rule",
  "column-rule-color",
  "column-rule-style",
  "column-rule-width",
  "column-span",
  "column-width",
  "columns",
  "contain",
  "contain-intrinsic-block-size",
  "contain-intrinsic-height",
  "contain-intrinsic-inline-size",
  "contain-intrinsic-size",
  "contain-intrinsic-width",
  "container",
  "container-name",
  "container-type",
  "content",
  "content-visibility",
  "counter-increment",
  "counter-reset",
  "counter-set",
  "cue",
  "cue-after",
  "cue-before",
  "cursor",
  "cx",
  "cy",
  "direction",
  "display",
  "dominant-baseline",
  "empty-cells",
  "enable-background",
  "field-sizing",
  "fill",
  "fill-opacity",
  "fill-rule",
  "filter",
  "flex",
  "flex-basis",
  "flex-direction",
  "flex-flow",
  "flex-grow",
  "flex-shrink",
  "flex-wrap",
  "float",
  "flood-color",
  "flood-opacity",
  "flow",
  "font",
  "font-display",
  "font-family",
  "font-feature-settings",
  "font-kerning",
  "font-language-override",
  "font-optical-sizing",
  "font-palette",
  "font-size",
  "font-size-adjust",
  "font-smooth",
  "font-smoothing",
  "font-stretch",
  "font-style",
  "font-synthesis",
  "font-synthesis-position",
  "font-synthesis-small-caps",
  "font-synthesis-style",
  "font-synthesis-weight",
  "font-variant",
  "font-variant-alternates",
  "font-variant-caps",
  "font-variant-east-asian",
  "font-variant-emoji",
  "font-variant-ligatures",
  "font-variant-numeric",
  "font-variant-position",
  "font-variation-settings",
  "font-weight",
  "forced-color-adjust",
  "gap",
  "glyph-orientation-horizontal",
  "glyph-orientation-vertical",
  "grid",
  "grid-area",
  "grid-auto-columns",
  "grid-auto-flow",
  "grid-auto-rows",
  "grid-column",
  "grid-column-end",
  "grid-column-start",
  "grid-gap",
  "grid-row",
  "grid-row-end",
  "grid-row-start",
  "grid-template",
  "grid-template-areas",
  "grid-template-columns",
  "grid-template-rows",
  "hanging-punctuation",
  "height",
  "hyphenate-character",
  "hyphenate-limit-chars",
  "hyphens",
  "icon",
  "image-orientation",
  "image-rendering",
  "image-resolution",
  "ime-mode",
  "initial-letter",
  "initial-letter-align",
  "inline-size",
  "inset",
  "inset-area",
  "inset-block",
  "inset-block-end",
  "inset-block-start",
  "inset-inline",
  "inset-inline-end",
  "inset-inline-start",
  "isolation",
  "justify-content",
  "justify-items",
  "justify-self",
  "kerning",
  "left",
  "letter-spacing",
  "lighting-color",
  "line-break",
  "line-height",
  "line-height-step",
  "list-style",
  "list-style-image",
  "list-style-position",
  "list-style-type",
  "margin",
  "margin-block",
  "margin-block-end",
  "margin-block-start",
  "margin-bottom",
  "margin-inline",
  "margin-inline-end",
  "margin-inline-start",
  "margin-left",
  "margin-right",
  "margin-top",
  "margin-trim",
  "marker",
  "marker-end",
  "marker-mid",
  "marker-start",
  "marks",
  "mask",
  "mask-border",
  "mask-border-mode",
  "mask-border-outset",
  "mask-border-repeat",
  "mask-border-slice",
  "mask-border-source",
  "mask-border-width",
  "mask-clip",
  "mask-composite",
  "mask-image",
  "mask-mode",
  "mask-origin",
  "mask-position",
  "mask-repeat",
  "mask-size",
  "mask-type",
  "masonry-auto-flow",
  "math-depth",
  "math-shift",
  "math-style",
  "max-block-size",
  "max-height",
  "max-inline-size",
  "max-width",
  "min-block-size",
  "min-height",
  "min-inline-size",
  "min-width",
  "mix-blend-mode",
  "nav-down",
  "nav-index",
  "nav-left",
  "nav-right",
  "nav-up",
  "none",
  "normal",
  "object-fit",
  "object-position",
  "offset",
  "offset-anchor",
  "offset-distance",
  "offset-path",
  "offset-position",
  "offset-rotate",
  "opacity",
  "order",
  "orphans",
  "outline",
  "outline-color",
  "outline-offset",
  "outline-style",
  "outline-width",
  "overflow",
  "overflow-anchor",
  "overflow-block",
  "overflow-clip-margin",
  "overflow-inline",
  "overflow-wrap",
  "overflow-x",
  "overflow-y",
  "overlay",
  "overscroll-behavior",
  "overscroll-behavior-block",
  "overscroll-behavior-inline",
  "overscroll-behavior-x",
  "overscroll-behavior-y",
  "padding",
  "padding-block",
  "padding-block-end",
  "padding-block-start",
  "padding-bottom",
  "padding-inline",
  "padding-inline-end",
  "padding-inline-start",
  "padding-left",
  "padding-right",
  "padding-top",
  "page",
  "page-break-after",
  "page-break-before",
  "page-break-inside",
  "paint-order",
  "pause",
  "pause-after",
  "pause-before",
  "perspective",
  "perspective-origin",
  "place-content",
  "place-items",
  "place-self",
  "pointer-events",
  "position",
  "position-anchor",
  "position-visibility",
  "print-color-adjust",
  "quotes",
  "r",
  "resize",
  "rest",
  "rest-after",
  "rest-before",
  "right",
  "rotate",
  "row-gap",
  "ruby-align",
  "ruby-position",
  "scale",
  "scroll-behavior",
  "scroll-margin",
  "scroll-margin-block",
  "scroll-margin-block-end",
  "scroll-margin-block-start",
  "scroll-margin-bottom",
  "scroll-margin-inline",
  "scroll-margin-inline-end",
  "scroll-margin-inline-start",
  "scroll-margin-left",
  "scroll-margin-right",
  "scroll-margin-top",
  "scroll-padding",
  "scroll-padding-block",
  "scroll-padding-block-end",
  "scroll-padding-block-start",
  "scroll-padding-bottom",
  "scroll-padding-inline",
  "scroll-padding-inline-end",
  "scroll-padding-inline-start",
  "scroll-padding-left",
  "scroll-padding-right",
  "scroll-padding-top",
  "scroll-snap-align",
  "scroll-snap-stop",
  "scroll-snap-type",
  "scroll-timeline",
  "scroll-timeline-axis",
  "scroll-timeline-name",
  "scrollbar-color",
  "scrollbar-gutter",
  "scrollbar-width",
  "shape-image-threshold",
  "shape-margin",
  "shape-outside",
  "shape-rendering",
  "speak",
  "speak-as",
  "src",
  // @font-face
  "stop-color",
  "stop-opacity",
  "stroke",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "stroke-opacity",
  "stroke-width",
  "tab-size",
  "table-layout",
  "text-align",
  "text-align-all",
  "text-align-last",
  "text-anchor",
  "text-combine-upright",
  "text-decoration",
  "text-decoration-color",
  "text-decoration-line",
  "text-decoration-skip",
  "text-decoration-skip-ink",
  "text-decoration-style",
  "text-decoration-thickness",
  "text-emphasis",
  "text-emphasis-color",
  "text-emphasis-position",
  "text-emphasis-style",
  "text-indent",
  "text-justify",
  "text-orientation",
  "text-overflow",
  "text-rendering",
  "text-shadow",
  "text-size-adjust",
  "text-transform",
  "text-underline-offset",
  "text-underline-position",
  "text-wrap",
  "text-wrap-mode",
  "text-wrap-style",
  "timeline-scope",
  "top",
  "touch-action",
  "transform",
  "transform-box",
  "transform-origin",
  "transform-style",
  "transition",
  "transition-behavior",
  "transition-delay",
  "transition-duration",
  "transition-property",
  "transition-timing-function",
  "translate",
  "unicode-bidi",
  "user-modify",
  "user-select",
  "vector-effect",
  "vertical-align",
  "view-timeline",
  "view-timeline-axis",
  "view-timeline-inset",
  "view-timeline-name",
  "view-transition-name",
  "visibility",
  "voice-balance",
  "voice-duration",
  "voice-family",
  "voice-pitch",
  "voice-range",
  "voice-rate",
  "voice-stress",
  "voice-volume",
  "white-space",
  "white-space-collapse",
  "widows",
  "width",
  "will-change",
  "word-break",
  "word-spacing",
  "word-wrap",
  "writing-mode",
  "x",
  "y",
  "z-index",
  "zoom"
].sort().reverse(), Lh = Es.concat(_s).sort().reverse();
function Dh(e) {
  const t = Ah(e), n = Lh, r = "and or not only", i = "[\\w-]+", a = "(" + i + "|@\\{" + i + "\\})", o = [], s = [], l = function(w) {
    return {
      // Less strings are not multiline (also include '~' for more consistent coloring of "escaped" strings)
      className: "string",
      begin: "~?" + w + ".*?" + w
    };
  }, c = function(w, N, A) {
    return {
      className: w,
      begin: N,
      relevance: A
    };
  }, u = {
    $pattern: /[a-z-]+/,
    keyword: r,
    attribute: Ih.join(" ")
  }, d = {
    // used only to properly balance nested parens inside mixin call, def. arg list
    begin: "\\(",
    end: "\\)",
    contains: s,
    keywords: u,
    relevance: 0
  };
  s.push(
    e.C_LINE_COMMENT_MODE,
    e.C_BLOCK_COMMENT_MODE,
    l("'"),
    l('"'),
    t.CSS_NUMBER_MODE,
    // fixme: it does not include dot for numbers like .5em :(
    {
      begin: "(url|data-uri)\\(",
      starts: {
        className: "string",
        end: "[\\)\\n]",
        excludeEnd: !0
      }
    },
    t.HEXCOLOR,
    d,
    c("variable", "@@?" + i, 10),
    c("variable", "@\\{" + i + "\\}"),
    c("built_in", "~?`[^`]*?`"),
    // inline javascript (or whatever host language) *multiline* string
    {
      // @media features (it’s here to not duplicate things in AT_RULE_MODE with extra PARENS_MODE overriding):
      className: "attribute",
      begin: i + "\\s*:",
      end: ":",
      returnBegin: !0,
      excludeEnd: !0
    },
    t.IMPORTANT,
    { beginKeywords: "and not" },
    t.FUNCTION_DISPATCH
  );
  const f = s.concat({
    begin: /\{/,
    end: /\}/,
    contains: o
  }), p = {
    beginKeywords: "when",
    endsWithParent: !0,
    contains: [{ beginKeywords: "and not" }].concat(s)
    // using this form to override VALUE’s 'function' match
  }, m = {
    begin: a + "\\s*:",
    returnBegin: !0,
    end: /[;}]/,
    relevance: 0,
    contains: [
      { begin: /-(webkit|moz|ms|o)-/ },
      t.CSS_VARIABLE,
      {
        className: "attribute",
        begin: "\\b(" + Mh.join("|") + ")\\b",
        end: /(?=:)/,
        starts: {
          endsWithParent: !0,
          illegal: "[<=$]",
          relevance: 0,
          contains: s
        }
      }
    ]
  }, h = {
    className: "keyword",
    begin: "@(import|media|charset|font-face|(-[a-z]+-)?keyframes|supports|document|namespace|page|viewport|host)\\b",
    starts: {
      end: "[;{}]",
      keywords: u,
      returnEnd: !0,
      contains: s,
      relevance: 0
    }
  }, k = {
    className: "variable",
    variants: [
      // using more strict pattern for higher relevance to increase chances of Less detection.
      // this is *the only* Less specific statement used in most of the sources, so...
      // (we’ll still often loose to the css-parser unless there's '//' comment,
      // simply because 1 variable just can't beat 99 properties :)
      {
        begin: "@" + i + "\\s*:",
        relevance: 15
      },
      { begin: "@" + i }
    ],
    starts: {
      end: "[;}]",
      returnEnd: !0,
      contains: f
    }
  }, y = {
    // first parse unambiguous selectors (i.e. those not starting with tag)
    // then fall into the scary lookahead-discriminator variant.
    // this mode also handles mixin definitions and calls
    variants: [
      {
        begin: "[\\.#:&\\[>]",
        end: "[;{}]"
        // mixin calls end with ';'
      },
      {
        begin: a,
        end: /\{/
      }
    ],
    returnBegin: !0,
    returnEnd: !0,
    illegal: `[<='$"]`,
    relevance: 0,
    contains: [
      e.C_LINE_COMMENT_MODE,
      e.C_BLOCK_COMMENT_MODE,
      p,
      c("keyword", "all\\b"),
      c("variable", "@\\{" + i + "\\}"),
      // otherwise it’s identified as tag
      {
        begin: "\\b(" + Oh.join("|") + ")\\b",
        className: "selector-tag"
      },
      t.CSS_NUMBER_MODE,
      c("selector-tag", a, 0),
      c("selector-id", "#" + a),
      c("selector-class", "\\." + a, 0),
      c("selector-tag", "&", 0),
      t.ATTRIBUTE_SELECTOR_MODE,
      {
        className: "selector-pseudo",
        begin: ":(" + Es.join("|") + ")"
      },
      {
        className: "selector-pseudo",
        begin: ":(:)?(" + _s.join("|") + ")"
      },
      {
        begin: /\(/,
        end: /\)/,
        relevance: 0,
        contains: f
      },
      // argument list of parametric mixins
      { begin: "!important" },
      // eat !important after mixin call or it will be colored as tag
      t.FUNCTION_DISPATCH
    ]
  }, S = {
    begin: i + `:(:)?(${n.join("|")})`,
    returnBegin: !0,
    contains: [y]
  };
  return o.push(
    e.C_LINE_COMMENT_MODE,
    e.C_BLOCK_COMMENT_MODE,
    h,
    k,
    S,
    m,
    y,
    p,
    t.FUNCTION_DISPATCH
  ), {
    name: "Less",
    case_insensitive: !0,
    illegal: `[=>'/<($"]`,
    contains: o
  };
}
function Ph(e) {
  const t = "\\[=*\\[", n = "\\]=*\\]", r = {
    begin: t,
    end: n,
    contains: ["self"]
  }, i = [
    e.COMMENT("--(?!" + t + ")", "$"),
    e.COMMENT(
      "--" + t,
      n,
      {
        contains: [r],
        relevance: 10
      }
    )
  ];
  return {
    name: "Lua",
    aliases: ["pluto"],
    keywords: {
      $pattern: e.UNDERSCORE_IDENT_RE,
      literal: "true false nil",
      keyword: "and break do else elseif end for goto if in local not or repeat return then until while",
      built_in: (
        // Metatags and globals:
        "_G _ENV _VERSION __index __newindex __mode __call __metatable __tostring __len __gc __add __sub __mul __div __mod __pow __concat __unm __eq __lt __le assert collectgarbage dofile error getfenv getmetatable ipairs load loadfile loadstring module next pairs pcall print rawequal rawget rawset require select setfenv setmetatable tonumber tostring type unpack xpcall arg self coroutine resume yield status wrap create running debug getupvalue debug sethook getmetatable gethook setmetatable setlocal traceback setfenv getinfo setupvalue getlocal getregistry getfenv io lines write close flush open output type read stderr stdin input stdout popen tmpfile math log max acos huge ldexp pi cos tanh pow deg tan cosh sinh random randomseed frexp ceil floor rad abs sqrt modf asin min mod fmod log10 atan2 exp sin atan os exit setlocale date getenv difftime remove time clock tmpname rename execute package preload loadlib loaded loaders cpath config path seeall string sub upper len gfind rep find match char dump gmatch reverse byte format gsub lower table setn insert getn foreachi maxn foreach concat sort remove"
      )
    },
    contains: i.concat([
      {
        className: "function",
        beginKeywords: "function",
        end: "\\)",
        contains: [
          e.inherit(e.TITLE_MODE, { begin: "([_a-zA-Z]\\w*\\.)*([_a-zA-Z]\\w*:)?[_a-zA-Z]\\w*" }),
          {
            className: "params",
            begin: "\\(",
            endsWithParent: !0,
            contains: i
          }
        ].concat(i)
      },
      e.C_NUMBER_MODE,
      e.APOS_STRING_MODE,
      e.QUOTE_STRING_MODE,
      {
        className: "string",
        begin: t,
        end: n,
        contains: [r],
        relevance: 5
      }
    ])
  };
}
function Bh(e) {
  const t = {
    className: "variable",
    variants: [
      {
        begin: "\\$\\(" + e.UNDERSCORE_IDENT_RE + "\\)",
        contains: [e.BACKSLASH_ESCAPE]
      },
      { begin: /\$[@%<?\^\+\*]/ }
    ]
  }, n = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [
      e.BACKSLASH_ESCAPE,
      t
    ]
  }, r = {
    className: "variable",
    begin: /\$\([\w-]+\s/,
    end: /\)/,
    keywords: { built_in: "subst patsubst strip findstring filter filter-out sort word wordlist firstword lastword dir notdir suffix basename addsuffix addprefix join wildcard realpath abspath error warning shell origin flavor foreach if or and call eval file value" },
    contains: [
      t,
      n
      // Added QUOTE_STRING as they can be a part of functions
    ]
  }, i = { begin: "^" + e.UNDERSCORE_IDENT_RE + "\\s*(?=[:+?]?=)" }, a = {
    className: "meta",
    begin: /^\.PHONY:/,
    end: /$/,
    keywords: {
      $pattern: /[\.\w]+/,
      keyword: ".PHONY"
    }
  }, o = {
    className: "section",
    begin: /^[^\s]+:/,
    end: /$/,
    contains: [t]
  };
  return {
    name: "Makefile",
    aliases: [
      "mk",
      "mak",
      "make"
    ],
    keywords: {
      $pattern: /[\w-]+/,
      keyword: "define endef undefine ifdef ifndef ifeq ifneq else endif include -include sinclude override export unexport private vpath"
    },
    contains: [
      e.HASH_COMMENT_MODE,
      t,
      n,
      r,
      i,
      a,
      o
    ]
  };
}
function Gr(e) {
  const t = e.regex, n = {
    begin: /<\/?[A-Za-z_]/,
    end: ">",
    subLanguage: "xml",
    relevance: 0
  }, r = {
    begin: "^[-\\*]{3,}",
    end: "$"
  }, i = {
    className: "code",
    variants: [
      // TODO: fix to allow these to work with sublanguage also
      { begin: "(`{3,})[^`](.|\\n)*?\\1`*[ ]*" },
      { begin: "(~{3,})[^~](.|\\n)*?\\1~*[ ]*" },
      // needed to allow markdown as a sublanguage to work
      {
        begin: "```",
        end: "```+[ ]*$"
      },
      {
        begin: "~~~",
        end: "~~~+[ ]*$"
      },
      { begin: "`.+?`" },
      {
        begin: "(?=^( {4}|\\t))",
        // use contains to gobble up multiple lines to allow the block to be whatever size
        // but only have a single open/close tag vs one per line
        contains: [
          {
            begin: "^( {4}|\\t)",
            end: "(\\n)$"
          }
        ],
        relevance: 0
      }
    ]
  }, a = {
    className: "bullet",
    begin: "^[ 	]*([*+-]|(\\d+\\.))(?=\\s+)",
    end: "\\s+",
    excludeEnd: !0
  }, o = {
    begin: /^\[[^\n]+\]:/,
    returnBegin: !0,
    contains: [
      {
        className: "symbol",
        begin: /\[/,
        end: /\]/,
        excludeBegin: !0,
        excludeEnd: !0
      },
      {
        className: "link",
        begin: /:\s*/,
        end: /$/,
        excludeBegin: !0
      }
    ]
  }, s = /[A-Za-z][A-Za-z0-9+.-]*/, l = {
    variants: [
      // too much like nested array access in so many languages
      // to have any real relevance
      {
        begin: /\[.+?\]\[.*?\]/,
        relevance: 0
      },
      // popular internet URLs
      {
        begin: /\[.+?\]\(((data|javascript|mailto):|(?:http|ftp)s?:\/\/).*?\)/,
        relevance: 2
      },
      {
        begin: t.concat(/\[.+?\]\(/, s, /:\/\/.*?\)/),
        relevance: 2
      },
      // relative urls
      {
        begin: /\[.+?\]\([./?&#].*?\)/,
        relevance: 1
      },
      // whatever else, lower relevance (might not be a link at all)
      {
        begin: /\[.*?\]\(.*?\)/,
        relevance: 0
      }
    ],
    returnBegin: !0,
    contains: [
      {
        // empty strings for alt or link text
        match: /\[(?=\])/
      },
      {
        className: "string",
        relevance: 0,
        begin: "\\[",
        end: "\\]",
        excludeBegin: !0,
        returnEnd: !0
      },
      {
        className: "link",
        relevance: 0,
        begin: "\\]\\(",
        end: "\\)",
        excludeBegin: !0,
        excludeEnd: !0
      },
      {
        className: "symbol",
        relevance: 0,
        begin: "\\]\\[",
        end: "\\]",
        excludeBegin: !0,
        excludeEnd: !0
      }
    ]
  }, c = {
    className: "strong",
    contains: [],
    // defined later
    variants: [
      {
        begin: /_{2}(?!\s)/,
        end: /_{2}/
      },
      {
        begin: /\*{2}(?!\s)/,
        end: /\*{2}/
      }
    ]
  }, u = {
    className: "emphasis",
    contains: [],
    // defined later
    variants: [
      {
        begin: /\*(?![*\s])/,
        end: /\*/
      },
      {
        begin: /_(?![_\s])/,
        end: /_/,
        relevance: 0
      }
    ]
  }, d = e.inherit(c, { contains: [] }), f = e.inherit(u, { contains: [] });
  c.contains.push(f), u.contains.push(d);
  let p = [
    n,
    l
  ];
  return [
    c,
    u,
    d,
    f
  ].forEach((y) => {
    y.contains = y.contains.concat(p);
  }), p = p.concat(c, u), {
    name: "Markdown",
    aliases: [
      "md",
      "mkdown",
      "mkd"
    ],
    contains: [
      {
        className: "section",
        variants: [
          {
            begin: "^#{1,6}",
            end: "$",
            contains: p
          },
          {
            begin: "(?=^.+?\\n[=-]{2,}$)",
            contains: [
              { begin: "^[=-]*$" },
              {
                begin: "^",
                end: "\\n",
                contains: p
              }
            ]
          }
        ]
      },
      n,
      a,
      c,
      u,
      {
        className: "quote",
        begin: "^>\\s+",
        contains: p,
        end: "$"
      },
      i,
      r,
      l,
      o,
      {
        //https://spec.commonmark.org/0.31.2/#entity-references
        scope: "literal",
        match: /&([a-zA-Z0-9]+|#[0-9]{1,7}|#[Xx][0-9a-fA-F]{1,6});/
      }
    ]
  };
}
function Fh(e) {
  const t = {
    className: "built_in",
    begin: "\\b(AV|CA|CF|CG|CI|CL|CM|CN|CT|MK|MP|MTK|MTL|NS|SCN|SK|UI|WK|XC)\\w+"
  }, n = /[a-zA-Z@][a-zA-Z0-9_]*/, s = {
    "variable.language": [
      "this",
      "super"
    ],
    $pattern: n,
    keyword: [
      "while",
      "export",
      "sizeof",
      "typedef",
      "const",
      "struct",
      "for",
      "union",
      "volatile",
      "static",
      "mutable",
      "if",
      "do",
      "return",
      "goto",
      "enum",
      "else",
      "break",
      "extern",
      "asm",
      "case",
      "default",
      "register",
      "explicit",
      "typename",
      "switch",
      "continue",
      "inline",
      "readonly",
      "assign",
      "readwrite",
      "self",
      "@synchronized",
      "id",
      "typeof",
      "nonatomic",
      "IBOutlet",
      "IBAction",
      "strong",
      "weak",
      "copy",
      "in",
      "out",
      "inout",
      "bycopy",
      "byref",
      "oneway",
      "__strong",
      "__weak",
      "__block",
      "__autoreleasing",
      "@private",
      "@protected",
      "@public",
      "@try",
      "@property",
      "@end",
      "@throw",
      "@catch",
      "@finally",
      "@autoreleasepool",
      "@synthesize",
      "@dynamic",
      "@selector",
      "@optional",
      "@required",
      "@encode",
      "@package",
      "@import",
      "@defs",
      "@compatibility_alias",
      "__bridge",
      "__bridge_transfer",
      "__bridge_retained",
      "__bridge_retain",
      "__covariant",
      "__contravariant",
      "__kindof",
      "_Nonnull",
      "_Nullable",
      "_Null_unspecified",
      "__FUNCTION__",
      "__PRETTY_FUNCTION__",
      "__attribute__",
      "getter",
      "setter",
      "retain",
      "unsafe_unretained",
      "nonnull",
      "nullable",
      "null_unspecified",
      "null_resettable",
      "class",
      "instancetype",
      "NS_DESIGNATED_INITIALIZER",
      "NS_UNAVAILABLE",
      "NS_REQUIRES_SUPER",
      "NS_RETURNS_INNER_POINTER",
      "NS_INLINE",
      "NS_AVAILABLE",
      "NS_DEPRECATED",
      "NS_ENUM",
      "NS_OPTIONS",
      "NS_SWIFT_UNAVAILABLE",
      "NS_ASSUME_NONNULL_BEGIN",
      "NS_ASSUME_NONNULL_END",
      "NS_REFINED_FOR_SWIFT",
      "NS_SWIFT_NAME",
      "NS_SWIFT_NOTHROW",
      "NS_DURING",
      "NS_HANDLER",
      "NS_ENDHANDLER",
      "NS_VALUERETURN",
      "NS_VOIDRETURN"
    ],
    literal: [
      "false",
      "true",
      "FALSE",
      "TRUE",
      "nil",
      "YES",
      "NO",
      "NULL"
    ],
    built_in: [
      "dispatch_once_t",
      "dispatch_queue_t",
      "dispatch_sync",
      "dispatch_async",
      "dispatch_once"
    ],
    type: [
      "int",
      "float",
      "char",
      "unsigned",
      "signed",
      "short",
      "long",
      "double",
      "wchar_t",
      "unichar",
      "void",
      "bool",
      "BOOL",
      "id|0",
      "_Bool"
    ]
  }, l = {
    $pattern: n,
    keyword: [
      "@interface",
      "@class",
      "@protocol",
      "@implementation"
    ]
  };
  return {
    name: "Objective-C",
    aliases: [
      "mm",
      "objc",
      "obj-c",
      "obj-c++",
      "objective-c++"
    ],
    keywords: s,
    illegal: "</",
    contains: [
      t,
      e.C_LINE_COMMENT_MODE,
      e.C_BLOCK_COMMENT_MODE,
      e.C_NUMBER_MODE,
      e.QUOTE_STRING_MODE,
      e.APOS_STRING_MODE,
      {
        className: "string",
        variants: [
          {
            begin: '@"',
            end: '"',
            illegal: "\\n",
            contains: [e.BACKSLASH_ESCAPE]
          }
        ]
      },
      {
        className: "meta",
        begin: /#\s*[a-z]+\b/,
        end: /$/,
        keywords: { keyword: "if else elif endif define undef warning error line pragma ifdef ifndef include" },
        contains: [
          {
            begin: /\\\n/,
            relevance: 0
          },
          e.inherit(e.QUOTE_STRING_MODE, { className: "string" }),
          {
            className: "string",
            begin: /<.*?>/,
            end: /$/,
            illegal: "\\n"
          },
          e.C_LINE_COMMENT_MODE,
          e.C_BLOCK_COMMENT_MODE
        ]
      },
      {
        className: "class",
        begin: "(" + l.keyword.join("|") + ")\\b",
        end: /(\{|$)/,
        excludeEnd: !0,
        keywords: l,
        contains: [e.UNDERSCORE_TITLE_MODE]
      },
      {
        begin: "\\." + e.UNDERSCORE_IDENT_RE,
        relevance: 0
      }
    ]
  };
}
function zh(e) {
  const t = e.regex, n = [
    "abs",
    "accept",
    "alarm",
    "and",
    "atan2",
    "bind",
    "binmode",
    "bless",
    "break",
    "caller",
    "chdir",
    "chmod",
    "chomp",
    "chop",
    "chown",
    "chr",
    "chroot",
    "class",
    "close",
    "closedir",
    "connect",
    "continue",
    "cos",
    "crypt",
    "dbmclose",
    "dbmopen",
    "defined",
    "delete",
    "die",
    "do",
    "dump",
    "each",
    "else",
    "elsif",
    "endgrent",
    "endhostent",
    "endnetent",
    "endprotoent",
    "endpwent",
    "endservent",
    "eof",
    "eval",
    "exec",
    "exists",
    "exit",
    "exp",
    "fcntl",
    "field",
    "fileno",
    "flock",
    "for",
    "foreach",
    "fork",
    "format",
    "formline",
    "getc",
    "getgrent",
    "getgrgid",
    "getgrnam",
    "gethostbyaddr",
    "gethostbyname",
    "gethostent",
    "getlogin",
    "getnetbyaddr",
    "getnetbyname",
    "getnetent",
    "getpeername",
    "getpgrp",
    "getpriority",
    "getprotobyname",
    "getprotobynumber",
    "getprotoent",
    "getpwent",
    "getpwnam",
    "getpwuid",
    "getservbyname",
    "getservbyport",
    "getservent",
    "getsockname",
    "getsockopt",
    "given",
    "glob",
    "gmtime",
    "goto",
    "grep",
    "gt",
    "hex",
    "if",
    "index",
    "int",
    "ioctl",
    "join",
    "keys",
    "kill",
    "last",
    "lc",
    "lcfirst",
    "length",
    "link",
    "listen",
    "local",
    "localtime",
    "log",
    "lstat",
    "lt",
    "ma",
    "map",
    "method",
    "mkdir",
    "msgctl",
    "msgget",
    "msgrcv",
    "msgsnd",
    "my",
    "ne",
    "next",
    "no",
    "not",
    "oct",
    "open",
    "opendir",
    "or",
    "ord",
    "our",
    "pack",
    "package",
    "pipe",
    "pop",
    "pos",
    "print",
    "printf",
    "prototype",
    "push",
    "q|0",
    "qq",
    "quotemeta",
    "qw",
    "qx",
    "rand",
    "read",
    "readdir",
    "readline",
    "readlink",
    "readpipe",
    "recv",
    "redo",
    "ref",
    "rename",
    "require",
    "reset",
    "return",
    "reverse",
    "rewinddir",
    "rindex",
    "rmdir",
    "say",
    "scalar",
    "seek",
    "seekdir",
    "select",
    "semctl",
    "semget",
    "semop",
    "send",
    "setgrent",
    "sethostent",
    "setnetent",
    "setpgrp",
    "setpriority",
    "setprotoent",
    "setpwent",
    "setservent",
    "setsockopt",
    "shift",
    "shmctl",
    "shmget",
    "shmread",
    "shmwrite",
    "shutdown",
    "sin",
    "sleep",
    "socket",
    "socketpair",
    "sort",
    "splice",
    "split",
    "sprintf",
    "sqrt",
    "srand",
    "stat",
    "state",
    "study",
    "sub",
    "substr",
    "symlink",
    "syscall",
    "sysopen",
    "sysread",
    "sysseek",
    "system",
    "syswrite",
    "tell",
    "telldir",
    "tie",
    "tied",
    "time",
    "times",
    "tr",
    "truncate",
    "uc",
    "ucfirst",
    "umask",
    "undef",
    "unless",
    "unlink",
    "unpack",
    "unshift",
    "untie",
    "until",
    "use",
    "utime",
    "values",
    "vec",
    "wait",
    "waitpid",
    "wantarray",
    "warn",
    "when",
    "while",
    "write",
    "x|0",
    "xor",
    "y|0"
  ], r = /[dualxmsipngr]{0,12}/, i = {
    $pattern: /[\w.]+/,
    keyword: n.join(" ")
  }, a = {
    className: "subst",
    begin: "[$@]\\{",
    end: "\\}",
    keywords: i
  }, o = {
    begin: /->\{/,
    end: /\}/
    // contains defined later
  }, s = {
    scope: "attr",
    match: /\s+:\s*\w+(\s*\(.*?\))?/
  }, l = {
    scope: "variable",
    variants: [
      { begin: /\$\d/ },
      {
        begin: t.concat(
          /[$%@](?!")(\^\w\b|#\w+(::\w+)*|\{\w+\}|\w+(::\w*)*)/,
          // negative look-ahead tries to avoid matching patterns that are not
          // Perl at all like $ident$, @ident@, etc.
          "(?![A-Za-z])(?![@$%])"
        )
      },
      {
        // Only $= is a special Perl variable and one can't declare @= or %=.
        begin: /[$%@](?!")[^\s\w{=]|\$=/,
        relevance: 0
      }
    ],
    contains: [s]
  }, c = {
    className: "number",
    variants: [
      // decimal numbers:
      // include the case where a number starts with a dot (eg. .9), and
      // the leading 0? avoids mixing the first and second match on 0.x cases
      { match: /0?\.[0-9][0-9_]+\b/ },
      // include the special versioned number (eg. v5.38)
      { match: /\bv?(0|[1-9][0-9_]*(\.[0-9_]+)?|[1-9][0-9_]*)\b/ },
      // non-decimal numbers:
      { match: /\b0[0-7][0-7_]*\b/ },
      { match: /\b0x[0-9a-fA-F][0-9a-fA-F_]*\b/ },
      { match: /\b0b[0-1][0-1_]*\b/ }
    ],
    relevance: 0
  }, u = [
    e.BACKSLASH_ESCAPE,
    a,
    l
  ], d = [
    /!/,
    /\//,
    /\|/,
    /\?/,
    /'/,
    /"/,
    // valid but infrequent and weird
    /#/
    // valid but infrequent and weird
  ], f = (h, k, y = "\\1") => {
    const S = y === "\\1" ? y : t.concat(y, k);
    return t.concat(
      t.concat("(?:", h, ")"),
      k,
      /(?:\\.|[^\\\/])*?/,
      S,
      /(?:\\.|[^\\\/])*?/,
      y,
      r
    );
  }, p = (h, k, y) => t.concat(
    t.concat("(?:", h, ")"),
    k,
    /(?:\\.|[^\\\/])*?/,
    y,
    r
  ), m = [
    l,
    e.HASH_COMMENT_MODE,
    e.COMMENT(
      /^=\w/,
      /=cut/,
      { endsWithParent: !0 }
    ),
    o,
    {
      className: "string",
      contains: u,
      variants: [
        {
          begin: "q[qwxr]?\\s*\\(",
          end: "\\)",
          relevance: 5
        },
        {
          begin: "q[qwxr]?\\s*\\[",
          end: "\\]",
          relevance: 5
        },
        {
          begin: "q[qwxr]?\\s*\\{",
          end: "\\}",
          relevance: 5
        },
        {
          begin: "q[qwxr]?\\s*\\|",
          end: "\\|",
          relevance: 5
        },
        {
          begin: "q[qwxr]?\\s*<",
          end: ">",
          relevance: 5
        },
        {
          begin: "qw\\s+q",
          end: "q",
          relevance: 5
        },
        {
          begin: "'",
          end: "'",
          contains: [e.BACKSLASH_ESCAPE]
        },
        {
          begin: '"',
          end: '"'
        },
        {
          begin: "`",
          end: "`",
          contains: [e.BACKSLASH_ESCAPE]
        },
        {
          begin: /\{\w+\}/,
          relevance: 0
        },
        {
          begin: "-?\\w+\\s*=>",
          relevance: 0
        }
      ]
    },
    c,
    {
      // regexp container
      begin: "(\\/\\/|" + e.RE_STARTERS_RE + "|\\b(split|return|print|reverse|grep)\\b)\\s*",
      keywords: "split return print reverse grep",
      relevance: 0,
      contains: [
        e.HASH_COMMENT_MODE,
        {
          className: "regexp",
          variants: [
            // allow matching common delimiters
            { begin: f("s|tr|y", t.either(...d, { capture: !0 })) },
            // and then paired delmis
            { begin: f("s|tr|y", "\\(", "\\)") },
            { begin: f("s|tr|y", "\\[", "\\]") },
            { begin: f("s|tr|y", "\\{", "\\}") }
          ],
          relevance: 2
        },
        {
          className: "regexp",
          variants: [
            {
              // could be a comment in many languages so do not count
              // as relevant
              begin: /(m|qr)\/\//,
              relevance: 0
            },
            // prefix is optional with /regex/
            { begin: p("(?:m|qr)?", /\//, /\//) },
            // allow matching common delimiters
            { begin: p("m|qr", t.either(...d, { capture: !0 }), /\1/) },
            // allow common paired delmins
            { begin: p("m|qr", /\(/, /\)/) },
            { begin: p("m|qr", /\[/, /\]/) },
            { begin: p("m|qr", /\{/, /\}/) }
          ]
        }
      ]
    },
    {
      className: "function",
      beginKeywords: "sub method",
      end: "(\\s*\\(.*?\\))?[;{]",
      excludeEnd: !0,
      relevance: 5,
      contains: [e.TITLE_MODE, s]
    },
    {
      className: "class",
      beginKeywords: "class",
      end: "[;{]",
      excludeEnd: !0,
      relevance: 5,
      contains: [e.TITLE_MODE, s, c]
    },
    {
      begin: "-\\w\\b",
      relevance: 0
    },
    {
      begin: "^__DATA__$",
      end: "^__END__$",
      subLanguage: "mojolicious",
      contains: [
        {
          begin: "^@@.*",
          end: "$",
          className: "comment"
        }
      ]
    }
  ];
  return a.contains = m, o.contains = m, {
    name: "Perl",
    aliases: [
      "pl",
      "pm"
    ],
    keywords: i,
    contains: m
  };
}
function Uh(e) {
  const t = e.regex, n = /(?![A-Za-z0-9])(?![$])/, r = t.concat(
    /[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/,
    n
  ), i = t.concat(
    /(\\?[A-Z][a-z0-9_\x7f-\xff]+|\\?[A-Z]+(?=[A-Z][a-z0-9_\x7f-\xff])){1,}/,
    n
  ), a = t.concat(
    /[A-Z]+/,
    n
  ), o = {
    scope: "variable",
    match: "\\$+" + r
  }, s = {
    scope: "meta",
    variants: [
      { begin: /<\?php/, relevance: 10 },
      // boost for obvious PHP
      { begin: /<\?=/ },
      // less relevant per PSR-1 which says not to use short-tags
      { begin: /<\?/, relevance: 0.1 },
      { begin: /\?>/ }
      // end php tag
    ]
  }, l = {
    scope: "subst",
    variants: [
      { begin: /\$\w+/ },
      {
        begin: /\{\$/,
        end: /\}/
      }
    ]
  }, c = e.inherit(e.APOS_STRING_MODE, { illegal: null }), u = e.inherit(e.QUOTE_STRING_MODE, {
    illegal: null,
    contains: e.QUOTE_STRING_MODE.contains.concat(l)
  }), d = {
    begin: /<<<[ \t]*(?:(\w+)|"(\w+)")\n/,
    end: /[ \t]*(\w+)\b/,
    contains: e.QUOTE_STRING_MODE.contains.concat(l),
    "on:begin": (D, $) => {
      $.data._beginMatch = D[1] || D[2];
    },
    "on:end": (D, $) => {
      $.data._beginMatch !== D[1] && $.ignoreMatch();
    }
  }, f = e.END_SAME_AS_BEGIN({
    begin: /<<<[ \t]*'(\w+)'\n/,
    end: /[ \t]*(\w+)\b/
  }), p = `[ 	
]`, m = {
    scope: "string",
    variants: [
      u,
      c,
      d,
      f
    ]
  }, h = {
    scope: "number",
    variants: [
      { begin: "\\b0[bB][01]+(?:_[01]+)*\\b" },
      // Binary w/ underscore support
      { begin: "\\b0[oO][0-7]+(?:_[0-7]+)*\\b" },
      // Octals w/ underscore support
      { begin: "\\b0[xX][\\da-fA-F]+(?:_[\\da-fA-F]+)*\\b" },
      // Hex w/ underscore support
      // Decimals w/ underscore support, with optional fragments and scientific exponent (e) suffix.
      { begin: "(?:\\b\\d+(?:_\\d+)*(\\.(?:\\d+(?:_\\d+)*))?|\\B\\.\\d+)(?:[eE][+-]?\\d+)?" }
    ],
    relevance: 0
  }, k = [
    "false",
    "null",
    "true"
  ], y = [
    // Magic constants:
    // <https://www.php.net/manual/en/language.constants.predefined.php>
    "__CLASS__",
    "__DIR__",
    "__FILE__",
    "__FUNCTION__",
    "__COMPILER_HALT_OFFSET__",
    "__LINE__",
    "__METHOD__",
    "__NAMESPACE__",
    "__TRAIT__",
    // Function that look like language construct or language construct that look like function:
    // List of keywords that may not require parenthesis
    "die",
    "echo",
    "exit",
    "include",
    "include_once",
    "print",
    "require",
    "require_once",
    // These are not language construct (function) but operate on the currently-executing function and can access the current symbol table
    // 'compact extract func_get_arg func_get_args func_num_args get_called_class get_parent_class ' +
    // Other keywords:
    // <https://www.php.net/manual/en/reserved.php>
    // <https://www.php.net/manual/en/language.types.type-juggling.php>
    "array",
    "abstract",
    "and",
    "as",
    "binary",
    "bool",
    "boolean",
    "break",
    "callable",
    "case",
    "catch",
    "class",
    "clone",
    "const",
    "continue",
    "declare",
    "default",
    "do",
    "double",
    "else",
    "elseif",
    "empty",
    "enddeclare",
    "endfor",
    "endforeach",
    "endif",
    "endswitch",
    "endwhile",
    "enum",
    "eval",
    "extends",
    "final",
    "finally",
    "float",
    "for",
    "foreach",
    "from",
    "global",
    "goto",
    "if",
    "implements",
    "instanceof",
    "insteadof",
    "int",
    "integer",
    "interface",
    "isset",
    "iterable",
    "list",
    "match|0",
    "mixed",
    "new",
    "never",
    "object",
    "or",
    "private",
    "protected",
    "public",
    "readonly",
    "real",
    "return",
    "string",
    "switch",
    "throw",
    "trait",
    "try",
    "unset",
    "use",
    "var",
    "void",
    "while",
    "xor",
    "yield"
  ], S = [
    // Standard PHP library:
    // <https://www.php.net/manual/en/book.spl.php>
    "Error|0",
    "AppendIterator",
    "ArgumentCountError",
    "ArithmeticError",
    "ArrayIterator",
    "ArrayObject",
    "AssertionError",
    "BadFunctionCallException",
    "BadMethodCallException",
    "CachingIterator",
    "CallbackFilterIterator",
    "CompileError",
    "Countable",
    "DirectoryIterator",
    "DivisionByZeroError",
    "DomainException",
    "EmptyIterator",
    "ErrorException",
    "Exception",
    "FilesystemIterator",
    "FilterIterator",
    "GlobIterator",
    "InfiniteIterator",
    "InvalidArgumentException",
    "IteratorIterator",
    "LengthException",
    "LimitIterator",
    "LogicException",
    "MultipleIterator",
    "NoRewindIterator",
    "OutOfBoundsException",
    "OutOfRangeException",
    "OuterIterator",
    "OverflowException",
    "ParentIterator",
    "ParseError",
    "RangeException",
    "RecursiveArrayIterator",
    "RecursiveCachingIterator",
    "RecursiveCallbackFilterIterator",
    "RecursiveDirectoryIterator",
    "RecursiveFilterIterator",
    "RecursiveIterator",
    "RecursiveIteratorIterator",
    "RecursiveRegexIterator",
    "RecursiveTreeIterator",
    "RegexIterator",
    "RuntimeException",
    "SeekableIterator",
    "SplDoublyLinkedList",
    "SplFileInfo",
    "SplFileObject",
    "SplFixedArray",
    "SplHeap",
    "SplMaxHeap",
    "SplMinHeap",
    "SplObjectStorage",
    "SplObserver",
    "SplPriorityQueue",
    "SplQueue",
    "SplStack",
    "SplSubject",
    "SplTempFileObject",
    "TypeError",
    "UnderflowException",
    "UnexpectedValueException",
    "UnhandledMatchError",
    // Reserved interfaces:
    // <https://www.php.net/manual/en/reserved.interfaces.php>
    "ArrayAccess",
    "BackedEnum",
    "Closure",
    "Fiber",
    "Generator",
    "Iterator",
    "IteratorAggregate",
    "Serializable",
    "Stringable",
    "Throwable",
    "Traversable",
    "UnitEnum",
    "WeakReference",
    "WeakMap",
    // Reserved classes:
    // <https://www.php.net/manual/en/reserved.classes.php>
    "Directory",
    "__PHP_Incomplete_Class",
    "parent",
    "php_user_filter",
    "self",
    "static",
    "stdClass"
  ], N = {
    keyword: y,
    literal: ((D) => {
      const $ = [];
      return D.forEach((Q) => {
        $.push(Q), Q.toLowerCase() === Q ? $.push(Q.toUpperCase()) : $.push(Q.toLowerCase());
      }), $;
    })(k),
    built_in: S
  }, A = (D) => D.map(($) => $.replace(/\|\d+$/, "")), _ = { variants: [
    {
      match: [
        /new/,
        t.concat(p, "+"),
        // to prevent built ins from being confused as the class constructor call
        t.concat("(?!", A(S).join("\\b|"), "\\b)"),
        i
      ],
      scope: {
        1: "keyword",
        4: "title.class"
      }
    }
  ] }, L = t.concat(r, "\\b(?!\\()"), v = { variants: [
    {
      match: [
        t.concat(
          /::/,
          t.lookahead(/(?!class\b)/)
        ),
        L
      ],
      scope: { 2: "variable.constant" }
    },
    {
      match: [
        /::/,
        /class/
      ],
      scope: { 2: "variable.language" }
    },
    {
      match: [
        i,
        t.concat(
          /::/,
          t.lookahead(/(?!class\b)/)
        ),
        L
      ],
      scope: {
        1: "title.class",
        3: "variable.constant"
      }
    },
    {
      match: [
        i,
        t.concat(
          "::",
          t.lookahead(/(?!class\b)/)
        )
      ],
      scope: { 1: "title.class" }
    },
    {
      match: [
        i,
        /::/,
        /class/
      ],
      scope: {
        1: "title.class",
        3: "variable.language"
      }
    }
  ] }, R = {
    scope: "attr",
    match: t.concat(r, t.lookahead(":"), t.lookahead(/(?!::)/))
  }, x = {
    relevance: 0,
    begin: /\(/,
    end: /\)/,
    keywords: N,
    contains: [
      R,
      o,
      v,
      e.C_BLOCK_COMMENT_MODE,
      m,
      h,
      _
    ]
  }, O = {
    relevance: 0,
    match: [
      /\b/,
      // to prevent keywords from being confused as the function title
      t.concat("(?!fn\\b|function\\b|", A(y).join("\\b|"), "|", A(S).join("\\b|"), "\\b)"),
      r,
      t.concat(p, "*"),
      t.lookahead(/(?=\()/)
    ],
    scope: { 3: "title.function.invoke" },
    contains: [x]
  };
  x.contains.push(O);
  const F = [
    R,
    v,
    e.C_BLOCK_COMMENT_MODE,
    m,
    h,
    _
  ], U = {
    begin: t.concat(
      /#\[\s*\\?/,
      t.either(
        i,
        a
      )
    ),
    beginScope: "meta",
    end: /]/,
    endScope: "meta",
    keywords: {
      literal: k,
      keyword: [
        "new",
        "array"
      ]
    },
    contains: [
      {
        begin: /\[/,
        end: /]/,
        keywords: {
          literal: k,
          keyword: [
            "new",
            "array"
          ]
        },
        contains: [
          "self",
          ...F
        ]
      },
      ...F,
      {
        scope: "meta",
        variants: [
          { match: i },
          { match: a }
        ]
      }
    ]
  };
  return {
    case_insensitive: !1,
    keywords: N,
    contains: [
      U,
      e.HASH_COMMENT_MODE,
      e.COMMENT("//", "$"),
      e.COMMENT(
        "/\\*",
        "\\*/",
        { contains: [
          {
            scope: "doctag",
            match: "@[A-Za-z]+"
          }
        ] }
      ),
      {
        match: /__halt_compiler\(\);/,
        keywords: "__halt_compiler",
        starts: {
          scope: "comment",
          end: e.MATCH_NOTHING_RE,
          contains: [
            {
              match: /\?>/,
              scope: "meta",
              endsParent: !0
            }
          ]
        }
      },
      s,
      {
        scope: "variable.language",
        match: /\$this\b/
      },
      o,
      O,
      v,
      {
        match: [
          /const/,
          /\s/,
          r
        ],
        scope: {
          1: "keyword",
          3: "variable.constant"
        }
      },
      _,
      {
        scope: "function",
        relevance: 0,
        beginKeywords: "fn function",
        end: /[;{]/,
        excludeEnd: !0,
        illegal: "[$%\\[]",
        contains: [
          { beginKeywords: "use" },
          e.UNDERSCORE_TITLE_MODE,
          {
            begin: "=>",
            // No markup, just a relevance booster
            endsParent: !0
          },
          {
            scope: "params",
            begin: "\\(",
            end: "\\)",
            excludeBegin: !0,
            excludeEnd: !0,
            keywords: N,
            contains: [
              "self",
              U,
              o,
              v,
              e.C_BLOCK_COMMENT_MODE,
              m,
              h
            ]
          }
        ]
      },
      {
        scope: "class",
        variants: [
          {
            beginKeywords: "enum",
            illegal: /[($"]/
          },
          {
            beginKeywords: "class interface trait",
            illegal: /[:($"]/
          }
        ],
        relevance: 0,
        end: /\{/,
        excludeEnd: !0,
        contains: [
          { beginKeywords: "extends implements" },
          e.UNDERSCORE_TITLE_MODE
        ]
      },
      // both use and namespace still use "old style" rules (vs multi-match)
      // because the namespace name can include `\` and we still want each
      // element to be treated as its own *individual* title
      {
        beginKeywords: "namespace",
        relevance: 0,
        end: ";",
        illegal: /[.']/,
        contains: [e.inherit(e.UNDERSCORE_TITLE_MODE, { scope: "title.class" })]
      },
      {
        beginKeywords: "use",
        relevance: 0,
        end: ";",
        contains: [
          // TODO: title.function vs title.class
          {
            match: /\b(as|const|function)\b/,
            scope: "keyword"
          },
          // TODO: could be title.class or title.function
          e.UNDERSCORE_TITLE_MODE
        ]
      },
      m,
      h
    ]
  };
}
function $h(e) {
  return {
    name: "PHP template",
    subLanguage: "xml",
    contains: [
      {
        begin: /<\?(php|=)?/,
        end: /\?>/,
        subLanguage: "php",
        contains: [
          // We don't want the php closing tag ?> to close the PHP block when
          // inside any of the following blocks:
          {
            begin: "/\\*",
            end: "\\*/",
            skip: !0
          },
          {
            begin: 'b"',
            end: '"',
            skip: !0
          },
          {
            begin: "b'",
            end: "'",
            skip: !0
          },
          e.inherit(e.APOS_STRING_MODE, {
            illegal: null,
            className: null,
            contains: null,
            skip: !0
          }),
          e.inherit(e.QUOTE_STRING_MODE, {
            illegal: null,
            className: null,
            contains: null,
            skip: !0
          })
        ]
      }
    ]
  };
}
function Hh(e) {
  return {
    name: "Plain text",
    aliases: [
      "text",
      "txt"
    ],
    disableAutodetect: !0
  };
}
function Kr(e) {
  const t = e.regex, n = new RegExp("[\\p{XID_Start}_]\\p{XID_Continue}*", "u"), r = [
    "and",
    "as",
    "assert",
    "async",
    "await",
    "break",
    "case",
    "class",
    "continue",
    "def",
    "del",
    "elif",
    "else",
    "except",
    "finally",
    "for",
    "from",
    "global",
    "if",
    "import",
    "in",
    "is",
    "lambda",
    "match",
    "nonlocal|10",
    "not",
    "or",
    "pass",
    "raise",
    "return",
    "try",
    "while",
    "with",
    "yield"
  ], s = {
    $pattern: /[A-Za-z]\w+|__\w+__/,
    keyword: r,
    built_in: [
      "__import__",
      "abs",
      "all",
      "any",
      "ascii",
      "bin",
      "bool",
      "breakpoint",
      "bytearray",
      "bytes",
      "callable",
      "chr",
      "classmethod",
      "compile",
      "complex",
      "delattr",
      "dict",
      "dir",
      "divmod",
      "enumerate",
      "eval",
      "exec",
      "filter",
      "float",
      "format",
      "frozenset",
      "getattr",
      "globals",
      "hasattr",
      "hash",
      "help",
      "hex",
      "id",
      "input",
      "int",
      "isinstance",
      "issubclass",
      "iter",
      "len",
      "list",
      "locals",
      "map",
      "max",
      "memoryview",
      "min",
      "next",
      "object",
      "oct",
      "open",
      "ord",
      "pow",
      "print",
      "property",
      "range",
      "repr",
      "reversed",
      "round",
      "set",
      "setattr",
      "slice",
      "sorted",
      "staticmethod",
      "str",
      "sum",
      "super",
      "tuple",
      "type",
      "vars",
      "zip"
    ],
    literal: [
      "__debug__",
      "Ellipsis",
      "False",
      "None",
      "NotImplemented",
      "True"
    ],
    type: [
      "Any",
      "Callable",
      "Coroutine",
      "Dict",
      "List",
      "Literal",
      "Generic",
      "Optional",
      "Sequence",
      "Set",
      "Tuple",
      "Type",
      "Union"
    ]
  }, l = {
    className: "meta",
    begin: /^(>>>|\.\.\.) /
  }, c = {
    className: "subst",
    begin: /\{/,
    end: /\}/,
    keywords: s,
    illegal: /#/
  }, u = {
    begin: /\{\{/,
    relevance: 0
  }, d = {
    className: "string",
    contains: [e.BACKSLASH_ESCAPE],
    variants: [
      {
        begin: /([uU]|[bB]|[rR]|[bB][rR]|[rR][bB])?'''/,
        end: /'''/,
        contains: [
          e.BACKSLASH_ESCAPE,
          l
        ],
        relevance: 10
      },
      {
        begin: /([uU]|[bB]|[rR]|[bB][rR]|[rR][bB])?"""/,
        end: /"""/,
        contains: [
          e.BACKSLASH_ESCAPE,
          l
        ],
        relevance: 10
      },
      {
        begin: /([fF][rR]|[rR][fF]|[fF])'''/,
        end: /'''/,
        contains: [
          e.BACKSLASH_ESCAPE,
          l,
          u,
          c
        ]
      },
      {
        begin: /([fF][rR]|[rR][fF]|[fF])"""/,
        end: /"""/,
        contains: [
          e.BACKSLASH_ESCAPE,
          l,
          u,
          c
        ]
      },
      {
        begin: /([uU]|[rR])'/,
        end: /'/,
        relevance: 10
      },
      {
        begin: /([uU]|[rR])"/,
        end: /"/,
        relevance: 10
      },
      {
        begin: /([bB]|[bB][rR]|[rR][bB])'/,
        end: /'/
      },
      {
        begin: /([bB]|[bB][rR]|[rR][bB])"/,
        end: /"/
      },
      {
        begin: /([fF][rR]|[rR][fF]|[fF])'/,
        end: /'/,
        contains: [
          e.BACKSLASH_ESCAPE,
          u,
          c
        ]
      },
      {
        begin: /([fF][rR]|[rR][fF]|[fF])"/,
        end: /"/,
        contains: [
          e.BACKSLASH_ESCAPE,
          u,
          c
        ]
      },
      e.APOS_STRING_MODE,
      e.QUOTE_STRING_MODE
    ]
  }, f = "[0-9](_?[0-9])*", p = `(\\b(${f}))?\\.(${f})|\\b(${f})\\.`, m = `\\b|${r.join("|")}`, h = {
    className: "number",
    relevance: 0,
    variants: [
      // exponentfloat, pointfloat
      // https://docs.python.org/3.9/reference/lexical_analysis.html#floating-point-literals
      // optionally imaginary
      // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
      // Note: no leading \b because floats can start with a decimal point
      // and we don't want to mishandle e.g. `fn(.5)`,
      // no trailing \b for pointfloat because it can end with a decimal point
      // and we don't want to mishandle e.g. `0..hex()`; this should be safe
      // because both MUST contain a decimal point and so cannot be confused with
      // the interior part of an identifier
      {
        begin: `(\\b(${f})|(${p}))[eE][+-]?(${f})[jJ]?(?=${m})`
      },
      {
        begin: `(${p})[jJ]?`
      },
      // decinteger, bininteger, octinteger, hexinteger
      // https://docs.python.org/3.9/reference/lexical_analysis.html#integer-literals
      // optionally "long" in Python 2
      // https://docs.python.org/2.7/reference/lexical_analysis.html#integer-and-long-integer-literals
      // decinteger is optionally imaginary
      // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
      {
        begin: `\\b([1-9](_?[0-9])*|0+(_?0)*)[lLjJ]?(?=${m})`
      },
      {
        begin: `\\b0[bB](_?[01])+[lL]?(?=${m})`
      },
      {
        begin: `\\b0[oO](_?[0-7])+[lL]?(?=${m})`
      },
      {
        begin: `\\b0[xX](_?[0-9a-fA-F])+[lL]?(?=${m})`
      },
      // imagnumber (digitpart-based)
      // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
      {
        begin: `\\b(${f})[jJ](?=${m})`
      }
    ]
  }, k = {
    className: "comment",
    begin: t.lookahead(/# type:/),
    end: /$/,
    keywords: s,
    contains: [
      {
        // prevent keywords from coloring `type`
        begin: /# type:/
      },
      // comment within a datatype comment includes no keywords
      {
        begin: /#/,
        end: /\b\B/,
        endsWithParent: !0
      }
    ]
  }, y = {
    className: "params",
    variants: [
      // Exclude params in functions without params
      {
        className: "",
        begin: /\(\s*\)/,
        skip: !0
      },
      {
        begin: /\(/,
        end: /\)/,
        excludeBegin: !0,
        excludeEnd: !0,
        keywords: s,
        contains: [
          "self",
          l,
          h,
          d,
          e.HASH_COMMENT_MODE
        ]
      }
    ]
  };
  return c.contains = [
    d,
    h,
    l
  ], {
    name: "Python",
    aliases: [
      "py",
      "gyp",
      "ipython"
    ],
    unicodeRegex: !0,
    keywords: s,
    illegal: /(<\/|\?)|=>/,
    contains: [
      l,
      h,
      {
        // very common convention
        scope: "variable.language",
        match: /\bself\b/
      },
      {
        // eat "if" prior to string so that it won't accidentally be
        // labeled as an f-string
        beginKeywords: "if",
        relevance: 0
      },
      { match: /\bor\b/, scope: "keyword" },
      d,
      k,
      e.HASH_COMMENT_MODE,
      {
        match: [
          /\bdef/,
          /\s+/,
          n
        ],
        scope: {
          1: "keyword",
          3: "title.function"
        },
        contains: [y]
      },
      {
        variants: [
          {
            match: [
              /\bclass/,
              /\s+/,
              n,
              /\s*/,
              /\(\s*/,
              n,
              /\s*\)/
            ]
          },
          {
            match: [
              /\bclass/,
              /\s+/,
              n
            ]
          }
        ],
        scope: {
          1: "keyword",
          3: "title.class",
          6: "title.class.inherited"
        }
      },
      {
        className: "meta",
        begin: /^[\t ]*@/,
        end: /(?=#)|$/,
        contains: [
          h,
          y,
          d
        ]
      }
    ]
  };
}
function Gh(e) {
  return {
    aliases: ["pycon"],
    contains: [
      {
        className: "meta.prompt",
        starts: {
          // a space separates the REPL prefix from the actual code
          // this is purely for cleaner HTML output
          end: / |$/,
          starts: {
            end: "$",
            subLanguage: "python"
          }
        },
        variants: [
          { begin: /^>>>(?=[ ]|$)/ },
          { begin: /^\.\.\.(?=[ ]|$)/ }
        ]
      }
    ]
  };
}
function Kh(e) {
  const t = e.regex, n = /(?:(?:[a-zA-Z]|\.[._a-zA-Z])[._a-zA-Z0-9]*)|\.(?!\d)/, r = t.either(
    // Special case: only hexadecimal binary powers can contain fractions
    /0[xX][0-9a-fA-F]+\.[0-9a-fA-F]*[pP][+-]?\d+i?/,
    // Hexadecimal numbers without fraction and optional binary power
    /0[xX][0-9a-fA-F]+(?:[pP][+-]?\d+)?[Li]?/,
    // Decimal numbers
    /(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?[Li]?/
  ), i = /[=!<>:]=|\|\||&&|:::?|<-|<<-|->>|->|\|>|[-+*\/?!$&|:<=>@^~]|\*\*/, a = t.either(
    /[()]/,
    /[{}]/,
    /\[\[/,
    /[[\]]/,
    /\\/,
    /,/
  );
  return {
    name: "R",
    keywords: {
      $pattern: n,
      keyword: "function if in break next repeat else for while",
      literal: "NULL NA TRUE FALSE Inf NaN NA_integer_|10 NA_real_|10 NA_character_|10 NA_complex_|10",
      built_in: (
        // Builtin constants
        "LETTERS letters month.abb month.name pi T F abs acos acosh all any anyNA Arg as.call as.character as.complex as.double as.environment as.integer as.logical as.null.default as.numeric as.raw asin asinh atan atanh attr attributes baseenv browser c call ceiling class Conj cos cosh cospi cummax cummin cumprod cumsum digamma dim dimnames emptyenv exp expression floor forceAndCall gamma gc.time globalenv Im interactive invisible is.array is.atomic is.call is.character is.complex is.double is.environment is.expression is.finite is.function is.infinite is.integer is.language is.list is.logical is.matrix is.na is.name is.nan is.null is.numeric is.object is.pairlist is.raw is.recursive is.single is.symbol lazyLoadDBfetch length lgamma list log max min missing Mod names nargs nzchar oldClass on.exit pos.to.env proc.time prod quote range Re rep retracemem return round seq_along seq_len seq.int sign signif sin sinh sinpi sqrt standardGeneric substitute sum switch tan tanh tanpi tracemem trigamma trunc unclass untracemem UseMethod xtfrm"
      )
    },
    contains: [
      // Roxygen comments
      e.COMMENT(
        /#'/,
        /$/,
        { contains: [
          {
            // Handle `@examples` separately to cause all subsequent code
            // until the next `@`-tag on its own line to be kept as-is,
            // preventing highlighting. This code is example R code, so nested
            // doctags shouldn’t be treated as such. See
            // `test/markup/r/roxygen.txt` for an example.
            scope: "doctag",
            match: /@examples/,
            starts: {
              end: t.lookahead(t.either(
                // end if another doc comment
                /\n^#'\s*(?=@[a-zA-Z]+)/,
                // or a line with no comment
                /\n^(?!#')/
              )),
              endsParent: !0
            }
          },
          {
            // Handle `@param` to highlight the parameter name following
            // after.
            scope: "doctag",
            begin: "@param",
            end: /$/,
            contains: [
              {
                scope: "variable",
                variants: [
                  { match: n },
                  { match: /`(?:\\.|[^`\\])+`/ }
                ],
                endsParent: !0
              }
            ]
          },
          {
            scope: "doctag",
            match: /@[a-zA-Z]+/
          },
          {
            scope: "keyword",
            match: /\\[a-zA-Z]+/
          }
        ] }
      ),
      e.HASH_COMMENT_MODE,
      {
        scope: "string",
        contains: [e.BACKSLASH_ESCAPE],
        variants: [
          e.END_SAME_AS_BEGIN({
            begin: /[rR]"(-*)\(/,
            end: /\)(-*)"/
          }),
          e.END_SAME_AS_BEGIN({
            begin: /[rR]"(-*)\{/,
            end: /\}(-*)"/
          }),
          e.END_SAME_AS_BEGIN({
            begin: /[rR]"(-*)\[/,
            end: /\](-*)"/
          }),
          e.END_SAME_AS_BEGIN({
            begin: /[rR]'(-*)\(/,
            end: /\)(-*)'/
          }),
          e.END_SAME_AS_BEGIN({
            begin: /[rR]'(-*)\{/,
            end: /\}(-*)'/
          }),
          e.END_SAME_AS_BEGIN({
            begin: /[rR]'(-*)\[/,
            end: /\](-*)'/
          }),
          {
            begin: '"',
            end: '"',
            relevance: 0
          },
          {
            begin: "'",
            end: "'",
            relevance: 0
          }
        ]
      },
      // Matching numbers immediately following punctuation and operators is
      // tricky since we need to look at the character ahead of a number to
      // ensure the number is not part of an identifier, and we cannot use
      // negative look-behind assertions. So instead we explicitly handle all
      // possible combinations of (operator|punctuation), number.
      // TODO: replace with negative look-behind when available
      // { begin: /(?<![a-zA-Z0-9._])0[xX][0-9a-fA-F]+\.[0-9a-fA-F]*[pP][+-]?\d+i?/ },
      // { begin: /(?<![a-zA-Z0-9._])0[xX][0-9a-fA-F]+([pP][+-]?\d+)?[Li]?/ },
      // { begin: /(?<![a-zA-Z0-9._])(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?[Li]?/ }
      {
        relevance: 0,
        variants: [
          {
            scope: {
              1: "operator",
              2: "number"
            },
            match: [
              i,
              r
            ]
          },
          {
            scope: {
              1: "operator",
              2: "number"
            },
            match: [
              /%[^%]*%/,
              r
            ]
          },
          {
            scope: {
              1: "punctuation",
              2: "number"
            },
            match: [
              a,
              r
            ]
          },
          {
            scope: { 2: "number" },
            match: [
              /[^a-zA-Z0-9._]|^/,
              // not part of an identifier, or start of document
              r
            ]
          }
        ]
      },
      // Operators/punctuation when they're not directly followed by numbers
      {
        // Relevance boost for the most common assignment form.
        scope: { 3: "operator" },
        match: [
          n,
          /\s+/,
          /<-/,
          /\s+/
        ]
      },
      {
        scope: "operator",
        relevance: 0,
        variants: [
          { match: i },
          { match: /%[^%]*%/ }
        ]
      },
      {
        scope: "punctuation",
        relevance: 0,
        match: a
      },
      {
        // Escaped identifier
        begin: "`",
        end: "`",
        contains: [{ begin: /\\./ }]
      }
    ]
  };
}
function qh(e) {
  const t = e.regex, n = "([a-zA-Z_]\\w*[!?=]?|[-+~]@|<<|>>|=~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~`|]|\\[\\]=?)", r = t.either(
    /\b([A-Z]+[a-z0-9]+)+/,
    // ends in caps
    /\b([A-Z]+[a-z0-9]+)+[A-Z]+/
  ), i = t.concat(r, /(::\w+)*/), o = {
    "variable.constant": [
      "__FILE__",
      "__LINE__",
      "__ENCODING__"
    ],
    "variable.language": [
      "self",
      "super"
    ],
    keyword: [
      "alias",
      "and",
      "begin",
      "BEGIN",
      "break",
      "case",
      "class",
      "defined",
      "do",
      "else",
      "elsif",
      "end",
      "END",
      "ensure",
      "for",
      "if",
      "in",
      "module",
      "next",
      "not",
      "or",
      "redo",
      "require",
      "rescue",
      "retry",
      "return",
      "then",
      "undef",
      "unless",
      "until",
      "when",
      "while",
      "yield",
      ...[
        "include",
        "extend",
        "prepend",
        "public",
        "private",
        "protected",
        "raise",
        "throw"
      ]
    ],
    built_in: [
      "proc",
      "lambda",
      "attr_accessor",
      "attr_reader",
      "attr_writer",
      "define_method",
      "private_constant",
      "module_function"
    ],
    literal: [
      "true",
      "false",
      "nil"
    ]
  }, s = {
    className: "doctag",
    begin: "@[A-Za-z]+"
  }, l = {
    begin: "#<",
    end: ">"
  }, c = [
    e.COMMENT(
      "#",
      "$",
      { contains: [s] }
    ),
    e.COMMENT(
      "^=begin",
      "^=end",
      {
        contains: [s],
        relevance: 10
      }
    ),
    e.COMMENT("^__END__", e.MATCH_NOTHING_RE)
  ], u = {
    className: "subst",
    begin: /#\{/,
    end: /\}/,
    keywords: o
  }, d = {
    className: "string",
    contains: [
      e.BACKSLASH_ESCAPE,
      u
    ],
    variants: [
      {
        begin: /'/,
        end: /'/
      },
      {
        begin: /"/,
        end: /"/
      },
      {
        begin: /`/,
        end: /`/
      },
      {
        begin: /%[qQwWx]?\(/,
        end: /\)/
      },
      {
        begin: /%[qQwWx]?\[/,
        end: /\]/
      },
      {
        begin: /%[qQwWx]?\{/,
        end: /\}/
      },
      {
        begin: /%[qQwWx]?</,
        end: />/
      },
      {
        begin: /%[qQwWx]?\//,
        end: /\//
      },
      {
        begin: /%[qQwWx]?%/,
        end: /%/
      },
      {
        begin: /%[qQwWx]?-/,
        end: /-/
      },
      {
        begin: /%[qQwWx]?\|/,
        end: /\|/
      },
      // in the following expressions, \B in the beginning suppresses recognition of ?-sequences
      // where ? is the last character of a preceding identifier, as in: `func?4`
      { begin: /\B\?(\\\d{1,3})/ },
      { begin: /\B\?(\\x[A-Fa-f0-9]{1,2})/ },
      { begin: /\B\?(\\u\{?[A-Fa-f0-9]{1,6}\}?)/ },
      { begin: /\B\?(\\M-\\C-|\\M-\\c|\\c\\M-|\\M-|\\C-\\M-)[\x20-\x7e]/ },
      { begin: /\B\?\\(c|C-)[\x20-\x7e]/ },
      { begin: /\B\?\\?\S/ },
      // heredocs
      {
        // this guard makes sure that we have an entire heredoc and not a false
        // positive (auto-detect, etc.)
        begin: t.concat(
          /<<[-~]?'?/,
          t.lookahead(/(\w+)(?=\W)[^\n]*\n(?:[^\n]*\n)*?\s*\1\b/)
        ),
        contains: [
          e.END_SAME_AS_BEGIN({
            begin: /(\w+)/,
            end: /(\w+)/,
            contains: [
              e.BACKSLASH_ESCAPE,
              u
            ]
          })
        ]
      }
    ]
  }, f = "[1-9](_?[0-9])*|0", p = "[0-9](_?[0-9])*", m = {
    className: "number",
    relevance: 0,
    variants: [
      // decimal integer/float, optionally exponential or rational, optionally imaginary
      { begin: `\\b(${f})(\\.(${p}))?([eE][+-]?(${p})|r)?i?\\b` },
      // explicit decimal/binary/octal/hexadecimal integer,
      // optionally rational and/or imaginary
      { begin: "\\b0[dD][0-9](_?[0-9])*r?i?\\b" },
      { begin: "\\b0[bB][0-1](_?[0-1])*r?i?\\b" },
      { begin: "\\b0[oO][0-7](_?[0-7])*r?i?\\b" },
      { begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*r?i?\\b" },
      // 0-prefixed implicit octal integer, optionally rational and/or imaginary
      { begin: "\\b0(_?[0-7])+r?i?\\b" }
    ]
  }, h = {
    variants: [
      {
        match: /\(\)/
      },
      {
        className: "params",
        begin: /\(/,
        end: /(?=\))/,
        excludeBegin: !0,
        endsParent: !0,
        keywords: o
      }
    ]
  }, _ = [
    d,
    {
      variants: [
        {
          match: [
            /class\s+/,
            i,
            /\s+<\s+/,
            i
          ]
        },
        {
          match: [
            /\b(class|module)\s+/,
            i
          ]
        }
      ],
      scope: {
        2: "title.class",
        4: "title.class.inherited"
      },
      keywords: o
    },
    {
      match: [
        /(include|extend)\s+/,
        i
      ],
      scope: {
        2: "title.class"
      },
      keywords: o
    },
    {
      relevance: 0,
      match: [
        i,
        /\.new[. (]/
      ],
      scope: {
        1: "title.class"
      }
    },
    {
      relevance: 0,
      match: /\b[A-Z][A-Z_0-9]+\b/,
      className: "variable.constant"
    },
    {
      relevance: 0,
      match: r,
      scope: "title.class"
    },
    {
      match: [
        /def/,
        /\s+/,
        n
      ],
      scope: {
        1: "keyword",
        3: "title.function"
      },
      contains: [
        h
      ]
    },
    {
      // swallow namespace qualifiers before symbols
      begin: e.IDENT_RE + "::"
    },
    {
      className: "symbol",
      begin: e.UNDERSCORE_IDENT_RE + "(!|\\?)?:",
      relevance: 0
    },
    {
      className: "symbol",
      begin: ":(?!\\s)",
      contains: [
        d,
        { begin: n }
      ],
      relevance: 0
    },
    m,
    {
      // negative-look forward attempts to prevent false matches like:
      // @ident@ or $ident$ that might indicate this is not ruby at all
      className: "variable",
      begin: "(\\$\\W)|((\\$|@@?)(\\w+))(?=[^@$?])(?![A-Za-z])(?![@$?'])"
    },
    {
      className: "params",
      begin: /\|(?!=)/,
      end: /\|/,
      excludeBegin: !0,
      excludeEnd: !0,
      relevance: 0,
      // this could be a lot of things (in other languages) other than params
      keywords: o
    },
    {
      // regexp container
      begin: "(" + e.RE_STARTERS_RE + "|unless)\\s*",
      keywords: "unless",
      contains: [
        {
          className: "regexp",
          contains: [
            e.BACKSLASH_ESCAPE,
            u
          ],
          illegal: /\n/,
          variants: [
            {
              begin: "/",
              end: "/[a-z]*"
            },
            {
              begin: /%r\{/,
              end: /\}[a-z]*/
            },
            {
              begin: "%r\\(",
              end: "\\)[a-z]*"
            },
            {
              begin: "%r!",
              end: "![a-z]*"
            },
            {
              begin: "%r\\[",
              end: "\\][a-z]*"
            }
          ]
        }
      ].concat(l, c),
      relevance: 0
    }
  ].concat(l, c);
  u.contains = _, h.contains = _;
  const x = [
    {
      begin: /^\s*=>/,
      starts: {
        end: "$",
        contains: _
      }
    },
    {
      className: "meta.prompt",
      begin: "^(" + "[>?]>" + "|" + "[\\w#]+\\(\\w+\\):\\d+:\\d+[>*]" + "|" + "(\\w+-)?\\d+\\.\\d+\\.\\d+(p\\d+)?[^\\d][^>]+>" + ")(?=[ ])",
      starts: {
        end: "$",
        keywords: o,
        contains: _
      }
    }
  ];
  return c.unshift(l), {
    name: "Ruby",
    aliases: [
      "rb",
      "gemspec",
      "podspec",
      "thor",
      "irb"
    ],
    keywords: o,
    illegal: /\/\*/,
    contains: [e.SHEBANG({ binary: "ruby" })].concat(x).concat(c).concat(_)
  };
}
function Wh(e) {
  const t = e.regex, n = /(r#)?/, r = t.concat(n, e.UNDERSCORE_IDENT_RE), i = t.concat(n, e.IDENT_RE), a = {
    className: "title.function.invoke",
    relevance: 0,
    begin: t.concat(
      /\b/,
      /(?!let|for|while|if|else|match\b)/,
      i,
      t.lookahead(/\s*\(/)
    )
  }, o = "([ui](8|16|32|64|128|size)|f(32|64))?", s = [
    "abstract",
    "as",
    "async",
    "await",
    "become",
    "box",
    "break",
    "const",
    "continue",
    "crate",
    "do",
    "dyn",
    "else",
    "enum",
    "extern",
    "false",
    "final",
    "fn",
    "for",
    "if",
    "impl",
    "in",
    "let",
    "loop",
    "macro",
    "match",
    "mod",
    "move",
    "mut",
    "override",
    "priv",
    "pub",
    "ref",
    "return",
    "self",
    "Self",
    "static",
    "struct",
    "super",
    "trait",
    "true",
    "try",
    "type",
    "typeof",
    "union",
    "unsafe",
    "unsized",
    "use",
    "virtual",
    "where",
    "while",
    "yield"
  ], l = [
    "true",
    "false",
    "Some",
    "None",
    "Ok",
    "Err"
  ], c = [
    // functions
    "drop ",
    // traits
    "Copy",
    "Send",
    "Sized",
    "Sync",
    "Drop",
    "Fn",
    "FnMut",
    "FnOnce",
    "ToOwned",
    "Clone",
    "Debug",
    "PartialEq",
    "PartialOrd",
    "Eq",
    "Ord",
    "AsRef",
    "AsMut",
    "Into",
    "From",
    "Default",
    "Iterator",
    "Extend",
    "IntoIterator",
    "DoubleEndedIterator",
    "ExactSizeIterator",
    "SliceConcatExt",
    "ToString",
    // macros
    "assert!",
    "assert_eq!",
    "bitflags!",
    "bytes!",
    "cfg!",
    "col!",
    "concat!",
    "concat_idents!",
    "debug_assert!",
    "debug_assert_eq!",
    "env!",
    "eprintln!",
    "panic!",
    "file!",
    "format!",
    "format_args!",
    "include_bytes!",
    "include_str!",
    "line!",
    "local_data_key!",
    "module_path!",
    "option_env!",
    "print!",
    "println!",
    "select!",
    "stringify!",
    "try!",
    "unimplemented!",
    "unreachable!",
    "vec!",
    "write!",
    "writeln!",
    "macro_rules!",
    "assert_ne!",
    "debug_assert_ne!"
  ], u = [
    "i8",
    "i16",
    "i32",
    "i64",
    "i128",
    "isize",
    "u8",
    "u16",
    "u32",
    "u64",
    "u128",
    "usize",
    "f32",
    "f64",
    "str",
    "char",
    "bool",
    "Box",
    "Option",
    "Result",
    "String",
    "Vec"
  ];
  return {
    name: "Rust",
    aliases: ["rs"],
    keywords: {
      $pattern: e.IDENT_RE + "!?",
      type: u,
      keyword: s,
      literal: l,
      built_in: c
    },
    illegal: "</",
    contains: [
      e.C_LINE_COMMENT_MODE,
      e.COMMENT("/\\*", "\\*/", { contains: ["self"] }),
      e.inherit(e.QUOTE_STRING_MODE, {
        begin: /b?"/,
        illegal: null
      }),
      {
        className: "symbol",
        // negative lookahead to avoid matching `'`
        begin: /'[a-zA-Z_][a-zA-Z0-9_]*(?!')/
      },
      {
        scope: "string",
        variants: [
          { begin: /b?r(#*)"(.|\n)*?"\1(?!#)/ },
          {
            begin: /b?'/,
            end: /'/,
            contains: [
              {
                scope: "char.escape",
                match: /\\('|\w|x\w{2}|u\w{4}|U\w{8})/
              }
            ]
          }
        ]
      },
      {
        className: "number",
        variants: [
          { begin: "\\b0b([01_]+)" + o },
          { begin: "\\b0o([0-7_]+)" + o },
          { begin: "\\b0x([A-Fa-f0-9_]+)" + o },
          { begin: "\\b(\\d[\\d_]*(\\.[0-9_]+)?([eE][+-]?[0-9_]+)?)" + o }
        ],
        relevance: 0
      },
      {
        begin: [
          /fn/,
          /\s+/,
          r
        ],
        className: {
          1: "keyword",
          3: "title.function"
        }
      },
      {
        className: "meta",
        begin: "#!?\\[",
        end: "\\]",
        contains: [
          {
            className: "string",
            begin: /"/,
            end: /"/,
            contains: [
              e.BACKSLASH_ESCAPE
            ]
          }
        ]
      },
      {
        begin: [
          /let/,
          /\s+/,
          /(?:mut\s+)?/,
          r
        ],
        className: {
          1: "keyword",
          3: "keyword",
          4: "variable"
        }
      },
      // must come before impl/for rule later
      {
        begin: [
          /for/,
          /\s+/,
          r,
          /\s+/,
          /in/
        ],
        className: {
          1: "keyword",
          3: "variable",
          5: "keyword"
        }
      },
      {
        begin: [
          /type/,
          /\s+/,
          r
        ],
        className: {
          1: "keyword",
          3: "title.class"
        }
      },
      {
        begin: [
          /(?:trait|enum|struct|union|impl|for)/,
          /\s+/,
          r
        ],
        className: {
          1: "keyword",
          3: "title.class"
        }
      },
      {
        begin: e.IDENT_RE + "::",
        keywords: {
          keyword: "Self",
          built_in: c,
          type: u
        }
      },
      {
        className: "punctuation",
        begin: "->"
      },
      a
    ]
  };
}
const Vh = (e) => ({
  IMPORTANT: {
    scope: "meta",
    begin: "!important"
  },
  BLOCK_COMMENT: e.C_BLOCK_COMMENT_MODE,
  HEXCOLOR: {
    scope: "number",
    begin: /#(([0-9a-fA-F]{3,4})|(([0-9a-fA-F]{2}){3,4}))\b/
  },
  FUNCTION_DISPATCH: {
    className: "built_in",
    begin: /[\w-]+(?=\()/
  },
  ATTRIBUTE_SELECTOR_MODE: {
    scope: "selector-attr",
    begin: /\[/,
    end: /\]/,
    illegal: "$",
    contains: [
      e.APOS_STRING_MODE,
      e.QUOTE_STRING_MODE
    ]
  },
  CSS_NUMBER_MODE: {
    scope: "number",
    begin: e.NUMBER_RE + "(%|em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|in|pt|pc|px|deg|grad|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)?",
    relevance: 0
  },
  CSS_VARIABLE: {
    className: "attr",
    begin: /--[A-Za-z_][A-Za-z0-9_-]*/
  }
}), Yh = [
  "a",
  "abbr",
  "address",
  "article",
  "aside",
  "audio",
  "b",
  "blockquote",
  "body",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "dd",
  "del",
  "details",
  "dfn",
  "div",
  "dl",
  "dt",
  "em",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hgroup",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "main",
  "mark",
  "menu",
  "nav",
  "object",
  "ol",
  "optgroup",
  "option",
  "p",
  "picture",
  "q",
  "quote",
  "samp",
  "section",
  "select",
  "source",
  "span",
  "strong",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "tr",
  "ul",
  "var",
  "video"
], jh = [
  "defs",
  "g",
  "marker",
  "mask",
  "pattern",
  "svg",
  "switch",
  "symbol",
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feFlood",
  "feGaussianBlur",
  "feImage",
  "feMerge",
  "feMorphology",
  "feOffset",
  "feSpecularLighting",
  "feTile",
  "feTurbulence",
  "linearGradient",
  "radialGradient",
  "stop",
  "circle",
  "ellipse",
  "image",
  "line",
  "path",
  "polygon",
  "polyline",
  "rect",
  "text",
  "use",
  "textPath",
  "tspan",
  "foreignObject",
  "clipPath"
], Zh = [
  ...Yh,
  ...jh
], Xh = [
  "any-hover",
  "any-pointer",
  "aspect-ratio",
  "color",
  "color-gamut",
  "color-index",
  "device-aspect-ratio",
  "device-height",
  "device-width",
  "display-mode",
  "forced-colors",
  "grid",
  "height",
  "hover",
  "inverted-colors",
  "monochrome",
  "orientation",
  "overflow-block",
  "overflow-inline",
  "pointer",
  "prefers-color-scheme",
  "prefers-contrast",
  "prefers-reduced-motion",
  "prefers-reduced-transparency",
  "resolution",
  "scan",
  "scripting",
  "update",
  "width",
  // TODO: find a better solution?
  "min-width",
  "max-width",
  "min-height",
  "max-height"
].sort().reverse(), Qh = [
  "active",
  "any-link",
  "blank",
  "checked",
  "current",
  "default",
  "defined",
  "dir",
  // dir()
  "disabled",
  "drop",
  "empty",
  "enabled",
  "first",
  "first-child",
  "first-of-type",
  "fullscreen",
  "future",
  "focus",
  "focus-visible",
  "focus-within",
  "has",
  // has()
  "host",
  // host or host()
  "host-context",
  // host-context()
  "hover",
  "indeterminate",
  "in-range",
  "invalid",
  "is",
  // is()
  "lang",
  // lang()
  "last-child",
  "last-of-type",
  "left",
  "link",
  "local-link",
  "not",
  // not()
  "nth-child",
  // nth-child()
  "nth-col",
  // nth-col()
  "nth-last-child",
  // nth-last-child()
  "nth-last-col",
  // nth-last-col()
  "nth-last-of-type",
  //nth-last-of-type()
  "nth-of-type",
  //nth-of-type()
  "only-child",
  "only-of-type",
  "optional",
  "out-of-range",
  "past",
  "placeholder-shown",
  "read-only",
  "read-write",
  "required",
  "right",
  "root",
  "scope",
  "target",
  "target-within",
  "user-invalid",
  "valid",
  "visited",
  "where"
  // where()
].sort().reverse(), Jh = [
  "after",
  "backdrop",
  "before",
  "cue",
  "cue-region",
  "first-letter",
  "first-line",
  "grammar-error",
  "marker",
  "part",
  "placeholder",
  "selection",
  "slotted",
  "spelling-error"
].sort().reverse(), eb = [
  "accent-color",
  "align-content",
  "align-items",
  "align-self",
  "alignment-baseline",
  "all",
  "anchor-name",
  "animation",
  "animation-composition",
  "animation-delay",
  "animation-direction",
  "animation-duration",
  "animation-fill-mode",
  "animation-iteration-count",
  "animation-name",
  "animation-play-state",
  "animation-range",
  "animation-range-end",
  "animation-range-start",
  "animation-timeline",
  "animation-timing-function",
  "appearance",
  "aspect-ratio",
  "backdrop-filter",
  "backface-visibility",
  "background",
  "background-attachment",
  "background-blend-mode",
  "background-clip",
  "background-color",
  "background-image",
  "background-origin",
  "background-position",
  "background-position-x",
  "background-position-y",
  "background-repeat",
  "background-size",
  "baseline-shift",
  "block-size",
  "border",
  "border-block",
  "border-block-color",
  "border-block-end",
  "border-block-end-color",
  "border-block-end-style",
  "border-block-end-width",
  "border-block-start",
  "border-block-start-color",
  "border-block-start-style",
  "border-block-start-width",
  "border-block-style",
  "border-block-width",
  "border-bottom",
  "border-bottom-color",
  "border-bottom-left-radius",
  "border-bottom-right-radius",
  "border-bottom-style",
  "border-bottom-width",
  "border-collapse",
  "border-color",
  "border-end-end-radius",
  "border-end-start-radius",
  "border-image",
  "border-image-outset",
  "border-image-repeat",
  "border-image-slice",
  "border-image-source",
  "border-image-width",
  "border-inline",
  "border-inline-color",
  "border-inline-end",
  "border-inline-end-color",
  "border-inline-end-style",
  "border-inline-end-width",
  "border-inline-start",
  "border-inline-start-color",
  "border-inline-start-style",
  "border-inline-start-width",
  "border-inline-style",
  "border-inline-width",
  "border-left",
  "border-left-color",
  "border-left-style",
  "border-left-width",
  "border-radius",
  "border-right",
  "border-right-color",
  "border-right-style",
  "border-right-width",
  "border-spacing",
  "border-start-end-radius",
  "border-start-start-radius",
  "border-style",
  "border-top",
  "border-top-color",
  "border-top-left-radius",
  "border-top-right-radius",
  "border-top-style",
  "border-top-width",
  "border-width",
  "bottom",
  "box-align",
  "box-decoration-break",
  "box-direction",
  "box-flex",
  "box-flex-group",
  "box-lines",
  "box-ordinal-group",
  "box-orient",
  "box-pack",
  "box-shadow",
  "box-sizing",
  "break-after",
  "break-before",
  "break-inside",
  "caption-side",
  "caret-color",
  "clear",
  "clip",
  "clip-path",
  "clip-rule",
  "color",
  "color-interpolation",
  "color-interpolation-filters",
  "color-profile",
  "color-rendering",
  "color-scheme",
  "column-count",
  "column-fill",
  "column-gap",
  "column-rule",
  "column-rule-color",
  "column-rule-style",
  "column-rule-width",
  "column-span",
  "column-width",
  "columns",
  "contain",
  "contain-intrinsic-block-size",
  "contain-intrinsic-height",
  "contain-intrinsic-inline-size",
  "contain-intrinsic-size",
  "contain-intrinsic-width",
  "container",
  "container-name",
  "container-type",
  "content",
  "content-visibility",
  "counter-increment",
  "counter-reset",
  "counter-set",
  "cue",
  "cue-after",
  "cue-before",
  "cursor",
  "cx",
  "cy",
  "direction",
  "display",
  "dominant-baseline",
  "empty-cells",
  "enable-background",
  "field-sizing",
  "fill",
  "fill-opacity",
  "fill-rule",
  "filter",
  "flex",
  "flex-basis",
  "flex-direction",
  "flex-flow",
  "flex-grow",
  "flex-shrink",
  "flex-wrap",
  "float",
  "flood-color",
  "flood-opacity",
  "flow",
  "font",
  "font-display",
  "font-family",
  "font-feature-settings",
  "font-kerning",
  "font-language-override",
  "font-optical-sizing",
  "font-palette",
  "font-size",
  "font-size-adjust",
  "font-smooth",
  "font-smoothing",
  "font-stretch",
  "font-style",
  "font-synthesis",
  "font-synthesis-position",
  "font-synthesis-small-caps",
  "font-synthesis-style",
  "font-synthesis-weight",
  "font-variant",
  "font-variant-alternates",
  "font-variant-caps",
  "font-variant-east-asian",
  "font-variant-emoji",
  "font-variant-ligatures",
  "font-variant-numeric",
  "font-variant-position",
  "font-variation-settings",
  "font-weight",
  "forced-color-adjust",
  "gap",
  "glyph-orientation-horizontal",
  "glyph-orientation-vertical",
  "grid",
  "grid-area",
  "grid-auto-columns",
  "grid-auto-flow",
  "grid-auto-rows",
  "grid-column",
  "grid-column-end",
  "grid-column-start",
  "grid-gap",
  "grid-row",
  "grid-row-end",
  "grid-row-start",
  "grid-template",
  "grid-template-areas",
  "grid-template-columns",
  "grid-template-rows",
  "hanging-punctuation",
  "height",
  "hyphenate-character",
  "hyphenate-limit-chars",
  "hyphens",
  "icon",
  "image-orientation",
  "image-rendering",
  "image-resolution",
  "ime-mode",
  "initial-letter",
  "initial-letter-align",
  "inline-size",
  "inset",
  "inset-area",
  "inset-block",
  "inset-block-end",
  "inset-block-start",
  "inset-inline",
  "inset-inline-end",
  "inset-inline-start",
  "isolation",
  "justify-content",
  "justify-items",
  "justify-self",
  "kerning",
  "left",
  "letter-spacing",
  "lighting-color",
  "line-break",
  "line-height",
  "line-height-step",
  "list-style",
  "list-style-image",
  "list-style-position",
  "list-style-type",
  "margin",
  "margin-block",
  "margin-block-end",
  "margin-block-start",
  "margin-bottom",
  "margin-inline",
  "margin-inline-end",
  "margin-inline-start",
  "margin-left",
  "margin-right",
  "margin-top",
  "margin-trim",
  "marker",
  "marker-end",
  "marker-mid",
  "marker-start",
  "marks",
  "mask",
  "mask-border",
  "mask-border-mode",
  "mask-border-outset",
  "mask-border-repeat",
  "mask-border-slice",
  "mask-border-source",
  "mask-border-width",
  "mask-clip",
  "mask-composite",
  "mask-image",
  "mask-mode",
  "mask-origin",
  "mask-position",
  "mask-repeat",
  "mask-size",
  "mask-type",
  "masonry-auto-flow",
  "math-depth",
  "math-shift",
  "math-style",
  "max-block-size",
  "max-height",
  "max-inline-size",
  "max-width",
  "min-block-size",
  "min-height",
  "min-inline-size",
  "min-width",
  "mix-blend-mode",
  "nav-down",
  "nav-index",
  "nav-left",
  "nav-right",
  "nav-up",
  "none",
  "normal",
  "object-fit",
  "object-position",
  "offset",
  "offset-anchor",
  "offset-distance",
  "offset-path",
  "offset-position",
  "offset-rotate",
  "opacity",
  "order",
  "orphans",
  "outline",
  "outline-color",
  "outline-offset",
  "outline-style",
  "outline-width",
  "overflow",
  "overflow-anchor",
  "overflow-block",
  "overflow-clip-margin",
  "overflow-inline",
  "overflow-wrap",
  "overflow-x",
  "overflow-y",
  "overlay",
  "overscroll-behavior",
  "overscroll-behavior-block",
  "overscroll-behavior-inline",
  "overscroll-behavior-x",
  "overscroll-behavior-y",
  "padding",
  "padding-block",
  "padding-block-end",
  "padding-block-start",
  "padding-bottom",
  "padding-inline",
  "padding-inline-end",
  "padding-inline-start",
  "padding-left",
  "padding-right",
  "padding-top",
  "page",
  "page-break-after",
  "page-break-before",
  "page-break-inside",
  "paint-order",
  "pause",
  "pause-after",
  "pause-before",
  "perspective",
  "perspective-origin",
  "place-content",
  "place-items",
  "place-self",
  "pointer-events",
  "position",
  "position-anchor",
  "position-visibility",
  "print-color-adjust",
  "quotes",
  "r",
  "resize",
  "rest",
  "rest-after",
  "rest-before",
  "right",
  "rotate",
  "row-gap",
  "ruby-align",
  "ruby-position",
  "scale",
  "scroll-behavior",
  "scroll-margin",
  "scroll-margin-block",
  "scroll-margin-block-end",
  "scroll-margin-block-start",
  "scroll-margin-bottom",
  "scroll-margin-inline",
  "scroll-margin-inline-end",
  "scroll-margin-inline-start",
  "scroll-margin-left",
  "scroll-margin-right",
  "scroll-margin-top",
  "scroll-padding",
  "scroll-padding-block",
  "scroll-padding-block-end",
  "scroll-padding-block-start",
  "scroll-padding-bottom",
  "scroll-padding-inline",
  "scroll-padding-inline-end",
  "scroll-padding-inline-start",
  "scroll-padding-left",
  "scroll-padding-right",
  "scroll-padding-top",
  "scroll-snap-align",
  "scroll-snap-stop",
  "scroll-snap-type",
  "scroll-timeline",
  "scroll-timeline-axis",
  "scroll-timeline-name",
  "scrollbar-color",
  "scrollbar-gutter",
  "scrollbar-width",
  "shape-image-threshold",
  "shape-margin",
  "shape-outside",
  "shape-rendering",
  "speak",
  "speak-as",
  "src",
  // @font-face
  "stop-color",
  "stop-opacity",
  "stroke",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "stroke-opacity",
  "stroke-width",
  "tab-size",
  "table-layout",
  "text-align",
  "text-align-all",
  "text-align-last",
  "text-anchor",
  "text-combine-upright",
  "text-decoration",
  "text-decoration-color",
  "text-decoration-line",
  "text-decoration-skip",
  "text-decoration-skip-ink",
  "text-decoration-style",
  "text-decoration-thickness",
  "text-emphasis",
  "text-emphasis-color",
  "text-emphasis-position",
  "text-emphasis-style",
  "text-indent",
  "text-justify",
  "text-orientation",
  "text-overflow",
  "text-rendering",
  "text-shadow",
  "text-size-adjust",
  "text-transform",
  "text-underline-offset",
  "text-underline-position",
  "text-wrap",
  "text-wrap-mode",
  "text-wrap-style",
  "timeline-scope",
  "top",
  "touch-action",
  "transform",
  "transform-box",
  "transform-origin",
  "transform-style",
  "transition",
  "transition-behavior",
  "transition-delay",
  "transition-duration",
  "transition-property",
  "transition-timing-function",
  "translate",
  "unicode-bidi",
  "user-modify",
  "user-select",
  "vector-effect",
  "vertical-align",
  "view-timeline",
  "view-timeline-axis",
  "view-timeline-inset",
  "view-timeline-name",
  "view-transition-name",
  "visibility",
  "voice-balance",
  "voice-duration",
  "voice-family",
  "voice-pitch",
  "voice-range",
  "voice-rate",
  "voice-stress",
  "voice-volume",
  "white-space",
  "white-space-collapse",
  "widows",
  "width",
  "will-change",
  "word-break",
  "word-spacing",
  "word-wrap",
  "writing-mode",
  "x",
  "y",
  "z-index",
  "zoom"
].sort().reverse();
function tb(e) {
  const t = Vh(e), n = Jh, r = Qh, i = "@[a-z-]+", a = "and or not only", s = {
    className: "variable",
    begin: "(\\$" + "[a-zA-Z-][a-zA-Z0-9_-]*" + ")\\b",
    relevance: 0
  };
  return {
    name: "SCSS",
    case_insensitive: !0,
    illegal: "[=/|']",
    contains: [
      e.C_LINE_COMMENT_MODE,
      e.C_BLOCK_COMMENT_MODE,
      // to recognize keyframe 40% etc which are outside the scope of our
      // attribute value mode
      t.CSS_NUMBER_MODE,
      {
        className: "selector-id",
        begin: "#[A-Za-z0-9_-]+",
        relevance: 0
      },
      {
        className: "selector-class",
        begin: "\\.[A-Za-z0-9_-]+",
        relevance: 0
      },
      t.ATTRIBUTE_SELECTOR_MODE,
      {
        className: "selector-tag",
        begin: "\\b(" + Zh.join("|") + ")\\b",
        // was there, before, but why?
        relevance: 0
      },
      {
        className: "selector-pseudo",
        begin: ":(" + r.join("|") + ")"
      },
      {
        className: "selector-pseudo",
        begin: ":(:)?(" + n.join("|") + ")"
      },
      s,
      {
        // pseudo-selector params
        begin: /\(/,
        end: /\)/,
        contains: [t.CSS_NUMBER_MODE]
      },
      t.CSS_VARIABLE,
      {
        className: "attribute",
        begin: "\\b(" + eb.join("|") + ")\\b"
      },
      { begin: "\\b(whitespace|wait|w-resize|visible|vertical-text|vertical-ideographic|uppercase|upper-roman|upper-alpha|underline|transparent|top|thin|thick|text|text-top|text-bottom|tb-rl|table-header-group|table-footer-group|sw-resize|super|strict|static|square|solid|small-caps|separate|se-resize|scroll|s-resize|rtl|row-resize|ridge|right|repeat|repeat-y|repeat-x|relative|progress|pointer|overline|outside|outset|oblique|nowrap|not-allowed|normal|none|nw-resize|no-repeat|no-drop|newspaper|ne-resize|n-resize|move|middle|medium|ltr|lr-tb|lowercase|lower-roman|lower-alpha|loose|list-item|line|line-through|line-edge|lighter|left|keep-all|justify|italic|inter-word|inter-ideograph|inside|inset|inline|inline-block|inherit|inactive|ideograph-space|ideograph-parenthesis|ideograph-numeric|ideograph-alpha|horizontal|hidden|help|hand|groove|fixed|ellipsis|e-resize|double|dotted|distribute|distribute-space|distribute-letter|distribute-all-lines|disc|disabled|default|decimal|dashed|crosshair|collapse|col-resize|circle|char|center|capitalize|break-word|break-all|bottom|both|bolder|bold|block|bidi-override|below|baseline|auto|always|all-scroll|absolute|table|table-cell)\\b" },
      {
        begin: /:/,
        end: /[;}{]/,
        relevance: 0,
        contains: [
          t.BLOCK_COMMENT,
          s,
          t.HEXCOLOR,
          t.CSS_NUMBER_MODE,
          e.QUOTE_STRING_MODE,
          e.APOS_STRING_MODE,
          t.IMPORTANT,
          t.FUNCTION_DISPATCH
        ]
      },
      // matching these here allows us to treat them more like regular CSS
      // rules so everything between the {} gets regular rule highlighting,
      // which is what we want for page and font-face
      {
        begin: "@(page|font-face)",
        keywords: {
          $pattern: i,
          keyword: "@page @font-face"
        }
      },
      {
        begin: "@",
        end: "[{;]",
        returnBegin: !0,
        keywords: {
          $pattern: /[a-z-]+/,
          keyword: a,
          attribute: Xh.join(" ")
        },
        contains: [
          {
            begin: i,
            className: "keyword"
          },
          {
            begin: /[a-z-]+(?=:)/,
            className: "attribute"
          },
          s,
          e.QUOTE_STRING_MODE,
          e.APOS_STRING_MODE,
          t.HEXCOLOR,
          t.CSS_NUMBER_MODE
        ]
      },
      t.FUNCTION_DISPATCH
    ]
  };
}
function nb(e) {
  return {
    name: "Shell Session",
    aliases: [
      "console",
      "shellsession"
    ],
    contains: [
      {
        className: "meta.prompt",
        // We cannot add \s (spaces) in the regular expression otherwise it will be too broad and produce unexpected result.
        // For instance, in the following example, it would match "echo /path/to/home >" as a prompt:
        // echo /path/to/home > t.exe
        begin: /^\s{0,3}[/~\w\d[\]()@-]*[>%$#][ ]?/,
        starts: {
          end: /[^\\](?=\s*$)/,
          subLanguage: "bash"
        }
      }
    ]
  };
}
function ks(e) {
  const t = e.regex, n = e.COMMENT("--", "$"), r = {
    scope: "string",
    variants: [
      {
        begin: /'/,
        end: /'/,
        contains: [{ match: /''/ }]
      }
    ]
  }, i = {
    begin: /"/,
    end: /"/,
    contains: [{ match: /""/ }]
  }, a = [
    "true",
    "false",
    // Not sure it's correct to call NULL literal, and clauses like IS [NOT] NULL look strange that way.
    // "null",
    "unknown"
  ], o = [
    "double precision",
    "large object",
    "with timezone",
    "without timezone"
  ], s = [
    "bigint",
    "binary",
    "blob",
    "boolean",
    "char",
    "character",
    "clob",
    "date",
    "dec",
    "decfloat",
    "decimal",
    "float",
    "int",
    "integer",
    "interval",
    "nchar",
    "nclob",
    "national",
    "numeric",
    "real",
    "row",
    "smallint",
    "time",
    "timestamp",
    "varchar",
    "varying",
    // modifier (character varying)
    "varbinary"
  ], l = [
    "add",
    "asc",
    "collation",
    "desc",
    "final",
    "first",
    "last",
    "view"
  ], c = [
    "abs",
    "acos",
    "all",
    "allocate",
    "alter",
    "and",
    "any",
    "are",
    "array",
    "array_agg",
    "array_max_cardinality",
    "as",
    "asensitive",
    "asin",
    "asymmetric",
    "at",
    "atan",
    "atomic",
    "authorization",
    "avg",
    "begin",
    "begin_frame",
    "begin_partition",
    "between",
    "bigint",
    "binary",
    "blob",
    "boolean",
    "both",
    "by",
    "call",
    "called",
    "cardinality",
    "cascaded",
    "case",
    "cast",
    "ceil",
    "ceiling",
    "char",
    "char_length",
    "character",
    "character_length",
    "check",
    "classifier",
    "clob",
    "close",
    "coalesce",
    "collate",
    "collect",
    "column",
    "commit",
    "condition",
    "connect",
    "constraint",
    "contains",
    "convert",
    "copy",
    "corr",
    "corresponding",
    "cos",
    "cosh",
    "count",
    "covar_pop",
    "covar_samp",
    "create",
    "cross",
    "cube",
    "cume_dist",
    "current",
    "current_catalog",
    "current_date",
    "current_default_transform_group",
    "current_path",
    "current_role",
    "current_row",
    "current_schema",
    "current_time",
    "current_timestamp",
    "current_path",
    "current_role",
    "current_transform_group_for_type",
    "current_user",
    "cursor",
    "cycle",
    "date",
    "day",
    "deallocate",
    "dec",
    "decimal",
    "decfloat",
    "declare",
    "default",
    "define",
    "delete",
    "dense_rank",
    "deref",
    "describe",
    "deterministic",
    "disconnect",
    "distinct",
    "double",
    "drop",
    "dynamic",
    "each",
    "element",
    "else",
    "empty",
    "end",
    "end_frame",
    "end_partition",
    "end-exec",
    "equals",
    "escape",
    "every",
    "except",
    "exec",
    "execute",
    "exists",
    "exp",
    "external",
    "extract",
    "false",
    "fetch",
    "filter",
    "first_value",
    "float",
    "floor",
    "for",
    "foreign",
    "frame_row",
    "free",
    "from",
    "full",
    "function",
    "fusion",
    "get",
    "global",
    "grant",
    "group",
    "grouping",
    "groups",
    "having",
    "hold",
    "hour",
    "identity",
    "in",
    "indicator",
    "initial",
    "inner",
    "inout",
    "insensitive",
    "insert",
    "int",
    "integer",
    "intersect",
    "intersection",
    "interval",
    "into",
    "is",
    "join",
    "json_array",
    "json_arrayagg",
    "json_exists",
    "json_object",
    "json_objectagg",
    "json_query",
    "json_table",
    "json_table_primitive",
    "json_value",
    "lag",
    "language",
    "large",
    "last_value",
    "lateral",
    "lead",
    "leading",
    "left",
    "like",
    "like_regex",
    "listagg",
    "ln",
    "local",
    "localtime",
    "localtimestamp",
    "log",
    "log10",
    "lower",
    "match",
    "match_number",
    "match_recognize",
    "matches",
    "max",
    "member",
    "merge",
    "method",
    "min",
    "minute",
    "mod",
    "modifies",
    "module",
    "month",
    "multiset",
    "national",
    "natural",
    "nchar",
    "nclob",
    "new",
    "no",
    "none",
    "normalize",
    "not",
    "nth_value",
    "ntile",
    "null",
    "nullif",
    "numeric",
    "octet_length",
    "occurrences_regex",
    "of",
    "offset",
    "old",
    "omit",
    "on",
    "one",
    "only",
    "open",
    "or",
    "order",
    "out",
    "outer",
    "over",
    "overlaps",
    "overlay",
    "parameter",
    "partition",
    "pattern",
    "per",
    "percent",
    "percent_rank",
    "percentile_cont",
    "percentile_disc",
    "period",
    "portion",
    "position",
    "position_regex",
    "power",
    "precedes",
    "precision",
    "prepare",
    "primary",
    "procedure",
    "ptf",
    "range",
    "rank",
    "reads",
    "real",
    "recursive",
    "ref",
    "references",
    "referencing",
    "regr_avgx",
    "regr_avgy",
    "regr_count",
    "regr_intercept",
    "regr_r2",
    "regr_slope",
    "regr_sxx",
    "regr_sxy",
    "regr_syy",
    "release",
    "result",
    "return",
    "returns",
    "revoke",
    "right",
    "rollback",
    "rollup",
    "row",
    "row_number",
    "rows",
    "running",
    "savepoint",
    "scope",
    "scroll",
    "search",
    "second",
    "seek",
    "select",
    "sensitive",
    "session_user",
    "set",
    "show",
    "similar",
    "sin",
    "sinh",
    "skip",
    "smallint",
    "some",
    "specific",
    "specifictype",
    "sql",
    "sqlexception",
    "sqlstate",
    "sqlwarning",
    "sqrt",
    "start",
    "static",
    "stddev_pop",
    "stddev_samp",
    "submultiset",
    "subset",
    "substring",
    "substring_regex",
    "succeeds",
    "sum",
    "symmetric",
    "system",
    "system_time",
    "system_user",
    "table",
    "tablesample",
    "tan",
    "tanh",
    "then",
    "time",
    "timestamp",
    "timezone_hour",
    "timezone_minute",
    "to",
    "trailing",
    "translate",
    "translate_regex",
    "translation",
    "treat",
    "trigger",
    "trim",
    "trim_array",
    "true",
    "truncate",
    "uescape",
    "union",
    "unique",
    "unknown",
    "unnest",
    "update",
    "upper",
    "user",
    "using",
    "value",
    "values",
    "value_of",
    "var_pop",
    "var_samp",
    "varbinary",
    "varchar",
    "varying",
    "versioning",
    "when",
    "whenever",
    "where",
    "width_bucket",
    "window",
    "with",
    "within",
    "without",
    "year"
  ], u = [
    "abs",
    "acos",
    "array_agg",
    "asin",
    "atan",
    "avg",
    "cast",
    "ceil",
    "ceiling",
    "coalesce",
    "corr",
    "cos",
    "cosh",
    "count",
    "covar_pop",
    "covar_samp",
    "cume_dist",
    "dense_rank",
    "deref",
    "element",
    "exp",
    "extract",
    "first_value",
    "floor",
    "json_array",
    "json_arrayagg",
    "json_exists",
    "json_object",
    "json_objectagg",
    "json_query",
    "json_table",
    "json_table_primitive",
    "json_value",
    "lag",
    "last_value",
    "lead",
    "listagg",
    "ln",
    "log",
    "log10",
    "lower",
    "max",
    "min",
    "mod",
    "nth_value",
    "ntile",
    "nullif",
    "percent_rank",
    "percentile_cont",
    "percentile_disc",
    "position",
    "position_regex",
    "power",
    "rank",
    "regr_avgx",
    "regr_avgy",
    "regr_count",
    "regr_intercept",
    "regr_r2",
    "regr_slope",
    "regr_sxx",
    "regr_sxy",
    "regr_syy",
    "row_number",
    "sin",
    "sinh",
    "sqrt",
    "stddev_pop",
    "stddev_samp",
    "substring",
    "substring_regex",
    "sum",
    "tan",
    "tanh",
    "translate",
    "translate_regex",
    "treat",
    "trim",
    "trim_array",
    "unnest",
    "upper",
    "value_of",
    "var_pop",
    "var_samp",
    "width_bucket"
  ], d = [
    "current_catalog",
    "current_date",
    "current_default_transform_group",
    "current_path",
    "current_role",
    "current_schema",
    "current_transform_group_for_type",
    "current_user",
    "session_user",
    "system_time",
    "system_user",
    "current_time",
    "localtime",
    "current_timestamp",
    "localtimestamp"
  ], f = [
    "create table",
    "insert into",
    "primary key",
    "foreign key",
    "not null",
    "alter table",
    "add constraint",
    "grouping sets",
    "on overflow",
    "character set",
    "respect nulls",
    "ignore nulls",
    "nulls first",
    "nulls last",
    "depth first",
    "breadth first"
  ], p = u, m = [
    ...c,
    ...l
  ].filter((A) => !u.includes(A)), h = {
    scope: "variable",
    match: /@[a-z0-9][a-z0-9_]*/
  }, k = {
    scope: "operator",
    match: /[-+*/=%^~]|&&?|\|\|?|!=?|<(?:=>?|<|>)?|>[>=]?/,
    relevance: 0
  }, y = {
    match: t.concat(/\b/, t.either(...p), /\s*\(/),
    relevance: 0,
    keywords: { built_in: p }
  };
  function S(A) {
    return t.concat(
      /\b/,
      t.either(...A.map((_) => _.replace(/\s+/, "\\s+"))),
      /\b/
    );
  }
  const w = {
    scope: "keyword",
    match: S(f),
    relevance: 0
  };
  function N(A, {
    exceptions: _,
    when: L
  } = {}) {
    const v = L;
    return _ = _ || [], A.map((R) => R.match(/\|\d+$/) || _.includes(R) ? R : v(R) ? `${R}|0` : R);
  }
  return {
    name: "SQL",
    case_insensitive: !0,
    // does not include {} or HTML tags `</`
    illegal: /[{}]|<\//,
    keywords: {
      $pattern: /\b[\w\.]+/,
      keyword: N(m, { when: (A) => A.length < 3 }),
      literal: a,
      type: s,
      built_in: d
    },
    contains: [
      {
        scope: "type",
        match: S(o)
      },
      w,
      y,
      h,
      r,
      i,
      e.C_NUMBER_MODE,
      e.C_BLOCK_COMMENT_MODE,
      n,
      k
    ]
  };
}
function xs(e) {
  return e ? typeof e == "string" ? e : e.source : null;
}
function an(e) {
  return ke("(?=", e, ")");
}
function ke(...e) {
  return e.map((n) => xs(n)).join("");
}
function rb(e) {
  const t = e[e.length - 1];
  return typeof t == "object" && t.constructor === Object ? (e.splice(e.length - 1, 1), t) : {};
}
function $e(...e) {
  return "(" + (rb(e).capture ? "" : "?:") + e.map((r) => xs(r)).join("|") + ")";
}
const fi = (e) => ke(
  /\b/,
  e,
  /\w$/.test(e) ? /\b/ : /\B/
), ib = [
  "Protocol",
  // contextual
  "Type"
  // contextual
].map(fi), Po = [
  "init",
  "self"
].map(fi), ob = [
  "Any",
  "Self"
], kr = [
  // strings below will be fed into the regular `keywords` engine while regex
  // will result in additional modes being created to scan for those keywords to
  // avoid conflicts with other rules
  "actor",
  "any",
  // contextual
  "associatedtype",
  "async",
  "await",
  /as\?/,
  // operator
  /as!/,
  // operator
  "as",
  // operator
  "borrowing",
  // contextual
  "break",
  "case",
  "catch",
  "class",
  "consume",
  // contextual
  "consuming",
  // contextual
  "continue",
  "convenience",
  // contextual
  "copy",
  // contextual
  "default",
  "defer",
  "deinit",
  "didSet",
  // contextual
  "distributed",
  "do",
  "dynamic",
  // contextual
  "each",
  "else",
  "enum",
  "extension",
  "fallthrough",
  /fileprivate\(set\)/,
  "fileprivate",
  "final",
  // contextual
  "for",
  "func",
  "get",
  // contextual
  "guard",
  "if",
  "import",
  "indirect",
  // contextual
  "infix",
  // contextual
  /init\?/,
  /init!/,
  "inout",
  /internal\(set\)/,
  "internal",
  "in",
  "is",
  // operator
  "isolated",
  // contextual
  "nonisolated",
  // contextual
  "lazy",
  // contextual
  "let",
  "macro",
  "mutating",
  // contextual
  "nonmutating",
  // contextual
  /open\(set\)/,
  // contextual
  "open",
  // contextual
  "operator",
  "optional",
  // contextual
  "override",
  // contextual
  "package",
  "postfix",
  // contextual
  "precedencegroup",
  "prefix",
  // contextual
  /private\(set\)/,
  "private",
  "protocol",
  /public\(set\)/,
  "public",
  "repeat",
  "required",
  // contextual
  "rethrows",
  "return",
  "set",
  // contextual
  "some",
  // contextual
  "static",
  "struct",
  "subscript",
  "super",
  "switch",
  "throws",
  "throw",
  /try\?/,
  // operator
  /try!/,
  // operator
  "try",
  // operator
  "typealias",
  /unowned\(safe\)/,
  // contextual
  /unowned\(unsafe\)/,
  // contextual
  "unowned",
  // contextual
  "var",
  "weak",
  // contextual
  "where",
  "while",
  "willSet"
  // contextual
], Bo = [
  "false",
  "nil",
  "true"
], ab = [
  "assignment",
  "associativity",
  "higherThan",
  "left",
  "lowerThan",
  "none",
  "right"
], sb = [
  "#colorLiteral",
  "#column",
  "#dsohandle",
  "#else",
  "#elseif",
  "#endif",
  "#error",
  "#file",
  "#fileID",
  "#fileLiteral",
  "#filePath",
  "#function",
  "#if",
  "#imageLiteral",
  "#keyPath",
  "#line",
  "#selector",
  "#sourceLocation",
  "#warning"
], Fo = [
  "abs",
  "all",
  "any",
  "assert",
  "assertionFailure",
  "debugPrint",
  "dump",
  "fatalError",
  "getVaList",
  "isKnownUniquelyReferenced",
  "max",
  "min",
  "numericCast",
  "pointwiseMax",
  "pointwiseMin",
  "precondition",
  "preconditionFailure",
  "print",
  "readLine",
  "repeatElement",
  "sequence",
  "stride",
  "swap",
  "swift_unboxFromSwiftValueWithType",
  "transcode",
  "type",
  "unsafeBitCast",
  "unsafeDowncast",
  "withExtendedLifetime",
  "withUnsafeMutablePointer",
  "withUnsafePointer",
  "withVaList",
  "withoutActuallyEscaping",
  "zip"
], ws = $e(
  /[/=\-+!*%<>&|^~?]/,
  /[\u00A1-\u00A7]/,
  /[\u00A9\u00AB]/,
  /[\u00AC\u00AE]/,
  /[\u00B0\u00B1]/,
  /[\u00B6\u00BB\u00BF\u00D7\u00F7]/,
  /[\u2016-\u2017]/,
  /[\u2020-\u2027]/,
  /[\u2030-\u203E]/,
  /[\u2041-\u2053]/,
  /[\u2055-\u205E]/,
  /[\u2190-\u23FF]/,
  /[\u2500-\u2775]/,
  /[\u2794-\u2BFF]/,
  /[\u2E00-\u2E7F]/,
  /[\u3001-\u3003]/,
  /[\u3008-\u3020]/,
  /[\u3030]/
), Ss = $e(
  ws,
  /[\u0300-\u036F]/,
  /[\u1DC0-\u1DFF]/,
  /[\u20D0-\u20FF]/,
  /[\uFE00-\uFE0F]/,
  /[\uFE20-\uFE2F]/
  // TODO: The following characters are also allowed, but the regex isn't supported yet.
  // /[\u{E0100}-\u{E01EF}]/u
), xr = ke(ws, Ss, "*"), vs = $e(
  /[a-zA-Z_]/,
  /[\u00A8\u00AA\u00AD\u00AF\u00B2-\u00B5\u00B7-\u00BA]/,
  /[\u00BC-\u00BE\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF]/,
  /[\u0100-\u02FF\u0370-\u167F\u1681-\u180D\u180F-\u1DBF]/,
  /[\u1E00-\u1FFF]/,
  /[\u200B-\u200D\u202A-\u202E\u203F-\u2040\u2054\u2060-\u206F]/,
  /[\u2070-\u20CF\u2100-\u218F\u2460-\u24FF\u2776-\u2793]/,
  /[\u2C00-\u2DFF\u2E80-\u2FFF]/,
  /[\u3004-\u3007\u3021-\u302F\u3031-\u303F\u3040-\uD7FF]/,
  /[\uF900-\uFD3D\uFD40-\uFDCF\uFDF0-\uFE1F\uFE30-\uFE44]/,
  /[\uFE47-\uFEFE\uFF00-\uFFFD]/
  // Should be /[\uFE47-\uFFFD]/, but we have to exclude FEFF.
  // The following characters are also allowed, but the regexes aren't supported yet.
  // /[\u{10000}-\u{1FFFD}\u{20000-\u{2FFFD}\u{30000}-\u{3FFFD}\u{40000}-\u{4FFFD}]/u,
  // /[\u{50000}-\u{5FFFD}\u{60000-\u{6FFFD}\u{70000}-\u{7FFFD}\u{80000}-\u{8FFFD}]/u,
  // /[\u{90000}-\u{9FFFD}\u{A0000-\u{AFFFD}\u{B0000}-\u{BFFFD}\u{C0000}-\u{CFFFD}]/u,
  // /[\u{D0000}-\u{DFFFD}\u{E0000-\u{EFFFD}]/u
), Hn = $e(
  vs,
  /\d/,
  /[\u0300-\u036F\u1DC0-\u1DFF\u20D0-\u20FF\uFE20-\uFE2F]/
), lt = ke(vs, Hn, "*"), Ln = ke(/[A-Z]/, Hn, "*"), lb = [
  "attached",
  "autoclosure",
  ke(/convention\(/, $e("swift", "block", "c"), /\)/),
  "discardableResult",
  "dynamicCallable",
  "dynamicMemberLookup",
  "escaping",
  "freestanding",
  "frozen",
  "GKInspectable",
  "IBAction",
  "IBDesignable",
  "IBInspectable",
  "IBOutlet",
  "IBSegueAction",
  "inlinable",
  "main",
  "nonobjc",
  "NSApplicationMain",
  "NSCopying",
  "NSManaged",
  ke(/objc\(/, lt, /\)/),
  "objc",
  "objcMembers",
  "propertyWrapper",
  "requires_stored_property_inits",
  "resultBuilder",
  "Sendable",
  "testable",
  "UIApplicationMain",
  "unchecked",
  "unknown",
  "usableFromInline",
  "warn_unqualified_access"
], cb = [
  "iOS",
  "iOSApplicationExtension",
  "macOS",
  "macOSApplicationExtension",
  "macCatalyst",
  "macCatalystApplicationExtension",
  "watchOS",
  "watchOSApplicationExtension",
  "tvOS",
  "tvOSApplicationExtension",
  "swift"
];
function ub(e) {
  const t = {
    match: /\s+/,
    relevance: 0
  }, n = e.COMMENT(
    "/\\*",
    "\\*/",
    { contains: ["self"] }
  ), r = [
    e.C_LINE_COMMENT_MODE,
    n
  ], i = {
    match: [
      /\./,
      $e(...ib, ...Po)
    ],
    className: { 2: "keyword" }
  }, a = {
    // Consume .keyword to prevent highlighting properties and methods as keywords.
    match: ke(/\./, $e(...kr)),
    relevance: 0
  }, o = kr.filter((he) => typeof he == "string").concat(["_|0"]), s = kr.filter((he) => typeof he != "string").concat(ob).map(fi), l = { variants: [
    {
      className: "keyword",
      match: $e(...s, ...Po)
    }
  ] }, c = {
    $pattern: $e(
      /\b\w+/,
      // regular keywords
      /#\w+/
      // number keywords
    ),
    keyword: o.concat(sb),
    literal: Bo
  }, u = [
    i,
    a,
    l
  ], d = {
    // Consume .built_in to prevent highlighting properties and methods.
    match: ke(/\./, $e(...Fo)),
    relevance: 0
  }, f = {
    className: "built_in",
    match: ke(/\b/, $e(...Fo), /(?=\()/)
  }, p = [
    d,
    f
  ], m = {
    // Prevent -> from being highlighting as an operator.
    match: /->/,
    relevance: 0
  }, h = {
    className: "operator",
    relevance: 0,
    variants: [
      { match: xr },
      {
        // dot-operator: only operators that start with a dot are allowed to use dots as
        // characters (..., ...<, .*, etc). So there rule here is: a dot followed by one or more
        // characters that may also include dots.
        match: `\\.(\\.|${Ss})+`
      }
    ]
  }, k = [
    m,
    h
  ], y = "([0-9]_*)+", S = "([0-9a-fA-F]_*)+", w = {
    className: "number",
    relevance: 0,
    variants: [
      // decimal floating-point-literal (subsumes decimal-literal)
      { match: `\\b(${y})(\\.(${y}))?([eE][+-]?(${y}))?\\b` },
      // hexadecimal floating-point-literal (subsumes hexadecimal-literal)
      { match: `\\b0x(${S})(\\.(${S}))?([pP][+-]?(${y}))?\\b` },
      // octal-literal
      { match: /\b0o([0-7]_*)+\b/ },
      // binary-literal
      { match: /\b0b([01]_*)+\b/ }
    ]
  }, N = (he = "") => ({
    className: "subst",
    variants: [
      { match: ke(/\\/, he, /[0\\tnr"']/) },
      { match: ke(/\\/, he, /u\{[0-9a-fA-F]{1,8}\}/) }
    ]
  }), A = (he = "") => ({
    className: "subst",
    match: ke(/\\/, he, /[\t ]*(?:[\r\n]|\r\n)/)
  }), _ = (he = "") => ({
    className: "subst",
    label: "interpol",
    begin: ke(/\\/, he, /\(/),
    end: /\)/
  }), L = (he = "") => ({
    begin: ke(he, /"""/),
    end: ke(/"""/, he),
    contains: [
      N(he),
      A(he),
      _(he)
    ]
  }), v = (he = "") => ({
    begin: ke(he, /"/),
    end: ke(/"/, he),
    contains: [
      N(he),
      _(he)
    ]
  }), R = {
    className: "string",
    variants: [
      L(),
      L("#"),
      L("##"),
      L("###"),
      v(),
      v("#"),
      v("##"),
      v("###")
    ]
  }, x = [
    e.BACKSLASH_ESCAPE,
    {
      begin: /\[/,
      end: /\]/,
      relevance: 0,
      contains: [e.BACKSLASH_ESCAPE]
    }
  ], O = {
    begin: /\/[^\s](?=[^/\n]*\/)/,
    end: /\//,
    contains: x
  }, F = (he) => {
    const dt = ke(he, /\//), pt = ke(/\//, he);
    return {
      begin: dt,
      end: pt,
      contains: [
        ...x,
        {
          scope: "comment",
          begin: `#(?!.*${pt})`,
          end: /$/
        }
      ]
    };
  }, U = {
    scope: "regexp",
    variants: [
      F("###"),
      F("##"),
      F("#"),
      O
    ]
  }, D = { match: ke(/`/, lt, /`/) }, $ = {
    className: "variable",
    match: /\$\d+/
  }, Q = {
    className: "variable",
    match: `\\$${Hn}+`
  }, se = [
    D,
    $,
    Q
  ], I = {
    match: /(@|#(un)?)available/,
    scope: "keyword",
    starts: { contains: [
      {
        begin: /\(/,
        end: /\)/,
        keywords: cb,
        contains: [
          ...k,
          w,
          R
        ]
      }
    ] }
  }, fe = {
    scope: "keyword",
    match: ke(/@/, $e(...lb), an($e(/\(/, /\s+/)))
  }, g = {
    scope: "meta",
    match: ke(/@/, lt)
  }, G = [
    I,
    fe,
    g
  ], j = {
    match: an(/\b[A-Z]/),
    relevance: 0,
    contains: [
      {
        // Common Apple frameworks, for relevance boost
        className: "type",
        match: ke(/(AV|CA|CF|CG|CI|CL|CM|CN|CT|MK|MP|MTK|MTL|NS|SCN|SK|UI|WK|XC)/, Hn, "+")
      },
      {
        // Type identifier
        className: "type",
        match: Ln,
        relevance: 0
      },
      {
        // Optional type
        match: /[?!]+/,
        relevance: 0
      },
      {
        // Variadic parameter
        match: /\.\.\./,
        relevance: 0
      },
      {
        // Protocol composition
        match: ke(/\s+&\s+/, an(Ln)),
        relevance: 0
      }
    ]
  }, b = {
    begin: /</,
    end: />/,
    keywords: c,
    contains: [
      ...r,
      ...u,
      ...G,
      m,
      j
    ]
  };
  j.contains.push(b);
  const le = {
    match: ke(lt, /\s*:/),
    keywords: "_|0",
    relevance: 0
  }, _e = {
    begin: /\(/,
    end: /\)/,
    relevance: 0,
    keywords: c,
    contains: [
      "self",
      le,
      ...r,
      U,
      ...u,
      ...p,
      ...k,
      w,
      R,
      ...se,
      ...G,
      j
    ]
  }, be = {
    begin: /</,
    end: />/,
    keywords: "repeat each",
    contains: [
      ...r,
      j
    ]
  }, me = {
    begin: $e(
      an(ke(lt, /\s*:/)),
      an(ke(lt, /\s+/, lt, /\s*:/))
    ),
    end: /:/,
    relevance: 0,
    contains: [
      {
        className: "keyword",
        match: /\b_\b/
      },
      {
        className: "params",
        match: lt
      }
    ]
  }, ge = {
    begin: /\(/,
    end: /\)/,
    keywords: c,
    contains: [
      me,
      ...r,
      ...u,
      ...k,
      w,
      R,
      ...G,
      j,
      _e
    ],
    endsParent: !0,
    illegal: /["']/
  }, Ne = {
    match: [
      /(func|macro)/,
      /\s+/,
      $e(D.match, lt, xr)
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      be,
      ge,
      t
    ],
    illegal: [
      /\[/,
      /%/
    ]
  }, Te = {
    match: [
      /\b(?:subscript|init[?!]?)/,
      /\s*(?=[<(])/
    ],
    className: { 1: "keyword" },
    contains: [
      be,
      ge,
      t
    ],
    illegal: /\[|%/
  }, Ke = {
    match: [
      /operator/,
      /\s+/,
      xr
    ],
    className: {
      1: "keyword",
      3: "title"
    }
  }, ot = {
    begin: [
      /precedencegroup/,
      /\s+/,
      Ln
    ],
    className: {
      1: "keyword",
      3: "title"
    },
    contains: [j],
    keywords: [
      ...ab,
      ...Bo
    ],
    end: /}/
  }, Yt = {
    match: [
      /class\b/,
      /\s+/,
      /func\b/,
      /\s+/,
      /\b[A-Za-z_][A-Za-z0-9_]*\b/
    ],
    scope: {
      1: "keyword",
      3: "keyword",
      5: "title.function"
    }
  }, jt = {
    match: [
      /class\b/,
      /\s+/,
      /var\b/
    ],
    scope: {
      1: "keyword",
      3: "keyword"
    }
  }, It = {
    begin: [
      /(struct|protocol|class|extension|enum|actor)/,
      /\s+/,
      lt,
      /\s*/
    ],
    beginScope: {
      1: "keyword",
      3: "title.class"
    },
    keywords: c,
    contains: [
      be,
      ...u,
      {
        begin: /:/,
        end: /\{/,
        keywords: c,
        contains: [
          {
            scope: "title.class.inherited",
            match: Ln
          },
          ...u
        ],
        relevance: 0
      }
    ]
  };
  for (const he of R.variants) {
    const dt = he.contains.find((Mt) => Mt.label === "interpol");
    dt.keywords = c;
    const pt = [
      ...u,
      ...p,
      ...k,
      w,
      R,
      ...se
    ];
    dt.contains = [
      ...pt,
      {
        begin: /\(/,
        end: /\)/,
        contains: [
          "self",
          ...pt
        ]
      }
    ];
  }
  return {
    name: "Swift",
    keywords: c,
    contains: [
      ...r,
      Ne,
      Te,
      Yt,
      jt,
      It,
      Ke,
      ot,
      {
        beginKeywords: "import",
        end: /$/,
        contains: [...r],
        relevance: 0
      },
      U,
      ...u,
      ...p,
      ...k,
      w,
      R,
      ...se,
      ...G,
      j,
      _e
    ]
  };
}
const Gn = "[A-Za-z$_][0-9A-Za-z$_]*", Ts = [
  "as",
  // for exports
  "in",
  "of",
  "if",
  "for",
  "while",
  "finally",
  "var",
  "new",
  "function",
  "do",
  "return",
  "void",
  "else",
  "break",
  "catch",
  "instanceof",
  "with",
  "throw",
  "case",
  "default",
  "try",
  "switch",
  "continue",
  "typeof",
  "delete",
  "let",
  "yield",
  "const",
  "class",
  // JS handles these with a special rule
  // "get",
  // "set",
  "debugger",
  "async",
  "await",
  "static",
  "import",
  "from",
  "export",
  "extends",
  // It's reached stage 3, which is "recommended for implementation":
  "using"
], Ns = [
  "true",
  "false",
  "null",
  "undefined",
  "NaN",
  "Infinity"
], As = [
  // Fundamental objects
  "Object",
  "Function",
  "Boolean",
  "Symbol",
  // numbers and dates
  "Math",
  "Date",
  "Number",
  "BigInt",
  // text
  "String",
  "RegExp",
  // Indexed collections
  "Array",
  "Float32Array",
  "Float64Array",
  "Int8Array",
  "Uint8Array",
  "Uint8ClampedArray",
  "Int16Array",
  "Int32Array",
  "Uint16Array",
  "Uint32Array",
  "BigInt64Array",
  "BigUint64Array",
  // Keyed collections
  "Set",
  "Map",
  "WeakSet",
  "WeakMap",
  // Structured data
  "ArrayBuffer",
  "SharedArrayBuffer",
  "Atomics",
  "DataView",
  "JSON",
  // Control abstraction objects
  "Promise",
  "Generator",
  "GeneratorFunction",
  "AsyncFunction",
  // Reflection
  "Reflect",
  "Proxy",
  // Internationalization
  "Intl",
  // WebAssembly
  "WebAssembly"
], Cs = [
  "Error",
  "EvalError",
  "InternalError",
  "RangeError",
  "ReferenceError",
  "SyntaxError",
  "TypeError",
  "URIError"
], Rs = [
  "setInterval",
  "setTimeout",
  "clearInterval",
  "clearTimeout",
  "require",
  "exports",
  "eval",
  "isFinite",
  "isNaN",
  "parseFloat",
  "parseInt",
  "decodeURI",
  "decodeURIComponent",
  "encodeURI",
  "encodeURIComponent",
  "escape",
  "unescape"
], Os = [
  "arguments",
  "this",
  "super",
  "console",
  "window",
  "document",
  "localStorage",
  "sessionStorage",
  "module",
  "global"
  // Node.js
], Is = [].concat(
  Rs,
  As,
  Cs
);
function db(e) {
  const t = e.regex, n = (I, { after: fe }) => {
    const g = "</" + I[0].slice(1);
    return I.input.indexOf(g, fe) !== -1;
  }, r = Gn, i = {
    begin: "<>",
    end: "</>"
  }, a = /<[A-Za-z0-9\\._:-]+\s*\/>/, o = {
    begin: /<[A-Za-z0-9\\._:-]+/,
    end: /\/[A-Za-z0-9\\._:-]+>|\/>/,
    /**
     * @param {RegExpMatchArray} match
     * @param {CallbackResponse} response
     */
    isTrulyOpeningTag: (I, fe) => {
      const g = I[0].length + I.index, G = I.input[g];
      if (
        // HTML should not include another raw `<` inside a tag
        // nested type?
        // `<Array<Array<number>>`, etc.
        G === "<" || // the , gives away that this is not HTML
        // `<T, A extends keyof T, V>`
        G === ","
      ) {
        fe.ignoreMatch();
        return;
      }
      G === ">" && (n(I, { after: g }) || fe.ignoreMatch());
      let j;
      const b = I.input.substring(g);
      if (j = b.match(/^\s*=/)) {
        fe.ignoreMatch();
        return;
      }
      if ((j = b.match(/^\s+extends\s+/)) && j.index === 0) {
        fe.ignoreMatch();
        return;
      }
    }
  }, s = {
    $pattern: Gn,
    keyword: Ts,
    literal: Ns,
    built_in: Is,
    "variable.language": Os
  }, l = "[0-9](_?[0-9])*", c = `\\.(${l})`, u = "0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*", d = {
    className: "number",
    variants: [
      // DecimalLiteral
      { begin: `(\\b(${u})((${c})|\\.)?|(${c}))[eE][+-]?(${l})\\b` },
      { begin: `\\b(${u})\\b((${c})\\b|\\.)?|(${c})\\b` },
      // DecimalBigIntegerLiteral
      { begin: "\\b(0|[1-9](_?[0-9])*)n\\b" },
      // NonDecimalIntegerLiteral
      { begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b" },
      { begin: "\\b0[bB][0-1](_?[0-1])*n?\\b" },
      { begin: "\\b0[oO][0-7](_?[0-7])*n?\\b" },
      // LegacyOctalIntegerLiteral (does not include underscore separators)
      // https://tc39.es/ecma262/#sec-additional-syntax-numeric-literals
      { begin: "\\b0[0-7]+n?\\b" }
    ],
    relevance: 0
  }, f = {
    className: "subst",
    begin: "\\$\\{",
    end: "\\}",
    keywords: s,
    contains: []
    // defined later
  }, p = {
    begin: ".?html`",
    end: "",
    starts: {
      end: "`",
      returnEnd: !1,
      contains: [
        e.BACKSLASH_ESCAPE,
        f
      ],
      subLanguage: "xml"
    }
  }, m = {
    begin: ".?css`",
    end: "",
    starts: {
      end: "`",
      returnEnd: !1,
      contains: [
        e.BACKSLASH_ESCAPE,
        f
      ],
      subLanguage: "css"
    }
  }, h = {
    begin: ".?gql`",
    end: "",
    starts: {
      end: "`",
      returnEnd: !1,
      contains: [
        e.BACKSLASH_ESCAPE,
        f
      ],
      subLanguage: "graphql"
    }
  }, k = {
    className: "string",
    begin: "`",
    end: "`",
    contains: [
      e.BACKSLASH_ESCAPE,
      f
    ]
  }, S = {
    className: "comment",
    variants: [
      e.COMMENT(
        /\/\*\*(?!\/)/,
        "\\*/",
        {
          relevance: 0,
          contains: [
            {
              begin: "(?=@[A-Za-z]+)",
              relevance: 0,
              contains: [
                {
                  className: "doctag",
                  begin: "@[A-Za-z]+"
                },
                {
                  className: "type",
                  begin: "\\{",
                  end: "\\}",
                  excludeEnd: !0,
                  excludeBegin: !0,
                  relevance: 0
                },
                {
                  className: "variable",
                  begin: r + "(?=\\s*(-)|$)",
                  endsParent: !0,
                  relevance: 0
                },
                // eat spaces (not newlines) so we can find
                // types or variables
                {
                  begin: /(?=[^\n])\s/,
                  relevance: 0
                }
              ]
            }
          ]
        }
      ),
      e.C_BLOCK_COMMENT_MODE,
      e.C_LINE_COMMENT_MODE
    ]
  }, w = [
    e.APOS_STRING_MODE,
    e.QUOTE_STRING_MODE,
    p,
    m,
    h,
    k,
    // Skip numbers when they are part of a variable name
    { match: /\$\d+/ },
    d
    // This is intentional:
    // See https://github.com/highlightjs/highlight.js/issues/3288
    // hljs.REGEXP_MODE
  ];
  f.contains = w.concat({
    // we need to pair up {} inside our subst to prevent
    // it from ending too early by matching another }
    begin: /\{/,
    end: /\}/,
    keywords: s,
    contains: [
      "self"
    ].concat(w)
  });
  const N = [].concat(S, f.contains), A = N.concat([
    // eat recursive parens in sub expressions
    {
      begin: /(\s*)\(/,
      end: /\)/,
      keywords: s,
      contains: ["self"].concat(N)
    }
  ]), _ = {
    className: "params",
    // convert this to negative lookbehind in v12
    begin: /(\s*)\(/,
    // to match the parms with
    end: /\)/,
    excludeBegin: !0,
    excludeEnd: !0,
    keywords: s,
    contains: A
  }, L = {
    variants: [
      // class Car extends vehicle
      {
        match: [
          /class/,
          /\s+/,
          r,
          /\s+/,
          /extends/,
          /\s+/,
          t.concat(r, "(", t.concat(/\./, r), ")*")
        ],
        scope: {
          1: "keyword",
          3: "title.class",
          5: "keyword",
          7: "title.class.inherited"
        }
      },
      // class Car
      {
        match: [
          /class/,
          /\s+/,
          r
        ],
        scope: {
          1: "keyword",
          3: "title.class"
        }
      }
    ]
  }, v = {
    relevance: 0,
    match: t.either(
      // Hard coded exceptions
      /\bJSON/,
      // Float32Array, OutT
      /\b[A-Z][a-z]+([A-Z][a-z]*|\d)*/,
      // CSSFactory, CSSFactoryT
      /\b[A-Z]{2,}([A-Z][a-z]+|\d)+([A-Z][a-z]*)*/,
      // FPs, FPsT
      /\b[A-Z]{2,}[a-z]+([A-Z][a-z]+|\d)*([A-Z][a-z]*)*/
      // P
      // single letters are not highlighted
      // BLAH
      // this will be flagged as a UPPER_CASE_CONSTANT instead
    ),
    className: "title.class",
    keywords: {
      _: [
        // se we still get relevance credit for JS library classes
        ...As,
        ...Cs
      ]
    }
  }, R = {
    label: "use_strict",
    className: "meta",
    relevance: 10,
    begin: /^\s*['"]use (strict|asm)['"]/
  }, x = {
    variants: [
      {
        match: [
          /function/,
          /\s+/,
          r,
          /(?=\s*\()/
        ]
      },
      // anonymous function
      {
        match: [
          /function/,
          /\s*(?=\()/
        ]
      }
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    label: "func.def",
    contains: [_],
    illegal: /%/
  }, O = {
    relevance: 0,
    match: /\b[A-Z][A-Z_0-9]+\b/,
    className: "variable.constant"
  };
  function F(I) {
    return t.concat("(?!", I.join("|"), ")");
  }
  const U = {
    match: t.concat(
      /\b/,
      F([
        ...Rs,
        "super",
        "import"
      ].map((I) => `${I}\\s*\\(`)),
      r,
      t.lookahead(/\s*\(/)
    ),
    className: "title.function",
    relevance: 0
  }, D = {
    begin: t.concat(/\./, t.lookahead(
      t.concat(r, /(?![0-9A-Za-z$_(])/)
    )),
    end: r,
    excludeBegin: !0,
    keywords: "prototype",
    className: "property",
    relevance: 0
  }, $ = {
    match: [
      /get|set/,
      /\s+/,
      r,
      /(?=\()/
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      {
        // eat to avoid empty params
        begin: /\(\)/
      },
      _
    ]
  }, Q = "(\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)|" + e.UNDERSCORE_IDENT_RE + ")\\s*=>", se = {
    match: [
      /const|var|let/,
      /\s+/,
      r,
      /\s*/,
      /=\s*/,
      /(async\s*)?/,
      // async is optional
      t.lookahead(Q)
    ],
    keywords: "async",
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      _
    ]
  };
  return {
    name: "JavaScript",
    aliases: ["js", "jsx", "mjs", "cjs"],
    keywords: s,
    // this will be extended by TypeScript
    exports: { PARAMS_CONTAINS: A, CLASS_REFERENCE: v },
    illegal: /#(?![$_A-z])/,
    contains: [
      e.SHEBANG({
        label: "shebang",
        binary: "node",
        relevance: 5
      }),
      R,
      e.APOS_STRING_MODE,
      e.QUOTE_STRING_MODE,
      p,
      m,
      h,
      k,
      S,
      // Skip numbers when they are part of a variable name
      { match: /\$\d+/ },
      d,
      v,
      {
        scope: "attr",
        match: r + t.lookahead(":"),
        relevance: 0
      },
      se,
      {
        // "value" container
        begin: "(" + e.RE_STARTERS_RE + "|\\b(case|return|throw)\\b)\\s*",
        keywords: "return throw case",
        relevance: 0,
        contains: [
          S,
          e.REGEXP_MODE,
          {
            className: "function",
            // we have to count the parens to make sure we actually have the
            // correct bounding ( ) before the =>.  There could be any number of
            // sub-expressions inside also surrounded by parens.
            begin: Q,
            returnBegin: !0,
            end: "\\s*=>",
            contains: [
              {
                className: "params",
                variants: [
                  {
                    begin: e.UNDERSCORE_IDENT_RE,
                    relevance: 0
                  },
                  {
                    className: null,
                    begin: /\(\s*\)/,
                    skip: !0
                  },
                  {
                    begin: /(\s*)\(/,
                    end: /\)/,
                    excludeBegin: !0,
                    excludeEnd: !0,
                    keywords: s,
                    contains: A
                  }
                ]
              }
            ]
          },
          {
            // could be a comma delimited list of params to a function call
            begin: /,/,
            relevance: 0
          },
          {
            match: /\s+/,
            relevance: 0
          },
          {
            // JSX
            variants: [
              { begin: i.begin, end: i.end },
              { match: a },
              {
                begin: o.begin,
                // we carefully check the opening tag to see if it truly
                // is a tag and not a false positive
                "on:begin": o.isTrulyOpeningTag,
                end: o.end
              }
            ],
            subLanguage: "xml",
            contains: [
              {
                begin: o.begin,
                end: o.end,
                skip: !0,
                contains: ["self"]
              }
            ]
          }
        ]
      },
      x,
      {
        // prevent this from getting swallowed up by function
        // since they appear "function like"
        beginKeywords: "while if switch catch for"
      },
      {
        // we have to count the parens to make sure we actually have the correct
        // bounding ( ).  There could be any number of sub-expressions inside
        // also surrounded by parens.
        begin: "\\b(?!function)" + e.UNDERSCORE_IDENT_RE + "\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)\\s*\\{",
        // end parens
        returnBegin: !0,
        label: "func.def",
        contains: [
          _,
          e.inherit(e.TITLE_MODE, { begin: r, className: "title.function" })
        ]
      },
      // catch ... so it won't trigger the property rule below
      {
        match: /\.\.\./,
        relevance: 0
      },
      D,
      // hack: prevents detection of keywords in some circumstances
      // .keyword()
      // $keyword = x
      {
        match: "\\$" + r,
        relevance: 0
      },
      {
        match: [/\bconstructor(?=\s*\()/],
        className: { 1: "title.function" },
        contains: [_]
      },
      U,
      O,
      L,
      $,
      {
        match: /\$[(.]/
        // relevance booster for a pattern common to JS libs: `$(something)` and `$.something`
      }
    ]
  };
}
function qr(e) {
  const t = e.regex, n = db(e), r = Gn, i = [
    "any",
    "void",
    "number",
    "boolean",
    "string",
    "object",
    "never",
    "symbol",
    "bigint",
    "unknown"
  ], a = {
    begin: [
      /namespace/,
      /\s+/,
      e.IDENT_RE
    ],
    beginScope: {
      1: "keyword",
      3: "title.class"
    }
  }, o = {
    beginKeywords: "interface",
    end: /\{/,
    excludeEnd: !0,
    keywords: {
      keyword: "interface extends",
      built_in: i
    },
    contains: [n.exports.CLASS_REFERENCE]
  }, s = {
    className: "meta",
    relevance: 10,
    begin: /^\s*['"]use strict['"]/
  }, l = [
    "type",
    // "namespace",
    "interface",
    "public",
    "private",
    "protected",
    "implements",
    "declare",
    "abstract",
    "readonly",
    "enum",
    "override",
    "satisfies"
  ], c = {
    $pattern: Gn,
    keyword: Ts.concat(l),
    literal: Ns,
    built_in: Is.concat(i),
    "variable.language": Os
  }, u = {
    className: "meta",
    begin: "@" + r
  }, d = (h, k, y) => {
    const S = h.contains.findIndex((w) => w.label === k);
    if (S === -1)
      throw new Error("can not find mode to replace");
    h.contains.splice(S, 1, y);
  };
  Object.assign(n.keywords, c), n.exports.PARAMS_CONTAINS.push(u);
  const f = n.contains.find((h) => h.scope === "attr"), p = Object.assign(
    {},
    f,
    { match: t.concat(r, t.lookahead(/\s*\?:/)) }
  );
  n.exports.PARAMS_CONTAINS.push([
    n.exports.CLASS_REFERENCE,
    // class reference for highlighting the params types
    f,
    // highlight the params key
    p
    // Added for optional property assignment highlighting
  ]), n.contains = n.contains.concat([
    u,
    a,
    o,
    p
    // Added for optional property assignment highlighting
  ]), d(n, "shebang", e.SHEBANG()), d(n, "use_strict", s);
  const m = n.contains.find((h) => h.label === "func.def");
  return m.relevance = 0, Object.assign(n, {
    name: "TypeScript",
    aliases: [
      "ts",
      "tsx",
      "mts",
      "cts"
    ]
  }), n;
}
function pb(e) {
  const t = e.regex, n = {
    className: "string",
    begin: /"(""|[^/n])"C\b/
  }, r = {
    className: "string",
    begin: /"/,
    end: /"/,
    illegal: /\n/,
    contains: [
      {
        // double quote escape
        begin: /""/
      }
    ]
  }, i = /\d{1,2}\/\d{1,2}\/\d{4}/, a = /\d{4}-\d{1,2}-\d{1,2}/, o = /(\d|1[012])(:\d+){0,2} *(AM|PM)/, s = /\d{1,2}(:\d{1,2}){1,2}/, l = {
    className: "literal",
    variants: [
      {
        // #YYYY-MM-DD# (ISO-Date) or #M/D/YYYY# (US-Date)
        begin: t.concat(/# */, t.either(a, i), / *#/)
      },
      {
        // #H:mm[:ss]# (24h Time)
        begin: t.concat(/# */, s, / *#/)
      },
      {
        // #h[:mm[:ss]] A# (12h Time)
        begin: t.concat(/# */, o, / *#/)
      },
      {
        // date plus time
        begin: t.concat(
          /# */,
          t.either(a, i),
          / +/,
          t.either(o, s),
          / *#/
        )
      }
    ]
  }, c = {
    className: "number",
    relevance: 0,
    variants: [
      {
        // Float
        begin: /\b\d[\d_]*((\.[\d_]+(E[+-]?[\d_]+)?)|(E[+-]?[\d_]+))[RFD@!#]?/
      },
      {
        // Integer (base 10)
        begin: /\b\d[\d_]*((U?[SIL])|[%&])?/
      },
      {
        // Integer (base 16)
        begin: /&H[\dA-F_]+((U?[SIL])|[%&])?/
      },
      {
        // Integer (base 8)
        begin: /&O[0-7_]+((U?[SIL])|[%&])?/
      },
      {
        // Integer (base 2)
        begin: /&B[01_]+((U?[SIL])|[%&])?/
      }
    ]
  }, u = {
    className: "label",
    begin: /^\w+:/
  }, d = e.COMMENT(/'''/, /$/, { contains: [
    {
      className: "doctag",
      begin: /<\/?/,
      end: />/
    }
  ] }), f = e.COMMENT(null, /$/, { variants: [
    { begin: /'/ },
    {
      // TODO: Use multi-class for leading spaces
      begin: /([\t ]|^)REM(?=\s)/
    }
  ] });
  return {
    name: "Visual Basic .NET",
    aliases: ["vb"],
    case_insensitive: !0,
    classNameAliases: { label: "symbol" },
    keywords: {
      keyword: "addhandler alias aggregate ansi as async assembly auto binary by byref byval call case catch class compare const continue custom declare default delegate dim distinct do each equals else elseif end enum erase error event exit explicit finally for friend from function get global goto group handles if implements imports in inherits interface into iterator join key let lib loop me mid module mustinherit mustoverride mybase myclass namespace narrowing new next notinheritable notoverridable of off on operator option optional order overloads overridable overrides paramarray partial preserve private property protected public raiseevent readonly redim removehandler resume return select set shadows shared skip static step stop structure strict sub synclock take text then throw to try unicode until using when where while widening with withevents writeonly yield",
      built_in: (
        // Operators https://docs.microsoft.com/dotnet/visual-basic/language-reference/operators
        "addressof and andalso await directcast gettype getxmlnamespace is isfalse isnot istrue like mod nameof new not or orelse trycast typeof xor cbool cbyte cchar cdate cdbl cdec cint clng cobj csbyte cshort csng cstr cuint culng cushort"
      ),
      type: (
        // Data types https://docs.microsoft.com/dotnet/visual-basic/language-reference/data-types
        "boolean byte char date decimal double integer long object sbyte short single string uinteger ulong ushort"
      ),
      literal: "true false nothing"
    },
    illegal: "//|\\{|\\}|endif|gosub|variant|wend|^\\$ ",
    contains: [
      n,
      r,
      l,
      c,
      u,
      d,
      f,
      {
        className: "meta",
        // TODO: Use multi-class for indentation once available
        begin: /[\t ]*#(const|disable|else|elseif|enable|end|externalsource|if|region)\b/,
        end: /$/,
        keywords: { keyword: "const disable else elseif enable end externalsource if region then" },
        contains: [f]
      }
    ]
  };
}
function fb(e) {
  e.regex;
  const t = e.COMMENT(/\(;/, /;\)/);
  t.contains.push("self");
  const n = e.COMMENT(/;;/, /$/), r = [
    "anyfunc",
    "block",
    "br",
    "br_if",
    "br_table",
    "call",
    "call_indirect",
    "data",
    "drop",
    "elem",
    "else",
    "end",
    "export",
    "func",
    "global.get",
    "global.set",
    "local.get",
    "local.set",
    "local.tee",
    "get_global",
    "get_local",
    "global",
    "if",
    "import",
    "local",
    "loop",
    "memory",
    "memory.grow",
    "memory.size",
    "module",
    "mut",
    "nop",
    "offset",
    "param",
    "result",
    "return",
    "select",
    "set_global",
    "set_local",
    "start",
    "table",
    "tee_local",
    "then",
    "type",
    "unreachable"
  ], i = {
    begin: [
      /(?:func|call|call_indirect)/,
      /\s+/,
      /\$[^\s)]+/
    ],
    className: {
      1: "keyword",
      3: "title.function"
    }
  }, a = {
    className: "variable",
    begin: /\$[\w_]+/
  }, o = {
    match: /(\((?!;)|\))+/,
    className: "punctuation",
    relevance: 0
  }, s = {
    className: "number",
    relevance: 0,
    // borrowed from Prism, TODO: split out into variants
    match: /[+-]?\b(?:\d(?:_?\d)*(?:\.\d(?:_?\d)*)?(?:[eE][+-]?\d(?:_?\d)*)?|0x[\da-fA-F](?:_?[\da-fA-F])*(?:\.[\da-fA-F](?:_?[\da-fA-D])*)?(?:[pP][+-]?\d(?:_?\d)*)?)\b|\binf\b|\bnan(?::0x[\da-fA-F](?:_?[\da-fA-D])*)?\b/
  }, l = {
    // look-ahead prevents us from gobbling up opcodes
    match: /(i32|i64|f32|f64)(?!\.)/,
    className: "type"
  }, c = {
    className: "keyword",
    // borrowed from Prism, TODO: split out into variants
    match: /\b(f32|f64|i32|i64)(?:\.(?:abs|add|and|ceil|clz|const|convert_[su]\/i(?:32|64)|copysign|ctz|demote\/f64|div(?:_[su])?|eqz?|extend_[su]\/i32|floor|ge(?:_[su])?|gt(?:_[su])?|le(?:_[su])?|load(?:(?:8|16|32)_[su])?|lt(?:_[su])?|max|min|mul|nearest|neg?|or|popcnt|promote\/f32|reinterpret\/[fi](?:32|64)|rem_[su]|rot[lr]|shl|shr_[su]|store(?:8|16|32)?|sqrt|sub|trunc(?:_[su]\/f(?:32|64))?|wrap\/i64|xor))\b/
  };
  return {
    name: "WebAssembly",
    keywords: {
      $pattern: /[\w.]+/,
      keyword: r
    },
    contains: [
      n,
      t,
      {
        match: [
          /(?:offset|align)/,
          /\s*/,
          /=/
        ],
        className: {
          1: "keyword",
          3: "operator"
        }
      },
      a,
      o,
      i,
      e.QUOTE_STRING_MODE,
      l,
      c,
      s
    ]
  };
}
function Ms(e) {
  const t = e.regex, n = t.concat(/[\p{L}_]/u, t.optional(/[\p{L}0-9_.-]*:/u), /[\p{L}0-9_.-]*/u), r = /[\p{L}0-9._:-]+/u, i = {
    className: "symbol",
    begin: /&[a-z]+;|&#[0-9]+;|&#x[a-f0-9]+;/
  }, a = {
    begin: /\s/,
    contains: [
      {
        className: "keyword",
        begin: /#?[a-z_][a-z1-9_-]+/,
        illegal: /\n/
      }
    ]
  }, o = e.inherit(a, {
    begin: /\(/,
    end: /\)/
  }), s = e.inherit(e.APOS_STRING_MODE, { className: "string" }), l = e.inherit(e.QUOTE_STRING_MODE, { className: "string" }), c = {
    endsWithParent: !0,
    illegal: /</,
    relevance: 0,
    contains: [
      {
        className: "attr",
        begin: r,
        relevance: 0
      },
      {
        begin: /=\s*/,
        relevance: 0,
        contains: [
          {
            className: "string",
            endsParent: !0,
            variants: [
              {
                begin: /"/,
                end: /"/,
                contains: [i]
              },
              {
                begin: /'/,
                end: /'/,
                contains: [i]
              },
              { begin: /[^\s"'=<>`]+/ }
            ]
          }
        ]
      }
    ]
  };
  return {
    name: "HTML, XML",
    aliases: [
      "html",
      "xhtml",
      "rss",
      "atom",
      "xjb",
      "xsd",
      "xsl",
      "plist",
      "wsf",
      "svg"
    ],
    case_insensitive: !0,
    unicodeRegex: !0,
    contains: [
      {
        className: "meta",
        begin: /<![a-z]/,
        end: />/,
        relevance: 10,
        contains: [
          a,
          l,
          s,
          o,
          {
            begin: /\[/,
            end: /\]/,
            contains: [
              {
                className: "meta",
                begin: /<![a-z]/,
                end: />/,
                contains: [
                  a,
                  o,
                  l,
                  s
                ]
              }
            ]
          }
        ]
      },
      e.COMMENT(
        /<!--/,
        /-->/,
        { relevance: 10 }
      ),
      {
        begin: /<!\[CDATA\[/,
        end: /\]\]>/,
        relevance: 10
      },
      i,
      // xml processing instructions
      {
        className: "meta",
        end: /\?>/,
        variants: [
          {
            begin: /<\?xml/,
            relevance: 10,
            contains: [
              l
            ]
          },
          {
            begin: /<\?[a-z][a-z0-9]+/
          }
        ]
      },
      {
        className: "tag",
        /*
        The lookahead pattern (?=...) ensures that 'begin' only matches
        '<style' as a single word, followed by a whitespace or an
        ending bracket.
        */
        begin: /<style(?=\s|>)/,
        end: />/,
        keywords: { name: "style" },
        contains: [c],
        starts: {
          end: /<\/style>/,
          returnEnd: !0,
          subLanguage: [
            "css",
            "xml"
          ]
        }
      },
      {
        className: "tag",
        // See the comment in the <style tag about the lookahead pattern
        begin: /<script(?=\s|>)/,
        end: />/,
        keywords: { name: "script" },
        contains: [c],
        starts: {
          end: /<\/script>/,
          returnEnd: !0,
          subLanguage: [
            "javascript",
            "handlebars",
            "xml"
          ]
        }
      },
      // we need this for now for jSX
      {
        className: "tag",
        begin: /<>|<\/>/
      },
      // open tag
      {
        className: "tag",
        begin: t.concat(
          /</,
          t.lookahead(t.concat(
            n,
            // <tag/>
            // <tag>
            // <tag ...
            t.either(/\/>/, />/, /\s/)
          ))
        ),
        end: /\/?>/,
        contains: [
          {
            className: "name",
            begin: n,
            relevance: 0,
            starts: c
          }
        ]
      },
      // close tag
      {
        className: "tag",
        begin: t.concat(
          /<\//,
          t.lookahead(t.concat(
            n,
            />/
          ))
        ),
        contains: [
          {
            className: "name",
            begin: n,
            relevance: 0
          },
          {
            begin: />/,
            relevance: 0,
            endsParent: !0
          }
        ]
      }
    ]
  };
}
function gb(e) {
  const t = "true false yes no null", n = "[\\w#;/?:@&=+$,.~*'()[\\]]+", r = {
    className: "attr",
    variants: [
      // added brackets support and special char support
      { begin: /[\w*@][\w*@ :()\./-]*:(?=[ \t]|$)/ },
      {
        // double quoted keys - with brackets and special char support
        begin: /"[\w*@][\w*@ :()\./-]*":(?=[ \t]|$)/
      },
      {
        // single quoted keys - with brackets and special char support
        begin: /'[\w*@][\w*@ :()\./-]*':(?=[ \t]|$)/
      }
    ]
  }, i = {
    className: "template-variable",
    variants: [
      {
        // jinja templates Ansible
        begin: /\{\{/,
        end: /\}\}/
      },
      {
        // Ruby i18n
        begin: /%\{/,
        end: /\}/
      }
    ]
  }, a = {
    className: "string",
    relevance: 0,
    begin: /'/,
    end: /'/,
    contains: [
      {
        match: /''/,
        scope: "char.escape",
        relevance: 0
      }
    ]
  }, o = {
    className: "string",
    relevance: 0,
    variants: [
      {
        begin: /"/,
        end: /"/
      },
      { begin: /\S+/ }
    ],
    contains: [
      e.BACKSLASH_ESCAPE,
      i
    ]
  }, s = e.inherit(o, { variants: [
    {
      begin: /'/,
      end: /'/,
      contains: [
        {
          begin: /''/,
          relevance: 0
        }
      ]
    },
    {
      begin: /"/,
      end: /"/
    },
    { begin: /[^\s,{}[\]]+/ }
  ] }), f = {
    className: "number",
    begin: "\\b" + "[0-9]{4}(-[0-9][0-9]){0,2}" + "([Tt \\t][0-9][0-9]?(:[0-9][0-9]){2})?" + "(\\.[0-9]*)?" + "([ \\t])*(Z|[-+][0-9][0-9]?(:[0-9][0-9])?)?" + "\\b"
  }, p = {
    end: ",",
    endsWithParent: !0,
    excludeEnd: !0,
    keywords: t,
    relevance: 0
  }, m = {
    begin: /\{/,
    end: /\}/,
    contains: [p],
    illegal: "\\n",
    relevance: 0
  }, h = {
    begin: "\\[",
    end: "\\]",
    contains: [p],
    illegal: "\\n",
    relevance: 0
  }, k = [
    r,
    {
      className: "meta",
      begin: "^---\\s*$",
      relevance: 10
    },
    {
      // multi line string
      // Blocks start with a | or > followed by a newline
      //
      // Indentation of subsequent lines must be the same to
      // be considered part of the block
      className: "string",
      begin: "[\\|>]([1-9]?[+-])?[ ]*\\n( +)[^ ][^\\n]*\\n(\\2[^\\n]+\\n?)*"
    },
    {
      // Ruby/Rails erb
      begin: "<%[%=-]?",
      end: "[%-]?%>",
      subLanguage: "ruby",
      excludeBegin: !0,
      excludeEnd: !0,
      relevance: 0
    },
    {
      // named tags
      className: "type",
      begin: "!\\w+!" + n
    },
    // https://yaml.org/spec/1.2/spec.html#id2784064
    {
      // verbatim tags
      className: "type",
      begin: "!<" + n + ">"
    },
    {
      // primary tags
      className: "type",
      begin: "!" + n
    },
    {
      // secondary tags
      className: "type",
      begin: "!!" + n
    },
    {
      // fragment id &ref
      className: "meta",
      begin: "&" + e.UNDERSCORE_IDENT_RE + "$"
    },
    {
      // fragment reference *ref
      className: "meta",
      begin: "\\*" + e.UNDERSCORE_IDENT_RE + "$"
    },
    {
      // array listing
      className: "bullet",
      // TODO: remove |$ hack when we have proper look-ahead support
      begin: "-(?=[ ]|$)",
      relevance: 0
    },
    e.HASH_COMMENT_MODE,
    {
      beginKeywords: t,
      keywords: { literal: t }
    },
    f,
    // numbers are any valid C-style number that
    // sit isolated from other words
    {
      className: "number",
      begin: e.C_NUMBER_RE + "\\b",
      relevance: 0
    },
    m,
    h,
    a,
    o
  ], y = [...k];
  return y.pop(), y.push(s), p.contains = y, {
    name: "YAML",
    case_insensitive: !0,
    aliases: ["yml"],
    contains: k
  };
}
const mb = {
  arduino: ah,
  bash: $r,
  c: sh,
  cpp: lh,
  csharp: ch,
  css: ps,
  diff: yh,
  go: Eh,
  graphql: _h,
  ini: kh,
  java: gs,
  javascript: Hr,
  json: ys,
  kotlin: Nh,
  less: Dh,
  lua: Ph,
  makefile: Bh,
  markdown: Gr,
  objectivec: Fh,
  perl: zh,
  php: Uh,
  "php-template": $h,
  plaintext: Hh,
  python: Kr,
  "python-repl": Gh,
  r: Kh,
  ruby: qh,
  rust: Wh,
  scss: tb,
  shell: nb,
  sql: ks,
  swift: ub,
  typescript: qr,
  vbnet: pb,
  wasm: fb,
  xml: Ms,
  yaml: gb
};
var wr, zo;
function hb() {
  if (zo) return wr;
  zo = 1;
  function e(E) {
    return E instanceof Map ? E.clear = E.delete = E.set = function() {
      throw new Error("map is read-only");
    } : E instanceof Set && (E.add = E.clear = E.delete = function() {
      throw new Error("set is read-only");
    }), Object.freeze(E), Object.getOwnPropertyNames(E).forEach((C) => {
      const z = E[C], te = typeof z;
      (te === "object" || te === "function") && !Object.isFrozen(z) && e(z);
    }), E;
  }
  class t {
    /**
     * @param {CompiledMode} mode
     */
    constructor(C) {
      C.data === void 0 && (C.data = {}), this.data = C.data, this.isMatchIgnored = !1;
    }
    ignoreMatch() {
      this.isMatchIgnored = !0;
    }
  }
  function n(E) {
    return E.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
  }
  function r(E, ...C) {
    const z = /* @__PURE__ */ Object.create(null);
    for (const te in E)
      z[te] = E[te];
    return C.forEach(function(te) {
      for (const Ae in te)
        z[Ae] = te[Ae];
    }), /** @type {T} */
    z;
  }
  const i = "</span>", a = (E) => !!E.scope, o = (E, { prefix: C }) => {
    if (E.startsWith("language:"))
      return E.replace("language:", "language-");
    if (E.includes(".")) {
      const z = E.split(".");
      return [
        `${C}${z.shift()}`,
        ...z.map((te, Ae) => `${te}${"_".repeat(Ae + 1)}`)
      ].join(" ");
    }
    return `${C}${E}`;
  };
  class s {
    /**
     * Creates a new HTMLRenderer
     *
     * @param {Tree} parseTree - the parse tree (must support `walk` API)
     * @param {{classPrefix: string}} options
     */
    constructor(C, z) {
      this.buffer = "", this.classPrefix = z.classPrefix, C.walk(this);
    }
    /**
     * Adds texts to the output stream
     *
     * @param {string} text */
    addText(C) {
      this.buffer += n(C);
    }
    /**
     * Adds a node open to the output stream (if needed)
     *
     * @param {Node} node */
    openNode(C) {
      if (!a(C)) return;
      const z = o(
        C.scope,
        { prefix: this.classPrefix }
      );
      this.span(z);
    }
    /**
     * Adds a node close to the output stream (if needed)
     *
     * @param {Node} node */
    closeNode(C) {
      a(C) && (this.buffer += i);
    }
    /**
     * returns the accumulated buffer
    */
    value() {
      return this.buffer;
    }
    // helpers
    /**
     * Builds a span element
     *
     * @param {string} className */
    span(C) {
      this.buffer += `<span class="${C}">`;
    }
  }
  const l = (E = {}) => {
    const C = { children: [] };
    return Object.assign(C, E), C;
  };
  class c {
    constructor() {
      this.rootNode = l(), this.stack = [this.rootNode];
    }
    get top() {
      return this.stack[this.stack.length - 1];
    }
    get root() {
      return this.rootNode;
    }
    /** @param {Node} node */
    add(C) {
      this.top.children.push(C);
    }
    /** @param {string} scope */
    openNode(C) {
      const z = l({ scope: C });
      this.add(z), this.stack.push(z);
    }
    closeNode() {
      if (this.stack.length > 1)
        return this.stack.pop();
    }
    closeAllNodes() {
      for (; this.closeNode(); ) ;
    }
    toJSON() {
      return JSON.stringify(this.rootNode, null, 4);
    }
    /**
     * @typedef { import("./html_renderer").Renderer } Renderer
     * @param {Renderer} builder
     */
    walk(C) {
      return this.constructor._walk(C, this.rootNode);
    }
    /**
     * @param {Renderer} builder
     * @param {Node} node
     */
    static _walk(C, z) {
      return typeof z == "string" ? C.addText(z) : z.children && (C.openNode(z), z.children.forEach((te) => this._walk(C, te)), C.closeNode(z)), C;
    }
    /**
     * @param {Node} node
     */
    static _collapse(C) {
      typeof C != "string" && C.children && (C.children.every((z) => typeof z == "string") ? C.children = [C.children.join("")] : C.children.forEach((z) => {
        c._collapse(z);
      }));
    }
  }
  class u extends c {
    /**
     * @param {*} options
     */
    constructor(C) {
      super(), this.options = C;
    }
    /**
     * @param {string} text
     */
    addText(C) {
      C !== "" && this.add(C);
    }
    /** @param {string} scope */
    startScope(C) {
      this.openNode(C);
    }
    endScope() {
      this.closeNode();
    }
    /**
     * @param {Emitter & {root: DataNode}} emitter
     * @param {string} name
     */
    __addSublanguage(C, z) {
      const te = C.root;
      z && (te.scope = `language:${z}`), this.add(te);
    }
    toHTML() {
      return new s(this, this.options).value();
    }
    finalize() {
      return this.closeAllNodes(), !0;
    }
  }
  function d(E) {
    return E ? typeof E == "string" ? E : E.source : null;
  }
  function f(E) {
    return h("(?=", E, ")");
  }
  function p(E) {
    return h("(?:", E, ")*");
  }
  function m(E) {
    return h("(?:", E, ")?");
  }
  function h(...E) {
    return E.map((z) => d(z)).join("");
  }
  function k(E) {
    const C = E[E.length - 1];
    return typeof C == "object" && C.constructor === Object ? (E.splice(E.length - 1, 1), C) : {};
  }
  function y(...E) {
    return "(" + (k(E).capture ? "" : "?:") + E.map((te) => d(te)).join("|") + ")";
  }
  function S(E) {
    return new RegExp(E.toString() + "|").exec("").length - 1;
  }
  function w(E, C) {
    const z = E && E.exec(C);
    return z && z.index === 0;
  }
  const N = /\[(?:[^\\\]]|\\.)*\]|\(\??|\\([1-9][0-9]*)|\\./;
  function A(E, { joinWith: C }) {
    let z = 0;
    return E.map((te) => {
      z += 1;
      const Ae = z;
      let Ce = d(te), V = "";
      for (; Ce.length > 0; ) {
        const K = N.exec(Ce);
        if (!K) {
          V += Ce;
          break;
        }
        V += Ce.substring(0, K.index), Ce = Ce.substring(K.index + K[0].length), K[0][0] === "\\" && K[1] ? V += "\\" + String(Number(K[1]) + Ae) : (V += K[0], K[0] === "(" && z++);
      }
      return V;
    }).map((te) => `(${te})`).join(C);
  }
  const _ = /\b\B/, L = "[a-zA-Z]\\w*", v = "[a-zA-Z_]\\w*", R = "\\b\\d+(\\.\\d+)?", x = "(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)", O = "\\b(0b[01]+)", F = "!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~", U = (E = {}) => {
    const C = /^#![ ]*\//;
    return E.binary && (E.begin = h(
      C,
      /.*\b/,
      E.binary,
      /\b.*/
    )), r({
      scope: "meta",
      begin: C,
      end: /$/,
      relevance: 0,
      /** @type {ModeCallback} */
      "on:begin": (z, te) => {
        z.index !== 0 && te.ignoreMatch();
      }
    }, E);
  }, D = {
    begin: "\\\\[\\s\\S]",
    relevance: 0
  }, $ = {
    scope: "string",
    begin: "'",
    end: "'",
    illegal: "\\n",
    contains: [D]
  }, Q = {
    scope: "string",
    begin: '"',
    end: '"',
    illegal: "\\n",
    contains: [D]
  }, se = {
    begin: /\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/
  }, I = function(E, C, z = {}) {
    const te = r(
      {
        scope: "comment",
        begin: E,
        end: C,
        contains: []
      },
      z
    );
    te.contains.push({
      scope: "doctag",
      // hack to avoid the space from being included. the space is necessary to
      // match here to prevent the plain text rule below from gobbling up doctags
      begin: "[ ]*(?=(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):)",
      end: /(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):/,
      excludeBegin: !0,
      relevance: 0
    });
    const Ae = y(
      // list of common 1 and 2 letter words in English
      "I",
      "a",
      "is",
      "so",
      "us",
      "to",
      "at",
      "if",
      "in",
      "it",
      "on",
      // note: this is not an exhaustive list of contractions, just popular ones
      /[A-Za-z]+['](d|ve|re|ll|t|s|n)/,
      // contractions - can't we'd they're let's, etc
      /[A-Za-z]+[-][a-z]+/,
      // `no-way`, etc.
      /[A-Za-z][a-z]{2,}/
      // allow capitalized words at beginning of sentences
    );
    return te.contains.push(
      {
        // TODO: how to include ", (, ) without breaking grammars that use these for
        // comment delimiters?
        // begin: /[ ]+([()"]?([A-Za-z'-]{3,}|is|a|I|so|us|[tT][oO]|at|if|in|it|on)[.]?[()":]?([.][ ]|[ ]|\))){3}/
        // ---
        // this tries to find sequences of 3 english words in a row (without any
        // "programming" type syntax) this gives us a strong signal that we've
        // TRULY found a comment - vs perhaps scanning with the wrong language.
        // It's possible to find something that LOOKS like the start of the
        // comment - but then if there is no readable text - good chance it is a
        // false match and not a comment.
        //
        // for a visual example please see:
        // https://github.com/highlightjs/highlight.js/issues/2827
        begin: h(
          /[ ]+/,
          // necessary to prevent us gobbling up doctags like /* @author Bob Mcgill */
          "(",
          Ae,
          /[.]?[:]?([.][ ]|[ ])/,
          "){3}"
        )
        // look for 3 words in a row
      }
    ), te;
  }, fe = I("//", "$"), g = I("/\\*", "\\*/"), G = I("#", "$"), j = {
    scope: "number",
    begin: R,
    relevance: 0
  }, b = {
    scope: "number",
    begin: x,
    relevance: 0
  }, le = {
    scope: "number",
    begin: O,
    relevance: 0
  }, _e = {
    scope: "regexp",
    begin: /\/(?=[^/\n]*\/)/,
    end: /\/[gimuy]*/,
    contains: [
      D,
      {
        begin: /\[/,
        end: /\]/,
        relevance: 0,
        contains: [D]
      }
    ]
  }, be = {
    scope: "title",
    begin: L,
    relevance: 0
  }, me = {
    scope: "title",
    begin: v,
    relevance: 0
  }, ge = {
    // excludes method names from keyword processing
    begin: "\\.\\s*" + v,
    relevance: 0
  };
  var Te = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    APOS_STRING_MODE: $,
    BACKSLASH_ESCAPE: D,
    BINARY_NUMBER_MODE: le,
    BINARY_NUMBER_RE: O,
    COMMENT: I,
    C_BLOCK_COMMENT_MODE: g,
    C_LINE_COMMENT_MODE: fe,
    C_NUMBER_MODE: b,
    C_NUMBER_RE: x,
    END_SAME_AS_BEGIN: function(E) {
      return Object.assign(
        E,
        {
          /** @type {ModeCallback} */
          "on:begin": (C, z) => {
            z.data._beginMatch = C[1];
          },
          /** @type {ModeCallback} */
          "on:end": (C, z) => {
            z.data._beginMatch !== C[1] && z.ignoreMatch();
          }
        }
      );
    },
    HASH_COMMENT_MODE: G,
    IDENT_RE: L,
    MATCH_NOTHING_RE: _,
    METHOD_GUARD: ge,
    NUMBER_MODE: j,
    NUMBER_RE: R,
    PHRASAL_WORDS_MODE: se,
    QUOTE_STRING_MODE: Q,
    REGEXP_MODE: _e,
    RE_STARTERS_RE: F,
    SHEBANG: U,
    TITLE_MODE: be,
    UNDERSCORE_IDENT_RE: v,
    UNDERSCORE_TITLE_MODE: me
  });
  function Ke(E, C) {
    E.input[E.index - 1] === "." && C.ignoreMatch();
  }
  function ot(E, C) {
    E.className !== void 0 && (E.scope = E.className, delete E.className);
  }
  function Yt(E, C) {
    C && E.beginKeywords && (E.begin = "\\b(" + E.beginKeywords.split(" ").join("|") + ")(?!\\.)(?=\\b|\\s)", E.__beforeBegin = Ke, E.keywords = E.keywords || E.beginKeywords, delete E.beginKeywords, E.relevance === void 0 && (E.relevance = 0));
  }
  function jt(E, C) {
    Array.isArray(E.illegal) && (E.illegal = y(...E.illegal));
  }
  function It(E, C) {
    if (E.match) {
      if (E.begin || E.end) throw new Error("begin & end are not supported with match");
      E.begin = E.match, delete E.match;
    }
  }
  function he(E, C) {
    E.relevance === void 0 && (E.relevance = 1);
  }
  const dt = (E, C) => {
    if (!E.beforeMatch) return;
    if (E.starts) throw new Error("beforeMatch cannot be used with starts");
    const z = Object.assign({}, E);
    Object.keys(E).forEach((te) => {
      delete E[te];
    }), E.keywords = z.keywords, E.begin = h(z.beforeMatch, f(z.begin)), E.starts = {
      relevance: 0,
      contains: [
        Object.assign(z, { endsParent: !0 })
      ]
    }, E.relevance = 0, delete z.beforeMatch;
  }, pt = [
    "of",
    "and",
    "for",
    "in",
    "not",
    "or",
    "if",
    "then",
    "parent",
    // common variable name
    "list",
    // common variable name
    "value"
    // common variable name
  ], Mt = "keyword";
  function Zt(E, C, z = Mt) {
    const te = /* @__PURE__ */ Object.create(null);
    return typeof E == "string" ? Ae(z, E.split(" ")) : Array.isArray(E) ? Ae(z, E) : Object.keys(E).forEach(function(Ce) {
      Object.assign(
        te,
        Zt(E[Ce], C, Ce)
      );
    }), te;
    function Ae(Ce, V) {
      C && (V = V.map((K) => K.toLowerCase())), V.forEach(function(K) {
        const ee = K.split("|");
        te[ee[0]] = [Ce, Yn(ee[0], ee[1])];
      });
    }
  }
  function Yn(E, C) {
    return C ? Number(C) : jn(E) ? 0 : 1;
  }
  function jn(E) {
    return pt.includes(E.toLowerCase());
  }
  const hn = {}, ft = (E) => {
    console.error(E);
  }, bn = (E, ...C) => {
    console.log(`WARN: ${E}`, ...C);
  }, T = (E, C) => {
    hn[`${E}/${C}`] || (console.log(`Deprecated as of ${E}. ${C}`), hn[`${E}/${C}`] = !0);
  }, B = new Error();
  function J(E, C, { key: z }) {
    let te = 0;
    const Ae = E[z], Ce = {}, V = {};
    for (let K = 1; K <= C.length; K++)
      V[K + te] = Ae[K], Ce[K + te] = !0, te += S(C[K - 1]);
    E[z] = V, E[z]._emit = Ce, E[z]._multi = !0;
  }
  function ce(E) {
    if (Array.isArray(E.begin)) {
      if (E.skip || E.excludeBegin || E.returnBegin)
        throw ft("skip, excludeBegin, returnBegin not compatible with beginScope: {}"), B;
      if (typeof E.beginScope != "object" || E.beginScope === null)
        throw ft("beginScope must be object"), B;
      J(E, E.begin, { key: "beginScope" }), E.begin = A(E.begin, { joinWith: "" });
    }
  }
  function ye(E) {
    if (Array.isArray(E.end)) {
      if (E.skip || E.excludeEnd || E.returnEnd)
        throw ft("skip, excludeEnd, returnEnd not compatible with endScope: {}"), B;
      if (typeof E.endScope != "object" || E.endScope === null)
        throw ft("endScope must be object"), B;
      J(E, E.end, { key: "endScope" }), E.end = A(E.end, { joinWith: "" });
    }
  }
  function Ye(E) {
    E.scope && typeof E.scope == "object" && E.scope !== null && (E.beginScope = E.scope, delete E.scope);
  }
  function gt(E) {
    Ye(E), typeof E.beginScope == "string" && (E.beginScope = { _wrap: E.beginScope }), typeof E.endScope == "string" && (E.endScope = { _wrap: E.endScope }), ce(E), ye(E);
  }
  function nt(E) {
    function C(V, K) {
      return new RegExp(
        d(V),
        "m" + (E.case_insensitive ? "i" : "") + (E.unicodeRegex ? "u" : "") + (K ? "g" : "")
      );
    }
    class z {
      constructor() {
        this.matchIndexes = {}, this.regexes = [], this.matchAt = 1, this.position = 0;
      }
      // @ts-ignore
      addRule(K, ee) {
        ee.position = this.position++, this.matchIndexes[this.matchAt] = ee, this.regexes.push([ee, K]), this.matchAt += S(K) + 1;
      }
      compile() {
        this.regexes.length === 0 && (this.exec = () => null);
        const K = this.regexes.map((ee) => ee[1]);
        this.matcherRe = C(A(K, { joinWith: "|" }), !0), this.lastIndex = 0;
      }
      /** @param {string} s */
      exec(K) {
        this.matcherRe.lastIndex = this.lastIndex;
        const ee = this.matcherRe.exec(K);
        if (!ee)
          return null;
        const Le = ee.findIndex((Xt, Zn) => Zn > 0 && Xt !== void 0), Re = this.matchIndexes[Le];
        return ee.splice(0, Le), Object.assign(ee, Re);
      }
    }
    class te {
      constructor() {
        this.rules = [], this.multiRegexes = [], this.count = 0, this.lastIndex = 0, this.regexIndex = 0;
      }
      // @ts-ignore
      getMatcher(K) {
        if (this.multiRegexes[K]) return this.multiRegexes[K];
        const ee = new z();
        return this.rules.slice(K).forEach(([Le, Re]) => ee.addRule(Le, Re)), ee.compile(), this.multiRegexes[K] = ee, ee;
      }
      resumingScanAtSamePosition() {
        return this.regexIndex !== 0;
      }
      considerAll() {
        this.regexIndex = 0;
      }
      // @ts-ignore
      addRule(K, ee) {
        this.rules.push([K, ee]), ee.type === "begin" && this.count++;
      }
      /** @param {string} s */
      exec(K) {
        const ee = this.getMatcher(this.regexIndex);
        ee.lastIndex = this.lastIndex;
        let Le = ee.exec(K);
        if (this.resumingScanAtSamePosition() && !(Le && Le.index === this.lastIndex)) {
          const Re = this.getMatcher(0);
          Re.lastIndex = this.lastIndex + 1, Le = Re.exec(K);
        }
        return Le && (this.regexIndex += Le.position + 1, this.regexIndex === this.count && this.considerAll()), Le;
      }
    }
    function Ae(V) {
      const K = new te();
      return V.contains.forEach((ee) => K.addRule(ee.begin, { rule: ee, type: "begin" })), V.terminatorEnd && K.addRule(V.terminatorEnd, { type: "end" }), V.illegal && K.addRule(V.illegal, { type: "illegal" }), K;
    }
    function Ce(V, K) {
      const ee = (
        /** @type CompiledMode */
        V
      );
      if (V.isCompiled) return ee;
      [
        ot,
        // do this early so compiler extensions generally don't have to worry about
        // the distinction between match/begin
        It,
        gt,
        dt
      ].forEach((Re) => Re(V, K)), E.compilerExtensions.forEach((Re) => Re(V, K)), V.__beforeBegin = null, [
        Yt,
        // do this later so compiler extensions that come earlier have access to the
        // raw array if they wanted to perhaps manipulate it, etc.
        jt,
        // default to 1 relevance if not specified
        he
      ].forEach((Re) => Re(V, K)), V.isCompiled = !0;
      let Le = null;
      return typeof V.keywords == "object" && V.keywords.$pattern && (V.keywords = Object.assign({}, V.keywords), Le = V.keywords.$pattern, delete V.keywords.$pattern), Le = Le || /\w+/, V.keywords && (V.keywords = Zt(V.keywords, E.case_insensitive)), ee.keywordPatternRe = C(Le, !0), K && (V.begin || (V.begin = /\B|\b/), ee.beginRe = C(ee.begin), !V.end && !V.endsWithParent && (V.end = /\B|\b/), V.end && (ee.endRe = C(ee.end)), ee.terminatorEnd = d(ee.end) || "", V.endsWithParent && K.terminatorEnd && (ee.terminatorEnd += (V.end ? "|" : "") + K.terminatorEnd)), V.illegal && (ee.illegalRe = C(
        /** @type {RegExp | string} */
        V.illegal
      )), V.contains || (V.contains = []), V.contains = [].concat(...V.contains.map(function(Re) {
        return vt(Re === "self" ? V : Re);
      })), V.contains.forEach(function(Re) {
        Ce(
          /** @type Mode */
          Re,
          ee
        );
      }), V.starts && Ce(V.starts, K), ee.matcher = Ae(ee), ee;
    }
    if (E.compilerExtensions || (E.compilerExtensions = []), E.contains && E.contains.includes("self"))
      throw new Error("ERR: contains `self` is not supported at the top-level of a language.  See documentation.");
    return E.classNameAliases = r(E.classNameAliases || {}), Ce(
      /** @type Mode */
      E
    );
  }
  function yt(E) {
    return E ? E.endsWithParent || yt(E.starts) : !1;
  }
  function vt(E) {
    return E.variants && !E.cachedVariants && (E.cachedVariants = E.variants.map(function(C) {
      return r(E, { variants: null }, C);
    })), E.cachedVariants ? E.cachedVariants : yt(E) ? r(E, { starts: E.starts ? r(E.starts) : null }) : Object.isFrozen(E) ? r(E) : E;
  }
  var Ue = "11.11.1";
  class Et extends Error {
    constructor(C, z) {
      super(C), this.name = "HTMLInjectionError", this.html = z;
    }
  }
  const je = n, gi = r, mi = Symbol("nomatch"), Ls = 7, hi = function(E) {
    const C = /* @__PURE__ */ Object.create(null), z = /* @__PURE__ */ Object.create(null), te = [];
    let Ae = !0;
    const Ce = "Could not find the language '{}', did you forget to load/include a language module?", V = { disableAutodetect: !0, name: "Plain text", contains: [] };
    let K = {
      ignoreUnescapedHTML: !1,
      throwUnescapedHTML: !1,
      noHighlightRe: /^(no-?highlight)$/i,
      languageDetectRe: /\blang(?:uage)?-([\w-]+)\b/i,
      classPrefix: "hljs-",
      cssSelector: "pre code",
      languages: null,
      // beta configuration options, subject to change, welcome to discuss
      // https://github.com/highlightjs/highlight.js/issues/1086
      __emitter: u
    };
    function ee(P) {
      return K.noHighlightRe.test(P);
    }
    function Le(P) {
      let Z = P.className + " ";
      Z += P.parentNode ? P.parentNode.className : "";
      const de = K.languageDetectRe.exec(Z);
      if (de) {
        const we = _t(de[1]);
        return we || (bn(Ce.replace("{}", de[1])), bn("Falling back to no-highlight mode for this block.", P)), we ? de[1] : "no-highlight";
      }
      return Z.split(/\s+/).find((we) => ee(we) || _t(we));
    }
    function Re(P, Z, de) {
      let we = "", Ie = "";
      typeof Z == "object" ? (we = P, de = Z.ignoreIllegals, Ie = Z.language) : (T("10.7.0", "highlight(lang, code, ...args) has been deprecated."), T("10.7.0", `Please use highlight(code, options) instead.
https://github.com/highlightjs/highlight.js/issues/2277`), Ie = P, we = Z), de === void 0 && (de = !0);
      const rt = {
        code: we,
        language: Ie
      };
      En("before:highlight", rt);
      const kt = rt.result ? rt.result : Xt(rt.language, rt.code, de);
      return kt.code = rt.code, En("after:highlight", kt), kt;
    }
    function Xt(P, Z, de, we) {
      const Ie = /* @__PURE__ */ Object.create(null);
      function rt(H, Y) {
        return H.keywords[Y];
      }
      function kt() {
        if (!ne.keywords) {
          De.addText(Se);
          return;
        }
        let H = 0;
        ne.keywordPatternRe.lastIndex = 0;
        let Y = ne.keywordPatternRe.exec(Se), ie = "";
        for (; Y; ) {
          ie += Se.substring(H, Y.index);
          const Ee = st.case_insensitive ? Y[0].toLowerCase() : Y[0], Be = rt(ne, Ee);
          if (Be) {
            const [mt, Xs] = Be;
            if (De.addText(ie), ie = "", Ie[Ee] = (Ie[Ee] || 0) + 1, Ie[Ee] <= Ls && (xn += Xs), mt.startsWith("_"))
              ie += Y[0];
            else {
              const Qs = st.classNameAliases[mt] || mt;
              at(Y[0], Qs);
            }
          } else
            ie += Y[0];
          H = ne.keywordPatternRe.lastIndex, Y = ne.keywordPatternRe.exec(Se);
        }
        ie += Se.substring(H), De.addText(ie);
      }
      function _n() {
        if (Se === "") return;
        let H = null;
        if (typeof ne.subLanguage == "string") {
          if (!C[ne.subLanguage]) {
            De.addText(Se);
            return;
          }
          H = Xt(ne.subLanguage, Se, !0, Si[ne.subLanguage]), Si[ne.subLanguage] = /** @type {CompiledMode} */
          H._top;
        } else
          H = Xn(Se, ne.subLanguage.length ? ne.subLanguage : null);
        ne.relevance > 0 && (xn += H.relevance), De.__addSublanguage(H._emitter, H.language);
      }
      function Ze() {
        ne.subLanguage != null ? _n() : kt(), Se = "";
      }
      function at(H, Y) {
        H !== "" && (De.startScope(Y), De.addText(H), De.endScope());
      }
      function _i(H, Y) {
        let ie = 1;
        const Ee = Y.length - 1;
        for (; ie <= Ee; ) {
          if (!H._emit[ie]) {
            ie++;
            continue;
          }
          const Be = st.classNameAliases[H[ie]] || H[ie], mt = Y[ie];
          Be ? at(mt, Be) : (Se = mt, kt(), Se = ""), ie++;
        }
      }
      function ki(H, Y) {
        return H.scope && typeof H.scope == "string" && De.openNode(st.classNameAliases[H.scope] || H.scope), H.beginScope && (H.beginScope._wrap ? (at(Se, st.classNameAliases[H.beginScope._wrap] || H.beginScope._wrap), Se = "") : H.beginScope._multi && (_i(H.beginScope, Y), Se = "")), ne = Object.create(H, { parent: { value: ne } }), ne;
      }
      function xi(H, Y, ie) {
        let Ee = w(H.endRe, ie);
        if (Ee) {
          if (H["on:end"]) {
            const Be = new t(H);
            H["on:end"](Y, Be), Be.isMatchIgnored && (Ee = !1);
          }
          if (Ee) {
            for (; H.endsParent && H.parent; )
              H = H.parent;
            return H;
          }
        }
        if (H.endsWithParent)
          return xi(H.parent, Y, ie);
      }
      function Ws(H) {
        return ne.matcher.regexIndex === 0 ? (Se += H[0], 1) : (tr = !0, 0);
      }
      function Vs(H) {
        const Y = H[0], ie = H.rule, Ee = new t(ie), Be = [ie.__beforeBegin, ie["on:begin"]];
        for (const mt of Be)
          if (mt && (mt(H, Ee), Ee.isMatchIgnored))
            return Ws(Y);
        return ie.skip ? Se += Y : (ie.excludeBegin && (Se += Y), Ze(), !ie.returnBegin && !ie.excludeBegin && (Se = Y)), ki(ie, H), ie.returnBegin ? 0 : Y.length;
      }
      function Ys(H) {
        const Y = H[0], ie = Z.substring(H.index), Ee = xi(ne, H, ie);
        if (!Ee)
          return mi;
        const Be = ne;
        ne.endScope && ne.endScope._wrap ? (Ze(), at(Y, ne.endScope._wrap)) : ne.endScope && ne.endScope._multi ? (Ze(), _i(ne.endScope, H)) : Be.skip ? Se += Y : (Be.returnEnd || Be.excludeEnd || (Se += Y), Ze(), Be.excludeEnd && (Se = Y));
        do
          ne.scope && De.closeNode(), !ne.skip && !ne.subLanguage && (xn += ne.relevance), ne = ne.parent;
        while (ne !== Ee.parent);
        return Ee.starts && ki(Ee.starts, H), Be.returnEnd ? 0 : Y.length;
      }
      function js() {
        const H = [];
        for (let Y = ne; Y !== st; Y = Y.parent)
          Y.scope && H.unshift(Y.scope);
        H.forEach((Y) => De.openNode(Y));
      }
      let kn = {};
      function wi(H, Y) {
        const ie = Y && Y[0];
        if (Se += H, ie == null)
          return Ze(), 0;
        if (kn.type === "begin" && Y.type === "end" && kn.index === Y.index && ie === "") {
          if (Se += Z.slice(Y.index, Y.index + 1), !Ae) {
            const Ee = new Error(`0 width match regex (${P})`);
            throw Ee.languageName = P, Ee.badRule = kn.rule, Ee;
          }
          return 1;
        }
        if (kn = Y, Y.type === "begin")
          return Vs(Y);
        if (Y.type === "illegal" && !de) {
          const Ee = new Error('Illegal lexeme "' + ie + '" for mode "' + (ne.scope || "<unnamed>") + '"');
          throw Ee.mode = ne, Ee;
        } else if (Y.type === "end") {
          const Ee = Ys(Y);
          if (Ee !== mi)
            return Ee;
        }
        if (Y.type === "illegal" && ie === "")
          return Se += `
`, 1;
        if (er > 1e5 && er > Y.index * 3)
          throw new Error("potential infinite loop, way more iterations than matches");
        return Se += ie, ie.length;
      }
      const st = _t(P);
      if (!st)
        throw ft(Ce.replace("{}", P)), new Error('Unknown language: "' + P + '"');
      const Zs = nt(st);
      let Jn = "", ne = we || Zs;
      const Si = {}, De = new K.__emitter(K);
      js();
      let Se = "", xn = 0, Tt = 0, er = 0, tr = !1;
      try {
        if (st.__emitTokens)
          st.__emitTokens(Z, De);
        else {
          for (ne.matcher.considerAll(); ; ) {
            er++, tr ? tr = !1 : ne.matcher.considerAll(), ne.matcher.lastIndex = Tt;
            const H = ne.matcher.exec(Z);
            if (!H) break;
            const Y = Z.substring(Tt, H.index), ie = wi(Y, H);
            Tt = H.index + ie;
          }
          wi(Z.substring(Tt));
        }
        return De.finalize(), Jn = De.toHTML(), {
          language: P,
          value: Jn,
          relevance: xn,
          illegal: !1,
          _emitter: De,
          _top: ne
        };
      } catch (H) {
        if (H.message && H.message.includes("Illegal"))
          return {
            language: P,
            value: je(Z),
            illegal: !0,
            relevance: 0,
            _illegalBy: {
              message: H.message,
              index: Tt,
              context: Z.slice(Tt - 100, Tt + 100),
              mode: H.mode,
              resultSoFar: Jn
            },
            _emitter: De
          };
        if (Ae)
          return {
            language: P,
            value: je(Z),
            illegal: !1,
            relevance: 0,
            errorRaised: H,
            _emitter: De,
            _top: ne
          };
        throw H;
      }
    }
    function Zn(P) {
      const Z = {
        value: je(P),
        illegal: !1,
        relevance: 0,
        _top: V,
        _emitter: new K.__emitter(K)
      };
      return Z._emitter.addText(P), Z;
    }
    function Xn(P, Z) {
      Z = Z || K.languages || Object.keys(C);
      const de = Zn(P), we = Z.filter(_t).filter(Ei).map(
        (Ze) => Xt(Ze, P, !1)
      );
      we.unshift(de);
      const Ie = we.sort((Ze, at) => {
        if (Ze.relevance !== at.relevance) return at.relevance - Ze.relevance;
        if (Ze.language && at.language) {
          if (_t(Ze.language).supersetOf === at.language)
            return 1;
          if (_t(at.language).supersetOf === Ze.language)
            return -1;
        }
        return 0;
      }), [rt, kt] = Ie, _n = rt;
      return _n.secondBest = kt, _n;
    }
    function Ds(P, Z, de) {
      const we = Z && z[Z] || de;
      P.classList.add("hljs"), P.classList.add(`language-${we}`);
    }
    function Qn(P) {
      let Z = null;
      const de = Le(P);
      if (ee(de)) return;
      if (En(
        "before:highlightElement",
        { el: P, language: de }
      ), P.dataset.highlighted) {
        console.log("Element previously highlighted. To highlight again, first unset `dataset.highlighted`.", P);
        return;
      }
      if (P.children.length > 0 && (K.ignoreUnescapedHTML || (console.warn("One of your code blocks includes unescaped HTML. This is a potentially serious security risk."), console.warn("https://github.com/highlightjs/highlight.js/wiki/security"), console.warn("The element with unescaped HTML:"), console.warn(P)), K.throwUnescapedHTML))
        throw new Et(
          "One of your code blocks includes unescaped HTML.",
          P.innerHTML
        );
      Z = P;
      const we = Z.textContent, Ie = de ? Re(we, { language: de, ignoreIllegals: !0 }) : Xn(we);
      P.innerHTML = Ie.value, P.dataset.highlighted = "yes", Ds(P, de, Ie.language), P.result = {
        language: Ie.language,
        // TODO: remove with version 11.0
        re: Ie.relevance,
        relevance: Ie.relevance
      }, Ie.secondBest && (P.secondBest = {
        language: Ie.secondBest.language,
        relevance: Ie.secondBest.relevance
      }), En("after:highlightElement", { el: P, result: Ie, text: we });
    }
    function Ps(P) {
      K = gi(K, P);
    }
    const Bs = () => {
      yn(), T("10.6.0", "initHighlighting() deprecated.  Use highlightAll() now.");
    };
    function Fs() {
      yn(), T("10.6.0", "initHighlightingOnLoad() deprecated.  Use highlightAll() now.");
    }
    let bi = !1;
    function yn() {
      function P() {
        yn();
      }
      if (document.readyState === "loading") {
        bi || window.addEventListener("DOMContentLoaded", P, !1), bi = !0;
        return;
      }
      document.querySelectorAll(K.cssSelector).forEach(Qn);
    }
    function zs(P, Z) {
      let de = null;
      try {
        de = Z(E);
      } catch (we) {
        if (ft("Language definition for '{}' could not be registered.".replace("{}", P)), Ae)
          ft(we);
        else
          throw we;
        de = V;
      }
      de.name || (de.name = P), C[P] = de, de.rawDefinition = Z.bind(null, E), de.aliases && yi(de.aliases, { languageName: P });
    }
    function Us(P) {
      delete C[P];
      for (const Z of Object.keys(z))
        z[Z] === P && delete z[Z];
    }
    function $s() {
      return Object.keys(C);
    }
    function _t(P) {
      return P = (P || "").toLowerCase(), C[P] || C[z[P]];
    }
    function yi(P, { languageName: Z }) {
      typeof P == "string" && (P = [P]), P.forEach((de) => {
        z[de.toLowerCase()] = Z;
      });
    }
    function Ei(P) {
      const Z = _t(P);
      return Z && !Z.disableAutodetect;
    }
    function Hs(P) {
      P["before:highlightBlock"] && !P["before:highlightElement"] && (P["before:highlightElement"] = (Z) => {
        P["before:highlightBlock"](
          Object.assign({ block: Z.el }, Z)
        );
      }), P["after:highlightBlock"] && !P["after:highlightElement"] && (P["after:highlightElement"] = (Z) => {
        P["after:highlightBlock"](
          Object.assign({ block: Z.el }, Z)
        );
      });
    }
    function Gs(P) {
      Hs(P), te.push(P);
    }
    function Ks(P) {
      const Z = te.indexOf(P);
      Z !== -1 && te.splice(Z, 1);
    }
    function En(P, Z) {
      const de = P;
      te.forEach(function(we) {
        we[de] && we[de](Z);
      });
    }
    function qs(P) {
      return T("10.7.0", "highlightBlock will be removed entirely in v12.0"), T("10.7.0", "Please use highlightElement now."), Qn(P);
    }
    Object.assign(E, {
      highlight: Re,
      highlightAuto: Xn,
      highlightAll: yn,
      highlightElement: Qn,
      // TODO: Remove with v12 API
      highlightBlock: qs,
      configure: Ps,
      initHighlighting: Bs,
      initHighlightingOnLoad: Fs,
      registerLanguage: zs,
      unregisterLanguage: Us,
      listLanguages: $s,
      getLanguage: _t,
      registerAliases: yi,
      autoDetection: Ei,
      inherit: gi,
      addPlugin: Gs,
      removePlugin: Ks
    }), E.debugMode = function() {
      Ae = !1;
    }, E.safeMode = function() {
      Ae = !0;
    }, E.versionString = Ue, E.regex = {
      concat: h,
      lookahead: f,
      either: y,
      optional: m,
      anyNumberOfTimes: p
    };
    for (const P in Te)
      typeof Te[P] == "object" && e(Te[P]);
    return Object.assign(E, Te), E;
  }, Lt = hi({});
  return Lt.newInstance = () => hi({}), wr = Lt, Lt.HighlightJS = Lt, Lt.default = Lt, wr;
}
var bb = /* @__PURE__ */ hb();
const yb = /* @__PURE__ */ Vr(bb), Uo = {}, Eb = "hljs-";
function _b(e) {
  const t = yb.newInstance();
  return e && a(e), {
    highlight: n,
    highlightAuto: r,
    listLanguages: i,
    register: a,
    registerAlias: o,
    registered: s
  };
  function n(l, c, u) {
    const d = u || Uo, f = typeof d.prefix == "string" ? d.prefix : Eb;
    if (!t.getLanguage(l))
      throw new Error("Unknown language: `" + l + "` is not registered");
    t.configure({ __emitter: kb, classPrefix: f });
    const p = (
      /** @type {HighlightResult & {_emitter: HastEmitter}} */
      t.highlight(c, { ignoreIllegals: !0, language: l })
    );
    if (p.errorRaised)
      throw new Error("Could not highlight with `Highlight.js`", {
        cause: p.errorRaised
      });
    const m = p._emitter.root, h = (
      /** @type {RootData} */
      m.data
    );
    return h.language = p.language, h.relevance = p.relevance, m;
  }
  function r(l, c) {
    const d = (c || Uo).subset || i();
    let f = -1, p = 0, m;
    for (; ++f < d.length; ) {
      const h = d[f];
      if (!t.getLanguage(h)) continue;
      const k = n(h, l, c);
      k.data && k.data.relevance !== void 0 && k.data.relevance > p && (p = k.data.relevance, m = k);
    }
    return m || {
      type: "root",
      children: [],
      data: { language: void 0, relevance: p }
    };
  }
  function i() {
    return t.listLanguages();
  }
  function a(l, c) {
    if (typeof l == "string")
      t.registerLanguage(l, c);
    else {
      let u;
      for (u in l)
        Object.hasOwn(l, u) && t.registerLanguage(u, l[u]);
    }
  }
  function o(l, c) {
    if (typeof l == "string")
      t.registerAliases(
        // Note: copy needed because hljs doesn’t accept readonly arrays yet.
        typeof c == "string" ? c : [...c],
        { languageName: l }
      );
    else {
      let u;
      for (u in l)
        if (Object.hasOwn(l, u)) {
          const d = l[u];
          t.registerAliases(
            // Note: copy needed because hljs doesn’t accept readonly arrays yet.
            typeof d == "string" ? d : [...d],
            { languageName: u }
          );
        }
    }
  }
  function s(l) {
    return !!t.getLanguage(l);
  }
}
class kb {
  /**
   * @param {Readonly<HljsOptions>} options
   *   Configuration.
   * @returns
   *   Instance.
   */
  constructor(t) {
    this.options = t, this.root = {
      type: "root",
      children: [],
      data: { language: void 0, relevance: 0 }
    }, this.stack = [this.root];
  }
  /**
   * @param {string} value
   *   Text to add.
   * @returns {undefined}
   *   Nothing.
   *
   */
  addText(t) {
    if (t === "") return;
    const n = this.stack[this.stack.length - 1], r = n.children[n.children.length - 1];
    r && r.type === "text" ? r.value += t : n.children.push({ type: "text", value: t });
  }
  /**
   *
   * @param {unknown} rawName
   *   Name to add.
   * @returns {undefined}
   *   Nothing.
   */
  startScope(t) {
    this.openNode(String(t));
  }
  /**
   * @returns {undefined}
   *   Nothing.
   */
  endScope() {
    this.closeNode();
  }
  /**
   * @param {HastEmitter} other
   *   Other emitter.
   * @param {string} name
   *   Name of the sublanguage.
   * @returns {undefined}
   *   Nothing.
   */
  __addSublanguage(t, n) {
    const r = this.stack[this.stack.length - 1], i = (
      /** @type {Array<ElementContent>} */
      t.root.children
    );
    n ? r.children.push({
      type: "element",
      tagName: "span",
      properties: { className: [n] },
      children: i
    }) : r.children.push(...i);
  }
  /**
   * @param {string} name
   *   Name to add.
   * @returns {undefined}
   *   Nothing.
   */
  openNode(t) {
    const n = this, r = t.split(".").map(function(o, s) {
      return s ? o + "_".repeat(s) : n.options.classPrefix + o;
    }), i = this.stack[this.stack.length - 1], a = {
      type: "element",
      tagName: "span",
      properties: { className: r },
      children: []
    };
    i.children.push(a), this.stack.push(a);
  }
  /**
   * @returns {undefined}
   *   Nothing.
   */
  closeNode() {
    this.stack.pop();
  }
  /**
   * @returns {undefined}
   *   Nothing.
   */
  finalize() {
  }
  /**
   * @returns {string}
   *   Nothing.
   */
  toHTML() {
    return "";
  }
}
const xb = {};
function wb(e) {
  const t = e || xb, n = t.aliases, r = t.detect || !1, i = t.languages || mb, a = t.plainText, o = t.prefix, s = t.subset;
  let l = "hljs";
  const c = _b(i);
  if (n && c.registerAlias(n), o) {
    const u = o.indexOf("-");
    l = u === -1 ? o : o.slice(0, u);
  }
  return function(u, d) {
    qt(u, "element", function(f, p, m) {
      if (f.tagName !== "code" || !m || m.type !== "element" || m.tagName !== "pre")
        return;
      const h = Sb(f);
      if (h === !1 || !h && !r || h && a && a.includes(h))
        return;
      Array.isArray(f.properties.className) || (f.properties.className = []), f.properties.className.includes(l) || f.properties.className.unshift(l);
      const k = Qm(f, { whitespace: "pre" });
      let y;
      try {
        y = h ? c.highlight(h, k, { prefix: o }) : c.highlightAuto(k, { prefix: o, subset: s });
      } catch (S) {
        const w = (
          /** @type {Error} */
          S
        );
        if (h && /Unknown language/.test(w.message)) {
          d.message(
            "Cannot highlight as `" + h + "`, it’s not registered",
            {
              ancestors: [m, f],
              cause: w,
              place: f.position,
              ruleId: "missing-language",
              source: "rehype-highlight"
            }
          );
          return;
        }
        throw w;
      }
      !h && y.data && y.data.language && f.properties.className.push("language-" + y.data.language), y.children.length > 0 && (f.children = /** @type {Array<ElementContent>} */
      y.children);
    });
  };
}
function Sb(e) {
  const t = e.properties.className;
  let n = -1;
  if (!Array.isArray(t))
    return;
  let r;
  for (; ++n < t.length; ) {
    const i = String(t[n]);
    if (i === "no-highlight" || i === "nohighlight")
      return !1;
    !r && i.slice(0, 5) === "lang-" && (r = i.slice(5)), !r && i.slice(0, 9) === "language-" && (r = i.slice(9));
  }
  return r;
}
const vb = {
  javascript: Hr,
  js: Hr,
  typescript: qr,
  ts: qr,
  python: Kr,
  py: Kr,
  java: gs,
  html: Ms,
  css: ps,
  json: ys,
  bash: $r,
  sh: $r,
  sql: ks,
  markdown: Gr,
  md: Gr
}, Tb = [
  "javascript",
  "typescript",
  "python",
  "java",
  "html",
  "css",
  "json",
  "bash",
  "sql",
  "markdown"
], Nb = ({
  content: e = "",
  typingSpeed: t = 80,
  disabled: n = !1
} = {}) => {
  const [r, i] = Ge(""), [a, o] = Ge(!1), [s, l] = Ge(!1), c = Pe([]), u = Pe(0), d = Pe(null), f = Pe(!0), p = Pe(""), m = tt(() => {
    d.current && (clearTimeout(d.current), d.current = null);
  }, []), h = Pe([
    { pattern: /\?\[[^\]]*\]/, type: "custom-tag" },
    { pattern: /```[\s\S]*?```/, type: "code-block" },
    { pattern: /^#{1,6}\s[^\n]*$/m, type: "header" },
    { pattern: /\*\*\*[^*]+\*\*\*/, type: "bold-italic" },
    { pattern: /\*\*[^*]+\*\*/, type: "bold" },
    { pattern: new RegExp("(?<!\\*)\\*[^*]+\\*(?!\\*)"), type: "italic" },
    { pattern: /~~[^~]+~~/, type: "strikethrough" },
    { pattern: /`[^`]+`/, type: "inline-code" },
    { pattern: /!\[[^\]]*\]\([^\)]*\)/, type: "image" },
    { pattern: new RegExp("(?<!\\!)\\[[^\\]]*\\]\\([^\\)]*\\)"), type: "link" },
    { pattern: /^(>\s*)+[^\n]*$/m, type: "blockquote" },
    { pattern: /^[-*]{3,}$/m, type: "hr" },
    { pattern: /^[*-]\s+[^\n]*$/m, type: "list-item" },
    { pattern: /^\d+\.\s+[^\n]*$/m, type: "ordered-list-item" }
  ]).current, k = tt((N) => {
    const A = [];
    let _ = N || "";
    for (; _.length > 0; ) {
      let L = !1, v = null, R = 1 / 0;
      for (const x of h) {
        const O = x.pattern.exec(_);
        O && O.index < R && (R = O.index, v = { match: O, pattern: x });
      }
      if (v && R >= 0) {
        if (R > 0) {
          const x = _.substring(0, R);
          A.push(...Array.from(x).map((O) => ({
            content: O,
            isMarkdown: !1
          }))), _ = _.substring(R);
        }
        A.push({
          content: v.match[0],
          isMarkdown: !0,
          type: v.pattern.type
        }), _ = _.substring(v.match[0].length), L = !0;
      }
      L || (A.push({
        content: _[0],
        isMarkdown: !1
      }), _ = _.substring(1));
    }
    return A;
  }, [h]), y = tt(() => {
    if (f.current)
      if (u.current < c.current.length) {
        const N = c.current[u.current];
        i((A) => A + (N?.content || "")), u.current++, f.current && (d.current = setTimeout(y, t));
      } else
        o(!1), l(!0);
  }, [t]);
  Qe(() => {
    const N = e || "", A = p.current;
    if (N === A)
      return;
    if (n) {
      m();
      const L = k(N);
      i(L.map((v) => v.content).join("")), o(!1), l(!0), p.current = N;
      return;
    }
    if (N.length >= A.length && N.startsWith(A) && A) {
      const L = k(N), v = c.current.length;
      c.current = L;
      const R = u.current >= L.length;
      l(R), !R && (!a || u.current >= v) && (o(!0), y());
    } else {
      m(), i("");
      const L = k(N);
      c.current = L, u.current = 0;
      const v = L.length === 0;
      l(v), !v && N && f.current && (o(!0), y());
    }
    p.current = N;
  }, [e, n, m, k, y, a]), Qe(() => (f.current = !0, () => {
    f.current = !1, m();
  }), [m]);
  const S = tt(() => {
    m(), i(""), c.current = [], u.current = 0, o(!1), l(!1), p.current = "";
  }, [m]), w = tt(() => {
    m(), u.current = 0, i(""), o(!0), l(!1), y();
  }, [m, y]);
  return {
    displayContent: r,
    isTyping: a,
    isComplete: s,
    // 新增：返回完成状态
    reset: S,
    start: w,
    getSegments: () => c.current
  };
};
function Ab(e) {
  Fa(e, [/\r?\n|\r/g, Cb]);
}
function Cb() {
  return { type: "break" };
}
function Rb() {
  return function(e) {
    Ab(e);
  };
}
const Ob = (e) => {
  const t = {
    "\\\\": "\\",
    // 反斜杠
    "\\n": `
`,
    // 换行符
    "\\r": "\r",
    // 回车符
    "\\t": "	",
    // 制表符
    '\\"': '"',
    // 双引号
    "\\'": "'",
    // 单引号
    "\\b": "\b",
    // 退格符
    "\\f": "\f"
    // 换页符
  }, n = /\\[\\nrt"'bf]|\\u([0-9a-fA-F]{4})/g;
  return e.replace(
    n,
    (r, i) => i ? String.fromCharCode(parseInt(i, 16)) : t[r] || r
  );
}, Ib = (e) => {
  let t = Ob(e);
  return t = t.replace(/\\\\n/g, `
`).replace(/\\\\t/g, "	"), t = t.replace(/\r\n/g, `
`), t = t.replace(/\n{3,}/g, `

`), t = t.replace(/&nbsp;|\u00A0/g, " "), t || "";
}, Mb = ({
  content: e,
  customRenderBar: t,
  onSend: n,
  typingSpeed: r = 30,
  disableTyping: i = !0,
  defaultButtonText: a,
  defaultInputText: o,
  readonly: s = !1,
  onTypeFinished: l
}) => {
  const { displayContent: c, isTyping: u, isComplete: d } = Nb({
    content: Ib(e),
    typingSpeed: r,
    disabled: i
  }), f = {
    "custom-variable": (m) => /* @__PURE__ */ ae.jsx(
      Bf,
      {
        ...m,
        readonly: s,
        defaultButtonText: a,
        defaultInputText: o,
        onSend: n
      }
    ),
    "custom-button": (m) => /* @__PURE__ */ ae.jsx(
      kf,
      {
        ...m,
        readonly: s,
        defaultButtonText: a,
        onSend: n
      }
    ),
    code: (m) => {
      const { inline: h, className: k, children: y, ...S } = m, w = /language-(\w+)/.exec(k || "");
      return !h && w ? /* @__PURE__ */ ae.jsx("code", { className: k, ...S, children: y }) : /* @__PURE__ */ ae.jsx("code", { className: k, ...S, children: y });
    },
    table: ({ node: m, ...h }) => /* @__PURE__ */ ae.jsx("div", { className: "content-render-table-container", children: /* @__PURE__ */ ae.jsx("table", { className: "content-render-table", ...h }) }),
    th: ({ node: m, ...h }) => /* @__PURE__ */ ae.jsx("th", { className: "content-render-th", ...h }),
    td: ({ node: m, ...h }) => /* @__PURE__ */ ae.jsx("td", { className: "content-render-td", ...h }),
    tr: ({ node: m, ...h }) => /* @__PURE__ */ ae.jsx("tr", { className: "content-render-tr", ...h }),
    li: ({ node: m, ...h }) => {
      const k = m?.properties?.className;
      return typeof k == "string" && k.includes("task-list-item") || Array.isArray(k) && k.includes("task-list-item") ? /* @__PURE__ */ ae.jsx("li", { className: "content-render-task-list-item", ...h }) : /* @__PURE__ */ ae.jsx("li", { ...h });
    },
    input: ({ node: m, ...h }) => h.type === "checkbox" ? /* @__PURE__ */ ae.jsx(
      "input",
      {
        type: "checkbox",
        className: "content-render-checkbox",
        disabled: !0,
        ...h
      }
    ) : /* @__PURE__ */ ae.jsx("input", { ...h })
  }, p = Pe(!1);
  return Qe(() => {
    d && !p.current && (console.log("[ContentRender] Typing is complete, calling onTypeFinished"), p.current = !0, l?.());
  }, [d, l]), Qe(() => {
    p.current = !1;
  }, [e]), /* @__PURE__ */ ae.jsxs("div", { className: "content-render", children: [
    /* @__PURE__ */ ae.jsx(
      wp,
      {
        remarkPlugins: [
          qm,
          Tf,
          Cp,
          Rb
        ],
        rehypePlugins: [
          [
            wb,
            {
              languages: vb,
              subset: Tb
            }
          ]
        ],
        components: f,
        children: c
      }
    ),
    t && Wr.createElement(t, {
      content: e,
      displayContent: c,
      onSend: n
    }),
    u && /* @__PURE__ */ ae.jsx("span", { className: "typing-cursor ml-1 animate-pulse", children: "|" })
  ] });
}, Lb = ({
  initialContentList: e = [],
  customRenderBar: t,
  onSend: n,
  typingSpeed: r,
  disableTyping: i,
  onBlockComplete: a
}) => /* @__PURE__ */ ae.jsx("div", { className: "markdown-flow", children: e.map((o, s) => {
  const l = o.isFinished ?? !1, c = l || i, u = l ? void 0 : n, d = l ? void 0 : r;
  return /* @__PURE__ */ ae.jsx(
    Mb,
    {
      content: o.content,
      defaultInputText: o.defaultInputText,
      defaultButtonText: o.defaultButtonText,
      readonly: o.readonly,
      disableTyping: c,
      customRenderBar: t,
      onSend: u,
      typingSpeed: d,
      onTypeFinished: () => {
        console.log(`Block ${s} typing finished`), a?.(s);
      }
    },
    s
  );
}) }), Db = (e, t = [], n = {}) => {
  const {
    behavior: r = "smooth",
    autoScrollOnInit: i = !0,
    scrollDelay: a = 100,
    scrollThreshold: o = 10
  } = n, [s, l] = Ge(!1), [c, u] = Ge(!0), d = Pe(!0), f = Pe(!0), p = Pe({
    scroll: null,
    init: null,
    content: null
  }), m = tt(() => {
    Object.values(p.current).forEach((w) => {
      w && clearTimeout(w);
    });
  }, []), h = tt(() => {
    const w = e.current;
    if (!w) return !0;
    const { scrollTop: N, scrollHeight: A, clientHeight: _ } = w;
    return N + _ >= A - o;
  }, [e, o]), k = tt(() => {
    const w = e.current;
    w && w.scrollTo({
      top: w.scrollHeight,
      behavior: r
    });
  }, [e, r]), y = tt(() => {
    const w = h();
    return u(w), l(!w), w;
  }, [h]), S = tt(() => {
    k(), d.current = !0, l(!1), u(!0);
  }, [k]);
  return Qe(() => {
    const w = e.current;
    if (!w) return;
    const N = () => {
      p.current.scroll && clearTimeout(p.current.scroll), p.current.scroll = setTimeout(() => {
        y() ? d.current = !0 : d.current = !1;
      }, 150);
    };
    return w.addEventListener("scroll", N), y(), () => {
      w.removeEventListener("scroll", N), p.current.scroll && clearTimeout(p.current.scroll);
    };
  }, [e, y]), Qe(() => (i && f.current && (p.current.init = setTimeout(() => {
    k(), u(!0), l(!1), d.current = !0, f.current = !1;
  }, a)), () => {
    p.current.init && clearTimeout(p.current.init);
  }), [i, k, a]), Qe(() => {
    if (!f.current)
      return p.current.content = setTimeout(() => {
        d.current ? (k(), u(!0), l(!1)) : y();
      }, 50), () => {
        p.current.content && clearTimeout(p.current.content);
      };
  }, [...t, k, y]), Qe(() => () => {
    m();
  }, [m]), {
    showScrollToBottom: s,
    scrollToBottom: S,
    handleUserScrollToBottom: S,
    isAtBottom: c,
    followNewContent: d.current
  };
}, Pb = ({
  initialContentList: e = [],
  customRenderBar: t,
  onSend: n,
  onBlockComplete: r,
  typingSpeed: i,
  disableTyping: a,
  height: o = "100%",
  className: s = "",
  ...l
}) => {
  const c = Pe(null), { showScrollToBottom: u, handleUserScrollToBottom: d } = Db(
    c,
    [
      e?.length >= 1 ? JSON.stringify(e[e?.length - 1]) : null
    ],
    {
      // 监听内容数量变化
      behavior: "smooth",
      autoScrollOnInit: !0,
      scrollDelay: 100
    }
  );
  return /* @__PURE__ */ ae.jsxs(
    "div",
    {
      className: `scrollable-markdown-container ${s}`,
      style: { height: o, position: "relative" },
      ...l,
      children: [
        /* @__PURE__ */ ae.jsx("div", { ref: c, style: { height: "100%", overflow: "auto" }, children: /* @__PURE__ */ ae.jsx(
          Lb,
          {
            initialContentList: e,
            customRenderBar: t,
            onSend: n,
            typingSpeed: i,
            disableTyping: !0,
            onBlockComplete: r
          }
        ) }),
        u && /* @__PURE__ */ ae.jsx(
          Un,
          {
            className: "h-6 w-6 border hover:bg-gray-200 scroll-to-bottom-btn",
            type: "button",
            variant: "ghost",
            size: "icon",
            onClick: d,
            "aria-label": "滚动到底部",
            children: /* @__PURE__ */ ae.jsx(Lf, {})
          }
        )
      ]
    }
  );
}, Fb = ({
  defaultContent: e,
  defaultVariables: t = {},
  defaultDocumentPrompt: n = "",
  styles: r = {},
  sseUrl: i = "https://play.dev.pillowai.cn/api/v1/playground/generate",
  sessionId: a
}) => {
  const { data: o, loading: s } = pl(e), { block_count: l = 0, interaction_blocks: c = [] } = o || {}, [u, d] = Ge(0), [f, p] = Ge([]), [m, h] = Ge({
    content: e,
    block_index: 0,
    context: [{ role: "assistant", content: "" }],
    variables: t,
    user_input: null,
    document_prompt: n,
    interaction_prompt: null,
    interaction_error_prompt: null,
    model: null
  }), k = () => JSON.stringify(m), y = (R) => {
    const x = u + 1;
    return !(R && c.includes(u) || x >= l);
  }, S = (R) => {
    const x = [...m.context];
    for (; x.length <= u; )
      x.push({ role: "assistant", content: "" });
    return x[u] = {
      ...x[u],
      content: R
    }, x.length <= u + 1 && x.push({ role: "assistant", content: "" }), x;
  }, w = (R) => {
    const x = [...f];
    for (; x.length <= u; )
      x.push({ content: "" });
    return x[u] = {
      ...x[u],
      content: R
    }, x;
  }, N = (R) => {
    const x = [...f], O = x.length - 1;
    return O >= 0 && (x[O] = {
      ...x[O],
      readonly: !0,
      defaultButtonText: R.buttonText,
      defaultInputText: R.inputText
    }), x;
  }, A = (R) => {
    if (!y(R))
      return;
    const x = S(R), O = u + 1;
    h((F) => ({
      ...F,
      user_input: null,
      block_index: O,
      context: x
    })), d(O);
  }, { data: _, connect: L } = dl(i, {
    method: "POST",
    body: k(),
    headers: a ? { "session-id": a } : {},
    autoConnect: !!o && !s,
    onFinish: A
  });
  Qe(() => {
    o && !s && L();
  }, [o, s, L]), Qe(() => {
    if (_)
      try {
        const R = w(_);
        p(R);
      } catch (R) {
        console.error("Error processing SSE message:", R);
      }
  }, [_]);
  const v = (R) => {
    const x = R.inputText || R.buttonText || "", O = [...m.context];
    O[u] && (O[u] = {
      ...O[u],
      content: x,
      role: "user"
    }), h((U) => ({
      ...U,
      context: O,
      user_input: x ?? null,
      variables: {
        ...U.variables,
        [R.variableName || ""]: x
      }
    }));
    const F = N(R);
    p(F);
  };
  return /* @__PURE__ */ ae.jsx("div", { style: r, children: /* @__PURE__ */ ae.jsx(Pb, { initialContentList: f, onSend: v }) });
};
export {
  Lb as MarkdownFlow,
  Fb as Playground
};
//# sourceMappingURL=index.es.js.map
