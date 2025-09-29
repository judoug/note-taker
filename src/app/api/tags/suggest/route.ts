import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { OpenAI } from 'openai';
import { z } from 'zod';
import { env } from '@/lib/env-validation';

// Input validation schema
const suggestTagsSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  content: z.string().min(10, 'Content must be at least 10 characters').max(5000, 'Content too long'),
  existingTags: z.array(z.string()).optional().default([]),
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
  timeout: 15000, // 15 second timeout for tag suggestions
  maxRetries: 1,
});

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Additional security: Check request size
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 8192) { // 8KB limit
      return NextResponse.json(
        { error: 'Request too large' },
        { status: 413 }
      );
    }

    // Parse and validate request body
    let body;
    try {
      const text = await request.text();
      if (text.length > 6144) { // 6KB limit for JSON
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
    const { title, content, existingTags } = suggestTagsSchema.parse(body);

    // Create system prompt for tag suggestions
    const systemPrompt = `You are an AI assistant that suggests relevant tags for notes to help with organization and searchability.

Guidelines for tag suggestions:
- Suggest 3-8 relevant tags based on the note's title and content
- Focus on key topics, categories, concepts, and themes
- Use concise, descriptive tags (1-3 words each)
- Prefer commonly used terms over overly specific ones
- Consider both explicit topics and implicit themes
- Include subject matter, content type, and context when relevant
- Avoid tags that are too generic (like "note" or "text")
- Avoid duplicating existing tags unless they're highly relevant

Examples of good tags:
- "machine learning", "productivity", "meeting notes", "travel planning"
- "javascript", "tutorial", "personal", "work", "ideas", "research"
- "health", "finance", "project management", "creative writing"

Respond with a JSON object containing an array of suggested tags:
{"tags": ["tag1", "tag2", "tag3"]}`;

    const userPrompt = `Title: ${title}

Content: ${content}

${existingTags.length > 0 ? `Existing tags: ${existingTags.join(', ')}` : ''}

Please suggest relevant tags for this note.`;

    // Generate tag suggestions using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      max_tokens: 200, // Sufficient for tag suggestions
      temperature: 0.3, // Lower temperature for more consistent suggestions
      response_format: { type: "json_object" },
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      return NextResponse.json(
        { error: 'Failed to generate tag suggestions' },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let tagData;
    try {
      tagData = JSON.parse(response);
    } catch (parseError) {
      console.error('Failed to parse OpenAI tag response:', parseError);
      return NextResponse.json(
        { error: 'Invalid response format from AI' },
        { status: 500 }
      );
    }

    // Validate response structure and clean tags
    if (!tagData.tags || !Array.isArray(tagData.tags)) {
      return NextResponse.json(
        { error: 'Incomplete response from AI' },
        { status: 500 }
      );
    }

    // Clean and filter suggested tags
    const suggestedTags = tagData.tags
      .filter((tag: unknown): tag is string => typeof tag === 'string')
      .map((tag: string) => tag.trim().toLowerCase())
      .filter((tag: string) => {
        // Filter out empty, too long, or existing tags
        return (
          tag.length > 0 && 
          tag.length <= 50 && 
          !existingTags.some(existing => existing.toLowerCase() === tag)
        );
      })
      .slice(0, 8); // Limit to 8 suggestions

    // Log tag suggestion for monitoring
    console.log(`AI tag suggestions for user ${user.id}: ${suggestedTags.join(', ')}`);

    // Return the suggested tags
    return NextResponse.json({
      success: true,
      suggestions: suggestedTags,
      usage: {
        tokens: completion.usage?.total_tokens || 0,
        model: completion.model,
      },
    });

  } catch (error) {
    console.error('Error generating tag suggestions:', error);

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
      { error: 'Failed to generate tag suggestions. Please try again.' },
      { status: 500 }
    );
  }
}
