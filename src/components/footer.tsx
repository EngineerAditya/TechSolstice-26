"use client";

import { Mail, Phone } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useEffect, useRef, useState } from "react";

// Dynamically load the responsive flicker component on client only
const FlickeringGridResponsiveLazy = dynamic(
  () => import("./ui/flickering-grid").then((m) => m.FlickeringGridResponsive),
  { ssr: false }
);

export const siteConfig = {
  contactData: {
    eventName: "TechSolstice'26",
    address: [
      "Manipal Institute of Technology",
      "Yelahanka, Bengaluru",
      "Karnataka - 560064",
    ],
    generalEmail: "fest.mitblr@manipal.edu",
    contacts: [
      {
        name: "Aishani Sharma",
        role: "HR Head",
        phone: "+91 95353 90081",
      },
      {
        name: "Swaraj Shewale",
        role: "HR Head",
        phone: "+91 90281 86267",
      },
    ],
  },
};

export type SiteConfig = typeof siteConfig;

export const Footer = () => {
  const isTabletOrLarger = useMediaQuery("(min-width: 768px)"); // 768px = tablet breakpoint
  const tablet = useMediaQuery("(max-width: 1024px)");

  return (
    <footer
      id="footer"
      className="w-full pb-0 bg-black/40 backdrop-blur-md border-t border-white/10 pt-16 relative z-10 overflow-hidden"
    >
      {/* subtle centered glow above the top border to separate footer from content */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 pointer-events-none">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-neutral-500/20 to-transparent opacity-70" />
      </div>

      <div className="w-full relative z-20 py-6 md:py-10">
        {/* Left content: full-width on mobile, pinned to left edge on md+ */}
        <div className="w-full md:absolute md:left-0 md:top-0 md:bottom-0 md:flex md:items-start md:pl-0">
          <div className="px-6 md:px-[5px]">
            <h2 className="text-3xl md:text-4xl font-semibold text-white">{siteConfig.contactData.eventName}</h2>
            <div className="mt-2 text-sm text-neutral-400">
              {siteConfig.contactData.address.map((l, i) => (
                <div key={i}>{l}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Logos: centered within page width */}
        <div className="mx-auto w-full max-w-7xl flex items-center justify-center py-4 hidden md:flex">
          <div className="flex items-center gap-8">
            <Image src="/logos/logo.png" alt="ts-logo" width={160} height={160} className="h-28 md:h-32 lg:h-36 w-auto" />
            <Image src="/logos/font-logo.png" alt="ts-wordmark" width={320} height={96} className="h-20 md:h-24 lg:h-28 w-auto" />
          </div>
        </div>

        {/* Right content: full-width on mobile, pinned to right edge on md+ */}
        <div className="w-full md:absolute md:right-0 md:top-0 md:bottom-0 md:flex md:items-start md:pr-0">
          <div className="px-6 md:px-[5px] w-full">
            <div className="text-right">
              <h3 className="text-xl font-semibold text-white">Contact Us</h3>
              <div className="mt-2 text-sm text-neutral-400 w-full max-w-sm ml-auto">
                <div className="flex items-center justify-end gap-2"><Mail className="h-4 w-4 text-neutral-400" /> <span className="text-right">{siteConfig.contactData.generalEmail}</span></div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-8 w-full max-w-md ml-auto">
                {siteConfig.contactData.contacts.map((c, idx) => (
                  <div key={idx} className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Phone className="h-4 w-4 text-neutral-400" />
                      <span className="text-white font-medium">{c.phone}</span>
                    </div>
                    <div className="text-sm text-neutral-400">{c.name} — {c.role}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Only show FlickeringGrid on tablet and larger devices */}
      {isTabletOrLarger && (
        <div
          className="w-full h-48 md:h-[60vh] relative mt-4 md:mt-8 z-0"
          style={{
            WebkitMaskImage: "linear-gradient(to bottom, transparent, black 20%)",
            maskImage: "linear-gradient(to bottom, transparent, black 20%)",
          }}
        >
          {/* flicker container - we lazy-load the flicker when this container enters the viewport */}
          <FlickerOnView
            text={tablet ? "Solstice'26" : "TechSolstice'26"}
            baseFontSize={tablet ? 80 : 160}
          />
        </div>
      )}
    </footer>
  );
};

function FlickerOnView({ text, baseFontSize }: { text: string; baseFontSize: number }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loadFlicker, setLoadFlicker] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // If already in DOM view, load immediately
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setLoadFlicker(true);
            io.disconnect();
            return;
          }
        }
      },
      { threshold: 0.05 }
    );

    io.observe(el);

    return () => io.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-10 w-full">
      {loadFlicker ? (
        <FlickeringGridResponsiveLazy
          text={text}
          baseFontSize={baseFontSize}
          className="h-full w-full"
          squareSize={3}
          gridGap={3}
          color="#6B7280"
          maxOpacity={0.4}
          flickerChance={0.15}
        />
      ) : null}
    </div>
  );
}
