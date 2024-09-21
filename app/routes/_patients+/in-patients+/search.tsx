import { GeneralErrorBoundary } from '#app/components/error-boundary.js'
import { ErrorList, Field } from '#app/components/forms.js'
import { StatusButton } from '#app/components/ui/status-button.js'
import { getUserInfo } from '#app/utils/auth.server.js'
import { checkHoneypot } from '#app/utils/honeypot.server.js'
import { useIsPending } from '#app/utils/misc.js'
import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { invariantResponse } from '@epic-web/invariant'
import { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import {
	Form,
	json,
	Outlet,
	redirect,
	useActionData,
	useLoaderData,
	useSearchParams,
} from '@remix-run/react'
import { HoneypotInputs } from 'remix-utils/honeypot/react'
import { z } from 'zod'

// TODO: Add loading state
// Remove optional for fromDate and toDate
const SearchFormSchema = z.object({
	fromDate: z.string().optional(),
	toDate: z.string().optional(),
	param: z.string().optional(),
})

export async function loader({ request, params }: LoaderFunctionArgs) {
	// TODO: Handle error correctly
	const url = new URL(request.url)
	console.log('🚀 ~ loader ~ url:', url)
	const userInfo = await getUserInfo(request)
	invariantResponse(userInfo, 'User info not found', { status: 404 })
	const fromDate = url.searchParams.get('fromDate')
	const toDate = url.searchParams.get('toDate')
	const { param } = params
	if (!userInfo || !userInfo?.hospitalId) throw new Error('User info not found')
	return json({ fromDate, toDate, param })
}

export async function action({ request }: ActionFunctionArgs) {
	const userInfo = await getUserInfo(request)
	if (!userInfo || !userInfo?.hospitalId) throw new Error('User info not found')

	const formData = await request.formData()
	checkHoneypot(formData)
	const submission = await parseWithZod(formData, {
		schema: intent =>
			SearchFormSchema.transform(async data => {
				if (intent !== null) return { ...data, session: null }
				if (data.fromDate === null || data.toDate === null) return z.NEVER

				return { ...data }
			}),
		async: true,
	})

	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}

	const { fromDate, toDate, param } = submission.value
	if (param) {
		return redirect(`/in-patients/search/${param}`)
	} else {
		return redirect(
			`/in-patients/search/date?fromDate=${fromDate}&toDate=${toDate}`,
		)
	}
}

export default function Search() {
	const isPending = useIsPending()
	const actionData = useActionData<typeof action>()
	const data = useLoaderData<typeof loader>()
	const { fromDate, toDate, param } = data

	const [form, fields] = useForm({
		id: 'in-patient-search-form',
		constraint: getZodConstraint(SearchFormSchema),
		defaultValue: { fromDate, toDate, param },
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: SearchFormSchema })
		},
		shouldRevalidate: 'onBlur',
	})

	return (
		<div>
			<Form className="flex space-x-3" method="POST" {...getFormProps(form)}>
				<HoneypotInputs />
				<Field
					labelProps={{ htmlFor: fields.fromDate.id, children: 'From date' }}
					inputProps={{
						...getInputProps(fields.fromDate, { type: 'date' }),
						autoComplete: 'fromDate',
					}}
					errors={fields.fromDate.errors}
				/>
				<Field
					labelProps={{ htmlFor: fields.toDate.id, children: 'To date' }}
					inputProps={{
						...getInputProps(fields.toDate, { type: 'date' }),
						autoComplete: 'toDate',
					}}
					errors={fields.toDate.errors}
				/>

				<Field
					labelProps={{
						htmlFor: fields.param.id,
						children: 'Search by UMR, Aadhar, Phone, Name',
					}}
					inputProps={{
						...getInputProps(fields.param, { type: 'text' }),
						autoFocus: true,
						className: 'lowercase',
					}}
					errors={fields.param.errors}
				/>
				<ErrorList errors={form.errors} id={form.errorId} />
				<div className="flex items-center">
					<StatusButton
						className="w-full"
						status={isPending ? 'pending' : form.status ?? 'idle'}
						name="intent"
						type="submit"
						disabled={isPending}
					>
						Search
					</StatusButton>
				</div>
			</Form>
			<Outlet />
		</div>
	)
}

export function ErrorBoundary() {
	return <GeneralErrorBoundary />
}
