import { useState, useRef, useCallback, useMemo, useEffect } from 'react';

interface VirtualScrollConfig {
  itemCount: number;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

interface VirtualScrollResult {
  visibleItems: { index: number; offsetTop: number }[];
  totalHeight: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  handleScroll: () => void;
  scrollTop: number;
}

export function useVirtualScroll({
  itemCount,
  itemHeight,
  containerHeight,
  overscan = 5,
}: VirtualScrollConfig): VirtualScrollResult {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const totalHeight = itemCount * itemHeight;

  const visibleItems = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const endIndex = Math.min(itemCount - 1, startIndex + visibleCount + 2 * overscan);

    const items: { index: number; offsetTop: number }[] = [];
    for (let i = startIndex; i <= endIndex; i++) {
      items.push({ index: i, offsetTop: i * itemHeight });
    }
    return items;
  }, [scrollTop, itemHeight, containerHeight, itemCount, overscan]);

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  // Reset scroll on item count change
  useEffect(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, [itemCount]);

  return { visibleItems, totalHeight, containerRef, handleScroll, scrollTop };
}
