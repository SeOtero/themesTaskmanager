# SECURITY.md — Cambios de seguridad y arquitectura aplicados

Reaplicación completa (sobre el código real de producción, con el reproductor de radio
ya incluido) de todos los cambios trabajados en sesiones anteriores.

## 1. Credenciales de Firebase hardcodeadas y duplicadas

**Antes:** `src/firebase.js` y `src/firebase/config.js` tenían la misma configuración
de Firebase escrita directamente en el código fuente, y distintos archivos importaban
de uno u otro de forma inconsistente.

**Ahora:**
- Un único archivo `src/firebase.js`.
- La configuración se lee de variables de entorno (`VITE_FIREBASE_*`) vía `.env`.
- `.env` está en `.gitignore`. `.env.example` documenta las variables requeridas.
- Se agregó una validación que falla rápido y con mensaje claro si falta alguna variable.

**Nota importante:** la `apiKey` de una app web de Firebase no es secreta en el sentido
tradicional — viaja igual al navegador del usuario. Sacarla del código es buena
práctica (rotación más fácil, no queda en el historial de Git, permite distintos
entornos), pero **la protección real de tus datos son las Firestore Security Rules**
(punto 3 más abajo). No asumas que esto "esconde" tu proyecto.

## 2. Bug: doble fuente de verdad para el saldo de monedas

**Antes:** `handleBuyItem` en `App.jsx` escribía un campo `walletBalance` directo en
`users/{uid}`, mientras que `useWallet`/`wallet.service.js` guardan el saldo real en
`users/{uid}/data/wallet`. Dos ubicaciones distintas para el mismo dato = riesgo de
desincronización silenciosa.

**Ahora:** `handleBuyItem` ya no escribe el wallet directamente; delega 100% en
`spendCoins()` (la única fuente de verdad). Solo persiste el inventario, y se mantuvo
la llamada real a `logEvent("SHOP_BUY", ...)` (analítica en Firestore, no confundir con
el logger de consola).

## 3. Sin Firestore Security Rules versionadas — escalación de privilegios posible

**Antes:** no había ningún `firestore.rules` en el repo. Sin reglas explícitas
desplegadas, cualquier usuario autenticado podía —desde la consola del navegador—
llamar directamente al SDK de Firestore y:
- Auto-asignarse `role: 'admin'` en su propio documento de usuario.
- Leer o escribir el wallet de otro usuario.
- Editar `news_ticker` / `training_modules` sin ser team leader.

**Ahora:** se agregó `firestore.rules` (+ `firebase.json` para desplegarlo) con:
- Un usuario solo puede crear su perfil con `role: 'agent'`.
- Un usuario **no puede modificar su propio campo `role`** (solo team_leader/admin pueden cambiar roles ajenos).
- Los datos privados (`users/{uid}/data/*`, wallet incluido) solo son legibles/escribibles por su dueño (o TL/admin en lectura).
- `news_ticker` y `training_modules` son de solo lectura para agentes; solo TL/admin pueden escribir.
- Deny-by-default para cualquier colección no contemplada.

### ⚠️ Acción pendiente de tu parte
Este archivo **no se aplica solo**. Tenés que desplegarlo:
```bash
npm install -g firebase-tools
firebase login
firebase use <tu-project-id>
firebase deploy --only firestore:rules
```
Antes de desplegar a producción, probalo en el Rules Playground de la consola de Firebase.

## 4. Código y arquitectura

- **Código muerto eliminado**: `usePlanner.js`, `useTLIdeas.js`, `useUsersManagement.js` (hooks vacíos) y `useUserProfile.js` (hook duplicado, no usado en ningún lado).
- **Logger centralizado** (`src/utils/logger.js`): reemplaza los `console.log/warn/error` sueltos. En producción, `log`/`warn` quedan silenciados; `error` se mantiene siempre visible.
- **Sistema de Toast** (`src/utils/toast.js` + `src/components/ui/ToastContainer.jsx`): reemplaza todos los `alert()` bloqueantes por notificaciones no-bloqueantes con estilo (info/success/error/warning).

