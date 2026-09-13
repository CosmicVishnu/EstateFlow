import cron, { ScheduledTask } from 'node-cron';
import Lead from '../models/Lead';
import { logger } from '../config/logger';

export const checkStaleLeads = async (): Promise<void> => {
  try {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const staleLeads = await Lead.find({
      status: 'new',
      createdAt: { $lte: fortyEightHoursAgo },
    })
      .populate('property', 'title location')
      .populate('assignedTo', 'name email');

    if (staleLeads.length === 0) {
      logger.info('Lead reminder check: No stale leads in "new" status older than 48 hours.');
      return;
    }

    logger.warn(
      `Lead reminder alert: Found ${staleLeads.length} lead(s) in 'new' status older than 48 hours.`
    );

    staleLeads.forEach((lead) => {
      const propertyTitle = (lead.property as any)?.title || 'Unassigned';
      const assignedName = (lead.assignedTo as any)?.name || 'Unassigned';

      logger.warn(
        `[STALE LEAD ALERT] ID: ${lead._id} | Name: "${lead.name}" | Email: ${lead.email} | ` +
        `Phone: ${lead.phone} | CreatedAt: ${lead.createdAt.toISOString()} | ` +
        `Property: "${propertyTitle}" | AssignedTo: "${assignedName}"`
      );
    });
  } catch (error) {
    logger.error('Error during scheduled lead reminder check:', error);
  }
};

export const initLeadReminderCron = (): ScheduledTask => {
  // Schedule to run every day at midnight (00:00)
  const task = cron.schedule('0 0 * * *', async () => {
    logger.info('Triggering scheduled daily lead reminder cron job (midnight)...');
    await checkStaleLeads();
  });

  logger.info('Lead reminder cron job registered (schedule: 0 0 * * * - daily at midnight).');
  return task;
};

export default initLeadReminderCron;
