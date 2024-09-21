import { invariant } from '@epic-web/invariant'
import { prisma } from './db.server'
import { redirectWithToast } from './toast.server'
import { safeRedirect } from 'remix-utils/safe-redirect'

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

export async function getInPatientsInfoByParam({
	hospitalId,
	param,
}: {
	hospitalId: string
	param: string
}) {
	const searchUmr = Number(param) ? Number(param) : -1
	console.log('🚀 ~ searchUmr:', typeof param, Number(param), searchUmr)
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
			dischargeDate: true,
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
		},
		where: {
			id: dischargeSummaryId,
			hospitalId: hospitalId,
		},
	})
	// TODO: Handle negative case scenario
	console.log('🚀 ~ data:', data)
	return data
}
