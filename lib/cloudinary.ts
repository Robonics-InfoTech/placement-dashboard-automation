import { Cloudinary } from "@cloudinary/url-gen";

/**
 * Browser-safe Cloudinary instance.
 * Used to build image URLs with transforms (format auto, quality auto, etc.)
 * The cloud name is public — no secret is exposed here.
 */
export const cld = new Cloudinary({
  cloud: {
    cloudName:
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ??
      process.env.CLOUDINARY_CLOUD_NAME ?? // fallback for local dev
      "",
  },
  url: {
    secure: true, // always https
  },
});

/**
 * Cloudinary upload folders — keep assets organised.
 */
export const CLD_FOLDERS = {
  studentPhotos:  "placementhub/students/photos",
  employerLogos:  "placementhub/employers/logos",
  adminPhotos:    "placementhub/admins/photos",
  resumes:        "placementhub/documents/resumes",
  marksheets:     "placementhub/documents/marksheets",
  certifications: "placementhub/documents/certifications",
} as const;

export type CldFolder = (typeof CLD_FOLDERS)[keyof typeof CLD_FOLDERS];
