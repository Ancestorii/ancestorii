import { safeToast as toast } from '@/lib/safeToast';

/**
 * Attempts to delete a row and checks whether RLS actually allowed it.
 * If the delete was silently blocked (creator_delete policy), shows a
 * user-friendly error instead of pretending it worked.
 *
 * @returns true if the row was actually deleted, false if blocked.
 */
export async function deleteWithOwnerCheck(
  supabase: any,
  table: string,
  id: string,
  label: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from(table)
    .delete()
    .eq('id', id)
    .select();

  if (error) throw error;

  if (!data || data.length === 0) {
    toast.error(`Only the person who created this ${label} can delete it.`);
    return false;
  }

  return true;
}