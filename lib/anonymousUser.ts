/**
 * Anonymous User Identification System
 * Creates a unique, persistent identifier for users without registration
 */

interface BrowserFingerprint {
  userAgent: string;
  language: string;
  platform: string;
  screenResolution: string;
  timezone: string;
  colorDepth: number;
  cookieEnabled: boolean;
}

/**
 * Generate a browser fingerprint for additional uniqueness
 */
function generateBrowserFingerprint(): BrowserFingerprint {
  if (typeof window === "undefined") {
    // Server-side fallback
    return {
      userAgent: "",
      language: "en",
      platform: "unknown",
      screenResolution: "1920x1080",
      timezone: "UTC",
      colorDepth: 24,
      cookieEnabled: false,
    };
  }

  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    colorDepth: screen.colorDepth,
    cookieEnabled: navigator.cookieEnabled,
  };
}

/**
 * Simple hash function for creating consistent IDs
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Get or create an anonymous user ID
 * This combines localStorage persistence with browser fingerprinting
 */
export function getAnonymousUserId(): string {
  if (typeof window === "undefined") {
    return "server-user";
  }

  const STORAGE_KEY = "civic-reporter-user-id";

  // Try to get existing ID from localStorage
  let userId = localStorage.getItem(STORAGE_KEY);

  if (!userId) {
    // Generate new ID based on timestamp and browser fingerprint
    const fingerprint = generateBrowserFingerprint();
    const fingerprintString = JSON.stringify(fingerprint);
    const timestamp = Date.now().toString();
    const randomComponent = Math.random().toString(36).substring(2);

    // Create a hash from fingerprint + timestamp + random
    const combinedString = fingerprintString + timestamp + randomComponent;
    userId = `user_${simpleHash(combinedString)}_${timestamp.slice(-6)}`;

    // Store in localStorage for persistence
    localStorage.setItem(STORAGE_KEY, userId);
  }

  return userId;
}

/**
 * Get user voting data from localStorage
 */
export function getUserVotes(): Record<string, "up" | "down"> {
  if (typeof window === "undefined") {
    return {};
  }

  const VOTES_KEY = "civic-reporter-user-votes";
  const votesData = localStorage.getItem(VOTES_KEY);

  try {
    return votesData ? JSON.parse(votesData) : {};
  } catch {
    return {};
  }
}

/**
 * Save user vote to localStorage
 */
export function saveUserVote(
  reportId: string,
  vote: "up" | "down" | null
): void {
  if (typeof window === "undefined") {
    return;
  }

  const VOTES_KEY = "civic-reporter-user-votes";
  const currentVotes = getUserVotes();

  if (vote === null) {
    delete currentVotes[reportId];
  } else {
    currentVotes[reportId] = vote;
  }

  localStorage.setItem(VOTES_KEY, JSON.stringify(currentVotes));
}

/**
 * Check if user has voted on a specific report
 */
export function getUserVoteForReport(reportId: string): "up" | "down" | null {
  const votes = getUserVotes();
  return votes[reportId] || null;
}
