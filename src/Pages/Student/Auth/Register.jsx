// import React, { useContext, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { FormControl, FormLabel, Box, Button } from '@chakra-ui/react';
// import { Input } from '@chakra-ui/react';
// import { Heading, SimpleGrid, Checkbox, Select, Text } from '@chakra-ui/react';
// import RegisterIcon from "../../../assets/Register.svg";
// import { countryList as countries } from '../../../utils/country';
// import useNotifier from '../../../hooks/useNotifier';
// import { StudentRegisterAPI } from '../../../Endpoints';
// import { postAuth } from '../../../utils/fetchAPI';
// import SignupContext from '../../SignupContext';
// import GlobalContext from '../../../Context';

// const Register = () => {
// 	const { testPackage, plan, types } = useContext(SignupContext);

//     const [ firstName, setFirstName ] = useState('');
//     const [ lastName, setLastName ] = useState('');
//     const [ email, setEmail ] = useState('');
//     const [ street, setStreet ] = useState('');
//     const [ city, setCity ] = useState('');
//     const [ country, setCountry ] = useState('');
//     const [ password, setPassword ] = useState('');
//     const [ confirmPassword, setConfirmPassword ] = useState('');
//     const [ loading, setLoading ] = useState(false);

// 	const { logUserIn, storeToken } = useContext(GlobalContext);
//     const notify = useNotifier();

//     const handleRegister = (e) => {
//         e.preventDefault();

//         // Validate inputs
//         if (
//             firstName == null || firstName?.trim()?.length < 1 || lastName == null || lastName?.trim()?.length < 1 ||
//             email == null || email?.trim()?.length < 1 || street == null || street?.trim()?.length < 1 ||
//             country == null || country?.trim()?.length < 1 || city == null || city?.trim()?.length < 1 ||
//             password == null || password?.trim()?.length < 1 || confirmPassword == null ||
//             confirmPassword?.trim()?.length < 1
//         ) {
//             return notify('Validation error', 'All form fields are required', 'error');
//         }

//         if (confirmPassword !== password) {
//             return notify('Validation error', 'Passwords do not match', 'error');
//         }

//         setLoading(true);

//         const reqBody = {
//             first_name: firstName,
//             last_name: lastName,
//             email,
//             street_address: street,
//             city,
//             country,
//             password,
//             password_confirmation: confirmPassword,
// 			subscription_info: {
// 				package: testPackage,
// 				plan,
// 				types
// 			}
//         };

//         const handleResult = (result) => {
//             setLoading(false);
//             if (result?.status === 'success') {

// 				notify('Success', 'Redirecting to your dashboard...', 'success');

// 				storeToken(result?.token, 'student');
// 				logUserIn('student');

//             } else {
//                 let errors = result?.errors;

//                 if (errors && Object.keys(errors).length > 0) {
//                     for (let err in errors) {
//                         notify(errors[`${err}`][0], '', 'error');
//                     }
//                 } else {
//                     notify('Failed', result?.message, 'error');
//                 }
//             }
//         }

//         const catchError = (error) => {
//             setLoading(false);

//             let errors = error?.errors;

//             if (errors && Object.keys(errors).length > 0) {
//                 for (let err in errors) {
//                     notify(errors[`${err}`][0], '', 'error');
//                 }
//             } else {
//                 notify('Failed', error?.message, 'error');
//             }
//         }

//         postAuth(
//             StudentRegisterAPI, reqBody, handleResult, catchError
//         )
//     }


//     return (
// 		<Box display={{ sm: 'block', md: 'flex' }} alignItems={'center'}>
// 			<Box hideBelow='md' bgColor={'#4F71F9'} w={'50%'}><img src={RegisterIcon} alt="icon" /></Box>
// 			<Box w={{
// 				sm: '100%',
// 				md: '50%',
// 				xl: '50%'
// 			}} p={{ sm: '2rem', md: '3rem' }}>
// 				<Box className='form' mb={8}>
// 					<form onSubmit={handleRegister}>
// 						<Heading as='h4' size='md' pt={{ base: '150px', md: '0px' }}>Registration</Heading>

