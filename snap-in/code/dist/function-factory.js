"use strict";
/*
 * Copyright (c) 2023 DevRev, Inc. All rights reserved.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.functionFactory = void 0;
const index_1 = __importDefault(require("./functions/function_1/index"));
const index_2 = __importDefault(require("./functions/function_2/index"));
exports.functionFactory = {
    function_1: index_1.default,
    function_2: index_2.default,
};
