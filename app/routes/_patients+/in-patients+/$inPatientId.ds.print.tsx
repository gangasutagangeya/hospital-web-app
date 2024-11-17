import { LoaderFunctionArgs } from '@remix-run/node'
import {
	Page,
	Text,
	View,
	Document,
	StyleSheet,
	Line,
	Svg,
} from '@react-pdf/renderer'
import { renderToStream } from '@react-pdf/renderer'
import { getInPatientAllInfo } from '#app/utils/patients.server.js'
import { getUserInfo } from '#app/utils/auth.server.js'
import { invariantResponse } from '@epic-web/invariant'

export async function loader({ request, params }: LoaderFunctionArgs) {
	const userInfo = await getUserInfo(request)
	invariantResponse(userInfo, 'User info not found', { status: 404 })
	const { inPatientId } = params
	invariantResponse(inPatientId, 'In Patient Information is not available', {
		status: 404,
	})
	const data = await getInPatientAllInfo({
		hospitalId: userInfo.hospitalId,
		inPatientId: inPatientId,
	})
	const stream = await renderToStream(<MyDocument data={data} />)

	// and transform it to a Buffer to send in the Response
	let body: Buffer = await new Promise((resolve, reject) => {
		let buffers: Uint8Array[] = []
		stream.on('data', data => {
			buffers.push(data)
		})
		stream.on('end', () => {
			resolve(Buffer.concat(buffers))
		})
		stream.on('error', reject)
	})

	return new Response(body, {
		status: 200,
		headers: {
			'Content-Type': 'application/pdf',
		},
	})
}

