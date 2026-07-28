import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import {
  createUserRepository,
  deleteUserRepository,
  getAllUsersRepository,
  getUserByEmailRepository,
  getUserByIdRepository,
  updateUserRepository,
} from '../repository/user.repository'

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await getAllUsersRepository()

    return res.json(users)
  } catch (error) {
    console.error('Error getting users:', error)

    return res.status(500).json({
      message: 'No se pudieron obtener los usuarios',
    })
  }
}

export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: 'El identificador del usuario no es válido',
      })
    }

    const user = await getUserByIdRepository(id)

    if (!user) {
      return res.status(404).json({
        message: 'Usuario no encontrado',
      })
    }

    return res.json(user)
  } catch (error) {
    console.error('Error getting user:', error)

    return res.status(500).json({
      message: 'No se pudo obtener el usuario',
    })
  }
}

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, roleId } = req.body

    if (!name || !email || !password || !roleId) {
      return res.status(400).json({
        message: 'Nombre, correo, contraseña y rol son obligatorios',
      })
    }

    const normalizedEmail = String(email).trim().toLowerCase()

    const existingUser = await getUserByEmailRepository(normalizedEmail)

    if (existingUser) {
      return res.status(409).json({
        message: 'Ya existe un usuario registrado con ese correo',
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await createUserRepository({
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      roleId: Number(roleId),
    })

    return res.status(201).json({
      message: 'Usuario creado correctamente',
      data: user,
    })
  } catch (error) {
    console.error('Error creating user:', error)

    return res.status(500).json({
      message: 'No se pudo crear el usuario',
    })
  }
}

export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    const { name, email, password, roleId, isActive } = req.body

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: 'El identificador del usuario no es válido',
      })
    }

    const currentUser = await getUserByIdRepository(id)

    if (!currentUser) {
      return res.status(404).json({
        message: 'Usuario no encontrado',
      })
    }

    const data: {
      name?: string
      email?: string
      password?: string
      roleId?: number
      isActive?: boolean
    } = {}

    if (name !== undefined) {
      data.name = String(name).trim()
    }

    if (email !== undefined) {
      const normalizedEmail = String(email).trim().toLowerCase()
      const existingUser = await getUserByEmailRepository(normalizedEmail)

      if (existingUser && existingUser.id !== id) {
        return res.status(409).json({
          message: 'Ya existe otro usuario registrado con ese correo',
        })
      }

      data.email = normalizedEmail
    }

    if (password) {
      data.password = await bcrypt.hash(password, 10)
    }

    if (roleId !== undefined) {
      data.roleId = Number(roleId)
    }

    if (isActive !== undefined) {
      data.isActive = Boolean(isActive)
    }

    const updatedUser = await updateUserRepository(id, data)

    return res.json({
      message: 'Usuario actualizado correctamente',
      data: updatedUser,
    })
  } catch (error) {
    console.error('Error updating user:', error)

    return res.status(500).json({
      message: 'No se pudo actualizar el usuario',
    })
  }
}

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        message: 'El identificador del usuario no es válido',
      })
    }

    const user = await getUserByIdRepository(id)

    if (!user) {
      return res.status(404).json({
        message: 'Usuario no encontrado',
      })
    }

    await deleteUserRepository(id)

    return res.json({
      message: 'Usuario desactivado correctamente',
    })
  } catch (error) {
    console.error('Error deleting user:', error)

    return res.status(500).json({
      message: 'No se pudo desactivar el usuario',
    })
  }
}