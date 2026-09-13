import { Request, Response, NextFunction } from 'express';
import Lead from '../models/Lead';
import Property from '../models/Property';
import { AppError } from '../middlewares/error.middleware';

export const createLead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, phone, notes, propertyId, status } = req.body;

    if (propertyId) {
      const propertyExists = await Property.findById(propertyId);
      if (!propertyExists) {
        throw new AppError('The specified property was not found.', 404);
      }
    }

    const lead = await Lead.create({
      name,
      email: email.toLowerCase(),
      phone,
      notes,
      property: propertyId || null,
      status: status || 'new',
      assignedTo: req.user ? req.user.userId : null,
    });

    const populatedLead = await lead.populate([
      { path: 'property', select: 'title location price status' },
      { path: 'assignedTo', select: 'name email role' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Lead created successfully.',
      data: populatedLead,
    });
  } catch (error) {
    next(error);
  }
};

export const getLeads = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, propertyId, page = 1, limit = 10 } = req.query as any;

    const filter: Record<string, any> = {};

    if (status) {
      filter.status = status;
    }

    if (propertyId) {
      filter.property = propertyId;
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(100, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .populate('property', 'title location price status')
        .populate('assignedTo', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Lead.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: leads,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getLeadById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const lead = await Lead.findById(id)
      .populate('property', 'title location price status')
      .populate('assignedTo', 'name email role');

    if (!lead) {
      throw new AppError('Lead not found.', 404);
    }

    res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

export const assignProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { propertyId } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      throw new AppError('Specified property not found.', 404);
    }

    const lead = await Lead.findById(id);
    if (!lead) {
      throw new AppError('Lead not found.', 404);
    }

    lead.property = property._id as any;
    await lead.save();

    const updatedLead = await lead.populate([
      { path: 'property', select: 'title location price status' },
      { path: 'assignedTo', select: 'name email role' },
    ]);

    res.status(200).json({
      success: true,
      message: 'Property successfully assigned to lead.',
      data: updatedLead,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLeadStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const lead = await Lead.findById(id);
    if (!lead) {
      throw new AppError('Lead not found.', 404);
    }

    lead.status = status;
    await lead.save();

    const updatedLead = await lead.populate([
      { path: 'property', select: 'title location price status' },
      { path: 'assignedTo', select: 'name email role' },
    ]);

    res.status(200).json({
      success: true,
      message: 'Lead status updated successfully.',
      data: updatedLead,
    });
  } catch (error) {
    next(error);
  }
};
