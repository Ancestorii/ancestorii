'use client';

import { useEffect, useState, useCallback } from 'react';
import { UserPlus } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import OurFamilyHeader from './_components/OurFamilyHeader';
import MemberCard from './_components/MemberCard';
import PendingInviteCard from './_components/PendingInviteCard';
import InviteMemberDrawer from './_components/InviteMemberDrawer';
import MemberDetailDrawer from './_components/MemberDetailDrawer';
import FamilyMemories from './_components/FamilyMemories';
import { safeToast as toast } from '@/lib/safeToast';
import { deleteWithOwnerCheck } from '@/lib/deleteWithOwnerCheck';
import { ui, Accent, AppLoader, Btn, SectionHead } from '@/components/dashboard/ui/AppBits';
import s from './_components/family.module.css';

type FamilyMember = {
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  full_name: string | null;
  email: string | null;
  profile_image_url: string | null;
  avatar_signed?: string | null;
  bio?: string | null;
};

type PendingInvite = {
  id: string;
  email: string;
  role: string;
  invited_by: string;
  expires_at: string;
  created_at: string;
  inviter_name?: string | null;
};

type InviteRow = Omit<PendingInvite, 'inviter_name'>;

// Everything this page reads about another person from Profiles.
type ProfileRow = {
  id: string;
  full_name: string | null;
  profile_image_url: string | null;
  email: string | null;
  bio: string | null;
};

type Supabase = ReturnType<typeof getBrowserClient>;

// The family's open invites, newest first (RLS: owners and admins see their family's).
const fetchInvites = (supabase: Supabase, familyId: string) =>
  supabase
    .from('family_invites')
    .select('id, email, role, invited_by, expires_at, created_at')
    .eq('family_id', familyId)
    .is('accepted_at', null)
    .order('created_at', { ascending: false });

const nameInvites = (invites: InviteRow[], names: Map<string, string | null>): PendingInvite[] =>
  invites.map((inv) => ({ ...inv, inviter_name: names.get(inv.invited_by) ?? null }));

