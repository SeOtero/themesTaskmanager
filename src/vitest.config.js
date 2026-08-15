import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: [],
        // Excluimos los tests de reglas de Firestore del run normal:
        // requieren el Firebase Emulator corriendo (ver tests/rules/README.md).
        exclude: ['**/node_modules/**', '**/dist/**', 'tests/rules/**'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            include: ['src/utils/**', 'src/services/**'],
        },
    },
});
