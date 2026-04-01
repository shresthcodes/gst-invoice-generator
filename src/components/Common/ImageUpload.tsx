import { useRef, useState } from 'react';

interface Props {
  label: string;
  value: string;
  onChange: (base64: string) => void;
  onClear?: () => void;
  placeholder?: string;
  icon?: string;
}

export default function ImageUpload({ label, value, onChange, onClear, placeholder = 'Click to upload image', icon = '🖼️' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</label>

      {value ? (
        /* Preview state */
        <div className="relative group rounded-xl overflow-hidden border border-gray-200/60 dark:border-white/10 bg-white/50 dark:bg-white/5 p-2 flex items-center gap-3">
          <img src={value} alt={label} className="h-12 w-12 object-contain rounded-lg bg-white dark:bg-gray-800 p-1 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{label} uploaded</div>
            <div className="text-[10px] text-gray-400 mt-0.5">Click change to replace</div>
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 font-medium transition-colors"
            >
              Change
            </button>
            {onClear && (
              <button
                type="button"
                onClick={() => { onClear(); if (inputRef.current) inputRef.current.value = ''; }}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 font-medium transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Upload state */
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`w-full rounded-xl border-2 border-dashed px-4 py-4 flex flex-col items-center gap-2 transition-all cursor-pointer ${
            dragging
              ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-500/10'
              : 'border-gray-200 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-colors ${
            dragging ? 'bg-indigo-100 dark:bg-indigo-500/20' : 'bg-gray-100 dark:bg-white/5'
          }`}>
            {icon}
          </div>
          <div className="text-center">
            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">{placeholder}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">PNG, JPG, SVG · Drag & drop or click</div>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold shadow-sm shadow-indigo-500/20">
            Browse File
          </div>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
