"use client";

import { useState } from "react";

type Wish = { id: string; title: string; category: string; done: boolean; due?: string; priority?: number; note?: string };

export function ExportJSON({ items }: { items: Wish[] }) {
  function onExport() {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "wishlist.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }
  return <button onClick={onExport} className="rounded-md border px-3 py-2 text-sm">导出</button>;
}

export function ImportJSON({ onImport }: { onImport: (items: Wish[]) => void }) {
  const [err, setErr] = useState<string>("");
  function onFile(file?: File) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (Array.isArray(data)) onImport(data);
      } catch (e) {
        setErr("解析失败");
      }
    };
    reader.readAsText(file);
  }
  return (
    <label className="rounded-md border px-3 py-2 text-sm cursor-pointer">
      导入
      <input type="file" accept="application/json" className="hidden" onChange={(e)=>onFile(e.target.files?.[0])} />
      {err && <span className="ml-2 text-xs text-red-500">{err}</span>}
    </label>
  );
}

export function EditDialog({ value, onClose, onSave }: { value: Wish; onClose: () => void; onSave: (v: Wish) => void }) {
  const [draft, setDraft] = useState<Wish>({ ...value });
  return (
    <div className="expand-overlay">
      <div className="expand-card w-full max-w-md">
        <h3 className="expand-title">编辑愿望</h3>
        <div className="grid gap-3">
          <input value={draft.title} onChange={e=>setDraft({ ...draft, title: e.target.value })} className="w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2" />
          <select value={draft.category} onChange={e=>setDraft({ ...draft, category: e.target.value })} className="w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2">
            <option>旅行</option>
            <option>学习</option>
            <option>生活</option>
            <option>美食</option>
            <option>其他</option>
          </select>
          <input type="date" value={draft.due || ""} onChange={e=>setDraft({ ...draft, due: e.target.value })} className="w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2" />
          <input type="range" min={1} max={5} value={draft.priority ?? 3} onChange={e=>setDraft({ ...draft, priority: Number(e.target.value) })} />
          <textarea rows={3} value={draft.note || ""} onChange={e=>setDraft({ ...draft, note: e.target.value })} className="w-full rounded-md border border-black/15 dark:border-white/20 bg-transparent px-3 py-2" />
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="rounded-md nav-pill px-3 py-1.5 text-sm">取消</button>
            <button onClick={()=>onSave(draft)} className="rounded-md btn-accent px-3 py-1.5 text-sm text-white">保存</button>
          </div>
        </div>
      </div>
    </div>
  );
}


