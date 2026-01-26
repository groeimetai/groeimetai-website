'use client';

import { useState } from 'react';
import { format, formatDistanceToNow, isAfter } from 'date-fns';
import { nl } from 'date-fns/locale';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Download,
  Send,
  Link,
  Mail,
  CheckCircle,
  Loader2,
  FileText,
  CreditCard,
  Clock,
  Building2,
  User,
  MapPin,
} from 'lucide-react';
import { PaymentHistory } from './PaymentHistory';
import { PaymentStatusBadge, MolliePaymentStatus } from './PaymentStatusBadge';
import { SyncSinglePaymentButton } from './SyncPaymentsButton';
import { Invoice, InvoiceStatus, Address } from '@/types';
import { cn } from '@/lib/utils';

interface InvoiceWithClient extends Invoice {
  clientName?: string;
  clientEmail?: string;
  billingDetails?: {
    companyName?: string;
    contactName?: string;
    kvkNumber?: string;
    btwNumber?: string;
    street?: string;
    postalCode?: string;
    city?: string;
    country?: string;
    email?: string;
  };
  molliePaymentStatus?: string;
  lastPaymentSync?: Date;
}

interface InvoiceDetailPanelProps {
  invoice: InvoiceWithClient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSendInvoice: (invoice: InvoiceWithClient) => void;
  onCreatePaymentLink: (invoice: InvoiceWithClient) => void;
  onMarkAsPaid: (invoice: InvoiceWithClient) => void;
  onDownloadPDF: (invoice: InvoiceWithClient) => void;
  onSendReminder: (invoice: InvoiceWithClient) => void;
  sendingInvoice?: boolean;
  creatingPaymentLink?: boolean;
  sendingReminder?: boolean;
}

const getStatusColor = (status: InvoiceStatus) => {
  switch (status) {
    case 'draft':
      return 'bg-gray-500';
    case 'sent':
      return 'bg-blue-500';
    case 'viewed':
      return 'bg-indigo-500';
    case 'paid':
      return 'bg-green-500';
    case 'overdue':
      return 'bg-red-500';
    case 'cancelled':
      return 'bg-gray-500';
    default:
      return 'bg-gray-500';
  }
};

const getStatusLabel = (status: InvoiceStatus) => {
  const labels: Record<InvoiceStatus, string> = {
    draft: 'Concept',
    sent: 'Verzonden',
    viewed: 'Bekeken',
    paid: 'Betaald',
    partial: 'Deels betaald',
    overdue: 'Te laat',
    cancelled: 'Geannuleerd',
  };
  return labels[status] || status;
};

