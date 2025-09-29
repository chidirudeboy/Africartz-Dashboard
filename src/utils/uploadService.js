import axios from 'axios';

const baseUrl = process.env.REACT_APP_API_BASE_URL || 'https://api.africartz.com/api';
const endpoint = (path) => `${baseUrl}/${path}`;

// Upload endpoints
const getUploadLimits = endpoint("uploads/limits");
const generateBatchPresignedUrls = endpoint("uploads/presigned-url/batch");
const verifyUploads = endpoint("uploads/verify");
const cleanupUploads = endpoint("uploads/cleanup");

export class UploadService {
    constructor(token) {
        this.token = token;
        this.uploadLimits = null;
    }

    async getUploadLimits() {
        if (this.uploadLimits) {
            return this.uploadLimits;
        }

        try {
            console.log('Fetching upload limits from:', getUploadLimits);
            const response = await axios.get(getUploadLimits, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                },
            });

            console.log('Upload limits response:', response.data);

            // Handle different possible response structures
            const data = response.data?.data || response.data;
            console.log('Upload limits data:', data);

            if (!data) {
                console.warn('No upload limits data received, using defaults');
                // Provide default upload limits as fallback
                this.uploadLimits = {
                    maxFileSizes: {
                        pictures: 50 * 1024 * 1024, // 50MB
                        videos: 1024 * 1024 * 1024, // 1GB
                        invoices: 10 * 1024 * 1024, // 10MB
                        documents: 20 * 1024 * 1024 // 20MB
                    },
                    allowedFileTypes: {
                        pictures: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
                        videos: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'],
                        invoices: ['application/pdf', 'image/jpeg', 'image/png'],
                        documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
                    },
                    batchLimits: {
                        maxFiles: 25
                    },
                    folders: ['pictures', 'videos', 'invoices', 'documents']
                };
            } else {
                this.uploadLimits = data;
            }

