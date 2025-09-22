import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Specifications from './pages/Specifications';
import Implementation from './pages/Implementation';
import Dataset from './pages/Dataset';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/specifications" element={<Specifications />} />
          <Route path="/implementation" element={<Implementation />} />
          <Route path="/dataset" element={<Dataset />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
