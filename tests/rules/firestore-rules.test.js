import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import {
    initializeTestEnvironment,
    assertFails,
    assertSucceeds,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

let testEnv;

beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
        projectId: 'nexus-os-rules-test',
        firestore: {
            rules: readFileSync('firestore.rules', 'utf8'),
        },
    });
});

afterAll(async () => {
    await testEnv.cleanup();
});

beforeEach(async () => {
    await testEnv.clearFirestore();
});

describe('users/{uid} — creación de perfil', () => {
    it('permite crear el propio perfil con role "agent"', async () => {
        const alice = testEnv.authenticatedContext('alice').firestore();
        await assertSucceeds(
            setDoc(doc(alice, 'users', 'alice'), { role: 'agent', team: 'default' })
        );
    });

    it('BLOQUEA crear el propio perfil con role "admin" (escalación de privilegios)', async () => {
        const mallory = testEnv.authenticatedContext('mallory').firestore();
        await assertFails(
            setDoc(doc(mallory, 'users', 'mallory'), { role: 'admin', team: 'default' })
        );
    });

    it('BLOQUEA crear un perfil a nombre de otro usuario', async () => {
        const mallory = testEnv.authenticatedContext('mallory').firestore();
        await assertFails(
            setDoc(doc(mallory, 'users', 'victim'), { role: 'agent', team: 'default' })
        );
    });
});

describe('users/{uid} — actualización de rol (regresión del bug de seguridad)', () => {
    beforeEach(async () => {
        // Sembramos un usuario 'agent' directamente con permisos de admin (bypass de reglas)
        await testEnv.withSecurityRulesDisabled(async (ctx) => {
            await setDoc(doc(ctx.firestore(), 'users', 'mallory'), {
                role: 'agent',
                team: 'default',
            });
        });
    });

    it('BLOQUEA que un usuario cambie su propio role a "admin"', async () => {
        const mallory = testEnv.authenticatedContext('mallory').firestore();
        await assertFails(
            updateDoc(doc(mallory, 'users', 'mallory'), { role: 'admin' })
        );
    });

    it('PERMITE que un usuario actualice otros campos de su perfil (sin tocar role)', async () => {
        const mallory = testEnv.authenticatedContext('mallory').firestore();
        await assertSucceeds(
            updateDoc(doc(mallory, 'users', 'mallory'), { team: 'team2' })
        );
    });

    it('PERMITE que un team_leader cambie el role de otro usuario', async () => {
        await testEnv.withSecurityRulesDisabled(async (ctx) => {
            await setDoc(doc(ctx.firestore(), 'users', 'leader'), {
                role: 'team_leader',
                team: 'default',
            });
        });
        const leader = testEnv.authenticatedContext('leader').firestore();
        await assertSucceeds(
            updateDoc(doc(leader, 'users', 'mallory'), { role: 'team_leader' })
        );
    });
});

describe('users/{uid}/data/wallet — privacidad del saldo', () => {
    beforeEach(async () => {
        await testEnv.withSecurityRulesDisabled(async (ctx) => {
            await setDoc(doc(ctx.firestore(), 'users', 'alice'), { role: 'agent', team: 'default' });
            await setDoc(doc(ctx.firestore(), 'users', 'alice', 'data', 'wallet'), { value: 500 });
        });
    });

    it('el dueño puede leer su propio wallet', async () => {
        const alice = testEnv.authenticatedContext('alice').firestore();
        await assertSucceeds(getDoc(doc(alice, 'users', 'alice', 'data', 'wallet')));
    });

    it('BLOQUEA que otro usuario lea el wallet ajeno', async () => {
        const mallory = testEnv.authenticatedContext('mallory').firestore();
        await assertFails(getDoc(doc(mallory, 'users', 'alice', 'data', 'wallet')));
    });

    it('BLOQUEA que otro usuario escriba en el wallet ajeno (inflar su propio saldo vía consola)', async () => {
        const mallory = testEnv.authenticatedContext('mallory').firestore();
        await assertFails(
            setDoc(doc(mallory, 'users', 'alice', 'data', 'wallet'), { value: 999999 })
        );
    });

    it('BLOQUEA el acceso sin autenticación', async () => {
        const anon = testEnv.unauthenticatedContext().firestore();
        await assertFails(getDoc(doc(anon, 'users', 'alice', 'data', 'wallet')));
    });
});

