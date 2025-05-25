import JSEncrypt from 'jsencrypt';

export function RSAEncrypt(data, publicKey) {
  const encrypt = new JSEncrypt();
  encrypt.setPublicKey(publicKey);
  return encrypt.encrypt(data);
}