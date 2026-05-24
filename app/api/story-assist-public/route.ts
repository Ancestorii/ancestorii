import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

const VALID_TYPES = [
  'story-opening',
  'story-feeling',
  'story-closing',
] as const;

type AssistType = (typeof VALID_TYPES)[number];

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const SYSTEM_PROMPT = `You are a warm, emotionally intelligent writing companion embedded in Ancestorii, a family memory preservation platform. You help people write stories about their family memories for a public feed called "Our Stories".

Critical rules:
- NEVER add any preamble, introduction, or meta-commentary. No "Here is a suggestion" or "Here's something to get you started" or "Here are some prompts." Just write the content directly, starting with the first question.
- NEVER use markdown formatting. No ---, no *asterisks*, no **bold**, no headers, no bullet points, no numbered lists.
- NEVER mention that you are AI, a language model, or Claude. You are simply part of the platform.
- Use any specific details the user has provided (title, category, existing text). Never be generic.
- Write with warmth and emotional depth. These are real memories from real people.
- Use British English spelling (honour, colour, favourite).
- Do not add emoji or exclamation marks. Keep the tone quiet, sincere, and compelling.
- You ONLY help with family memory writing. If asked anything else, politely decline.`;

function buildPrompt(type: AssistType, context: Record<string, unknown>): string {
  const title = (context.title as string) || '';
  const category = (context.category as string) || '';
  const excerpt = (context.excerpt as string) || '';
  const existingBody = (context.existing_body as string) || '';

  const contextBlock = [
    title && `Title: "${title}"`,
    category && `Category: ${category}`,
    excerpt && `Preview line: "${excerpt}"`,
    existingBody && `What they've written so far:\n"${existingBody}"`,
  ].filter(Boolean).join('\n');

  switch (type) {
    case 'story-opening':
      return `The user wants to write a story for the public feed but is stuck on how to start. Help them find their opening by asking questions that unlock the memory.

${contextBlock}

Write structured prompts using this EXACT format — a question on its own line, then a short paragraph beneath it (1-2 sentences max), then a blank line before the next question. Give 3-4 sections.

Focus on: where were they when this happened, who else was there, what time of day was it, what was the weather like, what were they doing just before this moment started. Every question should use details from the title and category to be specific, not generic. The short paragraphs beneath should be evocative nudges, not instructions — paint a tiny picture that makes them go "yes, that's it."

Do NOT write the story for them. Ask the questions that make them want to write it themselves.`;

    case 'story-feeling':
      return `The user is writing a story for the public feed and has some content down, but the emotional core is missing. Help them find it by asking questions that go deeper.

${contextBlock}

Write structured prompts using this EXACT format — a question on its own line, then a short paragraph beneath it (1-2 sentences max), then a blank line before the next question. Give 3-4 sections.

Focus on: what they didn't say out loud in that moment, what they only understood years later, what sound or smell takes them straight back, who they wish had been there, what would be lost if this memory disappeared. Each question should be personal to their specific story using the title and any text they've already written. The short paragraphs beneath should be honest and quiet, not sentimental.

Do NOT write the story for them. Ask the questions that make the feeling surface.`;

    case 'story-closing':
      return `The user is writing a story for the public feed and needs help finding the ending. Not a summary — a landing. Help them find it by asking questions.

${contextBlock}

Write structured prompts using this EXACT format — a question on its own line, then a short paragraph beneath it (1-2 sentences max), then a blank line before the next question. Give 3 sections.

Focus on: where are the people in this story now, what small detail from this memory do they still carry with them, if they could go back to that moment what would they notice that they missed the first time. Each question should be specific to their story. The paragraphs beneath should feel like a quiet pause, not a writing exercise.

Do NOT write the story for them. Ask the questions that help them land it.`;

    default:
      return 'Help the user write their family memory.';
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await getServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('Profiles')
      .select('writing_assistance_enabled')
      .eq('id', user.id)
      .single();

    if (!profile?.writing_assistance_enabled) {
      return NextResponse.json(
        { error: 'Story assistance is turned off. You can enable it in Settings.' },
        { status: 403 }
      );
    }

    const { type, context } = await req.json();

    if (!type || !context) {
      return NextResponse.json({ error: 'Missing type or context' }, { status: 400 });
    }

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: 'Invalid assist type' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY is not set');
      return NextResponse.json(
        { error: 'Story assistance is temporarily unavailable.' },
        { status: 500 }
      );
    }

    const userPrompt = buildPrompt(type as AssistType, context);
    const model = 'claude-sonnet-4-6';
    const startTime = Date.now();

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 350,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    });

    const durationMs = Date.now() - startTime;

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Claude API error:', response.status, errorData);

      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Story assistance is busy. Please try again in a moment.' },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: 'Story assistance is temporarily unavailable.' },
        { status: 500 }
      );
    }

    const data = await response.json();

    const suggestion = data.content
      ?.filter((block: any) => block.type === 'text')
      .map((block: any) => block.text)
      .join('\n') || '';

    const inputTokens = data.usage?.input_tokens || null;
    const outputTokens = data.usage?.output_tokens || null;

    const admin = getAdminClient();
    await admin.from('story_assistance_log').insert({
      user_id: user.id,
      family_id: null,
      assist_type: type,
      model_used: model,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      duration_ms: durationMs,
    });

    return NextResponse.json({ suggestion, type });
  } catch (err: any) {
    console.error('Public story assistance error:', err);
    return NextResponse.json(
      { error: err?.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}