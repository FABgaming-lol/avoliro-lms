import React, { useEffect, useMemo, useRef, useState } from "react";

/* ---------------------- Constants & Helpers ---------------------- */
const STORAGE_KEY = "avoliro_progress_v1";

/* Load progress safely */
function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveProgress(obj) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch {}
}

function extractYouTubeID(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    return null;
  } catch {
    return null;
  }
}

function ytThumbnailUrl(id) {
  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

function detectAspectClass(width, height) {
  if (!width || !height) return "ar-16-9";
  const ratio = width / height;
  if (ratio > 2.2) return "ar-21-9";
  if (ratio > 1.7) return "ar-16-9";
  if (ratio > 1.3) return "ar-4-3";
  if (ratio > 0.9) return "ar-1-1";
  return "ar-9-16";
}

/* ---------------------- Page transition wrapper ---------------------- */
function Page({ children, anim = "fade", keyProp }) {
  const cls =
    anim === "slide-left"
      ? "page page-slide-left"
      : anim === "slide-right"
      ? "page page-slide-right"
      : anim === "crossfade"
      ? "page page-crossfade"
      : "page page-fade";
  return (
    <div key={keyProp} className={cls} style={{ willChange: "opacity, transform" }}>
      {children}
    </div>
  );
}

/* ---------------------- Sidebar (viewer-only, fixed collapsed UI) ---------------------- */
function Sidebar({
  logo = "/logo.png",
  categories = [],
  activeCategory,
  collapsed,
  sidebarOpen,
  onSelectCategory,
  onShowAll,
  onToggleCollapse,
  onCloseMobile,
}) {
  const isCollapsed = !!collapsed;

  return (
    <aside
      className={`card ${sidebarOpen ? "sidebar-open" : ""}`}
      style={{
        width: isCollapsed ? 64 : 280,
        minWidth: isCollapsed ? 64 : 220,
        padding: isCollapsed ? "12px 8px" : "18px",
        height: "calc(100vh - 48px)",
        overflowY: "auto",
        position: "sticky",
        top: 24,
        transition: "width .22s ease, transform .22s ease, padding .22s ease",
        zIndex: 999,
      }}
      aria-label="AVOLIRO Sidebar"
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: isCollapsed ? 0 : 12,
          justifyContent: isCollapsed ? "center" : "flex-start",
          flexDirection: isCollapsed ? "column" : "row",
          marginBottom: 18,
        }}
      >
        <img
          src={logo}
          alt="Avoliro Logo"
          style={{
            width: isCollapsed ? 36 : 44,
            height: isCollapsed ? 36 : 44,
            borderRadius: 12,
            objectFit: "cover",
            boxShadow: "0 0 18px rgba(255,180,0,0.22)",
            margin: isCollapsed ? "6px 0" : undefined,
          }}
        />

        {!isCollapsed && (
          <div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>AVOLIRO</div>
            <div style={{ fontSize: 12, color: "var(--avoliro-text-muted)" }}>Staff Training</div>
          </div>
        )}

        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {!sidebarOpen && (
            <button
              className="btn btn-dark"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={onToggleCollapse}
            >
              {isCollapsed ? "☰" : "«"}
            </button>
          )}
          {sidebarOpen && (
            <button className="btn btn-dark" onClick={onCloseMobile} aria-label="Close sidebar">✕</button>
          )}
        </div>
      </div>

      <nav role="navigation" aria-label="Main navigation" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button
          className="nav-btn"
          onClick={() => { onShowAll(); onCloseMobile(); }}
          style={{ padding: isCollapsed ? "10px 0" : "10px 14px", textAlign: "center" }}
        >
          {isCollapsed ? "🏠" : "All Videos"}
        </button>

        {!isCollapsed && <div style={{ color: "var(--avoliro-text-muted)", fontSize: 12, marginTop: 6 }}>Categories</div>}

        {categories.map((c) => (
          <button
            key={c}
            className="nav-btn"
            onClick={() => { onSelectCategory(c); onCloseMobile(); }}
            style={{
              background: activeCategory === c ? "rgba(255,180,0,0.12)" : undefined,
              padding: isCollapsed ? "10px 0" : "10px 14px",
              width: "100%",
              textAlign: "center",
            }}
          >
            {isCollapsed ? c[0] : c}
          </button>
        ))}
      </nav>
    </aside>
  );
}

