import React, { useState, FormEvent } from 'react';
import { Mail, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('Envoi en cours…');
    setStatus('idle');

    try {
      const res = await fetch(`${API_BASE_URL}/api/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || 'Merci pour votre inscription !');
        setStatus('success');
        setEmail('');
      } else {
        setMessage(data.message || 'Une erreur est survenue.');
        setStatus('error');
      }
    } catch (err) {
      console.error(err);
      setMessage('Impossible de contacter le serveur.');
      setStatus('error');
    }

    // Reset status after a delay
    setTimeout(() => {
      setStatus('idle');
      setMessage('');
    }, 5000);
  };

  return (
    <div className="bg-gradient-to-b from-white to-[#e8f5ff] py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center">
            <div className="bg-gradient-to-b from-white to-[#e8f5ff] px-4">
              <Mail className="w-8 h-8 text-fixup-green" />
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <h2 className="text-3xl font-bold text-fixup-black mb-4">
            Restez informé
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Inscrivez-vous à notre newsletter pour recevoir nos dernières actualités, 
            conseils d'experts et offres exclusives.
          </p>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex gap-4">
              <div className="flex-grow relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre adresse email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-fixup-green focus:border-transparent transition-all duration-200"
                  required
                />
                {message && (
                  <div
                    className={`absolute -top-10 left-0 right-0 text-sm ${
                      status === 'success' ? 'text-fixup-green' : 'text-red-500'
                    }`}
                  >
                    {message}
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="bg-fixup-green hover:bg-fixup-orange text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors duration-200"
              >
                S'inscrire
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          <p className="mt-4 text-sm text-gray-500">
            En vous inscrivant, vous acceptez de recevoir nos emails. 
            Vous pourrez vous désinscrire à tout moment.
          </p>
        </div>
      </div>
    </div>
  );
}
