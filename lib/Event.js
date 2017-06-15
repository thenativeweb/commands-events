'use strict';

const formats = require('formats'),
      uuid = require('uuidv4');

/* eslint-disable max-statements */
const Event = function (options) {
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
    throw new Error('Event name is missing.');
  }
  if (options.type && !formats.isString(options.type, { minLength: 1 })) {
    throw new Error('Type must be a string.');
  }
  if (!formats.isObject(options.data, { isOptional: true, schema: {}, isSchemaRelaxed: true })) {
    throw new Error('Data must be an object.');
  }
  if (!formats.isObject(options.custom, { isOptional: true, schema: {}, isSchemaRelaxed: true })) {
    throw new Error('Custom must be an object.');
  }
  if (!formats.isObject(options.metadata)) {
    throw new Error('Metadata are missing.');
  }
  if (!formats.isUuid(options.metadata.correlationId)) {
    throw new Error('Correlation id is missing.');
  }
  if (!formats.isUuid(options.metadata.causationId)) {
    throw new Error('Causation id is missing.');
  }
  if (options.metadata.isAuthorized) {
    if (!formats.isObject(options.metadata.isAuthorized)) {
      throw new Error('Authorization must be an object.');
    }
    if (!formats.isString(options.metadata.isAuthorized.owner, { minLength: 1 })) {
      throw new Error('Owner is missing.');
    }
    if (!formats.isBoolean(options.metadata.isAuthorized.forAuthenticated)) {
      throw new Error('For authenticated is missing.');
    }
    if (!formats.isBoolean(options.metadata.isAuthorized.forPublic)) {
      throw new Error('For public is missing.');
    }
  }

  this.context = { name: options.context.name };
  this.aggregate = { name: options.aggregate.name, id: options.aggregate.id };
  this.name = options.name;
  this.id = uuid();
  this.type = options.type || 'domain';

  this.data = options.data || {};
  this.custom = options.custom || {};
  this.user = null;
  this.metadata = {
    timestamp: (new Date()).getTime(),
    published: false,
    correlationId: options.metadata.correlationId,
    causationId: options.metadata.causationId
  };

  if (options.metadata.isAuthorized) {
    this.metadata.isAuthorized = options.metadata.isAuthorized;
  }
};
/* eslint-enable max-statements */

Event.wrap = function (options) {
  const event = new Event(options);

  event.id = options.id;
  event.metadata = options.metadata;

  if (options.user && options.user.id) {
    event.addUser(options.user);
  }

  if (!Event.isWellformed(event)) {
    throw new Error('Event is malformed.');
  }

  return event;
};

Event.prototype.addUser = function (user) {
  if (!user) {
    throw new Error('User is missing.');
  }
  if (!user.id) {
    throw new Error('User id is missing.');
  }

  this.user = {
    id: user.id
  };
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
