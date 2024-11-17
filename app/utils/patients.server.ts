import { invariant } from '@epic-web/invariant'
import { prisma } from './db.server'
// TODO: change insert work to capital first word

// Caluclate age from dob in years. bod is in indian standard format
function getAge(dob: Date | null) {
	if (!dob) return ''
	const diffMs = Date.now() - dob.getTime()
	const ageDt = new Date(diffMs)
	return Math.abs(ageDt.getUTCFullYear() - 1970)
}

// TODO: Use this function correctly to modifiy data
function cleanUpPatientData(data: any) {
	return data.map((d: { patient: { dob: any } }) => {
		return {
			...d,
			patient: {
				...d.patient,
				age: getAge(new Date(d.patient?.dob ?? '')),
			},
		}
	})
}

export async function getInPatientAllInfo({
	inPatientId,
	hospitalId,
}: {
	inPatientId: string
	hospitalId: string
}) {
	const data = await prisma.inPatient.findUnique({
		select: {
			patientId: true,
			dischargeSummary: {
				select: {
					docter: {
						select: {
							name: true,
						},
					},
					checkedBy: {
						select: {
							name: true,
						},
					},
					preparedBy: {
						select: {
							name: true,
						},
					},
					dischargeDate: true,
					admitDate: true,
					diagnosis: true,
					finalDiagnosis: true,
					complaintsOnReporting: true,
					pastHistory: true,
					historyOfPresentingIllness: true,
					physicalFindingsOfExamination: true,
					laboratoryData: true,
					investigationProcedure: true,
					coursesOfTreatmentInHospital: true,
					summaryOfICUStay: true,
					summaryDrugInstruction: {
						select: {
							id: true,
							drug: {
								select: {
									id: true,
								},
							},
							strength: {
								select: {
									id: true,
								},
							},
							frequency: {
								select: {
									id: true,
								},
							},
							duration: {
								select: {
									id: true,
								},
							},
							time: {
								select: {
									id: true,
								},
							},
						},
					},
					futureAdviceOnDischarge: true,
					therapeuticProcedure: true,
				},
			},
			hospital: {
				select: {
					registrationNo: true,
					name: true,
					email: true,
					address: {
						select: {
							street: true,
							city: true,
							district: true,
							state: true,
							zip: true,
						},
					},
				},
			},
			docter: {
				select: {
					name: true,
				},
			},
			patient: {
				select: {
					name: true,
					umr: true,
					address: true,
					dob: true,
					gender: true,
					bloodGroup: true,
				},
			},
		},
		where: {
			id: inPatientId,
			hospitalId: hospitalId,
		},
	})

	const age = getAge(new Date(data?.patient.dob ?? ''))
	const dischargeDate = data?.dischargeSummary?.dischargeDate
	const admitDate = data?.dischargeSummary?.admitDate || ''
	let modifiedAdmitDate = dischargeDate
		? new Date(admitDate).toLocaleDateString('en-IN')
		: ''
	const modifiedDischargeDate = dischargeDate
		? new Date(dischargeDate).toLocaleDateString('en-IN')
		: ''
	const summaryDrugInstruction = data?.dischargeSummary?.summaryDrugInstruction
	const modifiedSummaryDrugInstruction =
		summaryDrugInstruction &&
		summaryDrugInstruction.map(item => {
			const frequency = item.frequency.id.split('').join('-')
			return {
				id: item.id,
				name: item.drug.id,
				strength: item.strength.id,
				frequency,
				duration: item.duration.id,
			}
		})
	const modifitedData = {
		...data,
		patient: { ...data?.patient, age },
		dischargeSummary: {
			...data?.dischargeSummary,
			dischargeDate: modifiedDischargeDate,
			admitDate: modifiedAdmitDate,
			summaryDrugInstruction: modifiedSummaryDrugInstruction,
		},
	}
	console.log('🚀 ~ modifitedData:', modifitedData)
	return modifitedData
}
export async function getInPatientsInfoByParam({
	hospitalId,
	param,
}: {
	hospitalId: string
	param: string
}) {
	const searchUmr = Number(param) ? Number(param) : -1
	const data = await prisma.inPatient.findMany({
		select: {
			id: true,
			createdAt: true,
			patient: {
				select: {
					umr: true,
					name: true,
					aadhar: true,
					fatherName: true,
					dob: true,
					gender: true,
					phone: true,
					address: {
						select: {
							city: true,
						},
					},
				},
			},
			dischargeSummary: {
				select: {
					id: true,
				},
			},
		},
		where: {
			hospitalId: hospitalId,
			OR: [
				{
					patient: {
						umr: {
							equals: searchUmr,
						},
					},
				},
				{
					patient: {
						name: {
							contains: param,
						},
					},
				},
				{
					patient: {
						aadhar: {
							equals: param,
						},
					},
				},
				{
					patient: {
						phone: {
							equals: param,
						},
					},
				},
			],
		},
		orderBy: [
			{
				updatedAt: 'desc',
			},
			{
				patient: {
					umr: 'desc',
				},
			},
		],
	})
	const modifiedData = data.map(d => {
		return {
			...d,
			patient: {
				...d.patient,
				age: getAge(new Date(d.patient?.dob ?? '')),
			},
		}
	})
	return modifiedData
}
export async function getInPatientsInfoByDate({
	hospitalId,
	fromDate,
	toDate,
}: {
	hospitalId: string
	fromDate: string
	toDate: string
}) {
	// Adding 1 day to toDate as time is 0 hours for toDate
	toDate = new Date(new Date(toDate).setDate(new Date().getDate() + 1))
		.toISOString()
		.split('T')[0]

	const data = await prisma.inPatient.findMany({
		select: {
			id: true,
			createdAt: true,
			patient: {
				select: {
					id: true,
					umr: true,
					name: true,
					aadhar: true,
					fatherName: true,
					dob: true,
					gender: true,
					phone: true,
					address: {
						select: {
							city: true,
						},
					},
				},
			},
			dischargeSummary: {
				select: {
					id: true,
				},
			},
		},
		where: {
			hospitalId: hospitalId,
			updatedAt: {
				lt: new Date(toDate),
				gte: new Date(fromDate),
			},
		},
		orderBy: [
			{
				updatedAt: 'desc',
			},
			{
				patient: {
					umr: 'desc',
				},
			},
		],
	})
	const modifiedData = data.map(d => {
		return {
			...d,
			patient: {
				...d.patient,
				age: getAge(new Date(d.patient?.dob ?? '')),
			},
		}
	})
	return modifiedData
}

