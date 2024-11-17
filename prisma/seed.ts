import { prisma } from '#app/utils/db.server.ts'
import { cleanupDb, createPassword } from '#tests/db-utils.ts'
import { fakerEN_IN as faker } from '@faker-js/faker'
import { Address } from '@prisma/client'

// Create unique IDs for Org and Hospitals

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
						name: 'Mahabharatam Hospital',
						registrationNo: '989898',
						phone: '9391576029',
						email: 'mahabharatam@gaga.com',
						addressId:
							addresses[faker.number.int({ min: 1, max: addresses.length - 1 })]
								.id,
						room: {
							create: [
								{
									no: 1,
									type: 'ICU',
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
									type: 'General',
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
									type: 'VIP',
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
						name: 'Ramayanam Hospital',
						registrationNo: '979797',
						phone: '9182548770',
						email: 'ramayanam@gaga.com',
						addressId:
							addresses[faker.number.int({ min: 1, max: addresses.length - 1 })]
								.id,
						room: {
							create: [
								{
									no: 1,
									type: 'ICU',
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
									type: 'General',
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
									type: 'VIP',
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
			name: 'Krishna',
			fatherName: 'Vishnu',
			aadhar: '987723222323',
			qualification: 'MS',
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
			name: 'Bheeshmudu',
			username: 'bheeshmudu',
			fatherName: 'Santanu',
			aadhar: '323412342343',
			qualification: 'MS',
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
			name: 'Drona',
			username: 'drona',
			fatherName: 'Bharadvaja',
			aadhar: '323411342343',
			qualification: 'MS',
			salary: '',
			email: 'drona@gaga.in',
			phone: '8976565432',
			roles: {
				connect: {
					name: 'hospitalOwner',
				},
			},
			password: { create: createPassword('drona') },
		},
	})
	// Dharma Raju - chiefDoctor
	await prisma.user.create({
		data: {
			hospitalId: mahabharatamHospital?.id,
			addressId:
				addresses[faker.number.int({ min: 1, max: addresses.length - 1 })].id,
			username: 'dharamaraju',
			name: 'Dharamaraju',
			fatherName: 'Yamadharamaraju',
			aadhar: '878787878787',
			qualification: 'PHD',
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
			name: 'Beemudu',
			fatherName: 'Vayuvu',
			aadhar: '987987987634',
			qualification: 'MS',
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
			name: 'Draupadi',
			fatherName: 'Drupada',
			aadhar: '987981987611',
			qualification: 'MS',
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
			name: 'Karna',
			fatherName: 'Surya',
			aadhar: '981981987611',
			qualification: 'MS',
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
			name: 'Kripa',
			fatherName: 'Sharadwan',
			aadhar: '281981987611',
			qualification: 'MS',
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
			name: 'Amba',
			fatherName: 'Kashya',
			aadhar: '282981987611',
			qualification: 'MS',
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
			name: 'Rama',
			fatherName: 'Dasaratha',
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
			name: 'Sita',
			fatherName: 'Janaka',
			aadhar: '323412942343',
			qualification: 'PHD',
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
			name: 'Lakshmana',
			fatherName: 'Dasaratha',
			aadhar: '323411342303',
			qualification: 'MS',
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
			name: 'Hanuman',
			fatherName: 'Vayu',
			aadhar: '878787818787',
			qualification: 'PHD',
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
			name: 'Kaikeyi',
			fatherName: 'Ashvapathi',
			aadhar: '987987187634',
			qualification: 'MS',
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
			name: 'Bharata',
			fatherName: 'Dasaratha',
			aadhar: '987981987011',
			qualification: 'MS',
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
			name: 'Jatayu',
			fatherName: 'Aruna',
			aadhar: '983981987611',
			qualification: 'MS',
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
			name: 'Garuda',
			fatherName: 'Kashyapa',
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
			name: 'Lava',
			fatherName: 'Rama',
			aadhar: '282481987611',
			qualification: 'MS',
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
		{ id: '001' },
		{ id: '010' },
		{ id: '100' },
		{ id: '101' },
		{ id: '110' },
		{ id: '111' },
	]
	await prisma.drugFrequency.createMany({
		data: frequencies,
	})

	const drugStrengths = [
		{ id: '1mg' },
		{ id: '2mg' },
		{ id: '3mg' },
		{ id: '4mg' },
		{ id: '5mg' },
		{ id: '6mg' },
		{ id: '7mg' },
		{ id: '8mg' },
		{ id: '9mg' },
		{ id: '10mg' },
	]

	await prisma.drugStrength.createMany({
		data: drugStrengths,
	})

	const durations = [
		{ id: '1 day' },
		{ id: '2 days' },
		{ id: '3 days' },
		{ id: '4 days' },
		{ id: '5 days' },
		{ id: '6 days' },
		{ id: '7 days' },
		{ id: '8 days' },
		{ id: '9 days' },
		{ id: '10 days' },
	]

	await prisma.drugDuration.createMany({
		data: durations,
	})

	const drugTimes = [{ id: 'before' }, { id: 'after' }]

	await prisma.drugTime.createMany({
		data: drugTimes,
	})

	const drugs = []
	for (let i = 0; i < 20; i++) {
		drugs.push({
			id: faker.lorem.word() + i,
			description: faker.lorem.sentence(),
			hospitalId: faker.helpers.arrayElement([
				ramanayamHospital?.id || '',
				mahabharatamHospital?.id || '',
			]),
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

	// Mahabharatam Hospital In Patients
	for (let i = 0; i < 100; i++) {
		await prisma.inPatient.create({
			data: {
				patient: {
					create: {
						addressId:
							addresses[faker.number.int({ min: 1, max: addresses.length - 1 })]
								.id,
						umr: 30001 + i,
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
						admitDate: new Date(new Date().setDate(new Date().getDate() - 3)),
						diagnosis: faker.lorem.paragraphs(),
						finalDiagnosis: faker.lorem.paragraphs(),
						complaintsOnReporting: faker.lorem.paragraphs(),
						pastHistory: faker.lorem.paragraphs(),
						historyOfPresentingIllness: faker.lorem.paragraphs(),
						physicalFindingsOfExamination: faker.lorem.paragraphs(),
						laboratoryData: faker.lorem.paragraphs(),
						investigationProcedure: faker.lorem.paragraphs(),
						therapeuticProcedure: faker.lorem.paragraphs(),
						coursesOfTreatmentInHospital: faker.lorem.paragraphs(),
						summaryOfICUStay: faker.lorem.paragraphs(),
						futureAdviceOnDischarge: faker.lorem.paragraphs(),
						summaryDrugInstruction: {
							create: [
								{
									drug: {
										connect: {
											id: drugs[
												faker.number.int({ min: 0, max: drugs.length - 1 })
											].id,
										},
									},
									frequency: {
										connect: {
											id: frequencies[
												faker.number.int({
													min: 0,
													max: frequencies.length - 1,
												})
											].id,
										},
									},
									strength: {
										connect: {
											id: drugStrengths[
												faker.number.int({
													min: 0,
													max: drugStrengths.length - 1,
												})
											].id,
										},
									},
									duration: {
										connect: {
											id: durations[
												faker.number.int({
													min: 0,
													max: durations.length - 1,
												})
											].id,
										},
									},
									time: {
										connect: {
											id: drugTimes[
												faker.number.int({ min: 0, max: drugTimes.length - 1 })
											].id,
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

	// Ramayanam Hospital In Patients
	for (let i = 100; i < 200; i++) {
		await prisma.inPatient.create({
			data: {
				patient: {
					create: {
						addressId:
							addresses[faker.number.int({ min: 1, max: addresses.length - 1 })]
								.id,
						umr: 30001 + i,
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
						admitDate: new Date(new Date().setDate(new Date().getDate() - 3)),
						diagnosis: faker.lorem.paragraphs(),
						finalDiagnosis: faker.lorem.paragraphs(),
						complaintsOnReporting: faker.lorem.paragraphs(),
						pastHistory: faker.lorem.paragraphs(),
						historyOfPresentingIllness: faker.lorem.paragraphs(),
						physicalFindingsOfExamination: faker.lorem.paragraphs(),
						laboratoryData: faker.lorem.paragraphs(),
						investigationProcedure: faker.lorem.paragraphs(),
						therapeuticProcedure: faker.lorem.paragraphs(),
						coursesOfTreatmentInHospital: faker.lorem.paragraphs(),
						summaryOfICUStay: faker.lorem.paragraphs(),
						futureAdviceOnDischarge: faker.lorem.paragraphs(),
						summaryDrugInstruction: {
							create: [
								{
									drug: {
										connect: {
											id: drugs[
												faker.number.int({ min: 0, max: drugs.length - 1 })
											].id,
										},
									},
									frequency: {
										connect: {
											id: frequencies[
												faker.number.int({
													min: 0,
													max: frequencies.length - 1,
												})
											].id,
										},
									},
									strength: {
										connect: {
											id: drugStrengths[
												faker.number.int({
													min: 0,
													max: drugStrengths.length - 1,
												})
											].id,
										},
									},
									duration: {
										connect: {
											id: durations[
												faker.number.int({
													min: 0,
													max: durations.length - 1,
												})
											].id,
										},
									},
									time: {
										connect: {
											id: drugTimes[
												faker.number.int({ min: 0, max: drugTimes.length - 1 })
											].id,
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

	// Mahabharatam Hospital Discharge Summary Templates
	for (let i = 0; i < 5; i++) {
		await prisma.dischargeSummaryTemplate.create({
			data: {
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
				name: faker.word.noun(),
				diagnosis: faker.lorem.paragraphs(),
				finalDiagnosis: faker.lorem.paragraphs(),
				complaintsOnReporting: faker.lorem.paragraphs(),
				pastHistory: faker.lorem.paragraphs(),
				historyOfPresentingIllness: faker.lorem.paragraphs(),
				physicalFindingsOfExamination: faker.lorem.paragraphs(),
				laboratoryData: faker.lorem.paragraphs(),
				investigationProcedure: faker.lorem.paragraphs(),
				therapeuticProcedure: faker.lorem.paragraphs(),
				coursesOfTreatmentInHospital: faker.lorem.paragraphs(),
				summaryOfICUStay: faker.lorem.paragraphs(),
				futureAdviceOnDischarge: faker.lorem.paragraphs(),
				summaryDrugInstruction: {
					create: [
						{
							drug: {
								connect: {
									id: drugs[faker.number.int({ min: 0, max: drugs.length - 1 })]
										.id,
								},
							},
							frequency: {
								connect: {
									id: frequencies[
										faker.number.int({
											min: 0,
											max: frequencies.length - 1,
										})
									].id,
								},
							},
							strength: {
								connect: {
									id: drugStrengths[
										faker.number.int({
											min: 0,
											max: drugStrengths.length - 1,
										})
									].id,
								},
							},
							duration: {
								connect: {
									id: durations[
										faker.number.int({
											min: 0,
											max: durations.length - 1,
										})
									].id,
								},
							},
							time: {
								connect: {
									id: drugTimes[
										faker.number.int({ min: 0, max: drugTimes.length - 1 })
									].id,
								},
							},
						},
					],
				},
			},
		})
	}
	// Ramayanam Hospital Discharge Summary Templates
	for (let i = 0; i < 7; i++) {
		await prisma.dischargeSummaryTemplate.create({
			data: {
				docter: {
					connect: {
						id: ramanayamDocters[
							faker.number.int({
								min: 0,
								max: mahabharatamDocters.length - 1,
							})
						].id,
					},
				},
				hospital: {
					connect: {
						id: ramanayamHospital?.id,
					},
				},
				name: faker.lorem.word(),
				diagnosis: faker.lorem.paragraphs(),
				finalDiagnosis: faker.lorem.paragraphs(),
				complaintsOnReporting: faker.lorem.paragraphs(),
				pastHistory: faker.lorem.paragraphs(),
				historyOfPresentingIllness: faker.lorem.paragraphs(),
				physicalFindingsOfExamination: faker.lorem.paragraphs(),
				laboratoryData: faker.lorem.paragraphs(),
				investigationProcedure: faker.lorem.paragraphs(),
				therapeuticProcedure: faker.lorem.paragraphs(),
				coursesOfTreatmentInHospital: faker.lorem.paragraphs(),
				summaryOfICUStay: faker.lorem.paragraphs(),
				futureAdviceOnDischarge: faker.lorem.paragraphs(),
				summaryDrugInstruction: {
					create: [
						{
							drug: {
								connect: {
									id: drugs[faker.number.int({ min: 0, max: drugs.length - 1 })]
										.id,
								},
							},
							frequency: {
								connect: {
									id: frequencies[
										faker.number.int({
											min: 0,
											max: frequencies.length - 1,
										})
									].id,
								},
							},
							strength: {
								connect: {
									id: drugStrengths[
										faker.number.int({
											min: 0,
											max: drugStrengths.length - 1,
										})
									].id,
								},
							},
							duration: {
								connect: {
									id: durations[
										faker.number.int({
											min: 0,
											max: durations.length - 1,
										})
									].id,
								},
							},
							time: {
								connect: {
									id: drugTimes[
										faker.number.int({ min: 0, max: drugTimes.length - 1 })
									].id,
								},
							},
						},
					],
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
