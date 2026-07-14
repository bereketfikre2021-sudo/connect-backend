import { Request, Response, NextFunction } from 'express';
import * as contactService from '../services/contact.service';
import { sendSuccess, sendCreated, sendNotFound, sendPaginated } from '../utils/apiResponse';
import { logActivity } from '../utils/activityLog';

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { data, total, page, limit } = await contactService.getLeads(req.query);
    sendPaginated(res, data, page, limit, total);
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const lead = await contactService.getLeadById(req.params.id);
    if (!lead) { sendNotFound(res, 'Lead'); return; }
    sendSuccess(res, lead);
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const lead = await contactService.createLead(req.body);
    await logActivity('created', 'lead', lead.id, lead.name);
    sendCreated(res, lead, 'Message received');
  } catch (err) { next(err); }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, notes } = req.body;
    const lead = await contactService.updateLeadStatus(req.params.id, status, notes);
    await logActivity('updated', 'lead', lead.id, lead.name);
    sendSuccess(res, lead, 'Lead updated');
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await contactService.deleteLead(req.params.id);
    sendSuccess(res, null, 'Lead deleted');
  } catch (err) { next(err); }
}

export async function getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await contactService.getLeadStats();
    sendSuccess(res, stats);
  } catch (err) { next(err); }
}
