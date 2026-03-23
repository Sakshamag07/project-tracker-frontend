import { useRef, useCallback, useState } from 'react';
import type { Status } from '../types';

interface DragState {
  isDragging: boolean;
  taskId: string | null;
  sourceStatus: Status | null;
}

export function useDragAndDrop(onDrop: (taskId: string, newStatus: Status) => void) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    taskId: null,
    sourceStatus: null,
  });
  const [hoveredColumn, setHoveredColumn] = useState<Status | null>(null);
  const dragCloneRef = useRef<HTMLDivElement | null>(null);
  const placeholderRef = useRef<HTMLDivElement | null>(null);
  const originalCardRef = useRef<HTMLElement | null>(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, taskId: string, status: Status) => {
      e.preventDefault();
      const target = e.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();

      offsetRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };

      // Create clone
      const clone = target.cloneNode(true) as HTMLDivElement;
      clone.style.position = 'fixed';
      clone.style.width = `${rect.width}px`;
      clone.style.height = `${rect.height}px`;
      clone.style.left = `${rect.left}px`;
      clone.style.top = `${rect.top}px`;
      clone.style.zIndex = '9999';
      clone.style.opacity = '0.85';
      clone.style.pointerEvents = 'none';
      clone.style.transition = 'none';
      clone.style.cursor = 'grabbing';
      clone.style.boxShadow = '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)';
      clone.style.borderRadius = '12px';
      clone.style.transform = 'rotate(2deg)';
      document.body.appendChild(clone);
      dragCloneRef.current = clone;

      // Create placeholder
      const placeholder = document.createElement('div');
      placeholder.style.width = `${rect.width}px`;
      placeholder.style.height = `${rect.height}px`;
      placeholder.style.border = '2px dashed #cbd5e1';
      placeholder.style.borderRadius = '12px';
      placeholder.style.backgroundColor = '#f1f5f9';
      placeholder.style.transition = 'all 0.2s ease';
      target.parentNode?.insertBefore(placeholder, target);
      placeholderRef.current = placeholder;

      // Hide original
      originalCardRef.current = target;
      target.style.display = 'none';

      setDragState({ isDragging: true, taskId, sourceStatus: status });

      // Capture pointer
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState.isDragging || !dragCloneRef.current) return;

      const x = e.clientX - offsetRef.current.x;
      const y = e.clientY - offsetRef.current.y;
      dragCloneRef.current.style.left = `${x}px`;
      dragCloneRef.current.style.top = `${y}px`;

      // Try to detect which column the user is hovering over
      // Temporarily hide the clone to detect elements behind it
      dragCloneRef.current.style.display = 'none';
      const elementBelow = document.elementFromPoint(e.clientX, e.clientY);
      dragCloneRef.current.style.display = '';

      if (elementBelow) {
        const column = elementBelow.closest('[data-column-status]') as HTMLElement | null;
        if (column) {
          const status = column.getAttribute('data-column-status') as Status;
          setHoveredColumn(status);
        } else {
          setHoveredColumn(null);
        }
      }
    },
    [dragState.isDragging]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState.isDragging || !dragState.taskId) return;

      // Detect drop target
      if (dragCloneRef.current) {
        dragCloneRef.current.style.display = 'none';
      }
      const elementBelow = document.elementFromPoint(e.clientX, e.clientY);
      if (dragCloneRef.current) {
        dragCloneRef.current.style.display = '';
      }

      let dropped = false;

      if (elementBelow) {
        const column = elementBelow.closest('[data-column-status]') as HTMLElement | null;
        if (column) {
          const newStatus = column.getAttribute('data-column-status') as Status;
          if (newStatus && newStatus !== dragState.sourceStatus) {
            onDrop(dragState.taskId, newStatus);
            dropped = true;
          }
        }
      }

      // Cleanup
      if (!dropped && dragCloneRef.current && originalCardRef.current) {
        // Snap back animation
        const originalRect = placeholderRef.current?.getBoundingClientRect();
        if (originalRect) {
          dragCloneRef.current.style.transition = 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
          dragCloneRef.current.style.left = `${originalRect.left}px`;
          dragCloneRef.current.style.top = `${originalRect.top}px`;
          dragCloneRef.current.style.opacity = '1';
          dragCloneRef.current.style.transform = 'rotate(0deg)';
          dragCloneRef.current.style.boxShadow = '0 1px 3px 0 rgb(0 0 0 / 0.06)';

          setTimeout(() => {
            dragCloneRef.current?.remove();
            dragCloneRef.current = null;
            if (originalCardRef.current) {
              originalCardRef.current.style.display = '';
            }
            placeholderRef.current?.remove();
            placeholderRef.current = null;
          }, 300);
        } else {
          dragCloneRef.current.remove();
          dragCloneRef.current = null;
          if (originalCardRef.current) {
            originalCardRef.current.style.display = '';
          }
          placeholderRef.current?.remove();
          placeholderRef.current = null;
        }
      } else {
        dragCloneRef.current?.remove();
        dragCloneRef.current = null;
        if (originalCardRef.current) {
          originalCardRef.current.style.display = '';
        }
        placeholderRef.current?.remove();
        placeholderRef.current = null;
      }

      setDragState({ isDragging: false, taskId: null, sourceStatus: null });
      setHoveredColumn(null);
    },
    [dragState, onDrop]
  );

  return {
    dragState,
    hoveredColumn,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
