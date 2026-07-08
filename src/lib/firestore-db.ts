// Firestore adapter that mimics the Prisma Client API
// This allows us to use Firestore instead of SQLite without rewriting all API routes
//
// Usage: import { db } from '@/lib/firestore-db'
// Then use db.product.findMany(), db.product.create(), etc. — same as Prisma

import { getFirestore, isFirebaseAvailable } from './firebase'
import { db as prismaDb } from './db'

// Helper to convert Firestore timestamps to ISO strings
function serialize(data: any): any {
  if (!data) return data
  if (data.toDate) return data.toDate()
  if (Array.isArray(data)) return data.map(serialize)
  if (typeof data === 'object') {
    const result: any = {}
    for (const [k, v] of Object.entries(data)) {
      result[k] = serialize(v)
    }
    return result
  }
  return data
}

// Helper to build Firestore query from Prisma-like "where" clause
function buildQuery(collection: FirebaseFirestore.CollectionReference, where?: any): FirebaseFirestore.Query {
  let query: FirebaseFirestore.Query = collection
  if (!where) return query

  for (const [key, value] of Object.entries(where)) {
    if (key === 'OR' && Array.isArray(value)) {
      // OR is complex in Firestore — we can't do OR across different fields easily
      // For simplicity, we skip OR and return all (client-side filtering)
      continue
    }
    if (key === 'AND' && Array.isArray(value)) {
      for (const cond of value) {
        for (const [k, v] of Object.entries(cond)) {
          if (v !== null && v !== undefined && typeof v === 'object') {
            // Handle operators like { gte, lte, contains }
            if ('equals' in (v as any)) query = query.where(k, '==', (v as any).equals)
            if ('gte' in (v as any)) query = query.where(k, '>=', (v as any).gte)
            if ('lte' in (v as any)) query = query.where(k, '<=', (v as any).lte)
            if ('gt' in (v as any)) query = query.where(k, '>', (v as any).gt)
            if ('lt' in (v as any)) query = query.where(k, '<', (v as any).lt)
            if ('contains' in (v as any)) {
              // Firestore doesn't support native LIKE — we'll filter client-side
              // Just skip here, filter later
            }
          } else {
            query = query.where(k, '==', v as any)
          }
        }
      }
      continue
    }
    if (key === 'NOT') {
      // Skip NOT for simplicity
      continue
    }
    if (value !== null && value !== undefined && typeof value === 'object' && !Array.isArray(value)) {
      if ('equals' in (value as any)) query = query.where(key, '==', (value as any).equals)
      else if ('gte' in (value as any)) query = query.where(key, '>=', (value as any).gte)
      else if ('lte' in (value as any)) query = query.where(key, '<=', (value as any).lte)
      else if ('gt' in (value as any)) query = query.where(key, '>', (value as any).gt)
      else if ('lt' in (value as any)) query = query.where(key, '<', (value as any).lt)
      else if ('contains' in (value as any)) {
        // Skip — filter client-side
      }
      else if ('not' in (value as any)) {
        // Skip NOT for simplicity
      }
    } else if (value !== undefined) {
      query = query.where(key, '==', value as any)
    }
  }
  return query
}

// Helper to apply orderBy
function applyOrderBy(query: FirebaseFirestore.Query, orderBy?: any): FirebaseFirestore.Query {
  if (!orderBy) return query
  if (Array.isArray(orderBy)) {
    for (const ob of orderBy) {
      for (const [field, direction] of Object.entries(ob)) {
        query = query.orderBy(field, direction as 'asc' | 'desc')
      }
    }
  } else if (typeof orderBy === 'object') {
    for (const [field, direction] of Object.entries(orderBy)) {
      query = query.orderBy(field, direction as 'asc' | 'desc')
    }
  }
  return query
}

// Helper to filter results client-side (for contains, OR, etc.)
function clientSideFilter(docs: any[], where?: any): any[] {
  if (!where) return docs
  return docs.filter(doc => {
    for (const [key, value] of Object.entries(where)) {
      if (key === 'OR' && Array.isArray(value)) {
        const matched = value.some((cond: any) => {
          return Object.entries(cond).every(([k, v]: [string, any]) => {
            if (typeof v === 'object' && v !== null && 'contains' in v) {
              return String(doc[k] || '').toLowerCase().includes(String(v.contains).toLowerCase())
            }
            return doc[k] === v
          })
        })
        if (!matched) return false
        continue
      }
      if (key === 'NOT' && typeof value === 'object' && value !== null) {
        for (const [k, v] of Object.entries(value)) {
          if (doc[k] === v) return false
        }
        continue
      }
      if (value !== null && value !== undefined && typeof value === 'object' && !Array.isArray(value)) {
        if ('contains' in (value as any)) {
          if (!String(doc[key] || '').toLowerCase().includes(String((value as any).contains).toLowerCase())) return false
          continue
        }
        if ('not' in (value as any)) {
          if (doc[key] === (value as any).not) return false
          continue
        }
        if ('gte' in (value as any) && doc[key] < (value as any).gte) return false
        if ('lte' in (value as any) && doc[key] > (value as any).lte) return false
        if ('gt' in (value as any) && doc[key] <= (value as any).gt) return false
        if ('lt' in (value as any) && doc[key] >= (value as any).lt) return false
      } else if (value !== undefined && value !== null) {
        if (doc[key] !== value) return false
      }
    }
    return true
  })
}

