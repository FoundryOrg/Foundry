'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ConnectionDetails {
  serverUrl: string;
  roomName: string;
  participantName: string;
  participantToken: string;
}

export default function VoiceAssistantPage() {
  const router = useRouter();
  const [connectionDetails, setConnectionDetails] = useState<ConnectionDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const connectToAgent = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/connection-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_config: {
            agents: [
              {
                agent_name: 'teaching-assistant',
              },
            ],
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get connection details');
      }

      const details = await response.json();
      setConnectionDetails(details);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-linear-to-b from-sky-100 via-sky-50 to-white" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl text-slate-900 mb-4" style={{fontFamily: 'var(--font-instrument-serif)'}}>
              Voice Assistant
            </h1>
            <p className="text-slate-700 text-lg max-w-2xl mx-auto">
              Connect with an AI teaching assistant for real-time guidance
            </p>
          </div>

          {!connectionDetails && (
            <div className="max-w-2xl mx-auto">
              {/* Info Card */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 p-8 mb-6">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="shrink-0">
                    <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-sky-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-slate-900 mb-3">Test Connection</h2>
                    <p className="text-slate-700">
                      This is a standalone voice assistant page for testing the LiveKit integration. 
                      For course-specific guidance, navigate to a course's final assessment.
                    </p>
                  </div>
                </div>

                <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-sky-800">
                    <strong>Features:</strong> Real-time voice and video interaction with an AI assistant
                    that can see your camera feed and provide step-by-step guidance.
                  </p>
                </div>

                <button
                  onClick={connectToAgent}
                  disabled={loading}
                  className="w-full py-6 text-lg bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Connecting...
                    </>
                  ) : (
                    'Start Voice Session'
                  )}
                </button>

                {error && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
              </div>

              <div className="text-center">
                <button
                  onClick={() => router.push('/')}
                  className="text-slate-600 hover:text-slate-900 text-sm transition-colors"
                >
                  ← Back to Home
                </button>
              </div>
            </div>
          )}

          {connectionDetails && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                {/* Success Header */}
                <div className="bg-linear-to-r from-green-500 to-green-600 p-6 text-white">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold">Connected!</h2>
                      <p className="text-green-50 text-sm">Your voice session is ready</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                  {/* Connection Info */}
                  <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold mb-2 text-sky-900">
                      Connection Details
                    </h3>
                    <div className="space-y-1 text-xs font-mono text-sky-800">
                      <div>
                        <span className="text-sky-600">Room:</span>{' '}
                        {connectionDetails.roomName}
                      </div>
                      <div>
                        <span className="text-sky-600">Server:</span>{' '}
                        {connectionDetails.serverUrl}
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-2">Integration Steps</h3>
                    <p className="text-sm text-slate-700 mb-3">
                      To render the full LiveKit UI, install the components and use the connection details above:
                    </p>
                    <div className="bg-white rounded p-3 text-xs font-mono overflow-x-auto border border-slate-200 mb-3">
                      <code className="text-slate-800">
                        npm install @livekit/components-react livekit-client
                      </code>
                    </div>
                    <p className="text-xs text-slate-600">
                      See <span className="font-mono">LIVEKIT_INTEGRATION.md</span> for complete implementation details.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setConnectionDetails(null)}
                      className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                    >
                      Disconnect
                    </button>
                    <button
                      onClick={() => router.push('/')}
                      className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium"
                    >
                      Back to Home
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
