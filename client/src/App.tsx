import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">
            RASSET VOC System
          </h1>
          <p className="text-gray-600">
            Environment Setup Complete
          </p>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
