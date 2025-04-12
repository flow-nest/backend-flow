// middleware/isAdmin.ts
import { PrismaClient } from '@prisma/client'
// import { Request, Response, NextFunction } from 'express'

const prisma = new PrismaClient()

export const isAdmin = async (req: any, res: any, next: any) => {
  try {
    const userId = req.user?.id // assuming user ID is set on req.user after authentication

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: No user ID found' })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Admins only' })
    }

    next()
  } catch (error) {
    console.error('Error in isAdmin middleware:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
