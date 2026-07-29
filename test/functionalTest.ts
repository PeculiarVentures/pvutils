import { describe, it, expect } from "vitest";

import * as pvutils from "../src";
import { clearProps } from "../src";

describe('Functional Tests for "pvutils" package', () => {
  const data = new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a]);

  it("getUTCDate", () => {
    const date = new Date();
    expect(pvutils.getUTCDate(date), "Incorrect Date processing").toEqual(
      new Date(date.getTime() + date.getTimezoneOffset() * 60000),
    );
  });

  it("getParametersValue", () => {
    expect(pvutils.getParametersValue(1 as any, "name", 2), "Incorrect return value #1").toBe(2);
    expect(pvutils.getParametersValue({ name: 33 }, "name", 2), "Incorrect return value #2").toBe(
      33,
    );
    expect(pvutils.getParametersValue({ name: 33 }, "fake", 2), "Incorrect return value #3").toBe(
      2,
    );
  });

  it("bufferToHexCodes", () => {
    expect(pvutils.bufferToHexCodes(data.buffer), "Incorrect return value #1").toBe(
      "0102030405060708090A",
    );
    expect(pvutils.bufferToHexCodes(data.buffer, 1), "Incorrect return value #2").toBe(
      "02030405060708090A",
    );
    expect(pvutils.bufferToHexCodes(data.buffer, 1, 3), "Incorrect return value #3").toBe("020304");
    expect(pvutils.bufferToHexCodes(data.buffer, 1, 3, true), "Incorrect return value #3").toBe(
      "02 03 04",
    );
  });

  it("checkBufferParams", () => {
    const baseBlock = {} as pvutils.LocalBaseBlock;

    let result = pvutils.checkBufferParams(baseBlock, 1 as any, 1, 1);
    expect(result, "Incorrect return value #1").toBe(false);
    expect(baseBlock.error, "Incorrect error message").toBe(
      'Wrong parameter: inputBuffer must be "ArrayBuffer"',
    );

    result = pvutils.checkBufferParams(baseBlock, new Uint8Array().buffer, 1, 1);
    expect(result, "Incorrect return value #2").toBe(false);
    expect(baseBlock.error, "Incorrect error message").toBe(
      "Wrong parameter: inputBuffer has zero length",
    );

    result = pvutils.checkBufferParams(baseBlock, data.buffer, -1, 1);
    expect(result, "Incorrect return value #3").toBe(false);
    expect(baseBlock.error, "Incorrect error message").toBe(
      "Wrong parameter: inputOffset less than zero",
    );

    result = pvutils.checkBufferParams(baseBlock, data.buffer, 1, -1);
    expect(result, "Incorrect return value #4").toBe(false);
    expect(baseBlock.error, "Incorrect error message").toBe(
      "Wrong parameter: inputLength less than zero",
    );

    result = pvutils.checkBufferParams(baseBlock, data.buffer, 11, 1);
    expect(result, "Incorrect return value #5").toBe(false);
    expect(baseBlock.error, "Incorrect error message").toBe(
      "End of input reached before message was fully decoded (inconsistent offset and length values)",
    );

    result = pvutils.checkBufferParams(baseBlock, data.buffer, 1, 1);
    expect(result, "Incorrect return value #6").toBe(true);
  });

  it("utilFromBase", () => {
    expect(pvutils.utilFromBase(new Uint8Array([0x01]), 7), "Incorrect result #1").toBe(1);
    expect(pvutils.utilFromBase(new Uint8Array([0x01, 0x01]), 7), "Incorrect result #2").toBe(129);
    expect(pvutils.utilFromBase(new Uint8Array([0x01, 0x01, 0x01]), 7), "Incorrect result #3").toBe(
      16513,
    );
  });

  it("utilToBase", () => {
    expect(pvutils.bufferToHexCodes(pvutils.utilToBase(1, 7)), "Incorrect result #1").toBe("01");
    expect(pvutils.bufferToHexCodes(pvutils.utilToBase(129, 7)), "Incorrect result #2").toBe(
      "0101",
    );
    expect(pvutils.bufferToHexCodes(pvutils.utilToBase(16513, 7)), "Incorrect result #3").toBe(
      "010101",
    );
    expect(pvutils.bufferToHexCodes(pvutils.utilToBase(16513, 7, 4)), "Incorrect result #4").toBe(
      "00010101",
    );
    expect(pvutils.bufferToHexCodes(pvutils.utilToBase(16513, 7, 0)), "Incorrect result #5").toBe(
      "",
    );
    expect(pvutils.bufferToHexCodes(pvutils.utilToBase(16777218, 3)), "Incorrect result #6").toBe(
      "",
    );
  });

  it("utilConcatBuf", () => {
    expect(
      pvutils.bufferToHexCodes(pvutils.utilConcatBuf(data.buffer)),
      "Incorrect return value #1",
    ).toBe("0102030405060708090A");
    expect(
      pvutils.bufferToHexCodes(pvutils.utilConcatBuf(data.buffer, data.buffer)),
      "Incorrect return value #2",
    ).toBe("0102030405060708090A0102030405060708090A");
    expect(
      pvutils.bufferToHexCodes(pvutils.utilConcatBuf(data.buffer, data.buffer, data.buffer)),
      "Incorrect return value #3",
    ).toBe("0102030405060708090A0102030405060708090A0102030405060708090A");
  });

  it("utilConcatView", () => {
    expect(
      pvutils.bufferToHexCodes(pvutils.utilConcatView(data).buffer),
      "Incorrect return value #1",
    ).toBe("0102030405060708090A");
    expect(
      pvutils.bufferToHexCodes(pvutils.utilConcatView(data, data).buffer),
      "Incorrect return value #2",
    ).toBe("0102030405060708090A0102030405060708090A");
    expect(
      pvutils.bufferToHexCodes(pvutils.utilConcatView(data, data, data).buffer),
      "Incorrect return value #3",
    ).toBe("0102030405060708090A0102030405060708090A0102030405060708090A");
  });

  it("utilDecodeTC", () => {
    expect(
      pvutils.utilDecodeTC.call({
        valueHex: new Uint8Array([0x7f, 0x7f]).buffer,
        warnings: [],
      }),
      "Incorrect result #1",
    ).toBe(32639);
    expect(
      pvutils.utilDecodeTC.call({
        valueHex: new Uint8Array([0x80, 0x81]).buffer,
        warnings: [],
      }),
      "Incorrect result #2",
    ).toBe(-32639);
    expect(
      pvutils.utilDecodeTC.call({
        valueHex: new Uint8Array([0x01, 0x00]).buffer,
        warnings: [],
      }),
      "Incorrect result #3",
    ).toBe(256);
    expect(
      pvutils.utilDecodeTC.call({
        valueHex: new Uint8Array([0xff, 0x00]).buffer,
        warnings: [],
      }),
      "Incorrect result #4",
    ).toBe(-256);
    expect(
      pvutils.utilDecodeTC.call({
        valueHex: new Uint8Array([0x00, 0x80]).buffer,
        warnings: [],
      }),
      "Incorrect result #5",
    ).toBe(128);
    expect(
      pvutils.utilDecodeTC.call({
        valueHex: new Uint8Array([0xff, 0x80]).buffer,
        warnings: [],
      }),
      "Incorrect result #6",
    ).toBe(-128);
    expect(
      pvutils.utilDecodeTC.call({
        valueHex: new Uint8Array([0x80]).buffer,
        warnings: [],
      }),
      "Incorrect result #7",
    ).toBe(-128);
  });

  it("utilEncodeTC", () => {
    expect(pvutils.bufferToHexCodes(pvutils.utilEncodeTC(32639)), "Invalid result #1").toBe("7F7F");
    expect(pvutils.bufferToHexCodes(pvutils.utilEncodeTC(-32639)), "Invalid result #2").toBe(
      "8081",
    );
    expect(pvutils.bufferToHexCodes(pvutils.utilEncodeTC(256)), "Invalid result #3").toBe("0100");
    expect(pvutils.bufferToHexCodes(pvutils.utilEncodeTC(-256)), "Invalid result #4").toBe("FF00");
    expect(pvutils.bufferToHexCodes(pvutils.utilEncodeTC(128)), "Invalid result #5").toBe("0080");
    expect(
      // oxlint-disable-next-line no-loss-of-precision
      pvutils.bufferToHexCodes(pvutils.utilEncodeTC(18446744073709552001)),
      "Invalid result #6",
    ).toBe("");
  });

  it("isEqualBuffer", () => {
    expect(pvutils.isEqualBuffer(data.buffer, data.buffer), "Incorrect result #1").toBe(true);
    expect(pvutils.isEqualBuffer(data.buffer, new Uint8Array().buffer), "Incorrect result #2").toBe(
      false,
    );
    expect(
      pvutils.isEqualBuffer(
        data.buffer,
        new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0f]).buffer,
      ),
      "Incorrect result #3",
    ).toBe(false);
  });

  it("padNumber", () => {
    expect(pvutils.padNumber(1, -1), "Incorrect result #1").toBe("");
    expect(pvutils.padNumber(1, 1), "Incorrect result #2").toBe("1");
    expect(pvutils.padNumber(1, 2), "Incorrect result #2").toBe("01");
  });

  it("toBase64", () => {
    expect(
      pvutils.toBase64("\x01\x02\x03\x04\x05\x06\x07\x08\xFF\xFF"),
      "Incorrect result #1",
    ).toBe("AQIDBAUGBwj//w==");
    expect(
      pvutils.toBase64("\x01\x02\x03\x04\x05\x06\x07\x08\xFF\xFF", true),
      "Incorrect result #2",
    ).toBe("AQIDBAUGBwj__w==");
    expect(
      pvutils.toBase64("\x01\x02\x03\x04\x05\x06\xFF\xFF\xFF\xFF", true, true),
      "Incorrect result #3",
    ).toBe("AQIDBAUG_____w");
    expect(
      pvutils.toBase64("\x00\x00\x01\x02\x03\x04\x05\x06\xFF\xFF\xFF\xFF\xFF", true, true, true),
      "Incorrect result #4",
    ).toBe("AQIDBAUG______8");
  });

  it("fromBase64", () => {
    expect(pvutils.fromBase64("AQIDBAUGBwj//w=="), "Incorrect result #1").toBe(
      "\x01\x02\x03\x04\x05\x06\x07\x08\xFF\xFF",
    );
    expect(pvutils.fromBase64("AQIDBAUGBwj__w==", true), "Incorrect result #2").toBe(
      "\x01\x02\x03\x04\x05\x06\x07\x08\xFF\xFF",
    );
    expect(pvutils.fromBase64("AQIDBAUGBwj__wAA", true, true), "Incorrect result #3").toBe(
      "\x01\x02\x03\x04\x05\x06\x07\x08\xFF\xFF",
    );
    expect(pvutils.fromBase64("AQIDBAUGBwj__w==", true, true), "Incorrect result #4").toBe(
      "\x01\x02\x03\x04\x05\x06\x07\x08\xFF\xFF",
    );
    expect(pvutils.fromBase64("AAAAAA====", true, true), "Incorrect result #5").toBe("");
    expect(pvutils.fromBase64("AAAAAAAAA", true, true), "Incorrect result #6").toBe("");
  });

  it("arrayBufferToString", () => {
    expect(pvutils.arrayBufferToString(data.buffer), "Incorrect result #1").toBe(
      "\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A",
    );
  });

  it("stringToArrayBuffer", () => {
    expect(
      pvutils.isEqualBuffer(
        pvutils.stringToArrayBuffer("\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A"),
        data.buffer,
      ),
      "Incorrect result",
    ).toBe(true);
  });

  it("nearestPowerOf2", () => {
    expect(pvutils.nearestPowerOf2(7), "Incorrect result #1").toBe(3);
    expect(pvutils.nearestPowerOf2(5), "Incorrect result #2").toBe(2);
  });

  it("clearProps", () => {
    const testObject = {
      test: 1,
      test2: 2,
    };

    clearProps(testObject, ["test", "test2"]);

    expect(testObject).toEqual({});
  });
});
