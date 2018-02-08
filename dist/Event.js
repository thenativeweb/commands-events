'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var formats = require('formats'),
    uuid = require('uuidv4');

var Event = function () {
  function Event(_ref) {
    var context = _ref.context,
        aggregate = _ref.aggregate,
        name = _ref.name,
        metadata = _ref.metadata,
        _ref$type = _ref.type,
        type = _ref$type === undefined ? 'domain' : _ref$type,
        _ref$data = _ref.data,
        data = _ref$data === undefined ? {} : _ref$data,
        _ref$custom = _ref.custom,
        custom = _ref$custom === undefined ? {} : _ref$custom;

    _classCallCheck(this, Event);

    if (!formats.isObject(context)) {
      throw new Error('Context is missing.');
    }
    if (!formats.isAlphanumeric(context.name, { minLength: 1 })) {
      throw new Error('Context name is missing.');
    }
    if (!formats.isObject(aggregate)) {
      throw new Error('Aggregate is missing.');
    }
    if (!formats.isAlphanumeric(aggregate.name, { minLength: 1 })) {
      throw new Error('Aggregate name is missing.');
    }
    if (!formats.isUuid(aggregate.id)) {
      throw new Error('Aggregate id is missing.');
    }
    if (!formats.isAlphanumeric(name, { minLength: 1 })) {
      throw new Error('Event name is missing.');
    }
    if (type && !formats.isString(type, { minLength: 1 })) {
      throw new Error('Type must be a string.');
    }
    if (!formats.isObject(data, { isOptional: true, schema: {}, isSchemaRelaxed: true })) {
      throw new Error('Data must be an object.');
    }
    if (!formats.isObject(custom, { isOptional: true, schema: {}, isSchemaRelaxed: true })) {
      throw new Error('Custom must be an object.');
    }
    if (!formats.isObject(metadata)) {
      throw new Error('Metadata are missing.');
    }
    if (!formats.isUuid(metadata.correlationId)) {
      throw new Error('Correlation id is missing.');
    }
    if (!formats.isUuid(metadata.causationId)) {
      throw new Error('Causation id is missing.');
    }
    if (metadata.isAuthorized) {
      if (!formats.isObject(metadata.isAuthorized)) {
        throw new Error('Authorization must be an object.');
      }
      if (!formats.isString(metadata.isAuthorized.owner, { minLength: 1 })) {
        throw new Error('Owner is missing.');
      }
      if (!formats.isBoolean(metadata.isAuthorized.forAuthenticated)) {
        throw new Error('For authenticated is missing.');
      }
      if (!formats.isBoolean(metadata.isAuthorized.forPublic)) {
        throw new Error('For public is missing.');
      }
    }

    this.context = { name: context.name };
    this.aggregate = { name: aggregate.name, id: aggregate.id };
    this.name = name;
    this.id = uuid();
    this.type = type;

    this.data = data;
    this.custom = custom;
    this.user = null;
    this.metadata = {
      timestamp: new Date().getTime(),
      published: false,
      correlationId: metadata.correlationId,
      causationId: metadata.causationId
    };

    if (metadata.isAuthorized) {
      this.metadata.isAuthorized = metadata.isAuthorized;
    }
  }

  _createClass(Event, [{
    key: 'addUser',
    value: function addUser(user) {
      if (!user) {
        throw new Error('User is missing.');
      }
      if (!user.id) {
        throw new Error('User id is missing.');
      }

      this.user = {
        id: user.id
      };
    }
  }]);

  return Event;
}();

Event.wrap = function (_ref2) {
  var context = _ref2.context,
      aggregate = _ref2.aggregate,
      name = _ref2.name,
      id = _ref2.id,
      user = _ref2.user,
      metadata = _ref2.metadata,
      type = _ref2.type,
      data = _ref2.data,
      custom = _ref2.custom;

  var event = new Event({ context: context, aggregate: aggregate, name: name, metadata: metadata, type: type, data: data, custom: custom });

  event.id = id;
  event.metadata = metadata;

  if (user && user.id) {
    event.addUser(user);
  }

  if (!Event.isWellformed(event)) {
    throw new Error('Event is malformed.');
  }

  return event;
};

Event.isWellformed = function (event) {
  return formats.isObject(event, {
    schema: {
      context: formats.object({
        schema: {
          name: formats.alphanumeric({ minLength: 1 })
        }
      }),
      aggregate: formats.object({
        schema: {
          name: formats.alphanumeric({ minLength: 1 }),
          id: formats.uuid()
        }
      }),
      name: formats.alphanumeric({ minLength: 1 }),
      id: formats.uuid(),
      type: formats.string({ minLength: 1 }),
      data: formats.object({
        schema: {},
        isSchemaRelaxed: true
      }),
      custom: formats.object({
        schema: {},
        isSchemaRelaxed: true
      }),
      user: formats.object({
        schema: {
          id: formats.string({ minLength: 1 })
        },
        isOptional: true
      }),
      metadata: formats.object({
        isSchemaRelaxed: true,
        schema: {
          timestamp: formats.number(),
          published: formats.boolean(),
          correlationId: formats.uuid(),
          causationId: formats.uuid(),
          isAuthorized: formats.object({
            isOptional: true,
            schema: {
              owner: formats.string({ minLength: 1 }),
              forAuthenticated: formats.boolean(),
              forPublic: formats.boolean()
            },
            isSchemaRelaxed: false
          })
        }
      })
    }
  });
};

module.exports = Event;