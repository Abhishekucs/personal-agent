import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export async function GET() {
  try {
    const { stdout, stderr } = await execPromise('openclaw gateway status');
    return NextResponse.json({
      success: true,
      status: stdout || stderr,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      status: 'OpenClaw not running',
    }, { status: 500 });
  }
}
