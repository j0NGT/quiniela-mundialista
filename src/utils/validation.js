// ============================================================
// VALIDATION — Validaciones de entrada
// ============================================================

/**
 * Valida un valor de goles
 * @returns {{ valid: boolean, value: number|null, error: string|null }}
 */
export function validateGoals(value) {
  var trimmed = String(value).trim();
  if (trimmed === '') return { valid: true, value: null, error: null };
  var num = parseInt(trimmed);
  if (isNaN(num) || num < 0) return { valid: false, value: null, error: 'Valor inválido' };
  return { valid: true, value: num, error: null };
}

/**
 * Valida un nombre de jugador
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validateName(name) {
  var trimmed = (name || '').trim();
  if (!trimmed) return { valid: false, error: 'Ingresa tu nombre' };
  if (trimmed.length < 2) return { valid: false, error: 'Mínimo 2 caracteres' };
  return { valid: true, error: null };
}

/**
 * Valida un PIN
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validatePin(pin) {
  var trimmed = (pin || '').trim();
  if (!trimmed) return { valid: false, error: 'Ingresa el PIN' };
  if (trimmed.length < 3) return { valid: false, error: 'PIN mínimo 3 caracteres' };
  return { valid: true, error: null };
}
