"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Upload,
  BookOpen,
  FileText,
  File,
  Play,
  ChevronDown,
  X,
  SlidersHorizontal,
  Clock,
  BarChart3,
} from "lucide-react";

type ContentType = "course" | "book" | "note" | "upload";

interface BaseItem {
  id: string;
  title: string;
  type: ContentType;
  subject: string;
  createdAt: string;
}
interface CourseItem extends BaseItem {
  type: "course";
  progress: number;
  totalLessons: number;
  completedLessons: number;
  duration: string;
}
interface BookItem extends BaseItem {
  type: "book";
  author: string;
  chapters: number;
  pages: number;
}
interface NoteItem extends BaseItem {
  type: "note";
  wordCount: number;
  lastEdited: string;
}
interface UploadItem extends BaseItem {
  type: "upload";
  fileSize: string;
  fileType: string;
  pages: number;
}
type LibraryItem = CourseItem | BookItem | NoteItem | UploadItem;

const MOCK_ITEMS: LibraryItem[] = [
  { id: "c1", type: "course", title: "Neural Networks", subject: "Machine Learning", progress: 68, totalLessons: 24, completedLessons: 16, duration: "12h 30m", createdAt: "2026-08-10" },
  { id: "c2", type: "course", title: "Quantum Mechanics", subject: "Physics", progress: 32, totalLessons: 18, completedLessons: 6, duration: "9h 45m", createdAt: "2026-08-22" },
  { id: "c3", type: "course", title: "Advanced React", subject: "Computer Science", progress: 91, totalLessons: 30, completedLessons: 27, duration: "15h 0m", createdAt: "2026-07-15" },
  { id: "b1", type: "book", title: "The Elements of Statistical Learning", subject: "Statistics", author: "Hastie, Tibshirani & Friedman", chapters: 18, pages: 764, createdAt: "2026-08-01" },
  { id: "b2", type: "book", title: "Deep Learning (Goodfellow)", subject: "Machine Learning", author: "Goodfellow, Bengio & Courville", chapters: 20, pages: 800, createdAt: "2026-08-18" },
  { id: "n1", type: "note", title: "Neural Network Architecture Notes", subject: "Machine Learning", wordCount: 1840, lastEdited: "2026-08-30", createdAt: "2026-08-25" },
  { id: "n2", type: "note", title: "Backpropagation Derivation", subject: "Machine Learning", wordCount: 620, lastEdited: "2026-09-01", createdAt: "2026-09-01" },
  { id: "u1", type: "upload", title: "ML_Research_Paper.pdf", subject: "Machine Learning", fileSize: "2.4 MB", fileType: "PDF", pages: 14, createdAt: "2026-08-28" },
  { id: "u2", type: "upload", title: "Physics_Textbook_Ch3.pdf", subject: "Physics", fileSize: "8.7 MB", fileType: "PDF", pages: 52, createdAt: "2026-08-20" },
];

const SUBJECTS = ["All Subjects", "Machine Learning", "Physics", "Computer Science", "Statistics"];
type SortOption = "recent" | "az" | "progress";
type TabOption = "all" | ContentType;

const TYPE_META = {
  course: { label: "Course", gradFrom: "from-emerald-500/30", gradTo: "to-emerald-500/5", accent: "text-hexagon-accent", badge: "bg-hexagon-accent/10 text-hexagon-accent", border: "hover:border-hexagon-accent/40", btn: "bg-hexagon-accent text-black hover:bg-hexagon-accent/90", icon: BarChart3 },
  book:   { label: "Book",   gradFrom: "from-blue-500/30",    gradTo: "to-blue-500/5",    accent: "text-blue-400",          badge: "bg-blue-500/10 text-blue-400",           border: "hover:border-blue-400/40",           btn: "border border-blue-400/30 text-blue-400 hover:bg-blue-400/10",         icon: BookOpen },
  note:   { label: "Note",   gradFrom: "from-violet-500/30",  gradTo: "to-violet-500/5",  accent: "text-violet-400",        badge: "bg-violet-500/10 text-violet-400",       border: "hover:border-violet-400/40",         btn: "border border-violet-400/30 text-violet-400 hover:bg-violet-400/10", icon: FileText },
  upload: { label: "Upload", gradFrom: "from-amber-500/30",   gradTo: "to-amber-500/5",   accent: "text-amber-400",         badge: "bg-amber-500/10 text-amber-400",         border: "hover:border-amber-400/40",          btn: "bg-amber-500/15 text-amber-400 hover:bg-amber-500/25",               icon: File },
};

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function CardThumbnail({ type }: { type: ContentType }) {
  const meta = TYPE_META[type];
  const Icon = meta.icon;
  return (
    <div className={`w-full h-28 rounded-xl bg-gradient-to-br ${meta.gradFrom} ${meta.gradTo} flex items-center justify-center mb-4`}>
      <Icon className="w-10 h-10 text-white/20" strokeWidth={1.5} />
    </div>
  );
}