describe('news_ticker — publicación restringida a team_leader/admin', () => {
    beforeEach(async () => {
        await testEnv.withSecurityRulesDisabled(async (ctx) => {
            await setDoc(doc(ctx.firestore(), 'users', 'alice'), { role: 'agent', team: 'default' });
            await setDoc(doc(ctx.firestore(), 'users', 'leader'), { role: 'team_leader', team: 'default' });
        });
    });

    it('un agente puede LEER noticias', async () => {
        const alice = testEnv.authenticatedContext('alice').firestore();
        await assertSucceeds(getDoc(doc(alice, 'news_ticker', 'n1')));
    });

    it('BLOQUEA que un agente publique noticias', async () => {
        const alice = testEnv.authenticatedContext('alice').firestore();
        await assertFails(setDoc(doc(alice, 'news_ticker', 'n1'), { text: 'hola' }));
    });

    it('PERMITE que un team_leader publique noticias', async () => {
        const leader = testEnv.authenticatedContext('leader').firestore();
        await assertSucceeds(setDoc(doc(leader, 'news_ticker', 'n1'), { text: 'hola' }));
    });
});

describe('daily_announcements/{dateId} — Tablón del Día (lectura abierta, escritura TL/admin)', () => {
    beforeEach(async () => {
        await testEnv.withSecurityRulesDisabled(async (ctx) => {
            await setDoc(doc(ctx.firestore(), 'users', 'alice'), { role: 'agent', team: 'default' });
            await setDoc(doc(ctx.firestore(), 'users', 'leader'), { role: 'team_leader', team: 'default' });
        });
    });

    it('un agente puede LEER el tablón del día', async () => {
        const alice = testEnv.authenticatedContext('alice').firestore();
        await assertSucceeds(getDoc(doc(alice, 'daily_announcements', '2026-08-17')));
    });

    it('BLOQUEA que un agente escriba/edite el tablón', async () => {
        const alice = testEnv.authenticatedContext('alice').firestore();
        await assertFails(
            setDoc(doc(alice, 'daily_announcements', '2026-08-17'), { items: [{ id: 'x', text: 'hola' }] })
        );
    });

    it('PERMITE que un team_leader arme el tablón', async () => {
        const leader = testEnv.authenticatedContext('leader').firestore();
        await assertSucceeds(
            setDoc(doc(leader, 'daily_announcements', '2026-08-17'), { items: [{ id: 'x', text: 'Lunes es feriado' }] })
        );
    });
});

describe('users/{uid}/announcements_progress/{dateId} — progreso privado del agente', () => {
    beforeEach(async () => {
        await testEnv.withSecurityRulesDisabled(async (ctx) => {
            await setDoc(doc(ctx.firestore(), 'users', 'alice'), { role: 'agent', team: 'default' });
        });
    });

    it('el dueño puede guardar su propio progreso', async () => {
        const alice = testEnv.authenticatedContext('alice').firestore();
        await assertSucceeds(
            setDoc(doc(alice, 'users', 'alice', 'announcements_progress', '2026-08-17'), { checkedIds: ['x'] })
        );
    });

    it('BLOQUEA que otro usuario escriba el progreso ajeno', async () => {
        const mallory = testEnv.authenticatedContext('mallory').firestore();
        await assertFails(
            setDoc(doc(mallory, 'users', 'alice', 'announcements_progress', '2026-08-17'), { checkedIds: ['x'] })
        );
    });
});

describe('quick_links/{id} — lectura abierta, escritura TL/admin', () => {
    beforeEach(async () => {
        await testEnv.withSecurityRulesDisabled(async (ctx) => {
            await setDoc(doc(ctx.firestore(), 'users', 'alice'), { role: 'agent', team: 'default' });
            await setDoc(doc(ctx.firestore(), 'users', 'leader'), { role: 'team_leader', team: 'default' });
        });
    });

    it('un agente puede LEER los enlaces rápidos', async () => {
        const alice = testEnv.authenticatedContext('alice').firestore();
        await assertSucceeds(getDoc(doc(alice, 'quick_links', 'l1')));
    });

    it('BLOQUEA que un agente agregue un enlace', async () => {
        const alice = testEnv.authenticatedContext('alice').firestore();
        await assertFails(setDoc(doc(alice, 'quick_links', 'l1'), { label: 'x', url: 'https://x.com' }));
    });

    it('PERMITE que un team_leader agregue un enlace', async () => {
        const leader = testEnv.authenticatedContext('leader').firestore();
        await assertSucceeds(setDoc(doc(leader, 'quick_links', 'l1'), { label: 'x', url: 'https://x.com' }));
    });
});
