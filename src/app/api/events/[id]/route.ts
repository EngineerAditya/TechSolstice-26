import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const id = params.id;
  console.log(`PUT /api/events/${id}`);

  if (!id || id === "undefined") {
    console.error("Error: Invalid ID provided for update:", id);
    return NextResponse.json(
      { error: "Invalid event ID provided." },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    console.log("Request Body for update:", body);

    const { data, error } = await supabase
      .from("events")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      throw error;
    }

    console.log("Update successful. Returning:", data);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Caught exception in PUT /api/events/[id]:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to update event.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const id = params.id;
  console.log(`DELETE /api/events/${id}`);

  if (!id || id === "undefined") {
    console.error("Error: Invalid ID provided for deletion:", id);
    return NextResponse.json(
      { error: "Invalid event ID provided for deletion." },
      { status: 400 }
    );
  }

  try {
    const { error } = await supabase.from("events").delete().eq("id", id);

    if (error) {
      console.error("Supabase delete error:", error);
      throw error;
    }

    console.log("Delete successful for ID:", id);
    return NextResponse.json(
      { message: "Event deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Caught exception in DELETE /api/events/[id]:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete event.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
