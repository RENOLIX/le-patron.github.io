import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

interface DoorIntroProps {
  enabled?: boolean;
}

export default function DoorIntro({ enabled = true }: DoorIntroProps) {
  const [visible, setVisible] = useState(enabled);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setVisible(false);
      setOpening(false);
      return;
    }

    setVisible(true);
    setOpening(false);

    const t1 = window.setTimeout(() => setOpening(true), 800);
    const t2 = window.setTimeout(() => setVisible(false), 2400);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [enabled]);

  if (!visible) {
    return null;
  }

  return (
    <AnimatePresence>
      {visible ? (
        <div className="fixed inset-0 z-[9999] flex pointer-events-none">
          <motion.div
            className="relative h-full w-1/2 overflow-hidden"
            animate={opening ? { x: "-100%" } : { x: 0 }}
            transition={{
              duration: 1.2,
              ease: [0.76, 0, 0.24, 1] as const,
              delay: 0.1,
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.62) 0%, rgba(255,232,241,0.54) 38%, rgba(255,255,255,0.68) 62%, rgba(248,204,224,0.46) 100%)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(110deg, rgba(255,255,255,0.78) 0%, transparent 30%, rgba(255,255,255,0.18) 60%, transparent 100%)",
              }}
            />
            <div className="absolute right-6 top-1/2 flex -translate-y-1/2 flex-col items-center gap-1">
              <div
                className="h-20 w-1 rounded-full"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(180,180,180,0.9), rgba(220,220,220,0.6), rgba(160,160,160,0.9))",
                }}
              />
              <div
                className="h-4 w-4 rounded-full border border-white/60"
                style={{
                  background:
                    "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.9), rgba(180,190,200,0.5))",
                }}
              />
            </div>
            <div
              className="absolute bottom-0 right-0 top-0 w-[2px]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(180,180,180,0.3), rgba(255,255,255,0.6), rgba(180,180,180,0.3))",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-end pr-10">
              <span
                className="font-brand text-7xl leading-none md:text-9xl"
                style={{ color: "rgba(68,25,43,0.22)" }}
              >
                Mi
              </span>
            </div>
          </motion.div>

          <motion.div
            className="relative h-full w-1/2 overflow-hidden"
            animate={opening ? { x: "100%" } : { x: 0 }}
            transition={{
              duration: 1.2,
              ease: [0.76, 0, 0.24, 1] as const,
              delay: 0.1,
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(225deg, rgba(255,255,255,0.62) 0%, rgba(255,232,241,0.54) 38%, rgba(255,255,255,0.68) 62%, rgba(248,204,224,0.46) 100%)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(70deg, transparent 0%, rgba(255,255,255,0.2) 40%, transparent 70%, rgba(255,255,255,0.56) 100%)",
              }}
            />
            <div className="absolute left-6 top-1/2 flex -translate-y-1/2 flex-col items-center gap-1">
              <div
                className="h-20 w-1 rounded-full"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(180,180,180,0.9), rgba(220,220,220,0.6), rgba(160,160,160,0.9))",
                }}
              />
              <div
                className="h-4 w-4 rounded-full border border-white/60"
                style={{
                  background:
                    "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.9), rgba(180,190,200,0.5))",
                }}
              />
            </div>
            <div
              className="absolute bottom-0 left-0 top-0 w-[2px]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(180,180,180,0.3), rgba(255,255,255,0.6), rgba(180,180,180,0.3))",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-start pl-10">
              <span
                className="font-brand text-7xl leading-none md:text-9xl"
                style={{ color: "rgba(68,25,43,0.22)" }}
              >
                na
              </span>
            </div>
          </motion.div>

          <div className="absolute inset-x-0 bottom-12 flex justify-center">
            <span className="rounded-full border border-white/60 bg-white/38 px-6 py-2 text-[11px] uppercase tracking-[0.38em] text-[#6d3850] backdrop-blur-sm">
              Boutique
            </span>
          </div>

          <div
            className="absolute bottom-0 left-1/2 top-0 w-[1px] -translate-x-1/2"
            style={{
              background:
                "linear-gradient(180deg, transparent, rgba(164,118,138,0.4) 20%, rgba(255,245,249,0.7) 50%, rgba(164,118,138,0.4) 80%, transparent)",
            }}
          />
        </div>
      ) : null}
    </AnimatePresence>
  );
}
