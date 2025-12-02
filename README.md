# Panel de Control SaaS (Admin Dashboard)

Una PWA administrativa construida con React, TypeScript y Firebase para gestionar clientes de desarrollo web, licencias y control de servicio remoto (Kill Switch).

## 🚀 Características

- **Dashboard**: Métricas en tiempo real de ingresos y clientes.
- **Gestión de Clientes**: CRUD completo con detalles técnicos del stack.
- **Kill Switch**: Interruptor para activar/desactivar el servicio del cliente remotamente.
- **Generador de Snippets**: Crea automáticamente el código (Hook de React) para integrar en el sitio del cliente.
- **Cobranza**: Generación de mensajes de WhatsApp pre-llenados para reclamo de pagos.
- **Modo Demo**: Acceso sin conexión a backend para demostraciones.

## 🛠 Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Estilos**: Tailwind CSS (vía CDN para ligereza) + Lucide Icons
- **Backend/Auth**: Firebase (Firestore & Authentication)
- **Estado**: React Context API

## 📦 Instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/tu-usuario/saas-control-panel.git
   cd saas-control-panel
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar Firebase:
   - Crea un proyecto en [Firebase Console](https://console.firebase.google.com/).
   - Crea un archivo `.env` en la raíz basado en `.env.example`.
   - Pega tus credenciales.

4. Ejecutar entorno local:
   ```bash
   npm run dev
   ```

## 🔒 Reglas de Seguridad (Firestore)

Para que el "Kill Switch" funcione de forma segura, configura estas reglas en Firestore:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo el admin puede leer/escribir todo
    match /clients/{clientId} {
      allow read: if true; // El cliente necesita leer su estado (o restringe por IP/Auth si prefieres)
      allow write: if request.auth != null;
    }
  }
}
```

## 📄 Licencia

Este proyecto es privado y de uso exclusivo.
