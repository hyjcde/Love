"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type LoveEntry = {
  id: string;
  date: string; // ISO yyyy-mm-dd
  title: string;
  note: string;
};

const STORAGE_ENTRIES_KEY = "loveEntries";
const STORAGE_START_DATE_KEY = "loveStartDate";
const STORAGE_PASSED_GATE_KEY = "lovePassedGate";
const STORAGE_ANNIV_KEY = "loveAnniversaries";
const DEFAULT_START_DATE = "2023-07-08";

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
        {/* Access Gate */}
        {!passedGate && (
          <Gate onSubmit={handleCheckGate} />
        )}
        {passedGate && (
        <>
        {/* Header / Hero */}
        <header className="mb-8 text-center love-hero rounded-3xl p-6 shadow-sm border border-black/5 dark:border-white/10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            逸君 ❤ 璎
          </h1>
          <p className="mt-2 text-sm text-black/70 dark:text-white/70">
            我们的爱情记录
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-[auto_1fr] items-center gap-3 sm:gap-4 rounded-2xl border border-black/10 dark:border-white/15 p-4 bg-white/60 dark:bg-black/20">
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
          {nearestAnniv && (
            <div className="mt-4 rounded-xl border border-black/10 dark:border-white/15 p-3 inline-flex items-center gap-2 bg-white/70 dark:bg-black/20">
              <span className="text-sm">最近的纪念日：</span>
              <span className="font-medium">{nearestAnniv.name}</span>
              <span className="text-sm">还有</span>
              <span className="font-semibold text-pink-600">{nearestAnniv.days}</span>
              <span className="text-sm">天</span>
            </div>
          )}
          {/* Cover image placeholder */}
          <div className="mt-6 h-40 sm:h-56 w-full rounded-2xl border border-black/10 dark:border-white/15 bg-gradient-to-br from-pink-100/70 to-white/70 dark:from-pink-900/20 dark:to-black/10 grid place-items-center text-black/50 dark:text-white/60">
            <span>封面图/合照（后续支持上传）</span>
          </div>

          {/* Primary navigation */}
          <nav className="mt-5 grid grid-cols-3 sm:grid-cols-6 gap-2 text-sm">
            <a href="#timeline" className="rounded-lg border border-black/10 dark:border-white/15 px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10">时间轴</a>
            <a href="#milestones" className="rounded-lg border border-black/10 dark:border-white/15 px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10">里程碑</a>
            <a href="#album" className="rounded-lg border border-black/10 dark:border-white/15 px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10">相册</a>
            <Link href="/anniversaries" className="rounded-lg border border-black/10 dark:border-white/15 px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10">纪念日</Link>
            <a href="#wishlist" className="rounded-lg border border-black/10 dark:border-white/15 px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10">心愿单</a>
            <a href="#guestbook" className="rounded-lg border border-black/10 dark:border-white/15 px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10">留言本</a>
          </nav>
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
        </>
        )}
      </div>
    </div>
  );
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
        <button onClick={() => setTheme('dark')} className="text-xs rounded-md border px-2 py-1">暗色</button>
        <button onClick={() => setTheme('light')} className="text-xs rounded-md border px-2 py-1">亮色</button>
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
