'use strict';

/*
 * Copyright (c) 2012 Trent Mick. All rights reserved.
 * Copyright (c) 2012 Joyent Inc. All rights reserved.
 *
 * Test logging with (accidental) usage of buffers.
 */

const { format, inspect } = require('util');
const { createLogger } = require('../lib/bunyan');
const { join } = require('path');

// node-tap API
if (require.cache[join(__dirname, '/tap4nodeunit.js')]) {
  delete require.cache[join(__dirname, '/tap4nodeunit.js')];
}
const { test } = require('./tap4nodeunit.js');


function Catcher() {
  this.records = [];
}
Catcher.prototype.write = function(record) {
  this.records.push(record);
};

const catcher = new Catcher();
const log = createLogger({
  name: 'buffer.test',
  streams: [
    {
      type: 'raw',
      stream: catcher,
      level: 'trace'
    }
  ]
});

test('log.info(BUFFER)', t => {
  const b = Buffer.from('foo');

  ['trace',
    'debug',
    'info',
    'warn',
    'error',
    'fatal'].forEach(lvl => {
    log[lvl](b);
    let rec = catcher.records[catcher.records.length - 1];
    t.equal(rec.msg, inspect(b),
      format('log.%s msg is inspect(BUFFER)', lvl));
    t.ok(rec['0'] === undefined,
      'no "0" array index key in record: ' + inspect(rec['0']));
    t.ok(rec.parent === undefined,
      'no "parent" array index key in record: ' + inspect(rec.parent));

    log[lvl](b, 'bar');
    rec = catcher.records[catcher.records.length - 1];
    t.equal(rec.msg, inspect(b) + ' bar', format(
      'log.%s(BUFFER, "bar") msg is inspect(BUFFER) + " bar"', lvl));
  });

  t.end();
});
