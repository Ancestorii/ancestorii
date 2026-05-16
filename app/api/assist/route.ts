import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

// Valid assist types — anything not in this list gets rejected
const VALID_TYPES = [
  'loved-one-bio',
  'loved-one-early-years',
  'loved-one-important-moments',
  'loved-one-special-memories',
  'loved-one-who-they-are',
  'loved-one-story-preview',
  'timeline-prompts',
  'timeline-event-description',
  'album-caption',
  'album-description',
  'capsule-message',
  'capsule-description',
  'book-intro',
  'book-chapter-intro',
  'book-page-comment',
  'memory-prompts',
] as const;

type AssistType = (typeof VALID_TYPES)[number];

// Admin client for logging usage (bypasses RLS)
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Ancestorii's voice — warm, gentle, personal
const SYSTEM_PROMPT = `You are a gentle, warm writing assistant embedded in Ancestorii, a family memory preservation platform. Your job is to help people find the words to honour their loved ones' stories.

Rules:
- Write with warmth and emotional sensitivity. These are real people, real memories, real grief and love.
- Keep suggestions short and editable — you are giving a starting point, not a finished piece.
- Never be generic. Use the specific names, dates, and details provided.
- Never mention that you are an AI, a language model, or Claude. You are simply part of the platform.
- Match the tone to the context: celebratory for happy memories, gentle and respectful for loss, curious and encouraging for prompts.
- Use British English spelling (honour, colour, favourite) as the platform is UK-based.
- Do not add emoji or exclamation marks. Keep the tone quiet and sincere.
- You ONLY help with family memory writing. If asked to do anything else — coding, maths, general questions, anything unrelated to preserving family memories — politely decline and say this feature is here to help with their family's stories.`;

function buildPrompt(type: AssistType, context: Record<string, unknown>): string {
  const name = (context.name as string) || 'their loved one';
  const relationship = context.relationship as string;
  const relStr = relationship ? ` (their ${relationship})` : '';

  switch (type) {
    case 'loved-one-bio': {
      const existing = context.existing_text as string;
      if (existing) {
        return `The user has started writing a bio for ${name}${relStr}. Here is what they have so far:\n\n"${existing}"\n\nHelp them continue or improve it. Suggest 2-3 sentences that could follow naturally. Keep their voice and tone.`;
      }
      return `Help the user write an opening for a memorial bio about ${name}${relStr}.${context.born ? ` Born ${context.born}.` : ''}${context.died ? ` Passed ${context.died}.` : ''}\n\nWrite 2-3 warm, heartfelt opening sentences they can edit and make their own. Don't be flowery or clichéd. Write like a loving family member would, not a greeting card.`;
    }

    case 'loved-one-early-years':
    case 'loved-one-important-moments':
    case 'loved-one-special-memories':
    case 'loved-one-who-they-are': {
      const sectionLabels: Record<string, string> = {
        'loved-one-early-years': 'Early Years',
        'loved-one-important-moments': 'Important Moments',
        'loved-one-special-memories': 'Special Memories',
        'loved-one-who-they-are': 'Who They Are',
      };
      const section = sectionLabels[type];
      const existing = context.existing_text as string;

      if (existing) {
        return `The user is writing the "${section}" section for ${name}${relStr}. They have written:\n\n"${existing}"\n\nSuggest 2-3 sentences to continue this naturally.`;
      }
      return `The user wants to write about the "${section}" of ${name}${relStr}.${context.born ? ` Born ${context.born}.` : ''}${context.died ? ` Passed ${context.died}.` : ''}\n\nWrite 2-3 warm opening sentences for this section. Be specific enough to feel personal, but open enough that the user will want to edit and add their own details.`;
    }

    case 'loved-one-story-preview': {
      const bio = context.biography as string;
      return `The user needs a short story preview (2-3 sentences) for ${name}${relStr}. This is a brief summary that appears on their profile card.${bio ? `\n\nTheir full bio reads: "${bio}"` : ''}\n\nWrite a short, warm preview that captures who this person was. Think of it like the first line of a eulogy — personal, not generic.`;
    }

    case 'timeline-prompts': {
      const gapStart = context.gap_start as string;
      const gapEnd = context.gap_end as string;
      const entries = context.existing_entries as string[];

      return `The user is building a timeline for ${name}${relStr}.${gapStart && gapEnd ? ` There is a gap between ${gapStart} and ${gapEnd} with no memories added.` : ''}${entries?.length ? `\n\nExisting memories include: ${entries.join(', ')}` : ''}\n\nGenerate 3 thoughtful, specific questions to help them remember what happened during this period. Make the questions personal and conversational, not generic. Format as a numbered list.`;
    }

    case 'timeline-event-description': {
      const title = context.event_title as string;
      const date = context.event_date as string;

      return `The user added a timeline event called "${title || 'Untitled'}"${date ? ` on ${date}` : ''} for ${name}${relStr}, but the description is empty.\n\nWrite 2-3 sentences as a starting point for describing this event. Be warm and specific to the title.`;
    }

    case 'album-caption': {
      const albumTitle = context.album_title as string;
      const photoDesc = context.photo_description as string;

      return `The user needs a caption for a photo in an album called "${albumTitle || 'Untitled Album'}"${context.loved_one_name ? ` about ${context.loved_one_name}` : ''}.${photoDesc ? ` The photo shows: ${photoDesc}` : ''}\n\nSuggest a short, warm caption (1-2 sentences). It should feel personal, not like a stock photo description.`;
    }

    case 'album-description': {
      const albumTitle = context.album_title as string;
      const mediaCount = context.media_count as number;

      return `The user created an album called "${albumTitle || 'Untitled Album'}"${context.loved_one_name ? ` about ${context.loved_one_name}` : ''}${mediaCount ? ` with ${mediaCount} photos` : ''}.\n\nWrite a short album description (2-3 sentences) that sets the scene for this collection of memories.`;
    }

    case 'capsule-message': {
      const capsuleTitle = context.capsule_title as string;
      const unlockDate = context.unlock_date as string;

      return `The user is writing a message for a time capsule called "${capsuleTitle || 'Untitled Capsule'}"${unlockDate ? ` that will be opened on ${unlockDate}` : ''}.${context.loved_one_name ? ` It is connected to ${context.loved_one_name}.` : ''}\n\nWrite a heartfelt 3-4 sentence message they can use as a starting point. It should feel like a letter to the future — warm, personal, and hopeful.`;
    }

    case 'capsule-description': {
      const capsuleTitle = context.capsule_title as string;

      return `The user created a time capsule called "${capsuleTitle || 'Untitled Capsule'}"${context.loved_one_name ? ` about ${context.loved_one_name}` : ''}.\n\nWrite a short description (1-2 sentences) explaining what this capsule holds and why it matters.`;
    }

    case 'book-intro': {
      const bio = context.biography as string;
      const memoryCount = context.memory_count as number;

      return `The user is creating a Memory Book about ${name}${relStr}.\n\n${bio ? `Bio: ${bio}\n` : ''}${memoryCount ? `The book contains ${memoryCount} memories.\n` : ''}\nWrite a heartfelt introduction paragraph (3-5 sentences) for the opening page of this book. It should feel like the opening of a love letter to this person's life — not formal, not stiff, just genuine. The user will edit it to make it their own.`;
    }

    case 'book-chapter-intro': {
      const chapterTitle = context.chapter_title as string;
      const memories = context.chapter_memories as string[];

      return `The user is writing a chapter called "${chapterTitle || 'Untitled Chapter'}" in a Memory Book about ${name}${relStr}.\n\n${memories?.length ? `Memories in this chapter include: ${memories.join(', ')}\n\n` : ''}Write a brief chapter introduction (2-3 sentences) that sets the scene for this section of the book. Keep it warm and understated.`;
    }

    case 'book-page-comment': {
      const subheading = context.subheading as string;

      return `The user is adding a comment to a Memory Book page${subheading ? ` with the heading "${subheading}"` : ''} in a book about ${name}${relStr}.\n\nWrite a short, warm comment (1-2 sentences) that adds personal context to this page.`;
    }

    case 'memory-prompts': {
      const existingMemories = context.existing_memories as string[];

      return `The user wants to add more memories about ${name}${relStr}.\n\n${existingMemories?.length ? `They have already recorded memories about: ${existingMemories.join(', ')}\n\n` : ''}Suggest 3 specific, personal memory prompts that would help draw out stories they haven't told yet. Avoid generic questions like "what is your favourite memory." Instead, ask about specific moments, sensory details, or everyday routines. Format as a numbered list.`;
    }

    default:
      return 'Help the user with their family memory writing.';
  }
}

