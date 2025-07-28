// import React, { useState } from 'react';
// import { Heading, Button, Card, Center, Text } from '@chakra-ui/react';
// import { FormControl, FormLabel } from '@chakra-ui/react';
// import Logo from '../../../assets/logo.png';
// import { Link } from 'react-router-dom';
// import { postAuth } from '../../../utils/fetchAPI';
// import { StudentForgotPasswordAPI } from '../../../Endpoints';
// import useNotifier from '../../../hooks/useNotifier';

// function ForgotPassword() {
//   const [ email, setEmail ] = useState('');
//   const [ loading, setLoading ] = useState(false);

//   const notify = useNotifier();

//   const handleLogin = e =>{
// 		e.preventDefault();

// 		// Validate inputs
// 		if(email === null || email?.trim()?.length < 1){
// 			return notify('Validation error', 'The form field is required', 'error');
// 		}

// 		setLoading(true);

// 		const reqBody = {email};

// 		const handleResult = (result) =>{
// 			setLoading(false);
// 			if(result?.status === 'success'){

// 				notify('', '')

// 			}else{
// 				let errors = result?.errors;

// 				if(errors && Object.keys(errors).length > 0){
// 					for(let err in errors){
// 						notify(errors[`${err}`][0], '', 'error');
// 					}
// 				}else{
// 					notify('Failed', result?.message, 'error');
// 				}
// 			}
// 		}

// 		const catchError = (error) =>{
// 			setLoading(false);

// 			let errors = error?.errors;

// 			if(errors && Object.keys(errors).length > 0){
// 				for(let err in errors){
// 					notify(errors[`${err}`][0], '', 'error');
// 				}
// 			}else{
// 				notify('Failed', error?.message, 'error');
// 			}
// 		}

// 		postAuth(
// 			StudentForgotPasswordAPI, reqBody, handleResult, catchError
// 		)
// 	}

//   return (
// 	<React.Fragment>
// 		<form onSubmit={handleLogin}>
// 			<FormControl className='form-control' mb="20px">
// 				<FormLabel>Email Address</FormLabel>
// 				<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} placeholder='Enter Email Address' />
// 			</FormControl>

// 			<Button
// 				type='submit'
// 				isLoading={loading}
// 				className='form-btn'
// 				mb="5"
// 				w={'100%'}
// 				loadingText='Loading'
// 				colorScheme='blue.400'
// 				variant='solid'
// 			>
// 				Reset
// 			</Button>
// 		</form>

// 		<Text className='sign-up' fontSize={'md'}>
// 			<Link className='sign-a' to="/login">Login Instead</Link>
// 		</Text>
// 	</React.Fragment>
//   )
// }

// export default ForgotPassword
