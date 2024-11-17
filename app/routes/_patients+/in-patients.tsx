import { requireUserId } from '#app/utils/auth.server.js'
import { getDefaultFromToDates } from '#app/utils/misc.js'
import { LoaderFunctionArgs } from '@remix-run/node'
import { Outlet, Link, useMatches, useLoaderData } from '@remix-run/react'

const SEARCH_PATH = '/in-patients/search'
const REGISTRATION_PATH = '/in-patients/registration'
const TEMPLATES_PATH = '/in-patients/ds/template'

export async function loader({ request }: LoaderFunctionArgs) {
	// TODO: Handle require user properly
	await requireUserId(request)
	return null
}

export default function Index() {
	const matches = useMatches()
	const currentRoute = matches.at(2)?.pathname
	const data = useLoaderData<typeof loader>()
	const { fromDate, toDate } = getDefaultFromToDates()
	return (
		<main className="container grid grid-flow-row">
			<div className="flex space-x-3">
				<div
					className={`flex items-center ${currentRoute === SEARCH_PATH ? 'rounded-2xl bg-muted' : ''}`}
				>
					<Link
						to={`${SEARCH_PATH}/date?fromDate=${fromDate}&toDate=${toDate}`}
						className="group grid"
					>
						<span className="p-2 transition group-hover:-translate-x-1">
							Search
						</span>
					</Link>
				</div>
				<div
					className={`flex items-center ${currentRoute === REGISTRATION_PATH ? 'rounded-2xl bg-muted' : ''}`}
				>
					<Link to={REGISTRATION_PATH} className="group grid">
						<span className="p-2 transition group-hover:-translate-x-1">
							Registration
						</span>
					</Link>
				</div>
				<div
					className={`flex items-center ${currentRoute?.includes('template') ? 'rounded-2xl bg-muted' : ''}`}
				>
					<Link to={TEMPLATES_PATH} className="group grid">
						<span className="p-2 transition group-hover:-translate-x-1">
							Templates
						</span>
					</Link>
				</div>
			</div>
			<div className="p-3">
				<Outlet />
			</div>
		</main>
	)
}
