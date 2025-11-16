// src/services/authService.js
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import * as LocalAuthentication from 'expo-local-authentication';

const PIN_KEY = 'app_pin_hash';
const PIN_SALT_KEY = 'app_pin_salt';
const BIOMETRY_KEY = 'app_biometry_enabled';
const TOKEN_KEY = 'userToken';

// gera salt hex a partir de bytes aleatórios (expo-crypto)
async function generateSalt(length = 16) {
  // length é número de bytes, entre 0 e 1024
  const bytes = await Crypto.getRandomBytesAsync(length); // Uint8Array
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// SHA-256 de salt + pin -> hex
async function hashPin(salt, pin) {
  return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, salt + pin);
}

// Salva PIN (gera salt + hash)
export async function savePin(pin) {
  const salt = await generateSalt(16);
  const hashed = await hashPin(salt, pin);
  await SecureStore.setItemAsync(PIN_SALT_KEY, salt);
  await SecureStore.setItemAsync(PIN_KEY, hashed);
}

// Verifica PIN
export async function verifyPin(pin) {
  const salt = await SecureStore.getItemAsync(PIN_SALT_KEY);
  const stored = await SecureStore.getItemAsync(PIN_KEY);
  if (!salt || !stored) return false;
  const hashed = await hashPin(salt, pin);
  return hashed === stored;
}

export async function clearPinAndBiometry() {
  await SecureStore.deleteItemAsync(PIN_SALT_KEY);
  await SecureStore.deleteItemAsync(PIN_KEY);
  await SecureStore.deleteItemAsync(BIOMETRY_KEY);
}

// Biometria helpers
export async function setBiometry(enabled = true) {
  await SecureStore.setItemAsync(BIOMETRY_KEY, enabled ? '1' : '0');
}
export async function isBiometryEnabled() {
  const v = await SecureStore.getItemAsync(BIOMETRY_KEY);
  return v === '1';
}
export async function canUseBiometry() {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && enrolled;
  } catch (e) {
    return false;
  }
}
export async function authWithBiometrics(prompt = 'Autentique-se') {
  try {
    const res = await LocalAuthentication.authenticateAsync({
      promptMessage: prompt,
      disableDeviceFallback: false,
    });
    return res.success === true;
  } catch (e) {
    return false;
  }
}

// Token helpers (simples)
export async function saveToken(token) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}
export async function getToken() {
  return await SecureStore.getItemAsync(TOKEN_KEY);
}
export async function removeToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
