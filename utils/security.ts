import CryptoJS from 'crypto-js';

// NOTA: En producción, define VITE_ENCRYPTION_KEY en tu archivo .env
// Si no existe, usamos una por defecto (menos seguro, pero funcional para evitar errores)
const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'CLAVE_SECRETA_POR_DEFECTO_CAMBIAR_EN_ENV';

export const encryptData = (text: string): string => {
  if (!text) return '';
  try {
    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
  } catch (error) {
    console.error("Error encriptando:", error);
    return text;
  }
};

export const decryptData = (cipherText: string): string => {
  if (!cipherText) return '';
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText || cipherText; // Retorna cipherText si falla (ej. si no estaba encriptado antes)
  } catch (error) {
    console.error("Error desencriptando:", error);
    return cipherText;
  }
};
