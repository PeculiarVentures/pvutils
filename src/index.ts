
/**
 * Making UTC date from local date
 * @params date Date to convert from
 */
export function getUTCDate(date: Date): Date {
	return new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
}

/**
 * Get value for input parameters, or set a default value
 * @param parameters
 * @param name
 * @param defaultValue
 */
export function getParametersValue<T = unknown>(parameters: Record<string, any>, name: string, defaultValue: T): T {
	if ((parameters instanceof Object) === false) {
		return defaultValue;
	}

	return parameters[name] ?? defaultValue;
}

/**
 * Converts "ArrayBuffer" into a hexadecimal string
 * @param inputBuffer
 * @param inputOffset
 * @param inputLength
 * @param insertSpace
 */
export function bufferToHexCodes(inputBuffer: ArrayBuffer, inputOffset = 0, inputLength = (inputBuffer.byteLength - inputOffset), insertSpace = false): string {
	let result = "";

	for (const item of (new Uint8Array(inputBuffer, inputOffset, inputLength))) {
		const str = item.toString(16).toUpperCase();

		if (str.length === 1) {
			result += "0";
		}

		result += str;

		if (insertSpace) {
			result += " ";
		}
	}

	return result.trim();
}

export interface LocalBaseBlock {
	error?: string;
}

/**
 * Check input "ArrayBuffer" for common functions
 * @param {LocalBaseBlock} baseBlock
 * @param {ArrayBuffer} inputBuffer
 * @param {number} inputOffset
 * @param {number} inputLength
 * @returns {boolean}
 */
export function checkBufferParams(baseBlock: LocalBaseBlock, inputBuffer: ArrayBuffer, inputOffset: number, inputLength: number): boolean {
	if (!(inputBuffer instanceof ArrayBuffer)) {
		baseBlock.error = "Wrong parameter: inputBuffer must be \"ArrayBuffer\"";

		return false;
	}

	if (!inputBuffer.byteLength) {
		baseBlock.error = "Wrong parameter: inputBuffer has zero length";

		return false;
	}

	if (inputOffset < 0) {
		baseBlock.error = "Wrong parameter: inputOffset less than zero";

		return false;
	}

	if (inputLength < 0) {
		baseBlock.error = "Wrong parameter: inputLength less than zero";

		return false;
	}

	if ((inputBuffer.byteLength - inputOffset - inputLength) < 0) {
		baseBlock.error = "End of input reached before message was fully decoded (inconsistent offset and length values)";

		return false;
	}

	return true;
}

/**
 * Convert number from 2^base to 2^10
 * @param inputBuffer
 * @param inputBase
 */
export function utilFromBase(inputBuffer: Uint8Array, inputBase: number): number {
	let result = 0;

	if (inputBuffer.length === 1) {
		return inputBuffer[0];
	}

	for (let i = (inputBuffer.length - 1); i >= 0; i--) {
		result += inputBuffer[(inputBuffer.length - 1) - i] * Math.pow(2, inputBase * i);
	}

	return result;
}

/**
 * Convert number from 2^10 to 2^base
 * @param value The number to convert
 * @param base The base for 2^base
 * @param reserved Pre-defined number of bytes in output array (-1 = limited by function itself)
 */
export function utilToBase(value: number, base: number, reserved = (-1)): ArrayBuffer {
	const internalReserved = reserved;
	let internalValue = value;

	let result = 0;
	let biggest = Math.pow(2, base);

	for (let i = 1; i < 8; i++) {
		if (value < biggest) {
			let retBuf;

			if (internalReserved < 0) {
				retBuf = new ArrayBuffer(i);
				result = i;
			} else {
				if (internalReserved < i) {
					return (new ArrayBuffer(0));
				}

				retBuf = new ArrayBuffer(internalReserved);

				result = internalReserved;
			}

			const retView = new Uint8Array(retBuf);

			for (let j = (i - 1); j >= 0; j--) {
				const basis = Math.pow(2, j * base);

				retView[result - j - 1] = Math.floor(internalValue / basis);
				internalValue -= (retView[result - j - 1]) * basis;
			}

			return retBuf;
		}

		biggest *= Math.pow(2, base);
	}

	return new ArrayBuffer(0);
}

/**
 * Concatenate two ArrayBuffers
 * @param buffers Set of ArrayBuffer
 */
export function utilConcatBuf(...buffers: ArrayBuffer[]): ArrayBuffer {
	//#region Initial variables
	let outputLength = 0;
	let prevLength = 0;
	//#endregion

	//#region Calculate output length
	for (const buffer of buffers) {
		outputLength += buffer.byteLength;
	}
	//#endregion

	const retBuf = new ArrayBuffer(outputLength);
	const retView = new Uint8Array(retBuf);

	for (const buffer of buffers) {
		retView.set(new Uint8Array(buffer), prevLength);
		prevLength += buffer.byteLength;
	}

	return retBuf;
}

/**
 * Concatenate two Uint8Array
 * @param  views Set of Uint8Array
 */
