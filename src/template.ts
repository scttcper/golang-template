import type { Condition, Node, RawToken, Variables } from './types';
import { get } from './util';

function parsePath(dotPath: string): string[] {
  return dotPath
    .slice(1)
    .split('.')
    .filter(s => s.length > 0);
}

function parseQuotedArgs(s: string): string[] {
  const result: string[] = [];
  let i = 0;
  while (i < s.length) {
    if (s[i] === '"') {
      const end = s.indexOf('"', i + 1);
      if (end === -1) {
        throw new SyntaxError('Unterminated quoted string in template tag');
      }
      result.push(s.slice(i + 1, end));
      i = end + 1;
    } else {
      i++;
    }
  }
  return result;
}

export function tokenize(template: string): RawToken[] {
  const tokens: RawToken[] = [];
  let pos = 0;
  while (pos < template.length) {
    const open = template.indexOf('{{', pos);
    if (open === -1) {
      tokens.push({ raw: template.slice(pos) });
      break;
    }
    if (open > pos) {
      tokens.push({ raw: template.slice(pos, open) });
    }
    const close = template.indexOf('}}', open + 2);
    if (close === -1) {
      throw new SyntaxError(`Unclosed '{{' at position ${open}`);
    }
    tokens.push({ tag: template.slice(open + 2, close).trim() });
    pos = close + 2;
  }
  return tokens;
}

export function buildAST(tokens: RawToken[]): Node[] {
  const stack: Node[][] = [[]];
  const blockTypes: Array<'if-true' | 'if-false' | 'with-true' | 'with-false' | 'range'> = [];
  const current = (): Node[] => stack[stack.length - 1];

  for (const token of tokens) {
    if ('raw' in token) {
      current().push({ type: 'text', value: token.raw });
      continue;
    }

    const tag = token.tag;

    if (tag === '.') {
      current().push({ type: 'dot' });
    } else if (tag === 'else') {
      const blockType = blockTypes[blockTypes.length - 1];
      if (blockType !== 'if-true' && blockType !== 'with-true') {
        throw new SyntaxError('Unexpected {{ else }}');
      }
      stack.pop();
      const parent = stack[stack.length - 1];
      const node = parent[parent.length - 1] as Extract<Node, { type: 'if' | 'with' }>;
      stack.push(node.falseBranch);
      blockTypes[blockTypes.length - 1] = blockType === 'if-true' ? 'if-false' : 'with-false';
    } else if (tag === 'end') {
      if (stack.length === 1) {
        throw new SyntaxError('Unexpected {{ end }}');
      }
      stack.pop();
      blockTypes.pop();
    } else if (tag.startsWith('if ')) {
      const rest = tag.slice(3).trim();
      let condition: Condition;
      if (rest.startsWith('and ')) {
        const paths = rest
          .slice(4)
          .trim()
          .split(' ')
          .filter(s => s.length > 0)
          .map(parsePath);
        condition = { op: 'and', paths };
      } else if (rest.startsWith('or ')) {
        const paths = rest
          .slice(3)
          .trim()
          .split(' ')
          .filter(s => s.length > 0)
          .map(parsePath);
        condition = { op: 'or', paths };
      } else if (rest.startsWith('not ')) {
        condition = { op: 'not', path: parsePath(rest.slice(4).trim()) };
      } else {
        condition = { op: 'var', path: parsePath(rest) };
      }
      const ifNode: Extract<Node, { type: 'if' }> = {
        type: 'if',
        condition,
        trueBranch: [],
        falseBranch: [],
      };
      current().push(ifNode);
      stack.push(ifNode.trueBranch);
      blockTypes.push('if-true');
    } else if (tag.startsWith('with ')) {
      const path = parsePath(tag.slice(5).trim());
      const withNode: Extract<Node, { type: 'with' }> = {
        type: 'with',
        path,
        trueBranch: [],
        falseBranch: [],
      };
      current().push(withNode);
      stack.push(withNode.trueBranch);
      blockTypes.push('with-true');
    } else if (tag.startsWith('range ')) {
      const path = parsePath(tag.slice(6).trim());
      const rangeNode: Extract<Node, { type: 'range' }> = { type: 'range', path, body: [] };
      current().push(rangeNode);
      stack.push(rangeNode.body);
      blockTypes.push('range');
    } else if (tag.startsWith('join ')) {
      const rest = tag.slice(5);
      const spaceIdx = rest.indexOf(' ');
      const path = parsePath(rest.slice(0, spaceIdx));
      const delimiter = rest
        .slice(spaceIdx + 1)
        .trim()
        .slice(1, -1);
      current().push({ type: 'join', path, delimiter });
    } else if (tag.startsWith('index ')) {
      const rest = tag.slice(6);
      const spaceIdx = rest.indexOf(' ');
      const path = parsePath(rest.slice(0, spaceIdx));
      const keyStr = rest.slice(spaceIdx + 1).trim();
      const key: string | number = keyStr.startsWith('"')
        ? keyStr.slice(1, -1)
        : Number.parseInt(keyStr, 10);
      current().push({ type: 'index', path, key });
    } else if (tag.startsWith('re_replace ')) {
      const rest = tag.slice(11);
      const spaceIdx = rest.indexOf(' ');
      const path = parsePath(rest.slice(0, spaceIdx));
      const args = parseQuotedArgs(rest.slice(spaceIdx + 1).trim());
      if (args.length !== 2) {
        throw new SyntaxError(
          `re_replace requires two quoted arguments (pattern and replacement), got ${args.length}`,
        );
      }
      current().push({ type: 're_replace', path, pattern: args[0], replacement: args[1] });
    } else if (tag.startsWith('.')) {
      current().push({ type: 'var', path: parsePath(tag) });
    } else {
      throw new SyntaxError(`Unknown template tag: {{ ${tag} }}`);
    }
  }

  if (stack.length !== 1) {
    throw new SyntaxError('Unclosed template block (missing {{ end }})');
  }
  return stack[0];
}

