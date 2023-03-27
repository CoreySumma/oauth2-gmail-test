export function base64UrlToBase64(base64Url) {
  let base64 = base64Url.replace("-", "+").replace("_", "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return base64;
}

export function base64ToUint8Array(base64) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
