var n;
function aa(a) {
  var b = 0;
  return function() {
    return b < a.length ? {done:!1, value:a[b++], } : {done:!0};
  };
}
function r(a) {
  var b = "undefined" != typeof Symbol && Symbol.iterator && a[Symbol.iterator];
  return b ? b.call(a) : {next:aa(a)};
}
var ba = "function" == typeof Object.create ? Object.create : function(a) {
  function b() {
  }
  b.prototype = a;
  return new b;
}, t = "function" == typeof Object.defineProperties ? Object.defineProperty : function(a, b, c) {
  if (a == Array.prototype || a == Object.prototype) {
    return a;
  }
  a[b] = c.value;
  return a;
};
function ca(a) {
  a = ["object" == typeof globalThis && globalThis, a, "object" == typeof window && window, "object" == typeof self && self, "object" == typeof global && global, ];
  for (var b = 0; b < a.length; ++b) {
    var c = a[b];
    if (c && c.Math == Math) {
      return c;
    }
  }
  throw Error("Cannot find global object");
}
var u = ca(this);
function w(a, b) {
  if (b) {
    a: {
      var c = u;
      a = a.split(".");
      for (var d = 0; d < a.length - 1; d++) {
        var f = a[d];
        if (!(f in c)) {
          break a;
        }
        c = c[f];
      }
      a = a[a.length - 1];
      d = c[a];
      b = b(d);
      b != d && null != b && t(c, a, {configurable:!0, writable:!0, value:b});
    }
  }
}
var x;
if ("function" == typeof Object.setPrototypeOf) {
  x = Object.setPrototypeOf;
} else {
  var y;
  a: {
    var da = {R:!0}, ea = {};
    try {
      ea.__proto__ = da;
      y = ea.R;
      break a;
    } catch (a) {
    }
    y = !1;
  }
  x = y ? function(a, b) {
    a.__proto__ = b;
    if (a.__proto__ !== b) {
      throw new TypeError(a + " is not extensible");
    }
    return a;
  } : null;
}
var fa = x;
function z(a, b) {
  a.prototype = ba(b.prototype);
  a.prototype.constructor = a;
  if (fa) {
    fa(a, b);
  } else {
    for (var c in b) {
      if ("prototype" != c) {
        if (Object.defineProperties) {
          var d = Object.getOwnPropertyDescriptor(b, c);
          d && Object.defineProperty(a, c, d);
        } else {
          a[c] = b[c];
        }
      }
    }
  }
  a.S = b.prototype;
}
w("Promise", function(a) {
  function b(h) {
    this.b = 0;
    this.g = void 0;
    this.a = [];
    var e = this.c();
    try {
      h(e.resolve, e.reject);
    } catch (g) {
      e.reject(g);
    }
  }
  function c() {
    this.a = null;
  }
  function d(h) {
    return h instanceof b ? h : new b(function(e) {
      e(h);
    });
  }
  if (a) {
    return a;
  }
  c.prototype.b = function(h) {
    if (null == this.a) {
      this.a = [];
      var e = this;
      this.c(function() {
        e.g();
      });
    }
    this.a.push(h);
  };
  var f = u.setTimeout;
  c.prototype.c = function(h) {
    f(h, 0);
  };
  c.prototype.g = function() {
    for (; this.a && this.a.length;) {
      var h = this.a;
      this.a = [];
      for (var e = 0; e < h.length; ++e) {
        var g = h[e];
        h[e] = null;
        try {
          g();
        } catch (k) {
          this.f(k);
        }
      }
    }
    this.a = null;
  };
  c.prototype.f = function(h) {
    this.c(function() {
      throw h;
    });
  };
  b.prototype.c = function() {
    function h(k) {
      return function(m) {
        g || (g = !0, k.call(e, m));
      };
    }
    var e = this, g = !1;
    return {resolve:h(this.L), reject:h(this.f)};
  };
  b.prototype.L = function(h) {
    if (h === this) {
      this.f(new TypeError("A Promise cannot resolve to itself"));
    } else {
      if (h instanceof b) {
        this.M(h);
      } else {
        a: {
          switch(typeof h) {
            case "object":
              var e = null != h;
              break a;
            case "function":
              e = !0;
              break a;
            default:
              e = !1;
          }
        }
        e ? this.K(h) : this.i(h);
      }
    }
  };
  b.prototype.K = function(h) {
    var e = void 0;
    try {
      e = h.then;
    } catch (g) {
      this.f(g);
      return;
    }
    "function" == typeof e ? this.N(e, h) : this.i(h);
  };
  b.prototype.f = function(h) {
    this.l(2, h);
  };
  b.prototype.i = function(h) {
    this.l(1, h);
  };
  b.prototype.l = function(h, e) {
    if (0 != this.b) {
      throw Error("Cannot settle(" + h + ", " + e + "): Promise already settled in state" + this.b);
    }
    this.b = h;
    this.g = e;
    this.v();
  };
  b.prototype.v = function() {
    if (null != this.a) {
      for (var h = 0; h < this.a.length; ++h) {
        l.b(this.a[h]);
      }
      this.a = null;
    }
  };
  var l = new c;
  b.prototype.M = function(h) {
    var e = this.c();
    h.J(e.resolve, e.reject);
  };
  b.prototype.N = function(h, e) {
    var g = this.c();
    try {
      h.call(e, g.resolve, g.reject);
    } catch (k) {
      g.reject(k);
    }
  };
  b.prototype.then = function(h, e) {
    function g(p, v) {
      return "function" == typeof p ? function(P) {
        try {
          k(p(P));
        } catch (Q) {
          m(Q);
        }
      } : v;
    }
    var k, m, q = new b(function(p, v) {
      k = p;
      m = v;
    });
    this.J(g(h, k), g(e, m));
    return q;
  };
  b.prototype.catch = function(h) {
    return this.then(void 0, h);
  };
  b.prototype.J = function(h, e) {
    function g() {
      switch(k.b) {
        case 1:
          h(k.g);
          break;
        case 2:
          e(k.g);
          break;
        default:
          throw Error("Unexpected state: " + k.b);
      }
    }
    var k = this;
    null == this.a ? l.b(g) : this.a.push(g);
  };
  b.resolve = d;
  b.reject = function(h) {
    return new b(function(e, g) {
      g(h);
    });
  };
  b.race = function(h) {
    return new b(function(e, g) {
      for (var k = r(h), m = k.next(); !m.done; m = k.next()) {
        d(m.value).J(e, g);
      }
    });
  };
  b.all = function(h) {
    var e = r(h), g = e.next();
    return g.done ? d([]) : new b(function(k, m) {
      function q(P) {
        return function(Q) {
          p[P] = Q;
          v--;
          0 == v && k(p);
        };
      }
      var p = [], v = 0;
      do {
        p.push(void 0), v++, d(g.value).J(q(p.length - 1), m), g = e.next();
      } while (!g.done);
    });
  };
  return b;
});
w("Symbol", function(a) {
  function b(f) {
    if (this instanceof b) {
      throw new TypeError("Symbol is not a constructor");
    }
    return new c("jscomp_symbol_" + (f || "") + "_" + d++, f);
  }
  function c(f, l) {
    this.a = f;
    t(this, "description", {configurable:!0, writable:!0, value:l});
  }
  if (a) {
    return a;
  }
  c.prototype.toString = function() {
    return this.a;
  };
  var d = 0;
  return b;
});
w("Symbol.iterator", function(a) {
  if (a) {
    return a;
  }
  a = Symbol("Symbol.iterator");
  for (var b = "Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array".split(" "), c = 0; c < b.length; c++) {
    var d = u[b[c]];
    "function" === typeof d && "function" != typeof d.prototype[a] && t(d.prototype, a, {configurable:!0, writable:!0, value:function() {
      return ha(aa(this));
    }});
  }
  return a;
});
function ha(a) {
  a = {next:a};
  a[Symbol.iterator] = function() {
    return this;
  };
  return a;
}
function ia(a, b) {
  a instanceof String && (a += "");
  var c = 0, d = !1, f = {next:function() {
    if (!d && c < a.length) {
      var l = c++;
      return {value:b(l, a[l]), done:!1};
    }
    d = !0;
    return {done:!0, value:void 0};
  }};
  f[Symbol.iterator] = function() {
    return f;
  };
  return f;
}
w("Array.prototype.keys", function(a) {
  return a ? a : function() {
    return ia(this, function(b) {
      return b;
    });
  };
});
function A(a, b) {
  return Object.prototype.hasOwnProperty.call(a, b);
}
w("WeakMap", function(a) {
  function b(g) {
    this.a = (e += Math.random() + 1).toString();
    if (g) {
      g = r(g);
      for (var k; !(k = g.next()).done;) {
        k = k.value, this.set(k[0], k[1]);
      }
    }
  }
  function c() {
  }
  function d(g) {
    var k = typeof g;
    return "object" === k && null !== g || "function" === k;
  }
  function f(g) {
    if (!A(g, h)) {
      var k = new c;
      t(g, h, {value:k});
    }
  }
  function l(g) {
    var k = Object[g];
    k && (Object[g] = function(m) {
      if (m instanceof c) {
        return m;
      }
      Object.isExtensible(m) && f(m);
      return k(m);
    });
  }
  if (function() {
    if (!a || !Object.seal) {
      return !1;
    }
    try {
      var g = Object.seal({}), k = Object.seal({}), m = new a([[g, 2], [k, 3]]);
      if (2 != m.get(g) || 3 != m.get(k)) {
        return !1;
      }
      m.delete(g);
      m.set(k, 4);
      return !m.has(g) && 4 == m.get(k);
    } catch (q) {
      return !1;
    }
  }()) {
    return a;
  }
  var h = "$jscomp_hidden_" + Math.random();
  l("freeze");
  l("preventExtensions");
  l("seal");
  var e = 0;
  b.prototype.set = function(g, k) {
    if (!d(g)) {
      throw Error("Invalid WeakMap key");
    }
    f(g);
    if (!A(g, h)) {
      throw Error("WeakMap key fail: " + g);
    }
    g[h][this.a] = k;
    return this;
  };
  b.prototype.get = function(g) {
    return d(g) && A(g, h) ? g[h][this.a] : void 0;
  };
  b.prototype.has = function(g) {
    return d(g) && A(g, h) && A(g[h], this.a);
  };
  b.prototype.delete = function(g) {
    return d(g) && A(g, h) && A(g[h], this.a) ? delete g[h][this.a] : !1;
  };
  return b;
});
w("Map", function(a) {
  function b() {
    var e = {};
    return e.m = e.next = e.head = e;
  }
  function c(e, g) {
    var k = e.a;
    return ha(function() {
      if (k) {
        for (; k.head != e.a;) {
          k = k.m;
        }
        for (; k.next != k.head;) {
          return k = k.next, {done:!1, value:g(k)};
        }
        k = null;
      }
      return {done:!0, value:void 0};
    });
  }
  function d(e, g) {
    var k = g && typeof g;
    "object" == k || "function" == k ? l.has(g) ? k = l.get(g) : (k = "" + ++h, l.set(g, k)) : k = "p_" + g;
    var m = e.b[k];
    if (m && A(e.b, k)) {
      for (e = 0; e < m.length; e++) {
        var q = m[e];
        if (g !== g && q.key !== q.key || g === q.key) {
          return {id:k, list:m, index:e, h:q};
        }
      }
    }
    return {id:k, list:m, index:-1, h:void 0};
  }
  function f(e) {
    this.b = {};
    this.a = b();
    this.size = 0;
    if (e) {
      e = r(e);
      for (var g; !(g = e.next()).done;) {
        g = g.value, this.set(g[0], g[1]);
      }
    }
  }
  if (function() {
    if (!a || "function" != typeof a || !a.prototype.entries || "function" != typeof Object.seal) {
      return !1;
    }
    try {
      var e = Object.seal({x:4}), g = new a(r([[e, "s"]]));
      if ("s" != g.get(e) || 1 != g.size || g.get({x:4}) || g.set({x:4}, "t") != g || 2 != g.size) {
        return !1;
      }
      var k = g.entries(), m = k.next();
      if (m.done || m.value[0] != e || "s" != m.value[1]) {
        return !1;
      }
      m = k.next();
      return m.done || 4 != m.value[0].x || "t" != m.value[1] || !k.next().done ? !1 : !0;
    } catch (q) {
      return !1;
    }
  }()) {
    return a;
  }
  var l = new WeakMap;
  f.prototype.set = function(e, g) {
    e = 0 === e ? 0 : e;
    var k = d(this, e);
    k.list || (k.list = this.b[k.id] = []);
    k.h ? k.h.value = g : (k.h = {next:this.a, m:this.a.m, head:this.a, key:e, value:g, }, k.list.push(k.h), this.a.m.next = k.h, this.a.m = k.h, this.size++);
    return this;
  };
  f.prototype.delete = function(e) {
    e = d(this, e);
    return e.h && e.list ? (e.list.splice(e.index, 1), e.list.length || delete this.b[e.id], e.h.m.next = e.h.next, e.h.next.m = e.h.m, e.h.head = null, this.size--, !0) : !1;
  };
  f.prototype.clear = function() {
    this.b = {};
    this.a = this.a.m = b();
    this.size = 0;
  };
  f.prototype.has = function(e) {
    return !!d(this, e).h;
  };
  f.prototype.get = function(e) {
    return (e = d(this, e).h) && e.value;
  };
  f.prototype.entries = function() {
    return c(this, function(e) {
      return [e.key, e.value];
    });
  };
  f.prototype.keys = function() {
    return c(this, function(e) {
      return e.key;
    });
  };
  f.prototype.values = function() {
    return c(this, function(e) {
      return e.value;
    });
  };
  f.prototype.forEach = function(e, g) {
    for (var k = this.entries(), m; !(m = k.next()).done;) {
      m = m.value, e.call(g, m[1], m[0], this);
    }
  };
  f.prototype[Symbol.iterator] = f.prototype.entries;
  var h = 0;
  return f;
});
w("Set", function(a) {
  function b(c) {
    this.a = new Map;
    if (c) {
      c = r(c);
      for (var d; !(d = c.next()).done;) {
        this.add(d.value);
      }
    }
    this.size = this.a.size;
  }
  if (function() {
    if (!a || "function" != typeof a || !a.prototype.entries || "function" != typeof Object.seal) {
      return !1;
    }
    try {
      var c = Object.seal({x:4}), d = new a(r([c]));
      if (!d.has(c) || 1 != d.size || d.add(c) != d || 1 != d.size || d.add({x:4}) != d || 2 != d.size) {
        return !1;
      }
      var f = d.entries(), l = f.next();
      if (l.done || l.value[0] != c || l.value[1] != c) {
        return !1;
      }
      l = f.next();
      return l.done || l.value[0] == c || 4 != l.value[0].x || l.value[1] != l.value[0] ? !1 : f.next().done;
    } catch (h) {
      return !1;
    }
  }()) {
    return a;
  }
  b.prototype.add = function(c) {
    c = 0 === c ? 0 : c;
    this.a.set(c, c);
    this.size = this.a.size;
    return this;
  };
  b.prototype.delete = function(c) {
    c = this.a.delete(c);
    this.size = this.a.size;
    return c;
  };
  b.prototype.clear = function() {
    this.a.clear();
    this.size = 0;
  };
  b.prototype.has = function(c) {
    return this.a.has(c);
  };
  b.prototype.entries = function() {
    return this.a.entries();
  };
  b.prototype.values = function() {
    return this.a.values();
  };
  b.prototype.keys = b.prototype.values;
  b.prototype[Symbol.iterator] = b.prototype.values;
  b.prototype.forEach = function(c, d) {
    var f = this;
    this.a.forEach(function(l) {
      return c.call(d, l, l, f);
    });
  };
  return b;
});
w("Array.from", function(a) {
  return a ? a : function(b, c, d) {
    c = null != c ? c : function(e) {
      return e;
    };
    var f = [], l = "undefined" != typeof Symbol && Symbol.iterator && b[Symbol.iterator];
    if ("function" == typeof l) {
      b = l.call(b);
      for (var h = 0; !(l = b.next()).done;) {
        f.push(c.call(d, l.value, h++));
      }
    } else {
      for (l = b.length, h = 0; h < l; h++) {
        f.push(c.call(d, b[h], h));
      }
    }
    return f;
  };
});
w("Object.values", function(a) {
  return a ? a : function(b) {
    var c = [], d;
    for (d in b) {
      A(b, d) && c.push(b[d]);
    }
    return c;
  };
});
w("globalThis", function(a) {
  return a || u;
});
function ja(a, b, c) {
  if (null == a) {
    throw new TypeError("The 'this' value for String.prototype." + c + " must not be null or undefined");
  }
  if (b instanceof RegExp) {
    throw new TypeError("First argument to String.prototype." + c + " must not be a regular expression");
  }
  return a + "";
}
w("String.prototype.endsWith", function(a) {
  return a ? a : function(b, c) {
    var d = ja(this, b, "endsWith");
    void 0 === c && (c = d.length);
    c = Math.max(0, Math.min(c | 0, d.length));
    for (var f = b.length; 0 < f && 0 < c;) {
      if (d[--c] != b[--f]) {
        return !1;
      }
    }
    return 0 >= f;
  };
});
w("String.prototype.startsWith", function(a) {
  return a ? a : function(b, c) {
    var d = ja(this, b, "startsWith"), f = d.length, l = b.length;
    c = Math.max(0, Math.min(c | 0, d.length));
    for (var h = 0; h < l && c < f;) {
      if (d[c++] != b[h++]) {
        return !1;
      }
    }
    return h >= l;
  };
});
w("Math.log10", function(a) {
  return a ? a : function(b) {
    return Math.log(b) / Math.LN10;
  };
});
function ka() {
  var a = document.createElement("div");
  a.setAttribute("id", "helpGuide");
  a.innerHTML = '<button class="help-guide-button MuiButton-textPrimary"><svg class="MuiSvgIcon-root" focusable="false" viewBox="0 0 24 24" aria-hidden="true"><path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"></path></svg><span class="map-guide-text">Map Guide</span></button>';
  a.classList.add("navlink");
  a.classList.add("navlink-question-mark");
  document.getElementById("logo").appendChild(a);
  a.addEventListener("click", function(b) {
    return la(b);
  });
}
function B(a) {
  this.a = a;
}
B.prototype.o = function() {
  var a = this.a;
  return Promise.all([ma(a, !1), na(a), oa(a), pa(), qa(a)]);
};
B.prototype.G = function() {
  document.title = "Global.health | a Data Science Initiative";
  console.log('Rendering "' + document.title + '"');
  document.body.classList.add(this.j());
};
function ra() {
  var a = document.createElement("div");
  a.classList.add("logo");
  a.setAttribute("id", "logo");
  a.innerHTML = '<a href="https://global.health/"><div id="logo-container">     <img src="/img/gh_logo.svg" />     <span>Map</span>     </div></a>     ';
  document.getElementById("app").appendChild(a);
  ka();
}
B.prototype.I = function() {
  document.body.classList.remove(this.j());
};
function C(a, b) {
  this.a = a;
  this.f = b;
  this.b = new D(this.a, this, this.f);
  this.c = null;
}
z(C, B);
n = C.prototype;
n.H = function() {
  return !1;
};
n.o = function() {
  var a = this.a, b = B.prototype.o.call(this);
  if (!document.getElementById("mapobox-style")) {
    var c = document.createElement("link");
    c.setAttribute("id", "mapobox-style");
    c.setAttribute("href", "https://api.mapbox.com/mapbox-gl-js/v1.11.0/mapbox-gl.css");
    c.setAttribute("rel", "stylesheet");
    document.body.appendChild(c);
  }
  c = new Promise(function(f) {
    b.then(function() {
      return a.M.bind(a)();
    }).then(function() {
      f();
    });
  });
  var d = new Promise(function(f) {
    document.getElementById("mapbox") && (console.log("Mapbox script already present"), f());
    var l = document.createElement("script");
    l.src = "https://api.mapbox.com/mapbox-gl-js/v1.11.0/mapbox-gl.js";
    l.setAttribute("id", "mapbox");
    l.onload = function() {
      return f();
    };
    document.body.appendChild(l);
  });
  return Promise.all([c, d]);
};
n.G = function() {
  B.prototype.G.call(this);
  var a = document.getElementById("app");
  a.innerHTML = "";
  var b = document.createElement("div");
  b.setAttribute("id", "sidebar");
  this.c = new E(this.a, this, b);
  var c = document.createElement("div");
  c.setAttribute("id", "map-wrapper");
  c.innerHTML = '<div id="legend"><div id="legend-header"></div><ul class="list-reset"></ul></div><div id="map"></div>';
  a.appendChild(b);
  a.appendChild(c);
  sa(this.b, this.f.a.dark);
  ta(this.c);
  ua(this.c);
  ra();
};
n.I = function() {
  B.prototype.I.call(this);
  this.b.i = !0;
};
n.P = function() {
  return this.H() ? "circle" : "fill";
};
n.s = function() {
  return [];
};
n.F = function() {
  return "cum_conf";
};
function va(a, b) {
  return a.H() ? {"circle-radius":{property:"total", stops:[[100, 3], [1000, 4], [5000, 6], [20000, 8], [100000, 18], ]}, "circle-opacity":0.55, "circle-color":b, "circle-stroke-color":b, "circle-stroke-width":0.5, } : {"fill-color":b, "fill-outline-color":"#0074ab", "fill-opacity":1, };
}
function wa(a) {
  for (var b = ["step", ["get", a.F()]], c = a.s(), d = 0; d < c.length; d++) {
    var f = c[d];
    b.push(f[0]);
    2 < f.length && b.push(f[2]);
    3 < f.length && b.push(f[3]);
  }
  console.log("err: ", va(a, b));
  return va(a, b);
}
n.O = function() {
  return 0;
};
n.B = function() {
  return F([]);
};
n.D = function() {
  var a = document.createElement("div");
  a.innerHTML = "Default pop-up content";
  return a;
};
n.C = function() {
  return this.u();
};
function F(a) {
  return {type:"FeatureCollection", features:a};
}
n.A = function(a, b) {
  var c = JSON.parse(JSON.stringify(a));
  c.type = "Feature";
  c.properties || (c.properties = {geoid:"0|0"});
  isNaN(c.properties["new"]) && (c.properties["new"] = 0);
  var d = c.properties.geoid.split("|");
  c.geometry = {type:"Point", coordinates:[parseFloat(d[1]), parseFloat(d[0])], };
  b && (c.properties.height = this.O(a));
  return c;
};
var G = "#88d0eb #64c6f0 #51beec #29b1ea #0093e4 #0074ab".split(" "), H = "#FFFFFF #ccece6 #95d4ca #76cabd #54c1b1 #39a896 #398c7f".split(" "), I = "#feffca #bfeab3 #6ccfbb #00b9c4 #0080ba #293395".split(" ");
function J(a, b) {
  C.call(this, a, b);
}
z(J, C);
J.prototype.o = function() {
  return C.prototype.o.call(this).then(this.a.L.bind(this.a));
};
J.prototype.P = function() {
  return "fill";
};
J.prototype.A = function(a) {
  return a;
};
function xa(a, b, c) {
  this.b = a;
  this.c = b;
  this.a = c;
}
function ya(a) {
  if (a.a && 2 === a.a.length) {
    var b = a.a[0], c = a.a[1], d = a.c.filter(function(f) {
      f = f.map(function(l) {
        return parseFloat(l);
      });
      return b > f[1] && b < f[3] && c > f[0] && c < f[2];
    });
    if (0 < d.length) {
      return d[0];
    }
  }
  return a.c[0];
}
function K(a) {
  if (a.a && 2 === a.a.length) {
    return a.a;
  }
  a = ya(a).map(function(b) {
    return parseFloat(b);
  });
  return [((a[0] + a[2]) / 2).toFixed(4), ((a[1] + a[3]) / 2).toFixed(4)];
}
;function L() {
  this.g = new Set;
  this.a = {};
  this.b = {};
  this.K = {};
  this.c = {};
  this.l = [];
  this.f = {};
}
function M(a) {
  a.i && Object.keys(a.i).sort();
}
function N(a) {
  if (!a.g.size) {
    return "";
  }
  a = Array.from(a.g).sort();
  return a[a.length - 1];
}
function pa() {
  return fetch("https://covid-19-aggregates.s3.amazonaws.com/location_info.data").then(function(a) {
    return a.text();
  }).then(function(a) {
    a = a.split("\n");
    for (var b = 0; b < a.length; b++) {
      var c = a[b].split(":");
      O[c[0]] = c[1];
    }
  });
}
function oa(a) {
  return new Promise(function(b) {
    fetch("https://covid-19-aggregates.s3.amazonaws.com/regional/index.txt").then(function(c) {
      return c.text();
    }).then(function(c) {
      c = c.split("\n");
      for (var d = 0; d < c.length; d++) {
        var f = c[d].trim();
        f && (a.f[f] || (a.f[f] = !1));
      }
      b();
    }).catch(function(c) {
      console.error(c);
    });
  });
}
function na(a) {
  return Object.keys(a.a).length ? Promise.resolve() : fetch("https://raw.githubusercontent.com/globaldothealth/common/master/countries.data").then(function(b) {
    return b.text();
  }).then(function(b) {
    b = b.trim().split("\n");
    for (var c = 0; c < b.length; c++) {
      for (var d = b[c].split(":"), f = d[1], l = d[2], h = d[4].split("|"), e = [], g = 0; g < h.length; g++) {
        e.push(h[g].split(","));
      }
      d = 6 <= d.length ? JSON.parse(d[5]).map(function(k) {
        return parseFloat(k);
      }) : void 0;
      e = new xa(l, e, d);
      a.a[f] = e;
      a.K[l] = e;
      d = K(e);
      O["" + d[1] + "|" + d[0]] = "||" + f;
    }
  });
}
L.prototype.L = function() {
  if (Object.keys(this.b).length) {
    return Promise.resolve();
  }
  var a = this;
  return fetch("https://raw.githubusercontent.com/globaldothealth/common/master/country_boundaries.json").then(function(b) {
    return b.json();
  }).then(function(b) {
    for (var c = 0; c < b.length; c++) {
      var d = b[c];
      a.b[d.code] = d.geometry;
    }
  });
};
function ma(a, b) {
  return !b && a.l.length ? Promise.resolve() : fetch("https://covid-19-aggregates.s3.amazonaws.com/total/latest.json?nocache=" + (new Date).getTime()).then(function(c) {
    return c.json();
  }).then(function(c) {
    a.l = [parseInt(c.total, 10), parseInt(c.deaths, 10), parseInt(c.total_p1, 10), parseInt(c.total_b1351, 10), c.date];
  });
}
L.prototype.M = function() {
  var a = Object.keys(this.f);
  a.sort();
  return za(this, a[a.length - 1], function() {
  });
};
function za(a, b, c) {
  if (a.f[b]) {
    return console.log("Already have " + b), Promise.resolve();
  }
  b = (new Date).getTime();
  var d = "https://covid-19-aggregates.s3.amazonaws.com/country/latest.json?nocache=" + b;
  d += "?nocache=" + b;
  return new Promise(function(f, l) {
    fetch(d).then(function(h) {
      200 != h.status && l("Bad response status " + h.status + " for " + d);
      return h.json();
    }).then(function(h) {
      h || l("JSON data is empty");
      var e = Object.keys(h);
      h = h[e];
      for (var g = {}, k = 0; k < h.length; k++) {
        var m = h[k], q = m, p = m["long"], v = [];
        v.push(parseFloat(m.lat).toFixed(4));
        v.push(parseFloat(p).toFixed(4));
        q.geoid = v.join("|");
        O[m.geoid] && (q = O[m.geoid].split("|"), p = m.code, p && 2 == p.length || (console.log("Warning: invalid country code: " + p), console.log("From " + q)), g[p] || (g[p] = {total:0, "new":0}), g[p].name = m._id, g[p].geoid = m.geoid, g[p].total = m.casecount, g[p].p1 = m.casecount_p1, g[p].b1351 = m.casecount_b1351, g[p].jhu = m.jhu);
      }
      a.g.add(e);
      a.c[e] = g;
      a.f[e + ".json"] = !0;
      c();
      f();
    });
  });
}
L.prototype.N = function() {
  if (this.v && this.v.length) {
    return console.log("Freshness data already loaded."), Promise.resolve();
  }
  var a = this;
  return fetch("https://covid-19-aggregates.s3.amazonaws.com/regional/latest.json?nocache=" + (new Date).getTime()).then(function(b) {
    return b.json();
  }).then(function(b) {
    a.v = b;
  });
};
function qa(a) {
  return a.i ? Promise.resolve() : fetch("https://covid-19-aggregates.s3.amazonaws.com/total/latest.json?nocache=" + (new Date).getTime()).then(function(b) {
    return b.json();
  }).then(function(b) {
    a.i = {};
    for (var c in b) {
      0 < b[c].length && (a.g.add(c), a.i[c] = b[c]);
    }
  });
}
;function D(a, b, c) {
  this.a = null;
  this.b = b;
  this.g = c;
  this.f = a;
  this.l = "";
  this.i = !0;
}
function Aa(a) {
  a.a.getSource("counts") || a.a.addSource("counts", {type:"geojson", data:F([])});
  if (!a.a.getLayer("totals")) {
    var b = a.a.getStyle().layers;
    for (var c, d = 0; d < b.length; d++) {
      if ("symbol" === b[d].type) {
        c = b[d].id;
        break;
      }
    }
    b = c;
    a.a.addLayer({id:"totals", type:a.b.P(), source:"counts", paint:wa(a.b), }, b);
  }
  Array.from(a.f.g).sort().length && (b = N(a.f), Ba != b && (Ba = b), (b = a.a.getSource("counts")) && b.setData(a.b.B()));
  Ca(a);
}
function sa(a, b) {
  mapboxgl.accessToken = "pk.eyJ1IjoiaGVhbHRobWFwIiwiYSI6ImNrOGl1NGNldTAyYXYzZnBqcnBmN3RjanAifQ.H377pe4LPPcymeZkUBiBtg";
  a.a = (new mapboxgl.Map({container:"map", center:[10, 40], minZoom:1.5, renderWorldCopies:!1, zoom:2.5, })).addControl(new mapboxgl.NavigationControl);
  a.setStyle(b);
  a.a.on("load", function() {
    Aa(a);
    a.b.H() && a.a.easeTo({pitch:0});
    a.g.a.focus && Da(a, a.g.a.focus);
  });
  a.c = new mapboxgl.Popup({closeButton:!1, closeOnClick:!0, maxWidth:"none", });
  Ea(a);
}
function Ca(a) {
  a.a.on("mouseenter", "totals", function() {
    this.getCanvas().style.cursor = "pointer";
  });
  a.a.on("click", "totals", a.v.bind(a));
  a.a.on("mouseleave", "totals", function() {
    this.getCanvas().style.cursor = "";
  });
}
D.prototype.setStyle = function() {
  if ("mapbox://styles/healthmap/cknr3ycvx03i917nw4gk1um66" != this.l || this.i) {
    this.i = !1;
    var a = this;
    this.a.on("styledata", function() {
      Aa(a);
      window.avani = function(b) {
        a.a.easeTo({pitch:b});
      };
      a.b.H() && a.a.easeTo({pitch:0});
    });
    this.a.setStyle("mapbox://styles/healthmap/cknr3ycvx03i917nw4gk1um66");
    this.l = "mapbox://styles/healthmap/cknr3ycvx03i917nw4gk1um66";
  }
};
function Da(a, b) {
  var c = ya(a.f.a[b]);
  a.a.fitBounds([[c[0], c[1]], [c[2], c[3]]]);
  a = a.g;
  a.a.focus = b;
  R(a, a.a);
}
D.prototype.v = function(a) {
  if (a.features.length) {
    var b = a.features[0], c = b.properties.geoid.split("|");
    a = parseFloat(c[1]);
    c = parseFloat(c[0]);
    b = this.b.D(b);
    this.c.setLngLat([c, a]).setDOMContent(b);
    this.c.addTo(this.a);
    var d = this;
    this.c.getElement().onmouseleave = function() {
      d.c.remove();
    };
  }
};
function Ea(a) {
  for (var b = [], c = a.b.s(), d = 0; d < c.length; d++) {
    var f = c[d], l = document.createElement("li"), h = document.createElement("span");
    h.className = "circle";
    h.style.backgroundColor = f[0];
    var e = document.createElement("span");
    e.className = "label";
    e.textContent = f[1];
    l.appendChild(h);
    l.appendChild(e);
    b.push(l);
  }
  if (b.length) {
    for (document.getElementById("legend-header").textContent = a.b.C(), a = document.getElementById("legend").getElementsByTagName("ul")[0], a.innerHTML = "", c = 0; c < b.length; c++) {
      a.appendChild(b[c]);
    }
  }
}
;var Fa = null;
function S() {
  this.b = new L;
  this.f = {};
  this.a = new Ga(this);
  this.c = "";
}
S.prototype.i = function(a) {
  a = a || window.event;
  "escape" == a.code.toLowerCase() && (a = this.a, a.a.fullscreen = !1, R(a, a.a));
};
var O = {}, Ba;
function la(a) {
  a.preventDefault();
  var b = document.getElementById("modal"), c = document.getElementById("modal-wrapper");
  c.classList.add("is-block");
  b.classList.add("is-flex");
  setTimeout(function() {
    c.classList.add("is-visible");
    b.classList.add("is-visible");
  }, 40);
  b.innerHTML = '<span id="modal-cancel">&#10005;</span><div id="modalcontent"><h1>Welcome to Global.health Map!</h1>                                             <p>These geospatial data visualisations allow you to explore our COVID-19 line-list dataset through a few different views:</p>                                             <p><strong>Country View:</strong> Click on a country to see available line-list data in that country, and click \u201cExplore Country Data\u201d to view and download corresponding filtered results of data for that country. You can also use the left-hand navigation to search or select a country. Darker colours indicate more available line-list data. Please see our <a href="https://global.health/faqs/" title="FAQs">FAQs</a> and <a href="https://global.health/acknowledgement/" title="Data Acknowledgments">Data Acknowledgments</a> for more info.)</p>                                             <p><strong>Regional View:</strong> Click on a circle to see available line-list data in that region, and click \u201cExplore Regional Data\u201d to view and download corresponding filtered results of data for that region. Larger, darker circles indicate more available line-list data. Records that do not include regional metadata are labeled as \u201cCountry, Country\u201d (e.g. \u201cIndia, India\u201d). Please see our <a href="https://global.health/faqs/" title="FAQs">FAQs</a> for more info.</p>                                             <p><strong>Coverage Map:</strong> This view illustrates available line-list COVID-19 case data in the Global.health database in a given country as a percentage of total cumulative case data as indicated by the <a href="https://coronavirus.jhu.edu/map.html" title="Johns Hopkins University COVID Resource Center" target="blank" rel="noopener noreferrer">Johns Hopkins University COVID Resource Center</a>. Darker colours indicate more available line-list data. Totals are updated daily. The availability of publically-reported line-list data varies substantially by country. Please see our <a href="https://global.health/faqs/" title="FAQs">FAQs</a> for more info.</p>                                             <p><strong>Variant Reporting:</strong> This view indicates the status of reporting for variant-specific COVID-19 genomic sequencing data in a publicly accessible locally managed resource by country, as indicated by the color-coded legend. Use the navigation module to select a Variant of Concern or Variant of Interest (as <a href="https://www.who.int/en/activities/tracking-SARS-CoV-2-variants/" title="WHO variants definition" target="blank" rel="noopener noreferrer">defined</a> by the WHO). Click on a country to see the latest date checked, number of reported breakthrough infections (if available), and access the Public Source URL. You can also view the live version of the underlying Google Sheet <a href="https://docs.google.com/spreadsheets/d/15-2lbrYHHL0zFYc9kzS7_m6CCV5BkBCUeg9ifTHbRos/edit#gid=0" title="Google spreadsheet containing live variant information" target="blank" rel="noopener noreferrer">here</a>, which the G.h team updates periodically. Please note that Variant Reporting data is currently not included in the line-list database.</p></div>                                             ';
  setTimeout(function() {
    document.getElementById("modal-cancel").onclick = Ha;
    document.querySelector(".modal-backdrop").onclick = Ha;
  }, 0);
  Ia(b);
}
function Ha() {
  var a = document.getElementById("modal"), b = document.getElementById("modal-wrapper");
  b.classList.remove("is-visible");
  a.classList.remove("is-visible");
  setTimeout(function() {
    b.classList.remove("is-block");
    a.classList.add("is-flex");
  }, 400);
}
function Ia(a) {
  function b() {
    document.removeEventListener("mousemove", c);
    document.removeEventListener("mouseup", b);
  }
  function c(e) {
    var g = e.clientX - l;
    a.style.top = a.offsetTop + (e.clientY - h) + "px";
    a.style.left = a.offsetLeft + g + "px";
    l = e.clientX;
    h = e.clientY;
  }
  function d(e) {
    l = e.clientX;
    h = e.clientY;
    "a" !== e.target.tagName.toLowerCase() && (document.addEventListener("mousemove", c), document.addEventListener("mouseup", b));
  }
  var f = f || window.event;
  var l = 0, h = 0;
  a.style.cursor = "move";
  1 === f.which ? a.addEventListener("mousedown", d) : null;
}
function Ja() {
  var a = Fa;
  T(a, new U(a.b, a.a));
  T(a, new V(a.b, a.a));
  T(a, new W(a.b, a.a));
  T(a, new X(a.b, a.a));
  T(a, new Y(a.b, a.a));
  T(a, new Z(a.b, a.a));
  Ka(a.a);
  window.onhashchange = function(b) {
    console.log("Hash change " + b.newURL);
  };
  document.onkeydown = a.i.bind(a);
  window.setTimeout(a.g.bind(a), 6E5);
}
function T(a, b) {
  a.f[b.j()] = b;
  var c = b.j();
  a.a.b[c] = new La(b.u(), c);
}
S.prototype.g = function() {
  console.log("Updating data...");
  ma(this.b, !0).then(function() {
    console.log("Updated latest counts.");
  });
  oa(this.b).then(function() {
    console.log("Updated data index.");
  });
  window.setTimeout(this.g.bind(this), 6E5);
};
"undefined" === typeof globalThis && "undefined" !== typeof global && (globalThis = global);
globalThis.bootstrap = function() {
  Fa = new S;
  Ja();
};
function La(a, b) {
  this.b = a;
  this.a = b;
}
function Ga(a) {
  this.c = a;
  this.b = {};
  this.a = {};
}
Ga.prototype.f = function(a) {
  var b = this.c;
  b.c == a ? console.log("Same view requested again, aborting.") : b.f.hasOwnProperty(a) && (b.c && b.f[b.c].I(), b.c = a, b = b.f[a], console.log("Fetching data for " + b.j()), b.o().then(b.G.bind(b)));
  b = Object.keys(this.b);
  for (var c = 0; c < b.length; c++) {
    var d = this.b[b[c]], f = document.getElementById(d.a);
    d.a == a ? f.classList.add("active") : f.classList.remove("active");
  }
  Ma(this);
  if (a = document.getElementById("more-menu")) {
    a.style.display = "none";
  }
};
function R(a, b) {
  Ma(a);
  for (var c = Object.keys(a.a), d = 0; d < c.length; d++) {
    var f = document.getElementById(c[d]);
    f && (f.checked = a.a[c[d]]);
  }
  a = Object.values(a.c.f);
  for (c = 0; c < a.length; c++) {
    d = a[c], document.body.classList.contains(d.j()) && d.b.setStyle(b.dark);
  }
  a = b.dark;
  document.body.classList.add(a ? "dark" : "light");
  document.body.classList.remove(a ? "light" : "dark");
  b = !!b.fullscreen;
  document.body.classList.toggle("fullscreen", b);
  b && (document.getElementById("settings-menu").style.display = "none");
}
function Na(a) {
  var b = window.location.href, c = window.location.origin + window.location.pathname;
  c.endsWith("/") || (c += "/");
  b = b.substring(c.length).split("/");
  c = "country";
  if (0 < b.length) {
    for (var d = 0; d < b.length; d++) {
      var f = b[d];
      f.startsWith("#") && (f = f.substring(1));
      2 == f.length && f.toUpperCase() == f ? a.a.focus = f : (f = f.toLowerCase(), a.b[f] && (c = f));
    }
  }
  R(a, a.a);
  a.f(c);
}
function Ma(a) {
  var b = window.location.origin + window.location.pathname;
  b.endsWith("/") || (b += "/");
  var c = [a.c.c];
  Object.keys(a.b);
  for (var d = Object.keys(a.a), f = 0; f < d.length; f++) {
    var l = d[f];
    "focus" == l ? c.push(a.a[l]) : a.a[l] && c.push(l);
  }
  window.location.href = b + "#" + c.join("/");
}
function Oa() {
  var a = document.createElement("div");
  a.setAttribute("id", "data");
  var b = document.createElement("a");
  b.setAttribute("href", "https://data.covid-19.global.health");
  b.textContent = "G.h Data";
  a.classList.add("navlink");
  document.getElementById("topbar").appendChild(a);
  document.getElementById("data").appendChild(b);
}
function Ka(a) {
  for (var b = document.getElementById("topbar"), c, d, f = Object.keys(a.b), l = 0; l < f.length; l++) {
    var h = a.b[f[l]], e = void 0;
    e = document.createElement("div");
    e.setAttribute("id", f[l]);
    e.classList.add("navlink");
    e.textContent = h.b;
    e.onclick = a.f.bind(a, h.a);
    6 > l ? b.appendChild(e) : (c || (c = document.createElement("div"), c.setAttribute("id", "more-item"), c.classList.add("navlink"), c.textContent = "More \u25bc", c.onclick = function() {
      var g = document.getElementById("more-menu"), k = "none" != g.style.display, m = g.style, q = document.getElementById("topbar").getClientRects()[0];
      m.top = q.y + q.height + "px";
      g.style.display = k ? "none" : "block";
    }, d = document.createElement("div"), d.setAttribute("id", "more-menu"), d.style.display = "none", b.appendChild(c), b.appendChild(d)), d.appendChild(e));
  }
  Oa();
  Na(a);
}
;function E(a, b, c) {
  this.a = a;
  this.f = b;
  this.g = c;
}
E.prototype.c = function() {
  document.getElementById("sidebar-tab-icon").textContent = document.body.classList.contains("sidebar-hidden") ? "\u25c0" : "\u25b6";
  document.body.classList.toggle("sidebar-hidden");
};
function Pa() {
  for (var a = document.getElementById("location-filter").value.toUpperCase(), b = document.getElementById("location-list").getElementsByTagName("div"), c = document.getElementById("clear-filter"), d = 0; d < b.length; ++d) {
    var f = b[d].getElementsByClassName("label")[0];
    f && (f = f.textContent || f.innerText, c.style.display = a ? "inline-block" : "none", b[d].style.display = -1 != f.toUpperCase().indexOf(a) ? "block" : "none");
  }
}
function Qa() {
  document.getElementById("location-filter").value = "";
  Pa();
}
E.prototype.b = function(a) {
  for (a = a.target; !a.getAttribute("country");) {
    a = a.parentNode;
  }
  (a = a.getAttribute("country")) && Da(this.f.b, a);
};
function ta(a) {
  a.g.innerHTML = '<div id="sidebar-tab"></div><div id="sidebar-header"><h1 id="total" class="sidebar-title total">COVID-19 LINE LIST CASES</h1><br/><div id="disease-selector"></div></div><div id="latest-global"></div><div id="location-filter-wrapper"></div><div id="location-list"></div><div id="ghlist">See all cases <img src="/img/gh_list_logo.svg"><span>Data</span></div>';
  document.getElementById("sidebar").classList.add(window.location.hash);
  var b = document.getElementById("sidebar-tab"), c = document.createElement("span");
  c.setAttribute("id", "sidebar-tab-icon");
  c.textContent = "\u25c0";
  b.appendChild(c);
  b.onclick = a.c;
  Ra(a);
  Sa();
  document.getElementById("total").onclick = function() {
    window.location.href = "/#country";
    window.location.reload();
  };
  document.getElementById("ghlist").onclick = function() {
    window.location.href = "https://data.covid-19.global.health/  ";
  };
}
function Sa() {
  var a = document.getElementById("location-filter-wrapper"), b = document.createElement("input");
  b.setAttribute("id", "location-filter");
  b.setAttribute("placeholder", "Search");
  b.onkeyup = Pa;
  var c = document.createElement("div");
  c.setAttribute("id", "clear-filter");
  c.innerHTML = "&times;";
  c.onclick = Qa;
  a.appendChild(b);
  a.appendChild(c);
}
function Ra(a) {
  document.getElementById("latest-global").innerHTML = '<span id="total-cases" class="active"></span><span id="p1-cases"></span><span id="b1351-cases"></span><span class="reported-cases-label"> cases</span><br/><br /><div class="last-updated-date">Updated: <span id="last-updated-date"></span></div>';
  a = a.a.l;
  document.getElementById("total-cases").innerText = a[0].toLocaleString();
  document.getElementById("p1-cases").innerText = a[2].toLocaleString();
  document.getElementById("b1351-cases").innerText = a[3].toLocaleString();
  a = new Date(new Date);
  a.setDate(a.getDate() - 1);
  document.getElementById("last-updated-date").innerText = a.toDateString();
}
function Ta(a, b) {
  var c = document.createElement("div");
  c.classList.add("country-cases-bar");
  c.style.width = "" + Math.floor(100 * a / b) + "%";
  return c;
}
function ua(a) {
  var b = document.getElementById("location-list"), c = N(a.a), d = a.a.c[c];
  if (!d || 1 > d.length) {
    console.log("No data for rendering country list");
  } else {
    c = Object.keys(d).sort(function(q, p) {
      return d[p].total - d[q].total;
    });
    for (var f = a.a.l, l = 0; l < c.length; l++) {
      var h = c[l];
      if (h && d[h].name) {
        var e = h, g = a.a.a[e];
        if (g) {
          var k = g.b;
          g = K(g).join("|");
          h = parseInt(d[h].total, 10) || 0;
          if (b) {
            O[g] = "||" + e;
            g = document.createElement("div");
            g.classList.add("location-list-item");
            g.classList.add("location-list-total");
            var m = document.createElement("button");
            m.setAttribute("country", e);
            m.onclick = a.b.bind(a);
            m.innerHTML = '<span class="label">' + k + '</span><span class="num">' + h.toLocaleString() + "</span>";
            g.appendChild(m);
            g.appendChild(Ta(h, f[0]));
            b.appendChild(g);
          }
        }
      }
    }
  }
}
;globalThis.countryInit = function() {
};
function Y(a, b) {
  C.call(this, a, b);
}
z(Y, J);
n = Y.prototype;
n.j = function() {
  return "coverage";
};
n.u = function() {
  return "Coverage";
};
n.F = function() {
  return "coverage";
};
n.s = function() {
  return [[G[0], "< 20%", 20], [G[1], "20\u201340%", 40], [G[2], "40-60%", 60], [G[3], "60\u201380%", 80], [G[4], "> 80%"], ];
};
n.B = function() {
  var a = this, b = N(this.a);
  M(this.a);
  b = this.a.c[b];
  var c = [];
  Object.keys(b);
  for (var d in b) {
    var f = d, l = this.a.b[f];
    if (l) {
      var h = b[d].jhu, e = b[d].total, g = this.a.a[f], k = K(g);
      k = [k[1], k[0]].join("|");
      b[f] && (e = b[f].total);
      c.push({type:"Feature", properties:{geoid:k, countryname:g.b, individualtotal:e, aggregatetotal:h, coverage:Math.floor(Math.min(100, e / h * 100)), }, geometry:l, });
    } else {
      console.log("No available boundaries for country " + f);
    }
  }
  return F(c.map(function(m) {
    return a.A(m, !1);
  }));
};
n.D = function(a) {
  a = a.properties;
  var b = document.createElement("div");
  b.innerHTML = '<h2 class="popup-title">' + a.countryname + ": " + a.coverage + "%</h2> <p>(" + a.individualtotal.toLocaleString() + " out of " + a.aggregatetotal.toLocaleString() + ')</p><div class="coverage-container"><div class="coverage-bar" style="height:12px;width:' + a.coverage + '%"></div></div><a class="popup coverage" target="_blank" href="https://data.covid-19.global.health/cases?country=%22' + a.countryname + '%22">Explore Country Data</a>';
  return b;
};
n.C = function() {
  return "Coverage";
};
function U(a, b) {
  C.call(this, a, b);
}
z(U, J);
n = U.prototype;
n.j = function() {
  return "country";
};
n.u = function() {
  return "Country View";
};
n.F = function() {
  return "cum_conf";
};
n.B = function() {
  var a = this, b = N(this.a);
  M(this.a);
  b = this.a.c[b];
  var c = [];
  Object.keys(b);
  for (var d in b) {
    var f = d, l = this.a.b[f];
    if (l) {
      var h = b[d].total, e = b[d].p1, g = b[d].b1351;
      f = this.a.a[f];
      var k = K(f);
      c.push({type:"Feature", properties:{geoid:[k[1], k[0]].join("|"), countryname:f.b, cum_conf:h, variant1:e, variant2:g, }, geometry:l, });
    } else {
      console.log("No available boundaries for country " + f);
    }
  }
  return F(c.map(function(m) {
    return a.A(m, !1);
  }));
};
n.D = function(a) {
  a = a.properties;
  var b = document.createElement("div");
  b.innerHTML = '<h2 class="popup-title">' + a.countryname + "</h2><p class=popup-count><strong>" + a.cum_conf.toLocaleString() + " line list cases</strong><hr/>Variant P.1: " + a.variant1.toLocaleString() + " <br>Variant B.1.351: " + a.variant2.toLocaleString() + '</p><a class="popup" target="_blank" href="https://data.covid-19.global.health/cases?country=%22' + a.countryname + '%22">Explore Country Data</a>';
  return b;
};
n.C = function() {
  return "Line List Cases";
};
n.s = function() {
  return [[G[0], "< 10k", 10000], [G[1], "10k\u2013100k", 100000], [G[2], "100k\u2013500k", 500000], [G[3], "500k\u20132M", 2000000], [G[4], "2M-10M", 10000000], [G[5], "> 10M"]];
};
function V(a, b) {
  C.call(this, a, b);
}
z(V, J);
n = V.prototype;
n.j = function() {
  return "country-p1";
};
n.u = function() {
  return "P1 View";
};
n.F = function() {
  return "variant1";
};
n.B = function() {
  var a = this, b = N(this.a);
  M(this.a);
  b = this.a.c[b];
  var c = [];
  Object.keys(b);
  for (var d in b) {
    var f = d, l = this.a.b[f];
    if (l) {
      var h = b[d].total, e = b[d].p1, g = b[d].b1351;
      f = this.a.a[f];
      var k = K(f);
      c.push({type:"Feature", properties:{geoid:[k[1], k[0]].join("|"), countryname:f.b, cum_conf:h, variant1:e, variant2:g, }, geometry:l, });
    } else {
      console.log("No available boundaries for country " + f);
    }
  }
  return F(c.map(function(m) {
    return a.A(m, !1);
  }));
};
n.D = function(a) {
  a = a.properties;
  var b = document.createElement("div");
  b.innerHTML = '<h2 class="popup-title">' + a.countryname + "</h2><p class=popup-count><strong>" + a.cum_conf.toLocaleString() + " line list cases</strong><hr/>Variant P.1: " + a.variant1.toLocaleString() + " <br>Variant B.1.351: " + a.variant2.toLocaleString() + '</p><a class="popup" target="_blank" href="https://data.covid-19.global.health/cases?country=%22' + a.countryname + '%22">Explore Country Data</a>';
  return b;
};
n.C = function() {
  return "P.1 Cases";
};
n.s = function() {
  return [[H[0], "Not Reported", 1], [H[1], "1\u201350", 50], [H[2], "50\u2013150", 150], [H[3], "150-300", 300], [H[4], "300-500", 500], [H[5], "> 500"]];
};
function W(a, b) {
  C.call(this, a, b);
}
z(W, J);
n = W.prototype;
n.j = function() {
  return "country-b1351";
};
n.u = function() {
  return "B1351 View";
};
n.F = function() {
  return "variant2";
};
n.B = function() {
  var a = this, b = N(this.a);
  M(this.a);
  b = this.a.c[b];
  var c = [];
  Object.keys(b);
  for (var d in b) {
    var f = d, l = this.a.b[f];
    if (l) {
      var h = b[d].total, e = b[d].p1, g = b[d].b1351;
      f = this.a.a[f];
      var k = K(f);
      c.push({type:"Feature", properties:{geoid:[k[1], k[0]].join("|"), countryname:f.b, cum_conf:h, variant1:e, variant2:g, }, geometry:l, });
    } else {
      console.log("No available boundaries for country " + f);
    }
  }
  return F(c.map(function(m) {
    return a.A(m, !1);
  }));
};
n.D = function(a) {
  a = a.properties;
  var b = document.createElement("div");
  b.innerHTML = '<h2 class="popup-title">' + a.countryname + "</h2><p class=popup-count><strong>" + a.cum_conf.toLocaleString() + " line list cases</strong><hr/>Variant P.1: " + a.variant1.toLocaleString() + " <br>Variant B.1.351: " + a.variant2.toLocaleString() + '</p><a class="popup" target="_blank" href="https://data.covid-19.global.health/cases?country=%22' + a.countryname + '%22">Explore Country Data</a>';
  return b;
};
n.C = function() {
  return "B.1.351 Cases";
};
n.s = function() {
  return [[H[0], "Not Reported", 1], [H[1], "1\u201350", 50], [H[2], "50\u2013150", 150], [H[3], "150-300", 300], [H[4], "300-500", 500], [H[5], "> 500"]];
};
function X(a, b) {
  C.call(this, a, b);
}
z(X, C);
n = X.prototype;
n.j = function() {
  return "region";
};
n.u = function() {
  return "Regional View";
};
n.H = function() {
  return !0;
};
n.o = function() {
  var a = this.a;
  return C.prototype.o.call(this).then(a.N.bind(a));
};
n.F = function() {
  return "total";
};
n.O = function(a) {
  return 10000 * Math.log10(10000000 * a.properties.total);
};
n.B = function() {
  var a = this;
  N(this.a);
  var b = this.a.v, c = [], d = Object.keys(b);
  b = b[d];
  for (d = 0; d < b.length; d++) {
    var f = b[d].casecount;
    c.push({properties:{geoid:[b[d].lat, b[d]["long"]].join("|"), total:f, radius:f, region:b[d]._id, region_level:b[d].search, country:b[d].country}});
  }
  return F(c.map(function(l) {
    return a.A(l, !0);
  }));
};
n.D = function(a) {
  a = a.properties;
  var b = a.region, c = a.country, d = document.createElement("div");
  d.innerHTML = '<h2 class="popup-title">' + b + ", " + c + "</h2><p class=popup-count>" + a.total.toLocaleString() + ' cases</p> <a class="popup" target="_blank" href="https://data.covid-19.global.health/cases?country=%22' + c + "%22&" + a.region_level + "=%22" + b + '%22">Explore Regional Data</a>';
  return d;
};
n.C = function() {
  return "Cases";
};
n.s = function() {
  return [[I[0], "< 100", 100], [I[1], "100\u20131k", 1000], [I[2], "1k\u20135k", 5000], [I[3], "5k\u201320k", 20000], [I[4], "20k-100k", 100000], [I[5], "> 100k"]];
};
function Z(a) {
  this.a = a;
}
z(Z, B);
Z.prototype.j = function() {
  return "voc";
};
Z.prototype.u = function() {
  return "Variant Reporting";
};
Z.prototype.G = function() {
  B.prototype.G.call(this);
  document.getElementById("app").innerHTML = "";
  document.getElementById("voc-map-container").classList.remove("hidden");
  ra();
};
Z.prototype.I = function() {
  B.prototype.I.call(this);
  document.getElementById("voc-map-container").classList.add("hidden");
};

