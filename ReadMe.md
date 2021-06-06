# 🔗 Nano Node RPC Client

[![npm version](https://nodei.co/npm/nano-node-rpc.png)](https://www.npmjs.com/package/nano-node-rpc)

Nano RPC client written in Javascript with no external dependencies.
It produces JSON objects or strings as output, wrapped in native promises.

All RPC calls are defined in the [Nano.org Docs](https://docs.nano.org/commands/rpc-protocol/).

## Getting Started

### Install

`npm install nano-node-rpc`

#### My Nano Ninja Node API

```js
const NanoClient = require('nano-node-rpc');
const client = new NanoClient({apiKey: process.env.NINJA_API_KEY})
```

#### Your own Nano RPC server

```js
const NanoClient = require('nano-node-rpc');
const client = new NanoClient({url: 'http://localhost:7076'})
```

### Use methods attached to `client` to send RPC calls

#### Examples

Head to the [`examples.js`](examples.js) file for even more!

```js
const client = NanoClient({url: 'http://localhost:7076'})

// Some methods do not require arguments:
client
  .block_count()
  .then(count => {
    console.log(count);
    /**
     * {
     *   "count": "1826834",
     *   "unchecked": "3385205"
     * }
     */
  })
  .catch(e => {
    // Deal with your errors here.
  });

// Some methods require arguments:
client
  .account_balance("nano_1ninja7rh37ehfp9utkor5ixmxyg8kme8fnzc4zty145ibch8kf5jwpnzr3r")
  .then(balance => {
    console.log(balance);
    /**
     * {
     *   "balance": "325586539664609129644855132177",
     *   "pending": "2309370929000000000000000000000000"
     * }
     */
  })
  .catch(e => {
    // Deal with your errors here.
  });
```

### Promise-wrapped responses

All method calls return native NodeJS promises. You need to use the
`then()` / `catch()` pattern shown above. If the call was succesful,
the data will be passed to `then()`, otherwise the error will be passed
to `catch()`.

### Methods Names

The method calls are the same as the original RPC actions defined
on the [Nano.org Docs](https://docs.nano.org/commands/rpc-protocol/).

Example1: on the Nano wiki `account_balance` is called with `account`.
For the NodeJS client, the method is `account_balance` and the argument is the account string.

If a method is not available with a method you can use the `_send` method like this:

```js
client._send('block_info', {
  "json_block": true,
  "hash": "87434F8041869A01C8F6F263B87972D7BA443A72E0A97D7A3FD0CCC2358FD6F9"
}).then(block_info => {
  console.log(block_info);
  /**
   * {
   *   "block_account": "nano_1ipx847tk8o46pwxt5qjdbncjqcbwcc1rrmqnkztrfjy5k7z4imsrata9est",
   *   "amount": "30000000000000000000000000000000000",
   *   "balance": "5606157000000000000000000000000000000",
   *   "height": "58",
   *   "local_timestamp": "0",
   *   "confirmed": "true",
   *   "contents": {
   *     ...
   *   },
   *   "subtype": "send"
   * }
   */
})
.catch(e => {
  // Deal with your errors here.
});
```
