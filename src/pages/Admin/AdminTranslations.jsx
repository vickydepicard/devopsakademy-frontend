// Traductions du contenu (cours, modules, leçons, catégories…) : couverture, édition, traduction automatique.
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Languages, Sparkles, Trash2 } from "lucide-react";
import api from "../../api/api";
import useFeedback, { apiError } from "../../components/Common/useFeedback";
import { Card, Center, Empty, Pill, Progress, Spinner, btnGhost, btnPrimary, inp } from "./program/ui";

const STATUS_TONE = {
  done: "bg-emerald-100 text-emerald-700", manual: "bg-indigo-100 text-indigo-700", stale: "bg-amber-100 text-amber-700",
  missing: "bg-red-100 text-red-600", same_lang: "bg-gray-100 text-gray-500",
};

function ItemRow({ item, lang, onChanged }) {
  const { t } = useTranslation("adminTranslations");
  const { notify } = useFeedback();
  const initial = item.is_list ? (item.translation || []).join("\n") : (item.translation || "");
  const [val, setVal] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => { setVal(item.is_list ? (item.translation || []).join("\n") : (item.translation || "")); }, [item.translation, item.is_list]);

  const src = item.is_list ? item.source.join("\n") : item.source;
  const dirty = val !== initial;
  const save = async () => {
    setBusy(true);
    try { await api.put("/admin/translations/item", { entity: item.entity, id: item.id, field: item.field, lang, ...(item.is_list ? { items: val.split("\n") } : { text: val }) }); notify(t("saved"), "success"); onChanged(); }
    catch (e) { notify(apiError(e, t("error_generic"))); } finally { setBusy(false); }
  };
  const remove = async () => {
    try { await api.delete("/admin/translations/item", { params: { entity: item.entity, id: item.id, field: item.field, lang } }); onChanged(); }
    catch (e) { notify(apiError(e, t("error_generic"))); }
  };
  const long = src.length > 220;

  return (
    <li className="py-4 grid lg:grid-cols-2 gap-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          <Pill tone="bg-gray-100 text-gray-600">{t(`entity_${item.entity}`)} #{item.id}</Pill>
          <Pill tone="bg-indigo-50 text-indigo-700">{t(`field_${item.field}`)}</Pill>
          <Pill tone={STATUS_TONE[item.status]}>{t(`status_${item.status}`)}</Pill>
        </div>
        {item.label && item.field !== "title" && item.field !== "name" && <p className="text-xs font-semibold text-gray-500 mb-1 truncate">{item.label}</p>}
        <p className={`text-sm text-gray-800 whitespace-pre-line ${!open && long ? "line-clamp-4" : ""}`}>{src}</p>
        {long && <button type="button" onClick={() => setOpen((v) => !v)} className="text-xs font-semibold text-primary bg-transparent hover:underline mt-1">{open ? t("collapse") : t("expand")}</button>}
      </div>
      <div className="min-w-0">
        <textarea value={val} onChange={(e) => setVal(e.target.value)} rows={Math.min(Math.max(Math.ceil(src.length / 70), 2), 10)} placeholder={item.is_list ? t("list_placeholder") : t("translation_placeholder")} className={`${inp} resize-y`} />
        <div className="flex items-center justify-end gap-2 mt-2">
          {item.translation !== null && <button type="button" onClick={remove} className="p-1.5 bg-transparent text-gray-300 hover:text-red-600" title={t("delete")}><Trash2 className="w-4 h-4" /></button>}
          <button type="button" onClick={save} disabled={busy || !val.trim() || (!dirty && item.status !== "stale")} className={btnPrimary}>
            {busy ? <Spinner className="w-4 h-4" /> : <Check className="w-4 h-4" />}{t(item.status === "stale" && !dirty ? "confirm_current" : "save")}
          </button>
        </div>
      </div>
    </li>
  );
}

