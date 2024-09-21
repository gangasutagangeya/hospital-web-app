import { GeneralErrorBoundary } from '#app/components/error-boundary'
import { logout } from '#app/utils/auth.server'
import { requireUserWithRole } from '#app/utils/permissions.server'
import { LoaderFunctionArgs } from '@remix-run/node'

export async function loader({ request }: LoaderFunctionArgs) {
	const hasUserRole = await requireUserWithRole(request, 'admin')
	if (!hasUserRole) {
		throw await logout({ request })
	}
	// otherwise, we're good... keep going...
	return null
}
export default function Admin() {
	return <div>Admin Page</div>
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				403: ({ error }) => (
					<p>You are not allowed to do that: {error?.data.message}</p>
				),
			}}
		/>
	)
}
