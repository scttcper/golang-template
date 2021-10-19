import { get } from './util';

export function reReplace(str: string, variables: object): string {
  const regex = /{{\s*re_replace\s+(\..+?)\s+"(.*?)"\s+"(.*?)"\s*}}/;
  let result = str;
  let m: RegExpMatchArray | null;

  while ((m = regex.exec(result)) !== null) {
    const all = m[0];
    const prop = m[1];
    const regexp = m[2];
    const newvalue = m[3];

    const replaceRegex = new RegExp(regexp, 'g');
    const input: string = get(variables, prop.substring(1));
    const expanded = input.replace(replaceRegex, newvalue);

    result = result.replace(all, expanded);
  }

  return result;
}

export function joinReplace(str: string, variables: object): string {
  const regex = /{{\s*join\s+\.(.+?)\s+"(.*?)"\s*}}/;
  let result = str;
  let m: RegExpMatchArray | null;

  while ((m = regex.exec(result)) !== null) {
    const all = m[0];
    const prop = m[1];
    const delimiter = m[2];

    const input: string[] = get(variables, prop);
    const expanded = input.join(delimiter);

    result = result.replace(all, expanded);
  }

  return result;
}

export function ifElseReplace(str: string, variables: object): string {
  const regex = /{{\s*if\s*(.+?)\s*}}(.*?){{\s*else\s*}}(.*?){{\s*end\s*}}/;
  let result = str;
  let m: RegExpMatchArray | null;

  while ((m = regex.exec(result)) !== null) {
    let conditionResult: string;

    const all = m[0];
    const condition = m[1];
    const onTrue = m[2];
    const onFalse = m[3];

    if (condition.startsWith('.')) {
      let conditionResultState = false;
      const value = get(variables, condition.substring(1));
      if (value === null || value === undefined) {
        conditionResultState = false;
      } else if (typeof value === 'string') {
        conditionResultState = value.length > 0;
      } else if (Array.isArray(value)) {
        conditionResultState = value.length > 0;
      } else if (typeof value === 'boolean') {
        conditionResultState = value;
      } else {
        throw new Error(`Unexpceted type for variable ${condition}: ${typeof value}`);
      }

      conditionResult = conditionResultState ? onTrue : onFalse;
    } else {
      throw new Error('Functionality not implemented');
    }

    result = result.replace(all, conditionResult);
  }

  return result;
}

export function rangeReplace(str: string, variables: object): string {
  const regex = /{{\s*range\s*(.+?)\s*}}(.*?){{\.}}(.*?){{end}}/;
  let result = str;
  let m: RegExpMatchArray | null;

  while ((m = regex.exec(result)) !== null) {
    let expanded = '';

    const all = m[0];
    const prop = m[1];
    const prefix = m[2];
    const postfix = m[3];

    const arr: unknown = get(variables, prop.substring(1));
    if (arr && Array.isArray(arr)) {
      for (const value of (arr as string[])) {
        expanded += `${prefix}${value}${postfix}`;
      }
    }

    result = result.replace(all, expanded);
  }

  return result;
}

export function variableReplace(str: string, variables: object): string {
  const regex = /{{\s*(\..+?)\s*}}/;
  let result = str;
  let m: RegExpMatchArray | null;

  while ((m = regex.exec(result)) !== null) {
    const all = m[0];
    const prop = m[1];

    const value = get(variables, prop.substring(1));
    result = result.replace(all, value);
  }

  return result;
}

export function indexReplace(str: string, variables: object): string {
  const regex = /{{\s*index\s*(\..+?)\s+(.+?)\s*}}/;
  let result = str;
  let m: RegExpMatchArray | null;

  while ((m = regex.exec(result)) !== null) {
    const all = m[0];
    const prop = m[1];
    const index = m[2];

    const top = get(variables, prop.substring(1));
    let value;
    // @ts-ignore
    if (isNaN(index)) {
      value = top[index.substring(1, index.length - 1)];
    } else {
      value = top[parseInt(index, 10)];
    }

    result = result.replace(all, value);
  }

  return result;
}

/**
 * Parse template and insert variables
 * @param str golang style template
 * @param variables object of variables to insert
 */
export function parse(str: string, variables: object): string {
  let result = reReplace(str, variables);
  result = joinReplace(result, variables);
  result = ifElseReplace(result, variables);
  result = rangeReplace(result, variables);
  result = variableReplace(result, variables);
  result = indexReplace(result, variables);
  return result;
}
