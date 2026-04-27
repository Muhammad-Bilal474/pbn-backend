import Sheet from '../models/Sheet.js';
import User from '../models/User.js';
import { ApiError, asyncHandler, ApiResponse } from '../utils/helpers.js';
import { VISIBILITY, ROLES } from '../utils/constants.js';

// Upload/Create Sheet
export const uploadSheet = asyncHandler(async (req, res) => {
  const { siteName, siteUrl, type, credentials, visibility, metadata } = req.body;

  const sheet = await Sheet.create({
    siteName: siteName || siteUrl,
    siteUrl,
    type: type || 'WORDPRESS',
    credentials: credentials || {},
    visibility: visibility || VISIBILITY.PRIVATE,
    createdBy: req.user._id,
    metadata: metadata || {},
  });

  res.status(201).json(
    new ApiResponse(201, sheet, 'Sheet uploaded successfully')
  );
});

// Bulk Upload Sheets
export const bulkUploadSheets = asyncHandler(async (req, res) => {
  const { sheets } = req.body; // Array of { siteUrl, username, password }

  if (!Array.isArray(sheets) || sheets.length === 0) {
    throw new ApiError(400, 'Please provide an array of sheets in the request body');
  }

  const newSheets = [];
  
  for (const sheet of sheets) {
    if (!sheet.siteUrl) continue;
    
    newSheets.push({
      siteName: sheet.siteUrl,
      siteUrl: sheet.siteUrl,
      type: 'WORDPRESS',
      visibility: VISIBILITY.PRIVATE,
      credentials: {
        username: sheet.username || '',
        password: sheet.password || ''
      },
      createdBy: req.user._id,
      metadata: {}
    });
  }

  if (newSheets.length === 0) {
    throw new ApiError(400, 'No valid sheets found to upload');
  }

  const createdSheets = await Sheet.insertMany(newSheets);

  res.status(201).json(
    new ApiResponse(201, { count: createdSheets.length }, `Successfully imported ${createdSheets.length} websites`)
  );
});


// Get all sheets (with filtering)
export const getAllSheets = asyncHandler(async (req, res) => {
  const { page = 1, limit = 100, filter = 'all' } = req.query; // Default limit higher for site selection
  const skip = (page - 1) * limit;

  let query = { isActive: true };

  if (req.user.role === ROLES.USER) {
    // Get all Super Admin IDs
    const superAdmins = await User.find({ role: ROLES.SUPER_ADMIN }).select('_id');
    const superAdminIds = superAdmins.map(u => u._id);

    // Users see their own sites OR Super Admin sites
    query = {
      $and: [
        { isActive: true },
        {
          $or: [
            { createdBy: req.user._id },
            { createdBy: { $in: superAdminIds } }
          ]
        }
      ]
    };
  } else if (req.user.role === ROLES.SUPER_ADMIN) {
    // Super Admins only see their own sites (they don't see user sites as per requirements)
    query.createdBy = req.user._id;
  }

  if (filter === 'my_sites') {
    query.createdBy = req.user._id;
  } else if (filter === 'platform') {
    query.visibility = VISIBILITY.PLATFORM;
  }

  const sheets = await Sheet.find(query)
    .skip(skip)
    .limit(Number(limit))
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  const total = await Sheet.countDocuments(query);

  res.status(200).json(
    new ApiResponse(200, {
      sheets,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    }, 'Sheets fetched successfully')
  );
});

// Get single sheet
export const getSheet = asyncHandler(async (req, res) => {
  const { sheetId } = req.params;

  const sheet = await Sheet.findById(sheetId)
    .populate('createdBy', 'name email')
    .populate('assignedTo', 'name email');

  if (!sheet) {
    throw new ApiError(404, 'Sheet not found');
  }

  res.status(200).json(
    new ApiResponse(200, sheet, 'Sheet fetched successfully')
  );
});

// Update sheet
export const updateSheet = asyncHandler(async (req, res) => {
  const { sheetId } = req.params;
  const { siteName, siteUrl, credentials, visibility, metadata } = req.body;

  const sheet = await Sheet.findById(sheetId);

  if (!sheet) {
    throw new ApiError(404, 'Sheet not found');
  }

  // Only creator or admin can update
  if (sheet.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'SUPER_ADMIN') {
    throw new ApiError(403, 'Unauthorized to update this sheet');
  }

  Object.assign(sheet, { siteName, siteUrl, credentials, visibility, metadata });
  await sheet.save();

  res.status(200).json(
    new ApiResponse(200, sheet, 'Sheet updated successfully')
  );
});

// Delete sheet
export const deleteSheet = asyncHandler(async (req, res) => {
  const { sheetId } = req.params;

  const sheet = await Sheet.findByIdAndUpdate(
    sheetId,
    { isActive: false },
    { new: true }
  );

  if (!sheet) {
    throw new ApiError(404, 'Sheet not found');
  }

  res.status(200).json(
    new ApiResponse(200, {}, 'Sheet deleted successfully')
  );
});

// Assign sheet to users
export const assignSheetToUsers = asyncHandler(async (req, res) => {
  const { sheetId } = req.params;
  const { userIds } = req.body;

  const sheet = await Sheet.findByIdAndUpdate(
    sheetId,
    { assignedTo: userIds },
    { new: true }
  ).populate('assignedTo', 'name email');

  if (!sheet) {
    throw new ApiError(404, 'Sheet not found');
  }

  res.status(200).json(
    new ApiResponse(200, sheet, 'Sheet assigned to users successfully')
  );
});

// Make sheet visible to all users (platform-wide)
export const makeSheetPublic = asyncHandler(async (req, res) => {
  const { sheetId } = req.params;

  const sheet = await Sheet.findByIdAndUpdate(
    sheetId,
    { visibility: VISIBILITY.PLATFORM },
    { new: true }
  );

  if (!sheet) {
    throw new ApiError(404, 'Sheet not found');
  }

  res.status(200).json(
    new ApiResponse(200, sheet, 'Sheet is now visible to all users')
  );
});
