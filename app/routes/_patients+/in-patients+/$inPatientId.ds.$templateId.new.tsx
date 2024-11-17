import { GeneralErrorBoundary } from '#app/components/error-boundary.js'
import {
	DropdownField,
	ErrorList,
	Field,
	TextareaField,
} from '#app/components/forms.js'
import { Spacer } from '#app/components/spacer.js'
import { Button } from '#app/components/ui/button.js'
import { Icon } from '#app/components/ui/icon.js'
import { StatusButton } from '#app/components/ui/status-button.js'
import { getUserInfo } from '#app/utils/auth.server.js'
import { checkHoneypot } from '#app/utils/honeypot.server.js'
import { useIsPending } from '#app/utils/misc.js'
import {
	getDischargeSummaryTemplateInfo,
	createDischargeSummary,
} from '#app/utils/patients.server.js'

import {
	getFormProps,
	getInputProps,
	getSelectProps,
	getTextareaProps,
	useForm,
	type FieldMetadata,
} from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { invariantResponse } from '@epic-web/invariant'
import { ActionFunctionArgs, json, LoaderFunctionArgs } from '@remix-run/node'
import { Form, Link, useLoaderData, useSubmit } from '@remix-run/react'
import { useRef, useState } from 'react'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { z } from 'zod'
import { fakerEN_IN as faker } from '@faker-js/faker'
import { userInfo } from 'os'
import { redirectWithToast } from '#app/utils/toast.server.js'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuTrigger,
} from '#app/components/ui/dropdown-menu.js'

const DrugFieldlistSchema = z.object({
	name: z.string(),
	strength: z.string(),
	frequency: z.string(),
	duration: z.string(),
	time: z.string(),
})

const AddDischargeSummaryFormSchema = z.object({
	diagnosis: z.string(),
	finalDiagnosis: z.string(),
	complaintsOnReporting: z.string().optional(),
	pastHistory: z.string().optional(),
	historyOfPresentingIllness: z.string().optional(),
	physicalFindingsOfExamination: z.string().optional(),
	laboratoryData: z.string().optional(),
	investigationProcedure: z.string().optional(),
	therapeuticProcedure: z.string().optional(),
	coursesOfTreatmentInHospital: z.string().optional(),
	summaryOfICUStay: z.string().optional(),
	futureAdviceOnDischarge: z.string().optional(),
	dischargeDate: z.date().optional(),
	admitDate: z.date().optional(),
	summaryDrugInstruction: z.array(DrugFieldlistSchema).optional(),
	userId: z.string(),
	hospitalId: z.string(),
	inPatientId: z.string(),
	paymentType: z.string().optional(),
})

const summaryDrugInstruction = []
const drugTimes = [{ id: 'before' }, { id: 'after' }]
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
const frequencies = [
	{ id: '001' },
	{ id: '010' },
	{ id: '100' },
	{ id: '101' },
	{ id: '110' },
	{ id: '111' },
]

for (let i = 0; i < 11; i++) {
	summaryDrugInstruction.push({
		name: faker.lorem.word(),
		strength:
			drugStrengths[
				faker.number.int({
					min: 0,
					max: drugStrengths.length - 1,
				})
			].id,
		frequency:
			frequencies[
				faker.number.int({
					min: 0,
					max: frequencies.length - 1,
				})
			].id,
		duration:
			durations[
				faker.number.int({
					min: 0,
					max: durations.length - 1,
				})
			].id,
		time: drugTimes[faker.number.int({ min: 0, max: drugTimes.length - 1 })].id,
	})
}

const defaultValue = {
	dischargeDate: new Date().toISOString().split('T')[0],
	admitDate: new Date(new Date().setDate(new Date().getDate() - 3))
		.toISOString()
		.split('T')[0],
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
	summaryDrugInstruction: summaryDrugInstruction,
}

export async function loader({ request, params }: LoaderFunctionArgs) {
	const url = new URL(request.url)
	const userInfo = await getUserInfo(request)
	invariantResponse(userInfo, 'User info not found', { status: 404 })
	const { inPatientId, templateId } = params
	invariantResponse(inPatientId, 'In Patient is not available', {
		status: 404,
	})
	invariantResponse(templateId, 'Template name is not available', {
		status: 404,
	})
	const templateInfo = await getDischargeSummaryTemplateInfo({
		hospitalId: userInfo.hospitalId,
		templateId,
	})
	return json({ ...userInfo, inPatientId, templateInfo })
}

