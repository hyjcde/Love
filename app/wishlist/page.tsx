"use client";

import { useEffect, useMemo, useState } from "react";
import { ExportJSON, ImportJSON, EditDialog } from "./components";

type Wish = { id: string; title: string; category: string; done: boolean; due?: string; priority?: number; note?: string };

const STORAGE_KEY = "loveWishlist";
const STORAGE_PASSED_GATE_KEY = "lovePassedGate";

export default function WishlistPage() {
  const [items, setItems] = useState<Wish[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("旅行");
  const [due, setDue] = useState<string>("");
  const [priority, setPriority] = useState<number>(3);
  const [note, setNote] = useState<string>("");
  const [passedGate, setPassedGate] = useState(false);
  const [q, setQ] = useState("");
  const [filterCat, setFilterCat] = useState<string>("全部");
  const [editing, setEditing] = useState<Wish | null>(null);

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
    setItems(prev => [{ id: crypto.randomUUID?.() ?? `${Date.now()}`, title: title.trim(), category, due: due || undefined, priority, note: note.trim() || undefined, done: false }, ...prev]);
    setTitle(""); setDue(""); setPriority(3); setNote("");
  }

  function toggle(id: string) { setItems(prev => prev.map(x => x.id===id ? { ...x, done: !x.done } : x)); }
  function remove(id: string) { setItems(prev => prev.filter(x => x.id !== id)); }

  const filtered = useMemo(() => {
    return items.filter(w => {
      if (filterCat !== "全部" && w.category !== filterCat) return false;
      if (q && q.trim()) {
        const s = (w.title + (w.note || "") + (w.due || "")).toLowerCase();
        if (!s.includes(q.toLowerCase())) return false;
      }
      return true;
    }).sort((a,b)=> (a.done === b.done ? (b.priority??0) - (a.priority??0) : (a.done ? 1 : -1)));
  }, [items, filterCat, q]);

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
        <div className="grid gap-3 sm:grid-cols-2 items-start">
          <div>
            <label className="block text-sm mb-1">愿望</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="例如：去看海" className="w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-pink-400/60" />
          </div>
          <div className="grid grid-cols-2 gap-3">
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
            <div>
              <label className="block text-sm mb-1">截止日期</label>
              <input type="date" value={due} onChange={e=>setDue(e.target.value)} className="w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm mb-1">优先级</label>
              <input type="range" min={1} max={5} value={priority} onChange={e=>setPriority(Number(e.target.value))} className="w-full" />
              <div className="text-xs opacity-70">{priority}</div>
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm mb-1">备注（可选）</label>
            <textarea rows={2} value={note} onChange={e=>setNote(e.target.value)} className="w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2" />
          </div>
          <div className="sm:col-span-2">
            <button onClick={add} className="rounded-md bg-pink-500 text-white px-4 py-2 hover:bg-pink-600">添加</button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input placeholder="搜索关键词" value={q} onChange={e=>setQ(e.target.value)} className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2" />
        <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} className="rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2">
          <option>全部</option>
          <option>旅行</option>
          <option>学习</option>
          <option>生活</option>
          <option>美食</option>
          <option>其他</option>
        </select>
        <div className="flex items-center gap-2">
          <ExportJSON items={filtered} />
          <ImportJSON onImport={(arr)=>setItems(arr)} />
        </div>
      </div>

      <ul className="mt-6 space-y-2">
        {filtered.length === 0 && <li className="text-sm text-black/60 dark:text-white/60">没有匹配的愿望</li>}
        {filtered.map(w => (
          <li key={w.id} className="rounded-xl border border-black/10 dark:border-white/15 p-4 bg-white/60 dark:bg-black/20">
            <div className="flex items-start justify-between gap-3">
              <label className="flex items-start gap-2">
                <input type="checkbox" checked={w.done} onChange={()=>toggle(w.id)} />
                <div>
                  <div className="font-medium">
                    {w.title}
                    {typeof w.priority === 'number' && <span className="ml-2 text-xs opacity-70">优先级 {w.priority}</span>}
                  </div>
                  <div className="text-xs opacity-70">
                    <span className="mr-2">{w.category}</span>
                    {w.due && <span>截止：{w.due}</span>}
                  </div>
                  {w.note && <p className="mt-1 text-sm opacity-80 whitespace-pre-wrap">{w.note}</p>}
                </div>
              </label>
              <div className="flex items-center gap-2">
                <button onClick={()=>setEditing(w)} className="text-xs rounded-md border px-2 py-1">编辑</button>
                <button onClick={()=>remove(w.id)} className="text-xs rounded-md border px-2 py-1">删除</button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {editing && (
        <EditDialog value={editing} onClose={()=>setEditing(null)} onSave={(val)=>{ setItems(prev=>prev.map(x=>x.id===val.id?val:x)); setEditing(null); }} />
      )}
    </div>
  );
}

