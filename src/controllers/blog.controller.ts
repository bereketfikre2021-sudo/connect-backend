import { Request, Response, NextFunction } from 'express';
import * as blogService from '../services/blog.service';
import { AuthRequest } from '../types';
import { sendSuccess, sendCreated, sendNotFound, sendPaginated } from '../utils/apiResponse';
import { logActivity } from '../utils/activityLog';

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const isAdmin = !!(req as AuthRequest).admin;
    const { data, total, page, limit } = await blogService.getBlogPosts(req.query, isAdmin);
    sendPaginated(res, data, page, limit, total);
  } catch (err) { next(err); }
}

export async function getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const post = await blogService.getBlogPostBySlug(req.params.slug);
    if (!post) { sendNotFound(res, 'Blog post'); return; }
    sendSuccess(res, post);
  } catch (err) { next(err); }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const post = await blogService.getBlogPostById(req.params.id);
    if (!post) { sendNotFound(res, 'Blog post'); return; }
    sendSuccess(res, post);
  } catch (err) { next(err); }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const file = (req as any).file as Express.Multer.File | undefined;
    const data = { ...req.body };
    if (typeof data.tags === 'string') data.tags = JSON.parse(data.tags);

    const post = await blogService.createBlogPost(data, file?.buffer);
    await logActivity(post.published ? 'published' : 'created', 'blog', post.id, post.title);
    sendCreated(res, post, 'Blog post created');
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const file = (req as any).file as Express.Multer.File | undefined;
    const data = { ...req.body };
    if (typeof data.tags === 'string') data.tags = JSON.parse(data.tags);

    const post = await blogService.updateBlogPost(req.params.id, data, file?.buffer);
    const action = data.status === 'published' || data.published === true ? 'published' : 'updated';
    await logActivity(action, 'blog', post.id, post.title);
    sendSuccess(res, post, 'Blog post updated');
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await blogService.deleteBlogPost(req.params.id);
    sendSuccess(res, null, 'Blog post deleted');
  } catch (err) { next(err); }
}
