# Tests de Firestore Security Rules

Estos tests validan directamente las correcciones de seguridad hechas en `firestore.rules`,
en particular:

- Que un usuario **no pueda auto-asignarse** `role: 'admin'` o `role: 'team_leader'` al crear su perfil.
- Que un usuario **no pueda cambiar su propio `role`** editando su documento.
- Que un usuario **no pueda leer el wallet** (saldo de monedas) de otro usuario.
- Que un usuario **sí pueda** leer/editar sus propios datos.

## Por qué están separados de `npm test`

Estos tests necesitan el **Firebase Emulator Suite** corriendo localmente (no hacen red real
ni tocan tu proyecto de producción). Por eso `vitest.config.js` los excluye del run normal:
así `npm test` sigue siendo rápido y no falla si no tienes el emulador instalado.

## Cómo correrlos

```bash
npm install -g firebase-tools   # si no lo tienes
firebase emulators:start --only firestore
# en otra terminal:
npx vitest run tests/rules --config tests/rules/vitest.rules.config.js
```

Recomendado: agrégalos a tu pipeline de CI antes de cada deploy que toque `firestore.rules`.
