import React, {
	Fragment,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";

import {
	Button,
	ButtonGroup,
	Flex,
	IconButton,
	SimpleGrid,
	Spinner,
	Text,
	Tooltip,
} from "@chakra-ui/react";
import dayjs from "dayjs";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import Card from "../../../components/Card/Card.js";
import CardBody from "../../../components/Card/CardBody.js";
import CardHeader from "../../../components/Card/CardHeader";

import { IoReloadSharp } from "react-icons/io5";
import { RiUserVoiceLine } from "react-icons/ri";

import { FaEye } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import GlobalContext from "../../../Context";
import { LandlordsAPI } from "../../../Endpoints";
import useNotifier from "../../../hooks/useNotifier.jsx";
import { fetchAPI } from "../../../utils/fetchAPI";
import { numberWithCommas } from "../../../utils/index.js";
import MiniStatistics from "./components/MiniStatistics";

const Index = () => {
	const { token } = useContext(GlobalContext);

	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [totalLandlords, setTotalLandlords] = useState(0);
	const [totalApartments, setTotalApartments] = useState(0);
	const [landlords, setLandlords] = useState([]);

	const notify = useNotifier();

	const fetchData = useCallback(() => {
		setLoading(true);

		const handleSuccess = (_res) => {
			if (_res) {
				setTotalLandlords(Number(_res.total_landlords));
				setTotalApartments(Number(_res.total_apartments));

				setLandlords(_res?.landlords);
			} else {
				notify("Failed", "Could not get  data", "error");
			}

			setLoading(false);
		};

		const handleError = () => {
			setLoading(false);
			notify("Failed", "Could not get data", "error");
		};

		fetchAPI(LandlordsAPI, handleSuccess, handleError, token);

		// eslint-disable-next-line
	}, [token]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return (
		<Flex flexDirection="column" pt={{ base: "120px", md: "75px" }}>
			{loading ? (
				<div
					style={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
						height: "30rem",
						width: "100%",
					}}
				>
					<Spinner />
				</div>
			) : (
				<Fragment>
					<SimpleGrid
						columns={{ sm: 1, md: 2, xl: 4 }}
						spacing="24px"
					>
						<MiniStatistics
							title={"Total no. of Landlord"}
							amount={numberWithCommas(totalLandlords)}
							icon={RiUserVoiceLine}
						/>

						<MiniStatistics
							title={"Total Apartments"}
							amount={numberWithCommas(totalApartments)}
							icon={RiUserVoiceLine}
						/>
					</SimpleGrid>

					<Card p="16px" mt="20px" w="100%">
						<CardHeader>
							<Flex
								justify="space-between"
								align="center"
								minHeight="60px"
								w="100%"
							>
								<Text
									fontSize="lg"
									color={"#de9301"}
									fontWeight="bold"
								>
									Landlords
								</Text>

								<Flex gap="6">
									<Tooltip label="Reload">
										<IconButton
											onClick={() => fetchData()}
											aria-label="Reload"
											icon={<IoReloadSharp />}
										/>
									</Tooltip>
									<Link to="/admin/landlord/new">
										<Button
											p={"8px 30px"}
											borderRadius={"5px"}
											variant={"solid"}
											color="#de9301"
											fontWeight="bold"
										>
											Add LandLord
										</Button>
									</Link>
								</Flex>
							</Flex>
						</CardHeader>
						<CardBody
							display={"block"}
							style={{ flexDirection: "row" }}
						>
							<DataTable
								value={landlords}
								paginator
								rows={5}
								rowsPerPageOptions={[5, 10, 25, 50]}
							>
								<Column
									sortable
									field="landlord_name"
									filter
									header="Landlord Name"
									body={(row) =>
										row?.first_name + " " + row?.last_name
									}
									style={{ width: "25%" }}
								></Column>
								<Column
									sortable
									field="email"
									filter
									header="Email"
									body={(row) => row?.email}
									style={{ width: "25%" }}
								></Column>
								<Column
									sortable
									field="apartmentsCount"
									filter
									header="Apartment"
									body={(row) => row?.apartmentsCount}
									style={{ width: "25%" }}
								></Column>

								<Column
									sortable
									field="phone"
									filter
									header="Phone"
									body={(row) => <> {row?.phone} </>}
									style={{ width: "25%" }}
								></Column>
								<Column
									sortable
									field="created_at"
									filter
									header="Created"
									body={(row) => (
										<Text>
											{dayjs(row?.created_at).format(
												"ddd D MMM YYYY"
											)}
										</Text>
									)}
									style={{ width: "25%" }}
								></Column>
								<Column
									sortable
									field=""
									header="Action"
									body={(row) => (
										<ButtonGroup
											size="sm"
											isAttached
											variant="ghost"
										>
											<Tooltip label="View">
												<IconButton
													colorScheme="black"
													onClick={() =>
														navigate(
															`/admin/landlord/${row?.id}`
														)
													}
													aria-label="View"
													icon={<FaEye />}
												/>
											</Tooltip>
										</ButtonGroup>
									)}
									style={{ width: "25%" }}
								></Column>
							</DataTable>
						</CardBody>
					</Card>
				</Fragment>
			)}
		</Flex>
	);
};

export default Index;

