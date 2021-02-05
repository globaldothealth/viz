var n;
function r(a) {
  var b = 0;
  return function() {
    return b < a.length ? {done:!1, value:a[b++], } : {done:!0};
  };
}
function t(a) {
  var b = "undefined" != typeof Symbol && Symbol.iterator && a[Symbol.iterator];
  return b ? b.call(a) : {next:r(a)};
}
var aa = "function" == typeof Object.create ? Object.create : function(a) {
  function b() {
  }
  b.prototype = a;
  return new b;
}, v = "function" == typeof Object.defineProperties ? Object.defineProperty : function(a, b, c) {
  if (a == Array.prototype || a == Object.prototype) {
    return a;
  }
  a[b] = c.value;
  return a;
};
function ba(a) {
  a = ["object" == typeof globalThis && globalThis, a, "object" == typeof window && window, "object" == typeof self && self, "object" == typeof global && global, ];
  for (var b = 0; b < a.length; ++b) {
    var c = a[b];
    if (c && c.Math == Math) {
      return c;
    }
  }
  throw Error("Cannot find global object");
}
var w = ba(this);
function x(a, b) {
  if (b) {
    a: {
      var c = w;
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
      b != d && null != b && v(c, a, {configurable:!0, writable:!0, value:b});
    }
  }
}
var y;
if ("function" == typeof Object.setPrototypeOf) {
  y = Object.setPrototypeOf;
} else {
  var z;
  a: {
    var ca = {S:!0}, A = {};
    try {
      A.__proto__ = ca;
      z = A.S;
      break a;
    } catch (a) {
    }
    z = !1;
  }
  y = z ? function(a, b) {
    a.__proto__ = b;
    if (a.__proto__ !== b) {
      throw new TypeError(a + " is not extensible");
    }
    return a;
  } : null;
}
var B = y;
function C(a, b) {
  a.prototype = aa(b.prototype);
  a.prototype.constructor = a;
  if (B) {
    B(a, b);
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
  a.T = b.prototype;
}
x("Promise", function(a) {
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
  var f = w.setTimeout;
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
    return {resolve:h(this.K), reject:h(this.f)};
  };
  b.prototype.K = function(h) {
    if (h === this) {
      this.f(new TypeError("A Promise cannot resolve to itself"));
    } else {
      if (h instanceof b) {
        this.L(h);
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
        e ? this.J(h) : this.i(h);
      }
    }
  };
  b.prototype.J = function(h) {
    var e = void 0;
    try {
      e = h.then;
    } catch (g) {
      this.f(g);
      return;
    }
    "function" == typeof e ? this.M(e, h) : this.i(h);
  };
  b.prototype.f = function(h) {
    this.j(2, h);
  };
  b.prototype.i = function(h) {
    this.j(1, h);
  };
  b.prototype.j = function(h, e) {
    if (0 != this.b) {
      throw Error("Cannot settle(" + h + ", " + e + "): Promise already settled in state" + this.b);
    }
    this.b = h;
    this.g = e;
    this.s();
  };
  b.prototype.s = function() {
    if (null != this.a) {
      for (var h = 0; h < this.a.length; ++h) {
        l.b(this.a[h]);
      }
      this.a = null;
    }
  };
  var l = new c;
  b.prototype.L = function(h) {
    var e = this.c();
    h.A(e.resolve, e.reject);
  };
  b.prototype.M = function(h, e) {
    var g = this.c();
    try {
      h.call(e, g.resolve, g.reject);
    } catch (k) {
      g.reject(k);
    }
  };
  b.prototype.then = function(h, e) {
    function g(p, u) {
      return "function" == typeof p ? function(K) {
        try {
          k(p(K));
        } catch (L) {
          m(L);
        }
      } : u;
    }
    var k, m, q = new b(function(p, u) {
      k = p;
      m = u;
    });
    this.A(g(h, k), g(e, m));
    return q;
  };
  b.prototype.catch = function(h) {
    return this.then(void 0, h);
  };
  b.prototype.A = function(h, e) {
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
      for (var k = t(h), m = k.next(); !m.done; m = k.next()) {
        d(m.value).A(e, g);
      }
    });
  };
  b.all = function(h) {
    var e = t(h), g = e.next();
    return g.done ? d([]) : new b(function(k, m) {
      function q(K) {
        return function(L) {
          p[K] = L;
          u--;
          0 == u && k(p);
        };
      }
      var p = [], u = 0;
      do {
        p.push(void 0), u++, d(g.value).A(q(p.length - 1), m), g = e.next();
      } while (!g.done);
    });
  };
  return b;
});
x("Symbol", function(a) {
  function b(f) {
    if (this instanceof b) {
      throw new TypeError("Symbol is not a constructor");
    }
    return new c("jscomp_symbol_" + (f || "") + "_" + d++, f);
  }
  function c(f, l) {
    this.a = f;
    v(this, "description", {configurable:!0, writable:!0, value:l});
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
x("Symbol.iterator", function(a) {
  if (a) {
    return a;
  }
  a = Symbol("Symbol.iterator");
  for (var b = "Array Int8Array Uint8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array".split(" "), c = 0; c < b.length; c++) {
    var d = w[b[c]];
    "function" === typeof d && "function" != typeof d.prototype[a] && v(d.prototype, a, {configurable:!0, writable:!0, value:function() {
      return D(r(this));
    }});
  }
  return a;
});
function D(a) {
  a = {next:a};
  a[Symbol.iterator] = function() {
    return this;
  };
  return a;
}
function da(a, b) {
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
x("Array.prototype.keys", function(a) {
  return a ? a : function() {
    return da(this, function(b) {
      return b;
    });
  };
});
function E(a, b) {
  return Object.prototype.hasOwnProperty.call(a, b);
}
x("WeakMap", function(a) {
  function b(g) {
    this.a = (e += Math.random() + 1).toString();
    if (g) {
      g = t(g);
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
    if (!E(g, h)) {
      var k = new c;
      v(g, h, {value:k});
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
    if (!E(g, h)) {
      throw Error("WeakMap key fail: " + g);
    }
    g[h][this.a] = k;
    return this;
  };
  b.prototype.get = function(g) {
    return d(g) && E(g, h) ? g[h][this.a] : void 0;
  };
  b.prototype.has = function(g) {
    return d(g) && E(g, h) && E(g[h], this.a);
  };
  b.prototype.delete = function(g) {
    return d(g) && E(g, h) && E(g[h], this.a) ? delete g[h][this.a] : !1;
  };
  return b;
});
x("Map", function(a) {
  function b() {
    var e = {};
    return e.l = e.next = e.head = e;
  }
  function c(e, g) {
    var k = e.a;
    return D(function() {
      if (k) {
        for (; k.head != e.a;) {
          k = k.l;
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
    if (m && E(e.b, k)) {
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
      e = t(e);
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
      var e = Object.seal({x:4}), g = new a(t([[e, "s"]]));
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
    k.h ? k.h.value = g : (k.h = {next:this.a, l:this.a.l, head:this.a, key:e, value:g, }, k.list.push(k.h), this.a.l.next = k.h, this.a.l = k.h, this.size++);
    return this;
  };
  f.prototype.delete = function(e) {
    e = d(this, e);
    return e.h && e.list ? (e.list.splice(e.index, 1), e.list.length || delete this.b[e.id], e.h.l.next = e.h.next, e.h.next.l = e.h.l, e.h.head = null, this.size--, !0) : !1;
  };
  f.prototype.clear = function() {
    this.b = {};
    this.a = this.a.l = b();
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
x("Set", function(a) {
  function b(c) {
    this.a = new Map;
    if (c) {
      c = t(c);
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
      var c = Object.seal({x:4}), d = new a(t([c]));
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
x("Array.from", function(a) {
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
x("Object.values", function(a) {
  return a ? a : function(b) {
    var c = [], d;
    for (d in b) {
      E(b, d) && c.push(b[d]);
    }
    return c;
  };
});
x("globalThis", function(a) {
  return a || w;
});
function F(a, b, c) {
  if (null == a) {
    throw new TypeError("The 'this' value for String.prototype." + c + " must not be null or undefined");
  }
  if (b instanceof RegExp) {
    throw new TypeError("First argument to String.prototype." + c + " must not be a regular expression");
  }
  return a + "";
}
x("String.prototype.endsWith", function(a) {
  return a ? a : function(b, c) {
    var d = F(this, b, "endsWith");
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
x("String.prototype.startsWith", function(a) {
  return a ? a : function(b, c) {
    var d = F(this, b, "startsWith"), f = d.length, l = b.length;
    c = Math.max(0, Math.min(c | 0, d.length));
    for (var h = 0; h < l && c < f;) {
      if (d[c++] != b[h++]) {
        return !1;
      }
    }
    return h >= l;
  };
});
function G(a) {
  this.a = a;
}
G.prototype.o = function() {
  var a = this.a;
  return Promise.all([H(a, !1), ea(a), fa(a), ha(), ia(a)]);
};
G.prototype.I = function() {
  document.title = "Global.health | a Data Science Initiative";
  console.log('Rendering "' + document.title + '"');
  document.body.classList.add(this.m());
};
G.prototype.N = function() {
  document.body.classList.remove(this.m());
};
function I(a, b) {
  this.a = a;
  this.f = b;
  this.b = new J(this.a, this, this.f);
  this.c = null;
}
C(I, G);
n = I.prototype;
n.v = function() {
  return !1;
};
n.o = function() {
  var a = this.a, b = G.prototype.o.call(this);
  if (!document.getElementById("mapobox-style")) {
    var c = document.createElement("link");
    c.setAttribute("id", "mapobox-style");
    c.setAttribute("href", "https://api.mapbox.com/mapbox-gl-js/v1.11.0/mapbox-gl.css");
    c.setAttribute("rel", "stylesheet");
    document.body.appendChild(c);
  }
  c = new Promise(function(f) {
    b.then(function() {
      return a.L.bind(a)();
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
n.I = function() {
  G.prototype.I.call(this);
  var a = document.getElementById("app");
  a.innerHTML = "";
  var b = document.createElement("div");
  b.setAttribute("id", "sidebar");
  this.c = new M(this.a, this, b);
  var c = document.createElement("div");
  c.setAttribute("id", "map-wrapper");
  c.innerHTML = '<div id="legend"><div id="legend-header"></div><ul class="list-reset"></ul></div><div id="map"></div>';
  a.appendChild(b);
  a.appendChild(c);
  ja(this.b, this.f.a.dark);
  a = this.c;
  a.g.innerHTML = '<div id="sidebar-tab"></div><div id="sidebar-header"><h1 class="sidebar-title">COVID-19</h1><div id="disease-selector"></div></div><div id="latest-global"></div><div id="location-filter-wrapper"></div><div id="location-list"></div><div id="ghlist">See all cases <img src="/img/gh_list_logo.svg"><span>List</span></div>';
  b = document.getElementById("sidebar-tab");
  c = document.createElement("span");
  c.setAttribute("id", "sidebar-tab-icon");
  c.textContent = "\u25c0";
  b.appendChild(c);
  b.onclick = a.c;
  document.getElementById("latest-global").innerHTML = '<span id="total-cases"></span><span class="reported-cases-label">cases</span><br /><div class="last-updated-date">Updated: <span id="last-updated-date"></span></div>';
  document.getElementById("total-cases").innerText = a.a.j[0].toLocaleString();
  a = new Date(new Date);
  a.setDate(a.getDate() - 1);
  document.getElementById("last-updated-date").innerText = a.toDateString();
  a = document.getElementById("location-filter-wrapper");
  b = document.createElement("input");
  b.setAttribute("id", "location-filter");
  b.setAttribute("placeholder", "Search");
  b.onkeyup = ka;
  c = document.createElement("div");
  c.setAttribute("id", "clear-filter");
  c.innerHTML = "&times;";
  c.onclick = la;
  a.appendChild(b);
  a.appendChild(c);
  document.getElementById("ghlist").style.display = "none";
  ma(this.c);
  a = document.createElement("div");
  a.classList.add("logo");
  a.setAttribute("id", "logo");
  a.innerHTML = '<a href="https://test-globalhealth.pantheonsite.io/"><img src="/img/gh_logo.svg" /><span>Map</span></a>';
  document.getElementById("app").appendChild(a);
};
n.N = function() {
  G.prototype.N.call(this);
  this.b.i = !0;
};
n.R = function() {
  return this.v() ? "fill-extrusion" : "circle";
};
n.u = function() {
  return [];
};
n.G = function() {
  return "cum_conf";
};
function na(a) {
  for (var b = ["step", ["get", a.G()]], c = a.u(), d = 0; d < c.length; d++) {
    var f = c[d];
    b.push(f[0]);
    2 < f.length && b.push(f[2]);
  }
  return a.v() ? {"fill-extrusion-height":["get", "height"], "fill-extrusion-color":b, "fill-extrusion-opacity":0.8, } : {"fill-color":b, "fill-outline-color":"#337abc", "fill-opacity":1, };
}
n.P = function() {
  return 0;
};
n.C = function() {
  return N([]);
};
n.F = function() {
  var a = document.createElement("div");
  a.innerHTML = "Default pop-up content";
  return a;
};
n.D = function() {
  return this.H();
};
function N(a) {
  return {type:"FeatureCollection", features:a};
}
n.B = function(a, b) {
  var c = JSON.parse(JSON.stringify(a));
  c.type = "Feature";
  c.properties || (c.properties = {geoid:"0|0"});
  isNaN(c.properties["new"]) && (c.properties["new"] = 0);
  var d = c.properties.geoid.split("|"), f = parseFloat(d[0]);
  d = parseFloat(d[1]);
  var l = [d, f];
  b && (l = [[[d + .15, f + .15], [d - .15, f + .15], [d - .15, f - .15], [d + .15, f - .15], [d + .15, f + .15], ]]);
  c.geometry = {type:"Polygon", coordinates:l, };
  b && (c.properties.height = this.P(a));
  return c;
};
var O = "#c0dbf5 #a8cef1 #2b88dc #0271d5 #0f4f88 #00436b".split(" ");
function P(a, b) {
  I.call(this, a, b);
}
C(P, I);
P.prototype.o = function() {
  return I.prototype.o.call(this).then(this.a.K.bind(this.a));
};
P.prototype.R = function() {
  return "fill";
};
P.prototype.B = function(a) {
  return a;
};
function oa(a, b) {
  this.a = a;
  this.O = b;
}
function Q(a) {
  a = a.O[0].map(function(b) {
    return parseFloat(b);
  });
  return [((a[0] + a[2]) / 2).toFixed(4), ((a[1] + a[3]) / 2).toFixed(4)];
}
;function R() {
  this.c = new Set;
  this.a = {};
  this.g = {};
  this.J = {};
  this.i = {};
  this.j = [];
  this.b = {};
}
function pa(a) {
  a.f && Object.keys(a.f).sort();
}
function S(a) {
  if (!a.c.size) {
    return "";
  }
  a = Array.from(a.c).sort();
  return a[a.length - 1];
}
function ha() {
  return fetch("https://covid-19-aggregates.s3.amazonaws.com/location_info.data").then(function(a) {
    return a.text();
  }).then(function(a) {
    a = a.split("\n");
    for (var b = 0; b < a.length; b++) {
      var c = a[b].split(":");
      T[c[0]] = c[1];
    }
  });
}
function fa(a) {
  return new Promise(function(b) {
    fetch("https://covid-19-aggregates.s3.amazonaws.com/regional/index.txt").then(function(c) {
      return c.text();
    }).then(function(c) {
      c = c.split("\n");
      for (var d = 0; d < c.length; d++) {
        var f = c[d].trim();
        f && (a.b[f] || (a.b[f] = !1));
      }
      b();
    }).catch(function(c) {
      console.error(c);
    });
  });
}
function ea(a) {
  return Object.keys(a.a).length ? Promise.resolve() : fetch("https://raw.githubusercontent.com/globaldothealth/common/master/countries.data").then(function(b) {
    return b.text();
  }).then(function(b) {
    b = b.trim().split("\n");
    for (var c = 0; c < b.length; c++) {
      var d = b[c].split(":"), f = d[1], l = d[2];
      d = d[4].split("|");
      for (var h = [], e = 0; e < d.length; e++) {
        h.push(d[e].split(","));
      }
      d = new oa(l, h);
      a.a[f] = d;
      a.J[l] = d;
      l = Q(d);
      T["" + l[1] + "|" + l[0]] = "||" + f;
    }
  });
}
R.prototype.K = function() {
  if (Object.keys(this.g).length) {
    return Promise.resolve();
  }
  var a = this;
  return fetch("https://raw.githubusercontent.com/globaldothealth/common/master/country_boundaries.json").then(function(b) {
    return b.json();
  }).then(function(b) {
    for (var c = 0; c < b.length; c++) {
      var d = b[c];
      a.g[d.code] = d.geometry;
    }
  });
};
function H(a, b) {
  return !b && a.j.length ? Promise.resolve() : fetch("https://covid-19-aggregates.s3.amazonaws.com/total/latest.json?nocache=" + (new Date).getTime()).then(function(c) {
    return c.json();
  }).then(function(c) {
    a.j = [parseInt(c.total, 10), parseInt(c.deaths, 10), c.date];
  });
}
R.prototype.L = function() {
  var a = Object.keys(this.b);
  a.sort();
  return qa(this, a[a.length - 1], function() {
  });
};
function qa(a, b, c) {
  if (a.b[b]) {
    return console.log("Already have " + b), Promise.resolve();
  }
  var d = "https://covid-19-aggregates.s3.amazonaws.com/country/latest.json";
  d += "?nocache=" + (new Date).getTime();
  return new Promise(function(f, l) {
    fetch(d).then(function(h) {
      200 != h.status && l("Bad response status " + h.status + " for " + d);
      return h.json();
    }).then(function(h) {
      h || l("JSON data is empty");
      var e = Object.keys(h);
      h = h[e];
      for (var g = {}, k = 0; k < h.length; k++) {
        var m = h[k], q = m, p = m["long"], u = [];
        u.push(parseFloat(m.lat).toFixed(4));
        u.push(parseFloat(p).toFixed(4));
        q.geoid = u.join("|");
        T[m.geoid] && (q = T[m.geoid].split("|"), p = q.slice(-1)[0], p && 2 == p.length || (console.log("Warning: invalid country code: " + p), console.log("From " + q)), g[p] || (g[p] = {total:0, "new":0}), g[p].name = m._id, g[p].geoid = m.geoid, g[p].total = m.casecount, g[p].jhu = m.jhu);
      }
      a.c.add(e);
      a.i[e] = g;
      a.b[e + ".json"] = !0;
      c();
      f();
    });
  });
}
R.prototype.M = function() {
  if (this.s && this.s.length) {
    return console.log("Freshness data already loaded."), Promise.resolve();
  }
  var a = this;
  return fetch("https://covid-19-aggregates.s3.amazonaws.com/regional/latest.json?nocache=" + (new Date).getTime()).then(function(b) {
    return b.json();
  }).then(function(b) {
    a.s = b;
  });
};
function ia(a) {
  return a.f ? Promise.resolve() : fetch("https://covid-19-aggregates.s3.amazonaws.com/total/latest.json?nocache=" + (new Date).getTime()).then(function(b) {
    return b.json();
  }).then(function(b) {
    a.f = {};
    for (var c in b) {
      0 < b[c].length && (a.c.add(c), a.f[c] = b[c]);
    }
  });
}
;function J(a, b, c) {
  this.a = null;
  this.b = b;
  this.g = c;
  this.f = a;
  this.j = "";
  this.i = !0;
}
function ra(a) {
  a.a.getSource("counts") || a.a.addSource("counts", {type:"geojson", data:N([])});
  if (!a.a.getLayer("totals")) {
    var b = a.a.getStyle().layers;
    for (var c, d = 0; d < b.length; d++) {
      if ("symbol" === b[d].type) {
        c = b[d].id;
        break;
      }
    }
    b = c;
    a.a.addLayer({id:"totals", type:a.b.R(), source:"counts", paint:na(a.b), }, b);
  }
  Array.from(a.f.c).sort().length && (b = S(a.f), sa != b && (sa = b), (b = a.a.getSource("counts")) && b.setData(a.b.C()));
  ta(a);
}
function ja(a, b) {
  mapboxgl.accessToken = "pk.eyJ1IjoiaGVhbHRobWFwIiwiYSI6ImNrOGl1NGNldTAyYXYzZnBqcnBmN3RjanAifQ.H377pe4LPPcymeZkUBiBtg";
  a.a = (new mapboxgl.Map({container:"map", center:[10, 40], minZoom:1.5, renderWorldCopies:!1, zoom:2.5, })).addControl(new mapboxgl.NavigationControl);
  a.setStyle(b);
  a.a.on("load", function() {
    ra(a);
    a.b.v() && a.a.easeTo({pitch:55});
    a.g.a.focus && ua(a, a.g.a.focus);
  });
  a.c = new mapboxgl.Popup({closeButton:!1, closeOnClick:!0, maxWidth:"none", });
  va(a);
}
function ta(a) {
  a.a.on("mouseenter", "totals", function() {
    this.getCanvas().style.cursor = "pointer";
  });
  a.a.on("click", "totals", a.s.bind(a));
  a.a.on("mouseleave", "totals", function() {
    this.getCanvas().style.cursor = "";
  });
}
J.prototype.setStyle = function(a) {
  a = a ? "mapbox://styles/healthmap/ck7o47dgs1tmb1ilh5b1ro1vn" : "mapbox://styles/healthmap/ckc1y3lbr1upr1jq6pwfcb96k";
  if (this.j != a || this.i) {
    this.i = !1;
    var b = this;
    this.a.on("styledata", function() {
      ra(b);
      window.avani = function(c) {
        b.a.easeTo({pitch:c});
      };
      b.b.v() && b.a.easeTo({pitch:55});
    });
    this.a.setStyle(a);
    this.j = a;
  }
};
function ua(a, b) {
  var c = a.f.a[b].O[0];
  a.a.fitBounds([[c[0], c[1]], [c[2], c[3]]]);
  a = a.g;
  a.a.focus = b;
  U(a, a.a);
}
J.prototype.s = function(a) {
  if (a.features.length) {
    var b = a.features[0], c = b.properties.geoid.split("|");
    a = parseFloat(c[0]);
    c = parseFloat(c[1]);
    b = this.b.F(b);
    this.c.setLngLat([c, a]).setDOMContent(b);
    this.c.addTo(this.a);
    var d = this;
    this.c.getElement().onmouseleave = function() {
      d.c.remove();
    };
  }
};
function va(a) {
  for (var b = [], c = a.b.u(), d = 0; d < c.length; d++) {
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
    for (document.getElementById("legend-header").textContent = a.b.D(), a = document.getElementById("legend").getElementsByTagName("ul")[0], a.innerHTML = "", c = 0; c < b.length; c++) {
      a.appendChild(b[c]);
    }
  }
}
;var wa = null;
function V() {
  this.b = new R;
  this.f = {};
  this.a = new xa(this);
  this.c = "";
}
V.prototype.i = function(a) {
  a = a || window.event;
  "escape" == a.code.toLowerCase() && (a = this.a, a.a.fullscreen = !1, U(a, a.a));
};
var T = {}, sa;
function ya() {
  var a = wa;
  W(a, new X(a.b, a.a));
  W(a, new Y(a.b, a.a));
  W(a, new Z(a.b, a.a));
  za(a.a);
  window.onhashchange = function(b) {
    console.log("Hash change " + b.newURL);
  };
  document.onkeydown = a.i.bind(a);
  window.setTimeout(a.g.bind(a), 6E5);
}
function W(a, b) {
  a.f[b.m()] = b;
  var c = b.m();
  a.a.b[c] = new Aa(b.H(), c);
}
V.prototype.g = function() {
  console.log("Updating data...");
  H(this.b, !0).then(function() {
    console.log("Updated latest counts.");
  });
  fa(this.b).then(function() {
    console.log("Updated data index.");
  });
  window.setTimeout(this.g.bind(this), 6E5);
};
"undefined" === typeof globalThis && "undefined" !== typeof global && (globalThis = global);
globalThis.bootstrap = function() {
  wa = new V;
  ya();
};
function Aa(a, b) {
  this.b = a;
  this.a = b;
}
function xa(a) {
  this.c = a;
  this.b = {};
  this.a = {};
}
xa.prototype.f = function(a) {
  var b = this.c;
  b.c == a ? console.log("Same view requested again, aborting.") : b.f.hasOwnProperty(a) && (b.c && b.f[b.c].N(), b.c = a, b = b.f[a], console.log("Fetching data for " + b.m()), b.o().then(b.I.bind(b)));
  b = Object.keys(this.b);
  for (var c = 0; c < b.length; c++) {
    var d = this.b[b[c]], f = document.getElementById(d.a);
    d.a == a ? f.classList.add("active") : f.classList.remove("active");
  }
  Ba(this);
  if (a = document.getElementById("more-menu")) {
    a.style.display = "none";
  }
};
function U(a, b) {
  Ba(a);
  for (var c = Object.keys(a.a), d = 0; d < c.length; d++) {
    var f = document.getElementById(c[d]);
    f && (f.checked = a.a[c[d]]);
  }
  a = Object.values(a.c.f);
  for (c = 0; c < a.length; c++) {
    d = a[c], document.body.classList.contains(d.m()) && d.b.setStyle(b.dark);
  }
  a = b.dark;
  document.body.classList.add(a ? "dark" : "light");
  document.body.classList.remove(a ? "light" : "dark");
  b = !!b.fullscreen;
  document.body.classList.toggle("fullscreen", b);
  b && (document.getElementById("settings-menu").style.display = "none");
}
function Ca(a) {
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
  U(a, a.a);
  a.f(c);
}
function Ba(a) {
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
function Da() {
  var a = document.createElement("div");
  a.setAttribute("id", "data");
  var b = document.createElement("a");
  b.setAttribute("href", "https://dev-curator.ghdsi.org");
  b.textContent = "G.h Data";
  a.classList.add("navlink");
  document.getElementById("topbar").appendChild(a);
  document.getElementById("data").appendChild(b);
}
function za(a) {
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
  Da();
  Ca(a);
}
;function M(a, b, c) {
  this.a = a;
  this.f = b;
  this.g = c;
}
M.prototype.c = function() {
  document.getElementById("sidebar-tab-icon").textContent = document.body.classList.contains("sidebar-hidden") ? "\u25c0" : "\u25b6";
  document.body.classList.toggle("sidebar-hidden");
};
function ka() {
  for (var a = document.getElementById("location-filter").value.toUpperCase(), b = document.getElementById("location-list").getElementsByTagName("div"), c = document.getElementById("clear-filter"), d = 0; d < b.length; ++d) {
    var f = b[d].getElementsByClassName("label")[0];
    f && (f = f.textContent || f.innerText, c.style.display = a ? "inline-block" : "none", b[d].style.display = -1 != f.toUpperCase().indexOf(a) ? "block" : "none");
  }
}
function la() {
  document.getElementById("location-filter").value = "";
  ka();
}
M.prototype.b = function(a) {
  for (a = a.target; !a.getAttribute("country");) {
    a = a.parentNode;
  }
  (a = a.getAttribute("country")) && ua(this.f.b, a);
};
function Ea(a, b) {
  var c = document.createElement("div");
  c.classList.add("country-cases-bar");
  c.style.width = "" + Math.floor(100 * a / b) + "%";
  return c;
}
function ma(a) {
  var b = document.getElementById("location-list"), c = S(a.a), d = a.a.i[c];
  if (!d || 1 > d.length) {
    console.log("No data for rendering country list");
  } else {
    c = Object.keys(d).sort(function(q, p) {
      return d[p].total - d[q].total;
    });
    for (var f = a.a.j, l = 0; l < c.length; l++) {
      var h = c[l];
      if (h && d[h].name) {
        var e = h, g = a.a.a[e];
        if (g) {
          var k = g.a;
          g = Q(g).join("|");
          h = parseInt(d[h].total, 10) || 0;
          if (b) {
            T[g] = "||" + e;
            g = document.createElement("div");
            g.classList.add("location-list-item");
            var m = document.createElement("button");
            m.setAttribute("country", e);
            m.onclick = a.b.bind(a);
            m.innerHTML = '<span class="label">' + k + '</span><span class="num">' + h.toLocaleString() + "</span>";
            g.appendChild(m);
            g.appendChild(Ea(h, f[0]));
            b.appendChild(g);
          }
        }
      }
    }
  }
}
;globalThis.countryInit = function() {
};
function Z(a, b) {
  I.call(this, a, b);
}
C(Z, P);
n = Z.prototype;
n.m = function() {
  return "coverage";
};
n.H = function() {
  return "Coverage";
};
n.G = function() {
  return "coverage";
};
n.u = function() {
  return [[O[0], "< 20%", 20], [O[1], "20\u201340%", 40], [O[2], "40-60%", 60], [O[3], "60\u201380%", 80], [O[4], "> 80%"], ];
};
n.C = function() {
  var a = this, b = S(this.a);
  pa(this.a);
  b = this.a.i[b];
  var c = [];
  Object.keys(b);
  for (var d in b) {
    var f = d, l = this.a.g[f];
    if (l) {
      var h = b[d].jhu, e = b[d].total, g = this.a.a[f], k = Q(g);
      k = [k[1], k[0]].join("|");
      b[f] && (e = b[f].total);
      c.push({type:"Feature", properties:{geoid:k, countryname:g.a, individualtotal:e, aggregatetotal:h, coverage:Math.floor(Math.min(100, e / h * 100)), }, geometry:l, });
    } else {
      console.log("No available boundaries for country " + f);
    }
  }
  return N(c.map(function(m) {
    return a.B(m, !1);
  }));
};
n.F = function(a) {
  a = a.properties;
  var b = document.createElement("div");
  b.innerHTML = '<h2 class="popup-title">' + a.countryname + ": " + a.coverage + "%</h2> <p>(" + a.individualtotal.toLocaleString() + " out of " + a.aggregatetotal.toLocaleString() + ')</p><div class="coverage-container"><div class="coverage-bar" style="height:12px;width:' + a.coverage + '%"></div></div><a class="popup coverage" target="_blank" href="https://dev-curator.ghdsi.org/cases?country=%22' + a.countryname + '%22">Explore Country Data</a>';
  return b;
};
n.D = function() {
  return "Coverage";
};
function X(a, b) {
  I.call(this, a, b);
}
C(X, P);
n = X.prototype;
n.m = function() {
  return "country";
};
n.H = function() {
  return "Country View";
};
n.G = function() {
  return "cum_conf";
};
n.C = function() {
  var a = this, b = S(this.a);
  pa(this.a);
  b = this.a.i[b];
  var c = [];
  Object.keys(b);
  for (var d in b) {
    var f = d, l = this.a.g[f];
    if (l) {
      var h = b[d].total;
      f = this.a.a[f];
      var e = Q(f);
      c.push({type:"Feature", properties:{geoid:[e[1], e[0]].join("|"), countryname:f.a, cum_conf:h, }, geometry:l, });
    } else {
      console.log("No available boundaries for country " + f);
    }
  }
  return N(c.map(function(g) {
    return a.B(g, !1);
  }));
};
n.F = function(a) {
  a = a.properties;
  var b = document.createElement("div");
  b.innerHTML = '<h2 class="popup-title">' + a.countryname + "</h2><p class=popup-count>" + a.cum_conf.toLocaleString() + ' cases</p><a class="popup" target="_blank" href="https://dev-curator.ghdsi.org/cases?country=%22' + a.countryname + '%22">Explore Country Data</a>';
  return b;
};
n.D = function() {
  return "Cases";
};
n.u = function() {
  return [[O[0], "< 10k", 10000], [O[1], "10k\u2013100k", 100000], [O[2], "100k\u2013500k", 500000], [O[3], "500k\u20132M", 2000000], [O[4], "2M-10M", 10000000], [O[5], "> 10M"]];
};
function Y(a, b) {
  I.call(this, a, b);
}
C(Y, I);
n = Y.prototype;
n.m = function() {
  return "region";
};
n.H = function() {
  return "Regional View";
};
n.v = function() {
  return !0;
};
n.o = function() {
  var a = this.a;
  return I.prototype.o.call(this).then(a.M.bind(a));
};
n.G = function() {
  return "total";
};
n.P = function(a) {
  return 10 * Math.sqrt(100000 * a.properties.total);
};
n.C = function() {
  var a = this;
  S(this.a);
  var b = this.a.s, c = [], d = Object.keys(b);
  b = b[d];
  for (d = 0; d < b.length; d++) {
    c.push({properties:{geoid:[b[d].lat, b[d]["long"]].join("|"), total:b[d].casecount, region:b[d]._id, country:b[d].country}});
  }
  return N(c.map(function(f) {
    return a.B(f, !0);
  }));
};
n.F = function(a) {
  var b = a.properties;
  a = b.region;
  var c = b.country, d = [];
  d.push(a, c);
  b = b.total;
  var f = document.createElement("div");
  console.log("location: ", d);
  f.innerHTML = '<h2 class="popup-title">' + a + ", " + c + "</h2><p class=popup-count>" + b.toLocaleString() + ' cases</p> <a class="popup" target="_blank" href="https://dev-curator.ghdsi.org/cases?country=%22' + c + "%22&admin3=%22" + a + '%22">Explore Regional Data</a>';
  return f;
};
n.D = function() {
  return "Cases";
};
n.u = function() {
  return [[O[0], "< 100", 100], [O[1], "100\u20131k", 1000], [O[2], "1k\u20135k", 5000], [O[3], "5k\u201320k", 20000], [O[4], "20k-100k", 100000], [O[5], "> 100k"]];
};

