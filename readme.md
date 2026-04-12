Entorno de Desarrollo
Node.js (LTS): El motor para ejecutar nuestro servidor Backend.

MongoDB Community Server: La base de datos local donde se guardará el inventario.

Expo Go (App Móvil): Descárgala en tu celular (Play Store/App Store) para visualizar la aplicación de React Native.

2. Configuración del Backend (Servidor)
Abre una terminal en la carpeta raíz del proyecto y ejecuta:

Bash
# Instalar dependencias
npm install express mongoose cors

# Iniciar el servidor
node archiv.js
3. Configuración del Frontend (App Móvil)
Abre una segunda terminal y ejecuta:

Bash
# Instalar dependencias de React Native
npm install

# Iniciar el túnel de Expo
npx expo start