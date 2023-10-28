import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Link, Route, Routes } from "react-router-dom";

import TrafficAnalyzer from './Components/TrafficAnalyzer';
import Connection from './Components/Connection';
import BlackList from './Components/BlackList';
import About from './Components/About';

function render() {
  const root = createRoot(document.getElementById('root')!);
  root.render(
    <HashRouter>
      <nav>
        <Link to="/">Connection</Link>
        <Link to="/trafficAnalyzer">Traffic Analyzer</Link>
        <Link to="/blackList">BlackList</Link>
        <Link to="/about">About</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Connection></Connection>} />
        <Route path="/blackList" element={<BlackList></BlackList>} />
        <Route path="/about" element={<About></About>} />
        <Route path="/trafficAnalyzer" element={<TrafficAnalyzer></TrafficAnalyzer>} />
      </Routes>

    </HashRouter >);

}

render();
