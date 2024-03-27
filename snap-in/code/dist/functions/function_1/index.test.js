"use strict";
/*
 * Copyright (c) 2023 DevRev, Inc. All rights reserved.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const test_runner_1 = require("../../test-runner/test-runner");
describe('Example Index Test file', () => {
    it('Testing the method', () => {
        (0, test_runner_1.testRunner)({
            fixturePath: 'function_1_event.json',
            functionName: 'function_1',
        });
    });
});
