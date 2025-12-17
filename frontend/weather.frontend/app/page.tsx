'use client'

import { useState, useEffect } from "react";
import { getData } from "./api/weather.api";

export default function Home() {
  const [dataaa, setData] = useState([]) // ✅ Inicialize como null

  useEffect(() => {
    const fetchData = async () => { // ✅ Função async dentro do useEffect
      const result = await getData() // ✅ Aguarde a promise
      setData(result)
    }
    
    fetchData() // ✅ Chame a função
  }, [])

  return (
    <div>
      <main>
        <div>
          <h1>Dados metereológicos</h1>
          <div>
              {dataaa.map((data) => (
                <li key={data.id}>
                <p>
                  {data.city}
                </p>
              </li>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
