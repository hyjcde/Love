"use client";

import { useEffect, useMemo, useState } from "react";

type Wish = { id: string; title: string; category: string; done: boolean };

const STORAGE_KEY = "loveWishlist";
const STORAGE_PASSED_GATE_KEY = "lovePassedGate";

export default function WishlistPage() {
  const [items, setItems] = useState<Wish[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("旅行");
  const [passedGate, setPassedGate] = useState(false);

  useEffect(() => {
    try { setPassedGate(localStorage.getItem(STORAGE_PASSED_GATE_KEY) === "1"); } catch {}
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list = raw ? (JSON.parse(raw) as Wish[]) : [];
      setItems(Array.isArray(list) ? list : []);
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
  }, [items]);

  function add() {
    if (!title.trim()) return;
    setItems(prev => [{ id: crypto.randomUUID?.() ?? `${Date.now()}`, title: title.trim(), category, done: false }, ...prev]);
    setTitle("");
  }

  function toggle(id: string) { setItems(prev => prev.map(x => x.id===id ? { ...x, done: !x.done } : x)); }
  function remove(id: string) { setItems(prev => prev.filter(x => x.id !== id)); }

  const grouped = useMemo(() => {
    const map: Record<string, Wish[]> = {};
    for (const w of items) { (map[w.category] ||= []).push(w); }
    return map;
  }, [items]);

  if (!passedGate) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-xl border border-black/10 dark:border-white/20 p-4 text-center"><p className="text-sm">请先返回首页输入访问码以解锁内容</p></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">心愿单</h1>
      <div className="mt-4 rounded-2xl border border-black/10 dark:border-white/15 p-4 bg-white/60 dark:bg-black/20">
        <div className="grid gap-3 sm:grid-cols-[1fr_160px_auto] items-end">
          <div>
            <label className="block text-sm mb-1">愿望</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="例如：去看海" className="w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-pink-400/60" />
          </div>
          <div>
            <label className="block text-sm mb-1">分类</label>
            <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2">
              <option>旅行</option>
              <option>学习</option>
              <option>生活</option>
              <option>美食</option>
              <option>其他</option>
            </select>
          </div>
          <button onClick={add} className="h-10 rounded-md bg-pink-500 text-white px-4 hover:bg-pink-600">添加</button>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {Object.keys(grouped).length === 0 && (
          <p className="text-sm text-black/60 dark:text-white/60">还没有愿望，写下第一个吧～</p>
        )}
        {Object.entries(grouped).map(([cat, list]) => (
          <section key={cat} className="rounded-xl border border-black/10 dark:border-white/15 p-4 bg-white/60 dark:bg-black/20">
            <h2 className="font-semibold mb-3">{cat}</h2>
            <ul className="space-y-2">
              {list.map(w => (
                <li key={w.id} className="flex items-center justify-between gap-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={w.done} onChange={()=>toggle(w.id)} />
                    <span className={w.done ? "line-through opacity-60" : ""}>{w.title}</span>
                  </label>
                  <button onClick={()=>remove(w.id)} className="text-xs rounded-md border px-2 py-1">删除</button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