function CourseCard({ item }: { item: CourseItem }) {
  const meta = TYPE_META.course;
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
      className={`bg-hexagon-surface border border-hexagon-border rounded-2xl p-5 flex flex-col gap-3 ${meta.border} transition-all duration-300 group cursor-pointer`}>
      <CardThumbnail type="course" />
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${meta.badge}`}>{item.subject}</span>
        <span className="text-xs text-hexagon-text-secondary flex items-center gap-1"><Clock className="w-3 h-3" />{item.duration}</span>
      </div>
      <h3 className={`text-sm font-semibold text-hexagon-text-primary line-clamp-2 group-hover:${meta.accent} transition-colors`}>{item.title}</h3>
      <p className="text-xs text-hexagon-text-secondary">{item.completedLessons} / {item.totalLessons} lessons</p>
      <div className="space-y-1">
        <div className="w-full h-1 bg-hexagon-border rounded-full overflow-hidden">
          <div className="h-full bg-hexagon-accent rounded-full" style={{ width: `${item.progress}%` }} />
        </div>
        <p className="text-xs text-hexagon-text-secondary">{item.progress}% complete</p>
      </div>
      <button className={`mt-1 w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${meta.btn}`}>
        <Play className="w-3 h-3 fill-black" /> Continue
      </button>
    </motion.div>
  );
}

function BookCard({ item }: { item: BookItem }) {
  const meta = TYPE_META.book;
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
      className={`bg-hexagon-surface border border-hexagon-border rounded-2xl p-5 flex flex-col gap-3 ${meta.border} transition-all duration-300 group cursor-pointer`}>
      <CardThumbnail type="book" />
      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${meta.badge} self-start`}>{item.subject}</span>
      <h3 className="text-sm font-semibold text-hexagon-text-primary line-clamp-2 group-hover:text-blue-400 transition-colors">{item.title}</h3>
      <p className="text-xs text-hexagon-text-secondary">{item.author}</p>
      <p className="text-xs text-hexagon-text-secondary">{item.chapters} chapters · {item.pages} pages</p>
      <button className={`mt-auto w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${meta.btn}`}>
        <BookOpen className="w-3 h-3" /> Read
      </button>
    </motion.div>
  );
}

function NoteCard({ item }: { item: NoteItem }) {
  const meta = TYPE_META.note;
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
      className={`bg-hexagon-surface border border-hexagon-border rounded-2xl p-5 flex flex-col gap-3 ${meta.border} transition-all duration-300 group cursor-pointer`}>
      <CardThumbnail type="note" />
      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${meta.badge} self-start`}>{item.subject}</span>
      <h3 className="text-sm font-semibold text-hexagon-text-primary line-clamp-2 group-hover:text-violet-400 transition-colors">{item.title}</h3>
      <p className="text-xs text-hexagon-text-secondary">{item.wordCount.toLocaleString()} words</p>
      <p className="text-xs text-hexagon-text-secondary">Edited {formatDate(item.lastEdited)}</p>
      <button className={`mt-auto w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${meta.btn}`}>
        <FileText className="w-3 h-3" /> Open
      </button>
    </motion.div>
  );
}

function UploadCard({ item }: { item: UploadItem }) {
  const meta = TYPE_META.upload;
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
      className={`bg-hexagon-surface border border-hexagon-border rounded-2xl p-5 flex flex-col gap-3 ${meta.border} transition-all duration-300 group cursor-pointer`}>
      <CardThumbnail type="upload" />
      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${meta.badge} self-start`}>{item.subject}</span>
      <h3 className="text-sm font-semibold text-hexagon-text-primary line-clamp-2 group-hover:text-amber-400 transition-colors">{item.title}</h3>
      <p className="text-xs text-hexagon-text-secondary">{item.fileType} · {item.fileSize} · {item.pages} pages</p>
      <p className="text-xs text-hexagon-text-secondary">Added {formatDate(item.createdAt)}</p>
      <button className={`mt-auto w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${meta.btn}`}>
        <Play className="w-3 h-3" /> Start Learning
      </button>
    </motion.div>
  );
}

