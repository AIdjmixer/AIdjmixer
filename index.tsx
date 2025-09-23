/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import './index.css';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';

const FADE_TIME = 5; // 5 seconds fade
const PLAY_DURATION = 35; // 35 seconds snippet (30s play + 5s fade)
const START_TIME = 20; // Start each track at 20 seconds

// --- CONFIGURATION ---
// The Google Form embed URL for the contact page.
const GOOGLE_FORM_EMBED_URL = "https://docs.google.com/forms/d/e/1FAIpQLScPEYmBbCK1rRNqXS2BRbPMqZJ6Xm93KlRmmuqz1ebGGK614w/viewform?embedded=true"; 
// --------------------

interface Song {
    file: File;
    id: string;
    name: string;
    playFull: boolean;
}

interface Playlist {
    id: string;
    name: string;
    songs: Song[];
}

interface PageInfo {
    title: string;
    content: React.ReactNode;
}

const PAGE_CONTENT: Record<string, PageInfo> = {
    about: {
        title: 'About AI Mix Dj',
        content: <p>This application automatically mixes your songs like a real DJ. Upload your tracks, and enjoy a seamless mix. you can also choose to play any song in full, just tick the checkbox, those songs will be played in full along with mixed one's.</p>
    },
    contact: {
        title: 'Contact Us',
        content: <>
            <p>Have questions, feedback, or a business inquiry? Please fill out the form below, and we'll get back to you as soon as possible. All messages are sent directly to our team.</p>
            <iframe
                src={GOOGLE_FORM_EMBED_URL}
                className="contact-form-iframe"
                title="Contact Us Form"
            >
                Loading…
            </iframe>
        </>
    }
};

const PRIVACY_POLICY_CONTENT: PageInfo = {
    title: 'Privacy Policy',
    content: <>
        <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
        <p>Your privacy is important to us. It is AI Mix Dj's policy to respect your privacy regarding any information we may collect from you across our website.</p>
        <h4>1. Information We Collect</h4>
        <p>We do not collect, store, or transmit any personal information or audio files. All audio processing is performed locally within your browser (client-side). The music files you select never leave your computer.</p>
        <h4>2. Local Storage</h4>
        <p>We use your browser's "Local Storage" feature to store your acceptance of our Terms of Service and your created playlists. This is solely for functionality and user experience. This data is stored on your device and is not accessible by us.</p>
        <h4>3. Third-Party Services</h4>
        <p>Our website may display ads from third-party networks (e.g., Google AdSense). These services may use cookies to serve ads based on a user's prior visits to this and other websites. We do not provide any personal information to these third parties.</p>
        <h4>4. Changes to This Policy</h4>
        <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.</p>
    </>
};

