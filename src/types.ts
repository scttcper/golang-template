export type Variables = Record<string, unknown>;

export type RawToken = { raw: string } | { tag: string };

export type Condition =
  | { op: 'var'; path: string[] }
  | { op: 'and'; paths: string[][] }
  | { op: 'or'; paths: string[][] }
  | { op: 'not'; path: string[] };

export type Node =
  | { type: 'text'; value: string }
  | { type: 'var'; path: string[] }
  | { type: 'dot' }
  | { type: 'if'; condition: Condition; trueBranch: Node[]; falseBranch: Node[] }
  | { type: 'range'; path: string[]; body: Node[] }
  | { type: 'join'; path: string[]; delimiter: string }
  | { type: 'index'; path: string[]; key: string | number }
  | { type: 're_replace'; path: string[]; pattern: string; replacement: string };
