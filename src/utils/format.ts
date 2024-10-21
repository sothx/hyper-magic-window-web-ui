  // 将 Uint8Array 转换为 Base64 字符串
  export function arrayBufferToBase64(buffer: Uint8Array): string {
    let binary = '';
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);  // 使用 btoa 转换为 Base64
  }

  // 将 Base64 字符串转换为 Uint8Array
export function base64ToArrayBuffer(base64: string): Uint8Array {
    const binaryString = window.atob(base64);  // 使用 atob 解码
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
  
    return bytes;
}
