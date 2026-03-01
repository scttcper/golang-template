# golang-template [![npm](https://img.shields.io/npm/v/@ctrl/golang-template.svg?maxAge=3600)](https://www.npmjs.com/package/@ctrl/golang-template)

> TypeScript implementation of a subset of the [Go template](https://pkg.go.dev/text/template) syntax.

## Install

```sh
npm install @ctrl/golang-template
```

## Usage

```ts
import { compile, parse } from '@ctrl/golang-template';

// One-shot
parse('{{ if .keywords }}{{ .keywords }}!!{{ else }}nothing{{ end }}', { keywords: '123' });
// '123!!'

// Compile once, render many times (better for hot paths)
const tmpl = compile('{{ if .name }}Hello {{ .name }}!{{ end }}');
tmpl.render({ name: 'World' }); // 'Hello World!'
tmpl.render({ name: 'Alice' }); // 'Hello Alice!'
```

## Supported syntax

### Variables

```ts
parse('{{ .foo }}', { foo: 'bar' });
// 'bar'

parse('{{ .user.name }}', { user: { name: 'Alice' } });
// 'Alice'
```

### if / else

```ts
parse('{{ if .keywords }}{{ .keywords }}{{ else }}nothing{{ end }}', { keywords: 'swag' });
// 'swag'
```

### if with and / or / not

```ts
parse('{{ if and .a .b }}both{{ else }}no{{ end }}', { a: 'x', b: 'y' });
// 'both'

parse('{{ if or .a .b }}either{{ else }}neither{{ end }}', { a: '', b: 'y' });
// 'either'

parse('{{ if not .disabled }}enabled{{ end }}', { disabled: false });
// 'enabled'
```

### with

Sets `.` to the value for the duration of the block; skips the block if the value is falsy.

```ts
parse('{{ with .user }}Hello {{ . }}!{{ end }}', { user: 'World' });
// 'Hello World!'

parse('{{ with .user }}Hello {{ . }}{{ else }}nobody{{ end }}', { user: '' });
// 'nobody'
```

### range

```ts
const categories = ['a', 'b', 'c'];
parse('{{ range .categories }}{{ . }};{{ end }}', { categories });
// 'a;b;c;'
```

### index

```ts
const data = {
  object: { value: 'foo' },
  array: ['bar'],
};
parse('{{ index .object "value" }}', data); // 'foo'
parse('{{ index .array 0 }}', data); // 'bar'
```

### join †

```ts
const categories = ['a', 'b', 'c'];
parse('{{ join .categories "," }}', { categories });
// 'a,b,c'
```

### re_replace †

```ts
parse('{{ re_replace .category "[^a-zA-Z0-9]+" "%" }}', { category: '123$special' });
// '123%special'
```

† Non-standard extension, not available in Go's `text/template`.

## Compatibility

| Feature                                                        | Supported |
| -------------------------------------------------------------- | --------- |
| `{{ .Variable }}`                                              | ✅        |
| `{{ .nested.path }}`                                           | ✅        |
| `{{ if }}` / `{{ else }}` / `{{ end }}`                        | ✅        |
| `{{ if and .a .b }}` / `{{ if or .a .b }}` / `{{ if not .a }}` | ✅        |
| `{{ with }}`                                                   | ✅        |
| `{{ range }}` with `{{ . }}`                                   | ✅        |
| `{{ index .arr 0 }}` / `{{ index .obj "key" }}`                | ✅        |
| `{{ join }}` (extension)                                       | ✅        |
| `{{ re_replace }}` (extension)                                 | ✅        |
| `{{ range }}` with `{{ .Field }}` on items                     | ❌        |
| `{{ if eq .a .b }}` / `{{ if gt .a .b }}` etc.                 | ❌        |
| `{{ $var := .val }}` variable assignment                       | ❌        |
| `{{ $.RootVar }}` from inside range/with                       | ❌        |
| `{{ len .val }}`                                               | ❌        |
| `{{ printf }}` / `{{ html }}` / `{{ js }}`                     | ❌        |
| `{{ template }}` / `{{ block }}`                               | ❌        |

## Warnings

This library is not safe for untrusted user input. The `re_replace` tag compiles user-provided regex patterns at render time, making it vulnerable to ReDoS if patterns are sourced from user data.