export async function action({ request }: ActionFunctionArgs) {
	// TODO: Add userInfo to input field
	invariantResponse(userInfo, 'User info not found', { status: 404 })
	const formData = await request.formData()
	checkHoneypot(formData)
	const submission = await parseWithZod(formData, {
		schema: intent =>
			AddDischargeSummaryFormSchema.transform(async data => {
				if (intent !== null) return { ...data, session: null }

				return { ...data }
			}),
		async: true,
	})
	if (submission.status !== 'success') {
		return json({ status: submission.status === 'error' ? 400 : 200 })
	}
	const dischargeSummaryId = await createDischargeSummary({
		dischargeSummary: submission.value,
	})
	if (dischargeSummaryId) {
		return redirectWithToast(
			`/in-patients/ds/${dischargeSummaryId}/view`,
			{
				type: 'success',
				title: 'Discharge Summary created',
				description: 'Discharge Summary has been created successfully.',
			},
			{ status: 302 },
		)
	}
	return null
}
export default function ShowDischargeSummary() {
	const isPending = useIsPending()
	const { templateInfo, inPatientId, hospitalId, userId } =
		useLoaderData<typeof loader>()
	const [form, fields] = useForm({
		id: 'in-patient-registration-form',
		constraint: getZodConstraint(AddDischargeSummaryFormSchema),
		defaultValue: { ...templateInfo },
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: AddDischargeSummaryFormSchema })
		},
		shouldRevalidate: 'onBlur',
	})
	const drugsListFields = fields.summaryDrugInstruction.getFieldList()
	return (
		<div className="container flex min-h-full flex-col justify-center rounded-3xl bg-muted pb-32 pt-10">
			<div className="max-w-2lg mx-auto w-full">
				<Spacer size="xs" />
				<Form method="POST" {...getFormProps(form)}>
					<HoneypotInputs />
					<input type="hidden" name="userId" value={userId} />
					<input type="hidden" name="hospitalId" value={hospitalId} />
					<input type="hidden" name="inPatientId" value={inPatientId} />
					<div className="">
						<div className="flex items-center gap-2 pb-5">
							<span className="text-sm font-semibold">
								Name of the Template Selected:
							</span>
							<p className="text-sm">{templateInfo.name}</p>
						</div>
					</div>
					<div>
						<TextareaField
							labelProps={{ children: 'Diagnosis' }}
							textareaProps={{
								...getTextareaProps(fields.diagnosis),
							}}
							errors={fields.diagnosis.errors}
						/>
						<TextareaField
							labelProps={{ children: 'Final Diagnosis' }}
							textareaProps={{
								...getTextareaProps(fields.finalDiagnosis),
							}}
							errors={fields.finalDiagnosis.errors}
						/>
						<TextareaField
							labelProps={{ children: 'Complaints On Reporting' }}
							textareaProps={{
								...getTextareaProps(fields.complaintsOnReporting),
							}}
							errors={fields.complaintsOnReporting.errors}
						/>
						<TextareaField
							labelProps={{ children: 'Past History' }}
							textareaProps={{
								...getTextareaProps(fields.pastHistory),
							}}
							errors={fields.pastHistory.errors}
						/>
						<TextareaField
							labelProps={{ children: 'History Of Presenting Illness' }}
							textareaProps={{
								...getTextareaProps(fields.historyOfPresentingIllness),
							}}
							errors={fields.historyOfPresentingIllness.errors}
						/>
						<TextareaField
							labelProps={{ children: 'Physical Findings Of Examination' }}
							textareaProps={{
								...getTextareaProps(fields.physicalFindingsOfExamination),
							}}
							errors={fields.physicalFindingsOfExamination.errors}
						/>
						<TextareaField
							labelProps={{ children: 'Laboratory Data' }}
							textareaProps={{
								...getTextareaProps(fields.laboratoryData),
							}}
							errors={fields.laboratoryData.errors}
						/>
						<TextareaField
							labelProps={{ children: 'Investigation Procedure' }}
							textareaProps={{
								...getTextareaProps(fields.investigationProcedure),
							}}
							errors={fields.investigationProcedure.errors}
						/>
						<TextareaField
							labelProps={{ children: 'Therapeutic Procedure' }}
							textareaProps={{
								...getTextareaProps(fields.therapeuticProcedure),
							}}
							errors={fields.therapeuticProcedure.errors}
						/>
						<TextareaField
							labelProps={{ children: 'Courses Of Treatment In Hospital' }}
							textareaProps={{
								...getTextareaProps(fields.coursesOfTreatmentInHospital),
							}}
							errors={fields.coursesOfTreatmentInHospital.errors}
						/>
						<TextareaField
							labelProps={{ children: 'Summary Of ICU Stay' }}
							textareaProps={{
								...getTextareaProps(fields.summaryOfICUStay),
							}}
							errors={fields.summaryOfICUStay.errors}
						/>
						<TextareaField
							labelProps={{ children: 'Future Advice On Discharge' }}
							textareaProps={{
								...getTextareaProps(fields.futureAdviceOnDischarge),
							}}
							errors={fields.futureAdviceOnDischarge.errors}
						/>
						<div>Summary Drug Instruction</div>
						<div>
							<Button
								className="mt-3"
								{...form.insert.getButtonProps({
									name: fields.summaryDrugInstruction.name,
								})}
							>
								<span aria-hidden>
									<Icon name="plus">Drug</Icon>
								</span>{' '}
								<span className="sr-only">Add drug</span>
							</Button>
						</div>
						<div className="mt-5">
							<ul>
								{drugsListFields.map((drug, index) => {
									return (
										<li key={drug.key}>
											<div className="flex gap-4">
												<DrugChooser drug={drug} index={index} />
												<button
													className="text-foreground-destructive"
													{...form.remove.getButtonProps({
														name: fields.summaryDrugInstruction.name,
														index,
													})}
												>
													<span aria-hidden>
														<Icon name="cross-1" />
													</span>{' '}
													<span className="sr-only">
														Remove drug {index + 1}
													</span>
												</button>
											</div>
										</li>
									)
								})}
							</ul>
						</div>
					</div>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:gap-8 xl:gap-12">
						<div>
							<Field
								labelProps={{
									htmlFor: fields.dischargeDate.id,
									children: 'Discharge Date',
								}}
								inputProps={{
									...getInputProps(fields.dischargeDate, { type: 'date' }),
									autoComplete: 'dischargeDate',
								}}
								errors={fields.dischargeDate.errors}
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
						<div>
							<Field
								labelProps={{
									htmlFor: fields.admitDate.id,
									children: 'Admit Date',
								}}
								inputProps={{
									...getInputProps(fields.admitDate, { type: 'date' }),
									autoComplete: 'dob',
								}}
								errors={fields.admitDate.errors}
							/>
						</div>
					</div>
					<ErrorList errors={form.errors} id={form.errorId} />
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:gap-8 xl:gap-12">
						<div></div>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:gap-8 xl:gap-12">
							<StatusButton
								className="w-full"
								status={isPending ? 'pending' : form.status ?? 'idle'}
								type="reset"
								disabled={isPending}
								name="intent"
								value="delete-note"
								variant="ghost"
							>
								Reset
							</StatusButton>
							<StatusButton
								className="w-full"
								status={isPending ? 'pending' : form.status ?? 'idle'}
								type="submit"
								disabled={isPending}
							>
								Save
							</StatusButton>
						</div>
					</div>
				</Form>
			</div>
		</div>
	)
}

