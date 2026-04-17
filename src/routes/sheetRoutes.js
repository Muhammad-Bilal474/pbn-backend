import express from 'express';
import {
  uploadSheet,
  getAllSheets,
  getSheet,
  updateSheet,
  deleteSheet,
  assignSheetToUsers,
  makeSheetPublic,
  bulkUploadSheets,
} from '../controllers/sheetController.js';
import {
  authenticate,
  isSuperAdmin,
} from '../middleware/auth.js';
import {
  validateSheetUpload,
  handleValidationErrors,
} from '../middleware/validation.js';

const router = express.Router();

// All sheet routes require authentication
router.use(authenticate);

// Get all sheets with filters
router.get('/', getAllSheets);

// Create/Upload sheet (Bulk)
router.post('/bulk', bulkUploadSheets);

// Create/Upload sheet
router.post('/', validateSheetUpload, handleValidationErrors, uploadSheet);

// Get single sheet
router.get('/:sheetId', getSheet);

// Update sheet
router.put('/:sheetId', updateSheet);

// Delete sheet
router.delete('/:sheetId', deleteSheet);

// Super Admin routes
router.post('/:sheetId/assign-users', isSuperAdmin, assignSheetToUsers);
router.post('/:sheetId/make-public', isSuperAdmin, makeSheetPublic);

export default router;
