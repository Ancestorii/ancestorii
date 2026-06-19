import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import AnswerForm from './_components/AnswerForm';
import Link from 'next/link';

export default async function AnswerPage(props: {
  params: Promise<{ token: string }>;
}) {
  const params = await props.params;
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: sentPrompt } = await supabaseAdmin
    .from('sent_prompts')
    .select(
      'id, family_id, sender_id, recipient_name, prompt_id, custom_question, parent_memory_id, status, expires_at, invite_id'
    )
    .eq('token', params.token)
    .single();

  if (!sentPrompt) return notFound();

  if (
    sentPrompt.expires_at &&
    new Date(sentPrompt.expires_at) < new Date()
  ) {
    return (
      <Message
        title="This link has expired."
        body="Ask the person who sent this to send you a new question."
      />
    );
  }

  if (sentPrompt.status === 'answered') {
    return (
      <Message
        title="This question has already been answered."
        body="The memory has been added to the family library."
      />
    );
  }

  // Get question text
  let question = sentPrompt.custom_question || '';
  if (sentPrompt.prompt_id && !question) {
    const { data: promptData } = await supabaseAdmin
      .from('memory_prompts')
      .select('question')
      .eq('id', sentPrompt.prompt_id)
      .single();
    question = promptData?.question || '';
  }

  // Get sender name
  const { data: senderProfile } = await supabaseAdmin
    .from('Profiles')
    .select('full_name')
    .eq('id', sentPrompt.sender_id)
    .single();

  // Get family name
  const { data: family } = await supabaseAdmin
    .from('families')
    .select('name')
    .eq('id', sentPrompt.family_id)
    .single();

  // Get invite token (for recipient signup)
  let inviteToken: string | null = null;
  if (sentPrompt.invite_id) {
    const { data: invite } = await supabaseAdmin
      .from('family_invites')
      .select('token')
      .eq('id', sentPrompt.invite_id)
      .single();
    inviteToken = invite?.token?.toString() || null;
  }

  // Get parent memory if this is an "add your memory" prompt
  let parentMemory: {
    title: string;
    body: string;
    photo_url: string | null;
  } | null = null;

  if (sentPrompt.parent_memory_id) {
    const { data: mem } = await supabaseAdmin
      .from('family_memories')
      .select('title, body')
      .eq('id', sentPrompt.parent_memory_id)
      .single();

    if (mem) {
      const { data: media } = await supabaseAdmin
        .from('family_memory_media')
        .select('file_path')
        .eq('memory_id', sentPrompt.parent_memory_id)
        .eq('file_type', 'image')
        .order('display_order')
        .limit(1)
        .single();

      let photoUrl = null;
      if (media) {
        const { data: urlData } = await supabaseAdmin.storage
          .from('memory-media')
          .createSignedUrl(media.file_path, 3600);
        photoUrl = urlData?.signedUrl || null;
      }

      parentMemory = {
        title: mem.title,
        body: mem.body,
        photo_url: photoUrl,
      };
    }
  }

  return (
    <AnswerForm
      token={params.token}
      question={question}
      senderName={senderProfile?.full_name || 'Someone'}
      senderId={sentPrompt.sender_id}
      familyName={family?.name || 'a family'}
      recipientName={sentPrompt.recipient_name}
      parentMemory={parentMemory}
      sentPromptId={sentPrompt.id}
      familyId={sentPrompt.family_id}
      promptId={sentPrompt.prompt_id}
      parentMemoryId={sentPrompt.parent_memory_id}
      inviteToken={inviteToken}
    />
  );
}

function Message({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 bg-[#FFFDF8]"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <Link
        href="/"
        className="inline-block text-[34px] tracking-[-0.03em] text-[#181512] no-underline mb-8"
        style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 700,
        }}
      >
        Ancestor<span className="text-[#C8A557]">ii</span>
      </Link>
      <h2
        className="text-[24px] text-[#181512] mb-2 text-center"
        style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 600,
        }}
      >
        {title}
      </h2>
      <p className="text-[14px] text-[#8A7F72] text-center max-w-[360px]">
        {body}
      </p>
    </div>
  );
}