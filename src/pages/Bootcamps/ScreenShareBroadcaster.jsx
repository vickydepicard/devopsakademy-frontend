// src/pages/Bootcamps/ScreenShareBroadcaster.jsx
// Instructeur : partage écran → appelle chaque viewer qui s'enregistre
import { useState, useRef, useEffect, useCallback } from "react";
import api from "../../api/api";
import {
  Monitor, Camera, Mic, MicOff, Users, Radio,
  StopCircle, AlertCircle, CheckCircle, Loader, Globe, Lock,
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

function ScreenShareBroadcaster({ bootcamp, onStatusChange }) {
  const [status,      setStatus]      = useState("idle");
  const [viewers,     setViewers]     = useState(0);
  const [error,       setError]       = useState("");
  const [shareScreen, setShareScreen] = useState(true);
  const [shareWebcam, setShareWebcam] = useState(false);
  const [shareMic,    setShareMic]    = useState(true);
  const [accessMode,  setAccessMode]  = useState(bootcamp?.access_mode || "public");

  const peerRef      = useRef(null);
  const streamRef    = useRef(null);
  const previewRef   = useRef(null);
  const calledPeers  = useRef(new Set());   // viewers déjà appelés
  const activeConns  = useRef(new Map());   // peerId → call
  const pollRef      = useRef(null);

  // ── Capturer les médias ────────────────────────────────
  const captureMedia = async () => {
    const tracks = [];
    if (shareScreen) {
      // getDisplayMedia peut lancer NotAllowedError si l'user refuse
      const s = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always", frameRate: 30 }, audio: true,
      });
      tracks.push(...s.getTracks()); // inclut audio si disponible
      // Arrêt si l'utilisateur clique "Arrêter le partage" dans le navigateur
      s.getVideoTracks()[0]?.addEventListener("ended", stopBroadcast);
    }
    if (shareWebcam) {
      try {
        const c = await navigator.mediaDevices.getUserMedia({ video: true });
        tracks.push(...c.getVideoTracks());
      } catch (_) { /* Webcam non disponible — continuer sans */ }
    }
    if (shareMic && !tracks.some(t => t.kind === "audio")) {
      // N'ajouter le micro que si pas déjà capturé depuis getDisplayMedia
      try {
        const m = await navigator.mediaDevices.getUserMedia({ audio: true });
        tracks.push(...m.getAudioTracks());
      } catch (_) { /* Micro non disponible — continuer sans */ }
    }
    if (!tracks.length) throw new Error("Aucun flux sélectionné");
    return new MediaStream(tracks);
  };

  // ── Appeler un viewer avec le stream ──────────────────
  const callViewer = useCallback((viewerPeerId) => {
    if (!peerRef.current || !streamRef.current) return;
    if (calledPeers.current.has(viewerPeerId)) return;
    calledPeers.current.add(viewerPeerId);

    const call = peerRef.current.call(viewerPeerId, streamRef.current);
    activeConns.current.set(viewerPeerId, call);
    setViewers(activeConns.current.size);

    call.on("close", () => {
      activeConns.current.delete(viewerPeerId);
      calledPeers.current.delete(viewerPeerId);
      setViewers(activeConns.current.size);
    });
    call.on("error", () => {
      activeConns.current.delete(viewerPeerId);
      calledPeers.current.delete(viewerPeerId);
      setViewers(activeConns.current.size);
    });
  }, []);

  // ── Poll viewers toutes les 3s → les appeler ─────────
  const pollViewers = useCallback(async () => {
    try {
      const r = await api.get(`/bootcamps/${bootcamp.id}/viewer-peers`);
      const viewers = r.data?.data || [];
      viewers.forEach(({ peer_id }) => callViewer(peer_id));
      setViewers(activeConns.current.size);
    } catch (_) {}
  }, [bootcamp.id, callViewer]);

  // ── Arrêter ────────────────────────────────────────────
  const stopBroadcast = useCallback(async () => {
    clearInterval(pollRef.current);
    activeConns.current.forEach(call => call.close());
    activeConns.current.clear();
    calledPeers.current.clear();
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    peerRef.current?.destroy();
    peerRef.current = null;
    if (previewRef.current) previewRef.current.srcObject = null;
    try {
      await api.delete(`/bootcamps/admin/${bootcamp.id}/peer`);
      onStatusChange?.("ended");
    } catch (_) {}
    setStatus("idle");
    setViewers(0);
  }, [bootcamp, onStatusChange]);

  // ── Démarrer ───────────────────────────────────────────
  const startBroadcast = useCallback(async () => {
    setStatus("loading"); setError("");
    try {
      await loadPeerJS();
      const stream = await captureMedia();
      streamRef.current = stream;

      // Preview local
      if (previewRef.current) {
        previewRef.current.srcObject = stream;
        previewRef.current.muted = true;
      }

      const peer = new window.Peer(undefined, PEER_SERVER);
      peerRef.current = peer;

      peer.on("open", async (peerId) => {
        setStatus("sharing");

        // Enregistrer peer_id + statut live en BDD
        await api.post(`/bootcamps/admin/${bootcamp.id}/peer`, {
          peer_id: peerId, stream_type: "webrtc", access_mode: accessMode,
        });
        onStatusChange?.("live");

        // Poll viewers dès maintenant puis toutes les 3s
        await pollViewers();
        pollRef.current = setInterval(pollViewers, 3000);
      });

      peer.on("error", (err) => {
        setError("Erreur PeerJS: " + err.message);
        setStatus("error");
      });

    } catch (err) {
      // Gérer l'annulation du partage d'écran par l'utilisateur
      const msg = err.message || "";
      if (msg.includes("Permission denied") || msg.includes("NotAllowedError") || 
          err.name === "NotAllowedError" || msg.includes("cancelled") || msg.includes("abort")) {
        setError("Partage d'écran annulé. Cliquez à nouveau sur 'Démarrer le live' et autorisez le partage.");
      } else if (msg.includes("NotReadableError") || msg.includes("hardware")) {
        setError("Impossible d'accéder à l'écran. Vérifiez qu'aucune autre app ne l'utilise.");
      } else {
        setError(msg || "Impossible de démarrer le partage");
      }
      setStatus("idle"); // Retour à idle (pas error) pour permettre de réessayer directement
      // Nettoyer le stream si partiellement initialisé
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
      peerRef.current?.destroy();
      peerRef.current = null;
    }
  }, [shareScreen, shareWebcam, shareMic, accessMode, bootcamp, pollViewers, onStatusChange]);

  useEffect(() => () => { stopBroadcast(); }, []);

  const isSharing = status === "sharing";
  const isLoading = status === "loading";

  return (
    <div style={{ background:"white", borderRadius:20, border:"1.5px solid #f0f0f0", overflow:"hidden" }}>
      {/* Header */}
      <div style={{ padding:"14px 18px", background: isSharing ? "linear-gradient(135deg,#dc2626,#ef4444)" : "linear-gradient(135deg,#1e1b4b,#2d287f)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {isSharing && <span style={{ width:10, height:10, borderRadius:"50%", background:"white", animation:"pulse 1.5s infinite", display:"block" }} />}
          <span style={{ color:"white", fontWeight:800, fontSize:14 }}>
            {isSharing ? "🔴 Stream en direct" : "🎙️ Partage d'écran"}
          </span>
        </div>
        {isSharing && (
          <span style={{ background:"rgba(255,255,255,0.2)", borderRadius:20, padding:"3px 12px", color:"white", fontSize:12, fontWeight:700 }}>
            {viewers} spectateur{viewers !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <div style={{ padding:18, display:"flex", flexDirection:"column", gap:14 }}>
        {/* Preview */}
        <div style={{ borderRadius:14, overflow:"hidden", background:"#0f0f0f", aspectRatio:"16/9", position:"relative", border: isSharing ? "2px solid #ef4444" : "2px solid #e5e7eb" }}>
          <video ref={previewRef} autoPlay muted playsInline style={{ width:"100%", height:"100%", objectFit:"contain", display:"block" }} />
          {!isSharing && !isLoading && (
            <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:8 }}>
              <Monitor size={36} color="rgba(255,255,255,0.25)" />
              <p style={{ color:"rgba(255,255,255,0.4)", fontSize:13, fontWeight:600 }}>Votre écran apparaîtra ici</p>
            </div>
          )}
          {isLoading && (
            <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10 }}>
              <div style={{ width:36, height:36, border:"3px solid #5653e1", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 1s linear infinite" }} />
              <p style={{ color:"rgba(255,255,255,0.6)", fontSize:13, fontWeight:600 }}>Démarrage...</p>
            </div>
          )}
          {isSharing && (
            <div style={{ position:"absolute", bottom:10, left:10, background:"rgba(0,0,0,0.7)", borderRadius:8, padding:"4px 10px", color:"white", fontSize:11, fontWeight:700 }}>
              PREVIEW
            </div>
          )}
        </div>

        {/* Options (seulement si idle) */}
        {status === "idle" && (
          <>
            <div style={{ background:"#f8f7ff", borderRadius:14, padding:14 }}>
              <p style={{ fontSize:11, fontWeight:800, color:"#5653e1", textTransform:"uppercase", letterSpacing:"0.1em", margin:"0 0 12px" }}>
                📡 Que partager ?
              </p>
              {[
                [shareScreen, setShareScreen, Monitor, "Partager l'écran",  "Présentation, terminal, navigateur"],
                [shareWebcam, setShareWebcam, Camera,  "Ajouter la webcam", "Votre visage en incrustation"],
                [shareMic,    setShareMic,    Mic,     "Activer le micro",  "Votre voix en direct"],
              ].map(([val, setter, Icon, label, sub]) => (
                <button key={label} onClick={() => setter(!val)}
                  style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", borderRadius:10, border:"2px solid " + (val ? "#5653e1" : "#e5e7eb"), background: val ? "#f0efff" : "white", cursor:"pointer", width:"100%", marginBottom:8, textAlign:"left" }}>
                  <div style={{ width:34, height:34, borderRadius:10, background: val ? "#5653e1" : "#f3f4f6", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <Icon size={16} color={val ? "white" : "#9ca3af"} />
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:700, fontSize:13, color:"#111", margin:0 }}>{label}</p>
                    <p style={{ fontSize:11, color:"#9ca3af", margin:"1px 0 0" }}>{sub}</p>
                  </div>
                  {val && <CheckCircle size={16} color="#5653e1" />}
                </button>
              ))}
            </div>

            <div style={{ background:"#eff6ff", borderRadius:14, padding:14, border:"1px solid #bfdbfe" }}>
              <p style={{ fontSize:11, fontWeight:800, color:"#0369a1", textTransform:"uppercase", letterSpacing:"0.1em", margin:"0 0 10px" }}>🔒 Accès</p>
              <div style={{ display:"flex", gap:8 }}>
                {[["public","🌍 Tout le monde"],["registered","🔒 Inscrits"]].map(([val, label]) => (
                  <button key={val} onClick={() => setAccessMode(val)}
                    style={{ flex:1, padding:"9px", borderRadius:10, border:"2px solid " + (accessMode === val ? "#0369a1" : "#e5e7eb"), background: accessMode === val ? "#eff6ff" : "white", cursor:"pointer", fontWeight:700, fontSize:12, color: accessMode === val ? "#0369a1" : "#374151" }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Erreur */}
        {error && (
          <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:10, padding:"10px 14px", display:"flex", gap:8 }}>
            <AlertCircle size={14} color="#ef4444" style={{ flexShrink:0, marginTop:1 }} />
            <p style={{ color:"#ef4444", fontWeight:600, fontSize:13, margin:0 }}>{error}</p>
          </div>
        )}

        {/* Bouton principal */}
        {!isSharing ? (
          <button onClick={startBroadcast}
            disabled={isLoading || (!shareScreen && !shareWebcam)}
            style={{ padding:"14px", borderRadius:14, border:"none", cursor:"pointer", fontWeight:900, fontSize:15, color:"white", background: isLoading ? "#9ca3af" : "linear-gradient(135deg,#dc2626,#ef4444)", display:"flex", alignItems:"center", justifyContent:"center", gap:10, opacity:(!shareScreen && !shareWebcam) ? 0.5 : 1 }}>
            {isLoading
              ? <><div style={{ width:18, height:18, border:"2px solid white", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 1s linear infinite" }} /> Démarrage...</>
              : <><Radio size={18} /> Démarrer le live</>}
          </button>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              <div style={{ background:"#fef2f2", borderRadius:10, padding:"10px", textAlign:"center" }}>
                <Users size={16} color="#ef4444" style={{ margin:"0 auto 3px", display:"block" }} />
                <p style={{ fontWeight:900, fontSize:18, color:"#ef4444", margin:0 }}>{viewers}</p>
                <p style={{ fontSize:10, color:"#9ca3af", margin:0 }}>Spectateurs</p>
              </div>
              <div style={{ background:"#f0fdf4", borderRadius:10, padding:"10px", textAlign:"center" }}>
                <Radio size={16} color="#10b981" style={{ margin:"0 auto 3px", display:"block" }} />
                <p style={{ fontWeight:900, fontSize:14, color:"#10b981", margin:0 }}>LIVE</p>
                <p style={{ fontSize:10, color:"#9ca3af", margin:0 }}>En cours</p>
              </div>
            </div>
            <button onClick={stopBroadcast}
              style={{ padding:"13px", borderRadius:14, border:"2px solid #fecaca", background:"#fef2f2", cursor:"pointer", fontWeight:900, fontSize:14, color:"#dc2626", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              <StopCircle size={18} /> Arrêter le live
            </button>
          </div>
        )}
      </div>
      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </div>
  );
}

export default ScreenShareBroadcaster;