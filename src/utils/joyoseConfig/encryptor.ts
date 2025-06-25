import CryptoJS from 'crypto-js';

/**
 * 生成与 Node.js 相同的 AES-256 密钥
 */
export function generateKey(): CryptoJS.lib.WordArray {
  const arr = [
    72, 75, 73, 71, 73, 74, 72, 77, 73, 27, 73, 78, 73, 28, 73, 25,
    72, 79, 73, 74, 73, 26, 72, 76, 72, 76, 73, 28, 77, 26, 73, 71
  ];
  const keyBytes = arr.map(b => b ^ 0x7F);
  return CryptoJS.lib.WordArray.create(new Uint8Array(keyBytes));
}

/**
 * 使用 AES-256-ECB 加密 UTF-8 字符串
 * @param inputText 明文字符串（如 JSON）
 * @param key 密钥 WordArray（可选）
 * @returns 加密后的 Uint8Array 数据
 */
export function encryptAesEcb(inputText: string, key?: CryptoJS.lib.WordArray): Uint8Array {
  const actualKey = key || generateKey();

  // 加密：明文先转成 WordArray
  const encrypted = CryptoJS.AES.encrypt(
    CryptoJS.enc.Utf8.parse(inputText),
    actualKey,
    {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    }
  );

  // 加密结果是 Base64 字符串，先转 WordArray 再转 Uint8Array
  const ciphertextWords = CryptoJS.enc.Base64.parse(encrypted.toString());

  const { words, sigBytes } = ciphertextWords;
  const encryptedBytes = new Uint8Array(sigBytes);
  for (let i = 0; i < sigBytes; i++) {
    encryptedBytes[i] = (words[Math.floor(i / 4)] >> (24 - (i % 4) * 8)) & 0xFF;
  }

  return encryptedBytes;
}

/**
 * 用于压缩 JSON 内容为单行（可选）
 */
export function compressJson(text: string): string {
  try {
    const json = JSON.parse(text);
    return JSON.stringify(json); // 压缩成单行 JSON
  } catch {
    return text; // 非 JSON 内容直接返回
  }
}