function LibraryCard({ item }: { item: LibraryItem }) {
  if (item.type === "course") return <CourseCard item={item} />;
  if (item.type === "book")   return <BookCard item={item} />;
  if (item.type === "note")   return <NoteCard item={item} />;
  return <UploadCard item={item} />;
}

function Dropdown({ options, value, onChange, label }: { options: string[]; value: string; onChange: (v: string) => void; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(p => !p)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-hexagon-surface border border-hexagon-border text-sm text-hexagon-text-secondary hover:border-hexagon-accent/40 transition-colors">
        {label && <span className="text-hexagon-text-secondary/60 text-xs">{label}:</span>}
        <span className="text-hexagon-text-primary">{value}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="absolute top-full mt-2 left-0 z-50 bg-hexagon-surface border border-hexagon-border rounded-xl shadow-2xl overflow-hidden min-w-[160px]">
            {options.map(opt => (
              <button key={opt} onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-hexagon-accent/10 transition-colors ${opt === value ? "text-hexagon-accent" : "text-hexagon-text-primary"}`}>
                {opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const TABS: { label: string; value: TabOption }[] = [
  { label: "All", value: "all" },
  { label: "Courses", value: "course" },
  { label: "Books", value: "book" },
  { label: "Notes", value: "note" },
  { label: "Uploads", value: "upload" },
];

const SORT_LABELS: Record<SortOption, string> = { recent: "Recent", az: "A–Z", progress: "Progress" };

export default function LibraryPage() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabOption>("all");
  const [subject, setSubject] = useState("All Subjects");
  const [sort, setSort] = useState<SortOption>("recent");

  const filtered = useMemo(() => {
    let items = [...MOCK_ITEMS];
    if (activeTab !== "all") items = items.filter(i => i.type === activeTab);
    if (subject !== "All Subjects") items = items.filter(i => i.subject === subject);
    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.subject.toLowerCase().includes(q) ||
        (i.type === "book" && (i as BookItem).author.toLowerCase().includes(q))
      );
    }
    if (sort === "az") items.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === "recent") items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    else if (sort === "progress") items.sort((a, b) => {
      const ap = a.type === "course" ? (a as CourseItem).progress : 0;
      const bp = b.type === "course" ? (b as CourseItem).progress : 0;
      return bp - ap;
    });
    return items;
  }, [query, activeTab, subject, sort]);

  return (
    <div className="max-w-7xl mx-auto p-8 pt-12 space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-hexagon-text-primary">Library</h1>
          <p className="text-hexagon-text-secondary mt-1 text-sm">{MOCK_ITEMS.length} items across your collection</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-hexagon-accent text-black text-sm font-semibold hover:bg-hexagon-accent/90 transition-colors">
          <Upload className="w-4 h-4" /> Upload Material
        </button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-hexagon-text-secondary" />
        <input type="text" value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search courses, books, notes, uploads…"
          className="w-full pl-11 pr-11 py-3.5 bg-hexagon-surface border border-hexagon-border rounded-xl text-hexagon-text-primary placeholder:text-hexagon-text-secondary/50 text-sm outline-none focus:border-hexagon-accent/50 transition-colors" />
        {query && (
          <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-hexagon-text-secondary hover:text-hexagon-text-primary">
            <X className="w-4 h-4" />
          </button>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-hexagon-surface border border-hexagon-border rounded-xl">
          {TABS.map(tab => (
            <button key={tab.value} onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.value ? "bg-hexagon-accent text-black" : "text-hexagon-text-secondary hover:text-hexagon-text-primary"}`}>
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <SlidersHorizontal className="w-4 h-4 text-hexagon-text-secondary" />
          <Dropdown options={SUBJECTS} value={subject} onChange={setSubject} label="Subject" />
          <Dropdown
            options={Object.values(SORT_LABELS)}
            value={SORT_LABELS[sort]}
            onChange={v => { const key = (Object.entries(SORT_LABELS).find(([,l]) => l === v)?.[0]) as SortOption; if (key) setSort(key); }}
            label="Sort"
          />
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-hexagon-surface border border-hexagon-border flex items-center justify-center">
              <Search className="w-7 h-7 text-hexagon-text-secondary/40" />
            </div>
            <p className="text-hexagon-text-secondary text-sm">No items match <span className="text-hexagon-text-primary font-medium">"{query}"</span></p>
            <button onClick={() => { setQuery(""); setActiveTab("all"); setSubject("All Subjects"); }}
              className="text-hexagon-accent text-xs hover:underline">Clear filters</button>
          </motion.div>
        ) : (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            <AnimatePresence>
              {filtered.map(item => <LibraryCard key={item.id} item={item} />)}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
