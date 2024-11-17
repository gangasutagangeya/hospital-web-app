import type { LoaderFunctionArgs } from '@remix-run/node'

export const loader = async ({ request }: LoaderFunctionArgs) => {
	return null
}

export default function DischargeSummaryEditTemplate() {
	return (
		<div>
			<h1>Discharge Summary edit Template</h1>
		</div>
	)
}
