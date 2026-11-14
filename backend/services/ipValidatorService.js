/**
 * Backend IPv4 Address Validation and Analysis Service
 * Implements strict RFC 791 and RFC 1918 networking standards:
 * - 32-bit address space (4 octets, 8 bits each)
 * - Decimal octet boundary checking [0 - 255]
 * - Rejection of invalid characters, incomplete octets, leading zeros
 * - Address Classification (Class A, B, C, D, E) with Address Ranges
 * - Network Scope Detection (Private RFC 1918, Public, Loopback, APIPA, Multicast)
 */

function validateIPv4(ipString) {
  if (typeof ipString !== 'string') {
    return {
      isValid: false,
      reason: 'IP address must be provided as a string.',
      octets: [],
    };
  }

  const trimmed = ipString.trim();

  if (!trimmed) {
    return {
      isValid: false,
      reason: 'IP address cannot be empty.',
      octets: [],
    };
  }

  // Reject non-numeric and non-dot characters
  if (!/^[\d.]+$/.test(trimmed)) {
    return {
      isValid: false,
      reason: 'Contains illegal characters. IPv4 addresses must strictly contain digits (0-9) and periods (.).',
      octets: [],
    };
  }

  const parts = trimmed.split('.');

  if (parts.length !== 4) {
    return {
      isValid: false,
      reason: `IPv4 requires exactly four decimal octets separated by dots. Found ${parts.length} octet(s). Rejecting incomplete address.`,
      octets: parts,
    };
  }

  const parsedOctets = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    if (part === '') {
      return {
        isValid: false,
        reason: `Octet #${i + 1} is empty. Leading, trailing, or consecutive dots are forbidden.`,
        octets: parts,
      };
    }

    // Check for leading zero (e.g., 01 or 001)
    if (part.length > 1 && part.startsWith('0')) {
      return {
        isValid: false,
        reason: `Octet #${i + 1} ("${part}") contains invalid leading zeros in decimal IPv4.`,
        octets: parts,
      };
    }

    const num = Number(part);

    if (isNaN(num) || !Number.isInteger(num)) {
      return {
        isValid: false,
        reason: `Octet #${i + 1} ("${part}") is not a valid integer.`,
        octets: parts,
      };
    }

    if (num < 0 || num > 255) {
      return {
        isValid: false,
        reason: `Octet #${i + 1} (${num}) is out of range. Each octet must be between 0 and 255.`,
        octets: parts,
      };
    }

    parsedOctets.push(num);
  }

  return {
    isValid: true,
    reason: 'Valid IPv4 format and octet range (0–255).',
    octets: parsedOctets,
    formatted: parsedOctets.join('.'),
  };
}

