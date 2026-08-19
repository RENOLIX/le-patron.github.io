import { useEffect, useRef, type ReactNode } from "react";

export default function ScrollReveal({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elements = Array.from(root.current?.querySelectorAll<HTMLElement>("section:not(.hero), footer, .card") ?? []);
    elements.forEach((element, index) => {
      if (element.closest(".admin-shell, .admin-login")) return;
      element.classList.add("scroll-reveal-target");
      element.style.setProperty("--reveal-delay", `${Math.min((index % 4) * 65, 195)}ms`);
    });
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("is-revealed"); observer.unobserve(entry.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -36px" });
    elements.forEach(element => element.classList.contains("scroll-reveal-target") && observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return <div ref={root}>{children}</div>;
}
