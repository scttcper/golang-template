export type Variables = Record<string, unknown>;

export type RawToken = { raw: string } | { tag: string };

export type Node =
  | { type: 'text'; value: string }
  | { type: 'var'; path: string[] }
  | { type: 'dot' }
  | { type: 'if'; path: string[]; trueBranch: Node[]; falseBranch: Node[] }
  | { type: 'range'; path: string[]; body: Node[] }
  | { type: 'join'; path: string[]; delimiter: string }
  | { type: 'index'; path: string[]; key: string | number }
  | { type: 're_replace'; path: string[]; pattern: string; replacement: string };
