import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET() {
  const faqs = await db.faq.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] })
  return NextResponse.json(faqs)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const faq = await db.faq.create({
    data: {
      question: body.question,
      answer: body.answer,
      category: body.category || 'GENERAL',
      order: Number(body.order) || 0,
      active: body.active !== false,
    },
  })
  return NextResponse.json(faq)
}
