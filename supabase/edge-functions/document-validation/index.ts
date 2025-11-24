import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ValidationRequest {
  leadId: string;
  documentId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

// Allowed file types for documents
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Mandatory document categories
const MANDATORY_DOCUMENT_CATEGORIES = [
  "aadhar_front",
  "aadhar_back",
  "bijli_bill",
  "bank_passbook",
  "cancelled_cheque",
  "pan_card",
];

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

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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
    const body: ValidationRequest = await req.json();
    const { leadId, documentId, fileName, fileSize, mimeType } = body;

    if (!leadId || !documentId || !fileName || !fileSize || !mimeType) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: "Invalid file type. Allowed types: PDF, JPEG, PNG, WebP",
          allowedTypes: ALLOWED_MIME_TYPES,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate file size
    if (fileSize > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          maxSize: MAX_FILE_SIZE,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get document details
    const { data: document, error: docError } = await supabase
      .from("documents")
      .select("id, lead_id, type, document_category")
      .eq("id", documentId)
      .single();

    if (docError || !document) {
      return new Response(
        JSON.stringify({ error: "Document not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if all mandatory documents are now uploaded
    const { data: allDocuments, error: docsError } = await supabase
      .from("documents")
      .select("document_category, status")
      .eq("lead_id", leadId)
      .eq("type", "mandatory")
      .eq("status", "valid");

    if (docsError) {
      console.error("Error fetching documents:", docsError);
    }

    const uploadedCategories = new Set(
      allDocuments?.map((d) => d.document_category) || []
    );
    const allMandatoryUploaded = MANDATORY_DOCUMENT_CATEGORIES.every((cat) =>
      uploadedCategories.has(cat)
    );

    // Check if PM Suryaghar form is submitted
    const { data: pmForm, error: pmFormError } = await supabase
      .from("pm_suryaghar_form")
      .select("id")
      .eq("lead_id", leadId)
      .single();

    const pmFormSubmitted = !pmFormError && pmForm !== null;

    // If both conditions met, update lead status to "interested"
    if (allMandatoryUploaded && pmFormSubmitted) {
      const { error: updateError } = await supabase
        .from("leads")
        .update({ status: "interested", updated_at: new Date().toISOString() })
        .eq("id", leadId);

      if (updateError) {
        console.error("Error updating lead status:", updateError);
      }
    }

    return new Response(
      JSON.stringify({
        valid: true,
        allMandatoryUploaded: allMandatoryUploaded,
        pmFormSubmitted: pmFormSubmitted,
        statusUpdated: allMandatoryUploaded && pmFormSubmitted,
        missingDocuments: MANDATORY_DOCUMENT_CATEGORIES.filter(
          (cat) => !uploadedCategories.has(cat)
        ),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in document-validation function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
