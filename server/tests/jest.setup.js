// Polyfill for TextEncoder and TextDecoder in Node.js test environment
const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Additional polyfills that might be needed
global.ArrayBuffer = ArrayBuffer;
global.Uint8Array = Uint8Array;
global.Buffer = Buffer; 