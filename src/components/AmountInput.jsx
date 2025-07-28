import React from 'react'
import { numberWithCommas } from '../utils/index'
import { NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper } from '@chakra-ui/react'

const AmountInput = ({ value, setValue, ...props }) => {
	const format = (val) => `₦` + val
	const parse = (val) => val.replace(/^\$/, '')

	return (
		<NumberInput
			onChange={(valueString) => setValue(parse(valueString))}
			value={format(value)}
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

export default AmountInput;
