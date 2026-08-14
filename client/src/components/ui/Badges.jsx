export function PriorityBadge({ priority }) {
  if (priority === 'high') {
    return (
      <span className="inline-flex items-center gap-1 text-error font-bold text-sm bg-error-container px-2 py-1 rounded-md">
        <span className="material-symbols-outlined text-[16px]">keyboard_double_arrow_up</span>
        High
      </span>
    );
  }
  if (priority === 'medium') {
    return (
      <span className="inline-flex items-center gap-1 text-tertiary font-bold text-sm bg-tertiary-fixed px-2 py-1 rounded-md">
        <span className="material-symbols-outlined text-[16px]">keyboard_arrow_up</span>
        Medium
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-on-surface-variant font-bold text-sm bg-surface-container-low px-2 py-1 rounded-md">
      <span className="material-symbols-outlined text-[16px]">keyboard_arrow_down</span>
      {priority ? 'Low' : 'Unassigned'}
    </span>
  );
}

export function StatusBadge({ status, type = 'default' }) {
  if (type === 'pill') {
    return status === 'resolved' ? (
      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-gray-500 text-white font-bold text-[11px] uppercase tracking-widest shadow-sm">Resolved</span>
    ) : (
      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-red-600 text-white font-bold text-[11px] uppercase tracking-widest shadow-sm">Open</span>
    );
  }
  
  if (type === 'solid') {
    return status === 'resolved' ? (
      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-gray-500 text-white font-bold text-[11px] uppercase tracking-widest shadow-sm">
        <span className="material-symbols-outlined text-[14px]">check_circle</span> Resolved
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-red-600 text-white font-bold text-[11px] uppercase tracking-widest shadow-sm">
        <span className="material-symbols-outlined text-[14px]">confirmation_number</span> Open
      </span>
    );
  }

  return null;
}

export function CategoryBadge({ category }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-low text-on-surface-variant font-bold rounded-md text-xs border border-outline-variant/50 shadow-sm capitalize">
      {category || 'Unassigned'}
    </span>
  );
}
