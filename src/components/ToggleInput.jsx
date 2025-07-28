import { Flex, FormControl, FormLabel, Switch } from '@chakra-ui/react'
import React from 'react'
import AmountInput from './AmountInput'


const ToggleInput = ({ label, isVisible, setVisible, value, handleChange }) => {
	return (
		<Flex flexDir={'column'} mb="25px">
			<FormControl display='flex' alignItems='center' mb={'5px'}>
				<Switch isChecked={isVisible} onChange={()=> setVisible(!isVisible)}  id={'switch-label-'+label} colorScheme={'orange'} />
				<FormLabel htmlFor={'switch-label-'+label} mb='0' ml={'9px'}>{label}</FormLabel>
			</FormControl>

			{isVisible && (
				<AmountInput value={value} setValue={handleChange} variant='filled' />
			)}
		</Flex>
	)
}

export default ToggleInput
