"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Entry = { id: string; title: string; date?: string; type: string; href: string };

function useCommandData(): Entry[] {
  const [data, setData] = useState<Entry[]>([]);
  useEffect(() => {
    try {
      const entries = JSON.parse(localStorage.getItem("loveEntries") || "[]") as { id: string; title: string; date: string }[];
      const annivs = JSON.parse(localStorage.getItem("loveAnniversaries") || "[]") as { id: string; name: string; date: string }[];
      const wishes = JSON.parse(localStorage.getItem("loveWishlist") || "[]") as { id: string; title: string }[];
      const notes = JSON.parse(localStorage.getItem("loveGuestbook") || "[]") as { id: string; text: string }[];
      const milestones = JSON.parse(localStorage.getItem("loveMilestones") || "[]") as { id: string; title: string; date: string }[];
      const list: Entry[] = [
        ...entries.map((e) => ({ id: e.id, title: e.title, date: e.date, type: "时间轴", href: "#timeline" })),
        ...milestones.map((m) => ({ id: m.id, title: m.title, date: m.date, type: "里程碑", href: "/milestones" })),
        ...annivs.map((a) => ({ id: a.id, title: a.name, date: a.date, type: "纪念日", href: "/anniversaries" })),
        ...wishes.map((w) => ({ id: w.id, title: w.title, type: "心愿单", href: "/wishlist" })),
        ...notes.map((n) => ({ id: n.id, title: n.text.slice(0, 24), type: "留言本", href: "/guestbook" })),
      ];
      setData(list);
    } catch {}
  }, []);
  return data;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const data = useCommandData();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return data.slice(0, 30);
    return data.filter((x) => (x.title + (x.date || "") + x.type).toLowerCase().includes(s)).slice(0, 30);
  }, [q, data]);

  if (!open) return null;
  return (
    <div className="cmd-overlay" onClick={() => setOpen(false)}>
      <div className="cmd-panel" onClick={(e) => e.stopPropagation()}>
        <div className="cmd-header">
          <input autoFocus className="cmd-input" placeholder="搜索 时间轴/里程碑/纪念日/心愿单/留言…（⌘K 打开，Esc 关闭）" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="cmd-list">
          {list.map((x) => (
            <Link key={x.type + x.id} href={x.href} className="cmd-item">
              <span className="text-xs opacity-60 w-14">{x.type}</span>
              <span className="flex-1 truncate">{x.title}</span>
              {x.date && <span className="text-xs opacity-60">{x.date}</span>}
            </Link>
          ))}
          {list.length === 0 && (
            <div className="cmd-item text-sm opacity-70">没有匹配内容</div>
          )}
        </div>
      </div>
    </div>
  );
}


