import { useEffect, useState } from "react";
import api from "../../api/api";
import { useAuth } from "../../contexts/AuthContext";
import {
  Trophy, Medal, Star, TrendingUp, Users,
  Crown, Zap, Award, ChevronDown
} from "lucide-react";

const PERIODS = [
  { key: "all", label: "Tout temps" },
  { key: "month", label: "Ce mois" },
  { key: "week", label: "Cette semaine" },
];

const RANK_STYLES = {
  1: { bg: "bg-gradient-to-br from-yellow-400 to-amber-500", text: "text-white", icon: <Crown className="w-5 h-5" />, ring: "ring-2 ring-yellow-400" },
  2: { bg: "bg-gradient-to-br from-gray-300 to-gray-400", text: "text-white", icon: <Medal className="w-5 h-5" />, ring: "ring-2 ring-gray-300" },
  3: { bg: "bg-gradient-to-br from-orange-400 to-amber-600", text: "text-white", icon: <Award className="w-5 h-5" />, ring: "ring-2 ring-orange-400" },
};

export default function Leaderboard() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [period, setPeriod] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Classement — DevOpsAkademy";
    fetchLeaderboard();
  }, [period]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/leaderboard?period=${period}&limit=50`);
      const d = res.data?.data;
      setData(d?.leaderboard || []);
      setMyRank(d?.my_rank || null);
    } catch (err) {
      console.error("Erreur leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-dark to-primary pb-16">

      {/* ── HERO ── */}
      <div className="relative pt-12 pb-32 px-6 text-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/20 border border-accent/30 rounded-full text-accent text-xs font-bold mb-4">
            <Zap className="w-3.5 h-3.5" /> Points en temps réel
          </span>
          <h1 className="text-3xl lg:text-5xl font-extrabold mb-3">
            🏆 Classement des apprenants
          </h1>
          <p className="text-white/70 text-lg max-w-xl mx-auto mb-8">
            Complétez des quiz et des cours pour gagner des points et grimper dans le classement.
          </p>

          {/* Filtres période */}
          <div className="inline-flex bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-1 gap-1">
            {PERIODS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setPeriod(key)}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  period === key
                    ? "bg-white text-primary-dark shadow-md"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── PODIUM TOP 3 ── */}
      <div className="max-w-4xl mx-auto px-4 -mt-24 mb-8">
        {loading ? (
          <div className="grid grid-cols-3 gap-4 animate-pulse">
            {[1,2,3].map(i => <div key={i} className="h-48 bg-white/20 rounded-2xl" />)}
          </div>
        ) : top3.length > 0 ? (
          <div className="flex items-end justify-center gap-4">
            {/* 2ème place */}
            {top3[1] && (
              <div className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-center text-white mb-4 relative">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold shadow-lg">
                  {top3[1].display_name?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="text-2xl mb-1">🥈</div>
                <p className="font-bold truncate text-sm">{top3[1].display_name}</p>
                <p className="text-accent font-bold text-lg">{top3[1].leaderboard_points?.toLocaleString("fr-FR")}</p>
                <p className="text-white/50 text-xs">pts</p>
              </div>
            )}

            {/* 1ère place */}
            {top3[0] && (
              <div className="flex-1 bg-gradient-to-b from-yellow-400/20 to-amber-500/20 backdrop-blur-md border border-yellow-400/30 rounded-2xl p-6 text-center text-white relative -translate-y-6 shadow-glow-accent">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Crown className="w-8 h-8 text-accent drop-shadow-lg" />
                </div>
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold shadow-lg ring-4 ring-yellow-400/30">
                  {top3[0].display_name?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="text-3xl mb-1">🥇</div>
                <p className="font-bold truncate">{top3[0].display_name}</p>
                <p className="text-accent font-bold text-2xl">{top3[0].leaderboard_points?.toLocaleString("fr-FR")}</p>
                <p className="text-white/50 text-xs">points</p>
              </div>
            )}

            {/* 3ème place */}
            {top3[2] && (
              <div className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 text-center text-white mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold shadow-lg">
                  {top3[2].display_name?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="text-2xl mb-1">🥉</div>
                <p className="font-bold truncate text-sm">{top3[2].display_name}</p>
                <p className="text-accent font-bold text-lg">{top3[2].leaderboard_points?.toLocaleString("fr-FR")}</p>
                <p className="text-white/50 text-xs">pts</p>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* ── MON RANG (si connecté) ── */}
      {user && myRank && (
        <div className="max-w-4xl mx-auto px-4 mb-6">
          <div className="bg-accent/20 border border-accent/40 rounded-2xl p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center font-bold text-primary-dark">
                {myRank.rank}
              </div>
              <div>
                <p className="font-semibold text-sm">Votre position</p>
                <p className="text-white/60 text-xs">Rang #{myRank.rank} sur {data.length}+</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-accent font-bold text-xl">{myRank.leaderboard_points?.toLocaleString("fr-FR")}</p>
              <p className="text-white/50 text-xs">points</p>
            </div>
          </div>
        </div>
      )}

      {/* ── LISTE COMPLÈTE ── */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-hard overflow-hidden">
          {/* En-tête table */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-7">Apprenant</div>
            <div className="col-span-4 text-right">Points</div>
          </div>

          {loading ? (
            <div className="divide-y divide-gray-100">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="grid grid-cols-12 gap-4 px-6 py-4 animate-pulse">
                  <div className="col-span-1 h-5 bg-gray-200 rounded" />
                  <div className="col-span-7 h-5 bg-gray-200 rounded" />
                  <div className="col-span-4 h-5 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : rest.length === 0 && data.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Aucun classement disponible</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {rest.map((entry, i) => {
                const rank = i + 4;
                const isMe = user && (entry.user_id === user.id || entry.id === user.id);
                return (
                  <div
                    key={entry.user_id || i}
                    className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors ${
                      isMe ? "bg-primary/5 border-l-4 border-primary" : "hover:bg-gray-50"
                    }`}
                  >
                    {/* Rang */}
                    <div className="col-span-1 text-center">
                      <span className="text-sm font-bold text-gray-400">{rank}</span>
                    </div>

                    {/* Nom */}
                    <div className="col-span-7 flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                        isMe ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
                      }`}>
                        {entry.display_name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className={`font-semibold text-sm ${isMe ? "text-primary" : "text-gray-800"}`}>
                          {entry.display_name}
                          {isMe && <span className="ml-2 text-xs bg-primary text-white px-1.5 py-0.5 rounded-full">Vous</span>}
                        </p>
                      </div>
                    </div>

                    {/* Points */}
                    <div className="col-span-4 text-right">
                      <span className={`font-bold text-sm ${isMe ? "text-primary" : "text-gray-700"}`}>
                        {entry.leaderboard_points?.toLocaleString("fr-FR")}
                        <span className="text-xs font-normal text-gray-400 ml-1">pts</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Comment gagner des points */}
        <div className="mt-8 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-white">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" /> Comment gagner des points ?
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: "📝", title: "Réussir un quiz", pts: "+Variable", desc: "Points selon votre score" },
              { icon: "🎓", title: "Terminer un cours", pts: "+100 pts", desc: "Certificat inclus" },
              { icon: "💡", title: "Participer au forum", pts: "Bientôt", desc: "Posts et réponses utiles" },
            ].map(({ icon, title, pts, desc }) => (
              <div key={title} className="bg-white/10 rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">{icon}</div>
                <p className="font-semibold text-sm mb-1">{title}</p>
                <p className="text-accent font-bold text-sm">{pts}</p>
                <p className="text-white/50 text-xs mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}