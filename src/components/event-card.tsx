// event-card.tsx
"use client";

import { useState } from "react";
import ExpandableCard from "@/components/ui/expandable-card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin } from "lucide-react";
import Teamregform from "./ui/Teamregform";

export type Event = {
  id: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  imageUrl: string;
};

export function EventCard({ event }: { event: Event }) {
  const [isFlipped, setIsFlipped] = useState(false);

  // TODO: replace with real logged‑in user id / name
  const currentUserId = "CURRENT_USER_ID";
  const currentUserName = "Your Name";

  return (
    <ExpandableCard
      title={event.name}
      src={event.imageUrl}
      description={event.shortDescription}
      isFlipped={isFlipped}
      backContent={
        <Teamregform
          eventId={event.id}
          captainId={currentUserId}
          captainName={currentUserName}
          minSize={1}
          maxSize={5}
          useEmails={true}
          onBack={() => setIsFlipped(false)}
          onSuccess={() => {
            // optional: flip back or close overlay after success
            setIsFlipped(false);
          }}
        />
      }
    >
      {/* FRONT content of overlay */}
      <div className="space-y-4 pt-2">
        <p className="text-neutral-300">{event.longDescription}</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
            <Calendar size={16} className="text-cyan-400" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
            <Clock size={16} className="text-cyan-400" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
            <MapPin size={16} className="text-cyan-400" />
            <span>{event.venue}</span>
          </div>
        </div>

<div className="px-4 pb-4 pt-2 ">
    <Button
      onClick={() => setIsFlipped(true)}
      size="lg"
      className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold"
    >
      Registration
    </Button>
  </div>
      </div>
    </ExpandableCard>
  );
}

export default EventCard;