// TODO: Update type of data
const MyDocument = ({ data }: { data: any }) => {
	const {
		patient: {
			name: patientName,
			umr,
			age,
			gender,
			address: {
				street: patientStreet,
				city: patientCity,
				district: patientDistrict,
				state: patientState,
				zip: patientZip,
			},
		},
		hospital: {
			name: hospitalName,
			email: hospitalEmail,
			phone: hospitalPhone,
			address: {
				street: hospitalStreet,
				city: hospitalCity,
				district: hospitalDistrict,
				state: hospitalState,
				zip: hospitalZip,
			},
		},
		dischargeSummary: {
			checkedBy: { name: checkedByName },
			preparedBy: { name: preparedByName },
			dischargeDate,
			finalDiagnosis,
			admitDate,
			complaintsOnReporting,
			pastHistory,
			historyOfPresentingIllness,
			physicalFindingsOfExamination,
			laboratoryData,
			investigationProcedure,
			coursesOfTreatmentInHospital,
			summaryOfICUStay,
			futureAdviceOnDischarge,
			therapeuticProcedure,
			summaryDrugInstruction,
		},
	} = data
	console.log(
		'🚀 ~ MyDocument ~ summaryDrugInstruction:',
		summaryDrugInstruction,
	)
	return (
		<Document title={`${patientName}(${umr}) discharge summary`}>
			<Page size="A4" style={styles.page}>
				<View>
					{' '}
					<Text style={styles.title}>{hospitalName}</Text>
					<Text
						style={styles.titleAddress}
					>{`${hospitalStreet}, ${hospitalCity}, ${hospitalDistrict}, ${hospitalState} - ${hospitalZip}`}</Text>
					<Text style={styles.titleCommunication}>
						{hospitalPhone ? `Phone: ${hospitalPhone}` : ''}
						{hospitalEmail ? `Email: ${hospitalEmail}` : ''}
					</Text>
					<Text style={styles.subtitle}>Discharge Summary</Text>
					<Svg height="2" width="600">
						<Line
							x1="10"
							y1="0"
							x2="540"
							y2="0"
							strokeWidth={2}
							stroke="black"
						/>
					</Svg>
				</View>
				<View style={styles.patientSection}>
					<View style={{ flexGrow: 3 }}>
						<Text style={styles.patientHeading}>Name</Text>
						<Text style={styles.patientContent}>{patientName}</Text>
					</View>
					<View style={{ flexGrow: 1 }}>
						<Text style={styles.patientHeading}>Age(Y)</Text>
						<Text style={styles.patientContent}>{age}</Text>
					</View>
					<View style={{ flexGrow: 1 }}>
						<Text style={styles.patientHeading}>Gender</Text>
						<Text style={styles.patientContent}>{gender}</Text>
					</View>
					<View style={{ flexGrow: 1 }}>
						<Text style={styles.patientHeading}>UMR</Text>
						<Text style={styles.patientContent}>{umr}</Text>
					</View>
				</View>
				<View style={styles.patientSection}>
					<View style={{ flexGrow: 3 }}>
						<Text style={styles.patientHeading}>Address</Text>
						<Text style={styles.patientContent}>{patientStreet},</Text>
						<Text style={styles.patientContent}>
							{patientCity}, {patientDistrict},
						</Text>
						<Text style={styles.patientContent}>
							{patientState} {patientZip ? '-' : null} {patientZip}
						</Text>
					</View>
					<View style={{ flexGrow: 1 }}>
						<Text style={styles.patientHeading}>Date admitted</Text>
						<Text style={styles.patientContent}>{admitDate}</Text>
					</View>
					<View style={{ flexGrow: 1 }}>
						<Text style={styles.patientHeading}>Date discharged</Text>
						<Text style={styles.patientContent}>{dischargeDate}</Text>
					</View>
				</View>
				<View>
					<Svg height="2" width="600">
						<Line
							x1="10"
							y1="0"
							x2="540"
							y2="0"
							strokeWidth={2}
							stroke="black"
						/>
					</Svg>
				</View>
				<View style={styles.summarySection}>
					<View>
						<Text style={styles.summaryHeading}>Final Diagnosis</Text>
						<Text style={styles.summaryPara}>{finalDiagnosis}</Text>
					</View>
					<View>
						<Text style={styles.summaryHeading}>Complaints on Reporting</Text>
						<Text style={styles.summaryPara}>{complaintsOnReporting}</Text>
					</View>
					<View>
						<Text style={styles.summaryHeading}>Past History</Text>
						<Text style={styles.summaryPara}>{pastHistory}</Text>
					</View>
					<View wrap>
						<Text style={styles.summaryHeading}>
							History of Present Illness
						</Text>
						<Text style={styles.summaryPara}>{historyOfPresentingIllness}</Text>
					</View>
					<View wrap>
						<Text style={styles.summaryHeading} wrap>
							Physical Findings of Examination
						</Text>
						<Text style={styles.summaryPara}>
							{physicalFindingsOfExamination}
						</Text>
					</View>
					<View>
						<Text style={styles.summaryHeading}>Laboratory Data</Text>
						<Text style={styles.summaryPara}>{laboratoryData}</Text>
					</View>
					<View>
						<Text style={styles.summaryHeading}>Investigative Procedures</Text>
						<Text style={styles.summaryPara}>{investigationProcedure}</Text>
					</View>
					<View>
						<Text style={styles.summaryHeading}>Therapeutic Procedures</Text>
						<Text style={styles.summaryPara}>{therapeuticProcedure}</Text>
					</View>
					<View>
						<Text style={styles.summaryHeading}>
							Courses of Treatment in Hospital
						</Text>
						<Text style={styles.summaryPara}>
							{coursesOfTreatmentInHospital}
						</Text>
					</View>
					<View>
						<Text style={styles.summaryHeading}>Summary of ICU Stay</Text>
						<Text style={styles.summaryPara}>{summaryOfICUStay}</Text>
					</View>
					<View style={styles.table} break>
						<View style={styles.tableHeadRow}>
							<View style={styles.tableHeadCol}>
								<Text style={styles.tableHeadCell}>Drug</Text>
							</View>
							<View style={styles.tableHeadCol}>
								<Text style={styles.tableHeadCell}>Strength</Text>
							</View>
							<View style={styles.tableHeadCol}>
								<Text style={styles.tableHeadCell}>Frequency</Text>
							</View>
							<View style={styles.tableHeadCol}>
								<Text style={styles.tableHeadCell}>Duration</Text>
							</View>
						</View>
						{summaryDrugInstruction.map((drug: any, index: number) => (
							<View key={index} style={styles.tableRow}>
								<View style={styles.tableCol}>
									<Text style={styles.tableCell}>{drug.name}</Text>
								</View>
								<View style={styles.tableCol}>
									<Text style={styles.tableCell}>{drug.strength}</Text>
								</View>
								<View style={styles.tableCol}>
									<Text style={styles.tableCell}>{drug.frequency}</Text>
								</View>
								<View style={styles.tableCol}>
									<Text style={styles.tableCell}>{drug.duration}</Text>
								</View>
							</View>
						))}
					</View>
					<View>
						<Text style={styles.summaryHeading}>
							Future Advice on Discharge
						</Text>
						<Text style={styles.summaryPara}>{futureAdviceOnDischarge}</Text>
					</View>
				</View>
				<View style={styles.signatorySection}>
					<View style={{ flexGrow: 1 }}>
						<Text style={styles.signatoryHeading}>Prepared By</Text>
						<Text style={styles.signatoryContent}>{preparedByName}</Text>
					</View>
					<View style={{ flexGrow: 1 }}>
						<Text style={styles.signatoryHeading}>Checked By</Text>
						<Text style={styles.signatoryContent}>{checkedByName}</Text>
					</View>
					<View style={{ flexGrow: 1 }}>
						<Text style={styles.signatoryHeading}>Received By</Text>
					</View>
				</View>
				<Text
					style={styles.pageNumber}
					render={({ pageNumber, totalPages }) =>
						`${pageNumber} / ${totalPages}`
					}
					fixed
				/>
			</Page>
		</Document>
	)
}

