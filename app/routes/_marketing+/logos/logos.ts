import outPatient from './out-patient.svg'
import inPatient from './in-patient.svg'
import { getDefaultFromToDates } from '#app/utils/misc.js'

export { default as stars } from './stars.jpg'

const { fromDate, toDate } = getDefaultFromToDates()

export const logos = [
	{
		src: outPatient,
		alt: 'Out patients',
		href: '/out-patients',
		column: 1,
		row: 1,
	},
	{
		src: inPatient,
		alt: 'In Patients',
		href: `/in-patients/search/date?fromDate=${fromDate}&toDate=${toDate}`,
		column: 2,
		row: 1,
	},
]
