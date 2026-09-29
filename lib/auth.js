import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import { getAuthSecret } from '@/lib/env';
import User from '@/models/User';

const nextAuthSecret = getAuthSecret();

export const authOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60,
  },
  secret: nextAuthSecret,
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          await connectToDatabase();
          const email = credentials.email.trim().toLowerCase();
          const user = await User.findOne({ email }).lean();
          if (!user) return null;

          const passwordMatches = await compare(credentials.password, user.password);
          if (!passwordMatches) return null;

          return {
            id: String(user._id),
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error('Credentials authorize error', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.roleCheckedAt = Date.now();
      } else if (!token.roleCheckedAt || Date.now() - token.roleCheckedAt > 5 * 60 * 1000) {
        await connectToDatabase();
        const currentUser = await User.findById(token.id).select('role').lean();
        if (!currentUser) return {};

        token.role = currentUser.role;
        token.roleCheckedAt = Date.now();
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};
