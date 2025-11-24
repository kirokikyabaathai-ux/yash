import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface UploadRequest {
  leadId: string;
  documentType: string;
  fileName: string;
  fileExtension: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client with user's auth token
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    const body: UploadRequest = await req.json();
    const { leadId, documentType, fileName, fileExtension } = body;

    if (!leadId || !documentType || !fileName || !fileExtension) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: leadId, documentType, fileName, fileExtension",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get user profile to check role
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !userProfile) {
      return new Response(
        JSON.stringify({ error: "User profile not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get lead to validate permissions
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("id, created_by, customer_account_id, installer_id")
      .eq("id", leadId)
      .single();

    if (leadError || !lead) {
      return new Response(
        JSON.stringify({ error: "Lead not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate user permissions based on role and document type
    const role = userProfile.role;
    let hasPermission = false;

    if (role === "admin" || role === "office") {
      hasPermission = true;
    } else if (role === "agent" && lead.created_by === user.id) {
      hasPermission = true;
    } else if (
      role === "customer" &&
      lead.customer_account_id === user.id &&
      documentType === "customer"
    ) {
      hasPermission = true;
    } else if (
      role === "installer" &&
      lead.installer_id === user.id &&
      documentType === "installation"
    ) {
      hasPermission = true;
    }

    if (!hasPermission) {
      return new Response(
        JSON.stringify({
          error: "Insufficient permissions to upload to this lead",
        }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate unique file path
    const uuid = crypto.randomUUID();
    const filePath = `leads/${leadId}/${documentType}/${uuid}.${fileExtension}`;

    // Generate signed upload URL (valid for 5 minutes)
    const { data: signedUrlData, error: signedUrlError } = await supabase
      .storage
      .from("solar-projects")
      .createSignedUploadUrl(filePath);

    if (signedUrlError || !signedUrlData) {
      console.error("Error generating signed URL:", signedUrlError);
      return new Response(
        JSON.stringify({ error: "Failed to generate upload URL" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Calculate expiration time (5 minutes from now)
    const expiresAt = Date.now() + 5 * 60 * 1000;

    return new Response(
      JSON.stringify({
        uploadUrl: signedUrlData.signedUrl,
        filePath: filePath,
        expiresAt: expiresAt,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in get-upload-url function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
