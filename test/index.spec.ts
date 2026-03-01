import { describe, expect, it } from 'vitest';

import { compile, parse } from '../src';

describe('reReplace', () => {
  it('should rereplace string', () => {
    const category = '123$';
    expect(parse('{{ re_replace .category "[^a-zA-Z0-9]+" "%" }}', { category })).toBe('123%');
  });
});

describe('joinReplace', () => {
  it('should join string', () => {
    const categories = ['1', '2', '3'];
    expect(parse('{{ join .categories "," }}', { categories })).toBe(categories.join(','));
  });
});

describe('ifElse', () => {
  it('should allow true', () => {
    const keywords = 'swag';
    expect(parse('{{ if .keywords }}hello{{else}}nothing{{end}}', { keywords })).toBe('hello');
  });
  it('should allow false', () => {
    const keywords = '';
    expect(parse('{{ if .keywords }}hello{{else}}nothing{{end}}', { keywords })).toBe('nothing');
  });
  it('should allow true with no else block', () => {
    const keywords = 'swag';
    expect(parse('{{ if .keywords }}hello{{end}}', { keywords })).toBe('hello');
  });
  it('should allow false with no else block', () => {
    const keywords = '';
    expect(parse('{{ if .keywords }}hello{{end}}', { keywords })).toBe('');
  });
});

describe('nested ifElse', () => {
  it('should handle nested if inside true branch (issue #93)', () => {
    const data = { option: true, deeperOption: false };
    const template = `{{ if .option }}outer-true {{ if .deeperOption }}inner-true{{ else }}inner-false{{ end }}{{ else }}outer-false{{ end }}`;
    expect(parse(template, data)).toBe('outer-true inner-false');
  });
  it('should handle nested if where outer is false', () => {
    const data = { option: false, deeperOption: true };
    const template = `{{ if .option }}{{ if .deeperOption }}inner{{ else }}not-inner{{ end }}{{ else }}outer-false{{ end }}`;
    expect(parse(template, data)).toBe('outer-false');
  });
  it('should handle nested if without else blocks', () => {
    const data = { a: true, b: true };
    const template = `{{ if .a }}{{ if .b }}both-true{{ end }}{{ end }}`;
    expect(parse(template, data)).toBe('both-true');
  });
  it('should handle 3 levels of nesting', () => {
    const data = { a: true, b: true, c: false };
    const template = `{{ if .a }}{{ if .b }}{{ if .c }}c{{ else }}not-c{{ end }}{{ end }}{{ end }}`;
    expect(parse(template, data)).toBe('not-c');
  });
});

describe('range', () => {
  it('should expand range', () => {
    const categories = ['1', '2', '3'];
    expect(parse('{{ range .categories }}{{.}};{{end}}', { categories })).toBe(
      `${categories.join(';')};`,
    );
  });
  it('should allow no range variable', () => {
    expect(parse('{{ range .categories }}{{.}};{{end}}', {})).toBe('');
  });
});

describe('variable', () => {
  it('should replace variable', () => {
    const categories = 'swag';
    expect(parse('{{ .categories }}', { categories })).toBe(categories);
  });
  it('should replace variable several layers deep', () => {
    const categories = { test: '123' };
    expect(parse('{{ .categories.test }}', { categories })).toBe(categories.test);
  });
  it('should replace multiple variable', () => {
    const party = 'gucci';
    const categories = 'swag';
    expect(parse('{{ .party }}{{ .categories }}', { categories, party })).toBe(party + categories);
  });
});

describe('index', () => {
  it('should index into array by number', () => {
    const arr = ['a', 'b', 'c'];
    expect(parse('{{ index .arr 1 }}', { arr })).toBe('b');
  });
  it('should index into object by string key', () => {
    const obj = { foo: 'bar' };
    expect(parse('{{ index .obj "foo" }}', { obj })).toBe('bar');
  });
});

describe('parse', () => {
  it('should parse if and variable', () => {
    const keywords = '123';
    expect(parse('{{ if .keywords }}{{ .keywords }}{{else}}{{end}}', { keywords })).toBe(keywords);
    const query = { test: false };
    expect(parse('{{ if .query.test }}true{{else}}false{{end}}', { query })).toBe('false');
  });
  it('should parse two if and variable', () => {
    const keywords = '123';
    expect(
      parse(
        '{{ if .keywords }}{{ .keywords }}{{else}}{{end}}{{ if .keywords }}{{ .keywords }}{{else}}{{end}}',
        { keywords },
      ),
    ).toBe(keywords + keywords);
  });
  it('should parse if and range', () => {
    const keywords = 'zzz';
    const categories = ['1', '2', '3'];
    expect(
      parse(
        '{{ range .categories }}{{.}};{{end}}{{ if .keywords }}{{ .keywords }}{{else}}{{end}}',
        { keywords, categories },
      ),
    ).toBe('1;2;3;zzz');
  });
});

