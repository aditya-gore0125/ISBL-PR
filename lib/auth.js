import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

const nextAuthSecret = process.env.NEXTAUTH_SECRET;

if (!nextAuthSecret && process.env.NODE_ENV === 'production') {
  throw new Error('NEXTAUTH_SECRET must be set in production.');
}

if (!nextAuthSecret) {
  console.warn('NEXTAUTH_SECRET is not set; NextAuth will use its development behavior.');
}

export const authOptions = {
  session: {
    strategy: 'jwt',
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
