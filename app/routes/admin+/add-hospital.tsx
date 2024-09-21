import {
	DropdownField,
	ErrorList,
	Field,
	RadioGroupField,
} from '#app/components/forms'
import { Spacer } from '#app/components/spacer.tsx'
import { StatusButton } from '#app/components/ui/status-button'
import { checkHoneypot } from '#app/utils/honeypot.server'
import { useIsPending } from '#app/utils/misc'
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
import { type ActionFunctionArgs, json } from '@remix-run/node'
import { Form, useSearchParams } from '@remix-run/react'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { z } from 'zod'

const HospitalRegistrationFormSchema = z.object({
	organisationName: z.string().optional(),
	organisationAddress: z.string().optional(),
	organisationRegistrationNumber: z.string().optional(),
	hospitalName: NameSchema,
	hospitalCity: NameSchema,
	hospitalAddress: z.string(),
	// fatherName: FatherNameSchema,
	// dob: DataOfBithSchema,
	// gender: GenderSchema,
	// aadhar: AadharSchema,
	// mobile: MobileSchema,
	// bloodGroup: BloodGroupSchema,
	// email: EmailSchema,
	redirectTo: z.string().optional(),
})

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	checkHoneypot(formData)
	const submission = await parseWithZod(formData, {
		schema: intent =>
			HospitalRegistrationFormSchema.transform(async data => {
				if (intent !== null) return { ...data, session: null }
				return { ...data }
			}),
		async: true,
	})
	return null
}

export default function HospitalRegistration() {
	const isPending = useIsPending()
	const [searchParams] = useSearchParams()
	const redirectTo = searchParams.get('redirectTo')

	const [form, fields] = useForm({
		id: 'hospital-registration-form',
		constraint: getZodConstraint(HospitalRegistrationFormSchema),
		defaultValue: { redirectTo },
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: HospitalRegistrationFormSchema })
		},
		shouldRevalidate: 'onBlur',
	})
	return (
		<div className="container flex min-h-full flex-col justify-center pb-32 pt-20">
			<div className="max-w-2lg mx-auto w-full">
				<div className="flex flex-col gap-3 text-center">
					<h1 className="text-h1">Hospital Registration!</h1>
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
							labelProps={{
								htmlFor: fields.organisationName.id,
								children: 'Organisation Name',
							}}
							inputProps={{
								...getInputProps(fields.organisationName, { type: 'text' }),
								autoComplete: 'organisationName',
								className: 'lowercase',
							}}
							errors={fields.organisationName.errors}
						/>
						<Field
							labelProps={{
								htmlFor: fields.organisationAddress.id,
								children: 'Organisation Address',
							}}
							inputProps={{
								...getInputProps(fields.organisationAddress, { type: 'text' }),
								autoComplete: 'organisationAddress',
							}}
							errors={fields.organisationAddress.errors}
						/>
						<Field
							labelProps={{
								htmlFor: fields.organisationRegistrationNumber.id,
								children: 'Organisation Registration Number',
							}}
							inputProps={{
								...getInputProps(fields.organisationRegistrationNumber, {
									type: 'text',
								}),
								autoComplete: 'organisationRegistrationNumber',
							}}
							errors={fields.organisationRegistrationNumber.errors}
						/>
					</div>
					<div>
						<Field
							labelProps={{
								htmlFor: fields.hospitalName.id,
								children: 'Hospital Name',
							}}
							inputProps={{
								...getInputProps(fields.hospitalName, { type: 'text' }),
								autoComplete: 'hospitalName',
							}}
							errors={fields.hospitalName.errors}
						/>
						<Field
							labelProps={{
								htmlFor: fields.hospitalCity.id,
								children: 'Hospital City',
							}}
							inputProps={{
								...getInputProps(fields.hospitalCity, { type: 'text' }),
								autoComplete: 'hospitalCity',
							}}
							errors={fields.hospitalCity.errors}
						/>
						<Field
							labelProps={{
								htmlFor: fields.hospitalAddress.id,
								children: 'Hospital Address',
							}}
							inputProps={{
								...getInputProps(fields.hospitalAddress, { type: 'text' }),
								autoComplete: 'hospitalAddress',
							}}
							errors={fields.hospitalAddress.errors}
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
