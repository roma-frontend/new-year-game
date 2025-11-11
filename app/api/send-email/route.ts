// app/api/send-email/route.ts

import { Resend } from 'resend';
import { NextResponse } from 'next/server';

// Инициализируйте Resend с вашим API ключом
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { to, subject, html } = await request.json();

    // Валидация данных
    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Отсутствуют обязательные поля' },
        { status: 400 }
      );
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: 'Некорректный email адрес' },
        { status: 400 }
      );
    }

    // Отправка email через Resend
    const data = await resend.emails.send({
      from: 'New Year Games <onboarding@resend.dev>', // Измените на ваш верифицированный домен
      to: [to],
      subject: subject,
      html: html,
    });

    console.log('Email отправлен успешно:', data);

    return NextResponse.json({ 
      success: true, 
      data 
    });

  } catch (error: any) {
    console.error('Ошибка при отправке email:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Ошибка при отправке email',
        details: error 
      },
      { status: 500 }
    );
  }
}

// Опционально: GET endpoint для проверки работы API
export async function GET() {
  return NextResponse.json({ 
    status: 'API работает',
    message: 'Используйте POST запрос для отправки email' 
  });
}