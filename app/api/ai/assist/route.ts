import { NextRequest, NextResponse } from 'next/server';
import { getServerClient } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

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
  'album-voice-note',
  'capsule-message',
  'capsule-description',
  'capsule-voice-note',
  'book-intro',
  'book-chapter-intro',
  'book-page-comment',
  'memory-prompts',
] as const;

type AssistType = (typeof VALID_TYPES)[number];

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const SYSTEM_PROMPT = `You are a warm, emotionally intelligent writing companion embedded in Ancestorii, a family memory preservation platform. You help people remember and write about their loved ones.

Critical rules:
- NEVER add any preamble, introduction, or meta-commentary. No "Here is a suggestion" or "Here's something to get you started" or "Here are some prompts." Just write the content directly, starting with the first question.
- NEVER use markdown formatting. No ---, no *asterisks*, no **bold**, no headers, no bullet points, no numbered lists.
- NEVER mention that you are AI, a language model, or Claude. You are simply part of the platform.
- Use the specific names, dates, and details provided. Never be generic.
- Write with warmth and emotional depth. These are real people, real memories, real grief and love.
- Use British English spelling (honour, colour, favourite).
- Do not add emoji or exclamation marks. Keep the tone quiet, sincere, and compelling.
- You ONLY help with family memory writing. If asked anything else, politely decline.`;

