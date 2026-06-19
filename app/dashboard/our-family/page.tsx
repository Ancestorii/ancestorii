'use client';

import { useEffect, useState, useCallback } from 'react';
import { getBrowserClient } from '@/lib/supabase/browser';
import OurFamilyHeader from './_components/OurFamilyHeader';
import MemberCard from './_components/MemberCard';
import PendingInviteCard from './_components/PendingInviteCard';
import InviteMemberDrawer from './_components/InviteMemberDrawer';
import MemberDetailDrawer from './_components/MemberDetailDrawer';
import { safeToast as toast } from '@/lib/safeToast';

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
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[13px] uppercase tracking-[0.22em] text-[#9B8E7D]">
          Loading your family...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#17120E]">
      <OurFamilyHeader
        familyName={familyName}
        memberCount={members.length}
        myRole={myRole}
        canInvite={isOwnerOrAdmin}
        onInvite={() => setInviteDrawerOpen(true)}
        onRename={handleRename}
      />

      {/* ── Members section ── */}
      <section className="w-full bg-[#FCFAF7] px-4 sm:px-6 py-10">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#B8924A]">
                Family Members
              </p>
              <h3 className="mt-2 font-serif text-[28px] leading-[1.1] tracking-[-0.03em] text-[#17120E]">
                The people behind{' '}
                <em className="italic text-[#A9782F]">your library</em>
              </h3>
            </div>
            <p className="hidden sm:block text-[14px] text-[#7D6F5F] text-right">
              {members.length} {members.length === 1 ? 'member' : 'members'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {members.map((member) => (
              <MemberCard
                key={member.user_id}
                member={member}
                isCurrentUser={member.user_id === currentUserId}
                onClick={() => setSelectedMember(member)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Pending invites section (owner/admin only) ── */}
      {isOwnerOrAdmin && pendingInvites.length > 0 && (
        <section className="w-full bg-white px-4 sm:px-6 py-10">
          <div className="mx-auto max-w-[1200px]">
            <div className="mb-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#6F6255]">
                Pending Invitations
              </p>
              <h3 className="mt-2 font-serif text-[28px] leading-[1.1] tracking-[-0.03em] text-[#17120E]">
                Waiting to{' '}
                <em className="italic text-[#A9782F]">join</em>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {pendingInvites.map((invite) => (
                <PendingInviteCard
                  key={invite.id}
                  invite={invite}
                  onCancel={() => handleCancelInvite(invite.id)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Proactive CTA for growing the family ── */}
      <section className="w-full bg-white px-4 sm:px-6 py-16">
        <div className="mx-auto max-w-[600px] text-center">
          <h3 className="font-serif text-[24px] leading-[1.2] tracking-[-0.02em] text-[#17120E] mb-3">
            {members.length === 1
              ? <>Every family starts with <em className="italic text-[#A9782F]">one</em></>
              : <>Your library is <em className="italic text-[#A9782F]">growing</em></>
            }
          </h3>
          <p className="text-[15px] leading-[1.8] text-[#6F6255] mb-8">
            {members.length === 1
              ? 'Invite your first family member and start preserving memories together. The more people contributing, the richer your story becomes.'
              : `${members.length} people building one story. Keep inviting the people who shaped your life — every voice makes the library stronger.`
            }
          </p>

          {isOwnerOrAdmin && (
            <button
              onClick={() => setInviteDrawerOpen(true)}
              className="inline-flex items-center justify-center gap-2.5 h-[52px] rounded-[12px] bg-[#C8A557] px-8 text-[14px] font-semibold text-white shadow-[0_8px_20px_rgba(184,146,74,0.2)] transition hover:bg-[#B8924A]"
            >
              Invite a Family Member
            </button>
          )}
        </div>
      </section>

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