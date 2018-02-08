'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var formats = require('formats'),
    uuid = require('uuidv4');

var Command = function () {
  function Command(_ref) {
    var context = _ref.context,
        aggregate = _ref.aggregate,
        name = _ref.name,
        _ref$data = _ref.data,
        data = _ref$data === undefined ? {} : _ref$data,
        _ref$custom = _ref.custom,
        custom = _ref$custom === undefined ? {} : _ref$custom;

    _classCallCheck(this, Command);

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
      throw new Error('Command name is missing.');
    }
    if (!formats.isObject(data)) {
      throw new Error('Data must be an object.');
    }
    if (!formats.isObject(custom)) {
      throw new Error('Custom must be an object.');
    }

    this.context = { name: context.name };
    this.aggregate = { name: aggregate.name, id: aggregate.id };
    this.name = name;
    this.id = uuid();

    this.data = data;
    this.custom = custom;
    this.user = null;
    this.metadata = {
      timestamp: Date.now(),
      correlationId: this.id,
      causationId: this.id
    };
  }

  _createClass(Command, [{
    key: 'addToken',
    value: function addToken(token) {
      if (!token) {
        throw new Error('Token is missing.');
      }

      this.user = {
        id: token.sub,
        token: token
      };
    }
  }]);

  return Command;
}();

Command.wrap = function (_ref2) {
  var context = _ref2.context,
      aggregate = _ref2.aggregate,
      name = _ref2.name,
      id = _ref2.id,
      metadata = _ref2.metadata,
      user = _ref2.user,
      _ref2$data = _ref2.data,
      data = _ref2$data === undefined ? {} : _ref2$data,
      _ref2$custom = _ref2.custom,
      custom = _ref2$custom === undefined ? {} : _ref2$custom;

  var command = new Command({ context: context, aggregate: aggregate, name: name, data: data, custom: custom });

  command.id = id;
  command.metadata.timestamp = metadata.timestamp;
  command.metadata.correlationId = metadata.correlationId;
  command.metadata.causationId = metadata.causationId;

  if (user && user.token) {
    command.addToken(user.token);
  }

  if (!Command.isWellformed(command)) {
    throw new Error('Command is malformed.');
  }

  return command;
};

Command.isWellformed = function (command) {
  return formats.isObject(command, {
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
          id: formats.string({ minLength: 1 }),
          token: formats.object({
            schema: {
              sub: formats.string({ minLength: 1 })
            },
            isSchemaRelaxed: true
          })
        },
        isOptional: true
      }),
      metadata: formats.object({
        schema: {
          timestamp: formats.number(),
          correlationId: formats.uuid(),
          causationId: formats.uuid()
        }
      })
    }
  });
};

module.exports = Command;