# PowerShell script to update all API routes to use NextAuth instead of Supabase Auth

$files = @(
    "src/app/api/users/[id]/route.ts",
    "src/app/api/notifications/[id]/read/route.ts",
    "src/app/api/leads/[id]/steps/route.ts",
    "src/app/api/leads/[id]/status-history/route.ts",
    "src/app/api/leads/[id]/status/route.ts",
    "src/app/api/leads/[id]/route.ts",
    "src/app/api/leads/[id]/documents/upload-url/route.ts",
    "src/app/api/leads/[id]/documents/route.ts",
    "src/app/api/leads/[id]/admin/move-forward/route.ts",
    "src/app/api/leads/[id]/admin/move-backward/route.ts",
    "src/app/api/leads/[id]/activity/route.ts",
    "src/app/api/documents/[id]/view/route.ts",
    "src/app/api/documents/[id]/valid/route.ts",
    "src/app/api/documents/[id]/corrupted/route.ts",
    "src/app/api/documents/view/route.ts",
    "src/app/api/documents/upload/route.ts",
    "src/app/api/documents/route.ts",
    "src/app/api/documents/delete/route.ts",
    "src/app/api/documents/cleanup/route.ts",
    "src/app/api/customer-profiles/upload/route.ts",
    "src/app/api/customer-profiles/draft/route.ts"
)

Write-Host "Updating API routes to use NextAuth..." -ForegroundColor Green

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Processing: $file" -ForegroundColor Yellow
        
        $content = Get-Content $file -Raw
        
        # Replace import
        $content = $content -replace "import \{ createClient \} from '@/lib/supabase/server';", "import { createServiceRoleClient } from '@/lib/supabase/service-role';`nimport { auth } from '@/lib/auth/auth';"
        
        # Replace auth check pattern 1 (with const supabase)
        $content = $content -replace "const supabase = await createClient\(\);[\s\S]*?const \{[\s\S]*?data: \{ user \},[\s\S]*?error: authError,[\s\S]*?\} = await supabase\.auth\.getUser\(\);[\s\S]*?if \(authError \|\| !user\) \{", "const session = await auth();`n`n    if (!session || !session.user) {"
        
        # Replace auth check pattern 2 (without const supabase)
        $content = $content -replace "const \{[\s\S]*?data: \{ user \},[\s\S]*?error: authError,[\s\S]*?\} = await supabase\.auth\.getUser\(\);[\s\S]*?if \(authError \|\| !user\) \{", "const session = await auth();`n`n    if (!session || !session.user) {"
        
        # Replace auth check pattern 3 (inline)
        $content = $content -replace "const \{[\s\S]*?data: \{ user \},[\s\S]*?\} = await supabase\.auth\.getUser\(\);[\s\S]*?if \(!user\) \{", "const session = await auth();`n`n    if (!session || !session.user) {"
        
        # Add const user = session.user after auth check
        $content = $content -replace "if \(!session \|\| !session\.user\) \{([\s\S]*?)\}", "if (!session || !session.user) {`$1}`n`n    const user = session.user;"
        
        # Create supabase client after auth
        $content = $content -replace "const user = session\.user;", "const user = session.user;`n`n    const supabase = createServiceRoleClient();"
        
        Set-Content $file $content
        Write-Host "✓ Updated: $file" -ForegroundColor Green
    } else {
        Write-Host "✗ Not found: $file" -ForegroundColor Red
    }
}

Write-Host "`nDone! All API routes updated." -ForegroundColor Green
Write-Host "Please review the changes and test the endpoints." -ForegroundColor Yellow
