import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Alert, SafeAreaView, Modal, TextInput } from 'react-native';

// Interfaz actualizada con las 5 categorías
interface Producto {
  _id?: string;
  nombre: string;
  tipo: 'Manga' | 'Figura' | 'Carta' | 'Camisa' | 'Joyería';
  tempActual: number;
}

export default function App() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [forzado, setForzado] = useState(false); 
  const [modalVisible, setModalVisible] = useState(false);
  const [nombreInput, setNombreInput] = useState('');
  const [tipoInput, setTipoInput] = useState<'Manga' | 'Figura' | 'Carta' | 'Camisa' | 'Joyería'>('Manga');
  const [editandoId, setEditandoId] = useState<string | null>(null);

  // RECUERDA: Cambia esta IP por la de tu PC actual
  const API_URL = 'http://192.168.0.108:3000/api';

  const obtenerProductos = async () => {
    try {
      const res = await fetch(`${API_URL}/productos`);
      const datos = await res.json();
      setProductos(datos);
    } catch (e) { console.log("Error de conexión"); }
  };

  useEffect(() => { obtenerProductos(); }, []);

  // --- 1. SIMULADOR AUTOMÁTICO ---
  useEffect(() => {
    const simulador = setInterval(() => {
      if (productos.length > 0 && !modalVisible) {
        const index = Math.floor(Math.random() * productos.length);
        const p = productos[index];
        const variacion = Math.random() > 0.5 ? 1 : -1;
        const nuevaTemp = p.tempActual + variacion;

        if (nuevaTemp >= 15 && nuevaTemp <= 35) {
          cambiarTemp(p._id!, nuevaTemp);
        }
      }
    }, 5000);
    return () => clearInterval(simulador);
  }, [productos, modalVisible]);

  // --- 2. ALERTA DE SEGURIDAD ---
  useEffect(() => {
    if (forzado) {
      fetch(`${API_URL}/alerta-seguridad`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: "🚨 VIOLACIÓN DE SEGURIDAD EN VITRINA" })
      }).catch(e => console.log("Error enviando alerta"));

      Alert.alert("⚠️ SEGURIDAD", "¡Intento de forzado detectado! Notificación enviada.");
    }
  }, [forzado]);

  const guardarProducto = async () => {
    if (nombreInput.trim() === '') return;
    const datos = { nombre: nombreInput, tipo: tipoInput };

    try {
      if (editandoId) {
        await fetch(`${API_URL}/productos/${editandoId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datos)
        });
      } else {
        await fetch(`${API_URL}/guardar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...datos, tempActual: 22 })
        });
      }
      obtenerProductos();
      cerrarModal();
    } catch (e) { Alert.alert("Error", "Servidor no disponible"); }
  };

  const cambiarTemp = async (id: string, nuevaTemp: number) => {
    try {
      await fetch(`${API_URL}/productos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tempActual: nuevaTemp })
      });
      obtenerProductos();
    } catch (e) { console.log(e); }
  };

  const eliminar = async (id: string) => {
    Alert.alert("Borrar", "¿Eliminar este producto?", [
      { text: "No" },
      { text: "Sí", onPress: async () => {
          await fetch(`${API_URL}/productos/${id}`, { method: 'DELETE' });
          obtenerProductos();
      }}
    ]);
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setNombreInput('');
    setEditandoId(null);
    setTipoInput('Manga');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: forzado ? '#300' : '#f5f5f5' }]}>
      <Text style={[styles.title, { color: forzado ? 'white' : 'black' }]}>Vitrina Inteligente Pro</Text>

      <TouchableOpacity 
        style={[styles.securityCard, forzado && { backgroundColor: '#c0392b', borderColor: 'white', borderWidth: 1 }]} 
        onLongPress={() => setForzado(!forzado)}
      >
        <Text style={[styles.label, forzado && { color: 'white' }]}>SISTEMA DE SEGURIDAD:</Text>
        <Text style={[styles.status, { color: forzado ? 'white' : '#2c3e50' }]}>
          {forzado ? "🚨 ALERTA: FORZADO DETECTADO" : "✅ Sensores en Línea"}
        </Text>
      </TouchableOpacity>

      <View style={[styles.listContainer, forzado && { backgroundColor: '#1e1e1e' }]}>
        <FlatList
          data={productos}
          keyExtractor={(item) => item._id!}
          renderItem={({ item }) => (
            <View style={[styles.card, forzado && { backgroundColor: '#333', borderColor: '#444' }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemName, forzado && { color: 'white' }]}>{item.nombre}</Text>
                <Text style={styles.itemSub}>{item.tipo}</Text>
                <TouchableOpacity onPress={() => eliminar(item._id!)}>
                  <Text style={{ color: '#e74c3c', marginTop: 10, fontSize: 12, fontWeight: 'bold' }}>🗑️ ELIMINAR</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.tempControl}>
                <TouchableOpacity onPress={() => cambiarTemp(item._id!, item.tempActual + 1)}>
                  <Text style={styles.tempBtn}>🔥</Text>
                </TouchableOpacity>
                <Text style={[styles.itemTemp, { color: item.tempActual > 28 ? '#ff4d4d' : '#27ae60' }]}>
                  {item.tempActual}°C
                </Text>
                <TouchableOpacity onPress={() => cambiarTemp(item._id!, item.tempActual - 1)}>
                  <Text style={styles.tempBtn}>❄️</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity style={{marginLeft: 10}} onPress={() => {
                setNombreInput(item.nombre);
                setTipoInput(item.tipo);
                setEditandoId(item._id!);
                setModalVisible(true);
              }}>
                <Text style={{ fontSize: 22 }}>✏️</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>

      <TouchableOpacity style={styles.btnPlus} onPress={() => setModalVisible(true)}>
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>+ Agregar a Vitrina</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalCentered}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{editandoId ? "Editar Registro" : "Nuevo Registro"}</Text>
            
            <TextInput 
              style={styles.input} 
              placeholder="Nombre del producto" 
              value={nombreInput} 
              onChangeText={setNombreInput} 
            />

            <Text style={[styles.label, { marginBottom: 10, alignSelf: 'flex-start' }]}>CATEGORÍA:</Text>
            <View style={styles.tipoRow}>
              {(['Manga', 'Figura', 'Carta', 'Camisa', 'Joyería'] as const).map((t) => (
                <TouchableOpacity 
                  key={t} 
                  style={[styles.btnTipo, tipoInput === t && styles.btnTipoActive]}
                  onPress={() => setTipoInput(t)}
                >
                  <Text style={{ color: tipoInput === t ? 'white' : 'black', fontSize: 11, fontWeight: 'bold' }}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.btnGuardar} onPress={guardarProducto}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>
                {editandoId ? "ACTUALIZAR" : "GUARDAR EN DB"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={cerrarModal} style={{ marginTop: 15 }}>
              <Text style={{ color: '#95a5a6' }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 15 },
  securityCard: { backgroundColor: 'white', padding: 15, borderRadius: 15, marginBottom: 15, elevation: 8 },
  listContainer: { flex: 1, backgroundColor: 'white', padding: 10, borderRadius: 15, elevation: 4 },
  label: { fontSize: 10, color: '#7f8c8d', fontWeight: 'bold', textTransform: 'uppercase' },
  status: { fontSize: 18, fontWeight: 'bold' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  itemName: { fontSize: 17, fontWeight: 'bold' },
  itemSub: { color: '#95a5a6', fontSize: 13 },
  tempControl: { alignItems: 'center', marginHorizontal: 10, backgroundColor: '#f0f0f0', padding: 8, borderRadius: 12 },
  tempBtn: { fontSize: 24, padding: 2 },
  itemTemp: { fontSize: 20, fontWeight: 'bold' },
  btnPlus: { backgroundColor: '#2980b9', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 15, elevation: 5 },
  modalCentered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)' },
  modalView: { width: '90%', backgroundColor: 'white', borderRadius: 25, padding: 25, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '100%', borderBottomWidth: 2, borderBottomColor: '#3498db', marginBottom: 25, padding: 10, fontSize: 18 },
  tipoRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', // Habilita las dos filas
    justifyContent: 'center', 
    width: '100%', 
    marginBottom: 25 
  },
  btnTipo: { 
    paddingVertical: 10, 
    paddingHorizontal: 10, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#ddd', 
    width: '30%', // Tres botones por fila
    margin: 4, 
    alignItems: 'center' 
  },
  btnTipoActive: { backgroundColor: '#2c3e50', borderColor: '#2c3e50' },
  btnGuardar: { backgroundColor: '#27ae60', padding: 15, borderRadius: 12, width: '100%', alignItems: 'center' }
});