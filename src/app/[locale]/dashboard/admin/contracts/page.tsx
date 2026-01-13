'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';
import {
  FileSignature,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Send,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from '@/i18n/routing';
import { contractService } from '@/services/contractService';
import type { Contract, ContractStatus, ContractType } from '@/types';
import toast from 'react-hot-toast';

const statusConfig: Record<ContractStatus, { color: string; label: string; icon: any }> = {
  draft: { color: 'bg-gray-500', label: 'Concept', icon: FileText },
  pending_review: { color: 'bg-yellow-500', label: 'Ter beoordeling', icon: Clock },
  sent: { color: 'bg-blue-500', label: 'Verzonden', icon: Send },
  viewed: { color: 'bg-blue-400', label: 'Bekeken', icon: Eye },
  signed: { color: 'bg-green-500', label: 'Ondertekend', icon: CheckCircle },
  active: { color: 'bg-green-600', label: 'Actief', icon: CheckCircle },
  expired: { color: 'bg-red-500', label: 'Verlopen', icon: AlertTriangle },
  terminated: { color: 'bg-red-600', label: 'Beëindigd', icon: AlertTriangle },
  cancelled: { color: 'bg-gray-500', label: 'Geannuleerd', icon: FileText },
};

const typeLabels: Record<ContractType, string> = {
  service_agreement: 'Service Agreement',
  nda: 'NDA',
  sow: 'Statement of Work',
  master_agreement: 'Master Agreement',
  amendment: 'Amendement',
  renewal: 'Vernieuwing',
};

export default function AdminContractsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    const unsubscribe = contractService.subscribeToContracts((fetchedContracts) => {
      setContracts(fetchedContracts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Filter contracts
  const filteredContracts = contracts.filter((contract) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !contract.contractNumber.toLowerCase().includes(query) &&
        !contract.title.toLowerCase().includes(query) &&
        !contract.clientName?.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    if (statusFilter !== 'all' && contract.status !== statusFilter) {
      return false;
    }
    if (typeFilter !== 'all' && contract.type !== typeFilter) {
      return false;
    }
    return true;
  });

  // Stats
  const stats = {
    total: contracts.length,
    active: contracts.filter((c) => c.status === 'active').length,
    pending: contracts.filter((c) => c.status === 'sent').length,
    expiringSoon: contracts.filter((c) => {
      if (!c.dates?.expirationDate) return false;
      const daysUntilExpiry = Math.ceil(
        (new Date(c.dates.expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
    }).length,
  };

  const handleDeleteContract = async (contractId: string) => {
    if (!confirm('Weet je zeker dat je dit contract wilt verwijderen?')) return;
    try {
      await contractService.deleteContract(contractId);
      toast.success('Contract verwijderd');
    } catch (error) {
      toast.error('Kon contract niet verwijderen');
    }
  };

  const handleSendContract = async (contractId: string) => {
    if (!user) return;
    try {
      await contractService.sendContract(contractId, user.uid);
      toast.success('Contract verzonden');
    } catch (error) {
      toast.error('Kon contract niet verzenden');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-orange" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#080D14' }}>
      <div className="container mx-auto px-4 py-8 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white">Contracten</h1>
              <p className="text-white/60 mt-1">Beheer contracten en overeenkomsten</p>
            </div>
            <div className="flex gap-2">
              <Link href="/dashboard/admin/contracts/templates">
                <Button variant="outline" className="border-white/20">
                  <FileText className="w-4 h-4 mr-2" />
                  Templates
                </Button>
              </Link>
              <Link href="/dashboard/admin/contracts/new">
                <Button className="bg-orange hover:bg-orange/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Nieuw contract
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-white/[0.02] border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Totaal</p>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <FileSignature className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/[0.02] border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Actief</p>
                    <p className="text-2xl font-bold text-green-400">{stats.active}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/[0.02] border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">In afwachting</p>
                    <p className="text-2xl font-bold text-orange">{stats.pending}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-orange/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/[0.02] border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">Verloopt binnenkort</p>
                    <p className="text-2xl font-bold text-red-400">{stats.expiringSoon}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                placeholder="Zoek contracten..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 bg-white/5 border-white/10 text-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle statussen</SelectItem>
                <SelectItem value="draft">Concept</SelectItem>
                <SelectItem value="sent">Verzonden</SelectItem>
                <SelectItem value="signed">Ondertekend</SelectItem>
                <SelectItem value="active">Actief</SelectItem>
                <SelectItem value="expired">Verlopen</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle types</SelectItem>
                <SelectItem value="service_agreement">Service Agreement</SelectItem>
                <SelectItem value="nda">NDA</SelectItem>
                <SelectItem value="sow">Statement of Work</SelectItem>
                <SelectItem value="master_agreement">Master Agreement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Contracts Table */}
          {filteredContracts.length === 0 ? (
            <Card className="bg-white/[0.02] border-white/10">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileSignature className="w-12 h-12 text-white/20 mb-4" />
                <p className="text-white/60 text-lg">Geen contracten gevonden</p>
                <Link href="/dashboard/admin/contracts/new" className="mt-4">
                  <Button className="bg-orange hover:bg-orange/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Nieuw contract aanmaken
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white/[0.02] border-white/10">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-4 text-white/60 font-medium">Contract</th>
                      <th className="text-left p-4 text-white/60 font-medium">Klant</th>
                      <th className="text-left p-4 text-white/60 font-medium">Type</th>
                      <th className="text-left p-4 text-white/60 font-medium">Status</th>
                      <th className="text-left p-4 text-white/60 font-medium">Vervaldatum</th>
                      <th className="text-right p-4 text-white/60 font-medium">Acties</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContracts.map((contract) => {
                      const status = statusConfig[contract.status] || statusConfig.draft;
                      const StatusIcon = status.icon;

                      return (
                        <tr key={contract.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                          <td className="p-4">
                            <div>
                              <p className="text-white font-medium">{contract.title}</p>
                              <p className="text-white/60 text-sm">{contract.contractNumber}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-white/80">{contract.clientName || '-'}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-white/60">{typeLabels[contract.type]}</span>
                          </td>
                          <td className="p-4">
                            <Badge className={`${status.color} text-white`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.label}
                            </Badge>
                          </td>
                          <td className="p-4">
                            {contract.dates?.expirationDate ? (
                              <span className="text-white/60">
                                {format(new Date(contract.dates.expirationDate), 'dd MMM yyyy', { locale: nl })}
                              </span>
                            ) : (
                              <span className="text-white/40">-</span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`/dashboard/admin/contracts/${contract.id}`}>
                                <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </Link>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <Link href={`/dashboard/admin/contracts/${contract.id}/edit`}>
                                    <DropdownMenuItem>
                                      <Edit className="w-4 h-4 mr-2" />
                                      Bewerken
                                    </DropdownMenuItem>
                                  </Link>
                                  {contract.status === 'draft' && (
                                    <DropdownMenuItem onClick={() => handleSendContract(contract.id)}>
                                      <Send className="w-4 h-4 mr-2" />
                                      Verzenden
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteContract(contract.id)}
                                    className="text-red-500"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Verwijderen
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
