import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Assuming the default OpenClaw workspace directory for the user
const WORKSPACE_DIR = '/home/abhishekucs/.openclaw/workspace';

export async function GET() {
  try {
    const soulPath = path.join(WORKSPACE_DIR, 'SOUL.md');
    const userPath = path.join(WORKSPACE_DIR, 'USER.md');
    
    // Read files, fallback to empty string if missing
    let soulContent = '';
    let userContent = '';
    
    try { soulContent = await fs.readFile(soulPath, 'utf8'); } catch (e) { /* ignore */ }
    try { userContent = await fs.readFile(userPath, 'utf8'); } catch (e) { /* ignore */ }

    return NextResponse.json({
      success: true,
      soul: soulContent,
      user: userContent,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { soul, user } = await req.json();

    const soulPath = path.join(WORKSPACE_DIR, 'SOUL.md');
    const userPath = path.join(WORKSPACE_DIR, 'USER.md');

    // Make sure the workspace directory exists
    await fs.mkdir(WORKSPACE_DIR, { recursive: true });

    // Update the files with new content if provided
    if (soul !== undefined) {
      await fs.writeFile(soulPath, soul, 'utf8');
    }
    
    if (user !== undefined) {
      await fs.writeFile(userPath, user, 'utf8');
    }

    return NextResponse.json({ success: true, message: 'Agent configuration updated successfully.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
