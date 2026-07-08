import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET() {
  try {
    const accounts = await db.bankAccount.findMany({ orderBy: { order: 'asc' } })
    return NextResponse.json(accounts)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    if (!body.bankName || !body.accountNumber) return NextResponse.json({ error: 'Bank name and account number required' }, { status: 400 })
    const account = await db.bankAccount.create({
      data: {
        bankName: body.bankName,
        bankCode: body.bankCode || '',
        accountName: body.accountName || '',
        accountNumber: body.accountNumber,
        branch: body.branch || null,
        swiftCode: body.swiftCode || null,
        active: body.active !== false,
        order: Number(body.order) || 0,
      },
    })
    return NextResponse.json(account)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