// TODO: Handle any type
// TODO: all text should be in lowercase
export async function createInPatientInfo({ patientInfo, userInfo }: any) {
	const { userId, hospitalId } = userInfo
	const {
		name,
		fatherName,
		dob,
		gender,
		bloodGroup,
		aadhar,
		email,
		phone,
		town,
		district,
	} = patientInfo

	const address = await prisma.address.create({
		select: { id: true },
		data: {
			city: town,
			district,
		},
	})
	// prisma get largest umr string form patient table
	const latestUMR = await prisma.patient.findFirst({
		select: {
			umr: true,
		},
		orderBy: {
			umr: 'desc',
		},
	})
	// const latestUMR = null
	// TODO: Handle this case correctly
	invariant(latestUMR, 'UMR not found')
	const inPatient = await prisma.inPatient.create({
		select: { id: true },
		data: {
			patient: {
				create: {
					address: {
						connect: {
							id: address.id,
						},
					},
					umr: latestUMR.umr + 1,
					name,
					fatherName,
					dob: String(dob),
					gender,
					aadhar,
					bloodGroup,
					email,
					phone,
				},
			},
			hospital: {
				connect: {
					id: hospitalId,
				},
			},
			docter: {
				connect: {
					id: userId,
				},
			},
		},
	})
	// TODO: Handle this case correctly
	// if (!inPatient) {
	// }
	return inPatient
}

