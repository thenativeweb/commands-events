# commands-events

commands-events provides commands and events for DDD-based applications.

## Installation

```shell
$ npm install commands-events
```

## Quick start

First, you need to add a reference to the commands-events module. Since you will use its `Command` and `Event` constructor functions, it's most probably a good idea to reference them directly.

```javascript
const { Command, Event } = require('commands-events');
```

## Using commands

### Creating commands

If you need to create a command, call the `Command` constructor function and provide the appropriate parameters.

```javascript
const command = new Command({
  context: {
    name: 'network'
  },
  aggregate: {
    name: 'node',
    id: '85932442-bf87-472d-8b5a-b0eac3aa8be9'
  },
  name: 'ping'
});
```

Most of the times, you will want to attach data to the command. For that provide a `data` property when creating the command. If you omit the `data` property, it will be set to an empty object.

```javascript
const command = new Command({
  context: {
    name: 'network'
  },
  aggregate: {
    name: 'node',
    id: '85932442-bf87-472d-8b5a-b0eac3aa8be9'
  },
  name: 'ping',
  data: {
    ttl: 10 * 1000
  }
});
```

If, additionally, you need to add metadata to the command, specify its `custom` property. If you omit the `custom` property, it will also be set to an empty object.

```javascript
const command = new Command({
  context: {
    name: 'network'
  },
  aggregate: {
    name: 'node',
    id: '85932442-bf87-472d-8b5a-b0eac3aa8be9'
  },
  name: 'ping',
  data: {
    ttl: 10 * 1000
  },
  custom: {
    sourceIp: '127.0.0.1'
  }
});
```

In any case, the result is an object with an additional `metadata` property.

```javascript
{
  context: {
    name: 'network'
  },
  aggregate: {
    name: 'node',
    id: '85932442-bf87-472d-8b5a-b0eac3aa8be9'
  },
  name: 'ping',
  id: '4784bce1-4b7b-45a0-87e4-3058303194e6',
  data: {
    ttl: 10000
  },
  custom: {
    sourceIp: '127.0.0.1'
  },
  initiator: null,
  metadata: {
    timestamp: 1421260133331,
    correlationId: '4784bce1-4b7b-45a0-87e4-3058303194e6',
    causationId: '4784bce1-4b7b-45a0-87e4-3058303194e6'
  }
}
```

### Adding an initiator to a command

To add an initiator to a command, call the `addInitiator` function and hand over a JWT token.

```javascript
const token = getJwt();

command.addInitiator({ token });
```

Then you can access the initiator's id (which is identical to the `sub` claim) by using the `command.initiator.id` property. If you want to access the entire token use `command.initiator.token`.

Please note that until you provide an initiator, the command's `initiator` property will be `null`.

### Handling serialized commands

If you serialize and deserialize a command, all its data is kept, but its constructor and prototype are lost. To recreate them, use the `deserialize` function.

```javascript
const command = Command.deserialize(serializedCommand);
```

## Using events

### Creating events

If you need to create an event, call the `Event` constructor function and provide the appropriate parameters.

```javascript
const event = new Event({
  context: {
    name: 'network'
  },
  aggregate: {
    name: 'node',
    id: '85932442-bf87-472d-8b5a-b0eac3aa8be9'
  },
  name: 'pinged',
  metadata: {
    correlationId: '13505cab-0ca2-4502-b8c9-8f3ce63ae390',
    causationId: '124885f3-d35e-43a6-84eb-e28c70b5be66'
  }
});
```

If you want to attach data to the event, specify its `data` property. If you omit the `data` property, it will be set to an empty object.

```javascript
const event = new Event({
  context: {
    name: 'network'
  },
  aggregate: {
    name: 'node',
    id: '85932442-bf87-472d-8b5a-b0eac3aa8be9'
  },
  name: 'pinged',
  data: {
    ttl: 10 * 1000
  },
  metadata: {
    correlationId: '13505cab-0ca2-4502-b8c9-8f3ce63ae390',
    causationId: '124885f3-d35e-43a6-84eb-e28c70b5be66'
  }
});
```

By default, an event will always be a `domain` event. For other types of events, specify the event's `type` property.

```javascript
const event = new Event({
  context: {
    name: 'network'
  },
  aggregate: {
    name: 'node',
    id: '85932442-bf87-472d-8b5a-b0eac3aa8be9'
  },
  name: 'pingFailed',
  type: 'error',
  data: {
    ttl: 10 * 1000
  },
  metadata: {
    correlationId: '13505cab-0ca2-4502-b8c9-8f3ce63ae390',
    causationId: '124885f3-d35e-43a6-84eb-e28c70b5be66'
  }
});
```

If, additionally, you need to add metadata to the event, specify its `custom` property. If you omit the `custom` property, it will also be set to an empty object.

```javascript
const event = new Event({
  context: {
    name: 'network'
  },
  aggregate: {
    name: 'node',
    id: '85932442-bf87-472d-8b5a-b0eac3aa8be9'
  },
  name: 'pinged',
  data: {
    ttl: 10 * 1000
  },
  custom: {
    sourceIp: '127.0.0.1'
  },
  metadata: {
    correlationId: '13505cab-0ca2-4502-b8c9-8f3ce63ae390',
    causationId: '124885f3-d35e-43a6-84eb-e28c70b5be66'
  }
});
```

In any case, the result is an object with the following structure.

```javascript
{
  context: {
    name: 'network'
  },
  aggregate: {
    name: 'node',
    id: '85932442-bf87-472d-8b5a-b0eac3aa8be9'
  },
  name: 'pinged',
  type: 'domain',
  data: {
    ttl: 10000
  },
  initiator: null,
  metadata: {
    timestamp: 1421261012560,
    published: false,
    correlationId: '13505cab-0ca2-4502-b8c9-8f3ce63ae390',
    causationId: '124885f3-d35e-43a6-84eb-e28c70b5be66'
  }
}
```

### Adding an initiator to an event

To add an initiator to an event, call the `addInitiator` function and hand over the initiator. The initiator may be taken from a command, e.g. with `command.initiator`. It must contain an `id`.

```javascript
event.addInitiator(command.initiator);
```

Then you can access the initiator's id by using the `event.initiator.id` property.

Please note that until you provide an initiator, the event's `initiator` property will be `null`.

### Handling serialized events

If you serialize and deserialize an event, all its data is kept, but its constructor and prototype are lost. To recreate them, use the `deserialize` function.

```javascript
const event = Event.deserialize(serializedEvent);
```

## Manually creating commands and events

If, for whatever reason, you need to create a command or event manually, i.e. without the help of the constructor functions, you may use the `Command.isWellformed` and `Event.isWellformed` functions to verify whether the created object has the correct format.

```javascript
const command = { /* ... */ },
      event = { /* ... */ };

console.log(Command.isWellformed(command)); // => true
console.log(Event.isWellformed(event));     // => true
```

## Relations between commands and events

Each command and each event is identified by a unique id. It is automatically set whenever you create a new command or event, and it is accessible using the `id` property.

Since each event is caused by a command, you may want to find out by which command a given event was caused. You can do so using the event's `metadata.causationId` property which contains the causing command's `id`. The same is true for commands that were caused by an event, e.g. within a flow.

All commands and events that arise from an originating command additionally have a common id, the so-called `metadata.correlationId`. You can use this id to gather all commands and events that deal with a long-running transaction and belong together.

## Running the build

To build this module use [roboter](https://www.npmjs.com/package/roboter).

```shell
$ npx roboter
```

## License

Copyright (c) 2014-2019 the native web.

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with this program. If not, see [GNU Licenses](http://www.gnu.org/licenses/).
