// src/hooks/useTemples.js
import { useState, useEffect, useCallback } from 'react';
import { isAfter, addHours } from 'date-fns';
import {
  fetchTemples, insertTemple, incrementLikes,
  incrementReports, subscribeToTemples,
} from '../lib/supabaseClient';

/** Returns only non-expired, non-pending events */
function filterActive(events) {
  const now = new Date();
  return events.filter(e => {
    const expiry = addHours(new Date(e.created_at), e.expiry_hours);
    return isAfter(expiry, now);            // not expired
  });
}

export function useTemples() {
  const [allEvents,    setAllEvents]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [reportedIds,  setReportedIds]  = useState(() => {
    try { return new Set(JSON.parse(sessionStorage.getItem('reported') || '[]')); }
    catch { return new Set(); }
  });
  const [likedIds, setLikedIds] = useState(() => {
    try { return new Set(JSON.parse(sessionStorage.getItem('liked') || '[]')); }
    catch { return new Set(); }
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchTemples();
      setAllEvents(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + purge expired every minute
  useEffect(() => {
    load();
    const interval = setInterval(() => setAllEvents(prev => [...prev]), 60000);
    return () => clearInterval(interval);
  }, [load]);

  // Real-time subscription
  useEffect(() => {
    const channel = subscribeToTemples((payload) => {
      const { eventType, new: newRow, old: oldRow } = payload;
      setAllEvents(prev => {
        if (eventType === 'INSERT') return [newRow, ...prev];
        if (eventType === 'UPDATE') return prev.map(e => e.id === newRow.id ? newRow : e);
        if (eventType === 'DELETE') return prev.filter(e => e.id !== oldRow.id);
        return prev;
      });
    });
    return () => { channel.unsubscribe(); };
  }, []);

  const handleLike = useCallback(async (event) => {
    if (likedIds.has(event.id)) return;
    setAllEvents(prev => prev.map(e => e.id === event.id ? { ...e, likes: e.likes + 1 } : e));
    const next = new Set([...likedIds, event.id]);
    setLikedIds(next);
    sessionStorage.setItem('liked', JSON.stringify([...next]));
    try { await incrementLikes(event.id, event.likes); }
    catch { setAllEvents(prev => prev.map(e => e.id === event.id ? { ...e, likes: e.likes - 1 } : e)); }
  }, [likedIds]);

  const handleReport = useCallback(async (event) => {
    if (reportedIds.has(event.id)) return;
    const newReports = event.reports + 1;
    setAllEvents(prev => prev.map(e => e.id === event.id
      ? { ...e, reports: newReports, status: newReports >= 5 ? 'pending' : e.status }
      : e));
    const next = new Set([...reportedIds, event.id]);
    setReportedIds(next);
    sessionStorage.setItem('reported', JSON.stringify([...next]));
    try { await incrementReports(event.id, event.reports); }
    catch { setAllEvents(prev => prev.map(e => e.id === event.id ? { ...e, reports: e.reports - 1 } : e)); }
  }, [reportedIds]);

  const handleAdd = useCallback(async (payload) => {
    const row = await insertTemple(payload);
    setAllEvents(prev => [row, ...prev]);
    return row;
  }, []);

  const active  = filterActive(allEvents);
  const visible = active; // pending ones get blurred, not hidden

  return {
    events: visible, allEvents, loading, error,
    likedIds, reportedIds,
    handleLike, handleReport, handleAdd, reload: load,
  };
}
