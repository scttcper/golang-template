import { buildAST, render, tokenize } from './template';
import type { Variables } from './types';

export type { Variables };

export interface Template {
  render(variables: Variables): string;
}

export function compile(template: string): Template {
  const ast = buildAST(tokenize(template));
  return { render: vars => render(ast, vars) };
}

/**
 * Parse template and insert variables
 * @param str golang style template
 * @param variables object of variables to insert
 */
export function parse(str: string, variables: Variables): string {
  return compile(str).render(variables);
}
