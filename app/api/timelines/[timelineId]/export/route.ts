import { exportTimelinePdf } from '../../../../dashboard/timeline/_actions/exportTimelinePdf';
import { getServiceClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function GET(
  req: Request,
  context: { params: Promise<{ timelineId: string }> }
) {
  try {
    const supabase = getServiceClient();

    const { timelineId } = await context.params;
    if (!timelineId) {
      return new Response('Missing timeline id', { status: 400 });
    }

    // Detect preview mode (?preview=true)
    const url = new URL(req.url);
    const isPreview = url.searchParams.get('preview') === 'true';

    const { bytes, filename } = await exportTimelinePdf(supabase, {
      timelineId,
    });

    return new Response(Buffer.from(bytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': isPreview
          ? 'inline'
          : `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    console.error('[TIMELINE_PDF_EXPORT]', err);
    return new Response(
      err?.message || 'Failed to export timeline',
      { status: 500 }
    );
  }
}
