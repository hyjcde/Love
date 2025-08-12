"use client";

import { useEffect, useState } from "react";

type Milestone = {
  id: string;
  date: string; // yyyy-mm-dd
  title: string;
  note?: string;
};

const STORAGE_KEY = "loveMilestones";
const STORAGE_PASSED_GATE_KEY = "lovePassedGate";

export default function MilestonesPage() {
  const [items, setItems] = useState<Milestone[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [passedGate, setPassedGate] = useState<boolean>(false);

  useEffect(() => {
    try {
      const g = localStorage.getItem(STORAGE_PASSED_GATE_KEY);
      setPassedGate(g === "1");
    } catch {}

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      let list = raw ? (JSON.parse(raw) as Milestone[]) : [];
      if (!Array.isArray(list) || list.length === 0) {
        list = [
          { id: crypto.randomUUID?.() ?? "1", date: "2023-06-25", title: "表白" },
          { id: crypto.randomUUID?.() ?? "2", date: "2023-07-08", title: "在一起" },
          { id: crypto.randomUUID?.() ?? "3", date: "2023-10-16", title: "在一起 100 天" },
          { id: crypto.randomUUID?.() ?? "4", date: "2024-01-24", title: "在一起 200 天" },
          { id: crypto.randomUUID?.() ?? "5", date: "2024-05-03", title: "在一起 300 天" },
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      }
      setItems(list.sort((a,b)=> (a.date < b.date ? -1 : 1)));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
  }, [items]);

  function add() {
    if (!title.trim() || !date) return;
    const m: Milestone = { id: crypto.randomUUID?.() ?? `${Date.now()}`, date, title: title.trim(), note: note.trim() || undefined };
    setItems(prev => [...prev, m].sort((a,b)=> (a.date < b.date ? -1 : 1)));
    setTitle(""); setDate(""); setNote("");
  }

  function remove(id: string) { setItems(prev => prev.filter(x => x.id !== id)); }

  if (!passedGate) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-xl border border-black/10 dark:border-white/20 p-4 text-center">
          <p className="text-sm">请先返回首页输入访问码以解锁内容</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">里程碑</h1>
      <div className="mt-6 rounded-2xl glass-card p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_180px] items-end">
          <div>
            <label className="block text-sm mb-1">事件</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="例如：在一起 400 天" className="w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-pink-400/60" />
          </div>
          <div>
            <label className="block text-sm mb-1">日期</label>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-pink-400/60" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm mb-1">备注（可选）</label>
            <textarea rows={3} value={note} onChange={e=>setNote(e.target.value)} className="w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-pink-400/60" />
          </div>
          <div className="sm:col-span-2">
            <button onClick={add} className="rounded-md bg-pink-500 px-4 py-2 text-white hover:bg-pink-600">添加</button>
          </div>
        </div>
      </div>

      <ol className="mt-6 relative border-s border-black/10 dark:border-white/15 pl-6 timeline-list">
        {items.map(m => (
          <li key={m.id} className="mb-6">
            <div className="absolute -start-[9px] mt-1 h-4 w-4 rounded-full border border-white/90 dark:border-black/90 bg-pink-500 shadow timeline-dot" />
            <div className="rounded-xl border border-black/10 dark:border-white/15 p-4 bg-white/60 dark:bg-black/20">
              <p className="text-xs uppercase tracking-wide text-black/60 dark:text-white/60">{m.date}</p>
              <h3 className="text-base font-semibold mt-1">{m.title}</h3>
              {m.note && <p className="mt-2 whitespace-pre-wrap leading-relaxed text-[15px]">{m.note}</p>}
              <div className="mt-2 text-right">
                <button onClick={()=>remove(m.id)} className="text-xs rounded-md border px-2 py-1">删除</button>
              </div>
            </div>
          </li>
        ))}
        {items.length===0 && <li className="text-sm text-black/60 dark:text-white/70">暂无里程碑，添加第一条吧～</li>}
      </ol>
    </div>
  );
}

