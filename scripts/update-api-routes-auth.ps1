# Script to update API routes from Supabase Auth to NextAuth
# This script updates authentication checks in API routes

$files = @(
    "src/app/api/customer-profiles/route.ts",
    "src/app/api/customer-profiles/draft/route.ts",
    "src/app/api/customer-profiles/upload/route.ts",
    "src/app/api/dashboard/metrics/route.ts",
    "src/app/api/documents/route.ts",
    "src/app/api/documents/cleanup/route.ts",
    "src/app/api/documents/delete/route.ts",
    "src/app/api/documents/upload/route.ts",
    "src/app/api/documents/view/route.ts",
    "src/app/api/documents/[id]/corrupted/route.ts",
    "src/app/api/documents/[id]/valid/route.ts",
    "src/app/api/documents/[id]/view/route.ts",
    "src/app/api/example-error-handling/route.ts",
    "src/app/api/leads/[id]/route.ts",
    "src/app/api/leads/[id]/activity/route.ts",
    "src/app/api/leads/[id]/admin/move-backward/route.ts",
    "src/app/api/leads/[id]/admin/move-forward/route.ts",
    "src/app/api/leads/[id]/documents/route.ts",
    "src/app/api/leads/[id]/documents/upload-url/route.ts",
    "src/app/api/leads/[id]/status/route.ts",
    "src/app/api/leads/[id]/status-history/route.ts",
    "src/app/api/leads/[id]/steps/route.ts",
    "src/app/api/leads/[id]/steps/[stepId]/complete/route.ts",
    "src/app/api/leads/[id]/steps/[stepId]/reopen/route.ts",
    "src/app/api/notifications/[id]/read/route.ts",
    "src/app/api/steps/route.ts",
    "src/app/api/steps/reorder/route.ts",
    "src/app/api/steps/[id]/route.ts",
    "src/app/api/users/[id]/route.ts"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Processing $file..."
        $content = Get-Content $file -Raw
        
        # Add NextAuth import if not present
        if ($content -notmatch "import.*auth.*from.*@/lib/auth/auth") {
            $content = $content -replace "(import.*from '@/lib/supabase/server';)", "`$1`nimport { auth } from '@/lib/auth/auth';"
        }
        
        # Replace auth check pattern
        $oldPattern = @"
    const \{
      data: \{ user \},
      error: authError,
    \} = await supabase\.auth\.getUser\(\);

    if \(authError \|\| !user\) \{
"@
        
        $newPattern = @"
    // Check authentication with NextAuth
    const session = await auth();

    if (!session || !session.user) {
"@
        
        $content = $content -replace [regex]::Escape($oldPattern), $newPattern
        
        # Replace user.id with session.user.id
        $content = $content -replace '\buser\.id\b', 'session.user.id'
        
        Set-Content $file -Value $content -NoNewline
        Write-Host "Updated $file"
    } else {
        Write-Host "File not found: $file" -ForegroundColor Yellow
    }
}

Write-Host "`nAll files processed!" -ForegroundColor Green
