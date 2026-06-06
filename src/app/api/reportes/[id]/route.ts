import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { updateReportSchema } from '@/lib/validation';
import { rateLimit } from '@/lib/rate-limit';

// PUT - Update a report
export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit
    const limit = rateLimit(`reports:put:${user.id}`);
    if (limit) return limit;

    const body = await request.json();

    // Validate with Zod
    const parsed = updateReportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { id, ...updatesInput } = parsed.data;

    // Get existing report to verify ownership
    const { data: existing } = await supabase
      .from('appdesk_reports')
      .select('reporter_id')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Check if user is admin or report owner
    const { data: profile } = await supabase
      .from('appdesk_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin' && existing.reporter_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Build update object only with provided fields
    const updates: Record<string, unknown> = {};
    if (updatesInput.title !== undefined) updates.title = updatesInput.title;
    if (updatesInput.type !== undefined) updates.type = updatesInput.type;
    if (updatesInput.priority !== undefined) updates.priority = updatesInput.priority;
    if (updatesInput.description !== undefined) updates.description = updatesInput.description;
    if (updatesInput.moduleId !== undefined) updates.module_id = updatesInput.moduleId || null;
    if (updatesInput.status !== undefined) updates.status = updatesInput.status;

    const { data, error } = await supabase
      .from('appdesk_reports')
      .update(updates)
      .eq('id', id)
      .select(`*, module:appdesk_modules(*), reporter:appdesk_profiles(*)`)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ report: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete a report
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit
    const limit = rateLimit(`reports:delete:${user.id}`);
    if (limit) return limit;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    // Get existing report to verify ownership
    const { data: existing } = await supabase
      .from('appdesk_reports')
      .select('reporter_id')
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    // Check if user is admin or report owner
    const { data: profile } = await supabase
      .from('appdesk_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin' && existing.reporter_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase.from('appdesk_reports').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
