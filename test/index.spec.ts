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
});

describe('range', () => {
  it('should expand range', () => {
    const categories = ['1', '2', '3'];
    expect(rangeReplace('{{ range .categories }}{{.}};{{end}}', { categories })).toBe(
      categories.join(';') + ';',
    );
  });
  it('should allow no range variable', () => {
    expect(rangeReplace('{{ range .categories }}{{.}};{{end}}', { })).toBe('');
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
