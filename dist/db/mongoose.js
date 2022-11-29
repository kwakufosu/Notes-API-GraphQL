"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
require('dotenv').config({ path: __dirname + '../../.env' });
if (typeof process.env.MONGO_URL === 'undefined') {
    throw new Error('MONGOURL is undefined');
}
mongoose_1.default
    .connect(process.env.MONGO_URL)
    .then(() => console.log('connected to db'))
    .catch((e) => console.log(e));
