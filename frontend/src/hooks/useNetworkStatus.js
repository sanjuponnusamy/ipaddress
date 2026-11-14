import { useState, useEffect, useCallback, useRef } from 'react';
import { healthService } from '../services/api';

export function useNetworkStatus(intervalMs = 8000) {
  const [status, setStatus] = useState({
    clientConnected: false,
    serverOnline: false,
    databaseConnected: false,
    databaseState: 'unknown',
    responseTime: null,
    uptime: 0,
    lastChecked: null,
    lastSuccessful: null,
    error: null,
    isChecking: false,
  });

  const timerRef = useRef(null);

  const checkHealth = useCallback(async () => {
    setStatus((prev) => ({ ...prev, isChecking: true }));
    try {
      const data = await healthService.getHealth();
      const now = new Date();

      setStatus({
        clientConnected: true,
        serverOnline: data.status === 'healthy' || data.server === 'online',
        databaseConnected: data.database?.connected || false,
        databaseState: data.database?.state || 'disconnected',
        responseTime: data.latency,
        uptime: data.uptime || 0,
        lastChecked: now,
        lastSuccessful: now,
        error: null,
        isChecking: false,
      });
    } catch (err) {
      setStatus((prev) => ({
        ...prev,
        clientConnected: false,
        serverOnline: false,
        databaseConnected: false,
        databaseState: 'unreachable',
        responseTime: null,
        lastChecked: new Date(),
        error: err.message || 'Cannot reach backend server',
        isChecking: false,
      }));
    }
  }, []);

  useEffect(() => {
    checkHealth();

    timerRef.current = setInterval(() => {
      checkHealth();
    }, intervalMs);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [checkHealth, intervalMs]);

  return { ...status, refresh: checkHealth };
}
