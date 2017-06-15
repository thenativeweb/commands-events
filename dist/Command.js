'use strict';

var formats = require('formats'),
    uuid = require('uuidv4');

var Command = function Command(options) {
  if (!formats.isObject(options)) {
    throw new Error('Options are missing.');
  }
  if (!formats.isObject(options.context)) {
    throw new Error('Context is missing.');
  }
  if (!formats.isAlphanumeric(options.context.name, { minLength: 1 })) {
    throw new Error('Context name is missing.');
  }
  if (!formats.isObject(options.aggregate)) {
    throw new Error('Aggregate is missing.');
  }
  if (!formats.isAlphanumeric(options.aggregate.name, { minLength: 1 })) {
    throw new Error('Aggregate name is missing.');
  }
  if (!formats.isUuid(options.aggregate.id)) {
    throw new Error('Aggregate id is missing.');
  }
  if (!formats.isAlphanumeric(options.name, { minLength: 1 })) {
    throw new Error('Command name is missing.');
  }
  if (options.data && !formats.isObject(options.data)) {
    throw new Error('Data must be an object.');
  }
  if (options.custom && !formats.isObject(options.custom)) {
    throw new Error('Custom must be an object.');
  }

  this.context = { name: options.context.name };
  this.aggregate = { name: options.aggregate.name, id: options.aggregate.id };
  this.name = options.name;
  this.id = uuid();

  this.data = options.data || {};
  this.custom = options.custom || {};
  this.user = null;
  this.metadata = {
    timestamp: Date.now(),
    correlationId: this.id,
    causationId: this.id
  };
};

Command.wrap = function (options) {
  var command = new Command(options);

  command.id = options.id;
  command.metadata.timestamp = options.metadata.timestamp;
  command.metadata.correlationId = options.metadata.correlationId;
  command.metadata.causationId = options.metadata.causationId;

  if (options.user && options.user.token) {
    command.addToken(options.user.token);
  }

  if (!Command.isWellformed(command)) {
    throw new Error('Command is malformed.');
  }

  return command;
};

Command.prototype.addToken = function (token) {
  if (!token) {
    throw new Error('Token is missing.');
  }

  this.user = {
    id: token.sub,
    token: token
  };
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