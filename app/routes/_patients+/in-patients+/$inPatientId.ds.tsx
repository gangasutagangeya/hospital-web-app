import { Spacer } from '#app/components/spacer.js'
import { TemplateDropdown } from '#app/components/template-dropdown.js'
import { Button } from '#app/components/ui/button.js'
import { getUserInfo } from '#app/utils/auth.server.js'
import { getDischargeSummaryTemplateNames } from '#app/utils/patients.server.js'
import { invariantResponse } from '@epic-web/invariant'
import type { LoaderFunctionArgs } from '@remix-run/node'
import { json, Link, Outlet, useLoaderData } from '@remix-run/react'

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const url = new URL(request.url)
	const userInfo = await getUserInfo(request)
	invariantResponse(userInfo, 'User info not found', { status: 404 })
	const { inPatientId } = params
	invariantResponse(inPatientId, 'In Patient is not available', {
		status: 404,
	})
	const templateNames = await getDischargeSummaryTemplateNames({
		hospitalId: userInfo.hospitalId,
	})
	return json({ ...userInfo, inPatientId, templateNames })
}

export default function DischargeSummaryBase() {
	const { inPatientId, templateNames, hospitalId } =
		useLoaderData<typeof loader>()
	return (
		<div className="container flex min-h-full flex-col justify-center rounded-3xl bg-muted pb-32 pt-10">
			<div className="flex flex-col gap-3 text-center">
				<h1 className="text-h1">Add Discharge Summary</h1>
				<p className="text-body-md text-muted-foreground">
					Choose discharge summary template or create new template.
				</p>
			</div>
			<Spacer size="xs" />
			<div className="grid grid-cols-1 gap-4 pb-3 md:grid-cols-2 md:gap-6 lg:gap-8 xl:gap-12">
				<div></div>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:gap-8 xl:gap-12">
					<div className="w-full">
						<TemplateDropdown
							templateNames={templateNames}
							inPatientId={inPatientId}
						/>
					</div>

					<Button className="w-full" variant="ghost">
						<Link to="/in-patients/ds/template/new">Create New Template</Link>
					</Button>
				</div>
			</div>
			<Outlet />
		</div>
	)
}
