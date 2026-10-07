import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Send, Loader, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import api from "../../api/api";

export default function ForumNew() {
  const { t } = useTranslation("forumNew");
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(params.get("category") || "");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loadingCats, setLoadingCats] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = `${t("title")} — DevOps Akademy`;
    api.get("/forum/categories")
      .then((r) => {
        const list = r.data?.data || [];
        setCategories(list);
        setCategoryId((cur) => (cur && list.some((c) => String(c.id) === String(cur)) ? cur : list[0]?.id ? String(list[0].id) : ""));
      })
      .catch(() => setError(t("loadError")))
      .finally(() => setLoadingCats(false));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (title.trim().length < 5) return setError(t("titleShort"));
    if (!content.trim()) return setError(t("contentRequired"));
    setSending(true);
    try {
      const r = await api.post("/forum/threads", { title: title.trim(), content: content.trim(), category_id: Number(categoryId) || undefined });
      navigate(`/forum/thread/${r.data?.data?.id}`, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || t("sendError"));
      setSending(false);
    }
  };

  const input = "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary";

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <Link to="/forum" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mb-5">
          <ArrowLeft className="w-4 h-4" /> {t("back")}
        </Link>

        <form onSubmit={submit} className="bg-white border border-gray-100 rounded-2xl shadow-soft p-5 sm:p-8 space-y-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
            <p className="text-sm text-gray-500 mt-1">{t("subtitle")}</p>
          </div>

          {error && (
            <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("category")}</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} disabled={loadingCats} className={input}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("subject")}</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} placeholder={t("subjectPlaceholder")} className={input} />
            <p className="text-xs text-gray-400 mt-1 text-right">{title.length}/200</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t("message")}</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={9} maxLength={10000} placeholder={t("messagePlaceholder")} className={`${input} resize-y leading-relaxed`} />
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-xs text-gray-400">{t("rules")}</p>
            <button type="submit" disabled={sending || loadingCats} className="inline-flex items-center justify-center gap-2 bg-primary text-white font-bold py-3 px-7 rounded-xl text-sm hover:bg-primary-light transition disabled:opacity-60">
              {sending ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {sending ? t("sending") : t("publish")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