            console.log('Final upload limits:', this.uploadLimits);
            return this.uploadLimits;
        } catch (error) {
            console.error('Failed to get upload limits:', error.response?.data || error.message);

            // Provide default upload limits as fallback
            console.warn('Using default upload limits due to API error');
            this.uploadLimits = {
                maxFileSizes: {
                    pictures: 50 * 1024 * 1024, // 50MB
                    videos: 1024 * 1024 * 1024, // 1GB
                    invoices: 10 * 1024 * 1024, // 10MB
                    documents: 20 * 1024 * 1024 // 20MB
                },
                allowedFileTypes: {
                    pictures: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
                    videos: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'],
                    invoices: ['application/pdf', 'image/jpeg', 'image/png'],
                    documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
                },
                batchLimits: {
                    maxFiles: 25
                },
                folders: ['pictures', 'videos', 'invoices', 'documents']
            };
            return this.uploadLimits;
        }
    }

    validateFile(file, folder) {
        try {
            if (!this.uploadLimits) {
                throw new Error('Upload limits not loaded. Call getUploadLimits() first.');
            }

            if (!file) {
                return {
                    isValid: false,
                    error: 'File is undefined or null'
                };
            }

            const maxFileSizes = this.uploadLimits?.maxFileSizes;
            const allowedFileTypes = this.uploadLimits?.allowedFileTypes;

            if (!maxFileSizes || !allowedFileTypes) {
                console.error('Upload limits structure incomplete:', this.uploadLimits);
                return {
                    isValid: false,
                    error: `Upload configuration is incomplete`
                };
            }

            // Check file size
            if (file.size && maxFileSizes[folder] && file.size > maxFileSizes[folder]) {
                const maxSizeMB = Math.round(maxFileSizes[folder] / (1024 * 1024));
                return {
                    isValid: false,
                    error: `File size exceeds ${maxSizeMB}MB limit for ${folder}`
                };
            }

            // Check file type
            const mimeType = file.type || this.getMimeType(file.name, folder === 'pictures' ? 'image' : 'video');
            if (!allowedFileTypes[folder] || !Array.isArray(allowedFileTypes[folder])) {
                console.error('Upload limits structure invalid for folder:', folder, this.uploadLimits);
                return {
                    isValid: false,
                    error: `Upload configuration error for ${folder}`
                };
            }

            if (!allowedFileTypes[folder].includes(mimeType)) {
                return {
                    isValid: false,
                    error: `File type ${mimeType} is not allowed for ${folder}. Allowed types: ${allowedFileTypes[folder].join(', ')}`
                };
            }

            return { isValid: true };
        } catch (error) {
            console.error('File validation error:', error);
            return {
                isValid: false,
                error: `Validation error: ${error.message || 'Unknown error'}`
            };
        }
    }

    getMimeType(fileName, type) {
        const extension = fileName.split('.').pop()?.toLowerCase();

        if (type === 'image') {
            switch (extension) {
                case 'jpg':
                case 'jpeg': return 'image/jpeg';
                case 'png': return 'image/png';
                case 'webp': return 'image/webp';
                case 'gif': return 'image/gif';
                case 'bmp': return 'image/bmp';
                case 'tiff':
                case 'tif': return 'image/tiff';
                case 'heic': return 'image/heic';
                case 'heif': return 'image/heif';
                default: return 'image/jpeg';
            }
        } else {
            switch (extension) {
                case 'mp4': return 'video/mp4';
                case 'mov': return 'video/quicktime';
                case 'avi': return 'video/x-msvideo';
                case 'webm': return 'video/webm';
                case 'mkv': return 'video/x-matroska';
                case 'm4v': return 'video/x-m4v';
                case '3gp': return 'video/3gpp';
                case 'wmv': return 'video/x-ms-wmv';
                case 'flv': return 'video/x-flv';
                default: return 'video/mp4';
            }
        }
    }

    getFileTypeFromMimeType(mimeType, fileName) {
        if (mimeType.startsWith('image/')) {
            return 'image';
        } else if (mimeType.startsWith('video/')) {
            return 'video';
        } else {
            // Fallback to extension-based detection
            const extension = fileName.split('.').pop()?.toLowerCase();
            const videoExtensions = ['mp4', 'mov', 'avi', 'webm', 'mkv', 'm4v', '3gp', 'wmv', 'flv'];
            return videoExtensions.includes(extension || '') ? 'video' : 'image';
        }
    }

    generateFileName(originalName) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const sanitized = originalName.replace(/[^a-zA-Z0-9.-]/g, '');
        return `${timestamp}_${random}_${sanitized}`;
    }

    async generatePresignedUrls(files) {
        const requests = files.map(file => {
            const fileType = this.getFileTypeFromMimeType(file.type, file.name);
            const folder = fileType === 'image' ? 'pictures' : 'videos';
            const fileName = this.generateFileName(file.name);
            const mimeType = file.type || this.getMimeType(file.name, fileType);

            return {
                fileName,
                fileType: mimeType,
                fileSize: file.size || 0,
                folder
            };
        });

        try {
            const response = await axios.post(generateBatchPresignedUrls, {
                files: requests
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`,
                },
            });

            return response.data?.data || response.data;
        } catch (error) {
            console.error('Failed to generate presigned URLs:', error);
            throw new Error(error.response?.data?.message || 'Failed to generate upload URLs');
        }
    }

    async uploadFileToS3(file, uploadUrl, onProgress) {
        try {
            console.log('Starting S3 upload for file:', file.name);

            const response = await axios.put(uploadUrl, file, {
                headers: {
                    'Content-Type': file.type,
                },
                onUploadProgress: (progressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onProgress(progress);
                    }
                },
            });

            if (response.status !== 200) {
                throw new Error(`Upload failed with status ${response.status}`);
            }

            console.log('S3 upload completed successfully for:', file.name);
        } catch (error) {
            console.error('S3 upload failed:', error);
            throw new Error(`Upload failed: ${error.message}`);
        }
    }

    async uploadMultipleFiles(files, onProgress) {
        try {
            // Load upload limits
            await this.getUploadLimits();

            // Validate all files first
            const validationErrors = [];
            files.forEach((file, index) => {
                const fileType = this.getFileTypeFromMimeType(file.type, file.name);
                const folder = fileType === 'image' ? 'pictures' : 'videos';
                const validation = this.validateFile(file, folder);
                if (!validation.isValid) {
                    validationErrors.push(`File ${index + 1}: ${validation.error}`);
                }
            });

            if (validationErrors.length > 0) {
                throw new Error(validationErrors.join('\n'));
            }

            // Generate presigned URLs
            const presignedUrls = await this.generatePresignedUrls(files);

            // Upload files
            const uploadPromises = files.map(async (file, index) => {
                const presignedUrlData = presignedUrls[index];

                onProgress?.(index, {
                    fileIndex: index,
                    fileName: file.name,
                    progress: 0,
                    status: 'uploading'
                });

                try {
                    await this.uploadFileToS3(
                        file,
                        presignedUrlData.uploadUrl,
                        (progress) => {
                            onProgress?.(index, {
                                fileIndex: index,
                                fileName: file.name,
                                progress,
                                status: 'uploading'
                            });
                        }
                    );

                    onProgress?.(index, {
                        fileIndex: index,
                        fileName: file.name,
                        progress: 100,
                        status: 'completed',
                        finalUrl: presignedUrlData.fileUrl
                    });

                    return presignedUrlData.fileUrl;
                } catch (error) {
                    onProgress?.(index, {
                        fileIndex: index,
                        fileName: file.name,
                        progress: 0,
                        status: 'failed',
                        error: error.message
                    });

                    throw error;
                }
            });

            const uploadedUrls = await Promise.all(uploadPromises);

            // Verify uploads
            const keys = presignedUrls.map(url => url.key);
            await this.verifyUploads(keys);

            return uploadedUrls;
        } catch (error) {
            console.error('Multiple file upload failed:', error);
            throw error;
        }
    }

    async verifyUploads(keys) {
        try {
            const response = await axios.post(verifyUploads, {
                keys
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`,
                },
            });

            if (!response.data?.success) {
                throw new Error('Upload verification failed');
            }
        } catch (error) {
            console.error('Upload verification failed:', error);
            throw new Error(error.response?.data?.message || 'Upload verification failed');
        }
    }

    async cleanupFailedUploads(keys) {
        try {
            await axios.post(cleanupUploads, {
                keys
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`,
                },
            });
        } catch (error) {
            console.warn('Failed to cleanup uploads:', error);
            // Don't throw error for cleanup failures
        }
    }
}

// Utility function to create upload service instance
export const createUploadService = (token) => new UploadService(token);

// Helper function to prepare files for upload
export const prepareMediaFiles = (files) => {
    return Array.from(files).map(file => ({
        file: file,
        name: file.name,
        size: file.size,
        type: file.type,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));
};