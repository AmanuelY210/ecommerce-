import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET() {
  try {
    const faqs = await db.faq.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'desc' }] })
    return NextResponse.json(faqs)
  } catch (e: any) {
    console.error('[faqs GET]', e)
    return NextResponse.json({ error: e.message || 'Failed to fetch FAQs' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    if (!body.question) return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    if (!body.answer) return NextResponse.json({ error: 'Answer is required' }, { status: 400 })

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
  } catch (e: any) {
    console.error('[faqs POST]', e)
    return NextResponse.json({ error: e.message || 'Failed to create FAQ' }, { status: 500 })
  }
}
