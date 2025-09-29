import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { OpenAI } from 'openai';
import { z } from 'zod';

// Input validation schema
const generateNoteSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(1000, 'Prompt too long'),
  tone: z.enum(['professional', 'casual', 'creative', 'academic']).optional().default('casual'),
  length: z.enum(['short', 'medium', 'long']).optional().default('medium'),
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { prompt, tone, length } = generateNoteSchema.parse(body);

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
