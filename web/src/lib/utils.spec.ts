import { describe, it, expect } from 'vitest';
import { cn } from './utils.js';

describe('cn()', () => {
  it('合并字符串类名', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1');
  });

  it('合并条件/falsy 值', () => {
    expect(cn('a', false && 'b', 0 && 'c', null, undefined, 'd')).toBe('a d');
  });

  it('tailwind 冲突时后者覆盖前者', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
    expect(cn('text-red-500', 'text-blue-600')).toBe('text-blue-600');
  });
});