import { GeneralErrorBoundary } from '#app/components/error-boundary.js'
import InPatientsTable from '#app/components/inpatients-table.js'
import { getUserInfo } from '#app/utils/auth.server.js'
import { getInPatientsInfoByDate } from '#app/utils/patients.server.js'
import { invariantResponse } from '@epic-web/invariant'
import { LoaderFunctionArgs } from '@remix-run/node'
import { json, useLoaderData } from '@remix-run/react'

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url)
	const userInfo = await getUserInfo(request)
	invariantResponse(userInfo, 'User info not found', { status: 404 })
	const fromDate = url.searchParams.get('fromDate')
	const toDate = url.searchParams.get('toDate')
	invariantResponse(fromDate, 'fromDate not found', { status: 404 })
	invariantResponse(toDate, 'toDate not found', { status: 404 })
	const data = await getInPatientsInfoByDate({
		hospitalId: userInfo.hospitalId,
		fromDate,
		toDate,
	})
	// console.log('🚀 ~ loader ~ data:', data)
	invariantResponse(data, 'Data not found', { status: 404 })
	return json(data)
}

export default function DefaultSearchResults() {
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
