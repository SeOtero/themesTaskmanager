import { describe, it, expect, vi } from 'vitest';

// wallet.service.js importa '../firebase', que a su vez requiere variables de entorno
// (VITE_FIREBASE_*) y crea una conexión real. Para un test unitario rápido y sin red,
// mockeamos ambos módulos y probamos solo la lógica pura (cleanDataStructure).
vi.mock('../../src/firebase', () => ({ db: {} }));
vi.mock('firebase/firestore', () => ({
    doc: vi.fn(),
    getDoc: vi.fn(),
    setDoc: vi.fn(),
}));

const { cleanDataStructure } = await import('../../src/services/wallet.service');

describe('cleanDataStructure (parseo defensivo del saldo)', () => {
    it('devuelve el número directo si ya es un número', () => {
        expect(cleanDataStructure(150)).toBe(150);
    });

    it('devuelve 0 si data es null/undefined', () => {
        expect(cleanDataStructure(null)).toBe(0);
        expect(cleanDataStructure(undefined)).toBe(0);
    });

    it('extrae el valor desde data.value / data.coins / data.lofiCoins', () => {
        expect(cleanDataStructure({ value: 200 })).toBe(200);
        expect(cleanDataStructure({ coins: 75 })).toBe(75);
        expect(cleanDataStructure({ lofiCoins: 30 })).toBe(30);
    });

    it('recorre recursivamente data.val si existe (estructura anidada)', () => {
        expect(cleanDataStructure({ val: { value: 999 } })).toBe(999);
    });

    it('devuelve 0 ante un objeto sin ninguna propiedad reconocida (no debe inventar saldo)', () => {
        expect(cleanDataStructure({ foo: 'bar' })).toBe(0);
    });

    it('nunca devuelve NaN, incluso con datos corruptos', () => {
        const result = cleanDataStructure({ value: 'no-es-un-numero' });
        expect(Number.isNaN(result)).toBe(false);
    });
});