export async function getDischargeSummaryInfo({
	dischargeSummaryId,
	hospitalId,
}: {
	dischargeSummaryId: string
	hospitalId: string
}) {
	const data = await prisma.dischargeSummary.findUnique({
		select: {
			id: true,
			hospitalId: true,
			inPatient: {
				select: {
					id: true,
					paymentType: true,
					patient: {
						select: {
							name: true,
						},
					},
				},
			},
			dischargeDate: true,
			admitDate: true,
			diagnosis: true,
			finalDiagnosis: true,
			complaintsOnReporting: true,
			pastHistory: true,
			historyOfPresentingIllness: true,
			physicalFindingsOfExamination: true,
			laboratoryData: true,
			investigationProcedure: true,
			therapeuticProcedure: true,
			coursesOfTreatmentInHospital: true,
			summaryOfICUStay: true,
			futureAdviceOnDischarge: true,
			preparedById: true,
			checkedById: true,
			summaryDrugInstruction: {
				select: {
					id: true,
					drug: {
						select: {
							id: true,
						},
					},
					strength: {
						select: {
							id: true,
						},
					},
					frequency: {
						select: {
							id: true,
						},
					},
					duration: {
						select: {
							id: true,
						},
					},
					time: {
						select: {
							id: true,
						},
					},
				},
			},
		},
		where: {
			id: dischargeSummaryId,
			hospitalId: hospitalId,
		},
	})

	const modifiedSummaryDrugInstruction = data?.summaryDrugInstruction.map(
		item => {
			return {
				id: item.id,
				name: item.drug.id,
				strength: item.strength.id,
				frequency: item.frequency.id,
				duration: item.duration.id,
				time: item.time.id,
			}
		},
	)
	// const admitDate = data?.admitDate
	// const dischargeDate = data?.dischargeDate
	// const modifiedDischargeDate = dischargeDate
	// 	? dischargeDate.toLocaleDateString('en-IN')
	// 	: ''
	// const modifiedAdmitDate = admitDate
	// 	? admitDate.toLocaleDateString('en-IN')
	// 	: ''
	return {
		...data,
		summaryDrugInstruction: modifiedSummaryDrugInstruction,
	}
}

// TODO: Handle any type
export async function createDischargeSummary({
	dischargeSummary,
}: {
	dischargeSummary: any
}) {
	// TODO: Add paymentType in dischargeSummary
	const {
		dischargeDate,
		admitDate,
		diagnosis,
		finalDiagnosis,
		complaintsOnReporting,
		pastHistory,
		historyOfPresentingIllness,
		physicalFindingsOfExamination,
		laboratoryData,
		investigationProcedure,
		therapeuticProcedure,
		coursesOfTreatmentInHospital,
		summaryOfICUStay,
		futureAdviceOnDischarge,
		summaryDrugInstruction,
		userId,
		hospitalId,
		inPatientId,
		paymentType,
	} = dischargeSummary

	const dischargeSummaryInfo = await prisma.dischargeSummary.create({
		select: { id: true },
		data: {
			dischargeDate,
			admitDate,
			diagnosis,
			finalDiagnosis,
			complaintsOnReporting,
			pastHistory,
			historyOfPresentingIllness,
			physicalFindingsOfExamination,
			laboratoryData,
			investigationProcedure,
			therapeuticProcedure,
			coursesOfTreatmentInHospital,
			summaryOfICUStay,
			futureAdviceOnDischarge,
			preparedById: userId,
			hospitalId: hospitalId,
			checkedById: userId,
			docterId: userId,
			inPatientId: inPatientId,
		},
	})
	// Handle correctly
	if (!dischargeSummaryInfo || !dischargeSummaryInfo?.id)
		throw new Error('Discharge Summary not created')

	for (let i = 0; i < summaryDrugInstruction.length; i++) {
		const { name, strength, frequency, duration, time } =
			summaryDrugInstruction[i]
		await prisma.summaryDrugInstruction.create({
			select: { id: true },
			data: {
				drug: {
					connectOrCreate: {
						create: {
							id: name,
							hospitalId: hospitalId,
						},
						where: {
							id: name,
						},
					},
				},
				strength: {
					connectOrCreate: {
						create: {
							id: strength,
						},
						where: {
							id: strength,
						},
					},
				},
				frequency: {
					connectOrCreate: {
						create: {
							id: frequency,
						},
						where: {
							id: frequency,
						},
					},
				},
				duration: {
					connectOrCreate: {
						create: {
							id: duration,
						},
						where: {
							id: duration,
						},
					},
				},
				time: {
					connect: {
						id: time,
					},
				},
				dischargeSummary: {
					connect: {
						id: dischargeSummaryInfo.id,
					},
				},
			},
		})
	}
	return dischargeSummaryInfo.id
}

