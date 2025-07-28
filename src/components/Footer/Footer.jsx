import React from 'react'

import LogoNew from "../../assets/NewLogo.png";
import BritishCouncil from "../../assets/BritishCouncil.png"
import { Box, Flex, List, ListIcon, ListItem, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { AppLogo } from '../../Endpoints';
import { FaEnvelope, FaMap, FaPhone } from 'react-icons/fa';
import { Link as SLink } from 'react-scroll'

const Footer = () => {

	const Photo = ({ caption, source, alt }) =>
		<Box display={'flex'} alignItems={'center'} flexDir={'column'} my={{ base: '30px', md: '0px' }}>
			<Text textAlign={'center'} fontWeight="bold" textTransform={'uppercase'}>{caption}</Text>
			<img src={source} alt={alt} style={{ width: '200px' }} />
		</Box>

	return (
		<section>
			<Flex py="3rem" flexDirection={{ base: 'column', md: 'row' }} justifyContent={'space-around'} alignItems={'center'}>
				<Photo caption='A product of' source={LogoNew} alt="logo" />
				<Photo caption='An accredited partner of the' source={BritishCouncil} alt="logo" />
			</Flex>

			<Box p={{ base: '1rem', md: '4rem' }} bg="#01B1EF">
				<Flex flexDir={{ base: 'column', md: 'row' }}>
					{/* About & logo */}
					<Box py={{ base: '10px', md: '0px' }} w={{ base: '100%', md: '30%' }}>
						<Box mb={'15px'} className='logo'>
							<Link to="/">
								<img src={AppLogo} alt="Logo" />
							</Link>
						</Box>

						<Text pr={'10px'}>The perfect App for Booking and Reservation for your short stay. </Text>
					</Box>

					{/* Home, features, packages, pricing */}
					<Box py={{ base: '10px', md: '0px' }} w={{ base: '100%', md: '25%' }}>
						<Text fontWeight={'bold'}>Support</Text>
						<List spacing={3} paddingLeft={'0 !important'}>
							<ListItem fontWeight={'semibold'}> <Link to="">Privacy Policy</Link> </ListItem>
							<ListItem fontWeight={'semibold'}> <Link to="">Terms and Conditions</Link> </ListItem>
						</List>
					</Box>

					<Box py={{ base: '10px', md: '0px' }} w={{ base: '100%', md: '20%' }}>
						<Text fontWeight={'bold'}>Company</Text>
						<List spacing={3} paddingLeft={'0 !important'}>
							<ListItem fontWeight={'semibold'}> <SLink className='cursor-pointer' to="features">Features</SLink> </ListItem>
							<ListItem fontWeight={'semibold'}> <SLink className='cursor-pointer' to="packages">Packages</SLink> </ListItem>
							<ListItem fontWeight={'semibold'}> <SLink className='cursor-pointer' to="testimonials">Testimonials</SLink> </ListItem>
							<ListItem fontWeight={'semibold'}> <Link to="/pricing/academic">Pricing</Link> </ListItem>
						</List>
					</Box>
					{/* terms, privacy */}

					{/* Contact info */}
					<Box py={{ base: '10px', md: '0px' }} w={{ base: '100%', md: '25%' }}>
						<Text fontWeight={'bold'}>Get in touch</Text>
						<List spacing={3} paddingLeft={'0 !important'}>
							<ListItem fontWeight={'semibold'}> <a href="mailto:admin@africartz.com"> <ListIcon as={FaEnvelope} color='#fff' />  admin@africartz.com</a> </ListItem>
							<ListItem fontWeight={'semibold'}> <a href="tel:+23408068624903"> <ListIcon as={FaPhone} color='#fff' />  +234 806 862 4903</a> </ListItem>
							<ListItem fontWeight={'semibold'}> <Text> <ListIcon as={FaMap} color='#fff' />2, Otunola Adebayo Street, Behind Owoniboys, Beside Start-Right School, Ibrahim Taiwo Road, Ilorin, Kwara State, Ilorin, Nigeria</Text> </ListItem>
						</List>
					</Box>
				</Flex>
			</Box>



			<Box bg='black' p={'2rem'}>
				<Text textAlign={'center'} color="#fff">&copy; Africartz &middot; Developed by <a href="http://codemaniac.net" target="_blank" rel="noopener noreferrer">CodeManiac Software Solutions</a></Text>
			</Box>
		</section >
	)
}

export default Footer