export function InvoiceDetailPanel({
  invoice,
  open,
  onOpenChange,
  onSendInvoice,
  onCreatePaymentLink,
  onMarkAsPaid,
  onDownloadPDF,
  onSendReminder,
  sendingInvoice = false,
  creatingPaymentLink = false,
  sendingReminder = false,
}: InvoiceDetailPanelProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!invoice) return null;

  const isOverdue =
    ['sent', 'viewed'].includes(invoice.status) &&
    isAfter(new Date(), invoice.dueDate);

  const billingDetails = invoice.billingDetails;
  const billingAddress = invoice.billingAddress;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl bg-black/95 border-white/20 text-white overflow-y-auto"
      >
        <SheetHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-2xl font-bold text-white">
                {invoice.invoiceNumber}
              </SheetTitle>
              <SheetDescription className="text-white/60">
                {invoice.clientName || 'Onbekende klant'}
              </SheetDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn(
                  `${getStatusColor(invoice.status)} bg-opacity-20 border-0`
                )}
              >
                {getStatusLabel(invoice.status)}
              </Badge>
              {invoice.molliePaymentStatus && (
                <PaymentStatusBadge
                  status={invoice.molliePaymentStatus as MolliePaymentStatus}
                  size="sm"
                />
              )}
            </div>
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-white/10 text-white/60 data-[state=active]:text-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              Overzicht
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              className="data-[state=active]:bg-white/10 text-white/60 data-[state=active]:text-white"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Betalingen
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="data-[state=active]:bg-white/10 text-white/60 data-[state=active]:text-white"
            >
              <Clock className="w-4 h-4 mr-2" />
              Activiteit
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-4 space-y-6">
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownloadPDF(invoice)}
                className="border-white/20"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>

              {invoice.status === 'draft' && (
                <Button
                  size="sm"
                  onClick={() => onSendInvoice(invoice)}
                  disabled={sendingInvoice}
                  className="bg-orange hover:bg-orange/90"
                >
                  {sendingInvoice ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Verstuur Factuur
                </Button>
              )}

              {['sent', 'viewed', 'overdue'].includes(invoice.status) && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onCreatePaymentLink(invoice)}
                    disabled={creatingPaymentLink}
                    className="border-white/20"
                  >
                    {creatingPaymentLink ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Link className="w-4 h-4 mr-2" />
                    )}
                    Betaallink
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSendReminder(invoice)}
                    disabled={sendingReminder}
                    className="border-white/20"
                  >
                    {sendingReminder ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4 mr-2" />
                    )}
                    Herinnering
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onMarkAsPaid(invoice)}
                    className="border-green-500/50 text-green-500 hover:bg-green-500/10"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Markeer Betaald
                  </Button>
                  <SyncSinglePaymentButton invoiceId={invoice.id} />
                </>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <p className="text-white/60 text-sm mb-1">Factuurdatum</p>
                <p className="text-white font-medium">
                  {format(invoice.issueDate, 'd MMMM yyyy', { locale: nl })}
                </p>
              </div>
              <div
                className={cn(
                  'p-4 rounded-lg border',
                  isOverdue
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-white/5 border-white/10'
                )}
              >
                <p className={cn('text-sm mb-1', isOverdue ? 'text-red-400' : 'text-white/60')}>
                  Vervaldatum
                </p>
                <p className={cn('font-medium', isOverdue ? 'text-red-400' : 'text-white')}>
                  {format(invoice.dueDate, 'd MMMM yyyy', { locale: nl })}
                </p>
                {isOverdue && (
                  <p className="text-xs text-red-400 mt-1">
                    {formatDistanceToNow(invoice.dueDate, { addSuffix: true, locale: nl })} te laat
                  </p>
                )}
              </div>
            </div>

            {/* Client Details */}
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <h3 className="text-sm font-medium text-white/60 mb-3 flex items-center">
                <Building2 className="w-4 h-4 mr-2" />
                Klantgegevens
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  {billingDetails?.companyName && (
                    <p className="text-white font-medium">{billingDetails.companyName}</p>
                  )}
                  {billingDetails?.contactName && (
                    <p className="text-white/80 flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      {billingDetails.contactName}
                    </p>
                  )}
                  {!billingDetails?.companyName && !billingDetails?.contactName && invoice.clientName && (
                    <p className="text-white font-medium">{invoice.clientName}</p>
                  )}
                  {(billingDetails?.email || invoice.clientEmail) && (
                    <p className="text-white/60 text-sm mt-1">
                      {billingDetails?.email || invoice.clientEmail}
                    </p>
                  )}
                </div>
                <div className="text-white/60 text-sm">
                  {(billingDetails?.street || billingAddress?.street) && (
                    <p className="flex items-start">
                      <MapPin className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                      <span>
                        {billingDetails?.street || billingAddress?.street}
                        <br />
                        {billingDetails?.postalCode || billingAddress?.postalCode}{' '}
                        {billingDetails?.city || billingAddress?.city}
                        <br />
                        {billingDetails?.country || billingAddress?.country}
                      </span>
                    </p>
                  )}
                  {billingDetails?.kvkNumber && (
                    <p className="mt-2">KvK: {billingDetails.kvkNumber}</p>
                  )}
                  {billingDetails?.btwNumber && (
                    <p>BTW: {billingDetails.btwNumber}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Invoice Items */}
            <div>
              <h3 className="text-sm font-medium text-white/60 mb-3">Factuurregels</h3>
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-white/60">Omschrijving</TableHead>
                    <TableHead className="text-right text-white/60">Aantal</TableHead>
                    <TableHead className="text-right text-white/60">Tarief</TableHead>
                    <TableHead className="text-right text-white/60">BTW</TableHead>
                    <TableHead className="text-right text-white/60">Totaal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items.map((item) => (
                    <TableRow key={item.id} className="border-white/10">
                      <TableCell className="text-white">{item.description}</TableCell>
                      <TableCell className="text-right text-white">{item.quantity}</TableCell>
                      <TableCell className="text-right text-white">€{item.unitPrice.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-white">€{item.tax.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-white">€{item.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Totals */}
            <div className="space-y-2">
              <Separator className="bg-white/10" />
              <div className="flex justify-between text-white/80">
                <span>Subtotaal</span>
                <span>€{invoice.financial.subtotal.toFixed(2)}</span>
              </div>
              {invoice.financial.discount > 0 && (
                <div className="flex justify-between text-white/80">
                  <span>Korting</span>
                  <span>-€{invoice.financial.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-white/80">
                <span>BTW</span>
                <span>€{invoice.financial.tax.toFixed(2)}</span>
              </div>
              <Separator className="bg-white/10" />
              <div className="flex justify-between text-xl font-bold text-white">
                <span>Totaal</span>
                <span>€{invoice.financial.total.toFixed(2)}</span>
              </div>
              {invoice.financial.paid > 0 && (
                <>
                  <div className="flex justify-between text-white/80">
                    <span>Betaald</span>
                    <span className="text-green-500">€{invoice.financial.paid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span>Openstaand</span>
                    <span className="text-orange">€{invoice.financial.balance.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="mt-4">
            <PaymentHistory invoiceId={invoice.id} />
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="mt-4">
            <div className="space-y-4">
              {/* Reminders sent */}
              {invoice.reminders && invoice.reminders.length > 0 ? (
                <div>
                  <h3 className="text-sm font-medium text-white/60 mb-3">Verzonden Herinneringen</h3>
                  <div className="space-y-2">
                    {invoice.reminders.map((reminder, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 text-white/40 mr-2" />
                          <span className="text-white/80">
                            {reminder.type === 'due_soon'
                              ? 'Herinnering: bijna vervallen'
                              : reminder.type === 'overdue'
                              ? 'Herinnering: te laat'
                              : 'Laatste herinnering'}
                          </span>
                        </div>
                        <span className="text-white/40 text-sm">
                          {format(new Date(reminder.sentAt), 'd MMM yyyy HH:mm', { locale: nl })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Mail className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <p className="text-white/60">Geen herinneringen verzonden</p>
                </div>
              )}

              {/* Invoice Timeline */}
              <div>
                <h3 className="text-sm font-medium text-white/60 mb-3">Tijdlijn</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                    <span className="text-white/80">Factuur aangemaakt</span>
                    <span className="text-white/40 text-sm">
                      {format(invoice.createdAt, 'd MMM yyyy HH:mm', { locale: nl })}
                    </span>
                  </div>
                  {invoice.status !== 'draft' && (
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                      <span className="text-white/80">Factuur verzonden</span>
                      <span className="text-white/40 text-sm">
                        {format(invoice.updatedAt, 'd MMM yyyy HH:mm', { locale: nl })}
                      </span>
                    </div>
                  )}
                  {invoice.paidDate && (
                    <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                      <span className="text-green-400">Factuur betaald</span>
                      <span className="text-green-400/60 text-sm">
                        {format(invoice.paidDate, 'd MMM yyyy HH:mm', { locale: nl })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
