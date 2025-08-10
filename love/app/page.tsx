"use client";

import { useEffect, useMemo, useState } from "react";

type LoveEntry = {
  id: string;
  date: string; // ISO yyyy-mm-dd
  title: string;
  note: string;
};

const STORAGE_ENTRIES_KEY = "loveEntries";
const STORAGE_START_DATE_KEY = "loveStartDate";

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

  // Form state
  const [formDate, setFormDate] = useState<string>(formatDate(new Date()));
  const [formTitle, setFormTitle] = useState<string>("");
  const [formNote, setFormNote] = useState<string>("");

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
    };
    setEntries((prev) => [next, ...prev].sort((a, b) => (a.date < b.date ? 1 : -1)));
    setFormTitle("");
    setFormNote("");
  }

  function handleDelete(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div className="min-h-dvh bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Header / Hero */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            逸君 ❤ 璎
          </h1>
          <p className="mt-2 text-sm text-black/70 dark:text-white/70">
            我们的爱情记录
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-[auto_1fr] items-center gap-3 sm:gap-4 rounded-2xl border border-black/10 dark:border-white/15 p-4">
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
        </header>

        {/* Add Form */}
        <section className="mb-10 rounded-2xl border border-black/10 dark:border-white/15 p-4 sm:p-5 bg-white/50 dark:bg-black/20 backdrop-blur">
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
            <div className="sm:col-start-2">
              <button
                onClick={handleAdd}
                className="inline-flex items-center justify-center rounded-md bg-pink-500 px-4 py-2 text-white font-medium hover:bg-pink-600 active:bg-pink-700 transition-colors"
              >
                记录这一天
              </button>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section>
          <h2 className="text-lg font-semibold mb-4">时间轴</h2>

          {entries.length === 0 ? (
            <p className="text-sm text-black/60 dark:text-white/70">还没有记录，先添加一条吧～</p>
          ) : (
            <ol className="relative border-s border-black/10 dark:border-white/15 pl-6">
              {entries.map((e) => (
                <li key={e.id} className="mb-8">
                  <div className="absolute -start-[9px] mt-1 h-4 w-4 rounded-full border border-white/90 dark:border-black/90 bg-pink-500 shadow" />
                  <div className="rounded-xl border border-black/10 dark:border-white/15 p-4 bg-white/60 dark:bg-black/20">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-black/60 dark:text-white/60">
                          {formatDate(e.date)}
                        </p>
                        <h3 className="text-base font-semibold mt-1">{e.title}</h3>
                      </div>
                      <button
                        onClick={() => handleDelete(e.id)}
                        className="text-xs rounded-md border border-black/10 dark:border-white/20 px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10"
                        aria-label="删除记录"
                      >
                        删除
                      </button>
                    </div>
                    {e.note && (
                      <p className="mt-3 whitespace-pre-wrap leading-relaxed text-[15px]">{e.note}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-12 border-t border-black/10 dark:border-white/15 pt-6 text-center text-xs text-black/60 dark:text-white/60">
          <p>
            为 逸君 ❤ 璎 制作 · 本地存储保存数据 · 建议在浏览器中添加到主屏幕
          </p>
        </footer>
      </div>
    </div>
  );
}
