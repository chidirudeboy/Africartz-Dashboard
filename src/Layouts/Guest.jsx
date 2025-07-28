import React from 'react';
import { Outlet } from "react-router-dom";
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import { SignupProvider } from '../Pages/SignupContext';
// import WhatsappChat from '../components/Whatsapp/Index';



function GuestLayout() {
    return (
        <React.Fragment>
            <SignupProvider>
                <Header />
                <Outlet />
                <Footer />
				{/* <WhatsappChat /> */}
            </SignupProvider>
        </React.Fragment>
    )
}

export default GuestLayout;