export async function updateDischargeSummary({
	dischargeSummary,
}: {
	dischargeSummary: any
}) {
	// TODO: Add 2 updates in a transaction
	const {
		dischargeSummaryId,
		dischargeDate,
		admitDate,
		diagnosis,
		finalDiagnosis,
		complaintsOnReporting,
		pastHistory,
		historyOfPresentingIllness,
		physicalFindingsOfExamination,
		laboratoryData,
		investigationProcedure,
		therapeuticProcedure,
		coursesOfTreatmentInHospital,
		summaryOfICUStay,
		futureAdviceOnDischarge,
		summaryDrugInstruction,
		hospitalId,
		paymentType,
	} = dischargeSummary

	await prisma.summaryDrugInstruction.deleteMany({
		where: {
			dischargeSummaryId: dischargeSummaryId,
		},
	})
	for (let i = 0; i < summaryDrugInstruction.length; i++) {
		const { name, strength, frequency, duration, time } =
			summaryDrugInstruction[i]
		await prisma.summaryDrugInstruction.create({
			select: { id: true },
			data: {
				drug: {
					connectOrCreate: {
						create: {
							id: name,
							hospitalId: hospitalId,
						},
						where: {
							id: name,
						},
					},
				},
				strength: {
					connectOrCreate: {
						create: {
							id: strength,
						},
						where: {
							id: strength,
						},
					},
				},
				frequency: {
					connectOrCreate: {
						create: {
							id: frequency,
						},
						where: {
							id: frequency,
						},
					},
				},
				duration: {
					connectOrCreate: {
						create: {
							id: duration,
						},
						where: {
							id: duration,
						},
					},
				},
				time: {
					connect: {
						id: time,
					},
				},
				dischargeSummary: {
					connect: {
						id: dischargeSummaryId,
					},
				},
			},
		})
	}
	const dischargeSummaryInfo = await prisma.dischargeSummary.update({
		select: { id: true },
		where: {
			id: dischargeSummaryId,
		},
		data: {
			dischargeDate,
			admitDate,
			diagnosis,
			finalDiagnosis,
			complaintsOnReporting,
			pastHistory,
			historyOfPresentingIllness,
			physicalFindingsOfExamination,
			laboratoryData,
			investigationProcedure,
			therapeuticProcedure,
			coursesOfTreatmentInHospital,
			summaryOfICUStay,
			futureAdviceOnDischarge,
			inPatient: {
				update: {
					paymentType,
				},
			},
		},
	})
	// TODO: handle discharege info Id error scenario correctly
	console.log('🚀 ~ dischargeSummaryInfo:', dischargeSummaryInfo)
	return { ...dischargeSummaryInfo }
}

export async function getDischargeSummaryTemplateNames({
	hospitalId,
}: {
	hospitalId: string
}) {
	const data = await prisma.dischargeSummaryTemplate.findMany({
		select: {
			id: true,
			name: true,
		},
		where: {
			hospitalId: hospitalId,
		},
	})
	return data
}

