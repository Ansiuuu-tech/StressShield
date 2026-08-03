import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, Maximize,
  Music, Film, Mountain, CloudRain, Waves,
  Sparkles, Loader2, ArrowLeft
} from 'lucide-react';
import Portal from '../components/Portal';

let ytApiPromise = null;

function loadYouTubeIframeAPI() {
  if (ytApiPromise) return ytApiPromise;

  ytApiPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve(window.YT);
      return;
    }
    const existingCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (existingCallback) existingCallback();
      resolve(window.YT);
    };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }
  });

  return ytApiPromise;
}

const VIDEO_CONTENTS = [
  {
    id: 'nature-4k',
    type: 'video',
    title: '4K Nature Relaxation',
    description: 'Peaceful forests, mountains, and waterfalls in stunning 4K',
    duration: '2:00:00',
    videoId: 'VNu15Qqomt8',
    thumbnail: 'https://img.youtube.com/vi/VNu15Qqomt8/hqdefault.jpg',
    category: 'Nature',
    icon: Mountain,
    color: '#4ade80',
  },
  {
    id: 'rain-sounds',
    type: 'video',
    title: 'Gentle Rain Sounds',
    description: 'Soft rainfall on leaves for deep relaxation and sleep',
    duration: '8:00:00',
    videoId: 'Sv0LwXYAVVg',
    thumbnail: 'https://img.youtube.com/vi/Sv0LwXYAVVg/hqdefault.jpg',
    category: 'Ambient',
    icon: CloudRain,
    color: '#60a5fa',
  },
  {
    id: 'calm-piano',
    type: 'video',
    title: 'Calm Piano Ambient',
    description: 'Soft piano melodies for focus, reading, or unwinding',
    duration: '2:00:00',
    videoId: 'WVP3fUzQHcg',
    thumbnail: 'https://img.youtube.com/vi/WVP3fUzQHcg/hqdefault.jpg',
    category: 'Music',
    icon: Music,
    color: '#f472b6',
  },
];

const AUDIO_CONTENTS = [
  {
    id: 'ocean-waves',
    type: 'audio',
    title: 'Ocean Waves',
    description: 'Rhythmic waves for meditation and sleep',
    duration: '10:00:00',
    backgroundImage: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=800&q=80', // calm ocean waves, aerial
    videoId: 'JekUNGo-RVk',
    category: 'Nature',
    icon: Waves,
    color: '#22d3ee',
  },
  {
    id: 'forest-ambience',
    type: 'audio',
    title: 'Forest Ambience',
    description: 'Birdsong and gentle wind through trees',
    duration: '8:00:00',
    backgroundImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80', // sunlit forest canopy
    videoId: 'E7K0QEc6NzM',
    category: 'Nature',
    icon: Mountain,
    color: '#86efac',
  },
  {
    id: 'white-noise',
    type: 'audio',
    title: 'Warm White Noise',
    description: 'Consistent broadband sound for focus and masking',
    duration: '12:00:00',
    backgroundImage: 'https://images.unsplash.com/photo-1497561813398-8fcc7a37b567?auto=format&fit=crop&w=800&q=80', // soft abstract warm gradient/bokeh
    videoId: 'bzNZxM-3xuY',
    category: 'Focus',
    icon: Sparkles,
    color: '#fcd34d',
  },
];

function getThumbnailUrl(videoId) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

