import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

// Reusing the chat system prompt from your existing chat logic
const systemPrompt = `
Kamu adalah AI assistant modern untuk membantu user seputar pekerjaan,
CV, produktivitas, dan pertanyaan umum. Jawab dengan jelas, profesional,
dan membantu.
`;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if it's a valid message update
    if (!body || !body.message) {
      return NextResponse.json({ ok: true }); // Acknowledge to stop Telegram from retrying
    }

    const { message } = body;
    const chatId = message.chat.id;
    const text = message.text;

    // Only process text messages
    if (!text) {
      return NextResponse.json({ ok: true });
    }

    // Prepare messages for Groq
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: text },
    ];

    // Get response from Groq
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: messages,
      temperature: 0.3,
    });

    const replyText =
      completion.choices?.[0]?.message?.content ||
      'Maaf, saya sedang tidak bisa merespons saat ini.';

    // Send the reply back to Telegram
    await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: replyText,
        parse_mode: 'Markdown',
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram Webhook Error:', error);
    // Return 200 so Telegram doesn't keep retrying if it's a processing error
    return NextResponse.json({ ok: true });
  }
}
