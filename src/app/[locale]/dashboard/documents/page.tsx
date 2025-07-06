'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Download,
  Eye,
  Search,
  Upload,
  File,
  FileImage,
  ChevronLeft,
  Calendar,
  User,
  FolderOpen,
  MoreVertical,
  Trash2,
  Archive,
  Edit3,
  X,
  CloudUpload,
  FolderPlus,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Link } from '@/i18n/routing';
import {
  firebaseDocumentService,
  FirebaseDocument,
  DocumentType,
  UploadProgress,
} from '@/services/firebaseDocumentService';
import { formatDistanceToNow } from 'date-fns';

export default function DocumentsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [documents, setDocuments] = useState<FirebaseDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<FirebaseDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<DocumentType | 'all'>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadMetadata, setUploadMetadata] = useState({
    description: '',
    tags: '',
    projectName: '',
  });
  const [storageUsage, setStorageUsage] = useState({ totalBytes: 0, documentCount: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Fetch documents on component mount
  const fetchDocuments = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const { documents: fetchedDocs } = await firebaseDocumentService.getUserDocuments(user.uid, {
        pageSize: 50,
      });
      setDocuments(fetchedDocs);
      setFilteredDocuments(fetchedDocs);

      // Fetch storage usage
      const usage = await firebaseDocumentService.getUserStorageUsage(user.uid);
      setStorageUsage(usage);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError('Failed to load documents. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user) {
      fetchDocuments();
    }
  }, [user, loading, router, fetchDocuments]);

  // Filter documents based on search and type
  useEffect(() => {
    let filtered = documents;

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((doc) => doc.type === typeFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.name.toLowerCase().includes(query) ||
          doc.projectName?.toLowerCase().includes(query) ||
          doc.description?.toLowerCase().includes(query) ||
          doc.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    setFilteredDocuments(filtered);
  }, [documents, searchQuery, typeFilter]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowUploadDialog(true);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Check if file type is supported
      const supportedTypes = [
        '.pdf',
        '.doc',
        '.docx',
        '.xls',
        '.xlsx',
        '.ppt',
        '.pptx',
        '.txt',
        '.csv',
      ];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

      if (supportedTypes.includes(fileExtension)) {
        setSelectedFile(file);
        setShowUploadDialog(true);
      } else {
        setError(`File type not supported. Please upload: ${supportedTypes.join(', ')}`);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setIsUploading(true);
    setUploadProgress(null);

    try {
      const tags = uploadMetadata.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);

      await firebaseDocumentService.uploadDocument(
        selectedFile,
        user.uid,
        user.email || '',
        user.displayName || user.email || 'Unknown',
        {
          description: uploadMetadata.description,
          tags,
          projectName: uploadMetadata.projectName || undefined,
        },
        (progress) => {
          setUploadProgress(progress);
        }
      );

      // Refresh documents list
      await fetchDocuments();

      // Reset upload state
      setShowUploadDialog(false);
      setSelectedFile(null);
      setUploadMetadata({ description: '', tags: '', projectName: '' });
      setUploadProgress(null);
    } catch (error) {
      console.error('Error uploading document:', error);
      setError('Failed to upload document. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (document: FirebaseDocument) => {
    try {
      await firebaseDocumentService.downloadDocument(document);
    } catch (error) {
      console.error('Error downloading document:', error);
      setError('Failed to download document. Please try again.');
    }
  };

  const handleDelete = async (document: FirebaseDocument) => {
    if (!document.id || !window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await firebaseDocumentService.deleteDocument(document.id, document.storagePath);
      await fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      setError('Failed to delete document. Please try again.');
    }
  };

  const handleArchive = async (document: FirebaseDocument) => {
    if (!document.id) return;

    try {
      await firebaseDocumentService.toggleArchiveDocument(document.id, !document.isArchived);
      await fetchDocuments();
    } catch (error) {
      console.error('Error archiving document:', error);
      setError('Failed to archive document. Please try again.');
    }
  };

  const getDocumentIcon = (type: DocumentType) => {
    switch (type) {
      case 'contract':
        return FileText;
      case 'proposal':
        return File;
      case 'report':
        return FileText;
      case 'invoice':
        return FileText;
      case 'presentation':
        return FileImage;
      default:
        return File;
    }
  };

  const getTypeColor = (type: DocumentType) => {
    switch (type) {
      case 'contract':
        return 'text-blue-400';
      case 'proposal':
        return 'text-green-400';
      case 'report':
        return 'text-purple-400';
      case 'invoice':
        return 'text-yellow-400';
      case 'presentation':
        return 'text-pink-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatStorageUsage = () => {
    const maxStorage = 10 * 1024 * 1024 * 1024; // 10 GB in bytes
    const percentage = (storageUsage.totalBytes / maxStorage) * 100;
    return {
      used: formatFileSize(storageUsage.totalBytes),
      total: '10 GB',
      percentage: Math.min(percentage, 100),
    };
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange mx-auto"></div>
          <p className="mt-4 text-white/60">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8 mt-20">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-white/60 hover:text-white mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Dashboard
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Documents</h1>
              <p className="text-white/60 mt-2">Access all your project documents and files</p>
            </div>

            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button className="bg-orange hover:bg-orange/90">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-white/10">
                <DialogHeader>
                  <DialogTitle className="text-white">Upload Document</DialogTitle>
                  <DialogDescription className="text-white/60">
                    Add a new document to your library
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {!selectedFile ? (
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        isDragging
                          ? 'border-orange bg-orange/10'
                          : 'border-white/20 hover:border-orange/50'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <CloudUpload
                        className={`w-12 h-12 mx-auto mb-4 ${
                          isDragging ? 'text-orange' : 'text-white/40'
                        }`}
                      />
                      <p className="text-white/80 mb-2">Drop your file here or click to browse</p>
                      <p className="text-white/40 text-sm mb-4">
                        Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV
                      </p>
                      <label htmlFor="dialog-file-upload" className="cursor-pointer">
                        <input
                          id="dialog-file-upload"
                          type="file"
                          className="hidden"
                          onChange={handleFileSelect}
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                        />
                        <Button className="bg-orange hover:bg-orange/90">Select File</Button>
                      </label>
                    </div>
                  ) : (
                    <>
                      <div className="p-4 bg-white/5 rounded-lg border border-white/10 relative">
                        <button
                          onClick={() => setSelectedFile(null)}
                          className="absolute top-2 right-2 text-white/40 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <p className="text-white font-medium">{selectedFile.name}</p>
                        <p className="text-white/60 text-sm">{formatFileSize(selectedFile.size)}</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="project" className="text-white">
                          Project Name (Optional)
                        </Label>
                        <Input
                          id="project"
                          value={uploadMetadata.projectName}
                          onChange={(e) =>
                            setUploadMetadata({ ...uploadMetadata, projectName: e.target.value })
                          }
                          placeholder="e.g., AI Transformation Initiative"
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-white">
                          Description (Optional)
                        </Label>
                        <Textarea
                          id="description"
                          value={uploadMetadata.description}
                          onChange={(e) =>
                            setUploadMetadata({ ...uploadMetadata, description: e.target.value })
                          }
                          placeholder="Brief description of the document..."
                          className="bg-white/5 border-white/10 text-white"
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tags" className="text-white">
                          Tags (Optional)
                        </Label>
                        <Input
                          id="tags"
                          value={uploadMetadata.tags}
                          onChange={(e) =>
                            setUploadMetadata({ ...uploadMetadata, tags: e.target.value })
                          }
                          placeholder="contract, legal, 2025 (comma separated)"
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>

                      {uploadProgress && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-white/60">Uploading...</span>
                            <span className="text-white">
                              {Math.round(uploadProgress.progress)}%
                            </span>
                          </div>
                          <Progress value={uploadProgress.progress} className="bg-white/10" />
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          onClick={handleUpload}
                          disabled={isUploading}
                          className="flex-1 bg-orange hover:bg-orange/90"
                        >
                          {isUploading ? 'Uploading...' : 'Upload'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowUploadDialog(false);
                            setSelectedFile(null);
                            setUploadMetadata({ description: '', tags: '', projectName: '' });
                          }}
                          disabled={isUploading}
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-500">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant={typeFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setTypeFilter('all')}
              className={typeFilter === 'all' ? 'bg-orange' : ''}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={typeFilter === 'contract' ? 'default' : 'outline'}
              onClick={() => setTypeFilter('contract')}
              className={typeFilter === 'contract' ? 'bg-orange' : ''}
              size="sm"
            >
              Contracts
            </Button>
            <Button
              variant={typeFilter === 'proposal' ? 'default' : 'outline'}
              onClick={() => setTypeFilter('proposal')}
              className={typeFilter === 'proposal' ? 'bg-orange' : ''}
              size="sm"
            >
              Proposals
            </Button>
            <Button
              variant={typeFilter === 'report' ? 'default' : 'outline'}
              onClick={() => setTypeFilter('report')}
              className={typeFilter === 'report' ? 'bg-orange' : ''}
              size="sm"
            >
              Reports
            </Button>
            <Button
              variant={typeFilter === 'invoice' ? 'default' : 'outline'}
              onClick={() => setTypeFilter('invoice')}
              className={typeFilter === 'invoice' ? 'bg-orange' : ''}
              size="sm"
            >
              Invoices
            </Button>
          </div>
        </div>

        {/* Documents List */}
        {isLoading ? (
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange mx-auto"></div>
              <p className="mt-4 text-white/60">Loading documents...</p>
            </div>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-12">
            <div className="text-center">
              {documents.length === 0 ? (
                <>
                  <div className="w-20 h-20 bg-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FolderPlus className="w-10 h-10 text-orange" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No documents yet</h3>
                  <p className="text-white/60 mb-6 max-w-md mx-auto">
                    Start building your document library by uploading your first file. Keep all your
                    important project files organized in one place.
                  </p>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                    />
                    <Button className="bg-orange hover:bg-orange/90">
                      <CloudUpload className="w-4 h-4 mr-2" />
                      Upload Your First Document
                    </Button>
                  </label>
                </>
              ) : (
                <>
                  <FileText className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60">No documents match your search criteria</p>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-white/60 font-medium">Name</th>
                    <th className="text-left p-4 text-white/60 font-medium hidden md:table-cell">
                      Project
                    </th>
                    <th className="text-left p-4 text-white/60 font-medium hidden sm:table-cell">
                      Size
                    </th>
                    <th className="text-left p-4 text-white/60 font-medium hidden lg:table-cell">
                      Uploaded
                    </th>
                    <th className="text-right p-4 text-white/60 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredDocuments.map((doc) => {
                      const Icon = getDocumentIcon(doc.type);
                      const uploadDate = doc.uploadedAt?.toDate
                        ? doc.uploadedAt.toDate()
                        : new Date();

                      return (
                        <motion.tr
                          key={doc.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              <Icon className={`w-5 h-5 ${getTypeColor(doc.type)}`} />
                              <div>
                                <p className="text-white font-medium">{doc.name}</p>
                                <Badge variant="outline" className="text-xs mt-1 md:hidden">
                                  {doc.type}
                                </Badge>
                                {doc.tags && doc.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {doc.tags.slice(0, 3).map((tag, index) => (
                                      <span
                                        key={index}
                                        className="text-xs px-2 py-0.5 bg-white/10 rounded-full text-white/60"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 hidden md:table-cell">
                            {doc.projectName ? (
                              <div className="flex items-center space-x-2">
                                <FolderOpen className="w-4 h-4 text-white/40" />
                                <span className="text-white/80">{doc.projectName}</span>
                              </div>
                            ) : (
                              <span className="text-white/40">—</span>
                            )}
                          </td>
                          <td className="p-4 hidden sm:table-cell">
                            <span className="text-white/60">{formatFileSize(doc.size)}</span>
                          </td>
                          <td className="p-4 hidden lg:table-cell">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1 text-white/60 text-sm">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDistanceToNow(uploadDate, { addSuffix: true })}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-white/40 text-xs">
                                <User className="w-3 h-3" />
                                <span>{doc.uploadedBy.name}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-white/60 hover:text-white"
                                title="View"
                                onClick={() => window.open(doc.url, '_blank')}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-white/60 hover:text-white"
                                title="Download"
                                onClick={() => handleDownload(doc)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-white/60 hover:text-white"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="bg-gray-900 border-white/10"
                                >
                                  <DropdownMenuItem
                                    onClick={() => handleArchive(doc)}
                                    className="text-white hover:bg-white/10"
                                  >
                                    <Archive className="w-4 h-4 mr-2" />
                                    {doc.isArchived ? 'Unarchive' : 'Archive'}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(doc)}
                                    className="text-red-400 hover:bg-red-500/10"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Storage Info */}
        {documents.length > 0 && (
          <div className="mt-8 p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Storage Used</p>
                <p className="text-lg font-semibold text-white">
                  {formatStorageUsage().used} / {formatStorageUsage().total}
                </p>
                <p className="text-xs text-white/40 mt-1">{storageUsage.documentCount} documents</p>
              </div>
              <div className="w-32">
                <div className="bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-orange h-full rounded-full transition-all duration-300"
                    style={{ width: `${formatStorageUsage().percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
