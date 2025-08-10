"use client";

import { useEffect, useState } from "react";

type Photo = {
  id: string;
  url: string; // blob URL
  name: string;
  createdAt: number;
};

const STORAGE_KEY = "loveAlbumLocal";
const STORAGE_PASSED_GATE_KEY = "lovePassedGate";

export default function AlbumPage() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [passedGate, setPassedGate] = useState(false);

  useEffect(() => {
    try { setPassedGate(localStorage.getItem(STORAGE_PASSED_GATE_KEY) === "1"); } catch {}
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list = raw ? (JSON.parse(raw) as Photo[]) : [];
      setPhotos(Array.isArray(list) ? list : []);
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(photos)); } catch {}
  }, [photos]);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const newItems: Photo[] = [];
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        newItems.push({
          id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
          url: String(reader.result),
          name: file.name,
          createdAt: Date.now(),
        });
        if (newItems.length === files.length) {
          setPhotos((prev) => [...newItems, ...prev]);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  function remove(id: string) {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }

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
      <h1 className="text-2xl font-bold">相册（本地存储 + 预览）</h1>
      <p className="mt-2 text-sm text-black/70 dark:text-white/70">现阶段图片仅保存在本地浏览器。下一步将接入 Vercel Blob 持久化存储。</p>

      <div className="mt-4 flex items-center gap-3">
        <label className="rounded-md bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 cursor-pointer">
          选择图片
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e)=>handleFiles(e.target.files)} />
        </label>
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {photos.map((p) => (
          <figure key={p.id} className="group relative aspect-square overflow-hidden rounded-xl border border-black/10 dark:border-white/15 bg-black/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt={p.name} className="h-full w-full object-cover" />
            <figcaption className="absolute bottom-0 left-0 right-0 text-xs p-2 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition">{p.name}</figcaption>
            <button onClick={() => remove(p.id)} className="absolute top-2 right-2 text-xs rounded-md border px-2 py-1 bg-white/80">删除</button>
          </figure>
        ))}
        {photos.length===0 && <p className="text-sm text-black/60 dark:text-white/60">暂无图片，点击“选择图片”开始上传</p>}
      </div>
    </div>
  );
}

