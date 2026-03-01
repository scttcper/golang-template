# golang-template [![npm](https://img.shields.io/npm/v/@ctrl/golang-template.svg?maxAge=3600)](https://www.npmjs.com/package/@ctrl/golang-template) [![CI](https://github.com/scttcper/golang-template/actions/workflows/ci.yml/badge.svg)](https://github.com/scttcper/golang-template/actions/workflows/ci.yml)

> TypeScript library that handles basic functions of the golang template syntax.

### Install

```sh
npm install @ctrl/golang-template
```

### Use

```ts
import { parse, compile } from '@ctrl/golang-template';

// One-shot
const keywords = '123';
parse('{{ if .keywords }}{{ .keywords }}!!{{else}}nothing{{end}}', { keywords });
// '123!!'

// Compile once, render many times (better for hot paths)
const tmpl = compile('{{ if .name }}Hello {{ .name }}!{{ end }}');
tmpl.render({ name: 'World' }); // 'Hello World!'
tmpl.render({ name: 'Alice' }); // 'Hello Alice!'
```

### Supported template functions

#### variables

```ts
parse('{{ .foo }}', { foo: 'bar' });
// 'bar'
```

#### if..else

```ts
parse('{{ if .keywords }}{{ .keywords }}{{else}}nothing{{end}}', { keywords: 'swag' });
// 'swag'
```

#### join

```ts
const categories = ['1', '2', '3'];
parse('{{ join .categories "," }}', { categories });
// '1,2,3'
```

#### range

```ts
const categories = ['1', '2', '3'];
parse('{{ range .categories }}{{.}};{{end}}', { categories });
// '1;2;3;'
```

#### re_replace

```ts
const category = '123$special';
parse('{{ re_replace .category "[^a-zA-Z0-9]+" "%" }}', { category });
// '123%special'
```

#### index

```ts
const data = {
  object: { value: 'foo' },
  array: ['bar'],
};
parse('{{ index .object "value" }}', data); // 'foo'
parse('{{ index .array 0 }}', data);        // 'bar'
```

### Warnings

This is probably not safe for user input.
