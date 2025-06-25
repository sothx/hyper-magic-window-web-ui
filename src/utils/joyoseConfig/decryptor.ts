import CryptoJS from 'crypto-js';
import axios, { type AxiosResponse } from 'axios';

// 类型定义
type DecryptedResult = {
  data: any; // 解密后的 JSON 数据
  fileName: string;
};

/**
 * 生成解密密钥
 */
export function generateKey(): CryptoJS.lib.WordArray {
  const arr = [
    72, 75, 73, 71, 73, 74, 72, 77, 73, 27, 73, 78, 73, 28, 73, 25,
    72, 79, 73, 74, 73, 26, 72, 76, 72, 76, 73, 28, 77, 26, 73, 71,
  ];
  const keyBytes = arr.map((b) => b ^ 0x7F);
  return CryptoJS.lib.WordArray.create(new Uint8Array(keyBytes));
}

/**
 * AES-256-ECB 解密
 * @param encryptedData 加密数据
 * @param key 密钥
 * @returns 解密后的字符串
 */
export function decryptAesEcb(
  encryptedData: ArrayBuffer,
  key: CryptoJS.lib.WordArray
): string {
  const wordArray = CryptoJS.lib.WordArray.create(encryptedData);

  // ✅ 创建 CipherParams 对象，避免类型报错
  const cipherParams = CryptoJS.lib.CipherParams.create({
    ciphertext: wordArray,
  });

  const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });

  // 使用 UTF-8 解码（原来是 Latin1，可能出现乱码）
  return CryptoJS.enc.Utf8.stringify(decrypted);
}

/**
 * 从 URL 中提取文件名
 */
export function extractFileNameFromUrl(url: string): string {
  return url.split('/').pop() || 'file.json';
}

/**
 * 获取并解密 JSON 文件
 * @param fileUrl 文件 URL
 * @returns 解密后的 JSON 数据
 */
export async function fetchAndDecryptJsonFile(fileUrl: string): Promise<DecryptedResult> {
  try {
    // 获取加密文件（二进制）
    const response: AxiosResponse<ArrayBuffer> = await axios.get(fileUrl, {
      responseType: 'arraybuffer',
    });

    const key = generateKey();
    const decryptedString = decryptAesEcb(response.data, key);

    const jsonData = JSON.parse(decryptedString);

    return {
      data: jsonData,
      fileName: extractFileNameFromUrl(fileUrl),
    };
  } catch (error) {
    console.error('文件解密失败:', error);
    throw new Error(`文件解密失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}