export function ErrorBoundary() {
	return <GeneralErrorBoundary />
}

function DrugChooser({
	drug,
	index,
}: {
	drug: FieldMetadata<z.infer<typeof DrugFieldlistSchema>>
	index: number
}) {
	const ref = useRef<HTMLFieldSetElement>(null)
	const drugFields = drug.getFieldset()
	// const [showEditName, setEditName] = useState(false)
	return (
		<fieldset
			ref={ref}
			// TODO: take care of ariel attributes
			// aria-invalid={Boolean(drugFields.errors?.length) || undefined}
			// aria-describedby={
			// 	drugFields.errors?.length ? drugFields.errorId : undefined
			// }
			key={drug.key}
		>
			<div className="flex flex-wrap gap-3 sm:flex-nowrap">
				<Field
					labelProps={{
						htmlFor: drugFields.name.id,
						children: 'Name',
					}}
					inputProps={{
						...getInputProps(drugFields.name, { type: 'text' }),
						autoComplete: 'name',
					}}
					errors={drugFields.name.errors}
				/>
				<Field
					labelProps={{
						htmlFor: drugFields.strength.id,
						children: 'Strength',
					}}
					inputProps={{
						...getInputProps(drugFields.strength, { type: 'text' }),
						autoComplete: 'strength',
					}}
					errors={drugFields.strength.errors}
				/>
				<Field
					labelProps={{
						htmlFor: drugFields.duration.id,
						children: 'No Of Days',
					}}
					inputProps={{
						...getInputProps(drugFields.duration, { type: 'text' }),
						autoComplete: 'duration',
					}}
					errors={drugFields.duration.errors}
				/>
				<DropdownField
					labelProps={{
						htmlFor: `${drugFields.frequency.id}${index}`,
						children: 'Frequency',
					}}
					selectProps={getSelectProps(drugFields.frequency)}
					errors={drugFields.frequency.errors}
					dropDownOptions={[
						{ value: '001', label: '0-0-1' },
						{ value: '010', label: '0-1-0' },
						{ value: '001', label: '0-0-1' },
						{ value: '100', label: '1-0-0' },
						{ value: '101', label: '1-0-1' },
						{ value: '110', label: '1-1-0' },
						{ value: '111', label: '1-1-1' },
					]}
				/>
				<DropdownField
					labelProps={{
						htmlFor: `${drugFields.time.id}${index}`,
						children: 'When',
					}}
					selectProps={getSelectProps(drugFields.time)}
					errors={drugFields.time.errors}
					dropDownOptions={[
						{ value: 'after', label: 'after' },
						{ value: 'before', label: 'before' },
					]}
				/>
			</div>
		</fieldset>
	)
}
