describe('Simple test to verify Jest setup', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle string comparisons', () => {
    expect('hello').toBe('hello');
  });

  it('should handle boolean comparisons', () => {
    expect(true).toBeTruthy();
    expect(false).toBeFalsy();
  });
});