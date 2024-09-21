import { GeneralErrorBoundary } from './error-boundary'

// TODO: Change any to correct structure
export default function InPatientsTable({ data }: { data: any }) {
	console.log('🚀 ~ InPatientsTable ~ data:', data)
	if (data.length === 0) {
		return <div>No Data present</div>
	}
	return (
		<div className="relative flex h-full w-full flex-col overflow-scroll rounded-lg bg-slate-800 bg-clip-border text-gray-300 shadow-md">
			<table className="w-full min-w-max table-auto text-left">
				<thead>
					<tr>
						<th className="border-b border-slate-300 bg-slate-50 p-4">
							<p className="block text-sm font-normal leading-none text-slate-500">
								UMR
							</p>
						</th>
						<th className="border-b border-slate-300 bg-slate-50 p-4">
							<p className="block text-sm font-normal leading-none text-slate-500">
								Aadhar
							</p>
						</th>
						<th className="border-b border-slate-300 bg-slate-50 p-4">
							<p className="block text-sm font-normal leading-none text-slate-500">
								Name
							</p>
						</th>
						<th className="border-b border-slate-300 bg-slate-50 p-4">
							<p className="block text-sm font-normal leading-none text-slate-500">
								Age
							</p>
						</th>
						<th className="border-b border-slate-300 bg-slate-50 p-4">
							<p className="block text-sm font-normal leading-none text-slate-500">
								Gender
							</p>
						</th>
						<th className="border-b border-slate-300 bg-slate-50 p-4">
							<p className="block text-sm font-normal leading-none text-slate-500">
								Father Name
							</p>
						</th>
						<th className="border-b border-slate-300 bg-slate-50 p-4">
							<p className="block text-sm font-normal leading-none text-slate-500">
								Phone
							</p>
						</th>
						<th className="border-b border-slate-300 bg-slate-50 p-4">
							<p className="block text-sm font-normal leading-none text-slate-500">
								City
							</p>
						</th>
						<th className="border-b border-slate-300 bg-slate-50 p-4">
							<p className="block text-sm font-normal leading-none text-slate-500">
								Discharge Summary
							</p>
						</th>
						<th className="border-b border-slate-300 bg-slate-50 p-4">
							<p className="block text-sm font-normal leading-none text-slate-500">
								Patient Information
							</p>
						</th>
					</tr>
				</thead>
				<tbody>
					{data.map((item: any) => (
						<tr className="" key={item.id}>
							<td className="border-b border-slate-200 p-4">
								<p className="block text-sm text-slate-300">
									{item.patient.umr}
								</p>
							</td>
							<td className="border-b border-slate-200 p-4">
								<p className="block text-sm text-slate-300">
									{item.patient.aadhar}
								</p>
							</td>
							<td className="border-b border-slate-200 p-4">
								<p className="block text-sm text-slate-300">
									{item.patient.name}
								</p>
							</td>
							<td className="border-b border-slate-200 p-4">
								<p className="block text-sm text-slate-300">
									{item.patient.age}
								</p>
							</td>
							<td className="border-b border-slate-200 p-4">
								<p className="block text-sm text-slate-300">
									{item.patient.gender}
								</p>
							</td>
							<td className="border-b border-slate-200 p-4">
								<p className="block text-sm text-slate-300">
									{item.patient.fatherName}
								</p>
							</td>
							<td className="border-b border-slate-200 p-4">
								<p className="block text-sm text-slate-300">
									{item.patient.phone}
								</p>
							</td>
							<td className="border-b border-slate-200 p-4">
								<p className="block text-sm text-slate-300">
									{item.patient.address.city}
								</p>
							</td>
							{item.dischargeSummary ? (
								<td className="border-b border-slate-200 p-4">
									<a
										href={`/in-patients/ds/${item.dischargeSummary.id}`}
										className="block text-sm font-semibold text-slate-200"
									>
										View
									</a>
								</td>
							) : (
								<td className="border-b border-slate-200 p-4">
									<a
										href={`/in-patients/${item.id}/ds/new`}
										className="block text-sm font-semibold text-slate-200"
									>
										Add
									</a>
								</td>
							)}
							<td className="border-b border-slate-200 p-4">
								<a
									href={`/patient/${item.patient.id}/edit`}
									className="block text-sm font-semibold text-slate-200"
								>
									Edit
								</a>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}

export function ErrorBoundary() {
	return <GeneralErrorBoundary />
}

// <td className="border-b border-slate-200 p-4">
// 								<a
// 									href={
// 										Boolean(item.dischargeSummary?.id)
// 											? `/in-patients/${item.dischargeSummary?.id}/discharge-summary`
// 											: `/in-patients/discharge-summary/new`
// 									}
// 									className="block text-sm font-semibold text-slate-200"
// 								>
// 									{item.dischargeSummary.id ? 'Edit' : 'Add'}
// 								</a>
// 							</td>