// Create a model proxy for a Firestore collection
function createModel(collectionName: string) {
  return {
    async findMany(opts: any = {}): Promise<any[]> {
      try {
        const firestore = getFirestore()
        const collection = firestore.collection(collectionName)
        let query = buildQuery(collection, opts.where)
        query = applyOrderBy(query, opts.orderBy)
        if (opts.skip) query = query.offset(opts.skip)
        if (opts.take) query = query.limit(Math.abs(opts.take))

        const snapshot = await query.get()
        let docs = snapshot.docs.map(doc => ({ id: doc.id, ...serialize(doc.data()) }))

        // Client-side filtering for contains, OR, etc.
        docs = clientSideFilter(docs, opts.where)

        // Handle includes (we don't do joins in Firestore — return as-is)
        return docs
      } catch (error) {
        console.error(`[Firestore] findMany ${collectionName}:`, error)
        return []
      }
    },

    async findUnique(opts: any): Promise<any | null> {
      try {
        const firestore = getFirestore()
        // If where has id, use direct document get
        if (opts.where?.id) {
          const doc = await firestore.collection(collectionName).doc(opts.where.id).get()
          if (!doc.exists) return null
          return { id: doc.id, ...serialize(doc.data()) }
        }
        // Otherwise query
        const results = await this.findMany({ where: opts.where, take: 1 })
        return results[0] || null
      } catch (error) {
        console.error(`[Firestore] findUnique ${collectionName}:`, error)
        return null
      }
    },

    async findFirst(opts: any): Promise<any | null> {
      const results = await this.findMany({ ...opts, take: 1 })
      return results[0] || null
    },

    async create(opts: any): Promise<any> {
      try {
        const firestore = getFirestore()
        const data = { ...opts.data, createdAt: new Date(), updatedAt: new Date() }
        // If data has an id, use it; otherwise auto-generate
        if (opts.data?.id) {
          await firestore.collection(collectionName).doc(opts.data.id).set(data)
          return { id: opts.data.id, ...data }
        } else {
          const docRef = await firestore.collection(collectionName).add(data)
          return { id: docRef.id, ...data }
        }
      } catch (error) {
        console.error(`[Firestore] create ${collectionName}:`, error)
        throw error
      }
    },

    async update(opts: any): Promise<any> {
      try {
        const firestore = getFirestore()
        const data = { ...opts.data, updatedAt: new Date() }
        const id = opts.where?.id
        if (!id) throw new Error('Update requires where.id')
        await firestore.collection(collectionName).doc(id).update(data)
        const doc = await firestore.collection(collectionName).doc(id).get()
        return { id: doc.id, ...serialize(doc.data()) }
      } catch (error) {
        console.error(`[Firestore] update ${collectionName}:`, error)
        throw error
      }
    },

    async updateMany(opts: any): Promise<{ count: number }> {
      try {
        const results = await this.findMany({ where: opts.where })
        const firestore = getFirestore()
        const batch = firestore.batch()
        for (const doc of results) {
          batch.update(firestore.collection(collectionName).doc(doc.id), { ...opts.data, updatedAt: new Date() })
        }
        await batch.commit()
        return { count: results.length }
      } catch (error) {
        console.error(`[Firestore] updateMany ${collectionName}:`, error)
        return { count: 0 }
      }
    },

    async delete(opts: any): Promise<any> {
      try {
        const firestore = getFirestore()
        const id = opts.where?.id
        if (!id) throw new Error('Delete requires where.id')
        await firestore.collection(collectionName).doc(id).delete()
        return { id }
      } catch (error) {
        console.error(`[Firestore] delete ${collectionName}:`, error)
        throw error
      }
    },

    async deleteMany(opts: any): Promise<{ count: number }> {
      try {
        const results = await this.findMany({ where: opts.where })
        const firestore = getFirestore()
        const batch = firestore.batch()
        for (const doc of results) {
          batch.delete(firestore.collection(collectionName).doc(doc.id))
        }
        await batch.commit()
        return { count: results.length }
      } catch (error) {
        console.error(`[Firestore] deleteMany ${collectionName}:`, error)
        return { count: 0 }
      }
    },

    async count(opts: any = {}): Promise<number> {
      try {
        const results = await this.findMany(opts)
        return results.length
      } catch {
        return 0
      }
    },

    async groupBy(opts: any): Promise<any[]> {
      try {
        const results = await this.findMany({ where: opts.where })
        const groups: Record<string, any> = {}
        for (const doc of results) {
          const key = doc[opts.by[0]]
          if (!groups[key]) groups[key] = { [opts.by[0]]: key, _count: { _all: 0 }, _sum: {} }
          groups[key]._count._all++
          if (opts._sum) {
            for (const [field] of Object.entries(opts._sum)) {
              groups[key]._sum[field] = (groups[key]._sum[field] || 0) + (doc[field] || 0)
            }
          }
        }
        return Object.values(groups)
      } catch {
        return []
      }
    },
  }
}

// Smart DB: uses Firebase Firestore if available, falls back to Prisma/SQLite if not
const useFirebase = isFirebaseAvailable()

// Create the db object with all models
// Model names map to Firestore collection names (lowercase, singular)
const models = [
  'user', 'address', 'vendor', 'category', 'brand', 'product', 'review',
  'cart', 'cartItem', 'wishlist', 'order', 'orderItem', 'payment', 'refund',
  'delivery', 'withdrawal', 'ticket', 'ticketMessage', 'banner', 'coupon',
  'notification', 'moderationLog', 'auditLog', 'setting',
  'vendorPackage', 'vendorSubscription', 'page', 'blogPost', 'faq',
]

const firestoreDb: any = {}
for (const model of models) {
  firestoreDb[model] = createModel(model.charAt(0).toUpperCase() + model.slice(1))
}

// Export the appropriate db based on environment
export const db = useFirebase ? firestoreDb : prismaDb

export { useFirebase }
