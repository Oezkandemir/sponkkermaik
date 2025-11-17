# Supabase Authentication Setup

This project uses Supabase for user authentication. Follow these steps to configure it:

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project or use an existing one
3. Note your project URL and anon key

## 2. Configure Environment Variables

Create a `.env.local` file in the root directory with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Replace `your-project-url` and `your-anon-key` with your actual Supabase project credentials.

## 3. Set Up Authentication in Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **URL Configuration**
3. Add the following redirect URLs:
   - `http://localhost:3000/auth/callback` (for local development)
   - `https://yourdomain.com/auth/callback` (for production)

## 4. Enable Email Authentication

1. In the Supabase dashboard, go to **Authentication** > **Providers**
2. Make sure **Email** provider is enabled
3. Configure email templates if needed

## Features Implemented

### Authentication Pages
- ✅ Sign In page (`/[locale]/auth/signin`)
- ✅ Sign Up page (`/[locale]/auth/signup`)
- ✅ Auth callback handler (`/auth/callback`)

### Components
- ✅ UserMenu component with dropdown
- ✅ User icon in header (both desktop and mobile)

### Functionality
- ✅ Email/password authentication
- ✅ Session management with cookies
- ✅ Automatic session refresh
- ✅ Protected routes ready
- ✅ Multi-language support (DE/EN)

## User Flow

### For Non-Authenticated Users
1. Click the user icon in the header
2. See dropdown with "Sign In" and "Sign Up" options
3. Click "Sign Up" to create a new account
4. Fill in email and password
5. Receive confirmation email
6. Click the link in the email to verify
7. Redirected to sign in page
8. Sign in with credentials

### For Authenticated Users
1. Click the user icon in the header
2. See dropdown with:
   - User email
   - My Profile
   - My Bookings
   - Settings
   - Sign Out

## Next Steps

To complete the authentication system, you'll need to create:

1. **Profile Page** (`/[locale]/profile`)
   - Display user information
   - Allow profile editing

2. **Bookings Page** (`/[locale]/bookings`)
   - Show user's workshop bookings
   - Allow booking management

3. **Settings Page** (`/[locale]/settings`)
   - User preferences
   - Password change
   - Account deletion

## Security Notes

- Never commit your `.env.local` file
- Keep your Supabase anon key secure
- Use Row Level Security (RLS) in Supabase for database access
- Consider implementing rate limiting for auth endpoints

## Troubleshooting

### "Invalid API key" error
- Check that your environment variables are set correctly
- Restart your development server after adding env variables

### Email not arriving
- Check Supabase email settings
- Verify email provider configuration
- Check spam folder

### Session not persisting
- Clear browser cookies and try again
- Check middleware configuration
- Verify Supabase URL configuration

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)



