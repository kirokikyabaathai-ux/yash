import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: string;
  status?: string;
  assigned_area?: string;
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

    // Create Supabase client with service role for admin operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Create client with anon key to verify the requesting user
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabaseAnon.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if requesting user is admin
    const { data: userProfile, error: profileError } = await supabaseAnon
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !userProfile || userProfile.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    const body: CreateUserRequest = await req.json();
    const { email, password, name, phone, role, status, assigned_area } = body;

    // Validate required fields
    const errors: Array<{ field: string; message: string }> = [];

    if (!name?.trim()) {
      errors.push({ field: "name", message: "Name is required" });
    }

    if (!email?.trim()) {
      errors.push({ field: "email", message: "Email is required" });
    }

    if (!phone?.trim()) {
      errors.push({ field: "phone", message: "Phone is required" });
    }

    if (!role) {
      errors.push({ field: "role", message: "Role is required" });
    }

    if (!password || password.length < 8) {
      errors.push({
        field: "password",
        message: "Password must be at least 8 characters",
      });
    }

    // Validate role
    const validRoles = ["admin", "agent", "office", "installer", "customer"];
    if (role && !validRoles.includes(role)) {
      errors.push({ field: "role", message: "Invalid role" });
    }

    if (errors.length > 0) {
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: { errors },
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create auth user using admin API
    const { data: authUser, error: createAuthError } =
      await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          name: name,
          phone: phone,
          role: role,
        },
      });

    if (createAuthError) {
      console.error("Error creating auth user:", createAuthError);
      return new Response(
        JSON.stringify({
          error: createAuthError.message || "Failed to create auth user",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!authUser.user) {
      return new Response(
        JSON.stringify({ error: "Failed to create auth user" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create user profile (or fetch if trigger already created it)
    let newUser;
    const { data: insertedUser, error: createUserError } = await supabaseAdmin
      .from("users")
      .insert({
        id: authUser.user.id,
        email: email,
        name: name,
        phone: phone,
        role: role,
        status: status || "active",
        assigned_area: assigned_area || null,
      })
      .select()
      .single();

    if (createUserError) {
      console.error("Error creating user profile:", createUserError);
      
      // Check for specific constraint violations
      let errorMessage = "Failed to create user profile";
      let statusCode = 500;
      
      if (createUserError.message?.includes("duplicate key")) {
        // Check which field is duplicated
        if (createUserError.message.includes("users_email_key")) {
          errorMessage = "Email address is already registered";
          statusCode = 409;
        } else if (createUserError.message.includes("users_phone_key")) {
          errorMessage = "Phone number is already registered";
          statusCode = 409;
        } else {
          // Trigger already created the user, try to update it
          const { data: existingUser, error: fetchError } = await supabaseAdmin
            .from("users")
            .update({
              email: email,
              name: name,
              phone: phone,
              role: role,
              status: status || "active",
              assigned_area: assigned_area || null,
            })
            .eq("id", authUser.user.id)
            .select()
            .single();

          if (fetchError) {
            console.error("Error updating user profile:", fetchError);
            await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
            return new Response(
              JSON.stringify({
                error: fetchError.message || "Failed to update user profile",
              }),
              {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }
          newUser = existingUser;
        }
      } else if (createUserError.message?.includes("check_phone_format")) {
        errorMessage = "Phone number must be exactly 10 digits starting with 1-9";
        statusCode = 400;
      } else if (createUserError.message?.includes("users_role_check")) {
        errorMessage = "Invalid role specified";
        statusCode = 400;
      } else if (createUserError.message?.includes("users_status_check")) {
        errorMessage = "Invalid status specified";
        statusCode = 400;
      }
      
      // If we got a specific error, rollback and return it
      if (statusCode !== 500 || !newUser) {
        await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
        return new Response(
          JSON.stringify({
            error: errorMessage,
          }),
          {
            status: statusCode,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    } else {
      newUser = insertedUser;
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: newUser,
      }),
      {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in create-user function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
