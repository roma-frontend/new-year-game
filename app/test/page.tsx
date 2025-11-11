"use client"

import { useState } from 'react';
import { Mail, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function TestEmailPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [apiStatus, setApiStatus] = useState<any>(null);

  // Проверка API endpoint
  const checkApi = async () => {
    try {
      const response = await fetch('/api/send-email');
      const data = await response.json();
      setApiStatus(data);
    } catch (error) {
      setApiStatus({ error: 'API не найден' });
    }
  };

  // Отправка тестового email
  const sendTestEmail = async () => {
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Введите корректный email адрес');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: '🎉 Тестовое письмо от New Year Games',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #fef2f2 0%, #fce7f3 100%); border-radius: 10px;">
              <h1 style="color: #dc2626; text-align: center;">🎄 Привет!</h1>
              <p style="font-size: 18px; color: #374151;">Это тестовое письмо от приложения New Year Games.</p>
              <p style="font-size: 16px; color: #6b7280;">Если вы получили это письмо, значит отправка email работает отлично! ✅</p>
              <div style="background: white; border-radius: 8px; padding: 15px; margin: 20px 0; border-left: 4px solid #10b981;">
                <p style="margin: 0; color: #065f46;"><strong>✨ Отправлено:</strong> ${new Date().toLocaleString()}</p>
                <p style="margin: 10px 0 0 0; color: #065f46;"><strong>📧 На адрес:</strong> ${email}</p>
              </div>
              <p style="text-align: center; font-size: 14px; color: #9ca3af;">Powered by Resend & Next.js</p>
            </div>
          `
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setMessage(`✅ Письмо успешно отправлено на ${email}! Проверьте почту (в том числе папку Spam).`);
        console.log('✅ Email отправлен:', data);
      } else {
        setStatus('error');
        setMessage(`❌ Ошибка: ${data.error || 'Неизвестная ошибка'}`);
        console.error('❌ Ошибка отправки:', data);
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(`❌ Ошибка сети: ${error.message}`);
      console.error('❌ Network error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-4 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-purple-400">
          {/* Заголовок */}
          <div className="text-center mb-8">
            <Mail className="mx-auto text-purple-600 mb-4" size={64} />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Тест Email Отправки
            </h1>
            <p className="text-gray-600">Проверьте работу Resend API</p>
          </div>

          {/* Проверка API */}
          <div className="mb-6">
            <button
              onClick={checkApi}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-xl font-bold hover:from-blue-600 hover:to-cyan-600 transition-all mb-3"
            >
              🔍 Проверить API Endpoint
            </button>
            
            {apiStatus && (
              <div className={`rounded-xl p-4 ${apiStatus.error ? 'bg-red-50 border-2 border-red-300' : 'bg-green-50 border-2 border-green-300'}`}>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(apiStatus, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Форма отправки */}
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                📧 Email адрес для теста:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-xl border-2 border-purple-300 focus:border-purple-500 focus:outline-none text-lg"
                disabled={status === 'loading'}
              />
            </div>

            <button
              onClick={sendTestEmail}
              disabled={status === 'loading' || !email}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg"
            >
              {status === 'loading' ? (
                <>
                  <Loader className="animate-spin mr-2" size={24} />
                  Отправка...
                </>
              ) : (
                <>
                  <Mail className="mr-2" size={24} />
                  Отправить Тестовое Письмо
                </>
              )}
            </button>
          </div>

          {/* Статус */}
          {message && (
            <div className={`mt-6 rounded-xl p-4 border-2 ${
              status === 'success' 
                ? 'bg-green-50 border-green-400' 
                : status === 'error'
                ? 'bg-red-50 border-red-400'
                : 'bg-blue-50 border-blue-400'
            }`}>
              <div className="flex items-start">
                {status === 'success' ? (
                  <CheckCircle className="text-green-600 mr-3 flex-shrink-0" size={24} />
                ) : status === 'error' ? (
                  <AlertCircle className="text-red-600 mr-3 flex-shrink-0" size={24} />
                ) : null}
                <p className={`text-sm ${
                  status === 'success' 
                    ? 'text-green-800' 
                    : status === 'error'
                    ? 'text-red-800'
                    : 'text-blue-800'
                }`}>
                  {message}
                </p>
              </div>
            </div>
          )}

          {/* Инструкции */}
          <div className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border-2 border-yellow-300">
            <h3 className="font-bold text-yellow-900 mb-3 flex items-center">
              💡 Инструкции:
            </h3>
            <ol className="text-sm text-yellow-900 space-y-2 list-decimal list-inside">
              <li>Сначала нажмите "Проверить API Endpoint"</li>
              <li>Убедитесь, что API работает (status: "API работает")</li>
              <li>Введите ваш email адрес</li>
              <li>Нажмите "Отправить Тестовое Письмо"</li>
              <li>Проверьте почту (в том числе папку Spam)</li>
            </ol>
          </div>

          {/* Troubleshooting */}
          <div className="mt-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border-2 border-gray-300">
            <h3 className="font-bold text-gray-900 mb-3">
              🔧 Если не работает:
            </h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>✅ Проверьте файл <code className="bg-gray-200 px-2 py-1 rounded">.env.local</code> в корне проекта</li>
              <li>✅ Перезапустите dev сервер (<code className="bg-gray-200 px-2 py-1 rounded">npm run dev</code>)</li>
              <li>✅ Убедитесь, что файл <code className="bg-gray-200 px-2 py-1 rounded">app/api/send-email/route.ts</code> существует</li>
              <li>✅ Проверьте консоль браузера (F12) на ошибки</li>
              <li>✅ Проверьте консоль сервера (терминал) на ошибки</li>
            </ul>
          </div>

          {/* Ссылка на документацию */}
          <div className="mt-6 text-center">
            <a
              href="/setup-instructions"
              className="text-purple-600 hover:text-purple-700 font-bold underline"
              target="_blank"
            >
              📚 Полная инструкция по настройке
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}