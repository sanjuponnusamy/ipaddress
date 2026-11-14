import React, { useState } from 'react';
import {
  PlusCircle,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Server,
  Network,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { validateIPv4, analyzeIPv4 } from '../utils/ipValidator';

export default function AddDevice({ onDeviceCreated, onCancel, existingDevices = [] }) {
  const [formData, setFormData] = useState({
    deviceName: '',
    ipv4Address: '',
    subnetMask: '255.255.255.0',
    defaultGateway: '',
    macAddress: '',
    deviceType: 'Router',
    location: '',
    status: 'Online',
    description: '',
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live IP analysis
  const ipAnalysis = formData.ipv4Address ? analyzeIPv4(formData.ipv4Address) : null;
  const gwAnalysis = formData.defaultGateway ? validateIPv4(formData.defaultGateway) : null;

  // Preset generators for quick testing
  const applyPreset = (type) => {
    if (type === 'router') {
      setFormData({
        deviceName: 'Core-Edge-Router-01',
        ipv4Address: '192.168.1.1',
        subnetMask: '255.255.255.0',
        defaultGateway: '192.168.1.254',
        macAddress: '00:1A:2B:3C:4D:5E',
        deviceType: 'Router',
        location: 'Server Room Rack A1',
        status: 'Online',
        description: 'Main Gateway Router connecting local LAN to ISP WAN uplink.',
      });
    } else if (type === 'switch') {
      setFormData({
        deviceName: 'Distribution-Switch-L3',
        ipv4Address: '192.168.1.2',
        subnetMask: '255.255.255.0',
        defaultGateway: '192.168.1.1',
        macAddress: '00:2A:3B:4C:5D:6E',
        deviceType: 'Switch',
        location: 'Wiring Closet 2B',
        status: 'Online',
        description: 'Cisco 24-Port Gigabit Managed Layer-3 Switch.',
      });
    } else if (type === 'server') {
      setFormData({
        deviceName: 'Database-Host-Atlas',
        ipv4Address: '10.0.0.15',
        subnetMask: '255.0.0.0',
        defaultGateway: '10.0.0.1',
        macAddress: '00:50:56:C0:00:08',
        deviceType: 'Server',
        location: 'Data Center Node 4',
        status: 'Online',
        description: 'Primary MongoDB database and REST API application server.',
      });
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.deviceName.trim()) {
      setError('Device Name is required.');
      return;
    }

    // IPv4 validation
    const ipCheck = validateIPv4(formData.ipv4Address);
    if (!ipCheck.isValid) {
      setError(`Invalid IPv4 Address: ${ipCheck.reason}`);
      return;
    }

    // Check for duplicate IPv4 address in existing inventory
    const isDuplicate = existingDevices.some(
      (d) => (d.ipv4Address || '').trim() === formData.ipv4Address.trim()
    );
    if (isDuplicate) {
      setError(`Duplicate IPv4 Address! An active network node is already assigned to ${formData.ipv4Address}.`);
      return;
    }

    // Subnet mask validation
    const maskCheck = validateIPv4(formData.subnetMask);
    if (!maskCheck.isValid) {
      setError(`Invalid Subnet Mask: ${maskCheck.reason}`);
      return;
    }

    // Default Gateway validation
    if (formData.defaultGateway) {
      const gwCheck = validateIPv4(formData.defaultGateway);
      if (!gwCheck.isValid) {
        setError(`Invalid Default Gateway IPv4: ${gwCheck.reason}`);
        return;
      }
    }

    // MAC Address optional format check
    if (formData.macAddress) {
      const macPattern = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
      if (!macPattern.test(formData.macAddress.trim())) {
        setError('Invalid MAC Address format. Example: 00:1A:2B:3C:4D:5E or 00-1A-2B-3C-4D-5E.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onDeviceCreated(formData);
    } catch (err) {
      setError(err.message || 'Failed to register device.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner with Quick Presets */}
      <div className="p-5 bg-navy-900 border border-navy-800 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <PlusCircle className="w-5 h-5 text-blue-400" />
            <span>Add Network Node to Inventory</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Enforces strict IPv4 32-bit validation and persists audit trail to MongoDB Atlas.
          </p>
        </div>

        {/* Quick Demo Fill Buttons */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 text-[11px] font-semibold">Demo Presets:</span>
          <button
            type="button"
            onClick={() => applyPreset('router')}
            className="px-2.5 py-1 bg-navy-850 hover:bg-navy-800 text-blue-300 border border-navy-750 rounded-lg transition-colors"
          >
            Router
          </button>
          <button
            type="button"
            onClick={() => applyPreset('switch')}
            className="px-2.5 py-1 bg-navy-850 hover:bg-navy-800 text-cyan-300 border border-navy-750 rounded-lg transition-colors"
          >
            Switch
          </button>
          <button
            type="button"
            onClick={() => applyPreset('server')}
            className="px-2.5 py-1 bg-navy-850 hover:bg-navy-800 text-emerald-300 border border-navy-750 rounded-lg transition-colors"
          >
            Server
          </button>
        </div>
      </div>

      {/* Main Registration Form & Live Validator Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Inputs (2 Cols) */}
        <div className="lg:col-span-2 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
          {error && (
            <div className="mb-4 p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Device Name */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Device Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Edge-Router-East, Core-Switch-01"
                value={formData.deviceName}
                onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-navy-950 border border-navy-750 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* IPv4 Address & Subnet Mask */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  IPv4 Address <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="192.168.1.1"
                    value={formData.ipv4Address}
                    onChange={(e) => setFormData({ ...formData, ipv4Address: e.target.value })}
                    className={`w-full px-3.5 py-2.5 bg-navy-950 border rounded-xl text-white font-mono placeholder-slate-500 focus:outline-none ${
                      ipAnalysis
                        ? ipAnalysis.isValid
                          ? 'border-emerald-500/60 focus:border-emerald-500'
                          : 'border-rose-500/60 focus:border-rose-500'
                        : 'border-navy-750 focus:border-blue-500'
                    }`}
                  />
                  {ipAnalysis && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {ipAnalysis.isValid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Subnet Mask <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="255.255.255.0"
                  value={formData.subnetMask}
                  onChange={(e) => setFormData({ ...formData, subnetMask: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-navy-950 border border-navy-750 rounded-xl text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Default Gateway & MAC Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Default Gateway</label>
                <input
                  type="text"
                  placeholder="192.168.1.254"
                  value={formData.defaultGateway}
                  onChange={(e) => setFormData({ ...formData, defaultGateway: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-navy-950 border border-navy-750 rounded-xl text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  MAC Address <span className="text-slate-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="AA:BB:CC:DD:EE:FF"
                  value={formData.macAddress}
                  onChange={(e) => setFormData({ ...formData, macAddress: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-navy-950 border border-navy-750 rounded-xl text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Hardware Type & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Hardware Type</label>
                <select
                  value={formData.deviceType}
                  onChange={(e) => setFormData({ ...formData, deviceType: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-navy-950 border border-navy-750 rounded-xl text-white focus:outline-none focus:border-blue-500 cursor-pointer"
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
                <label className="block text-slate-300 font-semibold mb-1">Initial Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-navy-950 border border-navy-750 rounded-xl text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="Online">Online</option>
                  <option value="Offline">Offline</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Physical Location / Rack</label>
              <input
                type="text"
                placeholder="e.g. IT Lab B - Rack 3 - Shelf 2"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-navy-950 border border-navy-750 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Device Description</label>
              <textarea
                rows={2}
                placeholder="Operational purpose, VLAN assignment, or maintenance notes..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-navy-950 border border-navy-750 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-navy-800">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 bg-navy-850 hover:bg-navy-800 text-slate-300 rounded-xl font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/25 flex items-center space-x-2 disabled:opacity-50 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving to Database...' : 'Register Device'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Live IPv4 Inspector Sidebar Card (1 Col) */}
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-navy-800">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-bold text-white">Live IPv4 Inspector</h4>
          </div>

          {formData.ipv4Address ? (
            ipAnalysis?.isValid ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-emerald-400">Valid IPv4 Address</span>
                    <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-mono">
                      {ipAnalysis.classification}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-mono">{ipAnalysis.ip}</p>
                </div>

                <div className="p-3 bg-navy-950 border border-navy-800 rounded-xl space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Network Scope:</span>
                    <span className="font-semibold text-white">{ipAnalysis.scope}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Default Mask:</span>
                    <span className="font-mono text-cyan-300">{ipAnalysis.defaultMask} ({ipAnalysis.cidr})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Hex Notation:</span>
                    <span className="font-mono text-slate-300">{ipAnalysis.hex}</span>
                  </div>
                </div>

                <div className="p-3 bg-navy-950 border border-navy-800 rounded-xl space-y-1">
                  <span className="text-slate-400 block font-semibold text-[11px]">32-Bit Binary Representation:</span>
                  <div className="font-mono text-[10px] text-cyan-400 break-all bg-navy-900 p-2 rounded border border-navy-850">
                    {ipAnalysis.binary}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-rose-500/10 border border-rose-500/25 rounded-xl space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-rose-400 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Invalid Address Format</span>
                </div>
                <p className="text-rose-300 text-[11px]">{ipAnalysis.reason}</p>
              </div>
            )
          ) : (
            <div className="text-center py-8 text-slate-500 space-y-2 text-xs">
              <Network className="w-8 h-8 mx-auto text-slate-700" />
              <p>Type an IPv4 address to preview real-time octet breakdown and class assignment.</p>
            </div>
          )}

          <div className="p-3 bg-navy-950/70 border border-navy-800 rounded-xl text-[11px] text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300 block">Computer Networks Rule:</span>
            <p>Every IPv4 address contains 4 octets (8 bits each, range 0–255) yielding a total of 4,294,967,296 addresses.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
