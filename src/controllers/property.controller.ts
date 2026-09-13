import { Request, Response, NextFunction } from 'express';
import Property from '../models/Property';
import { AppError } from '../middlewares/error.middleware';

export const createProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required to create a property.', 401);
    }

    const { title, description, price, location, status } = req.body;

    const property = await Property.create({
      title,
      description,
      price,
      location,
      status: status || 'available',
      createdBy: req.user.userId,
    });

    const populatedProperty = await property.populate('createdBy', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Property created successfully.',
      data: populatedProperty,
    });
  } catch (error) {
    next(error);
  }
};

export const getProperties = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, minPrice, maxPrice, location, search, page = 1, limit = 10 } = req.query as any;

    const filter: Record<string, any> = {};

    if (status) {
      filter.status = status;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(100, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [properties, total] = await Promise.all([
      Property.find(filter)
        .populate('createdBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Property.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: properties,
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

export const getPropertyById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const property = await Property.findById(id).populate('createdBy', 'name email role');
    if (!property) {
      throw new AppError('Property not found.', 404);
    }

    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required.', 401);
    }

    const { id } = req.params;

    const property = await Property.findById(id);
    if (!property) {
      throw new AppError('Property not found.', 404);
    }

    // Authorization check: Only creator or admin can update property
    if (
      property.createdBy.toString() !== req.user.userId &&
      req.user.role !== 'admin'
    ) {
      throw new AppError('Forbidden: You are not authorized to update this property.', 403);
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Property updated successfully.',
      data: updatedProperty,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required.', 401);
    }

    const { id } = req.params;

    const property = await Property.findById(id);
    if (!property) {
      throw new AppError('Property not found.', 404);
    }

    // Authorization check: Only creator or admin can delete property
    if (
      property.createdBy.toString() !== req.user.userId &&
      req.user.role !== 'admin'
    ) {
      throw new AppError('Forbidden: You are not authorized to delete this property.', 403);
    }

    await property.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Property deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
