"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type LoveEntry = {
  id: string;
  date: string; // ISO yyyy-mm-dd
  title: string;
  note: string;
  tag?: string; // 分类标签
};

const STORAGE_ENTRIES_KEY = "loveEntries";
const STORAGE_START_DATE_KEY = "loveStartDate";
const STORAGE_PASSED_GATE_KEY = "lovePassedGate";
const STORAGE_ANNIV_KEY = "loveAnniversaries";
const DEFAULT_START_DATE = "2023-07-08";
const TAG_OPTIONS = ["纪念日", "旅行", "日常", "惊喜", "学习", "工作", "其他"] as const;

function formatDate(dateLike: string | Date): string {
  const d = typeof dateLike === "string" ? new Date(dateLike) : dateLike;
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}

export default function Home() {
  const [entries, setEntries] = useState<LoveEntry[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [passedGate, setPassedGate] = useState<boolean>(false);
  const [nearestAnniv, setNearestAnniv] = useState<{ name: string; days: number } | null>(null);
  const [coverUrl, setCoverUrl] = useState<string>("");

  // Form state
  const [formDate, setFormDate] = useState<string>(formatDate(new Date()));
  const [formTitle, setFormTitle] = useState<string>("");
  const [formNote, setFormNote] = useState<string>("");
  const [formTag, setFormTag] = useState<string>(TAG_OPTIONS[2]);

  // Filters & editing
  const [filterTag, setFilterTag] = useState<string>("全部");
  const [filterText, setFilterText] = useState<string>("");
  const [filterFrom, setFilterFrom] = useState<string>("");
  const [filterTo, setFilterTo] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState<LoveEntry | null>(null);
  const [expandedEntry, setExpandedEntry] = useState<LoveEntry | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_ENTRIES_KEY);
      const stored = raw ? (JSON.parse(raw) as LoveEntry[]) : [];
      if (Array.isArray(stored)) {
        setEntries(
          stored
            .filter((e) => !!e && typeof e.id === "string")
            .sort((a, b) => (a.date < b.date ? 1 : -1))
        );
      }
    } catch {}
    try {
      const s = localStorage.getItem(STORAGE_START_DATE_KEY);
      if (s) setStartDate(s);
      else setStartDate(DEFAULT_START_DATE);
    } catch { setStartDate(DEFAULT_START_DATE); }
    try {
      const g = localStorage.getItem(STORAGE_PASSED_GATE_KEY);
      setPassedGate(g === "1");
    } catch {}
    // read anniversaries to show next countdown
    try {
      const rawA = localStorage.getItem(STORAGE_ANNIV_KEY);
      const list = rawA ? (JSON.parse(rawA) as { name: string; date: string }[]) : [];
      const withDays = list
        .filter((x) => x && x.date)
        .map((x) => ({ name: x.name, days: daysUntil(x.date) ?? Infinity }))
        .sort((a, b) => a.days - b.days);
      if (withDays.length && isFinite(withDays[0].days)) setNearestAnniv(withDays[0]);
    } catch {}
    try {
      const cu = localStorage.getItem("loveCoverUrl");
      if (cu) setCoverUrl(cu);
    } catch {}
  }, []);

  // Persist entries
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ENTRIES_KEY, JSON.stringify(entries));
    } catch {}
  }, [entries]);

  // Persist start date
  useEffect(() => {
    try {
      if (startDate) localStorage.setItem(STORAGE_START_DATE_KEY, startDate);
    } catch {}
  }, [startDate]);

  const daysTogether = useMemo(() => {
    if (!startDate) return null;
    const start = new Date(startDate);
    const today = new Date();
    const diffMs = today.setHours(0, 0, 0, 0) - start.setHours(0, 0, 0, 0);
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return days >= 0 ? days : null;
  }, [startDate]);

  function handleAdd() {
    if (!formTitle.trim() && !formNote.trim()) return;
    const safeDate = formDate || formatDate(new Date());
    const next: LoveEntry = {
      id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      date: safeDate,
      title: formTitle.trim() || "未命名记录",
      note: formNote.trim(),
      tag: formTag,
    };
    setEntries((prev) => [next, ...prev].sort((a, b) => (a.date < b.date ? 1 : -1)));
    setFormTitle("");
    setFormNote("");
    setFormTag(TAG_OPTIONS[2]);
  }

  function handleDelete(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function startEdit(e: LoveEntry) {
    setEditingId(e.id);
    setEditingDraft({ ...e });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingDraft(null);
  }

  function saveEdit() {
    if (!editingId || !editingDraft) return;
    setEntries((prev) => prev.map((e) => (e.id === editingId ? { ...editingDraft } : e)).sort((a, b) => (a.date < b.date ? 1 : -1)));
    setEditingId(null);
    setEditingDraft(null);
  }

  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      if (filterTag !== "全部" && (e.tag || "") !== filterTag) return false;
      if (filterText && !(e.title + e.note).toLowerCase().includes(filterText.toLowerCase())) return false;
      if (filterFrom && e.date < filterFrom) return false;
      if (filterTo && e.date > filterTo) return false;
      return true;
    });
  }, [entries, filterTag, filterText, filterFrom, filterTo]);

  function handleCheckGate(code: string) {
    if (code === "040306") {
      setPassedGate(true);
      try {
        localStorage.setItem(STORAGE_PASSED_GATE_KEY, "1");
      } catch {}
    } else {
      alert("访问码不正确～");
    }
  }

  return (
    <div className="min-h-dvh bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Command Palette mount */}
        <DynamicCmdPalette />
        {/* Access Gate */}
        {!passedGate && (
          <Gate onSubmit={handleCheckGate} />
        )}
        {passedGate && (
        <>
        {/* Header / Hero */}
        <header className="mb-8 text-center love-hero rounded-3xl p-6 shadow-sm border border-black/5 dark:border-white/10">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight hand">
            逸君 ❤ 璎
          </h1>
          <p className="mt-2 text-sm text-black/70 dark:text-white/70 hand">
            我们的爱情记录
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-[auto_1fr] items-center gap-3 sm:gap-4 rounded-2xl glass-card p-4">
            <label className="text-sm sm:text-base font-medium">在一起的日子从：</label>
            <div className="flex items-center gap-3">
              <input
                type="date"
                className="flex-1 rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-pink-400/60"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              {daysTogether !== null && (
                <span className="text-sm sm:text-base">
                  已一起走过 <span className="font-semibold text-pink-500">{daysTogether}</span> 天
                </span>
              )}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <div className="stat-card">
              <span className="label">在一起第</span>
              <span className="num">{daysTogether ?? 0}</span>
              <span className="label">天</span>
            </div>
            {nearestAnniv && (
              <div className="stat-card">
                <span className="label">最近纪念日</span>
                <span className="font-medium">{nearestAnniv.name}</span>
                <span className="label">还有</span>
                <span className="num">{nearestAnniv.days}</span>
                <span className="label">天</span>
              </div>
            )}
          </div>
          {/* Cover image uploader */}
          <div className="mt-6 h-40 sm:h-56 w-full overflow-hidden rounded-2xl glass-card grid place-items-center text-black/60 dark:text-white/70 cover-anim">
            {coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverUrl} alt="封面" className="h-full w-full object-cover" />
            ) : (
              <span>封面图/合照（点击下方上传）</span>
            )}
          </div>
          <div className="mt-3 flex items-center justify-center gap-3">
            <label className="rounded-md btn-accent hover:brightness-105 px-3 py-1.5 cursor-pointer text-sm">
              上传封面
              <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const url = await uploadCover(f);
                if (url) { setCoverUrl(url); try { localStorage.setItem("loveCoverUrl", url); } catch {} }
              }} />
            </label>
            {coverUrl && (
              <button onClick={() => { setCoverUrl(""); try { localStorage.removeItem("loveCoverUrl"); } catch {} }} className="text-xs rounded-md nav-pill px-2 py-1">移除</button>
            )}
          </div>

          {/* Primary navigation */}
          <div className="nav-sticky mt-5 px-3 py-2">
          <nav className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-sm bg-transparent">
            <a href="#timeline" className="rounded-full nav-pill px-4 py-2 flex items-center justify-center gap-2">
              <span>🕰️</span><span>时间轴</span>
            </a>
            <Link href="/milestones" className="rounded-full nav-pill px-4 py-2 flex items-center justify-center gap-2">
              <span>📌</span><span>里程碑</span>
            </Link>
            <Link href="/album" className="rounded-full nav-pill px-4 py-2 flex items-center justify-center gap-2">
              <span>🖼️</span><span>相册</span>
            </Link>
            <Link href="/anniversaries" className="rounded-full nav-pill px-4 py-2 flex items-center justify-center gap-2">
              <span>📅</span><span>纪念日</span>
            </Link>
            <Link href="/wishlist" className="rounded-full nav-pill px-4 py-2 flex items-center justify-center gap-2">
              <span>⭐</span><span>心愿单</span>
            </Link>
            <Link href="/guestbook" className="rounded-full nav-pill px-4 py-2 flex items-center justify-center gap-2">
              <span>💌</span><span>留言本</span>
            </Link>
          </nav>
          </div>
        </header>

        {/* Add Form */}
        <section id="timeline" className="mb-10 rounded-2xl border border-black/10 dark:border-white/15 p-4 sm:p-5 bg-white/50 dark:bg-black/20 backdrop-blur">
          <h2 className="text-lg font-semibold mb-4">添加一条记录</h2>
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-[140px_1fr] items-start">
            <div className="sm:pt-2">
              <label className="block text-sm mb-1">日期</label>
              <input
                type="date"
                className="w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-pink-400/60"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">标题</label>
              <input
                type="text"
                placeholder="例如：第一次看电影"
                className="w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-pink-400/60"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm mb-1">记录/心情</label>
              <textarea
                rows={4}
                placeholder="想写点什么都可以～"
                className="w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-pink-400/60"
                value={formNote}
                onChange={(e) => setFormNote(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">标签</label>
              <select className="w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2" value={formTag} onChange={(e)=>setFormTag(e.target.value)}>
                {(["纪念日","旅行","日常","惊喜","学习","工作","其他"] as const).map(t => (<option key={t}>{t}</option>))}
              </select>
            </div>
            <div className="sm:col-start-2">
              <button
                onClick={handleAdd}
                className="inline-flex items-center justify-center rounded-md btn-accent px-4 py-2 text-white font-medium hover:brightness-105 active:brightness-110 transition"
              >
                记录这一天
              </button>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section>
          <h2 className="text-lg font-semibold mb-4">时间轴</h2>
          {/* Filters */}
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center">
            <input placeholder="搜索关键词" value={filterText} onChange={e=>setFilterText(e.target.value)} className="rounded-md nav-pill bg-transparent px-3 py-2" />
            <div className="segmented">
              {(['全部', ...TAG_OPTIONS] as const).map(t => (
                <button key={String(t)} onClick={()=>setFilterTag(String(t))} className={filterTag===t? 'active' : ''}>{t}</button>
              ))}
            </div>
            <input type="date" value={filterFrom} onChange={e=>setFilterFrom(e.target.value)} className="rounded-md nav-pill bg-transparent px-3 py-2" />
            <input type="date" value={filterTo} onChange={e=>setFilterTo(e.target.value)} className="rounded-md nav-pill bg-transparent px-3 py-2" />
          </div>

          {filteredEntries.length === 0 ? (
            <p className="text-sm text-black/60 dark:text-white/70">还没有记录，先添加一条吧～</p>
          ) : (
            <ol className="relative border-s border-black/10 dark:border-white/15 pl-6">
              {filteredEntries.map((e) => (
                <li key={e.id} className="mb-8">
                  <div className="absolute -start-[9px] mt-1 h-4 w-4 rounded-full border border-white/90 dark:border-black/90 bg-pink-500 shadow" />
                  <div className="rounded-xl border border-black/10 dark:border-white/15 p-4 bg-white/60 dark:bg-black/20 cursor-pointer" onClick={()=>setExpandedEntry(e)}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-black/60 dark:text-white/60">
                          {formatDate(e.date)}
                        </p>
                        <h3 className="text-base font-semibold mt-1">{e.title}</h3>
                        {e.tag && <span className="mt-1 inline-block text-xs rounded bg-pink-500/15 text-pink-700 dark:text-pink-300 px-2 py-0.5">{e.tag}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(e)}
                          className="text-xs rounded-md border border-black/10 dark:border-white/20 px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10"
                        >编辑</button>
                        <button
                          onClick={() => handleDelete(e.id)}
                          className="text-xs rounded-md border border-black/10 dark:border-white/20 px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10"
                          aria-label="删除记录"
                        >删除</button>
                      </div>
                    </div>
                    {editingId === e.id && editingDraft ? (
                      <div className="mt-3 grid gap-3 sm:grid-cols-[140px_1fr] items-start">
                        <div className="sm:pt-2">
                          <label className="block text-sm mb-1">日期</label>
                          <input type="date" value={editingDraft.date} onChange={ev=>setEditingDraft({ ...editingDraft, date: ev.target.value })} className="w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2" />
                        </div>
                        <div>
                          <label className="block text-sm mb-1">标题</label>
                          <input value={editingDraft.title} onChange={ev=>setEditingDraft({ ...editingDraft, title: ev.target.value })} className="w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm mb-1">记录/心情</label>
                          <textarea rows={3} value={editingDraft.note} onChange={ev=>setEditingDraft({ ...editingDraft, note: ev.target.value })} className="w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2" />
                        </div>
                        <div>
                          <label className="block text-sm mb-1">标签</label>
                          <select value={editingDraft.tag || ""} onChange={ev=>setEditingDraft({ ...editingDraft, tag: ev.target.value })} className="w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2">
                            <option value="">（无）</option>
                            {TAG_OPTIONS.map(t => (<option key={t}>{t}</option>))}
                          </select>
                        </div>
                        <div className="sm:col-start-2 flex gap-2">
                          <button onClick={saveEdit} className="rounded-md bg-pink-500 px-3 py-1.5 text-white text-sm">保存</button>
                          <button onClick={cancelEdit} className="rounded-md border px-3 py-1.5 text-sm">取消</button>
                        </div>
                      </div>
                    ) : (
                      e.note && (
                        <p className="mt-3 whitespace-pre-wrap leading-relaxed text-[15px]">{e.note}</p>
                      )
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        {expandedEntry && (
          <div className="expand-overlay" onClick={()=>setExpandedEntry(null)}>
            <div className="expand-card" onClick={(ev)=>ev.stopPropagation()}>
              <div className="expand-title">{expandedEntry.title}</div>
              <div className="expand-date">{formatDate(expandedEntry.date)} · {expandedEntry.tag || '无标签'}</div>
              <div className="expand-content">{expandedEntry.note || '（无内容）'}</div>
              <div className="mt-4 text-right">
                <button className="rounded-md nav-pill px-3 py-1 text-sm" onClick={()=>setExpandedEntry(null)}>关闭</button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 border-t border-black/10 dark:border-white/15 pt-6 text-center text-xs text-black/60 dark:text-white/60">
          <p>
            从 2023-07-08 起的第 {daysTogether ?? 0} 天 · 为 逸君 ❤ 璎 制作
          </p>
        </footer>
        </>
        )}
      </div>
    </div>
  );
}
function DynamicCmdPalette() {
  const [Comp, setComp] = useState<null | React.ComponentType>(null);
  useEffect(() => {
    let mounted = true;
    import("./cmd-palette").then((m) => {
      if (mounted) setComp(() => (m.default as unknown as React.ComponentType));
    }).catch(()=>{});
    return () => { mounted = false; };
  }, []);
  return Comp ? <Comp /> : null;
}

function Gate({ onSubmit }: { onSubmit: (code: string) => void }) {
  const [code, setCode] = useState("");
  function setTheme(theme: "dark" | "light") {
    (window as Window & { __setTheme?: (t: "dark" | "light") => void }).__setTheme?.(theme);
  }
  return (
    <div className="max-w-md mx-auto mt-10 rounded-2xl border border-black/10 dark:border-white/15 p-6 text-center bg-white/60 dark:bg-black/20">
      <h2 className="text-xl font-semibold">私密访问</h2>
      <p className="mt-2 text-sm text-black/70 dark:text-white/70">请输入 6 位访问码</p>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        maxLength={6}
        inputMode="numeric"
        placeholder="••••••"
        className="mt-4 w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-center tracking-[0.3em] outline-none focus:ring-2 focus:ring-pink-400/60"
      />
      <div className="mt-4 flex items-center justify-center gap-3">
        <button onClick={() => onSubmit(code)} className="rounded-md bg-pink-500 px-4 py-2 text-white hover:bg-pink-600">
          进入
        </button>
        <button onClick={() => setTheme('dark')} className="text-xs rounded-md nav-pill px-2 py-1">暗色</button>
        <button onClick={() => setTheme('light')} className="text-xs rounded-md nav-pill px-2 py-1">亮色</button>
        <button onClick={() => (window as Window & { __setFontScale?: (n: number)=>void }).__setFontScale?.(1.1)} className="text-xs rounded-md nav-pill px-2 py-1">字大</button>
        <button onClick={() => (window as Window & { __setFontScale?: (n: number)=>void }).__setFontScale?.(1)} className="text-xs rounded-md nav-pill px-2 py-1">字普</button>
        <button onClick={() => (window as Window & { __setAccentVariant?: (v: 'pastel'|'normal')=>void }).__setAccentVariant?.('pastel')} className="text-xs rounded-md nav-pill px-2 py-1">浅粉</button>
        <button onClick={() => (window as Window & { __setAccentVariant?: (v: 'pastel'|'normal')=>void }).__setAccentVariant?.('normal')} className="text-xs rounded-md nav-pill px-2 py-1">标准粉</button>
      </div>
    </div>
  );
}

function daysUntil(dateStr: string): number | null {
  if (!dateStr) return null;
  const now = new Date();
  const target = new Date(dateStr);
  if (Number.isNaN(target.getTime())) return null;
  const thisYear = new Date(now.getFullYear(), target.getMonth(), target.getDate());
  const nextOccur = thisYear < now ? new Date(now.getFullYear() + 1, target.getMonth(), target.getDate()) : thisYear;
  const diffMs = nextOccur.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

async function uploadCover(file: File): Promise<string | null> {
  try {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    if (!res.ok) return null;
    const data = (await res.json()) as { url: string };
    return data.url;
  } catch {
    return null;
  }
}
