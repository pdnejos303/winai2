// Path: src/components/task/TaskTile.tsx
"use client";

type Props = {
  color: "green" | "yellow";
  label: string;
  onClick: () => void;
};

export default function TaskTile({ color, label, onClick }: Props) {
  const bg =
    color === "green" ? "bg-brand-green" : "bg-yellow-500/70 hover:bg-yellow-500";
  return (
    <div
      onClick={onClick}
      className="flex cursor-pointer flex-col items-center justify-center rounded-tile border bg-brand-whiteTile p-6 shadow
                 transition hover:shadow-md"
      style={{ minHeight: 180 }}
    >
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-full text-4xl text-white ${bg}`}
      >
        +
      </div>
      <p className="pt-3 text-sm font-medium">{label}</p>
    </div>
  );
}