export default function OurFamilyPage() {
  const supabase = getBrowserClient();

  const [loading, setLoading] = useState(true);
  const [familyName, setFamilyName] = useState('My Family');
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [isVerifiedFamily, setIsVerifiedFamily] = useState(false);
  const [myRole, setMyRole] = useState<string>('member');
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [inviteDrawerOpen, setInviteDrawerOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Four round trips: membership, then the family's rows side by side, then one Profiles read
  // for everyone, then one signing call for every avatar. The page keeps its content while a
  // later load runs; only the first one shows the loader.
  const loadFamily = useCallback(async () => {
    // The session is already in memory (no network); RLS is the real boundary in the browser.
    const { data: { session } } = await supabase.auth.getSession();
    const uid = session?.user?.id;
    if (!uid) {
      setLoading(false);
      return;
    }

    /* ── 1. My membership ── */
    const { data: myMembership, error: membershipError } = await supabase
      .from('family_memberships')
      .select('family_id, role')
      .eq('user_id', uid)
      .limit(1)
      .maybeSingle();

    if (membershipError) toast.error('Could not load your family.');
    if (!myMembership) {
      setCurrentUserId(uid);
      setLoading(false);
      return;
    }

    const fid: string = myMembership.family_id;
    const canSeeInvites = myMembership.role === 'owner' || myMembership.role === 'admin';

    /* ── 2. Everything that only needs the family id, in parallel ──
       Verified-family badge: earned the t5 cosmetic reward tier. Show iff a
       family_reward_claims row exists for this family with tier_key 't5'. The claim is a
       fire-once latch (never retracted), and t5 is cosmetic so it stays 'earned'
       permanently, presence is enough. Pending invites: only owner/admin can see them. */
    const [familyRes, t5Res, membershipsRes, invitesRes] = await Promise.all([
      supabase.from('families').select('name').eq('id', fid).single(),
      supabase
        .from('family_reward_claims')
        .select('tier_key')
        .eq('family_id', fid)
        .eq('tier_key', 't5')
        .maybeSingle(),
      supabase
        .from('family_memberships')
        .select('user_id, role, joined_at')
        .eq('family_id', fid)
        .order('joined_at', { ascending: true }),
      canSeeInvites ? fetchInvites(supabase, fid) : null,
    ]);

    if (membershipsRes.error) toast.error('Could not load your family members.');
    const memberRows = membershipsRes.data ?? [];
    const inviteRows: InviteRow[] = invitesRes?.data ?? [];

    /* ── 3. One Profiles read for every member and every inviter ── */
    const userIds = Array.from(
      new Set<string>([...memberRows.map((m) => m.user_id), ...inviteRows.map((i) => i.invited_by)])
    );
    const profileById = new Map<string, ProfileRow>();
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('Profiles')
        .select('id, full_name, profile_image_url, email, bio')
        .in('id', userIds);
      for (const p of (profiles ?? []) as ProfileRow[]) profileById.set(p.id, p);
    }

    /* ── 4. One signing call for every avatar (no cache buster: the browser may keep them) ── */
    const avatarPaths = Array.from(
      new Set(
        memberRows
          .map((m) => profileById.get(m.user_id)?.profile_image_url)
          .filter((p): p is string => !!p)
      )
    );
    const signedByPath = new Map<string, string>();
    if (avatarPaths.length > 0) {
      const { data: signed } = await supabase.storage
        .from('user-media')
        .createSignedUrls(avatarPaths, 3600);
      for (const entry of signed ?? []) {
        if (entry.path && entry.signedUrl) signedByPath.set(entry.path, entry.signedUrl);
      }
    }

    const names = new Map<string, string | null>();
    profileById.forEach((p, id) => names.set(id, p.full_name));

    // One render: React batches these after the awaits.
    setCurrentUserId(uid);
    setFamilyId(fid);
    setMyRole(myMembership.role);
    if (familyRes.data?.name) setFamilyName(familyRes.data.name);
    setIsVerifiedFamily(!!t5Res.data);
    setMembers(
      memberRows.map((m) => {
        const profile = profileById.get(m.user_id);
        const path = profile?.profile_image_url ?? null;
        return {
          user_id: m.user_id,
          role: m.role as 'owner' | 'admin' | 'member',
          joined_at: m.joined_at,
          full_name: profile?.full_name ?? null,
          email: profile?.email ?? null,
          profile_image_url: path,
          avatar_signed: path ? signedByPath.get(path) ?? null : null,
          bio: profile?.bio ?? null,
        };
      })
    );
    setPendingInvites(canSeeInvites ? nameInvites(inviteRows, names) : []);
    setLoading(false);
  }, [supabase]);

  // After an invite is sent only the invites change: refresh those, not the whole page.
  const loadInvites = useCallback(async () => {
    if (!familyId) return;
    const { data: invites } = await fetchInvites(supabase, familyId);
    const rows: InviteRow[] = invites ?? [];
    const names = new Map<string, string | null>();
    const inviterIds = Array.from(new Set(rows.map((i) => i.invited_by)));
    if (inviterIds.length > 0) {
      const { data: profiles } = await supabase
        .from('Profiles')
        .select('id, full_name')
        .in('id', inviterIds);
      for (const p of profiles ?? []) names.set(p.id, p.full_name);
    }
    setPendingInvites(nameInvites(rows, names));
  }, [supabase, familyId]);

  useEffect(() => {
    loadFamily();
  }, [loadFamily]);

  const handleRename = async (newName: string) => {
    if (!familyId) return;

    // RLS lets only the owner update the family; a blocked update returns 0 rows, not an error.
    const { data, error } = await supabase
      .from('families')
      .update({ name: newName })
      .eq('id', familyId)
      .select('id');

    if (error || !data || data.length === 0) {
      toast.error('Failed to rename family.');
      return;
    }

    setFamilyName(newName);
    toast.success('Family name updated.');
  };

  const handleCancelInvite = async (inviteId: string) => {
    try {
      // RLS: a blocked delete returns 0 rows without an error, so check what was removed.
      const deleted = await deleteWithOwnerCheck(supabase, 'family_invites', inviteId, 'invite');
      if (!deleted) {
        loadInvites();
        return;
      }
    } catch {
      toast.error('Failed to cancel invite.');
      return;
    }

    setPendingInvites((prev) => prev.filter((i) => i.id !== inviteId));
    toast.success('Invite cancelled.');
  };

  const isOwnerOrAdmin = myRole === 'owner' || myRole === 'admin';

  if (loading) {
    return (
      <div className={ui.page}>
        <AppLoader label="Loading your family" />
      </div>
    );
  }

  return (
    <div className={ui.page}>
      <div className={ui.wrap}>
        <OurFamilyHeader
          familyName={familyName}
          isVerified={isVerifiedFamily}
          memberCount={members.length}
          myRole={myRole}
          canInvite={isOwnerOrAdmin}
          onInvite={() => setInviteDrawerOpen(true)}
          onRename={handleRename}
        />

        {/* ── Memories section: the private feed, first thing after sign-up's first memory ── */}
        {familyId && <FamilyMemories familyId={familyId} />}

        {/* ── Members section ── */}
        <section className={ui.section} aria-labelledby="family-members-title">
          <SectionHead
            id="family-members-title"
            tag="Family Members"
            tagDot="var(--c1)"
            title={
              <>
                The people behind <Accent>your library</Accent>
              </>
            }
            action={
              <span className="hidden sm:block">
                <span className={ui.chip}>
                  {members.length} {members.length === 1 ? 'member' : 'members'}
                </span>
              </span>
            }
          />

          {/* Columns follow the space beside the sidebar: 1 on phones, 2 on tablets, 3 on desktops */}
          <div className="@container">
            <ul role="list" className="grid grid-cols-1 gap-4 @xl:grid-cols-2 @4xl:grid-cols-3">
              {members.map((member) => (
                <li key={member.user_id} className="min-w-0">
                  <MemberCard
                    member={member}
                    isCurrentUser={member.user_id === currentUserId}
                    onClick={() => setSelectedMember(member)}
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Pending invites section (owner/admin only) ── */}
        {isOwnerOrAdmin && pendingInvites.length > 0 && (
          <section className={ui.section} aria-labelledby="family-invites-title">
            <SectionHead
              id="family-invites-title"
              tag="Pending Invitations"
              tagDot="var(--c2)"
              title={
                <>
                  Waiting to <Accent>join</Accent>
                </>
              }
            />

            <div className="@container">
              <ul role="list" className="grid grid-cols-1 gap-4 @xl:grid-cols-2 @4xl:grid-cols-3">
                {pendingInvites.map((invite) => (
                  <li key={invite.id} className="min-w-0">
                    <PendingInviteCard
                      invite={invite}
                      onCancel={() => handleCancelInvite(invite.id)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ── Proactive CTA for growing the family: the page's one ink card ── */}
        <section className={ui.section} aria-labelledby="family-cta-title">
          <div className={`${ui.inkCard} ${s.cta}`}>
            <span className={ui.dotPink} aria-hidden="true" />
            <span className={ui.dotBlue} aria-hidden="true" />

            <div className={s.ctaInner}>
              <h2 id="family-cta-title" className={s.ctaTitle}>
                {members.length === 1
                  ? <>Every family starts with <Accent>one</Accent></>
                  : <>Your library is <Accent>growing</Accent></>
                }
              </h2>
              <p className={s.ctaText}>
                {members.length === 1
                  ? 'Invite your first family member and start preserving memories together. The more people contributing, the richer your story becomes.'
                  : `${members.length} people building one story. Keep inviting the people who shaped your life. Every voice makes the library stronger.`
                }
              </p>

              {isOwnerOrAdmin && (
                <Btn
                  variant="light"
                  onClick={() => setInviteDrawerOpen(true)}
                  aria-haspopup="dialog"
                  icon={<UserPlus size={18} strokeWidth={2.4} aria-hidden="true" />}
                  className={s.ctaBtn}
                >
                  Invite a Family Member
                </Btn>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* ── Invite drawer ── */}
      <InviteMemberDrawer
        open={inviteDrawerOpen}
        onClose={() => setInviteDrawerOpen(false)}
        onInviteSent={() => {
          loadInvites();
          setInviteDrawerOpen(false);
        }}
      />

      {/* ── Member detail drawer ── */}
      <MemberDetailDrawer
        member={selectedMember}
        open={!!selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </div>
  );
}