// Max tokens per type
function getMaxTokens(type: AssistType): number {
  switch (type) {
    case 'book-intro':
      return 300;
    case 'capsule-message':
      return 250;
    case 'timeline-prompts':
    case 'memory-prompts':
      return 250;
    case 'album-caption':
    case 'capsule-description':
    case 'book-page-comment':
      return 100;
    default:
      return 200;
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await getServerClient();

    // 1. Get authenticated user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // 2. Check if user has writing assistance enabled
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

    // 3. Parse and validate request
    const { type, context, family_id } = await req.json();

    if (!type || !context) {
      return NextResponse.json({ error: 'Missing type or context' }, { status: 400 });
    }

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: 'Invalid assist type' }, { status: 400 });
    }

    // 4. If family_id provided, verify user belongs to that family
    if (family_id) {
      const { data: membership } = await supabase
        .from('family_memberships')
        .select('id')
        .eq('family_id', family_id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!membership) {
        return NextResponse.json(
          { error: 'You do not have access to this family' },
          { status: 403 }
        );
      }
    }

    // 5. Check API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY is not set');
      return NextResponse.json(
        { error: 'Story assistance is temporarily unavailable.' },
        { status: 500 }
      );
    }

    // 6. Build prompt and call Claude
    const userPrompt = buildPrompt(type as AssistType, context);
    const maxTokens = getMaxTokens(type as AssistType);
    const model = 'claude-sonnet-4-6-20250520';
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
        max_tokens: maxTokens,
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

    // 7. Log usage (admin client bypasses RLS)
    const admin = getAdminClient();
    await admin.from('story_assistance_log').insert({
      user_id: user.id,
      family_id: family_id || null,
      assist_type: type,
      model_used: model,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      duration_ms: durationMs,
    });

    // 8. Return the suggestion
    return NextResponse.json({ suggestion, type });
  } catch (err: any) {
    console.error('Story assistance error:', err);
    return NextResponse.json(
      { error: err?.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}