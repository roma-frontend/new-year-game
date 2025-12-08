import { Suspense } from 'react';
import GuessTheMelody from './guessMedlody';

// В вашей page.tsx
export default function GamePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading game...</div>
      </div>
    }>
      <GuessTheMelody />
    </Suspense>
  );
}