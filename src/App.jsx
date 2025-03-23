import { useState, useEffect, useRef } from "react";
import axios from "axios";

function App() {
  const [songs, setSongs] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [volume, setVolume] = useState(50);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post(
          "https://spotifyreplicatry.onrender.com/allsongs"
        );
        setSongs(response.data.allsongs);
      } catch (error) {
        console.error("Error fetching songs:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (songs.length > 0) {
      audioRef.current.src = songs[currentSongIndex]?.songURL;
      if (isPlaying) audioRef.current.play();
    }
  }, [currentSongIndex, songs]);

  useEffect(() => {
    audioRef.current.volume = volume / 100;
  }, [volume]);

  useEffect(() => {
    const updateSeek = () => {
      if (audioRef.current.duration) {
        setSeekValue(
          (audioRef.current.currentTime / audioRef.current.duration) * 100
        );
      }
    };

    // Play next song when current song ends
    const handleSongEnd = () => {
      handleNext();
    };

    audioRef.current.addEventListener("timeupdate", updateSeek);
    audioRef.current.addEventListener("ended", handleSongEnd);

    return () => {
      audioRef.current.removeEventListener("timeupdate", updateSeek);
      audioRef.current.removeEventListener("ended", handleSongEnd);
    };
  }, []);

  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setCurrentSongIndex((prevIndex) =>
      prevIndex === songs.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrev = () => {
    setCurrentSongIndex((prevIndex) =>
      prevIndex === 0 ? songs.length - 1 : prevIndex - 1
    );
  };

  const handleSeek = (e) => {
    const newTime =
      (e.target.value / 100) * (audioRef.current.duration || 0);
    audioRef.current.currentTime = newTime;
    setSeekValue(e.target.value);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <nav className="bg-slate-800 flex items-center px-5 h-16">
        <h1 className="text-xl font-bold">ONE-STOP-MUSIC</h1>
      </nav>

      {/* Songs List */}
      <main className="p-5 grid grid-cols-2 gap-5">
        {songs.map((song, index) => (
          <div
            key={song._id}
            className="border rounded-lg p-3 bg-gray-800 hover:bg-gray-700 cursor-pointer"
            onClick={() => setCurrentSongIndex(index)}
          >
            <img
              src={song.songAvatarURL}
              alt={song.title}
              className="w-full h-40 object-cover rounded-md"
            />
            <div className="mt-2">
              <h2 className="text-lg font-semibold truncate">{song.title}</h2>
              <p className="text-sm text-gray-400">{song.artist}</p>
            </div>
          </div>
        ))}
      </main>

      {/* Footer (Music Player) */}
      {songs.length > 0 && (
        <footer className="fixed bottom-0 left-0 w-full h-20 bg-black text-white border-t border-gray-700 flex items-center px-5 justify-between">
          {/* Left Side - Seek Bar */}
          <div className="flex items-center gap-3 w-1/3">
            <span className="text-sm">
              {new Date(audioRef.current.currentTime * 1000)
                .toISOString()
                .substr(14, 5)}
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={isNaN(seekValue) ? 0 : seekValue}
              onChange={handleSeek}
              className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm">
              {audioRef.current.duration
                ? new Date(audioRef.current.duration * 1000)
                    .toISOString()
                    .substr(14, 5)
                : "00:00"}
            </span>
          </div>

          {/* Center - Controls */}
          <div className="flex items-center gap-5">
            <button className="w-[10px]" onClick={handlePrev}>
              ⏮️
            </button>
            <button className="w-[10px]" onClick={handlePlayPause}>
              {isPlaying ? "⏸️" : "▶️"}
            </button>
            <button onClick={handleNext}>⏭️</button>
          </div>

          {/* Right Side - Volume and Settings */}
          <div className="flex items-center gap-5 w-1/3 justify-end">
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <button>🔊</button>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
