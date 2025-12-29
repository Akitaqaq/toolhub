import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import JSONFormatter from './pages/JSONFormatter'
import TimestampConverter from './pages/TimestampConverter'
import EncoderDecoder from './pages/EncoderDecoder'
import AESKeyGenerator from './pages/AESKeyGenerator'
import MD5Encryptor from './pages/MD5Encryptor'
import ThemeCustomizer from './pages/ThemeCustomizer'
import JSONPath from './pages/JSONPath'
import { ToastProvider, ToastEventBridge } from './components/Toast'

function App() {
  return (
    <ToastProvider>
      <Router>
        <ToastEventBridge />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="json" element={<JSONFormatter />} />
            <Route path="jsonpath" element={<JSONPath />} />
            <Route path="timestamp" element={<TimestampConverter />} />
            <Route path="encoder" element={<EncoderDecoder />} />
            <Route path="aes" element={<AESKeyGenerator />} />
            <Route path="md5" element={<MD5Encryptor />} />
            <Route path="theme" element={<ThemeCustomizer />} />
          </Route>
        </Routes>
      </Router>
    </ToastProvider>
  )
}

export default App