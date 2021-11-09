import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Routes, Route } from "react-router-dom";

import Navigation from './components/Navigation'
import Footer from './components/Footer'

import Home from './pages/Home'
import Create from './pages/Create'
import Profile from './pages/Profile'

import './App.css';

import { Web3ReactProvider } from '@web3-react/core'
import Web3 from 'web3'

function getLibrary(provider: any) {
  return new Web3(provider)
}


export default function App() {

  const theme = createTheme({
    typography: {
      fontFamily: 'coder',
    },
    palette: {
      primary: {
        light: '#757ce8',
        main: '#2b2b2b',
        dark: '#002884',
        contrastText: '#fff',
      },
      secondary: {
        light: '#ff7961',
        main: '#f44336',
        dark: '#ba000d',
        contrastText: '#000',
      },
    },
  });

  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <ThemeProvider theme={theme}>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="create" element={<Create />} />
          <Route path="profile" element={<Profile />} />
        </Routes>
        <Footer />
      </ThemeProvider>
    </Web3ReactProvider>
  );
}

