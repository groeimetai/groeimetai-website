'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db, collections } from '@/lib/firebase/config';
import { Invoice } from '@/types';
import { companySettingsService } from '@/services/companySettingsService';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  FileText,
  Download,
  Calendar,
  Loader2,
  BarChart3,
  PiggyBank,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Interface for invoice with client info
interface InvoiceWithClient extends Invoice {
  clientName?: string;
  clientEmail?: string;
}

// Aging category interface
interface AgingCategory {
  label: string;
  range: string;
  count: number;
  total: number;
  invoices: InvoiceWithClient[];
}

export default function InvoiceReportsPage() {
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();
  const [invoices, setInvoices] = useState<InvoiceWithClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Report filters
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedQuarter, setSelectedQuarter] = useState(Math.ceil((new Date().getMonth() + 1) / 3));
  const [reportType, setReportType] = useState<'btw' | 'revenue' | 'aging'>('btw');

  // Redirect if not admin
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/dashboard');
    }
  }, [user, isAdmin, loading, router]);

  // Fetch invoices
  useEffect(() => {
    const fetchInvoices = async () => {
      if (!user || !isAdmin) return;

      try {
        setIsLoading(true);
        const invoicesRef = collection(db, collections.invoices);
        const q = query(invoicesRef);
        const snapshot = await getDocs(q);

        const invoiceData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            issueDate: data.issueDate?.toDate?.() || new Date(data.issueDate),
            dueDate: data.dueDate?.toDate?.() || new Date(data.dueDate),
            paidDate: data.paidDate?.toDate?.() || (data.paidDate ? new Date(data.paidDate) : undefined),
            createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
            updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
          } as InvoiceWithClient;
        });

        setInvoices(invoiceData);
      } catch (error) {
        console.error('Error fetching invoices:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, [user, isAdmin]);

  // Get quarter date range
  const getQuarterDates = (year: number, quarter: number) => {
    const startMonth = (quarter - 1) * 3;
    const start = new Date(year, startMonth, 1);
    const end = new Date(year, startMonth + 3, 0, 23, 59, 59);
    return { start, end };
  };

  // Format currency in Dutch
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  // Format date in Dutch
  const formatDateDutch = (date: Date) => {
    return companySettingsService.formatDateDutch(date);
  };

  // BTW Report data
  const btwReport = useMemo(() => {
    const { start, end } = getQuarterDates(selectedYear, selectedQuarter);

    const quarterInvoices = invoices.filter((inv) => {
      const issueDate = new Date(inv.issueDate);
      return issueDate >= start && issueDate <= end && inv.status !== 'cancelled';
    });

    const totalRevenue = quarterInvoices.reduce((sum, inv) => sum + (inv.financial?.total || 0), 0);
    const totalTax = quarterInvoices.reduce((sum, inv) => sum + (inv.financial?.tax || 0), 0);
    const totalSubtotal = quarterInvoices.reduce((sum, inv) => sum + (inv.financial?.subtotal || 0), 0);
    const totalPaid = quarterInvoices.filter((inv) => inv.status === 'paid').reduce((sum, inv) => sum + (inv.financial?.total || 0), 0);
    const totalOutstanding = quarterInvoices.filter((inv) => inv.status !== 'paid' && inv.status !== 'cancelled').reduce((sum, inv) => sum + (inv.financial?.balance || inv.financial?.total || 0), 0);

    return {
      invoices: quarterInvoices,
      totalRevenue,
      totalTax,
      totalSubtotal,
      totalPaid,
      totalOutstanding,
      invoiceCount: quarterInvoices.length,
      paidCount: quarterInvoices.filter((inv) => inv.status === 'paid').length,
    };
  }, [invoices, selectedYear, selectedQuarter]);

  // Revenue Report by period
  const revenueReport = useMemo(() => {
    const months = [];
    for (let m = 0; m < 12; m++) {
      const start = new Date(selectedYear, m, 1);
      const end = new Date(selectedYear, m + 1, 0, 23, 59, 59);

      const monthInvoices = invoices.filter((inv) => {
        const issueDate = new Date(inv.issueDate);
        return issueDate >= start && issueDate <= end && inv.status !== 'cancelled';
      });

      const revenue = monthInvoices.reduce((sum, inv) => sum + (inv.financial?.total || 0), 0);
      const paid = monthInvoices.filter((inv) => inv.status === 'paid').reduce((sum, inv) => sum + (inv.financial?.total || 0), 0);

      months.push({
        month: start.toLocaleDateString('nl-NL', { month: 'long' }),
        invoiceCount: monthInvoices.length,
        revenue,
        paid,
        outstanding: revenue - paid,
      });
    }
    return months;
  }, [invoices, selectedYear]);

  // Aging Report
  const agingReport = useMemo(() => {
    const today = new Date();
    const outstandingInvoices = invoices.filter(
      (inv) => inv.status !== 'paid' && inv.status !== 'cancelled' && inv.status !== 'draft'
    );

    const categories: AgingCategory[] = [
      { label: 'Actueel', range: 'Niet vervallen', count: 0, total: 0, invoices: [] },
      { label: '1-30 dagen', range: '1-30 dagen te laat', count: 0, total: 0, invoices: [] },
      { label: '31-60 dagen', range: '31-60 dagen te laat', count: 0, total: 0, invoices: [] },
      { label: '61-90 dagen', range: '61-90 dagen te laat', count: 0, total: 0, invoices: [] },
      { label: '90+ dagen', range: 'Meer dan 90 dagen te laat', count: 0, total: 0, invoices: [] },
    ];

    outstandingInvoices.forEach((inv) => {
      const dueDate = new Date(inv.dueDate);
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      const balance = inv.financial?.balance || inv.financial?.total || 0;

      let categoryIndex = 0;
      if (daysOverdue <= 0) {
        categoryIndex = 0;
      } else if (daysOverdue <= 30) {
        categoryIndex = 1;
      } else if (daysOverdue <= 60) {
        categoryIndex = 2;
      } else if (daysOverdue <= 90) {
        categoryIndex = 3;
      } else {
        categoryIndex = 4;
      }

      categories[categoryIndex].count++;
      categories[categoryIndex].total += balance;
      categories[categoryIndex].invoices.push(inv);
    });

    const totalOutstanding = categories.reduce((sum, cat) => sum + cat.total, 0);

    return { categories, totalOutstanding };
  }, [invoices]);

  // Export to CSV
  const exportToCSV = (type: 'btw' | 'revenue' | 'aging') => {
    let csvContent = '';
    let filename = '';

    if (type === 'btw') {
      csvContent = 'Factuurnummer,Klant,Datum,Subtotaal,BTW,Totaal,Status\n';
      btwReport.invoices.forEach((inv) => {
        csvContent += `${inv.invoiceNumber},"${inv.clientName || ''}",${formatDateDutch(new Date(inv.issueDate))},${inv.financial?.subtotal || 0},${inv.financial?.tax || 0},${inv.financial?.total || 0},${inv.status}\n`;
      });
      filename = `btw-rapport-${selectedYear}-Q${selectedQuarter}.csv`;
    } else if (type === 'revenue') {
      csvContent = 'Maand,Aantal facturen,Omzet,Betaald,Openstaand\n';
      revenueReport.forEach((month) => {
        csvContent += `${month.month},${month.invoiceCount},${month.revenue},${month.paid},${month.outstanding}\n`;
      });
      filename = `omzet-rapport-${selectedYear}.csv`;
    } else {
      csvContent = 'Categorie,Aantal,Totaal\n';
      agingReport.categories.forEach((cat) => {
        csvContent += `${cat.label},${cat.count},${cat.total}\n`;
      });
      filename = `debiteuren-ouderdom-${new Date().toISOString().split('T')[0]}.csv`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  // Available years (current year and 2 years back)
  const availableYears = [
    new Date().getFullYear(),
    new Date().getFullYear() - 1,
    new Date().getFullYear() - 2,
  ];

  if (loading || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-orange" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black">
      <div className="container mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/admin/invoices')}
              className="text-white/60 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Terug naar facturen
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Facturenrapportages</h1>
          <p className="text-white/60">BTW-overzicht, omzet en debiteuren-ouderdom</p>
        </div>

        {/* Report Type Selector */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button
            variant={reportType === 'btw' ? 'default' : 'outline'}
            onClick={() => setReportType('btw')}
            className={reportType === 'btw' ? 'bg-orange hover:bg-orange/90' : ''}
          >
            <PiggyBank className="w-4 h-4 mr-2" />
            BTW Overzicht
          </Button>
          <Button
            variant={reportType === 'revenue' ? 'default' : 'outline'}
            onClick={() => setReportType('revenue')}
            className={reportType === 'revenue' ? 'bg-orange hover:bg-orange/90' : ''}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Omzet per maand
          </Button>
          <Button
            variant={reportType === 'aging' ? 'default' : 'outline'}
            onClick={() => setReportType('aging')}
            className={reportType === 'aging' ? 'bg-orange hover:bg-orange/90' : ''}
          >
            <Clock className="w-4 h-4 mr-2" />
            Debiteuren-ouderdom
          </Button>
        </div>

        {isLoading ? (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-12 flex items-center justify-center">
              <Loader2 className="animate-spin h-8 w-8 text-orange" />
            </CardContent>
          </Card>
        ) : (
          <>
            {/* BTW Report */}
            {reportType === 'btw' && (
              <div className="space-y-6">
                {/* Filters */}
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-white/60" />
                        <span className="text-white/60">Periode:</span>
                      </div>
                      <Select
                        value={selectedYear.toString()}
                        onValueChange={(v) => setSelectedYear(parseInt(v))}
                      >
                        <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableYears.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={selectedQuarter.toString()}
                        onValueChange={(v) => setSelectedQuarter(parseInt(v))}
                      >
                        <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Q1 (jan-mrt)</SelectItem>
                          <SelectItem value="2">Q2 (apr-jun)</SelectItem>
                          <SelectItem value="3">Q3 (jul-sep)</SelectItem>
                          <SelectItem value="4">Q4 (okt-dec)</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportToCSV('btw')}
                        className="ml-auto"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                      <p className="text-white/60 text-sm">Totaal omzet (incl. BTW)</p>
                      <p className="text-2xl font-bold text-white">{formatCurrency(btwReport.totalRevenue)}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                      <p className="text-white/60 text-sm">Netto omzet (excl. BTW)</p>
                      <p className="text-2xl font-bold text-white">{formatCurrency(btwReport.totalSubtotal)}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-orange/20 border-orange/30">
                    <CardContent className="p-4">
                      <p className="text-orange text-sm">Af te dragen BTW</p>
                      <p className="text-2xl font-bold text-orange">{formatCurrency(btwReport.totalTax)}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                      <p className="text-white/60 text-sm">Aantal facturen</p>
                      <p className="text-2xl font-bold text-white">{btwReport.invoiceCount}</p>
                      <p className="text-sm text-white/40">{btwReport.paidCount} betaald</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Invoice List */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Facturen Q{selectedQuarter} {selectedYear}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10">
                          <TableHead className="text-white/60">Factuurnummer</TableHead>
                          <TableHead className="text-white/60">Datum</TableHead>
                          <TableHead className="text-white/60 text-right">Subtotaal</TableHead>
                          <TableHead className="text-white/60 text-right">BTW</TableHead>
                          <TableHead className="text-white/60 text-right">Totaal</TableHead>
                          <TableHead className="text-white/60">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {btwReport.invoices.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-white/40 py-8">
                              Geen facturen in deze periode
                            </TableCell>
                          </TableRow>
                        ) : (
                          btwReport.invoices.map((inv) => (
                            <TableRow key={inv.id} className="border-white/10">
                              <TableCell className="text-white">{inv.invoiceNumber}</TableCell>
                              <TableCell className="text-white/60">{formatDateDutch(new Date(inv.issueDate))}</TableCell>
                              <TableCell className="text-white text-right">{formatCurrency(inv.financial?.subtotal || 0)}</TableCell>
                              <TableCell className="text-orange text-right">{formatCurrency(inv.financial?.tax || 0)}</TableCell>
                              <TableCell className="text-white font-medium text-right">{formatCurrency(inv.financial?.total || 0)}</TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={
                                    inv.status === 'paid'
                                      ? 'border-green-500 text-green-500'
                                      : inv.status === 'overdue'
                                      ? 'border-red-500 text-red-500'
                                      : 'border-white/30 text-white/60'
                                  }
                                >
                                  {inv.status === 'paid' ? 'Betaald' : inv.status === 'sent' ? 'Verstuurd' : inv.status === 'overdue' ? 'Verlopen' : inv.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Revenue Report */}
            {reportType === 'revenue' && (
              <div className="space-y-6">
                {/* Year Selector */}
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-white/60" />
                        <span className="text-white/60">Jaar:</span>
                      </div>
                      <Select
                        value={selectedYear.toString()}
                        onValueChange={(v) => setSelectedYear(parseInt(v))}
                      >
                        <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableYears.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportToCSV('revenue')}
                        className="ml-auto"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Yearly Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                      <p className="text-white/60 text-sm">Totaal gefactureerd</p>
                      <p className="text-2xl font-bold text-white">
                        {formatCurrency(revenueReport.reduce((sum, m) => sum + m.revenue, 0))}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-500/20 border-green-500/30">
                    <CardContent className="p-4">
                      <p className="text-green-500 text-sm">Totaal ontvangen</p>
                      <p className="text-2xl font-bold text-green-500">
                        {formatCurrency(revenueReport.reduce((sum, m) => sum + m.paid, 0))}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-yellow-500/20 border-yellow-500/30">
                    <CardContent className="p-4">
                      <p className="text-yellow-500 text-sm">Openstaand</p>
                      <p className="text-2xl font-bold text-yellow-500">
                        {formatCurrency(revenueReport.reduce((sum, m) => sum + m.outstanding, 0))}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Monthly Table */}
                <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Omzet per maand {selectedYear}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10">
                          <TableHead className="text-white/60">Maand</TableHead>
                          <TableHead className="text-white/60 text-right">Facturen</TableHead>
                          <TableHead className="text-white/60 text-right">Gefactureerd</TableHead>
                          <TableHead className="text-white/60 text-right">Betaald</TableHead>
                          <TableHead className="text-white/60 text-right">Openstaand</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {revenueReport.map((month, idx) => (
                          <TableRow key={idx} className="border-white/10">
                            <TableCell className="text-white capitalize">{month.month}</TableCell>
                            <TableCell className="text-white/60 text-right">{month.invoiceCount}</TableCell>
                            <TableCell className="text-white text-right">{formatCurrency(month.revenue)}</TableCell>
                            <TableCell className="text-green-500 text-right">{formatCurrency(month.paid)}</TableCell>
                            <TableCell className={`text-right ${month.outstanding > 0 ? 'text-yellow-500' : 'text-white/40'}`}>
                              {formatCurrency(month.outstanding)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Aging Report */}
            {reportType === 'aging' && (
              <div className="space-y-6">
                {/* Export Button */}
                <Card className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-white/60">Debiteuren-ouderdom per {formatDateDutch(new Date())}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportToCSV('aging')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Total Outstanding */}
                <Card className="bg-red-500/20 border-red-500/30">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <AlertCircle className="w-8 h-8 text-red-500" />
                      <div>
                        <p className="text-red-400 text-sm">Totaal openstaand</p>
                        <p className="text-3xl font-bold text-red-500">{formatCurrency(agingReport.totalOutstanding)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Aging Categories */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {agingReport.categories.map((cat, idx) => (
                    <Card
                      key={idx}
                      className={`border-white/10 ${
                        idx === 0
                          ? 'bg-green-500/10'
                          : idx === 1
                          ? 'bg-yellow-500/10'
                          : idx === 2
                          ? 'bg-orange/10'
                          : idx === 3
                          ? 'bg-red-400/10'
                          : 'bg-red-600/10'
                      }`}
                    >
                      <CardContent className="p-4">
                        <p className="text-white/60 text-sm">{cat.label}</p>
                        <p className="text-xl font-bold text-white">{formatCurrency(cat.total)}</p>
                        <p className="text-sm text-white/40">{cat.count} facturen</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Detailed List */}
                {agingReport.categories.map((cat, catIdx) => (
                  cat.invoices.length > 0 && (
                    <Card key={catIdx} className="bg-white/5 border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white">{cat.label} - {cat.range}</CardTitle>
                        <CardDescription className="text-white/60">
                          {cat.count} facturen, totaal {formatCurrency(cat.total)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow className="border-white/10">
                              <TableHead className="text-white/60">Factuurnummer</TableHead>
                              <TableHead className="text-white/60">Klant</TableHead>
                              <TableHead className="text-white/60">Vervaldatum</TableHead>
                              <TableHead className="text-white/60 text-right">Openstaand</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {cat.invoices.map((inv) => (
                              <TableRow key={inv.id} className="border-white/10">
                                <TableCell className="text-white">{inv.invoiceNumber}</TableCell>
                                <TableCell className="text-white/60">{inv.clientName || inv.clientEmail || '-'}</TableCell>
                                <TableCell className="text-white/60">{formatDateDutch(new Date(inv.dueDate))}</TableCell>
                                <TableCell className="text-white font-medium text-right">
                                  {formatCurrency(inv.financial?.balance || inv.financial?.total || 0)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
