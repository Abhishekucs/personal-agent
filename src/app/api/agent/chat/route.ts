import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export async function POST(req: Request) {
  try {
    const { agentId, message } = await req.json();

    if (!agentId || !message) {
      return NextResponse.json({ success: false, error: 'agentId and message are required' }, { status: 400 });
    }

    // Safely escape message for shell
    const escapedMessage = message.replace(/"/g, '\\"').replace(/\$/g, '\\$');

    // Run the OpenClaw agent turn directly via Gateway, specifying the target sub-agent identity
    // Output format is JSON. We use --to to route it to the specific agent ID.
    const command = `openclaw agent --to ${agentId} --message "${escapedMessage}" --json`;
    
    console.log(`Executing: ${command}`);
    const { stdout, stderr } = await execPromise(command);

    let replyText = stdout;
    try {
      // OpenClaw CLI will output a JSON object if successful
      const parsed = JSON.parse(stdout);
      replyText = parsed.response || parsed.text || stdout;
    } catch (e) {
      // Fallback
      if (stdout) replyText = stdout;
    }

    return NextResponse.json({ 
      success: true, 
      reply: replyText.trim()
    });

  } catch (error: any) {
    console.error("Agent chat error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