/* ---------------------- VideoCard ---------------------- */
function VideoCard({ v, progress, onPlay }) {
  const ytId = v.type === "youtube" ? extractYouTubeID(v.url) : null;
  const thumb = ytId ? ytThumbnailUrl(ytId) : null;

  return (
    <div className="card" role="article" aria-label={v.title}>
      <div
        className="video-thumb"
        style={{
          backgroundImage: thumb ? `url(${thumb})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: 150,
          borderRadius: 10,
          position: "relative",
        }}
      >
        {!thumb && <div style={{ color: "var(--avoliro-text-muted)" }}>{v.type === "youtube" ? "YouTube" : "External"}</div>}

        {progress?.playedSeconds > 0 && (
          <div style={{
            position: "absolute", bottom: 8, left: 8,
            background: "rgba(0,0,0,0.45)", padding: "4px 8px", borderRadius: 999, fontSize: 12
          }}>
            {Math.round((progress.playedSeconds / Math.max(progress.duration || 1, 1)) * 100)}%
          </div>
        )}
      </div>

      <div style={{ marginTop: 10 }}>
        <div style={{ fontWeight: 800 }}>{v.title}</div>
        <div style={{ color: "var(--avoliro-text-muted)", fontSize: 12 }}>{v.category}</div>
      </div>

      <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", gap: 8 }}>
        <button className="btn btn-gold" onClick={() => onPlay(v)}>Play</button>
        <a className="btn btn-dark" href={v.url} target="_blank" rel="noreferrer">Open</a>
      </div>
    </div>
  );
}

/* ---------------------- VideoPlayer (with auto aspect, theatre, controls) ---------------------- */
function VideoPlayer({ video, onBack, onProgress }) {
  const videoRef = useRef(null);
  const [aspectClass, setAspectClass] = useState("ar-16-9");
  const [theatre, setTheatre] = useState(false);
  const [speed, setSpeed] = useState(1);

  const ytId = video.type === "youtube" ? extractYouTubeID(video.url) : null;

  useEffect(() => {
    if (!video) return;

    // External HTML5: detect metadata and track progress
    if (video.type === "external") {
      const el = videoRef.current;
      if (!el) return;

      const onLoaded = () => {
        setAspectClass(detectAspectClass(el.videoWidth, el.videoHeight));
      };
      const onTime = () => {
        onProgress(video.id, { playedSeconds: el.currentTime, duration: el.duration || 0, lastSeen: Date.now() });
      };

      el.addEventListener("loadedmetadata", onLoaded);
      el.addEventListener("timeupdate", onTime);

      // restore playback rate
      el.playbackRate = speed;

      return () => {
        el.removeEventListener("loadedmetadata", onLoaded);
        el.removeEventListener("timeupdate", onTime);
      };
    }

    // YouTube: try to fetch metadata via noembed
    if (video.type === "youtube" && ytId) {
      fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${ytId}`)
        .then((r) => r.json())
        .then((meta) => {
          if (meta.width && meta.height) setAspectClass(detectAspectClass(meta.width, meta.height));
          else setAspectClass("ar-16-9");
        })
        .catch(() => setAspectClass("ar-16-9"));
    }
  }, [video, ytId, speed, onProgress]);

  function toggleTheatre() {
    setTheatre((t) => !t);
    if (!theatre) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cycleSpeed() {
    if (video.type !== "external") return;
    let next = Math.round(speed * 100 + 25) / 100;
    if (next > 2.0) next = 0.5;
    setSpeed(next);
    if (videoRef.current) videoRef.current.playbackRate = next;
  }

  async function enterPip() {
    if (video.type !== "external") return;
    try {
      if (document.pictureInPictureEnabled && videoRef.current) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch {}
  }

  const wrapperClass = theatre ? "video-wrapper theatre-mode" : `video-wrapper ${aspectClass}`;

  return (
    <div className="card" style={{ width: "100%" }}>
      <div className={wrapperClass}>
        {video.type === "youtube" && ytId ? (
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?modestbranding=1&rel=0`}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ border: 0 }}
          />
        ) : (
          <video ref={videoRef} controls src={video.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        )}
      </div>

      <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontWeight: 900 }}>{video.title}</h2>
          <p style={{ marginTop: 6, color: "var(--avoliro-text-muted)" }}>{video.description}</p>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginTop: 8 }}>
          <button className="control-btn" onClick={toggleTheatre}>🎬 {theatre ? "Exit Theatre" : "Theatre"}</button>
          {video.type === "external" && <button className="control-btn" onClick={enterPip}>🖥 PiP</button>}
          {video.type === "external" && <button className="control-btn" onClick={cycleSpeed}>⚡ {speed}x</button>}
          <button className="control-btn" onClick={onBack}>← Back</button>
          <a className="control-btn" href={video.url} target="_blank" rel="noreferrer">Open Raw</a>
        </div>
      </div>
    </div>
  );
}

/* ---------------------- Main App ---------------------- */
export default function App() {
  // state
  const [videos, setVideos] = useState([]);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [progressMap, setProgressMap] = useState(() => loadProgress());

  // fetch videos.json (detailed format)
  useEffect(() => {
    fetch("/videos.json")
      .then((r) => r.json())
      .then((data) => {
        // normalize entries: ensure required fields exist
        const normalized = data.map((it) => ({
          id: it.id || `${it.type || "ext"}-${Math.random().toString(36).slice(2, 9)}`,
          title: it.title || "Untitled",
          description: it.description || "",
          type: it.type || (extractYouTubeID(it.url) ? "youtube" : "external"),
          url: it.url,
          category: it.category || "General",
          uploadedAt: it.uploadedAt || new Date().toISOString(),
        }));
        normalized.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
        setVideos(normalized);
      })
      .catch((e) => {
        console.error("Failed to load /videos.json", e);
      });
  }, []);

  // persist progressMap
  useEffect(() => {
    saveProgress(progressMap);
  }, [progressMap]);

  // keyboard shortcuts
  useEffect(() => {
    function onKey(e) {
      if (e.key === "/" && !selected) {
        const el = document.querySelector("#searchbar");
        el?.focus();
        e.preventDefault();
      }
      if (e.key === "Escape" && selected) {
        setSelected(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  // derived lists
  const categories = useMemo(() => {
    const s = new Set(videos.map((v) => v.category));
    return Array.from(s);
  }, [videos]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return videos.filter((v) => {
      if (category && v.category !== category) return false;
      if (!q) return true;
      return (
        v.title.toLowerCase().includes(q) ||
        (v.description || "").toLowerCase().includes(q) ||
        (v.category || "").toLowerCase().includes(q)
      );
    });
  }, [videos, query, category]);

  const continueWatching = useMemo(() => {
    return Object.entries(progressMap)
      .map(([id, p]) => ({ id, ...p, video: videos.find((v) => v.id === id) }))
      .filter((x) => x.video)
      .sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0));
  }, [progressMap, videos]);

  function handlePlay(v) {
    setSelected(v);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleBack() {
    setSelected(null);
  }

  function handleProgressUpdate(id, data) {
    setProgressMap((p) => ({ ...(p || {}), [id]: { ...(p[id] || {}), ...data } }));
  }

  // SPA transitions
  const [lastView, setLastView] = useState("library");
  useEffect(() => {
    setLastView(selected ? "player" : "library");
  }, [selected]);
  const pageKey = selected ? `player-${selected.id}` : `lib-${category || "all"}-${query}`;
  const anim = selected ? "slide-left" : lastView === "player" ? "slide-right" : "fade";

  return (
    <div style={{ display: "flex", gap: 20, padding: 24 }}>
      {/* Sidebar */}
      <Sidebar
        categories={categories}
        activeCategory={category}
        collapsed={collapsed}
        sidebarOpen={sidebarOpen}
        onSelectCategory={(c) => setCategory(c)}
        onShowAll={() => setCategory(null)}
        onToggleCollapse={() => setCollapsed((s) => !s)}
        onCloseMobile={() => setSidebarOpen(false)}
      />

      {/* Main */}
      <main style={{ flex: 1, minWidth: 0 }}>
        {/* Desktop header */}
        <header className="header fade-in" style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img src="/logo.png" alt="logo" style={{ width: 56, height: 56, borderRadius: 12, objectFit: "cover", boxShadow: "0 0 18px rgba(255,180,0,0.22)" }} />
              <div>
                <div style={{ fontSize: 20, fontWeight: 900 }}>AVOLIRO Staff Academy</div>
                <div style={{ fontSize: 12, color: "var(--avoliro-text-muted)" }}>Premium internal training</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="nav-btn" onClick={() => { setSelected(null); setCategory(null); }}>Library</button>
              <button className="nav-btn" onClick={() => setSidebarOpen((s) => !s)}>☰</button>
            </div>
          </div>
        </header>

        {/* Mobile header (visible on small screens via CSS) */}
        <div className="mobile-header" style={{ marginBottom: 12, display: "none" }}>
          <button className="btn btn-dark" onClick={() => setSidebarOpen(true)}>☰</button>
          <img src="/logo.png" alt="Avoliro" style={{ height: 40, borderRadius: 10 }} />
          <button className="btn btn-dark" onClick={() => document.getElementById("searchbar")?.focus()}>🔍</button>
        </div>

        {/* Search + Filters */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
          <input
            id="searchbar"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses, descriptions, categories..."
            style={{
              flex: 1,
              padding: "12px 14px",
              borderRadius: 12,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              color: "white",
            }}
          />

          <div style={{ width: 220 }}>
            <div style={{ fontSize: 13, color: "var(--avoliro-text-muted)", marginBottom: 8 }}>Filters</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn btn-outline" onClick={() => setCategory(null)}>All</button>
              {categories.map((c) => <button key={c} className="btn btn-dark" onClick={() => setCategory(c)}>{c}</button>)}
            </div>
          </div>
        </div>

        {/* Page wrapper (transitions) */}
        <Page keyProp={pageKey} anim={anim}>
          {selected ? (
            <>
              <VideoPlayer video={selected} onBack={handleBack} onProgress={handleProgressUpdate} />

              {/* Related */}
              <div style={{ marginTop: 14 }}>
                <div style={{ fontWeight: 900, marginBottom: 8 }}>Related</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
                  {videos.filter((x) => x.id !== selected.id && x.category === selected.category).slice(0, 6).map((v) => (
                    <div key={v.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 800 }}>{v.title}</div>
                        <div style={{ color: "var(--avoliro-text-muted)", fontSize: 12 }}>{v.category}</div>
                      </div>
                      <div>
                        <button className="btn btn-gold" onClick={() => handlePlay(v)}>Play</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Continue watching */}
              {continueWatching.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 13, color: "var(--avoliro-text-muted)", marginBottom: 8 }}>Continue Watching</div>
                  <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
                    {continueWatching.map((c) => (
                      <div key={c.video.id} className="card" style={{ minWidth: 240 }}>
                        <div style={{ fontWeight: 800 }}>{c.video.title}</div>
                        <div style={{ fontSize: 12, color: "var(--avoliro-text-muted)" }}>{Math.round((c.playedSeconds / Math.max(c.duration || 1, 1)) * 100)}% watched</div>
                        <div style={{ marginTop: 8 }}>
                          <button className="btn btn-gold" onClick={() => handlePlay(c.video)}>Resume</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Course Library</h2>

              <div className="grid-videos">
                {filtered.map((v) => <VideoCard key={v.id} v={v} progress={progressMap[v.id]} onPlay={handlePlay} />)}
              </div>
            </>
          )}
        </Page>
      </main>

      {/* Mobile bottom nav */}
      <div className="mobile-nav" role="navigation" aria-label="Mobile navigation">
        <button className={!selected ? "active" : ""} onClick={() => { setSelected(null); setCategory(null); window.scrollTo({ top: 0 }); }}>
          <span>🏠</span><small>Home</small>
        </button>

        <button onClick={() => document.getElementById("searchbar")?.focus()}>
          <span>🔍</span><small>Search</small>
        </button>

        <button onClick={() => setCategory(category ? null : (categories[0] || null))}>
          <span>📂</span><small>Categories</small>
        </button>

        <button onClick={() => alert("Profile coming soon!")}>
          <span>👤</span><small>Profile</small>
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 998 }} />
      )}
    </div>
  );
}