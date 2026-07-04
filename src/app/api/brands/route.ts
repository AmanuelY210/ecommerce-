import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const categoryId = searchParams.get('categoryId')

  const allBrands = await db.brand.findMany({ where: { active: true }, orderBy: { name: 'asc' } })

  // If categoryId is provided, filter brands that belong to that category
  if (categoryId) {
    const filtered = allBrands.filter(b => {
      if (!b.categoryIds) return false
      try {
        const ids: string[] = JSON.parse(b.categoryIds)
        return ids.includes(categoryId)
      } catch {
        return false
      }
    })
    return NextResponse.json(filtered.map(b => ({
      id: b.id, name: b.name, slug: b.slug, logo: b.logo, country: b.country, active: b.active,
      categoryIds: b.categoryIds ? JSON.parse(b.categoryIds) : [],
    })))
  }

  return NextResponse.json(allBrands.map(b => ({
    id: b.id, name: b.name, slug: b.slug, logo: b.logo, country: b.country, active: b.active,
    categoryIds: b.categoryIds ? JSON.parse(b.categoryIds) : [],
  })))
}