function buildPrompt(type: AssistType, context: Record<string, unknown>): string {
  const name = (context.name as string) || 'their loved one';
  const relationship = context.relationship as string;
  const relStr = relationship ? ` (their ${relationship})` : '';

  switch (type) {
    case 'loved-one-bio': {
      const existing = context.existing_text as string;
      if (existing) {
        return `The user has started writing a bio for ${name}${relStr}. Here is what they have so far:\n\n"${existing}"\n\nContinue this naturally with 3-4 more sentences that deepen the portrait. Match their voice and tone.`;
      }
      return `Write a warm, detailed opening for a biography about ${name}${relStr}.${context.born ? ` Born ${context.born}.` : ''}${context.died ? ` Passed ${context.died}.` : ''}\n\nWrite 4-5 sentences that feel like the opening paragraph of a loving biography. Paint a picture of who this person was — not just facts, but the feeling of being around them. The user will edit this and make it their own.`;
    }

    case 'loved-one-early-years': {
      const existing = context.existing_text as string;
      if (existing) {
        return `The user is writing about the early years of ${name}${relStr}. They have written:\n\n"${existing}"\n\nContinue with 3-4 rich sentences that draw out more childhood details naturally.`;
      }
      return `Write structured prompts to help someone write about the early years of ${name}${relStr}.${context.born ? ` Born ${context.born}.` : ''}${context.died ? ` Passed ${context.died}.` : ''}

Format your response EXACTLY like this pattern — a question on its own line, then a short paragraph beneath it, then a blank line before the next question. Give 4-5 sections following this pattern.

Example of the format:
What was home like?

A short evocative paragraph here that paints a picture and gently prompts them to fill in their own details.

Next question here?

Another short paragraph.

Now write the real ones. Focus on: where they grew up, what school was like, childhood friends, family routines, favourite foods, mischief, Sunday mornings, the sounds and smells of their childhood home. Each paragraph should be 2-3 sentences maximum. Make every question personal to ${name} using their name directly.`;
    }

    case 'loved-one-important-moments': {
      const existing = context.existing_text as string;
      if (existing) {
        return `The user is writing about important moments in the life of ${name}${relStr}. They have written:\n\n"${existing}"\n\nContinue with 3-4 rich sentences that explore more milestones naturally.`;
      }
      return `Write structured prompts to help someone write about the important moments in the life of ${name}${relStr}.${context.born ? ` Born ${context.born}.` : ''}${context.died ? ` Passed ${context.died}.` : ''}

Format your response EXACTLY like this pattern — a question on its own line, then a short paragraph beneath it, then a blank line before the next question. Give 4-5 sections.

Focus on: leaving home, first job, falling in love, becoming a parent, biggest achievement, hardest loss, proudest day, the decision that changed everything. Each paragraph should be 2-3 sentences maximum. Make every question personal to ${name} using their name directly.`;
    }

    case 'loved-one-special-memories': {
      const existing = context.existing_text as string;
      if (existing) {
        return `The user is writing about special memories of ${name}${relStr}. They have written:\n\n"${existing}"\n\nContinue with 3-4 rich sentences that draw out more moments naturally.`;
      }
      return `Write structured prompts to help someone write about special memories of ${name}${relStr}.${context.born ? ` Born ${context.born}.` : ''}${context.died ? ` Passed ${context.died}.` : ''}

Format your response EXACTLY like this pattern — a question on its own line, then a short paragraph beneath it, then a blank line before the next question. Give 4-5 sections.

Focus on: holidays that went wrong but became the best stories, family traditions, a meal they always cooked, a song that was always playing, a rainy afternoon that meant everything, the ordinary moments that turned out to be extraordinary, what you wish you had filmed. Each paragraph should be 2-3 sentences maximum. Make every question personal to ${name} using their name directly.`;
    }

    case 'loved-one-who-they-are': {
      const existing = context.existing_text as string;
      if (existing) {
        return `The user is writing about who ${name}${relStr} really is as a person. They have written:\n\n"${existing}"\n\nContinue with 3-4 rich sentences that deepen the portrait naturally.`;
      }
      return `Write structured prompts to help someone describe who ${name}${relStr} really is as a person.${context.born ? ` Born ${context.born}.` : ''}${context.died ? ` Passed ${context.died}.` : ''}

Format your response EXACTLY like this pattern — a question on its own line, then a short paragraph beneath it, then a blank line before the next question. Give 4-5 sections.

Focus on: how they carried themselves, their laugh, their stubbornness, what they always said, how they answered the phone, what drove them mad, what made them different from everyone else, how you would describe them to a stranger, what small habit was uniquely them. Each paragraph should be 2-3 sentences maximum. Make every question personal to ${name} using their name directly.`;
    }

    case 'loved-one-story-preview': {
      const bio = context.biography as string;
      return `Write a compelling 3-4 sentence preview for ${name}${relStr}. This appears on their profile card and should make someone want to read more.${bio ? `\n\nTheir bio reads: "${bio}"` : ''}\n\nCapture the essence of who this person is in a way that feels personal and warm, not like a summary.`;
    }

    case 'timeline-prompts': {
      const gapStart = context.gap_start as string;
      const gapEnd = context.gap_end as string;
      const entries = context.existing_entries as string[];

      return `The user is building a timeline for ${name}${relStr}.${gapStart && gapEnd ? ` There is a gap between ${gapStart} and ${gapEnd} with no memories added.` : ''}${entries?.length ? `\n\nExisting memories include: ${entries.join(', ')}` : ''}\n\nWrite structured prompts using the question-then-paragraph format. Give 5 sections. Each question should be vivid and personal, referencing real life details like jobs, homes, relationships, holidays, health, milestones. Each paragraph should be 2-3 sentences maximum.`;
    }

    case 'timeline-event-description': {
      const title = context.event_title as string;
      const date = context.event_date as string;

      return `The user added a timeline event called "${title || 'Untitled'}"${date ? ` on ${date}` : ''} for ${name}${relStr}, but the description is empty.

Write structured prompts to help them describe this event using the question-then-paragraph format. Give 3-4 sections.

Format your response EXACTLY like this pattern — a question on its own line, then a short paragraph beneath it, then a blank line before the next question.

Each question should be specific to "${title || 'this event'}"${date ? ` and the date ${date}` : ''}. Ask about: what led up to it, what the moment itself felt like, who was there, and what changed afterwards. Each paragraph should be 2-3 sentences maximum. Make every question personal to ${name} using their name directly.`;
    }

    case 'album-caption': {
      const albumTitle = context.album_title as string;

      return `Write 4 different warm photo captions for photos in an album called "${albumTitle || 'Untitled Album'}"${context.loved_one_name ? ` about ${context.loved_one_name}` : ''}.

Each caption should be 1-2 sentences. Format as a question header followed by the caption underneath, separated by blank lines.

Make each one different in tone: one nostalgic, one playful, one tender, one simple. They should feel like something a family member would write on the back of a printed photo. Use ${context.loved_one_name || 'their'} name directly.`;
    }

    case 'album-description': {
      const albumTitle = context.album_title as string;
      const mediaCount = context.media_count as number;

      return `Write a warm album description (4-5 sentences) for an album called "${albumTitle || 'Untitled Album'}"${context.loved_one_name ? ` about ${context.loved_one_name}` : ''}${mediaCount ? ` with ${mediaCount} photos` : ''}.\n\nSet the scene for this collection. What feeling do these photos hold? What would someone looking through this album experience?`;
    }
    case 'album-voice-note': {
      const albumTitle = context.album_title as string;

      return `The user wants to record a voice note for their album called "${albumTitle || 'Untitled Album'}"${context.loved_one_name ? ` about ${context.loved_one_name}` : ''} but doesn't know what to say.

Write 4 different voice note prompts. Each one should be a question header followed by a short paragraph explaining what they could talk about in that recording.

Focus on: describing what was happening that day, telling the story behind a specific photo, sharing something the camera didn't capture, leaving a message for someone who will listen to this one day. Each suggestion should feel like a gentle nudge to press record and just start talking. Use ${context.loved_one_name || 'their'} name directly.`;
    }

    case 'capsule-message': {
      const capsuleTitle = context.capsule_title as string;
      const unlockDate = context.unlock_date as string;

      return `Write a heartfelt time capsule message (two paragraphs) for a capsule called "${capsuleTitle || 'Untitled Capsule'}"${unlockDate ? ` that will be opened on ${unlockDate}` : ''}.${context.loved_one_name ? ` It is connected to ${context.loved_one_name}.` : ''}\n\nThe first paragraph should capture the present moment — what matters right now, what you want to freeze in time. The second paragraph should speak to the future — hopes, dreams, what you want the reader to know when they open this.`;
    }

    case 'capsule-description': {
      const capsuleTitle = context.capsule_title as string;

      return `Write a warm description (2-3 sentences) for a time capsule called "${capsuleTitle || 'Untitled Capsule'}"${context.loved_one_name ? ` about ${context.loved_one_name}` : ''}.\n\nExplain what this capsule holds and why it matters, in a way that makes someone curious to open it.`;
    }

    case 'capsule-voice-note': {
      const capsuleTitle = context.capsule_title as string;
      const unlockDate = context.unlock_date as string;

      return `The user wants to record a voice note for a time capsule called "${capsuleTitle || 'Untitled Capsule'}"${unlockDate ? ` that will be opened on ${unlockDate}` : ''}.${context.loved_one_name ? ` It is connected to ${context.loved_one_name}.` : ''}

Write 4 different voice note prompts. Each one should be a question header followed by a short paragraph explaining what they could say in that recording.

Focus on: describing what life is like right now, sharing a message to the person who will open this, telling a story they never want forgotten, recording a promise or a wish for the future. Each suggestion should feel like a reason to press record and speak from the heart. This is a message that will be heard in the future — make it feel like that matters.`;
    }

    case 'book-intro': {
      const bio = context.biography as string;
      const memoryCount = context.memory_count as number;

      return `Write a heartfelt book introduction (two paragraphs) for a Memory Book about ${name}${relStr}.\n\n${bio ? `Bio: ${bio}\n` : ''}${memoryCount ? `The book contains ${memoryCount} memories.\n` : ''}\nThe first paragraph should feel like opening a love letter to this person's life. The second paragraph should acknowledge that no book can hold everything, but this one tries. It should make the reader feel honoured to hold it.`;
    }

    case 'book-chapter-intro': {
      const chapterTitle = context.chapter_title as string;
      const memories = context.chapter_memories as string[];

      return `Write a chapter introduction for a chapter called "${chapterTitle || 'Untitled Chapter'}" in a Memory Book about ${name}${relStr}.\n\n${memories?.length ? `Memories in this chapter include: ${memories.join(', ')}\n\n` : ''}Write two short paragraphs separated by a blank line.

The first paragraph should set the scene for this section of the book — where we are in ${name}'s story and what this chapter holds.

The second paragraph should feel like a pause before turning the page — warm, understated, and full of anticipation. Each paragraph should be 2-3 sentences maximum.`;
    }

    case 'book-page-comment': {
      const subheading = context.subheading as string;

      return `Write a warm, personal comment (3-4 sentences) for a Memory Book page${subheading ? ` with the heading "${subheading}"` : ''} in a book about ${name}${relStr}.\n\nThis sits beneath a photo or memory. It should add context, emotion, or a small detail that makes the page feel alive.`;
    }

    case 'memory-prompts': {
      const existingMemories = context.existing_memories as string[];

      return `The user wants to add more memories about ${name}${relStr}.\n\n${existingMemories?.length ? `They have already recorded memories about: ${existingMemories.join(', ')}\n\n` : ''}Write structured prompts using the question-then-paragraph format. Give 5 sections. Each question should be vivid and specific: ask about sounds, smells, routines, places, people, seasons, food, music, arguments, laughter, quiet moments. Each paragraph should be 2-3 sentences maximum. Make every question personal to ${name} using their name directly.`;
    }

    default:
      return 'Help the user with their family memory writing.';
  }
}

