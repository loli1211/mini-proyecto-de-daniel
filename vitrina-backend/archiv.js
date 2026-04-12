const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// CONEXIÓN A MONGODB LOCAL
const MONGO_URI = 'mongodb://127.0.0.1:27017/vitrinasDB';

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ CONECTADO A MONGODB (vitrinasDB)"))
    .catch(err => console.error("❌ Error al conectar:", err));

// ESQUEMA DE DATOS (Soporta Manga, Figura, Carta, Camisa, Joyería)
const VitrinaSchema = new mongoose.Schema({
    nombre: String,
    tipo: { 
        type: String, 
        enum: ['Manga', 'Figura', 'Carta', 'Camisa', 'Joyería'] 
    },
    tempActual: Number,
    fecha: { type: Date, default: Date.now }
});

const Producto = mongoose.model('Producto', VitrinaSchema);

// --- RUTAS API ---

// 1. OBTENER PRODUCTOS
app.get('/api/productos', async (req, res) => {
    try {
        const productos = await Producto.find().sort({ fecha: -1 });
        res.json(productos);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 2. GUARDAR NUEVO (Camisas, Joyas, etc.)
app.post('/api/guardar', async (req, res) => {
    try {
        const nuevo = new Producto(req.body);
        await nuevo.save();
        console.log(`✨ REGISTRO: [${req.body.tipo}] - ${req.body.nombre} guardado exitosamente.`);
        res.status(201).json({ mensaje: "Guardado" });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 3. ACTUALIZAR / SIMULADOR DE TEMPERATURA
app.put('/api/productos/:id', async (req, res) => {
    try {
        const actualizado = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true });
        // Log para ver el movimiento en la terminal
        if (req.body.tempActual) {
            console.log(`🌡️ SENSOR: ${actualizado.nombre} actualizó a ${req.body.tempActual}°C`);
        }
        res.json({ mensaje: "Actualizado" });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 4. ELIMINAR
app.delete('/api/productos/:id', async (req, res) => {
    try {
        await Producto.findByIdAndDelete(req.params.id);
        console.log(`🗑️ ELIMINADO: Un producto ha sido removido del inventario.`);
        res.json({ mensaje: "Eliminado" });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 5. RUTA DE ALERTA DE SEGURIDAD (MODO FORZADO)
app.post('/api/alerta-seguridad', (req, res) => {
    console.log("\n" + "X".repeat(60));
    console.log("⚠️⚠️⚠️  ¡ALERTA DE SEGURIDAD: INTENTO DE FORZADO!  ⚠️⚠️⚠️");
    console.log(`AVISO: ${req.body.mensaje}`);
    console.log(`SISTEMA: Bloqueo de vitrinas activado.`);
    console.log(`HORA LOCAL: ${new Date().toLocaleTimeString()}`);
    console.log("X".repeat(60) + "\n");
    res.json({ status: "Alerta procesada" });
});

// INICIO DEL SERVIDOR
const PORT = 3000;
app.listen(PORT, () => {
    console.log("\n==============================================");
    console.log(`🚀 SERVIDOR VITRINA ANIME PRO - PUERTO ${PORT}`);
    console.log(`📦 CATEGORÍAS: Manga, Figura, Carta, Camisa, Joyería`);
    console.log("==============================================\n");
});