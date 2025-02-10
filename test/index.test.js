const assert = require('assert');
const { test } = require('node:test');
const { parseAnsi, parseTags, stripAnsi, stripTags } = require('../src/index');

test('basic tag string', () => {
  const tagged = '[bold]Hello[/bold]';
  const ansi = '\x1b[1mHello\x1b[22m';
  const stripped = 'Hello';
  assert.strictEqual(parseTags(tagged), ansi);
  assert.strictEqual(stripTags(tagged), stripped);
  assert.strictEqual(parseAnsi(ansi), tagged);
  assert.strictEqual(stripAnsi(ansi), stripped);
});

test('multi-tag string', () => {
  const tagged = '[bold red]Hello[/]';
  const ansi = '\x1b[1;31mHello\x1b[0m';
  const stripped = 'Hello';
  assert.strictEqual(parseTags(tagged), ansi);
  assert.strictEqual(stripTags(tagged), stripped);
  assert.strictEqual(parseAnsi(ansi), tagged);
  assert.strictEqual(stripAnsi(ansi), stripped);
});

test('multi-tag string with individual closures', () => {
  const tagged = '[bold red]Hello[/bold /fg]';
  const ansi = '\x1b[1;31mHello\x1b[22;39m';
  const stripped = 'Hello';
  assert.strictEqual(parseTags(tagged), ansi);
  assert.strictEqual(stripTags(tagged), stripped);
  assert.strictEqual(parseAnsi(ansi), tagged);
  assert.strictEqual(stripAnsi(ansi), stripped);
});

test('multi-tag string with separated closures', () => {
  const tagged = '[bold red]Hello[/bold] world[/]';
  const ansi = '\x1b[1;31mHello\x1b[22m world\x1b[0m';
  const stripped = 'Hello world';
  assert.strictEqual(parseTags(tagged), ansi);
  assert.strictEqual(stripTags(tagged), stripped);
  assert.strictEqual(parseAnsi(ansi), tagged);
  assert.strictEqual(stripAnsi(ansi), stripped);
});

test('complex tagged string with multiple open/close tags', () => {
  const tagged = '[bold red bg_black]Hello[/bold italic] world[/fg white] how are[/] you?';
  const ansi = '\x1b[1;31;40mHello\x1b[22;3m world\x1b[39;37m how are\x1b[0m you?';
  const stripped = 'Hello world how are you?';
  assert.strictEqual(parseTags(tagged), ansi);
  assert.strictEqual(stripTags(tagged), stripped);
  assert.strictEqual(parseAnsi(ansi), tagged);
  assert.strictEqual(stripAnsi(ansi), stripped);
});

test('string with hyperlink', () => {
  const tagged = 'A link to [link=www.google.com]Google[/link]';
  const ansi = 'A link to \x1b]8;;www.google.com\x1b\x5cGoogle\x1b]8;;\x1b\x5c';
  const stripped = 'A link to Google';
  const strippedUrl = 'A link to www.google.com';
  assert.strictEqual(parseTags(tagged), ansi);
  assert.strictEqual(stripTags(tagged), stripped);
  assert.strictEqual(stripTags(tagged, keepUrl=true), strippedUrl);
  assert.strictEqual(parseAnsi(ansi), tagged);
  assert.strictEqual(stripAnsi(ansi), stripped);
  assert.strictEqual(stripAnsi(ansi, keepUrl=true), strippedUrl);
});

test('tagged string with hyperlinks', () => {
  const tagged = '[link=www.google.com]A link to [bold]Google[/][/link]';
  const ansi = '\x1b]8;;www.google.com\x1b\x5cA link to \x1b[1mGoogle\x1b[0m\x1b]8;;\x1b\x5c';
  const stripped = 'A link to Google';
  const strippedUrl = 'www.google.com';
  assert.strictEqual(parseTags(tagged), ansi);
  assert.strictEqual(stripTags(tagged), stripped);
  assert.strictEqual(stripTags(tagged, keepUrl=true), strippedUrl);
  assert.strictEqual(parseAnsi(ansi), tagged);
  assert.strictEqual(stripAnsi(ansi), stripped);
  assert.strictEqual(stripAnsi(ansi, keepUrl=true), strippedUrl);
})