function getMaxTokens(type: AssistType): number {
  switch (type) {
    case 'loved-one-early-years':
    case 'loved-one-important-moments':
    case 'loved-one-special-memories':
    case 'loved-one-who-they-are':
      return 600;
    case 'loved-one-bio':
    case 'book-intro':
    case 'capsule-message':
      return 500;
    case 'timeline-prompts':
    case 'memory-prompts':
      return 500;
    case 'loved-one-story-preview':
    case 'timeline-event-description':
    case 'album-description':
    case 'album-voice-note':
    case 'capsule-voice-note':
    case 'book-chapter-intro':
    case 'book-page-comment':
      return 350;
    case 'album-caption':
    case 'capsule-description':
      return 200;
    default:
      return 400;
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

    const { type, context, family_id } = await req.json();

    if (!type || !context) {
      return NextResponse.json({ error: 'Missing type or context' }, { status: 400 });
    }

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: 'Invalid assist type' }, { status: 400 });
    }

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

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY is not set');
      return NextResponse.json(
        { error: 'Story assistance is temporarily unavailable.' },
        { status: 500 }
      );
    }

    const userPrompt = buildPrompt(type as AssistType, context);
    const maxTokens = getMaxTokens(type as AssistType);
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

    return NextResponse.json({ suggestion, type });
  } catch (err: any) {
    console.error('Story assistance error:', err);
    return NextResponse.json(
      { error: err?.message || 'Something went wrong' },
      { status: 500 }
    );
  }
}