import { GeneralErrorBoundary } from '#app/components/error-boundary.js'
import { getUserInfo } from '#app/utils/auth.server.js'
import { getDischargeSummaryInfo } from '#app/utils/patients.server.js'
import { invariantResponse } from '@epic-web/invariant'
import { json, LoaderFunctionArgs } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'

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
	console.log('🚀 ~ dischargeSummaryInfo:', dischargeSummaryInfo)
	return json({ dischargeSummaryInfo })
}
export default function ShowDischargeSummary() {
	const data = useLoaderData<typeof loader>()
	console.log('🚀 ~ ShowDischargeSummary ~ data:', data)
	return <div>Hello in description route</div>
}

export function ErrorBoundary() {
	return <GeneralErrorBoundary />
}
