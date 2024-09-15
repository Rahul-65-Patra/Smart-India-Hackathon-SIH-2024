import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import EmergencyButton from './components/EmergencyButton';
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
       <div className="App">
      <h1>Hospital Management System</h1>
      <EmergencyButton />
    </div>
    </>
  )
}

export default App
