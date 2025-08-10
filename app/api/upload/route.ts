import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return new NextResponse("Missing file", { status: 400 });
    }

    const key = `covers/${Date.now()}-${file.name}`;
    const blob = await put(key, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type || "application/octet-stream",
      cacheControlMaxAge: 60 * 60 * 24 * 365,
    });

    return NextResponse.json({ url: blob.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return new NextResponse(message, { status: 500 });
  }
}


