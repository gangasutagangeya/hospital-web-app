import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Button } from './ui/button'
import { Icon } from './ui/icon'
import { Link } from '@remix-run/react'

export function TemplateDropdown({
	templateNames,
	inPatientId,
}: {
	templateNames: { id: string; name: string }[]
	inPatientId: string
}) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button className="w-full" variant="secondary">
					Choose Template
					<Icon name="chevron-down" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuPortal>
				<DropdownMenuContent sideOffset={8} align="start">
					{templateNames.map(template => (
						<DropdownMenuItem key={template.id}>
							<a
								href={`/in-patients/${inPatientId}/ds/${template.id}/new`}
								className="block text-sm font-semibold text-slate-200"
							>
								{template.name}
							</a>
						</DropdownMenuItem>
					))}
				</DropdownMenuContent>
			</DropdownMenuPortal>
		</DropdownMenu>
	)
}
