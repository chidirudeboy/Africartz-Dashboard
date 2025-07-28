import { createContext, useState } from 'react';

const SignupContext = createContext();

export function SignupProvider ({ children }){
	const [ testPackage, setPackage ] = useState('');
	const [ plan, setPlan ] = useState('');
	const [ types, setTypes ] = useState('');


    return(
        <SignupContext.Provider value={{
            testPackage,
			plan,
			types,
			setPackage,
			setPlan,
			setTypes
        }}>
            {children}
        </SignupContext.Provider>
    )
}

export default SignupContext;