export default function AdminTranslations() {
  const { t } = useTranslation("adminTranslations");
  const { notify, confirm } = useFeedback();
  const [lang, setLang] = useState("en");
  const [status, setStatus] = useState(null);
  const [summary, setSummary] = useState(null);
  const [entity, setEntity] = useState("");
  const [filter, setFilter] = useState("todo");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [auto, setAuto] = useState(null);   // { done, remaining }

  useEffect(() => { document.title = `${t("title")} — DevOpsAkademy`; api.get("/admin/translations/status").then((r) => setStatus(r.data.data)).catch(() => {}); }, [t]);

  const loadSummary = useCallback(() => { api.get("/admin/translations/summary", { params: { lang } }).then((r) => setSummary(r.data.data)).catch((e) => notify(apiError(e, t("error_generic")))); }, [lang]); // eslint-disable-line react-hooks/exhaustive-deps
  const loadItems = useCallback(() => {
    api.get("/admin/translations/items", { params: { lang, entity: entity || undefined, status: filter, search: search || undefined, page } })
      .then((r) => setData(r.data)).catch((e) => notify(apiError(e, t("error_generic"))));
  }, [lang, entity, filter, search, page]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setSummary(null); loadSummary(); }, [loadSummary]);
  useEffect(() => { const h = setTimeout(loadItems, 250); return () => clearTimeout(h); }, [loadItems]);
  const refresh = () => { loadSummary(); loadItems(); };

  const runAuto = async () => {
    if (!(await confirm(t("auto_confirm", { lang: lang.toUpperCase() }), { confirmLabel: t("auto_run"), danger: false }))) return;
    let total = 0;
    setAuto({ done: 0, remaining: null });
    try {
      for (let i = 0; i < 40; i++) {
        const r = await api.post("/admin/translations/auto", { lang, entity: entity || undefined, scope: "todo", limit: 40 });
        total += r.data.data.translated;
        setAuto({ done: total, remaining: r.data.data.remaining });
        if (!r.data.data.translated || !r.data.data.remaining) break;
      }
      notify(t("auto_done", { count: total }), "success");
    } catch (e) { notify(apiError(e, t("error_generic"))); }
    finally { setAuto(null); refresh(); }
  };

  const entities = summary ? Object.keys(summary) : [];
  const totals = entities.reduce((a, k) => ({ total: a.total + summary[k].total - summary[k].same_lang, done: a.done + summary[k].done, todo: a.todo + summary[k].missing + summary[k].stale }), { total: 0, done: 0, todo: 0 });
  const pages = data ? Math.max(Math.ceil(data.pagination.total / data.pagination.limit), 1) : 1;

  return (
    <div className="space-y-6 text-left max-w-6xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Languages className="w-6 h-6 text-primary" />{t("title")}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t("subtitle")}</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {["en", "fr"].map((l) => <button key={l} type="button" onClick={() => { setLang(l); setPage(1); }} className={`px-4 py-2 rounded-lg text-sm font-bold ${lang === l ? "bg-white text-gray-900 shadow-sm" : "bg-transparent text-gray-500"}`}>{t(`target_${l}`)}</button>)}
        </div>
      </div>

      <Card title={t("coverage")}>
        {!summary ? <Center><Spinner className="w-6 h-6" /></Center> : (
          <>
            <div className="flex items-center gap-4 mb-5">
              <div className="flex-1"><Progress percent={totals.total ? Math.round((totals.done / totals.total) * 100) : 100} /></div>
              <span className="text-sm font-bold text-gray-800">{totals.done} / {totals.total}</span>
              {totals.todo > 0 ? <Pill tone="bg-amber-100 text-amber-700">{t("to_translate", { count: totals.todo })}</Pill> : <Pill tone="bg-emerald-100 text-emerald-700">{t("all_translated")}</Pill>}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {entities.map((k) => {
                const s = summary[k]; const total = s.total - s.same_lang;
                return (
                  <button key={k} type="button" onClick={() => { setEntity(entity === k ? "" : k); setPage(1); }}
                    className={`text-left rounded-xl border p-3 transition ${entity === k ? "border-primary bg-indigo-50/40" : "border-gray-200 bg-white hover:border-gray-300"}`}>
                    <p className="text-sm font-bold text-gray-900">{t(`entity_${k}`)}</p>
                    <div className="my-2"><Progress percent={total ? Math.round((s.done / total) * 100) : 100} /></div>
                    <p className="text-xs text-gray-500">{s.done} / {total}{s.missing ? ` · ${t("n_missing", { n: s.missing })}` : ""}{s.stale ? ` · ${t("n_stale", { n: s.stale })}` : ""}</p>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </Card>

      <Card title={t("auto_title")} action={status?.auto_configured && <button type="button" onClick={runAuto} disabled={!!auto || !totals.todo} className={btnPrimary}>{auto ? <Spinner className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}{auto ? t("auto_running", { done: auto.done }) : t("auto_run")}</button>}>
        {status && !status.auto_configured
          ? <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl p-3">{t("auto_not_configured")}</p>
          : <p className="text-xs text-gray-500">{t("auto_hint", { model: status?.model })}</p>}
        <p className="text-xs text-gray-500 mt-3">{t("how_it_works")}</p>
      </Card>

      <Card title={t("items_title")} action={
        <div className="flex gap-2 flex-wrap">
          <input className={`${inp} !w-52`} placeholder={t("search")} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          <select className={`${inp} !w-44`} value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}>
            {["todo", "missing", "stale", "done", "manual", "all"].map((f) => <option key={f} value={f}>{t(`filter_${f}`)}</option>)}
          </select>
          <select className={`${inp} !w-44`} value={entity} onChange={(e) => { setEntity(e.target.value); setPage(1); }}>
            <option value="">{t("all_entities")}</option>{entities.map((k) => <option key={k} value={k}>{t(`entity_${k}`)}</option>)}
          </select>
        </div>}>
        {!data ? <Center><Spinner className="w-6 h-6" /></Center> : data.data.length === 0 ? <Empty>{t("nothing")}</Empty> : (
          <>
            <ul className="divide-y divide-gray-100">{data.data.map((it) => <ItemRow key={`${it.entity}-${it.id}-${it.field}-${lang}`} item={it} lang={lang} onChanged={refresh} />)}</ul>
            <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
              <span>{t("page_of", { page, pages })} · {t("total", { count: data.pagination.total })}</span>
              <div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className={btnGhost}>{t("previous")}</button><button type="button" disabled={page >= pages} onClick={() => setPage(page + 1)} className={btnGhost}>{t("next")}</button></div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
