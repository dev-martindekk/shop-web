import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, handleApiError } from "@/lib/auth";
import { saveUploadedImage } from "@/lib/upload";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const form = await req.formData();
    const files = form.getAll("files").filter((f): f is File => f instanceof File);
    if (files.length === 0) {
      return NextResponse.json({ error: "no files" }, { status: 400 });
    }
    const urls: string[] = [];
    for (const file of files) {
      urls.push(await saveUploadedImage(file));
    }
    return NextResponse.json({ urls });
  } catch (e) {
    return handleApiError(e);
  }
}
