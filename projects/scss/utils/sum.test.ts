import sum from './sum';

describe('sum', () => {
    it('adds the two given numbers', () => {
        expect(sum(2, 2)).toBe(4);
    });
});