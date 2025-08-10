"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Anniv = { id: string; name: string; date: string }; // yyyy-mm-dd

const STORAGE_KEY = "loveAnniversaries";
const STORAGE_PASSED_GATE_KEY = "lovePassedGate";

function formatDate(dateLike: string | Date): string {
  const d = typeof dateLike === "string" ? new Date(dateLike) : dateLike;
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}

function daysUntil(dateStr: string): number | null {
  if (!dateStr) return null;
  const now = new Date();
  const target = new Date(dateStr);
  if (Number.isNaN(target.getTime())) return null;
  // 对于每年重复的纪念日：替换为今年或明年
  const thisYear = new Date(now.getFullYear(), target.getMonth(), target.getDate());
  const nextOccur = thisYear < now ? new Date(now.getFullYear() + 1, target.getMonth(), target.getDate()) : thisYear;
  const diffMs = nextOccur.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export default function AnniversariesPage() {
  const [items, setItems] = useState<Anniv[]>([]);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [passedGate, setPassedGate] = useState<boolean>(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list = raw ? (JSON.parse(raw) as Anniv[]) : [];
      let initial = Array.isArray(list) ? list : [];
      // If empty, prefill common anniversaries
      if (initial.length === 0) {
        initial = [
          { id: crypto.randomUUID?.() ?? "1", name: "在一起纪念日", date: "2023-07-08" },
          { id: crypto.randomUUID?.() ?? "2", name: "璎生日", date: "2001-03-06" },
          { id: crypto.randomUUID?.() ?? "3", name: "逸君生日", date: "2001-04-03" },
        ];
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(initial)); } catch {}
      }
      setItems(initial);
    } catch {}
    try {
      const g = localStorage.getItem(STORAGE_PASSED_GATE_KEY);
      setPassedGate(g === "1");
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
  }, [items]);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      const da = daysUntil(a.date) ?? 0;
      const db = daysUntil(b.date) ?? 0;
      return da - db;
    });
  }, [items]);

  function addItem() {
    if (!name.trim() || !date) return;
    setItems((prev) => [
      { id: crypto.randomUUID?.() ?? `${Date.now()}`, name: name.trim(), date },
      ...prev,
    ]);
    setName("");
    setDate("");
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {!passedGate && (
        <div className="rounded-xl border border-black/10 dark:border-white/20 p-4 text-center">
          <p className="text-sm">请先在<Link href="/" className="underline mx-1">首页</Link>输入访问码以解锁内容</p>
        </div>
      )}
      {passedGate && (
        <>
          <h1 className="text-2xl font-bold">纪念日</h1>
          <p className="mt-2 text-sm text-black/70 dark:text-white/70">添加相识、确定关系、生日、周年等重要日子。会在首页显示最近的倒计时。</p>

          <div className="mt-6 rounded-2xl border border-black/10 dark:border-white/15 p-4 bg-white/60 dark:bg-black/20">
            <div className="grid gap-3 sm:grid-cols-[1fr_200px_auto] items-end">
              <div>
                <label className="block text-sm mb-1">名称</label>
                <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="例如：在一起纪念日" className="w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-pink-400/60" />
              </div>
              <div>
                <label className="block text-sm mb-1">日期</label>
                <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-pink-400/60" />
              </div>
              <button onClick={addItem} className="h-10 rounded-md bg-pink-500 px-4 text-white hover:bg-pink-600">添加</button>
            </div>
          </div>

          <ul className="mt-6 space-y-3">
            {sorted.map((it) => (
              <li key={it.id} className="rounded-xl border border-black/10 dark:border-white/15 p-4 bg-white/60 dark:bg-black/20 flex items-center justify-between">
                <div>
                  <p className="text-sm text-black/60 dark:text-white/60">{formatDate(it.date)}</p>
                  <p className="text-base font-medium">{it.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm">{daysUntil(it.date)} 天</span>
                  <button onClick={() => remove(it.id)} className="text-xs rounded-md border px-2 py-1">删除</button>
                </div>
              </li>
            ))}
            {sorted.length === 0 && (
              <li className="text-sm text-black/60 dark:text-white/70">还没有纪念日，先添加一条吧～</li>
            )}
          </ul>
        </>
      )}
    </div>
  );
}

// no extra exports allowed for Next.js app page

