import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const apiKey = process.env.KICKBOX_API_KEY;
    if (!apiKey) {
      // Fail open — don't block signups if env var is missing
      return NextResponse.json({ result: 'unknown', allow: true });
    }

    const url = `https://api.kickbox.com/v2/verify?email=${encodeURIComponent(
      email
    )}&apikey=${apiKey}`;

    const res = await fetch(url, {
      method: 'GET',
      // Kickbox can be slow on dodgy mailservers — cap it
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      // Kickbox down — fail open, let signup proceed
      return NextResponse.json({ result: 'unknown', allow: true });
    }

    const data = await res.json();

    // Decision logic
    const allow = data.result !== 'undeliverable';

    return NextResponse.json({
      result: data.result,
      reason: data.reason,
      did_you_mean: data.did_you_mean,
      disposable: data.disposable,
      allow,
    });
  } catch (err) {
    // Network error / timeout — fail open
    return NextResponse.json({ result: 'unknown', allow: true });
  }
}