'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import {
  collection,
  query,
  getDocs,
  doc,
  deleteDoc,
  limit,
  orderBy,
  where,
  getDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  Database,
  HardDrive,
  FileText,
  Users,
  Briefcase,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  ChevronRight,
  Code,
  Copy,
  ExternalLink,
  BarChart3,
  XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

interface CollectionStats {
  name: string;
  documentCount: number;
  sizeInBytes: number;
  lastModified: Date;
  indexes: number;
}

interface BackupInfo {
  id: string;
  name: string;
  date: Date;
  size: number;
  collections: string[];
  status: 'completed' | 'failed' | 'in_progress';
}

interface QueryResult {
  collection: string;
  documents: any[];
  executionTime: number;
  documentsScanned: number;
}

const mockCollections: CollectionStats[] = [
  {
    name: 'users',
    documentCount: 1234,
    sizeInBytes: 5242880,
    lastModified: new Date('2024-01-15'),
    indexes: 3,
  },
  {
    name: 'projects',
    documentCount: 156,
    sizeInBytes: 2097152,
    lastModified: new Date('2024-01-14'),
    indexes: 5,
  },
  {
    name: 'quotes',
    documentCount: 342,
    sizeInBytes: 1572864,
    lastModified: new Date('2024-01-14'),
    indexes: 4,
  },
  {
    name: 'activity_logs',
    documentCount: 8756,
    sizeInBytes: 10485760,
    lastModified: new Date('2024-01-15'),
    indexes: 2,
  },
  {
    name: 'notifications',
    documentCount: 4521,
    sizeInBytes: 3145728,
    lastModified: new Date('2024-01-15'),
    indexes: 3,
  },
];

const mockBackups: BackupInfo[] = [
  {
    id: '1',
    name: 'Full Backup - January 2024',
    date: new Date('2024-01-01'),
    size: 52428800,
    collections: ['users', 'projects', 'quotes', 'activity_logs'],
    status: 'completed',
  },
  {
    id: '2',
    name: 'Weekly Backup - Week 2',
    date: new Date('2024-01-08'),
    size: 31457280,
    collections: ['users', 'projects', 'quotes'],
    status: 'completed',
  },
];