function analyzeIPv4(ipString) {
  const validation = validateIPv4(ipString);

  if (!validation.isValid) {
    return {
      isValid: false,
      ip: ipString,
      reason: validation.reason,
      classification: 'Invalid',
      addressRange: 'N/A',
      scope: 'Invalid',
      binary: null,
      hex: null,
      defaultMask: null,
      cidr: null,
    };
  }

  const [o1, o2, o3, o4] = validation.octets;

  // Binary (8 bits per octet) and Hexadecimal representation
  const binaryOctets = validation.octets.map((o) => o.toString(2).padStart(8, '0'));
  const hexOctets = validation.octets.map((o) => o.toString(16).toUpperCase().padStart(2, '0'));
  const binary = binaryOctets.join('.');
  const hex = hexOctets.join(':');

  // Classification (RFC 791)
  let classification = '';
  let addressRange = '';
  let defaultMask = '';
  let cidr = '';
  let classDescription = '';

  if (o1 >= 1 && o1 <= 126) {
    classification = 'Class A';
    addressRange = '1.0.0.0 – 126.255.255.255';
    defaultMask = '255.0.0.0';
    cidr = '/8';
    classDescription = 'First bit 0. Large networks with up to 16,777,214 hosts per network.';
  } else if (o1 === 127) {
    classification = 'Class A (Loopback)';
    addressRange = '127.0.0.0 – 127.255.255.255';
    defaultMask = '255.0.0.0';
    cidr = '/8';
    classDescription = 'Reserved for internal software loopback diagnostics (e.g. 127.0.0.1).';
  } else if (o1 >= 128 && o1 <= 191) {
    classification = 'Class B';
    addressRange = '128.0.0.0 – 191.255.255.255';
    defaultMask = '255.255.0.0';
    cidr = '/16';
    classDescription = 'First bits 10. Medium networks with up to 65,534 hosts per network.';
  } else if (o1 >= 192 && o1 <= 223) {
    classification = 'Class C';
    addressRange = '192.0.0.0 – 223.255.255.255';
    defaultMask = '255.255.255.0';
    cidr = '/24';
    classDescription = 'First bits 110. Small networks with up to 254 hosts per network.';
  } else if (o1 >= 224 && o1 <= 239) {
    classification = 'Class D (Multicast)';
    addressRange = '224.0.0.0 – 239.255.255.255';
    defaultMask = 'Not Applicable';
    cidr = 'Multicast';
    classDescription = 'First bits 1110. Reserved for Multicast group communication.';
  } else if (o1 >= 240 && o1 <= 255) {
    classification = 'Class E (Experimental)';
    addressRange = '240.0.0.0 – 255.255.255.255';
    defaultMask = 'Not Applicable';
    cidr = 'Experimental';
    classDescription = 'First bits 1111. Reserved for future experimental and research use.';
  } else if (o1 === 0) {
    classification = 'Special (Zero Network)';
    addressRange = '0.0.0.0 – 0.255.255.255';
    defaultMask = '255.0.0.0';
    cidr = '/8';
    classDescription = 'Used as source address during bootstrapping or default route (0.0.0.0/0).';
  }

  // Scope: Private (RFC 1918) vs Public vs Special
  let scope = 'Public Internet';
  let scopeDescription = 'Globally routable on the public Internet.';

  if (o1 === 10) {
    scope = 'Private (RFC 1918)';
    scopeDescription = 'Class A private IP block (10.0.0.0/8).';
  } else if (o1 === 172 && o2 >= 16 && o2 <= 31) {
    scope = 'Private (RFC 1918)';
    scopeDescription = 'Class B private IP block (172.16.0.0/12).';
  } else if (o1 === 192 && o2 === 168) {
    scope = 'Private (RFC 1918)';
    scopeDescription = 'Class C private IP block (192.168.0.0/16).';
  } else if (o1 === 127) {
    scope = 'Loopback (RFC 1122)';
    scopeDescription = 'Loopback interface on local host.';
  } else if (o1 === 169 && o2 === 254) {
    scope = 'APIPA / Link-Local (RFC 3927)';
    scopeDescription = 'Automatic Private IP Addressing assigned when DHCP fails.';
  } else if (o1 === 0 && o2 === 0 && o3 === 0 && o4 === 0) {
    scope = 'Unspecified / Default Route';
    scopeDescription = 'Matches all IPv4 addresses in routing tables (0.0.0.0/0).';
  } else if (o1 === 255 && o2 === 255 && o3 === 255 && o4 === 255) {
    scope = 'Limited Broadcast';
    scopeDescription = 'Broadcast message targeting all hosts on local physical link.';
  } else if (o1 >= 224 && o1 <= 239) {
    scope = 'Multicast Group';
    scopeDescription = 'Targeted multicast transmission to member hosts.';
  }

  return {
    isValid: true,
    ip: validation.formatted,
    reason: validation.reason,
    classification,
    addressRange,
    classDescription,
    scope,
    scopeDescription,
    binary,
    hex,
    defaultMask,
    cidr,
    octets: validation.octets,
  };
}

module.exports = {
  validateIPv4,
  analyzeIPv4,
};
