import {
	DropdownField,
	ErrorList,
	Field,
	RadioGroupField,
} from '#app/components/forms'
import { Spacer } from '#app/components/spacer.tsx'
import { StatusButton } from '#app/components/ui/status-button'
import { handle } from '#app/routes/settings+/profile.js'
import { getUserInfo } from '#app/utils/auth.server.js'
import { prisma } from '#app/utils/db.server.js'
import { checkHoneypot } from '#app/utils/honeypot.server'
import { getDefaultFromToDates, useIsPending } from '#app/utils/misc'
import { createInPatientInfo } from '#app/utils/patients.server.js'

import {
	AadharSchema,
	AddressSchema,
	BloodGroupSchema,
	DataOfBithSchema,
	EmailSchema,
	FatherNameSchema,
	GenderSchema,
	MobileSchema,
	NameSchema,
} from '#app/utils/user-validation'
import {
	getFormProps,
	useForm,
	getInputProps,
	getSelectProps,
	getCollectionProps,
} from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { invariantResponse } from '@epic-web/invariant'
import { type ActionFunctionArgs, json } from '@remix-run/node'
import { Form, useSearchParams } from '@remix-run/react'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { z } from 'zod'
import { fakerEN_IN as faker } from '@faker-js/faker'
import { redirectWithToast } from '#app/utils/toast.server.js'

const defaultValue = {
	name: faker.person.firstName(),
	fatherName: faker.person.firstName(),
	// dob: faker.date.birthdate({
	// 	refDate: '23-12-1993',
	// 	min: 10,
	// 	max: 90,
	// 	mode: 'age',
	// }),
	dob: '2000-02-22',
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
	town: faker.location.city(),
	gender: faker.helpers.arrayElement(['M', 'F']),
	aadhar: faker.string.numeric({
		length: 12,
		allowLeadingZeros: false,
	}),
	email: faker.internet.email(),
	phone: faker.string.numeric({
		length: 10,
		allowLeadingZeros: false,
	}),
	district: faker.location.city(),
	paymentType: faker.helpers.arrayElement(['Card', 'Cash', 'UPI', 'Insurance']),
}

const RegistrationFormSchema = z
	.object({
		name: NameSchema,
		fatherName: FatherNameSchema,
		dob: DataOfBithSchema,
		gender: GenderSchema,
		aadhar: AadharSchema,
		phone: MobileSchema,
		bloodGroup: BloodGroupSchema,
		email: EmailSchema.optional(),
		redirectTo: z.string().optional(),
		paymentType: z.string().optional(),
	})
	.and(AddressSchema)

export async function action({ request }: ActionFunctionArgs) {
	const userInfo = await getUserInfo(request)
	invariantResponse(userInfo, 'User info not found', { status: 404 })
	const formData = await request.formData()
	checkHoneypot(formData)
	const submission = await parseWithZod(formData, {
		schema: intent =>
			RegistrationFormSchema.transform(async data => {
				if (intent !== null) return { ...data, session: null }

				return { ...data }
			}),
		async: true,
	})
	if (submission.status !== 'success') {
		return json({ status: submission.status === 'error' ? 400 : 200 })
	}

	const res = await createInPatientInfo({
		patientInfo: submission.value,
		userInfo,
	})
	if (res) {
		const { fromDate, toDate } = getDefaultFromToDates(1)
		return redirectWithToast(
			`/in-patients/search?fromDate=${fromDate}&toDate=${toDate}`,
			{
				type: 'success',
				title: 'Patient created',
				description: 'Patient has been created successfully.',
			},
			{ status: 302 },
		)
	}
	// TODO: Handle error case correctly
	return null
}

