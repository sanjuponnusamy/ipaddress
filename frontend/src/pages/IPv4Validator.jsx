import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  HelpCircle,
  Hash,
  Binary,
  Layers,
  ArrowRight,
  Sparkles,
  Server,
  Zap,
  Globe
} from 'lucide-react';
import { analyzeIPv4 } from '../utils/ipValidator';
import { ipService } from '../services/api';

export default function IPv4Validator() {
  const [ipInput, setIpInput] = useState('192.168.1.1');
  const [copied, setCopied] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [apiLatency, setApiLatency] = useState(null);
  const [isVerifyingApi, setIsVerifyingApi] = useState(false);

  // Client-side analysis
  const analysis = analyzeIPv4(ipInput);

  const sampleCases = [
    { label: 'Valid Private (Class C)', ip: '192.168.1.1', type: 'valid' },
    { label: 'Valid Private (Class A)', ip: '10.0.0.1', type: 'valid' },
    { label: 'Valid Private (Class B)', ip: '172.16.0.10', type: 'valid' },
    { label: 'Loopback Diagnostic', ip: '127.0.0.1', type: 'special' },
    { label: 'Public DNS (Google)', ip: '8.8.8.8', type: 'valid' },
    { label: 'APIPA Auto-IP', ip: '169.254.1.5', type: 'special' },
    { label: 'Multicast Group (Class D)', ip: '224.0.0.1', type: 'special' },
    { label: 'Invalid: Octet > 255', ip: '256.168.1.1', type: 'invalid' },
    { label: 'Invalid: 3 Octets Only', ip: '192.168.1', type: 'invalid' },
    { label: 'Invalid: 999 Octet', ip: '192.168.1.999', type: 'invalid' },
    { label: 'Invalid: Alphabetic', ip: 'abc.def.ghi.jkl', type: 'invalid' },
    { label: 'Invalid: Special Chars', ip: '192.168.@.1', type: 'invalid' },
  ];

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Trigger backend API validation
  const verifyWithBackend = async () => {
    setIsVerifyingApi(true);
    const start = performance.now();
    try {
      const res = await ipService.validate(ipInput);
      const end = performance.now();
      setApiResponse(res.data?.data || res.data);
      setApiLatency(Math.round(end - start));
    } catch (err) {
      setApiResponse({
        error: err.response?.data?.error || err.message,
        isError: true,
      });
      setApiLatency(null);
    } finally {
      setIsVerifyingApi(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="p-6 bg-navy-900 border border-navy-800 rounded-2xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-blue-600/20 border border-blue-500/40 rounded-xl text-blue-400">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">IPv4 Address Validation & Architecture Engine</h3>
                <span className="text-[10px] px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full font-mono">
                  RFC 791 / RFC 1918
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Validate IPv4 format, inspect 32-bit octets, detect network class (A–E), address ranges, and verify public vs private scopes.
              </p>
            </div>
          </div>

          <button
            onClick={verifyWithBackend}
            disabled={isVerifyingApi}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 shrink-0"
          >
            <Server className={`w-4 h-4 ${isVerifyingApi ? 'animate-spin' : ''}`} />
            <span>{isVerifyingApi ? 'Querying Backend...' : 'Verify with Backend API'}</span>
          </button>
        </div>

        {/* Input Bar */}
        <div className="mt-6">
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Enter an IPv4 Address to Validate and Analyze:
          </label>
          <div className="relative">
            <input
              type="text"
              value={ipInput}
              onChange={(e) => {
                setIpInput(e.target.value);
                setApiResponse(null);
              }}
              placeholder="e.g. 192.168.1.1, 10.0.0.1, or 256.1.1.1"
              className={`w-full px-4 py-3.5 bg-navy-950 border text-base font-mono rounded-xl text-white placeholder-slate-600 focus:outline-none transition-colors ${
                analysis.isValid
                  ? 'border-emerald-500/60 focus:border-emerald-500 text-emerald-300'
                  : 'border-rose-500/60 focus:border-rose-500 text-rose-300'
              }`}
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center space-x-2">
              <span
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold flex items-center space-x-1.5 border ${
                  analysis.isValid
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                }`}
              >
                {analysis.isValid ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>VALID IPv4</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>INVALID IPv4</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Sample Buttons */}
        <div className="mt-4 pt-4 border-t border-navy-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Test Cases (Click to Test):
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleCases.map((sc, i) => {
              let btnClass = 'bg-navy-950 text-slate-300 border-navy-750 hover:border-slate-500';
              if (sc.type === 'valid') btnClass = 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/40';
              if (sc.type === 'invalid') btnClass = 'bg-rose-950/40 text-rose-300 border-rose-800/60 hover:bg-rose-900/40';
              if (sc.type === 'special') btnClass = 'bg-cyan-950/40 text-cyan-300 border-cyan-800/60 hover:bg-cyan-900/40';

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setIpInput(sc.ip);
                    setApiResponse(null);
                  }}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border font-mono transition-colors flex items-center space-x-1.5 ${btnClass}`}
                >
                  <span>{sc.ip}</span>
                  <span className="text-[10px] opacity-75">({sc.label})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Backend API Verification Result Banner */}
      {apiResponse && (
        <div className="p-4 bg-navy-900 border border-blue-500/40 rounded-2xl shadow-xl flex items-start justify-between gap-3 text-xs">
          <div className="flex items-start space-x-2.5">
            <Server className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white">Backend REST API Validation Result:</span>
                <span className="text-[10px] px-2 py-0.5 bg-blue-600/20 text-cyan-300 rounded font-mono">
                  POST /api/validate-ip ({apiLatency}ms)
                </span>
              </div>
              <p className="text-slate-300 mt-1 font-mono text-[11px]">
                {apiResponse.reason || apiResponse.error}
              </p>
            </div>
          </div>
          <span
            className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] border shrink-0 ${
              apiResponse.isValid
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
            }`}
          >
            {apiResponse.isValid ? 'API: VALID' : 'API: INVALID'}
          </span>
        </div>
      )}

      {/* Analysis Result Display */}
      {analysis.isValid ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Card: Classification, Address Range & Scope */}
          <div className="p-6 bg-navy-900 border border-navy-800 rounded-2xl shadow-xl space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center space-x-2 pb-2 border-b border-navy-800">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Classification, Address Range & Scope</span>
            </h4>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-navy-950 rounded-xl border border-navy-750 flex items-center justify-between">
                <span className="text-slate-400">Address Classification:</span>
                <span className="font-bold text-white px-2.5 py-0.5 bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-lg">
                  {analysis.classification}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 pl-1">{analysis.classDescription}</p>

              {/* Explicit Address Range */}
              <div className="p-3.5 bg-navy-950 rounded-xl border border-navy-750 flex items-center justify-between">
                <span className="text-slate-400">Entire Class Address Range:</span>
                <span className="font-mono text-cyan-300 font-bold px-2 py-0.5 bg-navy-900 rounded border border-navy-800">
                  {analysis.addressRange}
                </span>
              </div>

              <div className="p-3.5 bg-navy-950 rounded-xl border border-navy-750 flex items-center justify-between">
                <span className="text-slate-400">Network Scope (RFC 1918):</span>
                <span className="font-bold text-white px-2.5 py-0.5 bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 rounded-lg">
                  {analysis.scope}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 pl-1">{analysis.scopeDescription}</p>

              <div className="p-3.5 bg-navy-950 rounded-xl border border-navy-750 flex items-center justify-between">
                <span className="text-slate-400">Default Subnet Mask:</span>
                <span className="font-mono text-cyan-300 font-bold">
                  {analysis.defaultMask} ({analysis.cidr})
                </span>
              </div>

              <div className="p-3.5 bg-navy-950 rounded-xl border border-navy-750 flex items-center justify-between">
                <span className="text-slate-400">Hexadecimal Representation:</span>
                <span className="font-mono text-amber-300 font-bold">{analysis.hex}</span>
              </div>
            </div>
          </div>

          {/* Right Card: 32-bit Binary Breakdown */}
          <div className="p-6 bg-navy-900 border border-navy-800 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-navy-800">
              <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                <Binary className="w-4 h-4 text-cyan-400" />
                <span>32-Bit Binary Octet Decomposition</span>
              </h4>
              <button
                onClick={() => handleCopy(analysis.binary)}
                className="text-xs text-slate-400 hover:text-white flex items-center space-x-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="p-4 bg-navy-950 border border-navy-750 rounded-xl space-y-2">
              <span className="text-[11px] text-slate-400 block font-semibold">Continuous Binary Stream (4 x 8 bits):</span>
              <div className="font-mono text-xs text-cyan-400 break-all bg-navy-900 p-2.5 rounded-lg border border-navy-800">
                {analysis.binary}
              </div>
            </div>

            {/* Octet Details List */}
            <div className="space-y-2 text-xs">
              <span className="text-[11px] font-semibold text-slate-400 block">Individual Octets (0–255 range verified):</span>
              {analysis.details.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-navy-950/80 rounded-xl border border-navy-800 flex items-center justify-between font-mono"
                >
                  <span className="text-slate-400 text-[11px]">{item.label}</span>
                  <span className="text-white text-xs font-semibold">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300">
              <div className="flex items-center space-x-2 font-bold mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Validation Result Explanation</span>
              </div>
              <p className="text-[11px] text-slate-300">{analysis.reason}</p>
            </div>
          </div>
        </div>
      ) : (
        /* Error Card */
        <div className="p-6 bg-navy-900 border border-rose-500/30 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center space-x-3 text-rose-400">
            <div className="p-2.5 bg-rose-500/20 border border-rose-500/30 rounded-xl">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Validation Error Detected</h4>
              <p className="text-xs text-rose-300">{analysis.reason}</p>
            </div>
          </div>

          <div className="p-4 bg-navy-950 border border-navy-800 rounded-xl text-xs space-y-2">
            <span className="font-semibold text-slate-300 block">Computer Networks IPv4 Rules:</span>
            <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
              <li><strong>Four Octets Required:</strong> IPv4 addresses must contain exactly 4 numeric octets separated by periods (e.g. <code>192.168.1</code> is rejected as incomplete).</li>
              <li><strong>Range Boundary [0 – 255]:</strong> Each octet is 8 bits (\(2^8 = 256\) values: 0 through 255). Values like <code>256</code> or <code>999</code> are strictly invalid.</li>
              <li><strong>No Alphabetic/Special Characters:</strong> Addresses like <code>abc.def.ghi.jkl</code> or <code>192.168.@.1</code> violate the standard.</li>
            </ul>
          </div>
        </div>
      )}

      {/* CN Educational Reference Guide */}
      <div className="p-6 bg-navy-900 border border-navy-800 rounded-2xl shadow-xl space-y-3">
        <h4 className="text-sm font-bold text-white flex items-center space-x-2">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span>Computer Networks IPv4 Addressing Reference Guide</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-navy-950 rounded-xl border border-navy-800">
            <span className="font-semibold text-blue-300 block">Class A (1.0.0.0 – 126.255.255.255)</span>
            <p className="text-[11px] text-slate-400 mt-1">Default mask 255.0.0.0 (/8). Private block: 10.0.0.0/8.</p>
          </div>
          <div className="p-3 bg-navy-950 rounded-xl border border-navy-800">
            <span className="font-semibold text-blue-300 block">Class B (128.0.0.0 – 191.255.255.255)</span>
            <p className="text-[11px] text-slate-400 mt-1">Default mask 255.255.0.0 (/16). Private block: 172.16.0.0/12.</p>
          </div>
          <div className="p-3 bg-navy-950 rounded-xl border border-navy-800">
            <span className="font-semibold text-blue-300 block">Class C (192.0.0.0 – 223.255.255.255)</span>
            <p className="text-[11px] text-slate-400 mt-1">Default mask 255.255.255.0 (/24). Private block: 192.168.0.0/16.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
