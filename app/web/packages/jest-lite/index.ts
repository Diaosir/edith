import {describe, it, expect, run } from 'jest-lite';
import JestWorker from 'worker-loader!././worker/jest-lite.js';
import * as core from 'jest-lite';
import * as prettify from 'jest-lite/dist/prettify';
import 'jest-lite/dist/prettify.css'
console.log(prettify)
export default class JestLite {
    public jestWorker = null;
    constructor() {
        // this.initWorker();
    }
    initWorker() {
        this.jestWorker = new JestWorker();
    }

    async run() {
        function sum(x: number, y: number) {
            return x + y;
        }
        
        describe('sum', () => {
            it('adds the two given numbers', () => {
                expect(sum(2, 2)).toBe(4);
            });
            it('adds the two given numbers', () => {
                expect(sum(2, 1)).toBe(4);
            });
        });
        
        prettify.toHTML(run(), document.getElementById('jest-lite'));
    }
}