'use client';

import { useEffect, useState, useCallback } from 'react';
import { UserPlus } from 'lucide-react';
import { getBrowserClient } from '@/lib/supabase/browser';
import OurFamilyHeader from './_components/OurFamilyHeader';
import MemberCard from './_components/MemberCard';
import PendingInviteCard from './_components/PendingInviteCard';
import InviteMemberDrawer from './_components/InviteMemberDrawer';
import MemberDetailDrawer from './_components/MemberDetailDrawer';
import { safeToast as toast } from '@/lib/safeToast';
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

  const loadFamily = useCallback(async () => {
    setLoading(true);

    const { data: auth } = await supabase.auth.getUser();
    const uid = auth?.user?.id;
    if (!uid) {
      setLoading(false);
      return;
    }

    setCurrentUserId(uid);

    /* ── Get my membership ── */
    const { data: myMembership } = await supabase
      .from('family_memberships')
      .select('family_id, role')
      .eq('user_id', uid)
      .limit(1)
      .maybeSingle();

    if (!myMembership) {
      setLoading(false);
      return;
    }

    setFamilyId(myMembership.family_id);
    setMyRole(myMembership.role);

    /* ── Family name ── */
    const { data: family } = await supabase
      .from('families')
      .select('name')
      .eq('id', myMembership.family_id)
      .single();

    if (family?.name) setFamilyName(family.name);

    /* ── Verified-family badge: earned the t5 cosmetic reward tier ──
       Show iff a family_reward_claims row exists for this family with
       tier_key 't5'. The claim is a fire-once latch (never retracted), and
       t5 is cosmetic so it stays 'earned' permanently, presence is enough. */
    const { data: t5Claim } = await supabase
      .from('family_reward_claims')
      .select('tier_key')
      .eq('family_id', myMembership.family_id)
      .eq('tier_key', 't5')
      .maybeSingle();

    setIsVerifiedFamily(!!t5Claim);

    /* ── All members with profiles ── */
    const { data: memberships } = await supabase
      .from('family_memberships')
      .select('user_id, role, joined_at')
      .eq('family_id', myMembership.family_id)
      .order('joined_at', { ascending: true });

    if (memberships && memberships.length > 0) {
      const memberDetails = await Promise.all(
        memberships.map(async (m) => {
          const { data: profile } = await supabase
            .from('Profiles')
            .select('full_name, profile_image_url, email, bio')
            .eq('id', m.user_id)
            .maybeSingle();

          let avatarSigned: string | null = null;
          if (profile?.profile_image_url) {
            const { data: signed } = await supabase.storage
              .from('user-media')
              .createSignedUrl(profile.profile_image_url, 3600);
            avatarSigned = signed?.signedUrl
              ? `${signed.signedUrl}&cb=${Date.now()}`
              : null;
          }

          return {
            user_id: m.user_id,
            role: m.role as 'owner' | 'admin' | 'member',
            joined_at: m.joined_at,
            full_name: profile?.full_name ?? null,
            email: profile?.email ?? null,
            profile_image_url: profile?.profile_image_url ?? null,
            avatar_signed: avatarSigned,
            bio: profile?.bio ?? null,
          };
        })
      );

      setMembers(memberDetails);
    }

    /* ── Pending invites (only owner/admin can see) ── */
    if (myMembership.role === 'owner' || myMembership.role === 'admin') {
      const { data: invites } = await supabase
        .from('family_invites')
        .select('id, email, role, invited_by, expires_at, created_at')
        .eq('family_id', myMembership.family_id)
        .is('accepted_at', null)
        .order('created_at', { ascending: false });

      if (invites && invites.length > 0) {
        const enriched = await Promise.all(
          invites.map(async (inv) => {
            const { data: inviterProfile } = await supabase
              .from('Profiles')
              .select('full_name')
              .eq('id', inv.invited_by)
              .maybeSingle();

            return {
              ...inv,
              inviter_name: inviterProfile?.full_name ?? null,
            };
          })
        );
        setPendingInvites(enriched);
      } else {
        setPendingInvites([]);
      }
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    if (!loading && members.length > 0) {
      window.dispatchEvent(new CustomEvent('family-members-updated', { detail: members.length }));
    }
  }, [loading, members]);

  useEffect(() => {
    loadFamily();
  }, [loadFamily]);

  const handleRename = async (newName: string) => {
    if (!familyId) return;

    const { error } = await supabase
      .from('families')
      .update({ name: newName })
      .eq('id', familyId);

    if (error) {
      toast.error('Failed to rename family.');
      return;
    }

    setFamilyName(newName);
    toast.success('Family name updated.');
    window.dispatchEvent(new CustomEvent('family-name-updated', { detail: newName }));
  };

  const handleCancelInvite = async (inviteId: string) => {
    const { error } = await supabase
      .from('family_invites')
      .delete()
      .eq('id', inviteId);

    if (error) {
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
          loadFamily();
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