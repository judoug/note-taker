import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { OpenAI } from 'openai';
import { z } from 'zod';
import { env } from '@/lib/env-validation';

// Input validation schema with enhanced security
const generateNoteSchema = z.object({
  prompt: z.string()
    .min(10, 'Prompt must be at least 10 characters')
    .max(500, 'Prompt cannot exceed 500 characters')
    .refine(
      (prompt) => {
        // Security check: Block potentially harmful prompts
        const dangerousPatterns = [
          /ignore.{0,20}previous.{0,20}instructions?/i,
          /system.{0,10}prompt/i,
          /role.{0,10}play/i,
          /pretend.{0,10}(you|to).{0,10}are/i,
          /<script|javascript:/i,
          /sql.{0,10}injection/i,
        ];
        return !dangerousPatterns.some(pattern => pattern.test(prompt));
      },
      { message: 'Prompt contains potentially unsafe content' }
    ),
  tone: z.enum(['professional', 'casual', 'creative', 'academic']).default('professional'),
  length: z.enum(['short', 'medium', 'long']).default('medium'),
});

// Initialize OpenAI client with validated environment
const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
  // Additional security options
  timeout: 30000, // 30 second timeout
  maxRetries: 2,
});

// Length mapping for token limits
const lengthTokens = {
  short: 150,   // ~100-120 words
  medium: 300,  // ~200-250 words  
  long: 500,    // ~350-400 words
};

// Tone mapping for system prompts
const tonePrompts = {
  professional: "Write in a professional, business-appropriate tone. Be clear, concise, and formal.",
  casual: "Write in a friendly, conversational tone. Be approachable and easy to understand.",
  creative: "Write in a creative, engaging tone. Use vivid language and interesting perspectives.",
  academic: "Write in an academic, scholarly tone. Be precise, well-researched, and formal.",
};

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Additional security: Check request size
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 2048) { // 2KB limit
      return NextResponse.json(
        { error: 'Request too large' },
        { status: 413 }
      );
    }

    // Additional security: Check request origin in production
    if (env.NODE_ENV === 'production') {
      const origin = request.headers.get('origin');
      const referer = request.headers.get('referer');
      
      if (!origin && !referer) {
        return NextResponse.json(
          { error: 'Invalid request origin' },
          { status: 403 }
        );
      }
    }

    // Parse and validate request body with size limit
    let body;
    try {
      const text = await request.text();
      if (text.length > 1024) { // 1KB limit for JSON
        return NextResponse.json(
          { error: 'Request body too large' },
          { status: 413 }
        );
      }
      body = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate input schema
    const { prompt, tone, length } = generateNoteSchema.parse(body);

    // Additional security: Log AI generation attempts (for monitoring)
    console.log(`AI generation request from user ${user.id}: ${prompt.substring(0, 50)}...`);

    // Create system prompt based on tone and length
    const systemPrompt = `You are an AI assistant helping users create well-structured notes. 
${tonePrompts[tone]}

Guidelines:
- Create a clear, informative note about the topic
- Include a compelling title
- Structure the content with proper paragraphs
- Aim for approximately ${length === 'short' ? '100-120' : length === 'medium' ? '200-250' : '350-400'} words
- Make it useful and actionable when appropriate
- Do not include markdown formatting

Respond with a JSON object containing:
- "title": A descriptive title for the note
- "content": The main content of the note`;

    // Generate note using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Create a note about: ${prompt}`,
        },
      ],
      max_tokens: lengthTokens[length] + 50, // Extra tokens for title
      temperature: tone === 'creative' ? 0.8 : 0.7,
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      return NextResponse.json(
        { error: 'Failed to generate note content' },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let noteData;
    try {
      noteData = JSON.parse(response);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      return NextResponse.json(
        { error: 'Invalid response format from AI' },
        { status: 500 }
      );
    }

    // Validate response structure
    if (!noteData.title || !noteData.content) {
      return NextResponse.json(
        { error: 'Incomplete response from AI' },
        { status: 500 }
      );
    }

    // Return the generated note
    return NextResponse.json({
      success: true,
      data: {
        title: noteData.title,
        content: noteData.content,
        generatedBy: 'ai',
        prompt: prompt,
        settings: { tone, length },
      },
      usage: {
        tokens: completion.usage?.total_tokens || 0,
        model: completion.model,
      },
    });

  } catch (error) {
    console.error('Error generating note:', error);

    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Invalid API key configuration' },
          { status: 500 }
        );
      }
      
      if (error.message.includes('rate_limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }

      if (error.message.includes('quota')) {
        return NextResponse.json(
          { error: 'API quota exceeded. Please check your OpenAI account.' },
          { status: 402 }
        );
      }
    }

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid input', 
          details: error.errors.map(e => e.message).join(', ')
        },
        { status: 400 }
      );
    }

    // Generic error response
    return NextResponse.json(
      { error: 'Failed to generate note. Please try again.' },
      { status: 500 }
    );
  }
}