## 5. Menú flotante unificado

Se consolidaron los botones flotantes dispersos (Tienda, Ajustes, Líder, Disponibilidad,
Ideas Dev, Ideas del Lunes, Calculadora de Salario) en un único menú (`FloatingMenu.jsx`),
abierto desde un botón circular (☰) abajo a la derecha. Muestra nombre de usuario y saldo
de Lofi Coins arriba, y la lista de acciones debajo. Se cierra con click afuera o `Escape`.

- La **campanita de notificaciones** se dejó fuera del menú (visible siempre, por su badge en vivo).
- El **reproductor de radio** (`ThemeAudioPlayer.jsx`, tema "Outside The Frame") y el **widget
  de Notas Rápidas** tampoco se tocaron — ambos están integrados en su propio lugar del layout
  y no son parte del set de botones flotantes dispersos que se pidió consolidar.
- Se eliminaron `FloatingActions.jsx` y `FloatingSalaryButton.jsx` (ya sin uso).
- `EconomyBar.jsx` quedó simplificada a solo mostrar el saldo (el botón de tienda duplicado se sacó).

## 6. Radio (ya implementada — sin cambios de esta sesión)

`ThemeAudioPlayer.jsx` ya existía en el código base con estaciones de Zeno.fm/SomaFM y una
sección de "Relatos Paranormales" (mp3 locales). No se modificó nada de esa funcionalidad.

## Pendiente para una próxima pasada

- La compra de items sigue validándose solo en el cliente; para blindarlo 100% se necesitaría una Cloud Function que valide precio/saldo server-side antes de aplicar la transacción.
- Dividir `App.jsx` (varios cientos de líneas) en hooks más chicos.
- Unificar los componentes de efectos de fondo en un `ParticleEffect` genérico configurable.
- Agregar tests de UI (React Testing Library) para `FloatingMenu`, `ToastContainer` y `ThemeAudioPlayer`.

## 7. Nueva funcionalidad: Tablón de Anuncios del Día ("¿Qué tenés que saber hoy?")

Pensado como red de contención para agentes olvidadizos.

**Cómo funciona:**
- El Team Leader carga recordatorios/tareas desde una pestaña nueva **"📋 Tablón"** en su
  panel (`TLBriefingTab.jsx`), eligiendo la fecha (por defecto hoy, pero se puede cargar con
  anticipación — ej: cargar el feriado del lunes 17 el jueves anterior).
- Al iniciar la app, si hay ítems pendientes para hoy, se abre automáticamente un modal
  (`DailyBriefingModal.jsx`) con la lista para tildar.
- Si el agente completa TODOS los ítems del día, se le otorga la medalla 🏅 **Flawless** y
  suma un día a su racha (`perfectDaysStreak`). La racha se resetea a 1 si hay un día sin
  completar (no se resta activamente; simplemente no se extiende si falta el día anterior en
  el historial).
- El historial de días flawless (`perfectDaysHistory`, hasta 60 entradas) se puede ver
  colapsado dentro del propio modal.
- La racha actual se muestra también en el header del `FloatingMenu` (☰), junto al saldo de
  Lofi Coins, y hay un acceso directo "📋 Tablón de Hoy" con badge de pendientes.

**Datos en Firestore:**
- `daily_announcements/{YYYY-MM-DD}` → `{ items: [{id, text}], updatedAt }` (solo TL/admin escriben).
- `users/{uid}/announcements_progress/{YYYY-MM-DD}` → `{ checkedIds: [...], completedAt }` (solo el dueño escribe).
- `users/{uid}.perfectDaysStreak` (number) y `users/{uid}.perfectDaysHistory` (array de fechas) — campos normales del doc de usuario, ya cubiertos por la regla existente de "el dueño puede actualizar su doc excepto `role`".
- Reglas agregadas en `firestore.rules` para `daily_announcements` + tests correspondientes en `tests/rules/firestore-rules.test.js`.

