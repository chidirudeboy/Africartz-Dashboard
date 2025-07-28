import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './App.css';
import './password-reset.css';
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { HashRouter } from 'react-router-dom';
import reportWebVitals from './reportWebVitals';
import { GlobalProvider } from './Context';
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import Layout from './components/Layout';
import Authorize from './Authorize';

const activeLabelStyles = {
  transform: "scale(0.85) translateY(-24px)"
};

export const theme = extendTheme({
  components: {
    Form: {
      variants: {
        floating: {
          container: {
            _focusWithin: {
              label: {
                ...activeLabelStyles
              }
            },
            "input:not(:placeholder-shown) + label, .chakra-select__wrapper + label, textarea:not(:placeholder-shown) ~ label": {
              ...activeLabelStyles
            },
            label: {
              top: 0,
              left: 0,
              zIndex: 2,
              position: "absolute",
              backgroundColor: "white",
              pointerEvents: "none",
              mx: 3,
              px: 4,
              my: 2,
              transformOrigin: "left top"
            }
          }
        }
      }
    }
  }
});

// const App = () => (
//   <Layout>
//     <Authorize />
//   </Layout>
// );

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HashRouter>
      <GlobalProvider>
        <ChakraProvider theme={theme}>
			<Authorize />
        </ChakraProvider>
      </GlobalProvider>
    </HashRouter>
  </React.StrictMode>
);

reportWebVitals();
