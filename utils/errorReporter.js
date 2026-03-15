import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@bdg_error_log';
const MAX_ENTRIES = 20;

function normalizeError(error) {
  if (!error) return { message: 'Unknown error', stack: '' };
  if (typeof error === 'string') return { message: error, stack: '' };
  return {
    message: error.message || 'Unknown error',
    stack: error.stack || '',
    name: error.name || 'Error',
  };
}

export async function reportError(error, info = {}, context = {}) {
  try {
    const normalized = normalizeError(error);
    const entry = {
      id: `${Date.now()}`,
      timestamp: new Date().toISOString(),
      message: normalized.message,
      name: normalized.name,
      stack: normalized.stack,
      componentStack: info.componentStack || info.componentStack || '',
      isFatal: Boolean(info.isFatal),
      context,
    };

    const existing = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed = existing ? JSON.parse(existing) : [];
    const next = [entry, ...parsed].slice(0, MAX_ENTRIES);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (err) {
    console.error('Failed to store error log', err);
  }
}

export async function getErrorLog() {
  const existing = await AsyncStorage.getItem(STORAGE_KEY);
  return existing ? JSON.parse(existing) : [];
}

export async function clearErrorLog() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

let handlerInstalled = false;

export function installGlobalErrorHandler() {
  if (handlerInstalled || !global?.ErrorUtils?.setGlobalHandler) return;
  handlerInstalled = true;

  const defaultHandler =
    typeof global.ErrorUtils.getGlobalHandler === 'function'
      ? global.ErrorUtils.getGlobalHandler()
      : null;

  global.ErrorUtils.setGlobalHandler((error, isFatal) => {
    reportError(error, { isFatal }).catch(() => null);
    if (typeof defaultHandler === 'function') {
      defaultHandler(error, isFatal);
    }
  });
}
