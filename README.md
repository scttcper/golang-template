# golang-template [![npm](https://img.shields.io/npm/v/@ctrl/golang-template.svg?maxAge=3600)](https://www.npmjs.com/package/@ctrl/golang-template) [![build status](https://travis-ci.com/TypeCtrl/golang-template.svg?branch=master)](https://travis-ci.org/typectrl/golang-template) [![coverage status](https://codecov.io/gh/typectrl/golang-template/branch/master/graph/badge.svg)](https://codecov.io/gh/typectrl/golang-template)

> Typescript library that handles basic functions of the golang template syntax.

### Install

```sh
npm install @ctrl/golang-template
```

### Use
```ts
import { parse } from '@ctrl/golang-template';

const keywords = '123';
parse('{{ if .keywords }}{{ .keywords }}{{else}}nothing{{end}}', { keywords });
```

### Supported template functions

#### variables
```ts
`{{ .foo }}`
```

#### if..else
```ts
`{{ if .keywords }}{{ .keywords }}{{else}}nothing{{end}}`
```

#### join
```ts
const categories = ['1', '2', '3'];
parse('{{ join .categories "," }}', { categories });
// 1,2,3
```

#### range
```ts
const categories = ['1', '2', '3'];
parse('{{ range .categories }}{{.}};{{end}}', { categories });
// 1;2;3;
```

#### re_replace
```ts
const categories = ['1', '2', '3'];
parse('{{ range .categories }}{{.}};{{end}}', { categories });
// 1;2;3;
```

### Warnings
This is probably not safe for user imput.
