import { useEffect, useRef, type ReactNode } from "react";

export default function ScrollReveal({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("is-revealed"); observer.unobserve(entry.target); } });
    }, { threshold: 0, rootMargin: "0px" });
    const seen = new WeakSet<HTMLElement>();
    const register = () => {
      const elements = root.current?.querySelectorAll<HTMLElement>(".intro, .featured, .faq, .home-cta, .product-info, footer, .card") ?? [];
      elements.forEach(element => {
        if (seen.has(element) || element.closest(".admin-shell, .admin-login")) return;
        seen.add(element);
        element.classList.add("scroll-reveal-target");
        observer.observe(element);
      });
    };
    register();
    const mutations = new MutationObserver(register);
    if (root.current) mutations.observe(root.current, { childList: true, subtree: true });
    return () => { mutations.disconnect(); observer.disconnect(); };
  }, []);

  return <div ref={root}>{children}</div>;
}
