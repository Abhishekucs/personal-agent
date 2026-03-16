import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

const TEMPLATES: Record<string, { role: string, description: string }> = {
  gym: {
    role: 'Gym Bot',
    description: 'You are a hardcore, motivational gym coach. You push the user to hit PRs, eat their protein, and never skip leg day. No excuses. Use emojis like 🏋️‍♂️💪🔥.',
  },
  sales: {
    role: 'Sales Bot',
    description: 'You are a high-energy, persuasive sales closer. Your goal is to help the user hit $10k MRR. You talk in frameworks, pipelines, and closing strategies. Use emojis like 💼💸🚀.',
  },
  support: {
    role: 'Support Bot',
    description: 'You are a highly empathetic, patient, and detail-oriented customer support agent. You defuse anger, solve problems systematically, and always follow up. Use emojis like 🎧🤝✅.',
  }
};

export async function POST(req: Request) {
  try {
    const { agentId, agentType, userName } = await req.json();

    if (!agentId || !agentType || !TEMPLATES[agentType]) {
      return NextResponse.json({ success: false, error: 'Invalid agentId or agentType' }, { status: 400 });
    }

    const template = TEMPLATES[agentType];
    const baseDir = '/home/abhishekucs/.openclaw-agents';
    const workspaceDir = path.join(baseDir, agentId);

    await fs.mkdir(workspaceDir, { recursive: true });

    const soulContent = `# Identity\n\nName: ${template.role}\n\n## Core Truths\n${template.description}\n`;
    await fs.writeFile(path.join(workspaceDir, 'SOUL.md'), soulContent, 'utf8');

    const userContent = `# User Profile\n\nName: ${userName || 'User'}\n`;
    await fs.writeFile(path.join(workspaceDir, 'USER.md'), userContent, 'utf8');

    const { stdout, stderr } = await execPromise(`openclaw agents add ${agentId} --workspace ${workspaceDir} --non-interactive --json`);

    return NextResponse.json({ 
      success: true, 
      message: `Agent deployed successfully!`,
      workspace: workspaceDir,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
