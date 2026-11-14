import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Trash2,
  Edit2,
  Activity,
  Check,
  AlertCircle,
  X,
  Server,
  Layers,
  MapPin,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Eye,
  Info,
  Calendar,
  Binary
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { validateIPv4, analyzeIPv4 } from '../utils/ipValidator';

export default function DeviceInventory({
  devices = [],
  onAddDevice,
  onUpdateDevice,
  onDeleteDevice,
  onPingDevice,
  isLoading = false,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('name'); // 'name' | 'ip' | 'type' | 'status'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'

  // Modal states
  const [editingDevice, setEditingDevice] = useState(null);
  const [deletingDevice, setDeletingDevice] = useState(null);
  const [viewingDevice, setViewingDevice] = useState(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    deviceName: '',
    ipv4Address: '',
    subnetMask: '',
    defaultGateway: '',
    macAddress: '',
    deviceType: 'Router',
    location: '',
    status: 'Online',
    description: '',
  });
  const [editError, setEditError] = useState('');

  // Handle opening edit modal
  const handleOpenEdit = (dev) => {
    setEditingDevice(dev);
    setEditForm({
      deviceName: dev.deviceName || '',
      ipv4Address: dev.ipv4Address || '',
      subnetMask: dev.subnetMask || '255.255.255.0',
      defaultGateway: dev.defaultGateway || '',
      macAddress: dev.macAddress || '',
      deviceType: dev.deviceType || 'Router',
      location: dev.location || '',
      status: dev.status || 'Online',
      description: dev.description || '',
    });
    setEditError('');
  };

  // Submit edit form
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editForm.deviceName.trim()) {
      setEditError('Device Name is required.');
      return;
    }

    const ipCheck = validateIPv4(editForm.ipv4Address);
    if (!ipCheck.isValid) {
      setEditError(`Invalid IPv4 Address: ${ipCheck.reason}`);
      return;
    }

    if (editForm.defaultGateway) {
      const gwCheck = validateIPv4(editForm.defaultGateway);
      if (!gwCheck.isValid) {
        setEditError(`Invalid Default Gateway IPv4: ${gwCheck.reason}`);
        return;
      }
    }

    onUpdateDevice(editingDevice._id || editingDevice.id, editForm);
    setEditingDevice(null);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (deletingDevice) {
      onDeleteDevice(deletingDevice._id || deletingDevice.id);
      setDeletingDevice(null);
    }
  };

  // Sort and filter logic
  const filteredAndSortedDevices = useMemo(() => {
    return devices
      .filter((dev) => {
        const matchesSearch =
          (dev.deviceName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (dev.ipv4Address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (dev.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (dev.macAddress || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === 'ALL' || (dev.status || '').toUpperCase() === statusFilter;

        const matchesType =
          typeFilter === 'ALL' || (dev.deviceType || '').toUpperCase() === typeFilter.toUpperCase();

        return matchesSearch && matchesStatus && matchesType;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === 'name') {
          comp = (a.deviceName || '').localeCompare(b.deviceName || '');
        } else if (sortBy === 'ip') {
          // IP octet comparison for numerical sorting
          const octetsA = (a.ipv4Address || '').split('.').map(Number);
          const octetsB = (b.ipv4Address || '').split('.').map(Number);
          for (let i = 0; i < 4; i++) {
            const diff = (octetsA[i] || 0) - (octetsB[i] || 0);
            if (diff !== 0) {
              comp = diff;
              break;
            }
          }
        } else if (sortBy === 'type') {
          comp = (a.deviceType || '').localeCompare(b.deviceType || '');
        } else if (sortBy === 'status') {
          comp = (a.status || '').localeCompare(b.status || '');
        }
        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [devices, searchTerm, statusFilter, typeFilter, sortBy, sortOrder]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Search Controls */}
      <div className="p-4 bg-navy-900 border border-navy-800 rounded-2xl shadow-lg flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by device name, IPv4, MAC or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-navy-950 border border-navy-750 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center space-x-1.5 bg-navy-950 border border-navy-750 rounded-xl px-3 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-navy-900">All Statuses</option>
              <option value="ONLINE" className="bg-navy-900">Online</option>
              <option value="OFFLINE" className="bg-navy-900">Offline</option>
              <option value="UNKNOWN" className="bg-navy-900">Unknown</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center space-x-1.5 bg-navy-950 border border-navy-750 rounded-xl px-3 py-1.5 text-xs">
            <Server className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-navy-900">All Device Types</option>
              <option value="Router" className="bg-navy-900">Router</option>
              <option value="Switch" className="bg-navy-900">Switch</option>
              <option value="Server" className="bg-navy-900">Server</option>
              <option value="Computer" className="bg-navy-900">Computer</option>
              <option value="Printer" className="bg-navy-900">Printer</option>
              <option value="Other" className="bg-navy-900">Other</option>
            </select>
          </div>

          {/* Add Device Button Shortcut */}
          <button
            onClick={onAddDevice}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-lg shadow-blue-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Device</span>
          </button>
        </div>
      </div>

      {/* Device Table */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-950/70 border-b border-navy-800 text-slate-400 font-semibold uppercase tracking-wider select-none">
              <tr>
                <th
                  onClick={() => toggleSort('name')}
                  className="px-5 py-3.5 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center space-x-1.5">
                    <span>Device Name</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('ip')}
                  className="px-5 py-3.5 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center space-x-1.5">
                    <span>IPv4 Address</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('type')}
                  className="px-5 py-3.5 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center space-x-1.5">
                    <span>Hardware Type</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="px-5 py-3.5">Subnet / Gateway</th>
                <th className="px-5 py-3.5">Location</th>
                <th
                  onClick={() => toggleSort('status')}
                  className="px-5 py-3.5 cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center space-x-1.5">
                    <span>Status</span>
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </div>
                </th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800 text-slate-300 font-normal">
              {filteredAndSortedDevices.length > 0 ? (
                filteredAndSortedDevices.map((dev) => (
                  <tr
                    key={dev._id || dev.id}
                    className="hover:bg-navy-850/60 transition-colors group"
                  >
                    <td className="px-5 py-3.5 font-medium text-white flex items-center space-x-2.5">
                      <div className="p-1.5 rounded-lg bg-navy-800 text-blue-400 group-hover:bg-blue-600/20 transition-colors">
                        <Server className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">{dev.deviceName}</div>
                        {dev.macAddress && (
                          <div className="text-[10px] text-slate-400 font-mono">{dev.macAddress}</div>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-3.5 font-mono text-cyan-300 font-medium">
                      <span className="px-2 py-0.5 bg-navy-950 rounded border border-navy-750">
                        {dev.ipv4Address}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 bg-navy-800 text-slate-300 rounded-lg text-[11px] font-medium border border-navy-700/60">
                        {dev.deviceType || 'Other'}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 font-mono text-[11px] text-slate-400">
                      <div>Mask: {dev.subnetMask || '255.255.255.0'}</div>
                      <div>GW: {dev.defaultGateway || 'None'}</div>
                    </td>

                    <td className="px-5 py-3.5 text-slate-400">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{dev.location || 'Server Rack'}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <StatusBadge status={dev.status} />
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setViewingDevice(dev)}
                          title="View Full Device Details"
                          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-navy-800 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onPingDevice(dev._id || dev.id)}
                          title="Ping / Probe Device"
                          className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-navy-800 rounded-lg transition-colors"
                        >
                          <Activity className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(dev)}
                          title="Edit Device Details"
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-navy-800 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingDevice(dev)}
                          title="Delete Device"
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-navy-800 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    <Server className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-300">No network devices found</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      {searchTerm || statusFilter !== 'ALL' || typeFilter !== 'ALL'
                        ? 'Try clearing the search or filter criteria.'
                        : 'Register your first router, switch or server node using the Add Device button.'}
                    </p>
                    <button
                      onClick={onAddDevice}
                      className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold inline-flex items-center space-x-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Register Device Now</span>
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Summary */}
        <div className="px-5 py-3 bg-navy-950/80 border-t border-navy-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing <strong className="text-white">{filteredAndSortedDevices.length}</strong> of{' '}
            <strong className="text-white">{devices.length}</strong> registered devices
          </span>
          <span className="font-mono text-[11px] text-slate-400">Sorted by {sortBy.toUpperCase()} ({sortOrder})</span>
        </div>
      </div>

      {/* Edit Device Modal */}
      {editingDevice && (
        <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-750 rounded-2xl max-w-lg w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-navy-800">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Edit2 className="w-4 h-4 text-blue-400" />
                <span>Edit Device: {editingDevice.deviceName}</span>
              </h3>
              <button
                onClick={() => setEditingDevice(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="mt-3 p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Device Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.deviceName}
                  onChange={(e) => setEditForm({ ...editForm, deviceName: e.target.value })}
                  className="w-full px-3 py-2 bg-navy-950 border border-navy-750 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">IPv4 Address *</label>
                  <input
                    type="text"
                    required
                    value={editForm.ipv4Address}
                    onChange={(e) => setEditForm({ ...editForm, ipv4Address: e.target.value })}
                    className="w-full px-3 py-2 bg-navy-950 border border-navy-750 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Subnet Mask *</label>
                  <input
                    type="text"
                    required
                    value={editForm.subnetMask}
                    onChange={(e) => setEditForm({ ...editForm, subnetMask: e.target.value })}
                    className="w-full px-3 py-2 bg-navy-950 border border-navy-750 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Default Gateway</label>
                  <input
                    type="text"
                    value={editForm.defaultGateway}
                    onChange={(e) => setEditForm({ ...editForm, defaultGateway: e.target.value })}
                    className="w-full px-3 py-2 bg-navy-950 border border-navy-750 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">MAC Address</label>
                  <input
                    type="text"
                    placeholder="AA:BB:CC:DD:EE:FF"
                    value={editForm.macAddress}
                    onChange={(e) => setEditForm({ ...editForm, macAddress: e.target.value })}
                    className="w-full px-3 py-2 bg-navy-950 border border-navy-750 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Hardware Type</label>
                  <select
                    value={editForm.deviceType}
                    onChange={(e) => setEditForm({ ...editForm, deviceType: e.target.value })}
                    className="w-full px-3 py-2 bg-navy-950 border border-navy-750 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Router">Router</option>
                    <option value="Switch">Switch</option>
                    <option value="Server">Server</option>
                    <option value="Computer">Computer</option>
                    <option value="Printer">Printer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-navy-950 border border-navy-750 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Location / Rack</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="w-full px-3 py-2 bg-navy-950 border border-navy-750 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-navy-950 border border-navy-750 rounded-xl text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-navy-800">
                <button
                  type="button"
                  onClick={() => setEditingDevice(null)}
                  className="px-4 py-2 bg-navy-850 hover:bg-navy-800 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingDevice && (
        <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-rose-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center space-x-3 text-rose-400 mb-4">
              <div className="p-2.5 bg-rose-500/20 border border-rose-500/30 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Confirm Device Removal</h3>
                <p className="text-xs text-slate-400">This action will be audited in MongoDB Activity Logs</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-4">
              Are you sure you want to delete{' '}
              <strong className="text-white">{deletingDevice.deviceName}</strong> (
              <span className="font-mono text-cyan-300">{deletingDevice.ipv4Address}</span>)?
            </p>

            <div className="p-3 bg-navy-950 border border-navy-800 rounded-xl text-[11px] text-slate-400 mb-5">
              <span>Database action: </span>
              <strong className="text-rose-400 font-mono">DELETE_DEVICE</strong>
              <p className="mt-1">The deleted record and its previous state will be recorded in the activity log.</p>
            </div>

            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => setDeletingDevice(null)}
                className="px-4 py-2 bg-navy-850 hover:bg-navy-800 text-slate-300 rounded-xl font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold text-xs shadow-lg shadow-rose-600/20"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Device Details Modal */}
      {viewingDevice && (() => {
        const ipInfo = analyzeIPv4(viewingDevice.ipv4Address || '');
        return (
          <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-navy-900 border border-navy-750 rounded-2xl max-w-xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-navy-800">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{viewingDevice.deviceName}</h3>
                    <p className="text-xs text-slate-400 font-mono">{viewingDevice.deviceType} • {viewingDevice.location || 'Server Rack'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingDevice(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status and IP Overview */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-navy-950 border border-navy-800 rounded-xl space-y-1">
                  <span className="text-slate-400 font-semibold block text-[11px]">IPv4 Address & CIDR</span>
                  <div className="text-cyan-300 font-mono font-bold text-sm">
                    {viewingDevice.ipv4Address} {ipInfo.isValid && <span className="text-xs text-slate-400">({ipInfo.cidr})</span>}
                  </div>
                  <div className="text-[10px] text-slate-400">Subnet: {viewingDevice.subnetMask || '255.255.255.0'}</div>
                </div>

                <div className="p-3 bg-navy-950 border border-navy-800 rounded-xl space-y-1">
                  <span className="text-slate-400 font-semibold block text-[11px]">Operational Status</span>
                  <StatusBadge status={viewingDevice.status} />
                  <div className="text-[10px] text-slate-400">
                    Gateway: <span className="font-mono text-slate-300">{viewingDevice.defaultGateway || 'None'}</span>
                  </div>
                </div>
              </div>

              {/* Computer Networks IPv4 Analysis */}
              {ipInfo.isValid && (
                <div className="p-3.5 bg-navy-950 border border-navy-800 rounded-xl space-y-2 text-xs">
                  <span className="text-cyan-400 font-bold block text-[11px] uppercase tracking-wider">
                    Computer Networks Addressing Analysis
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Class:</span>
                      <span className="text-white font-semibold">{ipInfo.classification}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Scope:</span>
                      <span className="text-emerald-400 font-semibold">{ipInfo.scope}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Hex Notation:</span>
                      <span className="font-mono text-amber-300">{ipInfo.hex}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">MAC Address:</span>
                      <span className="font-mono text-slate-300">{viewingDevice.macAddress || 'Not Assigned'}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-navy-850">
                    <span className="text-slate-400 text-[10px] block mb-1">32-Bit Binary Stream:</span>
                    <span className="font-mono text-[10px] text-cyan-300 bg-navy-900 px-2 py-1 rounded border border-navy-800 block break-all">
                      {ipInfo.binary}
                    </span>
                  </div>
                </div>
              )}

              {/* Description */}
              {viewingDevice.description && (
                <div className="p-3 bg-navy-950 border border-navy-800 rounded-xl text-xs space-y-1">
                  <span className="text-slate-400 font-semibold text-[11px] block">Description / Notes:</span>
                  <p className="text-slate-300">{viewingDevice.description}</p>
                </div>
              )}

              {/* Timestamps */}
              <div className="text-[11px] text-slate-500 font-mono space-y-1 pt-1 border-t border-navy-800 flex justify-between">
                <span>Created: {viewingDevice.createdAt ? new Date(viewingDevice.createdAt).toLocaleString() : 'N/A'}</span>
                <span>Updated: {viewingDevice.updatedAt ? new Date(viewingDevice.updatedAt).toLocaleString() : 'N/A'}</span>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setViewingDevice(null)}
                  className="px-4 py-2 bg-navy-850 hover:bg-navy-800 text-white rounded-xl font-semibold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
