'use client'

import { useEffect, useState } from 'react'
import Papa from 'papaparse'

export default function CsvReader() {
  const [datos, setDatos] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/data/puntos.csv')
      .then(response => {
        if (!response.ok) throw new Error("No se pudo cargar el archivo CSV")
        return response.text()
      })
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            // Filtrar sólo nodos con localidad y provincia
            const filtrado = result.data.filter(fila =>
              fila.Localidad && fila.Provincia && fila.Latitud && fila.Longitud
            )
            setDatos(filtrado)
            console.log('Filtrado:', filtrado)
          },
          error: (err) => setError("Error al leer el archivo CSV")
        })
      })
      .catch(() => setError("No se pudo obtener el archivo CSV"))
  }, [])

  if (error) {
    return <div className="text-red-500 p-4">⚠️ {error}</div>
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">Lectura del CSV</h1>
      <p>Total de nodos cargados: {datos.length}</p>
      <ul className="mt-4 list-disc list-inside">
        {datos.slice(0, 5).map((fila, index) => (
          <li key={index}>{fila.Localidad} - {fila.Provincia}</li>
        ))}
      </ul>
    </div>
  )
}
