import { GeneralErrorBoundary } from '#app/components/error-boundary.js'
import { Spacer } from '#app/components/spacer.js'
import { Button } from '#app/components/ui/button.js'
import { Icon } from '#app/components/ui/icon.js'
import { getUserInfo } from '#app/utils/auth.server.js'
import { getDischargeSummaryInfo } from '#app/utils/patients.server.js'
import { invariantResponse } from '@epic-web/invariant'
import { json, LoaderFunctionArgs } from '@remix-run/node'
import { Link, useHref, useLoaderData } from '@remix-run/react'
import { HoneypotInputs } from 'remix-utils/honeypot/react'

export async function loader({ request, params }: LoaderFunctionArgs) {
	const url = new URL(request.url)
	const userInfo = await getUserInfo(request)
	invariantResponse(userInfo, 'User info not found', { status: 404 })
	const { dischargeSummaryId } = params
	invariantResponse(dischargeSummaryId, 'Discharge Summary is not available', {
		status: 404,
	})
	const dischargeSummaryInfo = await getDischargeSummaryInfo({
		dischargeSummaryId,
		hospitalId: userInfo.hospitalId,
	})

	const admitDate = dischargeSummaryInfo.admitDate
	const dischargeDate = dischargeSummaryInfo.dischargeDate
	const modifiedAdmitDate = admitDate
		? admitDate.toLocaleDateString('en-IN')
		: '-'
	const modifiedDischargeDate = dischargeDate
		? dischargeDate.toLocaleDateString('en-IN')
		: '-'

	console.log('🚀 ~ loader ~ dischargeSummaryInfo:', dischargeSummaryInfo)
	return json({
		...dischargeSummaryInfo,
		admitDate: modifiedAdmitDate,
		dischargeDate: modifiedDischargeDate,
	})
}
export default function ShowDischargeSummary() {
	const {
		id,
		inPatient,
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
		admitDate,
		dischargeDate,
	} = useLoaderData<typeof loader>()

	const href = useHref(`/in-patients/${inPatient?.id}/ds/print`)
	return (
		<div className="container flex min-h-full flex-col justify-center rounded-3xl bg-muted pb-32 pt-10">
			<div className="max-w-2lg mx-auto w-full">
				<div className="flex flex-col gap-3 text-center">
					<h1 className="text-h1">Discharge Summary</h1>
					<p className="text-body-md text-muted-foreground">
						{`View ${inPatient?.patient.name} discharge summary`}
					</p>
				</div>
				<Spacer size="xs" />
				<HoneypotInputs />
				<div className="grid grid-cols-1 gap-4 pb-5 md:grid-cols-2 md:gap-6 lg:gap-8 xl:gap-12">
					<div>
						<div className="pb-3">
							<div className="flex items-center gap-2">
								<span className="text-h5 font-semibold">Patient Name</span>
							</div>
							<p className="text-md whitespace-break-spaces pl-5">
								{inPatient?.patient.name}
							</p>
						</div>
						<div>
							<div className="flex items-center gap-2">
								<span className="text-h5 font-semibold">Payment Type</span>
							</div>
							<p className="text-md whitespace-break-spaces pl-5">
								{inPatient?.paymentType}
							</p>
						</div>
					</div>
					<div className="grid flex-1 grid-cols-2 gap-2 md:gap-4">
						<div>
							<div className="flex items-center gap-2">
								<span className="text-h5 font-semibold">Admit Date</span>
							</div>
							<p className="text-md whitespace-break-spaces pl-5">
								{admitDate}
							</p>
						</div>
						<div>
							<div className="flex items-center gap-2">
								<span className="text-h5 font-semibold">Discharge Date</span>
							</div>
							<p className="text-md whitespace-break-spaces pl-5">
								{dischargeDate}
							</p>
						</div>
					</div>
				</div>
				<div className="grid gap-4 md:gap-6 lg:gap-8 xl:gap-12">
					<div>
						<div className="flex items-center gap-2">
							<span className="text-h5 font-semibold">Diagonosis</span>
						</div>
						<p className="text-md whitespace-break-spaces pl-5">{diagnosis}</p>
					</div>
					<div>
						<div className="flex items-center gap-2">
							<span className="text-h5 font-semibold">Final Diagnosis</span>
						</div>
						<p className="text-md whitespace-break-spaces pl-5">
							{finalDiagnosis}
						</p>
					</div>
					<div>
						<div className="flex items-center gap-2">
							<span className="text-h5 font-semibold">
								Complaints On Reporting
							</span>
						</div>
						<p className="text-md whitespace-break-spaces pl-5">
							{complaintsOnReporting}
						</p>
					</div>
					<div>
						<div className="flex items-center gap-2">
							<span className="text-h5 font-semibold">Past History</span>
						</div>
						<p className="text-md whitespace-break-spaces pl-5">
							{pastHistory}
						</p>
					</div>
					<div>
						<div className="flex items-center gap-2">
							<span className="text-h5 font-semibold">
								History Of Presenting Illness
							</span>
						</div>
						<p className="text-md whitespace-break-spaces pl-5">
							{historyOfPresentingIllness}
						</p>
					</div>
					<div>
						<div className="flex items-center gap-2">
							<span className="text-h5 font-semibold">
								Physical Findings Of Examination
							</span>
						</div>
						<p className="text-md whitespace-break-spaces pl-5">
							{physicalFindingsOfExamination}
						</p>
					</div>
					<div>
						<div className="flex items-center gap-2">
							<span className="text-h5 font-semibold">Laboratory Data</span>
						</div>
						<p className="text-md whitespace-break-spaces pl-5">
							{laboratoryData}
						</p>
					</div>
					<div>
						<div className="flex items-center gap-2">
							<span className="text-h5 font-semibold">
								Investigation Procedure
							</span>
						</div>
						<p className="text-md whitespace-break-spaces pl-5">
							{investigationProcedure}
						</p>
					</div>
					<div>
						<div className="flex items-center gap-2">
							<span className="text-h5 font-semibold">
								Therapeutic Procedure
							</span>
						</div>
						<p className="text-md whitespace-break-spaces pl-5">
							{therapeuticProcedure}
						</p>
					</div>
					<div>
						<div className="flex items-center gap-2">
							<span className="text-h5 font-semibold">
								Courses Of Treatment In Hospital
							</span>
						</div>
						<p className="text-md whitespace-break-spaces pl-5">
							{coursesOfTreatmentInHospital}
						</p>
					</div>
					<div>
						<div className="flex items-center gap-2">
							<span className="text-h5 font-semibold">Summary Of ICU Stay</span>
						</div>
						<p className="text-md whitespace-break-spaces pl-5">
							{summaryOfICUStay}
						</p>
						<div className="flex flex-col overflow-x-auto">
							<div className="sm:-mx-6 lg:-mx-8">
								<div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
									<div className="overflow-x-auto">
										<table className="text-surface min-w-full text-start text-sm font-light dark:text-white">
											<thead className="border-b border-neutral-200 font-medium dark:border-white/10">
												<tr>
													<th scope="col" className="px-6 py-4">
														Drugs
													</th>
													<th scope="col" className="px-6 py-4">
														Strength
													</th>
													<th scope="col" className="px-6 py-4">
														Frequency
													</th>
													<th scope="col" className="px-6 py-4">
														Duration
													</th>
												</tr>
											</thead>
											<tbody>
												{summaryDrugInstruction?.map(drug => (
													<tr
														key={drug.id}
														className="border-b border-neutral-200 dark:border-white/10"
													>
														<td className="whitespace-nowrap px-6 py-4">
															{drug.name}
														</td>
														<td className="whitespace-nowrap px-6 py-4">
															{drug.strength}
														</td>
														<td className="whitespace-nowrap px-6 py-4">
															{drug.frequency}
														</td>
														<td className="whitespace-nowrap px-6 py-4">
															{drug.duration}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div>
						<div className="flex items-center gap-2">
							<span className="text-h5 font-semibold">
								Future Advice On Discharge
							</span>
						</div>
						<p className="text-md whitespace-break-spaces pl-5">
							{futureAdviceOnDischarge}
						</p>
					</div>
				</div>
				<div className="grid grid-cols-1 gap-4 pt-5 md:grid-cols-2 md:gap-6 lg:gap-8 xl:gap-12">
					<div></div>
					<div className="grid flex-1 grid-cols-2 justify-end gap-2 min-[525px]:flex md:gap-4">
						<Button
							asChild
							className="w-full min-[525px]:max-md:aspect-square min-[525px]:max-md:px-0"
							variant="ghost"
						>
							<a target="_blank" rel="noopener noreferrer" href={href}>
								<Icon name="file-text" className="scale-125 max-md:scale-150">
									<span className="max-sm:hidden">Print</span>
								</Icon>
							</a>
						</Button>
						<Button
							asChild
							className="w-full min-[525px]:max-md:aspect-square min-[525px]:max-md:px-0"
						>
							<Link to={`/in-patients/ds/${id}/edit`}>
								<Icon name="pencil-1" className="scale-125 max-md:scale-150">
									<span className="max-sm:hidden">Edit</span>
								</Icon>
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}

export function ErrorBoundary() {
	return <GeneralErrorBoundary />
}
