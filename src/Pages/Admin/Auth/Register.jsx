import React, { useState } from 'react';
import { Text, Button } from '@chakra-ui/react';
import { FormControl, FormLabel } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { postAuth } from '../../../utils/fetchAPI';
import { AdminRegisterAPI } from '../../../Endpoints';
import useNotifier from '../../../hooks/useNotifier';


function AdminRegister() {

  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const notify = useNotifier();
  const navigate = useNavigate();

  const handleRegister = e => {
    e.preventDefault();

    // Validate inputs
    if (firstName === null || firstName?.trim()?.length < 1 || email === null || email?.trim()?.length < 1
      || password === null || password?.trim()?.length < 1) {
      return notify('Validation error', 'All form fields are required', 'error');
    }

    if (confirmPassword !== password) {
      return notify('Validation error', 'Passwords do not match', 'error');
    }

    setLoading(true);

    const reqBody = { name: firstName, email, password, password_confirmation: confirmPassword };

    const handleResult = (result) => {
      setLoading(false);
      if (result?.status === 'success') {

        notify('Registration successful', '', 'success');
		navigate('/admin/login');

      } else {
        let errors = result?.errors;

        if (errors && Object.keys(errors).length > 0) {
          for (let err in errors) {
            notify(errors[`${err}`][0], '', 'error');
          }
        } else {
          notify('Failed', result?.message, 'error');
        }
      }
    }

    const catchError = (error) => {
      setLoading(false);

      let errors = error?.errors;

      if (errors && Object.keys(errors).length > 0) {
        for (let err in errors) {
          notify(errors[`${err}`][0], '', 'error');
        }
      } else {
        notify('Failed', error?.message, 'error');
      }
    }

    postAuth(
      AdminRegisterAPI, reqBody, handleResult, catchError
    )
  }


  return (
    <React.Fragment>
      <form onSubmit={handleRegister}>
        <FormControl className='form-control'>
          <FormLabel>First Name</FormLabel>
          <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={loading} placeholder='Enter your name' />

          <FormLabel>Email Address</FormLabel>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} placeholder='Enter Email Address' />

          <FormLabel>Password</FormLabel>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} placeholder='Enter Password' />
          <br />

          <FormLabel>Confirm Password</FormLabel>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} placeholder='Confirm your password' />
          <br />

          <Button
            type='submit'
            isLoading={loading}
            className='form-btn'
            w="100%"
            my="2"
            mb="5"
            loadingText='Loading'
            colorScheme='blue.400'
            variant='solid'
          >
            Register
          </Button>
        </FormControl>
      </form>
      <Text className='sign-up'>
        Already have an account?
        <Link className='sign-a' to="/admin/login"> Log in</Link>
      </Text>
    </React.Fragment>
  )
}

export default AdminRegister;