export function utilConcatView(...views: Uint8Array[]): Uint8Array {
	//#region Initial variables
	let outputLength = 0;
	let prevLength = 0;
	//#endregion

	//#region Calculate output length
	for (const view of views) {
		outputLength += view.length;
	}
	//#endregion

	const retBuf = new ArrayBuffer(outputLength);
	const retView = new Uint8Array(retBuf);

	for (const view of views) {
		retView.set(view, prevLength);
		prevLength += view.length;
	}

	return retView;
}

export interface HexBlock {
	valueHex: ArrayBuffer;
	warnings: string[];
}
/**
 * Decoding of "two complement" values
 * The function must be called in scope of instance of "hexBlock" class ("valueHex" and "warnings" properties must be present)
 */
export function utilDecodeTC(this: HexBlock): number {
	const buf = new Uint8Array(this.valueHex);

	if (this.valueHex.byteLength >= 2) {
		const condition1 = (buf[0] === 0xFF) && (buf[1] & 0x80);
		const condition2 = (buf[0] === 0x00) && ((buf[1] & 0x80) === 0x00);

		if (condition1 || condition2) {
			this.warnings.push("Needlessly long format");
		}
	}

	//#region Create big part of the integer
	const bigIntBuffer = new ArrayBuffer(this.valueHex.byteLength);
	const bigIntView = new Uint8Array(bigIntBuffer);
	for (let i = 0; i < this.valueHex.byteLength; i++) {
		bigIntView[i] = 0;
	}

	bigIntView[0] = (buf[0] & 0x80); // mask only the biggest bit

	const bigInt = utilFromBase(bigIntView, 8);
	//#endregion

	//#region Create small part of the integer
	const smallIntBuffer = new ArrayBuffer(this.valueHex.byteLength);
	const smallIntView = new Uint8Array(smallIntBuffer);
	for (let j = 0; j < this.valueHex.byteLength; j++) {
		smallIntView[j] = buf[j];
	}

	smallIntView[0] &= 0x7F; // mask biggest bit

	const smallInt = utilFromBase(smallIntView, 8);
	//#endregion

	return (smallInt - bigInt);
}

/**
 * Encode integer value to "two complement" format
 * @param value Value to encode
 */
export function utilEncodeTC(value: number): ArrayBuffer {
	const modValue = (value < 0) ? (value * (-1)) : value;
	let bigInt = 128;

	for (let i = 1; i < 8; i++) {
		if (modValue <= bigInt) {
			if (value < 0) {
				const smallInt = bigInt - modValue;

				const retBuf = utilToBase(smallInt, 8, i);
				const retView = new Uint8Array(retBuf);

				retView[0] |= 0x80;

				return retBuf;
			}

			let retBuf = utilToBase(modValue, 8, i);
			let retView = new Uint8Array(retBuf);

			if (retView[0] & 0x80) {
				const tempBuf = retBuf.slice(0);
				const tempView = new Uint8Array(tempBuf);

				retBuf = new ArrayBuffer(retBuf.byteLength + 1);
				retView = new Uint8Array(retBuf);

				for (let k = 0; k < tempBuf.byteLength; k++) {
					retView[k + 1] = tempView[k];
				}

				retView[0] = 0x00;
			}

			return retBuf;
		}

		bigInt *= Math.pow(2, 8);
	}

	return (new ArrayBuffer(0));
}

/**
 * Compare two array buffers
 * @param inputBuffer1
 * @param inputBuffer2
 */
export function isEqualBuffer(inputBuffer1: ArrayBuffer, inputBuffer2: ArrayBuffer): boolean {
	if (inputBuffer1.byteLength !== inputBuffer2.byteLength) {
		return false;
	}

	const view1 = new Uint8Array(inputBuffer1);
	const view2 = new Uint8Array(inputBuffer2);

	for (let i = 0; i < view1.length; i++) {
		if (view1[i] !== view2[i]) {
			return false;
		}
	}

	return true;
}

/**
 * Pad input number with leaded "0" if needed
 * @param inputNumber
 * @param fullLength
 */
export function padNumber(inputNumber: number, fullLength: number): string {
	const str = inputNumber.toString(10);

	if (fullLength < str.length) {
		return "";
	}

	const dif = fullLength - str.length;

	const padding = new Array(dif);
	for (let i = 0; i < dif; i++) {
		padding[i] = "0";
	}

	const paddingString = padding.join("");

	return paddingString.concat(str);
}

const base64Template = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
const base64UrlTemplate = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=";

/**
 * Encode string into BASE64 (or "base64url")
 * @param input
 * @param useUrlTemplate If "true" then output would be encoded using "base64url"
 * @param skipPadding Skip BASE-64 padding or not
 * @param skipLeadingZeros Skip leading zeros in input data or not
 */
