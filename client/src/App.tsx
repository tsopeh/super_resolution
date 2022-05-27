import React, { useEffect, useState } from 'react'
import './App.scss'

const App = () => {

  const [data, setData] = useState('Loading...')

  useEffect(() => {
    fetchData()
      .then((result) => setData(result))
      .catch(console.error)
  }, [])

  return (
    <div className="App">
      {data}
    </div>
  )
}

const fetchData = async () => {
  return fetch(`http://localhost:5100`)
    .then((res) => res.json())
}

export default App