// 						<Box pt={8}>

// 							<SimpleGrid columns={2} display={{
// 								sm: 'block', md: 'block', xl: 'flex'
// 							}} spacingX='20px' spacingY='20px'>
// 								{/* First Name */}
// 								<FormControl variant="floating" id="first-name" mb={8}>
// 									<Input type='text' value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={loading} placeholder="" />
// 									<FormLabel>First name</FormLabel>
// 								</FormControl>

// 								{/* Last Name */}
// 								<FormControl variant="floating" id="last-name" mb={8}>
// 									<Input type='text' value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={loading} placeholder="" />
// 									<FormLabel>Last name</FormLabel>
// 								</FormControl>
// 							</SimpleGrid>

// 							{/* Email */}
// 							<FormControl variant="floating" id="email">
// 								<Input type='email' value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} placeholder="" />
// 								<FormLabel>Email Address</FormLabel>
// 							</FormControl>

// 							{/* Street Address */}
// 							<FormControl mt={8} mb={8} variant="floating" id="street">
// 								<Input type='text' value={street} onChange={(e) => setStreet(e.target.value)} disabled={loading} placeholder="" />
// 								<FormLabel>Street Address</FormLabel>
// 							</FormControl>
// 						</Box>

// 						<SimpleGrid columns={2} spacingX='20px' spacingY='20px' display={{
// 							sm: 'block', md: 'block', xl: 'flex'
// 						}}>
// 							{/* City */}
// 							<FormControl variant="floating" id="city">
// 								<Input type='text' value={city} onChange={(e) => setCity(e.target.value)} disabled={loading} placeholder="" mb={8} />
// 								<FormLabel>City</FormLabel>
// 							</FormControl>

// 							{/* Country */}
// 							<Select id="select" value={country} onChange={(e) => setCountry(e.target.value)} disabled={loading} placeholder='Select Country' mb={8}>
// 								{countries?.map((x, i) => (
// 									<option value={x} key={i}>{x}</option>
// 								))}
// 							</Select>
// 						</SimpleGrid>

// 						{/* Password */}
// 						<SimpleGrid columns={2} spacingX='20px' mb={2} display={{
// 							sm: 'block', md: 'block', xl: 'flex'
// 						}}>
// 							{/* Password */}
// 							<FormControl variant="floating" id="password" mb={8}>
// 								<Input type='password' value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} placeholder="" />
// 								<FormLabel>Password</FormLabel>
// 							</FormControl>

// 							{/* Confirm Password */}
// 							<FormControl variant="floating" id="confirm-password" mb={8}>
// 								<Input type='password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} placeholder="" />
// 								<FormLabel>Confirm Password</FormLabel>
// 							</FormControl>
// 						</SimpleGrid>

// 						{/* Checkbox */}
// 						<Box mb={5} className="confirm-details">
// 							<Checkbox isRequired>
// 								I have read and agreed to the usage policies of <Text display={'inline'} color='blue'><Link to="/">IELTS ONLINE PREPS</Link></Text>.
// 							</Checkbox>
// 						</Box>

// 						<Button
// 							type='submit'
// 							isLoading={loading}
// 							className='form-btn'
// 							w="100%"
// 							my="2"
// 							mb="5"
// 							loadingText='Loading'
// 							colorScheme='blue.400'
// 							variant='solid'
// 						>
// 							Register
// 						</Button>

// 						<Text textAlign={'right'} fontSize="md" my={5}>
// 							Already have an account?
// 							<Link to="/login" className='sign-in'> Sign in here</Link>
// 						</Text>
// 					</form>
// 				</Box>
// 			</Box>
// 		</Box>
//     )
// }

// export default Register;