**Decisiones de diseño:**
- La racha solo se otorga la PRIMERA vez que se completa el día (usa `completedAt` como
  guardia), así que destildar y volver a tildar ítems después de completar el día no duplica
  ni altera la racha.
- No hay penalización activa por faltar un día — simplemente la racha no continúa (se
  reinicia a 1 la próxima vez que completen todo).

## 8. Tablón personalizado por agente

Se agregó la posibilidad de dirigir cada ítem del tablón a **un agente específico** o a
**todos** (selector "Para quién" en la pestaña 📋 Tablón del TL). El modal que ve el agente
ahora saluda por nombre: *"Hola [nombre], esto es lo que tenés que saber para arrancar tu
día hoy"*.

**Cómo funciona:** cada ítem guarda `targetUids: []` (vacío = todos) o `targetUids: [uid]`
(un agente puntual). El filtrado de qué ítems ve cada agente se hace **del lado del
cliente** (en `useDailyBriefing.js`), no en las Firestore Security Rules.

### ⚠️ Limitación de privacidad conocida
Como la lectura de `daily_announcements/{fecha}` sigue abierta a cualquier usuario
autenticado (igual que `news_ticker`), un agente que abra las DevTools y consulte
Firestore directamente **podría técnicamente ver** a qué otro agente puntual está dirigido
cada recordatorio (aunque la UI normal no se lo muestre). Para este caso de uso
—recordatorios operativos, no información sensible— se consideró un riesgo aceptable y
consistente con cómo ya funciona `news_ticker`. Si en algún momento se cargan ahí datos
sensibles (evaluaciones de desempeño, feedback privado, etc.), habría que migrar a un
modelo con un documento por agente (`daily_announcements/{fecha}/agents/{uid}`) y ajustar
las reglas para que cada uno solo pueda leer el suyo.

## 9. Fixes post-testing del Tablón

- **Selector "Para quién" ahora incluye a todos los usuarios**, no solo `role: 'agent'`.
  Antes un TL/admin no podía dirigirse un anuncio a sí mismo para probar la funcionalidad.
- **Auto-apertura corregida**: antes el tablón solo se evaluaba una vez al cargar la página;
  si un TL agregaba un anuncio nuevo mientras el agente ya tenía la app abierta (sin
  refrescar), no se enteraba. Ahora se compara la cantidad de pendientes contra el máximo
  visto en la sesión, así que se vuelve a abrir solo si aparece contenido genuinamente nuevo
  (y no se reabre solo porque el agente fue tildando ítems).

## 10. Acceso directo a Disponibilidad + Enlaces Rápidos

**Acceso directo en el Tablón:** al crear un ítem, el TL puede tildar "📅 Agregar acceso
directo a Disponibilidad". El agente ve, junto al recordatorio, un botón "📅 Cargar" que
abre directamente el modal de Disponibilidad/Soporte (sin tener que buscarlo en el menú).
Pensado especialmente para el aviso de los sábados — no hace falta lógica de "día de la
semana": el TL simplemente carga el ítem en la fecha del sábado que corresponda (con
anticipación si quiere) y activa el acceso directo.

**Enlaces Rápidos:** nueva colección `quick_links` (mismo patrón de permisos que
`news_ticker`: lectura abierta, escritura solo TL/admin). El TL los carga desde la pestaña
🔗 Enlaces (nombre + URL). Los agentes acceden desde ☰ → 🔗 Enlaces Rápidos, que abre una
lista de links clickeables (se abren en pestaña nueva).

Reglas y tests agregados en `firestore.rules` / `tests/rules/firestore-rules.test.js`.

## 11. Fix de las Notas Rápidas + Manual de Usuario

**Bug encontrado en Notas Rápidas:** la posición del botón flotante se guarda en
`localStorage` sin ningún límite. Si se guardaba en una pantalla grande y después se abría
la app en una más chica (u otra resolución), el botón podía terminar posicionado fuera del
área visible — invisible e inalcanzable, sin ningún error visible tampoco.

