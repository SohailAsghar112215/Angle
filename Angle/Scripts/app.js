"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

/**
 * This library was created to emulate some jQuery features
 * used in this template only with Javascript and DOM
 * manipulation functions (IE10+).
 * All methods were designed for an adequate and specific use
 * and don't perform a deep validation on the arguments provided.
 *
 * IMPORTANT:
 * ==========
 * It's suggested NOT to use this library extensively unless you
 * understand what each method does. Instead, use only JS or
 * you might even need jQuery.
 */
(function (global, factory) {
  if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === 'object') {
    // CommonJS-like
    module.exports = factory();
  } else {
    // Browser
    if (typeof global.jQuery === 'undefined') global.$ = factory();
  }
})(window, function () {
  // HELPERS
  function arrayFrom(obj) {
    return 'length' in obj && obj !== window ? [].slice.call(obj) : [obj];
  }

  function _filter(ctx, fn) {
    return [].filter.call(ctx, fn);
  }

  function map(ctx, fn) {
    return [].map.call(ctx, fn);
  }

  function matches(item, selector) {
    return (Element.prototype.matches || Element.prototype.msMatchesSelector).call(item, selector);
  } // Events handler with simple scoped events support


  var EventHandler = function EventHandler() {
    this.events = {};
  };

  EventHandler.prototype = {
    // event accepts: 'click' or 'click.scope'
    bind: function bind(event, listener, target) {
      var type = event.split('.')[0];
      target.addEventListener(type, listener, false);
      this.events[event] = {
        type: type,
        listener: listener
      };
    },
    unbind: function unbind(event, target) {
      if (event in this.events) {
        target.removeEventListener(this.events[event].type, this.events[event].listener, false);
        delete this.events[event];
      }
    }
  }; // Object Definition

  var Wrap = function Wrap(selector) {
    this.selector = selector;
    return this._setup([]);
  }; // CONSTRUCTOR


  Wrap.Constructor = function (param, attrs) {
    var el = new Wrap(param);
    return el.init(attrs);
  }; // Core methods


  Wrap.prototype = {
    constructor: Wrap,

    /**
     * Initialize the object depending on param type
     * [attrs] only to handle $(htmlString, {attributes})
     */
    init: function init(attrs) {
      // empty object
      if (!this.selector) return this; // selector === string

      if (typeof this.selector === 'string') {
        // if looks like markup, try to create an element
        if (this.selector[0] === '<') {
          var elem = this._setup([this._create(this.selector)]);

          return attrs ? elem.attr(attrs) : elem;
        } else return this._setup(arrayFrom(document.querySelectorAll(this.selector)));
      } // selector === DOMElement


      if (this.selector.nodeType) return this._setup([this.selector]);else // shorthand for DOMReady
        if (typeof this.selector === 'function') return this._setup([document]).ready(this.selector); // Array like objects (e.g. NodeList/HTMLCollection)

      return this._setup(arrayFrom(this.selector));
    },

    /**
     * Creates a DOM element from a string
     * Strictly supports the form: '<tag>' or '<tag/>'
     */
    _create: function _create(str) {
      var nodeName = str.substr(str.indexOf('<') + 1, str.indexOf('>') - 1).replace('/', '');
      return document.createElement(nodeName);
    },

    /** setup properties and array to element set */
    _setup: function _setup(elements) {
      var i = 0;

      for (; i < elements.length; i++) {
        delete this[i];
      } // clean up old set


      this.elements = elements;
      this.length = elements.length;

      for (i = 0; i < elements.length; i++) {
        this[i] = elements[i];
      } // new set


      return this;
    },
    _first: function _first(cb, ret) {
      var f = this.elements[0];
      return f ? cb ? cb.call(this, f) : f : ret;
    },

    /** Common function for class manipulation  */
    _classes: function _classes(method, classname) {
      var cls = classname.split(' ');

      if (cls.length > 1) {
        cls.forEach(this._classes.bind(this, method));
      } else {
        if (method === 'contains') {
          var elem = this._first();

          return elem ? elem.classList.contains(classname) : false;
        }

        return classname === '' ? this : this.each(function (i, item) {
          item.classList[method](classname);
        });
      }
    },

    /**
     * Multi purpose function to set or get a (key, value)
     * If no value, works as a getter for the given key
     * key can be an object in the form {key: value, ...}
     */
    _access: function _access(key, value, fn) {
      if (_typeof(key) === 'object') {
        for (var k in key) {
          this._access(k, key[k], fn);
        }
      } else if (value === undefined) {
        return this._first(function (elem) {
          return fn(elem, key);
        });
      }

      return this.each(function (i, item) {
        fn(item, key, value);
      });
    },
    each: function each(fn, arr) {
      arr = arr ? arr : this.elements;

      for (var i = 0; i < arr.length; i++) {
        if (fn.call(arr[i], i, arr[i]) === false) break;
      }

      return this;
    }
  };
  /** Allows to extend with new methods */

  Wrap.extend = function (methods) {
    Object.keys(methods).forEach(function (m) {
      Wrap.prototype[m] = methods[m];
    });
  }; // DOM READY


  Wrap.extend({
    ready: function ready(fn) {
      if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
        fn();
      } else {
        document.addEventListener('DOMContentLoaded', fn);
      }

      return this;
    }
  }); // ACCESS

  Wrap.extend({
    /** Get or set a css value */
    css: function css(key, value) {
      var getStyle = function getStyle(e, k) {
        return e.style[k] || getComputedStyle(e)[k];
      };

      return this._access(key, value, function (item, k, val) {
        var unit = typeof val === 'number' ? 'px' : '';
        return val === undefined ? getStyle(item, k) : item.style[k] = val + unit;
      });
    },

    /** Get an attribute or set it */
    attr: function attr(key, value) {
      return this._access(key, value, function (item, k, val) {
        return val === undefined ? item.getAttribute(k) : item.setAttribute(k, val);
      });
    },

    /** Get a property or set it */
    prop: function prop(key, value) {
      return this._access(key, value, function (item, k, val) {
        return val === undefined ? item[k] : item[k] = val;
      });
    },
    position: function position() {
      return this._first(function (elem) {
        return {
          left: elem.offsetLeft,
          top: elem.offsetTop
        };
      });
    },
    scrollTop: function scrollTop(value) {
      return this._access('scrollTop', value, function (item, k, val) {
        return val === undefined ? item[k] : item[k] = val;
      });
    },
    outerHeight: function outerHeight(includeMargin) {
      return this._first(function (elem) {
        var style = getComputedStyle(elem);
        var margins = includeMargin ? parseInt(style.marginTop, 10) + parseInt(style.marginBottom, 10) : 0;
        return elem.offsetHeight + margins;
      });
    },

    /**
     * Find the position of the first element in the set
     * relative to its sibling elements.
     */
    index: function index() {
      return this._first(function (el) {
        return arrayFrom(el.parentNode.children).indexOf(el);
      }, -1);
    }
  }); // LOOKUP

  Wrap.extend({
    children: function children(selector) {
      var childs = [];
      this.each(function (i, item) {
        childs = childs.concat(map(item.children, function (item) {
          return item;
        }));
      });
      return Wrap.Constructor(childs).filter(selector);
    },
    siblings: function siblings() {
      var sibs = [];
      this.each(function (i, item) {
        sibs = sibs.concat(_filter(item.parentNode.children, function (child) {
          return child !== item;
        }));
      });
      return Wrap.Constructor(sibs);
    },

    /** Return the parent of each element in the current set */
    parent: function parent() {
      var par = map(this.elements, function (item) {
        return item.parentNode;
      });
      return Wrap.Constructor(par);
    },

    /** Return ALL parents of each element in the current set */
    parents: function parents(selector) {
      var par = [];
      this.each(function (i, item) {
        for (var p = item.parentElement; p; p = p.parentElement) {
          par.push(p);
        }
      });
      return Wrap.Constructor(par).filter(selector);
    },

    /**
     * Get the descendants of each element in the set, filtered by a selector
     * Selector can't start with ">" (:scope not supported on IE).
     */
    find: function find(selector) {
      var found = [];
      this.each(function (i, item) {
        found = found.concat(map(item.querySelectorAll(
        /*':scope ' + */
        selector), function (fitem) {
          return fitem;
        }));
      });
      return Wrap.Constructor(found);
    },

    /** filter the actual set based on given selector */
    filter: function filter(selector) {
      if (!selector) return this;

      var res = _filter(this.elements, function (item) {
        return matches(item, selector);
      });

      return Wrap.Constructor(res);
    },

    /** Works only with a string selector */
    is: function is(selector) {
      var found = false;
      this.each(function (i, item) {
        return !(found = matches(item, selector));
      });
      return found;
    }
  }); // ELEMENTS

  Wrap.extend({
    /**
     * append current set to given node
     * expects a dom node or set
     * if element is a set, prepends only the first
     */
    appendTo: function appendTo(elem) {
      elem = elem.nodeType ? elem : elem._first();
      return this.each(function (i, item) {
        elem.appendChild(item);
      });
    },

    /**
     * Append a domNode to each element in the set
     * if element is a set, append only the first
     */
    append: function append(elem) {
      elem = elem.nodeType ? elem : elem._first();
      return this.each(function (i, item) {
        item.appendChild(elem);
      });
    },

    /**
     * Insert the current set of elements after the element
     * that matches the given selector in param
     */
    insertAfter: function insertAfter(selector) {
      var target = document.querySelector(selector);
      return this.each(function (i, item) {
        target.parentNode.insertBefore(item, target.nextSibling);
      });
    },

    /**
     * Clones all element in the set
     * returns a new set with the cloned elements
     */
    clone: function clone() {
      var clones = map(this.elements, function (item) {
        return item.cloneNode(true);
      });
      return Wrap.Constructor(clones);
    },

    /** Remove all node in the set from DOM. */
    remove: function remove() {
      this.each(function (i, item) {
        delete item.events;
        delete item.data;
        if (item.parentNode) item.parentNode.removeChild(item);
      });

      this._setup([]);
    }
  }); // DATASETS

  Wrap.extend({
    /**
     * Expected key in camelCase format
     * if value provided save data into element set
     * if not, return data for the first element
     */
    data: function data(key, value) {
      var hasJSON = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,
          dataAttr = 'data-' + key.replace(/[A-Z]/g, '-$&').toLowerCase();

      if (value === undefined) {
        return this._first(function (el) {
          if (el.data && el.data[key]) return el.data[key];else {
            var data = el.getAttribute(dataAttr);
            if (data === 'true') return true;
            if (data === 'false') return false;
            if (data === +data + '') return +data;
            if (hasJSON.test(data)) return JSON.parse(data);
            return data;
          }
        });
      } else {
        return this.each(function (i, item) {
          item.data = item.data || {};
          item.data[key] = value;
        });
      }
    }
  }); // EVENTS

  Wrap.extend({
    trigger: function trigger(type) {
      type = type.split('.')[0]; // ignore namespace

      var event = document.createEvent('HTMLEvents');
      event.initEvent(type, true, false);
      return this.each(function (i, item) {
        item.dispatchEvent(event);
      });
    },
    blur: function blur() {
      return this.trigger('blur');
    },
    focus: function focus() {
      return this.trigger('focus');
    },
    on: function on(event, callback) {
      return this.each(function (i, item) {
        if (!item.events) item.events = new EventHandler();
        event.split(' ').forEach(function (ev) {
          item.events.bind(ev, callback, item);
        });
      });
    },
    off: function off(event) {
      return this.each(function (i, item) {
        if (item.events) {
          item.events.unbind(event, item);
          delete item.events;
        }
      });
    }
  }); // CLASSES

  Wrap.extend({
    toggleClass: function toggleClass(classname) {
      return this._classes('toggle', classname);
    },
    addClass: function addClass(classname) {
      return this._classes('add', classname);
    },
    removeClass: function removeClass(classname) {
      return this._classes('remove', classname);
    },
    hasClass: function hasClass(classname) {
      return this._classes('contains', classname);
    }
  });
  /**
   * Some basic features in this template relies on Bootstrap
   * plugins, like Collapse, Dropdown and Tab.
   * Below code emulates plugins behavior by toggling classes
   * from elements to allow a minimum interaction without animation.
   * - Only Collapse is required which is used by the sidebar.
   * - Tab and Dropdown are optional features.
   */
  // Emulate jQuery symbol to simplify usage

  var $ = Wrap.Constructor; // Emulates Collapse plugin

  Wrap.extend({
    collapse: function collapse(action) {
      return this.each(function (i, item) {
        var $item = $(item).trigger(action + '.bs.collapse');
        if (action === 'toggle') $item.collapse($item.hasClass('show') ? 'hide' : 'show');else $item[action === 'show' ? 'addClass' : 'removeClass']('show');
      });
    }
  }); // Initializations

  $('[data-toggle]').on('click', function (e) {
    var target = $(e.currentTarget);
    if (target.is('a')) e.preventDefault();

    switch (target.data('toggle')) {
      case 'collapse':
        $(target.attr('href')).collapse('toggle');
        break;

      case 'tab':
        target.parent().parent().find('.active').removeClass('active');
        target.addClass('active');
        var tabPane = $(target.attr('href'));
        tabPane.siblings().removeClass('active show');
        tabPane.addClass('active show');
        break;

      case 'dropdown':
        var dd = target.parent().toggleClass('show');
        dd.find('.dropdown-menu').toggleClass('show');
        break;

      default:
        break;
    }
  });
  return Wrap.Constructor;
});
/*!
 *
 * Angle - Bootstrap Admin Template
 *
 * Version: 4.7.1
 * Author: @themicon_co
 * Website: http://themicon.co
 * License: https://wrapbootstrap.com/help/licenses
 *
 */


(function () {
  'use strict';

  $(function () {
    // Restore body classes
    // -----------------------------------
    var $body = $('body');
    new StateToggler().restoreState($body); // enable settings toggle after restore

    $('#chk-fixed').prop('checked', $body.hasClass('layout-fixed'));
    $('#chk-collapsed').prop('checked', $body.hasClass('aside-collapsed'));
    $('#chk-collapsed-text').prop('checked', $body.hasClass('aside-collapsed-text'));
    $('#chk-boxed').prop('checked', $body.hasClass('layout-boxed'));
    $('#chk-float').prop('checked', $body.hasClass('aside-float'));
    $('#chk-hover').prop('checked', $body.hasClass('aside-hover')); // When ready display the offsidebar

    $('.offsidebar.d-none').removeClass('d-none');
  }); // doc ready
})(); // Knob chart
// -----------------------------------


(function () {
  'use strict';

  $(initKnob);

  function initKnob() {
    if (!$.fn.knob) return;
    var knobLoaderOptions1 = {
      width: '50%',
      // responsive
      displayInput: true,
      fgColor: APP_COLORS['info']
    };
    $('#knob-chart1').knob(knobLoaderOptions1);
    var knobLoaderOptions2 = {
      width: '50%',
      // responsive
      displayInput: true,
      fgColor: APP_COLORS['purple'],
      readOnly: true
    };
    $('#knob-chart2').knob(knobLoaderOptions2);
    var knobLoaderOptions3 = {
      width: '50%',
      // responsive
      displayInput: true,
      fgColor: APP_COLORS['info'],
      bgColor: APP_COLORS['gray'],
      angleOffset: -125,
      angleArc: 250
    };
    $('#knob-chart3').knob(knobLoaderOptions3);
    var knobLoaderOptions4 = {
      width: '50%',
      // responsive
      displayInput: true,
      fgColor: APP_COLORS['pink'],
      displayPrevious: true,
      thickness: 0.1,
      lineCap: 'round'
    };
    $('#knob-chart4').knob(knobLoaderOptions4);
  }
})(); // Chart JS
// -----------------------------------


(function () {
  'use strict';

  $(initChartJS);

  function initChartJS() {
    if (typeof Chart === 'undefined') return; // random values for demo

    var rFactor = function rFactor() {
      return Math.round(Math.random() * 100);
    }; // Line chart
    // -----------------------------------


    var lineData = {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [{
        label: 'My First dataset',
        backgroundColor: 'rgba(114,102,186,0.2)',
        borderColor: 'rgba(114,102,186,1)',
        pointBorderColor: '#fff',
        data: [rFactor(), rFactor(), rFactor(), rFactor(), rFactor(), rFactor(), rFactor()]
      }, {
        label: 'My Second dataset',
        backgroundColor: 'rgba(35,183,229,0.2)',
        borderColor: 'rgba(35,183,229,1)',
        pointBorderColor: '#fff',
        data: [rFactor(), rFactor(), rFactor(), rFactor(), rFactor(), rFactor(), rFactor()]
      }]
    };
    var lineOptions = {
      legend: {
        display: false
      }
    };
    var linectx = document.getElementById('chartjs-linechart').getContext('2d');
    var lineChart = new Chart(linectx, {
      data: lineData,
      type: 'line',
      options: lineOptions
    }); // Bar chart
    // -----------------------------------

    var barData = {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
      datasets: [{
        backgroundColor: '#23b7e5',
        borderColor: '#23b7e5',
        data: [rFactor(), rFactor(), rFactor(), rFactor(), rFactor(), rFactor(), rFactor()]
      }, {
        backgroundColor: '#5d9cec',
        borderColor: '#5d9cec',
        data: [rFactor(), rFactor(), rFactor(), rFactor(), rFactor(), rFactor(), rFactor()]
      }]
    };
    var barOptions = {
      legend: {
        display: false
      }
    };
    var barctx = document.getElementById('chartjs-barchart').getContext('2d');
    var barChart = new Chart(barctx, {
      data: barData,
      type: 'bar',
      options: barOptions
    }); //  Doughnut chart
    // -----------------------------------

    var doughnutData = {
      labels: ['Purple', 'Yellow', 'Blue'],
      datasets: [{
        data: [300, 50, 100],
        backgroundColor: ['#7266ba', '#fad732', '#23b7e5'],
        hoverBackgroundColor: ['#7266ba', '#fad732', '#23b7e5']
      }]
    };
    var doughnutOptions = {
      legend: {
        display: false
      }
    };
    var doughnutctx = document.getElementById('chartjs-doughnutchart').getContext('2d');
    var doughnutChart = new Chart(doughnutctx, {
      data: doughnutData,
      type: 'doughnut',
      options: doughnutOptions
    }); // Pie chart
    // -----------------------------------

    var pieData = {
      labels: ['Purple', 'Yellow', 'Blue'],
      datasets: [{
        data: [300, 50, 100],
        backgroundColor: ['#7266ba', '#fad732', '#23b7e5'],
        hoverBackgroundColor: ['#7266ba', '#fad732', '#23b7e5']
      }]
    };
    var pieOptions = {
      legend: {
        display: false
      }
    };
    var piectx = document.getElementById('chartjs-piechart').getContext('2d');
    var pieChart = new Chart(piectx, {
      data: pieData,
      type: 'pie',
      options: pieOptions
    }); // Polar chart
    // -----------------------------------

    var polarData = {
      datasets: [{
        data: [11, 16, 7, 3],
        backgroundColor: ['#f532e5', '#7266ba', '#f532e5', '#7266ba'],
        label: 'My dataset' // for legend

      }],
      labels: ['Label 1', 'Label 2', 'Label 3', 'Label 4']
    };
    var polarOptions = {
      legend: {
        display: false
      }
    };
    var polarctx = document.getElementById('chartjs-polarchart').getContext('2d');
    var polarChart = new Chart(polarctx, {
      data: polarData,
      type: 'polarArea',
      options: polarOptions
    }); // Radar chart
    // -----------------------------------

    var radarData = {
      labels: ['Eating', 'Drinking', 'Sleeping', 'Designing', 'Coding', 'Cycling', 'Running'],
      datasets: [{
        label: 'My First dataset',
        backgroundColor: 'rgba(114,102,186,0.2)',
        borderColor: 'rgba(114,102,186,1)',
        data: [65, 59, 90, 81, 56, 55, 40]
      }, {
        label: 'My Second dataset',
        backgroundColor: 'rgba(151,187,205,0.2)',
        borderColor: 'rgba(151,187,205,1)',
        data: [28, 48, 40, 19, 96, 27, 100]
      }]
    };
    var radarOptions = {
      legend: {
        display: false
      }
    };
    var radarctx = document.getElementById('chartjs-radarchart').getContext('2d');
    var radarChart = new Chart(radarctx, {
      data: radarData,
      type: 'radar',
      options: radarOptions
    });
  }
})(); // Chartist
// -----------------------------------


(function () {
  'use strict';

  $(initChartists);

  function initChartists() {
    if (typeof Chartist === 'undefined') return; // Bar bipolar
    // -----------------------------------

    var data1 = {
      labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10'],
      series: [[1, 2, 4, 8, 6, -2, -1, -4, -6, -2]]
    };
    var options1 = {
      high: 10,
      low: -10,
      height: 280,
      axisX: {
        labelInterpolationFnc: function labelInterpolationFnc(value, index) {
          return index % 2 === 0 ? value : null;
        }
      }
    };
    new Chartist.Bar('#ct-bar1', data1, options1); // Bar Horizontal
    // -----------------------------------

    new Chartist.Bar('#ct-bar2', {
      labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      series: [[5, 4, 3, 7, 5, 10, 3], [3, 2, 9, 5, 4, 6, 4]]
    }, {
      seriesBarDistance: 10,
      reverseData: true,
      horizontalBars: true,
      height: 280,
      axisY: {
        offset: 70
      }
    }); // Line
    // -----------------------------------

    new Chartist.Line('#ct-line1', {
      labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      series: [[12, 9, 7, 8, 5], [2, 1, 3.5, 7, 3], [1, 3, 4, 5, 6]]
    }, {
      fullWidth: true,
      height: 280,
      chartPadding: {
        right: 40
      }
    }); // SVG Animation
    // -----------------------------------

    var chart1 = new Chartist.Line('#ct-line3', {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      series: [[1, 5, 2, 5, 4, 3], [2, 3, 4, 8, 1, 2], [5, 4, 3, 2, 1, 0.5]]
    }, {
      low: 0,
      showArea: true,
      showPoint: false,
      fullWidth: true,
      height: 300
    });
    chart1.on('draw', function (data) {
      if (data.type === 'line' || data.type === 'area') {
        data.element.animate({
          d: {
            begin: 2000 * data.index,
            dur: 2000,
            from: data.path.clone().scale(1, 0).translate(0, data.chartRect.height()).stringify(),
            to: data.path.clone().stringify(),
            easing: Chartist.Svg.Easing.easeOutQuint
          }
        });
      }
    }); // Slim animation
    // -----------------------------------

    var chart = new Chartist.Line('#ct-line2', {
      labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      series: [[12, 9, 7, 8, 5, 4, 6, 2, 3, 3, 4, 6], [4, 5, 3, 7, 3, 5, 5, 3, 4, 4, 5, 5], [5, 3, 4, 5, 6, 3, 3, 4, 5, 6, 3, 4], [3, 4, 5, 6, 7, 6, 4, 5, 6, 7, 6, 3]]
    }, {
      low: 0,
      height: 300
    }); // Let's put a sequence number aside so we can use it in the event callbacks

    var seq = 0,
        delays = 80,
        durations = 500; // Once the chart is fully created we reset the sequence

    chart.on('created', function () {
      seq = 0;
    }); // On each drawn element by Chartist we use the Chartist.Svg API to trigger SMIL animations

    chart.on('draw', function (data) {
      seq++;

      if (data.type === 'line') {
        // If the drawn element is a line we do a simple opacity fade in. This could also be achieved using CSS3 animations.
        data.element.animate({
          opacity: {
            // The delay when we like to start the animation
            begin: seq * delays + 1000,
            // Duration of the animation
            dur: durations,
            // The value where the animation should start
            from: 0,
            // The value where it should end
            to: 1
          }
        });
      } else if (data.type === 'label' && data.axis === 'x') {
        data.element.animate({
          y: {
            begin: seq * delays,
            dur: durations,
            from: data.y + 100,
            to: data.y,
            // We can specify an easing function from Chartist.Svg.Easing
            easing: 'easeOutQuart'
          }
        });
      } else if (data.type === 'label' && data.axis === 'y') {
        data.element.animate({
          x: {
            begin: seq * delays,
            dur: durations,
            from: data.x - 100,
            to: data.x,
            easing: 'easeOutQuart'
          }
        });
      } else if (data.type === 'point') {
        data.element.animate({
          x1: {
            begin: seq * delays,
            dur: durations,
            from: data.x - 10,
            to: data.x,
            easing: 'easeOutQuart'
          },
          x2: {
            begin: seq * delays,
            dur: durations,
            from: data.x - 10,
            to: data.x,
            easing: 'easeOutQuart'
          },
          opacity: {
            begin: seq * delays,
            dur: durations,
            from: 0,
            to: 1,
            easing: 'easeOutQuart'
          }
        });
      } else if (data.type === 'grid') {
        // Using data.axis we get x or y which we can use to construct our animation definition objects
        var pos1Animation = {
          begin: seq * delays,
          dur: durations,
          from: data[data.axis.units.pos + '1'] - 30,
          to: data[data.axis.units.pos + '1'],
          easing: 'easeOutQuart'
        };
        var pos2Animation = {
          begin: seq * delays,
          dur: durations,
          from: data[data.axis.units.pos + '2'] - 100,
          to: data[data.axis.units.pos + '2'],
          easing: 'easeOutQuart'
        };
        var animations = {};
        animations[data.axis.units.pos + '1'] = pos1Animation;
        animations[data.axis.units.pos + '2'] = pos2Animation;
        animations['opacity'] = {
          begin: seq * delays,
          dur: durations,
          from: 0,
          to: 1,
          easing: 'easeOutQuart'
        };
        data.element.animate(animations);
      }
    }); // For the sake of the example we update the chart every time it's created with a delay of 10 seconds

    chart.on('created', function () {
      if (window.__exampleAnimateTimeout) {
        clearTimeout(window.__exampleAnimateTimeout);
        window.__exampleAnimateTimeout = null;
      }

      window.__exampleAnimateTimeout = setTimeout(chart.update.bind(chart), 12000);
    });
  }
})(); // Easypie chart Loader
// -----------------------------------


(function () {
  'use strict';

  $(initEasyPieChart);

  function initEasyPieChart() {
    if (!$.fn.easyPieChart) return; // Usage via data attributes
    // <div class="easypie-chart" data-easypiechart data-percent="X" data-optionName="value"></div>

    $('[data-easypiechart]').each(function () {
      var $elem = $(this);
      var options = $elem.data();
      $elem.easyPieChart(options || {});
    }); // programmatic usage

    var pieOptions1 = {
      animate: {
        duration: 800,
        enabled: true
      },
      barColor: APP_COLORS['success'],
      trackColor: false,
      scaleColor: false,
      lineWidth: 10,
      lineCap: 'circle'
    };
    $('#easypie1').easyPieChart(pieOptions1);
    var pieOptions2 = {
      animate: {
        duration: 800,
        enabled: true
      },
      barColor: APP_COLORS['warning'],
      trackColor: false,
      scaleColor: false,
      lineWidth: 4,
      lineCap: 'circle'
    };
    $('#easypie2').easyPieChart(pieOptions2);
    var pieOptions3 = {
      animate: {
        duration: 800,
        enabled: true
      },
      barColor: APP_COLORS['danger'],
      trackColor: false,
      scaleColor: APP_COLORS['gray'],
      lineWidth: 15,
      lineCap: 'circle'
    };
    $('#easypie3').easyPieChart(pieOptions3);
    var pieOptions4 = {
      animate: {
        duration: 800,
        enabled: true
      },
      barColor: APP_COLORS['danger'],
      trackColor: APP_COLORS['yellow'],
      scaleColor: APP_COLORS['gray-dark'],
      lineWidth: 15,
      lineCap: 'circle'
    };
    $('#easypie4').easyPieChart(pieOptions4);
  }
})(); // CHART SPLINE
// -----------------------------------


(function () {
  'use strict';

  $(initFlotSpline);

  function initFlotSpline() {
    var data = [{
      "label": "Uniques",
      "color": "#768294",
      "data": [["Mar", 70], ["Apr", 85], ["May", 59], ["Jun", 93], ["Jul", 66], ["Aug", 86], ["Sep", 60]]
    }, {
      "label": "Recurrent",
      "color": "#1f92fe",
      "data": [["Mar", 21], ["Apr", 12], ["May", 27], ["Jun", 24], ["Jul", 16], ["Aug", 39], ["Sep", 15]]
    }];
    var datav2 = [{
      "label": "Hours",
      "color": "#23b7e5",
      "data": [["Jan", 70], ["Feb", 20], ["Mar", 70], ["Apr", 85], ["May", 59], ["Jun", 93], ["Jul", 66], ["Aug", 86], ["Sep", 60], ["Oct", 60], ["Nov", 12], ["Dec", 50]]
    }, {
      "label": "Commits",
      "color": "#7266ba",
      "data": [["Jan", 20], ["Feb", 70], ["Mar", 30], ["Apr", 50], ["May", 85], ["Jun", 43], ["Jul", 96], ["Aug", 36], ["Sep", 80], ["Oct", 10], ["Nov", 72], ["Dec", 31]]
    }];
    var datav3 = [{
      "label": "Home",
      "color": "#1ba3cd",
      "data": [["1", 38], ["2", 40], ["3", 42], ["4", 48], ["5", 50], ["6", 70], ["7", 145], ["8", 70], ["9", 59], ["10", 48], ["11", 38], ["12", 29], ["13", 30], ["14", 22], ["15", 28]]
    }, {
      "label": "Overall",
      "color": "#3a3f51",
      "data": [["1", 16], ["2", 18], ["3", 17], ["4", 16], ["5", 30], ["6", 110], ["7", 19], ["8", 18], ["9", 110], ["10", 19], ["11", 16], ["12", 10], ["13", 20], ["14", 10], ["15", 20]]
    }];
    var options = {
      series: {
        lines: {
          show: false
        },
        points: {
          show: true,
          radius: 4
        },
        splines: {
          show: true,
          tension: 0.4,
          lineWidth: 1,
          fill: 0.5
        }
      },
      grid: {
        borderColor: '#eee',
        borderWidth: 1,
        hoverable: true,
        backgroundColor: '#fcfcfc'
      },
      tooltip: true,
      tooltipOpts: {
        content: function content(label, x, y) {
          return x + ' : ' + y;
        }
      },
      xaxis: {
        tickColor: '#fcfcfc',
        mode: 'categories'
      },
      yaxis: {
        min: 0,
        max: 150,
        // optional: use it for a clear represetation
        tickColor: '#eee',
        //position: 'right' or 'left',
        tickFormatter: function tickFormatter(v) {
          return v
          /* + ' visitors'*/
          ;
        }
      },
      shadowSize: 0
    };
    var chart = $('.chart-spline');
    if (chart.length) $.plot(chart, data, options);
    var chartv2 = $('.chart-splinev2');
    if (chartv2.length) $.plot(chartv2, datav2, options);
    var chartv3 = $('.chart-splinev3');
    if (chartv3.length) $.plot(chartv3, datav3, options);
  }
})(); // CHART AREA
// -----------------------------------


(function () {
  'use strict';

  $(initFlotArea);

  function initFlotArea() {
    var data = [{
      "label": "Uniques",
      "color": "#aad874",
      "data": [["Mar", 50], ["Apr", 84], ["May", 52], ["Jun", 88], ["Jul", 69], ["Aug", 92], ["Sep", 58]]
    }, {
      "label": "Recurrent",
      "color": "#7dc7df",
      "data": [["Mar", 13], ["Apr", 44], ["May", 44], ["Jun", 27], ["Jul", 38], ["Aug", 11], ["Sep", 39]]
    }];
    var options = {
      series: {
        lines: {
          show: true,
          fill: 0.8
        },
        points: {
          show: true,
          radius: 4
        }
      },
      grid: {
        borderColor: '#eee',
        borderWidth: 1,
        hoverable: true,
        backgroundColor: '#fcfcfc'
      },
      tooltip: true,
      tooltipOpts: {
        content: function content(label, x, y) {
          return x + ' : ' + y;
        }
      },
      xaxis: {
        tickColor: '#fcfcfc',
        mode: 'categories'
      },
      yaxis: {
        min: 0,
        tickColor: '#eee',
        // position: 'right' or 'left'
        tickFormatter: function tickFormatter(v) {
          return v + ' visitors';
        }
      },
      shadowSize: 0
    };
    var chart = $('.chart-area');
    if (chart.length) $.plot(chart, data, options);
  }
})(); // CHART BAR
// -----------------------------------


(function () {
  'use strict';

  $(initFlotBar);

  function initFlotBar() {
    var data = [{
      "label": "Sales",
      "color": "#9cd159",
      "data": [["Jan", 27], ["Feb", 82], ["Mar", 56], ["Apr", 14], ["May", 28], ["Jun", 77], ["Jul", 23], ["Aug", 49], ["Sep", 81], ["Oct", 20]]
    }];
    var options = {
      series: {
        bars: {
          align: 'center',
          lineWidth: 0,
          show: true,
          barWidth: 0.6,
          fill: 0.9
        }
      },
      grid: {
        borderColor: '#eee',
        borderWidth: 1,
        hoverable: true,
        backgroundColor: '#fcfcfc'
      },
      tooltip: true,
      tooltipOpts: {
        content: function content(label, x, y) {
          return x + ' : ' + y;
        }
      },
      xaxis: {
        tickColor: '#fcfcfc',
        mode: 'categories'
      },
      yaxis: {
        // position: 'right' or 'left'
        tickColor: '#eee'
      },
      shadowSize: 0
    };
    var chart = $('.chart-bar');
    if (chart.length) $.plot(chart, data, options);
  }
})(); // CHART BAR STACKED
// -----------------------------------


(function () {
  'use strict';

  $(initFlotBarStacked);

  function initFlotBarStacked() {
    var data = [{
      "label": "Tweets",
      "color": "#51bff2",
      "data": [["Jan", 56], ["Feb", 81], ["Mar", 97], ["Apr", 44], ["May", 24], ["Jun", 85], ["Jul", 94], ["Aug", 78], ["Sep", 52], ["Oct", 17], ["Nov", 90], ["Dec", 62]]
    }, {
      "label": "Likes",
      "color": "#4a8ef1",
      "data": [["Jan", 69], ["Feb", 135], ["Mar", 14], ["Apr", 100], ["May", 100], ["Jun", 62], ["Jul", 115], ["Aug", 22], ["Sep", 104], ["Oct", 132], ["Nov", 72], ["Dec", 61]]
    }, {
      "label": "+1",
      "color": "#f0693a",
      "data": [["Jan", 29], ["Feb", 36], ["Mar", 47], ["Apr", 21], ["May", 5], ["Jun", 49], ["Jul", 37], ["Aug", 44], ["Sep", 28], ["Oct", 9], ["Nov", 12], ["Dec", 35]]
    }];
    var datav2 = [{
      "label": "Pending",
      "color": "#9289ca",
      "data": [["Pj1", 86], ["Pj2", 136], ["Pj3", 97], ["Pj4", 110], ["Pj5", 62], ["Pj6", 85], ["Pj7", 115], ["Pj8", 78], ["Pj9", 104], ["Pj10", 82], ["Pj11", 97], ["Pj12", 110], ["Pj13", 62]]
    }, {
      "label": "Assigned",
      "color": "#7266ba",
      "data": [["Pj1", 49], ["Pj2", 81], ["Pj3", 47], ["Pj4", 44], ["Pj5", 100], ["Pj6", 49], ["Pj7", 94], ["Pj8", 44], ["Pj9", 52], ["Pj10", 17], ["Pj11", 47], ["Pj12", 44], ["Pj13", 100]]
    }, {
      "label": "Completed",
      "color": "#564aa3",
      "data": [["Pj1", 29], ["Pj2", 56], ["Pj3", 14], ["Pj4", 21], ["Pj5", 5], ["Pj6", 24], ["Pj7", 37], ["Pj8", 22], ["Pj9", 28], ["Pj10", 9], ["Pj11", 14], ["Pj12", 21], ["Pj13", 5]]
    }];
    var options = {
      series: {
        stack: true,
        bars: {
          align: 'center',
          lineWidth: 0,
          show: true,
          barWidth: 0.6,
          fill: 0.9
        }
      },
      grid: {
        borderColor: '#eee',
        borderWidth: 1,
        hoverable: true,
        backgroundColor: '#fcfcfc'
      },
      tooltip: true,
      tooltipOpts: {
        content: function content(label, x, y) {
          return x + ' : ' + y;
        }
      },
      xaxis: {
        tickColor: '#fcfcfc',
        mode: 'categories'
      },
      yaxis: {
        // position: 'right' or 'left'
        tickColor: '#eee'
      },
      shadowSize: 0
    };
    var chart = $('.chart-bar-stacked');
    if (chart.length) $.plot(chart, data, options);
    var chartv2 = $('.chart-bar-stackedv2');
    if (chartv2.length) $.plot(chartv2, datav2, options);
  }
})(); // CHART DONUT
// -----------------------------------


(function () {
  'use strict';

  $(initFlotDonut);

  function initFlotDonut() {
    var data = [{
      "color": "#39C558",
      "data": 60,
      "label": "Coffee"
    }, {
      "color": "#00b4ff",
      "data": 90,
      "label": "CSS"
    }, {
      "color": "#FFBE41",
      "data": 50,
      "label": "LESS"
    }, {
      "color": "#ff3e43",
      "data": 80,
      "label": "Jade"
    }, {
      "color": "#937fc7",
      "data": 116,
      "label": "AngularJS"
    }];
    var options = {
      series: {
        pie: {
          show: true,
          innerRadius: 0.5 // This makes the donut shape

        }
      }
    };
    var chart = $('.chart-donut');
    if (chart.length) $.plot(chart, data, options);
  }
})(); // CHART LINE
// -----------------------------------


(function () {
  'use strict';

  $(initFlotLine);

  function initFlotLine() {
    var data = [{
      "label": "Complete",
      "color": "#5ab1ef",
      "data": [["Jan", 188], ["Feb", 183], ["Mar", 185], ["Apr", 199], ["May", 190], ["Jun", 194], ["Jul", 194], ["Aug", 184], ["Sep", 74]]
    }, {
      "label": "In Progress",
      "color": "#f5994e",
      "data": [["Jan", 153], ["Feb", 116], ["Mar", 136], ["Apr", 119], ["May", 148], ["Jun", 133], ["Jul", 118], ["Aug", 161], ["Sep", 59]]
    }, {
      "label": "Cancelled",
      "color": "#d87a80",
      "data": [["Jan", 111], ["Feb", 97], ["Mar", 93], ["Apr", 110], ["May", 102], ["Jun", 93], ["Jul", 92], ["Aug", 92], ["Sep", 44]]
    }];
    var options = {
      series: {
        lines: {
          show: true,
          fill: 0.01
        },
        points: {
          show: true,
          radius: 4
        }
      },
      grid: {
        borderColor: '#eee',
        borderWidth: 1,
        hoverable: true,
        backgroundColor: '#fcfcfc'
      },
      tooltip: true,
      tooltipOpts: {
        content: function content(label, x, y) {
          return x + ' : ' + y;
        }
      },
      xaxis: {
        tickColor: '#eee',
        mode: 'categories'
      },
      yaxis: {
        // position: 'right' or 'left'
        tickColor: '#eee'
      },
      shadowSize: 0
    };
    var chart = $('.chart-line');
    if (chart.length) $.plot(chart, data, options);
  }
})(); // CHART PIE
// -----------------------------------


(function () {
  'use strict';

  $(initFlotPie);

  function initFlotPie() {
    var data = [{
      "label": "jQuery",
      "color": "#4acab4",
      "data": 30
    }, {
      "label": "CSS",
      "color": "#ffea88",
      "data": 40
    }, {
      "label": "LESS",
      "color": "#ff8153",
      "data": 90
    }, {
      "label": "SASS",
      "color": "#878bb6",
      "data": 75
    }, {
      "label": "Jade",
      "color": "#b2d767",
      "data": 120
    }];
    var options = {
      series: {
        pie: {
          show: true,
          innerRadius: 0,
          label: {
            show: true,
            radius: 0.8,
            formatter: function formatter(label, series) {
              return '<div class="flot-pie-label">' + //label + ' : ' +
              Math.round(series.percent) + '%</div>';
            },
            background: {
              opacity: 0.8,
              color: '#222'
            }
          }
        }
      }
    };
    var chart = $('.chart-pie');
    if (chart.length) $.plot(chart, data, options);
  }
})(); // Morris
// -----------------------------------


(function () {
  'use strict';

  $(initMorris);

  function initMorris() {
    if (typeof Morris === 'undefined') return;
    var chartdata = [{
      y: "2006",
      a: 100,
      b: 90
    }, {
      y: "2007",
      a: 75,
      b: 65
    }, {
      y: "2008",
      a: 50,
      b: 40
    }, {
      y: "2009",
      a: 75,
      b: 65
    }, {
      y: "2010",
      a: 50,
      b: 40
    }, {
      y: "2011",
      a: 75,
      b: 65
    }, {
      y: "2012",
      a: 100,
      b: 90
    }];
    var donutdata = [{
      label: "Download Sales",
      value: 12
    }, {
      label: "In-Store Sales",
      value: 30
    }, {
      label: "Mail-Order Sales",
      value: 20
    }]; // Line Chart
    // -----------------------------------

    new Morris.Line({
      element: 'morris-line',
      data: chartdata,
      xkey: 'y',
      ykeys: ["a", "b"],
      labels: ["Serie A", "Serie B"],
      lineColors: ["#31C0BE", "#7a92a3"],
      resize: true
    }); // Donut Chart
    // -----------------------------------

    new Morris.Donut({
      element: 'morris-donut',
      data: donutdata,
      colors: ['#f05050', '#fad732', '#ff902b'],
      resize: true
    }); // Bar Chart
    // -----------------------------------

    new Morris.Bar({
      element: 'morris-bar',
      data: chartdata,
      xkey: 'y',
      ykeys: ["a", "b"],
      labels: ["Series A", "Series B"],
      xLabelMargin: 2,
      barColors: ['#23b7e5', '#f05050'],
      resize: true
    }); // Area Chart
    // -----------------------------------

    new Morris.Area({
      element: 'morris-area',
      data: chartdata,
      xkey: 'y',
      ykeys: ["a", "b"],
      labels: ["Serie A", "Serie B"],
      lineColors: ['#7266ba', '#23b7e5'],
      resize: true
    });
  }
})(); // Rickshaw
// -----------------------------------


(function () {
  'use strict';

  $(initMorris);

  function initMorris() {
    if (typeof Rickshaw === 'undefined') return;
    var seriesData = [[], [], []];
    var random = new Rickshaw.Fixtures.RandomData(150);

    for (var i = 0; i < 150; i++) {
      random.addData(seriesData);
    }

    var series1 = [{
      color: "#c05020",
      data: seriesData[0],
      name: 'New York'
    }, {
      color: "#30c020",
      data: seriesData[1],
      name: 'London'
    }, {
      color: "#6060c0",
      data: seriesData[2],
      name: 'Tokyo'
    }];
    var graph1 = new Rickshaw.Graph({
      element: document.querySelector("#rickshaw1"),
      series: series1,
      renderer: 'area'
    });
    graph1.render(); // Graph 2
    // -----------------------------------

    var graph2 = new Rickshaw.Graph({
      element: document.querySelector("#rickshaw2"),
      renderer: 'area',
      stroke: true,
      series: [{
        data: [{
          x: 0,
          y: 40
        }, {
          x: 1,
          y: 49
        }, {
          x: 2,
          y: 38
        }, {
          x: 3,
          y: 30
        }, {
          x: 4,
          y: 32
        }],
        color: '#f05050'
      }, {
        data: [{
          x: 0,
          y: 40
        }, {
          x: 1,
          y: 49
        }, {
          x: 2,
          y: 38
        }, {
          x: 3,
          y: 30
        }, {
          x: 4,
          y: 32
        }],
        color: '#fad732'
      }]
    });
    graph2.render(); // Graph 3
    // -----------------------------------

    var graph3 = new Rickshaw.Graph({
      element: document.querySelector("#rickshaw3"),
      renderer: 'line',
      series: [{
        data: [{
          x: 0,
          y: 40
        }, {
          x: 1,
          y: 49
        }, {
          x: 2,
          y: 38
        }, {
          x: 3,
          y: 30
        }, {
          x: 4,
          y: 32
        }],
        color: '#7266ba'
      }, {
        data: [{
          x: 0,
          y: 20
        }, {
          x: 1,
          y: 24
        }, {
          x: 2,
          y: 19
        }, {
          x: 3,
          y: 15
        }, {
          x: 4,
          y: 16
        }],
        color: '#23b7e5'
      }]
    });
    graph3.render(); // Graph 4
    // -----------------------------------

    var graph4 = new Rickshaw.Graph({
      element: document.querySelector("#rickshaw4"),
      renderer: 'bar',
      series: [{
        data: [{
          x: 0,
          y: 40
        }, {
          x: 1,
          y: 49
        }, {
          x: 2,
          y: 38
        }, {
          x: 3,
          y: 30
        }, {
          x: 4,
          y: 32
        }],
        color: '#fad732'
      }, {
        data: [{
          x: 0,
          y: 20
        }, {
          x: 1,
          y: 24
        }, {
          x: 2,
          y: 19
        }, {
          x: 3,
          y: 15
        }, {
          x: 4,
          y: 16
        }],
        color: '#ff902b'
      }]
    });
    graph4.render();
  }
})(); // SPARKLINE
// -----------------------------------


(function () {
  'use strict';

  $(initSparkline);

  function initSparkline() {
    $('[data-sparkline]').each(initSparkLine);

    function initSparkLine() {
      var $element = $(this),
          options = $element.data(),
          values = options.values && options.values.split(',');
      options.type = options.type || 'bar'; // default chart is bar

      options.disableHiddenCheck = true;
      $element.sparkline(values, options);

      if (options.resize) {
        $(window).resize(function () {
          $element.sparkline(values, options);
        });
      }
    }
  }
})(); // Start Bootstrap JS
// -----------------------------------


(function () {
  'use strict';

  $(initBootstrap);

  function initBootstrap() {
    // necessary check at least til BS doesn't require jQuery
    if (!$.fn || !$.fn.tooltip || !$.fn.popover) return; // POPOVER
    // -----------------------------------

    $('[data-toggle="popover"]').popover(); // TOOLTIP
    // -----------------------------------

    $('[data-toggle="tooltip"]').tooltip({
      container: 'body'
    }); // DROPDOWN INPUTS
    // -----------------------------------

    $('.dropdown input').on('click focus', function (event) {
      event.stopPropagation();
    });
  }
})(); // Module: card-tools
// -----------------------------------


(function () {
  'use strict';

  $(initCardDismiss);
  $(initCardCollapse);
  $(initCardRefresh);
  /**
   * Helper function to find the closest
   * ascending .card element
   */

  function getCardParent(item) {
    var el = item.parentElement;

    while (el && !el.classList.contains('card')) {
      el = el.parentElement;
    }

    return el;
  }
  /**
   * Helper to trigger custom event
   */


  function triggerEvent(type, item, data) {
    var ev;

    if (typeof CustomEvent === 'function') {
      ev = new CustomEvent(type, {
        detail: data
      });
    } else {
      ev = document.createEvent('CustomEvent');
      ev.initCustomEvent(type, true, false, data);
    }

    item.dispatchEvent(ev);
  }
  /**
   * Dismiss cards
   * [data-tool="card-dismiss"]
   */


  function initCardDismiss() {
    var cardtoolSelector = '[data-tool="card-dismiss"]';
    var cardList = [].slice.call(document.querySelectorAll(cardtoolSelector));
    cardList.forEach(function (item) {
      new CardDismiss(item);
    });

    function CardDismiss(item) {
      var EVENT_REMOVE = 'card.remove';
      var EVENT_REMOVED = 'card.removed';
      this.item = item;
      this.cardParent = getCardParent(this.item);
      this.removing = false; // prevents double execution

      this.clickHandler = function (e) {
        if (this.removing) return;
        this.removing = true; // pass callbacks via event.detail to confirm/cancel the removal

        triggerEvent(EVENT_REMOVE, this.cardParent, {
          confirm: this.confirm.bind(this),
          cancel: this.cancel.bind(this)
        });
      };

      this.confirm = function () {
        this.animate(this.cardParent, function () {
          triggerEvent(EVENT_REMOVED, this.cardParent);
          this.remove(this.cardParent);
        });
      };

      this.cancel = function () {
        this.removing = false;
      };

      this.animate = function (item, cb) {
        if ('onanimationend' in window) {
          // animation supported
          item.addEventListener('animationend', cb.bind(this));
          item.className += ' animated bounceOut'; // requires animate.css
        } else cb.call(this); // no animation, just remove

      };

      this.remove = function (item) {
        item.parentNode.removeChild(item);
      }; // attach listener


      item.addEventListener('click', this.clickHandler.bind(this), false);
    }
  }
  /**
   * Collapsed cards
   * [data-tool="card-collapse"]
   * [data-start-collapsed]
   */


  function initCardCollapse() {
    var cardtoolSelector = '[data-tool="card-collapse"]';
    var cardList = [].slice.call(document.querySelectorAll(cardtoolSelector));
    cardList.forEach(function (item) {
      var initialState = item.hasAttribute('data-start-collapsed');
      new CardCollapse(item, initialState);
    });

    function CardCollapse(item, startCollapsed) {
      var EVENT_SHOW = 'card.collapse.show';
      var EVENT_HIDE = 'card.collapse.hide';
      this.state = true; // true -> show / false -> hide

      this.item = item;
      this.cardParent = getCardParent(this.item);
      this.wrapper = this.cardParent.querySelector('.card-wrapper');

      this.toggleCollapse = function (action) {
        triggerEvent(action ? EVENT_SHOW : EVENT_HIDE, this.cardParent);
        this.wrapper.style.maxHeight = (action ? this.wrapper.scrollHeight : 0) + 'px';
        this.state = action;
        this.updateIcon(action);
      };

      this.updateIcon = function (action) {
        this.item.firstElementChild.className = action ? 'fa fa-minus' : 'fa fa-plus';
      };

      this.clickHandler = function () {
        this.toggleCollapse(!this.state);
      };

      this.initStyles = function () {
        this.wrapper.style.maxHeight = this.wrapper.scrollHeight + 'px';
        this.wrapper.style.transition = 'max-height 0.5s';
        this.wrapper.style.overflow = 'hidden';
      }; // prepare styles for collapse animation


      this.initStyles(); // set initial state if provided

      if (startCollapsed) {
        this.toggleCollapse(false);
      } // attach listener


      this.item.addEventListener('click', this.clickHandler.bind(this), false);
    }
  }
  /**
   * Refresh cards
   * [data-tool="card-refresh"]
   * [data-spinner="standard"]
   */


  function initCardRefresh() {
    var cardtoolSelector = '[data-tool="card-refresh"]';
    var cardList = [].slice.call(document.querySelectorAll(cardtoolSelector));
    cardList.forEach(function (item) {
      new CardRefresh(item);
    });

    function CardRefresh(item) {
      var EVENT_REFRESH = 'card.refresh';
      var WHIRL_CLASS = 'whirl';
      var DEFAULT_SPINNER = 'standard';
      this.item = item;
      this.cardParent = getCardParent(this.item);
      this.spinner = ((this.item.dataset || {}).spinner || DEFAULT_SPINNER).split(' '); // support space separated classes

      this.refresh = function (e) {
        var card = this.cardParent; // start showing the spinner

        this.showSpinner(card, this.spinner); // attach as public method

        card.removeSpinner = this.removeSpinner.bind(this); // Trigger the event and send the card

        triggerEvent(EVENT_REFRESH, card, {
          card: card
        });
      };

      this.showSpinner = function (card, spinner) {
        card.classList.add(WHIRL_CLASS);
        spinner.forEach(function (s) {
          card.classList.add(s);
        });
      };

      this.removeSpinner = function () {
        this.cardParent.classList.remove(WHIRL_CLASS);
      }; // attach listener


      this.item.addEventListener('click', this.refresh.bind(this), false);
    }
  }
})(); // GLOBAL CONSTANTS
// -----------------------------------


(function () {
  window.APP_COLORS = {
    'primary': '#5d9cec',
    'success': '#27c24c',
    'info': '#23b7e5',
    'warning': '#ff902b',
    'danger': '#f05050',
    'inverse': '#131e26',
    'green': '#37bc9b',
    'pink': '#f532e5',
    'purple': '#7266ba',
    'dark': '#3a3f51',
    'yellow': '#fad732',
    'gray-darker': '#232735',
    'gray-dark': '#3a3f51',
    'gray': '#dde6e9',
    'gray-light': '#e4eaec',
    'gray-lighter': '#edf1f2'
  };
  window.APP_MEDIAQUERY = {
    'desktopLG': 1200,
    'desktop': 992,
    'tablet': 768,
    'mobile': 480
  };
})(); // FULLSCREEN
// -----------------------------------


(function () {
  'use strict';

  $(initScreenFull);

  function initScreenFull() {
    if (typeof screenfull === 'undefined') return;
    var $doc = $(document);
    var $fsToggler = $('[data-toggle-fullscreen]'); // Not supported under IE

    var ua = window.navigator.userAgent;

    if (ua.indexOf("MSIE ") > 0 || !!ua.match(/Trident.*rv\:11\./)) {
      $fsToggler.addClass('d-none'); // hide element

      return; // and abort
    }

    $fsToggler.on('click', function (e) {
      e.preventDefault();

      if (screenfull.enabled) {
        screenfull.toggle(); // Switch icon indicator

        toggleFSIcon($fsToggler);
      } else {
        console.log('Fullscreen not enabled');
      }
    });
    if (screenfull.raw && screenfull.raw.fullscreenchange) $doc.on(screenfull.raw.fullscreenchange, function () {
      toggleFSIcon($fsToggler);
    });

    function toggleFSIcon($element) {
      if (screenfull.isFullscreen) $element.children('em').removeClass('fa-expand').addClass('fa-compress');else $element.children('em').removeClass('fa-compress').addClass('fa-expand');
    }
  }
})(); // LOAD CUSTOM CSS
// -----------------------------------


(function () {
  'use strict';

  $(initLoadCSS);

  function initLoadCSS() {
    $('[data-load-css]').on('click', function (e) {
      var element = $(this);
      if (element.is('a')) e.preventDefault();
      var uri = element.data('loadCss'),
          link;

      if (uri) {
        link = createLink(uri);

        if (!link) {
          $.error('Error creating stylesheet link element.');
        }
      } else {
        $.error('No stylesheet location defined.');
      }
    });
  }

  function createLink(uri) {
    var linkId = 'autoloaded-stylesheet',
        oldLink = $('#' + linkId).attr('id', linkId + '-old');
    $('head').append($('<link/>').attr({
      'id': linkId,
      'rel': 'stylesheet',
      'href': uri
    }));

    if (oldLink.length) {
      oldLink.remove();
    }

    return $('#' + linkId);
  }
})(); // TRANSLATION
// -----------------------------------


(function () {
  'use strict';

  $(initTranslation);
  var pathPrefix = '/Content/i18n'; // folder of json files

  var STORAGEKEY = 'jq-appLang';
  var savedLanguage = Storages.localStorage.get(STORAGEKEY);

  function initTranslation() {
    i18next.use(i18nextXHRBackend) // .use(LanguageDetector)
    .init({
      fallbackLng: savedLanguage || 'en',
      backend: {
        loadPath: pathPrefix + '/{{ns}}-{{lng}}.json'
      },
      ns: ['site'],
      defaultNS: 'site',
      debug: false
    }, function (err, t) {
      // initialize elements
      applyTranlations(); // listen to language changes

      attachChangeListener();
    });

    function applyTranlations() {
      var list = [].slice.call(document.querySelectorAll('[data-localize]'));
      list.forEach(function (item) {
        var key = item.getAttribute('data-localize');
        if (i18next.exists(key)) item.innerHTML = i18next.t(key);
      });
    }

    function attachChangeListener() {
      var list = [].slice.call(document.querySelectorAll('[data-set-lang]'));
      list.forEach(function (item) {
        item.addEventListener('click', function (e) {
          if (e.target.tagName === 'A') e.preventDefault();
          var lang = item.getAttribute('data-set-lang');

          if (lang) {
            i18next.changeLanguage(lang, function (err) {
              if (err) console.log(err);else {
                applyTranlations();
                Storages.localStorage.set(STORAGEKEY, lang);
              }
            });
          }

          activateDropdown(item);
        });
      });
    }

    function activateDropdown(item) {
      if (item.classList.contains('dropdown-item')) {
        item.parentElement.previousElementSibling.innerHTML = item.innerHTML;
      }
    }
  }
})(); // NAVBAR SEARCH
// -----------------------------------


(function () {
  'use strict';

  $(initNavbarSearch);

  function initNavbarSearch() {
    var navSearch = new navbarSearchInput(); // Open search input

    var $searchOpen = $('[data-search-open]');
    $searchOpen.on('click', function (e) {
      e.stopPropagation();
    }).on('click', navSearch.toggle); // Close search input

    var $searchDismiss = $('[data-search-dismiss]');
    var inputSelector = '.navbar-form input[type="text"]';
    $(inputSelector).on('click', function (e) {
      e.stopPropagation();
    }).on('keyup', function (e) {
      if (e.keyCode == 27) // ESC
        navSearch.dismiss();
    }); // click anywhere closes the search

    $(document).on('click', navSearch.dismiss); // dismissable options

    $searchDismiss.on('click', function (e) {
      e.stopPropagation();
    }).on('click', navSearch.dismiss);
  }

  var navbarSearchInput = function navbarSearchInput() {
    var navbarFormSelector = 'form.navbar-form';
    return {
      toggle: function toggle() {
        var navbarForm = $(navbarFormSelector);
        navbarForm.toggleClass('open');
        var isOpen = navbarForm.hasClass('open');
        navbarForm.find('input')[isOpen ? 'focus' : 'blur']();
      },
      dismiss: function dismiss() {
        $(navbarFormSelector).removeClass('open') // Close control
        .find('input[type="text"]').blur() // remove focus
        // .val('')                    // Empty input
        ;
      }
    };
  };
})(); // NOW TIMER
// -----------------------------------


(function () {
  'use strict';

  $(initNowTimer);

  function initNowTimer() {
    if (typeof moment === 'undefined') return;
    $('[data-now]').each(function () {
      var element = $(this),
          format = element.data('format');

      function updateTime() {
        var dt = moment(new Date()).format(format);
        element.text(dt);
      }

      updateTime();
      setInterval(updateTime, 1000);
    });
  }
})(); // Toggle RTL mode for demo
// -----------------------------------


(function () {
  'use strict';

  $(initRTL);

  function initRTL() {
    var maincss = $('#maincss');
    var bscss = $('#bscss');
    $('#chk-rtl').on('change', function () {
      // app rtl check
      maincss.attr('href', this.checked ? '/Content/css/app-rtl.css' : '/Content/css/app.css'); // bootstrap rtl check

      bscss.attr('href', this.checked ? '/Content/css/bootstrap-rtl.css' : '/Content/css/bootstrap.css');
    });
  }
})(); // SIDEBAR
// -----------------------------------


(function () {
  'use strict';

  $(initSidebar);
  var $html;
  var $body;
  var $sidebar;

  function initSidebar() {
    $html = $('html');
    $body = $('body');
    $sidebar = $('.sidebar'); // AUTOCOLLAPSE ITEMS
    // -----------------------------------

    var sidebarCollapse = $sidebar.find('.collapse');
    sidebarCollapse.on('show.bs.collapse', function (event) {
      event.stopPropagation();
      if ($(this).parents('.collapse').length === 0) sidebarCollapse.filter('.show').collapse('hide');
    }); // SIDEBAR ACTIVE STATE
    // -----------------------------------
    // Find current active item

    var currentItem = $('.sidebar .active').parents('li'); // hover mode don't try to expand active collapse

    if (!useAsideHover()) currentItem.addClass('active') // activate the parent
    .children('.collapse') // find the collapse
    .collapse('show'); // and show it
    // remove this if you use only collapsible sidebar items

    $sidebar.find('li > a + ul').on('show.bs.collapse', function (e) {
      if (useAsideHover()) e.preventDefault();
    }); // SIDEBAR COLLAPSED ITEM HANDLER
    // -----------------------------------

    var eventName = isTouch() ? 'click' : 'mouseenter';
    var subNav = $();
    $sidebar.find('.sidebar-nav > li').on(eventName, function (e) {
      if (isSidebarCollapsed() || useAsideHover()) {
        subNav.trigger('mouseleave');
        subNav = toggleMenuItem($(this)); // Used to detect click and touch events outside the sidebar

        sidebarAddBackdrop();
      }
    });
    var sidebarAnyclickClose = $sidebar.data('sidebarAnyclickClose'); // Allows to close

    if (typeof sidebarAnyclickClose !== 'undefined') {
      $('.wrapper').on('click.sidebar', function (e) {
        // don't check if sidebar not visible
        if (!$body.hasClass('aside-toggled')) return;
        var $target = $(e.target);

        if (!$target.parents('.aside-container').length && // if not child of sidebar
        !$target.is('#user-block-toggle') && // user block toggle anchor
        !$target.parent().is('#user-block-toggle') // user block toggle icon
        ) {
            $body.removeClass('aside-toggled');
          }
      });
    }
  }

  function sidebarAddBackdrop() {
    var $backdrop = $('<div/>', {
      'class': 'sideabr-backdrop'
    });
    $backdrop.insertAfter('.aside-container').on("click mouseenter", function () {
      removeFloatingNav();
    });
  } // Open the collapse sidebar submenu items when on touch devices
  // - desktop only opens on hover


  function toggleTouchItem($element) {
    $element.siblings('li').removeClass('open');
    $element.toggleClass('open');
  } // Handles hover to open items under collapsed menu
  // -----------------------------------


  function toggleMenuItem($listItem) {
    removeFloatingNav();
    var ul = $listItem.children('ul');
    if (!ul.length) return $();

    if ($listItem.hasClass('open')) {
      toggleTouchItem($listItem);
      return $();
    }

    var $aside = $('.aside-container');
    var $asideInner = $('.aside-inner'); // for top offset calculation
    // float aside uses extra padding on aside

    var mar = parseInt($asideInner.css('padding-top'), 0) + parseInt($aside.css('padding-top'), 0);
    var subNav = ul.clone().appendTo($aside);
    toggleTouchItem($listItem);
    var itemTop = $listItem.position().top + mar - $sidebar.scrollTop();
    var vwHeight = document.body.clientHeight;
    subNav.addClass('nav-floating').css({
      position: isFixed() ? 'fixed' : 'absolute',
      top: itemTop,
      bottom: subNav.outerHeight(true) + itemTop > vwHeight ? 0 : 'auto'
    });
    subNav.on('mouseleave', function () {
      toggleTouchItem($listItem);
      subNav.remove();
    });
    return subNav;
  }

  function removeFloatingNav() {
    $('.sidebar-subnav.nav-floating').remove();
    $('.sideabr-backdrop').remove();
    $('.sidebar li.open').removeClass('open');
  }

  function isTouch() {
    return $html.hasClass('touch');
  }

  function isSidebarCollapsed() {
    return $body.hasClass('aside-collapsed') || $body.hasClass('aside-collapsed-text');
  }

  function isSidebarToggled() {
    return $body.hasClass('aside-toggled');
  }

  function isMobile() {
    return document.body.clientWidth < APP_MEDIAQUERY.tablet;
  }

  function isFixed() {
    return $body.hasClass('layout-fixed');
  }

  function useAsideHover() {
    return $body.hasClass('aside-hover');
  }
})(); // SLIMSCROLL
// -----------------------------------


(function () {
  'use strict';

  $(initSlimsSroll);

  function initSlimsSroll() {
    if (!$.fn || !$.fn.slimScroll) return;
    $('[data-scrollable]').each(function () {
      var element = $(this),
          defaultHeight = 250;
      element.slimScroll({
        height: element.data('height') || defaultHeight
      });
    });
  }
})(); // Table Check All
// -----------------------------------


(function () {
  'use strict';

  $(initTableCheckAll);

  function initTableCheckAll() {
    $('[data-check-all]').on('change', function () {
      var $this = $(this),
          index = $this.index() + 1,
          checkbox = $this.find('input[type="checkbox"]'),
          table = $this.parents('table'); // Make sure to affect only the correct checkbox column

      table.find('tbody > tr > td:nth-child(' + index + ') input[type="checkbox"]').prop('checked', checkbox[0].checked);
    });
  }
})(); // TOGGLE STATE
// -----------------------------------


(function () {
  'use strict';

  $(initToggleState);

  function initToggleState() {
    var $body = $('body');
    var toggle = new StateToggler();
    $('[data-toggle-state]').on('click', function (e) {
      // e.preventDefault();
      e.stopPropagation();
      var element = $(this),
          classname = element.data('toggleState'),
          target = element.data('target'),
          noPersist = element.attr('data-no-persist') !== undefined; // Specify a target selector to toggle classname
      // use body by default

      var $target = target ? $(target) : $body;

      if (classname) {
        if ($target.hasClass(classname)) {
          $target.removeClass(classname);
          if (!noPersist) toggle.removeState(classname);
        } else {
          $target.addClass(classname);
          if (!noPersist) toggle.addState(classname);
        }
      } // some elements may need this when toggled class change the content size


      if (typeof Event === 'function') {
        // modern browsers
        window.dispatchEvent(new Event('resize'));
      } else {
        // old browsers and IE
        var resizeEvent = window.document.createEvent('UIEvents');
        resizeEvent.initUIEvent('resize', true, false, window, 0);
        window.dispatchEvent(resizeEvent);
      }
    });
  } // Handle states to/from localstorage


  var StateToggler = function StateToggler() {
    var STORAGE_KEY_NAME = 'jq-toggleState';
    /** Add a state to the browser storage to be restored later */

    this.addState = function (classname) {
      var data = Storages.localStorage.get(STORAGE_KEY_NAME);
      if (data instanceof Array) data.push(classname);else data = [classname];
      Storages.localStorage.set(STORAGE_KEY_NAME, data);
    };
    /** Remove a state from the browser storage */


    this.removeState = function (classname) {
      var data = Storages.localStorage.get(STORAGE_KEY_NAME);

      if (data) {
        var index = data.indexOf(classname);
        if (index !== -1) data.splice(index, 1);
        Storages.localStorage.set(STORAGE_KEY_NAME, data);
      }
    };
    /** Load the state string and restore the classlist */


    this.restoreState = function ($elem) {
      var data = Storages.localStorage.get(STORAGE_KEY_NAME);
      if (data instanceof Array) $elem.addClass(data.join(' '));
    };
  };

  window.StateToggler = StateToggler;
})();
/**=========================================================
 * Module: trigger-resize.js
 * Triggers a window resize event from any element
 =========================================================*/


(function () {
  'use strict';

  $(initTriggerResize);

  function initTriggerResize() {
    var element = $('[data-trigger-resize]');
    var value = element.data('triggerResize');
    element.on('click', function () {
      setTimeout(function () {
        // all IE friendly dispatchEvent
        var evt = document.createEvent('UIEvents');
        evt.initUIEvent('resize', true, false, window, 0);
        window.dispatchEvent(evt); // modern dispatchEvent way
        // window.dispatchEvent(new Event('resize'));
      }, value || 300);
    });
  }
})(); // Demo Cards
// -----------------------------------


(function () {
  'use strict';

  $(initCardDemo);

  function initCardDemo() {
    /**
     * This functions show a demonstration of how to use
     * the card tools system via custom event.
     */
    var cardList = [].slice.call(document.querySelectorAll('.card.card-demo'));
    cardList.forEach(function (item) {
      item.addEventListener('card.refresh', function (event) {
        // get the card element that is refreshing
        var card = event.detail.card; // perform any action here, when it is done,
        // remove the spinner calling "removeSpinner"
        // setTimeout used to simulate async operation

        setTimeout(card.removeSpinner, 3000);
      });
      item.addEventListener('card.collapse.hide', function () {
        console.log('Card Collapse Hide');
      });
      item.addEventListener('card.collapse.show', function () {
        console.log('Card Collapse Show');
      });
      item.addEventListener('card.remove', function (event) {
        var confirm = event.detail.confirm;
        var cancel = event.detail.cancel; // perform any action  here

        console.log('Removing Card'); // Call confirm() to continue removing card
        // otherwise call cancel()

        confirm();
      });
      item.addEventListener('card.removed', function (event) {
        console.log('Removed Card');
      });
    });
  }
})(); // Nestable demo
// -----------------------------------


(function () {
  'use strict';

  $(initNestable);

  function initNestable() {
    if (!$.fn.nestable) return;

    var updateOutput = function updateOutput(e) {
      var list = e.length ? e : $(e.target),
          output = list.data('output');

      if (window.JSON) {
        output.val(window.JSON.stringify(list.nestable('serialize'))); //, null, 2));
      } else {
        output.val('JSON browser support required for this demo.');
      }
    }; // activate Nestable for list 1


    $('#nestable').nestable({
      group: 1
    }).on('change', updateOutput); // activate Nestable for list 2

    $('#nestable2').nestable({
      group: 1
    }).on('change', updateOutput); // output initial serialised data

    updateOutput($('#nestable').data('output', $('#nestable-output')));
    updateOutput($('#nestable2').data('output', $('#nestable2-output')));
    $('.js-nestable-action').on('click', function (e) {
      var target = $(e.target),
          action = target.data('action');

      if (action === 'expand-all') {
        $('.dd').nestable('expandAll');
      }

      if (action === 'collapse-all') {
        $('.dd').nestable('collapseAll');
      }
    });
  }
})();
/**=========================================================
 * Module: notify.js
 * Create toggleable notifications that fade out automatically.
 * Based on Notify addon from UIKit (http://getuikit.com/docs/addons_notify.html)
 * [data-toggle="notify"]
 * [data-options="options in json format" ]
 =========================================================*/


(function () {
  'use strict';

  $(initNotify);

  function initNotify() {
    var Selector = '[data-notify]',
        autoloadSelector = '[data-onload]',
        doc = $(document);
    $(Selector).each(function () {
      var $this = $(this),
          onload = $this.data('onload');

      if (onload !== undefined) {
        setTimeout(function () {
          notifyNow($this);
        }, 800);
      }

      $this.on('click', function (e) {
        e.preventDefault();
        notifyNow($this);
      });
    });
  }

  function notifyNow($element) {
    var message = $element.data('message'),
        options = $element.data('options');
    if (!message) $.error('Notify: No message specified');
    $.notify(message, options || {});
  }
})();
/**
 * Notify Addon definition as jQuery plugin
 * Adapted version to work with Bootstrap classes
 * More information http://getuikit.com/docs/addons_notify.html
 */


(function () {
  var containers = {},
      messages = {},
      notify = function notify(options) {
    if ($.type(options) == 'string') {
      options = {
        message: options
      };
    }

    if (arguments[1]) {
      options = $.extend(options, $.type(arguments[1]) == 'string' ? {
        status: arguments[1]
      } : arguments[1]);
    }

    return new Message(options).show();
  },
      closeAll = function closeAll(group, instantly) {
    if (group) {
      for (var id in messages) {
        if (group === messages[id].group) messages[id].close(instantly);
      }
    } else {
      for (var id in messages) {
        messages[id].close(instantly);
      }
    }
  };

  var Message = function Message(options) {
    var $this = this;
    this.options = $.extend({}, Message.defaults, options);
    this.uuid = "ID" + new Date().getTime() + "RAND" + Math.ceil(Math.random() * 100000);
    this.element = $([// alert-dismissable enables bs close icon
    '<div class="uk-notify-message alert-dismissable">', '<a class="close">&times;</a>', '<div>' + this.options.message + '</div>', '</div>'].join('')).data("notifyMessage", this); // status

    if (this.options.status) {
      this.element.addClass('alert alert-' + this.options.status);
      this.currentstatus = this.options.status;
    }

    this.group = this.options.group;
    messages[this.uuid] = this;

    if (!containers[this.options.pos]) {
      containers[this.options.pos] = $('<div class="uk-notify uk-notify-' + this.options.pos + '"></div>').appendTo('body').on("click", ".uk-notify-message", function () {
        $(this).data("notifyMessage").close();
      });
    }
  };

  $.extend(Message.prototype, {
    uuid: false,
    element: false,
    timout: false,
    currentstatus: "",
    group: false,
    show: function show() {
      if (this.element.is(":visible")) return;
      var $this = this;
      containers[this.options.pos].show().prepend(this.element);
      var marginbottom = parseInt(this.element.css("margin-bottom"), 10);
      this.element.css({
        "opacity": 0,
        "margin-top": -1 * this.element.outerHeight(),
        "margin-bottom": 0
      }).animate({
        "opacity": 1,
        "margin-top": 0,
        "margin-bottom": marginbottom
      }, function () {
        if ($this.options.timeout) {
          var closefn = function closefn() {
            $this.close();
          };

          $this.timeout = setTimeout(closefn, $this.options.timeout);
          $this.element.hover(function () {
            clearTimeout($this.timeout);
          }, function () {
            $this.timeout = setTimeout(closefn, $this.options.timeout);
          });
        }
      });
      return this;
    },
    close: function close(instantly) {
      var $this = this,
          finalize = function finalize() {
        $this.element.remove();

        if (!containers[$this.options.pos].children().length) {
          containers[$this.options.pos].hide();
        }

        delete messages[$this.uuid];
      };

      if (this.timeout) clearTimeout(this.timeout);

      if (instantly) {
        finalize();
      } else {
        this.element.animate({
          "opacity": 0,
          "margin-top": -1 * this.element.outerHeight(),
          "margin-bottom": 0
        }, function () {
          finalize();
        });
      }
    },
    content: function content(html) {
      var container = this.element.find(">div");

      if (!html) {
        return container.html();
      }

      container.html(html);
      return this;
    },
    status: function status(_status) {
      if (!_status) {
        return this.currentstatus;
      }

      this.element.removeClass('alert alert-' + this.currentstatus).addClass('alert alert-' + _status);
      this.currentstatus = _status;
      return this;
    }
  });
  Message.defaults = {
    message: "",
    status: "normal",
    timeout: 5000,
    group: null,
    pos: 'top-center'
  };
  $["notify"] = notify;
  $["notify"].message = Message;
  $["notify"].closeAll = closeAll;
  return notify;
})();
/**=========================================================
 * Module: portlet.js
 * Drag and drop any card to change its position
 * The Selector should could be applied to any object that contains
 * card, so .col-* element are ideal.
 =========================================================*/


(function () {
  'use strict';

  var STORAGE_KEY_NAME = 'jq-portletState';
  $(initPortlets);

  function initPortlets() {
    // Component is NOT optional
    if (!$.fn.sortable) return;
    var Selector = '[data-toggle="portlet"]';
    $(Selector).sortable({
      connectWith: Selector,
      items: 'div.card',
      handle: '.portlet-handler',
      opacity: 0.7,
      placeholder: 'portlet box-placeholder',
      cancel: '.portlet-cancel',
      forcePlaceholderSize: true,
      iframeFix: false,
      tolerance: 'pointer',
      helper: 'original',
      revert: 200,
      forceHelperSize: true,
      update: savePortletOrder,
      create: loadPortletOrder
    }) // optionally disables mouse selection
    //.disableSelection()
    ;
  }

  function savePortletOrder(event, ui) {
    var data = Storages.localStorage.get(STORAGE_KEY_NAME);

    if (!data) {
      data = {};
    }

    data[this.id] = $(this).sortable('toArray');

    if (data) {
      Storages.localStorage.set(STORAGE_KEY_NAME, data);
    }
  }

  function loadPortletOrder() {
    var data = Storages.localStorage.get(STORAGE_KEY_NAME);

    if (data) {
      var porletId = this.id,
          cards = data[porletId];

      if (cards) {
        var portlet = $('#' + porletId);
        $.each(cards, function (index, value) {
          $('#' + value).appendTo(portlet);
        });
      }
    }
  } // Reset porlet save state


  window.resetPorlets = function (e) {
    Storages.localStorage.remove(STORAGE_KEY_NAME); // reload the page

    window.location.reload();
  };
})(); // HTML5 Sortable demo
// -----------------------------------


(function () {
  'use strict';

  $(initSortable);

  function initSortable() {
    if (typeof sortable === 'undefined') return;
    sortable('.sortable', {
      forcePlaceholderSize: true,
      placeholder: '<div class="box-placeholder p0 m0"><div></div></div>'
    });
  }
})(); // Sweet Alert
// -----------------------------------


(function () {
  'use strict';

  $(initSweetAlert);

  function initSweetAlert() {
    $('#swal-demo1').on('click', function (e) {
      e.preventDefault();
      swal("Here's a message!");
    });
    $('#swal-demo2').on('click', function (e) {
      e.preventDefault();
      swal("Here's a message!", "It's pretty, isn't it?");
    });
    $('#swal-demo3').on('click', function (e) {
      e.preventDefault();
      swal("Good job!", "You clicked the button!", "success");
    });
    $('#swal-demo4').on('click', function (e) {
      e.preventDefault();
      swal({
        title: 'Are you sure?',
        text: 'Your will not be able to recover this imaginary file!',
        icon: 'warning',
        buttons: {
          cancel: true,
          confirm: {
            text: 'Yes, delete it!',
            value: true,
            visible: true,
            className: "bg-danger",
            closeModal: true
          }
        }
      }).then(function () {
        swal('Booyah!');
      });
    });
    $('#swal-demo5').on('click', function (e) {
      e.preventDefault();
      swal({
        title: 'Are you sure?',
        text: 'Your will not be able to recover this imaginary file!',
        icon: 'warning',
        buttons: {
          cancel: {
            text: 'No, cancel plx!',
            value: null,
            visible: true,
            className: "",
            closeModal: false
          },
          confirm: {
            text: 'Yes, delete it!',
            value: true,
            visible: true,
            className: "bg-danger",
            closeModal: false
          }
        }
      }).then(function (isConfirm) {
        if (isConfirm) {
          swal('Deleted!', 'Your imaginary file has been deleted.', 'success');
        } else {
          swal('Cancelled', 'Your imaginary file is safe :)', 'error');
        }
      });
    });
  }
})(); // Full Calendar
// -----------------------------------


(function () {
  'use strict';

  if (typeof FullCalendar === 'undefined') return; // When dom ready, init calendar and events

  $(initExternalEvents);
  $(initFullCalendar);

  function initFullCalendar() {
    var Calendar = FullCalendar.Calendar;
    var Draggable = FullCalendarInteraction.Draggable;
    /* initialize the external events */

    var containerEl = document.getElementById('external-events-list');
    new Draggable(containerEl, {
      itemSelector: '.fce-event',
      eventData: function eventData(eventEl) {
        return {
          title: eventEl.innerText.trim()
        };
      }
    });
    /* initialize the calendar */

    var calendarEl = document.getElementById('calendar');
    var calendar = new Calendar(calendarEl, {
      events: createDemoEvents(),
      plugins: ['interaction', 'dayGrid', 'timeGrid', 'list', 'bootstrap'],
      themeSystem: 'bootstrap',
      header: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
      },
      editable: true,
      droppable: true,
      // this allows things to be dropped onto the calendar
      eventReceive: function eventReceive(info) {
        var styles = getComputedStyle(info.draggedEl);
        info.event.setProp('backgroundColor', styles.backgroundColor);
        info.event.setProp('borderColor', styles.borderColor); // is the "remove after drop" checkbox checked?

        if (document.getElementById('drop-remove').checked) {
          // if so, remove the element from the "Draggable Events" list
          info.draggedEl.parentNode.removeChild(info.draggedEl);
        }
      }
    });
    calendar.render();
  }

  function initExternalEvents() {
    var colorSelectorContainer = document.getElementById('external-event-color-selector');
    var addEventButton = document.getElementById('external-event-add-btn');
    var eventNameInput = document.getElementById('external-event-name');
    var colorSelectors = [].slice.call(colorSelectorContainer.querySelectorAll('.circle'));
    var currentSelector = colorSelectorContainer.querySelector('.circle'); // select first as default

    var containerEl = document.getElementById('external-events-list'); // control the color selector selectable behavior

    colorSelectors.forEach(function (sel) {
      sel.addEventListener('click', selectColorSelector(sel));
    }); // Create and add a new event to the list

    addEventButton.addEventListener('click', addNewExternalEvent);

    function selectColorSelector(sel) {
      return function (e) {
        // deselect all
        colorSelectors.forEach(unselectAllColorSelector); // select current

        sel.classList.add('selected');
        currentSelector = sel;
      };
    }

    function unselectAllColorSelector(el) {
      el.classList.remove('selected');
    }

    function addNewExternalEvent() {
      var name = eventNameInput.value;

      if (name) {
        var el = createElement(currentSelector);
        el.innerText = name;
        containerEl.insertBefore(el, containerEl.firstChild); // preppend
      }
    }

    function createElement(baseElement) {
      var styles = getComputedStyle(currentSelector);
      var element = document.createElement('div');
      element.style.backgroundColor = styles.backgroundColor;
      element.style.borderColor = styles.borderColor;
      element.style.color = '#fff';
      element.className = 'fce-event'; // make draggable

      return element;
    }
  }
  /**
   * Creates an array of events to display in the first load of the calendar
   * Wrap into this function a request to a source to get via ajax the stored events
   * @return Array The array with the events
   */


  function createDemoEvents() {
    // Date for the calendar events (dummy data)
    var date = new Date();
    var d = date.getDate(),
        m = date.getMonth(),
        y = date.getFullYear();
    return [{
      title: 'All Day Event',
      start: new Date(y, m, 1),
      backgroundColor: '#f56954',
      //red
      borderColor: '#f56954' //red

    }, {
      title: 'Long Event',
      start: new Date(y, m, d - 5),
      end: new Date(y, m, d - 2),
      backgroundColor: '#f39c12',
      //yellow
      borderColor: '#f39c12' //yellow

    }, {
      title: 'Meeting',
      start: new Date(y, m, d, 10, 30),
      allDay: false,
      backgroundColor: '#0073b7',
      //Blue
      borderColor: '#0073b7' //Blue

    }, {
      title: 'Lunch',
      start: new Date(y, m, d, 12, 0),
      end: new Date(y, m, d, 14, 0),
      allDay: false,
      backgroundColor: '#00c0ef',
      //Info (aqua)
      borderColor: '#00c0ef' //Info (aqua)

    }, {
      title: 'Birthday Party',
      start: new Date(y, m, d + 1, 19, 0),
      end: new Date(y, m, d + 1, 22, 30),
      allDay: false,
      backgroundColor: '#00a65a',
      //Success (green)
      borderColor: '#00a65a' //Success (green)

    }, {
      title: 'Open Google',
      start: new Date(y, m, 28),
      end: new Date(y, m, 29),
      url: '//google.com/',
      backgroundColor: '#3c8dbc',
      //Primary (light-blue)
      borderColor: '#3c8dbc' //Primary (light-blue)

    }];
  }
})(); // JQCloud
// -----------------------------------


(function () {
  'use strict';

  $(initWordCloud);

  function initWordCloud() {
    if (!$.fn.jQCloud) return; //Create an array of word objects, each representing a word in the cloud

    var word_array = [{
      text: 'Lorem',
      weight: 13
      /*link: 'http://themicon.co'*/

    }, {
      text: 'Ipsum',
      weight: 10.5
    }, {
      text: 'Dolor',
      weight: 9.4
    }, {
      text: 'Sit',
      weight: 8
    }, {
      text: 'Amet',
      weight: 6.2
    }, {
      text: 'Consectetur',
      weight: 5
    }, {
      text: 'Adipiscing',
      weight: 5
    }, {
      text: 'Sit',
      weight: 8
    }, {
      text: 'Amet',
      weight: 6.2
    }, {
      text: 'Consectetur',
      weight: 5
    }, {
      text: 'Adipiscing',
      weight: 5
    }];
    $("#jqcloud").jQCloud(word_array, {
      width: 240,
      height: 200,
      steps: 7
    });
  }
})(); // Search Results
// -----------------------------------


(function () {
  'use strict';

  $(initSearch);

  function initSearch() {
    if (!$.fn.slider) return;
    if (!$.fn.chosen) return;
    if (!$.fn.datepicker) return; // BOOTSTRAP SLIDER CTRL
    // -----------------------------------

    $('[data-ui-slider]').slider(); // CHOSEN
    // -----------------------------------

    $('.chosen-select').chosen(); // DATETIMEPICKER
    // -----------------------------------

    $('#datetimepicker').datepicker({
      orientation: 'bottom',
      icons: {
        time: 'fa fa-clock-o',
        date: 'fa fa-calendar',
        up: 'fa fa-chevron-up',
        down: 'fa fa-chevron-down',
        previous: 'fa fa-chevron-left',
        next: 'fa fa-chevron-right',
        today: 'fa fa-crosshairs',
        clear: 'fa fa-trash'
      }
    });
  }
})(); // Color picker
// -----------------------------------


(function () {
  'use strict';

  $(initColorPicker);

  function initColorPicker() {
    if (!$.fn.colorpicker) return;
    $('.demo-colorpicker').colorpicker();
    $('#demo_selectors').colorpicker({
      colorSelectors: {
        'default': '#777777',
        'primary': APP_COLORS['primary'],
        'success': APP_COLORS['success'],
        'info': APP_COLORS['info'],
        'warning': APP_COLORS['warning'],
        'danger': APP_COLORS['danger']
      }
    });
  }
})(); // Forms Demo
// -----------------------------------


(function () {
  'use strict';

  $(initFormsDemo);

  function initFormsDemo() {
    if (!$.fn.slider) return;
    if (!$.fn.chosen) return;
    if (!$.fn.inputmask) return;
    if (!$.fn.filestyle) return;
    if (!$.fn.wysiwyg) return;
    if (!$.fn.datepicker) return; // BOOTSTRAP SLIDER CTRL
    // -----------------------------------

    $('[data-ui-slider]').slider(); // CHOSEN
    // -----------------------------------

    $('.chosen-select').chosen(); // MASKED
    // -----------------------------------

    $('[data-masked]').inputmask(); // FILESTYLE
    // -----------------------------------

    $('.filestyle').filestyle(); // WYSIWYG
    // -----------------------------------

    $('.wysiwyg').wysiwyg(); // DATETIMEPICKER
    // -----------------------------------

    $('#datetimepicker1').datepicker({
      orientation: 'bottom',
      icons: {
        time: 'fa fa-clock-o',
        date: 'fa fa-calendar',
        up: 'fa fa-chevron-up',
        down: 'fa fa-chevron-down',
        previous: 'fa fa-chevron-left',
        next: 'fa fa-chevron-right',
        today: 'fa fa-crosshairs',
        clear: 'fa fa-trash'
      }
    }); // only time

    $('#datetimepicker2').datepicker({
      format: 'mm-dd-yyyy'
    });
  }
})();
/**=========================================================
 * Module: Image Cropper
 =========================================================*/


(function () {
  'use strict';

  $(initImageCropper);

  function initImageCropper() {
    if (!$.fn.cropper) return;
    var $image = $('.img-container > img'),
        $dataX = $('#dataX'),
        $dataY = $('#dataY'),
        $dataHeight = $('#dataHeight'),
        $dataWidth = $('#dataWidth'),
        $dataRotate = $('#dataRotate'),
        options = {
      // data: {
      //   x: 420,
      //   y: 60,
      //   width: 640,
      //   height: 360
      // },
      // strict: false,
      // responsive: false,
      // checkImageOrigin: false
      // modal: false,
      // guides: false,
      // highlight: false,
      // background: false,
      // autoCrop: false,
      // autoCropArea: 0.5,
      // dragCrop: false,
      // movable: false,
      // rotatable: false,
      // zoomable: false,
      // touchDragZoom: false,
      // mouseWheelZoom: false,
      // cropBoxMovable: false,
      // cropBoxResizable: false,
      // doubleClickToggle: false,
      // minCanvasWidth: 320,
      // minCanvasHeight: 180,
      // minCropBoxWidth: 160,
      // minCropBoxHeight: 90,
      // minContainerWidth: 320,
      // minContainerHeight: 180,
      // build: null,
      // built: null,
      // dragstart: null,
      // dragmove: null,
      // dragend: null,
      // zoomin: null,
      // zoomout: null,
      aspectRatio: 16 / 9,
      preview: '.img-preview',
      crop: function crop(data) {
        $dataX.val(Math.round(data.x));
        $dataY.val(Math.round(data.y));
        $dataHeight.val(Math.round(data.height));
        $dataWidth.val(Math.round(data.width));
        $dataRotate.val(Math.round(data.rotate));
      }
    };
    $image.on({
      'build.cropper': function buildCropper(e) {
        console.log(e.type);
      },
      'built.cropper': function builtCropper(e) {
        console.log(e.type);
      },
      'dragstart.cropper': function dragstartCropper(e) {
        console.log(e.type, e.dragType);
      },
      'dragmove.cropper': function dragmoveCropper(e) {
        console.log(e.type, e.dragType);
      },
      'dragend.cropper': function dragendCropper(e) {
        console.log(e.type, e.dragType);
      },
      'zoomin.cropper': function zoominCropper(e) {
        console.log(e.type);
      },
      'zoomout.cropper': function zoomoutCropper(e) {
        console.log(e.type);
      },
      'change.cropper': function changeCropper(e) {
        console.log(e.type);
      }
    }).cropper(options); // Methods

    $(document.body).on('click', '[data-method]', function () {
      var data = $(this).data(),
          $target,
          result;

      if (!$image.data('cropper')) {
        return;
      }

      if (data.method) {
        data = $.extend({}, data); // Clone a new one

        if (typeof data.target !== 'undefined') {
          $target = $(data.target);

          if (typeof data.option === 'undefined') {
            try {
              data.option = JSON.parse($target.val());
            } catch (e) {
              console.log(e.message);
            }
          }
        }

        result = $image.cropper(data.method, data.option);

        if (data.method === 'getCroppedCanvas') {
          $('#getCroppedCanvasModal').modal().find('.modal-body').html(result);
        }

        if ($.isPlainObject(result) && $target) {
          try {
            $target.val(JSON.stringify(result));
          } catch (e) {
            console.log(e.message);
          }
        }
      }
    }).on('keydown', function (e) {
      if (!$image.data('cropper')) {
        return;
      }

      switch (e.which) {
        case 37:
          e.preventDefault();
          $image.cropper('move', -1, 0);
          break;

        case 38:
          e.preventDefault();
          $image.cropper('move', 0, -1);
          break;

        case 39:
          e.preventDefault();
          $image.cropper('move', 1, 0);
          break;

        case 40:
          e.preventDefault();
          $image.cropper('move', 0, 1);
          break;
      }
    }); // Import image

    var $inputImage = $('#inputImage'),
        URL = window.URL || window.webkitURL,
        blobURL;

    if (URL) {
      $inputImage.change(function () {
        var files = this.files,
            file;

        if (!$image.data('cropper')) {
          return;
        }

        if (files && files.length) {
          file = files[0];

          if (/^image\/\w+$/.test(file.type)) {
            blobURL = URL.createObjectURL(file);
            $image.one('built.cropper', function () {
              URL.revokeObjectURL(blobURL); // Revoke when load complete
            }).cropper('reset').cropper('replace', blobURL);
            $inputImage.val('');
          } else {
            alert('Please choose an image file.');
          }
        }
      });
    } else {
      $inputImage.parent().remove();
    } // Options


    $('.docs-options :checkbox').on('change', function () {
      var $this = $(this);

      if (!$image.data('cropper')) {
        return;
      }

      options[$this.val()] = $this.prop('checked');
      $image.cropper('destroy').cropper(options);
    }); // Tooltips

    $('[data-toggle="tooltip"]').tooltip();
  }
})(); // Select2
// -----------------------------------


(function () {
  'use strict';

  $(initSelect2);

  function initSelect2() {
    if (!$.fn.select2) return; // Select 2

    $('#select2-1').select2({
      theme: 'bootstrap4'
    });
    $('#select2-2').select2({
      theme: 'bootstrap4'
    });
    $('#select2-3').select2({
      theme: 'bootstrap4'
    });
    $('#select2-4').select2({
      placeholder: 'Select a state',
      allowClear: true,
      theme: 'bootstrap4'
    });
  }
})();

(function () {
  'use strict';

  if (typeof Dropzone === 'undefined') return; // Prevent Dropzone from auto discovering
  // This is useful when you want to create the
  // Dropzone programmatically later

  Dropzone.autoDiscover = false;
  $(initDropzone);

  function initDropzone() {
    // Dropzone settings
    var dropzoneOptions = {
      autoProcessQueue: false,
      uploadMultiple: true,
      parallelUploads: 100,
      maxFiles: 100,
      dictDefaultMessage: '<em class="fa fa-upload text-muted"></em><br>Drop files here to upload',
      // default messages before first drop
      paramName: 'file',
      // The name that will be used to transfer the file
      maxFilesize: 2,
      // MB
      addRemoveLinks: true,
      accept: function accept(file, done) {
        if (file.name === 'justinbieber.jpg') {
          done('Naha, you dont. :)');
        } else {
          done();
        }
      },
      init: function init() {
        var dzHandler = this;
        this.element.querySelector('button[type=submit]').addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          dzHandler.processQueue();
        });
        this.on('addedfile', function (file) {
          console.log('Added file: ' + file.name);
        });
        this.on('removedfile', function (file) {
          console.log('Removed file: ' + file.name);
        });
        this.on('sendingmultiple', function () {});
        this.on('successmultiple', function ()
        /*files, response*/
        {});
        this.on('errormultiple', function ()
        /*files, response*/
        {});
      }
    };
    var dropzoneArea = new Dropzone('#dropzone-area', dropzoneOptions);
  }
})(); // Forms Demo
// -----------------------------------


(function () {
  'use strict';

  $(initWizard);

  function initWizard() {
    if (!$.fn.validate) return; // FORM EXAMPLE
    // -----------------------------------

    var form = $("#example-form");
    form.validate({
      errorPlacement: function errorPlacement(error, element) {
        element.before(error);
      },
      rules: {
        confirm: {
          equalTo: "#password"
        }
      }
    });
    form.children("div").steps({
      headerTag: "h4",
      bodyTag: "fieldset",
      transitionEffect: "slideLeft",
      onStepChanging: function onStepChanging(event, currentIndex, newIndex) {
        form.validate().settings.ignore = ":disabled,:hidden";
        return form.valid();
      },
      onFinishing: function onFinishing(event, currentIndex) {
        form.validate().settings.ignore = ":disabled";
        return form.valid();
      },
      onFinished: function onFinished(event, currentIndex) {
        alert("Submitted!"); // Submit form

        $(this).submit();
      }
    }); // VERTICAL
    // -----------------------------------

    $("#example-vertical").steps({
      headerTag: "h4",
      bodyTag: "section",
      transitionEffect: "slideLeft",
      stepsOrientation: "vertical"
    });
  }
})(); // Xeditable Demo
// -----------------------------------


(function () {
  'use strict';

  $(initXEditable);

  function initXEditable() {
    if (!$.fn.editable) return; // Font Awesome support

    $.fn.editableform.buttons = '<button type="submit" class="btn btn-primary btn-sm editable-submit">' + '<i class="fa fa-fw fa-check"></i>' + '</button>' + '<button type="button" class="btn btn-default btn-sm editable-cancel">' + '<i class="fa fa-fw fa-times"></i>' + '</button>'; //defaults
    //$.fn.editable.defaults.url = 'url/to/server';
    //enable / disable

    $('#enable').click(function () {
      $('#user .editable').editable('toggleDisabled');
    }); //editables

    $('#username').editable({
      // url: 'url/to/server',
      type: 'text',
      pk: 1,
      name: 'username',
      title: 'Enter username',
      mode: 'inline'
    });
    $('#firstname').editable({
      validate: function validate(value) {
        if ($.trim(value) === '') return 'This field is required';
      },
      mode: 'inline'
    });
    $('#sex').editable({
      prepend: "not selected",
      source: [{
        value: 1,
        text: 'Male'
      }, {
        value: 2,
        text: 'Female'
      }],
      display: function display(value, sourceData) {
        var colors = {
          "": "gray",
          1: "green",
          2: "blue"
        },
            elem = $.grep(sourceData, function (o) {
          return o.value == value;
        });

        if (elem.length) {
          $(this).text(elem[0].text).css("color", colors[value]);
        } else {
          $(this).empty();
        }
      },
      mode: 'inline'
    });
    $('#status').editable({
      mode: 'inline'
    });
    $('#group').editable({
      showbuttons: false,
      mode: 'inline'
    });
    $('#dob').editable({
      mode: 'inline'
    });
    $('#event').editable({
      placement: 'right',
      combodate: {
        firstItem: 'name'
      },
      mode: 'inline'
    });
    $('#comments').editable({
      showbuttons: 'bottom',
      mode: 'inline'
    });
    $('#note').editable({
      mode: 'inline'
    });
    $('#pencil').click(function (e) {
      e.stopPropagation();
      e.preventDefault();
      $('#note').editable('toggle');
    });
    $('#user .editable').on('hidden', function (e, reason) {
      if (reason === 'save' || reason === 'nochange') {
        var $next = $(this).closest('tr').next().find('.editable');

        if ($('#autoopen').is(':checked')) {
          setTimeout(function () {
            $next.editable('show');
          }, 300);
        } else {
          $next.focus();
        }
      }
    }); // TABLE
    // -----------------------------------

    $('#users a').editable({
      type: 'text',
      name: 'username',
      title: 'Enter username',
      mode: 'inline'
    });
  }
})();
/**=========================================================
 * Module: gmap.js
 * Init Google Map plugin
 =========================================================*/


(function () {
  'use strict';

  $(initGoogleMaps); // -------------------------
  // Map Style definition
  // -------------------------
  // Get more styles from http://snazzymaps.com/style/29/light-monochrome
  // - Just replace and assign to 'MapStyles' the new style array

  var MapStyles = [{
    featureType: 'water',
    stylers: [{
      visibility: 'on'
    }, {
      color: '#bdd1f9'
    }]
  }, {
    featureType: 'all',
    elementType: 'labels.text.fill',
    stylers: [{
      color: '#334165'
    }]
  }, {
    featureType: 'landscape',
    stylers: [{
      color: '#e9ebf1'
    }]
  }, {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{
      color: '#c5c6c6'
    }]
  }, {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{
      color: '#fff'
    }]
  }, {
    featureType: 'road.local',
    elementType: 'geometry',
    stylers: [{
      color: '#fff'
    }]
  }, {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{
      color: '#d8dbe0'
    }]
  }, {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{
      color: '#cfd5e0'
    }]
  }, {
    featureType: 'administrative',
    stylers: [{
      visibility: 'on'
    }, {
      lightness: 33
    }]
  }, {
    featureType: 'poi.park',
    elementType: 'labels',
    stylers: [{
      visibility: 'on'
    }, {
      lightness: 20
    }]
  }, {
    featureType: 'road',
    stylers: [{
      color: '#d8dbe0',
      lightness: 20
    }]
  }];

  function initGoogleMaps() {
    if (!$.fn.gMap) return;
    var mapSelector = '[data-gmap]';
    var gMapRefs = [];
    $(mapSelector).each(function () {
      var $this = $(this),
          addresses = $this.data('address') && $this.data('address').split(';'),
          titles = $this.data('title') && $this.data('title').split(';'),
          zoom = $this.data('zoom') || 14,
          maptype = $this.data('maptype') || 'ROADMAP',
          // or 'TERRAIN'
      markers = [];

      if (addresses) {
        for (var a in addresses) {
          if (typeof addresses[a] == 'string') {
            markers.push({
              address: addresses[a],
              html: titles && titles[a] || '',
              popup: true
              /* Always popup */

            });
          }
        }

        var options = {
          controls: {
            panControl: true,
            zoomControl: true,
            mapTypeControl: true,
            scaleControl: true,
            streetViewControl: true,
            overviewMapControl: true
          },
          scrollwheel: false,
          maptype: maptype,
          markers: markers,
          zoom: zoom // More options https://github.com/marioestrada/jQuery-gMap

        };
        var gMap = $this.gMap(options);
        var ref = gMap.data('gMap.reference'); // save in the map references list

        gMapRefs.push(ref); // set the styles

        if ($this.data('styled') !== undefined) {
          ref.setOptions({
            styles: MapStyles
          });
        }
      }
    }); //each
  }
})(); // jVectorMap
// -----------------------------------


(function () {
  'use strict';

  $(initVectorMap);

  function initVectorMap() {
    var element = $('[data-vector-map]');
    var seriesData = {
      'CA': 11100,
      // Canada
      'DE': 2510,
      // Germany
      'FR': 3710,
      // France
      'AU': 5710,
      // Australia
      'GB': 8310,
      // Great Britain
      'RU': 9310,
      // Russia
      'BR': 6610,
      // Brazil
      'IN': 7810,
      // India
      'CN': 4310,
      // China
      'US': 839,
      // USA
      'SA': 410 // Saudi Arabia

    };
    var markersData = [{
      latLng: [41.90, 12.45],
      name: 'Vatican City'
    }, {
      latLng: [43.73, 7.41],
      name: 'Monaco'
    }, {
      latLng: [-0.52, 166.93],
      name: 'Nauru'
    }, {
      latLng: [-8.51, 179.21],
      name: 'Tuvalu'
    }, {
      latLng: [7.11, 171.06],
      name: 'Marshall Islands'
    }, {
      latLng: [17.3, -62.73],
      name: 'Saint Kitts and Nevis'
    }, {
      latLng: [3.2, 73.22],
      name: 'Maldives'
    }, {
      latLng: [35.88, 14.5],
      name: 'Malta'
    }, {
      latLng: [41.0, -71.06],
      name: 'New England'
    }, {
      latLng: [12.05, -61.75],
      name: 'Grenada'
    }, {
      latLng: [13.16, -59.55],
      name: 'Barbados'
    }, {
      latLng: [17.11, -61.85],
      name: 'Antigua and Barbuda'
    }, {
      latLng: [-4.61, 55.45],
      name: 'Seychelles'
    }, {
      latLng: [7.35, 134.46],
      name: 'Palau'
    }, {
      latLng: [42.5, 1.51],
      name: 'Andorra'
    }];
    new VectorMap(element, seriesData, markersData);
  }
})(); // JVECTOR MAP
// -----------------------------------


(function () {
  'use strict'; // Allow Global access

  window.VectorMap = VectorMap;
  var defaultColors = {
    markerColor: '#23b7e5',
    // the marker points
    bgColor: 'transparent',
    // the background
    scaleColors: ['#878c9a'],
    // the color of the region in the serie
    regionFill: '#bbbec6' // the base region color

  };

  function VectorMap(element, seriesData, markersData) {
    if (!element || !element.length) return;
    var attrs = element.data(),
        mapHeight = attrs.height || '300',
        options = {
      markerColor: attrs.markerColor || defaultColors.markerColor,
      bgColor: attrs.bgColor || defaultColors.bgColor,
      scale: attrs.scale || 1,
      scaleColors: attrs.scaleColors || defaultColors.scaleColors,
      regionFill: attrs.regionFill || defaultColors.regionFill,
      mapName: attrs.mapName || 'world_mill_en'
    };
    element.css('height', mapHeight);
    init(element, options, seriesData, markersData);

    function init($element, opts, series, markers) {
      $element.vectorMap({
        map: opts.mapName,
        backgroundColor: opts.bgColor,
        zoomMin: 1,
        zoomMax: 8,
        zoomOnScroll: false,
        regionStyle: {
          initial: {
            'fill': opts.regionFill,
            'fill-opacity': 1,
            'stroke': 'none',
            'stroke-width': 1.5,
            'stroke-opacity': 1
          },
          hover: {
            'fill-opacity': 0.8
          },
          selected: {
            fill: 'blue'
          },
          selectedHover: {}
        },
        focusOn: {
          x: 0.4,
          y: 0.6,
          scale: opts.scale
        },
        markerStyle: {
          initial: {
            fill: opts.markerColor,
            stroke: opts.markerColor
          }
        },
        onRegionLabelShow: function onRegionLabelShow(e, el, code) {
          if (series && series[code]) el.html(el.html() + ': ' + series[code] + ' visitors');
        },
        markers: markers,
        series: {
          regions: [{
            values: series,
            scale: opts.scaleColors,
            normalizeFunction: 'polynomial'
          }]
        }
      });
    } // end init

  }

  ;
})();
/**
 * Used for user pages
 * Login and Register
 */


(function () {
  'use strict';

  $(initParsleyForPages);

  function initParsleyForPages() {
    // Parsley options setup for bootstrap validation classes
    var parsleyOptions = {
      errorClass: 'is-invalid',
      successClass: 'is-valid',
      classHandler: function classHandler(ParsleyField) {
        var el = ParsleyField.$element.parents('.form-group').find('input');
        if (!el.length) // support custom checkbox
          el = ParsleyField.$element.parents('.c-checkbox').find('label');
        return el;
      },
      errorsContainer: function errorsContainer(ParsleyField) {
        return ParsleyField.$element.parents('.form-group');
      },
      errorsWrapper: '<div class="text-help">',
      errorTemplate: '<div></div>'
    }; // Login form validation with Parsley

    var loginForm = $("#loginForm");
    if (loginForm.length) loginForm.parsley(parsleyOptions); // Register form validation with Parsley

    var registerForm = $("#registerForm");
    if (registerForm.length) registerForm.parsley(parsleyOptions);
  }
})(); // BOOTGRID
// -----------------------------------


(function () {
  'use strict';

  $(initBootgrid);

  function initBootgrid() {
    if (!$.fn.bootgrid) return;
    $('#bootgrid-basic').bootgrid({
      templates: {
        // templates for BS4
        actionButton: '<button class="btn btn-secondary" type="button" title="{{ctx.text}}">{{ctx.content}}</button>',
        actionDropDown: '<div class="{{css.dropDownMenu}}"><button class="btn btn-secondary dropdown-toggle dropdown-toggle-nocaret" type="button" data-toggle="dropdown"><span class="{{css.dropDownMenuText}}">{{ctx.content}}</span></button><ul class="{{css.dropDownMenuItems}}" role="menu"></ul></div>',
        actionDropDownItem: '<li class="dropdown-item"><a href="" data-action="{{ctx.action}}" class="dropdown-link {{css.dropDownItemButton}}">{{ctx.text}}</a></li>',
        actionDropDownCheckboxItem: '<li class="dropdown-item"><label class="dropdown-item p-0"><input name="{{ctx.name}}" type="checkbox" value="1" class="{{css.dropDownItemCheckbox}}" {{ctx.checked}} /> {{ctx.label}}</label></li>',
        paginationItem: '<li class="page-item {{ctx.css}}"><a href="" data-page="{{ctx.page}}" class="page-link {{css.paginationButton}}">{{ctx.text}}</a></li>'
      }
    });
    $('#bootgrid-selection').bootgrid({
      selection: true,
      multiSelect: true,
      rowSelect: true,
      keepSelection: true,
      templates: {
        select: '<div class="custom-control custom-checkbox">' + '<input type="{{ctx.type}}" class="custom-control-input {{css.selectBox}}" id="customCheck1" value="{{ctx.value}}" {{ctx.checked}}>' + '<label class="custom-control-label" for="customCheck1"></label>' + '</div>',
        // templates for BS4
        actionButton: '<button class="btn btn-secondary" type="button" title="{{ctx.text}}">{{ctx.content}}</button>',
        actionDropDown: '<div class="{{css.dropDownMenu}}"><button class="btn btn-secondary dropdown-toggle dropdown-toggle-nocaret" type="button" data-toggle="dropdown"><span class="{{css.dropDownMenuText}}">{{ctx.content}}</span></button><ul class="{{css.dropDownMenuItems}}" role="menu"></ul></div>',
        actionDropDownItem: '<li class="dropdown-item"><a href="" data-action="{{ctx.action}}" class="dropdown-link {{css.dropDownItemButton}}">{{ctx.text}}</a></li>',
        actionDropDownCheckboxItem: '<li class="dropdown-item"><label class="dropdown-item p-0"><input name="{{ctx.name}}" type="checkbox" value="1" class="{{css.dropDownItemCheckbox}}" {{ctx.checked}} /> {{ctx.label}}</label></li>',
        paginationItem: '<li class="page-item {{ctx.css}}"><a href="" data-page="{{ctx.page}}" class="page-link {{css.paginationButton}}">{{ctx.text}}</a></li>'
      }
    });
    var grid = $('#bootgrid-command').bootgrid({
      formatters: {
        commands: function commands(column, row) {
          return '<button type="button" class="btn btn-sm btn-info mr-2 command-edit" data-row-id="' + row.id + '"><em class="fa fa-edit fa-fw"></em></button>' + '<button type="button" class="btn btn-sm btn-danger command-delete" data-row-id="' + row.id + '"><em class="fa fa-trash fa-fw"></em></button>';
        }
      },
      templates: {
        // templates for BS4
        actionButton: '<button class="btn btn-secondary" type="button" title="{{ctx.text}}">{{ctx.content}}</button>',
        actionDropDown: '<div class="{{css.dropDownMenu}}"><button class="btn btn-secondary dropdown-toggle dropdown-toggle-nocaret" type="button" data-toggle="dropdown"><span class="{{css.dropDownMenuText}}">{{ctx.content}}</span></button><ul class="{{css.dropDownMenuItems}}" role="menu"></ul></div>',
        actionDropDownItem: '<li class="dropdown-item"><a href="" data-action="{{ctx.action}}" class="dropdown-link {{css.dropDownItemButton}}">{{ctx.text}}</a></li>',
        actionDropDownCheckboxItem: '<li class="dropdown-item"><label class="dropdown-item p-0"><input name="{{ctx.name}}" type="checkbox" value="1" class="{{css.dropDownItemCheckbox}}" {{ctx.checked}} /> {{ctx.label}}</label></li>',
        paginationItem: '<li class="page-item {{ctx.css}}"><a href="" data-page="{{ctx.page}}" class="page-link {{css.paginationButton}}">{{ctx.text}}</a></li>'
      }
    }).on('loaded.rs.jquery.bootgrid', function () {
      /* Executes after data is loaded and rendered */
      grid.find('.command-edit').on('click', function () {
        console.log('You pressed edit on row: ' + $(this).data('row-id'));
      }).end().find('.command-delete').on('click', function () {
        console.log('You pressed delete on row: ' + $(this).data('row-id'));
      });
    });
  }
})(); // DATATABLES
// -----------------------------------


(function () {
  'use strict';

  $(initDatatables);

  function initDatatables() {
    if (!$.fn.DataTable) return; // Zero configuration

    $('#datatable1').DataTable({
      'paging': true,
      // Table pagination
      'ordering': true,
      // Column ordering
      'info': true,
      // Bottom left status text
      responsive: true,
      // Text translation options
      // Note the required keywords between underscores (e.g _MENU_)
      oLanguage: {
        sSearch: '<em class="fas fa-search"></em>',
        sLengthMenu: '_MENU_ records per page',
        info: 'Showing page _PAGE_ of _PAGES_',
        zeroRecords: 'Nothing found - sorry',
        infoEmpty: 'No records available',
        infoFiltered: '(filtered from _MAX_ total records)',
        oPaginate: {
          sNext: '<em class="fa fa-caret-right"></em>',
          sPrevious: '<em class="fa fa-caret-left"></em>'
        }
      }
    }); // Filter

    $('#datatable2').DataTable({
      'paging': true,
      // Table pagination
      'ordering': true,
      // Column ordering
      'info': true,
      // Bottom left status text
      responsive: true,
      // Text translation options
      // Note the required keywords between underscores (e.g _MENU_)
      oLanguage: {
        sSearch: 'Search all columns:',
        sLengthMenu: '_MENU_ records per page',
        info: 'Showing page _PAGE_ of _PAGES_',
        zeroRecords: 'Nothing found - sorry',
        infoEmpty: 'No records available',
        infoFiltered: '(filtered from _MAX_ total records)',
        oPaginate: {
          sNext: '<em class="fa fa-caret-right"></em>',
          sPrevious: '<em class="fa fa-caret-left"></em>'
        }
      },
      // Datatable Buttons setup
      dom: 'Bfrtip',
      buttons: [{
        extend: 'copy',
        className: 'btn-info'
      }, {
        extend: 'csv',
        className: 'btn-info'
      }, {
        extend: 'excel',
        className: 'btn-info',
        title: 'XLS-File'
      }, {
        extend: 'pdf',
        className: 'btn-info',
        title: $('title').text()
      }, {
        extend: 'print',
        className: 'btn-info'
      }]
    });
    $('#datatable3').DataTable({
      'paging': true,
      // Table pagination
      'ordering': true,
      // Column ordering
      'info': true,
      // Bottom left status text
      responsive: true,
      // Text translation options
      // Note the required keywords between underscores (e.g _MENU_)
      oLanguage: {
        sSearch: 'Search all columns:',
        sLengthMenu: '_MENU_ records per page',
        info: 'Showing page _PAGE_ of _PAGES_',
        zeroRecords: 'Nothing found - sorry',
        infoEmpty: 'No records available',
        infoFiltered: '(filtered from _MAX_ total records)',
        oPaginate: {
          sNext: '<em class="fa fa-caret-right"></em>',
          sPrevious: '<em class="fa fa-caret-left"></em>'
        }
      },
      // Datatable key setup
      keys: true
    });
  }
})(); // Custom Code
// -----------------------------------


(function () {
  'use strict';

  $(initCustom);

  function initCustom() {// custom code
  }
})();
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndyYXBwZXIuanMiLCJhcHAuaW5pdC5qcyIsImNoYXJ0cy9jaGFydC1rbm9iLmpzIiwiY2hhcnRzL2NoYXJ0LmpzIiwiY2hhcnRzL2NoYXJ0aXN0LmpzIiwiY2hhcnRzL2Vhc3lwaWVjaGFydC5qcyIsImNoYXJ0cy9mbG90LmpzIiwiY2hhcnRzL21vcnJpcy5qcyIsImNoYXJ0cy9yaWNrc2hhdy5qcyIsImNoYXJ0cy9zcGFya2xpbmUuanMiLCJjb21tb24vYm9vdHN0cmFwLXN0YXJ0LmpzIiwiY29tbW9uL2NhcmQtdG9vbHMuanMiLCJjb21tb24vY29uc3RhbnRzLmpzIiwiY29tbW9uL2Z1bGxzY3JlZW4uanMiLCJjb21tb24vbG9hZC1jc3MuanMiLCJjb21tb24vbG9jYWxpemUuanMiLCJjb21tb24vbmF2YmFyLXNlYXJjaC5qcyIsImNvbW1vbi9ub3cuanMiLCJjb21tb24vcnRsLmpzIiwiY29tbW9uL3NpZGViYXIuanMiLCJjb21tb24vc2xpbXNjcm9sbC5qcyIsImNvbW1vbi90YWJsZS1jaGVja2FsbC5qcyIsImNvbW1vbi90b2dnbGUtc3RhdGUuanMiLCJjb21tb24vdHJpZ2dlci1yZXNpemUuanMiLCJlbGVtZW50cy9jYXJkcy5qcyIsImVsZW1lbnRzL25lc3RhYmxlLmpzIiwiZWxlbWVudHMvbm90aWZ5LmpzIiwiZWxlbWVudHMvcG9ybGV0cy5qcyIsImVsZW1lbnRzL3NvcnRhYmxlLmpzIiwiZWxlbWVudHMvc3dlZXRhbGVydC5qcyIsImV4dHJhcy9jYWxlbmRhci5qcyIsImV4dHJhcy9qcWNsb3VkLmpzIiwiZXh0cmFzL3NlYXJjaC5qcyIsImZvcm1zL2NvbG9yLXBpY2tlci5qcyIsImZvcm1zL2Zvcm1zLmpzIiwiZm9ybXMvaW1hZ2Vjcm9wLmpzIiwiZm9ybXMvc2VsZWN0Mi5qcyIsImZvcm1zL3VwbG9hZC5qcyIsImZvcm1zL3dpemFyZC5qcyIsImZvcm1zL3hlZGl0YWJsZS5qcyIsIm1hcHMvZ21hcC5qcyIsIm1hcHMvdmVjdG9yLm1hcC5kZW1vLmpzIiwibWFwcy92ZWN0b3IubWFwLmpzIiwicGFnZXMvcGFnZXMuanMiLCJ0YWJsZXMvYm9vdGdyaWQuanMiLCJ0YWJsZXMvZGF0YXRhYmxlLmpzIiwiY3VzdG9tLmpzIl0sIm5hbWVzIjpbImdsb2JhbCIsImZhY3RvcnkiLCJleHBvcnRzIiwibW9kdWxlIiwialF1ZXJ5IiwiJCIsIndpbmRvdyIsImFycmF5RnJvbSIsIm9iaiIsInNsaWNlIiwiY2FsbCIsImZpbHRlciIsImN0eCIsImZuIiwibWFwIiwibWF0Y2hlcyIsIml0ZW0iLCJzZWxlY3RvciIsIkVsZW1lbnQiLCJwcm90b3R5cGUiLCJtc01hdGNoZXNTZWxlY3RvciIsIkV2ZW50SGFuZGxlciIsImV2ZW50cyIsImJpbmQiLCJldmVudCIsImxpc3RlbmVyIiwidGFyZ2V0IiwidHlwZSIsInNwbGl0IiwiYWRkRXZlbnRMaXN0ZW5lciIsInVuYmluZCIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJXcmFwIiwiX3NldHVwIiwiQ29uc3RydWN0b3IiLCJwYXJhbSIsImF0dHJzIiwiZWwiLCJpbml0IiwiY29uc3RydWN0b3IiLCJlbGVtIiwiX2NyZWF0ZSIsImF0dHIiLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJub2RlVHlwZSIsInJlYWR5Iiwic3RyIiwibm9kZU5hbWUiLCJzdWJzdHIiLCJpbmRleE9mIiwicmVwbGFjZSIsImNyZWF0ZUVsZW1lbnQiLCJlbGVtZW50cyIsImkiLCJsZW5ndGgiLCJfZmlyc3QiLCJjYiIsInJldCIsImYiLCJfY2xhc3NlcyIsIm1ldGhvZCIsImNsYXNzbmFtZSIsImNscyIsImZvckVhY2giLCJjbGFzc0xpc3QiLCJjb250YWlucyIsImVhY2giLCJfYWNjZXNzIiwia2V5IiwidmFsdWUiLCJrIiwidW5kZWZpbmVkIiwiYXJyIiwiZXh0ZW5kIiwibWV0aG9kcyIsIk9iamVjdCIsImtleXMiLCJtIiwiYXR0YWNoRXZlbnQiLCJyZWFkeVN0YXRlIiwiY3NzIiwiZ2V0U3R5bGUiLCJlIiwic3R5bGUiLCJnZXRDb21wdXRlZFN0eWxlIiwidmFsIiwidW5pdCIsImdldEF0dHJpYnV0ZSIsInNldEF0dHJpYnV0ZSIsInByb3AiLCJwb3NpdGlvbiIsImxlZnQiLCJvZmZzZXRMZWZ0IiwidG9wIiwib2Zmc2V0VG9wIiwic2Nyb2xsVG9wIiwib3V0ZXJIZWlnaHQiLCJpbmNsdWRlTWFyZ2luIiwibWFyZ2lucyIsInBhcnNlSW50IiwibWFyZ2luVG9wIiwibWFyZ2luQm90dG9tIiwib2Zmc2V0SGVpZ2h0IiwiaW5kZXgiLCJwYXJlbnROb2RlIiwiY2hpbGRyZW4iLCJjaGlsZHMiLCJjb25jYXQiLCJzaWJsaW5ncyIsInNpYnMiLCJjaGlsZCIsInBhcmVudCIsInBhciIsInBhcmVudHMiLCJwIiwicGFyZW50RWxlbWVudCIsInB1c2giLCJmaW5kIiwiZm91bmQiLCJmaXRlbSIsInJlcyIsImlzIiwiYXBwZW5kVG8iLCJhcHBlbmRDaGlsZCIsImFwcGVuZCIsImluc2VydEFmdGVyIiwicXVlcnlTZWxlY3RvciIsImluc2VydEJlZm9yZSIsIm5leHRTaWJsaW5nIiwiY2xvbmUiLCJjbG9uZXMiLCJjbG9uZU5vZGUiLCJyZW1vdmUiLCJkYXRhIiwicmVtb3ZlQ2hpbGQiLCJoYXNKU09OIiwiZGF0YUF0dHIiLCJ0b0xvd2VyQ2FzZSIsInRlc3QiLCJKU09OIiwicGFyc2UiLCJ0cmlnZ2VyIiwiY3JlYXRlRXZlbnQiLCJpbml0RXZlbnQiLCJkaXNwYXRjaEV2ZW50IiwiYmx1ciIsImZvY3VzIiwib24iLCJjYWxsYmFjayIsImV2Iiwib2ZmIiwidG9nZ2xlQ2xhc3MiLCJhZGRDbGFzcyIsInJlbW92ZUNsYXNzIiwiaGFzQ2xhc3MiLCJjb2xsYXBzZSIsImFjdGlvbiIsIiRpdGVtIiwiY3VycmVudFRhcmdldCIsInByZXZlbnREZWZhdWx0IiwidGFiUGFuZSIsImRkIiwiJGJvZHkiLCJTdGF0ZVRvZ2dsZXIiLCJyZXN0b3JlU3RhdGUiLCJpbml0S25vYiIsImtub2IiLCJrbm9iTG9hZGVyT3B0aW9uczEiLCJ3aWR0aCIsImRpc3BsYXlJbnB1dCIsImZnQ29sb3IiLCJBUFBfQ09MT1JTIiwia25vYkxvYWRlck9wdGlvbnMyIiwicmVhZE9ubHkiLCJrbm9iTG9hZGVyT3B0aW9uczMiLCJiZ0NvbG9yIiwiYW5nbGVPZmZzZXQiLCJhbmdsZUFyYyIsImtub2JMb2FkZXJPcHRpb25zNCIsImRpc3BsYXlQcmV2aW91cyIsInRoaWNrbmVzcyIsImxpbmVDYXAiLCJpbml0Q2hhcnRKUyIsIkNoYXJ0IiwickZhY3RvciIsIk1hdGgiLCJyb3VuZCIsInJhbmRvbSIsImxpbmVEYXRhIiwibGFiZWxzIiwiZGF0YXNldHMiLCJsYWJlbCIsImJhY2tncm91bmRDb2xvciIsImJvcmRlckNvbG9yIiwicG9pbnRCb3JkZXJDb2xvciIsImxpbmVPcHRpb25zIiwibGVnZW5kIiwiZGlzcGxheSIsImxpbmVjdHgiLCJnZXRFbGVtZW50QnlJZCIsImdldENvbnRleHQiLCJsaW5lQ2hhcnQiLCJvcHRpb25zIiwiYmFyRGF0YSIsImJhck9wdGlvbnMiLCJiYXJjdHgiLCJiYXJDaGFydCIsImRvdWdobnV0RGF0YSIsImhvdmVyQmFja2dyb3VuZENvbG9yIiwiZG91Z2hudXRPcHRpb25zIiwiZG91Z2hudXRjdHgiLCJkb3VnaG51dENoYXJ0IiwicGllRGF0YSIsInBpZU9wdGlvbnMiLCJwaWVjdHgiLCJwaWVDaGFydCIsInBvbGFyRGF0YSIsInBvbGFyT3B0aW9ucyIsInBvbGFyY3R4IiwicG9sYXJDaGFydCIsInJhZGFyRGF0YSIsInJhZGFyT3B0aW9ucyIsInJhZGFyY3R4IiwicmFkYXJDaGFydCIsImluaXRDaGFydGlzdHMiLCJDaGFydGlzdCIsImRhdGExIiwic2VyaWVzIiwib3B0aW9uczEiLCJoaWdoIiwibG93IiwiaGVpZ2h0IiwiYXhpc1giLCJsYWJlbEludGVycG9sYXRpb25GbmMiLCJCYXIiLCJzZXJpZXNCYXJEaXN0YW5jZSIsInJldmVyc2VEYXRhIiwiaG9yaXpvbnRhbEJhcnMiLCJheGlzWSIsIm9mZnNldCIsIkxpbmUiLCJmdWxsV2lkdGgiLCJjaGFydFBhZGRpbmciLCJyaWdodCIsImNoYXJ0MSIsInNob3dBcmVhIiwic2hvd1BvaW50IiwiZWxlbWVudCIsImFuaW1hdGUiLCJkIiwiYmVnaW4iLCJkdXIiLCJmcm9tIiwicGF0aCIsInNjYWxlIiwidHJhbnNsYXRlIiwiY2hhcnRSZWN0Iiwic3RyaW5naWZ5IiwidG8iLCJlYXNpbmciLCJTdmciLCJFYXNpbmciLCJlYXNlT3V0UXVpbnQiLCJjaGFydCIsInNlcSIsImRlbGF5cyIsImR1cmF0aW9ucyIsIm9wYWNpdHkiLCJheGlzIiwieSIsIngiLCJ4MSIsIngyIiwicG9zMUFuaW1hdGlvbiIsInVuaXRzIiwicG9zIiwicG9zMkFuaW1hdGlvbiIsImFuaW1hdGlvbnMiLCJfX2V4YW1wbGVBbmltYXRlVGltZW91dCIsImNsZWFyVGltZW91dCIsInNldFRpbWVvdXQiLCJ1cGRhdGUiLCJpbml0RWFzeVBpZUNoYXJ0IiwiZWFzeVBpZUNoYXJ0IiwiJGVsZW0iLCJwaWVPcHRpb25zMSIsImR1cmF0aW9uIiwiZW5hYmxlZCIsImJhckNvbG9yIiwidHJhY2tDb2xvciIsInNjYWxlQ29sb3IiLCJsaW5lV2lkdGgiLCJwaWVPcHRpb25zMiIsInBpZU9wdGlvbnMzIiwicGllT3B0aW9uczQiLCJpbml0RmxvdFNwbGluZSIsImRhdGF2MiIsImRhdGF2MyIsImxpbmVzIiwic2hvdyIsInBvaW50cyIsInJhZGl1cyIsInNwbGluZXMiLCJ0ZW5zaW9uIiwiZmlsbCIsImdyaWQiLCJib3JkZXJXaWR0aCIsImhvdmVyYWJsZSIsInRvb2x0aXAiLCJ0b29sdGlwT3B0cyIsImNvbnRlbnQiLCJ4YXhpcyIsInRpY2tDb2xvciIsIm1vZGUiLCJ5YXhpcyIsIm1pbiIsIm1heCIsInRpY2tGb3JtYXR0ZXIiLCJ2Iiwic2hhZG93U2l6ZSIsInBsb3QiLCJjaGFydHYyIiwiY2hhcnR2MyIsImluaXRGbG90QXJlYSIsImluaXRGbG90QmFyIiwiYmFycyIsImFsaWduIiwiYmFyV2lkdGgiLCJpbml0RmxvdEJhclN0YWNrZWQiLCJzdGFjayIsImluaXRGbG90RG9udXQiLCJwaWUiLCJpbm5lclJhZGl1cyIsImluaXRGbG90TGluZSIsImluaXRGbG90UGllIiwiZm9ybWF0dGVyIiwicGVyY2VudCIsImJhY2tncm91bmQiLCJjb2xvciIsImluaXRNb3JyaXMiLCJNb3JyaXMiLCJjaGFydGRhdGEiLCJhIiwiYiIsImRvbnV0ZGF0YSIsInhrZXkiLCJ5a2V5cyIsImxpbmVDb2xvcnMiLCJyZXNpemUiLCJEb251dCIsImNvbG9ycyIsInhMYWJlbE1hcmdpbiIsImJhckNvbG9ycyIsIkFyZWEiLCJSaWNrc2hhdyIsInNlcmllc0RhdGEiLCJGaXh0dXJlcyIsIlJhbmRvbURhdGEiLCJhZGREYXRhIiwic2VyaWVzMSIsIm5hbWUiLCJncmFwaDEiLCJHcmFwaCIsInJlbmRlcmVyIiwicmVuZGVyIiwiZ3JhcGgyIiwic3Ryb2tlIiwiZ3JhcGgzIiwiZ3JhcGg0IiwiaW5pdFNwYXJrbGluZSIsImluaXRTcGFya0xpbmUiLCIkZWxlbWVudCIsInZhbHVlcyIsImRpc2FibGVIaWRkZW5DaGVjayIsInNwYXJrbGluZSIsImluaXRCb290c3RyYXAiLCJwb3BvdmVyIiwiY29udGFpbmVyIiwic3RvcFByb3BhZ2F0aW9uIiwiaW5pdENhcmREaXNtaXNzIiwiaW5pdENhcmRDb2xsYXBzZSIsImluaXRDYXJkUmVmcmVzaCIsImdldENhcmRQYXJlbnQiLCJ0cmlnZ2VyRXZlbnQiLCJDdXN0b21FdmVudCIsImRldGFpbCIsImluaXRDdXN0b21FdmVudCIsImNhcmR0b29sU2VsZWN0b3IiLCJjYXJkTGlzdCIsIkNhcmREaXNtaXNzIiwiRVZFTlRfUkVNT1ZFIiwiRVZFTlRfUkVNT1ZFRCIsImNhcmRQYXJlbnQiLCJyZW1vdmluZyIsImNsaWNrSGFuZGxlciIsImNvbmZpcm0iLCJjYW5jZWwiLCJjbGFzc05hbWUiLCJpbml0aWFsU3RhdGUiLCJoYXNBdHRyaWJ1dGUiLCJDYXJkQ29sbGFwc2UiLCJzdGFydENvbGxhcHNlZCIsIkVWRU5UX1NIT1ciLCJFVkVOVF9ISURFIiwic3RhdGUiLCJ3cmFwcGVyIiwidG9nZ2xlQ29sbGFwc2UiLCJtYXhIZWlnaHQiLCJzY3JvbGxIZWlnaHQiLCJ1cGRhdGVJY29uIiwiZmlyc3RFbGVtZW50Q2hpbGQiLCJpbml0U3R5bGVzIiwidHJhbnNpdGlvbiIsIm92ZXJmbG93IiwiQ2FyZFJlZnJlc2giLCJFVkVOVF9SRUZSRVNIIiwiV0hJUkxfQ0xBU1MiLCJERUZBVUxUX1NQSU5ORVIiLCJzcGlubmVyIiwiZGF0YXNldCIsInJlZnJlc2giLCJjYXJkIiwic2hvd1NwaW5uZXIiLCJyZW1vdmVTcGlubmVyIiwiYWRkIiwicyIsIkFQUF9NRURJQVFVRVJZIiwiaW5pdFNjcmVlbkZ1bGwiLCJzY3JlZW5mdWxsIiwiJGRvYyIsIiRmc1RvZ2dsZXIiLCJ1YSIsIm5hdmlnYXRvciIsInVzZXJBZ2VudCIsIm1hdGNoIiwidG9nZ2xlIiwidG9nZ2xlRlNJY29uIiwiY29uc29sZSIsImxvZyIsInJhdyIsImZ1bGxzY3JlZW5jaGFuZ2UiLCJpc0Z1bGxzY3JlZW4iLCJpbml0TG9hZENTUyIsInVyaSIsImxpbmsiLCJjcmVhdGVMaW5rIiwiZXJyb3IiLCJsaW5rSWQiLCJvbGRMaW5rIiwiaW5pdFRyYW5zbGF0aW9uIiwicGF0aFByZWZpeCIsIlNUT1JBR0VLRVkiLCJzYXZlZExhbmd1YWdlIiwiU3RvcmFnZXMiLCJsb2NhbFN0b3JhZ2UiLCJnZXQiLCJpMThuZXh0IiwidXNlIiwiaTE4bmV4dFhIUkJhY2tlbmQiLCJmYWxsYmFja0xuZyIsImJhY2tlbmQiLCJsb2FkUGF0aCIsIm5zIiwiZGVmYXVsdE5TIiwiZGVidWciLCJlcnIiLCJ0IiwiYXBwbHlUcmFubGF0aW9ucyIsImF0dGFjaENoYW5nZUxpc3RlbmVyIiwibGlzdCIsImV4aXN0cyIsImlubmVySFRNTCIsInRhZ05hbWUiLCJsYW5nIiwiY2hhbmdlTGFuZ3VhZ2UiLCJzZXQiLCJhY3RpdmF0ZURyb3Bkb3duIiwicHJldmlvdXNFbGVtZW50U2libGluZyIsImluaXROYXZiYXJTZWFyY2giLCJuYXZTZWFyY2giLCJuYXZiYXJTZWFyY2hJbnB1dCIsIiRzZWFyY2hPcGVuIiwiJHNlYXJjaERpc21pc3MiLCJpbnB1dFNlbGVjdG9yIiwia2V5Q29kZSIsImRpc21pc3MiLCJuYXZiYXJGb3JtU2VsZWN0b3IiLCJuYXZiYXJGb3JtIiwiaXNPcGVuIiwiaW5pdE5vd1RpbWVyIiwibW9tZW50IiwiZm9ybWF0IiwidXBkYXRlVGltZSIsImR0IiwiRGF0ZSIsInRleHQiLCJzZXRJbnRlcnZhbCIsImluaXRSVEwiLCJtYWluY3NzIiwiYnNjc3MiLCJjaGVja2VkIiwiaW5pdFNpZGViYXIiLCIkaHRtbCIsIiRzaWRlYmFyIiwic2lkZWJhckNvbGxhcHNlIiwiY3VycmVudEl0ZW0iLCJ1c2VBc2lkZUhvdmVyIiwiZXZlbnROYW1lIiwiaXNUb3VjaCIsInN1Yk5hdiIsImlzU2lkZWJhckNvbGxhcHNlZCIsInRvZ2dsZU1lbnVJdGVtIiwic2lkZWJhckFkZEJhY2tkcm9wIiwic2lkZWJhckFueWNsaWNrQ2xvc2UiLCIkdGFyZ2V0IiwiJGJhY2tkcm9wIiwicmVtb3ZlRmxvYXRpbmdOYXYiLCJ0b2dnbGVUb3VjaEl0ZW0iLCIkbGlzdEl0ZW0iLCJ1bCIsIiRhc2lkZSIsIiRhc2lkZUlubmVyIiwibWFyIiwiaXRlbVRvcCIsInZ3SGVpZ2h0IiwiYm9keSIsImNsaWVudEhlaWdodCIsImlzRml4ZWQiLCJib3R0b20iLCJpc1NpZGViYXJUb2dnbGVkIiwiaXNNb2JpbGUiLCJjbGllbnRXaWR0aCIsInRhYmxldCIsImluaXRTbGltc1Nyb2xsIiwic2xpbVNjcm9sbCIsImRlZmF1bHRIZWlnaHQiLCJpbml0VGFibGVDaGVja0FsbCIsIiR0aGlzIiwiY2hlY2tib3giLCJ0YWJsZSIsImluaXRUb2dnbGVTdGF0ZSIsIm5vUGVyc2lzdCIsInJlbW92ZVN0YXRlIiwiYWRkU3RhdGUiLCJFdmVudCIsInJlc2l6ZUV2ZW50IiwiaW5pdFVJRXZlbnQiLCJTVE9SQUdFX0tFWV9OQU1FIiwiQXJyYXkiLCJzcGxpY2UiLCJqb2luIiwiaW5pdFRyaWdnZXJSZXNpemUiLCJldnQiLCJpbml0Q2FyZERlbW8iLCJpbml0TmVzdGFibGUiLCJuZXN0YWJsZSIsInVwZGF0ZU91dHB1dCIsIm91dHB1dCIsImdyb3VwIiwiaW5pdE5vdGlmeSIsIlNlbGVjdG9yIiwiYXV0b2xvYWRTZWxlY3RvciIsImRvYyIsIm9ubG9hZCIsIm5vdGlmeU5vdyIsIm1lc3NhZ2UiLCJub3RpZnkiLCJjb250YWluZXJzIiwibWVzc2FnZXMiLCJhcmd1bWVudHMiLCJzdGF0dXMiLCJNZXNzYWdlIiwiY2xvc2VBbGwiLCJpbnN0YW50bHkiLCJpZCIsImNsb3NlIiwiZGVmYXVsdHMiLCJ1dWlkIiwiZ2V0VGltZSIsImNlaWwiLCJjdXJyZW50c3RhdHVzIiwidGltb3V0IiwicHJlcGVuZCIsIm1hcmdpbmJvdHRvbSIsInRpbWVvdXQiLCJjbG9zZWZuIiwiaG92ZXIiLCJmaW5hbGl6ZSIsImhpZGUiLCJodG1sIiwiaW5pdFBvcnRsZXRzIiwic29ydGFibGUiLCJjb25uZWN0V2l0aCIsIml0ZW1zIiwiaGFuZGxlIiwicGxhY2Vob2xkZXIiLCJmb3JjZVBsYWNlaG9sZGVyU2l6ZSIsImlmcmFtZUZpeCIsInRvbGVyYW5jZSIsImhlbHBlciIsInJldmVydCIsImZvcmNlSGVscGVyU2l6ZSIsInNhdmVQb3J0bGV0T3JkZXIiLCJjcmVhdGUiLCJsb2FkUG9ydGxldE9yZGVyIiwidWkiLCJwb3JsZXRJZCIsImNhcmRzIiwicG9ydGxldCIsInJlc2V0UG9ybGV0cyIsImxvY2F0aW9uIiwicmVsb2FkIiwiaW5pdFNvcnRhYmxlIiwiaW5pdFN3ZWV0QWxlcnQiLCJzd2FsIiwidGl0bGUiLCJpY29uIiwiYnV0dG9ucyIsInZpc2libGUiLCJjbG9zZU1vZGFsIiwidGhlbiIsImlzQ29uZmlybSIsIkZ1bGxDYWxlbmRhciIsImluaXRFeHRlcm5hbEV2ZW50cyIsImluaXRGdWxsQ2FsZW5kYXIiLCJDYWxlbmRhciIsIkRyYWdnYWJsZSIsIkZ1bGxDYWxlbmRhckludGVyYWN0aW9uIiwiY29udGFpbmVyRWwiLCJpdGVtU2VsZWN0b3IiLCJldmVudERhdGEiLCJldmVudEVsIiwiaW5uZXJUZXh0IiwidHJpbSIsImNhbGVuZGFyRWwiLCJjYWxlbmRhciIsImNyZWF0ZURlbW9FdmVudHMiLCJwbHVnaW5zIiwidGhlbWVTeXN0ZW0iLCJoZWFkZXIiLCJjZW50ZXIiLCJlZGl0YWJsZSIsImRyb3BwYWJsZSIsImV2ZW50UmVjZWl2ZSIsImluZm8iLCJzdHlsZXMiLCJkcmFnZ2VkRWwiLCJzZXRQcm9wIiwiY29sb3JTZWxlY3RvckNvbnRhaW5lciIsImFkZEV2ZW50QnV0dG9uIiwiZXZlbnROYW1lSW5wdXQiLCJjb2xvclNlbGVjdG9ycyIsImN1cnJlbnRTZWxlY3RvciIsInNlbCIsInNlbGVjdENvbG9yU2VsZWN0b3IiLCJhZGROZXdFeHRlcm5hbEV2ZW50IiwidW5zZWxlY3RBbGxDb2xvclNlbGVjdG9yIiwiZmlyc3RDaGlsZCIsImJhc2VFbGVtZW50IiwiZGF0ZSIsImdldERhdGUiLCJnZXRNb250aCIsImdldEZ1bGxZZWFyIiwic3RhcnQiLCJlbmQiLCJhbGxEYXkiLCJ1cmwiLCJpbml0V29yZENsb3VkIiwialFDbG91ZCIsIndvcmRfYXJyYXkiLCJ3ZWlnaHQiLCJzdGVwcyIsImluaXRTZWFyY2giLCJzbGlkZXIiLCJjaG9zZW4iLCJkYXRlcGlja2VyIiwib3JpZW50YXRpb24iLCJpY29ucyIsInRpbWUiLCJ1cCIsImRvd24iLCJwcmV2aW91cyIsIm5leHQiLCJ0b2RheSIsImNsZWFyIiwiaW5pdENvbG9yUGlja2VyIiwiY29sb3JwaWNrZXIiLCJpbml0Rm9ybXNEZW1vIiwiaW5wdXRtYXNrIiwiZmlsZXN0eWxlIiwid3lzaXd5ZyIsImluaXRJbWFnZUNyb3BwZXIiLCJjcm9wcGVyIiwiJGltYWdlIiwiJGRhdGFYIiwiJGRhdGFZIiwiJGRhdGFIZWlnaHQiLCIkZGF0YVdpZHRoIiwiJGRhdGFSb3RhdGUiLCJhc3BlY3RSYXRpbyIsInByZXZpZXciLCJjcm9wIiwicm90YXRlIiwiZHJhZ1R5cGUiLCJyZXN1bHQiLCJvcHRpb24iLCJtb2RhbCIsImlzUGxhaW5PYmplY3QiLCJ3aGljaCIsIiRpbnB1dEltYWdlIiwiVVJMIiwid2Via2l0VVJMIiwiYmxvYlVSTCIsImNoYW5nZSIsImZpbGVzIiwiZmlsZSIsImNyZWF0ZU9iamVjdFVSTCIsIm9uZSIsInJldm9rZU9iamVjdFVSTCIsImFsZXJ0IiwiaW5pdFNlbGVjdDIiLCJzZWxlY3QyIiwidGhlbWUiLCJhbGxvd0NsZWFyIiwiRHJvcHpvbmUiLCJhdXRvRGlzY292ZXIiLCJpbml0RHJvcHpvbmUiLCJkcm9wem9uZU9wdGlvbnMiLCJhdXRvUHJvY2Vzc1F1ZXVlIiwidXBsb2FkTXVsdGlwbGUiLCJwYXJhbGxlbFVwbG9hZHMiLCJtYXhGaWxlcyIsImRpY3REZWZhdWx0TWVzc2FnZSIsInBhcmFtTmFtZSIsIm1heEZpbGVzaXplIiwiYWRkUmVtb3ZlTGlua3MiLCJhY2NlcHQiLCJkb25lIiwiZHpIYW5kbGVyIiwicHJvY2Vzc1F1ZXVlIiwiZHJvcHpvbmVBcmVhIiwiaW5pdFdpemFyZCIsInZhbGlkYXRlIiwiZm9ybSIsImVycm9yUGxhY2VtZW50IiwiYmVmb3JlIiwicnVsZXMiLCJlcXVhbFRvIiwiaGVhZGVyVGFnIiwiYm9keVRhZyIsInRyYW5zaXRpb25FZmZlY3QiLCJvblN0ZXBDaGFuZ2luZyIsImN1cnJlbnRJbmRleCIsIm5ld0luZGV4Iiwic2V0dGluZ3MiLCJpZ25vcmUiLCJ2YWxpZCIsIm9uRmluaXNoaW5nIiwib25GaW5pc2hlZCIsInN1Ym1pdCIsInN0ZXBzT3JpZW50YXRpb24iLCJpbml0WEVkaXRhYmxlIiwiZWRpdGFibGVmb3JtIiwiY2xpY2siLCJwayIsInNvdXJjZSIsInNvdXJjZURhdGEiLCJncmVwIiwibyIsImVtcHR5Iiwic2hvd2J1dHRvbnMiLCJwbGFjZW1lbnQiLCJjb21ib2RhdGUiLCJmaXJzdEl0ZW0iLCJyZWFzb24iLCIkbmV4dCIsImNsb3Nlc3QiLCJpbml0R29vZ2xlTWFwcyIsIk1hcFN0eWxlcyIsImZlYXR1cmVUeXBlIiwic3R5bGVycyIsInZpc2liaWxpdHkiLCJlbGVtZW50VHlwZSIsImxpZ2h0bmVzcyIsImdNYXAiLCJtYXBTZWxlY3RvciIsImdNYXBSZWZzIiwiYWRkcmVzc2VzIiwidGl0bGVzIiwiem9vbSIsIm1hcHR5cGUiLCJtYXJrZXJzIiwiYWRkcmVzcyIsInBvcHVwIiwiY29udHJvbHMiLCJwYW5Db250cm9sIiwiem9vbUNvbnRyb2wiLCJtYXBUeXBlQ29udHJvbCIsInNjYWxlQ29udHJvbCIsInN0cmVldFZpZXdDb250cm9sIiwib3ZlcnZpZXdNYXBDb250cm9sIiwic2Nyb2xsd2hlZWwiLCJyZWYiLCJzZXRPcHRpb25zIiwiaW5pdFZlY3Rvck1hcCIsIm1hcmtlcnNEYXRhIiwibGF0TG5nIiwiVmVjdG9yTWFwIiwiZGVmYXVsdENvbG9ycyIsIm1hcmtlckNvbG9yIiwic2NhbGVDb2xvcnMiLCJyZWdpb25GaWxsIiwibWFwSGVpZ2h0IiwibWFwTmFtZSIsIm9wdHMiLCJ2ZWN0b3JNYXAiLCJ6b29tTWluIiwiem9vbU1heCIsInpvb21PblNjcm9sbCIsInJlZ2lvblN0eWxlIiwiaW5pdGlhbCIsInNlbGVjdGVkIiwic2VsZWN0ZWRIb3ZlciIsImZvY3VzT24iLCJtYXJrZXJTdHlsZSIsIm9uUmVnaW9uTGFiZWxTaG93IiwiY29kZSIsInJlZ2lvbnMiLCJub3JtYWxpemVGdW5jdGlvbiIsImluaXRQYXJzbGV5Rm9yUGFnZXMiLCJwYXJzbGV5T3B0aW9ucyIsImVycm9yQ2xhc3MiLCJzdWNjZXNzQ2xhc3MiLCJjbGFzc0hhbmRsZXIiLCJQYXJzbGV5RmllbGQiLCJlcnJvcnNDb250YWluZXIiLCJlcnJvcnNXcmFwcGVyIiwiZXJyb3JUZW1wbGF0ZSIsImxvZ2luRm9ybSIsInBhcnNsZXkiLCJyZWdpc3RlckZvcm0iLCJpbml0Qm9vdGdyaWQiLCJib290Z3JpZCIsInRlbXBsYXRlcyIsImFjdGlvbkJ1dHRvbiIsImFjdGlvbkRyb3BEb3duIiwiYWN0aW9uRHJvcERvd25JdGVtIiwiYWN0aW9uRHJvcERvd25DaGVja2JveEl0ZW0iLCJwYWdpbmF0aW9uSXRlbSIsInNlbGVjdGlvbiIsIm11bHRpU2VsZWN0Iiwicm93U2VsZWN0Iiwia2VlcFNlbGVjdGlvbiIsInNlbGVjdCIsImZvcm1hdHRlcnMiLCJjb21tYW5kcyIsImNvbHVtbiIsInJvdyIsImluaXREYXRhdGFibGVzIiwiRGF0YVRhYmxlIiwicmVzcG9uc2l2ZSIsIm9MYW5ndWFnZSIsInNTZWFyY2giLCJzTGVuZ3RoTWVudSIsInplcm9SZWNvcmRzIiwiaW5mb0VtcHR5IiwiaW5mb0ZpbHRlcmVkIiwib1BhZ2luYXRlIiwic05leHQiLCJzUHJldmlvdXMiLCJkb20iLCJpbml0Q3VzdG9tIl0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7Ozs7Ozs7Ozs7Ozs7QUFjQSxXQUFBQSxNQUFBLEVBQUFDLE9BQUEsRUFBQTtBQUNBLE1BQUEsUUFBQUMsT0FBQSx5Q0FBQUEsT0FBQSxPQUFBLFFBQUEsRUFBQTtBQUFBO0FBQ0FDLElBQUFBLE1BQUEsQ0FBQUQsT0FBQSxHQUFBRCxPQUFBLEVBQUE7QUFDQSxHQUZBLE1BRUE7QUFBQTtBQUNBLFFBQUEsT0FBQUQsTUFBQSxDQUFBSSxNQUFBLEtBQUEsV0FBQSxFQUNBSixNQUFBLENBQUFLLENBQUEsR0FBQUosT0FBQSxFQUFBO0FBQ0E7QUFDQSxDQVBBLEVBT0FLLE1BUEEsRUFPQSxZQUFBO0FBRUE7QUFDQSxXQUFBQyxTQUFBLENBQUFDLEdBQUEsRUFBQTtBQUNBLFdBQUEsWUFBQUEsR0FBQSxJQUFBQSxHQUFBLEtBQUFGLE1BQUEsR0FBQSxHQUFBRyxLQUFBLENBQUFDLElBQUEsQ0FBQUYsR0FBQSxDQUFBLEdBQUEsQ0FBQUEsR0FBQSxDQUFBO0FBQ0E7O0FBRUEsV0FBQUcsT0FBQSxDQUFBQyxHQUFBLEVBQUFDLEVBQUEsRUFBQTtBQUNBLFdBQUEsR0FBQUYsTUFBQSxDQUFBRCxJQUFBLENBQUFFLEdBQUEsRUFBQUMsRUFBQSxDQUFBO0FBQ0E7O0FBRUEsV0FBQUMsR0FBQSxDQUFBRixHQUFBLEVBQUFDLEVB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QU5BLEVBNUJBLENBNENBO0FBQ0E7O0FBQ0EsUUFBQWQsUUFBQSxDQUFBZSxJQUFBLENBQUEsV0FBQSxFQUFBO0FBQ0FuRCxNQUFBQSxNQUFBLEVBQUEsQ0FBQSxRQUFBLEVBQUEsU0FBQSxFQUFBLFdBQUEsRUFBQSxVQUFBLEVBQUEsUUFBQSxDQURBO0FBRUFzQyxNQUFBQSxNQUFBLEVBQUEsQ0FDQSxDQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBREEsRUFFQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBRkEsRUFHQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSEE7QUFGQSxLQUFBLEVBT0E7QUFDQWMsTUFBQUEsU0FBQSxFQUFBLElBREE7QUFFQVYsTUFBQUEsTUFBQSxFQUFBLEdBRkE7QUFHQVcsTUFBQUEsWUFBQSxFQUFBO0FBQ0FDLFFBQUFBLEtBQUEsRUFBQTtBQURBO0FBSEEsS0FQQSxFQTlDQSxDQThEQTtBQUNBOztBQUVBLFFBQUFDLE1BQUEsR0FBQSxJQUFBbkIsUUFBQSxDQUFBZSxJQUFBLENBQUEsV0FBQSxFQUFBO0FBQ0FuRCxNQUFBQSxNQUFBLEVBQUEsQ0FBQSxLQUFBLEVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxLQUFBLEVBQUEsS0FBQSxFQUFBLEtBQUEsQ0FEQTtBQUVBc0MsTUFBQUEsTUFBQSxFQUFBLENBQ0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FEQSxFQUVBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBRkEsRUFHQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsR0FBQSxDQUhBO0FBRkEsS0FBQSxFQU9BO0FBQ0FHLE1BQUFBLEdBQUEsRUFBQSxDQURBO0FBRUFlLE1BQUFBLFFBQUEsRUFBQSxJQUZBO0FBR0FDLE1BQUFBLFNBQUEsRUFBQSxLQUhBO0FBSUFMLE1BQUFBLFNBQUEsRUFBQSxJQUpBO0FBS0FWLE1BQUFBLE1BQUEsRUFBQTtBQUxBLEtBUEEsQ0FBQTtBQWVBYSxJQUFBQSxNQUFBLENBQUFqRyxFQUFBLENBQUEsTUFBQSxFQUFBLFVBQUFkLElBQUEsRUFBQTtBQUNBLFVBQUFBLElBQUEsQ0FBQTNHLElBQUEsS0FBQSxNQUFBLElBQUEyRyxJQUFBLENBQUEzRyxJQUFBLEtBQUEsTUFBQSxFQUFBO0FBQ0EyRyxRQUFBQSxJQUFBLENBQUFrSCxPQUFBLENBQUFDLE9BQUEsQ0FBQTtBQUNBQyxVQUFBQSxDQUFBLEVBQUE7QUFDQUMsWUFBQUEsS0FBQSxFQUFBLE9BQUFySCxJQUFBLENBQUE5QixLQURBO0FBRUFvSixZQUFBQSxHQUFBLEVBQUEsSUFGQTtBQUdBQyxZQUFBQSxJQUFBLEVBQUF2SCxJQUFBLENBQUF3SCxJQUFBLENBQUE1SCxLQUFBLEdBQUE2SCxLQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQUMsU0FBQSxDQUFBLENBQUEsRUFBQTFILElBQUEsQ0FBQTJILFNBQUEsQ0FBQXpCLE1BQUEsRUFBQSxFQUFBMEIsU0FBQSxFQUhBO0FBSUFDLFlBQUFBLEVBQUEsRUFBQTdILElBQUEsQ0FBQXdILElBQUEsQ0FBQTVILEtBQUEsR0FBQWdJLFNBQUEsRUFKQTtBQUtBRSxZQUFBQSxNQUFBLEVBQUFsQyxRQUFBLENBQUFtQyxHQUFBLENBQUFDLE1BQUEsQ0FBQUM7QUFMQTtBQURBLFNBQUE7QUFTQTtBQUNBLEtBWkEsRUFoRkEsQ0ErRkE7QUFDQTs7QUFHQSxRQUFBQyxLQUFBLEdBQUEsSUFBQXRDLFFBQUEsQ0FBQWUsSUFBQSxDQUFBLFdBQUEsRUFBQTtBQUNBbkQsTUFBQUEsTUFBQSxFQUFBLENBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLENBREE7QUFFQXNDLE1BQUFBLE1BQUEsRUFBQSxDQUNBLENBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBREEsRUFFQSxDQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUZBLEVBR0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FIQSxFQUlBLENBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBSkE7QUFGQSxLQUFBLEVBUUE7QUFDQUcsTUFBQUEsR0FBQSxFQUFBLENBREE7QUFFQUMsTUFBQUEsTUFBQSxFQUFBO0FBRkEsS0FSQSxDQUFBLENBbkdBLENBZ0hBOztBQUNBLFFBQUFpQyxHQUFBLEdBQUEsQ0FBQTtBQUFBLFFBQ0FDLE1BQUEsR0FBQSxFQURBO0FBQUEsUUFFQUMsU0FBQSxHQUFBLEdBRkEsQ0FqSEEsQ0FxSEE7O0FBQ0FILElBQUFBLEtBQUEsQ0FBQXBILEVBQUEsQ0FBQSxTQUFBLEVBQUEsWUFBQTtBQUNBcUgsTUFBQUEsR0FBQSxHQUFBLENBQUE7QUFDQSxLQUZBLEVBdEhBLENBMEhBOztBQUNBRCxJQUFBQSxLQUFB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QUEsS0FBQSxFQUFBLEVBQUEsQ0FEQSxFQUVBLENBQUEsS0FBQSxFQUFBLEVBQUEsQ0FGQSxFQUdBLENBQUEsS0FBQSxFQUFBLEVBQUEsQ0FIQSxFQUlBLENBQUEsS0FBQSxFQUFBLEVBQUEsQ0FKQSxFQUtBLENBQUEsS0FBQSxFQUFBLEVBQUEsQ0FMQSxFQU1BLENBQUEsS0FBQSxFQUFBLEVBQUEsQ0FOQSxFQU9BLENBQUEsS0FBQSxFQUFBLEVBQUEsQ0FQQTtBQUhBLEtBWkEsQ0FBQTtBQTBCQSxRQUFBbUssTUFBQSxHQUFBLENBQUE7QUFDQSxlQUFBLE9BREE7QUFFQSxlQUFBLFNBRkE7QUFHQSxjQUFBLENBQ0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQURBLEVBRUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQUZBLEVBR0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQUhBLEVBSUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQUpBLEVBS0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQUxBLEVBTUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQU5BLEVBT0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQVBBLEVBUUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQVJBLEVBU0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQVRBLEVBVUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQVZBLEVBV0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQVhBLEVBWUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQVpBO0FBSEEsS0FBQSxFQWlCQTtBQUNBLGVBQUEsU0FEQTtBQUVBLGVBQUEsU0FGQTtBQUdBLGNBQUEsQ0FDQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBREEsRUFFQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBRkEsRUFHQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBSEEsRUFJQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBSkEsRUFLQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBTEEsRUFNQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBTkEsRUFPQSxDQUFBLEtBQUEsRUFB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Q0FBQSxLQUFBLEVBQUEsRUFBQSxDQVJBLEVBU0EsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQVRBLEVBVUEsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQVZBLEVBV0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQVhBLEVBWUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQVpBO0FBSEEsS0FqQkEsRUFrQ0E7QUFDQSxlQUFBLElBREE7QUFFQSxlQUFBLFNBRkE7QUFHQSxjQUFBLENBQ0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQURBLEVBRUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQUZBLEVBR0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQUhBLEVBSUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQUpBLEVBS0EsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUxBLEVBTUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQU5BLEVBT0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQVBBLEVBUUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQVJBLEVBU0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQVRBLEVBVUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQVZBLEVBV0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQVhBLEVBWUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQVpBO0FBSEEsS0FsQ0EsQ0FBQTtBQXFEQSxRQUFBbUssTUFBQSxHQUFBLENBQUE7QUFDQSxlQUFBLFNBREE7QUFFQSxlQUFBLFNBRkE7QUFHQSxjQUFBLENBQ0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQURBLEVBRUEsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQUZBLEVBR0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQUhBLEVBSUEsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQUpBLEVBS0EsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQUxBLEVBTUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQU5BLEVBT0EsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQVBBLEVBUUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQVJBLEVBU0EsQ0FBQSxLQUFBLEVBQUEsR0FBQSxDQVRBLEVBVUEsQ0FBQSxNQUFBLEVBQUEsRUFBQSxDQVZBLEVBV0EsQ0FBQSxNQUFBLEVBQUEsRUFBQSxDQVhBLEVBWUEsQ0FBQSxNQUFBLEVBQUEsR0FBQSxDQVpBLEVBYUEsQ0FBQSxNQUFBLEVBQUEsRUFBQSxDQWJBO0FBSEEsS0FBQSxFQWtCQTtBQUNBLGVBQUEsVUFEQTtBQUVBLGVBQUEsU0FGQTtBQUdBLGNBQUEsQ0FDQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBREEsRUFFQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBRkEsRUFHQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBSEEsRUFJQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBSkEsRUFLQSxDQUFBLEtBQUEsRUFBQSxHQUFBLENBTEEsRUFNQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBTkEsRUFPQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBUEEsRUFRQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBUkEsRUFTQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBVEEsRUFVQSxDQUFBLE1BQUEsRUFBQSxFQUFBLENBVkEsRUFXQSxDQUFBLE1BQUEsRUFBQSxFQUFBLENBWEEsRUFZQSxDQUFBLE1BQUEsRUFBQSxFQUFBLENBWkEsRUFhQSxDQUFBLE1BQUEsRUFBQSxHQUFBLENBYkE7QUFIQSxLQWxCQSxFQW9DQTtBQUNBLGVBQUEsV0FEQTtBQUVBLGVBQUEsU0FGQTtBQUdBLGNBQUEsQ0FDQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBREEsRUFFQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBRkEsRUFHQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBSEEsRUFJQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBSkEsRUFLQSxDQUFBLEtBQUEsRUFBQSxDQUFBLENBTEEsRUFNQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBTkEsRUFPQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBUEEsRUFRQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBUkEsRUFTQSxDQUFBLEtBQUEsRUFBQSxF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TUFBQUEsTUFBQSxFQUFBLElBSEE7QUFJQTNJLE1BQUFBLE1BQUEsRUFBQSxDQUFBO0FBQ0E5RixRQUFBQSxJQUFBLEVBQUEsQ0FBQTtBQUFBeUksVUFBQUEsQ0FBQSxFQUFBLENBQUE7QUFBQUQsVUFBQUEsQ0FBQSxFQUFBO0FBQUEsU0FBQSxFQUFBO0FBQUFDLFVBQUFBLENBQUEsRUFBQSxDQUFBO0FBQUFELFVBQUFBLENBQUEsRUFBQTtBQUFBLFNBQUEsRUFBQTtBQUFBQyxVQUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUFBRCxVQUFBQSxDQUFBLEVBQUE7QUFBQSxTQUFBLEVBQUE7QUFBQUMsVUFBQUEsQ0FBQSxFQUFBLENBQUE7QUFBQUQsVUFBQUEsQ0FBQSxFQUFBO0FBQUEsU0FBQSxFQUFBO0FBQUFDLFVBQUFBLENBQUEsRUFBQSxDQUFBO0FBQUFELFVBQUFBLENBQUEsRUFBQTtBQUFBLFNBQUEsQ0FEQTtBQUVBcUUsUUFBQUEsS0FBQSxFQUFBO0FBRkEsT0FBQSxFQUdBO0FBQ0E3TSxRQUFBQSxJQUFBLEVBQUEsQ0FBQTtBQUFBeUksVUFBQUEsQ0FBQSxFQUFBLENBQUE7QUFBQUQsVUFBQUEsQ0FBQSxFQUFBO0FBQUEsU0FBQSxFQUFBO0FBQUFDLFVBQUFBLENBQUEsRUFBQSxDQUFBO0FBQUFELFVBQUFBLENBQUEsRUFBQTtBQUFBLFNBQUEsRUFBQTtBQUFBQyxVQUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUFBRCxVQUFBQSxDQUFBLEVBQUE7QUFBQSxTQUFBLEVBQUE7QUFBQUMsVUFBQUEsQ0FBQSxFQUFBLENBQUE7QUFBQUQsVUFBQUEsQ0FBQSxFQUFBO0FBQUEsU0FBQSxFQUFBO0FBQUFDLFVBQUFBLENBQUEsRUFBQSxDQUFBO0FBQUFELFVBQUFBLENBQUEsRUFBQTtBQUFBLFNBQUEsQ0FEQTtBQUVBcUUsUUFBQUEsS0FBQSxFQUFBO0FBRkEsT0FIQTtBQUpBLEtBQUEsQ0FBQTtBQWFBMkIsSUFBQUEsTUFBQSxDQUFBRCxNQUFBLEdBdERBLENBd0RBO0FBQ0E7O0FBR0EsUUFBQUcsTUFBQSxHQUFBLElBQUFiLFFBQUEsQ0FBQVEsS0FBQSxDQUFBO0FBQ0FuSCxNQUFBQSxPQUFBLEVBQUE3TSxRQUFBLENBQUFvRixhQUFBLENBQUEsWUFBQSxDQURBO0FBRUE2TyxNQUFBQSxRQUFBLEVBQUEsTUFGQTtBQUdBeEksTUFBQUEsTUFBQSxFQUFBLENBQUE7QUFDQTlGLFFBQUFBLElBQUEsRUFBQSxDQUFBO0FBQUF5SSxVQUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUFBRCxVQUFBQSxDQUFBLEVBQUE7QUFBQSxTQUFBLEVBQUE7QUFBQUMsVUFBQUEsQ0FBQSxFQUFBLENBQUE7QUFBQUQsVUFBQUEsQ0FBQSxFQUFBO0FBQUEsU0FBQSxFQUFBO0FBQUFDLFVBQUFBLENBQUEsRUFBQSxDQUFBO0FBQUFELFVBQUFBLENBQUEsRUFBQTtBQUFBLFNBQUEsRUFBQTtBQUFBQyxVQUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUFBRCxVQUFBQSxDQUFBLEVBQUE7QUFBQSxTQUFBLEVBQUE7QUFBQUMsVUFBQUEsQ0FBQSxFQUFBLENBQUE7QUFBQUQsVUFBQUEsQ0FBQSxFQUFBO0FBQUEsU0FBQSxDQURBO0FBRUFxRSxRQUFBQSxLQUFBLEVBQUE7QUFGQSxPQUFBLEVBR0E7QUFDQTdNLFFBQUFBLElBQUEsRUFBQSxDQUFBO0FBQUF5SSxVQUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUFBRCxVQUFBQSxDQUFBLEVBQUE7QUFBQSxTQUFBLEVBQUE7QUFBQUMsVUFBQUEsQ0FBQSxFQUFBLENBQUE7QUFBQUQsVUFBQUEsQ0FBQSxFQUFBO0FBQUEsU0FBQSxFQUFBO0FBQUFDLFVBQUFBLENBQUEsRUFBQSxDQUFBO0FBQUFELFVBQUFBLENBQUEsRUFBQTtBQUFBLFNBQUEsRUFBQTtBQUFBQyxVQUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUFBRCxVQUFBQSxDQUFBLEVBQUE7QUFBQSxTQUFBLEVBQUE7QUFBQUMsVUFBQUEsQ0FBQSxFQUFBLENBQUE7QUFBQUQsVUFBQUEsQ0FBQSxFQUFBO0FBQUEsU0FBQSxDQURBO0FBRUFxRSxRQUFBQSxLQUFBLEVBQUE7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QUFBQTliLE1BQUFBLElBQUEsRUFBQTtBQUFBLEtBRkEsRUFHQTtBQUFBOGIsTUFBQUEsTUFBQSxFQUFBLENBQUEsQ0FBQSxJQUFBLEVBQUEsTUFBQSxDQUFBO0FBQUE5YixNQUFBQSxJQUFBLEVBQUE7QUFBQSxLQUhBLEVBSUE7QUFBQThiLE1BQUFBLE1BQUEsRUFBQSxDQUFBLENBQUEsSUFBQSxFQUFBLE1BQUEsQ0FBQTtBQUFBOWIsTUFBQUEsSUFBQSxFQUFBO0FBQUEsS0FKQSxFQUtBO0FBQUE4YixNQUFBQSxNQUFBLEVBQUEsQ0FBQSxJQUFBLEVBQUEsTUFBQSxDQUFBO0FBQUE5YixNQUFBQSxJQUFBLEVBQUE7QUFBQSxLQUxBLEVBTUE7QUFBQThiLE1BQUFBLE1BQUEsRUFBQSxDQUFBLElBQUEsRUFBQSxDQUFBLEtBQUEsQ0FBQTtBQUFBOWIsTUFBQUEsSUFBQSxFQUFBO0FBQUEsS0FOQSxFQU9BO0FBQUE4YixNQUFBQSxNQUFBLEVBQUEsQ0FBQSxHQUFBLEVBQUEsS0FBQSxDQUFBO0FBQUE5YixNQUFBQSxJQUFBLEVBQUE7QUFBQSxLQVBBLEVBUUE7QUFBQThiLE1BQUFBLE1BQUEsRUFBQSxDQUFBLEtBQUEsRUFBQSxJQUFBLENBQUE7QUFBQTliLE1BQUFBLElBQUEsRUFBQTtBQUFBLEtBUkEsRUFTQTtBQUFBOGIsTUFBQUEsTUFBQSxFQUFBLENBQUEsSUFBQSxFQUFBLENBQUEsS0FBQSxDQUFBO0FBQUE5YixNQUFBQSxJQUFBLEVBQUE7QUFBQSxLQVRBLEVBVUE7QUFBQThiLE1BQUFBLE1BQUEsRUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBLEtBQUEsQ0FBQTtBQUFBOWIsTUFBQUEsSUFBQSxFQUFBO0FBQUEsS0FWQSxFQVdBO0FBQUE4YixNQUFBQSxNQUFBLEVBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxLQUFBLENBQUE7QUFBQTliLE1BQUFBLElBQUEsRUFBQTtBQUFBLEtBWEEsRUFZQTtBQUFBOGIsTUFBQUEsTUFBQSxFQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsS0FBQSxDQUFBO0FBQUE5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LFlBQUE7QUFDQTs7QUFFQXhFLEVBQUFBLENBQUEsQ0FBQW0yQixVQUFBLENBQUE7O0FBRUEsV0FBQUEsVUFBQSxHQUFBLENBRUE7QUFFQTtBQUVBLENBWEEiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIFRoaXMgbGlicmFyeSB3YXMgY3JlYXRlZCB0byBlbXVsYXRlIHNvbWUgalF1ZXJ5IGZlYXR1cmVzXHJcbiAqIHVzZWQgaW4gdGhpcyB0ZW1wbGF0ZSBvbmx5IHdpdGggSmF2YXNjcmlwdCBhbmQgRE9NXHJcbiAqIG1hbmlwdWxhdGlvbiBmdW5jdGlvbnMgKElFMTArKS5cclxuICogQWxsIG1ldGhvZHMgd2VyZSBkZXNpZ25lZCBmb3IgYW4gYWRlcXVhdGUgYW5kIHNwZWNpZmljIHVzZVxyXG4gKiBhbmQgZG9uJ3QgcGVyZm9ybSBhIGRlZXAgdmFsaWRhdGlvbiBvbiB0aGUgYXJndW1lbnRzIHByb3ZpZGVkLlxyXG4gKlxyXG4gKiBJTVBPUlRBTlQ6XHJcbiAqID09PT09PT09PT1cclxuICogSXQncyBzdWdnZXN0ZWQgTk9UIHRvIHVzZSB0aGlzIGxpYnJhcnkgZXh0ZW5zaXZlbHkgdW5sZXNzIHlvdVxyXG4gKiB1bmRlcnN0YW5kIHdoYXQgZWFjaCBtZXRob2QgZG9lcy4gSW5zdGVhZCwgdXNlIG9ubHkgSlMgb3JcclxuICogeW91IG1pZ2h0IGV2ZW4gbmVlZCBqUXVlcnkuXHJcbiAqL1xyXG5cclxuKGZ1bmN0aW9uKGdsb2JhbCwgZmFjdG9yeSkge1xyXG4gICAgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JykgeyAvLyBDb21tb25KUy1saWtlXHJcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XHJcbiAgICB9IGVsc2UgeyAvLyBCcm93c2VyXHJcbiAgICAgICAgaWYgKHR5cGVvZiBnbG9iYWwualF1ZXJ5ID09PSAndW5kZWZpbmVkJylcclxuICAgICAgICAgICAgZ2xvYmFsLiQgPSBmYWN0b3J5KCk7XHJcbiAgICB9XHJcbn0od2luZG93LCBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAvLyBIRUxQRVJTXHJcbiAgICBmdW5jdGlvbiBhcnJheUZyb20ob2JqKSB7XHJcbiAgICAgICAgcmV0dXJuICgnbGVuZ3RoJyBpbiBvYmopICYmIChvYmogIT09IHdpbmRvdykgPyBbXS5zbGljZS5jYWxsKG9iaikgOiBbb2JqXTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBmaWx0ZXIoY3R4LCBmbikge1xyXG4gICAgICAgIHJldHVybiBbXS5maWx0ZXIuY2FsbChjdHgsIGZuKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBtYXAoY3R4LCBmbikge1xyXG4gICAgICAgIHJldHVybiBbXS5tYXAuY2FsbChjdHgsIGZuKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBtYXRjaGVzKGl0ZW0sIHNlbGVjdG9yKSB7XHJcbiAgICAgICAgcmV0dXJuIChFbGVtZW50LnByb3RvdHlwZS5tYXRjaGVzIHx8IEVsZW1lbnQucHJvdG90eXBlLm1zTWF0Y2hlc1NlbGVjdG9yKS5jYWxsKGl0ZW0sIHNlbGVjdG9yKVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEV2ZW50cyBoYW5kbGVyIHdpdGggc2ltcGxlIHNjb3BlZCBldmVudHMgc3VwcG9ydFxyXG4gICAgdmFyIEV2ZW50SGFuZGxlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuZXZlbnRzID0ge307XHJcbiAgICB9XHJcbiAgICBFdmVudEhhbmRsZXIucHJvdG90eXBlID0ge1xyXG4gICAgICAgIC8vIGV2ZW50IGFjY2VwdHM6ICdjbGljaycgb3IgJ2NsaWNrLnNjb3BlJ1xyXG4gICAgICAgIGJpbmQ6IGZ1bmN0aW9uKGV2ZW50LCBsaXN0ZW5lciwgdGFyZ2V0KSB7XHJcbiAgICAgICAgICAgIHZhciB0eXBlID0gZXZlbnQuc3BsaXQoJy4nKVswXTtcclxuICAgICAgICAgICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgbGlzdGVuZXIsIGZhbHNlKTtcclxuICAgICAgICAgICAgdGhpcy5ldmVudHNbZXZlbnRdID0ge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogdHlwZSxcclxuICAgICAgICAgICAgICAgIGxpc3RlbmVyOiBsaXN0ZW5lclxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICB1bmJpbmQ6IGZ1bmN0aW9uKGV2ZW50LCB0YXJnZXQpIHtcclxuICAgICAgICAgICAgaWYgKGV2ZW50IGluIHRoaXMuZXZlbnRzKSB7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQucmVtb3ZlRXZlbnRMaXN0ZW5lcih0aGlzLmV2ZW50c1tldmVudF0udHlwZSwgdGhpcy5ldmVudHNbZXZlbnRdLmxpc3RlbmVyLCBmYWxzZSk7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5ldmVudHNbZXZlbnRdO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIE9iamVjdCBEZWZpbml0aW9uXHJcbiAgICB2YXIgV3JhcCA9IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XHJcbiAgICAgICAgdGhpcy5zZWxlY3RvciA9IHNlbGVjdG9yO1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9zZXR1cChbXSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gQ09OU1RSVUNUT1JcclxuICAgIFdyYXAuQ29uc3RydWN0b3IgPSBmdW5jdGlvbihwYXJhbSwgYXR0cnMpIHtcclxuICAgICAgICB2YXIgZWwgPSBuZXcgV3JhcChwYXJhbSk7XHJcbiAgICAgICAgcmV0dXJuIGVsLmluaXQoYXR0cnMpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvLyBDb3JlIG1ldGhvZHNcclxuICAgIFdyYXAucHJvdG90eXBlID0ge1xyXG4gICAgICAgIGNvbnN0cnVjdG9yOiBXcmFwLFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEluaXRpYWxpemUgdGhlIG9iamVjdCBkZXBlbmRpbmcgb24gcGFyYW0gdHlwZVxyXG4gICAgICAgICAqIFthdHRyc10gb25seSB0byBoYW5kbGUgJChodG1sU3RyaW5nLCB7YXR0cmlidXRlc30pXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgaW5pdDogZnVuY3Rpb24oYXR0cnMpIHtcclxuICAgICAgICAgICAgLy8gZW1wdHkgb2JqZWN0XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5zZWxlY3RvcikgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgICAgIC8vIHNlbGVjdG9yID09PSBzdHJpbmdcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnNlbGVjdG9yID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICAgICAgLy8gaWYgbG9va3MgbGlrZSBtYXJrdXAsIHRyeSB0byBjcmVhdGUgYW4gZWxlbWVudFxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2VsZWN0b3JbMF0gPT09ICc8Jykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBlbGVtID0gdGhpcy5fc2V0dXAoW3RoaXMuX2NyZWF0ZSh0aGlzLnNlbGVjdG9yKV0pXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGF0dHJzID8gZWxlbS5hdHRyKGF0dHJzKSA6IGVsZW07XHJcbiAgICAgICAgICAgICAgICB9IGVsc2VcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fc2V0dXAoYXJyYXlGcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5zZWxlY3RvcikpKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIHNlbGVjdG9yID09PSBET01FbGVtZW50XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNlbGVjdG9yLm5vZGVUeXBlKVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NldHVwKFt0aGlzLnNlbGVjdG9yXSlcclxuICAgICAgICAgICAgZWxzZSAvLyBzaG9ydGhhbmQgZm9yIERPTVJlYWR5XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMuc2VsZWN0b3IgPT09ICdmdW5jdGlvbicpXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NldHVwKFtkb2N1bWVudF0pLnJlYWR5KHRoaXMuc2VsZWN0b3IpXHJcbiAgICAgICAgICAgIC8vIEFycmF5IGxpa2Ugb2JqZWN0cyAoZS5nLiBOb2RlTGlzdC9IVE1MQ29sbGVjdGlvbilcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3NldHVwKGFycmF5RnJvbSh0aGlzLnNlbGVjdG9yKSlcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIENyZWF0ZXMgYSBET00gZWxlbWVudCBmcm9tIGEgc3RyaW5nXHJcbiAgICAgICAgICogU3RyaWN0bHkgc3VwcG9ydHMgdGhlIGZvcm06ICc8dGFnPicgb3IgJzx0YWcvPidcclxuICAgICAgICAgKi9cclxuICAgICAgICBfY3JlYXRlOiBmdW5jdGlvbihzdHIpIHtcclxuICAgICAgICAgICAgdmFyIG5vZGVOYW1lID0gc3RyLnN1YnN0cihzdHIuaW5kZXhPZignPCcpICsgMSwgc3RyLmluZGV4T2YoJz4nKSAtIDEpLnJlcGxhY2UoJy8nLCAnJylcclxuICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQobm9kZU5hbWUpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLyoqIHNldHVwIHByb3BlcnRpZXMgYW5kIGFycmF5IHRvIGVsZW1lbnQgc2V0ICovXHJcbiAgICAgICAgX3NldHVwOiBmdW5jdGlvbihlbGVtZW50cykge1xyXG4gICAgICAgICAgICB2YXIgaSA9IDA7XHJcbiAgICAgICAgICAgIGZvciAoOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIGRlbGV0ZSB0aGlzW2ldOyAvLyBjbGVhbiB1cCBvbGQgc2V0XHJcbiAgICAgICAgICAgIHRoaXMuZWxlbWVudHMgPSBlbGVtZW50cztcclxuICAgICAgICAgICAgdGhpcy5sZW5ndGggPSBlbGVtZW50cy5sZW5ndGg7XHJcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykgdGhpc1tpXSA9IGVsZW1lbnRzW2ldIC8vIG5ldyBzZXRcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBfZmlyc3Q6IGZ1bmN0aW9uKGNiLCByZXQpIHtcclxuICAgICAgICAgICAgdmFyIGYgPSB0aGlzLmVsZW1lbnRzWzBdO1xyXG4gICAgICAgICAgICByZXR1cm4gZiA/IChjYiA/IGNiLmNhbGwodGhpcywgZikgOiBmKSA6IHJldDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8qKiBDb21tb24gZnVuY3Rpb24gZm9yIGNsYXNzIG1hbmlwdWxhdGlvbiAgKi9cclxuICAgICAgICBfY2xhc3NlczogZnVuY3Rpb24obWV0aG9kLCBjbGFzc25hbWUpIHtcclxuICAgICAgICAgICAgdmFyIGNscyA9IGNsYXNzbmFtZS5zcGxpdCgnICcpO1xyXG4gICAgICAgICAgICBpZiAoY2xzLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgICAgIGNscy5mb3JFYWNoKHRoaXMuX2NsYXNzZXMuYmluZCh0aGlzLCBtZXRob2QpKVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKG1ldGhvZCA9PT0gJ2NvbnRhaW5zJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBlbGVtID0gdGhpcy5fZmlyc3QoKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWxlbSA/IGVsZW0uY2xhc3NMaXN0LmNvbnRhaW5zKGNsYXNzbmFtZSkgOiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiAoY2xhc3NuYW1lID09PSAnJykgPyB0aGlzIDogdGhpcy5lYWNoKGZ1bmN0aW9uKGksIGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICBpdGVtLmNsYXNzTGlzdFttZXRob2RdKGNsYXNzbmFtZSk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBNdWx0aSBwdXJwb3NlIGZ1bmN0aW9uIHRvIHNldCBvciBnZXQgYSAoa2V5LCB2YWx1ZSlcclxuICAgICAgICAgKiBJZiBubyB2YWx1ZSwgd29ya3MgYXMgYSBnZXR0ZXIgZm9yIHRoZSBnaXZlbiBrZXlcclxuICAgICAgICAgKiBrZXkgY2FuIGJlIGFuIG9iamVjdCBpbiB0aGUgZm9ybSB7a2V5OiB2YWx1ZSwgLi4ufVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIF9hY2Nlc3M6IGZ1bmN0aW9uKGtleSwgdmFsdWUsIGZuKSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2Yga2V5ID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgayBpbiBrZXkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9hY2Nlc3Moaywga2V5W2tdLCBmbik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2ZpcnN0KGZ1bmN0aW9uKGVsZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZm4oZWxlbSwga2V5KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oaSwgaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgZm4oaXRlbSwga2V5LCB2YWx1ZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZWFjaDogZnVuY3Rpb24oZm4sIGFycikge1xyXG4gICAgICAgICAgICBhcnIgPSBhcnIgPyBhcnIgOiB0aGlzLmVsZW1lbnRzO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgaWYgKGZuLmNhbGwoYXJyW2ldLCBpLCBhcnJbaV0pID09PSBmYWxzZSlcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIEFsbG93cyB0byBleHRlbmQgd2l0aCBuZXcgbWV0aG9kcyAqL1xyXG4gICAgV3JhcC5leHRlbmQgPSBmdW5jdGlvbihtZXRob2RzKSB7XHJcbiAgICAgICAgT2JqZWN0LmtleXMobWV0aG9kcykuZm9yRWFjaChmdW5jdGlvbihtKSB7XHJcbiAgICAgICAgICAgIFdyYXAucHJvdG90eXBlW21dID0gbWV0aG9kc1ttXVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgLy8gRE9NIFJFQURZXHJcbiAgICBXcmFwLmV4dGVuZCh7XHJcbiAgICAgICAgcmVhZHk6IGZ1bmN0aW9uKGZuKSB7XHJcbiAgICAgICAgICAgIGlmIChkb2N1bWVudC5hdHRhY2hFdmVudCA/IGRvY3VtZW50LnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScgOiBkb2N1bWVudC5yZWFkeVN0YXRlICE9PSAnbG9hZGluZycpIHtcclxuICAgICAgICAgICAgICAgIGZuKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZm4pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgIH0pXHJcbiAgICAvLyBBQ0NFU1NcclxuICAgIFdyYXAuZXh0ZW5kKHtcclxuICAgICAgICAvKiogR2V0IG9yIHNldCBhIGNzcyB2YWx1ZSAqL1xyXG4gICAgICAgIGNzczogZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xyXG4gICAgICAgICAgICB2YXIgZ2V0U3R5bGUgPSBmdW5jdGlvbihlLCBrKSB7IHJldHVybiBlLnN0eWxlW2tdIHx8IGdldENvbXB1dGVkU3R5bGUoZSlba107IH07XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9hY2Nlc3Moa2V5LCB2YWx1ZSwgZnVuY3Rpb24oaXRlbSwgaywgdmFsKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdW5pdCA9ICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykgPyAncHgnIDogJyc7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsID09PSB1bmRlZmluZWQgPyBnZXRTdHlsZShpdGVtLCBrKSA6IChpdGVtLnN0eWxlW2tdID0gdmFsICsgdW5pdCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvKiogR2V0IGFuIGF0dHJpYnV0ZSBvciBzZXQgaXQgKi9cclxuICAgICAgICBhdHRyOiBmdW5jdGlvbihrZXksIHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9hY2Nlc3Moa2V5LCB2YWx1ZSwgZnVuY3Rpb24oaXRlbSwgaywgdmFsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsID09PSB1bmRlZmluZWQgPyBpdGVtLmdldEF0dHJpYnV0ZShrKSA6IGl0ZW0uc2V0QXR0cmlidXRlKGssIHZhbClcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8qKiBHZXQgYSBwcm9wZXJ0eSBvciBzZXQgaXQgKi9cclxuICAgICAgICBwcm9wOiBmdW5jdGlvbihrZXksIHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9hY2Nlc3Moa2V5LCB2YWx1ZSwgZnVuY3Rpb24oaXRlbSwgaywgdmFsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsID09PSB1bmRlZmluZWQgPyBpdGVtW2tdIDogKGl0ZW1ba10gPSB2YWwpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcG9zaXRpb246IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZmlyc3QoZnVuY3Rpb24oZWxlbSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgbGVmdDogZWxlbS5vZmZzZXRMZWZ0LCB0b3A6IGVsZW0ub2Zmc2V0VG9wIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzY3JvbGxUb3A6IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9hY2Nlc3MoJ3Njcm9sbFRvcCcsIHZhbHVlLCBmdW5jdGlvbihpdGVtLCBrLCB2YWwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB2YWwgPT09IHVuZGVmaW5lZCA/IGl0ZW1ba10gOiAoaXRlbVtrXSA9IHZhbCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSxcclxuICAgICAgICBvdXRlckhlaWdodDogZnVuY3Rpb24oaW5jbHVkZU1hcmdpbikge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZmlyc3QoZnVuY3Rpb24oZWxlbSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShlbGVtKTtcclxuICAgICAgICAgICAgICAgIHZhciBtYXJnaW5zID0gaW5jbHVkZU1hcmdpbiA/IChwYXJzZUludChzdHlsZS5tYXJnaW5Ub3AsIDEwKSArIHBhcnNlSW50KHN0eWxlLm1hcmdpbkJvdHRvbSwgMTApKSA6IDA7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZWxlbS5vZmZzZXRIZWlnaHQgKyBtYXJnaW5zO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEZpbmQgdGhlIHBvc2l0aW9uIG9mIHRoZSBmaXJzdCBlbGVtZW50IGluIHRoZSBzZXRcclxuICAgICAgICAgKiByZWxhdGl2ZSB0byBpdHMgc2libGluZyBlbGVtZW50cy5cclxuICAgICAgICAgKi9cclxuICAgICAgICBpbmRleDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9maXJzdChmdW5jdGlvbihlbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFycmF5RnJvbShlbC5wYXJlbnROb2RlLmNoaWxkcmVuKS5pbmRleE9mKGVsKVxyXG4gICAgICAgICAgICB9LCAtMSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxuICAgIC8vIExPT0tVUFxyXG4gICAgV3JhcC5leHRlbmQoe1xyXG4gICAgICAgIGNoaWxkcmVuOiBmdW5jdGlvbihzZWxlY3Rvcikge1xyXG4gICAgICAgICAgICB2YXIgY2hpbGRzID0gW107XHJcbiAgICAgICAgICAgIHRoaXMuZWFjaChmdW5jdGlvbihpLCBpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICBjaGlsZHMgPSBjaGlsZHMuY29uY2F0KG1hcChpdGVtLmNoaWxkcmVuLCBmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW1cclxuICAgICAgICAgICAgICAgIH0pKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICByZXR1cm4gV3JhcC5Db25zdHJ1Y3RvcihjaGlsZHMpLmZpbHRlcihzZWxlY3Rvcik7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzaWJsaW5nczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciBzaWJzID0gW11cclxuICAgICAgICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uKGksIGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIHNpYnMgPSBzaWJzLmNvbmNhdChmaWx0ZXIoaXRlbS5wYXJlbnROb2RlLmNoaWxkcmVuLCBmdW5jdGlvbihjaGlsZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjaGlsZCAhPT0gaXRlbTtcclxuICAgICAgICAgICAgICAgIH0pKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICByZXR1cm4gV3JhcC5Db25zdHJ1Y3RvcihzaWJzKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLyoqIFJldHVybiB0aGUgcGFyZW50IG9mIGVhY2ggZWxlbWVudCBpbiB0aGUgY3VycmVudCBzZXQgKi9cclxuICAgICAgICBwYXJlbnQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgcGFyID0gbWFwKHRoaXMuZWxlbWVudHMsIGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBpdGVtLnBhcmVudE5vZGU7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIHJldHVybiBXcmFwLkNvbnN0cnVjdG9yKHBhcilcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8qKiBSZXR1cm4gQUxMIHBhcmVudHMgb2YgZWFjaCBlbGVtZW50IGluIHRoZSBjdXJyZW50IHNldCAqL1xyXG4gICAgICAgIHBhcmVudHM6IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XHJcbiAgICAgICAgICAgIHZhciBwYXIgPSBbXTtcclxuICAgICAgICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uKGksIGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIHAgPSBpdGVtLnBhcmVudEVsZW1lbnQ7IHA7IHAgPSBwLnBhcmVudEVsZW1lbnQpXHJcbiAgICAgICAgICAgICAgICAgICAgcGFyLnB1c2gocCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIHJldHVybiBXcmFwLkNvbnN0cnVjdG9yKHBhcikuZmlsdGVyKHNlbGVjdG9yKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogR2V0IHRoZSBkZXNjZW5kYW50cyBvZiBlYWNoIGVsZW1lbnQgaW4gdGhlIHNldCwgZmlsdGVyZWQgYnkgYSBzZWxlY3RvclxyXG4gICAgICAgICAqIFNlbGVjdG9yIGNhbid0IHN0YXJ0IHdpdGggXCI+XCIgKDpzY29wZSBub3Qgc3VwcG9ydGVkIG9uIElFKS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBmaW5kOiBmdW5jdGlvbihzZWxlY3Rvcikge1xyXG4gICAgICAgICAgICB2YXIgZm91bmQgPSBbXVxyXG4gICAgICAgICAgICB0aGlzLmVhY2goZnVuY3Rpb24oaSwgaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgZm91bmQgPSBmb3VuZC5jb25jYXQobWFwKGl0ZW0ucXVlcnlTZWxlY3RvckFsbCggLyonOnNjb3BlICcgKyAqLyBzZWxlY3RvciksIGZ1bmN0aW9uKGZpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZpdGVtXHJcbiAgICAgICAgICAgICAgICB9KSlcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgcmV0dXJuIFdyYXAuQ29uc3RydWN0b3IoZm91bmQpXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvKiogZmlsdGVyIHRoZSBhY3R1YWwgc2V0IGJhc2VkIG9uIGdpdmVuIHNlbGVjdG9yICovXHJcbiAgICAgICAgZmlsdGVyOiBmdW5jdGlvbihzZWxlY3Rvcikge1xyXG4gICAgICAgICAgICBpZiAoIXNlbGVjdG9yKSByZXR1cm4gdGhpcztcclxuICAgICAgICAgICAgdmFyIHJlcyA9IGZpbHRlcih0aGlzLmVsZW1lbnRzLCBmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbWF0Y2hlcyhpdGVtLCBzZWxlY3RvcilcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgcmV0dXJuIFdyYXAuQ29uc3RydWN0b3IocmVzKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLyoqIFdvcmtzIG9ubHkgd2l0aCBhIHN0cmluZyBzZWxlY3RvciAqL1xyXG4gICAgICAgIGlzOiBmdW5jdGlvbihzZWxlY3Rvcikge1xyXG4gICAgICAgICAgICB2YXIgZm91bmQgPSBmYWxzZTtcclxuICAgICAgICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uKGksIGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAhKGZvdW5kID0gbWF0Y2hlcyhpdGVtLCBzZWxlY3RvcikpXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIHJldHVybiBmb3VuZDtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuICAgIC8vIEVMRU1FTlRTXHJcbiAgICBXcmFwLmV4dGVuZCh7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogYXBwZW5kIGN1cnJlbnQgc2V0IHRvIGdpdmVuIG5vZGVcclxuICAgICAgICAgKiBleHBlY3RzIGEgZG9tIG5vZGUgb3Igc2V0XHJcbiAgICAgICAgICogaWYgZWxlbWVudCBpcyBhIHNldCwgcHJlcGVuZHMgb25seSB0aGUgZmlyc3RcclxuICAgICAgICAgKi9cclxuICAgICAgICBhcHBlbmRUbzogZnVuY3Rpb24oZWxlbSkge1xyXG4gICAgICAgICAgICBlbGVtID0gZWxlbS5ub2RlVHlwZSA/IGVsZW0gOiBlbGVtLl9maXJzdCgpXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oaSwgaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgZWxlbS5hcHBlbmRDaGlsZChpdGVtKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEFwcGVuZCBhIGRvbU5vZGUgdG8gZWFjaCBlbGVtZW50IGluIHRoZSBzZXRcclxuICAgICAgICAgKiBpZiBlbGVtZW50IGlzIGEgc2V0LCBhcHBlbmQgb25seSB0aGUgZmlyc3RcclxuICAgICAgICAgKi9cclxuICAgICAgICBhcHBlbmQ6IGZ1bmN0aW9uKGVsZW0pIHtcclxuICAgICAgICAgICAgZWxlbSA9IGVsZW0ubm9kZVR5cGUgPyBlbGVtIDogZWxlbS5fZmlyc3QoKVxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKGksIGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIGl0ZW0uYXBwZW5kQ2hpbGQoZWxlbSk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBJbnNlcnQgdGhlIGN1cnJlbnQgc2V0IG9mIGVsZW1lbnRzIGFmdGVyIHRoZSBlbGVtZW50XHJcbiAgICAgICAgICogdGhhdCBtYXRjaGVzIHRoZSBnaXZlbiBzZWxlY3RvciBpbiBwYXJhbVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGluc2VydEFmdGVyOiBmdW5jdGlvbihzZWxlY3Rvcikge1xyXG4gICAgICAgICAgICB2YXIgdGFyZ2V0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oaSwgaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGl0ZW0sIHRhcmdldC5uZXh0U2libGluZyk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBDbG9uZXMgYWxsIGVsZW1lbnQgaW4gdGhlIHNldFxyXG4gICAgICAgICAqIHJldHVybnMgYSBuZXcgc2V0IHdpdGggdGhlIGNsb25lZCBlbGVtZW50c1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGNsb25lOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIGNsb25lcyA9IG1hcCh0aGlzLmVsZW1lbnRzLCBmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gaXRlbS5jbG9uZU5vZGUodHJ1ZSlcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgcmV0dXJuIFdyYXAuQ29uc3RydWN0b3IoY2xvbmVzKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8qKiBSZW1vdmUgYWxsIG5vZGUgaW4gdGhlIHNldCBmcm9tIERPTS4gKi9cclxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmVhY2goZnVuY3Rpb24oaSwgaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIGl0ZW0uZXZlbnRzO1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIGl0ZW0uZGF0YTtcclxuICAgICAgICAgICAgICAgIGlmIChpdGVtLnBhcmVudE5vZGUpIGl0ZW0ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChpdGVtKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgdGhpcy5fc2V0dXAoW10pXHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxuICAgIC8vIERBVEFTRVRTXHJcbiAgICBXcmFwLmV4dGVuZCh7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogRXhwZWN0ZWQga2V5IGluIGNhbWVsQ2FzZSBmb3JtYXRcclxuICAgICAgICAgKiBpZiB2YWx1ZSBwcm92aWRlZCBzYXZlIGRhdGEgaW50byBlbGVtZW50IHNldFxyXG4gICAgICAgICAqIGlmIG5vdCwgcmV0dXJuIGRhdGEgZm9yIHRoZSBmaXJzdCBlbGVtZW50XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZGF0YTogZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xyXG4gICAgICAgICAgICB2YXIgaGFzSlNPTiA9IC9eKD86XFx7W1xcd1xcV10qXFx9fFxcW1tcXHdcXFddKlxcXSkkLyxcclxuICAgICAgICAgICAgICAgIGRhdGFBdHRyID0gJ2RhdGEtJyArIGtleS5yZXBsYWNlKC9bQS1aXS9nLCAnLSQmJykudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9maXJzdChmdW5jdGlvbihlbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlbC5kYXRhICYmIGVsLmRhdGFba2V5XSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsLmRhdGFba2V5XTtcclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBlbC5nZXRBdHRyaWJ1dGUoZGF0YUF0dHIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkYXRhID09PSAndHJ1ZScpIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YSA9PT0gJ2ZhbHNlJykgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YSA9PT0gK2RhdGEgKyAnJykgcmV0dXJuICtkYXRhO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaGFzSlNPTi50ZXN0KGRhdGEpKSByZXR1cm4gSlNPTi5wYXJzZShkYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKGksIGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICBpdGVtLmRhdGEgPSBpdGVtLmRhdGEgfHwge307XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5kYXRhW2tleV0gPSB2YWx1ZTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxuICAgIC8vIEVWRU5UU1xyXG4gICAgV3JhcC5leHRlbmQoe1xyXG4gICAgICAgIHRyaWdnZXI6IGZ1bmN0aW9uKHR5cGUpIHtcclxuICAgICAgICAgICAgdHlwZSA9IHR5cGUuc3BsaXQoJy4nKVswXTsgLy8gaWdub3JlIG5hbWVzcGFjZVxyXG4gICAgICAgICAgICB2YXIgZXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnSFRNTEV2ZW50cycpO1xyXG4gICAgICAgICAgICBldmVudC5pbml0RXZlbnQodHlwZSwgdHJ1ZSwgZmFsc2UpO1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKGksIGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIGl0ZW0uZGlzcGF0Y2hFdmVudChldmVudCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSxcclxuICAgICAgICBibHVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudHJpZ2dlcignYmx1cicpXHJcbiAgICAgICAgfSxcclxuICAgICAgICBmb2N1czogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRyaWdnZXIoJ2ZvY3VzJylcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9uOiBmdW5jdGlvbihldmVudCwgY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbihpLCBpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIWl0ZW0uZXZlbnRzKSBpdGVtLmV2ZW50cyA9IG5ldyBFdmVudEhhbmRsZXIoKTtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnNwbGl0KCcgJykuZm9yRWFjaChmdW5jdGlvbihldikge1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0uZXZlbnRzLmJpbmQoZXYsIGNhbGxiYWNrLCBpdGVtKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSxcclxuICAgICAgICBvZmY6IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oaSwgaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0uZXZlbnRzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5ldmVudHMudW5iaW5kKGV2ZW50LCBpdGVtKTtcclxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgaXRlbS5ldmVudHM7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxuICAgIC8vIENMQVNTRVNcclxuICAgIFdyYXAuZXh0ZW5kKHtcclxuICAgICAgICB0b2dnbGVDbGFzczogZnVuY3Rpb24oY2xhc3NuYW1lKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jbGFzc2VzKCd0b2dnbGUnLCBjbGFzc25hbWUpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYWRkQ2xhc3M6IGZ1bmN0aW9uKGNsYXNzbmFtZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY2xhc3NlcygnYWRkJywgY2xhc3NuYW1lKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJlbW92ZUNsYXNzOiBmdW5jdGlvbihjbGFzc25hbWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NsYXNzZXMoJ3JlbW92ZScsIGNsYXNzbmFtZSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBoYXNDbGFzczogZnVuY3Rpb24oY2xhc3NuYW1lKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jbGFzc2VzKCdjb250YWlucycsIGNsYXNzbmFtZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTb21lIGJhc2ljIGZlYXR1cmVzIGluIHRoaXMgdGVtcGxhdGUgcmVsaWVzIG9uIEJvb3RzdHJhcFxyXG4gICAgICogcGx1Z2lucywgbGlrZSBDb2xsYXBzZSwgRHJvcGRvd24gYW5kIFRhYi5cclxuICAgICAqIEJlbG93IGNvZGUgZW11bGF0ZXMgcGx1Z2lucyBiZWhhdmlvciBieSB0b2dnbGluZyBjbGFzc2VzXHJcbiAgICAgKiBmcm9tIGVsZW1lbnRzIHRvIGFsbG93IGEgbWluaW11bSBpbnRlcmFjdGlvbiB3aXRob3V0IGFuaW1hdGlvbi5cclxuICAgICAqIC0gT25seSBDb2xsYXBzZSBpcyByZXF1aXJlZCB3aGljaCBpcyB1c2VkIGJ5IHRoZSBzaWRlYmFyLlxyXG4gICAgICogLSBUYWIgYW5kIERyb3Bkb3duIGFyZSBvcHRpb25hbCBmZWF0dXJlcy5cclxuICAgICAqL1xyXG5cclxuICAgIC8vIEVtdWxhdGUgalF1ZXJ5IHN5bWJvbCB0byBzaW1wbGlmeSB1c2FnZVxyXG4gICAgdmFyICQgPSBXcmFwLkNvbnN0cnVjdG9yO1xyXG5cclxuICAgIC8vIEVtdWxhdGVzIENvbGxhcHNlIHBsdWdpblxyXG4gICAgV3JhcC5leHRlbmQoe1xyXG4gICAgICAgIGNvbGxhcHNlOiBmdW5jdGlvbihhY3Rpb24pIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbihpLCBpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgJGl0ZW0gPSAkKGl0ZW0pLnRyaWdnZXIoYWN0aW9uICsgJy5icy5jb2xsYXBzZScpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGFjdGlvbiA9PT0gJ3RvZ2dsZScpICRpdGVtLmNvbGxhcHNlKCRpdGVtLmhhc0NsYXNzKCdzaG93JykgPyAnaGlkZScgOiAnc2hvdycpO1xyXG4gICAgICAgICAgICAgICAgZWxzZSAkaXRlbVthY3Rpb24gPT09ICdzaG93JyA/ICdhZGRDbGFzcycgOiAncmVtb3ZlQ2xhc3MnXSgnc2hvdycpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcbiAgICAvLyBJbml0aWFsaXphdGlvbnNcclxuICAgICQoJ1tkYXRhLXRvZ2dsZV0nKS5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgdmFyIHRhcmdldCA9ICQoZS5jdXJyZW50VGFyZ2V0KTtcclxuICAgICAgICBpZiAodGFyZ2V0LmlzKCdhJykpIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBzd2l0Y2ggKHRhcmdldC5kYXRhKCd0b2dnbGUnKSkge1xyXG4gICAgICAgICAgICBjYXNlICdjb2xsYXBzZSc6XHJcbiAgICAgICAgICAgICAgICAkKHRhcmdldC5hdHRyKCdocmVmJykpLmNvbGxhcHNlKCd0b2dnbGUnKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICd0YWInOlxyXG4gICAgICAgICAgICAgICAgdGFyZ2V0LnBhcmVudCgpLnBhcmVudCgpLmZpbmQoJy5hY3RpdmUnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgICAgICAgICB0YXJnZXQuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgICAgICAgICAgdmFyIHRhYlBhbmUgPSAkKHRhcmdldC5hdHRyKCdocmVmJykpO1xyXG4gICAgICAgICAgICAgICAgdGFiUGFuZS5zaWJsaW5ncygpLnJlbW92ZUNsYXNzKCdhY3RpdmUgc2hvdycpO1xyXG4gICAgICAgICAgICAgICAgdGFiUGFuZS5hZGRDbGFzcygnYWN0aXZlIHNob3cnKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlICdkcm9wZG93bic6XHJcbiAgICAgICAgICAgICAgICB2YXIgZGQgPSB0YXJnZXQucGFyZW50KCkudG9nZ2xlQ2xhc3MoJ3Nob3cnKTtcclxuICAgICAgICAgICAgICAgIGRkLmZpbmQoJy5kcm9wZG93bi1tZW51JykudG9nZ2xlQ2xhc3MoJ3Nob3cnKTtcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxuXHJcblxyXG4gICAgcmV0dXJuIFdyYXAuQ29uc3RydWN0b3JcclxuXHJcbn0pKTsiLCIvKiFcclxuICpcclxuICogQW5nbGUgLSBCb290c3RyYXAgQWRtaW4gVGVtcGxhdGVcclxuICpcclxuICogVmVyc2lvbjogNC43LjFcclxuICogQXV0aG9yOiBAdGhlbWljb25fY29cclxuICogV2Vic2l0ZTogaHR0cDovL3RoZW1pY29uLmNvXHJcbiAqIExpY2Vuc2U6IGh0dHBzOi8vd3JhcGJvb3RzdHJhcC5jb20vaGVscC9saWNlbnNlc1xyXG4gKlxyXG4gKi9cclxuXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgJChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgLy8gUmVzdG9yZSBib2R5IGNsYXNzZXNcclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgIHZhciAkYm9keSA9ICQoJ2JvZHknKTtcclxuICAgICAgICBuZXcgU3RhdGVUb2dnbGVyKCkucmVzdG9yZVN0YXRlKCRib2R5KTtcclxuXHJcbiAgICAgICAgLy8gZW5hYmxlIHNldHRpbmdzIHRvZ2dsZSBhZnRlciByZXN0b3JlXHJcbiAgICAgICAgJCgnI2Noay1maXhlZCcpLnByb3AoJ2NoZWNrZWQnLCAkYm9keS5oYXNDbGFzcygnbGF5b3V0LWZpeGVkJykpO1xyXG4gICAgICAgICQoJyNjaGstY29sbGFwc2VkJykucHJvcCgnY2hlY2tlZCcsICRib2R5Lmhhc0NsYXNzKCdhc2lkZS1jb2xsYXBzZWQnKSk7XHJcbiAgICAgICAgJCgnI2Noay1jb2xsYXBzZWQtdGV4dCcpLnByb3AoJ2NoZWNrZWQnLCAkYm9keS5oYXNDbGFzcygnYXNpZGUtY29sbGFwc2VkLXRleHQnKSk7XHJcbiAgICAgICAgJCgnI2Noay1ib3hlZCcpLnByb3AoJ2NoZWNrZWQnLCAkYm9keS5oYXNDbGFzcygnbGF5b3V0LWJveGVkJykpO1xyXG4gICAgICAgICQoJyNjaGstZmxvYXQnKS5wcm9wKCdjaGVja2VkJywgJGJvZHkuaGFzQ2xhc3MoJ2FzaWRlLWZsb2F0JykpO1xyXG4gICAgICAgICQoJyNjaGstaG92ZXInKS5wcm9wKCdjaGVja2VkJywgJGJvZHkuaGFzQ2xhc3MoJ2FzaWRlLWhvdmVyJykpO1xyXG5cclxuICAgICAgICAvLyBXaGVuIHJlYWR5IGRpc3BsYXkgdGhlIG9mZnNpZGViYXJcclxuICAgICAgICAkKCcub2Zmc2lkZWJhci5kLW5vbmUnKS5yZW1vdmVDbGFzcygnZC1ub25lJyk7XHJcblxyXG4gICAgfSk7IC8vIGRvYyByZWFkeVxyXG5cclxufSkoKTsiLCIvLyBLbm9iIGNoYXJ0XHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgJChpbml0S25vYik7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdEtub2IoKSB7XHJcblxyXG4gICAgICAgIGlmICghJC5mbi5rbm9iKSByZXR1cm47XHJcblxyXG4gICAgICAgIHZhciBrbm9iTG9hZGVyT3B0aW9uczEgPSB7XHJcbiAgICAgICAgICAgIHdpZHRoOiAnNTAlJywgLy8gcmVzcG9uc2l2ZVxyXG4gICAgICAgICAgICBkaXNwbGF5SW5wdXQ6IHRydWUsXHJcbiAgICAgICAgICAgIGZnQ29sb3I6IEFQUF9DT0xPUlNbJ2luZm8nXVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgJCgnI2tub2ItY2hhcnQxJykua25vYihrbm9iTG9hZGVyT3B0aW9uczEpO1xyXG5cclxuICAgICAgICB2YXIga25vYkxvYWRlck9wdGlvbnMyID0ge1xyXG4gICAgICAgICAgICB3aWR0aDogJzUwJScsIC8vIHJlc3BvbnNpdmVcclxuICAgICAgICAgICAgZGlzcGxheUlucHV0OiB0cnVlLFxyXG4gICAgICAgICAgICBmZ0NvbG9yOiBBUFBfQ09MT1JTWydwdXJwbGUnXSxcclxuICAgICAgICAgICAgcmVhZE9ubHk6IHRydWVcclxuICAgICAgICB9O1xyXG4gICAgICAgICQoJyNrbm9iLWNoYXJ0MicpLmtub2Ioa25vYkxvYWRlck9wdGlvbnMyKTtcclxuXHJcbiAgICAgICAgdmFyIGtub2JMb2FkZXJPcHRpb25zMyA9IHtcclxuICAgICAgICAgICAgd2lkdGg6ICc1MCUnLCAvLyByZXNwb25zaXZlXHJcbiAgICAgICAgICAgIGRpc3BsYXlJbnB1dDogdHJ1ZSxcclxuICAgICAgICAgICAgZmdDb2xvcjogQVBQX0NPTE9SU1snaW5mbyddLFxyXG4gICAgICAgICAgICBiZ0NvbG9yOiBBUFBfQ09MT1JTWydncmF5J10sXHJcbiAgICAgICAgICAgIGFuZ2xlT2Zmc2V0OiAtMTI1LFxyXG4gICAgICAgICAgICBhbmdsZUFyYzogMjUwXHJcbiAgICAgICAgfTtcclxuICAgICAgICAkKCcja25vYi1jaGFydDMnKS5rbm9iKGtub2JMb2FkZXJPcHRpb25zMyk7XHJcblxyXG4gICAgICAgIHZhciBrbm9iTG9hZGVyT3B0aW9uczQgPSB7XHJcbiAgICAgICAgICAgIHdpZHRoOiAnNTAlJywgLy8gcmVzcG9uc2l2ZVxyXG4gICAgICAgICAgICBkaXNwbGF5SW5wdXQ6IHRydWUsXHJcbiAgICAgICAgICAgIGZnQ29sb3I6IEFQUF9DT0xPUlNbJ3BpbmsnXSxcclxuICAgICAgICAgICAgZGlzcGxheVByZXZpb3VzOiB0cnVlLFxyXG4gICAgICAgICAgICB0aGlja25lc3M6IDAuMSxcclxuICAgICAgICAgICAgbGluZUNhcDogJ3JvdW5kJ1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgJCgnI2tub2ItY2hhcnQ0Jykua25vYihrbm9iTG9hZGVyT3B0aW9uczQpO1xyXG5cclxuICAgIH1cclxuXHJcbn0pKCk7IiwiLy8gQ2hhcnQgSlNcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAkKGluaXRDaGFydEpTKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0Q2hhcnRKUygpIHtcclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBDaGFydCA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybjtcclxuXHJcbiAgICAgICAgLy8gcmFuZG9tIHZhbHVlcyBmb3IgZGVtb1xyXG4gICAgICAgIHZhciByRmFjdG9yID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAxMDApO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIExpbmUgY2hhcnRcclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgICAgICB2YXIgbGluZURhdGEgPSB7XHJcbiAgICAgICAgICAgIGxhYmVsczogWydKYW51YXJ5JywgJ0ZlYnJ1YXJ5JywgJ01hcmNoJywgJ0FwcmlsJywgJ01heScsICdKdW5lJywgJ0p1bHknXSxcclxuICAgICAgICAgICAgZGF0YXNldHM6IFt7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogJ015IEZpcnN0IGRhdGFzZXQnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAncmdiYSgxMTQsMTAyLDE4NiwwLjIpJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiAncmdiYSgxMTQsMTAyLDE4NiwxKScsXHJcbiAgICAgICAgICAgICAgICBwb2ludEJvcmRlckNvbG9yOiAnI2ZmZicsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBbckZhY3RvcigpLCByRmFjdG9yKCksIHJGYWN0b3IoKSwgckZhY3RvcigpLCByRmFjdG9yKCksIHJGYWN0b3IoKSwgckZhY3RvcigpXVxyXG4gICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogJ015IFNlY29uZCBkYXRhc2V0JyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3JnYmEoMzUsMTgzLDIyOSwwLjIpJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiAncmdiYSgzNSwxODMsMjI5LDEpJyxcclxuICAgICAgICAgICAgICAgIHBvaW50Qm9yZGVyQ29sb3I6ICcjZmZmJyxcclxuICAgICAgICAgICAgICAgIGRhdGE6IFtyRmFjdG9yKCksIHJGYWN0b3IoKSwgckZhY3RvcigpLCByRmFjdG9yKCksIHJGYWN0b3IoKSwgckZhY3RvcigpLCByRmFjdG9yKCldXHJcbiAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIGxpbmVPcHRpb25zID0ge1xyXG4gICAgICAgICAgICBsZWdlbmQ6IHtcclxuICAgICAgICAgICAgICAgIGRpc3BsYXk6IGZhbHNlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIHZhciBsaW5lY3R4ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NoYXJ0anMtbGluZWNoYXJ0JykuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgICAgICB2YXIgbGluZUNoYXJ0ID0gbmV3IENoYXJ0KGxpbmVjdHgsIHtcclxuICAgICAgICAgICAgZGF0YTogbGluZURhdGEsXHJcbiAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcclxuICAgICAgICAgICAgb3B0aW9uczogbGluZU9wdGlvbnNcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gQmFyIGNoYXJ0XHJcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAgICAgdmFyIGJhckRhdGEgPSB7XHJcbiAgICAgICAgICAgIGxhYmVsczogWydKYW51YXJ5JywgJ0ZlYnJ1YXJ5JywgJ01hcmNoJywgJ0FwcmlsJywgJ01heScsICdKdW5lJywgJ0p1bHknXSxcclxuICAgICAgICAgICAgZGF0YXNldHM6IFt7XHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjMjNiN2U1JyxcclxuICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiAnIzIzYjdlNScsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBbckZhY3RvcigpLCByRmFjdG9yKCksIHJGYWN0b3IoKSwgckZhY3RvcigpLCByRmFjdG9yKCksIHJGYWN0b3IoKSwgckZhY3RvcigpXVxyXG4gICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjNWQ5Y2VjJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiAnIzVkOWNlYycsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBbckZhY3RvcigpLCByRmFjdG9yKCksIHJGYWN0b3IoKSwgckZhY3RvcigpLCByRmFjdG9yKCksIHJGYWN0b3IoKSwgckZhY3RvcigpXVxyXG4gICAgICAgICAgICB9XVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBiYXJPcHRpb25zID0ge1xyXG4gICAgICAgICAgICBsZWdlbmQ6IHtcclxuICAgICAgICAgICAgICAgIGRpc3BsYXk6IGZhbHNlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIHZhciBiYXJjdHggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2hhcnRqcy1iYXJjaGFydCcpLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICAgICAgdmFyIGJhckNoYXJ0ID0gbmV3IENoYXJ0KGJhcmN0eCwge1xyXG4gICAgICAgICAgICBkYXRhOiBiYXJEYXRhLFxyXG4gICAgICAgICAgICB0eXBlOiAnYmFyJyxcclxuICAgICAgICAgICAgb3B0aW9uczogYmFyT3B0aW9uc1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyAgRG91Z2hudXQgY2hhcnRcclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgICAgICB2YXIgZG91Z2hudXREYXRhID0ge1xyXG4gICAgICAgICAgICBsYWJlbHM6IFtcclxuICAgICAgICAgICAgICAgICdQdXJwbGUnLFxyXG4gICAgICAgICAgICAgICAgJ1llbGxvdycsXHJcbiAgICAgICAgICAgICAgICAnQmx1ZSdcclxuICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgZGF0YXNldHM6IFt7XHJcbiAgICAgICAgICAgICAgICBkYXRhOiBbMzAwLCA1MCwgMTAwXSxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogW1xyXG4gICAgICAgICAgICAgICAgICAgICcjNzI2NmJhJyxcclxuICAgICAgICAgICAgICAgICAgICAnI2ZhZDczMicsXHJcbiAgICAgICAgICAgICAgICAgICAgJyMyM2I3ZTUnXHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgaG92ZXJCYWNrZ3JvdW5kQ29sb3I6IFtcclxuICAgICAgICAgICAgICAgICAgICAnIzcyNjZiYScsXHJcbiAgICAgICAgICAgICAgICAgICAgJyNmYWQ3MzInLFxyXG4gICAgICAgICAgICAgICAgICAgICcjMjNiN2U1J1xyXG4gICAgICAgICAgICAgICAgXVxyXG4gICAgICAgICAgICB9XVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBkb3VnaG51dE9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIGxlZ2VuZDoge1xyXG4gICAgICAgICAgICAgICAgZGlzcGxheTogZmFsc2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdmFyIGRvdWdobnV0Y3R4ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NoYXJ0anMtZG91Z2hudXRjaGFydCcpLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICAgICAgdmFyIGRvdWdobnV0Q2hhcnQgPSBuZXcgQ2hhcnQoZG91Z2hudXRjdHgsIHtcclxuICAgICAgICAgICAgZGF0YTogZG91Z2hudXREYXRhLFxyXG4gICAgICAgICAgICB0eXBlOiAnZG91Z2hudXQnLFxyXG4gICAgICAgICAgICBvcHRpb25zOiBkb3VnaG51dE9wdGlvbnNcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gUGllIGNoYXJ0XHJcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAgICAgdmFyIHBpZURhdGEgPSB7XHJcbiAgICAgICAgICAgIGxhYmVsczogW1xyXG4gICAgICAgICAgICAgICAgJ1B1cnBsZScsXHJcbiAgICAgICAgICAgICAgICAnWWVsbG93JyxcclxuICAgICAgICAgICAgICAgICdCbHVlJ1xyXG4gICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICBkYXRhc2V0czogW3tcclxuICAgICAgICAgICAgICAgIGRhdGE6IFszMDAsIDUwLCAxMDBdLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgJyM3MjY2YmEnLFxyXG4gICAgICAgICAgICAgICAgICAgICcjZmFkNzMyJyxcclxuICAgICAgICAgICAgICAgICAgICAnIzIzYjdlNSdcclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICBob3ZlckJhY2tncm91bmRDb2xvcjogW1xyXG4gICAgICAgICAgICAgICAgICAgICcjNzI2NmJhJyxcclxuICAgICAgICAgICAgICAgICAgICAnI2ZhZDczMicsXHJcbiAgICAgICAgICAgICAgICAgICAgJyMyM2I3ZTUnXHJcbiAgICAgICAgICAgICAgICBdXHJcbiAgICAgICAgICAgIH1dXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIHBpZU9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIGxlZ2VuZDoge1xyXG4gICAgICAgICAgICAgICAgZGlzcGxheTogZmFsc2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdmFyIHBpZWN0eCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjaGFydGpzLXBpZWNoYXJ0JykuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgICAgICB2YXIgcGllQ2hhcnQgPSBuZXcgQ2hhcnQocGllY3R4LCB7XHJcbiAgICAgICAgICAgIGRhdGE6IHBpZURhdGEsXHJcbiAgICAgICAgICAgIHR5cGU6ICdwaWUnLFxyXG4gICAgICAgICAgICBvcHRpb25zOiBwaWVPcHRpb25zXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIFBvbGFyIGNoYXJ0XHJcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAgICAgdmFyIHBvbGFyRGF0YSA9IHtcclxuICAgICAgICAgICAgZGF0YXNldHM6IFt7XHJcbiAgICAgICAgICAgICAgICBkYXRhOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgMTEsXHJcbiAgICAgICAgICAgICAgICAgICAgMTYsXHJcbiAgICAgICAgICAgICAgICAgICAgNyxcclxuICAgICAgICAgICAgICAgICAgICAzXHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBbXHJcbiAgICAgICAgICAgICAgICAgICAgJyNmNTMyZTUnLFxyXG4gICAgICAgICAgICAgICAgICAgICcjNzI2NmJhJyxcclxuICAgICAgICAgICAgICAgICAgICAnI2Y1MzJlNScsXHJcbiAgICAgICAgICAgICAgICAgICAgJyM3MjY2YmEnXHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgbGFiZWw6ICdNeSBkYXRhc2V0JyAvLyBmb3IgbGVnZW5kXHJcbiAgICAgICAgICAgIH1dLFxyXG4gICAgICAgICAgICBsYWJlbHM6IFtcclxuICAgICAgICAgICAgICAgICdMYWJlbCAxJyxcclxuICAgICAgICAgICAgICAgICdMYWJlbCAyJyxcclxuICAgICAgICAgICAgICAgICdMYWJlbCAzJyxcclxuICAgICAgICAgICAgICAgICdMYWJlbCA0J1xyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIHBvbGFyT3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgbGVnZW5kOiB7XHJcbiAgICAgICAgICAgICAgICBkaXNwbGF5OiBmYWxzZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgcG9sYXJjdHggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2hhcnRqcy1wb2xhcmNoYXJ0JykuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgICAgICB2YXIgcG9sYXJDaGFydCA9IG5ldyBDaGFydChwb2xhcmN0eCwge1xyXG4gICAgICAgICAgICBkYXRhOiBwb2xhckRhdGEsXHJcbiAgICAgICAgICAgIHR5cGU6ICdwb2xhckFyZWEnLFxyXG4gICAgICAgICAgICBvcHRpb25zOiBwb2xhck9wdGlvbnNcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gUmFkYXIgY2hhcnRcclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgICAgICB2YXIgcmFkYXJEYXRhID0ge1xyXG4gICAgICAgICAgICBsYWJlbHM6IFsnRWF0aW5nJywgJ0RyaW5raW5nJywgJ1NsZWVwaW5nJywgJ0Rlc2lnbmluZycsICdDb2RpbmcnLCAnQ3ljbGluZycsICdSdW5uaW5nJ10sXHJcbiAgICAgICAgICAgIGRhdGFzZXRzOiBbe1xyXG4gICAgICAgICAgICAgICAgbGFiZWw6ICdNeSBGaXJzdCBkYXRhc2V0JyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3JnYmEoMTE0LDEwMiwxODYsMC4yKScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogJ3JnYmEoMTE0LDEwMiwxODYsMSknLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogWzY1LCA1OSwgOTAsIDgxLCA1NiwgNTUsIDQwXVxyXG4gICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbDogJ015IFNlY29uZCBkYXRhc2V0JyxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJ3JnYmEoMTUxLDE4NywyMDUsMC4yKScsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogJ3JnYmEoMTUxLDE4NywyMDUsMSknLFxyXG4gICAgICAgICAgICAgICAgZGF0YTogWzI4LCA0OCwgNDAsIDE5LCA5NiwgMjcsIDEwMF1cclxuICAgICAgICAgICAgfV1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgcmFkYXJPcHRpb25zID0ge1xyXG4gICAgICAgICAgICBsZWdlbmQ6IHtcclxuICAgICAgICAgICAgICAgIGRpc3BsYXk6IGZhbHNlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIHZhciByYWRhcmN0eCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjaGFydGpzLXJhZGFyY2hhcnQnKS5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgICAgIHZhciByYWRhckNoYXJ0ID0gbmV3IENoYXJ0KHJhZGFyY3R4LCB7XHJcbiAgICAgICAgICAgIGRhdGE6IHJhZGFyRGF0YSxcclxuICAgICAgICAgICAgdHlwZTogJ3JhZGFyJyxcclxuICAgICAgICAgICAgb3B0aW9uczogcmFkYXJPcHRpb25zXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvLyBDaGFydGlzdFxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICQoaW5pdENoYXJ0aXN0cyk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdENoYXJ0aXN0cygpIHtcclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBDaGFydGlzdCA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybjtcclxuXHJcbiAgICAgICAgLy8gQmFyIGJpcG9sYXJcclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgIHZhciBkYXRhMSA9IHtcclxuICAgICAgICAgICAgbGFiZWxzOiBbJ1cxJywgJ1cyJywgJ1czJywgJ1c0JywgJ1c1JywgJ1c2JywgJ1c3JywgJ1c4JywgJ1c5JywgJ1cxMCddLFxyXG4gICAgICAgICAgICBzZXJpZXM6IFtcclxuICAgICAgICAgICAgICAgIFsxLCAyLCA0LCA4LCA2LCAtMiwgLTEsIC00LCAtNiwgLTJdXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgb3B0aW9uczEgPSB7XHJcbiAgICAgICAgICAgIGhpZ2g6IDEwLFxyXG4gICAgICAgICAgICBsb3c6IC0xMCxcclxuICAgICAgICAgICAgaGVpZ2h0OiAyODAsXHJcbiAgICAgICAgICAgIGF4aXNYOiB7XHJcbiAgICAgICAgICAgICAgICBsYWJlbEludGVycG9sYXRpb25GbmM6IGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBpbmRleCAlIDIgPT09IDAgPyB2YWx1ZSA6IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBuZXcgQ2hhcnRpc3QuQmFyKCcjY3QtYmFyMScsIGRhdGExLCBvcHRpb25zMSk7XHJcblxyXG4gICAgICAgIC8vIEJhciBIb3Jpem9udGFsXHJcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICBuZXcgQ2hhcnRpc3QuQmFyKCcjY3QtYmFyMicsIHtcclxuICAgICAgICAgICAgbGFiZWxzOiBbJ01vbmRheScsICdUdWVzZGF5JywgJ1dlZG5lc2RheScsICdUaHVyc2RheScsICdGcmlkYXknLCAnU2F0dXJkYXknLCAnU3VuZGF5J10sXHJcbiAgICAgICAgICAgIHNlcmllczogW1xyXG4gICAgICAgICAgICAgICAgWzUsIDQsIDMsIDcsIDUsIDEwLCAzXSxcclxuICAgICAgICAgICAgICAgIFszLCAyLCA5LCA1LCA0LCA2LCA0XVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSwge1xyXG4gICAgICAgICAgICBzZXJpZXNCYXJEaXN0YW5jZTogMTAsXHJcbiAgICAgICAgICAgIHJldmVyc2VEYXRhOiB0cnVlLFxyXG4gICAgICAgICAgICBob3Jpem9udGFsQmFyczogdHJ1ZSxcclxuICAgICAgICAgICAgaGVpZ2h0OiAyODAsXHJcbiAgICAgICAgICAgIGF4aXNZOiB7XHJcbiAgICAgICAgICAgICAgICBvZmZzZXQ6IDcwXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gTGluZVxyXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgbmV3IENoYXJ0aXN0LkxpbmUoJyNjdC1saW5lMScsIHtcclxuICAgICAgICAgICAgbGFiZWxzOiBbJ01vbmRheScsICdUdWVzZGF5JywgJ1dlZG5lc2RheScsICdUaHVyc2RheScsICdGcmlkYXknXSxcclxuICAgICAgICAgICAgc2VyaWVzOiBbXHJcbiAgICAgICAgICAgICAgICBbMTIsIDksIDcsIDgsIDVdLFxyXG4gICAgICAgICAgICAgICAgWzIsIDEsIDMuNSwgNywgM10sXHJcbiAgICAgICAgICAgICAgICBbMSwgMywgNCwgNSwgNl1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgZnVsbFdpZHRoOiB0cnVlLFxyXG4gICAgICAgICAgICBoZWlnaHQ6IDI4MCxcclxuICAgICAgICAgICAgY2hhcnRQYWRkaW5nOiB7XHJcbiAgICAgICAgICAgICAgICByaWdodDogNDBcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuXHJcbiAgICAgICAgLy8gU1ZHIEFuaW1hdGlvblxyXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgICAgIHZhciBjaGFydDEgPSBuZXcgQ2hhcnRpc3QuTGluZSgnI2N0LWxpbmUzJywge1xyXG4gICAgICAgICAgICBsYWJlbHM6IFsnTW9uJywgJ1R1ZScsICdXZWQnLCAnVGh1JywgJ0ZyaScsICdTYXQnXSxcclxuICAgICAgICAgICAgc2VyaWVzOiBbXHJcbiAgICAgICAgICAgICAgICBbMSwgNSwgMiwgNSwgNCwgM10sXHJcbiAgICAgICAgICAgICAgICBbMiwgMywgNCwgOCwgMSwgMl0sXHJcbiAgICAgICAgICAgICAgICBbNSwgNCwgMywgMiwgMSwgMC41XVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSwge1xyXG4gICAgICAgICAgICBsb3c6IDAsXHJcbiAgICAgICAgICAgIHNob3dBcmVhOiB0cnVlLFxyXG4gICAgICAgICAgICBzaG93UG9pbnQ6IGZhbHNlLFxyXG4gICAgICAgICAgICBmdWxsV2lkdGg6IHRydWUsXHJcbiAgICAgICAgICAgIGhlaWdodDogMzAwXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNoYXJ0MS5vbignZHJhdycsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgaWYgKGRhdGEudHlwZSA9PT0gJ2xpbmUnIHx8IGRhdGEudHlwZSA9PT0gJ2FyZWEnKSB7XHJcbiAgICAgICAgICAgICAgICBkYXRhLmVsZW1lbnQuYW5pbWF0ZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgZDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBiZWdpbjogMjAwMCAqIGRhdGEuaW5kZXgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGR1cjogMjAwMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZnJvbTogZGF0YS5wYXRoLmNsb25lKCkuc2NhbGUoMSwgMCkudHJhbnNsYXRlKDAsIGRhdGEuY2hhcnRSZWN0LmhlaWdodCgpKS5zdHJpbmdpZnkoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG86IGRhdGEucGF0aC5jbG9uZSgpLnN0cmluZ2lmeSgpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlYXNpbmc6IENoYXJ0aXN0LlN2Zy5FYXNpbmcuZWFzZU91dFF1aW50XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgIC8vIFNsaW0gYW5pbWF0aW9uXHJcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcblxyXG4gICAgICAgIHZhciBjaGFydCA9IG5ldyBDaGFydGlzdC5MaW5lKCcjY3QtbGluZTInLCB7XHJcbiAgICAgICAgICAgIGxhYmVsczogWycxJywgJzInLCAnMycsICc0JywgJzUnLCAnNicsICc3JywgJzgnLCAnOScsICcxMCcsICcxMScsICcxMiddLFxyXG4gICAgICAgICAgICBzZXJpZXM6IFtcclxuICAgICAgICAgICAgICAgIFsxMiwgOSwgNywgOCwgNSwgNCwgNiwgMiwgMywgMywgNCwgNl0sXHJcbiAgICAgICAgICAgICAgICBbNCwgNSwgMywgNywgMywgNSwgNSwgMywgNCwgNCwgNSwgNV0sXHJcbiAgICAgICAgICAgICAgICBbNSwgMywgNCwgNSwgNiwgMywgMywgNCwgNSwgNiwgMywgNF0sXHJcbiAgICAgICAgICAgICAgICBbMywgNCwgNSwgNiwgNywgNiwgNCwgNSwgNiwgNywgNiwgM11cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgbG93OiAwLFxyXG4gICAgICAgICAgICBoZWlnaHQ6IDMwMFxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBMZXQncyBwdXQgYSBzZXF1ZW5jZSBudW1iZXIgYXNpZGUgc28gd2UgY2FuIHVzZSBpdCBpbiB0aGUgZXZlbnQgY2FsbGJhY2tzXHJcbiAgICAgICAgdmFyIHNlcSA9IDAsXHJcbiAgICAgICAgICAgIGRlbGF5cyA9IDgwLFxyXG4gICAgICAgICAgICBkdXJhdGlvbnMgPSA1MDA7XHJcblxyXG4gICAgICAgIC8vIE9uY2UgdGhlIGNoYXJ0IGlzIGZ1bGx5IGNyZWF0ZWQgd2UgcmVzZXQgdGhlIHNlcXVlbmNlXHJcbiAgICAgICAgY2hhcnQub24oJ2NyZWF0ZWQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgc2VxID0gMDtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gT24gZWFjaCBkcmF3biBlbGVtZW50IGJ5IENoYXJ0aXN0IHdlIHVzZSB0aGUgQ2hhcnRpc3QuU3ZnIEFQSSB0byB0cmlnZ2VyIFNNSUwgYW5pbWF0aW9uc1xyXG4gICAgICAgIGNoYXJ0Lm9uKCdkcmF3JywgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICBzZXErKztcclxuXHJcbiAgICAgICAgICAgIGlmIChkYXRhLnR5cGUgPT09ICdsaW5lJykge1xyXG4gICAgICAgICAgICAgICAgLy8gSWYgdGhlIGRyYXduIGVsZW1lbnQgaXMgYSBsaW5lIHdlIGRvIGEgc2ltcGxlIG9wYWNpdHkgZmFkZSBpbi4gVGhpcyBjb3VsZCBhbHNvIGJlIGFjaGlldmVkIHVzaW5nIENTUzMgYW5pbWF0aW9ucy5cclxuICAgICAgICAgICAgICAgIGRhdGEuZWxlbWVudC5hbmltYXRlKHtcclxuICAgICAgICAgICAgICAgICAgICBvcGFjaXR5OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSBkZWxheSB3aGVuIHdlIGxpa2UgdG8gc3RhcnQgdGhlIGFuaW1hdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiZWdpbjogc2VxICogZGVsYXlzICsgMTAwMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRHVyYXRpb24gb2YgdGhlIGFuaW1hdGlvblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkdXI6IGR1cmF0aW9ucyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhlIHZhbHVlIHdoZXJlIHRoZSBhbmltYXRpb24gc2hvdWxkIHN0YXJ0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyb206IDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSB2YWx1ZSB3aGVyZSBpdCBzaG91bGQgZW5kXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvOiAxXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZGF0YS50eXBlID09PSAnbGFiZWwnICYmIGRhdGEuYXhpcyA9PT0gJ3gnKSB7XHJcbiAgICAgICAgICAgICAgICBkYXRhLmVsZW1lbnQuYW5pbWF0ZSh7XHJcbiAgICAgICAgICAgICAgICAgICAgeToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBiZWdpbjogc2VxICogZGVsYXlzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkdXI6IGR1cmF0aW9ucyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZnJvbTogZGF0YS55ICsgMTAwLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0bzogZGF0YS55LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBXZSBjYW4gc3BlY2lmeSBhbiBlYXNpbmcgZnVuY3Rpb24gZnJvbSBDaGFydGlzdC5TdmcuRWFzaW5nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ2Vhc2VPdXRRdWFydCdcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChkYXRhLnR5cGUgPT09ICdsYWJlbCcgJiYgZGF0YS5heGlzID09PSAneScpIHtcclxuICAgICAgICAgICAgICAgIGRhdGEuZWxlbWVudC5hbmltYXRlKHtcclxuICAgICAgICAgICAgICAgICAgICB4OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJlZ2luOiBzZXEgKiBkZWxheXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGR1cjogZHVyYXRpb25zLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmcm9tOiBkYXRhLnggLSAxMDAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvOiBkYXRhLngsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ2Vhc2VPdXRRdWFydCdcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChkYXRhLnR5cGUgPT09ICdwb2ludCcpIHtcclxuICAgICAgICAgICAgICAgIGRhdGEuZWxlbWVudC5hbmltYXRlKHtcclxuICAgICAgICAgICAgICAgICAgICB4MToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBiZWdpbjogc2VxICogZGVsYXlzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkdXI6IGR1cmF0aW9ucyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZnJvbTogZGF0YS54IC0gMTAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvOiBkYXRhLngsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ2Vhc2VPdXRRdWFydCdcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHgyOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJlZ2luOiBzZXEgKiBkZWxheXMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGR1cjogZHVyYXRpb25zLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmcm9tOiBkYXRhLnggLSAxMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG86IGRhdGEueCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWFzaW5nOiAnZWFzZU91dFF1YXJ0J1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgb3BhY2l0eToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBiZWdpbjogc2VxICogZGVsYXlzLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBkdXI6IGR1cmF0aW9ucyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZnJvbTogMCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG86IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ2Vhc2VPdXRRdWFydCdcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChkYXRhLnR5cGUgPT09ICdncmlkJykge1xyXG4gICAgICAgICAgICAgICAgLy8gVXNpbmcgZGF0YS5heGlzIHdlIGdldCB4IG9yIHkgd2hpY2ggd2UgY2FuIHVzZSB0byBjb25zdHJ1Y3Qgb3VyIGFuaW1hdGlvbiBkZWZpbml0aW9uIG9iamVjdHNcclxuICAgICAgICAgICAgICAgIHZhciBwb3MxQW5pbWF0aW9uID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGJlZ2luOiBzZXEgKiBkZWxheXMsXHJcbiAgICAgICAgICAgICAgICAgICAgZHVyOiBkdXJhdGlvbnMsXHJcbiAgICAgICAgICAgICAgICAgICAgZnJvbTogZGF0YVtkYXRhLmF4aXMudW5pdHMucG9zICsgJzEnXSAtIDMwLFxyXG4gICAgICAgICAgICAgICAgICAgIHRvOiBkYXRhW2RhdGEuYXhpcy51bml0cy5wb3MgKyAnMSddLFxyXG4gICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ2Vhc2VPdXRRdWFydCdcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIHBvczJBbmltYXRpb24gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYmVnaW46IHNlcSAqIGRlbGF5cyxcclxuICAgICAgICAgICAgICAgICAgICBkdXI6IGR1cmF0aW9ucyxcclxuICAgICAgICAgICAgICAgICAgICBmcm9tOiBkYXRhW2RhdGEuYXhpcy51bml0cy5wb3MgKyAnMiddIC0gMTAwLFxyXG4gICAgICAgICAgICAgICAgICAgIHRvOiBkYXRhW2RhdGEuYXhpcy51bml0cy5wb3MgKyAnMiddLFxyXG4gICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ2Vhc2VPdXRRdWFydCdcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGFuaW1hdGlvbnMgPSB7fTtcclxuICAgICAgICAgICAgICAgIGFuaW1hdGlvbnNbZGF0YS5heGlzLnVuaXRzLnBvcyArICcxJ10gPSBwb3MxQW5pbWF0aW9uO1xyXG4gICAgICAgICAgICAgICAgYW5pbWF0aW9uc1tkYXRhLmF4aXMudW5pdHMucG9zICsgJzInXSA9IHBvczJBbmltYXRpb247XHJcbiAgICAgICAgICAgICAgICBhbmltYXRpb25zWydvcGFjaXR5J10gPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYmVnaW46IHNlcSAqIGRlbGF5cyxcclxuICAgICAgICAgICAgICAgICAgICBkdXI6IGR1cmF0aW9ucyxcclxuICAgICAgICAgICAgICAgICAgICBmcm9tOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgIHRvOiAxLFxyXG4gICAgICAgICAgICAgICAgICAgIGVhc2luZzogJ2Vhc2VPdXRRdWFydCdcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgZGF0YS5lbGVtZW50LmFuaW1hdGUoYW5pbWF0aW9ucyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gRm9yIHRoZSBzYWtlIG9mIHRoZSBleGFtcGxlIHdlIHVwZGF0ZSB0aGUgY2hhcnQgZXZlcnkgdGltZSBpdCdzIGNyZWF0ZWQgd2l0aCBhIGRlbGF5IG9mIDEwIHNlY29uZHNcclxuICAgICAgICBjaGFydC5vbignY3JlYXRlZCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAod2luZG93Ll9fZXhhbXBsZUFuaW1hdGVUaW1lb3V0KSB7XHJcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQod2luZG93Ll9fZXhhbXBsZUFuaW1hdGVUaW1lb3V0KTtcclxuICAgICAgICAgICAgICAgIHdpbmRvdy5fX2V4YW1wbGVBbmltYXRlVGltZW91dCA9IG51bGw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgd2luZG93Ll9fZXhhbXBsZUFuaW1hdGVUaW1lb3V0ID0gc2V0VGltZW91dChjaGFydC51cGRhdGUuYmluZChjaGFydCksIDEyMDAwKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9XHJcblxyXG59KSgpOyIsIi8vIEVhc3lwaWUgY2hhcnQgTG9hZGVyXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgJChpbml0RWFzeVBpZUNoYXJ0KTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0RWFzeVBpZUNoYXJ0KCkge1xyXG5cclxuICAgICAgICBpZiAoISQuZm4uZWFzeVBpZUNoYXJ0KSByZXR1cm47XHJcblxyXG4gICAgICAgIC8vIFVzYWdlIHZpYSBkYXRhIGF0dHJpYnV0ZXNcclxuICAgICAgICAvLyA8ZGl2IGNsYXNzPVwiZWFzeXBpZS1jaGFydFwiIGRhdGEtZWFzeXBpZWNoYXJ0IGRhdGEtcGVyY2VudD1cIlhcIiBkYXRhLW9wdGlvbk5hbWU9XCJ2YWx1ZVwiPjwvZGl2PlxyXG4gICAgICAgICQoJ1tkYXRhLWVhc3lwaWVjaGFydF0nKS5lYWNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgJGVsZW0gPSAkKHRoaXMpO1xyXG4gICAgICAgICAgICB2YXIgb3B0aW9ucyA9ICRlbGVtLmRhdGEoKTtcclxuICAgICAgICAgICAgJGVsZW0uZWFzeVBpZUNoYXJ0KG9wdGlvbnMgfHwge30pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBwcm9ncmFtbWF0aWMgdXNhZ2VcclxuICAgICAgICB2YXIgcGllT3B0aW9uczEgPSB7XHJcbiAgICAgICAgICAgIGFuaW1hdGU6IHtcclxuICAgICAgICAgICAgICAgIGR1cmF0aW9uOiA4MDAsXHJcbiAgICAgICAgICAgICAgICBlbmFibGVkOiB0cnVlXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGJhckNvbG9yOiBBUFBfQ09MT1JTWydzdWNjZXNzJ10sXHJcbiAgICAgICAgICAgIHRyYWNrQ29sb3I6IGZhbHNlLFxyXG4gICAgICAgICAgICBzY2FsZUNvbG9yOiBmYWxzZSxcclxuICAgICAgICAgICAgbGluZVdpZHRoOiAxMCxcclxuICAgICAgICAgICAgbGluZUNhcDogJ2NpcmNsZSdcclxuICAgICAgICB9O1xyXG4gICAgICAgICQoJyNlYXN5cGllMScpLmVhc3lQaWVDaGFydChwaWVPcHRpb25zMSk7XHJcblxyXG4gICAgICAgIHZhciBwaWVPcHRpb25zMiA9IHtcclxuICAgICAgICAgICAgYW5pbWF0ZToge1xyXG4gICAgICAgICAgICAgICAgZHVyYXRpb246IDgwMCxcclxuICAgICAgICAgICAgICAgIGVuYWJsZWQ6IHRydWVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYmFyQ29sb3I6IEFQUF9DT0xPUlNbJ3dhcm5pbmcnXSxcclxuICAgICAgICAgICAgdHJhY2tDb2xvcjogZmFsc2UsXHJcbiAgICAgICAgICAgIHNjYWxlQ29sb3I6IGZhbHNlLFxyXG4gICAgICAgICAgICBsaW5lV2lkdGg6IDQsXHJcbiAgICAgICAgICAgIGxpbmVDYXA6ICdjaXJjbGUnXHJcbiAgICAgICAgfTtcclxuICAgICAgICAkKCcjZWFzeXBpZTInKS5lYXN5UGllQ2hhcnQocGllT3B0aW9uczIpO1xyXG5cclxuICAgICAgICB2YXIgcGllT3B0aW9uczMgPSB7XHJcbiAgICAgICAgICAgIGFuaW1hdGU6IHtcclxuICAgICAgICAgICAgICAgIGR1cmF0aW9uOiA4MDAsXHJcbiAgICAgICAgICAgICAgICBlbmFibGVkOiB0cnVlXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGJhckNvbG9yOiBBUFBfQ09MT1JTWydkYW5nZXInXSxcclxuICAgICAgICAgICAgdHJhY2tDb2xvcjogZmFsc2UsXHJcbiAgICAgICAgICAgIHNjYWxlQ29sb3I6IEFQUF9DT0xPUlNbJ2dyYXknXSxcclxuICAgICAgICAgICAgbGluZVdpZHRoOiAxNSxcclxuICAgICAgICAgICAgbGluZUNhcDogJ2NpcmNsZSdcclxuICAgICAgICB9O1xyXG4gICAgICAgICQoJyNlYXN5cGllMycpLmVhc3lQaWVDaGFydChwaWVPcHRpb25zMyk7XHJcblxyXG4gICAgICAgIHZhciBwaWVPcHRpb25zNCA9IHtcclxuICAgICAgICAgICAgYW5pbWF0ZToge1xyXG4gICAgICAgICAgICAgICAgZHVyYXRpb246IDgwMCxcclxuICAgICAgICAgICAgICAgIGVuYWJsZWQ6IHRydWVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYmFyQ29sb3I6IEFQUF9DT0xPUlNbJ2RhbmdlciddLFxyXG4gICAgICAgICAgICB0cmFja0NvbG9yOiBBUFBfQ09MT1JTWyd5ZWxsb3cnXSxcclxuICAgICAgICAgICAgc2NhbGVDb2xvcjogQVBQX0NPTE9SU1snZ3JheS1kYXJrJ10sXHJcbiAgICAgICAgICAgIGxpbmVXaWR0aDogMTUsXHJcbiAgICAgICAgICAgIGxpbmVDYXA6ICdjaXJjbGUnXHJcbiAgICAgICAgfTtcclxuICAgICAgICAkKCcjZWFzeXBpZTQnKS5lYXN5UGllQ2hhcnQocGllT3B0aW9uczQpO1xyXG5cclxuICAgIH1cclxuXHJcbn0pKCk7IiwiLy8gQ0hBUlQgU1BMSU5FXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAkKGluaXRGbG90U3BsaW5lKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0RmxvdFNwbGluZSgpIHtcclxuXHJcbiAgICAgICAgdmFyIGRhdGEgPSBbe1xyXG4gICAgICAgICAgICBcImxhYmVsXCI6IFwiVW5pcXVlc1wiLFxyXG4gICAgICAgICAgICBcImNvbG9yXCI6IFwiIzc2ODI5NFwiLFxyXG4gICAgICAgICAgICBcImRhdGFcIjogW1xyXG4gICAgICAgICAgICAgICAgW1wiTWFyXCIsIDcwXSxcclxuICAgICAgICAgICAgICAgIFtcIkFwclwiLCA4NV0sXHJcbiAgICAgICAgICAgICAgICBbXCJNYXlcIiwgNTldLFxyXG4gICAgICAgICAgICAgICAgW1wiSnVuXCIsIDkzXSxcclxuICAgICAgICAgICAgICAgIFtcIkp1bFwiLCA2Nl0sXHJcbiAgICAgICAgICAgICAgICBbXCJBdWdcIiwgODZdLFxyXG4gICAgICAgICAgICAgICAgW1wiU2VwXCIsIDYwXVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSwge1xyXG4gICAgICAgICAgICBcImxhYmVsXCI6IFwiUmVjdXJyZW50XCIsXHJcbiAgICAgICAgICAgIFwiY29sb3JcIjogXCIjMWY5MmZlXCIsXHJcbiAgICAgICAgICAgIFwiZGF0YVwiOiBbXHJcbiAgICAgICAgICAgICAgICBbXCJNYXJcIiwgMjFdLFxyXG4gICAgICAgICAgICAgICAgW1wiQXByXCIsIDEyXSxcclxuICAgICAgICAgICAgICAgIFtcIk1heVwiLCAyN10sXHJcbiAgICAgICAgICAgICAgICBbXCJKdW5cIiwgMjRdLFxyXG4gICAgICAgICAgICAgICAgW1wiSnVsXCIsIDE2XSxcclxuICAgICAgICAgICAgICAgIFtcIkF1Z1wiLCAzOV0sXHJcbiAgICAgICAgICAgICAgICBbXCJTZXBcIiwgMTVdXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9XTtcclxuXHJcbiAgICAgICAgdmFyIGRhdGF2MiA9IFt7XHJcbiAgICAgICAgICAgIFwibGFiZWxcIjogXCJIb3Vyc1wiLFxyXG4gICAgICAgICAgICBcImNvbG9yXCI6IFwiIzIzYjdlNVwiLFxyXG4gICAgICAgICAgICBcImRhdGFcIjogW1xyXG4gICAgICAgICAgICAgICAgW1wiSmFuXCIsIDcwXSxcclxuICAgICAgICAgICAgICAgIFtcIkZlYlwiLCAyMF0sXHJcbiAgICAgICAgICAgICAgICBbXCJNYXJcIiwgNzBdLFxyXG4gICAgICAgICAgICAgICAgW1wiQXByXCIsIDg1XSxcclxuICAgICAgICAgICAgICAgIFtcIk1heVwiLCA1OV0sXHJcbiAgICAgICAgICAgICAgICBbXCJKdW5cIiwgOTNdLFxyXG4gICAgICAgICAgICAgICAgW1wiSnVsXCIsIDY2XSxcclxuICAgICAgICAgICAgICAgIFtcIkF1Z1wiLCA4Nl0sXHJcbiAgICAgICAgICAgICAgICBbXCJTZXBcIiwgNjBdLFxyXG4gICAgICAgICAgICAgICAgW1wiT2N0XCIsIDYwXSxcclxuICAgICAgICAgICAgICAgIFtcIk5vdlwiLCAxMl0sXHJcbiAgICAgICAgICAgICAgICBbXCJEZWNcIiwgNTBdXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIFwibGFiZWxcIjogXCJDb21taXRzXCIsXHJcbiAgICAgICAgICAgIFwiY29sb3JcIjogXCIjNzI2NmJhXCIsXHJcbiAgICAgICAgICAgIFwiZGF0YVwiOiBbXHJcbiAgICAgICAgICAgICAgICBbXCJKYW5cIiwgMjBdLFxyXG4gICAgICAgICAgICAgICAgW1wiRmViXCIsIDcwXSxcclxuICAgICAgICAgICAgICAgIFtcIk1hclwiLCAzMF0sXHJcbiAgICAgICAgICAgICAgICBbXCJBcHJcIiwgNTBdLFxyXG4gICAgICAgICAgICAgICAgW1wiTWF5XCIsIDg1XSxcclxuICAgICAgICAgICAgICAgIFtcIkp1blwiLCA0M10sXHJcbiAgICAgICAgICAgICAgICBbXCJKdWxcIiwgOTZdLFxyXG4gICAgICAgICAgICAgICAgW1wiQXVnXCIsIDM2XSxcclxuICAgICAgICAgICAgICAgIFtcIlNlcFwiLCA4MF0sXHJcbiAgICAgICAgICAgICAgICBbXCJPY3RcIiwgMTBdLFxyXG4gICAgICAgICAgICAgICAgW1wiTm92XCIsIDcyXSxcclxuICAgICAgICAgICAgICAgIFtcIkRlY1wiLCAzMV1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH1dO1xyXG5cclxuICAgICAgICB2YXIgZGF0YXYzID0gW3tcclxuICAgICAgICAgICAgXCJsYWJlbFwiOiBcIkhvbWVcIixcclxuICAgICAgICAgICAgXCJjb2xvclwiOiBcIiMxYmEzY2RcIixcclxuICAgICAgICAgICAgXCJkYXRhXCI6IFtcclxuICAgICAgICAgICAgICAgIFtcIjFcIiwgMzhdLFxyXG4gICAgICAgICAgICAgICAgW1wiMlwiLCA0MF0sXHJcbiAgICAgICAgICAgICAgICBbXCIzXCIsIDQyXSxcclxuICAgICAgICAgICAgICAgIFtcIjRcIiwgNDhdLFxyXG4gICAgICAgICAgICAgICAgW1wiNVwiLCA1MF0sXHJcbiAgICAgICAgICAgICAgICBbXCI2XCIsIDcwXSxcclxuICAgICAgICAgICAgICAgIFtcIjdcIiwgMTQ1XSxcclxuICAgICAgICAgICAgICAgIFtcIjhcIiwgNzBdLFxyXG4gICAgICAgICAgICAgICAgW1wiOVwiLCA1OV0sXHJcbiAgICAgICAgICAgICAgICBbXCIxMFwiLCA0OF0sXHJcbiAgICAgICAgICAgICAgICBbXCIxMVwiLCAzOF0sXHJcbiAgICAgICAgICAgICAgICBbXCIxMlwiLCAyOV0sXHJcbiAgICAgICAgICAgICAgICBbXCIxM1wiLCAzMF0sXHJcbiAgICAgICAgICAgICAgICBbXCIxNFwiLCAyMl0sXHJcbiAgICAgICAgICAgICAgICBbXCIxNVwiLCAyOF1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgXCJsYWJlbFwiOiBcIk92ZXJhbGxcIixcclxuICAgICAgICAgICAgXCJjb2xvclwiOiBcIiMzYTNmNTFcIixcclxuICAgICAgICAgICAgXCJkYXRhXCI6IFtcclxuICAgICAgICAgICAgICAgIFtcIjFcIiwgMTZdLFxyXG4gICAgICAgICAgICAgICAgW1wiMlwiLCAxOF0sXHJcbiAgICAgICAgICAgICAgICBbXCIzXCIsIDE3XSxcclxuICAgICAgICAgICAgICAgIFtcIjRcIiwgMTZdLFxyXG4gICAgICAgICAgICAgICAgW1wiNVwiLCAzMF0sXHJcbiAgICAgICAgICAgICAgICBbXCI2XCIsIDExMF0sXHJcbiAgICAgICAgICAgICAgICBbXCI3XCIsIDE5XSxcclxuICAgICAgICAgICAgICAgIFtcIjhcIiwgMThdLFxyXG4gICAgICAgICAgICAgICAgW1wiOVwiLCAxMTBdLFxyXG4gICAgICAgICAgICAgICAgW1wiMTBcIiwgMTldLFxyXG4gICAgICAgICAgICAgICAgW1wiMTFcIiwgMTZdLFxyXG4gICAgICAgICAgICAgICAgW1wiMTJcIiwgMTBdLFxyXG4gICAgICAgICAgICAgICAgW1wiMTNcIiwgMjBdLFxyXG4gICAgICAgICAgICAgICAgW1wiMTRcIiwgMTBdLFxyXG4gICAgICAgICAgICAgICAgW1wiMTVcIiwgMjBdXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9XTtcclxuXHJcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIHNlcmllczoge1xyXG4gICAgICAgICAgICAgICAgbGluZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICBzaG93OiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHBvaW50czoge1xyXG4gICAgICAgICAgICAgICAgICAgIHNob3c6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgcmFkaXVzOiA0XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgc3BsaW5lczoge1xyXG4gICAgICAgICAgICAgICAgICAgIHNob3c6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgdGVuc2lvbjogMC40LFxyXG4gICAgICAgICAgICAgICAgICAgIGxpbmVXaWR0aDogMSxcclxuICAgICAgICAgICAgICAgICAgICBmaWxsOiAwLjVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZ3JpZDoge1xyXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6ICcjZWVlJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcldpZHRoOiAxLFxyXG4gICAgICAgICAgICAgICAgaG92ZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2ZjZmNmYydcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdG9vbHRpcDogdHJ1ZSxcclxuICAgICAgICAgICAgdG9vbHRpcE9wdHM6IHtcclxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGZ1bmN0aW9uKGxhYmVsLCB4LCB5KSB7IHJldHVybiB4ICsgJyA6ICcgKyB5OyB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHhheGlzOiB7XHJcbiAgICAgICAgICAgICAgICB0aWNrQ29sb3I6ICcjZmNmY2ZjJyxcclxuICAgICAgICAgICAgICAgIG1vZGU6ICdjYXRlZ29yaWVzJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB5YXhpczoge1xyXG4gICAgICAgICAgICAgICAgbWluOiAwLFxyXG4gICAgICAgICAgICAgICAgbWF4OiAxNTAsIC8vIG9wdGlvbmFsOiB1c2UgaXQgZm9yIGEgY2xlYXIgcmVwcmVzZXRhdGlvblxyXG4gICAgICAgICAgICAgICAgdGlja0NvbG9yOiAnI2VlZScsXHJcbiAgICAgICAgICAgICAgICAvL3Bvc2l0aW9uOiAncmlnaHQnIG9yICdsZWZ0JyxcclxuICAgICAgICAgICAgICAgIHRpY2tGb3JtYXR0ZXI6IGZ1bmN0aW9uKHYpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdiAvKiArICcgdmlzaXRvcnMnKi8gO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzaGFkb3dTaXplOiAwXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIGNoYXJ0ID0gJCgnLmNoYXJ0LXNwbGluZScpO1xyXG4gICAgICAgIGlmIChjaGFydC5sZW5ndGgpXHJcbiAgICAgICAgICAgICQucGxvdChjaGFydCwgZGF0YSwgb3B0aW9ucyk7XHJcblxyXG4gICAgICAgIHZhciBjaGFydHYyID0gJCgnLmNoYXJ0LXNwbGluZXYyJyk7XHJcbiAgICAgICAgaWYgKGNoYXJ0djIubGVuZ3RoKVxyXG4gICAgICAgICAgICAkLnBsb3QoY2hhcnR2MiwgZGF0YXYyLCBvcHRpb25zKTtcclxuXHJcbiAgICAgICAgdmFyIGNoYXJ0djMgPSAkKCcuY2hhcnQtc3BsaW5ldjMnKTtcclxuICAgICAgICBpZiAoY2hhcnR2My5sZW5ndGgpXHJcbiAgICAgICAgICAgICQucGxvdChjaGFydHYzLCBkYXRhdjMsIG9wdGlvbnMpO1xyXG5cclxuICAgIH1cclxuXHJcbn0pKCk7XHJcblxyXG4vLyBDSEFSVCBBUkVBXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcblxyXG4gICAgJChpbml0RmxvdEFyZWEpXHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdEZsb3RBcmVhKCkge1xyXG5cclxuICAgICAgICB2YXIgZGF0YSA9IFt7XHJcbiAgICAgICAgICAgIFwibGFiZWxcIjogXCJVbmlxdWVzXCIsXHJcbiAgICAgICAgICAgIFwiY29sb3JcIjogXCIjYWFkODc0XCIsXHJcbiAgICAgICAgICAgIFwiZGF0YVwiOiBbXHJcbiAgICAgICAgICAgICAgICBbXCJNYXJcIiwgNTBdLFxyXG4gICAgICAgICAgICAgICAgW1wiQXByXCIsIDg0XSxcclxuICAgICAgICAgICAgICAgIFtcIk1heVwiLCA1Ml0sXHJcbiAgICAgICAgICAgICAgICBbXCJKdW5cIiwgODhdLFxyXG4gICAgICAgICAgICAgICAgW1wiSnVsXCIsIDY5XSxcclxuICAgICAgICAgICAgICAgIFtcIkF1Z1wiLCA5Ml0sXHJcbiAgICAgICAgICAgICAgICBbXCJTZXBcIiwgNThdXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIFwibGFiZWxcIjogXCJSZWN1cnJlbnRcIixcclxuICAgICAgICAgICAgXCJjb2xvclwiOiBcIiM3ZGM3ZGZcIixcclxuICAgICAgICAgICAgXCJkYXRhXCI6IFtcclxuICAgICAgICAgICAgICAgIFtcIk1hclwiLCAxM10sXHJcbiAgICAgICAgICAgICAgICBbXCJBcHJcIiwgNDRdLFxyXG4gICAgICAgICAgICAgICAgW1wiTWF5XCIsIDQ0XSxcclxuICAgICAgICAgICAgICAgIFtcIkp1blwiLCAyN10sXHJcbiAgICAgICAgICAgICAgICBbXCJKdWxcIiwgMzhdLFxyXG4gICAgICAgICAgICAgICAgW1wiQXVnXCIsIDExXSxcclxuICAgICAgICAgICAgICAgIFtcIlNlcFwiLCAzOV1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH1dO1xyXG5cclxuICAgICAgICB2YXIgb3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgc2VyaWVzOiB7XHJcbiAgICAgICAgICAgICAgICBsaW5lczoge1xyXG4gICAgICAgICAgICAgICAgICAgIHNob3c6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgZmlsbDogMC44XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgcG9pbnRzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2hvdzogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICByYWRpdXM6IDRcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZ3JpZDoge1xyXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6ICcjZWVlJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcldpZHRoOiAxLFxyXG4gICAgICAgICAgICAgICAgaG92ZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2ZjZmNmYydcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdG9vbHRpcDogdHJ1ZSxcclxuICAgICAgICAgICAgdG9vbHRpcE9wdHM6IHtcclxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGZ1bmN0aW9uKGxhYmVsLCB4LCB5KSB7IHJldHVybiB4ICsgJyA6ICcgKyB5OyB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHhheGlzOiB7XHJcbiAgICAgICAgICAgICAgICB0aWNrQ29sb3I6ICcjZmNmY2ZjJyxcclxuICAgICAgICAgICAgICAgIG1vZGU6ICdjYXRlZ29yaWVzJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB5YXhpczoge1xyXG4gICAgICAgICAgICAgICAgbWluOiAwLFxyXG4gICAgICAgICAgICAgICAgdGlja0NvbG9yOiAnI2VlZScsXHJcbiAgICAgICAgICAgICAgICAvLyBwb3NpdGlvbjogJ3JpZ2h0JyBvciAnbGVmdCdcclxuICAgICAgICAgICAgICAgIHRpY2tGb3JtYXR0ZXI6IGZ1bmN0aW9uKHYpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdiArICcgdmlzaXRvcnMnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzaGFkb3dTaXplOiAwXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIGNoYXJ0ID0gJCgnLmNoYXJ0LWFyZWEnKTtcclxuICAgICAgICBpZiAoY2hhcnQubGVuZ3RoKVxyXG4gICAgICAgICAgICAkLnBsb3QoY2hhcnQsIGRhdGEsIG9wdGlvbnMpO1xyXG5cclxuICAgIH1cclxuXHJcbn0pKCk7XHJcblxyXG4vLyBDSEFSVCBCQVJcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuXHJcbiAgICAkKGluaXRGbG90QmFyKVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRGbG90QmFyKCkge1xyXG5cclxuICAgICAgICB2YXIgZGF0YSA9IFt7XHJcbiAgICAgICAgICAgIFwibGFiZWxcIjogXCJTYWxlc1wiLFxyXG4gICAgICAgICAgICBcImNvbG9yXCI6IFwiIzljZDE1OVwiLFxyXG4gICAgICAgICAgICBcImRhdGFcIjogW1xyXG4gICAgICAgICAgICAgICAgW1wiSmFuXCIsIDI3XSxcclxuICAgICAgICAgICAgICAgIFtcIkZlYlwiLCA4Ml0sXHJcbiAgICAgICAgICAgICAgICBbXCJNYXJcIiwgNTZdLFxyXG4gICAgICAgICAgICAgICAgW1wiQXByXCIsIDE0XSxcclxuICAgICAgICAgICAgICAgIFtcIk1heVwiLCAyOF0sXHJcbiAgICAgICAgICAgICAgICBbXCJKdW5cIiwgNzddLFxyXG4gICAgICAgICAgICAgICAgW1wiSnVsXCIsIDIzXSxcclxuICAgICAgICAgICAgICAgIFtcIkF1Z1wiLCA0OV0sXHJcbiAgICAgICAgICAgICAgICBbXCJTZXBcIiwgODFdLFxyXG4gICAgICAgICAgICAgICAgW1wiT2N0XCIsIDIwXVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfV07XHJcblxyXG4gICAgICAgIHZhciBvcHRpb25zID0ge1xyXG4gICAgICAgICAgICBzZXJpZXM6IHtcclxuICAgICAgICAgICAgICAgIGJhcnM6IHtcclxuICAgICAgICAgICAgICAgICAgICBhbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgbGluZVdpZHRoOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgIHNob3c6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgYmFyV2lkdGg6IDAuNixcclxuICAgICAgICAgICAgICAgICAgICBmaWxsOiAwLjlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZ3JpZDoge1xyXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6ICcjZWVlJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcldpZHRoOiAxLFxyXG4gICAgICAgICAgICAgICAgaG92ZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2ZjZmNmYydcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdG9vbHRpcDogdHJ1ZSxcclxuICAgICAgICAgICAgdG9vbHRpcE9wdHM6IHtcclxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGZ1bmN0aW9uKGxhYmVsLCB4LCB5KSB7IHJldHVybiB4ICsgJyA6ICcgKyB5OyB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHhheGlzOiB7XHJcbiAgICAgICAgICAgICAgICB0aWNrQ29sb3I6ICcjZmNmY2ZjJyxcclxuICAgICAgICAgICAgICAgIG1vZGU6ICdjYXRlZ29yaWVzJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB5YXhpczoge1xyXG4gICAgICAgICAgICAgICAgLy8gcG9zaXRpb246ICdyaWdodCcgb3IgJ2xlZnQnXHJcbiAgICAgICAgICAgICAgICB0aWNrQ29sb3I6ICcjZWVlJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzaGFkb3dTaXplOiAwXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIGNoYXJ0ID0gJCgnLmNoYXJ0LWJhcicpO1xyXG4gICAgICAgIGlmIChjaGFydC5sZW5ndGgpXHJcbiAgICAgICAgICAgICQucGxvdChjaGFydCwgZGF0YSwgb3B0aW9ucyk7XHJcblxyXG4gICAgfVxyXG5cclxufSkoKTtcclxuXHJcblxyXG4vLyBDSEFSVCBCQVIgU1RBQ0tFRFxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG5cclxuICAgICQoaW5pdEZsb3RCYXJTdGFja2VkKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0RmxvdEJhclN0YWNrZWQoKSB7XHJcblxyXG4gICAgICAgIHZhciBkYXRhID0gW3tcclxuICAgICAgICAgICAgXCJsYWJlbFwiOiBcIlR3ZWV0c1wiLFxyXG4gICAgICAgICAgICBcImNvbG9yXCI6IFwiIzUxYmZmMlwiLFxyXG4gICAgICAgICAgICBcImRhdGFcIjogW1xyXG4gICAgICAgICAgICAgICAgW1wiSmFuXCIsIDU2XSxcclxuICAgICAgICAgICAgICAgIFtcIkZlYlwiLCA4MV0sXHJcbiAgICAgICAgICAgICAgICBbXCJNYXJcIiwgOTddLFxyXG4gICAgICAgICAgICAgICAgW1wiQXByXCIsIDQ0XSxcclxuICAgICAgICAgICAgICAgIFtcIk1heVwiLCAyNF0sXHJcbiAgICAgICAgICAgICAgICBbXCJKdW5cIiwgODVdLFxyXG4gICAgICAgICAgICAgICAgW1wiSnVsXCIsIDk0XSxcclxuICAgICAgICAgICAgICAgIFtcIkF1Z1wiLCA3OF0sXHJcbiAgICAgICAgICAgICAgICBbXCJTZXBcIiwgNTJdLFxyXG4gICAgICAgICAgICAgICAgW1wiT2N0XCIsIDE3XSxcclxuICAgICAgICAgICAgICAgIFtcIk5vdlwiLCA5MF0sXHJcbiAgICAgICAgICAgICAgICBbXCJEZWNcIiwgNjJdXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIFwibGFiZWxcIjogXCJMaWtlc1wiLFxyXG4gICAgICAgICAgICBcImNvbG9yXCI6IFwiIzRhOGVmMVwiLFxyXG4gICAgICAgICAgICBcImRhdGFcIjogW1xyXG4gICAgICAgICAgICAgICAgW1wiSmFuXCIsIDY5XSxcclxuICAgICAgICAgICAgICAgIFtcIkZlYlwiLCAxMzVdLFxyXG4gICAgICAgICAgICAgICAgW1wiTWFyXCIsIDE0XSxcclxuICAgICAgICAgICAgICAgIFtcIkFwclwiLCAxMDBdLFxyXG4gICAgICAgICAgICAgICAgW1wiTWF5XCIsIDEwMF0sXHJcbiAgICAgICAgICAgICAgICBbXCJKdW5cIiwgNjJdLFxyXG4gICAgICAgICAgICAgICAgW1wiSnVsXCIsIDExNV0sXHJcbiAgICAgICAgICAgICAgICBbXCJBdWdcIiwgMjJdLFxyXG4gICAgICAgICAgICAgICAgW1wiU2VwXCIsIDEwNF0sXHJcbiAgICAgICAgICAgICAgICBbXCJPY3RcIiwgMTMyXSxcclxuICAgICAgICAgICAgICAgIFtcIk5vdlwiLCA3Ml0sXHJcbiAgICAgICAgICAgICAgICBbXCJEZWNcIiwgNjFdXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIFwibGFiZWxcIjogXCIrMVwiLFxyXG4gICAgICAgICAgICBcImNvbG9yXCI6IFwiI2YwNjkzYVwiLFxyXG4gICAgICAgICAgICBcImRhdGFcIjogW1xyXG4gICAgICAgICAgICAgICAgW1wiSmFuXCIsIDI5XSxcclxuICAgICAgICAgICAgICAgIFtcIkZlYlwiLCAzNl0sXHJcbiAgICAgICAgICAgICAgICBbXCJNYXJcIiwgNDddLFxyXG4gICAgICAgICAgICAgICAgW1wiQXByXCIsIDIxXSxcclxuICAgICAgICAgICAgICAgIFtcIk1heVwiLCA1XSxcclxuICAgICAgICAgICAgICAgIFtcIkp1blwiLCA0OV0sXHJcbiAgICAgICAgICAgICAgICBbXCJKdWxcIiwgMzddLFxyXG4gICAgICAgICAgICAgICAgW1wiQXVnXCIsIDQ0XSxcclxuICAgICAgICAgICAgICAgIFtcIlNlcFwiLCAyOF0sXHJcbiAgICAgICAgICAgICAgICBbXCJPY3RcIiwgOV0sXHJcbiAgICAgICAgICAgICAgICBbXCJOb3ZcIiwgMTJdLFxyXG4gICAgICAgICAgICAgICAgW1wiRGVjXCIsIDM1XVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfV07XHJcblxyXG4gICAgICAgIHZhciBkYXRhdjIgPSBbe1xyXG4gICAgICAgICAgICBcImxhYmVsXCI6IFwiUGVuZGluZ1wiLFxyXG4gICAgICAgICAgICBcImNvbG9yXCI6IFwiIzkyODljYVwiLFxyXG4gICAgICAgICAgICBcImRhdGFcIjogW1xyXG4gICAgICAgICAgICAgICAgW1wiUGoxXCIsIDg2XSxcclxuICAgICAgICAgICAgICAgIFtcIlBqMlwiLCAxMzZdLFxyXG4gICAgICAgICAgICAgICAgW1wiUGozXCIsIDk3XSxcclxuICAgICAgICAgICAgICAgIFtcIlBqNFwiLCAxMTBdLFxyXG4gICAgICAgICAgICAgICAgW1wiUGo1XCIsIDYyXSxcclxuICAgICAgICAgICAgICAgIFtcIlBqNlwiLCA4NV0sXHJcbiAgICAgICAgICAgICAgICBbXCJQajdcIiwgMTE1XSxcclxuICAgICAgICAgICAgICAgIFtcIlBqOFwiLCA3OF0sXHJcbiAgICAgICAgICAgICAgICBbXCJQajlcIiwgMTA0XSxcclxuICAgICAgICAgICAgICAgIFtcIlBqMTBcIiwgODJdLFxyXG4gICAgICAgICAgICAgICAgW1wiUGoxMVwiLCA5N10sXHJcbiAgICAgICAgICAgICAgICBbXCJQajEyXCIsIDExMF0sXHJcbiAgICAgICAgICAgICAgICBbXCJQajEzXCIsIDYyXVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSwge1xyXG4gICAgICAgICAgICBcImxhYmVsXCI6IFwiQXNzaWduZWRcIixcclxuICAgICAgICAgICAgXCJjb2xvclwiOiBcIiM3MjY2YmFcIixcclxuICAgICAgICAgICAgXCJkYXRhXCI6IFtcclxuICAgICAgICAgICAgICAgIFtcIlBqMVwiLCA0OV0sXHJcbiAgICAgICAgICAgICAgICBbXCJQajJcIiwgODFdLFxyXG4gICAgICAgICAgICAgICAgW1wiUGozXCIsIDQ3XSxcclxuICAgICAgICAgICAgICAgIFtcIlBqNFwiLCA0NF0sXHJcbiAgICAgICAgICAgICAgICBbXCJQajVcIiwgMTAwXSxcclxuICAgICAgICAgICAgICAgIFtcIlBqNlwiLCA0OV0sXHJcbiAgICAgICAgICAgICAgICBbXCJQajdcIiwgOTRdLFxyXG4gICAgICAgICAgICAgICAgW1wiUGo4XCIsIDQ0XSxcclxuICAgICAgICAgICAgICAgIFtcIlBqOVwiLCA1Ml0sXHJcbiAgICAgICAgICAgICAgICBbXCJQajEwXCIsIDE3XSxcclxuICAgICAgICAgICAgICAgIFtcIlBqMTFcIiwgNDddLFxyXG4gICAgICAgICAgICAgICAgW1wiUGoxMlwiLCA0NF0sXHJcbiAgICAgICAgICAgICAgICBbXCJQajEzXCIsIDEwMF1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgXCJsYWJlbFwiOiBcIkNvbXBsZXRlZFwiLFxyXG4gICAgICAgICAgICBcImNvbG9yXCI6IFwiIzU2NGFhM1wiLFxyXG4gICAgICAgICAgICBcImRhdGFcIjogW1xyXG4gICAgICAgICAgICAgICAgW1wiUGoxXCIsIDI5XSxcclxuICAgICAgICAgICAgICAgIFtcIlBqMlwiLCA1Nl0sXHJcbiAgICAgICAgICAgICAgICBbXCJQajNcIiwgMTRdLFxyXG4gICAgICAgICAgICAgICAgW1wiUGo0XCIsIDIxXSxcclxuICAgICAgICAgICAgICAgIFtcIlBqNVwiLCA1XSxcclxuICAgICAgICAgICAgICAgIFtcIlBqNlwiLCAyNF0sXHJcbiAgICAgICAgICAgICAgICBbXCJQajdcIiwgMzddLFxyXG4gICAgICAgICAgICAgICAgW1wiUGo4XCIsIDIyXSxcclxuICAgICAgICAgICAgICAgIFtcIlBqOVwiLCAyOF0sXHJcbiAgICAgICAgICAgICAgICBbXCJQajEwXCIsIDldLFxyXG4gICAgICAgICAgICAgICAgW1wiUGoxMVwiLCAxNF0sXHJcbiAgICAgICAgICAgICAgICBbXCJQajEyXCIsIDIxXSxcclxuICAgICAgICAgICAgICAgIFtcIlBqMTNcIiwgNV1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH1dO1xyXG5cclxuICAgICAgICB2YXIgb3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgc2VyaWVzOiB7XHJcbiAgICAgICAgICAgICAgICBzdGFjazogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGJhcnM6IHtcclxuICAgICAgICAgICAgICAgICAgICBhbGlnbjogJ2NlbnRlcicsXHJcbiAgICAgICAgICAgICAgICAgICAgbGluZVdpZHRoOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgIHNob3c6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgYmFyV2lkdGg6IDAuNixcclxuICAgICAgICAgICAgICAgICAgICBmaWxsOiAwLjlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZ3JpZDoge1xyXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6ICcjZWVlJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcldpZHRoOiAxLFxyXG4gICAgICAgICAgICAgICAgaG92ZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2ZjZmNmYydcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdG9vbHRpcDogdHJ1ZSxcclxuICAgICAgICAgICAgdG9vbHRpcE9wdHM6IHtcclxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGZ1bmN0aW9uKGxhYmVsLCB4LCB5KSB7IHJldHVybiB4ICsgJyA6ICcgKyB5OyB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHhheGlzOiB7XHJcbiAgICAgICAgICAgICAgICB0aWNrQ29sb3I6ICcjZmNmY2ZjJyxcclxuICAgICAgICAgICAgICAgIG1vZGU6ICdjYXRlZ29yaWVzJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB5YXhpczoge1xyXG4gICAgICAgICAgICAgICAgLy8gcG9zaXRpb246ICdyaWdodCcgb3IgJ2xlZnQnXHJcbiAgICAgICAgICAgICAgICB0aWNrQ29sb3I6ICcjZWVlJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzaGFkb3dTaXplOiAwXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIGNoYXJ0ID0gJCgnLmNoYXJ0LWJhci1zdGFja2VkJyk7XHJcbiAgICAgICAgaWYgKGNoYXJ0Lmxlbmd0aClcclxuICAgICAgICAgICAgJC5wbG90KGNoYXJ0LCBkYXRhLCBvcHRpb25zKTtcclxuXHJcbiAgICAgICAgdmFyIGNoYXJ0djIgPSAkKCcuY2hhcnQtYmFyLXN0YWNrZWR2MicpO1xyXG4gICAgICAgIGlmIChjaGFydHYyLmxlbmd0aClcclxuICAgICAgICAgICAgJC5wbG90KGNoYXJ0djIsIGRhdGF2Miwgb3B0aW9ucyk7XHJcblxyXG4gICAgfVxyXG5cclxufSkoKTtcclxuXHJcbi8vIENIQVJUIERPTlVUXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcblxyXG4gICAgJChpbml0RmxvdERvbnV0KTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0RmxvdERvbnV0KCkge1xyXG5cclxuICAgICAgICB2YXIgZGF0YSA9IFt7XHJcbiAgICAgICAgICAgIFwiY29sb3JcIjogXCIjMzlDNTU4XCIsXHJcbiAgICAgICAgICAgIFwiZGF0YVwiOiA2MCxcclxuICAgICAgICAgICAgXCJsYWJlbFwiOiBcIkNvZmZlZVwiXHJcbiAgICAgICAgfSwge1xyXG4gICAgICAgICAgICBcImNvbG9yXCI6IFwiIzAwYjRmZlwiLFxyXG4gICAgICAgICAgICBcImRhdGFcIjogOTAsXHJcbiAgICAgICAgICAgIFwibGFiZWxcIjogXCJDU1NcIlxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgXCJjb2xvclwiOiBcIiNGRkJFNDFcIixcclxuICAgICAgICAgICAgXCJkYXRhXCI6IDUwLFxyXG4gICAgICAgICAgICBcImxhYmVsXCI6IFwiTEVTU1wiXHJcbiAgICAgICAgfSwge1xyXG4gICAgICAgICAgICBcImNvbG9yXCI6IFwiI2ZmM2U0M1wiLFxyXG4gICAgICAgICAgICBcImRhdGFcIjogODAsXHJcbiAgICAgICAgICAgIFwibGFiZWxcIjogXCJKYWRlXCJcclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIFwiY29sb3JcIjogXCIjOTM3ZmM3XCIsXHJcbiAgICAgICAgICAgIFwiZGF0YVwiOiAxMTYsXHJcbiAgICAgICAgICAgIFwibGFiZWxcIjogXCJBbmd1bGFySlNcIlxyXG4gICAgICAgIH1dO1xyXG5cclxuICAgICAgICB2YXIgb3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgc2VyaWVzOiB7XHJcbiAgICAgICAgICAgICAgICBwaWU6IHtcclxuICAgICAgICAgICAgICAgICAgICBzaG93OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGlubmVyUmFkaXVzOiAwLjUgLy8gVGhpcyBtYWtlcyB0aGUgZG9udXQgc2hhcGVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBjaGFydCA9ICQoJy5jaGFydC1kb251dCcpO1xyXG4gICAgICAgIGlmIChjaGFydC5sZW5ndGgpXHJcbiAgICAgICAgICAgICQucGxvdChjaGFydCwgZGF0YSwgb3B0aW9ucyk7XHJcblxyXG4gICAgfVxyXG5cclxufSkoKTtcclxuXHJcbi8vIENIQVJUIExJTkVcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuXHJcbiAgICAkKGluaXRGbG90TGluZSlcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0RmxvdExpbmUoKSB7XHJcblxyXG4gICAgICAgIHZhciBkYXRhID0gW3tcclxuICAgICAgICAgICAgXCJsYWJlbFwiOiBcIkNvbXBsZXRlXCIsXHJcbiAgICAgICAgICAgIFwiY29sb3JcIjogXCIjNWFiMWVmXCIsXHJcbiAgICAgICAgICAgIFwiZGF0YVwiOiBbXHJcbiAgICAgICAgICAgICAgICBbXCJKYW5cIiwgMTg4XSxcclxuICAgICAgICAgICAgICAgIFtcIkZlYlwiLCAxODNdLFxyXG4gICAgICAgICAgICAgICAgW1wiTWFyXCIsIDE4NV0sXHJcbiAgICAgICAgICAgICAgICBbXCJBcHJcIiwgMTk5XSxcclxuICAgICAgICAgICAgICAgIFtcIk1heVwiLCAxOTBdLFxyXG4gICAgICAgICAgICAgICAgW1wiSnVuXCIsIDE5NF0sXHJcbiAgICAgICAgICAgICAgICBbXCJKdWxcIiwgMTk0XSxcclxuICAgICAgICAgICAgICAgIFtcIkF1Z1wiLCAxODRdLFxyXG4gICAgICAgICAgICAgICAgW1wiU2VwXCIsIDc0XVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfSwge1xyXG4gICAgICAgICAgICBcImxhYmVsXCI6IFwiSW4gUHJvZ3Jlc3NcIixcclxuICAgICAgICAgICAgXCJjb2xvclwiOiBcIiNmNTk5NGVcIixcclxuICAgICAgICAgICAgXCJkYXRhXCI6IFtcclxuICAgICAgICAgICAgICAgIFtcIkphblwiLCAxNTNdLFxyXG4gICAgICAgICAgICAgICAgW1wiRmViXCIsIDExNl0sXHJcbiAgICAgICAgICAgICAgICBbXCJNYXJcIiwgMTM2XSxcclxuICAgICAgICAgICAgICAgIFtcIkFwclwiLCAxMTldLFxyXG4gICAgICAgICAgICAgICAgW1wiTWF5XCIsIDE0OF0sXHJcbiAgICAgICAgICAgICAgICBbXCJKdW5cIiwgMTMzXSxcclxuICAgICAgICAgICAgICAgIFtcIkp1bFwiLCAxMThdLFxyXG4gICAgICAgICAgICAgICAgW1wiQXVnXCIsIDE2MV0sXHJcbiAgICAgICAgICAgICAgICBbXCJTZXBcIiwgNTldXHJcbiAgICAgICAgICAgIF1cclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIFwibGFiZWxcIjogXCJDYW5jZWxsZWRcIixcclxuICAgICAgICAgICAgXCJjb2xvclwiOiBcIiNkODdhODBcIixcclxuICAgICAgICAgICAgXCJkYXRhXCI6IFtcclxuICAgICAgICAgICAgICAgIFtcIkphblwiLCAxMTFdLFxyXG4gICAgICAgICAgICAgICAgW1wiRmViXCIsIDk3XSxcclxuICAgICAgICAgICAgICAgIFtcIk1hclwiLCA5M10sXHJcbiAgICAgICAgICAgICAgICBbXCJBcHJcIiwgMTEwXSxcclxuICAgICAgICAgICAgICAgIFtcIk1heVwiLCAxMDJdLFxyXG4gICAgICAgICAgICAgICAgW1wiSnVuXCIsIDkzXSxcclxuICAgICAgICAgICAgICAgIFtcIkp1bFwiLCA5Ml0sXHJcbiAgICAgICAgICAgICAgICBbXCJBdWdcIiwgOTJdLFxyXG4gICAgICAgICAgICAgICAgW1wiU2VwXCIsIDQ0XVxyXG4gICAgICAgICAgICBdXHJcbiAgICAgICAgfV07XHJcblxyXG4gICAgICAgIHZhciBvcHRpb25zID0ge1xyXG4gICAgICAgICAgICBzZXJpZXM6IHtcclxuICAgICAgICAgICAgICAgIGxpbmVzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2hvdzogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBmaWxsOiAwLjAxXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgcG9pbnRzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2hvdzogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICByYWRpdXM6IDRcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZ3JpZDoge1xyXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6ICcjZWVlJyxcclxuICAgICAgICAgICAgICAgIGJvcmRlcldpZHRoOiAxLFxyXG4gICAgICAgICAgICAgICAgaG92ZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2ZjZmNmYydcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdG9vbHRpcDogdHJ1ZSxcclxuICAgICAgICAgICAgdG9vbHRpcE9wdHM6IHtcclxuICAgICAgICAgICAgICAgIGNvbnRlbnQ6IGZ1bmN0aW9uKGxhYmVsLCB4LCB5KSB7IHJldHVybiB4ICsgJyA6ICcgKyB5OyB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHhheGlzOiB7XHJcbiAgICAgICAgICAgICAgICB0aWNrQ29sb3I6ICcjZWVlJyxcclxuICAgICAgICAgICAgICAgIG1vZGU6ICdjYXRlZ29yaWVzJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB5YXhpczoge1xyXG4gICAgICAgICAgICAgICAgLy8gcG9zaXRpb246ICdyaWdodCcgb3IgJ2xlZnQnXHJcbiAgICAgICAgICAgICAgICB0aWNrQ29sb3I6ICcjZWVlJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzaGFkb3dTaXplOiAwXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIGNoYXJ0ID0gJCgnLmNoYXJ0LWxpbmUnKTtcclxuICAgICAgICBpZiAoY2hhcnQubGVuZ3RoKVxyXG4gICAgICAgICAgICAkLnBsb3QoY2hhcnQsIGRhdGEsIG9wdGlvbnMpO1xyXG5cclxuICAgIH1cclxuXHJcbn0pKCk7XHJcblxyXG5cclxuLy8gQ0hBUlQgUElFXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcblxyXG4gICAgJChpbml0RmxvdFBpZSk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdEZsb3RQaWUoKSB7XHJcblxyXG4gICAgICAgIHZhciBkYXRhID0gW3tcclxuICAgICAgICAgICAgXCJsYWJlbFwiOiBcImpRdWVyeVwiLFxyXG4gICAgICAgICAgICBcImNvbG9yXCI6IFwiIzRhY2FiNFwiLFxyXG4gICAgICAgICAgICBcImRhdGFcIjogMzBcclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIFwibGFiZWxcIjogXCJDU1NcIixcclxuICAgICAgICAgICAgXCJjb2xvclwiOiBcIiNmZmVhODhcIixcclxuICAgICAgICAgICAgXCJkYXRhXCI6IDQwXHJcbiAgICAgICAgfSwge1xyXG4gICAgICAgICAgICBcImxhYmVsXCI6IFwiTEVTU1wiLFxyXG4gICAgICAgICAgICBcImNvbG9yXCI6IFwiI2ZmODE1M1wiLFxyXG4gICAgICAgICAgICBcImRhdGFcIjogOTBcclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIFwibGFiZWxcIjogXCJTQVNTXCIsXHJcbiAgICAgICAgICAgIFwiY29sb3JcIjogXCIjODc4YmI2XCIsXHJcbiAgICAgICAgICAgIFwiZGF0YVwiOiA3NVxyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgICAgXCJsYWJlbFwiOiBcIkphZGVcIixcclxuICAgICAgICAgICAgXCJjb2xvclwiOiBcIiNiMmQ3NjdcIixcclxuICAgICAgICAgICAgXCJkYXRhXCI6IDEyMFxyXG4gICAgICAgIH1dO1xyXG5cclxuICAgICAgICB2YXIgb3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgc2VyaWVzOiB7XHJcbiAgICAgICAgICAgICAgICBwaWU6IHtcclxuICAgICAgICAgICAgICAgICAgICBzaG93OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgIGlubmVyUmFkaXVzOiAwLFxyXG4gICAgICAgICAgICAgICAgICAgIGxhYmVsOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNob3c6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJhZGl1czogMC44LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3JtYXR0ZXI6IGZ1bmN0aW9uKGxhYmVsLCBzZXJpZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cImZsb3QtcGllLWxhYmVsXCI+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9sYWJlbCArICcgOiAnICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBNYXRoLnJvdW5kKHNlcmllcy5wZXJjZW50KSArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyU8L2Rpdj4nO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcGFjaXR5OiAwLjgsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvcjogJyMyMjInXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgY2hhcnQgPSAkKCcuY2hhcnQtcGllJyk7XHJcbiAgICAgICAgaWYgKGNoYXJ0Lmxlbmd0aClcclxuICAgICAgICAgICAgJC5wbG90KGNoYXJ0LCBkYXRhLCBvcHRpb25zKTtcclxuXHJcbiAgICB9XHJcblxyXG59KSgpOyIsIi8vIE1vcnJpc1xyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICQoaW5pdE1vcnJpcyk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdE1vcnJpcygpIHtcclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBNb3JyaXMgPT09ICd1bmRlZmluZWQnKSByZXR1cm47XHJcblxyXG4gICAgICAgIHZhciBjaGFydGRhdGEgPSBbXHJcbiAgICAgICAgICAgIHsgeTogXCIyMDA2XCIsIGE6IDEwMCwgYjogOTAgfSxcclxuICAgICAgICAgICAgeyB5OiBcIjIwMDdcIiwgYTogNzUsIGI6IDY1IH0sXHJcbiAgICAgICAgICAgIHsgeTogXCIyMDA4XCIsIGE6IDUwLCBiOiA0MCB9LFxyXG4gICAgICAgICAgICB7IHk6IFwiMjAwOVwiLCBhOiA3NSwgYjogNjUgfSxcclxuICAgICAgICAgICAgeyB5OiBcIjIwMTBcIiwgYTogNTAsIGI6IDQwIH0sXHJcbiAgICAgICAgICAgIHsgeTogXCIyMDExXCIsIGE6IDc1LCBiOiA2NSB9LFxyXG4gICAgICAgICAgICB7IHk6IFwiMjAxMlwiLCBhOiAxMDAsIGI6IDkwIH1cclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICB2YXIgZG9udXRkYXRhID0gW1xyXG4gICAgICAgICAgICB7IGxhYmVsOiBcIkRvd25sb2FkIFNhbGVzXCIsIHZhbHVlOiAxMiB9LFxyXG4gICAgICAgICAgICB7IGxhYmVsOiBcIkluLVN0b3JlIFNhbGVzXCIsIHZhbHVlOiAzMCB9LFxyXG4gICAgICAgICAgICB7IGxhYmVsOiBcIk1haWwtT3JkZXIgU2FsZXNcIiwgdmFsdWU6IDIwIH1cclxuICAgICAgICBdO1xyXG5cclxuICAgICAgICAvLyBMaW5lIENoYXJ0XHJcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAgICAgbmV3IE1vcnJpcy5MaW5lKHtcclxuICAgICAgICAgICAgZWxlbWVudDogJ21vcnJpcy1saW5lJyxcclxuICAgICAgICAgICAgZGF0YTogY2hhcnRkYXRhLFxyXG4gICAgICAgICAgICB4a2V5OiAneScsXHJcbiAgICAgICAgICAgIHlrZXlzOiBbXCJhXCIsIFwiYlwiXSxcclxuICAgICAgICAgICAgbGFiZWxzOiBbXCJTZXJpZSBBXCIsIFwiU2VyaWUgQlwiXSxcclxuICAgICAgICAgICAgbGluZUNvbG9yczogW1wiIzMxQzBCRVwiLCBcIiM3YTkyYTNcIl0sXHJcbiAgICAgICAgICAgIHJlc2l6ZTogdHJ1ZVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBEb251dCBDaGFydFxyXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICAgICAgbmV3IE1vcnJpcy5Eb251dCh7XHJcbiAgICAgICAgICAgIGVsZW1lbnQ6ICdtb3JyaXMtZG9udXQnLFxyXG4gICAgICAgICAgICBkYXRhOiBkb251dGRhdGEsXHJcbiAgICAgICAgICAgIGNvbG9yczogWycjZjA1MDUwJywgJyNmYWQ3MzInLCAnI2ZmOTAyYiddLFxyXG4gICAgICAgICAgICByZXNpemU6IHRydWVcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gQmFyIENoYXJ0XHJcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICBuZXcgTW9ycmlzLkJhcih7XHJcbiAgICAgICAgICAgIGVsZW1lbnQ6ICdtb3JyaXMtYmFyJyxcclxuICAgICAgICAgICAgZGF0YTogY2hhcnRkYXRhLFxyXG4gICAgICAgICAgICB4a2V5OiAneScsXHJcbiAgICAgICAgICAgIHlrZXlzOiBbXCJhXCIsIFwiYlwiXSxcclxuICAgICAgICAgICAgbGFiZWxzOiBbXCJTZXJpZXMgQVwiLCBcIlNlcmllcyBCXCJdLFxyXG4gICAgICAgICAgICB4TGFiZWxNYXJnaW46IDIsXHJcbiAgICAgICAgICAgIGJhckNvbG9yczogWycjMjNiN2U1JywgJyNmMDUwNTAnXSxcclxuICAgICAgICAgICAgcmVzaXplOiB0cnVlXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIEFyZWEgQ2hhcnRcclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgIG5ldyBNb3JyaXMuQXJlYSh7XHJcbiAgICAgICAgICAgIGVsZW1lbnQ6ICdtb3JyaXMtYXJlYScsXHJcbiAgICAgICAgICAgIGRhdGE6IGNoYXJ0ZGF0YSxcclxuICAgICAgICAgICAgeGtleTogJ3knLFxyXG4gICAgICAgICAgICB5a2V5czogW1wiYVwiLCBcImJcIl0sXHJcbiAgICAgICAgICAgIGxhYmVsczogW1wiU2VyaWUgQVwiLCBcIlNlcmllIEJcIl0sXHJcbiAgICAgICAgICAgIGxpbmVDb2xvcnM6IFsnIzcyNjZiYScsICcjMjNiN2U1J10sXHJcbiAgICAgICAgICAgIHJlc2l6ZTogdHJ1ZVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH1cclxuXHJcbn0pKCk7IiwiLy8gUmlja3NoYXdcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAkKGluaXRNb3JyaXMpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRNb3JyaXMoKSB7XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2YgUmlja3NoYXcgPT09ICd1bmRlZmluZWQnKSByZXR1cm47XHJcblxyXG4gICAgICAgIHZhciBzZXJpZXNEYXRhID0gW1xyXG4gICAgICAgICAgICBbXSxcclxuICAgICAgICAgICAgW10sXHJcbiAgICAgICAgICAgIFtdXHJcbiAgICAgICAgXTtcclxuICAgICAgICB2YXIgcmFuZG9tID0gbmV3IFJpY2tzaGF3LkZpeHR1cmVzLlJhbmRvbURhdGEoMTUwKTtcclxuXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAxNTA7IGkrKykge1xyXG4gICAgICAgICAgICByYW5kb20uYWRkRGF0YShzZXJpZXNEYXRhKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBzZXJpZXMxID0gW3tcclxuICAgICAgICAgICAgY29sb3I6IFwiI2MwNTAyMFwiLFxyXG4gICAgICAgICAgICBkYXRhOiBzZXJpZXNEYXRhWzBdLFxyXG4gICAgICAgICAgICBuYW1lOiAnTmV3IFlvcmsnXHJcbiAgICAgICAgfSwge1xyXG4gICAgICAgICAgICBjb2xvcjogXCIjMzBjMDIwXCIsXHJcbiAgICAgICAgICAgIGRhdGE6IHNlcmllc0RhdGFbMV0sXHJcbiAgICAgICAgICAgIG5hbWU6ICdMb25kb24nXHJcbiAgICAgICAgfSwge1xyXG4gICAgICAgICAgICBjb2xvcjogXCIjNjA2MGMwXCIsXHJcbiAgICAgICAgICAgIGRhdGE6IHNlcmllc0RhdGFbMl0sXHJcbiAgICAgICAgICAgIG5hbWU6ICdUb2t5bydcclxuICAgICAgICB9XTtcclxuXHJcbiAgICAgICAgdmFyIGdyYXBoMSA9IG5ldyBSaWNrc2hhdy5HcmFwaCh7XHJcbiAgICAgICAgICAgIGVsZW1lbnQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcmlja3NoYXcxXCIpLFxyXG4gICAgICAgICAgICBzZXJpZXM6IHNlcmllczEsXHJcbiAgICAgICAgICAgIHJlbmRlcmVyOiAnYXJlYSdcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZ3JhcGgxLnJlbmRlcigpO1xyXG5cclxuXHJcbiAgICAgICAgLy8gR3JhcGggMlxyXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgICAgIHZhciBncmFwaDIgPSBuZXcgUmlja3NoYXcuR3JhcGgoe1xyXG4gICAgICAgICAgICBlbGVtZW50OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3JpY2tzaGF3MlwiKSxcclxuICAgICAgICAgICAgcmVuZGVyZXI6ICdhcmVhJyxcclxuICAgICAgICAgICAgc3Ryb2tlOiB0cnVlLFxyXG4gICAgICAgICAgICBzZXJpZXM6IFt7XHJcbiAgICAgICAgICAgICAgICBkYXRhOiBbeyB4OiAwLCB5OiA0MCB9LCB7IHg6IDEsIHk6IDQ5IH0sIHsgeDogMiwgeTogMzggfSwgeyB4OiAzLCB5OiAzMCB9LCB7IHg6IDQsIHk6IDMyIH1dLFxyXG4gICAgICAgICAgICAgICAgY29sb3I6ICcjZjA1MDUwJ1xyXG4gICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICBkYXRhOiBbeyB4OiAwLCB5OiA0MCB9LCB7IHg6IDEsIHk6IDQ5IH0sIHsgeDogMiwgeTogMzggfSwgeyB4OiAzLCB5OiAzMCB9LCB7IHg6IDQsIHk6IDMyIH1dLFxyXG4gICAgICAgICAgICAgICAgY29sb3I6ICcjZmFkNzMyJ1xyXG4gICAgICAgICAgICB9XVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBncmFwaDIucmVuZGVyKCk7XHJcblxyXG4gICAgICAgIC8vIEdyYXBoIDNcclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuXHJcbiAgICAgICAgdmFyIGdyYXBoMyA9IG5ldyBSaWNrc2hhdy5HcmFwaCh7XHJcbiAgICAgICAgICAgIGVsZW1lbnQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcmlja3NoYXczXCIpLFxyXG4gICAgICAgICAgICByZW5kZXJlcjogJ2xpbmUnLFxyXG4gICAgICAgICAgICBzZXJpZXM6IFt7XHJcbiAgICAgICAgICAgICAgICBkYXRhOiBbeyB4OiAwLCB5OiA0MCB9LCB7IHg6IDEsIHk6IDQ5IH0sIHsgeDogMiwgeTogMzggfSwgeyB4OiAzLCB5OiAzMCB9LCB7IHg6IDQsIHk6IDMyIH1dLFxyXG4gICAgICAgICAgICAgICAgY29sb3I6ICcjNzI2NmJhJ1xyXG4gICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgICBkYXRhOiBbeyB4OiAwLCB5OiAyMCB9LCB7IHg6IDEsIHk6IDI0IH0sIHsgeDogMiwgeTogMTkgfSwgeyB4OiAzLCB5OiAxNSB9LCB7IHg6IDQsIHk6IDE2IH1dLFxyXG4gICAgICAgICAgICAgICAgY29sb3I6ICcjMjNiN2U1J1xyXG4gICAgICAgICAgICB9XVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGdyYXBoMy5yZW5kZXIoKTtcclxuXHJcblxyXG4gICAgICAgIC8vIEdyYXBoIDRcclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuXHJcbiAgICAgICAgdmFyIGdyYXBoNCA9IG5ldyBSaWNrc2hhdy5HcmFwaCh7XHJcbiAgICAgICAgICAgIGVsZW1lbnQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcmlja3NoYXc0XCIpLFxyXG4gICAgICAgICAgICByZW5kZXJlcjogJ2JhcicsXHJcbiAgICAgICAgICAgIHNlcmllczogW3tcclxuICAgICAgICAgICAgICAgIGRhdGE6IFt7IHg6IDAsIHk6IDQwIH0sIHsgeDogMSwgeTogNDkgfSwgeyB4OiAyLCB5OiAzOCB9LCB7IHg6IDMsIHk6IDMwIH0sIHsgeDogNCwgeTogMzIgfV0sXHJcbiAgICAgICAgICAgICAgICBjb2xvcjogJyNmYWQ3MzInXHJcbiAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgIGRhdGE6IFt7IHg6IDAsIHk6IDIwIH0sIHsgeDogMSwgeTogMjQgfSwgeyB4OiAyLCB5OiAxOSB9LCB7IHg6IDMsIHk6IDE1IH0sIHsgeDogNCwgeTogMTYgfV0sXHJcbiAgICAgICAgICAgICAgICBjb2xvcjogJyNmZjkwMmInXHJcblxyXG4gICAgICAgICAgICB9XVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGdyYXBoNC5yZW5kZXIoKTtcclxuXHJcbiAgICB9XHJcblxyXG59KSgpOyIsIi8vIFNQQVJLTElORVxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICQoaW5pdFNwYXJrbGluZSk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFNwYXJrbGluZSgpIHtcclxuXHJcbiAgICAgICAgJCgnW2RhdGEtc3BhcmtsaW5lXScpLmVhY2goaW5pdFNwYXJrTGluZSk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGluaXRTcGFya0xpbmUoKSB7XHJcbiAgICAgICAgICAgIHZhciAkZWxlbWVudCA9ICQodGhpcyksXHJcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gJGVsZW1lbnQuZGF0YSgpLFxyXG4gICAgICAgICAgICAgICAgdmFsdWVzID0gb3B0aW9ucy52YWx1ZXMgJiYgb3B0aW9ucy52YWx1ZXMuc3BsaXQoJywnKTtcclxuXHJcbiAgICAgICAgICAgIG9wdGlvbnMudHlwZSA9IG9wdGlvbnMudHlwZSB8fCAnYmFyJzsgLy8gZGVmYXVsdCBjaGFydCBpcyBiYXJcclxuICAgICAgICAgICAgb3B0aW9ucy5kaXNhYmxlSGlkZGVuQ2hlY2sgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgJGVsZW1lbnQuc3BhcmtsaW5lKHZhbHVlcywgb3B0aW9ucyk7XHJcblxyXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5yZXNpemUpIHtcclxuICAgICAgICAgICAgICAgICQod2luZG93KS5yZXNpemUoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGVsZW1lbnQuc3BhcmtsaW5lKHZhbHVlcywgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn0pKCk7IiwiLy8gU3RhcnQgQm9vdHN0cmFwIEpTXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgJChpbml0Qm9vdHN0cmFwKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0Qm9vdHN0cmFwKCkge1xyXG5cclxuICAgICAgICAvLyBuZWNlc3NhcnkgY2hlY2sgYXQgbGVhc3QgdGlsIEJTIGRvZXNuJ3QgcmVxdWlyZSBqUXVlcnlcclxuICAgICAgICBpZiAoISQuZm4gfHwgISQuZm4udG9vbHRpcCB8fCAhJC5mbi5wb3BvdmVyKSByZXR1cm47XHJcblxyXG4gICAgICAgIC8vIFBPUE9WRVJcclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgICAgICAkKCdbZGF0YS10b2dnbGU9XCJwb3BvdmVyXCJdJykucG9wb3ZlcigpO1xyXG5cclxuICAgICAgICAvLyBUT09MVElQXHJcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAgICAgJCgnW2RhdGEtdG9nZ2xlPVwidG9vbHRpcFwiXScpLnRvb2x0aXAoe1xyXG4gICAgICAgICAgICBjb250YWluZXI6ICdib2R5J1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBEUk9QRE9XTiBJTlBVVFNcclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgICAgICQoJy5kcm9wZG93biBpbnB1dCcpLm9uKCdjbGljayBmb2N1cycsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH1cclxuXHJcbn0pKCk7IiwiLy8gTW9kdWxlOiBjYXJkLXRvb2xzXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgJChpbml0Q2FyZERpc21pc3MpO1xyXG4gICAgJChpbml0Q2FyZENvbGxhcHNlKTtcclxuICAgICQoaW5pdENhcmRSZWZyZXNoKTtcclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBIZWxwZXIgZnVuY3Rpb24gdG8gZmluZCB0aGUgY2xvc2VzdFxyXG4gICAgICogYXNjZW5kaW5nIC5jYXJkIGVsZW1lbnRcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gZ2V0Q2FyZFBhcmVudChpdGVtKSB7XHJcbiAgICAgICAgdmFyIGVsID0gaXRlbS5wYXJlbnRFbGVtZW50O1xyXG4gICAgICAgIHdoaWxlIChlbCAmJiAhZWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdjYXJkJykpXHJcbiAgICAgICAgICAgIGVsID0gZWwucGFyZW50RWxlbWVudFxyXG4gICAgICAgIHJldHVybiBlbFxyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBIZWxwZXIgdG8gdHJpZ2dlciBjdXN0b20gZXZlbnRcclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gdHJpZ2dlckV2ZW50KHR5cGUsIGl0ZW0sIGRhdGEpIHtcclxuICAgICAgICB2YXIgZXY7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBDdXN0b21FdmVudCA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgICBldiA9IG5ldyBDdXN0b21FdmVudCh0eXBlLCB7IGRldGFpbDogZGF0YSB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBldiA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdDdXN0b21FdmVudCcpO1xyXG4gICAgICAgICAgICBldi5pbml0Q3VzdG9tRXZlbnQodHlwZSwgdHJ1ZSwgZmFsc2UsIGRhdGEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpdGVtLmRpc3BhdGNoRXZlbnQoZXYpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogRGlzbWlzcyBjYXJkc1xyXG4gICAgICogW2RhdGEtdG9vbD1cImNhcmQtZGlzbWlzc1wiXVxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBpbml0Q2FyZERpc21pc3MoKSB7XHJcbiAgICAgICAgdmFyIGNhcmR0b29sU2VsZWN0b3IgPSAnW2RhdGEtdG9vbD1cImNhcmQtZGlzbWlzc1wiXSdcclxuXHJcbiAgICAgICAgdmFyIGNhcmRMaXN0ID0gW10uc2xpY2UuY2FsbChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGNhcmR0b29sU2VsZWN0b3IpKVxyXG5cclxuICAgICAgICBjYXJkTGlzdC5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICAgICAgbmV3IENhcmREaXNtaXNzKGl0ZW0pO1xyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIENhcmREaXNtaXNzKGl0ZW0pIHtcclxuICAgICAgICAgICAgdmFyIEVWRU5UX1JFTU9WRSA9ICdjYXJkLnJlbW92ZSc7XHJcbiAgICAgICAgICAgIHZhciBFVkVOVF9SRU1PVkVEID0gJ2NhcmQucmVtb3ZlZCc7XHJcblxyXG4gICAgICAgICAgICB0aGlzLml0ZW0gPSBpdGVtO1xyXG4gICAgICAgICAgICB0aGlzLmNhcmRQYXJlbnQgPSBnZXRDYXJkUGFyZW50KHRoaXMuaXRlbSk7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZpbmcgPSBmYWxzZTsgLy8gcHJldmVudHMgZG91YmxlIGV4ZWN1dGlvblxyXG5cclxuICAgICAgICAgICAgdGhpcy5jbGlja0hhbmRsZXIgPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5yZW1vdmluZykgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmluZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAvLyBwYXNzIGNhbGxiYWNrcyB2aWEgZXZlbnQuZGV0YWlsIHRvIGNvbmZpcm0vY2FuY2VsIHRoZSByZW1vdmFsXHJcbiAgICAgICAgICAgICAgICB0cmlnZ2VyRXZlbnQoRVZFTlRfUkVNT1ZFLCB0aGlzLmNhcmRQYXJlbnQsIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25maXJtOiB0aGlzLmNvbmZpcm0uYmluZCh0aGlzKSxcclxuICAgICAgICAgICAgICAgICAgICBjYW5jZWw6IHRoaXMuY2FuY2VsLmJpbmQodGhpcylcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuY29uZmlybSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hbmltYXRlKHRoaXMuY2FyZFBhcmVudCwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHJpZ2dlckV2ZW50KEVWRU5UX1JFTU9WRUQsIHRoaXMuY2FyZFBhcmVudCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmUodGhpcy5jYXJkUGFyZW50KTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5jYW5jZWwgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmFuaW1hdGUgPSBmdW5jdGlvbihpdGVtLCBjYikge1xyXG4gICAgICAgICAgICAgICAgaWYgKCdvbmFuaW1hdGlvbmVuZCcgaW4gd2luZG93KSB7IC8vIGFuaW1hdGlvbiBzdXBwb3J0ZWRcclxuICAgICAgICAgICAgICAgICAgICBpdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2FuaW1hdGlvbmVuZCcsIGNiLmJpbmQodGhpcykpXHJcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5jbGFzc05hbWUgKz0gJyBhbmltYXRlZCBib3VuY2VPdXQnOyAvLyByZXF1aXJlcyBhbmltYXRlLmNzc1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGNiLmNhbGwodGhpcykgLy8gbm8gYW5pbWF0aW9uLCBqdXN0IHJlbW92ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlID0gZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgaXRlbS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGl0ZW0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIGF0dGFjaCBsaXN0ZW5lclxyXG4gICAgICAgICAgICBpdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5jbGlja0hhbmRsZXIuYmluZCh0aGlzKSwgZmFsc2UpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKipcclxuICAgICAqIENvbGxhcHNlZCBjYXJkc1xyXG4gICAgICogW2RhdGEtdG9vbD1cImNhcmQtY29sbGFwc2VcIl1cclxuICAgICAqIFtkYXRhLXN0YXJ0LWNvbGxhcHNlZF1cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gaW5pdENhcmRDb2xsYXBzZSgpIHtcclxuICAgICAgICB2YXIgY2FyZHRvb2xTZWxlY3RvciA9ICdbZGF0YS10b29sPVwiY2FyZC1jb2xsYXBzZVwiXSc7XHJcbiAgICAgICAgdmFyIGNhcmRMaXN0ID0gW10uc2xpY2UuY2FsbChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGNhcmR0b29sU2VsZWN0b3IpKVxyXG5cclxuICAgICAgICBjYXJkTGlzdC5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICAgICAgdmFyIGluaXRpYWxTdGF0ZSA9IGl0ZW0uaGFzQXR0cmlidXRlKCdkYXRhLXN0YXJ0LWNvbGxhcHNlZCcpXHJcbiAgICAgICAgICAgIG5ldyBDYXJkQ29sbGFwc2UoaXRlbSwgaW5pdGlhbFN0YXRlKTtcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBDYXJkQ29sbGFwc2UoaXRlbSwgc3RhcnRDb2xsYXBzZWQpIHtcclxuICAgICAgICAgICAgdmFyIEVWRU5UX1NIT1cgPSAnY2FyZC5jb2xsYXBzZS5zaG93JztcclxuICAgICAgICAgICAgdmFyIEVWRU5UX0hJREUgPSAnY2FyZC5jb2xsYXBzZS5oaWRlJztcclxuXHJcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSB0cnVlOyAvLyB0cnVlIC0+IHNob3cgLyBmYWxzZSAtPiBoaWRlXHJcbiAgICAgICAgICAgIHRoaXMuaXRlbSA9IGl0ZW07XHJcbiAgICAgICAgICAgIHRoaXMuY2FyZFBhcmVudCA9IGdldENhcmRQYXJlbnQodGhpcy5pdGVtKTtcclxuICAgICAgICAgICAgdGhpcy53cmFwcGVyID0gdGhpcy5jYXJkUGFyZW50LnF1ZXJ5U2VsZWN0b3IoJy5jYXJkLXdyYXBwZXInKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMudG9nZ2xlQ29sbGFwc2UgPSBmdW5jdGlvbihhY3Rpb24pIHtcclxuICAgICAgICAgICAgICAgIHRyaWdnZXJFdmVudChhY3Rpb24gPyBFVkVOVF9TSE9XIDogRVZFTlRfSElERSwgdGhpcy5jYXJkUGFyZW50KVxyXG4gICAgICAgICAgICAgICAgdGhpcy53cmFwcGVyLnN0eWxlLm1heEhlaWdodCA9IChhY3Rpb24gPyB0aGlzLndyYXBwZXIuc2Nyb2xsSGVpZ2h0IDogMCkgKyAncHgnXHJcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlID0gYWN0aW9uO1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVJY29uKGFjdGlvbilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUljb24gPSBmdW5jdGlvbihhY3Rpb24pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaXRlbS5maXJzdEVsZW1lbnRDaGlsZC5jbGFzc05hbWUgPSBhY3Rpb24gPyAnZmEgZmEtbWludXMnIDogJ2ZhIGZhLXBsdXMnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5jbGlja0hhbmRsZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlQ29sbGFwc2UoIXRoaXMuc3RhdGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuaW5pdFN0eWxlcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy53cmFwcGVyLnN0eWxlLm1heEhlaWdodCA9IHRoaXMud3JhcHBlci5zY3JvbGxIZWlnaHQgKyAncHgnO1xyXG4gICAgICAgICAgICAgICAgdGhpcy53cmFwcGVyLnN0eWxlLnRyYW5zaXRpb24gPSAnbWF4LWhlaWdodCAwLjVzJztcclxuICAgICAgICAgICAgICAgIHRoaXMud3JhcHBlci5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW4nO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBwcmVwYXJlIHN0eWxlcyBmb3IgY29sbGFwc2UgYW5pbWF0aW9uXHJcbiAgICAgICAgICAgIHRoaXMuaW5pdFN0eWxlcygpXHJcbiAgICAgICAgICAgIC8vIHNldCBpbml0aWFsIHN0YXRlIGlmIHByb3ZpZGVkXHJcbiAgICAgICAgICAgIGlmIChzdGFydENvbGxhcHNlZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy50b2dnbGVDb2xsYXBzZShmYWxzZSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyBhdHRhY2ggbGlzdGVuZXJcclxuICAgICAgICAgICAgdGhpcy5pdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5jbGlja0hhbmRsZXIuYmluZCh0aGlzKSwgZmFsc2UpXHJcblxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBSZWZyZXNoIGNhcmRzXHJcbiAgICAgKiBbZGF0YS10b29sPVwiY2FyZC1yZWZyZXNoXCJdXHJcbiAgICAgKiBbZGF0YS1zcGlubmVyPVwic3RhbmRhcmRcIl1cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gaW5pdENhcmRSZWZyZXNoKCkge1xyXG5cclxuICAgICAgICB2YXIgY2FyZHRvb2xTZWxlY3RvciA9ICdbZGF0YS10b29sPVwiY2FyZC1yZWZyZXNoXCJdJztcclxuICAgICAgICB2YXIgY2FyZExpc3QgPSBbXS5zbGljZS5jYWxsKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoY2FyZHRvb2xTZWxlY3RvcikpXHJcblxyXG4gICAgICAgIGNhcmRMaXN0LmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgICAgICAgICBuZXcgQ2FyZFJlZnJlc2goaXRlbSk7XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gQ2FyZFJlZnJlc2goaXRlbSkge1xyXG4gICAgICAgICAgICB2YXIgRVZFTlRfUkVGUkVTSCA9ICdjYXJkLnJlZnJlc2gnO1xyXG4gICAgICAgICAgICB2YXIgV0hJUkxfQ0xBU1MgPSAnd2hpcmwnO1xyXG4gICAgICAgICAgICB2YXIgREVGQVVMVF9TUElOTkVSID0gJ3N0YW5kYXJkJ1xyXG5cclxuICAgICAgICAgICAgdGhpcy5pdGVtID0gaXRlbTtcclxuICAgICAgICAgICAgdGhpcy5jYXJkUGFyZW50ID0gZ2V0Q2FyZFBhcmVudCh0aGlzLml0ZW0pXHJcbiAgICAgICAgICAgIHRoaXMuc3Bpbm5lciA9ICgodGhpcy5pdGVtLmRhdGFzZXQgfHwge30pLnNwaW5uZXIgfHwgREVGQVVMVF9TUElOTkVSKS5zcGxpdCgnICcpOyAvLyBzdXBwb3J0IHNwYWNlIHNlcGFyYXRlZCBjbGFzc2VzXHJcblxyXG4gICAgICAgICAgICB0aGlzLnJlZnJlc2ggPSBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY2FyZCA9IHRoaXMuY2FyZFBhcmVudDtcclxuICAgICAgICAgICAgICAgIC8vIHN0YXJ0IHNob3dpbmcgdGhlIHNwaW5uZXJcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd1NwaW5uZXIoY2FyZCwgdGhpcy5zcGlubmVyKVxyXG4gICAgICAgICAgICAgICAgLy8gYXR0YWNoIGFzIHB1YmxpYyBtZXRob2RcclxuICAgICAgICAgICAgICAgIGNhcmQucmVtb3ZlU3Bpbm5lciA9IHRoaXMucmVtb3ZlU3Bpbm5lci5iaW5kKHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgLy8gVHJpZ2dlciB0aGUgZXZlbnQgYW5kIHNlbmQgdGhlIGNhcmRcclxuICAgICAgICAgICAgICAgIHRyaWdnZXJFdmVudChFVkVOVF9SRUZSRVNILCBjYXJkLCB7IGNhcmQ6IGNhcmQgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5zaG93U3Bpbm5lciA9IGZ1bmN0aW9uKGNhcmQsIHNwaW5uZXIpIHtcclxuICAgICAgICAgICAgICAgIGNhcmQuY2xhc3NMaXN0LmFkZChXSElSTF9DTEFTUyk7XHJcbiAgICAgICAgICAgICAgICBzcGlubmVyLmZvckVhY2goZnVuY3Rpb24ocykgeyBjYXJkLmNsYXNzTGlzdC5hZGQocykgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLnJlbW92ZVNwaW5uZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2FyZFBhcmVudC5jbGFzc0xpc3QucmVtb3ZlKFdISVJMX0NMQVNTKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gYXR0YWNoIGxpc3RlbmVyXHJcbiAgICAgICAgICAgIHRoaXMuaXRlbS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMucmVmcmVzaC5iaW5kKHRoaXMpLCBmYWxzZSlcclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvLyBHTE9CQUwgQ09OU1RBTlRTXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgd2luZG93LkFQUF9DT0xPUlMgPSB7XHJcbiAgICAgICAgJ3ByaW1hcnknOiAgICAgICAgICAgICAgICAnIzVkOWNlYycsXHJcbiAgICAgICAgJ3N1Y2Nlc3MnOiAgICAgICAgICAgICAgICAnIzI3YzI0YycsXHJcbiAgICAgICAgJ2luZm8nOiAgICAgICAgICAgICAgICAgICAnIzIzYjdlNScsXHJcbiAgICAgICAgJ3dhcm5pbmcnOiAgICAgICAgICAgICAgICAnI2ZmOTAyYicsXHJcbiAgICAgICAgJ2Rhbmdlcic6ICAgICAgICAgICAgICAgICAnI2YwNTA1MCcsXHJcbiAgICAgICAgJ2ludmVyc2UnOiAgICAgICAgICAgICAgICAnIzEzMWUyNicsXHJcbiAgICAgICAgJ2dyZWVuJzogICAgICAgICAgICAgICAgICAnIzM3YmM5YicsXHJcbiAgICAgICAgJ3BpbmsnOiAgICAgICAgICAgICAgICAgICAnI2Y1MzJlNScsXHJcbiAgICAgICAgJ3B1cnBsZSc6ICAgICAgICAgICAgICAgICAnIzcyNjZiYScsXHJcbiAgICAgICAgJ2RhcmsnOiAgICAgICAgICAgICAgICAgICAnIzNhM2Y1MScsXHJcbiAgICAgICAgJ3llbGxvdyc6ICAgICAgICAgICAgICAgICAnI2ZhZDczMicsXHJcbiAgICAgICAgJ2dyYXktZGFya2VyJzogICAgICAgICAgICAnIzIzMjczNScsXHJcbiAgICAgICAgJ2dyYXktZGFyayc6ICAgICAgICAgICAgICAnIzNhM2Y1MScsXHJcbiAgICAgICAgJ2dyYXknOiAgICAgICAgICAgICAgICAgICAnI2RkZTZlOScsXHJcbiAgICAgICAgJ2dyYXktbGlnaHQnOiAgICAgICAgICAgICAnI2U0ZWFlYycsXHJcbiAgICAgICAgJ2dyYXktbGlnaHRlcic6ICAgICAgICAgICAnI2VkZjFmMidcclxuICAgIH07XHJcblxyXG4gICAgd2luZG93LkFQUF9NRURJQVFVRVJZID0ge1xyXG4gICAgICAgICdkZXNrdG9wTEcnOiAgICAgICAgICAgICAxMjAwLFxyXG4gICAgICAgICdkZXNrdG9wJzogICAgICAgICAgICAgICAgOTkyLFxyXG4gICAgICAgICd0YWJsZXQnOiAgICAgICAgICAgICAgICAgNzY4LFxyXG4gICAgICAgICdtb2JpbGUnOiAgICAgICAgICAgICAgICAgNDgwXHJcbiAgICB9O1xyXG5cclxufSkoKTsiLCIvLyBGVUxMU0NSRUVOXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgJChpbml0U2NyZWVuRnVsbCk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFNjcmVlbkZ1bGwoKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBzY3JlZW5mdWxsID09PSAndW5kZWZpbmVkJykgcmV0dXJuO1xyXG5cclxuICAgICAgICB2YXIgJGRvYyA9ICQoZG9jdW1lbnQpO1xyXG4gICAgICAgIHZhciAkZnNUb2dnbGVyID0gJCgnW2RhdGEtdG9nZ2xlLWZ1bGxzY3JlZW5dJyk7XHJcblxyXG4gICAgICAgIC8vIE5vdCBzdXBwb3J0ZWQgdW5kZXIgSUVcclxuICAgICAgICB2YXIgdWEgPSB3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudDtcclxuICAgICAgICBpZiAodWEuaW5kZXhPZihcIk1TSUUgXCIpID4gMCB8fCAhIXVhLm1hdGNoKC9UcmlkZW50LipydlxcOjExXFwuLykpIHtcclxuICAgICAgICAgICAgJGZzVG9nZ2xlci5hZGRDbGFzcygnZC1ub25lJyk7IC8vIGhpZGUgZWxlbWVudFxyXG4gICAgICAgICAgICByZXR1cm47IC8vIGFuZCBhYm9ydFxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJGZzVG9nZ2xlci5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChzY3JlZW5mdWxsLmVuYWJsZWQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICBzY3JlZW5mdWxsLnRvZ2dsZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFN3aXRjaCBpY29uIGluZGljYXRvclxyXG4gICAgICAgICAgICAgICAgdG9nZ2xlRlNJY29uKCRmc1RvZ2dsZXIpO1xyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdGdWxsc2NyZWVuIG5vdCBlbmFibGVkJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKHNjcmVlbmZ1bGwucmF3ICYmIHNjcmVlbmZ1bGwucmF3LmZ1bGxzY3JlZW5jaGFuZ2UpXHJcbiAgICAgICAgICAgICRkb2Mub24oc2NyZWVuZnVsbC5yYXcuZnVsbHNjcmVlbmNoYW5nZSwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB0b2dnbGVGU0ljb24oJGZzVG9nZ2xlcik7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiB0b2dnbGVGU0ljb24oJGVsZW1lbnQpIHtcclxuICAgICAgICAgICAgaWYgKHNjcmVlbmZ1bGwuaXNGdWxsc2NyZWVuKVxyXG4gICAgICAgICAgICAgICAgJGVsZW1lbnQuY2hpbGRyZW4oJ2VtJykucmVtb3ZlQ2xhc3MoJ2ZhLWV4cGFuZCcpLmFkZENsYXNzKCdmYS1jb21wcmVzcycpO1xyXG4gICAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgICAgICAkZWxlbWVudC5jaGlsZHJlbignZW0nKS5yZW1vdmVDbGFzcygnZmEtY29tcHJlc3MnKS5hZGRDbGFzcygnZmEtZXhwYW5kJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgIH1cclxuXHJcbn0pKCk7IiwiLy8gTE9BRCBDVVNUT00gQ1NTXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgJChpbml0TG9hZENTUyk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdExvYWRDU1MoKSB7XHJcblxyXG4gICAgICAgICQoJ1tkYXRhLWxvYWQtY3NzXScpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcclxuXHJcbiAgICAgICAgICAgIHZhciBlbGVtZW50ID0gJCh0aGlzKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChlbGVtZW50LmlzKCdhJykpXHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICAgICAgICB2YXIgdXJpID0gZWxlbWVudC5kYXRhKCdsb2FkQ3NzJyksXHJcbiAgICAgICAgICAgICAgICBsaW5rO1xyXG5cclxuICAgICAgICAgICAgaWYgKHVyaSkge1xyXG4gICAgICAgICAgICAgICAgbGluayA9IGNyZWF0ZUxpbmsodXJpKTtcclxuICAgICAgICAgICAgICAgIGlmICghbGluaykge1xyXG4gICAgICAgICAgICAgICAgICAgICQuZXJyb3IoJ0Vycm9yIGNyZWF0aW5nIHN0eWxlc2hlZXQgbGluayBlbGVtZW50LicpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJC5lcnJvcignTm8gc3R5bGVzaGVldCBsb2NhdGlvbiBkZWZpbmVkLicpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNyZWF0ZUxpbmsodXJpKSB7XHJcbiAgICAgICAgdmFyIGxpbmtJZCA9ICdhdXRvbG9hZGVkLXN0eWxlc2hlZXQnLFxyXG4gICAgICAgICAgICBvbGRMaW5rID0gJCgnIycgKyBsaW5rSWQpLmF0dHIoJ2lkJywgbGlua0lkICsgJy1vbGQnKTtcclxuXHJcbiAgICAgICAgJCgnaGVhZCcpLmFwcGVuZCgkKCc8bGluay8+JykuYXR0cih7XHJcbiAgICAgICAgICAgICdpZCc6IGxpbmtJZCxcclxuICAgICAgICAgICAgJ3JlbCc6ICdzdHlsZXNoZWV0JyxcclxuICAgICAgICAgICAgJ2hyZWYnOiB1cmlcclxuICAgICAgICB9KSk7XHJcblxyXG4gICAgICAgIGlmIChvbGRMaW5rLmxlbmd0aCkge1xyXG4gICAgICAgICAgICBvbGRMaW5rLnJlbW92ZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuICQoJyMnICsgbGlua0lkKTtcclxuICAgIH1cclxuXHJcbn0pKCk7IiwiLy8gVFJBTlNMQVRJT05cclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAkKGluaXRUcmFuc2xhdGlvbik7XHJcblxyXG5cclxuICAgIHZhciBwYXRoUHJlZml4ID0gJy9Db250ZW50L2kxOG4nOyAvLyBmb2xkZXIgb2YganNvbiBmaWxlc1xyXG4gICAgdmFyIFNUT1JBR0VLRVkgPSAnanEtYXBwTGFuZyc7XHJcbiAgICB2YXIgc2F2ZWRMYW5ndWFnZSA9IFN0b3JhZ2VzLmxvY2FsU3RvcmFnZS5nZXQoU1RPUkFHRUtFWSk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFRyYW5zbGF0aW9uKCkge1xyXG4gICAgICAgIGkxOG5leHRcclxuICAgICAgICAgICAgLnVzZShpMThuZXh0WEhSQmFja2VuZClcclxuICAgICAgICAgICAgLy8gLnVzZShMYW5ndWFnZURldGVjdG9yKVxyXG4gICAgICAgICAgICAuaW5pdCh7XHJcbiAgICAgICAgICAgICAgICBmYWxsYmFja0xuZzogc2F2ZWRMYW5ndWFnZSB8fCAnZW4nLFxyXG4gICAgICAgICAgICAgICAgYmFja2VuZDoge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvYWRQYXRoOiBwYXRoUHJlZml4ICsgJy97e25zfX0te3tsbmd9fS5qc29uJyxcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBuczogWydzaXRlJ10sXHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0TlM6ICdzaXRlJyxcclxuICAgICAgICAgICAgICAgIGRlYnVnOiBmYWxzZVxyXG4gICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIsIHQpIHtcclxuICAgICAgICAgICAgICAgIC8vIGluaXRpYWxpemUgZWxlbWVudHNcclxuICAgICAgICAgICAgICAgIGFwcGx5VHJhbmxhdGlvbnMoKTtcclxuICAgICAgICAgICAgICAgIC8vIGxpc3RlbiB0byBsYW5ndWFnZSBjaGFuZ2VzXHJcbiAgICAgICAgICAgICAgICBhdHRhY2hDaGFuZ2VMaXN0ZW5lcigpO1xyXG4gICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBhcHBseVRyYW5sYXRpb25zKCkge1xyXG4gICAgICAgICAgICB2YXIgbGlzdCA9IFtdLnNsaWNlLmNhbGwoZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtbG9jYWxpemVdJykpXHJcbiAgICAgICAgICAgIGxpc3QuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIga2V5ID0gaXRlbS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbG9jYWxpemUnKVxyXG4gICAgICAgICAgICAgICAgaWYgKGkxOG5leHQuZXhpc3RzKGtleSkpIGl0ZW0uaW5uZXJIVE1MID0gaTE4bmV4dC50KGtleSk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBhdHRhY2hDaGFuZ2VMaXN0ZW5lcigpIHtcclxuICAgICAgICAgICAgdmFyIGxpc3QgPSBbXS5zbGljZS5jYWxsKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLXNldC1sYW5nXScpKVxyXG4gICAgICAgICAgICBsaXN0LmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xyXG5cclxuICAgICAgICAgICAgICAgIGl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGUudGFyZ2V0LnRhZ05hbWUgPT09ICdBJykgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBsYW5nID0gaXRlbS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2V0LWxhbmcnKVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChsYW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGkxOG5leHQuY2hhbmdlTGFuZ3VhZ2UobGFuZywgZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSBjb25zb2xlLmxvZyhlcnIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcHBseVRyYW5sYXRpb25zKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU3RvcmFnZXMubG9jYWxTdG9yYWdlLnNldChTVE9SQUdFS0VZLCBsYW5nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGFjdGl2YXRlRHJvcGRvd24oaXRlbSlcclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGFjdGl2YXRlRHJvcGRvd24oaXRlbSkge1xyXG4gICAgICAgICAgICBpZiAoaXRlbS5jbGFzc0xpc3QuY29udGFpbnMoJ2Ryb3Bkb3duLWl0ZW0nKSkge1xyXG4gICAgICAgICAgICAgICAgaXRlbS5wYXJlbnRFbGVtZW50LnByZXZpb3VzRWxlbWVudFNpYmxpbmcuaW5uZXJIVE1MID0gaXRlbS5pbm5lckhUTUw7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuXHJcbn0pKCk7IiwiLy8gTkFWQkFSIFNFQVJDSFxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICQoaW5pdE5hdmJhclNlYXJjaCk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdE5hdmJhclNlYXJjaCgpIHtcclxuXHJcbiAgICAgICAgdmFyIG5hdlNlYXJjaCA9IG5ldyBuYXZiYXJTZWFyY2hJbnB1dCgpO1xyXG5cclxuICAgICAgICAvLyBPcGVuIHNlYXJjaCBpbnB1dFxyXG4gICAgICAgIHZhciAkc2VhcmNoT3BlbiA9ICQoJ1tkYXRhLXNlYXJjaC1vcGVuXScpO1xyXG5cclxuICAgICAgICAkc2VhcmNoT3BlblxyXG4gICAgICAgICAgICAub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkgeyBlLnN0b3BQcm9wYWdhdGlvbigpOyB9KVxyXG4gICAgICAgICAgICAub24oJ2NsaWNrJywgbmF2U2VhcmNoLnRvZ2dsZSk7XHJcblxyXG4gICAgICAgIC8vIENsb3NlIHNlYXJjaCBpbnB1dFxyXG4gICAgICAgIHZhciAkc2VhcmNoRGlzbWlzcyA9ICQoJ1tkYXRhLXNlYXJjaC1kaXNtaXNzXScpO1xyXG4gICAgICAgIHZhciBpbnB1dFNlbGVjdG9yID0gJy5uYXZiYXItZm9ybSBpbnB1dFt0eXBlPVwidGV4dFwiXSc7XHJcblxyXG4gICAgICAgICQoaW5wdXRTZWxlY3RvcilcclxuICAgICAgICAgICAgLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHsgZS5zdG9wUHJvcGFnYXRpb24oKTsgfSlcclxuICAgICAgICAgICAgLm9uKCdrZXl1cCcsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIGlmIChlLmtleUNvZGUgPT0gMjcpIC8vIEVTQ1xyXG4gICAgICAgICAgICAgICAgICAgIG5hdlNlYXJjaC5kaXNtaXNzKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAvLyBjbGljayBhbnl3aGVyZSBjbG9zZXMgdGhlIHNlYXJjaFxyXG4gICAgICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsIG5hdlNlYXJjaC5kaXNtaXNzKTtcclxuICAgICAgICAvLyBkaXNtaXNzYWJsZSBvcHRpb25zXHJcbiAgICAgICAgJHNlYXJjaERpc21pc3NcclxuICAgICAgICAgICAgLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHsgZS5zdG9wUHJvcGFnYXRpb24oKTsgfSlcclxuICAgICAgICAgICAgLm9uKCdjbGljaycsIG5hdlNlYXJjaC5kaXNtaXNzKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIG5hdmJhclNlYXJjaElucHV0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIG5hdmJhckZvcm1TZWxlY3RvciA9ICdmb3JtLm5hdmJhci1mb3JtJztcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB0b2dnbGU6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBuYXZiYXJGb3JtID0gJChuYXZiYXJGb3JtU2VsZWN0b3IpO1xyXG5cclxuICAgICAgICAgICAgICAgIG5hdmJhckZvcm0udG9nZ2xlQ2xhc3MoJ29wZW4nKTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgaXNPcGVuID0gbmF2YmFyRm9ybS5oYXNDbGFzcygnb3BlbicpO1xyXG5cclxuICAgICAgICAgICAgICAgIG5hdmJhckZvcm0uZmluZCgnaW5wdXQnKVtpc09wZW4gPyAnZm9jdXMnIDogJ2JsdXInXSgpO1xyXG5cclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGRpc21pc3M6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJChuYXZiYXJGb3JtU2VsZWN0b3IpXHJcbiAgICAgICAgICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdvcGVuJykgLy8gQ2xvc2UgY29udHJvbFxyXG4gICAgICAgICAgICAgICAgICAgIC5maW5kKCdpbnB1dFt0eXBlPVwidGV4dFwiXScpLmJsdXIoKSAvLyByZW1vdmUgZm9jdXNcclxuICAgICAgICAgICAgICAgIC8vIC52YWwoJycpICAgICAgICAgICAgICAgICAgICAvLyBFbXB0eSBpbnB1dFxyXG4gICAgICAgICAgICAgICAgO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICB9XHJcblxyXG59KSgpOyIsIi8vIE5PVyBUSU1FUlxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICQoaW5pdE5vd1RpbWVyKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0Tm93VGltZXIoKSB7XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2YgbW9tZW50ID09PSAndW5kZWZpbmVkJykgcmV0dXJuO1xyXG5cclxuICAgICAgICAkKCdbZGF0YS1ub3ddJykuZWFjaChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIGVsZW1lbnQgPSAkKHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgZm9ybWF0ID0gZWxlbWVudC5kYXRhKCdmb3JtYXQnKTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHVwZGF0ZVRpbWUoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZHQgPSBtb21lbnQobmV3IERhdGUoKSkuZm9ybWF0KGZvcm1hdCk7XHJcbiAgICAgICAgICAgICAgICBlbGVtZW50LnRleHQoZHQpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB1cGRhdGVUaW1lKCk7XHJcbiAgICAgICAgICAgIHNldEludGVydmFsKHVwZGF0ZVRpbWUsIDEwMDApO1xyXG5cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbn0pKCk7IiwiLy8gVG9nZ2xlIFJUTCBtb2RlIGZvciBkZW1vXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICQoaW5pdFJUTCk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFJUTCgpIHtcclxuICAgICAgICB2YXIgbWFpbmNzcyA9ICQoJyNtYWluY3NzJyk7XHJcbiAgICAgICAgdmFyIGJzY3NzID0gJCgnI2JzY3NzJyk7XHJcbiAgICAgICAgJCgnI2Noay1ydGwnKS5vbignY2hhbmdlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIC8vIGFwcCBydGwgY2hlY2tcclxuICAgICAgICAgICAgbWFpbmNzcy5hdHRyKCdocmVmJywgdGhpcy5jaGVja2VkID8gJy9Db250ZW50L2Nzcy9hcHAtcnRsLmNzcycgOiAnL0NvbnRlbnQvY3NzL2FwcC5jc3MnKTtcclxuICAgICAgICAgICAgLy8gYm9vdHN0cmFwIHJ0bCBjaGVja1xyXG4gICAgICAgICAgICBic2Nzcy5hdHRyKCdocmVmJywgdGhpcy5jaGVja2VkID8gJy9Db250ZW50L2Nzcy9ib290c3RyYXAtcnRsLmNzcycgOiAnL0NvbnRlbnQvY3NzL2Jvb3RzdHJhcC5jc3MnKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbn0pKCk7IiwiLy8gU0lERUJBUlxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAkKGluaXRTaWRlYmFyKTtcclxuXHJcbiAgICB2YXIgJGh0bWw7XHJcbiAgICB2YXIgJGJvZHk7XHJcbiAgICB2YXIgJHNpZGViYXI7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFNpZGViYXIoKSB7XHJcblxyXG4gICAgICAgICRodG1sID0gJCgnaHRtbCcpO1xyXG4gICAgICAgICRib2R5ID0gJCgnYm9keScpO1xyXG4gICAgICAgICRzaWRlYmFyID0gJCgnLnNpZGViYXInKTtcclxuXHJcbiAgICAgICAgLy8gQVVUT0NPTExBUFNFIElURU1TXHJcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAgICAgdmFyIHNpZGViYXJDb2xsYXBzZSA9ICRzaWRlYmFyLmZpbmQoJy5jb2xsYXBzZScpO1xyXG4gICAgICAgIHNpZGViYXJDb2xsYXBzZS5vbignc2hvdy5icy5jb2xsYXBzZScsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcblxyXG4gICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgaWYgKCQodGhpcykucGFyZW50cygnLmNvbGxhcHNlJykubGVuZ3RoID09PSAwKVxyXG4gICAgICAgICAgICAgICAgc2lkZWJhckNvbGxhcHNlLmZpbHRlcignLnNob3cnKS5jb2xsYXBzZSgnaGlkZScpO1xyXG5cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gU0lERUJBUiBBQ1RJVkUgU1RBVEVcclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgICAgICAvLyBGaW5kIGN1cnJlbnQgYWN0aXZlIGl0ZW1cclxuICAgICAgICB2YXIgY3VycmVudEl0ZW0gPSAkKCcuc2lkZWJhciAuYWN0aXZlJykucGFyZW50cygnbGknKTtcclxuXHJcbiAgICAgICAgLy8gaG92ZXIgbW9kZSBkb24ndCB0cnkgdG8gZXhwYW5kIGFjdGl2ZSBjb2xsYXBzZVxyXG4gICAgICAgIGlmICghdXNlQXNpZGVIb3ZlcigpKVxyXG4gICAgICAgICAgICBjdXJyZW50SXRlbVxyXG4gICAgICAgICAgICAuYWRkQ2xhc3MoJ2FjdGl2ZScpIC8vIGFjdGl2YXRlIHRoZSBwYXJlbnRcclxuICAgICAgICAgICAgLmNoaWxkcmVuKCcuY29sbGFwc2UnKSAvLyBmaW5kIHRoZSBjb2xsYXBzZVxyXG4gICAgICAgICAgICAuY29sbGFwc2UoJ3Nob3cnKTsgLy8gYW5kIHNob3cgaXRcclxuXHJcbiAgICAgICAgLy8gcmVtb3ZlIHRoaXMgaWYgeW91IHVzZSBvbmx5IGNvbGxhcHNpYmxlIHNpZGViYXIgaXRlbXNcclxuICAgICAgICAkc2lkZWJhci5maW5kKCdsaSA+IGEgKyB1bCcpLm9uKCdzaG93LmJzLmNvbGxhcHNlJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBpZiAodXNlQXNpZGVIb3ZlcigpKSBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIFNJREVCQVIgQ09MTEFQU0VEIElURU0gSEFORExFUlxyXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG5cclxuICAgICAgICB2YXIgZXZlbnROYW1lID0gaXNUb3VjaCgpID8gJ2NsaWNrJyA6ICdtb3VzZWVudGVyJztcclxuICAgICAgICB2YXIgc3ViTmF2ID0gJCgpO1xyXG4gICAgICAgICRzaWRlYmFyLmZpbmQoJy5zaWRlYmFyLW5hdiA+IGxpJykub24oZXZlbnROYW1lLCBmdW5jdGlvbihlKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoaXNTaWRlYmFyQ29sbGFwc2VkKCkgfHwgdXNlQXNpZGVIb3ZlcigpKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgc3ViTmF2LnRyaWdnZXIoJ21vdXNlbGVhdmUnKTtcclxuICAgICAgICAgICAgICAgIHN1Yk5hdiA9IHRvZ2dsZU1lbnVJdGVtKCQodGhpcykpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFVzZWQgdG8gZGV0ZWN0IGNsaWNrIGFuZCB0b3VjaCBldmVudHMgb3V0c2lkZSB0aGUgc2lkZWJhclxyXG4gICAgICAgICAgICAgICAgc2lkZWJhckFkZEJhY2tkcm9wKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHZhciBzaWRlYmFyQW55Y2xpY2tDbG9zZSA9ICRzaWRlYmFyLmRhdGEoJ3NpZGViYXJBbnljbGlja0Nsb3NlJyk7XHJcblxyXG4gICAgICAgIC8vIEFsbG93cyB0byBjbG9zZVxyXG4gICAgICAgIGlmICh0eXBlb2Ygc2lkZWJhckFueWNsaWNrQ2xvc2UgIT09ICd1bmRlZmluZWQnKSB7XHJcblxyXG4gICAgICAgICAgICAkKCcud3JhcHBlcicpLm9uKCdjbGljay5zaWRlYmFyJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gZG9uJ3QgY2hlY2sgaWYgc2lkZWJhciBub3QgdmlzaWJsZVxyXG4gICAgICAgICAgICAgICAgaWYgKCEkYm9keS5oYXNDbGFzcygnYXNpZGUtdG9nZ2xlZCcpKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyICR0YXJnZXQgPSAkKGUudGFyZ2V0KTtcclxuICAgICAgICAgICAgICAgIGlmICghJHRhcmdldC5wYXJlbnRzKCcuYXNpZGUtY29udGFpbmVyJykubGVuZ3RoICYmIC8vIGlmIG5vdCBjaGlsZCBvZiBzaWRlYmFyXHJcbiAgICAgICAgICAgICAgICAgICAgISR0YXJnZXQuaXMoJyN1c2VyLWJsb2NrLXRvZ2dsZScpICYmIC8vIHVzZXIgYmxvY2sgdG9nZ2xlIGFuY2hvclxyXG4gICAgICAgICAgICAgICAgICAgICEkdGFyZ2V0LnBhcmVudCgpLmlzKCcjdXNlci1ibG9jay10b2dnbGUnKSAvLyB1c2VyIGJsb2NrIHRvZ2dsZSBpY29uXHJcbiAgICAgICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICAgICAgICAkYm9keS5yZW1vdmVDbGFzcygnYXNpZGUtdG9nZ2xlZCcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNpZGViYXJBZGRCYWNrZHJvcCgpIHtcclxuICAgICAgICB2YXIgJGJhY2tkcm9wID0gJCgnPGRpdi8+JywgeyAnY2xhc3MnOiAnc2lkZWFici1iYWNrZHJvcCcgfSk7XHJcbiAgICAgICAgJGJhY2tkcm9wLmluc2VydEFmdGVyKCcuYXNpZGUtY29udGFpbmVyJykub24oXCJjbGljayBtb3VzZWVudGVyXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZW1vdmVGbG9hdGluZ05hdigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIE9wZW4gdGhlIGNvbGxhcHNlIHNpZGViYXIgc3VibWVudSBpdGVtcyB3aGVuIG9uIHRvdWNoIGRldmljZXNcclxuICAgIC8vIC0gZGVza3RvcCBvbmx5IG9wZW5zIG9uIGhvdmVyXHJcbiAgICBmdW5jdGlvbiB0b2dnbGVUb3VjaEl0ZW0oJGVsZW1lbnQpIHtcclxuICAgICAgICAkZWxlbWVudFxyXG4gICAgICAgICAgICAuc2libGluZ3MoJ2xpJylcclxuICAgICAgICAgICAgLnJlbW92ZUNsYXNzKCdvcGVuJylcclxuICAgICAgICAkZWxlbWVudFxyXG4gICAgICAgICAgICAudG9nZ2xlQ2xhc3MoJ29wZW4nKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBIYW5kbGVzIGhvdmVyIHRvIG9wZW4gaXRlbXMgdW5kZXIgY29sbGFwc2VkIG1lbnVcclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbiAgICBmdW5jdGlvbiB0b2dnbGVNZW51SXRlbSgkbGlzdEl0ZW0pIHtcclxuXHJcbiAgICAgICAgcmVtb3ZlRmxvYXRpbmdOYXYoKTtcclxuXHJcbiAgICAgICAgdmFyIHVsID0gJGxpc3RJdGVtLmNoaWxkcmVuKCd1bCcpO1xyXG5cclxuICAgICAgICBpZiAoIXVsLmxlbmd0aCkgcmV0dXJuICQoKTtcclxuICAgICAgICBpZiAoJGxpc3RJdGVtLmhhc0NsYXNzKCdvcGVuJykpIHtcclxuICAgICAgICAgICAgdG9nZ2xlVG91Y2hJdGVtKCRsaXN0SXRlbSk7XHJcbiAgICAgICAgICAgIHJldHVybiAkKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgJGFzaWRlID0gJCgnLmFzaWRlLWNvbnRhaW5lcicpO1xyXG4gICAgICAgIHZhciAkYXNpZGVJbm5lciA9ICQoJy5hc2lkZS1pbm5lcicpOyAvLyBmb3IgdG9wIG9mZnNldCBjYWxjdWxhdGlvblxyXG4gICAgICAgIC8vIGZsb2F0IGFzaWRlIHVzZXMgZXh0cmEgcGFkZGluZyBvbiBhc2lkZVxyXG4gICAgICAgIHZhciBtYXIgPSBwYXJzZUludCgkYXNpZGVJbm5lci5jc3MoJ3BhZGRpbmctdG9wJyksIDApICsgcGFyc2VJbnQoJGFzaWRlLmNzcygncGFkZGluZy10b3AnKSwgMCk7XHJcblxyXG4gICAgICAgIHZhciBzdWJOYXYgPSB1bC5jbG9uZSgpLmFwcGVuZFRvKCRhc2lkZSk7XHJcblxyXG4gICAgICAgIHRvZ2dsZVRvdWNoSXRlbSgkbGlzdEl0ZW0pO1xyXG5cclxuICAgICAgICB2YXIgaXRlbVRvcCA9ICgkbGlzdEl0ZW0ucG9zaXRpb24oKS50b3AgKyBtYXIpIC0gJHNpZGViYXIuc2Nyb2xsVG9wKCk7XHJcbiAgICAgICAgdmFyIHZ3SGVpZ2h0ID0gZG9jdW1lbnQuYm9keS5jbGllbnRIZWlnaHQ7XHJcblxyXG4gICAgICAgIHN1Yk5hdlxyXG4gICAgICAgICAgICAuYWRkQ2xhc3MoJ25hdi1mbG9hdGluZycpXHJcbiAgICAgICAgICAgIC5jc3Moe1xyXG4gICAgICAgICAgICAgICAgcG9zaXRpb246IGlzRml4ZWQoKSA/ICdmaXhlZCcgOiAnYWJzb2x1dGUnLFxyXG4gICAgICAgICAgICAgICAgdG9wOiBpdGVtVG9wLFxyXG4gICAgICAgICAgICAgICAgYm90dG9tOiAoc3ViTmF2Lm91dGVySGVpZ2h0KHRydWUpICsgaXRlbVRvcCA+IHZ3SGVpZ2h0KSA/IDAgOiAnYXV0bydcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHN1Yk5hdi5vbignbW91c2VsZWF2ZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0b2dnbGVUb3VjaEl0ZW0oJGxpc3RJdGVtKTtcclxuICAgICAgICAgICAgc3ViTmF2LnJlbW92ZSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICByZXR1cm4gc3ViTmF2O1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHJlbW92ZUZsb2F0aW5nTmF2KCkge1xyXG4gICAgICAgICQoJy5zaWRlYmFyLXN1Ym5hdi5uYXYtZmxvYXRpbmcnKS5yZW1vdmUoKTtcclxuICAgICAgICAkKCcuc2lkZWFici1iYWNrZHJvcCcpLnJlbW92ZSgpO1xyXG4gICAgICAgICQoJy5zaWRlYmFyIGxpLm9wZW4nKS5yZW1vdmVDbGFzcygnb3BlbicpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGlzVG91Y2goKSB7XHJcbiAgICAgICAgcmV0dXJuICRodG1sLmhhc0NsYXNzKCd0b3VjaCcpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGlzU2lkZWJhckNvbGxhcHNlZCgpIHtcclxuICAgICAgICByZXR1cm4gJGJvZHkuaGFzQ2xhc3MoJ2FzaWRlLWNvbGxhcHNlZCcpIHx8ICRib2R5Lmhhc0NsYXNzKCdhc2lkZS1jb2xsYXBzZWQtdGV4dCcpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGlzU2lkZWJhclRvZ2dsZWQoKSB7XHJcbiAgICAgICAgcmV0dXJuICRib2R5Lmhhc0NsYXNzKCdhc2lkZS10b2dnbGVkJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaXNNb2JpbGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIGRvY3VtZW50LmJvZHkuY2xpZW50V2lkdGggPCBBUFBfTUVESUFRVUVSWS50YWJsZXQ7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaXNGaXhlZCgpIHtcclxuICAgICAgICByZXR1cm4gJGJvZHkuaGFzQ2xhc3MoJ2xheW91dC1maXhlZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHVzZUFzaWRlSG92ZXIoKSB7XHJcbiAgICAgICAgcmV0dXJuICRib2R5Lmhhc0NsYXNzKCdhc2lkZS1ob3ZlcicpO1xyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvLyBTTElNU0NST0xMXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgJChpbml0U2xpbXNTcm9sbCk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFNsaW1zU3JvbGwoKSB7XHJcblxyXG4gICAgICAgIGlmICghJC5mbiB8fCAhJC5mbi5zbGltU2Nyb2xsKSByZXR1cm47XHJcblxyXG4gICAgICAgICQoJ1tkYXRhLXNjcm9sbGFibGVdJykuZWFjaChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgIHZhciBlbGVtZW50ID0gJCh0aGlzKSxcclxuICAgICAgICAgICAgICAgIGRlZmF1bHRIZWlnaHQgPSAyNTA7XHJcblxyXG4gICAgICAgICAgICBlbGVtZW50LnNsaW1TY3JvbGwoe1xyXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAoZWxlbWVudC5kYXRhKCdoZWlnaHQnKSB8fCBkZWZhdWx0SGVpZ2h0KVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG59KSgpOyIsIi8vIFRhYmxlIENoZWNrIEFsbFxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICQoaW5pdFRhYmxlQ2hlY2tBbGwpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRUYWJsZUNoZWNrQWxsKCkge1xyXG5cclxuICAgICAgICAkKCdbZGF0YS1jaGVjay1hbGxdJykub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgaW5kZXggPSAkdGhpcy5pbmRleCgpICsgMSxcclxuICAgICAgICAgICAgICAgIGNoZWNrYm94ID0gJHRoaXMuZmluZCgnaW5wdXRbdHlwZT1cImNoZWNrYm94XCJdJyksXHJcbiAgICAgICAgICAgICAgICB0YWJsZSA9ICR0aGlzLnBhcmVudHMoJ3RhYmxlJyk7XHJcbiAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB0byBhZmZlY3Qgb25seSB0aGUgY29ycmVjdCBjaGVja2JveCBjb2x1bW5cclxuICAgICAgICAgICAgdGFibGUuZmluZCgndGJvZHkgPiB0ciA+IHRkOm50aC1jaGlsZCgnICsgaW5kZXggKyAnKSBpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl0nKVxyXG4gICAgICAgICAgICAgICAgLnByb3AoJ2NoZWNrZWQnLCBjaGVja2JveFswXS5jaGVja2VkKTtcclxuXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvLyBUT0dHTEUgU1RBVEVcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAkKGluaXRUb2dnbGVTdGF0ZSk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFRvZ2dsZVN0YXRlKCkge1xyXG5cclxuICAgICAgICB2YXIgJGJvZHkgPSAkKCdib2R5Jyk7XHJcbiAgICAgICAgdmFyIHRvZ2dsZSA9IG5ldyBTdGF0ZVRvZ2dsZXIoKTtcclxuXHJcbiAgICAgICAgJCgnW2RhdGEtdG9nZ2xlLXN0YXRlXScpXHJcbiAgICAgICAgICAgIC5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICAvLyBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgdmFyIGVsZW1lbnQgPSAkKHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzbmFtZSA9IGVsZW1lbnQuZGF0YSgndG9nZ2xlU3RhdGUnKSxcclxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQgPSBlbGVtZW50LmRhdGEoJ3RhcmdldCcpLFxyXG4gICAgICAgICAgICAgICAgICAgIG5vUGVyc2lzdCA9IChlbGVtZW50LmF0dHIoJ2RhdGEtbm8tcGVyc2lzdCcpICE9PSB1bmRlZmluZWQpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFNwZWNpZnkgYSB0YXJnZXQgc2VsZWN0b3IgdG8gdG9nZ2xlIGNsYXNzbmFtZVxyXG4gICAgICAgICAgICAgICAgLy8gdXNlIGJvZHkgYnkgZGVmYXVsdFxyXG4gICAgICAgICAgICAgICAgdmFyICR0YXJnZXQgPSB0YXJnZXQgPyAkKHRhcmdldCkgOiAkYm9keTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoY2xhc3NuYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCR0YXJnZXQuaGFzQ2xhc3MoY2xhc3NuYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkdGFyZ2V0LnJlbW92ZUNsYXNzKGNsYXNzbmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghbm9QZXJzaXN0KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9nZ2xlLnJlbW92ZVN0YXRlKGNsYXNzbmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHRhcmdldC5hZGRDbGFzcyhjbGFzc25hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW5vUGVyc2lzdClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRvZ2dsZS5hZGRTdGF0ZShjbGFzc25hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gc29tZSBlbGVtZW50cyBtYXkgbmVlZCB0aGlzIHdoZW4gdG9nZ2xlZCBjbGFzcyBjaGFuZ2UgdGhlIGNvbnRlbnQgc2l6ZVxyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZihFdmVudCkgPT09ICdmdW5jdGlvbicpIHsgLy8gbW9kZXJuIGJyb3dzZXJzXHJcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdyZXNpemUnKSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgeyAvLyBvbGQgYnJvd3NlcnMgYW5kIElFXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlc2l6ZUV2ZW50ID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUV2ZW50KCdVSUV2ZW50cycpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlc2l6ZUV2ZW50LmluaXRVSUV2ZW50KCdyZXNpemUnLCB0cnVlLCBmYWxzZSwgd2luZG93LCAwKTtcclxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZGlzcGF0Y2hFdmVudChyZXNpemVFdmVudCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICAvLyBIYW5kbGUgc3RhdGVzIHRvL2Zyb20gbG9jYWxzdG9yYWdlXHJcbiAgICB2YXIgU3RhdGVUb2dnbGVyID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIHZhciBTVE9SQUdFX0tFWV9OQU1FID0gJ2pxLXRvZ2dsZVN0YXRlJztcclxuXHJcbiAgICAgICAgLyoqIEFkZCBhIHN0YXRlIHRvIHRoZSBicm93c2VyIHN0b3JhZ2UgdG8gYmUgcmVzdG9yZWQgbGF0ZXIgKi9cclxuICAgICAgICB0aGlzLmFkZFN0YXRlID0gZnVuY3Rpb24oY2xhc3NuYW1lKSB7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gU3RvcmFnZXMubG9jYWxTdG9yYWdlLmdldChTVE9SQUdFX0tFWV9OQU1FKTtcclxuICAgICAgICAgICAgaWYgKGRhdGEgaW5zdGFuY2VvZiBBcnJheSkgZGF0YS5wdXNoKGNsYXNzbmFtZSk7XHJcbiAgICAgICAgICAgIGVsc2UgZGF0YSA9IFtjbGFzc25hbWVdO1xyXG4gICAgICAgICAgICBTdG9yYWdlcy5sb2NhbFN0b3JhZ2Uuc2V0KFNUT1JBR0VfS0VZX05BTUUsIGRhdGEpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgLyoqIFJlbW92ZSBhIHN0YXRlIGZyb20gdGhlIGJyb3dzZXIgc3RvcmFnZSAqL1xyXG4gICAgICAgIHRoaXMucmVtb3ZlU3RhdGUgPSBmdW5jdGlvbihjbGFzc25hbWUpIHtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSBTdG9yYWdlcy5sb2NhbFN0b3JhZ2UuZ2V0KFNUT1JBR0VfS0VZX05BTUUpO1xyXG4gICAgICAgICAgICBpZiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gZGF0YS5pbmRleE9mKGNsYXNzbmFtZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggIT09IC0xKSBkYXRhLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgICAgICBTdG9yYWdlcy5sb2NhbFN0b3JhZ2Uuc2V0KFNUT1JBR0VfS0VZX05BTUUsIGRhdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICAvKiogTG9hZCB0aGUgc3RhdGUgc3RyaW5nIGFuZCByZXN0b3JlIHRoZSBjbGFzc2xpc3QgKi9cclxuICAgICAgICB0aGlzLnJlc3RvcmVTdGF0ZSA9IGZ1bmN0aW9uKCRlbGVtKSB7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gU3RvcmFnZXMubG9jYWxTdG9yYWdlLmdldChTVE9SQUdFX0tFWV9OQU1FKTtcclxuICAgICAgICAgICAgaWYgKGRhdGEgaW5zdGFuY2VvZiBBcnJheSlcclxuICAgICAgICAgICAgICAgICRlbGVtLmFkZENsYXNzKGRhdGEuam9pbignICcpKTtcclxuICAgICAgICB9O1xyXG4gICAgfTtcclxuXHJcbiAgICB3aW5kb3cuU3RhdGVUb2dnbGVyID0gU3RhdGVUb2dnbGVyO1xyXG5cclxufSkoKTsiLCIvKio9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogTW9kdWxlOiB0cmlnZ2VyLXJlc2l6ZS5qc1xyXG4gKiBUcmlnZ2VycyBhIHdpbmRvdyByZXNpemUgZXZlbnQgZnJvbSBhbnkgZWxlbWVudFxyXG4gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ki9cclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAkKGluaXRUcmlnZ2VyUmVzaXplKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0VHJpZ2dlclJlc2l6ZSgpIHtcclxuICAgICAgICB2YXIgZWxlbWVudCA9ICQoJ1tkYXRhLXRyaWdnZXItcmVzaXplXScpO1xyXG4gICAgICAgIHZhciB2YWx1ZSA9IGVsZW1lbnQuZGF0YSgndHJpZ2dlclJlc2l6ZScpXHJcbiAgICAgICAgZWxlbWVudC5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIC8vIGFsbCBJRSBmcmllbmRseSBkaXNwYXRjaEV2ZW50XHJcbiAgICAgICAgICAgICAgICB2YXIgZXZ0ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ1VJRXZlbnRzJyk7XHJcbiAgICAgICAgICAgICAgICBldnQuaW5pdFVJRXZlbnQoJ3Jlc2l6ZScsIHRydWUsIGZhbHNlLCB3aW5kb3csIDApO1xyXG4gICAgICAgICAgICAgICAgd2luZG93LmRpc3BhdGNoRXZlbnQoZXZ0KTtcclxuICAgICAgICAgICAgICAgIC8vIG1vZGVybiBkaXNwYXRjaEV2ZW50IHdheVxyXG4gICAgICAgICAgICAgICAgLy8gd2luZG93LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdyZXNpemUnKSk7XHJcbiAgICAgICAgICAgIH0sIHZhbHVlIHx8IDMwMCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG59KSgpOyIsIi8vIERlbW8gQ2FyZHNcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAkKGluaXRDYXJkRGVtbyk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdENhcmREZW1vKCkge1xyXG5cclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUaGlzIGZ1bmN0aW9ucyBzaG93IGEgZGVtb25zdHJhdGlvbiBvZiBob3cgdG8gdXNlXHJcbiAgICAgICAgICogdGhlIGNhcmQgdG9vbHMgc3lzdGVtIHZpYSBjdXN0b20gZXZlbnQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgdmFyIGNhcmRMaXN0ID0gW10uc2xpY2UuY2FsbChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY2FyZC5jYXJkLWRlbW8nKSk7XHJcbiAgICAgICAgY2FyZExpc3QuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XHJcblxyXG4gICAgICAgICAgICBpdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NhcmQucmVmcmVzaCcsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICAvLyBnZXQgdGhlIGNhcmQgZWxlbWVudCB0aGF0IGlzIHJlZnJlc2hpbmdcclxuICAgICAgICAgICAgICAgIHZhciBjYXJkID0gZXZlbnQuZGV0YWlsLmNhcmQ7XHJcbiAgICAgICAgICAgICAgICAvLyBwZXJmb3JtIGFueSBhY3Rpb24gaGVyZSwgd2hlbiBpdCBpcyBkb25lLFxyXG4gICAgICAgICAgICAgICAgLy8gcmVtb3ZlIHRoZSBzcGlubmVyIGNhbGxpbmcgXCJyZW1vdmVTcGlubmVyXCJcclxuICAgICAgICAgICAgICAgIC8vIHNldFRpbWVvdXQgdXNlZCB0byBzaW11bGF0ZSBhc3luYyBvcGVyYXRpb25cclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoY2FyZC5yZW1vdmVTcGlubmVyLCAzMDAwKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgaXRlbS5hZGRFdmVudExpc3RlbmVyKCdjYXJkLmNvbGxhcHNlLmhpZGUnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDYXJkIENvbGxhcHNlIEhpZGUnKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgaXRlbS5hZGRFdmVudExpc3RlbmVyKCdjYXJkLmNvbGxhcHNlLnNob3cnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDYXJkIENvbGxhcHNlIFNob3cnKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgaXRlbS5hZGRFdmVudExpc3RlbmVyKCdjYXJkLnJlbW92ZScsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY29uZmlybSA9IGV2ZW50LmRldGFpbC5jb25maXJtO1xyXG4gICAgICAgICAgICAgICAgdmFyIGNhbmNlbCA9IGV2ZW50LmRldGFpbC5jYW5jZWw7XHJcbiAgICAgICAgICAgICAgICAvLyBwZXJmb3JtIGFueSBhY3Rpb24gIGhlcmVcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdSZW1vdmluZyBDYXJkJyk7XHJcbiAgICAgICAgICAgICAgICAvLyBDYWxsIGNvbmZpcm0oKSB0byBjb250aW51ZSByZW1vdmluZyBjYXJkXHJcbiAgICAgICAgICAgICAgICAvLyBvdGhlcndpc2UgY2FsbCBjYW5jZWwoKVxyXG4gICAgICAgICAgICAgICAgY29uZmlybSgpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICBpdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NhcmQucmVtb3ZlZCcsIGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnUmVtb3ZlZCBDYXJkJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICB9KVxyXG5cclxuICAgIH1cclxuXHJcbn0pKCk7IiwiLy8gTmVzdGFibGUgZGVtb1xyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICQoaW5pdE5lc3RhYmxlKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0TmVzdGFibGUoKSB7XHJcblxyXG4gICAgICAgIGlmICghJC5mbi5uZXN0YWJsZSkgcmV0dXJuO1xyXG5cclxuICAgICAgICB2YXIgdXBkYXRlT3V0cHV0ID0gZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICB2YXIgbGlzdCA9IGUubGVuZ3RoID8gZSA6ICQoZS50YXJnZXQpLFxyXG4gICAgICAgICAgICAgICAgb3V0cHV0ID0gbGlzdC5kYXRhKCdvdXRwdXQnKTtcclxuICAgICAgICAgICAgaWYgKHdpbmRvdy5KU09OKSB7XHJcbiAgICAgICAgICAgICAgICBvdXRwdXQudmFsKHdpbmRvdy5KU09OLnN0cmluZ2lmeShsaXN0Lm5lc3RhYmxlKCdzZXJpYWxpemUnKSkpOyAvLywgbnVsbCwgMikpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgb3V0cHV0LnZhbCgnSlNPTiBicm93c2VyIHN1cHBvcnQgcmVxdWlyZWQgZm9yIHRoaXMgZGVtby4nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIC8vIGFjdGl2YXRlIE5lc3RhYmxlIGZvciBsaXN0IDFcclxuICAgICAgICAkKCcjbmVzdGFibGUnKS5uZXN0YWJsZSh7XHJcbiAgICAgICAgICAgICAgICBncm91cDogMVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAub24oJ2NoYW5nZScsIHVwZGF0ZU91dHB1dCk7XHJcblxyXG4gICAgICAgIC8vIGFjdGl2YXRlIE5lc3RhYmxlIGZvciBsaXN0IDJcclxuICAgICAgICAkKCcjbmVzdGFibGUyJykubmVzdGFibGUoe1xyXG4gICAgICAgICAgICAgICAgZ3JvdXA6IDFcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLm9uKCdjaGFuZ2UnLCB1cGRhdGVPdXRwdXQpO1xyXG5cclxuICAgICAgICAvLyBvdXRwdXQgaW5pdGlhbCBzZXJpYWxpc2VkIGRhdGFcclxuICAgICAgICB1cGRhdGVPdXRwdXQoJCgnI25lc3RhYmxlJykuZGF0YSgnb3V0cHV0JywgJCgnI25lc3RhYmxlLW91dHB1dCcpKSk7XHJcbiAgICAgICAgdXBkYXRlT3V0cHV0KCQoJyNuZXN0YWJsZTInKS5kYXRhKCdvdXRwdXQnLCAkKCcjbmVzdGFibGUyLW91dHB1dCcpKSk7XHJcblxyXG4gICAgICAgICQoJy5qcy1uZXN0YWJsZS1hY3Rpb24nKS5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIHZhciB0YXJnZXQgPSAkKGUudGFyZ2V0KSxcclxuICAgICAgICAgICAgICAgIGFjdGlvbiA9IHRhcmdldC5kYXRhKCdhY3Rpb24nKTtcclxuICAgICAgICAgICAgaWYgKGFjdGlvbiA9PT0gJ2V4cGFuZC1hbGwnKSB7XHJcbiAgICAgICAgICAgICAgICAkKCcuZGQnKS5uZXN0YWJsZSgnZXhwYW5kQWxsJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGFjdGlvbiA9PT0gJ2NvbGxhcHNlLWFsbCcpIHtcclxuICAgICAgICAgICAgICAgICQoJy5kZCcpLm5lc3RhYmxlKCdjb2xsYXBzZUFsbCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvKio9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogTW9kdWxlOiBub3RpZnkuanNcclxuICogQ3JlYXRlIHRvZ2dsZWFibGUgbm90aWZpY2F0aW9ucyB0aGF0IGZhZGUgb3V0IGF1dG9tYXRpY2FsbHkuXHJcbiAqIEJhc2VkIG9uIE5vdGlmeSBhZGRvbiBmcm9tIFVJS2l0IChodHRwOi8vZ2V0dWlraXQuY29tL2RvY3MvYWRkb25zX25vdGlmeS5odG1sKVxyXG4gKiBbZGF0YS10b2dnbGU9XCJub3RpZnlcIl1cclxuICogW2RhdGEtb3B0aW9ucz1cIm9wdGlvbnMgaW4ganNvbiBmb3JtYXRcIiBdXHJcbiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0qL1xyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICQoaW5pdE5vdGlmeSk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdE5vdGlmeSgpIHtcclxuXHJcbiAgICAgICAgdmFyIFNlbGVjdG9yID0gJ1tkYXRhLW5vdGlmeV0nLFxyXG4gICAgICAgICAgICBhdXRvbG9hZFNlbGVjdG9yID0gJ1tkYXRhLW9ubG9hZF0nLFxyXG4gICAgICAgICAgICBkb2MgPSAkKGRvY3VtZW50KTtcclxuXHJcbiAgICAgICAgJChTZWxlY3RvcikuZWFjaChmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgIHZhciAkdGhpcyA9ICQodGhpcyksXHJcbiAgICAgICAgICAgICAgICBvbmxvYWQgPSAkdGhpcy5kYXRhKCdvbmxvYWQnKTtcclxuXHJcbiAgICAgICAgICAgIGlmIChvbmxvYWQgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBub3RpZnlOb3coJHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgfSwgODAwKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgJHRoaXMub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgbm90aWZ5Tm93KCR0aGlzKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBub3RpZnlOb3coJGVsZW1lbnQpIHtcclxuICAgICAgICB2YXIgbWVzc2FnZSA9ICRlbGVtZW50LmRhdGEoJ21lc3NhZ2UnKSxcclxuICAgICAgICAgICAgb3B0aW9ucyA9ICRlbGVtZW50LmRhdGEoJ29wdGlvbnMnKTtcclxuXHJcbiAgICAgICAgaWYgKCFtZXNzYWdlKVxyXG4gICAgICAgICAgICAkLmVycm9yKCdOb3RpZnk6IE5vIG1lc3NhZ2Ugc3BlY2lmaWVkJyk7XHJcblxyXG4gICAgICAgICQubm90aWZ5KG1lc3NhZ2UsIG9wdGlvbnMgfHwge30pO1xyXG4gICAgfVxyXG5cclxuXHJcbn0pKCk7XHJcblxyXG5cclxuLyoqXHJcbiAqIE5vdGlmeSBBZGRvbiBkZWZpbml0aW9uIGFzIGpRdWVyeSBwbHVnaW5cclxuICogQWRhcHRlZCB2ZXJzaW9uIHRvIHdvcmsgd2l0aCBCb290c3RyYXAgY2xhc3Nlc1xyXG4gKiBNb3JlIGluZm9ybWF0aW9uIGh0dHA6Ly9nZXR1aWtpdC5jb20vZG9jcy9hZGRvbnNfbm90aWZ5Lmh0bWxcclxuICovXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgdmFyIGNvbnRhaW5lcnMgPSB7fSxcclxuICAgICAgICBtZXNzYWdlcyA9IHt9LFxyXG5cclxuICAgICAgICBub3RpZnkgPSBmdW5jdGlvbihvcHRpb25zKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoJC50eXBlKG9wdGlvbnMpID09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgICBvcHRpb25zID0geyBtZXNzYWdlOiBvcHRpb25zIH07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHNbMV0pIHtcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSAkLmV4dGVuZChvcHRpb25zLCAkLnR5cGUoYXJndW1lbnRzWzFdKSA9PSAnc3RyaW5nJyA/IHsgc3RhdHVzOiBhcmd1bWVudHNbMV0gfSA6IGFyZ3VtZW50c1sxXSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiAobmV3IE1lc3NhZ2Uob3B0aW9ucykpLnNob3coKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNsb3NlQWxsID0gZnVuY3Rpb24oZ3JvdXAsIGluc3RhbnRseSkge1xyXG4gICAgICAgICAgICBpZiAoZ3JvdXApIHtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGlkIGluIG1lc3NhZ2VzKSB7IGlmIChncm91cCA9PT0gbWVzc2FnZXNbaWRdLmdyb3VwKSBtZXNzYWdlc1tpZF0uY2xvc2UoaW5zdGFudGx5KTsgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaWQgaW4gbWVzc2FnZXMpIHsgbWVzc2FnZXNbaWRdLmNsb3NlKGluc3RhbnRseSk7IH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgdmFyIE1lc3NhZ2UgPSBmdW5jdGlvbihvcHRpb25zKSB7XHJcblxyXG4gICAgICAgIHZhciAkdGhpcyA9IHRoaXM7XHJcblxyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBNZXNzYWdlLmRlZmF1bHRzLCBvcHRpb25zKTtcclxuXHJcbiAgICAgICAgdGhpcy51dWlkID0gXCJJRFwiICsgKG5ldyBEYXRlKCkuZ2V0VGltZSgpKSArIFwiUkFORFwiICsgKE1hdGguY2VpbChNYXRoLnJhbmRvbSgpICogMTAwMDAwKSk7XHJcbiAgICAgICAgdGhpcy5lbGVtZW50ID0gJChbXHJcbiAgICAgICAgICAgIC8vIGFsZXJ0LWRpc21pc3NhYmxlIGVuYWJsZXMgYnMgY2xvc2UgaWNvblxyXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInVrLW5vdGlmeS1tZXNzYWdlIGFsZXJ0LWRpc21pc3NhYmxlXCI+JyxcclxuICAgICAgICAgICAgJzxhIGNsYXNzPVwiY2xvc2VcIj4mdGltZXM7PC9hPicsXHJcbiAgICAgICAgICAgICc8ZGl2PicgKyB0aGlzLm9wdGlvbnMubWVzc2FnZSArICc8L2Rpdj4nLFxyXG4gICAgICAgICAgICAnPC9kaXY+J1xyXG5cclxuICAgICAgICBdLmpvaW4oJycpKS5kYXRhKFwibm90aWZ5TWVzc2FnZVwiLCB0aGlzKTtcclxuXHJcbiAgICAgICAgLy8gc3RhdHVzXHJcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zdGF0dXMpIHtcclxuICAgICAgICAgICAgdGhpcy5lbGVtZW50LmFkZENsYXNzKCdhbGVydCBhbGVydC0nICsgdGhpcy5vcHRpb25zLnN0YXR1cyk7XHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudHN0YXR1cyA9IHRoaXMub3B0aW9ucy5zdGF0dXM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmdyb3VwID0gdGhpcy5vcHRpb25zLmdyb3VwO1xyXG5cclxuICAgICAgICBtZXNzYWdlc1t0aGlzLnV1aWRdID0gdGhpcztcclxuXHJcbiAgICAgICAgaWYgKCFjb250YWluZXJzW3RoaXMub3B0aW9ucy5wb3NdKSB7XHJcbiAgICAgICAgICAgIGNvbnRhaW5lcnNbdGhpcy5vcHRpb25zLnBvc10gPSAkKCc8ZGl2IGNsYXNzPVwidWstbm90aWZ5IHVrLW5vdGlmeS0nICsgdGhpcy5vcHRpb25zLnBvcyArICdcIj48L2Rpdj4nKS5hcHBlbmRUbygnYm9keScpLm9uKFwiY2xpY2tcIiwgXCIudWstbm90aWZ5LW1lc3NhZ2VcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmRhdGEoXCJub3RpZnlNZXNzYWdlXCIpLmNsb3NlKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG5cclxuICAgICQuZXh0ZW5kKE1lc3NhZ2UucHJvdG90eXBlLCB7XHJcblxyXG4gICAgICAgIHV1aWQ6IGZhbHNlLFxyXG4gICAgICAgIGVsZW1lbnQ6IGZhbHNlLFxyXG4gICAgICAgIHRpbW91dDogZmFsc2UsXHJcbiAgICAgICAgY3VycmVudHN0YXR1czogXCJcIixcclxuICAgICAgICBncm91cDogZmFsc2UsXHJcblxyXG4gICAgICAgIHNob3c6IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuZWxlbWVudC5pcyhcIjp2aXNpYmxlXCIpKSByZXR1cm47XHJcblxyXG4gICAgICAgICAgICB2YXIgJHRoaXMgPSB0aGlzO1xyXG5cclxuICAgICAgICAgICAgY29udGFpbmVyc1t0aGlzLm9wdGlvbnMucG9zXS5zaG93KCkucHJlcGVuZCh0aGlzLmVsZW1lbnQpO1xyXG5cclxuICAgICAgICAgICAgdmFyIG1hcmdpbmJvdHRvbSA9IHBhcnNlSW50KHRoaXMuZWxlbWVudC5jc3MoXCJtYXJnaW4tYm90dG9tXCIpLCAxMCk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQuY3NzKHsgXCJvcGFjaXR5XCI6IDAsIFwibWFyZ2luLXRvcFwiOiAtMSAqIHRoaXMuZWxlbWVudC5vdXRlckhlaWdodCgpLCBcIm1hcmdpbi1ib3R0b21cIjogMCB9KS5hbmltYXRlKHsgXCJvcGFjaXR5XCI6IDEsIFwibWFyZ2luLXRvcFwiOiAwLCBcIm1hcmdpbi1ib3R0b21cIjogbWFyZ2luYm90dG9tIH0sIGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICgkdGhpcy5vcHRpb25zLnRpbWVvdXQpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNsb3NlZm4gPSBmdW5jdGlvbigpIHsgJHRoaXMuY2xvc2UoKTsgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJHRoaXMudGltZW91dCA9IHNldFRpbWVvdXQoY2xvc2VmbiwgJHRoaXMub3B0aW9ucy50aW1lb3V0KTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgJHRoaXMuZWxlbWVudC5ob3ZlcihcclxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oKSB7IGNsZWFyVGltZW91dCgkdGhpcy50aW1lb3V0KTsgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oKSB7ICR0aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KGNsb3NlZm4sICR0aGlzLm9wdGlvbnMudGltZW91dCk7IH1cclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gdGhpcztcclxuICAgICAgICB9LFxyXG5cclxuICAgICAgICBjbG9zZTogZnVuY3Rpb24oaW5zdGFudGx5KSB7XHJcblxyXG4gICAgICAgICAgICB2YXIgJHRoaXMgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgZmluYWxpemUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAkdGhpcy5lbGVtZW50LnJlbW92ZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIWNvbnRhaW5lcnNbJHRoaXMub3B0aW9ucy5wb3NdLmNoaWxkcmVuKCkubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lcnNbJHRoaXMub3B0aW9ucy5wb3NdLmhpZGUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBtZXNzYWdlc1skdGhpcy51dWlkXTtcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBpZiAodGhpcy50aW1lb3V0KSBjbGVhclRpbWVvdXQodGhpcy50aW1lb3V0KTtcclxuXHJcbiAgICAgICAgICAgIGlmIChpbnN0YW50bHkpIHtcclxuICAgICAgICAgICAgICAgIGZpbmFsaXplKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmVsZW1lbnQuYW5pbWF0ZSh7IFwib3BhY2l0eVwiOiAwLCBcIm1hcmdpbi10b3BcIjogLTEgKiB0aGlzLmVsZW1lbnQub3V0ZXJIZWlnaHQoKSwgXCJtYXJnaW4tYm90dG9tXCI6IDAgfSwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZmluYWxpemUoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgY29udGVudDogZnVuY3Rpb24oaHRtbCkge1xyXG5cclxuICAgICAgICAgICAgdmFyIGNvbnRhaW5lciA9IHRoaXMuZWxlbWVudC5maW5kKFwiPmRpdlwiKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghaHRtbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbnRhaW5lci5odG1sKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGNvbnRhaW5lci5odG1sKGh0bWwpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICAgICAgfSxcclxuXHJcbiAgICAgICAgc3RhdHVzOiBmdW5jdGlvbihzdGF0dXMpIHtcclxuXHJcbiAgICAgICAgICAgIGlmICghc3RhdHVzKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50c3RhdHVzO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQ2xhc3MoJ2FsZXJ0IGFsZXJ0LScgKyB0aGlzLmN1cnJlbnRzdGF0dXMpLmFkZENsYXNzKCdhbGVydCBhbGVydC0nICsgc3RhdHVzKTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuY3VycmVudHN0YXR1cyA9IHN0YXR1cztcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIE1lc3NhZ2UuZGVmYXVsdHMgPSB7XHJcbiAgICAgICAgbWVzc2FnZTogXCJcIixcclxuICAgICAgICBzdGF0dXM6IFwibm9ybWFsXCIsXHJcbiAgICAgICAgdGltZW91dDogNTAwMCxcclxuICAgICAgICBncm91cDogbnVsbCxcclxuICAgICAgICBwb3M6ICd0b3AtY2VudGVyJ1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgJFtcIm5vdGlmeVwiXSA9IG5vdGlmeTtcclxuICAgICRbXCJub3RpZnlcIl0ubWVzc2FnZSA9IE1lc3NhZ2U7XHJcbiAgICAkW1wibm90aWZ5XCJdLmNsb3NlQWxsID0gY2xvc2VBbGw7XHJcblxyXG4gICAgcmV0dXJuIG5vdGlmeTtcclxuXHJcbn0oKSk7IiwiLyoqPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XHJcbiAqIE1vZHVsZTogcG9ydGxldC5qc1xyXG4gKiBEcmFnIGFuZCBkcm9wIGFueSBjYXJkIHRvIGNoYW5nZSBpdHMgcG9zaXRpb25cclxuICogVGhlIFNlbGVjdG9yIHNob3VsZCBjb3VsZCBiZSBhcHBsaWVkIHRvIGFueSBvYmplY3QgdGhhdCBjb250YWluc1xyXG4gKiBjYXJkLCBzbyAuY29sLSogZWxlbWVudCBhcmUgaWRlYWwuXHJcbiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0qL1xyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIHZhciBTVE9SQUdFX0tFWV9OQU1FID0gJ2pxLXBvcnRsZXRTdGF0ZSc7XHJcblxyXG4gICAgJChpbml0UG9ydGxldHMpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRQb3J0bGV0cygpIHtcclxuXHJcbiAgICAgICAgLy8gQ29tcG9uZW50IGlzIE5PVCBvcHRpb25hbFxyXG4gICAgICAgIGlmICghJC5mbi5zb3J0YWJsZSkgcmV0dXJuO1xyXG5cclxuICAgICAgICB2YXIgU2VsZWN0b3IgPSAnW2RhdGEtdG9nZ2xlPVwicG9ydGxldFwiXSc7XHJcblxyXG4gICAgICAgICQoU2VsZWN0b3IpLnNvcnRhYmxlKHtcclxuICAgICAgICAgICAgY29ubmVjdFdpdGg6ICAgICAgICAgIFNlbGVjdG9yLFxyXG4gICAgICAgICAgICBpdGVtczogICAgICAgICAgICAgICAgJ2Rpdi5jYXJkJyxcclxuICAgICAgICAgICAgaGFuZGxlOiAgICAgICAgICAgICAgICcucG9ydGxldC1oYW5kbGVyJyxcclxuICAgICAgICAgICAgb3BhY2l0eTogICAgICAgICAgICAgIDAuNyxcclxuICAgICAgICAgICAgcGxhY2Vob2xkZXI6ICAgICAgICAgICdwb3J0bGV0IGJveC1wbGFjZWhvbGRlcicsXHJcbiAgICAgICAgICAgIGNhbmNlbDogICAgICAgICAgICAgICAnLnBvcnRsZXQtY2FuY2VsJyxcclxuICAgICAgICAgICAgZm9yY2VQbGFjZWhvbGRlclNpemU6IHRydWUsXHJcbiAgICAgICAgICAgIGlmcmFtZUZpeDogICAgICAgICAgICBmYWxzZSxcclxuICAgICAgICAgICAgdG9sZXJhbmNlOiAgICAgICAgICAgICdwb2ludGVyJyxcclxuICAgICAgICAgICAgaGVscGVyOiAgICAgICAgICAgICAgICdvcmlnaW5hbCcsXHJcbiAgICAgICAgICAgIHJldmVydDogICAgICAgICAgICAgICAyMDAsXHJcbiAgICAgICAgICAgIGZvcmNlSGVscGVyU2l6ZTogICAgICB0cnVlLFxyXG4gICAgICAgICAgICB1cGRhdGU6ICAgICAgICAgICAgICAgc2F2ZVBvcnRsZXRPcmRlcixcclxuICAgICAgICAgICAgY3JlYXRlOiAgICAgICAgICAgICAgIGxvYWRQb3J0bGV0T3JkZXJcclxuICAgICAgICB9KVxyXG4gICAgICAgIC8vIG9wdGlvbmFsbHkgZGlzYWJsZXMgbW91c2Ugc2VsZWN0aW9uXHJcbiAgICAgICAgLy8uZGlzYWJsZVNlbGVjdGlvbigpXHJcbiAgICAgICAgO1xyXG5cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBzYXZlUG9ydGxldE9yZGVyKGV2ZW50LCB1aSkge1xyXG5cclxuICAgICAgICB2YXIgZGF0YSA9IFN0b3JhZ2VzLmxvY2FsU3RvcmFnZS5nZXQoU1RPUkFHRV9LRVlfTkFNRSk7XHJcblxyXG4gICAgICAgIGlmICghZGF0YSkgeyBkYXRhID0ge307IH1cclxuXHJcbiAgICAgICAgZGF0YVt0aGlzLmlkXSA9ICQodGhpcykuc29ydGFibGUoJ3RvQXJyYXknKTtcclxuXHJcbiAgICAgICAgaWYgKGRhdGEpIHtcclxuICAgICAgICAgICAgU3RvcmFnZXMubG9jYWxTdG9yYWdlLnNldChTVE9SQUdFX0tFWV9OQU1FLCBkYXRhKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGxvYWRQb3J0bGV0T3JkZXIoKSB7XHJcblxyXG4gICAgICAgIHZhciBkYXRhID0gU3RvcmFnZXMubG9jYWxTdG9yYWdlLmdldChTVE9SQUdFX0tFWV9OQU1FKTtcclxuXHJcbiAgICAgICAgaWYgKGRhdGEpIHtcclxuXHJcbiAgICAgICAgICAgIHZhciBwb3JsZXRJZCA9IHRoaXMuaWQsXHJcbiAgICAgICAgICAgICAgICBjYXJkcyA9IGRhdGFbcG9ybGV0SWRdO1xyXG5cclxuICAgICAgICAgICAgaWYgKGNhcmRzKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcG9ydGxldCA9ICQoJyMnICsgcG9ybGV0SWQpO1xyXG5cclxuICAgICAgICAgICAgICAgICQuZWFjaChjYXJkcywgZnVuY3Rpb24oaW5kZXgsIHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnIycgKyB2YWx1ZSkuYXBwZW5kVG8ocG9ydGxldCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9XHJcblxyXG4gICAgfVxyXG5cclxuICAgIC8vIFJlc2V0IHBvcmxldCBzYXZlIHN0YXRlXHJcbiAgICB3aW5kb3cucmVzZXRQb3JsZXRzID0gZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIFN0b3JhZ2VzLmxvY2FsU3RvcmFnZS5yZW1vdmUoU1RPUkFHRV9LRVlfTkFNRSk7XHJcbiAgICAgICAgLy8gcmVsb2FkIHRoZSBwYWdlXHJcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvLyBIVE1MNSBTb3J0YWJsZSBkZW1vXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgJChpbml0U29ydGFibGUpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRTb3J0YWJsZSgpIHtcclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBzb3J0YWJsZSA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybjtcclxuXHJcbiAgICAgICAgc29ydGFibGUoJy5zb3J0YWJsZScsIHtcclxuICAgICAgICAgICAgZm9yY2VQbGFjZWhvbGRlclNpemU6IHRydWUsXHJcbiAgICAgICAgICAgIHBsYWNlaG9sZGVyOiAnPGRpdiBjbGFzcz1cImJveC1wbGFjZWhvbGRlciBwMCBtMFwiPjxkaXY+PC9kaXY+PC9kaXY+J1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH1cclxuXHJcbn0pKCk7IiwiLy8gU3dlZXQgQWxlcnRcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAkKGluaXRTd2VldEFsZXJ0KTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0U3dlZXRBbGVydCgpIHtcclxuXHJcbiAgICAgICAgJCgnI3N3YWwtZGVtbzEnKS5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgc3dhbChcIkhlcmUncyBhIG1lc3NhZ2UhXCIpXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICQoJyNzd2FsLWRlbW8yJykub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIHN3YWwoXCJIZXJlJ3MgYSBtZXNzYWdlIVwiLCBcIkl0J3MgcHJldHR5LCBpc24ndCBpdD9cIilcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJCgnI3N3YWwtZGVtbzMnKS5vbignY2xpY2snLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgc3dhbChcIkdvb2Qgam9iIVwiLCBcIllvdSBjbGlja2VkIHRoZSBidXR0b24hXCIsIFwic3VjY2Vzc1wiKVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkKCcjc3dhbC1kZW1vNCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBzd2FsKHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAnQXJlIHlvdSBzdXJlPycsXHJcbiAgICAgICAgICAgICAgICB0ZXh0OiAnWW91ciB3aWxsIG5vdCBiZSBhYmxlIHRvIHJlY292ZXIgdGhpcyBpbWFnaW5hcnkgZmlsZSEnLFxyXG4gICAgICAgICAgICAgICAgaWNvbjogJ3dhcm5pbmcnLFxyXG4gICAgICAgICAgICAgICAgYnV0dG9uczoge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbmNlbDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICBjb25maXJtOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdZZXMsIGRlbGV0ZSBpdCEnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcImJnLWRhbmdlclwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9zZU1vZGFsOiB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgc3dhbCgnQm9veWFoIScpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICQoJyNzd2FsLWRlbW81Jykub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIHN3YWwoe1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdBcmUgeW91IHN1cmU/JyxcclxuICAgICAgICAgICAgICAgIHRleHQ6ICdZb3VyIHdpbGwgbm90IGJlIGFibGUgdG8gcmVjb3ZlciB0aGlzIGltYWdpbmFyeSBmaWxlIScsXHJcbiAgICAgICAgICAgICAgICBpY29uOiAnd2FybmluZycsXHJcbiAgICAgICAgICAgICAgICBidXR0b25zOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FuY2VsOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICdObywgY2FuY2VsIHBseCEnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lOiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9zZU1vZGFsOiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgY29uZmlybToge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnWWVzLCBkZWxldGUgaXQhJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZTogXCJiZy1kYW5nZXJcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2xvc2VNb2RhbDogZmFsc2VcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24oaXNDb25maXJtKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXNDb25maXJtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3dhbCgnRGVsZXRlZCEnLCAnWW91ciBpbWFnaW5hcnkgZmlsZSBoYXMgYmVlbiBkZWxldGVkLicsICdzdWNjZXNzJyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHN3YWwoJ0NhbmNlbGxlZCcsICdZb3VyIGltYWdpbmFyeSBmaWxlIGlzIHNhZmUgOiknLCAnZXJyb3InKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH1cclxuXHJcbn0pKCk7IiwiLy8gRnVsbCBDYWxlbmRhclxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgIGlmICh0eXBlb2YgRnVsbENhbGVuZGFyID09PSAndW5kZWZpbmVkJykgcmV0dXJuO1xyXG5cclxuICAgIC8vIFdoZW4gZG9tIHJlYWR5LCBpbml0IGNhbGVuZGFyIGFuZCBldmVudHNcclxuICAgICQoaW5pdEV4dGVybmFsRXZlbnRzKTtcclxuICAgICQoaW5pdEZ1bGxDYWxlbmRhcik7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdEZ1bGxDYWxlbmRhcigpIHtcclxuXHJcbiAgICAgICAgdmFyIENhbGVuZGFyID0gRnVsbENhbGVuZGFyLkNhbGVuZGFyO1xyXG4gICAgICAgIHZhciBEcmFnZ2FibGUgPSBGdWxsQ2FsZW5kYXJJbnRlcmFjdGlvbi5EcmFnZ2FibGU7XHJcblxyXG4gICAgICAgIC8qIGluaXRpYWxpemUgdGhlIGV4dGVybmFsIGV2ZW50cyAqL1xyXG4gICAgICAgIHZhciBjb250YWluZXJFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdleHRlcm5hbC1ldmVudHMtbGlzdCcpO1xyXG4gICAgICAgIG5ldyBEcmFnZ2FibGUoY29udGFpbmVyRWwsIHtcclxuICAgICAgICAgICAgaXRlbVNlbGVjdG9yOiAnLmZjZS1ldmVudCcsXHJcbiAgICAgICAgICAgIGV2ZW50RGF0YTogZnVuY3Rpb24oZXZlbnRFbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICB0aXRsZTogZXZlbnRFbC5pbm5lclRleHQudHJpbSgpXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8qIGluaXRpYWxpemUgdGhlIGNhbGVuZGFyICovXHJcbiAgICAgICAgdmFyIGNhbGVuZGFyRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FsZW5kYXInKTtcclxuICAgICAgICB2YXIgY2FsZW5kYXIgPSBuZXcgQ2FsZW5kYXIoY2FsZW5kYXJFbCwge1xyXG4gICAgICAgICAgICBldmVudHM6IGNyZWF0ZURlbW9FdmVudHMoKSxcclxuICAgICAgICAgICAgcGx1Z2luczogWydpbnRlcmFjdGlvbicsICdkYXlHcmlkJywgJ3RpbWVHcmlkJywgJ2xpc3QnLCAnYm9vdHN0cmFwJ10sXHJcbiAgICAgICAgICAgIHRoZW1lU3lzdGVtOiAnYm9vdHN0cmFwJyxcclxuICAgICAgICAgICAgaGVhZGVyOiB7XHJcbiAgICAgICAgICAgICAgICBsZWZ0OiAncHJldixuZXh0IHRvZGF5JyxcclxuICAgICAgICAgICAgICAgIGNlbnRlcjogJ3RpdGxlJyxcclxuICAgICAgICAgICAgICAgIHJpZ2h0OiAnZGF5R3JpZE1vbnRoLHRpbWVHcmlkV2Vlayx0aW1lR3JpZERheSxsaXN0V2VlaydcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZWRpdGFibGU6IHRydWUsXHJcbiAgICAgICAgICAgIGRyb3BwYWJsZTogdHJ1ZSwgLy8gdGhpcyBhbGxvd3MgdGhpbmdzIHRvIGJlIGRyb3BwZWQgb250byB0aGUgY2FsZW5kYXJcclxuICAgICAgICAgICAgZXZlbnRSZWNlaXZlOiBmdW5jdGlvbihpbmZvKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc3R5bGVzID0gZ2V0Q29tcHV0ZWRTdHlsZShpbmZvLmRyYWdnZWRFbCk7XHJcbiAgICAgICAgICAgICAgICBpbmZvLmV2ZW50LnNldFByb3AoJ2JhY2tncm91bmRDb2xvcicsIHN0eWxlcy5iYWNrZ3JvdW5kQ29sb3IpO1xyXG4gICAgICAgICAgICAgICAgaW5mby5ldmVudC5zZXRQcm9wKCdib3JkZXJDb2xvcicsIHN0eWxlcy5ib3JkZXJDb2xvcik7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gaXMgdGhlIFwicmVtb3ZlIGFmdGVyIGRyb3BcIiBjaGVja2JveCBjaGVja2VkP1xyXG4gICAgICAgICAgICAgICAgaWYgKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkcm9wLXJlbW92ZScpLmNoZWNrZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyBpZiBzbywgcmVtb3ZlIHRoZSBlbGVtZW50IGZyb20gdGhlIFwiRHJhZ2dhYmxlIEV2ZW50c1wiIGxpc3RcclxuICAgICAgICAgICAgICAgICAgICBpbmZvLmRyYWdnZWRFbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGluZm8uZHJhZ2dlZEVsKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNhbGVuZGFyLnJlbmRlcigpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRFeHRlcm5hbEV2ZW50cygpIHtcclxuICAgICAgICB2YXIgY29sb3JTZWxlY3RvckNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdleHRlcm5hbC1ldmVudC1jb2xvci1zZWxlY3RvcicpO1xyXG4gICAgICAgIHZhciBhZGRFdmVudEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdleHRlcm5hbC1ldmVudC1hZGQtYnRuJyk7XHJcbiAgICAgICAgdmFyIGV2ZW50TmFtZUlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2V4dGVybmFsLWV2ZW50LW5hbWUnKTtcclxuICAgICAgICB2YXIgY29sb3JTZWxlY3RvcnMgPSBbXS5zbGljZS5jYWxsKGNvbG9yU2VsZWN0b3JDb250YWluZXIucXVlcnlTZWxlY3RvckFsbCgnLmNpcmNsZScpKTtcclxuICAgICAgICB2YXIgY3VycmVudFNlbGVjdG9yID0gY29sb3JTZWxlY3RvckNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKCcuY2lyY2xlJyk7IC8vIHNlbGVjdCBmaXJzdCBhcyBkZWZhdWx0XHJcbiAgICAgICAgdmFyIGNvbnRhaW5lckVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2V4dGVybmFsLWV2ZW50cy1saXN0Jyk7XHJcblxyXG4gICAgICAgIC8vIGNvbnRyb2wgdGhlIGNvbG9yIHNlbGVjdG9yIHNlbGVjdGFibGUgYmVoYXZpb3JcclxuICAgICAgICBjb2xvclNlbGVjdG9ycy5mb3JFYWNoKGZ1bmN0aW9uKHNlbCkge1xyXG4gICAgICAgICAgICBzZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBzZWxlY3RDb2xvclNlbGVjdG9yKHNlbCkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vIENyZWF0ZSBhbmQgYWRkIGEgbmV3IGV2ZW50IHRvIHRoZSBsaXN0XHJcbiAgICAgICAgYWRkRXZlbnRCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhZGROZXdFeHRlcm5hbEV2ZW50KTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2VsZWN0Q29sb3JTZWxlY3RvcihzZWwpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIC8vIGRlc2VsZWN0IGFsbFxyXG4gICAgICAgICAgICAgICAgY29sb3JTZWxlY3RvcnMuZm9yRWFjaCh1bnNlbGVjdEFsbENvbG9yU2VsZWN0b3IpO1xyXG4gICAgICAgICAgICAgICAgLy8gc2VsZWN0IGN1cnJlbnRcclxuICAgICAgICAgICAgICAgIHNlbC5jbGFzc0xpc3QuYWRkKCdzZWxlY3RlZCcpO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudFNlbGVjdG9yID0gc2VsO1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gdW5zZWxlY3RBbGxDb2xvclNlbGVjdG9yKGVsKSB7XHJcbiAgICAgICAgICAgIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdGVkJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBhZGROZXdFeHRlcm5hbEV2ZW50KCkge1xyXG4gICAgICAgICAgICB2YXIgbmFtZSA9IGV2ZW50TmFtZUlucHV0LnZhbHVlO1xyXG4gICAgICAgICAgICBpZiAobmFtZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGVsID0gY3JlYXRlRWxlbWVudChjdXJyZW50U2VsZWN0b3IpO1xyXG4gICAgICAgICAgICAgICAgZWwuaW5uZXJUZXh0ID0gbmFtZTtcclxuICAgICAgICAgICAgICAgIGNvbnRhaW5lckVsLmluc2VydEJlZm9yZShlbCwgY29udGFpbmVyRWwuZmlyc3RDaGlsZCk7IC8vIHByZXBwZW5kXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQoYmFzZUVsZW1lbnQpIHtcclxuICAgICAgICAgICAgdmFyIHN0eWxlcyA9IGdldENvbXB1dGVkU3R5bGUoY3VycmVudFNlbGVjdG9yKTtcclxuICAgICAgICAgICAgdmFyIGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuICAgICAgICAgICAgZWxlbWVudC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBzdHlsZXMuYmFja2dyb3VuZENvbG9yO1xyXG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlLmJvcmRlckNvbG9yID0gc3R5bGVzLmJvcmRlckNvbG9yO1xyXG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlLmNvbG9yID0gJyNmZmYnO1xyXG4gICAgICAgICAgICBlbGVtZW50LmNsYXNzTmFtZSA9ICdmY2UtZXZlbnQnOyAvLyBtYWtlIGRyYWdnYWJsZVxyXG4gICAgICAgICAgICByZXR1cm4gZWxlbWVudDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBDcmVhdGVzIGFuIGFycmF5IG9mIGV2ZW50cyB0byBkaXNwbGF5IGluIHRoZSBmaXJzdCBsb2FkIG9mIHRoZSBjYWxlbmRhclxyXG4gICAgICogV3JhcCBpbnRvIHRoaXMgZnVuY3Rpb24gYSByZXF1ZXN0IHRvIGEgc291cmNlIHRvIGdldCB2aWEgYWpheCB0aGUgc3RvcmVkIGV2ZW50c1xyXG4gICAgICogQHJldHVybiBBcnJheSBUaGUgYXJyYXkgd2l0aCB0aGUgZXZlbnRzXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGNyZWF0ZURlbW9FdmVudHMoKSB7XHJcbiAgICAgICAgLy8gRGF0ZSBmb3IgdGhlIGNhbGVuZGFyIGV2ZW50cyAoZHVtbXkgZGF0YSlcclxuICAgICAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgdmFyIGQgPSBkYXRlLmdldERhdGUoKSxcclxuICAgICAgICAgICAgbSA9IGRhdGUuZ2V0TW9udGgoKSxcclxuICAgICAgICAgICAgeSA9IGRhdGUuZ2V0RnVsbFllYXIoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIFtcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgdGl0bGU6ICdBbGwgRGF5IEV2ZW50JyxcclxuICAgICAgICAgICAgICAgIHN0YXJ0OiBuZXcgRGF0ZSh5LCBtLCAxKSxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyNmNTY5NTQnLCAvL3JlZFxyXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6ICcjZjU2OTU0JyAvL3JlZFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ0xvbmcgRXZlbnQnLFxyXG4gICAgICAgICAgICAgICAgc3RhcnQ6IG5ldyBEYXRlKHksIG0sIGQgLSA1KSxcclxuICAgICAgICAgICAgICAgIGVuZDogbmV3IERhdGUoeSwgbSwgZCAtIDIpLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnI2YzOWMxMicsIC8veWVsbG93XHJcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogJyNmMzljMTInIC8veWVsbG93XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAnTWVldGluZycsXHJcbiAgICAgICAgICAgICAgICBzdGFydDogbmV3IERhdGUoeSwgbSwgZCwgMTAsIDMwKSxcclxuICAgICAgICAgICAgICAgIGFsbERheTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjMDA3M2I3JywgLy9CbHVlXHJcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogJyMwMDczYjcnIC8vQmx1ZVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ0x1bmNoJyxcclxuICAgICAgICAgICAgICAgIHN0YXJ0OiBuZXcgRGF0ZSh5LCBtLCBkLCAxMiwgMCksXHJcbiAgICAgICAgICAgICAgICBlbmQ6IG5ldyBEYXRlKHksIG0sIGQsIDE0LCAwKSxcclxuICAgICAgICAgICAgICAgIGFsbERheTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6ICcjMDBjMGVmJywgLy9JbmZvIChhcXVhKVxyXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6ICcjMDBjMGVmJyAvL0luZm8gKGFxdWEpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHRpdGxlOiAnQmlydGhkYXkgUGFydHknLFxyXG4gICAgICAgICAgICAgICAgc3RhcnQ6IG5ldyBEYXRlKHksIG0sIGQgKyAxLCAxOSwgMCksXHJcbiAgICAgICAgICAgICAgICBlbmQ6IG5ldyBEYXRlKHksIG0sIGQgKyAxLCAyMiwgMzApLFxyXG4gICAgICAgICAgICAgICAgYWxsRGF5OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGJhY2tncm91bmRDb2xvcjogJyMwMGE2NWEnLCAvL1N1Y2Nlc3MgKGdyZWVuKVxyXG4gICAgICAgICAgICAgICAgYm9yZGVyQ29sb3I6ICcjMDBhNjVhJyAvL1N1Y2Nlc3MgKGdyZWVuKVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0aXRsZTogJ09wZW4gR29vZ2xlJyxcclxuICAgICAgICAgICAgICAgIHN0YXJ0OiBuZXcgRGF0ZSh5LCBtLCAyOCksXHJcbiAgICAgICAgICAgICAgICBlbmQ6IG5ldyBEYXRlKHksIG0sIDI5KSxcclxuICAgICAgICAgICAgICAgIHVybDogJy8vZ29vZ2xlLmNvbS8nLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiAnIzNjOGRiYycsIC8vUHJpbWFyeSAobGlnaHQtYmx1ZSlcclxuICAgICAgICAgICAgICAgIGJvcmRlckNvbG9yOiAnIzNjOGRiYycgLy9QcmltYXJ5IChsaWdodC1ibHVlKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgXTtcclxuICAgIH1cclxufSkoKTtcclxuIiwiLy8gSlFDbG91ZFxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAkKGluaXRXb3JkQ2xvdWQpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRXb3JkQ2xvdWQoKSB7XHJcblxyXG4gICAgICAgIGlmICghJC5mbi5qUUNsb3VkKSByZXR1cm47XHJcblxyXG4gICAgICAgIC8vQ3JlYXRlIGFuIGFycmF5IG9mIHdvcmQgb2JqZWN0cywgZWFjaCByZXByZXNlbnRpbmcgYSB3b3JkIGluIHRoZSBjbG91ZFxyXG4gICAgICAgIHZhciB3b3JkX2FycmF5ID0gW1xyXG4gICAgICAgICAgICB7IHRleHQ6ICdMb3JlbScsIHdlaWdodDogMTMsIC8qbGluazogJ2h0dHA6Ly90aGVtaWNvbi5jbycqLyB9LFxyXG4gICAgICAgICAgICB7IHRleHQ6ICdJcHN1bScsIHdlaWdodDogMTAuNSB9LFxyXG4gICAgICAgICAgICB7IHRleHQ6ICdEb2xvcicsIHdlaWdodDogOS40IH0sXHJcbiAgICAgICAgICAgIHsgdGV4dDogJ1NpdCcsIHdlaWdodDogOCB9LFxyXG4gICAgICAgICAgICB7IHRleHQ6ICdBbWV0Jywgd2VpZ2h0OiA2LjIgfSxcclxuICAgICAgICAgICAgeyB0ZXh0OiAnQ29uc2VjdGV0dXInLCB3ZWlnaHQ6IDUgfSxcclxuICAgICAgICAgICAgeyB0ZXh0OiAnQWRpcGlzY2luZycsIHdlaWdodDogNSB9LFxyXG4gICAgICAgICAgICB7IHRleHQ6ICdTaXQnLCB3ZWlnaHQ6IDggfSxcclxuICAgICAgICAgICAgeyB0ZXh0OiAnQW1ldCcsIHdlaWdodDogNi4yIH0sXHJcbiAgICAgICAgICAgIHsgdGV4dDogJ0NvbnNlY3RldHVyJywgd2VpZ2h0OiA1IH0sXHJcbiAgICAgICAgICAgIHsgdGV4dDogJ0FkaXBpc2NpbmcnLCB3ZWlnaHQ6IDUgfVxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgICQoXCIjanFjbG91ZFwiKS5qUUNsb3VkKHdvcmRfYXJyYXksIHtcclxuICAgICAgICAgICAgd2lkdGg6IDI0MCxcclxuICAgICAgICAgICAgaGVpZ2h0OiAyMDAsXHJcbiAgICAgICAgICAgIHN0ZXBzOiA3XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvLyBTZWFyY2ggUmVzdWx0c1xyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAkKGluaXRTZWFyY2gpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRTZWFyY2goKSB7XHJcblxyXG4gICAgICAgIGlmICghJC5mbi5zbGlkZXIpIHJldHVybjtcclxuICAgICAgICBpZiAoISQuZm4uY2hvc2VuKSByZXR1cm47XHJcbiAgICAgICAgaWYgKCEkLmZuLmRhdGVwaWNrZXIpIHJldHVybjtcclxuXHJcbiAgICAgICAgLy8gQk9PVFNUUkFQIFNMSURFUiBDVFJMXHJcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAgICAgJCgnW2RhdGEtdWktc2xpZGVyXScpLnNsaWRlcigpO1xyXG5cclxuICAgICAgICAvLyBDSE9TRU5cclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgICAgICAkKCcuY2hvc2VuLXNlbGVjdCcpLmNob3NlbigpO1xyXG5cclxuICAgICAgICAvLyBEQVRFVElNRVBJQ0tFUlxyXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgICAgICQoJyNkYXRldGltZXBpY2tlcicpLmRhdGVwaWNrZXIoe1xyXG4gICAgICAgICAgICBvcmllbnRhdGlvbjogJ2JvdHRvbScsXHJcbiAgICAgICAgICAgIGljb25zOiB7XHJcbiAgICAgICAgICAgICAgICB0aW1lOiAnZmEgZmEtY2xvY2stbycsXHJcbiAgICAgICAgICAgICAgICBkYXRlOiAnZmEgZmEtY2FsZW5kYXInLFxyXG4gICAgICAgICAgICAgICAgdXA6ICdmYSBmYS1jaGV2cm9uLXVwJyxcclxuICAgICAgICAgICAgICAgIGRvd246ICdmYSBmYS1jaGV2cm9uLWRvd24nLFxyXG4gICAgICAgICAgICAgICAgcHJldmlvdXM6ICdmYSBmYS1jaGV2cm9uLWxlZnQnLFxyXG4gICAgICAgICAgICAgICAgbmV4dDogJ2ZhIGZhLWNoZXZyb24tcmlnaHQnLFxyXG4gICAgICAgICAgICAgICAgdG9kYXk6ICdmYSBmYS1jcm9zc2hhaXJzJyxcclxuICAgICAgICAgICAgICAgIGNsZWFyOiAnZmEgZmEtdHJhc2gnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9XHJcblxyXG59KSgpOyIsIi8vIENvbG9yIHBpY2tlclxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICQoaW5pdENvbG9yUGlja2VyKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0Q29sb3JQaWNrZXIoKSB7XHJcblxyXG4gICAgICAgIGlmICghJC5mbi5jb2xvcnBpY2tlcikgcmV0dXJuO1xyXG5cclxuICAgICAgICAkKCcuZGVtby1jb2xvcnBpY2tlcicpLmNvbG9ycGlja2VyKCk7XHJcblxyXG4gICAgICAgICQoJyNkZW1vX3NlbGVjdG9ycycpLmNvbG9ycGlja2VyKHtcclxuICAgICAgICAgICAgY29sb3JTZWxlY3RvcnM6IHtcclxuICAgICAgICAgICAgICAgICdkZWZhdWx0JzogJyM3Nzc3NzcnLFxyXG4gICAgICAgICAgICAgICAgJ3ByaW1hcnknOiBBUFBfQ09MT1JTWydwcmltYXJ5J10sXHJcbiAgICAgICAgICAgICAgICAnc3VjY2Vzcyc6IEFQUF9DT0xPUlNbJ3N1Y2Nlc3MnXSxcclxuICAgICAgICAgICAgICAgICdpbmZvJzogQVBQX0NPTE9SU1snaW5mbyddLFxyXG4gICAgICAgICAgICAgICAgJ3dhcm5pbmcnOiBBUFBfQ09MT1JTWyd3YXJuaW5nJ10sXHJcbiAgICAgICAgICAgICAgICAnZGFuZ2VyJzogQVBQX0NPTE9SU1snZGFuZ2VyJ11cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH1cclxuXHJcbn0pKCk7IiwiLy8gRm9ybXMgRGVtb1xyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAkKGluaXRGb3Jtc0RlbW8pO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRGb3Jtc0RlbW8oKSB7XHJcblxyXG4gICAgICAgIGlmICghJC5mbi5zbGlkZXIpIHJldHVybjtcclxuICAgICAgICBpZiAoISQuZm4uY2hvc2VuKSByZXR1cm47XHJcbiAgICAgICAgaWYgKCEkLmZuLmlucHV0bWFzaykgcmV0dXJuO1xyXG4gICAgICAgIGlmICghJC5mbi5maWxlc3R5bGUpIHJldHVybjtcclxuICAgICAgICBpZiAoISQuZm4ud3lzaXd5ZykgcmV0dXJuO1xyXG4gICAgICAgIGlmICghJC5mbi5kYXRlcGlja2VyKSByZXR1cm47XHJcblxyXG4gICAgICAgIC8vIEJPT1RTVFJBUCBTTElERVIgQ1RSTFxyXG4gICAgICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4gICAgICAgICQoJ1tkYXRhLXVpLXNsaWRlcl0nKS5zbGlkZXIoKTtcclxuXHJcbiAgICAgICAgLy8gQ0hPU0VOXHJcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAgICAgJCgnLmNob3Nlbi1zZWxlY3QnKS5jaG9zZW4oKTtcclxuXHJcbiAgICAgICAgLy8gTUFTS0VEXHJcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAgICAgJCgnW2RhdGEtbWFza2VkXScpLmlucHV0bWFzaygpO1xyXG5cclxuICAgICAgICAvLyBGSUxFU1RZTEVcclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgICAgICAkKCcuZmlsZXN0eWxlJykuZmlsZXN0eWxlKCk7XHJcblxyXG4gICAgICAgIC8vIFdZU0lXWUdcclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgICAgICAkKCcud3lzaXd5ZycpLnd5c2l3eWcoKTtcclxuXHJcblxyXG4gICAgICAgIC8vIERBVEVUSU1FUElDS0VSXHJcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAgICAgJCgnI2RhdGV0aW1lcGlja2VyMScpLmRhdGVwaWNrZXIoe1xyXG4gICAgICAgICAgICBvcmllbnRhdGlvbjogJ2JvdHRvbScsXHJcbiAgICAgICAgICAgIGljb25zOiB7XHJcbiAgICAgICAgICAgICAgICB0aW1lOiAnZmEgZmEtY2xvY2stbycsXHJcbiAgICAgICAgICAgICAgICBkYXRlOiAnZmEgZmEtY2FsZW5kYXInLFxyXG4gICAgICAgICAgICAgICAgdXA6ICdmYSBmYS1jaGV2cm9uLXVwJyxcclxuICAgICAgICAgICAgICAgIGRvd246ICdmYSBmYS1jaGV2cm9uLWRvd24nLFxyXG4gICAgICAgICAgICAgICAgcHJldmlvdXM6ICdmYSBmYS1jaGV2cm9uLWxlZnQnLFxyXG4gICAgICAgICAgICAgICAgbmV4dDogJ2ZhIGZhLWNoZXZyb24tcmlnaHQnLFxyXG4gICAgICAgICAgICAgICAgdG9kYXk6ICdmYSBmYS1jcm9zc2hhaXJzJyxcclxuICAgICAgICAgICAgICAgIGNsZWFyOiAnZmEgZmEtdHJhc2gnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAvLyBvbmx5IHRpbWVcclxuICAgICAgICAkKCcjZGF0ZXRpbWVwaWNrZXIyJykuZGF0ZXBpY2tlcih7XHJcbiAgICAgICAgICAgIGZvcm1hdDogJ21tLWRkLXl5eXknXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvKio9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogTW9kdWxlOiBJbWFnZSBDcm9wcGVyXHJcbiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0qL1xyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICQoaW5pdEltYWdlQ3JvcHBlcik7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdEltYWdlQ3JvcHBlcigpIHtcclxuXHJcbiAgICAgICAgaWYgKCEkLmZuLmNyb3BwZXIpIHJldHVybjtcclxuXHJcbiAgICAgICAgdmFyICRpbWFnZSA9ICQoJy5pbWctY29udGFpbmVyID4gaW1nJyksXHJcbiAgICAgICAgICAgICRkYXRhWCA9ICQoJyNkYXRhWCcpLFxyXG4gICAgICAgICAgICAkZGF0YVkgPSAkKCcjZGF0YVknKSxcclxuICAgICAgICAgICAgJGRhdGFIZWlnaHQgPSAkKCcjZGF0YUhlaWdodCcpLFxyXG4gICAgICAgICAgICAkZGF0YVdpZHRoID0gJCgnI2RhdGFXaWR0aCcpLFxyXG4gICAgICAgICAgICAkZGF0YVJvdGF0ZSA9ICQoJyNkYXRhUm90YXRlJyksXHJcbiAgICAgICAgICAgIG9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgICAgICAvLyBkYXRhOiB7XHJcbiAgICAgICAgICAgICAgICAvLyAgIHg6IDQyMCxcclxuICAgICAgICAgICAgICAgIC8vICAgeTogNjAsXHJcbiAgICAgICAgICAgICAgICAvLyAgIHdpZHRoOiA2NDAsXHJcbiAgICAgICAgICAgICAgICAvLyAgIGhlaWdodDogMzYwXHJcbiAgICAgICAgICAgICAgICAvLyB9LFxyXG4gICAgICAgICAgICAgICAgLy8gc3RyaWN0OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIC8vIHJlc3BvbnNpdmU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgLy8gY2hlY2tJbWFnZU9yaWdpbjogZmFsc2VcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBtb2RhbDogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAvLyBndWlkZXM6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgLy8gaGlnaGxpZ2h0OiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIC8vIGJhY2tncm91bmQ6IGZhbHNlLFxyXG5cclxuICAgICAgICAgICAgICAgIC8vIGF1dG9Dcm9wOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIC8vIGF1dG9Dcm9wQXJlYTogMC41LFxyXG4gICAgICAgICAgICAgICAgLy8gZHJhZ0Nyb3A6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgLy8gbW92YWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAvLyByb3RhdGFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgLy8gem9vbWFibGU6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgLy8gdG91Y2hEcmFnWm9vbTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAvLyBtb3VzZVdoZWVsWm9vbTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAvLyBjcm9wQm94TW92YWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAvLyBjcm9wQm94UmVzaXphYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIC8vIGRvdWJsZUNsaWNrVG9nZ2xlOiBmYWxzZSxcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBtaW5DYW52YXNXaWR0aDogMzIwLFxyXG4gICAgICAgICAgICAgICAgLy8gbWluQ2FudmFzSGVpZ2h0OiAxODAsXHJcbiAgICAgICAgICAgICAgICAvLyBtaW5Dcm9wQm94V2lkdGg6IDE2MCxcclxuICAgICAgICAgICAgICAgIC8vIG1pbkNyb3BCb3hIZWlnaHQ6IDkwLFxyXG4gICAgICAgICAgICAgICAgLy8gbWluQ29udGFpbmVyV2lkdGg6IDMyMCxcclxuICAgICAgICAgICAgICAgIC8vIG1pbkNvbnRhaW5lckhlaWdodDogMTgwLFxyXG5cclxuICAgICAgICAgICAgICAgIC8vIGJ1aWxkOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgLy8gYnVpbHQ6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAvLyBkcmFnc3RhcnQ6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAvLyBkcmFnbW92ZTogbnVsbCxcclxuICAgICAgICAgICAgICAgIC8vIGRyYWdlbmQ6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAvLyB6b29taW46IG51bGwsXHJcbiAgICAgICAgICAgICAgICAvLyB6b29tb3V0OiBudWxsLFxyXG5cclxuICAgICAgICAgICAgICAgIGFzcGVjdFJhdGlvOiAxNiAvIDksXHJcbiAgICAgICAgICAgICAgICBwcmV2aWV3OiAnLmltZy1wcmV2aWV3JyxcclxuICAgICAgICAgICAgICAgIGNyb3A6IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAkZGF0YVgudmFsKE1hdGgucm91bmQoZGF0YS54KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgJGRhdGFZLnZhbChNYXRoLnJvdW5kKGRhdGEueSkpO1xyXG4gICAgICAgICAgICAgICAgICAgICRkYXRhSGVpZ2h0LnZhbChNYXRoLnJvdW5kKGRhdGEuaGVpZ2h0KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgJGRhdGFXaWR0aC52YWwoTWF0aC5yb3VuZChkYXRhLndpZHRoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgJGRhdGFSb3RhdGUudmFsKE1hdGgucm91bmQoZGF0YS5yb3RhdGUpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJGltYWdlLm9uKHtcclxuICAgICAgICAgICAgJ2J1aWxkLmNyb3BwZXInOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlLnR5cGUpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAnYnVpbHQuY3JvcHBlcic6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUudHlwZSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICdkcmFnc3RhcnQuY3JvcHBlcic6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUudHlwZSwgZS5kcmFnVHlwZSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICdkcmFnbW92ZS5jcm9wcGVyJzogZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZS50eXBlLCBlLmRyYWdUeXBlKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgJ2RyYWdlbmQuY3JvcHBlcic6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUudHlwZSwgZS5kcmFnVHlwZSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICd6b29taW4uY3JvcHBlcic6IGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUudHlwZSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICd6b29tb3V0LmNyb3BwZXInOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlLnR5cGUpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAnY2hhbmdlLmNyb3BwZXInOiBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlLnR5cGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSkuY3JvcHBlcihvcHRpb25zKTtcclxuXHJcblxyXG4gICAgICAgIC8vIE1ldGhvZHNcclxuICAgICAgICAkKGRvY3VtZW50LmJvZHkpLm9uKCdjbGljaycsICdbZGF0YS1tZXRob2RdJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gJCh0aGlzKS5kYXRhKCksXHJcbiAgICAgICAgICAgICAgICAkdGFyZ2V0LFxyXG4gICAgICAgICAgICAgICAgcmVzdWx0O1xyXG5cclxuICAgICAgICAgICAgaWYgKCEkaW1hZ2UuZGF0YSgnY3JvcHBlcicpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChkYXRhLm1ldGhvZCkge1xyXG4gICAgICAgICAgICAgICAgZGF0YSA9ICQuZXh0ZW5kKHt9LCBkYXRhKTsgLy8gQ2xvbmUgYSBuZXcgb25lXHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBkYXRhLnRhcmdldCAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAkdGFyZ2V0ID0gJChkYXRhLnRhcmdldCk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZGF0YS5vcHRpb24gPT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhLm9wdGlvbiA9IEpTT04ucGFyc2UoJHRhcmdldC52YWwoKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGUubWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gJGltYWdlLmNyb3BwZXIoZGF0YS5tZXRob2QsIGRhdGEub3B0aW9uKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5tZXRob2QgPT09ICdnZXRDcm9wcGVkQ2FudmFzJykge1xyXG4gICAgICAgICAgICAgICAgICAgICQoJyNnZXRDcm9wcGVkQ2FudmFzTW9kYWwnKS5tb2RhbCgpLmZpbmQoJy5tb2RhbC1ib2R5JykuaHRtbChyZXN1bHQpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmICgkLmlzUGxhaW5PYmplY3QocmVzdWx0KSAmJiAkdGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHRhcmdldC52YWwoSlNPTi5zdHJpbmdpZnkocmVzdWx0KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KS5vbigna2V5ZG93bicsIGZ1bmN0aW9uKGUpIHtcclxuXHJcbiAgICAgICAgICAgIGlmICghJGltYWdlLmRhdGEoJ2Nyb3BwZXInKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBzd2l0Y2ggKGUud2hpY2gpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMzc6XHJcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICRpbWFnZS5jcm9wcGVyKCdtb3ZlJywgLTEsIDApO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgMzg6XHJcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICRpbWFnZS5jcm9wcGVyKCdtb3ZlJywgMCwgLTEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG5cclxuICAgICAgICAgICAgICAgIGNhc2UgMzk6XHJcbiAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICRpbWFnZS5jcm9wcGVyKCdtb3ZlJywgMSwgMCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcblxyXG4gICAgICAgICAgICAgICAgY2FzZSA0MDpcclxuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJGltYWdlLmNyb3BwZXIoJ21vdmUnLCAwLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICB9KTtcclxuXHJcblxyXG4gICAgICAgIC8vIEltcG9ydCBpbWFnZVxyXG4gICAgICAgIHZhciAkaW5wdXRJbWFnZSA9ICQoJyNpbnB1dEltYWdlJyksXHJcbiAgICAgICAgICAgIFVSTCA9IHdpbmRvdy5VUkwgfHwgd2luZG93LndlYmtpdFVSTCxcclxuICAgICAgICAgICAgYmxvYlVSTDtcclxuXHJcbiAgICAgICAgaWYgKFVSTCkge1xyXG4gICAgICAgICAgICAkaW5wdXRJbWFnZS5jaGFuZ2UoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZmlsZXMgPSB0aGlzLmZpbGVzLFxyXG4gICAgICAgICAgICAgICAgICAgIGZpbGU7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCEkaW1hZ2UuZGF0YSgnY3JvcHBlcicpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChmaWxlcyAmJiBmaWxlcy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICBmaWxlID0gZmlsZXNbMF07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICgvXmltYWdlXFwvXFx3KyQvLnRlc3QoZmlsZS50eXBlKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBibG9iVVJMID0gVVJMLmNyZWF0ZU9iamVjdFVSTChmaWxlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGltYWdlLm9uZSgnYnVpbHQuY3JvcHBlcicsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgVVJMLnJldm9rZU9iamVjdFVSTChibG9iVVJMKTsgLy8gUmV2b2tlIHdoZW4gbG9hZCBjb21wbGV0ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KS5jcm9wcGVyKCdyZXNldCcpLmNyb3BwZXIoJ3JlcGxhY2UnLCBibG9iVVJMKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGlucHV0SW1hZ2UudmFsKCcnKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGVydCgnUGxlYXNlIGNob29zZSBhbiBpbWFnZSBmaWxlLicpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJGlucHV0SW1hZ2UucGFyZW50KCkucmVtb3ZlKCk7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLy8gT3B0aW9uc1xyXG4gICAgICAgICQoJy5kb2NzLW9wdGlvbnMgOmNoZWNrYm94Jykub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCEkaW1hZ2UuZGF0YSgnY3JvcHBlcicpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIG9wdGlvbnNbJHRoaXMudmFsKCldID0gJHRoaXMucHJvcCgnY2hlY2tlZCcpO1xyXG4gICAgICAgICAgICAkaW1hZ2UuY3JvcHBlcignZGVzdHJveScpLmNyb3BwZXIob3B0aW9ucyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG5cclxuICAgICAgICAvLyBUb29sdGlwc1xyXG4gICAgICAgICQoJ1tkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIl0nKS50b29sdGlwKCk7XHJcblxyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvLyBTZWxlY3QyXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgJChpbml0U2VsZWN0Mik7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFNlbGVjdDIoKSB7XHJcblxyXG4gICAgICAgIGlmICghJC5mbi5zZWxlY3QyKSByZXR1cm47XHJcblxyXG4gICAgICAgIC8vIFNlbGVjdCAyXHJcblxyXG4gICAgICAgICQoJyNzZWxlY3QyLTEnKS5zZWxlY3QyKHtcclxuICAgICAgICAgICAgdGhlbWU6ICdib290c3RyYXA0J1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJyNzZWxlY3QyLTInKS5zZWxlY3QyKHtcclxuICAgICAgICAgICAgdGhlbWU6ICdib290c3RyYXA0J1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJyNzZWxlY3QyLTMnKS5zZWxlY3QyKHtcclxuICAgICAgICAgICAgdGhlbWU6ICdib290c3RyYXA0J1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICQoJyNzZWxlY3QyLTQnKS5zZWxlY3QyKHtcclxuICAgICAgICAgICAgcGxhY2Vob2xkZXI6ICdTZWxlY3QgYSBzdGF0ZScsXHJcbiAgICAgICAgICAgIGFsbG93Q2xlYXI6IHRydWUsXHJcbiAgICAgICAgICAgIHRoZW1lOiAnYm9vdHN0cmFwNCdcclxuICAgICAgICB9KTtcclxuXHJcbiAgICB9XHJcblxyXG59KSgpOyIsIihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICBpZiAodHlwZW9mIERyb3B6b25lID09PSAndW5kZWZpbmVkJykgcmV0dXJuO1xyXG5cclxuICAgIC8vIFByZXZlbnQgRHJvcHpvbmUgZnJvbSBhdXRvIGRpc2NvdmVyaW5nXHJcbiAgICAvLyBUaGlzIGlzIHVzZWZ1bCB3aGVuIHlvdSB3YW50IHRvIGNyZWF0ZSB0aGVcclxuICAgIC8vIERyb3B6b25lIHByb2dyYW1tYXRpY2FsbHkgbGF0ZXJcclxuICAgIERyb3B6b25lLmF1dG9EaXNjb3ZlciA9IGZhbHNlO1xyXG5cclxuICAgICQoaW5pdERyb3B6b25lKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0RHJvcHpvbmUoKSB7XHJcblxyXG4gICAgICAgIC8vIERyb3B6b25lIHNldHRpbmdzXHJcbiAgICAgICAgdmFyIGRyb3B6b25lT3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgYXV0b1Byb2Nlc3NRdWV1ZTogZmFsc2UsXHJcbiAgICAgICAgICAgIHVwbG9hZE11bHRpcGxlOiB0cnVlLFxyXG4gICAgICAgICAgICBwYXJhbGxlbFVwbG9hZHM6IDEwMCxcclxuICAgICAgICAgICAgbWF4RmlsZXM6IDEwMCxcclxuICAgICAgICAgICAgZGljdERlZmF1bHRNZXNzYWdlOiAnPGVtIGNsYXNzPVwiZmEgZmEtdXBsb2FkIHRleHQtbXV0ZWRcIj48L2VtPjxicj5Ecm9wIGZpbGVzIGhlcmUgdG8gdXBsb2FkJywgLy8gZGVmYXVsdCBtZXNzYWdlcyBiZWZvcmUgZmlyc3QgZHJvcFxyXG4gICAgICAgICAgICBwYXJhbU5hbWU6ICdmaWxlJywgLy8gVGhlIG5hbWUgdGhhdCB3aWxsIGJlIHVzZWQgdG8gdHJhbnNmZXIgdGhlIGZpbGVcclxuICAgICAgICAgICAgbWF4RmlsZXNpemU6IDIsIC8vIE1CXHJcbiAgICAgICAgICAgIGFkZFJlbW92ZUxpbmtzOiB0cnVlLFxyXG4gICAgICAgICAgICBhY2NlcHQ6IGZ1bmN0aW9uKGZpbGUsIGRvbmUpIHtcclxuICAgICAgICAgICAgICAgIGlmIChmaWxlLm5hbWUgPT09ICdqdXN0aW5iaWViZXIuanBnJykge1xyXG4gICAgICAgICAgICAgICAgICAgIGRvbmUoJ05haGEsIHlvdSBkb250LiA6KScpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGR6SGFuZGxlciA9IHRoaXM7XHJcblxyXG4gICAgICAgICAgICAgICAgdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2J1dHRvblt0eXBlPXN1Ym1pdF0nKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgICAgICBkekhhbmRsZXIucHJvY2Vzc1F1ZXVlKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHRoaXMub24oJ2FkZGVkZmlsZScsIGZ1bmN0aW9uKGZpbGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnQWRkZWQgZmlsZTogJyArIGZpbGUubmFtZSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHRoaXMub24oJ3JlbW92ZWRmaWxlJywgZnVuY3Rpb24oZmlsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdSZW1vdmVkIGZpbGU6ICcgKyBmaWxlLm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm9uKCdzZW5kaW5nbXVsdGlwbGUnLCBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIHRoaXMub24oJ3N1Y2Nlc3NtdWx0aXBsZScsIGZ1bmN0aW9uKCAvKmZpbGVzLCByZXNwb25zZSovICkge1xyXG5cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vbignZXJyb3JtdWx0aXBsZScsIGZ1bmN0aW9uKCAvKmZpbGVzLCByZXNwb25zZSovICkge1xyXG5cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciBkcm9wem9uZUFyZWEgPSBuZXcgRHJvcHpvbmUoJyNkcm9wem9uZS1hcmVhJywgZHJvcHpvbmVPcHRpb25zKTtcclxuXHJcbiAgICB9XHJcblxyXG59KSgpOyIsIi8vIEZvcm1zIERlbW9cclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgJChpbml0V2l6YXJkKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0V2l6YXJkKCkge1xyXG5cclxuICAgICAgICBpZiAoISQuZm4udmFsaWRhdGUpIHJldHVybjtcclxuXHJcbiAgICAgICAgLy8gRk9STSBFWEFNUExFXHJcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgICAgICB2YXIgZm9ybSA9ICQoXCIjZXhhbXBsZS1mb3JtXCIpO1xyXG4gICAgICAgIGZvcm0udmFsaWRhdGUoe1xyXG4gICAgICAgICAgICBlcnJvclBsYWNlbWVudDogZnVuY3Rpb24gZXJyb3JQbGFjZW1lbnQoZXJyb3IsIGVsZW1lbnQpIHsgZWxlbWVudC5iZWZvcmUoZXJyb3IpOyB9LFxyXG4gICAgICAgICAgICBydWxlczoge1xyXG4gICAgICAgICAgICAgICAgY29uZmlybToge1xyXG4gICAgICAgICAgICAgICAgICAgIGVxdWFsVG86IFwiI3Bhc3N3b3JkXCJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGZvcm0uY2hpbGRyZW4oXCJkaXZcIikuc3RlcHMoe1xyXG4gICAgICAgICAgICBoZWFkZXJUYWc6IFwiaDRcIixcclxuICAgICAgICAgICAgYm9keVRhZzogXCJmaWVsZHNldFwiLFxyXG4gICAgICAgICAgICB0cmFuc2l0aW9uRWZmZWN0OiBcInNsaWRlTGVmdFwiLFxyXG4gICAgICAgICAgICBvblN0ZXBDaGFuZ2luZzogZnVuY3Rpb24oZXZlbnQsIGN1cnJlbnRJbmRleCwgbmV3SW5kZXgpIHtcclxuICAgICAgICAgICAgICAgIGZvcm0udmFsaWRhdGUoKS5zZXR0aW5ncy5pZ25vcmUgPSBcIjpkaXNhYmxlZCw6aGlkZGVuXCI7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZm9ybS52YWxpZCgpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbkZpbmlzaGluZzogZnVuY3Rpb24oZXZlbnQsIGN1cnJlbnRJbmRleCkge1xyXG4gICAgICAgICAgICAgICAgZm9ybS52YWxpZGF0ZSgpLnNldHRpbmdzLmlnbm9yZSA9IFwiOmRpc2FibGVkXCI7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZm9ybS52YWxpZCgpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBvbkZpbmlzaGVkOiBmdW5jdGlvbihldmVudCwgY3VycmVudEluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICBhbGVydChcIlN1Ym1pdHRlZCFcIik7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gU3VibWl0IGZvcm1cclxuICAgICAgICAgICAgICAgICQodGhpcykuc3VibWl0KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgLy8gVkVSVElDQUxcclxuICAgICAgICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuICAgICAgICAkKFwiI2V4YW1wbGUtdmVydGljYWxcIikuc3RlcHMoe1xyXG4gICAgICAgICAgICBoZWFkZXJUYWc6IFwiaDRcIixcclxuICAgICAgICAgICAgYm9keVRhZzogXCJzZWN0aW9uXCIsXHJcbiAgICAgICAgICAgIHRyYW5zaXRpb25FZmZlY3Q6IFwic2xpZGVMZWZ0XCIsXHJcbiAgICAgICAgICAgIHN0ZXBzT3JpZW50YXRpb246IFwidmVydGljYWxcIlxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH1cclxuXHJcbn0pKCk7IiwiLy8gWGVkaXRhYmxlIERlbW9cclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAkKGluaXRYRWRpdGFibGUpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRYRWRpdGFibGUoKSB7XHJcblxyXG4gICAgICAgIGlmICghJC5mbi5lZGl0YWJsZSkgcmV0dXJuXHJcblxyXG4gICAgICAgIC8vIEZvbnQgQXdlc29tZSBzdXBwb3J0XHJcbiAgICAgICAgJC5mbi5lZGl0YWJsZWZvcm0uYnV0dG9ucyA9XHJcbiAgICAgICAgICAgICc8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBjbGFzcz1cImJ0biBidG4tcHJpbWFyeSBidG4tc20gZWRpdGFibGUtc3VibWl0XCI+JyArXHJcbiAgICAgICAgICAgICc8aSBjbGFzcz1cImZhIGZhLWZ3IGZhLWNoZWNrXCI+PC9pPicgK1xyXG4gICAgICAgICAgICAnPC9idXR0b24+JyArXHJcbiAgICAgICAgICAgICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tZGVmYXVsdCBidG4tc20gZWRpdGFibGUtY2FuY2VsXCI+JyArXHJcbiAgICAgICAgICAgICc8aSBjbGFzcz1cImZhIGZhLWZ3IGZhLXRpbWVzXCI+PC9pPicgK1xyXG4gICAgICAgICAgICAnPC9idXR0b24+JztcclxuXHJcbiAgICAgICAgLy9kZWZhdWx0c1xyXG4gICAgICAgIC8vJC5mbi5lZGl0YWJsZS5kZWZhdWx0cy51cmwgPSAndXJsL3RvL3NlcnZlcic7XHJcblxyXG4gICAgICAgIC8vZW5hYmxlIC8gZGlzYWJsZVxyXG4gICAgICAgICQoJyNlbmFibGUnKS5jbGljayhmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJCgnI3VzZXIgLmVkaXRhYmxlJykuZWRpdGFibGUoJ3RvZ2dsZURpc2FibGVkJyk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vZWRpdGFibGVzXHJcbiAgICAgICAgJCgnI3VzZXJuYW1lJykuZWRpdGFibGUoe1xyXG4gICAgICAgICAgICAvLyB1cmw6ICd1cmwvdG8vc2VydmVyJyxcclxuICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxyXG4gICAgICAgICAgICBwazogMSxcclxuICAgICAgICAgICAgbmFtZTogJ3VzZXJuYW1lJyxcclxuICAgICAgICAgICAgdGl0bGU6ICdFbnRlciB1c2VybmFtZScsXHJcbiAgICAgICAgICAgIG1vZGU6ICdpbmxpbmUnXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICQoJyNmaXJzdG5hbWUnKS5lZGl0YWJsZSh7XHJcbiAgICAgICAgICAgIHZhbGlkYXRlOiBmdW5jdGlvbih2YWx1ZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCQudHJpbSh2YWx1ZSkgPT09ICcnKSByZXR1cm4gJ1RoaXMgZmllbGQgaXMgcmVxdWlyZWQnO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBtb2RlOiAnaW5saW5lJ1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkKCcjc2V4JykuZWRpdGFibGUoe1xyXG4gICAgICAgICAgICBwcmVwZW5kOiBcIm5vdCBzZWxlY3RlZFwiLFxyXG4gICAgICAgICAgICBzb3VyY2U6IFtcclxuICAgICAgICAgICAgICAgIHsgdmFsdWU6IDEsIHRleHQ6ICdNYWxlJyB9LFxyXG4gICAgICAgICAgICAgICAgeyB2YWx1ZTogMiwgdGV4dDogJ0ZlbWFsZScgfVxyXG4gICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICBkaXNwbGF5OiBmdW5jdGlvbih2YWx1ZSwgc291cmNlRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGNvbG9ycyA9IHsgXCJcIjogXCJncmF5XCIsIDE6IFwiZ3JlZW5cIiwgMjogXCJibHVlXCIgfSxcclxuICAgICAgICAgICAgICAgICAgICBlbGVtID0gJC5ncmVwKHNvdXJjZURhdGEsIGZ1bmN0aW9uKG8pIHsgcmV0dXJuIG8udmFsdWUgPT0gdmFsdWU7IH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChlbGVtLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgICQodGhpcykudGV4dChlbGVtWzBdLnRleHQpLmNzcyhcImNvbG9yXCIsIGNvbG9yc1t2YWx1ZV0pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLmVtcHR5KCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG1vZGU6ICdpbmxpbmUnXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICQoJyNzdGF0dXMnKS5lZGl0YWJsZSh7XHJcbiAgICAgICAgICAgIG1vZGU6ICdpbmxpbmUnXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICQoJyNncm91cCcpLmVkaXRhYmxlKHtcclxuICAgICAgICAgICAgc2hvd2J1dHRvbnM6IGZhbHNlLFxyXG4gICAgICAgICAgICBtb2RlOiAnaW5saW5lJ1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkKCcjZG9iJykuZWRpdGFibGUoe1xyXG4gICAgICAgICAgICBtb2RlOiAnaW5saW5lJ1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkKCcjZXZlbnQnKS5lZGl0YWJsZSh7XHJcbiAgICAgICAgICAgIHBsYWNlbWVudDogJ3JpZ2h0JyxcclxuICAgICAgICAgICAgY29tYm9kYXRlOiB7XHJcbiAgICAgICAgICAgICAgICBmaXJzdEl0ZW06ICduYW1lJ1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBtb2RlOiAnaW5saW5lJ1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkKCcjY29tbWVudHMnKS5lZGl0YWJsZSh7XHJcbiAgICAgICAgICAgIHNob3didXR0b25zOiAnYm90dG9tJyxcclxuICAgICAgICAgICAgbW9kZTogJ2lubGluZSdcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJCgnI25vdGUnKS5lZGl0YWJsZSh7XHJcbiAgICAgICAgICAgIG1vZGU6ICdpbmxpbmUnXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnI3BlbmNpbCcpLmNsaWNrKGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAkKCcjbm90ZScpLmVkaXRhYmxlKCd0b2dnbGUnKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJCgnI3VzZXIgLmVkaXRhYmxlJykub24oJ2hpZGRlbicsIGZ1bmN0aW9uKGUsIHJlYXNvbikge1xyXG4gICAgICAgICAgICBpZiAocmVhc29uID09PSAnc2F2ZScgfHwgcmVhc29uID09PSAnbm9jaGFuZ2UnKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgJG5leHQgPSAkKHRoaXMpLmNsb3Nlc3QoJ3RyJykubmV4dCgpLmZpbmQoJy5lZGl0YWJsZScpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCQoJyNhdXRvb3BlbicpLmlzKCc6Y2hlY2tlZCcpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJG5leHQuZWRpdGFibGUoJ3Nob3cnKTtcclxuICAgICAgICAgICAgICAgICAgICB9LCAzMDApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAkbmV4dC5mb2N1cygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIC8vIFRBQkxFXHJcbiAgICAgICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbiAgICAgICAgJCgnI3VzZXJzIGEnKS5lZGl0YWJsZSh7XHJcbiAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcclxuICAgICAgICAgICAgbmFtZTogJ3VzZXJuYW1lJyxcclxuICAgICAgICAgICAgdGl0bGU6ICdFbnRlciB1c2VybmFtZScsXHJcbiAgICAgICAgICAgIG1vZGU6ICdpbmxpbmUnXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvKio9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cclxuICogTW9kdWxlOiBnbWFwLmpzXHJcbiAqIEluaXQgR29vZ2xlIE1hcCBwbHVnaW5cclxuID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSovXHJcblxyXG4oZnVuY3Rpb24oKSB7XHJcbiAgICAndXNlIHN0cmljdCc7XHJcblxyXG4gICAgJChpbml0R29vZ2xlTWFwcyk7XHJcblxyXG4gICAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4gICAgLy8gTWFwIFN0eWxlIGRlZmluaXRpb25cclxuICAgIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuICAgIC8vIEdldCBtb3JlIHN0eWxlcyBmcm9tIGh0dHA6Ly9zbmF6enltYXBzLmNvbS9zdHlsZS8yOS9saWdodC1tb25vY2hyb21lXHJcbiAgICAvLyAtIEp1c3QgcmVwbGFjZSBhbmQgYXNzaWduIHRvICdNYXBTdHlsZXMnIHRoZSBuZXcgc3R5bGUgYXJyYXlcclxuICAgIHZhciBNYXBTdHlsZXMgPSBbeyBmZWF0dXJlVHlwZTogJ3dhdGVyJywgc3R5bGVyczogW3sgdmlzaWJpbGl0eTogJ29uJyB9LCB7IGNvbG9yOiAnI2JkZDFmOScgfV0gfSwgeyBmZWF0dXJlVHlwZTogJ2FsbCcsIGVsZW1lbnRUeXBlOiAnbGFiZWxzLnRleHQuZmlsbCcsIHN0eWxlcnM6IFt7IGNvbG9yOiAnIzMzNDE2NScgfV0gfSwgeyBmZWF0dXJlVHlwZTogJ2xhbmRzY2FwZScsIHN0eWxlcnM6IFt7IGNvbG9yOiAnI2U5ZWJmMScgfV0gfSwgeyBmZWF0dXJlVHlwZTogJ3JvYWQuaGlnaHdheScsIGVsZW1lbnRUeXBlOiAnZ2VvbWV0cnknLCBzdHlsZXJzOiBbeyBjb2xvcjogJyNjNWM2YzYnIH1dIH0sIHsgZmVhdHVyZVR5cGU6ICdyb2FkLmFydGVyaWFsJywgZWxlbWVudFR5cGU6ICdnZW9tZXRyeScsIHN0eWxlcnM6IFt7IGNvbG9yOiAnI2ZmZicgfV0gfSwgeyBmZWF0dXJlVHlwZTogJ3JvYWQubG9jYWwnLCBlbGVtZW50VHlwZTogJ2dlb21ldHJ5Jywgc3R5bGVyczogW3sgY29sb3I6ICcjZmZmJyB9XSB9LCB7IGZlYXR1cmVUeXBlOiAndHJhbnNpdCcsIGVsZW1lbnRUeXBlOiAnZ2VvbWV0cnknLCBzdHlsZXJzOiBbeyBjb2xvcjogJyNkOGRiZTAnIH1dIH0sIHsgZmVhdHVyZVR5cGU6ICdwb2knLCBlbGVtZW50VHlwZTogJ2dlb21ldHJ5Jywgc3R5bGVyczogW3sgY29sb3I6ICcjY2ZkNWUwJyB9XSB9LCB7IGZlYXR1cmVUeXBlOiAnYWRtaW5pc3RyYXRpdmUnLCBzdHlsZXJzOiBbeyB2aXNpYmlsaXR5OiAnb24nIH0sIHsgbGlnaHRuZXNzOiAzMyB9XSB9LCB7IGZlYXR1cmVUeXBlOiAncG9pLnBhcmsnLCBlbGVtZW50VHlwZTogJ2xhYmVscycsIHN0eWxlcnM6IFt7IHZpc2liaWxpdHk6ICdvbicgfSwgeyBsaWdodG5lc3M6IDIwIH1dIH0sIHsgZmVhdHVyZVR5cGU6ICdyb2FkJywgc3R5bGVyczogW3sgY29sb3I6ICcjZDhkYmUwJywgbGlnaHRuZXNzOiAyMCB9XSB9XTtcclxuXHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdEdvb2dsZU1hcHMoKSB7XHJcblxyXG4gICAgICAgIGlmICghJC5mbi5nTWFwKSByZXR1cm47XHJcblxyXG4gICAgICAgIHZhciBtYXBTZWxlY3RvciA9ICdbZGF0YS1nbWFwXSc7XHJcbiAgICAgICAgdmFyIGdNYXBSZWZzID0gW107XHJcblxyXG4gICAgICAgICQobWFwU2VsZWN0b3IpLmVhY2goZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgICAgICB2YXIgJHRoaXMgPSAkKHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgYWRkcmVzc2VzID0gJHRoaXMuZGF0YSgnYWRkcmVzcycpICYmICR0aGlzLmRhdGEoJ2FkZHJlc3MnKS5zcGxpdCgnOycpLFxyXG4gICAgICAgICAgICAgICAgdGl0bGVzID0gJHRoaXMuZGF0YSgndGl0bGUnKSAmJiAkdGhpcy5kYXRhKCd0aXRsZScpLnNwbGl0KCc7JyksXHJcbiAgICAgICAgICAgICAgICB6b29tID0gJHRoaXMuZGF0YSgnem9vbScpIHx8IDE0LFxyXG4gICAgICAgICAgICAgICAgbWFwdHlwZSA9ICR0aGlzLmRhdGEoJ21hcHR5cGUnKSB8fCAnUk9BRE1BUCcsIC8vIG9yICdURVJSQUlOJ1xyXG4gICAgICAgICAgICAgICAgbWFya2VycyA9IFtdO1xyXG5cclxuICAgICAgICAgICAgaWYgKGFkZHJlc3Nlcykge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgYSBpbiBhZGRyZXNzZXMpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGFkZHJlc3Nlc1thXSA9PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXJrZXJzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWRkcmVzczogYWRkcmVzc2VzW2FdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaHRtbDogKHRpdGxlcyAmJiB0aXRsZXNbYV0pIHx8ICcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9wdXA6IHRydWUgLyogQWx3YXlzIHBvcHVwICovXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgb3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgICAgICBjb250cm9sczoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYW5Db250cm9sOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB6b29tQ29udHJvbDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbWFwVHlwZUNvbnRyb2w6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjYWxlQ29udHJvbDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RyZWV0Vmlld0NvbnRyb2w6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG92ZXJ2aWV3TWFwQ29udHJvbDogdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsd2hlZWw6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgIG1hcHR5cGU6IG1hcHR5cGUsXHJcbiAgICAgICAgICAgICAgICAgICAgbWFya2VyczogbWFya2VycyxcclxuICAgICAgICAgICAgICAgICAgICB6b29tOiB6b29tXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTW9yZSBvcHRpb25zIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXJpb2VzdHJhZGEvalF1ZXJ5LWdNYXBcclxuICAgICAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICAgICAgdmFyIGdNYXAgPSAkdGhpcy5nTWFwKG9wdGlvbnMpO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciByZWYgPSBnTWFwLmRhdGEoJ2dNYXAucmVmZXJlbmNlJyk7XHJcbiAgICAgICAgICAgICAgICAvLyBzYXZlIGluIHRoZSBtYXAgcmVmZXJlbmNlcyBsaXN0XHJcbiAgICAgICAgICAgICAgICBnTWFwUmVmcy5wdXNoKHJlZik7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gc2V0IHRoZSBzdHlsZXNcclxuICAgICAgICAgICAgICAgIGlmICgkdGhpcy5kYXRhKCdzdHlsZWQnKSAhPT0gdW5kZWZpbmVkKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJlZi5zZXRPcHRpb25zKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGVzOiBNYXBTdHlsZXNcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfSk7IC8vZWFjaFxyXG5cclxuICAgIH1cclxuXHJcbn0pKCk7IiwiLy8galZlY3Rvck1hcFxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAkKGluaXRWZWN0b3JNYXApO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRWZWN0b3JNYXAoKSB7XHJcblxyXG4gICAgICAgIHZhciBlbGVtZW50ID0gJCgnW2RhdGEtdmVjdG9yLW1hcF0nKTtcclxuXHJcbiAgICAgICAgdmFyIHNlcmllc0RhdGEgPSB7XHJcbiAgICAgICAgICAgICdDQSc6IDExMTAwLCAvLyBDYW5hZGFcclxuICAgICAgICAgICAgJ0RFJzogMjUxMCwgLy8gR2VybWFueVxyXG4gICAgICAgICAgICAnRlInOiAzNzEwLCAvLyBGcmFuY2VcclxuICAgICAgICAgICAgJ0FVJzogNTcxMCwgLy8gQXVzdHJhbGlhXHJcbiAgICAgICAgICAgICdHQic6IDgzMTAsIC8vIEdyZWF0IEJyaXRhaW5cclxuICAgICAgICAgICAgJ1JVJzogOTMxMCwgLy8gUnVzc2lhXHJcbiAgICAgICAgICAgICdCUic6IDY2MTAsIC8vIEJyYXppbFxyXG4gICAgICAgICAgICAnSU4nOiA3ODEwLCAvLyBJbmRpYVxyXG4gICAgICAgICAgICAnQ04nOiA0MzEwLCAvLyBDaGluYVxyXG4gICAgICAgICAgICAnVVMnOiA4MzksIC8vIFVTQVxyXG4gICAgICAgICAgICAnU0EnOiA0MTAgLy8gU2F1ZGkgQXJhYmlhXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIG1hcmtlcnNEYXRhID0gW1xyXG4gICAgICAgICAgICB7IGxhdExuZzogWzQxLjkwLCAxMi40NV0sIG5hbWU6ICdWYXRpY2FuIENpdHknIH0sXHJcbiAgICAgICAgICAgIHsgbGF0TG5nOiBbNDMuNzMsIDcuNDFdLCBuYW1lOiAnTW9uYWNvJyB9LFxyXG4gICAgICAgICAgICB7IGxhdExuZzogWy0wLjUyLCAxNjYuOTNdLCBuYW1lOiAnTmF1cnUnIH0sXHJcbiAgICAgICAgICAgIHsgbGF0TG5nOiBbLTguNTEsIDE3OS4yMV0sIG5hbWU6ICdUdXZhbHUnIH0sXHJcbiAgICAgICAgICAgIHsgbGF0TG5nOiBbNy4xMSwgMTcxLjA2XSwgbmFtZTogJ01hcnNoYWxsIElzbGFuZHMnIH0sXHJcbiAgICAgICAgICAgIHsgbGF0TG5nOiBbMTcuMywgLTYyLjczXSwgbmFtZTogJ1NhaW50IEtpdHRzIGFuZCBOZXZpcycgfSxcclxuICAgICAgICAgICAgeyBsYXRMbmc6IFszLjIsIDczLjIyXSwgbmFtZTogJ01hbGRpdmVzJyB9LFxyXG4gICAgICAgICAgICB7IGxhdExuZzogWzM1Ljg4LCAxNC41XSwgbmFtZTogJ01hbHRhJyB9LFxyXG4gICAgICAgICAgICB7IGxhdExuZzogWzQxLjAsIC03MS4wNl0sIG5hbWU6ICdOZXcgRW5nbGFuZCcgfSxcclxuICAgICAgICAgICAgeyBsYXRMbmc6IFsxMi4wNSwgLTYxLjc1XSwgbmFtZTogJ0dyZW5hZGEnIH0sXHJcbiAgICAgICAgICAgIHsgbGF0TG5nOiBbMTMuMTYsIC01OS41NV0sIG5hbWU6ICdCYXJiYWRvcycgfSxcclxuICAgICAgICAgICAgeyBsYXRMbmc6IFsxNy4xMSwgLTYxLjg1XSwgbmFtZTogJ0FudGlndWEgYW5kIEJhcmJ1ZGEnIH0sXHJcbiAgICAgICAgICAgIHsgbGF0TG5nOiBbLTQuNjEsIDU1LjQ1XSwgbmFtZTogJ1NleWNoZWxsZXMnIH0sXHJcbiAgICAgICAgICAgIHsgbGF0TG5nOiBbNy4zNSwgMTM0LjQ2XSwgbmFtZTogJ1BhbGF1JyB9LFxyXG4gICAgICAgICAgICB7IGxhdExuZzogWzQyLjUsIDEuNTFdLCBuYW1lOiAnQW5kb3JyYScgfVxyXG4gICAgICAgIF07XHJcblxyXG4gICAgICAgIG5ldyBWZWN0b3JNYXAoZWxlbWVudCwgc2VyaWVzRGF0YSwgbWFya2Vyc0RhdGEpO1xyXG5cclxuICAgIH1cclxuXHJcbn0pKCk7IiwiLy8gSlZFQ1RPUiBNQVBcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbihmdW5jdGlvbigpIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAvLyBBbGxvdyBHbG9iYWwgYWNjZXNzXHJcbiAgICB3aW5kb3cuVmVjdG9yTWFwID0gVmVjdG9yTWFwXHJcblxyXG4gICAgdmFyIGRlZmF1bHRDb2xvcnMgPSB7XHJcbiAgICAgICAgbWFya2VyQ29sb3I6ICcjMjNiN2U1JywgLy8gdGhlIG1hcmtlciBwb2ludHNcclxuICAgICAgICBiZ0NvbG9yOiAndHJhbnNwYXJlbnQnLCAvLyB0aGUgYmFja2dyb3VuZFxyXG4gICAgICAgIHNjYWxlQ29sb3JzOiBbJyM4NzhjOWEnXSwgLy8gdGhlIGNvbG9yIG9mIHRoZSByZWdpb24gaW4gdGhlIHNlcmllXHJcbiAgICAgICAgcmVnaW9uRmlsbDogJyNiYmJlYzYnIC8vIHRoZSBiYXNlIHJlZ2lvbiBjb2xvclxyXG4gICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiBWZWN0b3JNYXAoZWxlbWVudCwgc2VyaWVzRGF0YSwgbWFya2Vyc0RhdGEpIHtcclxuXHJcbiAgICAgICAgaWYgKCFlbGVtZW50IHx8ICFlbGVtZW50Lmxlbmd0aCkgcmV0dXJuO1xyXG5cclxuICAgICAgICB2YXIgYXR0cnMgPSBlbGVtZW50LmRhdGEoKSxcclxuICAgICAgICAgICAgbWFwSGVpZ2h0ID0gYXR0cnMuaGVpZ2h0IHx8ICczMDAnLFxyXG4gICAgICAgICAgICBvcHRpb25zID0ge1xyXG4gICAgICAgICAgICAgICAgbWFya2VyQ29sb3I6IGF0dHJzLm1hcmtlckNvbG9yIHx8IGRlZmF1bHRDb2xvcnMubWFya2VyQ29sb3IsXHJcbiAgICAgICAgICAgICAgICBiZ0NvbG9yOiBhdHRycy5iZ0NvbG9yIHx8IGRlZmF1bHRDb2xvcnMuYmdDb2xvcixcclxuICAgICAgICAgICAgICAgIHNjYWxlOiBhdHRycy5zY2FsZSB8fCAxLFxyXG4gICAgICAgICAgICAgICAgc2NhbGVDb2xvcnM6IGF0dHJzLnNjYWxlQ29sb3JzIHx8IGRlZmF1bHRDb2xvcnMuc2NhbGVDb2xvcnMsXHJcbiAgICAgICAgICAgICAgICByZWdpb25GaWxsOiBhdHRycy5yZWdpb25GaWxsIHx8IGRlZmF1bHRDb2xvcnMucmVnaW9uRmlsbCxcclxuICAgICAgICAgICAgICAgIG1hcE5hbWU6IGF0dHJzLm1hcE5hbWUgfHwgJ3dvcmxkX21pbGxfZW4nXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgIGVsZW1lbnQuY3NzKCdoZWlnaHQnLCBtYXBIZWlnaHQpO1xyXG5cclxuICAgICAgICBpbml0KGVsZW1lbnQsIG9wdGlvbnMsIHNlcmllc0RhdGEsIG1hcmtlcnNEYXRhKTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaW5pdCgkZWxlbWVudCwgb3B0cywgc2VyaWVzLCBtYXJrZXJzKSB7XHJcblxyXG4gICAgICAgICAgICAkZWxlbWVudC52ZWN0b3JNYXAoe1xyXG4gICAgICAgICAgICAgICAgbWFwOiBvcHRzLm1hcE5hbWUsXHJcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kQ29sb3I6IG9wdHMuYmdDb2xvcixcclxuICAgICAgICAgICAgICAgIHpvb21NaW46IDEsXHJcbiAgICAgICAgICAgICAgICB6b29tTWF4OiA4LFxyXG4gICAgICAgICAgICAgICAgem9vbU9uU2Nyb2xsOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIHJlZ2lvblN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5pdGlhbDoge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAnZmlsbCc6IG9wdHMucmVnaW9uRmlsbCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ2ZpbGwtb3BhY2l0eSc6IDEsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdzdHJva2UnOiAnbm9uZScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdzdHJva2Utd2lkdGgnOiAxLjUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdzdHJva2Utb3BhY2l0eSc6IDFcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGhvdmVyOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdmaWxsLW9wYWNpdHknOiAwLjhcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGVkOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGw6ICdibHVlJ1xyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZWN0ZWRIb3Zlcjoge31cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBmb2N1c09uOiB7IHg6IDAuNCwgeTogMC42LCBzY2FsZTogb3B0cy5zY2FsZSB9LFxyXG4gICAgICAgICAgICAgICAgbWFya2VyU3R5bGU6IHtcclxuICAgICAgICAgICAgICAgICAgICBpbml0aWFsOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGw6IG9wdHMubWFya2VyQ29sb3IsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0cm9rZTogb3B0cy5tYXJrZXJDb2xvclxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBvblJlZ2lvbkxhYmVsU2hvdzogZnVuY3Rpb24oZSwgZWwsIGNvZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoc2VyaWVzICYmIHNlcmllc1tjb2RlXSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWwuaHRtbChlbC5odG1sKCkgKyAnOiAnICsgc2VyaWVzW2NvZGVdICsgJyB2aXNpdG9ycycpO1xyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIG1hcmtlcnM6IG1hcmtlcnMsXHJcbiAgICAgICAgICAgICAgICBzZXJpZXM6IHtcclxuICAgICAgICAgICAgICAgICAgICByZWdpb25zOiBbe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZXM6IHNlcmllcyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2NhbGU6IG9wdHMuc2NhbGVDb2xvcnMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vcm1hbGl6ZUZ1bmN0aW9uOiAncG9seW5vbWlhbCdcclxuICAgICAgICAgICAgICAgICAgICB9XVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIH0gLy8gZW5kIGluaXRcclxuICAgIH07XHJcblxyXG59KSgpOyIsIi8qKlxyXG4gKiBVc2VkIGZvciB1c2VyIHBhZ2VzXHJcbiAqIExvZ2luIGFuZCBSZWdpc3RlclxyXG4gKi9cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICQoaW5pdFBhcnNsZXlGb3JQYWdlcylcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0UGFyc2xleUZvclBhZ2VzKCkge1xyXG5cclxuICAgICAgICAvLyBQYXJzbGV5IG9wdGlvbnMgc2V0dXAgZm9yIGJvb3RzdHJhcCB2YWxpZGF0aW9uIGNsYXNzZXNcclxuICAgICAgICB2YXIgcGFyc2xleU9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIGVycm9yQ2xhc3M6ICdpcy1pbnZhbGlkJyxcclxuICAgICAgICAgICAgc3VjY2Vzc0NsYXNzOiAnaXMtdmFsaWQnLFxyXG4gICAgICAgICAgICBjbGFzc0hhbmRsZXI6IGZ1bmN0aW9uKFBhcnNsZXlGaWVsZCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGVsID0gUGFyc2xleUZpZWxkLiRlbGVtZW50LnBhcmVudHMoJy5mb3JtLWdyb3VwJykuZmluZCgnaW5wdXQnKTtcclxuICAgICAgICAgICAgICAgIGlmICghZWwubGVuZ3RoKSAvLyBzdXBwb3J0IGN1c3RvbSBjaGVja2JveFxyXG4gICAgICAgICAgICAgICAgICAgIGVsID0gUGFyc2xleUZpZWxkLiRlbGVtZW50LnBhcmVudHMoJy5jLWNoZWNrYm94JykuZmluZCgnbGFiZWwnKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBlbDtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZXJyb3JzQ29udGFpbmVyOiBmdW5jdGlvbihQYXJzbGV5RmllbGQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBQYXJzbGV5RmllbGQuJGVsZW1lbnQucGFyZW50cygnLmZvcm0tZ3JvdXAnKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZXJyb3JzV3JhcHBlcjogJzxkaXYgY2xhc3M9XCJ0ZXh0LWhlbHBcIj4nLFxyXG4gICAgICAgICAgICBlcnJvclRlbXBsYXRlOiAnPGRpdj48L2Rpdj4nXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy8gTG9naW4gZm9ybSB2YWxpZGF0aW9uIHdpdGggUGFyc2xleVxyXG4gICAgICAgIHZhciBsb2dpbkZvcm0gPSAkKFwiI2xvZ2luRm9ybVwiKTtcclxuICAgICAgICBpZiAobG9naW5Gb3JtLmxlbmd0aClcclxuICAgICAgICAgICAgbG9naW5Gb3JtLnBhcnNsZXkocGFyc2xleU9wdGlvbnMpO1xyXG5cclxuICAgICAgICAvLyBSZWdpc3RlciBmb3JtIHZhbGlkYXRpb24gd2l0aCBQYXJzbGV5XHJcbiAgICAgICAgdmFyIHJlZ2lzdGVyRm9ybSA9ICQoXCIjcmVnaXN0ZXJGb3JtXCIpO1xyXG4gICAgICAgIGlmIChyZWdpc3RlckZvcm0ubGVuZ3RoKVxyXG4gICAgICAgICAgICByZWdpc3RlckZvcm0ucGFyc2xleShwYXJzbGV5T3B0aW9ucyk7XHJcblxyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvLyBCT09UR1JJRFxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICQoaW5pdEJvb3RncmlkKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0Qm9vdGdyaWQoKSB7XHJcblxyXG4gICAgICAgIGlmICghJC5mbi5ib290Z3JpZCkgcmV0dXJuO1xyXG5cclxuICAgICAgICAkKCcjYm9vdGdyaWQtYmFzaWMnKS5ib290Z3JpZCh7XHJcbiAgICAgICAgICAgIHRlbXBsYXRlczoge1xyXG4gICAgICAgICAgICAgICAgLy8gdGVtcGxhdGVzIGZvciBCUzRcclxuICAgICAgICAgICAgICAgIGFjdGlvbkJ1dHRvbjogJzxidXR0b24gY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeVwiIHR5cGU9XCJidXR0b25cIiB0aXRsZT1cInt7Y3R4LnRleHR9fVwiPnt7Y3R4LmNvbnRlbnR9fTwvYnV0dG9uPicsXHJcbiAgICAgICAgICAgICAgICBhY3Rpb25Ecm9wRG93bjogJzxkaXYgY2xhc3M9XCJ7e2Nzcy5kcm9wRG93bk1lbnV9fVwiPjxidXR0b24gY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeSBkcm9wZG93bi10b2dnbGUgZHJvcGRvd24tdG9nZ2xlLW5vY2FyZXRcIiB0eXBlPVwiYnV0dG9uXCIgZGF0YS10b2dnbGU9XCJkcm9wZG93blwiPjxzcGFuIGNsYXNzPVwie3tjc3MuZHJvcERvd25NZW51VGV4dH19XCI+e3tjdHguY29udGVudH19PC9zcGFuPjwvYnV0dG9uPjx1bCBjbGFzcz1cInt7Y3NzLmRyb3BEb3duTWVudUl0ZW1zfX1cIiByb2xlPVwibWVudVwiPjwvdWw+PC9kaXY+JyxcclxuICAgICAgICAgICAgICAgIGFjdGlvbkRyb3BEb3duSXRlbTogJzxsaSBjbGFzcz1cImRyb3Bkb3duLWl0ZW1cIj48YSBocmVmPVwiXCIgZGF0YS1hY3Rpb249XCJ7e2N0eC5hY3Rpb259fVwiIGNsYXNzPVwiZHJvcGRvd24tbGluayB7e2Nzcy5kcm9wRG93bkl0ZW1CdXR0b259fVwiPnt7Y3R4LnRleHR9fTwvYT48L2xpPicsXHJcbiAgICAgICAgICAgICAgICBhY3Rpb25Ecm9wRG93bkNoZWNrYm94SXRlbTogJzxsaSBjbGFzcz1cImRyb3Bkb3duLWl0ZW1cIj48bGFiZWwgY2xhc3M9XCJkcm9wZG93bi1pdGVtIHAtMFwiPjxpbnB1dCBuYW1lPVwie3tjdHgubmFtZX19XCIgdHlwZT1cImNoZWNrYm94XCIgdmFsdWU9XCIxXCIgY2xhc3M9XCJ7e2Nzcy5kcm9wRG93bkl0ZW1DaGVja2JveH19XCIge3tjdHguY2hlY2tlZH19IC8+IHt7Y3R4LmxhYmVsfX08L2xhYmVsPjwvbGk+JyxcclxuICAgICAgICAgICAgICAgIHBhZ2luYXRpb25JdGVtOiAnPGxpIGNsYXNzPVwicGFnZS1pdGVtIHt7Y3R4LmNzc319XCI+PGEgaHJlZj1cIlwiIGRhdGEtcGFnZT1cInt7Y3R4LnBhZ2V9fVwiIGNsYXNzPVwicGFnZS1saW5rIHt7Y3NzLnBhZ2luYXRpb25CdXR0b259fVwiPnt7Y3R4LnRleHR9fTwvYT48L2xpPicsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgJCgnI2Jvb3RncmlkLXNlbGVjdGlvbicpLmJvb3RncmlkKHtcclxuICAgICAgICAgICAgc2VsZWN0aW9uOiB0cnVlLFxyXG4gICAgICAgICAgICBtdWx0aVNlbGVjdDogdHJ1ZSxcclxuICAgICAgICAgICAgcm93U2VsZWN0OiB0cnVlLFxyXG4gICAgICAgICAgICBrZWVwU2VsZWN0aW9uOiB0cnVlLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZXM6IHtcclxuICAgICAgICAgICAgICAgIHNlbGVjdDpcclxuICAgICAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImN1c3RvbS1jb250cm9sIGN1c3RvbS1jaGVja2JveFwiPicgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgJzxpbnB1dCB0eXBlPVwie3tjdHgudHlwZX19XCIgY2xhc3M9XCJjdXN0b20tY29udHJvbC1pbnB1dCB7e2Nzcy5zZWxlY3RCb3h9fVwiIGlkPVwiY3VzdG9tQ2hlY2sxXCIgdmFsdWU9XCJ7e2N0eC52YWx1ZX19XCIge3tjdHguY2hlY2tlZH19PicgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgJzxsYWJlbCBjbGFzcz1cImN1c3RvbS1jb250cm9sLWxhYmVsXCIgZm9yPVwiY3VzdG9tQ2hlY2sxXCI+PC9sYWJlbD4nICtcclxuICAgICAgICAgICAgICAgICAgICAnPC9kaXY+J1xyXG4gICAgICAgICAgICAgICAgLFxyXG4gICAgICAgICAgICAgICAgLy8gdGVtcGxhdGVzIGZvciBCUzRcclxuICAgICAgICAgICAgICAgIGFjdGlvbkJ1dHRvbjogJzxidXR0b24gY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeVwiIHR5cGU9XCJidXR0b25cIiB0aXRsZT1cInt7Y3R4LnRleHR9fVwiPnt7Y3R4LmNvbnRlbnR9fTwvYnV0dG9uPicsXHJcbiAgICAgICAgICAgICAgICBhY3Rpb25Ecm9wRG93bjogJzxkaXYgY2xhc3M9XCJ7e2Nzcy5kcm9wRG93bk1lbnV9fVwiPjxidXR0b24gY2xhc3M9XCJidG4gYnRuLXNlY29uZGFyeSBkcm9wZG93bi10b2dnbGUgZHJvcGRvd24tdG9nZ2xlLW5vY2FyZXRcIiB0eXBlPVwiYnV0dG9uXCIgZGF0YS10b2dnbGU9XCJkcm9wZG93blwiPjxzcGFuIGNsYXNzPVwie3tjc3MuZHJvcERvd25NZW51VGV4dH19XCI+e3tjdHguY29udGVudH19PC9zcGFuPjwvYnV0dG9uPjx1bCBjbGFzcz1cInt7Y3NzLmRyb3BEb3duTWVudUl0ZW1zfX1cIiByb2xlPVwibWVudVwiPjwvdWw+PC9kaXY+JyxcclxuICAgICAgICAgICAgICAgIGFjdGlvbkRyb3BEb3duSXRlbTogJzxsaSBjbGFzcz1cImRyb3Bkb3duLWl0ZW1cIj48YSBocmVmPVwiXCIgZGF0YS1hY3Rpb249XCJ7e2N0eC5hY3Rpb259fVwiIGNsYXNzPVwiZHJvcGRvd24tbGluayB7e2Nzcy5kcm9wRG93bkl0ZW1CdXR0b259fVwiPnt7Y3R4LnRleHR9fTwvYT48L2xpPicsXHJcbiAgICAgICAgICAgICAgICBhY3Rpb25Ecm9wRG93bkNoZWNrYm94SXRlbTogJzxsaSBjbGFzcz1cImRyb3Bkb3duLWl0ZW1cIj48bGFiZWwgY2xhc3M9XCJkcm9wZG93bi1pdGVtIHAtMFwiPjxpbnB1dCBuYW1lPVwie3tjdHgubmFtZX19XCIgdHlwZT1cImNoZWNrYm94XCIgdmFsdWU9XCIxXCIgY2xhc3M9XCJ7e2Nzcy5kcm9wRG93bkl0ZW1DaGVja2JveH19XCIge3tjdHguY2hlY2tlZH19IC8+IHt7Y3R4LmxhYmVsfX08L2xhYmVsPjwvbGk+JyxcclxuICAgICAgICAgICAgICAgIHBhZ2luYXRpb25JdGVtOiAnPGxpIGNsYXNzPVwicGFnZS1pdGVtIHt7Y3R4LmNzc319XCI+PGEgaHJlZj1cIlwiIGRhdGEtcGFnZT1cInt7Y3R4LnBhZ2V9fVwiIGNsYXNzPVwicGFnZS1saW5rIHt7Y3NzLnBhZ2luYXRpb25CdXR0b259fVwiPnt7Y3R4LnRleHR9fTwvYT48L2xpPicsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdmFyIGdyaWQgPSAkKCcjYm9vdGdyaWQtY29tbWFuZCcpLmJvb3RncmlkKHtcclxuICAgICAgICAgICAgZm9ybWF0dGVyczoge1xyXG4gICAgICAgICAgICAgICAgY29tbWFuZHM6IGZ1bmN0aW9uKGNvbHVtbiwgcm93KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc20gYnRuLWluZm8gbXItMiBjb21tYW5kLWVkaXRcIiBkYXRhLXJvdy1pZD1cIicgKyByb3cuaWQgKyAnXCI+PGVtIGNsYXNzPVwiZmEgZmEtZWRpdCBmYS1md1wiPjwvZW0+PC9idXR0b24+JyArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICc8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzcz1cImJ0biBidG4tc20gYnRuLWRhbmdlciBjb21tYW5kLWRlbGV0ZVwiIGRhdGEtcm93LWlkPVwiJyArIHJvdy5pZCArICdcIj48ZW0gY2xhc3M9XCJmYSBmYS10cmFzaCBmYS1md1wiPjwvZW0+PC9idXR0b24+JztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdGVtcGxhdGVzOiB7XHJcbiAgICAgICAgICAgICAgICAvLyB0ZW1wbGF0ZXMgZm9yIEJTNFxyXG4gICAgICAgICAgICAgICAgYWN0aW9uQnV0dG9uOiAnPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5XCIgdHlwZT1cImJ1dHRvblwiIHRpdGxlPVwie3tjdHgudGV4dH19XCI+e3tjdHguY29udGVudH19PC9idXR0b24+JyxcclxuICAgICAgICAgICAgICAgIGFjdGlvbkRyb3BEb3duOiAnPGRpdiBjbGFzcz1cInt7Y3NzLmRyb3BEb3duTWVudX19XCI+PGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tc2Vjb25kYXJ5IGRyb3Bkb3duLXRvZ2dsZSBkcm9wZG93bi10b2dnbGUtbm9jYXJldFwiIHR5cGU9XCJidXR0b25cIiBkYXRhLXRvZ2dsZT1cImRyb3Bkb3duXCI+PHNwYW4gY2xhc3M9XCJ7e2Nzcy5kcm9wRG93bk1lbnVUZXh0fX1cIj57e2N0eC5jb250ZW50fX08L3NwYW4+PC9idXR0b24+PHVsIGNsYXNzPVwie3tjc3MuZHJvcERvd25NZW51SXRlbXN9fVwiIHJvbGU9XCJtZW51XCI+PC91bD48L2Rpdj4nLFxyXG4gICAgICAgICAgICAgICAgYWN0aW9uRHJvcERvd25JdGVtOiAnPGxpIGNsYXNzPVwiZHJvcGRvd24taXRlbVwiPjxhIGhyZWY9XCJcIiBkYXRhLWFjdGlvbj1cInt7Y3R4LmFjdGlvbn19XCIgY2xhc3M9XCJkcm9wZG93bi1saW5rIHt7Y3NzLmRyb3BEb3duSXRlbUJ1dHRvbn19XCI+e3tjdHgudGV4dH19PC9hPjwvbGk+JyxcclxuICAgICAgICAgICAgICAgIGFjdGlvbkRyb3BEb3duQ2hlY2tib3hJdGVtOiAnPGxpIGNsYXNzPVwiZHJvcGRvd24taXRlbVwiPjxsYWJlbCBjbGFzcz1cImRyb3Bkb3duLWl0ZW0gcC0wXCI+PGlucHV0IG5hbWU9XCJ7e2N0eC5uYW1lfX1cIiB0eXBlPVwiY2hlY2tib3hcIiB2YWx1ZT1cIjFcIiBjbGFzcz1cInt7Y3NzLmRyb3BEb3duSXRlbUNoZWNrYm94fX1cIiB7e2N0eC5jaGVja2VkfX0gLz4ge3tjdHgubGFiZWx9fTwvbGFiZWw+PC9saT4nLFxyXG4gICAgICAgICAgICAgICAgcGFnaW5hdGlvbkl0ZW06ICc8bGkgY2xhc3M9XCJwYWdlLWl0ZW0ge3tjdHguY3NzfX1cIj48YSBocmVmPVwiXCIgZGF0YS1wYWdlPVwie3tjdHgucGFnZX19XCIgY2xhc3M9XCJwYWdlLWxpbmsge3tjc3MucGFnaW5hdGlvbkJ1dHRvbn19XCI+e3tjdHgudGV4dH19PC9hPjwvbGk+JyxcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pLm9uKCdsb2FkZWQucnMuanF1ZXJ5LmJvb3RncmlkJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIC8qIEV4ZWN1dGVzIGFmdGVyIGRhdGEgaXMgbG9hZGVkIGFuZCByZW5kZXJlZCAqL1xyXG4gICAgICAgICAgICBncmlkLmZpbmQoJy5jb21tYW5kLWVkaXQnKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdZb3UgcHJlc3NlZCBlZGl0IG9uIHJvdzogJyArICQodGhpcykuZGF0YSgncm93LWlkJykpO1xyXG4gICAgICAgICAgICB9KS5lbmQoKS5maW5kKCcuY29tbWFuZC1kZWxldGUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdZb3UgcHJlc3NlZCBkZWxldGUgb24gcm93OiAnICsgJCh0aGlzKS5kYXRhKCdyb3ctaWQnKSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgIH1cclxuXHJcbn0pKCk7IiwiLy8gREFUQVRBQkxFU1xyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICQoaW5pdERhdGF0YWJsZXMpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXREYXRhdGFibGVzKCkge1xyXG5cclxuICAgICAgICBpZiAoISQuZm4uRGF0YVRhYmxlKSByZXR1cm47XHJcblxyXG4gICAgICAgIC8vIFplcm8gY29uZmlndXJhdGlvblxyXG5cclxuICAgICAgICAkKCcjZGF0YXRhYmxlMScpLkRhdGFUYWJsZSh7XHJcbiAgICAgICAgICAgICdwYWdpbmcnOiB0cnVlLCAvLyBUYWJsZSBwYWdpbmF0aW9uXHJcbiAgICAgICAgICAgICdvcmRlcmluZyc6IHRydWUsIC8vIENvbHVtbiBvcmRlcmluZ1xyXG4gICAgICAgICAgICAnaW5mbyc6IHRydWUsIC8vIEJvdHRvbSBsZWZ0IHN0YXR1cyB0ZXh0XHJcbiAgICAgICAgICAgIHJlc3BvbnNpdmU6IHRydWUsXHJcbiAgICAgICAgICAgIC8vIFRleHQgdHJhbnNsYXRpb24gb3B0aW9uc1xyXG4gICAgICAgICAgICAvLyBOb3RlIHRoZSByZXF1aXJlZCBrZXl3b3JkcyBiZXR3ZWVuIHVuZGVyc2NvcmVzIChlLmcgX01FTlVfKVxyXG4gICAgICAgICAgICBvTGFuZ3VhZ2U6IHtcclxuICAgICAgICAgICAgICAgIHNTZWFyY2g6ICc8ZW0gY2xhc3M9XCJmYXMgZmEtc2VhcmNoXCI+PC9lbT4nLFxyXG4gICAgICAgICAgICAgICAgc0xlbmd0aE1lbnU6ICdfTUVOVV8gcmVjb3JkcyBwZXIgcGFnZScsXHJcbiAgICAgICAgICAgICAgICBpbmZvOiAnU2hvd2luZyBwYWdlIF9QQUdFXyBvZiBfUEFHRVNfJyxcclxuICAgICAgICAgICAgICAgIHplcm9SZWNvcmRzOiAnTm90aGluZyBmb3VuZCAtIHNvcnJ5JyxcclxuICAgICAgICAgICAgICAgIGluZm9FbXB0eTogJ05vIHJlY29yZHMgYXZhaWxhYmxlJyxcclxuICAgICAgICAgICAgICAgIGluZm9GaWx0ZXJlZDogJyhmaWx0ZXJlZCBmcm9tIF9NQVhfIHRvdGFsIHJlY29yZHMpJyxcclxuICAgICAgICAgICAgICAgIG9QYWdpbmF0ZToge1xyXG4gICAgICAgICAgICAgICAgICAgIHNOZXh0OiAnPGVtIGNsYXNzPVwiZmEgZmEtY2FyZXQtcmlnaHRcIj48L2VtPicsXHJcbiAgICAgICAgICAgICAgICAgICAgc1ByZXZpb3VzOiAnPGVtIGNsYXNzPVwiZmEgZmEtY2FyZXQtbGVmdFwiPjwvZW0+J1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG5cclxuICAgICAgICAvLyBGaWx0ZXJcclxuXHJcbiAgICAgICAgJCgnI2RhdGF0YWJsZTInKS5EYXRhVGFibGUoe1xyXG4gICAgICAgICAgICAncGFnaW5nJzogdHJ1ZSwgLy8gVGFibGUgcGFnaW5hdGlvblxyXG4gICAgICAgICAgICAnb3JkZXJpbmcnOiB0cnVlLCAvLyBDb2x1bW4gb3JkZXJpbmdcclxuICAgICAgICAgICAgJ2luZm8nOiB0cnVlLCAvLyBCb3R0b20gbGVmdCBzdGF0dXMgdGV4dFxyXG4gICAgICAgICAgICByZXNwb25zaXZlOiB0cnVlLFxyXG4gICAgICAgICAgICAvLyBUZXh0IHRyYW5zbGF0aW9uIG9wdGlvbnNcclxuICAgICAgICAgICAgLy8gTm90ZSB0aGUgcmVxdWlyZWQga2V5d29yZHMgYmV0d2VlbiB1bmRlcnNjb3JlcyAoZS5nIF9NRU5VXylcclxuICAgICAgICAgICAgb0xhbmd1YWdlOiB7XHJcbiAgICAgICAgICAgICAgICBzU2VhcmNoOiAnU2VhcmNoIGFsbCBjb2x1bW5zOicsXHJcbiAgICAgICAgICAgICAgICBzTGVuZ3RoTWVudTogJ19NRU5VXyByZWNvcmRzIHBlciBwYWdlJyxcclxuICAgICAgICAgICAgICAgIGluZm86ICdTaG93aW5nIHBhZ2UgX1BBR0VfIG9mIF9QQUdFU18nLFxyXG4gICAgICAgICAgICAgICAgemVyb1JlY29yZHM6ICdOb3RoaW5nIGZvdW5kIC0gc29ycnknLFxyXG4gICAgICAgICAgICAgICAgaW5mb0VtcHR5OiAnTm8gcmVjb3JkcyBhdmFpbGFibGUnLFxyXG4gICAgICAgICAgICAgICAgaW5mb0ZpbHRlcmVkOiAnKGZpbHRlcmVkIGZyb20gX01BWF8gdG90YWwgcmVjb3JkcyknLFxyXG4gICAgICAgICAgICAgICAgb1BhZ2luYXRlOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc05leHQ6ICc8ZW0gY2xhc3M9XCJmYSBmYS1jYXJldC1yaWdodFwiPjwvZW0+JyxcclxuICAgICAgICAgICAgICAgICAgICBzUHJldmlvdXM6ICc8ZW0gY2xhc3M9XCJmYSBmYS1jYXJldC1sZWZ0XCI+PC9lbT4nXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIC8vIERhdGF0YWJsZSBCdXR0b25zIHNldHVwXHJcbiAgICAgICAgICAgIGRvbTogJ0JmcnRpcCcsXHJcbiAgICAgICAgICAgIGJ1dHRvbnM6IFtcclxuICAgICAgICAgICAgICAgIHsgZXh0ZW5kOiAnY29weScsIGNsYXNzTmFtZTogJ2J0bi1pbmZvJyB9LFxyXG4gICAgICAgICAgICAgICAgeyBleHRlbmQ6ICdjc3YnLCBjbGFzc05hbWU6ICdidG4taW5mbycgfSxcclxuICAgICAgICAgICAgICAgIHsgZXh0ZW5kOiAnZXhjZWwnLCBjbGFzc05hbWU6ICdidG4taW5mbycsIHRpdGxlOiAnWExTLUZpbGUnIH0sXHJcbiAgICAgICAgICAgICAgICB7IGV4dGVuZDogJ3BkZicsIGNsYXNzTmFtZTogJ2J0bi1pbmZvJywgdGl0bGU6ICQoJ3RpdGxlJykudGV4dCgpIH0sXHJcbiAgICAgICAgICAgICAgICB7IGV4dGVuZDogJ3ByaW50JywgY2xhc3NOYW1lOiAnYnRuLWluZm8nIH1cclxuICAgICAgICAgICAgXVxyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICAkKCcjZGF0YXRhYmxlMycpLkRhdGFUYWJsZSh7XHJcbiAgICAgICAgICAgICdwYWdpbmcnOiB0cnVlLCAvLyBUYWJsZSBwYWdpbmF0aW9uXHJcbiAgICAgICAgICAgICdvcmRlcmluZyc6IHRydWUsIC8vIENvbHVtbiBvcmRlcmluZ1xyXG4gICAgICAgICAgICAnaW5mbyc6IHRydWUsIC8vIEJvdHRvbSBsZWZ0IHN0YXR1cyB0ZXh0XHJcbiAgICAgICAgICAgIHJlc3BvbnNpdmU6IHRydWUsXHJcbiAgICAgICAgICAgIC8vIFRleHQgdHJhbnNsYXRpb24gb3B0aW9uc1xyXG4gICAgICAgICAgICAvLyBOb3RlIHRoZSByZXF1aXJlZCBrZXl3b3JkcyBiZXR3ZWVuIHVuZGVyc2NvcmVzIChlLmcgX01FTlVfKVxyXG4gICAgICAgICAgICBvTGFuZ3VhZ2U6IHtcclxuICAgICAgICAgICAgICAgIHNTZWFyY2g6ICdTZWFyY2ggYWxsIGNvbHVtbnM6JyxcclxuICAgICAgICAgICAgICAgIHNMZW5ndGhNZW51OiAnX01FTlVfIHJlY29yZHMgcGVyIHBhZ2UnLFxyXG4gICAgICAgICAgICAgICAgaW5mbzogJ1Nob3dpbmcgcGFnZSBfUEFHRV8gb2YgX1BBR0VTXycsXHJcbiAgICAgICAgICAgICAgICB6ZXJvUmVjb3JkczogJ05vdGhpbmcgZm91bmQgLSBzb3JyeScsXHJcbiAgICAgICAgICAgICAgICBpbmZvRW1wdHk6ICdObyByZWNvcmRzIGF2YWlsYWJsZScsXHJcbiAgICAgICAgICAgICAgICBpbmZvRmlsdGVyZWQ6ICcoZmlsdGVyZWQgZnJvbSBfTUFYXyB0b3RhbCByZWNvcmRzKScsXHJcbiAgICAgICAgICAgICAgICBvUGFnaW5hdGU6IHtcclxuICAgICAgICAgICAgICAgICAgICBzTmV4dDogJzxlbSBjbGFzcz1cImZhIGZhLWNhcmV0LXJpZ2h0XCI+PC9lbT4nLFxyXG4gICAgICAgICAgICAgICAgICAgIHNQcmV2aW91czogJzxlbSBjbGFzcz1cImZhIGZhLWNhcmV0LWxlZnRcIj48L2VtPidcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgLy8gRGF0YXRhYmxlIGtleSBzZXR1cFxyXG4gICAgICAgICAgICBrZXlzOiB0cnVlXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgfVxyXG5cclxufSkoKTsiLCIvLyBDdXN0b20gQ29kZVxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuKGZ1bmN0aW9uKCkge1xyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuICAgICQoaW5pdEN1c3RvbSk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdEN1c3RvbSgpIHtcclxuXHJcbiAgICAgICAgLy8gY3VzdG9tIGNvZGVcclxuXHJcbiAgICB9XHJcblxyXG59KSgpOyJdfQ==
