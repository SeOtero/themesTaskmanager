# TESTING.md — Guía de tests

Se agregó **Vitest** al proyecto. Hay dos suites separadas:

## 1. Tests unitarios (lógica pura, rápidos, sin red)

```bash
npm install
npm test              # corre todos los tests una vez
npm run test:watch    # modo watch mientras desarrollás
npm run test:coverage # con reporte de cobertura
```

Ubicación: `tests/unit/`
- `helpers.test.js` — formateo de tiempos, cálculo de semana ISO, parseo de reportes, generación de EODR.
- `metrics.test.js` — métricas del agente (tareas/hora, tiempo promedio, score de eficiencia), incluyendo casos de división por cero.
- `wallet.service.test.js` — parseo defensivo del saldo (`cleanDataStructure`), para asegurar que nunca devuelva `NaN` ni "invente" saldo desde datos corruptos.

## 2. Tests de Firestore Security Rules (requieren el emulador)

```bash
npm install -g firebase-tools
firebase emulators:start --only firestore
# en otra terminal:
npm run test:rules
```

Verifican, contra un emulador real de Firestore:
- Nadie puede auto-asignarse `role: 'admin'`.
- Nadie puede cambiar su propio `role` editando su perfil.
- Nadie puede leer/escribir el wallet de otro usuario.
- Solo team_leader/admin pueden publicar en `news_ticker`.

Ver `tests/rules/README.md` para más detalle.

## Antes de cada deploy (checklist sugerido)

1. `npm test` — pasa la lógica pura.
2. `npm run test:rules` — pasan las reglas de seguridad (con el emulador arriba).
3. `npm run lint` — sin errores de ESLint.
4. `npm run build` — el build de producción compila sin errores.
5. Probar manualmente: login, comprar un item en la tienda, cambiar de tema a "Outside The
   Frame" y probar el reproductor de radio, abrir el menú flotante (☰) y confirmar que las
   7 acciones (Tienda, Ajustes, Disponibilidad, Calculadora, Ideas Dev, Ideas Lunes, Líder)
   funcionan.
6. Probar el Tablón de Anuncios: como Team Leader, cargar un ítem para hoy en la pestaña
   📋 Tablón; como agente, refrescar la app y confirmar que el modal se abre solo, tildar
   todos los ítems y verificar que aparece la medalla 🏅 Flawless y la racha sube.
6. Si tocaste `firestore.rules`: `firebase deploy --only firestore:rules` (¡antes que el resto del deploy!).