export async function getDischargeSummaryTemplateInfo({
	hospitalId,
	templateId,
}: {
	hospitalId: string
	templateId: string
}) {
	const data = await prisma.dischargeSummaryTemplate.findUnique({
		select: {
			id: true,
			name: true,
			diagnosis: true,
			finalDiagnosis: true,
			complaintsOnReporting: true,
			pastHistory: true,
			historyOfPresentingIllness: true,
			physicalFindingsOfExamination: true,
			laboratoryData: true,
			investigationProcedure: true,
			therapeuticProcedure: true,
			coursesOfTreatmentInHospital: true,
			summaryOfICUStay: true,
			futureAdviceOnDischarge: true,
			summaryDrugInstruction: {
				select: {
					drug: {
						select: {
							id: true,
						},
					},
					strength: {
						select: {
							id: true,
						},
					},
					frequency: {
						select: {
							id: true,
						},
					},
					duration: {
						select: {
							id: true,
						},
					},
					time: {
						select: {
							id: true,
						},
					},
				},
			},
		},
		where: {
			id: templateId,
			hospitalId: hospitalId,
		},
	})
	const modifiedSummaryDrugInstruction = data?.summaryDrugInstruction.map(
		item => {
			return {
				name: item.drug.id,
				strength: item.strength.id,
				frequency: item.frequency.id,
				duration: item.duration.id,
				time: item.time.id,
			}
		},
	)
	return { ...data, summaryDrugInstruction: modifiedSummaryDrugInstruction }
}

export async function createDischargeSummaryTemplate({ data }: { data: any }) {
	const {
		name,
		diagnosis,
		finalDiagnosis,
		complaintsOnReporting,
		pastHistory,
		historyOfPresentingIllness,
		physicalFindingsOfExamination,
		laboratoryData,
		investigationProcedure,
		therapeuticProcedure,
		coursesOfTreatmentInHospital,
		summaryOfICUStay,
		futureAdviceOnDischarge,
		summaryDrugInstruction,
		hospitalId,
		userId,
	} = data
	const dischargeSummaryTemplateInfo =
		await prisma.dischargeSummaryTemplate.create({
			select: { id: true },
			data: {
				name,
				diagnosis,
				finalDiagnosis,
				complaintsOnReporting,
				pastHistory,
				historyOfPresentingIllness,
				physicalFindingsOfExamination,
				laboratoryData,
				investigationProcedure,
				therapeuticProcedure,
				coursesOfTreatmentInHospital,
				summaryOfICUStay,
				futureAdviceOnDischarge,
				hospitalId,
				createdBy: userId,
			},
		})

	for (let i = 0; i < summaryDrugInstruction.length; i++) {
		const { name, strength, frequency, duration, time } =
			summaryDrugInstruction[i]
		// TODO: Handle failure case correctly
		const summaryDrugInstructionInfo =
			await prisma.summaryDrugInstruction.create({
				select: { id: true },
				data: {
					drug: {
						connectOrCreate: {
							create: {
								id: name,
								hospitalId: hospitalId,
							},
							where: {
								id: name,
							},
						},
					},
					strength: {
						connectOrCreate: {
							create: {
								id: strength,
							},
							where: {
								id: strength,
							},
						},
					},
					frequency: {
						connectOrCreate: {
							create: {
								id: frequency,
							},
							where: {
								id: frequency,
							},
						},
					},
					duration: {
						connectOrCreate: {
							create: {
								id: duration,
							},
							where: {
								id: duration,
							},
						},
					},
					time: {
						connect: {
							id: time,
						},
					},
					dischargeSummaryTemplate: {
						connect: {
							id: dischargeSummaryTemplateInfo.id,
						},
					},
				},
			})
	}
	return dischargeSummaryTemplateInfo
}
