const VISITED_KEY = "grids:site-visited";

// Keep client navigation working even when browser storage is unavailable.
let visitedInMemory = false;

export function markSiteVisited() {
  visitedInMemory = true;
  try {
    window.sessionStorage.setItem(VISITED_KEY, "1");
  } catch {
    // The in-memory flag still prevents replay during this page session.
  }
}

export function claimIntroVisit() {
  let visited = visitedInMemory;
  try {
    visited ||= window.sessionStorage.getItem(VISITED_KEY) === "1";
  } catch {
    // Some privacy settings block access to sessionStorage.
  }
  // Consume the visit at the start, including an intro interrupted by navigation.
  markSiteVisited();
  return !visited;
}
