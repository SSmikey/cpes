import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ProjectModel from "@/models/Project";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { name } = await request.json();
  if (!name || !name.trim()) {
    return NextResponse.json({ error: "ชื่อกลุ่มห้ามว่าง" }, { status: 400 });
  }
  await connectDB();
  const doc = await ProjectModel.findOneAndUpdate(
    { id },
    { $set: { name: name.trim() } },
    { new: true }
  ).lean();
  if (!doc) {
    return NextResponse.json({ error: "ไม่พบกลุ่มนี้" }, { status: 404 });
  }
  return NextResponse.json({ project: { id: doc.id, name: doc.name } });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await connectDB();
  const result = await ProjectModel.deleteOne({ id });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "ไม่พบกลุ่มนี้" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
