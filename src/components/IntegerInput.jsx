import React from 'react'
import { NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper } from '@chakra-ui/react'

const IntegerInput = ({ value, setValue, ...props }) => {
	return (
		<NumberInput
			onChange={(valueString) => setValue(valueString)}
			value={value}
			min={1}
			{...props}
		>
			<NumberInputField />
			<NumberInputStepper>
				<NumberIncrementStepper />
				<NumberDecrementStepper />
			</NumberInputStepper>
		</NumberInput>
	)
}

export default IntegerInput;
