# golang-template

This is a typescript library that handles basic functions of the golang template syntax.

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
`{{ .foo }}`

#### if...else
`{{ if .keywords }}{{ .keywords }}{{else}}nothing{{end}}`

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

### Warnings
This is probably not safe for user imput.
