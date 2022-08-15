import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import dbConnect from '@lib/db'
import Application from '@models/application'
import User from '@models/user'
import sendEmail from '@lib/mail/sendEmail'
import { FormSchema } from '@pages/apply'
import Committee from '@models/committee'

const applyHandler = async (req: NextApiRequest, res: NextApiResponse) => {
	try {
		await dbConnect()

		switch (req.method) {
			case 'GET': {
				// GET operation only for admin
				const session = await getSession({ req })
				if (session?.user.type != 'ADMIN') return res.status(403)

				const applicants = await Application.find().lean()
				res.json(applicants)
				break
			}

			case 'POST': {
				const body = req.body as FormSchema
				// check if duplicate entry
				const values = await Promise.all([
					Application.findOne({ $or: [{ email: body.email }, { idNumber: body.idNumber }] }, '_id').lean(),
					User.findOne({ $or: [{ email: body.email }, { idNumber: body.idNumber }] }, '_id').lean()
				])

				if (values[0]) {
					return res.status(406).send('You have already sent an application!')
				}  else if (values[1]) {
					return res.status(406).send('You are already a tutor!')
				}

				const [, email] = await Promise.all([
					Application.create(req.body),
					// get VP Internals' email address
					Committee.getVPEmail('Activities')
				])

				await Promise.all([
					sendEmail(body.email, '[PTS] Tutor Application', 'application/applicant'),
					sendEmail(email, '[PTS] Tutor Application', 'application/officer', body),
				])
				res.status(405)
				break
			}

			default:
				res.setHeader('Allow', ['GET', 'POST'])
				res.status(405).end(`Method ${req.method} Not Allowed`)
		}
	} catch (err) {
		console.log(err)
		res.status(500).send('A server-side error has occured. Please try again later.')
	} finally {
		res.end()
	}
}

export default applyHandler
