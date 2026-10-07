import { useEffect, useState } from "react";
import { askConfirm, askPrompt } from "../../utils/dialog";
import api from "../../api/api";
import {
  Trophy, Search, Plus, Edit3, Trash2, Save, X,
  Crown, Medal, Award, RefreshCw, Loader,
  ArrowUp, ArrowDown, Zap
} from "lucide-react";
import { RankIcon } from "../../components/UI/Icons";
import { useTranslation } from "react-i18next";
import { getLocale } from "../../i18n";
import i18n from "../../i18n";

const AdjustModal = ({ user, onSave, onClose }) => {
  const { t } = useTranslation("adminLeaderboard");
  const [pts, setPts] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const isNeg = parseInt(pts) < 0;

  const handleSave = async () => {
    if (!pts || isNaN(parseInt(pts))) return;
    setSaving(true);
    await onSave(user.user_id || user.id, { points: parseInt(pts), reason });
    setSaving(false);
  };

  const QUICK = [-10, -5, +5, +10, +25, +50, +100];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-hard w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center text-white font-bold text-sm">
              {user.display_name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">{user.display_name}</p>
              <p className="text-xs text-gray-400">{user.leaderboard_points || 0}{" "}{t("pts_actuels")}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5" /></button>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">{t("ajustement_rapide")}</label>
          <div className="flex gap-2 flex-wrap">
            {QUICK.map(q => (
              <button key={q} type="button" onClick={() => setPts(String(q))}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold border-2 transition ${
                  parseInt(pts) === q
                    ? q < 0 ? "border-red-500 bg-red-500 text-white" : "border-emerald-500 bg-emerald-500 text-white"
                    : q < 0 ? "border-red-200 text-red-500 hover:border-red-400" : "border-emerald-200 text-emerald-600 hover:border-emerald-400"
                }`}>
                {q > 0 ? "+" : ""}{q}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("valeur_personnalisee")}</label>
          <input type="number" value={pts} onChange={(e) => setPts(e.target.value)}
            placeholder={t("ex_50_ou_10")}
            className={`w-full px-3.5 py-2.5 border-2 rounded-xl text-sm focus:outline-none transition ${
              isNeg ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-blue-300"
            }`} />
          {pts && !isNaN(parseInt(pts)) && (
            <p className={`text-xs mt-1 font-medium ${isNeg ? "text-red-500" : "text-emerald-600"}`}>{t("nouveau_total")}{" "}{(user.leaderboard_points || 0) + parseInt(pts)}{" "}{i18n.t("adminLeaderboard:pts")}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("raison")}</label>
          <input value={reason} onChange={(e) => setReason(e.target.value)}
            placeholder={t("ex_bonus_quiz_parfait_correction_manuelle")}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-50 transition">{t("annuler")}</button>
          <button onClick={handleSave} disabled={saving || !pts || isNaN(parseInt(pts))}
            className={`flex items-center gap-2 px-5 py-2 text-white font-bold rounded-xl text-sm hover:-translate-y-0.5 transition shadow-md disabled:opacity-60 ${
              isNeg ? "bg-red-500 hover:bg-red-600" : "bg-emerald-600"
            }`}>
            {saving ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? t("enregistrement") : t("appliquer")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AdminLeaderboard() {
  const { t } = useTranslation("adminLeaderboard");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [adjustModal, setAdjustModal] = useState(null);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    document.title = t("classement_admin");
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/leaderboard?limit=100");
      setData(res.data?.data?.leaderboard || res.data?.data || []);
    } catch {}
    setLoading(false);
  };

  const handleAdjust = async (userId, { points, reason }) => {
    try {
      await api.post(`/admin/leaderboard/adjust`, { user_id: userId, points, reason });
      await fetchData();
      setAdjustModal(null);
    } catch { alert(t("erreur_lors_de_l_ajustement")); }
  };

  const handleReset = async () => {
    if (!(await askConfirm(t("remettre_a_zero_tous_les_points")))) return;
    setResetting(true);
    try {
      await api.post("/admin/leaderboard/reset");
      await fetchData();
    } catch { alert(t("erreur")); }
    setResetting(false);
  };

  const filtered = data.filter(u =>
    (u.display_name || "").toLowerCase().includes(search.toLowerCase())
  );


  if (loading) return <div className="flex justify-center py-32"><Loader className="w-8 h-8 text-blue-600 animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-5xl">
      {adjustModal && (
        <AdjustModal user={adjustModal} onSave={handleAdjust} onClose={() => setAdjustModal(null)} />
      )}

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("classement")}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{t("apprenants_classes", { length: data.length })}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchData} className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={handleReset} disabled={resetting}
            className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition disabled:opacity-60">
            {resetting ? <span className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" /> : <Trash2 className="w-4 h-4" />}{t("reinitialiser")}</button>
        </div>
      </div>

      {/* Podium top 3 */}
      {data.length >= 3 && (
        <div className="bg-gradient-to-br from-[#0B1B3A] to-primary rounded-2xl p-4 sm:p-6">
          <div className="flex items-end justify-center gap-2 sm:gap-4">
            {[data[1], data[0], data[2]].map((entry, i) => {
              const realRank = i === 1 ? 1 : i === 0 ? 2 : 3;
              const heights = [" mb-4", "", "mb-4"];
              return (
                <div key={entry?.user_id || i} className={`flex-1 min-w-0 text-center text-white ${heights[i]}`}>
                  <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mx-auto mb-2 text-lg sm:text-xl font-bold shadow-lg"
                    style={{ background: realRank === 1 ? "linear-gradient(135deg,#f6d365,#fda085)" : realRank === 2 ? "linear-gradient(135deg,#a8b0c0,#8596ad)" : "linear-gradient(135deg,#f0a070,#d4844a)" }}>
                    {entry?.display_name?.[0]?.toUpperCase()}
                  </div>
                  <div className="mb-1 flex justify-center"><RankIcon rank={realRank} className="w-7 h-7" /></div>
                  <p className="font-bold text-sm truncate px-2">{entry?.display_name}</p>
                  <p className="text-yellow-400 font-bold">{entry?.leaderboard_points?.toLocaleString(getLocale())}</p>
                  <p className="text-white/40 text-xs">{i18n.t("adminLeaderboard:pts")}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recherche */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("rechercher_un_apprenant")}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white" />
      </div>

      {/* Tableau */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-soft overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
          <div className="col-span-1 text-center">#</div>
          <div className="col-span-6">{t("apprenant")}</div>
          <div className="col-span-3 text-right">{t("points")}</div>
          <div className="col-span-2 text-right">{t("actions")}</div>
        </div>
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Trophy className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p>{t("aucun_resultat")}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((entry, i) => {
              const rank = i + 1;
              return (
                <div key={entry.user_id || i} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/50 transition">
                  <div className="col-span-1 text-center">
                    {rank <= 3 ? (
                      <span className="inline-flex"><RankIcon rank={rank} className="w-5 h-5" /></span>
                    ) : (
                      <span className="text-sm font-bold text-gray-400">{rank}</span>
                    )}
                  </div>
                  <div className="col-span-6 flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {entry.display_name?.[0]?.toUpperCase()}
                    </div>
                    <p className="font-semibold text-gray-800 text-sm truncate">{entry.display_name}</p>
                  </div>
                  <div className="col-span-3 text-right">
                    <span className="font-bold text-gray-900">{(entry.leaderboard_points || 0).toLocaleString(getLocale())}</span>
                    <span className="text-xs text-gray-400 ml-1">{i18n.t("adminLeaderboard:pts")}</span>
                  </div>
                  <div className="col-span-2 text-right">
                    <button onClick={() => setAdjustModal(entry)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition" title={t("ajuster_les_points")}>
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}