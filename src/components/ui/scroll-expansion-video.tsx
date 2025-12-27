"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

type Props = {
  mediaSrc: string;
  title?: string;
  scrollToExpand?: string;
};

export default function ScrollExpansionVideo({ mediaSrc, title, scrollToExpand }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [mediaFullyExpanded, setMediaFullyExpanded] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const scrollLengthRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const [spacerHeight, setSpacerHeight] = useState<number>(0);
  const activeRef = useRef<boolean>(false);
  const touchStartRef = useRef<number | null>(null);
  const scrollLockedRef = useRef<boolean>(false);
  const savedScrollYRef = useRef<number>(0);
  const awaitingReleaseRef = useRef<boolean>(false);
  const [awaitingRelease, setAwaitingRelease] = useState<boolean>(false);

  // Play / pause based on visibility
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          // try to play; fallback when video can play
          void el.play().catch(() => {});
        } else {
          el.pause();
        }
      }
    }, { threshold: 0.1 });

    // Fallback: if browser delayed playback, try when video can play
    const onCanPlay = () => {
      if (videoRef.current && containerRef.current) {
        void videoRef.current.play().catch(() => {});
      }
    };
    el.addEventListener('canplay', onCanPlay);
    // ensure looping in case attribute isn't respected on some browsers
    try {
      el.loop = true;
    } catch (err) {}
    const onEnded = () => {
      try { void el.play().catch(() => {}); } catch (e) {}
    };
    el.addEventListener('ended', onEnded);

    io.observe(el);
    return () => {
      io.disconnect();
      el.removeEventListener('canplay', onCanPlay);
      el.removeEventListener('ended', onEnded);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Replace wheel/touch handlers with a scroll-driven sticky/pin approach.
  // The component will be pinned for a `scrollLength` range and map
  // the window scroll position into `scrollProgress`.
  useEffect(() => {
    // Pin when visible and handle wheel/touch natively to "consume" scroll
    const el = containerRef.current;
    if (!el) return;

    let io: IntersectionObserver | null = null;

    const lockScroll = () => {
      if (scrollLockedRef.current) return;
      const scrollY = window.scrollY || window.pageYOffset || 0;
      savedScrollYRef.current = scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      scrollLockedRef.current = true;
    };

    const unlockScroll = () => {
      if (!scrollLockedRef.current) return;
      const scrollY = savedScrollYRef.current || 0;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      window.scrollTo(0, scrollY);
      scrollLockedRef.current = false;
    };

    const enableNativeHandlers = () => {
      if (activeRef.current) return;
      activeRef.current = true;
      // lock page scroll immediately when handlers enabled
      try { lockScroll(); } catch (err) {}

      const nativeWheel = (e: WheelEvent) => {
        // if awaiting release, only continue when user scrolls down again
        if (awaitingReleaseRef.current) {
          if (e.deltaY > 12) {
            awaitingReleaseRef.current = false;
            setAwaitingRelease(false);
            disableNativeHandlers();
          }
          e.preventDefault();
          return;
        }

        // only intercept when not fully expanded or when user is reversing
        if (mediaFullyExpanded && e.deltaY > 0) return; // let page scroll down when expanded
        e.preventDefault();
        const delta = e.deltaY * 0.002 * (isMobile ? 2 : 1);
        setScrollProgress((prev) => {
          const next = Math.min(Math.max(prev + delta, 0), 1);
          if (next >= 1) {
            setMediaFullyExpanded(true);
            // enter awaiting-release mode: stay locked until user scrolls again
            awaitingReleaseRef.current = true;
            setAwaitingRelease(true);
          } else {
            setMediaFullyExpanded(false);
          }
          return next;
        });
      };

      const onTouchStart = (e: TouchEvent) => {
        touchStartRef.current = e.touches?.[0]?.clientY ?? null;
      };

      const onTouchMove = (e: TouchEvent) => {
        const touchY = e.touches?.[0]?.clientY ?? 0;
        // if awaiting release, require a downward swipe to release
        if (awaitingReleaseRef.current) {
          const startY = touchStartRef.current ?? touchY;
          const deltaY = startY - touchY;
          if (deltaY > 30) {
            awaitingReleaseRef.current = false;
            setAwaitingRelease(false);
            disableNativeHandlers();
          }
          e.preventDefault();
          return;
        }

        if (mediaFullyExpanded && touchStartRef.current !== null && (touchStartRef.current - touchY) > 0) return;
        e.preventDefault();
        const startY = touchStartRef.current ?? touchY;
        const deltaY = startY - touchY;
        const scrollFactor = isMobile ? 0.008 : 0.004;
        const scrollDelta = deltaY * scrollFactor;
        setScrollProgress((prev) => {
          const next = Math.min(Math.max(prev + scrollDelta, 0), 1);
          if (next >= 1) {
            setMediaFullyExpanded(true);
            awaitingReleaseRef.current = true;
            setAwaitingRelease(true);
          } else {
            setMediaFullyExpanded(false);
          }
          return next;
        });
        touchStartRef.current = touchY;
      };

      const disableNativeHandlers = () => {
        window.removeEventListener("wheel", nativeWheel as EventListener);
        window.removeEventListener("touchstart", onTouchStart as EventListener, { passive: false } as any);
        window.removeEventListener("touchmove", onTouchMove as EventListener, { passive: false } as any);
        activeRef.current = false;
        awaitingReleaseRef.current = false;
        setAwaitingRelease(false);
        try { unlockScroll(); } catch (err) {}
      };

      // attach with passive: false so we can call preventDefault
      window.addEventListener("wheel", nativeWheel as EventListener, { passive: false });
      window.addEventListener("touchstart", onTouchStart as EventListener, { passive: false } as any);
      window.addEventListener("touchmove", onTouchMove as EventListener, { passive: false } as any);

      // store reference on the container for later cleanup
      (el as any).__scrollHandlersDisabled = disableNativeHandlers;
    };

    const disableNativeHandlersFromEl = () => {
      const fn = (el as any).__scrollHandlersDisabled;
      if (typeof fn === "function") fn();
      delete (el as any).__scrollHandlersDisabled;
      try { unlockScroll(); } catch (err) {}
    };

    io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          // start intercepting scroll while visible and not yet fully expanded
          if (!mediaFullyExpanded) enableNativeHandlers();
        } else {
          // leaving viewport: ensure handlers removed
          disableNativeHandlersFromEl();
        }
      }
    }, { threshold: 0.5 });

    io.observe(el);
    return () => {
      if (io) io.disconnect();
      disableNativeHandlersFromEl();
    };
  }, [isMobile, mediaFullyExpanded]);

  // compute sizes
  const mediaWidth = 300 + scrollProgress * (isMobile ? 650 : 1250);
  const mediaHeight = 400 + scrollProgress * (isMobile ? 200 : 400);

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* spacer creates scrollable range: viewport + animation scroll length */}
      <div style={{ height: spacerHeight ? `${spacerHeight}px` : "100vh" }}>
        <div className="sticky top-1/2 -translate-y-1/2 flex items-center justify-center w-full">
          <motion.div
            className="rounded-2xl border border-white/10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden relative"
            style={{ maxWidth: "95vw", maxHeight: "85vh" }}
            animate={{ width: `${mediaWidth}px`, height: `${mediaHeight}px` }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
          >
            <video
              ref={videoRef}
              src={mediaSrc}
              className="w-full h-full object-cover rounded-xl"
              playsInline
              muted
              loop
              preload="metadata"
            />

            <motion.div
              className="absolute inset-0 bg-black/20 rounded-xl"
              initial={{ opacity: 0.6 }}
              animate={{ opacity: mediaFullyExpanded ? 0 : 0.6 - scrollProgress * 0.6 }}
              transition={{ duration: 0.2 }}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