export default function Registration() {
	const isPending = useIsPending()
	const [searchParams] = useSearchParams()
	const redirectTo = searchParams.get('redirectTo')

	const [form, fields] = useForm({
		id: 'in-patient-registration-form',
		constraint: getZodConstraint(RegistrationFormSchema),
		defaultValue: { ...defaultValue, redirectTo },
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: RegistrationFormSchema })
		},
		shouldRevalidate: 'onBlur',
	})
	return (
		<div className="container flex min-h-full flex-col justify-center pb-32 pt-20">
			<div className="max-w-2lg mx-auto w-full">
				<div className="flex flex-col gap-3 text-center">
					<h1 className="text-h1">Patient Registration!</h1>
					<p className="text-body-md text-muted-foreground">
						Please enter your details.
					</p>
				</div>
				<Spacer size="xs" />
				<Form
					method="POST"
					className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:gap-8 xl:gap-12"
					{...getFormProps(form)}
				>
					<HoneypotInputs />
					<div>
						<Field
							labelProps={{ htmlFor: fields.name.id, children: 'Name' }}
							inputProps={{
								...getInputProps(fields.name, { type: 'text' }),
								autoComplete: 'name',
								className: 'lowercase',
							}}
							errors={fields.name.errors}
						/>
						<Field
							labelProps={{
								htmlFor: fields.fatherName.id,
								children: 'Father Name',
							}}
							inputProps={{
								...getInputProps(fields.fatherName, { type: 'text' }),
								autoComplete: 'fatherName',
							}}
							errors={fields.fatherName.errors}
						/>
						<Field
							labelProps={{ htmlFor: fields.dob.id, children: 'Date of Birth' }}
							inputProps={{
								...getInputProps(fields.dob, { type: 'date' }),
								autoComplete: 'dob',
							}}
							errors={fields.dob.errors}
						/>
						<DropdownField
							labelProps={{
								htmlFor: fields.bloodGroup.id,
								children: 'Blood Group',
							}}
							selectProps={getSelectProps(fields.bloodGroup)}
							errors={fields.bloodGroup.errors}
							dropDownOptions={[
								{ value: 'A+', label: 'A+' },
								{ value: 'A-', label: 'A-' },
								{ value: 'B+', label: 'B+' },
								{ value: 'B-', label: 'B-' },
								{ value: 'AB+', label: 'AB+' },
								{ value: 'AB-', label: 'AB-' },
								{ value: 'O+', label: 'O+' },
								{ value: 'O-', label: 'O-' },
							]}
						/>
						<Field
							labelProps={{
								htmlFor: fields.town.id,
								children: 'Town',
							}}
							inputProps={{
								...getInputProps(fields.town, { type: 'text' }),
								autoComplete: 'town',
							}}
							errors={fields.town.errors}
						/>
					</div>
					<div>
						<RadioGroupField
							labelProps={{
								htmlFor: fields.gender.id,
								children: 'Gender',
							}}
							collectionProps={{
								...getCollectionProps(fields.gender, {
									type: 'radio',
									options: ['F', 'M'],
								}),
							}}
							errors={fields.gender.errors}
						/>
						<Field
							labelProps={{
								htmlFor: fields.aadhar.id,
								children: 'Aadhar',
							}}
							inputProps={{
								...getInputProps(fields.aadhar, { type: 'text' }),
								autoComplete: 'aadhar',
							}}
							errors={fields.aadhar.errors}
						/>
						<Field
							labelProps={{
								htmlFor: fields.phone.id,
								children: 'Phone',
							}}
							inputProps={{
								...getInputProps(fields.phone, { type: 'text' }),
								autoComplete: 'mobile',
							}}
							errors={fields.phone.errors}
						/>
						<Field
							labelProps={{
								htmlFor: fields.email.id,
								children: 'Email',
							}}
							inputProps={{
								...getInputProps(fields.email, { type: 'email' }),
								autoComplete: 'email',
							}}
							errors={fields.email.errors}
						/>
						<Field
							labelProps={{
								htmlFor: fields.district.id,
								children: 'District',
							}}
							inputProps={{
								...getInputProps(fields.district, { type: 'text' }),
								autoComplete: 'district',
							}}
							errors={fields.district.errors}
						/>
						<DropdownField
							labelProps={{
								htmlFor: fields.paymentType.id,
								children: 'Payment Type',
							}}
							selectProps={getSelectProps(fields.paymentType)}
							errors={fields.paymentType.errors}
							dropDownOptions={[
								{ value: 'Card', label: 'Card' },
								{ value: 'Cash', label: 'Cash' },
								{ value: 'UPI', label: 'UPI' },
								{ value: 'Insurance', label: 'Insurance' },
							]}
						/>
					</div>

					<input {...getInputProps(fields.redirectTo, { type: 'hidden' })} />
					<ErrorList errors={form.errors} id={form.errorId} />
					<div></div>
					<div className="flex items-center justify-between gap-6">
						<StatusButton
							className="w-full"
							status={isPending ? 'pending' : form.status ?? 'idle'}
							type="submit"
							disabled={isPending}
						>
							Submit
						</StatusButton>
					</div>
				</Form>
			</div>
		</div>
	)
}
