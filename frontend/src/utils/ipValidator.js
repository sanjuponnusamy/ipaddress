/**
 * Comprehensive IPv4 Validation & Analysis Engine
 * Demonstrates core Computer Networks addressing concepts:
 * - 4 octets, 8 bits each (32-bit total address space)
 * - Octet range 0 - 255
 * - Address Classification (Class A, B, C, D, E) with Address Ranges
 * - RFC 1918 Private Addressing vs Public vs Special (Loopback, APIPA, Multicast)
 */

export function validateIPv4(ipString) {
  if (typeof ipString !== 'string') {
    return {
      isValid: false,
      reason: 'IP address must be a valid text string.',
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

  // Check for invalid characters (only digits and periods allowed)
  if (!/^[\d.]+$/.test(trimmed)) {
    return {
      isValid: false,
      reason: 'Contains invalid characters. IPv4 addresses only contain numbers (0-9) and dots (.). Alphabetic and special characters are rejected.',
      octets: [],
    };
  }

  const parts = trimmed.split('.');

  if (parts.length !== 4) {
    return {
      isValid: false,
      reason: `IPv4 requires exactly 4 octets separated by dots. Found ${parts.length} octet(s). Rejecting incomplete address.`,
      octets: parts,
    };
  }

  const parsedOctets = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    if (part === '') {
      return {
        isValid: false,
        reason: `Octet #${i + 1} is empty. Adjacent dots or trailing/leading dots are not allowed.`,
        octets: parts,
      };
    }

    // Leading zeros check (e.g., 01 or 001)
    if (part.length > 1 && part.startsWith('0')) {
      return {
        isValid: false,
        reason: `Octet #${i + 1} ("${part}") contains invalid leading zeros.`,
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
        reason: `Octet #${i + 1} (${num}) is out of bounds. Each octet must be between 0 and 255.`,
        octets: parts,
      };
    }

    parsedOctets.push(num);
  }

  return {
    isValid: true,
    reason: 'Valid IPv4 address structure and octet range (0–255).',
    octets: parsedOctets,
    formatted: parsedOctets.join('.'),
  };
}

export function analyzeIPv4(ipString) {
  const validation = validateIPv4(ipString);

  if (!validation.isValid) {
    return {
      isValid: false,
      ip: ipString,
      reason: validation.reason,
      classification: 'Invalid',
      addressRange: 'N/A',
      scope: 'Invalid',
      binary: 'N/A',
      hex: 'N/A',
      defaultMask: 'N/A',
      cidr: 'N/A',
      details: [],
    };
  }

  const [o1, o2, o3, o4] = validation.octets;

  // Binary and Hex conversions
  const binaryOctets = validation.octets.map((o) => o.toString(2).padStart(8, '0'));
  const hexOctets = validation.octets.map((o) => o.toString(16).toUpperCase().padStart(2, '0'));
  const binary = binaryOctets.join('.');
  const hex = hexOctets.join(':');

  // Address Class
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
    classDescription = 'High-order bit 0. Large networks with up to 16,777,214 hosts per network.';
  } else if (o1 === 127) {
    classification = 'Class A (Loopback Reserved)';
    addressRange = '127.0.0.0 – 127.255.255.255';
    defaultMask = '255.0.0.0';
    cidr = '/8';
    classDescription = 'Reserved for internal host software loopback diagnostics (e.g. 127.0.0.1).';
  } else if (o1 >= 128 && o1 <= 191) {
    classification = 'Class B';
    addressRange = '128.0.0.0 – 191.255.255.255';
    defaultMask = '255.255.0.0';
    cidr = '/16';
    classDescription = 'High-order bits 10. Medium-sized networks with up to 65,534 hosts per network.';
  } else if (o1 >= 192 && o1 <= 223) {
    classification = 'Class C';
    addressRange = '192.0.0.0 – 223.255.255.255';
    defaultMask = '255.255.255.0';
    cidr = '/24';
    classDescription = 'High-order bits 110. Small networks with up to 254 hosts per network.';
  } else if (o1 >= 224 && o1 <= 239) {
    classification = 'Class D (Multicast)';
    addressRange = '224.0.0.0 – 239.255.255.255';
    defaultMask = 'Not Applicable';
    cidr = 'Multicast';
    classDescription = 'High-order bits 1110. Reserved for Multicast group communication.';
  } else if (o1 >= 240 && o1 <= 255) {
    classification = 'Class E (Experimental)';
    addressRange = '240.0.0.0 – 255.255.255.255';
    defaultMask = 'Not Applicable';
    cidr = 'Experimental';
    classDescription = 'High-order bits 1111. Reserved for future experimental or research use.';
  } else if (o1 === 0) {
    classification = 'Special (Zero Network)';
    addressRange = '0.0.0.0 – 0.255.255.255';
    defaultMask = '255.0.0.0';
    cidr = '/8';
    classDescription = 'Used for local host bootstrap source routing or default route (0.0.0.0/0).';
  }

  // Scope: RFC 1918 Private, Loopback, Link-Local, Public
  let scope = 'Public Internet';
  let scopeDescription = 'Globally routable IP address on the public Internet.';

  if (o1 === 10) {
    scope = 'Private (RFC 1918)';
    scopeDescription = 'Class A private IP range (10.0.0.0 to 10.255.255.255). Non-routable on the public internet.';
  } else if (o1 === 172 && o2 >= 16 && o2 <= 31) {
    scope = 'Private (RFC 1918)';
    scopeDescription = 'Class B private IP range (172.16.0.0 to 172.31.255.255). Non-routable on the public internet.';
  } else if (o1 === 192 && o2 === 168) {
    scope = 'Private (RFC 1918)';
    scopeDescription = 'Class C private IP range (192.168.0.0 to 192.168.255.255). Standard home and office SOHO networks.';
  } else if (o1 === 127) {
    scope = 'Loopback (RFC 1122)';
    scopeDescription = 'Loopback interface on local host (127.0.0.1 represents localhost).';
  } else if (o1 === 169 && o2 === 254) {
    scope = 'APIPA / Link-Local (RFC 3927)';
    scopeDescription = 'Automatic Private IP Addressing used when DHCP server is unreachable.';
  } else if (o1 === 0 && o2 === 0 && o3 === 0 && o4 === 0) {
    scope = 'Unspecified / Default Route';
    scopeDescription = 'Represents any/all IPv4 addresses or default route.';
  } else if (o1 === 255 && o2 === 255 && o3 === 255 && o4 === 255) {
    scope = 'Limited Broadcast';
    scopeDescription = 'Broadcasts packets to all devices in the local physical network.';
  } else if (o1 >= 224 && o1 <= 239) {
    scope = 'Multicast Group';
    scopeDescription = 'Packets delivered to a group of subscribed destination hosts.';
  }

  const details = [
    { label: 'Octet 1', value: `${o1} (Binary: ${binaryOctets[0]})` },
    { label: 'Octet 2', value: `${o2} (Binary: ${binaryOctets[1]})` },
    { label: 'Octet 3', value: `${o3} (Binary: ${binaryOctets[2]})` },
    { label: 'Octet 4', value: `${o4} (Binary: ${binaryOctets[3]})` },
  ];

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
    details,
  };
}
