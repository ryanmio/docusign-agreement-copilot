TASK: Fix Next.js 15 Cookie Warnings and Migrate Supabase Auth to SSR Package

OBJECTIVE:
The application is experiencing cookie-related warnings in Next.js 15 due to synchronous cookie access. We need to migrate from @supabase/auth-helpers-nextjs to @supabase/ssr and implement proper async cookie handling throughout the application.

REQUIRED DELIVERABLES:

1. Research and Analysis:
- Document all files using cookie operations
- Identify cookie access patterns in middleware, server components, and client components
- Map out dependencies between components that share auth state
- Create a migration strategy that minimizes disruption

2. Package Migration:
- Remove @supabase/auth-helpers-nextjs
- Install @supabase/ssr
- Update package.json and any relevant dependencies
- Verify no breaking changes in Supabase client API

3. Code Updates:
- Middleware.ts: Update to use createServerClient with proper cookie methods
- Server Components: Implement async cookie handling in layout files
- Client Components: Update to use createBrowserClient
- API Routes: Update cookie handling in route handlers
- Utility Functions: Create shared client creation utilities

PROOF OF COMPLETION:
Please provide:
1. No cookie warnings in server logs when accessing protected routes
2. Successful auth flow (login, session management, logout)
3. Working API routes that maintain auth state
4. Clean browser console without warnings
5. All tests passing (if applicable)

Next agent will handle:
- Performance optimization if needed
- Additional error handling
- Documentation updates
- Testing coverage

IMPORTANT:
- Do not modify auth flow logic or security measures
- Maintain backward compatibility where possible
- Test each change incrementally
- Keep commits atomic and reversible

-------------------

👋 Hello from Agent 9 (Navigator Analysis)!

I just completed the date range filtering implementation, and I've noticed some important patterns in our auth handling that will be relevant for your cookie fixes.

TECHNICAL HANDOFF NOTES:

1. Project Structure:
- `middleware.ts` - Main auth protection
- `app/layout.tsx` - Root layout with session handling
- `app/chat/layout.tsx` - Protected route layout
- `components/Header.tsx` - Client-side auth state
- `utils/supabase/` - Auth utilities

2. Existing Patterns:
- Server components use createServerComponentClient
- Client components use createClientComponentClient
- API routes use createRouteHandlerClient
- Middleware uses createMiddlewareClient

3. Key Files to Reference:
- `app/api/chat/route.ts` - Shows cookie usage in API routes
- `app/api/navigator/analyze/route.ts` - Shows auth token handling
- `components/Header.tsx` - Shows client-side session management

4. Helpful Code Patterns:
```typescript
// Current server component pattern
const supabase = createServerComponentClient({ cookies });
const { data: { session } } = await supabase.auth.getSession();

// Current client component pattern
const supabase = createClientComponentClient();
const { data: { subscription } } = supabase.auth.onAuthStateChange(...);

// Current middleware pattern
const supabase = createMiddlewareClient({ req, res });
const { data: { session } } = await supabase.auth.getSession();
```

5. Development Tips:
- Test auth flow completely after each change
- Watch for cookie warnings in dev tools
- Check both client and server-side session handling
- Verify API routes maintain auth state
- Test protected routes access

6. Gotchas We Found:
- Cookie warnings appear in Next.js 15 due to sync access
- Auth helpers package isn't fully compatible with Next.js 15
- Some components assume synchronous cookie access
- API routes need careful cookie handling
- Middleware needs special attention for cookie operations

I'm excited to see how you solve these cookie warnings! The auth flow is critical to our app, so take it step by step and test thoroughly.

Best regards,
Agent 9 🔐 🍪 ⚡️

Note: Pay special attention to the navigator analysis endpoints as they make internal API calls that need to maintain auth state. 