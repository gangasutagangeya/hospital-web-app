import { prisma } from '#app/utils/db.server.ts'
import { cleanupDb, createPassword } from '#tests/db-utils.ts'
import { fakerEN_IN as faker } from '@faker-js/faker'
import { Address } from '@prisma/client'

async function seed() {
	console.log('🌱 Seeding...')
	console.time(`🌱 Database has been seeded`)
	// TODO: delete the tables that are not needed
	// await prisma.entity.deleteMany()
	// await prisma.action.deleteMany()
	// await prisma.bed.deleteMany()
	// await prisma.room.deleteMany()

	console.time('🧹 Cleaned up the database...')
	await cleanupDb(prisma)
	console.timeEnd('🧹 Cleaned up the database...')

	console.time('🔑 create entities...')
	// Entities represent the main components or resources within your web application.
	const entities = ['appOwner', 'doctor', 'patient', 'appointment']
	for (const entity of entities) {
		await prisma.entity.create({
			data: { name: entity },
		})
	}
	console.timeEnd('🔑 create entities...')

	console.time('🔑 create actions...')
	// Actions represent the operations or activities that users can perform on entities
	const actions = ['create', 'read', 'update', 'delete']
	for (const action of actions) {
		await prisma.action.create({
			data: { name: action },
		})
	}
	console.timeEnd('🔑 create actions...')
	console.time('🔑 create address...')
	const amountOfAddress = 100
	const addresses: Address[] = []
	for (let i = 0; i < amountOfAddress; i++) {
		const address: Address = {
			id: faker.string.uuid(),
			street: faker.location.streetAddress(),
			city: faker.location.county(),
			district: faker.location.city(),
			state: faker.location.state(),
			zip: faker.location.zipCode(),
			country: 'India',
			createdAt: new Date(),
			updatedAt: new Date(),
		}
		addresses.push(address)
	}
	await prisma.address.createMany({ data: addresses })
	console.timeEnd('🔑 create address...')

	console.time('🏥 🛏️ create org, hospitals with address, room and beds...')
	await prisma.org.create({
		data: {
			name: 'Gaga Ltd',
			addressId:
				addresses[faker.number.int({ min: 1, max: addresses.length - 1 })].id,
			hospital: {
				create: [
					{
						name: 'mahabharatam hospital',
						registrationNo: '989898',
						phone: 9391576029,
						email: 'mahabharatam@gaga.com',
						addressId:
							addresses[faker.number.int({ min: 1, max: addresses.length - 1 })]
								.id,
						room: {
							create: [
								{
									no: 1,
									type: 'icu',
									available: true,
									beds: {
										create: [
											{ no: 1, available: true },
											{ no: 2, available: true },
											{ no: 3, available: true },
										],
									},
								},
								{
									no: 2,
									type: 'general',
									available: true,
									beds: {
										create: [
											{ no: 1, available: true },
											{ no: 2, available: true },
											{ no: 3, available: true },
										],
									},
								},
								{
									no: 3,
									type: 'vip',
									available: true,
									beds: {
										create: [
											{ no: 1, available: true },
											{ no: 2, available: true },
											{ no: 3, available: true },
										],
									},
								},
							],
						},
					},
					{
						name: 'ramayanam Hospital',
						registrationNo: '979797',
						phone: 9182548770,
						email: 'ramayanam@gaga.com',
						addressId:
							addresses[faker.number.int({ min: 1, max: addresses.length - 1 })]
								.id,
						room: {
							create: [
								{
									no: 1,
									type: 'icu',
									available: true,
									beds: {
										create: [
											{ no: 1, available: true },
											{ no: 2, available: true },
											{ no: 3, available: true },
										],
									},
								},
								{
									no: 2,
									type: 'general',
									available: true,
									beds: {
										create: [
											{ no: 1, available: true },
											{ no: 2, available: true },
											{ no: 3, available: true },
										],
									},
								},
								{
									no: 3,
									type: 'vip',
									available: true,
									beds: {
										create: [
											{ no: 1, available: true },
											{ no: 2, available: true },
											{ no: 3, available: true },
										],
									},
								},
							],
						},
					},
				],
			},
		},
	})
	console.timeEnd('🏥 🛏️ create org, hospitals with address, room and beds...')

	console.time('create permissions...')
	const actionsData = await prisma.action.findMany({
		select: {
			id: true,
			name: true,
		},
	})
	const entitiesData = await prisma.entity.findMany({
		select: {
			id: true,
			name: true,
		},
	})
	for (const entity of entitiesData) {
		for (const action of actionsData) {
			await prisma.permission.create({
				data: {
					entityId: entity.id,
					entityName: entity.name,
					actionId: action.id,
					actionName: action.name,
				},
			})
		}
	}
	console.timeEnd('create permissions...')

	console.time('👑 Create roles...')
	// appOwner
	await prisma.role.create({
		data: {
			name: 'appOwner',
			permissions: {
				connect: await prisma.permission.findMany({
					select: { id: true },
					where: {
						entityName: {
							in: ['appOwner', 'doctor', 'patient', 'appointment'],
						},
					},
				}),
			},
		},
	})
	// hospitalOwner
	await prisma.role.create({
		data: {
			name: 'hospitalOwner',
			permissions: {
				connect: await prisma.permission.findMany({
					select: { id: true },
					where: {
						entityName: { in: ['doctor', 'patient', 'appointment'] },
					},
				}),
			},
		},
	})
	// chiefDoctor
	await prisma.role.create({
		data: {
			name: 'chiefDoctor',
			permissions: {
				connect: await prisma.permission.findMany({
					select: { id: true },
					where: {
						AND: [
							{ entityName: { in: ['doctor', 'patient', 'appointment'] } },
							{ actionName: { in: ['create', 'read', 'update'] } },
						],
					},
				}),
			},
		},
	})
	// doctor
	await prisma.role.create({
		data: {
			name: 'doctor',
			permissions: {
				connect: await prisma.permission.findMany({
					select: { id: true },
					where: {
						AND: [
							{ entityName: { in: ['doctor', 'patient', 'appointment'] } },
							{ actionName: { in: ['create', 'read'] } },
						],
					},
				}),
			},
		},
	})
	// headNurse
	await prisma.role.create({
		data: {
			name: 'headNurse',
			permissions: {
				connect: await prisma.permission.findMany({
					select: { id: true },
					where: {
						AND: [
							{ entityName: { in: ['patient', 'appointment'] } },
							{ actionName: { in: ['create', 'read', 'update'] } },
						],
					},
				}),
			},
		},
	})
	// nurse
	await prisma.role.create({
		data: {
			name: 'nurse',
			permissions: {
				connect: await prisma.permission.findMany({
					select: { id: true },
					where: {
						AND: [
							{ entityName: { in: ['patient', 'appointment'] } },
							{ actionName: { in: ['create', 'read'] } },
						],
					},
				}),
			},
		},
	})
	console.timeEnd('👑 Create roles...')
	const mahabharatamHospital = await prisma.hospital.findUnique({
		select: { id: true },
		where: {
			registrationNo: '989898',
		},
	})
	const ramanayamHospital = await prisma.hospital.findUnique({
		select: { id: true },
		where: {
			registrationNo: '979797',
		},
	})
	console.time('👤 Create users...')
	// Mahabharatam hospital
	// Krishna - appOwner
	// TODO: separate appOwner from here
	await prisma.user.create({
		data: {
			addressId:
				addresses[faker.number.int({ min: 1, max: addresses.length - 1 })].id,
			username: 'krishna',
			name: 'krishna',
			fatherName: 'vishnu',
			aadhar: '987723222323',
			qualification: 'ms',
			salary: '',
			email: 'krishna@gaga.in',
			phone: '9391576029',
			roles: {
				connect: {
					name: 'appOwner',
				},
			},
			password: { create: createPassword('krishna') },
		},
	})
	// Bheeshmudu - hospitalOwner
	await prisma.user.create({
		data: {
			hospitalId: mahabharatamHospital?.id,
			addressId:
				addresses[faker.number.int({ min: 1, max: addresses.length - 1 })].id,
			name: 'bheeshmudu',
			username: 'bheeshmudu',
			fatherName: 'Santanu',
			aadhar: '323412342343',
			qualification: 'ms',
			salary: '',
			email: 'bheeshmudu@gaga.in',
			phone: '8976565434',
			roles: {
				connect: {
					name: 'hospitalOwner',
				},
			},
			password: { create: createPassword('bheeshmudu') },
		},
	})
	// Drona - hospitalOwner
	await prisma.user.create({
		data: {
			hospitalId: mahabharatamHospital?.id,
			addressId:
				addresses[faker.number.int({ min: 1, max: addresses.length - 1 })].id,
			name: 'drona',
			username: 'drona',
			fatherName: 'bharadvaja',
			aadhar: '323411342343',
			qualification: 'ms',
			salary: '',
			email: 'drona@gaga.in',
			phone: '8976565432',
			roles: {
				connect: {
					name: 'hospitalOwner',
				},
			},
			password: { create: createPassword('bheeshmudu') },
		},
	})
	// Dharma Raju - chiefDoctor
	await prisma.user.create({
		data: {
			hospitalId: mahabharatamHospital?.id,
			addressId:
				addresses[faker.number.int({ min: 1, max: addresses.length - 1 })].id,
			username: 'dharamaraju',
			name: 'dharamaraju',
			fatherName: 'yama dharamaraju',
			aadhar: '878787878787',
			qualification: 'phd',
			salary: '50000',
			email: 'dharamaraju@gaga.in',
			phone: '9876767676',
			roles: {
				connect: {
					name: 'chiefDoctor',
				},
			},
			password: { create: createPassword('dharamaraju') },
		},
	})
	// Bheemudu - doctor
	await prisma.user.create({
		data: {
			hospitalId: mahabharatamHospital?.id,
			addressId:
				addresses[faker.number.int({ min: 1, max: addresses.length - 1 })].id,
			username: 'beemudu',
			name: 'beemudu',
			fatherName: 'vayuvu',
			aadhar: '987987987634',
			qualification: 'ms',
			salary: '50000',
			email: 'beemudu@gaga.in',
			phone: '7678767821',
			roles: {
				connect: {
					name: 'doctor',
				},
			},
			password: { create: createPassword('beemudu') },
		},
	})
	// Draupadi - doctor
	await prisma.user.create({
		data: {
			hospitalId: mahabharatamHospital?.id,
			addressId:
				addresses[faker.number.int({ min: 1, max: addresses.length - 1 })].id,
			username: 'draupadi',
			name: 'draupadi',
			fatherName: 'drupada',
			aadhar: '987981987611',
			qualification: 'ms',
			salary: '50000',
			email: 'draupadi@gaga.in',
			phone: '7678717825',
			roles: {
				connect: {
					name: 'doctor',
				},
			},
			password: { create: createPassword('draupadi') },
		},
	})
	// karna - headNurse
	await prisma.user.create({
		data: {
			hospitalId: mahabharatamHospital?.id,
			addressId:
				addresses[faker.number.int({ min: 1, max: addresses.length - 1 })].id,
			username: 'karna',
			name: 'karna',
			fatherName: 'surya',
			aadhar: '981981987611',
			qualification: 'ms',
			salary: '50000',
			email: 'karna@gaga.in',
			phone: '2678717825',
			roles: {
				connect: {
					name: 'headNurse',
				},
			},
			password: { create: createPassword('karna') },
		},
	})
	// Kripa - nurse
	await prisma.user.create({
		data: {
			hospitalId: mahabharatamHospital?.id,
			addressId:
				addresses[faker.number.int({ min: 1, max: addresses.length - 1 })].id,
			username: 'kripa',
			name: 'kripa',
			fatherName: 'sharadwan',
			aadhar: '281981987611',
			qualification: 'ms',
			salary: '50000',
			email: 'kripa@gaga.in',
			phone: '2678417825',
			roles: {
				connect: {
					name: 'nurse',
				},
			},
			password: { create: createPassword('kripa') },
		},
	})
	// Amba - nurse
	await prisma.user.create({
		data: {
			hospitalId: mahabharatamHospital?.id,
			addressId:
				addresses[faker.number.int({ min: 1, max: addresses.length - 1 })].id,
			username: 'amba',
			name: 'amba',
			fatherName: 'kashya',
			aadhar: '282981987611',
			qualification: 'ms',
			salary: '50000',
			email: 'amba@gaga.in',
			phone: '2678457825',
			roles: {
				connect: {
					name: 'nurse',
				},
			},
			password: { create: createPassword('amba') },
		},
	})
	// Ramayanam hospital
	// Rama - appOwner
	await prisma.user.create({
		data: {
			addressId:
				addresses[faker.number.int({ min: 1, max: addresses.length - 1 })].id,
			username: 'rama',
			name: 'rama',
			fatherName: 'dasaratha',
			aadhar: '987723222325',
			qualification: 'phd',
			salary: '',
			email: 'rama@gaga.in',
			phone: '9391376029',
			roles: {
				connect: {
					name: 'appOwner',
				},
			},
			password: { create: createPassword('rama') },
		},
	})
	// Sita - hospitalOwner
	await prisma.user.create({
		data: {
			hospitalId: ramanayamHospital?.id,
			addressId:
				addresses[faker.number.int({ min: 1, max: addresses.length - 1 })].id,
			username: 'sita',
			name: 'sita',
			fatherName: 'janaka',
			aadhar: '323412942343',
			qualification: 'phd',
			salary: '',
			email: 'sita@gaga.in',
			phone: '8971565434',
			roles: {
				connect: {
					name: 'hospitalOwner',
				},
			},
			password: { create: createPassword('sita') },
		},
	})
	// lakshmana - hospitalOwner
	await prisma.user.create({
		data: {
			hospitalId: ramanayamHospital?.id,
			addressId:
				addresses[faker.number.int({ min: 1, max: addresses.length - 1 })].id,
			username: 'lakshmana',
			name: 'lakshmana',
			fatherName: 'dasaratha',
			aadhar: '323411342303',
			qualification: 'ms',
			salary: '',
			email: 'lakshmana@gaga.in',
			phone: '8976565412',
			roles: {
				connect: {
					name: 'hospitalOwner',
				},
			},
			password: { create: createPassword('lakshmana') },
		},
	})
	// Hanuman - chiefDoctor
	await prisma.user.create({
		data: {
			hospitalId: ramanayamHospital?.id,
			addressId:
				addresses[faker.number.int({ min: 1, max: addresses.length - 1 })].id,
			username: 'hanuman',
			name: 'hanuman',
			fatherName: 'vayu',
			aadhar: '878787818787',
			qualification: 'phd',
			salary: '50000',
			email: 'hanuman@gaga.in',
			phone: '9876767671',
			roles: {
				connect: {
					name: 'chiefDoctor',
				},
			},
			password: { create: createPassword('hanuman') },
		},
	})
	// Kaikeyi - doctor
	await prisma.user.create({
		data: {
			hospitalId: ramanayamHospital?.id,
			addressId:
				addresses[faker.number.int({ min: 1, max: addresses.length - 1 })].id,
			username: 'kaikeyi',
			name: 'kaikeyi',
			fatherName: 'ashvapathi',
			aadhar: '987987187634',
			qualification: 'ms',
			salary: '50000',
			email: 'kaikeyi@gaga.in',
			phone: '7678760821',
			roles: {
				connect: {
					name: 'doctor',
				},
			},
			password: { create: createPassword('kaikeyi') },
		},
	})
	// Bharata - doctor
	await prisma.user.create({
		data: {
			hospitalId: ramanayamHospital?.id,
			addressId:
				addresses[faker.number.int({ min: 1, max: addresses.length - 1 })].id,
			username: 'bharata',
			name: 'bharata',
			fatherName: 'dasaratha',
			aadhar: '987981987011',
			qualification: 'ms',
			salary: '50000',
			email: 'bharata@gaga.in',
			phone: '7678711825',
			roles: {
				connect: {
					name: 'doctor',
				},
			},
			password: { create: createPassword('bharata') },
		},
	})
	// Jatayu - headNurse
	await prisma.user.create({
		data: {
			hospitalId: ramanayamHospital?.id,
			addressId:
				addresses[faker.number.int({ min: 1, max: addresses.length - 1 })].id,
			username: 'jatayu',
			name: 'jatayu',
			fatherName: 'aruna',
			aadhar: '983981987611',
			qualification: 'ms',
			salary: '50000',
			email: 'jatayu@gaga.in',
			phone: '2678757825',
			roles: {
				connect: {
					name: 'headNurse',
				},
			},
			password: { create: createPassword('jatayu') },
		},
	})
	// Garuda - nurse
	await prisma.user.create({
		data: {
			hospitalId: ramanayamHospital?.id,
			addressId:
				addresses[faker.number.int({ min: 1, max: addresses.length - 1 })].id,
			username: 'garuda',
			name: 'garuda',
			fatherName: 'kashyapa',
			aadhar: '281981087611',
			qualification: 'ms',
			salary: '50000',
			email: 'garuda@gaga.in',
			phone: '2678427825',
			roles: {
				connect: {
					name: 'nurse',
				},
			},
			password: { create: createPassword('garuda') },
		},
	})
	// Lava - nurse
	await prisma.user.create({
		data: {
			hospitalId: ramanayamHospital?.id,
			addressId:
				addresses[faker.number.int({ min: 1, max: addresses.length - 1 })].id,
			username: 'lava',
			name: 'lava',
			fatherName: 'rama',
			aadhar: '282481987611',
			qualification: 'ms',
			salary: '50000',
			email: 'lava@gaga.in',
			phone: '2671457825',
			roles: {
				connect: {
					name: 'nurse',
				},
			},
			password: { create: createPassword('lava') },
		},
	})
	console.timeEnd('👤 Create users...')

	console.time('🛏️ Create in-patients...')

	const frequencies = [
		{ frequency: '001' },
		{ frequency: '010' },
		{ frequency: '100' },
		{ frequency: '101' },
		{ frequency: '110' },
		{ frequency: '111' },
	]
	await prisma.drugFrequency.createMany({
		data: frequencies,
	})

	const drugStrengths = [
		{ strength: '1mg' },
		{ strength: '2mg' },
		{ strength: '3mg' },
		{ strength: '4mg' },
		{ strength: '5mg' },
		{ strength: '6mg' },
		{ strength: '7mg' },
		{ strength: '8mg' },
		{ strength: '9mg' },
		{ strength: '10mg' },
	]

	await prisma.drugStrength.createMany({
		data: drugStrengths,
	})

	const durations = [
		{ duration: '1 day' },
		{ duration: '2 days' },
		{ duration: '3 days' },
		{ duration: '4 days' },
		{ duration: '5 days' },
		{ duration: '6 days' },
		{ duration: '7 days' },
		{ duration: '8 days' },
		{ duration: '9 days' },
		{ duration: '10 days' },
	]

	await prisma.drugDuration.createMany({
		data: durations,
	})

	const drugTimes = [{ time: 'before' }, { time: 'after' }]

	await prisma.drugTime.createMany({
		data: drugTimes,
	})

	const drugs = []
	for (let i = 0; i < 20; i++) {
		drugs.push({
			name: faker.lorem.word() + i,
			description: faker.lorem.sentence(),
		})
	}

	await prisma.drug.createMany({
		data: drugs,
	})

	const mahabharatamDocters = await prisma.user.findMany({
		where: {
			OR: [
				{ roles: { some: { name: 'doctor' } } },
				{ roles: { some: { name: 'hospitalOwner' } } },
				{ roles: { some: { name: 'chiefDoctor' } } },
			],
			AND: {
				hospitalId: mahabharatamHospital?.id,
			},
		},
		select: { id: true, name: true, username: true },
	})
	const ramanayamDocters = await prisma.user.findMany({
		where: {
			OR: [
				{ roles: { some: { name: 'doctor' } } },
				{ roles: { some: { name: 'hospitalOwner' } } },
				{ roles: { some: { name: 'chiefDoctor' } } },
			],
			AND: {
				hospitalId: ramanayamHospital?.id,
			},
		},
		select: { id: true, name: true, username: true },
	})

	// TODO: create UMR number to be unique
	// Mahabharatam Hospital In Patients
	for (let i = 0; i < 100; i++) {
		await prisma.inPatient.create({
			data: {
				patient: {
					create: {
						addressId:
							addresses[faker.number.int({ min: 1, max: addresses.length - 1 })]
								.id,
						umr: 10001 + i,
						name: faker.person.firstName(),
						fatherName: faker.person.firstName(),
						dob: String(
							faker.date.birthdate({
								min: 10,
								max: 90,
								mode: 'age',
							}),
						),
						gender: faker.helpers.arrayElement(['M', 'F']),
						aadhar: faker.string.numeric({
							length: 12,
							allowLeadingZeros: false,
						}),
						bloodGroup: faker.helpers.arrayElement([
							'A+',
							'B+',
							'O+',
							'AB+',
							'A-',
							'B-',
							'O-',
							'AB-',
						]),
						email: faker.string.alpha(5) + '@gaga.com',
						phone: faker.string.numeric({
							length: 10,
							allowLeadingZeros: false,
						}),
					},
				},
				paymentType: faker.helpers.arrayElement([
					'Card',
					'Cash',
					'UPI',
					'Insurance',
				]),
				room: {
					connect: {
						id: (
							await prisma.room.findMany({
								select: { id: true },
								where: {
									AND: [
										{
											hospitalId: mahabharatamHospital?.id,
										},
										{ no: faker.number.int({ min: 1, max: 3 }) },
									],
								},
							})
						)[0].id,
					},
				},
				bed: {
					connect: {
						id: (
							await prisma.bed.findMany({
								select: { id: true },
								where: {
									no: faker.number.int({ min: 1, max: 3 }),
								},
							})
						)[0].id,
					},
				},
				hospital: {
					connect: {
						id: mahabharatamHospital?.id,
					},
				},
				docter: {
					connect: {
						id: mahabharatamDocters[
							faker.number.int({ min: 0, max: mahabharatamDocters.length - 1 })
						].id,
					},
				},
				dischargeSummary: {
					create: {
						docter: {
							connect: {
								id: mahabharatamDocters[
									faker.number.int({
										min: 0,
										max: mahabharatamDocters.length - 1,
									})
								].id,
							},
						},
						hospital: {
							connect: {
								id: mahabharatamHospital?.id,
							},
						},
						dischargeDate: new Date(),
						diagnosis: faker.lorem.sentence(),
						finalDiagnosis: faker.lorem.sentence(),
						complaintsOnReporting: faker.lorem.sentence(),
						pastHistory: faker.lorem.sentence(),
						historyOfPresentingIllness: faker.lorem.sentence(),
						physicalFindingsOfExamination: faker.lorem.sentence(),
						laboratoryData: faker.lorem.sentence(),
						investigationProcedure: faker.lorem.sentence(),
						therapeuticProcedure: faker.lorem.sentence(),
						coursesOfTreatmentInHospital: faker.lorem.sentence(),
						summaryOfICUStay: faker.lorem.sentence(),
						futureAdviceOnDischarge: faker.lorem.sentence(),
						summaryDrugInstruction: {
							create: [
								{
									drug: {
										connect: {
											name: drugs[
												faker.number.int({ min: 0, max: drugs.length - 1 })
											].name,
										},
									},
									frequency: {
										connect: {
											frequency:
												frequencies[
													faker.number.int({
														min: 0,
														max: frequencies.length - 1,
													})
												].frequency,
										},
									},
									strength: {
										connect: {
											strength:
												drugStrengths[
													faker.number.int({
														min: 0,
														max: drugStrengths.length - 1,
													})
												].strength,
										},
									},
									duration: {
										connect: {
											duration:
												durations[
													faker.number.int({
														min: 0,
														max: durations.length - 1,
													})
												].duration,
										},
									},
									time: {
										connect: {
											time: drugTimes[
												faker.number.int({ min: 0, max: drugTimes.length - 1 })
											].time,
										},
									},
								},
							],
						},
						preparedBy: {
							connect: {
								id: mahabharatamDocters[
									faker.number.int({
										min: 0,
										max: mahabharatamDocters.length - 1,
									})
								].id,
							},
						},
						checkedBy: {
							connect: {
								id: mahabharatamDocters[
									faker.number.int({
										min: 0,
										max: mahabharatamDocters.length - 1,
									})
								].id,
							},
						},
					},
				},
			},
		})
	}

	// TODO: create UMR number to be unique
	// Ramayanam Hospital In Patients
	for (let i = 100; i < 200; i++) {
		await prisma.inPatient.create({
			data: {
				patient: {
					create: {
						addressId:
							addresses[faker.number.int({ min: 1, max: addresses.length - 1 })]
								.id,
						umr: 10001 + i,
						name: faker.person.firstName(),
						fatherName: faker.person.firstName(),
						dob: String(
							faker.date.birthdate({
								min: 10,
								max: 90,
								mode: 'age',
							}),
						),
						gender: faker.helpers.arrayElement(['M', 'F']),
						aadhar: faker.string.numeric({
							length: 12,
							allowLeadingZeros: false,
						}),
						bloodGroup: faker.helpers.arrayElement([
							'A+',
							'B+',
							'O+',
							'AB+',
							'A-',
							'B-',
							'O-',
							'AB-',
						]),
						email: faker.internet.email(),
						phone: faker.string.numeric({
							length: 10,
							allowLeadingZeros: false,
						}),
					},
				},
				paymentType: faker.helpers.arrayElement([
					'Card',
					'Cash',
					'UPI',
					'Insurance',
				]),
				room: {
					connect: {
						id: (
							await prisma.room.findMany({
								select: { id: true },
								where: {
									AND: [
										{
											hospitalId: ramanayamHospital?.id,
										},
										{ no: faker.number.int({ min: 1, max: 3 }) },
									],
								},
							})
						)[0].id,
					},
				},
				bed: {
					connect: {
						id: (
							await prisma.bed.findMany({
								select: { id: true },
								where: {
									no: faker.number.int({ min: 1, max: 3 }),
								},
							})
						)[0].id,
					},
				},
				hospital: {
					connect: {
						id: ramanayamHospital?.id,
					},
				},
				docter: {
					connect: {
						id: ramanayamDocters[
							faker.number.int({ min: 0, max: ramanayamDocters.length - 1 })
						].id,
					},
				},
				dischargeSummary: {
					create: {
						docter: {
							connect: {
								id: ramanayamDocters[
									faker.number.int({
										min: 0,
										max: ramanayamDocters.length - 1,
									})
								].id,
							},
						},
						hospital: {
							connect: {
								id: mahabharatamHospital?.id,
							},
						},
						dischargeDate: new Date(),
						diagnosis: faker.lorem.sentence(),
						finalDiagnosis: faker.lorem.sentence(),
						complaintsOnReporting: faker.lorem.sentence(),
						pastHistory: faker.lorem.sentence(),
						historyOfPresentingIllness: faker.lorem.sentence(),
						physicalFindingsOfExamination: faker.lorem.sentence(),
						laboratoryData: faker.lorem.sentence(),
						investigationProcedure: faker.lorem.sentence(),
						therapeuticProcedure: faker.lorem.sentence(),
						coursesOfTreatmentInHospital: faker.lorem.sentence(),
						summaryOfICUStay: faker.lorem.sentence(),
						futureAdviceOnDischarge: faker.lorem.sentence(),
						summaryDrugInstruction: {
							create: [
								{
									drug: {
										connect: {
											name: drugs[
												faker.number.int({ min: 0, max: drugs.length - 1 })
											].name,
										},
									},
									frequency: {
										connect: {
											frequency:
												frequencies[
													faker.number.int({
														min: 0,
														max: frequencies.length - 1,
													})
												].frequency,
										},
									},
									strength: {
										connect: {
											strength:
												drugStrengths[
													faker.number.int({
														min: 0,
														max: drugStrengths.length - 1,
													})
												].strength,
										},
									},
									duration: {
										connect: {
											duration:
												durations[
													faker.number.int({
														min: 0,
														max: durations.length - 1,
													})
												].duration,
										},
									},
									time: {
										connect: {
											time: drugTimes[
												faker.number.int({ min: 0, max: drugTimes.length - 1 })
											].time,
										},
									},
								},
							],
						},
						preparedBy: {
							connect: {
								id: ramanayamDocters[
									faker.number.int({
										min: 0,
										max: ramanayamDocters.length - 1,
									})
								].id,
							},
						},
						checkedBy: {
							connect: {
								id: ramanayamDocters[
									faker.number.int({
										min: 0,
										max: ramanayamDocters.length - 1,
									})
								].id,
							},
						},
					},
				},
			},
		})
	}
	console.timeEnd('🛏️ Create in-patients...')
}

seed()
	.catch(e => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await prisma.$disconnect()
	})
