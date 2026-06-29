import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import type { CldFolder } from "@/lib/cloudinary";

/**
 * POST /api/upload/sign
 *
 * Generates a Cloudinary signed upload signature server-side.
 * The API secret never leaves the server.
 *
 * Body: { folder: string }
 * Response: { signature, timestamp, api_key, cloud_name, folder }
 */
export async function POST(req: NextRequest) {
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudName =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ??
    process.env.CLOUDINARY_CLOUD_NAME;

  if (!apiKey || !apiSecret || !cloudName) {
    return NextResponse.json(
      { error: "Cloudinary is not configured on the server." },
      { status: 500 }
    );
  }

  let folder: CldFolder | string = "placementhub/misc";
  try {
    const body = await req.json();
    if (body?.folder) folder = body.folder;
  } catch {
    // use default folder
  }

  const timestamp = Math.round(Date.now() / 1000);

  // Build the string-to-sign (must match exactly what Cloudinary expects)
  // Format: key=value&key=value sorted alphabetically + api_secret
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash("sha256")
    .update(paramsToSign + apiSecret)
    .digest("hex");

  return NextResponse.json({
    signature,
    timestamp,
    api_key: apiKey,
    cloud_name: cloudName,
    folder,
  });
}
