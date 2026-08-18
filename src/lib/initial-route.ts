function getInitialRoutePath() {
  if (typeof window === "undefined") {
    return "/";
  }

  const rawHash = window.location.hash.replace(/^#/, "");
  const normalized = rawHash || "/";
  const [pathname] = normalized.split("?");

  return pathname || "/";
}

export const initialRoutePath = getInitialRoutePath();

let initialHomeIntroClaimed = false;

export function claimInitialHomeIntro() {
  if (initialRoutePath !== "/" || initialHomeIntroClaimed) {
    return false;
  }

  initialHomeIntroClaimed = true;
  return true;
}
