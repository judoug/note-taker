import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { OpenAI } from 'openai';
import { z } from 'zod';
import { env } from '@/lib/env-validation';
import { getNote } from '@/lib/db';
import { getWordCount } from '@/lib/note-utils';

// Input validation schema
const summarizeNoteSchema = z.object({
  summaryType: z.enum(['brief', 'detailed', 'bullets']).optional().default('brief'),
  length: z.enum(['short', 'medium', 'long']).optional().default('medium'),
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
  timeout: 45000, // Longer timeout for summarization
  maxRetries: 2,
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Verify authentication
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get noteId from URL parameters
    const params = await context.params;
    const noteId = params.id;

    if (!noteId) {
      return NextResponse.json(
        { error: 'Note ID is required' },
        { status: 400 }
      );
    }

    // Additional security: Check request size
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 2048) {
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

    // Parse and validate request body
    let body;
    try {
      const text = await request.text();
      if (text.length > 1024) {
        return NextResponse.json(
          { error: 'Request body too large' },
          { status: 413 }
        );
      }
      body = text ? JSON.parse(text) : {};
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate input schema
    const { summaryType, length } = summarizeNoteSchema.parse(body);

    // Get and verify note ownership
    const note = await getNote(noteId, user.id);
    if (!note) {
      return NextResponse.json(
        { error: 'Note not found or access denied' },
        { status: 404 }
      );
    }

    // Check minimum content length for summarization
    const originalWordCount = getWordCount(note.content);
    if (originalWordCount < 50) {
      return NextResponse.json(
        { error: 'Note is too short for summarization (minimum 50 words)' },
        { status: 400 }
      );
    }

    console.log(`AI Summarization attempt for note ${noteId} by user ${user.id}`);

    // Craft system prompt based on summary type
    let systemPrompt = '';
    let maxTokens = 200;

    switch (summaryType) {
      case 'brief':
        systemPrompt = `You are an AI assistant specialized in creating concise, one-paragraph summaries.
Summarize the provided note content in 1-2 sentences that capture the main idea and key points.
Focus on the most important information and avoid unnecessary details.
Write in clear, professional language that maintains the original tone.`;
        maxTokens = 100;
        break;
      
      case 'detailed':
        systemPrompt = `You are an AI assistant specialized in creating comprehensive summaries.
Provide a detailed summary that covers all major points and important details from the note.
Structure your summary in 2-3 well-organized paragraphs that maintain logical flow.
Include key insights, conclusions, and supporting details while remaining concise.
Write in clear, professional language that maintains the original tone.`;
        maxTokens = 300;
        break;
      
      case 'bullets':
        systemPrompt = `You are an AI assistant specialized in creating structured bullet-point summaries.
Create a bullet-point summary that breaks down the note content into key points.
Use clear, concise bullet points that highlight the main ideas and important details.
Organize bullets logically and ensure each point captures a distinct concept.
Use sub-bullets for related details when appropriate.
Format as a proper markdown list with bullet points (•) or numbered lists.`;
        maxTokens = 250;
        break;
    }

    // Adjust max tokens based on length preference
    switch (length) {
      case 'short':
        maxTokens = Math.floor(maxTokens * 0.7);
        break;
      case 'long':
        maxTokens = Math.floor(maxTokens * 1.5);
        break;
      // 'medium' uses the default
    }

    // Prepare content for summarization
    const contentToSummarize = `Title: ${note.title}\n\nContent: ${note.content}`;

    // Generate summary using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: contentToSummarize,
        },
      ],
      max_tokens: maxTokens,
      temperature: 0.3, // Lower temperature for more focused summaries
    });

    const summary = completion.choices[0]?.message?.content;
    if (!summary) {
      return NextResponse.json(
        { error: 'Failed to generate summary' },
        { status: 500 }
      );
    }

    const summaryWordCount = getWordCount(summary);
    const compressionRatio = originalWordCount / summaryWordCount;
    
    // Calculate confidence based on compression ratio and token usage
    let confidence = 0.8; // Base confidence
    if (compressionRatio >= 3 && compressionRatio <= 10) {
      confidence = 0.9; // Good compression ratio
    } else if (compressionRatio < 2) {
      confidence = 0.6; // Poor compression
    }

    return NextResponse.json({
      success: true,
      summary: summary.trim(),
      summaryType,
      wordCount: summaryWordCount,
      originalWordCount,
      confidence,
      usage: {
        tokens: completion.usage?.total_tokens || 0,
        model: completion.model,
      },
      generatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error summarizing note:', error);

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Invalid API key configuration for summarization' },
          { status: 500 }
        );
      }
      
      if (error.message.includes('rate_limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded for summarization. Please try again later.' },
          { status: 429 }
        );
      }

      if (error.message.includes('quota')) {
        return NextResponse.json(
          { error: 'API quota exceeded for summarization. Please check your OpenAI account.' },
          { status: 402 }
        );
      }
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid input for summarization', 
          details: error.errors.map(e => e.message).join(', ')
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to summarize note. Please try again.' },
      { status: 500 }
    );
  }
}
