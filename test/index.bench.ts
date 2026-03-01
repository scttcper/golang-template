import { bench, describe } from 'vitest';

import { compile, parse } from '../src';

const SIMPLE_TEMPLATE = '{{ .name }}';
const SIMPLE_VARS = { name: 'World' };

const IF_TEMPLATE = '{{ if .show }}Hello {{ .name }}!{{ else }}nobody{{ end }}';
const IF_VARS = { show: true, name: 'World' };

const RANGE_TEMPLATE = '{{ range .items }}{{ . }}, {{ end }}';
const RANGE_VARS = { items: ['a', 'b', 'c', 'd', 'e'] };

const RE_REPLACE_TEMPLATE = '{{ re_replace .value "[^a-zA-Z0-9]+" "-" }}';
const RE_REPLACE_VARS = { value: 'hello world! foo@bar.com' };

const COMPLEX_TEMPLATE =
  '{{ if .user }}{{ with .user }}Hello {{ .name }}, you have {{ end }}{{ end }}' +
  '{{ range .items }}{{ . }} {{ end }}' +
  '{{ join .tags ", " }}';
const COMPLEX_VARS = {
  user: { name: 'Alice' },
  items: ['a', 'b', 'c'],
  tags: ['x', 'y', 'z'],
};

describe('parse() — compile + render every call', () => {
  bench('simple variable', () => {
    parse(SIMPLE_TEMPLATE, SIMPLE_VARS);
  });

  bench('if/else', () => {
    parse(IF_TEMPLATE, IF_VARS);
  });

  bench('range', () => {
    parse(RANGE_TEMPLATE, RANGE_VARS);
  });

  bench('re_replace', () => {
    parse(RE_REPLACE_TEMPLATE, RE_REPLACE_VARS);
  });

  bench('complex', () => {
    parse(COMPLEX_TEMPLATE, COMPLEX_VARS);
  });
});

describe('compile() — render only (AST cached)', () => {
  const simpleTmpl = compile(SIMPLE_TEMPLATE);
  const ifTmpl = compile(IF_TEMPLATE);
  const rangeTmpl = compile(RANGE_TEMPLATE);
  const reReplaceTmpl = compile(RE_REPLACE_TEMPLATE);
  const complexTmpl = compile(COMPLEX_TEMPLATE);

  bench('simple variable', () => {
    simpleTmpl.render(SIMPLE_VARS);
  });

  bench('if/else', () => {
    ifTmpl.render(IF_VARS);
  });

  bench('range', () => {
    rangeTmpl.render(RANGE_VARS);
  });

  bench('re_replace', () => {
    reReplaceTmpl.render(RE_REPLACE_VARS);
  });

  bench('complex', () => {
    complexTmpl.render(COMPLEX_VARS);
  });
});
