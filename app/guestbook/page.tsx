"use client";

import { useEffect, useState } from "react";

type Note = { id: string; text: string; createdAt: number };

const STORAGE_KEY = "loveGuestbook";
const STORAGE_PASSED_GATE_KEY = "lovePassedGate";

export default function GuestbookPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [text, setText] = useState("");
  const [passedGate, setPassedGate] = useState(false);

  useEffect(() => {
    try { setPassedGate(localStorage.getItem(STORAGE_PASSED_GATE_KEY) === "1"); } catch {}
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list = raw ? (JSON.parse(raw) as Note[]) : [];
      setNotes(Array.isArray(list) ? list : []);
    } catch {}
  }, []);

  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notes)); } catch {} }, [notes]);

  function add() {
    const value = text.trim();
    if (!value) return;
    setNotes(prev => [{ id: crypto.randomUUID?.() ?? `${Date.now()}`, text: value, createdAt: Date.now() }, ...prev]);
    setText("");
  }

  function remove(id: string) { setNotes(prev => prev.filter(n => n.id !== id)); }

  if (!passedGate) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8"><div className="rounded-xl border border-black/10 dark:border-white/20 p-4 text-center"><p className="text-sm">请先返回首页输入访问码以解锁内容</p></div></div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">留言本</h1>
      <div className="mt-4 rounded-2xl glass-card p-4">
        <textarea rows={3} value={text} onChange={e=>setText(e.target.value)} placeholder="想对彼此说的话～" className="w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-pink-400/60" />
        <div className="mt-3 text-right">
          <button onClick={add} className="rounded-md btn-accent px-4 py-2 text-white hover:brightness-105">发表</button>
        </div>
      </div>

      <ul className="mt-6 space-y-3">
        {notes.map(n => (
          <li key={n.id} className="rounded-xl glass-card p-4">
            <p className="whitespace-pre-wrap leading-relaxed text-[15px]">{n.text}</p>
            <div className="mt-2 flex items-center justify-between text-xs text-black/60 dark:text-white/60">
              <span>{new Date(n.createdAt).toLocaleString()}</span>
              <button onClick={()=>remove(n.id)} className="rounded-md nav-pill px-2 py-1">删除</button>
            </div>
          </li>
        ))}
        {notes.length===0 && <li className="text-sm text-black/60 dark:text-white/60">还没有留言，写下一句吧～</li>}
      </ul>
    </div>
  );
}

