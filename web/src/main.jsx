import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// index.css 内已 @import katex/dist/katex.min.css，公式样式随包内置
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
