const net = require('net');
const { fromEvent } = require('rxjs');
const { tap, map } = require('rxjs/operators');
const { listener, setClient } = require('./listener');
const encoder = require('../encoder');
const { EVENTS } = require('./events.constants');

var client = new net.Socket();
const source = fromEvent(client, EVENTS.DATA);

client.on(EVENTS.CONNECT, () => {
  console.log('successful server connection');
  setClient(client);
  //socket.write(encoder.encrypt({ _id: socket._id }));
  //client.write(encoder.encrypt(defaultMessage));
});

const validator = (message) => {
  if (!Buffer.isBuffer(message)) {
    throw new Error('message is indefined');
  }
};

const decrypt = (message) => {
  const encrypted = message.toString();
  const data = encoder.decrypt(encrypted);
  if (!data.type) {
    throw new Error('wrong server message type');
  }
  return data;
};

const example = source.pipe(
  tap((message) => validator(message)),
  map((message) => decrypt(message)),
  map((data) => listener(data)),
);

const validMessages = (res) => {
  console.log(res);
};

const errorMessage = (err) => {
  console.log(err);
};

const subscribe = example.subscribe({
  res: (res) => validMessages(res),
  error: (err) => errorMessage(err)
});

module.exports = client;
