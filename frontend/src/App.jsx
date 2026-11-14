import React, { useState, useEffect, useCallback } from 'react';
import { ToastProvider, useToast } from './context/ToastContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import DeviceInventory from './pages/DeviceInventory';
import AddDevice from './pages/AddDevice';
import IPv4Validator from './pages/IPv4Validator';
import NetworkMonitoring from './pages/NetworkMonitoring';
import ActivityLogs from './pages/ActivityLogs';
import Settings from './pages/Settings';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { deviceService, activityLogService, monitoringService } from './services/api';

// Initial preloaded devices for previewing dashboard charts & tables
const INITIAL_DEMO_DEVICES = [
  {
    _id: 'demo-dev-1',
    deviceName: 'Core-Gateway-Router',
    ipv4Address: '192.168.1.1',
    subnetMask: '255.255.255.0',
    defaultGateway: '192.168.1.254',
    macAddress: '00:1A:2B:3C:4D:01',
    deviceType: 'Router',
    location: 'Server Room Rack A1',
    status: 'Online',
    description: 'Primary Edge Gateway Router for campus subnet.',
    lastPing: new Date(Date.now() - 120000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'demo-dev-2',
    deviceName: 'Main-Dist-Switch-L3',
    ipv4Address: '192.168.1.2',
    subnetMask: '255.255.255.0',
    defaultGateway: '192.168.1.1',
    macAddress: '00:1A:2B:3C:4D:02',
    deviceType: 'Switch',
    location: 'Building B - Switch Rack 1',
    status: 'Online',
    description: 'Managed Cisco 24-port switch for computer labs.',
    lastPing: new Date(Date.now() - 180000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'demo-dev-3',
    deviceName: 'Application-Server-01',
    ipv4Address: '10.0.0.10',
    subnetMask: '255.0.0.0',
    defaultGateway: '10.0.0.1',
    macAddress: '00:50:56:C0:00:10',
    deviceType: 'Server',
    location: 'Cloud Data Center',
    status: 'Online',
    description: 'Production Node.js API and Web Application Server.',
    lastPing: new Date(Date.now() - 300000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'demo-dev-4',
    deviceName: 'Lab-Workstation-PC-08',
    ipv4Address: '192.168.1.108',
    subnetMask: '255.255.255.0',
    defaultGateway: '192.168.1.1',
    macAddress: '00:1B:44:11:3A:B7',
    deviceType: 'Computer',
    location: 'Networks Lab 3 - Desk 8',
    status: 'Offline',
    description: 'Student engineering workstation running simulation tools.',
    lastPing: new Date(Date.now() - 7200000).toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'demo-dev-5',
    deviceName: 'Network-Laser-Printer',
    ipv4Address: '192.168.1.200',
    subnetMask: '255.255.255.0',
    defaultGateway: '192.168.1.1',
    macAddress: '00:1E:68:55:7A:C3',
    deviceType: 'Printer',
    location: 'Faculty Staff Room',
    status: 'Online',
    description: 'Shared Department Network Laser Printer.',
    lastPing: new Date(Date.now() - 60000).toISOString(),
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_DEMO_LOGS = [
  {
    _id: 'log-1',
    actionType: 'CREATE',
    deviceName: 'Core-Gateway-Router',
    ipv4Address: '192.168.1.1',
    details: 'Initial device provisioned in devices collection',
    status: 'Saved successfully',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    _id: 'log-2',
    actionType: 'UPDATE',
    deviceName: 'Main-Dist-Switch-L3',
    ipv4Address: '192.168.1.2',
    details: 'Updated status to Online following ping check',
    status: 'Updated successfully',
    previousData: { status: 'Offline' },
    updatedData: { status: 'Online' },
    timestamp: new Date(Date.now() - 1800000).toISOString(),
  },
];

function AppContent() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [pollingInterval, setPollingInterval] = useState(8000);

  // Network Heartbeat hook
  const networkStatus = useNetworkStatus(pollingInterval);

  // Data states
  const [devices, setDevices] = useState(INITIAL_DEMO_DEVICES);
  const [activityLogs, setActivityLogs] = useState(INITIAL_DEMO_LOGS);
  const [monitoringLogs, setMonitoringLogs] = useState([
    {
      _id: 'mon-1',
      ipv4Address: '192.168.1.1',
      status: 'Online',
      responseTime: 2,
      timestamp: new Date(Date.now() - 120000).toISOString(),
    },
    {
      _id: 'mon-2',
      ipv4Address: '10.0.0.10',
      status: 'Online',
      responseTime: 18,
      timestamp: new Date(Date.now() - 300000).toISOString(),
    },
    {
      _id: 'mon-3',
      ipv4Address: '192.168.1.108',
      status: 'Offline',
      responseTime: null,
      timestamp: new Date(Date.now() - 7200000).toISOString(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPinging, setIsPinging] = useState(false);

  // Theme toggle
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Fetch data from backend API
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch devices from backend if server is online
      const devRes = await deviceService.getAll();
      if (devRes.data && Array.isArray(devRes.data) && devRes.data.length > 0) {
        setDevices(devRes.data);
      }
    } catch (err) {
      // Backend not yet seeded or offline, keep local state
    }

    try {
      // Fetch activity logs
      const logRes = await activityLogService.getLogs();
      if (logRes.data && Array.isArray(logRes.data) && logRes.data.length > 0) {
        setActivityLogs(logRes.data);
      }
    } catch (err) {
      // Fallback to local logs
    }

    try {
      // Fetch monitoring logs
      const monRes = await monitoringService.getLogs();
      if (monRes.data && Array.isArray(monRes.data) && monRes.data.length > 0) {
        setMonitoringLogs(monRes.data);
      }
    } catch (err) {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handler: Add Device
  const handleAddDevice = async (formData) => {
    try {
      let createdDevice;
      try {
        const res = await deviceService.create(formData);
        createdDevice = res.data;
        showToast(`Device "${formData.deviceName}" saved to MongoDB!`, 'success');
        await fetchData();
        setActiveTab('inventory');
        return;
      } catch (apiErr) {
        if (apiErr.response && apiErr.response.data && apiErr.response.data.error) {
          showToast(apiErr.response.data.error, 'error');
          throw new Error(apiErr.response.data.error);
        }
        // If server is not running, fallback to local state
        createdDevice = {
          ...formData,
          _id: 'dev-' + Date.now(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      setDevices((prev) => [createdDevice, ...prev]);

      // Record Activity Log
      const newLog = {
        _id: 'log-' + Date.now(),
        actionType: 'CREATE',
        deviceName: formData.deviceName,
        ipv4Address: formData.ipv4Address,
        details: `Created device ${formData.deviceName} with IPv4 ${formData.ipv4Address}`,
        status: 'Saved successfully',
        updatedData: formData,
        timestamp: new Date().toISOString(),
      };
      setActivityLogs((prev) => [newLog, ...prev]);

      showToast(`Device "${formData.deviceName}" registered locally!`, 'success');
      setActiveTab('inventory');
    } catch (err) {
      if (!err.message?.includes('already assigned') && !err.message?.includes('Invalid')) {
        showToast(err.message || 'Failed to add device', 'error');
      }
      throw err;
    }
  };

  // Handler: Update Device
  const handleUpdateDevice = async (id, updatedFields) => {
    try {
      const oldDevice = devices.find((d) => (d._id || d.id) === id);

      try {
        await deviceService.update(id, updatedFields);
        showToast(`Device updated in database successfully!`, 'success');
        await fetchData();
        return;
      } catch (apiErr) {
        if (apiErr.response && apiErr.response.data && apiErr.response.data.error) {
          showToast(apiErr.response.data.error, 'error');
          return;
        }
      }

      setDevices((prev) =>
        prev.map((d) => ((d._id || d.id) === id ? { ...d, ...updatedFields, updatedAt: new Date().toISOString() } : d))
      );

      // Record Activity Log
      const updateLog = {
        _id: 'log-' + Date.now(),
        actionType: 'UPDATE',
        deviceName: updatedFields.deviceName || oldDevice?.deviceName,
        ipv4Address: updatedFields.ipv4Address || oldDevice?.ipv4Address,
        details: `Updated parameters for ${updatedFields.deviceName}`,
        status: 'Updated successfully',
        previousData: oldDevice,
        updatedData: updatedFields,
        timestamp: new Date().toISOString(),
      };
      setActivityLogs((prev) => [updateLog, ...prev]);

      showToast(`Device updated locally!`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update device', 'error');
    }
  };

  // Handler: Delete Device
  const handleDeleteDevice = async (id) => {
    try {
      const deletedDev = devices.find((d) => (d._id || d.id) === id);

      try {
        await deviceService.delete(id);
        showToast(`Device removed from database.`, 'warning');
        await fetchData();
        return;
      } catch (apiErr) {
        if (apiErr.response && apiErr.response.data && apiErr.response.data.error) {
          showToast(apiErr.response.data.error, 'error');
          return;
        }
      }

      setDevices((prev) => prev.filter((d) => (d._id || d.id) !== id));

      // Record Activity Log
      const deleteLog = {
        _id: 'log-' + Date.now(),
        actionType: 'DELETE',
        deviceName: deletedDev?.deviceName,
        ipv4Address: deletedDev?.ipv4Address,
        details: `Deleted node ${deletedDev?.deviceName} from inventory`,
        status: 'Deleted successfully',
        previousData: deletedDev,
        timestamp: new Date().toISOString(),
      };
      setActivityLogs((prev) => [deleteLog, ...prev]);

      showToast(`Device "${deletedDev?.deviceName}" removed.`, 'warning');
    } catch (err) {
      showToast(err.message || 'Failed to delete device', 'error');
    }
  };

  // Handler: Ping Single Device
  const handlePingDevice = async (id) => {
    const target = devices.find((d) => (d._id || d.id) === id);
    if (!target) return;

    showToast(`Pinging ${target.deviceName} (${target.ipv4Address})...`, 'info', 2000);

    // Simulate probe or call backend probe
    setTimeout(() => {
      // Simulate response latency between 2ms and 45ms
      const isReachable = target.status !== 'Offline';
      const latency = isReachable ? Math.floor(Math.random() * 35) + 3 : null;

      const newMonLog = {
        _id: 'mon-' + Date.now(),
        ipv4Address: target.ipv4Address,
        status: isReachable ? 'Online' : 'Offline',
        responseTime: latency,
        timestamp: new Date().toISOString(),
      };

      setMonitoringLogs((prev) => [newMonLog, ...prev]);

      // Update device last ping
      setDevices((prev) =>
        prev.map((d) =>
          (d._id || d.id) === id
            ? { ...d, lastPing: new Date().toISOString(), status: isReachable ? 'Online' : 'Offline' }
            : d
        )
      );

      if (isReachable) {
        showToast(`${target.deviceName} is Online (${latency}ms)`, 'success');
      } else {
        showToast(`${target.deviceName} request timed out (Unreachable)`, 'error');
      }
    }, 800);
  };

  // Handler: Ping All Devices
  const handlePingAll = async () => {
    setIsPinging(true);
    showToast('Probing all configured subnet devices...', 'info', 2500);

    setTimeout(() => {
      const now = new Date().toISOString();
      const newLogs = devices.map((d) => {
        const isReachable = d.status !== 'Offline';
        const latency = isReachable ? Math.floor(Math.random() * 40) + 2 : null;
        return {
          _id: 'mon-' + Math.random().toString(36).substring(2, 9),
          ipv4Address: d.ipv4Address,
          status: isReachable ? 'Online' : 'Offline',
          responseTime: latency,
          timestamp: now,
        };
      });

      setMonitoringLogs((prev) => [...newLogs, ...prev]);
      setDevices((prev) =>
        prev.map((d) => ({
          ...d,
          lastPing: now,
        }))
      );

      setIsPinging(false);
      showToast('Completed network ping sweep across all devices.', 'success');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        networkStatus={networkStatus}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          networkStatus={networkStatus}
          onRefresh={() => {
            networkStatus.refresh();
            fetchData();
            showToast('Refreshed network status and telemetry.', 'info', 2000);
          }}
          theme={theme}
          toggleTheme={toggleTheme}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              devices={devices}
              activityLogs={activityLogs}
              networkStatus={networkStatus}
              onNavigate={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'inventory' && (
            <DeviceInventory
              devices={devices}
              onAddDevice={() => setActiveTab('add-device')}
              onUpdateDevice={handleUpdateDevice}
              onDeleteDevice={handleDeleteDevice}
              onPingDevice={handlePingDevice}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'add-device' && (
            <AddDevice
              existingDevices={devices}
              onDeviceCreated={handleAddDevice}
              onCancel={() => setActiveTab('inventory')}
            />
          )}

          {activeTab === 'ipv4-validator' && <IPv4Validator />}

          {activeTab === 'monitoring' && (
            <NetworkMonitoring
              devices={devices}
              monitoringLogs={monitoringLogs}
              onPingDevice={handlePingDevice}
              onPingAll={handlePingAll}
              isPinging={isPinging}
            />
          )}

          {activeTab === 'activity-logs' && (
            <ActivityLogs
              activityLogs={activityLogs}
              onRefresh={fetchData}
              isLoading={isLoading}
            />
          )}

          {activeTab === 'settings' && (
            <Settings
              networkStatus={networkStatus}
              pollingInterval={pollingInterval}
              setPollingInterval={setPollingInterval}
              theme={theme}
              toggleTheme={toggleTheme}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-navy-800/80 bg-navy-900/40 px-6 py-4 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>Network Device Inventory Management System</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px] font-mono text-slate-400">
            <span>React 18 + Vite</span>
            <span>Tailwind CSS</span>
            <span>Recharts</span>
            <span>Express + MongoDB Atlas</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
