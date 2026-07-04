import { NextRequest, NextResponse } from 'next/server'

// Mock payment verification — simulates Chapa/bank callback
export async function POST(req: NextRequest) {
  const { provider, method, bank, reference, amount } = await req.json()

  // Simulate network latency for payment verification
  await new Promise(r => setTimeout(r, 1500))

  // Mock: any 4-digit OTP or 6-char reference is "valid"
  // Real Chapa would call https://api.chapa.co/v1/transactions/verify/{txn_ref}
  const isValid = (reference && reference.length >= 4) || method === 'cod'

  if (!isValid) {
    return NextResponse.json({
      status: 'FAILED',
      message: 'Payment verification failed. Please check your reference and try again.',
    }, { status: 400 })
  }

  return NextResponse.json({
    status: 'SUCCESS',
    provider,
    method,
    bank: bank || null,
    reference: reference || `COD-${Date.now()}`,
    txnId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
    amount,
    verifiedAt: new Date().toISOString(),
    // Mock Chapa response shape
    chapaResponse: {
      message: 'Payment successfully verified',
      data: {
        reference: reference || `COD-${Date.now()}`,
        amount: String(amount),
        currency: 'ETB',
        status: 'success',
        created_at: new Date().toISOString(),
      },
    },
  })
}
