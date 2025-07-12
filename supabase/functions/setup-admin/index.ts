
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { email } = await req.json();
    
    if (!email) {
      throw new Error("Email is required");
    }

    console.log(`Processing admin setup for email: ${email}`);
    
    // Special handling for the approved admin email
    if (email !== "chinmayir30@gmail.com") {
      console.log(`Email ${email} is not approved for admin access`);
      throw new Error("This email is not approved for admin access");
    }

    // Create Supabase admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // First try to get the user by email
    // We'll use the client.auth.admin namespace which is available with the service role key
    const { data: users, error: userError } = await supabaseAdmin
      .from('auth.users') // This might not work directly, so we'll handle errors
      .select('id, email')
      .eq('email', email)
      .maybeSingle();

    if (userError) {
      console.error(`Error fetching user: ${userError.message}`);
      
      // Try alternative method to get user
      const { data, error } = await supabaseAdmin
        .auth.admin.listUsers();
      
      if (error) {
        throw new Error(`Error listing users: ${error.message}`);
      }
      
      const user = data.users.find(u => u.email === email);
      if (!user) {
        throw new Error("User not found with that email");
      }
      
      const userId = user.id;
      console.log(`User found with ID: ${userId}`);

      // Check if profile exists, if not create it
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (!existingProfile) {
        // Create profile if it doesn't exist
        const { error: insertError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: userId,
            username: email,
            role: 'admin'
          });
        
        if (insertError) {
          console.error(`Error creating profile: ${insertError.message}`);
          throw new Error(`Failed to create profile: ${insertError.message}`);
        }
        
        console.log(`Created new profile for user ${email} with admin role`);
      } else {
        // Update existing profile to admin role
        const { error: updateError } = await supabaseAdmin
          .from("profiles")
          .update({ role: "admin" })
          .eq("id", userId);
        
        if (updateError) {
          console.error(`Error updating profile: ${updateError.message}`);
          throw new Error(`Failed to update profile: ${updateError.message}`);
        }
        
        console.log(`Successfully updated user ${email} to admin role`);
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: `User ${email} has been granted admin access`,
        userId: userId
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // If we got here, we successfully retrieved the user from the first query
    const userId = users?.id;
    if (!userId) {
      throw new Error("User not found with that email");
    }

    console.log(`User found with ID: ${userId}`);

    // Check if profile exists, if not create it
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (!existingProfile) {
      // Create profile if it doesn't exist
      const { error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          username: email,
          role: 'admin'
        });
      
      if (insertError) {
        console.error(`Error creating profile: ${insertError.message}`);
        throw new Error(`Failed to create profile: ${insertError.message}`);
      }
      
      console.log(`Created new profile for user ${email} with admin role`);
    } else {
      // Update existing profile to admin role
      const { error: updateError } = await supabaseAdmin
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", userId);
      
      if (updateError) {
        console.error(`Error updating profile: ${updateError.message}`);
        throw new Error(`Failed to update profile: ${updateError.message}`);
      }
      
      console.log(`Successfully updated user ${email} to admin role`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `User ${email} has been granted admin access`,
      userId: userId
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error(`Error in setup-admin: ${error instanceof Error ? error.message : "Unknown error"}`);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
