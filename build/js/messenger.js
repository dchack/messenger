// Generated by CoffeeScript 1.3.3
(function() {
  var $, ActionMessenger, BaseView, Events, MagicMessage, Message, Messenger, spinner_template,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  $ = jQuery;

  spinner_template = '<div class="messenger-spinner">\n    <span class="messenger-spinner-side messenger-spinner-side-left">\n        <span class="messenger-spinner-fill"></span>\n    </span>\n    <span class="messenger-spinner-side messenger-spinner-side-right">\n        <span class="messenger-spinner-fill"></span>\n    </span>\n</div>';

  Events = (function() {
    var eventsShim, _ref;
    if ((_ref = window.Backbone) != null ? _ref.Events : void 0) {
      return Backbone.Events;
    }
    eventsShim = function() {
        var eventSplitter = /\s+/;

        var eventsApi = function(obj, action, name, rest) {
            if (!name) return true;
            if (typeof name === 'object') {
                for (var key in name) {
                    obj[action].apply(obj, [key, name[key]].concat(rest));
                }
            } else if (eventSplitter.test(name)) {
                var names = name.split(eventSplitter);
                for (var i = 0, l = names.length; i < l; i++) {
                    obj[action].apply(obj, [names[i]].concat(rest));
                }
            } else {
                return true;
            }
        };

        var triggerEvents = function(events, args) {
            var ev, i = -1, l = events.length;
            switch (args.length) {
            case 0: while (++i < l) (ev = events[i]).callback.call(ev.ctx);
            return;
            case 1: while (++i < l) (ev = events[i]).callback.call(ev.ctx, args[0]);
            return;
            case 2: while (++i < l) (ev = events[i]).callback.call(ev.ctx, args[0], args[1]);
            return;
            case 3: while (++i < l) (ev = events[i]).callback.call(ev.ctx, args[0], args[1], args[2]);
            return;
            default: while (++i < l) (ev = events[i]).callback.apply(ev.ctx, args);
            }
        };

        var Events = Backbone.Events = {

            on: function(name, callback, context) {
                if (!(eventsApi(this, 'on', name, [callback, context]) && callback)) return this;
                this._events || (this._events = {});
                var list = this._events[name] || (this._events[name] = []);
                list.push({callback: callback, context: context, ctx: context || this});
                return this;
            },

            once: function(name, callback, context) {
                if (!(eventsApi(this, 'once', name, [callback, context]) && callback)) return this;
                var self = this;
                var once = _.once(function() {
                    self.off(name, once);
                    callback.apply(this, arguments);
                });
                once._callback = callback;
                this.on(name, once, context);
                return this;
            },

            off: function(name, callback, context) {
                var list, ev, events, names, i, l, j, k;
                if (!this._events || !eventsApi(this, 'off', name, [callback, context])) return this;
                if (!name && !callback && !context) {
                    this._events = {};
                    return this;
                }

                names = name ? [name] : _.keys(this._events);
                for (i = 0, l = names.length; i < l; i++) {
                    name = names[i];
                    if (list = this._events[name]) {
                        events = [];
                        if (callback || context) {
                            for (j = 0, k = list.length; j < k; j++) {
                                ev = list[j];
                                if ((callback && callback !== ev.callback &&
                                                                 callback !== ev.callback._callback) ||
                                        (context && context !== ev.context)) {
                                    events.push(ev);
                                }
                            }
                        }
                        this._events[name] = events;
                    }
                }

                return this;
            },

            trigger: function(name) {
                if (!this._events) return this;
                var args = slice.call(arguments, 1);
                if (!eventsApi(this, 'trigger', name, args)) return this;
                var events = this._events[name];
                var allEvents = this._events.all;
                if (events) triggerEvents(events, args);
                if (allEvents) triggerEvents(allEvents, arguments);
                return this;
            },

            listenTo: function(obj, name, callback) {
                var listeners = this._listeners || (this._listeners = {});
                var id = obj._listenerId || (obj._listenerId = _.uniqueId('l'));
                listeners[id] = obj;
                obj.on(name, typeof name === 'object' ? this : callback, this);
                return this;
            },

            stopListening: function(obj, name, callback) {
                var listeners = this._listeners;
                if (!listeners) return;
                if (obj) {
                    obj.off(name, typeof name === 'object' ? this : callback, this);
                    if (!name && !callback) delete listeners[obj._listenerId];
                } else {
                    if (typeof name === 'object') callback = this;
                    for (var id in listeners) {
                        listeners[id].off(name, callback, this);
                    }
                    this._listeners = {};
                }
                return this;
            }
        };

        Events.bind   = Events.on;
        Events.unbind = Events.off;
        return Events;
    };
    return eventsShim();
  })();

  BaseView = (function() {

    function BaseView(options) {
      $.extend(this, Events);
      if (typeof options === 'object') {
        if (options.el) {
          this.setElement(options.el);
        }
        this.model = options.model;
      }
      this.initialize.apply(this, arguments);
    }

    BaseView.prototype.setElement = function(el) {
      this.$el = $(el);
      return this.el = this.$el[0];
    };

    BaseView.prototype.delegateEvents = function() {
      return console.log("delegateEvents: " + arguments);
    };

    return BaseView;

  })();

  Message = (function(_super) {

    __extends(Message, _super);

    function Message() {
      return Message.__super__.constructor.apply(this, arguments);
    }

    Message.prototype.defaults = {
      hideAfter: 10,
      scroll: true
    };

    Message.prototype.initialize = function(opts) {
      if (opts == null) {
        opts = {};
      }
      this.shown = false;
      this.rendered = false;
      this.messenger = opts.messenger;
      return this.options = $.extend({}, this.options, opts, this.defaults);
    };

    Message.prototype.show = function() {
      var wasShown;
      this.render();
      this.$message.removeClass('messenger-hidden');
      wasShown = this.shown;
      this.shown = true;
      if (!wasShown) {
        return this.trigger('show');
      }
    };

    Message.prototype.hide = function() {
      var wasShown;
      if (!this.rendered) {
        return;
      }
      this.$message.addClass('messenger-hidden');
      wasShown = this.shown;
      this.shown = false;
      if (wasShown) {
        return this.trigger('hide');
      }
    };

    Message.prototype.cancel = function() {
      return this.hide();
    };

    Message.prototype.update = function(opts) {
      var _ref,
        _this = this;
      $.extend(this.options, opts);
      this.lastUpdate = new Date();
      this.rendered = false;
      this.events = (_ref = this.options.events) != null ? _ref : {};
      this.render();
      this.actionsToEvents();
      this.delegateEvents();
      this.checkClickable();
      if (this.options.hideAfter) {
        this.$message.addClass('messenger-will-hide-after');
        if (this._hideTimeout != null) {
          clearTimeout(this._hideTimeout);
        }
        this._hideTimeout = setTimeout(function() {
          return _this.hide();
        }, this.options.hideAfter * 1000);
      } else {
        this.$message.removeClass('messenger-will-hide-after');
      }
      if (this.options.hideOnNavigate) {
        this.$message.addClass('messenger-will-hide-on-navigate');
        if (Backbone.history != null) {
          Backbone.history.on('route', function() {
            return _this.hide();
          });
        }
      } else {
        this.$message.removeClass('messenger-will-hide-on-navigate');
      }
      return this.trigger('update', this);
    };

    Message.prototype.scrollTo = function() {
      if (!this.options.scroll) {
        return;
      }
      return $.scrollTo(this.$el, {
        duration: 400,
        offset: {
          left: 0,
          top: -20
        }
      });
    };

    Message.prototype.timeSinceUpdate = function() {
      if (this.lastUpdate) {
        return (new Date) - this.lastUpdate;
      } else {
        return null;
      }
    };

    Message.prototype.actionsToEvents = function() {
      var act, name, _ref, _results;
      _ref = this.options.actions;
      _results = [];
      for (name in _ref) {
        act = _ref[name];
        _results.push(this.events["click [data-action=\"" + name + "\"] a"] = (function(act) {
          var _this = this;
          return function(e) {
            e.preventDefault();
            e.stopPropagation();
            return act.action(e);
          };
        })(act));
      }
      return _results;
    };

    Message.prototype.checkClickable = function() {
      var evt, name, _ref, _results;
      _ref = this.events;
      _results = [];
      for (name in _ref) {
        evt = _ref[name];
        if (name === 'click') {
          _results.push(this.$messenger.addClass('messenger-clickable'));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Message.prototype.undelegateEvents = function() {
      var _ref;
      Message.__super__.undelegateEvents.apply(this, arguments);
      return (_ref = this.$messenger) != null ? _ref.removeClass('messenger-clickable') : void 0;
    };

    Message.prototype.parseActions = function() {
      var act, actions, n_act, name, _ref, _ref1;
      actions = [];
      _ref = this.options.actions;
      for (name in _ref) {
        act = _ref[name];
        n_act = $.extend({}, act);
        n_act.name = name;
        if ((_ref1 = n_act.label) == null) {
          n_act.label = name;
        }
        actions.push(n_act);
      }
      return actions;
    };

    Message.prototype.template = function(opts) {
      var $action, $actions, $cancel, $link, $message, $text, action, _i, _len, _ref,
        _this = this;
      $message = $("<div class='messenger-message message alert " + opts.type + " message-" + opts.type + " alert-" + opts.type + "'>");
      if (opts.showCloseButton) {
        $cancel = $('<button type="button" class="close" data-dismiss="alert">&times;</button>');
        $cancel.click(function() {
          _this.cancel();
          return true;
        });
        $message.append($cancel);
      }
      $text = $("<div class=\"messenger-message-inner\">" + opts.message + "</div>");
      $message.append($text);
      $message.append($(spinner_template));
      if (opts.actions.length) {
        $actions = $('<div class="messenger-actions">');
      }
      _ref = opts.actions;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        action = _ref[_i];
        $action = $('<span>');
        $action.attr('data-action', "" + action.name);
        $link = $('<a>');
        $link.html(action.label);
        $action.append($('<span class="messenger-phrase">'));
        $action.append($link);
        $actions.append($action);
      }
      $message.append($actions);
      return $message;
    };

    Message.prototype.render = function() {
      var opts;
      if (this.rendered) {
        return;
      }
      if (!this._hasSlot) {
        this.setElement(this.messenger._reserveMessageSlot(this));
        this._hasSlot = true;
      }
      opts = $.extend({}, this.options, {
        actions: this.parseActions()
      });
      this.$message = $(this.template(opts));
      this.$el.html(this.$message);
      this.shown = true;
      this.rendered = true;
      return this.trigger('render');
    };

    return Message;

  })(BaseView);

  MagicMessage = (function(_super) {

    __extends(MagicMessage, _super);

    function MagicMessage() {
      return MagicMessage.__super__.constructor.apply(this, arguments);
    }

    MagicMessage.prototype.initialize = function() {
      MagicMessage.__super__.initialize.apply(this, arguments);
      return this._timers = {};
    };

    MagicMessage.prototype.cancel = function() {
      this.clearTimers();
      this.hide();
      if ((this._actionInstance != null) && (this._actionInstance.abort != null)) {
        return this._actionInstance.abort();
      }
    };

    MagicMessage.prototype.clearTimers = function() {
      var name, timer, _ref, _ref1;
      _ref = this._timers;
      for (name in _ref) {
        timer = _ref[name];
        clearTimeout(timer);
      }
      return (_ref1 = this.$message) != null ? _ref1.removeClass('messenger-retry-soon messenger-retry-later') : void 0;
    };

    MagicMessage.prototype.render = function() {
      var action, name, _ref, _results;
      MagicMessage.__super__.render.apply(this, arguments);
      this.clearTimers();
      _ref = this.options.actions;
      _results = [];
      for (name in _ref) {
        action = _ref[name];
        if (action.auto) {
          _results.push(this.startCountdown(name, action));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    MagicMessage.prototype.renderPhrase = function(action, time) {
      var phrase;
      phrase = action.phrase.replace('TIME', this.formatTime(time));
      return phrase;
    };

    MagicMessage.prototype.formatTime = function(time) {
      var pluralize;
      pluralize = function(num, str) {
        num = Math.floor(num);
        if (num !== 1) {
          str = str + 's';
        }
        return 'in ' + num + ' ' + str;
      };
      if (Math.floor(time) === 0) {
        return 'now...';
      }
      if (time < 60) {
        return pluralize(time, 'second');
      }
      time /= 60;
      if (time < 60) {
        return pluralize(time, 'minute');
      }
      time /= 60;
      return pluralize(time, 'hour');
    };

    MagicMessage.prototype.startCountdown = function(name, action) {
      var $phrase, remaining, tick, _ref,
        _this = this;
      $phrase = this.$message.find("[data-action='" + name + "'] .messenger-phrase");
      remaining = (_ref = action.delay) != null ? _ref : 3;
      if (remaining <= 10) {
        this.$message.removeClass('messenger-retry-later');
        this.$message.addClass('messenger-retry-soon');
      } else {
        this.$message.removeClass('messenger-retry-soon');
        this.$message.addClass('messenger-retry-later');
      }
      tick = function() {
        remaining -= 1;
        $phrase.text(_this.renderPhrase(action, remaining));
        if (remaining > 0) {
          return _this._timers[name] = setTimeout(tick, 1000);
        } else {
          _this.$message.removeClass('messenger-retry-soon messenger-retry-later');
          delete _this._timers[name];
          return action.action();
        }
      };
      return tick();
    };

    return MagicMessage;

  })(Message);

  Messenger = (function(_super) {

    __extends(Messenger, _super);

    function Messenger() {
      return Messenger.__super__.constructor.apply(this, arguments);
    }

    Messenger.prototype.tagName = 'ul';

    Messenger.prototype.className = 'messenger';

    Messenger.prototype.messageDefaults = {
      type: 'info'
    };

    Messenger.prototype.initialize = function(options) {
      this.options = options != null ? options : {};
      this.history = [];
      return this.messageDefaults = $.extend({}, this.messageDefaults, this.options.messageDefaults);
    };

    Messenger.prototype.render = function() {
      return this.updateMessageSlotClasses();
    };

    Messenger.prototype.findById = function(id) {
      return _.filter(this.history, function(rec) {
        return rec.msg.options.id === id;
      });
    };

    Messenger.prototype._reserveMessageSlot = function(msg) {
      var $slot, dmsg,
        _this = this;
      $slot = $('<li>');
      $slot.addClass('messenger-message-slot');
      this.$el.prepend($slot);
      this.history.push({
        msg: msg,
        $slot: $slot
      });
      this._enforceIdConstraint(msg);
      msg.on('update', function() {
        return _this._enforceIdConstraint(msg);
      });
      while (this.options.maxMessages && this.history.length > this.options.maxMessages) {
        dmsg = this.history.shift();
        dmsg.msg.remove();
        dmsg.$slot.remove();
      }
      return $slot;
    };

    Messenger.prototype._enforceIdConstraint = function(msg) {
      var entry, _i, _len, _msg, _ref;
      if (msg.options.id == null) {
        return;
      }
      _ref = this.history;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        entry = _ref[_i];
        _msg = entry.msg;
        if ((_msg.options.id != null) && _msg.options.id === msg.options.id && msg !== _msg) {
          if (msg.options.singleton) {
            msg.hide();
            return;
          } else {
            _msg.hide();
          }
        }
      }
    };

    Messenger.prototype.newMessage = function(opts) {
      var msg,
        _this = this;
      if (opts == null) {
        opts = {};
      }
      opts.messenger = this;
      msg = new MagicMessage(opts);
      msg.on('show', function() {
        if (opts.scrollTo && _this.$el.css('position') !== 'fixed') {
          return msg.scrollTo();
        }
      });
      msg.on('hide show render', this.updateMessageSlotClasses, this);
      return msg;
    };

    Messenger.prototype.updateMessageSlotClasses = function() {
      var anyShown, last, rec, willBeFirst, _i, _len, _ref;
      willBeFirst = true;
      last = null;
      anyShown = false;
      _ref = this.history;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        rec = _ref[_i];
        rec.$slot.removeClass('first last shown');
        if (rec.msg.shown && rec.msg.rendered) {
          rec.$slot.addClass('shown');
          anyShown = true;
          last = rec;
          if (willBeFirst) {
            willBeFirst = false;
            rec.$slot.addClass('first');
          }
        }
      }
      if (last != null) {
        last.$slot.addClass('last');
      }
      return this.$el["" + (anyShown ? 'remove' : 'add') + "Class"]('messenger-empty');
    };

    Messenger.prototype.hideAll = function() {
      var rec, _i, _len, _ref, _results;
      _ref = this.history;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        rec = _ref[_i];
        _results.push(rec.msg.hide());
      }
      return _results;
    };

    Messenger.prototype.post = function(opts) {
      var msg;
      if (_.isString(opts)) {
        opts = {
          message: opts
        };
      }
      opts = $.extend(true, {}, this.messageDefaults, opts);
      msg = this.newMessage(opts);
      msg.update(opts);
      return msg;
    };

    return Messenger;

  })(BaseView);

  ActionMessenger = (function(_super) {

    __extends(ActionMessenger, _super);

    function ActionMessenger() {
      return ActionMessenger.__super__.constructor.apply(this, arguments);
    }

    ActionMessenger.prototype.doDefaults = {
      progressMessage: null,
      successMessage: null,
      errorMessage: "Error connecting to the server.",
      showSuccessWithoutError: true,
      retry: {
        auto: true,
        allow: true
      },
      action: $.ajax
    };

    ActionMessenger.prototype.hookBackboneAjax = function(msgr_opts) {
      var _ajax, _old_sync,
        _this = this;
      if (msgr_opts == null) {
        msgr_opts = {};
      }
      if (!(window.Backbone != null)) {
        throw 'Expected Backbone to be defined';
      }
      msgr_opts = _.defaults(msgr_opts, {
        id: 'BACKBONE_ACTION',
        errorMessage: false,
        successMessage: "Request completed successfully.",
        showSuccessWithoutError: false
      });
      _ajax = function(opts) {
        if ($('html').hasClass('ie9-and-less')) {
          opts.cache = false;
        }
        return _this["do"](msgr_opts, opts);
      };
      if (Backbone.ajax != null) {
        return window.Backbone.ajax = _ajax;
      } else {
        _old_sync = Backbone.sync;
        return Backbone.sync = function(method, model, options) {
          var _old_ajax;
          _old_ajax = $.ajax;
          $.ajax = _ajax;
          if (options.messenger != null) {
            _.extend(msgr_opts, options.messenger);
          }
          _old_sync.call(Backbone, method, model, options);
          return $.ajax = _old_ajax;
        };
      }
    };

    ActionMessenger.prototype._getMessage = function(returnVal, def) {
      if (returnVal === false) {
        return false;
      }
      if (returnVal === true || !(returnVal != null) || typeof returnVal !== 'string') {
        return def;
      }
      return returnVal;
    };

    ActionMessenger.prototype._parseEvents = function(events) {
      var desc, firstSpace, func, label, out, type, _ref;
      if (events == null) {
        events = {};
      }
      out = {};
      for (label in events) {
        func = events[label];
        firstSpace = label.indexOf(' ');
        type = label.substring(0, firstSpace);
        desc = label.substring(firstSpace + 1);
        if ((_ref = out[type]) == null) {
          out[type] = {};
        }
        out[type][desc] = func;
      }
      return out;
    };

    ActionMessenger.prototype._normalizeResponse = function() {
      var data, elem, resp, type, xhr, _i, _len;
      resp = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      type = null;
      xhr = null;
      data = null;
      for (_i = 0, _len = resp.length; _i < _len; _i++) {
        elem = resp[_i];
        if (elem === 'success' || elem === 'timeout' || elem === 'abort') {
          type = elem;
        } else if (((elem != null ? elem.readyState : void 0) != null) && ((elem != null ? elem.responseText : void 0) != null)) {
          xhr = elem;
        } else if (_.isObject(elem)) {
          data = elem;
        }
      }
      return [type, data, xhr];
    };

    ActionMessenger.prototype["do"] = function() {
      var args, attr, events, m_opts, msg, opts, promiseAttrs, _i, _len, _ref, _ref1,
        _this = this;
      m_opts = arguments[0], opts = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
      if (opts == null) {
        opts = {};
      }
      m_opts = $.extend(true, {}, this.messageDefaults, this.doDefaults, m_opts != null ? m_opts : {});
      events = this._parseEvents(m_opts.events);
      msg = (_ref = m_opts.messageInstance) != null ? _ref : this.newMessage(m_opts);
      if (m_opts.id != null) {
        msg.options.id = m_opts.id;
      }
      if (m_opts.progressMessage != null) {
        msg.update($.extend({}, m_opts, {
          message: m_opts.progressMessage,
          type: 'info'
        }));
      }
      _.each(['error', 'success'], function(type) {
        var old, _ref1;
        old = (_ref1 = opts[type]) != null ? _ref1 : function() {};
        return opts[type] = function() {
          var data, msgOpts, msgText, r, reason, resp, xhr, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
          resp = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          _ref2 = _this._normalizeResponse.apply(_this, resp), reason = _ref2[0], data = _ref2[1], xhr = _ref2[2];
          if (type === 'success' && !(msg.errorCount != null) && m_opts.showSuccessWithoutError === false) {
            m_opts['successMessage'] = null;
          }
          if (type === 'error') {
            if ((_ref3 = m_opts.errorCount) == null) {
              m_opts.errorCount = 0;
            }
            m_opts.errorCount += 1;
          }
          msgText = _this._getMessage(r = old.apply(null, resp), m_opts[type + 'Message']);
          if (type === 'error' && ((xhr != null ? xhr.status : void 0) === 0 || reason === 'abort')) {
            msg.hide();
            return;
          }
          if (type === 'error' && ((m_opts.ignoredErrorCodes != null) && (_ref4 = xhr != null ? xhr.status : void 0, __indexOf.call(m_opts.ignoredErrorCodes, _ref4) >= 0))) {
            msg.hide();
            return;
          }
          if (msgText) {
            msgOpts = $.extend({}, m_opts, {
              message: msgText,
              type: type,
              events: (_ref5 = events[type]) != null ? _ref5 : {},
              hideOnNavigate: type === 'success'
            });
            if (type === 'error' && (xhr != null ? xhr.status : void 0) >= 500) {
              if ((_ref6 = msgOpts.retry) != null ? _ref6.allow : void 0) {
                if (msgOpts.retry.delay == null) {
                  if (msgOpts.errorCount < 4) {
                    msgOpts.retry.delay = 10;
                  } else {
                    msgOpts.retry.delay = 5 * 60;
                  }
                }
                if (msgOpts.hideAfter) {
                  if ((_ref7 = msgOpts._hideAfter) == null) {
                    msgOpts._hideAfter = msgOpts.hideAfter;
                  }
                  msgOpts.hideAfter = msgOpts._hideAfter + msgOpts.retry.delay;
                }
                msgOpts._retryActions = true;
                msgOpts.actions = {
                  retry: {
                    label: 'retry now',
                    phrase: 'Retrying TIME',
                    auto: msgOpts.retry.auto,
                    delay: msgOpts.retry.delay,
                    action: function() {
                      msgOpts.messageInstance = msg;
                      return _this["do"].apply(_this, [msgOpts, opts].concat(__slice.call(args)));
                    }
                  },
                  cancel: {
                    action: function() {
                      return msg.cancel();
                    }
                  }
                };
              }
            } else if (msgOpts._retryActions) {
              delete m_opts.actions.retry;
              delete m_opts.actions.cancel;
              delete m_opts._retryActions;
            }
            $.globalMessenger();
            msg.update(msgOpts);
            return msg.show();
          } else {
            return msg.hide();
          }
        };
      });
      msg._actionInstance = m_opts.action.apply(m_opts, [opts].concat(__slice.call(args)));
      promiseAttrs = ['done', 'progress', 'fail', 'state', 'then'];
      for (_i = 0, _len = promiseAttrs.length; _i < _len; _i++) {
        attr = promiseAttrs[_i];
        if (msg[attr] != null) {
          delete msg[attr];
        }
        msg[attr] = (_ref1 = msg._actionInstance) != null ? _ref1[attr] : void 0;
      }
      return msg;
    };

    return ActionMessenger;

  })(Messenger);

  $.fn.messenger = function() {
    var $el, args, func, instance, opts, _ref;
    func = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    if (func == null) {
      func = {};
    }
    $el = this;
    if (!(func != null) || !_.isString(func)) {
      opts = func;
      if (!($el.data('messenger') != null)) {
        $el.data('messenger', instance = new ActionMessenger($.extend({
          el: $el
        }, opts)));
        instance.render();
      }
      return $el.data('messenger');
    } else {
      return (_ref = $el.data('messenger'))[func].apply(_ref, args);
    }
  };

  $.globalMessenger = function(opts) {
    var $el, $parent, choosen_loc, chosen_loc, classes, defaultOpts, inst, loc, locations, _i, _len;
    defaultOpts = {
      extraClasses: 'messenger-fixed messenger-on-bottom messenger-on-right messenger-theme-future',
      maxMessages: 9,
      parentLocations: ['body']
    };
    opts = $.extend(defaultOpts, $._messengerDefaults, opts);
    inst = opts.instance || $._messengerInstance;
    if (opts.instance == null) {
      locations = opts.parentLocations;
      $parent = null;
      choosen_loc = null;
      for (_i = 0, _len = locations.length; _i < _len; _i++) {
        loc = locations[_i];
        $parent = $(loc);
        if ($parent.length) {
          chosen_loc = loc;
          break;
        }
      }
      if (!inst) {
        $el = $('<ul>');
        $parent.prepend($el);
        inst = $el.messenger(opts.messageDefaults);
        inst._location = chosen_loc;
        $._messengerInstance = inst;
      } else if ($(inst._location) !== $(chosen_loc)) {
        inst.$el.detach();
        $parent.prepend(inst.$el);
      }
    }
    if (inst._addedClasses != null) {
      inst.$el.removeClass(inst._addedClasses);
    }
    inst.$el.addClass(classes = "" + inst.className + " " + opts.extraClasses);
    inst._addedClasses = classes;
    return inst;
  };

}).call(this);
