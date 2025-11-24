# Known Issues

## Next.js 16 Type Errors

### Issue
Next.js 16 has changed the route handler signature to require async params. Several existing API routes need to be updated to match the new signature.

### Affected Files
- `src/app/api/leads/[id]/activity/route.ts`
- `src/app/api/example-error-handling/route.ts` (partially fixed)
- Other dynamic route handlers may also be affected

### Expected Signature (Next.js 16)
```typescript
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const id = params.id;
  // ...
}
```

### Old Signature (Next.js 15 and earlier)
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  // ...
}
```

### Resolution
Update all dynamic route handlers to use the new async params pattern. This is a breaking change in Next.js 16 and affects all routes with dynamic segments.

### Workaround
For now, the application can still run in development mode. The build errors only affect production builds. To fix:

1. Update each dynamic route handler to await params
2. Update the error middleware to handle async params
3. Test all dynamic routes after the update

### Related Documentation
- [Next.js 16 Release Notes](https://nextjs.org/blog/next-16)
- [Dynamic Routes Documentation](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)

## UI Polish Components

All UI polish components (task 31) have been successfully implemented and are working correctly:
- ✅ Loading states (spinners, skeletons, progress bars)
- ✅ Toast notifications (success, error, info, warning)
- ✅ Confirmation dialogs (delete, status change, project closure)
- ✅ Accessibility improvements (ARIA labels, keyboard navigation, screen reader support)

These components are ready to be integrated into existing pages and components.
