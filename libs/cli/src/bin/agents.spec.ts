import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { BLOCK, STUB, withBlock, writeAgentFiles } from './agents';

const description = (text: string) => text.match(/^description: (.*)$/m)?.[1];

describe('withBlock', () => {
  it('is the block alone for an empty file', () => {
    expect(withBlock('')).toBe(`${BLOCK}\n`);
  });

  it('appends the block after the text of the file', () => {
    expect(withBlock('# Rules\n\nUse pnpm.\n')).toBe(`# Rules\n\nUse pnpm.\n\n${BLOCK}\n`);
  });

  it('replaces an older block in place and keeps the text around it', () => {
    const old = '<!-- vflow:start -->\nold\n<!-- vflow:end -->';
    expect(withBlock(`before\n\n${old}\n\nafter\n`)).toBe(`before\n\n${BLOCK}\n\nafter\n`);
  });

  it('changes nothing on a second run', () => {
    const once = withBlock('# Rules\n');
    expect(withBlock(once)).toBe(once);
  });
});

describe('writeAgentFiles', () => {
  let root: string;
  const read = (path: string) => readFileSync(join(root, path), 'utf-8');

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'vflow-agents-'));
    writeFileSync(join(root, 'package.json'), '{}');
  });

  it('fails outside a project', () => {
    expect(() => writeAgentFiles(mkdtempSync(join(tmpdir(), 'vflow-agents-')))).toThrow('No package.json here');
  });

  it('writes AGENTS.md and the stub skills, and no CLAUDE.md, which would hide AGENTS.md from Claude Code', () => {
    expect(writeAgentFiles(root)).toEqual([
      'AGENTS.md',
      '.claude/skills/ngx-vflow/SKILL.md',
      '.agents/skills/ngx-vflow/SKILL.md',
    ]);
    expect(read('AGENTS.md')).toBe(`${BLOCK}\n`);
    expect(read('.claude/skills/ngx-vflow/SKILL.md')).toBe(STUB);
    expect(read('.agents/skills/ngx-vflow/SKILL.md')).toBe(STUB);
    expect(existsSync(join(root, 'CLAUDE.md'))).toBe(false);
  });

  it('adds the block to a CLAUDE.md of its own', () => {
    writeFileSync(join(root, 'CLAUDE.md'), '# Claude\n');

    writeAgentFiles(root);

    expect(read('CLAUDE.md')).toBe(`# Claude\n\n${BLOCK}\n`);
  });

  it('leaves a CLAUDE.md that imports AGENTS.md alone', () => {
    writeFileSync(join(root, 'CLAUDE.md'), '@AGENTS.md\n');

    expect(writeAgentFiles(root)).not.toContain('CLAUDE.md');
    expect(read('CLAUDE.md')).toBe('@AGENTS.md\n');
  });

  it('changes nothing on a second run', () => {
    writeAgentFiles(root);

    expect(writeAgentFiles(root)).toEqual([]);
  });

  it('describes the stub as the shipped skill describes itself', () => {
    const shipped = readFileSync(join(__dirname, '../../../ngx-vflow/agent-skill.md'), 'utf-8');
    expect(description(STUB)).toBe(description(shipped));
  });
});
