
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
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

  console.log("Create payment function called");

  try {
    // Parse the request body to get the order details
    const { cartItems, subtotal, pickupTime, notes } = await req.json();
    console.log(`Received order: ${cartItems.length} items, subtotal: ₹${subtotal}, pickup: ${pickupTime}`);

    // Check minimum amount requirement (₹50 = ~$0.60)
    if (subtotal < 50) {
      console.error(`Order amount too low: ₹${subtotal}. Minimum required: ₹50`);
      throw new Error("Minimum order amount is ₹50. Please add more items to your cart.");
    }

    // Retrieve authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authentication required. Please login to place an order.");
    }
    
    const token = authHeader.replace("Bearer ", "");
    console.log("Authenticating user with token");
    
    // Create Supabase client and verify user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Authentication error:", authError);
      throw new Error("Invalid authentication. Please login again.");
    }
    
    if (!user?.email) {
      console.error("No user email found in token");
      throw new Error("User email not available. Please login again.");
    }
    
    console.log(`User authenticated: ${user.id}, email: ${user.email}`);

    // Initialize Stripe with proper error handling
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      console.error("Missing STRIPE_SECRET_KEY in environment");
      throw new Error("Payment service is not configured properly");
    }
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Check if a Stripe customer record exists for this user
    console.log(`Checking for existing Stripe customer with email: ${user.email}`);
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log(`Found existing customer: ${customerId}`);
    }

    // Validate cart items
    if (!cartItems || cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    // Create line items from cart items (fix: skip empty description field)
    console.log("Creating line items for Stripe");
    const line_items = cartItems.map((item) => {
      if (!item.name || !item.price || !item.quantity) {
        throw new Error(`Invalid cart item: ${JSON.stringify(item)}`);
      }
      // Only add description if it exists and is not an empty string
      const productData = { name: item.name };
      if (item.description && item.description.trim() !== "") {
        productData["description"] = item.description.substring(0, 100);
      }
      return {
        price_data: {
          currency: "inr",
          product_data: productData,
          unit_amount: Math.round(item.price * 100), // Convert to paise and round
        },
        quantity: item.quantity,
      };
    });

    // Get the origin for redirect URLs
    const origin = req.headers.get("origin") || req.headers.get("referer")?.split('/').slice(0, 3).join('/');
    if (!origin) {
      throw new Error("Could not determine origin for redirect URLs");
    }

    // Create a one-time payment session
    console.log("Creating Stripe checkout session");
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items,
      mode: "payment",
      metadata: {
        pickup_time: pickupTime || 'ASAP',
        user_id: user.id,
        notes: notes || '',
      },
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
    });

    console.log(`Checkout session created: ${session.id}, URL: ${session.url}`);

    // Update your Supabase orders table with this new payment
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    console.log("Saving order to database");
    const { data: orderData, error: orderError } = await supabaseService.from("orders").insert({
      user_id: user.id,
      items: cartItems,
      amount: subtotal,
      pickup_time: pickupTime || 'ASAP',
      notes: notes || '',
      status: 'pending',
    }).select();

    if (orderError) {
      console.error("Database error:", orderError);
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    console.log("Order successfully created:", orderData);
    
    // Ensure we return a valid Stripe checkout URL
    if (!session.url) {
      throw new Error("Failed to create Stripe checkout session");
    }
    
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    console.error(`Error in create-payment: ${error instanceof Error ? error.message : "Unknown error"}`);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : String(error),
      details: "Payment processing failed. Please try again."
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
