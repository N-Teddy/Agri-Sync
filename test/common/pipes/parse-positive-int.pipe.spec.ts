import { ParsePositiveIntPipe } from '../../../src/common/pipes/parse-positive-int.pipe';

describe('ParsePositiveIntPipe', () => {
  const pipe = new ParsePositiveIntPipe();

  it('parses valid integers', () => {
    expect(pipe.transform('5')).toBe(5);
  });

  it('throws for invalid values', () => {
    expect(() => pipe.transform('-1')).toThrow('Value must be a positive integer');
  });
});
