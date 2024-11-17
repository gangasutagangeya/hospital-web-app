import { Button } from '#app/components/ui/button.js'
import { Icon } from '#app/components/ui/icon.js'
import { getUserInfo } from '#app/utils/auth.server.js'
import { checkHoneypot } from '#app/utils/honeypot.server.js'
import { useIsPending } from '#app/utils/misc.js'
import { getDischargeSummaryTemplateNames } from '#app/utils/patients.server.js'
import { getFormProps, useForm } from '@conform-to/react'
import { getZodConstraint, parseWithZod } from '@conform-to/zod'
import { invariantResponse } from '@epic-web/invariant'
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node'
import {
	Form,
	json,
	Link,
	Outlet,
	useActionData,
	useLoaderData,
} from '@remix-run/react'
import { z } from 'zod'
import { AuthenticityTokenInput } from 'remix-utils/csrf/react'
import { ErrorList } from '#app/components/forms.tsx'
import { StatusButton } from '#app/components/ui/status-button.tsx'
import { prisma } from '#app/utils/db.server.js'
import { redirectWithToast } from '#app/utils/toast.server.js'

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url)
	const userInfo = await getUserInfo(request)
	invariantResponse(userInfo, 'User info not found', { status: 404 })
	const templateInfo = await getDischargeSummaryTemplateNames({
		hospitalId: userInfo.hospitalId,
	})
	return json({ ...userInfo, templateInfo })
}

const DeleteTemplateSchema = z.object({
	intent: z.literal('delete-template'),
	templateId: z.string(),
})

export async function action({ request }: ActionFunctionArgs) {
	// TODO: Add userInfo to input field
	const formData = await request.formData()
	checkHoneypot(formData)
	const submission = await parseWithZod(formData, {
		schema: DeleteTemplateSchema,
	})

	if (submission.status !== 'success') {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === 'error' ? 400 : 200 },
		)
	}
	const { templateId } = submission.value
	await prisma.dischargeSummaryTemplate.delete({
		where: { id: templateId },
	})
	return redirectWithToast(
		`/in-patients/ds/template`,
		{
			type: 'success',
			title: 'Discharge Summary Template deleted',
			description: 'Discharge Summary has been deleted successfully.',
		},
		{ status: 302 },
	)
}

export default function DischargeSummaryTemplate() {
	const { templateInfo } = useLoaderData<typeof loader>()
	console.log('🚀 ~ DischargeSummaryTemplate ~ templateInfo:', templateInfo)
	const hasTemplates = templateInfo.length > 0
	return (
		<div className="container flex min-h-full flex-col justify-center rounded-3xl bg-muted pb-32 pt-10">
			<div className="flex flex-col gap-3 pb-5 text-center">
				<h1 className="text-h1">Discharge Summary Templates</h1>
				<p className="text-body-md text-muted-foreground">
					Create, Edit or Delete Discharge Summary Templates
				</p>
			</div>
			<div className="grid grid-cols-1 gap-4 pb-5 md:grid-cols-2 md:gap-6 lg:gap-8 xl:gap-12">
				<div></div>
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:gap-8 xl:gap-12">
					<div></div>

					<Button className="w-full" variant="outline">
						<Link to="/in-patients/ds/template/new">
							Create New Template <Icon name="plus" />
						</Link>
					</Button>
				</div>
			</div>
			{!hasTemplates && (
				<div className="flex justify-center text-center">
					<p className="text-body-md text-muted-foreground">
						No Discharge Summary Templates found.
					</p>
				</div>
			)}
			<div>
				{templateInfo.map(template => (
					<div
						key={template.id}
						className="grid grid-cols-1 gap-4 p-3 md:grid-cols-2 md:gap-6 lg:gap-8 xl:gap-12"
					>
						<div>
							<span className="text-xl font-bold">Name</span>
							<p key={template.id} className="">
								{template.name}
							</p>
						</div>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:gap-8 xl:gap-12">
							<DeleteTemplate id={template.id} />
							<Button className="" variant="default">
								<a
									href={`/in-patients/ds/template/${template.id}/edit`}
									className="block text-sm font-semibold"
								>
									<Icon name="pencil-1" className="scale-125 max-md:scale-150">
										<span className="max-md:hidden">Edit</span>
									</Icon>
								</a>
							</Button>
						</div>
					</div>
				))}
			</div>
			<Outlet />
		</div>
	)
}

export function DeleteTemplate({ id }: { id: string }) {
	const actionData = useActionData<typeof action>()
	const isPending = useIsPending()

	const [form] = useForm({
		id: 'delete-template',
		lastResult: actionData?.result,
	})

	return (
		<Form method="post" {...getFormProps(form)}>
			<input type="hidden" name="templateId" value={id} />
			<StatusButton
				type="submit"
				name="intent"
				value="delete-template"
				variant="destructive"
				status={isPending ? 'pending' : form.status ?? 'idle'}
				disabled={isPending}
				className="w-full max-md:aspect-square max-md:px-0"
			>
				<Icon name="trash" className="scale-125 max-md:scale-150">
					<span className="max-md:hidden">Delete</span>
				</Icon>
			</StatusButton>
			<ErrorList errors={form.errors} id={form.errorId} />
		</Form>
	)
}
