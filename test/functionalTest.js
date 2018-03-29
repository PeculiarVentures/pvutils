import * as pvutils from "../src/utils.js";

const assert = require("assert");
//**************************************************************************************
context("Functional Tests for \"pvutils\" package", () =>
{
	const data = new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A]);

	it("getUTCDate", () =>
	{
		const date = new Date();
		assert.deepEqual(pvutils.getUTCDate(date), new Date(date.getTime() + (date.getTimezoneOffset() * 60000)), "Incorrect Date processing");
	});
	
	it("getParametersValue", () =>
	{
		assert.equal(pvutils.getParametersValue(1, "name", 2), 2, "Incorrect return value #1");
		assert.equal(pvutils.getParametersValue({ name: 33 }, "name", 2), 33, "Incorrect return value #2");
		assert.equal(pvutils.getParametersValue({ name: 33 }, "fake", 2), 2, "Incorrect return value #3");
	});
	
	it("bufferToHexCodes", () =>
	{
		assert.equal(pvutils.bufferToHexCodes(data.buffer), "0102030405060708090A", "Incorrect return value #1");
		assert.equal(pvutils.bufferToHexCodes(data.buffer, 1), "02030405060708090A", "Incorrect return value #2");
		assert.equal(pvutils.bufferToHexCodes(data.buffer, 1, 3), "020304", "Incorrect return value #3");
	});
	
	it("checkBufferParams", () =>
	{
		const baseBlock = {};
		
		let result = pvutils.checkBufferParams(baseBlock, 1, 1, 1);
		assert.equal(result, false, "Incorrect return value #1");
		assert.equal(baseBlock.error, "Wrong parameter: inputBuffer must be \"ArrayBuffer\"", "Incorrect error message");
		
		result = pvutils.checkBufferParams(baseBlock, (new Uint8Array()).buffer, 1, 1);
		assert.equal(result, false, "Incorrect return value #2");
		assert.equal(baseBlock.error, "Wrong parameter: inputBuffer has zero length", "Incorrect error message");
		
		result = pvutils.checkBufferParams(baseBlock, data.buffer, -1, 1);
		assert.equal(result, false, "Incorrect return value #3");
		assert.equal(baseBlock.error, "Wrong parameter: inputOffset less than zero", "Incorrect error message");
		
		result = pvutils.checkBufferParams(baseBlock, data.buffer, 1, -1);
		assert.equal(result, false, "Incorrect return value #4");
		assert.equal(baseBlock.error, "Wrong parameter: inputLength less than zero", "Incorrect error message");
		
		result = pvutils.checkBufferParams(baseBlock, data.buffer, 11, 1);
		assert.equal(result, false, "Incorrect return value #5");
		assert.equal(baseBlock.error, "End of input reached before message was fully decoded (inconsistent offset and length values)", "Incorrect error message");
		
		result = pvutils.checkBufferParams(baseBlock, data.buffer, 1, 1);
		assert.equal(result, true, "Incorrect return value #6");
	});
	
	it("utilFromBase", () =>
	{
		assert.equal(pvutils.utilFromBase(new Uint8Array([0x01]), 7), 1, "Incorrect result #1");
		assert.equal(pvutils.utilFromBase(new Uint8Array([0x01, 0x01]), 7), 129, "Incorrect result #2");
		assert.equal(pvutils.utilFromBase(new Uint8Array([0x01, 0x01, 0x01]), 7), 16513, "Incorrect result #3");
	});
	
	it("utilToBase", () =>
	{
		assert.equal(pvutils.bufferToHexCodes(pvutils.utilToBase(1, 7)), "01", "Incorrect result #1");
		assert.equal(pvutils.bufferToHexCodes(pvutils.utilToBase(129, 7)), "0101", "Incorrect result #2");
		assert.equal(pvutils.bufferToHexCodes(pvutils.utilToBase(16513, 7)), "010101", "Incorrect result #3");
		assert.equal(pvutils.bufferToHexCodes(pvutils.utilToBase(16513, 7, 4)), "00010101", "Incorrect result #4");
		assert.equal(pvutils.bufferToHexCodes(pvutils.utilToBase(16513, 7, 0)), "", "Incorrect result #5");
		assert.equal(pvutils.bufferToHexCodes(pvutils.utilToBase(16777218, 3)), "", "Incorrect result #6");
	});
	
	it("utilConcatBuf", () =>
	{
		assert.equal(pvutils.bufferToHexCodes(pvutils.utilConcatBuf(data.buffer)), "0102030405060708090A", "Incorrect return value #1");
		assert.equal(pvutils.bufferToHexCodes(pvutils.utilConcatBuf(data.buffer, data.buffer)), "0102030405060708090A0102030405060708090A", "Incorrect return value #2");
		assert.equal(pvutils.bufferToHexCodes(pvutils.utilConcatBuf(data.buffer, data.buffer, data.buffer)), "0102030405060708090A0102030405060708090A0102030405060708090A", "Incorrect return value #3");
	});
	
	it("utilConcatView", () =>
	{
		assert.equal(pvutils.bufferToHexCodes(pvutils.utilConcatView(data).buffer), "0102030405060708090A", "Incorrect return value #1");
		assert.equal(pvutils.bufferToHexCodes(pvutils.utilConcatView(data, data).buffer), "0102030405060708090A0102030405060708090A", "Incorrect return value #2");
		assert.equal(pvutils.bufferToHexCodes(pvutils.utilConcatView(data, data, data).buffer), "0102030405060708090A0102030405060708090A0102030405060708090A", "Incorrect return value #3");
	});
	
	it("utilDecodeTC", () =>
	{
		assert.equal(pvutils.utilDecodeTC.call({
				valueHex: (new Uint8Array([0x7F, 0x7F])).buffer
			}), 32639, "Incorrect result #1");
		assert.equal(pvutils.utilDecodeTC.call({
				valueHex: (new Uint8Array([0x80, 0x81])).buffer
			}), -32639, "Incorrect result #2");
		assert.equal(pvutils.utilDecodeTC.call({
				valueHex: (new Uint8Array([0x01, 0x00])).buffer
			}), 256, "Incorrect result #3");
		assert.equal(pvutils.utilDecodeTC.call({
				valueHex: (new Uint8Array([0xFF, 0x00])).buffer
			}), -256, "Incorrect result #4");
		assert.equal(pvutils.utilDecodeTC.call({
				valueHex: (new Uint8Array([0x00, 0x80])).buffer
			}), 128, "Incorrect result #5");
		assert.equal(pvutils.utilDecodeTC.call({
				valueHex: (new Uint8Array([0xFF, 0x80])).buffer,
				warnings: []
			}), -128, "Incorrect result #6");
		assert.equal(pvutils.utilDecodeTC.call({
				valueHex: (new Uint8Array([0x80])).buffer,
			}), -128, "Incorrect result #7");
	});
	
	it("utilEncodeTC", () =>
	{
		assert.equal(pvutils.bufferToHexCodes(pvutils.utilEncodeTC(32639)), "7F7F", "Invalid result #1");
		assert.equal(pvutils.bufferToHexCodes(pvutils.utilEncodeTC(-32639)), "8081", "Invalid result #2");
		assert.equal(pvutils.bufferToHexCodes(pvutils.utilEncodeTC(256)), "0100", "Invalid result #3");
		assert.equal(pvutils.bufferToHexCodes(pvutils.utilEncodeTC(-256)), "FF00", "Invalid result #4");
		assert.equal(pvutils.bufferToHexCodes(pvutils.utilEncodeTC(128)), "0080", "Invalid result #5");
		assert.equal(pvutils.bufferToHexCodes(pvutils.utilEncodeTC(18446744073709552001)), "", "Invalid result #6");
	});
	
	it("isEqualBuffer", () =>
	{
		assert.equal(pvutils.isEqualBuffer(data.buffer, data.buffer), true, "Incorrect result #1");
		assert.equal(pvutils.isEqualBuffer(data.buffer, (new Uint8Array()).buffer), false, "Incorrect result #2");
		assert.equal(pvutils.isEqualBuffer(data.buffer, (new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0F])).buffer), false, "Incorrect result #3");
	});
	
	it("padNumber", () =>
	{
		assert.equal(pvutils.padNumber(1, -1), "", "Incorrect result #1");
		assert.equal(pvutils.padNumber(1, 1), "1", "Incorrect result #2");
		assert.equal(pvutils.padNumber(1, 2), "01", "Incorrect result #2");
	});
	
	it("toBase64", () =>
	{
		assert.equal(pvutils.toBase64("\x01\x02\x03\x04\x05\x06\x07\x08\xFF\xFF"), "AQIDBAUGBwj//w==", "Incorrect result #1");
		assert.equal(pvutils.toBase64("\x01\x02\x03\x04\x05\x06\x07\x08\xFF\xFF", true), "AQIDBAUGBwj__w==", "Incorrect result #2");
		assert.equal(pvutils.toBase64("\x01\x02\x03\x04\x05\x06\xFF\xFF\xFF\xFF", true, true), "AQIDBAUG_____w", "Incorrect result #3");
		assert.equal(pvutils.toBase64("\x00\x00\x01\x02\x03\x04\x05\x06\xFF\xFF\xFF\xFF\xFF", true, true, true), "AQIDBAUG______8", "Incorrect result #4");
	});
	
	it("fromBase64", () =>
	{
		assert.equal(pvutils.fromBase64("AQIDBAUGBwj//w=="), "\x01\x02\x03\x04\x05\x06\x07\x08\xFF\xFF", "Incorrect result #1");
		assert.equal(pvutils.fromBase64("AQIDBAUGBwj__w==", true), "\x01\x02\x03\x04\x05\x06\x07\x08\xFF\xFF", "Incorrect result #2");
		assert.equal(pvutils.fromBase64("AQIDBAUGBwj__wAA", true, true), "\x01\x02\x03\x04\x05\x06\x07\x08\xFF\xFF", "Incorrect result #3");
		assert.equal(pvutils.fromBase64("AQIDBAUGBwj__w==", true, true), "\x01\x02\x03\x04\x05\x06\x07\x08\xFF\xFF", "Incorrect result #4");
		assert.equal(pvutils.fromBase64("AAAAAA====", true, true), "", "Incorrect result #5");
	});
	
	it("arrayBufferToString", () =>
	{
		assert.equal(pvutils.arrayBufferToString(data.buffer), "\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A", "Incorrect result #1");
 	});
	
	it("stringToArrayBuffer", () =>
	{
		assert.equal(pvutils.isEqualBuffer(pvutils.stringToArrayBuffer("\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A"), data.buffer), true, "Incorrect result");
	});
	
	it("nearestPowerOf2", () =>
	{
		assert.equal(pvutils.nearestPowerOf2(7), 3, "Incorrect result #1");
		assert.equal(pvutils.nearestPowerOf2(5), 2, "Incorrect result #2");
	});
});
//**************************************************************************************
