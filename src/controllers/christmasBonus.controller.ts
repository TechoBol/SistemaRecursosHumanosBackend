import { Request, Response } from "express";
import {
  getChristmasBonusesRepository,
  finalizeChristmasBonusesRepository,
} from "../repository/christmasBonus.repository";

export const getChristmasBonusesController = async (req: Request, res: Response) => {
  try {
    const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
    const companyId = req.query.companyId ? Number(req.query.companyId) : null;

    if (!companyId || isNaN(companyId) || companyId <= 0) {
      return res.status(400).json({
        message: "Debe proporcionar una empresa válida para consultar los aguinaldos.",
      });
    }

    if (isNaN(year) || year < 2000 || year > 2100) {
      return res.status(400).json({
        message: "El año especificado no es válido.",
      });
    }

    // Regla de visualización:
    // Para años futuros o el año en curso, solo se visualiza si ya estamos en noviembre o después (o si ya está finalizado)
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12

    // Si piden un año que aún no ha llegado al 1 de noviembre (ej: 2027 pedido en enero 2027)
    if (year > currentYear || (year === currentYear && currentMonth < 11)) {
      // Verificar si por alguna razón ya estuviera finalizado
      const result = await getChristmasBonusesRepository(companyId, year);
      if (!result.isFinalized) {
        return res.json({
          isAvailable: false,
          isFinalized: false,
          message: `La estimación de aguinaldos para la gestión ${year} estará disponible a partir del 1 de noviembre de ${year}.`,
          data: [],
        });
      }
      return res.json({
        isAvailable: true,
        ...result,
      });
    }

    const result = await getChristmasBonusesRepository(companyId, year);
    return res.json({
      isAvailable: true,
      ...result,
    });
  } catch (error: any) {
    console.error("Error getting christmas bonuses:", error);
    return res.status(500).json({
      message: error.message || "Ocurrió un error al obtener la planilla de aguinaldos.",
    });
  }
};

export const finalizeChristmasBonusesController = async (req: Request, res: Response) => {
  try {
    const { companyId, year } = req.body;

    if (!companyId || isNaN(Number(companyId))) {
      return res.status(400).json({
        message: "Debe indicar la empresa para finalizar la planilla de aguinaldos.",
      });
    }

    if (!year || isNaN(Number(year))) {
      return res.status(400).json({
        message: "Debe indicar el año para finalizar la planilla de aguinaldos.",
      });
    }

    const finalizedRecords = await finalizeChristmasBonusesRepository(Number(companyId), Number(year));

    return res.json({
      message: `Planilla de aguinaldos de la gestión ${year} finalizada y registrada correctamente.`,
      count: finalizedRecords.length,
      data: finalizedRecords,
    });
  } catch (error: any) {
    console.error("Error finalizing christmas bonuses:", error);
    return res.status(500).json({
      message: error.message || "No se pudo finalizar la planilla de aguinaldos.",
    });
  }
};
