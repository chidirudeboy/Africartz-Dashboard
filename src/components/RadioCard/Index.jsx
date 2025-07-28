import { Icon } from '@chakra-ui/icons';
import { Box, useRadio, Text, Flex } from '@chakra-ui/react'
import { MdCheckCircle } from 'react-icons/md';

export default function RadioCard(props) {
	const { getInputProps, getRadioProps } = useRadio(props)

	const input = getInputProps()
	const checkbox = getRadioProps()
	const radioBG = 'blue.400';

	return (
		<Box as='label'>
			<input {...input} />
			<Box
				{...checkbox}
				cursor='pointer'
				borderWidth='1px'
				borderRadius='md'
				boxShadow='md'
				_checked={{
					bg: radioBG,
					color: 'white',
					borderColor: radioBG,
				}}
				_focus={{
					boxShadow: 'outline',
				}}
				px={5}
				py={3}
			>
				<Flex justify='space-between' align='center' w='100%'>
					<Text fontSize='lg' textTransform="capitalize" fontWeight='bold'>
						{props.children}
					</Text>

					<Icon as={MdCheckCircle} />
				</Flex>

				<br />
				{props?.price?.length > 0 && (
					<>
						<Text fontSize='md' fontWeight='light'>{props?.price}</Text>
						<br />
					</>
				)}
				<Text fontSize='md' fontWeight='light'>{props?.desc}</Text>
			</Box>
		</Box>
	)
}