const YouTubePlayer = forwardRef(function YouTubePlayer({ videoId, isPlaying, onStateChange, onReady }, ref) {
  const playerRef = useRef(null);
  const containerRef = useRef(null);
  const [apiReady, setApiReady] = useState(false);

  useImperativeHandle(ref, () => ({
    enterFullscreen: () => {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    },
  }));

  useEffect(() => {
    let cancelled = false;
    loadYouTubeIframeAPI().then(() => {
      if (!cancelled) setApiReady(true);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!apiReady || !containerRef.current || playerRef.current) return;

    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId,
      playerVars: {
        autoplay: 0,
        controls: 1,
        modestbranding: 1,
        rel: 0,
        iv_load_policy: 3,
        playsinline: 1,
        enablejsapi: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: (event) => {
          if (onReady) onReady(event);
          if (isPlaying) event.target.playVideo();
        },
        onStateChange,
      },
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [apiReady, videoId]);

  useEffect(() => {
    if (!playerRef.current || typeof playerRef.current.playVideo !== 'function') return;
    if (isPlaying) {
      playerRef.current.playVideo();
    } else {
      playerRef.current.pauseVideo();
    }
  }, [isPlaying]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', minHeight: 280, borderRadius: 'var(--r-md)' }}
    />
  );
});

function ContentCard({ content, isExpanded, isPlaying, onToggleExpand, onTogglePlay, onEnded }) {
  const Icon = content.icon;
  const [loaded, setLoaded] = useState(false);
  const playerRef = useRef(null);
  const isAudio = content.type === 'audio';
  const thumbnailUrl = content.thumbnail || getThumbnailUrl(content.videoId);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-lg)',
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ position: 'relative', aspectRatio: '16/9', background: 'var(--surface-muted)' }}>
        {!loaded && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-muted)' }}>
            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: 'var(--muted-fg)' }} />
          </div>
        )}

        <AnimatePresence mode="wait">
          {!isExpanded && (
            <motion.div
              key="thumbnail"
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onLoad={() => setLoaded(true)}
            >
              <img
                src={isAudio ? content.backgroundImage : thumbnailUrl}
                alt={content.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: isAudio ? 'none' : 'brightness(0.7)',
                  transition: 'filter 0.3s ease',
                }}
              />
              <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '4px 8px', borderRadius: 'var(--r-sm)', fontSize: '0.75rem', fontWeight: 500 }}>
                {content.duration}
              </div>
              <div style={{ position: 'absolute', top: 12, left: 12, background: content.color, color: '#1a1a1a', padding: '4px 10px', borderRadius: 'var(--r-pill)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {content.category}
              </div>
            </motion.div>
          )}

          {isExpanded && (
            <motion.div
              key="player"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ flex: 1, position: 'relative', minHeight: 280 }}>
                {isAudio ? (
                  // Audio: show static background photo; YouTube player hidden but still mounted for actual sound
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <img
                      src={content.backgroundImage}
                      alt={content.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0, pointerEvents: 'none' }}>
                      <YouTubePlayer
                        ref={playerRef}
                        videoId={content.videoId}
                        isPlaying={isPlaying}
                        onStateChange={(event) => {
                          if (event.data === window.YT?.PlayerState?.ENDED) {
                            onEnded();
                          }
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <YouTubePlayer
                    ref={playerRef}
                    videoId={content.videoId}
                    isPlaying={isPlaying}
                    onStateChange={(event) => {
                      if (event.data === window.YT?.PlayerState?.ENDED) {
                        onEnded();
                      }
                    }}
                  />
                )}
              </div>
              <div style={{
                padding: '16px',
                background: 'var(--surface)',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                  <button
                    onClick={onTogglePlay}
                    className="btn"
                    style={{ minWidth: 'auto', padding: '10px 20px' }}
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    {isPlaying ? 'Pause' : 'Play'}
                  </button>
                  <button
                    onClick={onToggleExpand}
                    className="btn light"
                    style={{ minWidth: 'auto', padding: '10px 16px' }}
                  >
                    <ArrowLeft size={16} />
                    Back
                  </button>
                </div>
                {!isAudio && (
                  <button
                    onClick={() => {
                      playerRef.current?.enterFullscreen();
                    }}
                    className="iconbtn"
                    aria-label="Enter fullscreen"
                  >
                    <Maximize size={18} />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: content.color + '22',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Icon size={16} style={{ color: content.color }} />
          </span>
          <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--ink)' }}>{content.title}</h3>
        </div>
        <p className="muted" style={{ fontSize: '0.9rem', margin: 0 }}>{content.description}</p>
        {!isExpanded && (
          <button
            onClick={onToggleExpand}
            className="btn light"
            style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}
          >
            <Play size={14} /> Play
          </button>
        )}
      </div>
    </motion.article>
  );
}

export default function Unwind() {
  const [expandedId, setExpandedId] = useState(null);
  const [playingId, setPlayingId] = useState(null);
  const [activeTab, setActiveTab] = useState('video');

  const handleToggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      setPlayingId(null);
    } else {
      if (expandedId && playingId) {
        setPlayingId(null);
      }
      setExpandedId(id);
    }
  };

  const handleTogglePlay = (id) => {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
    }
  };

  const handleEnded = () => {
    setPlayingId(null);
  };

  const allContent = activeTab === 'video' ? VIDEO_CONTENTS : AUDIO_CONTENTS;
  const Icon = activeTab === 'video' ? Film : Music;

  return (
    <Portal title="Unwind" subtitle="Calming videos and audio for your breaks between classes.">
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 8, background: 'var(--surface-muted)', padding: 4, borderRadius: 'var(--r-md)', width: 'fit-content' }}>
          <button
            onClick={() => setActiveTab('video')}
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--r-sm)',
              border: 'none',
              background: activeTab === 'video' ? 'var(--surface)' : 'transparent',
              color: activeTab === 'video' ? 'var(--ink)' : 'var(--ink-soft)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: activeTab === 'video' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 150ms ease',
            }}
          >
            <Film size={16} /> Videos
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--r-sm)',
              border: 'none',
              background: activeTab === 'audio' ? 'var(--surface)' : 'transparent',
              color: activeTab === 'audio' ? 'var(--ink)' : 'var(--ink-soft)',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: activeTab === 'audio' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 150ms ease',
            }}
          >
            <Music size={16} /> Audio
          </button>
        </div>
      </div>

      <p className="muted" style={{ marginBottom: 24, maxWidth: '60ch' }}>
        Take a genuine break. These curated videos and audio tracks are chosen to help your nervous system
        down-regulate — no ads, no algorithmic rabbit holes, just calm. Only one plays at a time.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 20,
      }}>
        {allContent.map((content) => (
          <ContentCard
            key={content.id}
            content={content}
            isExpanded={expandedId === content.id}
            isPlaying={playingId === content.id}
            onToggleExpand={() => handleToggleExpand(content.id)}
            onTogglePlay={() => handleTogglePlay(content.id)}
            onEnded={handleEnded}
          />
        ))}
      </div>

      {allContent.length === 0 && (
        <div className="panel" style={{ textAlign: 'center', padding: 60 }}>
          <p className="muted">No content available yet.</p>
        </div>
      )}
    </Portal>
  );
}