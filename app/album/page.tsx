"use client";

import { useEffect, useMemo, useState } from "react";

type Photo = {
  id: string;
  url: string; // blob URL
  name: string;
  createdAt: number;
  album?: string; // 自定义相册名
};

const STORAGE_KEY = "loveAlbumLocal";
const STORAGE_PASSED_GATE_KEY = "lovePassedGate";

export default function AlbumPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [passedGate, setPassedGate] = useState(false);
  const [albumName, setAlbumName] = useState<string>("");
  const [useCloud, setUseCloud] = useState<boolean>(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    try { setPassedGate(localStorage.getItem(STORAGE_PASSED_GATE_KEY) === "1"); } catch {}
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list = raw ? (JSON.parse(raw) as Photo[]) : [];
      setPhotos(Array.isArray(list) ? list : []);
    } catch {}
    try { setUseCloud(localStorage.getItem("loveAlbumUseCloud") === "1"); } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(photos)); } catch {}
  }, [photos]);

  useEffect(() => { try { localStorage.setItem("loveAlbumUseCloud", useCloud ? "1" : "0"); } catch {} }, [useCloud]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const tasks = Array.from(files).map(async (file) => {
      if (useCloud) {
        const form = new FormData();
        form.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: form });
        if (!res.ok) throw new Error("upload failed");
        const data = (await res.json()) as { url: string };
        return { id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`, url: data.url, name: file.name, createdAt: Date.now(), album: albumName || undefined } as Photo;
      } else {
        const reader = new FileReader();
        const url = await new Promise<string>((resolve) => { reader.onload = () => resolve(String(reader.result)); reader.readAsDataURL(file); });
        return { id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`, url, name: file.name, createdAt: Date.now(), album: albumName || undefined } as Photo;
      }
    });
    const newItems = await Promise.all(tasks);
    setPhotos((prev) => [...newItems, ...prev]);
  }

  function remove(id: string) {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function removeSelected() {
    if (selected.size === 0) return;
    setPhotos((prev) => prev.filter((p) => !selected.has(p.id)));
    setSelected(new Set());
  }

  const grouped = useMemo(() => {
    const map = new Map<string, Photo[]>();
    for (const p of photos) {
      const d = new Date(p.createdAt);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const key = p.album ? `${p.album}` : ym;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    // sort photos newest first within group
    for (const [, arr] of map) arr.sort((a, b) => b.createdAt - a.createdAt);
    // order groups by recent
    return Array.from(map.entries()).sort((a, b) => (b[1][0]?.createdAt ?? 0) - (a[1][0]?.createdAt ?? 0));
  }, [photos]);

  if (!passedGate) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="rounded-xl border border-black/10 dark:border-white/20 p-4 text-center">
          <p className="text-sm">请先返回首页输入访问码以解锁内容</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold">相册</h1>
      <p className="mt-2 text-sm text-black/70 dark:text-white/70">支持本地或云端（Vercel Blob）保存。可分组、预览、批量删除。</p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm nav-pill px-3 py-2 rounded-md">
          <input type="checkbox" checked={useCloud} onChange={(e)=>setUseCloud(e.target.checked)} /> 云端保存
        </label>
        <input value={albumName} onChange={(e)=>setAlbumName(e.target.value)} placeholder="相册名（可选，如：旅行/约会）" className="rounded-md nav-pill bg-transparent px-3 py-2" />
        <label className="rounded-md btn-accent hover:brightness-105 text-white px-4 py-2 cursor-pointer">
          选择图片
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e)=>handleFiles(e.target.files)} />
        </label>
        {selected.size>0 && <button onClick={removeSelected} className="rounded-md nav-pill px-3 py-2 text-sm">删除所选（{selected.size}）</button>}
      </div>

      {grouped.length === 0 && <p className="mt-6 text-sm text-black/60 dark:text-white/60">暂无图片，点击“选择图片”开始上传</p>}
      {grouped.map(([group, list]) => (
        <section key={group} className="mt-6">
          <h2 className="mb-2 text-sm font-semibold opacity-70">{group}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {list.map((p) => (
              <figure key={p.id} className="group relative aspect-square overflow-hidden rounded-xl glass-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt={p.name} className="h-full w-full object-cover" onClick={()=>setPreview(p.url)} />
                <figcaption className="absolute bottom-0 left-0 right-0 text-xs p-2 bg-black/35 text-white opacity-0 group-hover:opacity-100 transition">{p.name}</figcaption>
                <div className="absolute top-2 left-2 flex items-center gap-2">
                  <input type="checkbox" checked={selected.has(p.id)} onChange={()=>toggleSelect(p.id)} />
                </div>
                <button onClick={() => remove(p.id)} className="absolute top-2 right-2 text-xs rounded-md nav-pill px-2 py-1 bg-white/80">删除</button>
              </figure>
            ))}
          </div>
        </section>
      ))}

      {preview && (
        <div className="fixed inset-0 modal-overlay grid place-items-center p-6" onClick={()=>setPreview(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="预览" className="max-h-full max-w-full modal-image" />
        </div>
      )}
    </div>
  );
}

