import NextAuth from 'next-auth'
import GoogleProvider from "next-auth/providers/google"
import User from '@models/user'
import dbConnect from '@lib/db'
import { Schema } from 'mongoose'
import logger from '@lib/logger'

export default NextAuth({
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		})
	],
	session: {
		strategy: "jwt"
	},
	callbacks: {
		async signIn({ account, profile }) {
			if (account.provider === 'google' && (profile.hd == 'dlsu.edu.ph' || profile.email == process.env.NEXT_PUBLIC_ADMIN_EMAIL)) {
				let temp

				try {
					await dbConnect()
					temp = await User.findOne({ email: profile.email }).lean().exec()
				} catch (err) {
					logger.error(err)
					throw new Error("A server side-error has occured!")
				}

				if (temp == null) {
					throw new Error("User unauthorized! Please contact the system administrator.")
				}

				if (!temp.membership) {
					throw new Error("Account has already revoked its membership.")
				}

				return true
			}

			throw new Error('Invalid login! Make sure to use your DLSU email.')
		},
		async jwt({ token, account, profile }) {
			if (account && profile) {
				try {
					await dbConnect()
					const temp = await User.findOne({ email: profile.email }, 'userType schedule').lean().exec()
					token._id = temp?._id
					token.type = temp?.userType
					token.schedule = temp?.schedule as Schema.Types.ObjectId
				} catch (err) {
					logger.error(err)
					throw new Error("A server side-error has occured!")
				}
			}

			return token
		},
		async session({ token, session }) {
			session.user._id = token._id
			session.user.type = token.type
			session.user.schedule = token.schedule
			return session
		}
	},
	pages: {
		error: '/'
	},
})
