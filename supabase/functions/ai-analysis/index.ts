
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const openaiKey = Deno.env.get('CLAUDE_API_KEY') || ''

    if (!openaiKey) {
      throw new Error('Missing Claude API key')
    }

    // Create a Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get the request body
    const { prompt, type = 'chat', metadata = {} } = await req.json()

    if (!prompt) {
      throw new Error('No prompt provided')
    }

    // Process the prompt using Claude API
    let generatedText = ''
    let response

    // Here you would add specific system messages based on type
    let systemMessage = 'You are an AI medical assistant.'

    if (type === 'medical_report') {
      systemMessage = 'You are a medical professional analyzing medical reports. Provide a concise summary and highlight any concerns.'
    } else if (type === 'xray') {
      systemMessage = 'You are a radiologist analyzing an X-ray description. Provide insights about what this description reveals.'
    }

    // Call API based on the AI service you want to use
    response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': openaiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-opus-20240229',
        max_tokens: 1000,
        messages: [
          {
            role: 'system',
            content: systemMessage
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    })

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Claude API response error:', errorBody);
      throw new Error(`API request failed with status ${response.status}: ${errorBody}`)
    }

    const result = await response.json()
    generatedText = result.content[0].text

    // Log request to database if needed
    if (type === 'chat' && req.headers.get('authorization')) {
      try {
        const token = req.headers.get('authorization')?.split('Bearer ')[1]
        
        if (!token) {
          console.error('No token provided in authorization header');
          throw new Error('No token provided');
        }
        
        // Verify the user token
        const { data: userData, error: verifyError } = await supabase.auth.getUser(token)
        
        if (verifyError || !userData.user) {
          console.error('Error verifying user token:', verifyError)
          throw new Error('User verification failed');
        }
        
        console.log('User verified, logging conversation for user:', userData.user.id);
        
        // Log the user's message
        const { error: userMessageError } = await supabase.from('chat_history').insert([
          { 
            user_id: userData.user.id,
            role: 'user',
            content: prompt
          }
        ])
        
        if (userMessageError) {
          console.error('Error logging user message:', userMessageError);
          throw userMessageError;
        }
        
        // Log the assistant's response
        const { error: assistantMessageError } = await supabase.from('chat_history').insert([
          {
            user_id: userData.user.id,
            role: 'assistant',
            content: generatedText
          }
        ])
        
        if (assistantMessageError) {
          console.error('Error logging assistant message:', assistantMessageError);
          throw assistantMessageError;
        }
        
        console.log('Successfully logged conversation');
      } catch (error) {
        console.error('Error logging conversation:', error)
      }
    }

    return new Response(JSON.stringify({ generatedText, metadata }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
