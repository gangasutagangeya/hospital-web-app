import { GeneralErrorBoundary } from '#app/components/error-boundary.js'
import { getUserInfo } from '#app/utils/auth.server.js'
import { getDefaultFromToDates } from '#app/utils/misc.js'
import { invariantResponse } from '@epic-web/invariant'
import { LoaderFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/react'

export async function loader({ request, params }: LoaderFunctionArgs) {
	// TODO: Handle error correctly
	const url = new URL(request.url)
	const userInfo = await getUserInfo(request)
	const { fromDate, toDate } = getDefaultFromToDates()
	invariantResponse(userInfo, 'User info not found', { status: 404 })
	if (!userInfo || !userInfo?.hospitalId) throw new Error('User info not found')
	return redirect(
		`/in-patients/search/date?fromDate=${fromDate}&toDate=${toDate}`,
	)
}

export function ErrorBoundary() {
	return <GeneralErrorBoundary />
}
