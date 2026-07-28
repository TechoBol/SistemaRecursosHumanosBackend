import { Request, Response } from 'express'

import { getAllRolesRepository } from '../repository/role.repository'

export const getRoles = async (_req: Request, res: Response) => {
  try {
    const roles = await getAllRolesRepository()
    return res.json(roles)
  } catch (error) {
    console.error('Error getting roles:', error)

    return res.status(500).json({
      message: 'No se pudieron obtener los roles',
    })
  }
}