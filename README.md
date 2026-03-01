# 🚀 Nexus OS - Gamified Task & Time Manager

<div align="center">

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Firebase](https://img.shields.io/badge/Firebase-ffca28?style=for-the-badge&logo=firebase&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)

</div>

<p align="center">
  Un gestor de tareas de alto rendimiento construido con React y Firebase. Presenta un ecosistema de doble interfaz: <strong>Nexus OS</strong> (un entorno inmersivo y gamificado para agentes) y el <strong>Team Leader Dashboard</strong> (un potente panel de administración asíncrono y en tiempo real).
</p>

---

## 📸 Pantallas

> ![Vista del Agente](<img width="1879" height="902" alt="image" src="https://github.com/user-attachments/assets/7c80444b-53e7-4a45-91ca-80b9ff252522" />
)
> ![Vista del Líder](<img width="1864" height="889" alt="image" src="https://github.com/user-attachments/assets/05e8ad81-e5a1-4cc2-8126-2d1dc6ba585f" />
)

---

## 🌟 Experiencia de Usuario Dual

### 👨‍💻 Nexus OS (Vista del Agente)
El entorno de trabajo diario diseñado para maximizar la retención y productividad mediante mecánicas de videojuegos.
* **Timers Optimizados en Memoria:** Seguimiento de tareas al segundo sin sobrecargar la base de datos (Zero-write interval logic).
* **Economía Virtual (Lofi Coins):** Sistema de recompensas automáticas por completar tareas y capacitaciones.
* **Marketplace Cosmético:** Tienda integrada para personalizar la UI con efectos de partículas, mascotas, bordes y temas responsivos.
* **Motor de Eventos Dinámico:** La interfaz muta automáticamente según la hora del día, el rendimiento semanal (desbloqueo de temas) o festividades (Navidad, Halloween).
* **Smart E.O.D.R.:** Generación automática de reportes de fin de día listos para exportar.

### 👑 Centro de Comando (Team Leader View)
Panel de administración para la gestión integral del equipo.
* **Dashboard Analítico:** Métricas de rendimiento, velocidad (tareas/hora) y filtros cruzados por fecha y agente.
* **Planner Semanal (Drag & Drop):** Matriz visual interactiva para asignar tareas a todo el *Squad* respetando su disponibilidad (OFF/Horarios).
* **Gestor de Solicitudes:** Sistema de aprobación/rechazo en tiempo real para cambios de horario y propuestas en el "Laboratorio de Ideas".
* **Academia Integrada:** Creador de módulos de entrenamiento y publicación de noticias globales (News Ticker).

---

## 🧠 Arquitectura y Rendimiento

El proyecto está diseñado bajo una arquitectura de "State Lifting" sin dependencias externas pesadas (como Redux), priorizando la velocidad y el consumo mínimo de cuota de Firebase.

### Estrategias de Optimización (Performance)
1. **Lazy Listeners:** Los web sockets (`onSnapshot`) de Firebase están aislados por pestaña. El sistema solo descarga datos masivos (noticias, academia, ideas) cuando el usuario enfoca esa vista específica, reduciendo lecturas innecesarias en un 80%.
2. **Lazy Loading de Modales:** Componentes pesados (Marketplace, Generador de Reportes, Calculadoras) se importan con `React.lazy`, logrando un TTI (Time to Interactive) casi instantáneo.
3. **Persistencia Híbrida:** Uso estratégico de `localStorage` para preferencias volátiles, reservando Firestore estrictamente para el estado global y vital.

### Modelo de Datos (Firestore NoSQL)
* `users/{uid}`: Perfiles, roles y metadatos públicos.
  * `../data/tasks`: Estado persistente de tareas activas.
  * `../config/items`: Inventario cosmético y configuraciones.
* `daily_reports`: Registro inmutable de actividad para cálculo de analíticas (limitado por queries indexadas).
* `weekly_plans` & `weekly_schedules`: Matrices de disponibilidad y asignación.
* `schedule_requests` & `monday_ideas`: Colas de estado para el sistema de aprobaciones del TL.

---

## 🛠️ Instalación y Despliegue

1. **Clonar y preparar el entorno:**
   ```bash
   git clone https://github.com/SeOtero/themesTaskmanager.git
   cd themesTaskmanager
   npm install
   ```

2. **Configurar las credenciales de Firebase:**
   Crea un archivo `.env` en la raíz o reemplaza directamente en `src/firebase.js`:
   ```javascript
   const firebaseConfig = {
     apiKey: "TU_API_KEY",
     authDomain: "TU_AUTH_DOMAIN",
     projectId: "TU_PROJECT_ID",
     storageBucket: "TU_STORAGE_BUCKET",
     messagingSenderId: "TU_MESSAGING_SENDER_ID",
     appId: "TU_APP_ID"
   };
   ```

3. **Ejecutar en entorno de desarrollo:**
   ```bash
   npm run dev
   ```

---
*Desarrollado con ☕ y código limpio.*


   
