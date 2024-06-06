import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@/utils/supabase/server';
import 'server-only';

export const runtime = 'edge';

// Define types for the request body
interface ChatRequest {
  input: string;
  user_id: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const json = await req.json();
    const { input } = json;

    const supabase = createClient();
    const userResponse = await supabase.auth.getUser();
    const userId = userResponse.data.user?.id;

    if (!userId) {
      console.log('Unauthorized request: No user ID found');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const requestBody: ChatRequest = { input, user_id: userId };

    const headers = {
      'Content-Type': 'application/json',
    };

    const response = await fetch(`${process.env.REMINISC_BASE_API_URL}/v0/chat`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.body) {
      throw new Error("No response body from FastAPI");
    }

    const readableStream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
          controller.close();
        }
      },
    });

    return new NextResponse(readableStream, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error:', error);
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}