// Create styles
const styles = StyleSheet.create({
	page: {
		// flexDirection: 'row',
		backgroundColor: '#E4E4E4',
		paddingTop: 35,
		paddingBottom: 35,
		paddingHorizontal: 20,
	},
	subtitle: {
		fontSize: 14,
		marginBottom: 4,
		textAlign: 'center',
		fontFamily: 'Times-Bold',
	},
	pageNumber: {
		position: 'absolute',
		fontSize: 8,
		bottom: 30,
		left: 0,
		right: 0,
		textAlign: 'center',
		color: 'grey',
	},
	title: {
		fontSize: 24,
		textAlign: 'center',
	},
	titleAddress: {
		fontSize: 8,
		textAlign: 'center',
		marginBottom: 2,
	},
	titleCommunication: {
		fontSize: 8,
		textAlign: 'center',
		marginBottom: 3,
	},
	patientSection: {
		margin: 10,
		// padding: 10,
		flexDirection: 'row',
	},
	patientHeading: {
		fontSize: 14,
		fontFamily: 'Times-Bold',
	},
	patientContent: {
		fontSize: 12,
	},
	summarySection: {
		margin: 10,
		// padding: 10,
		// flexDirection: 'row',
	},
	summaryHeading: {
		fontSize: 14,
		fontFamily: 'Times-Bold',
	},
	summaryPara: {
		fontSize: 12,
		marginBottom: 10,
	},
	signatorySection: {
		margin: 10,
		// paddingBottom: 10,
		flexDirection: 'row',
	},
	signatoryContent: {
		fontSize: 10,
		paddingTop: 20,
	},
	signatoryHeading: {
		fontSize: 14,
		fontFamily: 'Times-Bold',
	},
	table: {
		// display: 'table',
		width: 'auto',
		borderStyle: 'solid',
		borderWidth: 1,
		borderRightWidth: 0,
		borderBottomWidth: 0,
		marginBottom: 10,
	},
	tableRow: {
		margin: 'auto',
		flexDirection: 'row',
	},
	tableCol: {
		width: '25%',
		borderStyle: 'solid',
		borderWidth: 1,
		borderLeftWidth: 0,
		borderTopWidth: 0,
	},
	tableCell: {
		margin: 'auto',
		marginTop: 5,
		fontSize: 10,
	},
	tableHeadRow: {
		margin: 'auto',
		flexDirection: 'row',
	},
	tableHeadCol: {
		width: '25%',
		borderStyle: 'solid',
		borderWidth: 1,
		borderLeftWidth: 0,
		borderTopWidth: 0,
	},
	tableHeadCell: {
		margin: 'auto',
		marginTop: 2,
		fontSize: 11,
		fontFamily: 'Times-Bold',
	},
})