export function toBase64(input: string, useUrlTemplate = false, skipPadding = false, skipLeadingZeros = false): string {
	let i = 0;
	let flag1 = 0;
	let flag2 = 0;
	let output = "";

	const template = (useUrlTemplate) ? base64UrlTemplate : base64Template;

	if (skipLeadingZeros) {
		let nonZeroPosition = 0;

		for (let i = 0; i < input.length; i++) {
			if (input.charCodeAt(i) !== 0) {
				nonZeroPosition = i;
				break;
			}
		}

		input = input.slice(nonZeroPosition);
	}

	while (i < input.length) {
		const chr1 = input.charCodeAt(i++);
		if (i >= input.length) {
			flag1 = 1;
		}
		const chr2 = input.charCodeAt(i++);
		if (i >= input.length) {
			flag2 = 1;
		}

		const chr3 = input.charCodeAt(i++);
		const enc1 = chr1 >> 2;
		const enc2 = ((chr1 & 0x03) << 4) | (chr2 >> 4);
		let enc3 = ((chr2 & 0x0F) << 2) | (chr3 >> 6);
		let enc4 = chr3 & 0x3F;

		if (flag1 === 1) {
			enc3 = enc4 = 64;
		} else {
			if (flag2 === 1) {
				enc4 = 64;
			}
		}

		if (skipPadding) {
			if (enc3 === 64) {
				output += `${template.charAt(enc1)}${template.charAt(enc2)}`;
			} else {
				if (enc4 === 64) {
					output += `${template.charAt(enc1)}${template.charAt(enc2)}${template.charAt(enc3)}`;
				} else {
					output += `${template.charAt(enc1)}${template.charAt(enc2)}${template.charAt(enc3)}${template.charAt(enc4)}`;
				}
			}
		} else {
			output += `${template.charAt(enc1)}${template.charAt(enc2)}${template.charAt(enc3)}${template.charAt(enc4)}`;
		}
	}

	return output;
}

/**
 * Decode string from BASE64 (or "base64url")
 * @param input
 * @param useUrlTemplate If "true" then output would be encoded using "base64url"
 * @param cutTailZeros If "true" then cut tailing zeros from function result
 */
export function fromBase64(input: string, useUrlTemplate = false, cutTailZeros = false): string {
	const template = (useUrlTemplate) ? base64UrlTemplate : base64Template;

	//#region Aux functions
	function indexOf(toSearch: string): number {
		for (let i = 0; i < 64; i++) {
			if (template.charAt(i) === toSearch)
				return i;
		}

		return 64;
	}

	function test(incoming: number): number {
		return ((incoming === 64) ? 0x00 : incoming);
	}
	//#endregion

	let i = 0;

	let output = "";

	while (i < input.length) {
		const enc1 = indexOf(input.charAt(i++));
		const enc2 = (i >= input.length) ? 0x00 : indexOf(input.charAt(i++));
		const enc3 = (i >= input.length) ? 0x00 : indexOf(input.charAt(i++));
		const enc4 = (i >= input.length) ? 0x00 : indexOf(input.charAt(i++));

		const chr1 = (test(enc1) << 2) | (test(enc2) >> 4);
		const chr2 = ((test(enc2) & 0x0F) << 4) | (test(enc3) >> 2);
		const chr3 = ((test(enc3) & 0x03) << 6) | test(enc4);

		output += String.fromCharCode(chr1);

		if (enc3 !== 64) {
			output += String.fromCharCode(chr2);
		}

		if (enc4 !== 64) {
			output += String.fromCharCode(chr3);
		}
	}

	if (cutTailZeros) {
		const outputLength = output.length;
		let nonZeroStart = (-1);

		for (let i = (outputLength - 1); i >= 0; i--) {
			if (output.charCodeAt(i) !== 0) {
				nonZeroStart = i;
				break;
			}
		}

		if (nonZeroStart !== (-1)) {
			output = output.slice(0, nonZeroStart + 1);
		} else {
			output = "";
		}
	}

	return output;
}

export function arrayBufferToString(buffer: ArrayBuffer): string {
	let resultString = "";
	const view = new Uint8Array(buffer);

	for (const element of view) {
		resultString += String.fromCharCode(element);
	}

	return resultString;
}

export function stringToArrayBuffer(str: string): ArrayBuffer {
	const stringLength = str.length;

	const resultBuffer = new ArrayBuffer(stringLength);
	const resultView = new Uint8Array(resultBuffer);

	for (let i = 0; i < stringLength; i++) {
		resultView[i] = str.charCodeAt(i);
	}

	return resultBuffer;
}

const log2 = Math.log(2);

/**
 * Get nearest to input length power of 2
 * @param length Current length of existing array
 */
export function nearestPowerOf2(length: number): number {
	const base = (Math.log(length) / log2);

	const floor = Math.floor(base);
	const round = Math.round(base);

	return ((floor === round) ? floor : round);
}

/**
 * Delete properties by name from specified object
 * @param object Object to delete properties from
 * @param propsArray Array of properties names
 */

 export function clearProps(object: Record<string, any>, propsArray: string[]): void {

	for (const prop of propsArray) {
		delete object[prop];
	}
}
