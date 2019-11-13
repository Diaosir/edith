import expect from 'jest-matchers';
import jestMock from 'jest-mock';
import { addEventHandler, ROOT_DESCRIBE_BLOCK_NAME, setState } from 'jest-circus/build/state';
import run from 'jest-circus/build/run';
import { Circus } from '@jest/types';
import { makeDescribe } from 'jest-circus/build/utils';
//reset jest state
export function resetState() {
  const ROOT_DESCRIBE_BLOCK = makeDescribe(ROOT_DESCRIBE_BLOCK_NAME);
  const INITIAL_STATE: Circus.State = {
    currentDescribeBlock: ROOT_DESCRIBE_BLOCK,
    currentlyRunningTest: null,
    expand: undefined,
    hasFocusedTests: false, // whether .only has been used on any test/describe
    includeTestLocationInResult: false,
    parentProcess: null,
    rootDescribeBlock: ROOT_DESCRIBE_BLOCK,
    testNamePattern: null,
    testTimeout: 5000,
    unhandledErrors: [],
  };
  setState(INITIAL_STATE);
}

export * from 'jest-circus';
export {jestMock as jest, expect, addEventHandler, run };

