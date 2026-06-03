import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET - List reports (with optional filters)
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const reporterId = searchParams.get('reporterId');

    let query = supabase
      .from('reports')
      .select(`
        *,
        module:modules(*),
        reporter:profiles(*)
      `, { count: 'exact' });

    if (type) query = query.eq('type', type);
    if (priority) query = query.eq('priority', priority);
    if (status) query = query.eq('status', status);
    if (reporterId) query = query.eq('reporter_id', reporterId);

    // Check if user is admin, if not scope to own reports
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin' && !reporterId) {
      query = query.eq('reporter_id', user.id);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      reports: data,
      total: count,
      page,
      pageSize,
      totalPages: count ? Math.ceil(count / pageSize) : 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create a new report (API endpoint)
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.type || !body.priority || !body.description) {
      return NextResponse.json(
        { error: 'title, type, priority, and description are required' },
        { status: 400 }
      );
    }

    const validTypes = ['bug', 'task', 'feature'];
    const validPriorities = ['low', 'medium', 'high', 'critical'];

    if (!validTypes.includes(body.type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    if (!validPriorities.includes(body.priority)) {
      return NextResponse.json({ error: 'Invalid priority' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('reports')
      .insert({
        title: body.title,
        type: body.type,
        priority: body.priority,
        description: body.description,
        module_id: body.moduleId || null,
        reporter_id: user.id,
        attachments: body.attachments || [],
        status: 'open',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ report: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
