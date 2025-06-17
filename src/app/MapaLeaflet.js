'use client'

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import { useEffect, useState } from 'react'
import Papa from 'papaparse'
import L from 'leaflet'

// Icono personalizado desde CDN para evitar errores 404
const iconoMarcador = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Leyenda personalizada
function Leyenda() {
  const map = useMap()

  useEffect(() => {
    const legend = L.control({ position: 'bottomleft' })
    legend.onAdd = function () {
      const div = L.DomUtil.create('div', 'info-leyenda')
      div.innerHTML = `
        <strong>🗺️ Leyenda</strong><br />
        <span style="color:blue">— Conexiones entre nodos</span><br />
        <img src="https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png" width="12" /> Marcador de nodo
      `
      return div
    }

    legend.addTo(map)

    return () => {
      legend.remove()
    }
  }, [map])

  return null
}

export default function MapaLeaflet() {
  const [nodos, setNodos] = useState([])

  useEffect(() => {
    fetch('/data/puntos.csv')
      .then(res => res.text())
      .then(csv => {
        Papa.parse(csv, {
          header: true,
          skipEmptyLines: true,
          complete: result => {
            const filtrados = result.data.filter(f => {
              const esEntreRios = f['PROVINCIA']?.toLowerCase().includes('entre')
              let lat = f['Latitud']
              let lng = f['Longitud']

              if (lat) lat = lat.replace(',', '.')
              if (lng) lng = lng.replace(',', '.')

              const latNum = parseFloat(lat)
              const lngNum = parseFloat(lng)
              const coordenadasValidas = !isNaN(latNum) && !isNaN(lngNum)

              f.latNum = latNum
              f.lngNum = lngNum

              return esEntreRios && coordenadasValidas
            })
            setNodos(filtrados)
          }
        })
      })
  }, [])

  const conexiones = nodos.map((nodo, i) => {
    if (i < nodos.length - 1) {
      const nodoActual = [nodo.latNum, nodo.lngNum]
      const nodoSiguiente = [nodos[i + 1].latNum, nodos[i + 1].lngNum]
      return [nodoActual, nodoSiguiente]
    }
    return null
  }).filter(Boolean)

  return (
    <div className="my-8">
      <h2 className="text-xl font-bold mb-4">Mapa con Leaflet</h2>

      <MapContainer center={[-31.7, -60.5]} zoom={7} style={{ height: '600px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
        />

        {/* Leyenda */}
        <Leyenda />

        {/* Marcadores */}
        {nodos.map((nodo, i) => (
          <Marker
            key={i}
            position={[nodo.latNum, nodo.lngNum]}
            icon={iconoMarcador}
          >
            <Popup>
              <strong>{nodo['LOCALIDAD']}</strong><br />
              {nodo['PROVINCIA']}<br />
              <strong>ID Sitio:</strong> {nodo['ID_SITIO']}<br />
              <strong>Población:</strong> {nodo['POBLACION']}<br />
              <strong>Plan:</strong> {nodo['PLAN']}
            </Popup>
          </Marker>
        ))}

        {/* Conexiones */}
        {conexiones.map((conexion, i) => (
          <Polyline key={i} positions={conexion} color="blue" weight={2} />
        ))}
      </MapContainer>
    </div>
  )
}
