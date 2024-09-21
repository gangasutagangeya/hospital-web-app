import { requireUserId } from '#app/utils/auth.server.js'
import { LoaderFunction } from '@remix-run/node'

export let loader: LoaderFunction = async ({ request }) => {
	const userId = await requireUserId(request)
	let url = new URL(request.url)
	// if (url.pathname.match(/^\/in-patients\/?$/)) {
	// 	return redirect('/-patients/home')
	// }

	return null
}
export default function Index() {
	return <div>Out Patient</div>
}
