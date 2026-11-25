import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

/** The skill ngx-vflow ships, matching the installed version. */
export const SKILL = 'node_modules/ngx-vflow/skills/ngx-vflow/SKILL.md';

const START = '<!-- vflow:start -->';
const END = '<!-- vflow:end -->';

export const BLOCK = `${START}
## ngx-vflow

Before writing or changing code that uses \`ngx-vflow\` or \`@vflow/*\`, read \`${SKILL}\` and the references it
points to. They match the installed version: prefer them over what you remember, v3 changed most of the v2 API.
${END}`;

/**
 * A project skill that only points at the shipped one, so it never goes stale when ngx-vflow is updated. The
 * description is the one of libs/ngx-vflow/agent-skill.md; agents.spec.ts keeps them equal.
 */
export const STUB = `---
name: ngx-vflow
description: Builds node-based UIs in Angular with ngx-vflow 3 (flows, nodes, edges, handles, connections, viewport, minimap, @vflow/ui). Use whenever code imports from 'ngx-vflow' or '@vflow/*', or the task is a graph editor, workflow builder or diagram in Angular.
---

Read \`${SKILL}\` from the project root and follow it. Its links are relative to that file.
`;

/** `text` with the vflow block replaced, or appended when it has none. */
export function withBlock(text: string): string {
  const start = text.indexOf(START);
  const end = text.indexOf(END);
  if (start !== -1 && end > start) return text.slice(0, start) + BLOCK + text.slice(end + END.length);
  return text.trim() ? `${text.trimEnd()}\n\n${BLOCK}\n` : `${BLOCK}\n`;
}

/**
 * `npx @vflow/cli agents`: points the coding agents of the project at the skill in node_modules. Writes the block to
 * AGENTS.md, to an existing CLAUDE.md that does not import AGENTS.md, and a stub skill for Claude Code. Returns what
 * changed.
 */
export function writeAgentFiles(root: string): string[] {
  if (!existsSync(join(root, 'package.json'))) {
    throw new Error('No package.json here: run the command in the root of the project.');
  }
  const changed: string[] = [];
  const write = (path: string, next: (text: string) => string) => {
    const file = join(root, path);
    const text = existsSync(file) ? readFileSync(file, 'utf-8') : '';
    const result = next(text);
    if (result === text) return;
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, result);
    changed.push(path);
  };

  write('AGENTS.md', withBlock);
  // Claude Code reads AGENTS.md only when the project has no CLAUDE.md, so a CLAUDE.md needs the block too.
  const claude = join(root, 'CLAUDE.md');
  if (existsSync(claude) && !/^@AGENTS\.md\s*$/m.test(readFileSync(claude, 'utf-8'))) write('CLAUDE.md', withBlock);
  write('.claude/skills/ngx-vflow/SKILL.md', () => STUB);
  return changed;
}