**Fix aplicado:**
- Se agregó `clampToViewport()`, que mantiene el botón siempre dentro de los límites de la
  pantalla actual, tanto al cargar como al redimensionar la ventana (`resize`).
- Se agregó un **acceso de respaldo garantizado**: ☰ → 📝 Notas Rápidas. Sin importar dónde
  haya quedado el botón arrastrable, esta opción lo reposiciona a un lugar visible y lo abre.
  (Implementado con un evento global simple, mismo patrón que `toast.js`, sin necesidad de
  levantar el estado del widget hasta `App.jsx`.)

**Manual de Usuario** (`HelpModal.jsx`, accesible desde ☰ → 📖 Manual de Usuario): contenido
estático organizado por secciones (Tareas, Wallet/Tienda, Temas, Tablón de Hoy, Notas
Rápidas, Enlaces Rápidos, Disponibilidad, Calculadora de Salario, Ideas/Bugs, Academia,
Ajustes). Se edita directo en el archivo cuando se agreguen funciones nuevas — no depende de
Firestore. Se excluyó a propósito `LuckyWheelModal` (existe en el código pero no está
conectado a ningún botón todavía, así que no es una función real para los agentes hoy).

## 12. Anuncios recurrentes + acceso directo a EOD Report + fix de responsividad

**Anuncios recurrentes** (nueva colección `recurring_announcements`): se cargan una sola
vez desde la pestaña 📋 Tablón (sección "🔁 Anuncios Recurrentes", separada de los
"📌 Anuncios Puntuales" por fecha) y reaparecen solos:
- "Todos los días" (ej: recordatorio de grabar el EOD report).
- "Todos los [día de la semana]" (ej: disponibilidad todos los sábados).

Se combinan automáticamente con los anuncios puntuales del día en `useDailyBriefing.js` —
el agente ve ambos tipos mezclados en un solo tablero, sin distinguir cuál es cuál (misma
UX). El filtrado por destinatario (todos / agente puntual) funciona igual que en los
anuncios puntuales.

**Acceso directo a EOD Report**: mismo patrón que el de Disponibilidad. Un ítem con
`actionType: 'eod_report'` muestra un botón "📝 Grabar EOD" que abre directo
`ReportConfigModal` (`setIsReportModalOpen(true)`).

**Fix de responsividad en Manual de Usuario y Menú (☰)**: los títulos largos (ej.
"Calculadora de Salario", "Disponibilidad / Soporte") no tenían `min-w-0` en su contenedor
flex, así que en pantallas chicas el texto desbordaba el botón y quedaba **recortado** por
el `overflow-hidden` del contenedor padre — por eso "no se veían los botones completos".
Se corrigió agregando `min-w-0` + `break-words` a los títulos en `HelpModal.jsx` y
`FloatingMenu.jsx`.

Regla de Firestore agregada para `recurring_announcements` (mismo esquema que
`daily_announcements`: lectura abierta, escritura TL/admin).

## 13. Pendiente: sistema Premium/Básico por equipo

Se planteó diferenciar la app entre Team 1 (premium, gratis) y Team 2 (básica,
desbloqueable con Lofi Coins), pero **todavía no se definió el alcance** (qué funciones
son premium, si el desbloqueo es individual o por equipo). No se tocó código para esto —
queda pendiente de definición antes de implementar.

## 14. Reversión: ruido blanco sacado del reproductor de radio

Se sacaron las 2 estaciones de "Ruido Blanco" (playa/lluvia) agregadas en la ronda
anterior — no se pudo confirmar en la práctica que esos streams se mantuvieran estables, y
se prefirió no arriesgar con algo sin probar. `ThemeAudioPlayer.jsx` quedó con una sola
estación (📻 Radio Lofi Chillhop) + los relatos paranormales en MP3 local. Se van a evaluar
más estaciones (blancas o de otro tipo) en futuras actualizaciones, con más tiempo para
probarlas antes de dejarlas fijas.