const TERMS_CONTENT: PageInfo = {
    title: 'Terms of Service',
    content: <>
        <p>Please read these Terms of Service ("Terms") carefully before using the AI Mix Dj application (the "Service").</p>
        <p>Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.</p>
        <h4>1. Description of Service</h4>
        <p>The Service is a web-based application that allows users to select local audio files and have them mixed and played back in a continuous sequence. All processing occurs locally in the user's browser.</p>
        <h4>2. User Responsibilities</h4>
        <p>You are solely responsible for the audio files you use with the Service. By using the Service, you affirm that you have the necessary rights, licenses, and permissions to use and play the content. You agree not to use the Service to process any material that is illegal or infringes on the copyrights of others.</p>
        <h4>3. Copyright Policy</h4>
        <p>You retain all ownership rights to the audio files you use with the Service ("Your Content"). We do not claim any ownership over Your Content.</p>
        <p>By using the Service, you represent and warrant that you own or have the necessary licenses, rights, consents, and permissions to use and authorize the Service to process Your Content for personal, non-commercial playback. You agree that you will not use the Service with any content for which you do not have the proper authorization.</p>
        <p>The Service processes files locally in your browser and does not upload, store, or distribute Your Content. You agree to indemnify and hold harmless AI Mix Dj and its developers from any and all claims, damages, losses, liabilities, and expenses (including attorneys' fees) arising from your breach of these copyright terms.</p>
        <h4>4. Disclaimer of Warranties</h4>
        <p>The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties, expressed or implied, regarding the operation or availability of the Service, and hereby disclaim all other warranties, including without limitation, implied warranties of merchantability or fitness for a particular purpose.</p>
        <h4>5. Limitation of Liability</h4>
        <p>In no event shall AI Mix Dj or its developers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the Service.</p>
        <h4>6. License and Use Restrictions</h4>
        <p>The Service and its original code, features, and functionality are and will remain the exclusive property of AI Mix Dj. The Service is protected by copyright and other intellectual property laws.</p>
        <p>We grant you a limited, non-exclusive, non-transferable, revocable license to use the Service for your personal, non-commercial purposes, subject to these Terms. You agree not to, and you will not permit others to:</p>
        <ul style={{ paddingLeft: '20px', marginBottom: '1rem' }}>
            <li>License, sell, rent, lease, assign, distribute, transmit, or otherwise commercially exploit the Service.</li>
            <li>Copy, modify, decompile, reverse compile, disassemble, or reverse engineer any part of the Service.</li>
            <li>Remove, alter or obscure any proprietary notice (including any notice of copyright) of AI Mix Dj.</li>
        </ul>
        <p>By clicking "Agree & Continue", you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</p>
    </>
};

interface ViewLegalModalProps {
    title: string;
    content: React.ReactNode;
    onClose: () => void;
}
const ViewLegalModal = ({ title, content, onClose }: ViewLegalModalProps) => (
    <div className="modal-overlay">
        <div className="modal-content">
            <h2>{title}</h2>
            <div className="modal-body">{content}</div>
            <div className="modal-footer-row">
                <button onClick={onClose} className="modal-button">Close</button>
            </div>
        </div>
    </div>
);


const WelcomeScreen = ({ onAgree, onShowTerms, onShowPrivacy }: { onAgree: () => void; onShowTerms: () => void; onShowPrivacy: () => void; }) => {
    const [isChecked, setIsChecked] = useState(false);
    return (
        <div className="welcome-container">
            <div className="welcome-box">
                <h1>Welcome to AI Mix Dj</h1>
                <p>Your personal, automated DJ. Enjoy seamless mixes from your own music library.</p>
                
                <div className="how-to-use">
                    <h3>How to Get Started</h3>
                    <ol>
                        <li>Click 'New' to create a playlist or select an existing one.</li>
                        <li>Click 'Add Songs' to upload your local audio files (MP3, WAV, etc.).</li>
                        <li>Click any song to start the mix immediately, or use the main Play button.</li>
                        <li>Use the shuffle button for a random mix, or the checkbox on a song to hear it play in full.</li>
                        <li>Drag songs to reorder them, or click '×' to remove them.</li>
                    </ol>
                </div>

                <div className="welcome-footer">
                    <label>
                        <input type="checkbox" checked={isChecked} onChange={() => setIsChecked(!isChecked)} />
                        I have read and agree to the <a onClick={onShowTerms}>Terms of Service</a> and <a onClick={onShowPrivacy}>Privacy Policy</a>.
                    </label>
                    <button onClick={onAgree} disabled={!isChecked}>
                        Enter AI Mix Dj
                    </button>
                </div>
            </div>
        </div>
    );
};

const CreatePlaylistModal = ({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string) => void; }) => {
    const [name, setName] = useState('');

    const handleSubmit = () => {
        if (name.trim()) {
            onCreate(name.trim());
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Create New Playlist</h2>
                <div className="modal-body">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Playlist Name"
                        className="modal-input"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    />
                </div>
                <div className="modal-footer-row">
                    <button onClick={onClose} className="modal-button secondary">Cancel</button>
                    <button onClick={handleSubmit} disabled={!name.trim()} className="modal-button">Create</button>
                </div>
            </div>
        </div>
    );
};

const StaticPage = ({ pageKey, onBack }: { pageKey: string; onBack: () => void }) => {
    const info = PAGE_CONTENT[pageKey];
    if (!info) return null;

    return (
        <div className="static-page-container">
            <div className="static-page-content">
                <h2>{info.title}</h2>
                {info.content}
                <button onClick={onBack} className="back-to-mixer-btn">Back to Mixer</button>
            </div>
        </div>
    );
};

const App: React.FC = () => {
    const [playlists, setPlaylists] = useState<Playlist[]>([]);
    const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);
    const [playQueue, setPlayQueue] = useState<string[]>([]);
    const [currentQueueIndex, setCurrentQueueIndex] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isShuffle, setIsShuffle] = useState<boolean>(false);
    const [volume, setVolume] = useState<number>(0.8);
    const [progress, setProgress] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<string>('home');
    const [hasAgreed, setHasAgreed] = useState<boolean>(false);
    const [viewingLegalDoc, setViewingLegalDoc] = useState<PageInfo | null>(null);
    const [isCreatingPlaylist, setIsCreatingPlaylist] = useState<boolean>(false);
    const [draggedSongId, setDraggedSongId] = useState<string | null>(null);

    const audio1Ref = useRef<HTMLAudioElement>(null);
    const audio2Ref = useRef<HTMLAudioElement>(null);
    const activeAudioRef = useRef<HTMLAudioElement | null>(null);
    const isTransitioningRef = useRef(false);

    const FADE_INTERVAL = 50; // ms for fade steps, making it smoother
    const FADE_STEPS = FADE_TIME * 1000 / FADE_INTERVAL;

    const activePlaylist = playlists.find(p => p.id === activePlaylistId);
    const songs = activePlaylist ? activePlaylist.songs : [];

    // Load initial data from localStorage
    useEffect(() => {
        const agreed = localStorage.getItem('hasAgreedToTerms');
        if (agreed === 'true') setHasAgreed(true);

        const savedShuffle = localStorage.getItem('isShuffle');
        if (savedShuffle === 'true') setIsShuffle(true);

        const savedPlaylists = localStorage.getItem('playlists');
        const savedActiveId = localStorage.getItem('activePlaylistId');

        if (savedPlaylists) {
            try {
                // Playlists are saved without songs, as File objects cannot be persisted.
                // We rehydrate them here with empty song arrays.
                const parsedPlaylists: Omit<Playlist, 'songs'>[] = JSON.parse(savedPlaylists);
                if (Array.isArray(parsedPlaylists)) {
                    const rehydratedPlaylists = parsedPlaylists.map(p => ({ ...p, songs: [] as Song[] }));
                    setPlaylists(rehydratedPlaylists);
                    if (savedActiveId && rehydratedPlaylists.some(p => p.id === savedActiveId)) {
                        setActivePlaylistId(savedActiveId);
                    } else if (rehydratedPlaylists.length > 0) {
                        setActivePlaylistId(rehydratedPlaylists[0].id);
                    }
                }
            } catch (error) {
                console.error("Failed to parse playlists from localStorage", error);
                setPlaylists([]);
            }
        } else {
            const defaultPlaylistId = `playlist-${Date.now()}`;
            const newPlaylist = { id: defaultPlaylistId, name: 'My First Playlist', songs: [] };
            setPlaylists([newPlaylist]);
            setActivePlaylistId(defaultPlaylistId);
        }
    }, []);

    // Save data to localStorage
    useEffect(() => {
        if (playlists.length > 0) {
            // Do not store the 'songs' array because File objects are not serializable.
            // We only persist the playlist structure (name and id).
            const playlistsToSave = playlists.map(({ id, name }) => ({ id, name }));
            localStorage.setItem('playlists', JSON.stringify(playlistsToSave));
        }
        if (activePlaylistId) localStorage.setItem('activePlaylistId', activePlaylistId);
        localStorage.setItem('isShuffle', String(isShuffle));
    }, [playlists, activePlaylistId, isShuffle]);

    // Generate Play Queue
    useEffect(() => {
        if (!songs) return;
        const songIds = songs.map(s => s.id);

        if (isShuffle) {
            // Fisher-Yates shuffle algorithm
            for (let i = songIds.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [songIds[i], songIds[j]] = [songIds[j], songIds[i]];
            }
        }
        
        setPlayQueue(songIds);

        const currentSongId = playQueue[currentQueueIndex ?? -1];
        if (currentSongId) {
            const newIndex = songIds.indexOf(currentSongId);
            setCurrentQueueIndex(newIndex !== -1 ? newIndex : null);
        } else {
             setCurrentQueueIndex(null);
        }

    }, [songs, isShuffle]);

    const handleAgreeToTerms = () => {
        localStorage.setItem('hasAgreedToTerms', 'true');
        setHasAgreed(true);
    };

    const fadeOut = useCallback((audio: HTMLAudioElement) => {
        const step = audio.volume / FADE_STEPS;
        const fadeOutInterval = setInterval(() => {
            if (audio.volume > step) {
                audio.volume -= step;
            } else {
                clearInterval(fadeOutInterval);
                audio.pause();
                audio.currentTime = 0;
                audio.volume = volume; // Reset for next use
            }
        }, FADE_INTERVAL);
    }, [volume]);

    const fadeIn = useCallback((audio: HTMLAudioElement) => {
        audio.volume = 0;
        const targetVolume = volume;
        const step = targetVolume / FADE_STEPS;
        audio.play().catch(e => console.error("Playback error:", e));
        const fadeInInterval = setInterval(() => {
            if (audio.volume < targetVolume - step) {
                audio.volume += step;
            } else {
                clearInterval(fadeInInterval);
                audio.volume = targetVolume;
            }
        }, FADE_INTERVAL);
    }, [volume]);

    const startSongTransition = useCallback((queueIndex: number) => {
        if (playQueue.length === 0 || isTransitioningRef.current) return;

        const songIdToPlay = playQueue[queueIndex];
        const songToPlay = songs.find(s => s.id === songIdToPlay);

        if (!songToPlay) return;

        isTransitioningRef.current = true;
        
        const nextAudio = activeAudioRef.current === audio1Ref.current ? audio2Ref.current : audio1Ref.current;
        if (!nextAudio) {
            isTransitioningRef.current = false;
            return;
        }

        if (activeAudioRef.current && activeAudioRef.current.src && isPlaying) {
            fadeOut(activeAudioRef.current);
        }
        
        nextAudio.src = URL.createObjectURL(songToPlay.file);
        nextAudio.currentTime = START_TIME;
        
        nextAudio.onloadedmetadata = () => {
             fadeIn(nextAudio);
             isTransitioningRef.current = false;
        };
        
        activeAudioRef.current = nextAudio;
        setCurrentQueueIndex(queueIndex);
        setIsPlaying(true);

    }, [playQueue, songs, isPlaying, fadeOut, fadeIn]);

    const playNextSong = useCallback(() => {
        if (playQueue.length === 0) return;
        const nextIndex = (currentQueueIndex === null ? -1 : currentQueueIndex) + 1;
        startSongTransition(nextIndex % playQueue.length);
    }, [currentQueueIndex, playQueue.length, startSongTransition]);
    
    const stopPlayback = useCallback(() => {
        if (activeAudioRef.current) {
            activeAudioRef.current.pause();
            activeAudioRef.current.src = '';
        }
        activeAudioRef.current = null;
        setIsPlaying(false);
        setCurrentQueueIndex(null);
        setProgress(0);
    }, []);

    useEffect(() => {
        const audio = activeAudioRef.current;
        if (!audio || !isPlaying || currentQueueIndex === null) return;

        const currentSongId = playQueue[currentQueueIndex];
        const currentSong = songs.find(s => s.id === currentSongId);
        if (!currentSong) {
            stopPlayback();
            return;
        };
        
        const updateProgress = () => {
             if (!audio.duration) return;
             const currentTime = audio.currentTime;
             const duration = audio.duration;
             
             setProgress((currentTime / duration) * 100);

             const timeUntilEnd = duration - currentTime;
             const timeUntilSnippetEnd = (START_TIME + PLAY_DURATION) - currentTime;

             if (!currentSong.playFull && timeUntilSnippetEnd <= FADE_TIME && !isTransitioningRef.current) {
                 playNextSong();
             } else if (currentSong.playFull && timeUntilEnd <= FADE_TIME && !isTransitioningRef.current) {
                 playNextSong();
             }
        };

        const interval = setInterval(updateProgress, 250);
        return () => clearInterval(interval);

    }, [isPlaying, currentQueueIndex, playQueue, songs, playNextSong, stopPlayback]);

    useEffect(() => {
        const audio1 = audio1Ref.current;
        const audio2 = audio2Ref.current;
        if (audio1) audio1.volume = volume;
        if (audio2) audio2.volume = volume;
    }, [volume]);
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && activePlaylistId) {
            const newSongs: Song[] = Array.from(files).map(file => ({
                file,
                id: `${file.name}-${file.lastModified}-${Math.random()}`,
                name: file.name.replace(/\.[^/.]+$/, ""),
                playFull: false,
            }));
            
            setPlaylists(prev =>
                prev.map(playlist =>
                    playlist.id === activePlaylistId
                        ? { ...playlist, songs: [...playlist.songs, ...newSongs] }
                        : playlist
                )
            );
        }
    };
    
    const togglePlayPause = () => {
        if (currentQueueIndex === null) {
            if (playQueue.length > 0) startSongTransition(0);
            return;
        }

        const audio = activeAudioRef.current;
        if (audio) {
            if (isPlaying) {
                audio.pause();
                setIsPlaying(false);
            } else {
                audio.play().catch(e => console.error("Playback error:", e));
                setIsPlaying(true);
            }
        }
    };
    
    const handleSongClick = (songId: string) => {
        const queueIndex = playQueue.indexOf(songId);
        if (queueIndex !== -1) {
            startSongTransition(queueIndex);
        }
    };

    const handleCheckboxChange = (songId: string) => {
        if (!activePlaylistId) return;
        setPlaylists(prev =>
            prev.map(p => p.id === activePlaylistId ? {
                ...p,
                songs: p.songs.map(s => s.id === songId ? { ...s, playFull: !s.playFull } : s)
            } : p)
        );
    };
    
    const handleRemoveSong = (songIdToRemove: string) => {
        if (!activePlaylistId) return;
        
        const currentSongId = currentQueueIndex !== null ? playQueue[currentQueueIndex] : null;

        if (currentSongId === songIdToRemove) {
            stopPlayback();
        }

        setPlaylists(prev => prev.map(p => {
            if (p.id === activePlaylistId) {
                return { ...p, songs: p.songs.filter(s => s.id !== songIdToRemove) };
            }
            return p;
        }));
    };

    const handleDragStart = (e: React.DragEvent<HTMLLIElement>, songId: string) => {
        setDraggedSongId(songId);
        setTimeout(() => e.currentTarget.classList.add('dragging'), 0);
    };

    const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
    };
    
    const handleDragLeave = (e: React.DragEvent<HTMLLIElement>) => {
        e.currentTarget.classList.remove('drag-over');
    };

    const handleDrop = (e: React.DragEvent<HTMLLIElement>, dropTargetId: string) => {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        if (draggedSongId === null || draggedSongId === dropTargetId) {
            setDraggedSongId(null);
            return;
        };

        const reorderedSongs = [...songs];
        const draggedIndex = reorderedSongs.findIndex(s => s.id === draggedSongId);
        const targetIndex = reorderedSongs.findIndex(s => s.id === dropTargetId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        const [removed] = reorderedSongs.splice(draggedIndex, 1);
        reorderedSongs.splice(targetIndex, 0, removed);
        
        setPlaylists(prev => prev.map(p => p.id === activePlaylistId ? { ...p, songs: reorderedSongs } : p));
        setDraggedSongId(null);
    };
    
    const handleDragEnd = (e: React.DragEvent<HTMLLIElement>) => {
         e.currentTarget.classList.remove('dragging');
         setDraggedSongId(null); // Clean up in case drop doesn't fire
    };

    const handleCreatePlaylist = (name: string) => {
        const newPlaylist: Playlist = {
            id: `playlist-${Date.now()}`,
            name: name,
            songs: [],
        };
        setPlaylists(prev => [...prev, newPlaylist]);
        setActivePlaylistId(newPlaylist.id);
        setIsCreatingPlaylist(false);
    };
    
    const handlePlaylistChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        stopPlayback();
        setActivePlaylistId(event.target.value);
    };

    const toggleShuffle = () => {
        stopPlayback();
        setIsShuffle(prev => !prev);
    };

    const currentSongId = currentQueueIndex !== null ? playQueue[currentQueueIndex] : null;
    const currentSong = currentSongId ? songs.find(s => s.id === currentSongId) : null;

    if (!hasAgreed) {
        return (
            <>
                <WelcomeScreen 
                    onAgree={handleAgreeToTerms} 
                    onShowTerms={() => setViewingLegalDoc(TERMS_CONTENT)} 
                    onShowPrivacy={() => setViewingLegalDoc(PRIVACY_POLICY_CONTENT)}
                />
                {viewingLegalDoc && <ViewLegalModal title={viewingLegalDoc.title} content={viewingLegalDoc.content} onClose={() => setViewingLegalDoc(null)} />}
            </>
        );
    }

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>AI MIX DJ</h1>
                <nav>
                    <a onClick={() => setCurrentPage('home')}>Home</a>
                    <a onClick={() => setCurrentPage('about')}>About</a>
                    <a onClick={() => setCurrentPage('contact')}>Contact</a>
                </nav>
            </header>

            {currentPage === 'home' ? (
                <main className="main-content">
                    <section className="playlist-panel">
                        <div className="playlist-header">
                            <select className="playlist-selector" value={activePlaylistId || ''} onChange={handlePlaylistChange}>
                                {playlists.map(playlist => (
                                    <option key={playlist.id} value={playlist.id}>{playlist.name}</option>
                                ))}
                            </select>
                            <button className="new-playlist-btn" onClick={() => setIsCreatingPlaylist(true)}>New</button>
                        </div>
                        <label htmlFor="file-input" className="file-input-label">Add Songs to '{activePlaylist?.name || ''}'</label>
                        <input id="file-input" type="file" multiple accept="audio/*" onChange={handleFileChange} />
                        <ul className="song-list">
                            {songs.map((song) => {
                                const isCurrentlyPlaying = song.id === currentSongId;
                                return (
                                    <li key={song.id} 
                                        className={`song-item ${isCurrentlyPlaying ? 'playing' : ''}`}
                                        draggable={true}
                                        onDragStart={(e) => handleDragStart(e, song.id)}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={(e) => handleDrop(e, song.id)}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <div className="drag-handle" draggable onDragStart={(e) => {e.preventDefault(); e.stopPropagation();}} onMouseDown={(e) => e.stopPropagation()}>::</div>
                                        <div className="song-item-main" onClick={() => handleSongClick(song.id)}>
                                            <label className="song-item-label" onClick={(e) => e.stopPropagation()}>
                                                <input
                                                    type="checkbox"
                                                    checked={song.playFull}
                                                    onChange={() => handleCheckboxChange(song.id)}
                                                />
                                            </label>
                                            <span>{song.name}</span>
                                        </div>
                                        <button className="remove-song-btn" onClick={(e) => { e.stopPropagation(); handleRemoveSong(song.id); }}>×</button>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>
                    <section className="controls-panel">
                        <div>
                            <h2>Now Playing</h2>
                            <div className="now-playing">
                                <p className="now-playing-title">{currentSong?.name || 'No song selected'}</p>
                                <p className="now-playing-artist">{currentSong ? (currentSong.playFull ? 'Playing Full Song' : '') : 'Upload songs to begin'}</p>
                            </div>

                            <div className="progress-bar-container">
                                 <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                            </div>

                            <div className="playback-controls">
                                <button className={`control-btn shuffle ${isShuffle ? 'active' : ''}`} aria-label="Shuffle" onClick={toggleShuffle}>
                                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>
                                </button>
                                <button className="control-btn" aria-label="Next Song" onClick={playNextSong} disabled={playQueue.length < 1}>
                                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                                </button>
                                <button className="control-btn play-pause" aria-label={isPlaying ? 'Pause' : 'Play'} onClick={togglePlayPause} disabled={playQueue.length === 0}>
                                    {isPlaying ? (
                                         <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                                    ) : (
                                         <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                                    )}
                                </button>
                                <div className="volume-control">
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={volume}
                                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                                        className="volume-slider"
                                        aria-label="Volume"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="ad-space"></div>
                    </section>
                </main>
             ) : (
                <StaticPage pageKey={currentPage} onBack={() => setCurrentPage('home')} />
             )}

            <footer className="app-footer">
                <div className="footer-links">
                    <a onClick={() => setViewingLegalDoc(TERMS_CONTENT)}>Terms of Service</a>
                    <a onClick={() => setViewingLegalDoc(PRIVACY_POLICY_CONTENT)}>Privacy Policy</a>
                </div>
                <p className="copyright-notice">© {new Date().getFullYear()} AI Mix DJ. All Rights Reserved.</p>
            </footer>
            
            {isCreatingPlaylist && <CreatePlaylistModal onClose={() => setIsCreatingPlaylist(false)} onCreate={handleCreatePlaylist} />}
            {viewingLegalDoc && <ViewLegalModal title={viewingLegalDoc.title} content={viewingLegalDoc.content} onClose={() => setViewingLegalDoc(null)} />}
            
            <audio ref={audio1Ref} />
            <audio ref={audio2Ref} />
        </div>
    );
};

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}
