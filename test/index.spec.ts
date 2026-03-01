import { describe, expect, it } from 'vitest';

import {
  ifElseReplace,
  joinReplace,
  parse,
  rangeReplace,
  reReplace,
  variableReplace,
} from '../src';

describe('reReplace', () => {
  it('should rereplace string', () => {
    const category = '123$';
    expect(reReplace('{{ re_replace .category "[^a-zA-Z0-9]+" "%" }}', { category })).toBe('123%');
  });
});

describe('joinReplace', () => {
  it('should join string', () => {
    const categories = ['1', '2', '3'];
    expect(joinReplace('{{ join .categories "," }}', { categories })).toBe(categories.join(','));
  });
});

describe('ifElse', () => {
  it('should allow true', () => {
    const keywords = 'swag';
    expect(ifElseReplace('{{ if .keywords }}hello{{else}}nothing{{end}}', { keywords })).toBe(
      'hello',
    );
  });
  it('should allow false', () => {
    const keywords = '';
    expect(ifElseReplace('{{ if .keywords }}hello{{else}}nothing{{end}}', { keywords })).toBe(
      'nothing',
    );
  });
  it('should allow true with no else block', () => {
    const keywords = 'swag';
    expect(ifElseReplace('{{ if .keywords }}hello{{end}}', { keywords })).toBe(
      'hello',
    );
  });
  it('should allow false with no else block', () => {
    const keywords = '';
    expect(ifElseReplace('{{ if .keywords }}hello{{end}}', { keywords })).toBe(
      '',
    );
  });
});

describe('nested ifElse', () => {
  it('should handle nested if inside true branch (issue #93)', () => {
    const data = { option: true, deeperOption: false };
    const template = `{{ if .option }}outer-true {{ if .deeperOption }}inner-true{{ else }}inner-false{{ end }}{{ else }}outer-false{{ end }}`;
    expect(ifElseReplace(template, data)).toBe('outer-true inner-false');
  });
  it('should handle nested if where outer is false', () => {
    const data = { option: false, deeperOption: true };
    const template = `{{ if .option }}{{ if .deeperOption }}inner{{ else }}not-inner{{ end }}{{ else }}outer-false{{ end }}`;
    expect(ifElseReplace(template, data)).toBe('outer-false');
  });
  it('should handle nested if without else blocks', () => {
    const data = { a: true, b: true };
    const template = `{{ if .a }}{{ if .b }}both-true{{ end }}{{ end }}`;
    expect(ifElseReplace(template, data)).toBe('both-true');
  });
  it('should handle 3 levels of nesting', () => {
    const data = { a: true, b: true, c: false };
    const template = `{{ if .a }}{{ if .b }}{{ if .c }}c{{ else }}not-c{{ end }}{{ end }}{{ end }}`;
    expect(ifElseReplace(template, data)).toBe('not-c');
  });
});

describe('range', () => {
  it('should expand range', () => {
    const categories = ['1', '2', '3'];
    expect(rangeReplace('{{ range .categories }}{{.}};{{end}}', { categories })).toBe(
      categories.join(';') + ';',
    );
  });
  it('should allow no range variable', () => {
    expect(rangeReplace('{{ range .categories }}{{.}};{{end}}', {})).toBe('');
  });
});

describe('variable', () => {
  it('should replace variable', () => {
    const categories = 'swag';
    expect(variableReplace('{{ .categories }}', { categories })).toBe(categories);
  });
  it('should replace variable several layers deep', () => {
    const categories = { test: '123' };
    expect(variableReplace('{{ .categories.test }}', { categories })).toBe(categories.test);
  });
  it('should replace multiple variable', () => {
    const party = 'gucci';
    const categories = 'swag';
    expect(variableReplace('{{ .party }}{{ .categories }}', { categories, party })).toBe(
      party + categories,
    );
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