export default function AdminDatabasePage() {
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();
  const [collections, setCollections] = useState<CollectionStats[]>(mockCollections);
  const [backups, setBackups] = useState<BackupInfo[]>(mockBackups);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [queryText, setQueryText] = useState('');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [isQueryDialogOpen, setIsQueryDialogOpen] = useState(false);
  const [isBackupDialogOpen, setIsBackupDialogOpen] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    readLatency: 12,
    writeLatency: 18,
    cacheHitRate: 87,
    activeConnections: 24,
  });

  // Redirect if not admin
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/dashboard');
    }
  }, [user, isAdmin, loading, router]);

  // Calculate total database size
  const totalSize = collections.reduce((sum, col) => sum + col.sizeInBytes, 0);
  const totalDocuments = collections.reduce((sum, col) => sum + col.documentCount, 0);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const exportCollection = async (collectionName: string) => {
    try {
      setIsLoading(true);
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);
      
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${collectionName}-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting collection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runQuery = () => {
    // Simulate query execution
    const startTime = Date.now();
    
    // Mock query result
    setQueryResult({
      collection: selectedCollection,
      documents: [
        { id: '1', name: 'Sample Document 1', createdAt: new Date() },
        { id: '2', name: 'Sample Document 2', createdAt: new Date() },
      ],
      executionTime: Date.now() - startTime,
      documentsScanned: 2,
    });
  };

  const createBackup = () => {
    const newBackup: BackupInfo = {
      id: Date.now().toString(),
      name: `Manual Backup - ${format(new Date(), 'yyyy-MM-dd HH:mm')}`,
      date: new Date(),
      size: totalSize,
      collections: collections.map(c => c.name),
      status: 'in_progress',
    };
    
    setBackups([newBackup, ...backups]);
    
    // Simulate backup completion
    setTimeout(() => {
      setBackups(prev => 
        prev.map(b => b.id === newBackup.id ? { ...b, status: 'completed' } : b)
      );
    }, 3000);
  };

  const deleteBackup = (backupId: string) => {
    setBackups(backups.filter(b => b.id !== backupId));
  };

  const optimizeDatabase = () => {
    setIsLoading(true);
    // Simulate optimization
    setTimeout(() => {
      setIsLoading(false);
      // Update performance metrics
      setPerformanceMetrics({
        readLatency: 10,
        writeLatency: 15,
        cacheHitRate: 92,
        activeConnections: 20,
      });
    }, 2000);
  };

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-orange mx-auto" />
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
          <h1 className="text-3xl font-bold text-white mb-2">Database Management</h1>
          <p className="text-white/60">Monitor and manage your Firestore database</p>
        </div>

        {/* Database Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60">Total Size</span>
                <HardDrive className="w-5 h-5 text-white/40" />
              </div>
              <p className="text-2xl font-bold text-white">{formatBytes(totalSize)}</p>
              <Progress value={(totalSize / 104857600) * 100} className="mt-2 h-2" />
              <p className="text-xs text-white/60 mt-1">of 100 MB</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60">Documents</span>
                <FileText className="w-5 h-5 text-white/40" />
              </div>
              <p className="text-2xl font-bold text-white">{totalDocuments.toLocaleString()}</p>
              <p className="text-sm text-green-500 mt-2">↑ 12% this week</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60">Collections</span>
                <Database className="w-5 h-5 text-white/40" />
              </div>
              <p className="text-2xl font-bold text-white">{collections.length}</p>
              <p className="text-sm text-white/60 mt-2">Active collections</p>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60">Last Backup</span>
                <Clock className="w-5 h-5 text-white/40" />
              </div>
              <p className="text-xl font-bold text-white">2 days ago</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 w-full"
                onClick={() => setIsBackupDialogOpen(true)}
              >
                <Download className="w-3 h-3 mr-1" />
                Backup Now
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card className="bg-white/5 border-white/10 mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white">Performance Metrics</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={optimizeDatabase}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4 mr-2" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Optimize
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60">Read Latency</span>
                  <Activity className="w-4 h-4 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-white">{performanceMetrics.readLatency}ms</p>
                <p className="text-sm text-green-500">Good</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60">Write Latency</span>
                  <Activity className="w-4 h-4 text-yellow-500" />
                </div>
                <p className="text-2xl font-bold text-white">{performanceMetrics.writeLatency}ms</p>
                <p className="text-sm text-yellow-500">Average</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60">Cache Hit Rate</span>
                  <BarChart3 className="w-4 h-4 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-white">{performanceMetrics.cacheHitRate}%</p>
                <p className="text-sm text-blue-500">Excellent</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60">Active Connections</span>
                  <Users className="w-4 h-4 text-purple-500" />
                </div>
                <p className="text-2xl font-bold text-white">{performanceMetrics.activeConnections}</p>
                <p className="text-sm text-purple-500">Normal</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Database Tools */}
        <Tabs defaultValue="collections" className="space-y-6">
          <TabsList className="bg-white/5 border-white/10">
            <TabsTrigger value="collections">Collections</TabsTrigger>
            <TabsTrigger value="query">Query Builder</TabsTrigger>
            <TabsTrigger value="backups">Backups</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>

          {/* Collections Tab */}
          <TabsContent value="collections">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Collections Overview</CardTitle>
                <CardDescription className="text-white/60">
                  Browse and manage your database collections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead className="text-white/60">Collection</TableHead>
                      <TableHead className="text-white/60">Documents</TableHead>
                      <TableHead className="text-white/60">Size</TableHead>
                      <TableHead className="text-white/60">Indexes</TableHead>
                      <TableHead className="text-white/60">Last Modified</TableHead>
                      <TableHead className="text-right text-white/60">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {collections.map((collection) => (
                      <TableRow key={collection.name} className="border-white/10">
                        <TableCell className="font-medium text-white">
                          <div className="flex items-center gap-2">
                            <Database className="w-4 h-4 text-white/40" />
                            {collection.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-white/80">
                          {collection.documentCount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-white/80">
                          {formatBytes(collection.sizeInBytes)}
                        </TableCell>
                        <TableCell className="text-white/80">
                          {collection.indexes}
                        </TableCell>
                        <TableCell className="text-white/80">
                          {format(collection.lastModified, 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedCollection(collection.name);
                                setIsQueryDialogOpen(true);
                              }}
                            >
                              <Code className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => exportCollection(collection.name)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Query Builder Tab */}
          <TabsContent value="query">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Query Builder</CardTitle>
                <CardDescription className="text-white/60">
                  Build and execute queries on your collections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-white/80">Collection</label>
                  <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                    <SelectTrigger className="mt-1 bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select collection" />
                    </SelectTrigger>
                    <SelectContent>
                      {collections.map((col) => (
                        <SelectItem key={col.name} value={col.name}>
                          {col.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-white/80">Query</label>
                  <Textarea
                    value={queryText}
                    onChange={(e) => setQueryText(e.target.value)}
                    placeholder="where('status', '==', 'active').limit(10)"
                    className="mt-1 bg-white/5 border-white/10 text-white font-mono"
                    rows={4}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-sm text-white/60">
                    Query will be executed on the <strong>{selectedCollection || 'selected'}</strong> collection
                  </p>
                  <Button
                    onClick={runQuery}
                    disabled={!selectedCollection || !queryText}
                    className="bg-orange hover:bg-orange/90"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Run Query
                  </Button>
                </div>

                {queryResult && (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-medium">Query Results</h4>
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <span>Execution time: {queryResult.executionTime}ms</span>
                        <span>Documents: {queryResult.documentsScanned}</span>
                      </div>
                    </div>
                    <div className="bg-black/50 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-white/80 text-sm">
                        {JSON.stringify(queryResult.documents, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Backups Tab */}
          <TabsContent value="backups">
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white">Backup Management</CardTitle>
                    <CardDescription className="text-white/60">
                      Create and restore database backups
                    </CardDescription>
                  </div>
                  <Button onClick={createBackup} className="bg-orange hover:bg-orange/90">
                    <Upload className="w-4 h-4 mr-2" />
                    Create Backup
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {backups.map((backup) => (
                    <div
                      key={backup.id}
                      className="p-4 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-white">{backup.name}</h4>
                          <div className="flex items-center gap-4 mt-2 text-sm text-white/60">
                            <span>{format(backup.date, 'MMM d, yyyy HH:mm')}</span>
                            <span>{formatBytes(backup.size)}</span>
                            <span>{backup.collections.length} collections</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={
                              backup.status === 'completed'
                                ? 'text-green-500 border-green-500/30'
                                : backup.status === 'failed'
                                ? 'text-red-500 border-red-500/30'
                                : 'text-yellow-500 border-yellow-500/30'
                            }
                          >
                            {backup.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {backup.status === 'failed' && <XCircle className="w-3 h-3 mr-1" />}
                            {backup.status === 'in_progress' && <Loader2 className="animate-spin w-3 h-3 mr-1" />}
                            {backup.status}
                          </Badge>
                          {backup.status === 'completed' && (
                            <>
                              <Button size="sm" variant="ghost">
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteBackup(backup.id)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Maintenance Tab */}
          <TabsContent value="maintenance">
            <div className="space-y-6">
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Database Maintenance</CardTitle>
                  <CardDescription className="text-white/60">
                    Perform maintenance tasks and optimizations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert className="bg-blue-500/10 border-blue-500/30">
                    <AlertCircle className="w-4 h-4 text-blue-500" />
                    <AlertDescription className="text-white">
                      Regular maintenance helps keep your database running smoothly and efficiently.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-white/5 border-white/10">
                      <CardContent className="p-6">
                        <h4 className="font-medium text-white mb-2">Clean Up Old Data</h4>
                        <p className="text-sm text-white/60 mb-4">
                          Remove data older than 90 days from activity logs and notifications
                        </p>
                        <Button variant="outline" className="w-full">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Clean Up
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/5 border-white/10">
                      <CardContent className="p-6">
                        <h4 className="font-medium text-white mb-2">Rebuild Indexes</h4>
                        <p className="text-sm text-white/60 mb-4">
                          Optimize query performance by rebuilding database indexes
                        </p>
                        <Button variant="outline" className="w-full">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Rebuild
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/5 border-white/10">
                      <CardContent className="p-6">
                        <h4 className="font-medium text-white mb-2">Export All Data</h4>
                        <p className="text-sm text-white/60 mb-4">
                          Export entire database for archival or migration purposes
                        </p>
                        <Button variant="outline" className="w-full">
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/5 border-white/10">
                      <CardContent className="p-6">
                        <h4 className="font-medium text-white mb-2">Verify Integrity</h4>
                        <p className="text-sm text-white/60 mb-4">
                          Check database integrity and fix any inconsistencies
                        </p>
                        <Button variant="outline" className="w-full">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Verify
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Query Dialog */}
        <Dialog open={isQueryDialogOpen} onOpenChange={setIsQueryDialogOpen}>
          <DialogContent className="bg-black/95 border-white/20 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Browse {selectedCollection} Collection</DialogTitle>
              <DialogDescription className="text-white/60">
                View sample documents from the collection
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 bg-black/50 p-4 rounded-lg overflow-x-auto max-h-96">
              <pre className="text-white/80 text-sm">
                {JSON.stringify(
                  [
                    { id: '1', name: 'Sample Document', createdAt: new Date() },
                    { id: '2', name: 'Another Document', status: 'active' },
                  ],
                  null,
                  2
                )}
              </pre>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setIsQueryDialogOpen(false)}>
                Close
              </Button>
              <Button onClick={() => exportCollection(selectedCollection)} className="bg-orange hover:bg-orange/90">
                <Download className="w-4 h-4 mr-2" />
                Export Collection
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}