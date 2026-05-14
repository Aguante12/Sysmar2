# 🌟 Eliana Magali | Moda para toda la familia

Este es el repositorio oficial de la tienda online de **Eliana Magali**. El proyecto es una Single Page Application (SPA) premium diseñada para ofrecer una experiencia de compra fluida con integración directa a WhatsApp.

## 🚀 Tecnologías utilizadas
- **HTML5** & **CSS3** (Diseño Minimalista y Premium)
- **JavaScript Vanila** (Lógica de carrito y administración)
- **Phosphor Icons** (Iconografía moderna)
- **FileReader API** (Para subida de imágenes local)
- **LocalStorage** (Base de datos temporal)

---

## 📂 Estructura del Proyecto
- `index.html`: La tienda principal orientada al cliente.
- `style.css`: Sistema de diseño (variables, responsive, animaciones).
- `script.js`: Lógica del carrito, buscador, filtros y renderizado dinámico.
- `admin.html`: Panel de control privado para gestión de stock.
- `assets/`: Carpeta que contiene las imágenes base del sitio.

---

## 🔐 Panel de Administración
El acceso se realiza a través de `admin.html`. 
- **Contraseña por defecto**: `admin123` (Puedes cambiarla en la función `checkPass` del archivo `admin.html`).
- **Subida de prendas**: Permite cargar nombre, precio, categoría (Urbana/Elegante) e imagen directamente desde el dispositivo.
- **Gestión de Stock**: Los productos se guardan en el navegador. Para eliminar uno, solo presiona el icono del tacho de basura en la lista.

---

## 🛠️ Guía de Mantenimiento

### 1. Cambiar el número de WhatsApp
Si necesitas cambiar el número donde llegan los pedidos, edita la línea **186** de `script.js`:
```javascript
const phoneNumber = '3464590442'; // Reemplazar con el número nuevo (sin el +)
```

### 2. Actualizar Redes Sociales
Los enlaces de Instagram y WhatsApp del pie de página están en las líneas **135-136** de `index.html`.

### 3. Migración a Base de Datos (Escalabilidad)
Actualmente, el sitio usa `localStorage` para guardar los cientos de prendas. Si el catálogo crece mucho o si quieres que la dueña pueda editar desde una PC y que los cambios se vean en el celular de los clientes, debes migrar a **Firebase**:
1. Crea un proyecto en la consola de Firebase.
2. Sustituye la variable `shopProducts` de `script.js` por una llamada `getDocs()` de Firestore.
3. Sustituye el guardado de `admin.html` por `addDoc()`.

---

## 🌍 Despliegue en Producción
Para que la tienda esté online:
1. Sube estos archivos a un repositorio de GitHub.
2. Ve a **Settings > Pages**.
3. Selecciona la rama `main` y la carpeta `/(root)`.
4. ¡Listo! Tu tienda tendrá una URL tipo `usuario.github.io/tienda_ropa`.

---

**Desarrollado con ❤️ para Eliana Magali**
