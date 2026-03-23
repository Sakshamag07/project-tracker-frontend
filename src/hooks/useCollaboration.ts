import { useState, useEffect, useCallback, useRef } from 'react';
import type { CollaborationUser } from '../types';
import { COLLABORATION_USERS } from '../seedData';

export function useCollaboration(taskIds: string[]) {
  const [activeUsers, setActiveUsers] = useState<CollaborationUser[]>([]);
  const taskIdsRef = useRef(taskIds);
  taskIdsRef.current = taskIds;
  const initializedRef = useRef(false);

  const getRandomTaskId = useCallback(() => {
    const ids = taskIdsRef.current;
    if (ids.length === 0) return '';
    return ids[(Math.random() * Math.min(ids.length, 50)) | 0];
  }, []);

  useEffect(() => {
    if (taskIds.length === 0 || initializedRef.current) return;
    initializedRef.current = true;

    // Defer collaboration simulation to after first paint
    const startTimeout = setTimeout(() => {
      const numUsers = 2 + ((Math.random() * 3) | 0);
      const initial: CollaborationUser[] = COLLABORATION_USERS
        .slice(0, numUsers)
        .map((user) => ({
          user,
          currentTaskId: getRandomTaskId(),
        }));
      setActiveUsers(initial);

      // Move users less frequently (5-10 seconds) to reduce re-renders
      const intervals: ReturnType<typeof setInterval>[] = [];
      initial.forEach((_, index) => {
        const interval = setInterval(() => {
          setActiveUsers((prev) => {
            const newUsers = [...prev];
            if (newUsers[index]) {
              newUsers[index] = {
                ...newUsers[index],
                currentTaskId: getRandomTaskId(),
              };
            }
            return newUsers;
          });
        }, 5000 + Math.random() * 5000); // 5-10 seconds instead of 3-8
        intervals.push(interval);
      });

      return () => {
        intervals.forEach(clearInterval);
      };
    }, 2000); // Defer 2 seconds after mount

    return () => {
      clearTimeout(startTimeout);
    };
  }, [taskIds.length, getRandomTaskId]);

  const getTaskCollaborators = useCallback(
    (taskId: string) => {
      return activeUsers.filter((u) => u.currentTaskId === taskId);
    },
    [activeUsers]
  );

  const viewerCount = activeUsers.length;

  return { activeUsers, getTaskCollaborators, viewerCount };
}
