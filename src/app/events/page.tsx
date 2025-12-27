import { Suspense } from "react";
import { type Event } from "@/components/event-card";
import { EventsClient } from "@/components/events-client";
import { createClient } from "@/utils/supabase/server";
import { Hourglass } from 'ldrs/react'
import 'ldrs/react/Hourglass.css'

async function getEvents(): Promise<Event[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching events:", error);
    return [];
  }

  return data as Event[];
}

const EventsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const params = await searchParams;
  
  const allEvents = await getEvents();
  // allEvents.length = 0;     //Comment out to see events
  
  if (allEvents.length === 0) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center px-4 relative overflow-hidden">
        {/* Animated background blur circles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#E5E5E5]/20 rounded-full blur-3xl animate-spin"></div>
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gray-400/20 rounded-full blur-3xl animate-spin delay-500"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#6C7A89]/20 rounded-full blur-3xl animate-spin delay-1000"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center space-y-8 max-w-4xl">
          {/* Main heading with shimmer effect - FIXED */}
          <div className="relative px-4">
            <h1 
              className="text-7xl md:text-9xl font-bold bg-linear-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-gradient bg-size-[200%_auto]"
              style={{ 
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                paddingBottom: '0.1em' // Add padding to prevent cutoff
              }}
            >
              Coming Soon
            </h1>
          </div>
          
          {/* Subtitle */}
          <p className="text-2xl md:text-3xl text-gray-300 font-light tracking-wide">
            Exciting events are on the way!
          </p>

          <Hourglass
            size="40"
            bgOpacity="0.1"
            speed="1.75"
            color="cyan" 
          />        

          {/* Decorative line */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <div className="h-px w-24 bg-linear-to-rrom-transparent via-cyan-400 to-transparent"></div>
            <div className="text-cyan-400 text-sm uppercase tracking-widest">Stay Tuned</div>
            <div className="h-px w-24 bg-linear-to-r from-transparent via-cyan-400 to-transparent"></div>
          </div>
        </div>

        <style>{`
          @keyframes gradient {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          .animate-gradient {
            animation: gradient 3s ease infinite;
          }
        `}</style>
      </div>
    );
  }

  console.log("EVENTS ON CLIENT : ", allEvents);

  const category =
    typeof params?.category === "string"
      ? params.category.toLowerCase()
      : "all";
  const searchTerm =
    typeof params?.q === "string" ? params.q.toLowerCase() : "";

  const filteredEvents = allEvents
    .filter((event) => {
      if (category === "all") return true;
      return event.category.toLowerCase() === category;
    })
    .filter((event) => event.name.toLowerCase().includes(searchTerm));

  return (
    <div className="min-h-screen w-full">
      {/* Client Component handles filtering UI and display */}
      <Suspense fallback={
        <div className="flex items-center justify-center p-8">
          <div className="text-white text-lg">Loading events...</div>
        </div>
      }>
        <EventsClient
          initialEvents={filteredEvents}
          initialCategory={category}
          initialSearch={searchTerm}
        />
      </Suspense>
    </div>
  );
};

export default EventsPage;
