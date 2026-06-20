// src/pages/Bootcamps/ScreenShareViewer.jsx
// Architecture : Viewer enregistre son peer_id → Instructeur l'appelle avec le stream
import { useState, useRef, useEffect, useCallback } from "react";
import api from "../../api/api";
import {
  Volume2, VolumeX, Maximize2, Minimize2,
  Loader, WifiOff, Radio, Lock, RefreshCw, MonitorPlay,
} from "lucide-react";

const PEER_SERVER = { host: "0.peerjs.com", port: 443, secure: true, path: "/" };

function loadPeerJS() {
  return new Promise((resolve, reject) => {
    if (window.Peer) { resolve(); return; }
    const s = document.createElement("script");
    s.src = "https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js";
    s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}

function ScreenShareViewer({ bootcamp, isRegistered, onRequestRegister }) {
  const [status,  setStatus]  = useState("waiting");
  const [muted,   setMuted]   = useState(false);
  const [fullscr, setFullscr] = useState(false);
  const [error,   setError]   = useState("");

  const videoRef   = useRef(null);
  const peerRef    = useRef(null);
  const wrapRef    = useRef(null);
  const pollRef    = useRef(null);
  const heartbRef  = useRef(null); // heartbeat pour garder viewer_peer vivant
  const myPeerId   = useRef(null);
  const initialized= useRef(false);

  const fmtPrice = (n) => Number(n || 0).toLocaleString("fr-FR");

  // ── Nettoyage ──────────────────────────────────────────
  const cleanup = useCallback(async () => {
    clearInterval(pollRef.current);
    clearInterval(heartbRef.current);
    peerRef.current?.destroy();
    peerRef.current = null;
    myPeerId.current = null;
    initialized.current = false;
    if (videoRef.current) videoRef.current.srcObject = null;
    try { await api.delete(`/bootcamps/${bootcamp.id}/viewer-peer`); } catch (_) {}
  }, [bootcamp.id]);

  // ── Initialiser PeerJS + enregistrer peer_id ──────────
  const initPeer = useCallback(async () => {
    if (initialized.current) return;
    initialized.current = true;

    try {
      await loadPeerJS();

      // Vérifier d'abord que le live est actif
      const r    = await api.get(`/bootcamps/${bootcamp.id}/peer`);
      const data = r.data?.data;

      if (data?.reason === "not_registered") { setStatus("blocked"); return; }
      if (data?.status === "ended")           { setStatus("ended");   return; }
      if (data?.status !== "live" || data?.stream_type !== "webrtc") {
        setStatus("waiting"); return;
      }

      // Créer notre Peer
      const peer = new window.Peer(undefined, PEER_SERVER);
      peerRef.current = peer;

      peer.on("open", async (peerId) => {
        myPeerId.current = peerId;

        // Enregistrer notre peer_id → l'instructeur va nous appeler
        await api.post(`/bootcamps/${bootcamp.id}/viewer-peer`, { peer_id: peerId });

        // Heartbeat toutes les 10s pour rester dans la liste
        heartbRef.current = setInterval(async () => {
          try {
            await api.post(`/bootcamps/${bootcamp.id}/viewer-peer`, { peer_id: peerId });
          } catch (_) {}
        }, 10000);

        setStatus("connecting");

        // Timeout 20s si pas d'appel reçu
        const timeout = setTimeout(() => {
          if (videoRef.current?.srcObject == null) {
            setStatus("error");
            setError("L'instructeur ne répond pas. Réessayez dans quelques secondes.");
          }
        }, 20000);

        // Recevoir l'appel de l'instructeur
        peer.on("call", (call) => {
          clearTimeout(timeout);
          call.answer(); // Répondre sans stream — on veut juste recevoir

          call.on("stream", (remoteStream) => {
            if (videoRef.current) {
              videoRef.current.srcObject = remoteStream;
              videoRef.current.play().catch(() => {});
            }
            setStatus("streaming");
            setError("");
          });

          call.on("close", () => {
            setStatus("waiting");
            initialized.current = false;
            if (videoRef.current) videoRef.current.srcObject = null;
          });

          call.on("error", () => {
            setStatus("error");
            setError("Connexion interrompue avec l'instructeur");
          });
        });
      });

      peer.on("error", (err) => {
        console.error("Peer error:", err.type);
        if (err.type === "network" || err.type === "disconnected") {
          setStatus("error");
          setError("Problème réseau WebRTC");
        } else {
          setStatus("error");
          setError("Erreur: " + err.message);
        }
        initialized.current = false;
      });

    } catch (err) {
      setStatus("error");
      setError("Erreur initialisation: " + err.message);
      initialized.current = false;
    }
  }, [bootcamp.id]);

  // ── Poll pour détecter début/fin du live ──────────────
  const pollLive = useCallback(async () => {
    try {
      const r    = await api.get(`/bootcamps/${bootcamp.id}/peer`);
      const data = r.data?.data;

      if (!data) return;

      if (data.reason === "not_registered") { setStatus("blocked"); cleanup(); return; }

      if (data.status === "live" && data.stream_type === "webrtc" && data.peer_id) {
        // Live actif → s'initialiser si pas encore fait
        if (!initialized.current && status !== "streaming") {
          initPeer();
        }
      } else if (data.status === "ended") {
        if (status !== "ended") { setStatus("ended"); cleanup(); }
      } else if (!data.peer_id && status === "streaming") {
        setStatus("waiting");
        await cleanup();
      }
    } catch (_) {}
  }, [bootcamp.id, status, initPeer, cleanup]);

  useEffect(() => {
    pollLive(); // Vérification immédiate
    pollRef.current = setInterval(pollLive, 4000);
    return () => { cleanup(); };
  }, []);

  // ── Plein écran ───────────────────────────────────────
  const toggleFS = () => {
    if (!document.fullscreenElement) { wrapRef.current?.requestFullscreen(); setFullscr(true); }
    else { document.exitFullscreen(); setFullscr(false); }
  };
  useEffect(() => {
    const h = () => setFullscr(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  // ── Overlay ────────────────────────────────────────────
  const Overlay = ({ icon: Icon, color, title, sub, action }) => (
    <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center", gap:14, background:"rgba(10,8,40,0.9)" }}>
      <div style={{ width:60, height:60, borderRadius:"50%", background:"rgba(255,255,255,0.07)",
        display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Icon size={28} color={color || "rgba(255,255,255,0.4)"} />
      </div>
      <div style={{ textAlign:"center", padding:"0 24px" }}>
        <p style={{ color:"white", fontWeight:800, fontSize:16, margin:"0 0 7px" }}>{title}</p>
        {sub && <p style={{ color:"rgba(255,255,255,0.5)", fontSize:13, margin:0, lineHeight:1.6 }}>{sub}</p>}
      </div>
      {action}
    </div>
  );

  return (
    <div ref={wrapRef} style={{ borderRadius:16, overflow:"hidden", background:"#0a0820",
      aspectRatio:"16/9", position:"relative",
      border: status === "streaming" ? "2px solid #ef4444" : "2px solid #1e1b4b" }}>

      <video ref={videoRef} autoPlay playsInline muted={muted}
        style={{ width:"100%", height:"100%", objectFit:"contain", display:"block" }} />

      {/* Overlays */}
      {status === "waiting" && (
        <Overlay icon={Radio} color="#facc15"
          title="En attente du live..."
          sub="L'instructeur n'a pas encore démarré. La page se met à jour automatiquement."
          action={
            <div style={{ display:"flex", alignItems:"center", gap:8,
              background:"rgba(255,255,255,0.07)", borderRadius:20, padding:"6px 16px" }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:"#facc15",
                animation:"blink 1.5s infinite", display:"block" }} />
              <span style={{ color:"rgba(255,255,255,0.6)", fontSize:12 }}>Connexion surveillée</span>
            </div>
          }
        />
      )}

      {status === "connecting" && (
        <Overlay icon={Loader} color="#5653e1"
          title="En attente de l'instructeur..."
          sub="Votre connexion est prête. L'instructeur va vous envoyer le stream sous peu."
          action={
            <div style={{ width:32, height:32, border:"3px solid #5653e1",
              borderTopColor:"transparent", borderRadius:"50%",
              animation:"spin 1s linear infinite" }} />
          }
        />
      )}

      {status === "blocked" && (
        <Overlay icon={Lock} color="#f59e0b"
          title="Accès réservé aux inscrits"
          sub={bootcamp.is_free
            ? "Inscrivez-vous gratuitement pour accéder au live."
            : `Inscrivez-vous pour ${fmtPrice(bootcamp.price)} FCFA.`}
          action={
            <button onClick={onRequestRegister}
              style={{ padding:"12px 28px", borderRadius:14, border:"none",
                background:"linear-gradient(135deg,#2d287f,#5653e1)",
                color:"white", fontWeight:900, fontSize:14, cursor:"pointer" }}>
              {bootcamp.is_free ? "🎉 S'inscrire gratuitement" : `S'inscrire — ${fmtPrice(bootcamp.price)} FCFA`}
            </button>
          }
        />
      )}

      {status === "ended" && (
        <Overlay icon={MonitorPlay} color="#10b981"
          title="Live terminé"
          sub="Merci pour votre participation ! Le replay sera disponible prochainement."
        />
      )}

      {status === "error" && (
        <Overlay icon={WifiOff} color="#ef4444"
          title="Problème de connexion"
          sub={error}
          action={
            <button onClick={() => {
              setStatus("waiting");
              initialized.current = false;
              cleanup().then(() => setTimeout(pollLive, 500));
            }}
              style={{ padding:"10px 22px", borderRadius:12,
                border:"1px solid rgba(255,255,255,0.2)",
                background:"rgba(255,255,255,0.1)", color:"white",
                fontWeight:700, fontSize:13, cursor:"pointer",
                display:"flex", alignItems:"center", gap:7 }}>
              <RefreshCw size={14} /> Réessayer
            </button>
          }
        />
      )}

      {/* Contrôles si streaming */}
      {status === "streaming" && (
        <>
          <div style={{ position:"absolute", top:12, left:12, display:"flex",
            alignItems:"center", gap:6, background:"rgba(239,68,68,0.9)",
            borderRadius:20, padding:"4px 12px" }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:"white",
              animation:"pulse 1.5s infinite", display:"block" }} />
            <span style={{ color:"white", fontWeight:800, fontSize:12 }}>EN DIRECT</span>
          </div>
          <div style={{ position:"absolute", bottom:12, right:12, display:"flex", gap:8 }}>
            <button onClick={() => setMuted(!muted)}
              style={{ width:38, height:38, borderRadius:10, background:"rgba(0,0,0,0.65)",
                border:"1px solid rgba(255,255,255,0.15)", cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center" }}>
              {muted ? <VolumeX size={16} color="white" /> : <Volume2 size={16} color="white" />}
            </button>
            <button onClick={toggleFS}
              style={{ width:38, height:38, borderRadius:10, background:"rgba(0,0,0,0.65)",
                border:"1px solid rgba(255,255,255,0.15)", cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center" }}>
              {fullscr ? <Minimize2 size={16} color="white" /> : <Maximize2 size={16} color="white" />}
            </button>
          </div>
        </>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.15} }
        @keyframes spin  { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}

export default ScreenShareViewer;