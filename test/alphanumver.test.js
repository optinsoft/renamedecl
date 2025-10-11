function alphaNumber(n) {
    const ac = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const l = ac.length;
    let r = ac.charAt(n % l); n = Math.floor(n / l);
    while (n) {
        r = ac.charAt(n % l) + r;
        n = Math.floor(n / l);
    }
    return r;
}

describe("alphaNumber", () => {
    test('test 0', () => {
        expect(alphaNumber(0)).toBe('a');
    });
    test('test 25', () => {
        expect(alphaNumber(25)).toBe('z');
    });
    test('test 26', () => {
        expect(alphaNumber(26)).toBe('A');
    });
    test('test 51', () => {
        expect(alphaNumber(51)).toBe('Z');
    });
    test('test 52', () => {
        expect(alphaNumber(52)).toBe('ba');
    });
    test('test 160', () => {
        expect(alphaNumber(160)).toBe('de');
    });
    test('test 2703', () => {
        expect(alphaNumber(2703)).toBe('ZZ');
    });
    test('test 2704', () => {
        expect(alphaNumber(2704)).toBe('baa');
    });
});