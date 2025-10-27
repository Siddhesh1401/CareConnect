import { AuditLog } from '../models/AuditLog.js';
import { Request } from 'express';

interface LogAuditParams {
  action: string;
  performedBy: string;
  targetType: 'api_key' | 'access_request';
  targetId: string;
  targetName: string;
  details?: any;
  req?: Request;
}

export const logAudit = async ({
  action,
  performedBy,
  targetType,
  targetId,
  targetName,
  details,
  req
}: LogAuditParams) => {
  try {
    await AuditLog.create({
      action,
      performedBy,
      targetType,
      targetId,
      targetName,
      details,
      ipAddress: req?.ip || req?.headers['x-forwarded-for'] as string || 'unknown',
      userAgent: req?.get('user-agent') || 'unknown'
    });
  } catch (error) {
    console.error('Error logging audit:', error);
    // Don't throw - audit logging should not break the main operation
  }
};

// Helper functions for common actions
export const auditLogger = {
  generateKey: (userId: string, keyId: string, keyName: string, req?: Request) =>
    logAudit({
      action: 'generate_key',
      performedBy: userId,
      targetType: 'api_key',
      targetId: keyId,
      targetName: keyName,
      req
    }),

  revokeKey: (userId: string, keyId: string, keyName: string, req?: Request) =>
    logAudit({
      action: 'revoke_key',
      performedBy: userId,
      targetType: 'api_key',
      targetId: keyId,
      targetName: keyName,
      req
    }),

  editKey: (userId: string, keyId: string, keyName: string, changes: any, req?: Request) =>
    logAudit({
      action: 'edit_key',
      performedBy: userId,
      targetType: 'api_key',
      targetId: keyId,
      targetName: keyName,
      details: { changes },
      req
    }),

  pauseKey: (userId: string, keyId: string, keyName: string, req?: Request) =>
    logAudit({
      action: 'pause_key',
      performedBy: userId,
      targetType: 'api_key',
      targetId: keyId,
      targetName: keyName,
      req
    }),

  resumeKey: (userId: string, keyId: string, keyName: string, req?: Request) =>
    logAudit({
      action: 'resume_key',
      performedBy: userId,
      targetType: 'api_key',
      targetId: keyId,
      targetName: keyName,
      req
    }),

  approveRequest: (userId: string, requestId: string, organization: string, req?: Request) =>
    logAudit({
      action: 'approve_request',
      performedBy: userId,
      targetType: 'access_request',
      targetId: requestId,
      targetName: organization,
      req
    }),

  rejectRequest: (userId: string, requestId: string, organization: string, reason: string, req?: Request) =>
    logAudit({
      action: 'reject_request',
      performedBy: userId,
      targetType: 'access_request',
      targetId: requestId,
      targetName: organization,
      details: { reason },
      req
    }),

  bulkRevokeKeys: (userId: string, keyIds: string[], count: number, req?: Request) =>
    logAudit({
      action: 'bulk_revoke_keys',
      performedBy: userId,
      targetType: 'api_key',
      targetId: keyIds.join(','),
      targetName: `${count} API keys`,
      details: { keyIds, count },
      req
    }),

  bulkApproveRequests: (userId: string, requestIds: string[], count: number, req?: Request) =>
    logAudit({
      action: 'bulk_approve_requests',
      performedBy: userId,
      targetType: 'access_request',
      targetId: requestIds.join(','),
      targetName: `${count} access requests`,
      details: { requestIds, count },
      req
    }),

  bulkRejectRequests: (userId: string, requestIds: string[], count: number, reason: string, req?: Request) =>
    logAudit({
      action: 'bulk_reject_requests',
      performedBy: userId,
      targetType: 'access_request',
      targetId: requestIds.join(','),
      targetName: `${count} access requests`,
      details: { requestIds, count, reason },
      req
    })
};
