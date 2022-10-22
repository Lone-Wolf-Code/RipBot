import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import App from './pages/App';
import Error from './pages/Error';

const darkTheme = createTheme({ palette: { mode: 'dark', background: { paper: '#2D333B', default: '#22272D' } } });
const root = ReactDOM.createRoot(document.querySelector('main'));
root.render(
  <ThemeProvider theme={darkTheme}>
    <CssBaseline enableColorScheme />
    <HashRouter baseline="/">
      <Routes>
        <Route path="/:channel" element={<App />} />
        <Route path="/" element={<Error />} />
      </Routes>
    </HashRouter>
  </ThemeProvider>
);