import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";

const schema = z.object({
  barNumber: z.string().min(5, "شماره پروانه معتبر وارد کنید"),
  bioFA: z.string().min(50, "بیوگرافی باید حداقل ۵۰ کاراکتر باشد"),
  bioEN: z.string().optional(),
  experience: z.number().min(0).max(60),
  education: z.string().optional(),
  specialties: z.string().optional(),
  tagIds: z.array(z.number()).optional(),
  photoUrl: z.string().optional(),
  licenseImage: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "ابتدا وارد شوید" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const userName = session.user.name ?? "وکیل";

  try {
    const body = await req.json();
    const data = schema.parse(body);

    const existing = await db.teamMember.findFirst({
      where: { OR: [{ userId }, { barNumber: data.barNumber }] },
    });

    if (existing) {
      return NextResponse.json(
        { error: "این حساب یا شماره پروانه قبلاً ثبت شده است" },
        { status: 409 }
      );
    }

    function toSlug(str: string) {
      return str.trim().replace(/\s+/g, "-");
    }

    const teamMember = await db.teamMember.create({
      data: {
        userId,
        nameFA: userName,
        nameEN: userName,
        slug: toSlug(userName) + "-" + Date.now(),
        roleFA: "وکیل پایه یک دادگستری",
        roleEN: "Licensed Bar Attorney",
        bioFA: data.bioFA,
        bioEN: data.bioEN ?? "",
        barNumber: data.barNumber,
        experience: data.experience,
        education: data.education,
        photoUrl: data.photoUrl,
        licenseImage: data.licenseImage,
        status: "PENDING",
        isActive: false,
      },
    });

    if (data.tagIds && data.tagIds.length > 0) {
      await db.taggable.createMany({
        data: data.tagIds.map((tagId) => ({
          tagId,
          taggableType: "TEAM_MEMBER" as const,
          taggableId: teamMember.id,
        })),
      });
    }

    await db.user.update({
      where: { id: userId },
      data: { role: "LAWYER" },
    });

    return NextResponse.json({ teamMember }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("Registration error:", err);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