function isTruthy(value: unknown): boolean {
  if (value == null) {
    return false;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value !== 0;
  }
  if (typeof value === 'string') {
    return value.length > 0;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return true;
}

function evalCondition(cond: Condition, vars: Variables): boolean {
  switch (cond.op) {
    case 'var': {
      return isTruthy(get(vars, cond.path));
    }
    case 'and': {
      return cond.paths.every(path => isTruthy(get(vars, path)));
    }
    case 'or': {
      return cond.paths.some(path => isTruthy(get(vars, path)));
    }
    case 'not': {
      return !isTruthy(get(vars, cond.path));
    }
  }
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function render(nodes: Node[], vars: Variables, context?: unknown): string {
  let out = '';
  for (const node of nodes) {
    switch (node.type) {
      case 'text': {
        out += node.value;
        break;
      }
      case 'dot': {
        out += context == null ? '' : String(context);
        break;
      }
      case 'var': {
        const val = get(vars, node.path);
        out += val == null ? '' : String(val);
        break;
      }
      case 'if': {
        out += render(
          evalCondition(node.condition, vars) ? node.trueBranch : node.falseBranch,
          vars,
          context,
        );
        break;
      }
      case 'with': {
        const val = get(vars, node.path);
        if (isTruthy(val)) {
          const innerVars =
            val != null && typeof val === 'object' && !Array.isArray(val)
              ? (val as Variables)
              : vars;
          out += render(node.trueBranch, innerVars, val);
        } else {
          out += render(node.falseBranch, vars, context);
        }
        break;
      }
      case 'range': {
        for (const item of asArray(get(vars, node.path))) {
          out += render(node.body, vars, item);
        }
        break;
      }
      case 'join': {
        out += asArray(get(vars, node.path)).join(node.delimiter);
        break;
      }
      case 'index': {
        const obj = get(vars, node.path);
        const val = obj != null ? (obj as Record<string | number, unknown>)[node.key] : undefined;
        out += val == null ? '' : String(val);
        break;
      }
      case 're_replace': {
        const val = get(vars, node.path);
        const str = val == null ? '' : String(val);
        out += str.replaceAll(new RegExp(node.pattern, 'g'), node.replacement);
        break;
      }
    }
  }
  return out;
}
