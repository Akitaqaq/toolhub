import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import JSONFormatter from './pages/JSONFormatter'
import TimestampConverter from './pages/TimestampConverter'
import EncoderDecoder from './pages/EncoderDecoder'
import AESKeyGenerator from './pages/AESKeyGenerator'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="json" element={<JSONFormatter />} />
          <Route path="timestamp" element={<TimestampConverter />} />
          <Route path="encoder" element={<EncoderDecoder />} />
          <Route path="aes" element={<AESKeyGenerator />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App