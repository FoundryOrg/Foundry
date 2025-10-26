'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LiveKitRoom, VideoTrack, useTracks, RoomAudioRenderer, StartAudio, useRoomContext } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { Button } from '@/components/ui/button';

interface ConnectionDetails {
  serverUrl: string;
  roomName: string;
  participantName: string;
  participantToken: string;
  courseTitle: string;
  steps: Array<{
    title: string;
    description: string;
  }>;
}

function VideoSession() {
  const room = useRoomContext();
  const tracks = useTracks([Track.Source.Camera]);
  const cameraTrack = tracks.find(t => t.source === Track.Source.Camera);
  const [micEnabled, setMicEnabled] = useState(true);
  const [camEnabled, setCamEnabled] = useState(true);

  const toggleMic = async () => {
    if (!room) return;
    await room.localParticipant.setMicrophoneEnabled(!micEnabled);
    setMicEnabled(!micEnabled);
  };

  const toggleCam = async () => {
    if (!room) return;
    await room.localParticipant.setCameraEnabled(!camEnabled);
    setCamEnabled(!camEnabled);
  };

  return (
    <div className="w-full flex justify-center py-8">
      {/* Video Container - Centered with max width */}
      <div className="w-[92vw] max-w-3xl mx-auto flex flex-col gap-6">
        {/* Video */}
        <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
          {camEnabled && cameraTrack ? (
            <VideoTrack trackRef={cameraTrack} className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-black" />
          )}
        </div>

        {/* Controls Below Video */}
        <div className="flex flex-col items-center gap-3">
          <StartAudio label="🔊 Click to enable audio" />
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="lg" onClick={toggleMic} aria-label="Toggle microphone">
              {micEnabled ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-5" fill="currentColor"><path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Zm-7-3a1 1 0 1 0-2 0 9 9 0 0 0 8 8.94V22H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-2.06A9 9 0 0 0 20 11a1 1 0 1 0-2 0 7 7 0 1 1-14 0Z"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-5" fill="currentColor"><path d="M19.78 22.22a1 1 0 0 1-1.41 0l-3.06-3.06A8.94 8.94 0 0 1 12 20.94V22H9a1 1 0 1 1 0-2h3v-2.06A9 9 0 0 1 4 11a1 1 0 1 1 2 0 7 7 0 0 0 10.17 6.17l-2.11-2.11A4 4 0 0 1 8 11V9a1 1 0 1 1 2 0v2a2 2 0 0 0 3.4 1.42l1.45 1.45A3.94 3.94 0 0 1 12 14a4 4 0 0 1-1.17-.18l-1.5-1.5V6a3 3 0 0 1 5.65-1.17l1.52 1.52a1 1 0 1 1 1.41-1.41l1.87 1.87a1 1 0 0 1 0 1.41l-1.4 1.4V11a1 1 0 1 1-2 0V9.41l-1.6 1.6 5 5a1 1 0 0 1 0 1.41Z"/></svg>
              )}
              <span className="ml-1">{micEnabled ? 'Mute' : 'Unmute'}</span>
            </Button>
            <Button variant="secondary" size="lg" onClick={toggleCam} aria-label="Toggle camera">
              {camEnabled ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-5" fill="currentColor"><path d="M17 10.5V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3.5l4 4V6.5l-4 4Z"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-5" fill="currentColor"><path d="M3.7 2.3a1 1 0 0 1 1.4 0l16.6 16.6a1 1 0 1 1-1.4 1.4l-2.32-2.32L17 20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7.41l.3.3 2.4 2.4V18h9.59l-2-2H7v-4.59l-4.3-4.3a1 1 0 0 1 0-1.41Zm16.3.7a2 2 0 0 1 2 2v10.59l-4-4V7a2 2 0 0 0-2-2H8.41l-2-2H17Z"/></svg>
              )}
              <span className="ml-1">{camEnabled ? 'Camera off' : 'Camera on'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CourseVoiceAssistantPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;
  const [connectionDetails, setConnectionDetails] = useState<ConnectionDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const connectToAgent = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:8000/api/course/${courseId}/voice-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to get connection details');
      }

      const details = await response.json();
      setConnectionDetails(details);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    setConnectionDetails(null);
    router.push(`/course/${courseId}`);
  };

  if (connectionDetails) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col">
        {/* Header */}
        <div className="shrink-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-slate-900 text-2xl font-semibold">{connectionDetails.courseTitle}</h1>
              <p className="text-slate-600 text-sm">AR-Guided Session</p>
            </div>
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              End Session
            </button>
          </div>
        </div>

        {/* LiveKit Room */}
        <div className="flex-1 overflow-auto bg-linear-to-b from-sky-50 to-white">
          <LiveKitRoom
            serverUrl={connectionDetails.serverUrl}
            token={connectionDetails.participantToken}
            connect={true}
            video={true}
            audio={true}
            className="h-full w-full"
          >
            <VideoSession />
            <RoomAudioRenderer />
            
            {/* StartAudio handled inside VideoSession controls */}
          </LiveKitRoom>
        </div>
      </div>
    );
  }

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
              Connect with an AI teaching assistant to help you complete your project
            </p>
          </div>

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
                  <h2 className="text-xl font-semibold text-slate-900 mb-3">How it works</h2>
                  <ul className="space-y-2 text-slate-700">
                    <li className="flex items-start">
                      <span className="text-sky-600 mr-2 mt-1">•</span>
                      <span>The AI assistant can see through your camera</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-sky-600 mr-2 mt-1">•</span>
                      <span>It will guide you through each step of your project</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-sky-600 mr-2 mt-1">•</span>
                      <span>Ask questions anytime and get instant feedback</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-sky-600 mr-2 mt-1">•</span>
                      <span>The assistant will check your progress automatically</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Make sure your camera and microphone are enabled and that you're
                  in a well-lit area for the best experience.
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
                onClick={() => router.push(`/course/${courseId}`)}
                className="text-slate-600 hover:text-slate-900 text-sm transition-colors"
              >
                ← Back to Course
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
