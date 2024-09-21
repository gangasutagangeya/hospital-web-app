import { GeneralErrorBoundary } from '#app/components/error-boundary.js'
import InPatientsTable from '#app/components/inpatients-table.js'
import { getUserInfo } from '#app/utils/auth.server.js'
import { getInPatientsInfoByParam } from '#app/utils/patients.server.js'
import { invariantResponse } from '@epic-web/invariant'
import { json, LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

export async function loader({ request, params }: LoaderFunctionArgs) {
	const url = new URL(request.url)
	const userInfo = await getUserInfo(request)
	invariantResponse(userInfo, 'User info not found', { status: 404 })
	const { param } = params
	console.log('🚀 ~ loader ~ param:', param)
	// TODO: Do we need to check param here
	invariantResponse(param, 'Enter valid search value', { status: 404 })
	const data = await getInPatientsInfoByParam({
		hospitalId: userInfo.hospitalId,
		param: param,
	})
	console.log('🚀 ~ loader ~ data:', data)
	return json(data)
}
export default function SearchResults() {
	const data = useLoaderData<typeof loader>()
	return (
		<div>
			<InPatientsTable data={data} />
		</div>
	)
}
export function ErrorBoundary() {
	return <GeneralErrorBoundary />
}