describe('with', () => {
  it('should render trueBranch with value as dot context', () => {
    expect(parse('{{ with .name }}Hello {{ . }}!{{ end }}', { name: 'World' })).toBe(
      'Hello World!',
    );
  });
  it('should skip block when value is falsy', () => {
    expect(parse('{{ with .name }}Hello {{ . }}!{{ end }}', { name: '' })).toBe('');
  });
  it('should render else branch when value is falsy', () => {
    expect(parse('{{ with .name }}Hello {{ . }}{{ else }}nobody{{ end }}', { name: '' })).toBe(
      'nobody',
    );
  });
  it('should skip block when variable is missing', () => {
    expect(parse('{{ with .name }}Hello {{ . }}!{{ end }}', {})).toBe('');
  });
  it('should support nested with', () => {
    const data = { user: { city: 'NYC' } };
    expect(parse('{{ with .user }}{{ with .city }}{{ . }}{{ end }}{{ end }}', data)).toBe('NYC');
  });
});

describe('if and / or / not (issue #89)', () => {
  it('and: true when both truthy', () => {
    const keywords = { kunj: 'kunj', hi: 'hi' };
    expect(
      parse('{{ if and .keywords.kunj .keywords.hi }}yes{{else}}no{{end}}', { keywords }),
    ).toBe('yes');
  });
  it('and: false when one is falsy', () => {
    const keywords = { kunj: 'kunj', hi: '' };
    expect(
      parse('{{ if and .keywords.kunj .keywords.hi }}yes{{else}}no{{end}}', { keywords }),
    ).toBe('no');
  });
  it('or: true when one is truthy', () => {
    expect(parse('{{ if or .a .b }}yes{{else}}no{{end}}', { a: '', b: 'x' })).toBe('yes');
  });
  it('or: false when both falsy', () => {
    expect(parse('{{ if or .a .b }}yes{{else}}no{{end}}', { a: '', b: '' })).toBe('no');
  });
  it('not: true when value is falsy', () => {
    expect(parse('{{ if not .a }}yes{{else}}no{{end}}', { a: '' })).toBe('yes');
  });
  it('not: false when value is truthy', () => {
    expect(parse('{{ if not .a }}yes{{else}}no{{end}}', { a: 'x' })).toBe('no');
  });
});

describe('compile', () => {
  it('should compile once and render many times', () => {
    const tmpl = compile('{{ if .name }}Hello {{ .name }}!{{ end }}');
    expect(tmpl.render({ name: 'World' })).toBe('Hello World!');
    expect(tmpl.render({ name: 'Alice' })).toBe('Hello Alice!');
    expect(tmpl.render({})).toBe('');
  });
});

describe('correctness', () => {
  it('should handle values containing $& without corruption', () => {
    expect(parse('{{ .value }}', { value: '$&' })).toBe('$&');
    expect(parse('{{ .value }}', { value: "$'" })).toBe("$'");
    expect(parse('{{ .value }}', { value: '$`' })).toBe('$`');
  });

  it('should render undefined variable as empty string', () => {
    expect(parse('{{ .missing }}', {})).toBe('');
  });

  it('should treat non-zero number as truthy in if', () => {
    expect(parse('{{ if .count }}yes{{ end }}', { count: 5 })).toBe('yes');
  });

  it('should treat zero as falsy in if', () => {
    expect(parse('{{ if .count }}yes{{ end }}', { count: 0 })).toBe('');
  });

  it('should handle {{ . }} with spaces in range', () => {
    const items = ['a', 'b', 'c'];
    expect(parse('{{ range .items }}{{ . }};{{ end }}', { items })).toBe('a;b;c;');
  });
});

describe('error handling', () => {
  it('should throw SyntaxError for unclosed {{', () => {
    expect(() => parse('hello {{ world', {})).toThrow(SyntaxError);
  });

  it('should throw SyntaxError for unexpected {{ end }}', () => {
    expect(() => parse('{{ end }}', {})).toThrow(SyntaxError);
  });
  it('should throw SyntaxError for re_replace with missing replacement argument', () => {
    expect(() => parse('{{ re_replace .category "[^a-z]+" }}', {})).toThrow(SyntaxError);
  });
  it('should throw SyntaxError for re_replace with no arguments', () => {
    expect(() => parse('{{ re_replace .category }}', {})).toThrow(SyntaxError);
  });
});
