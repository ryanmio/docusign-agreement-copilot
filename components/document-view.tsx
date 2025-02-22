'use client';

import { useState } from 'react';
import { Alert } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Download, Send, XCircle } from 'lucide-react';
import PDFViewer from '@/components/pdf-viewer';

interface Recipient {
  id: string;
  name: string;
  email: string;
  status: string;
}

interface Document {
  documentId: string;
  name: string;
}

interface Envelope {
  id: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  recipients: Recipient[];
}

interface DocumentViewProps {
  envelopeId: string;
  envelope: Envelope;
  documents: { envelopeDocuments: Document[] };
  showActions?: boolean;
}

export function DocumentView({
  envelopeId,
  envelope,
  documents,
  showActions = true,
}: DocumentViewProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);
  const [pdfScale, setPdfScale] = useState(0.35);

  const handleVoid = async () => {
    if (!confirm('Are you sure you want to void this envelope? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/envelopes/${envelopeId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: 'Voided by user',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to void envelope');
      }

      setSuccess('Envelope voided successfully');
      envelope.status = 'voided';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to void envelope');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!confirm('Are you sure you want to resend this envelope?')) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/envelopes/${envelopeId}/resend`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to resend envelope');
      }

      setSuccess('Envelope resent successfully');
      envelope.status = 'sent';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend envelope');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-[#CBC2FF]/40 text-[#26065D]'
      case 'delivered':
        return 'bg-[#4C00FF]/10 text-[#4C00FF]'
      case 'completed':
        return 'bg-[#26065D]/10 text-[#26065D]'
      case 'declined':
      case 'voided':
        return 'bg-[#FF5252]/10 text-[#FF5252]'
      default:
        return 'bg-[#130032]/10 text-[#130032]'
    }
  };

  const handleExpand = (docId: string) => {
    if (expandedDocId === docId) {
      setExpandedDocId(null);
      setPdfScale(0.35);
    } else {
      setExpandedDocId(docId);
      setPdfScale(2.0);
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto border-none shadow-[0_2px_4px_rgba(19,0,50,0.1)] bg-white">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-[#130032] tracking-[-0.02em] text-2xl font-light mb-1">
              {envelope.subject}
            </CardTitle>
            <p className="text-[#130032]/60 text-sm tracking-[-0.01em]">
              {envelope.message}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="secondary"
              className={`${getStatusColor(envelope.status)} px-4 py-1 rounded-full text-xs font-medium`}
            >
              {envelope.status}
            </Badge>
            {showActions && envelope.status !== 'voided' && (
              <>
                {envelope.status !== 'completed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResend}
                    disabled={loading}
                    className="text-[#4C00FF] border-[#4C00FF] hover:bg-[#4C00FF]/10"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {loading ? 'Processing...' : 'Resend'}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleVoid}
                  disabled={loading}
                  className="text-[#FF5252] border-[#FF5252] hover:bg-[#FF5252]/10"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  {loading ? 'Processing...' : 'Void'}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {error && (
          <Alert variant="destructive">
            {error}
          </Alert>
        )}

        {success && (
          <Alert className="border-green-500 bg-green-50">
            {success}
          </Alert>
        )}

        <Collapsible
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          className="mb-6"
        >
          <CollapsibleTrigger className="w-full flex justify-between items-center p-4 hover:no-underline bg-[#F8F3F0] rounded-lg">
            <span className="font-medium text-[#130032]">Document Details</span>
            {isDetailsOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4 bg-[#F8F3F0] rounded-b-lg mt-0">
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Timeline */}
              <div>
                <h2 className="text-lg font-semibold mb-4 text-[#130032]">Timeline</h2>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-[#130032]">Created</span>
                    <span className="text-sm text-[#130032]/60">{formatDate(envelope.created_at)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-[#130032]">Last Updated</span>
                    <span className="text-sm text-[#130032]/60">{formatDate(envelope.updated_at)}</span>
                  </div>
                  {envelope.completed_at && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-[#130032]">Completed</span>
                      <span className="text-sm text-[#130032]/60">{formatDate(envelope.completed_at)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Recipients */}
              <div>
                <h2 className="text-lg font-semibold mb-4 text-[#130032]">Recipients</h2>
                <div className="space-y-3">
                  {envelope.recipients.map((recipient) => (
                    <div key={recipient.id} className="flex justify-between items-center p-3 bg-[#CBC2FF]/10 rounded-lg">
                      <div>
                        <p className="font-medium text-[#130032]">{recipient.name}</p>
                        <p className="text-sm text-[#130032]/60">{recipient.email}</p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`${getStatusColor(recipient.status)} px-3 py-1 rounded-full text-xs font-medium`}
                      >
                        {recipient.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Document Viewer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents?.envelopeDocuments?.map((doc) => (
            <div 
              key={doc.documentId} 
              className={`bg-[#F8F3F0] rounded-lg overflow-hidden shadow-sm ${expandedDocId === doc.documentId ? 'md:col-span-2' : ''}`}
            >
              <div className="flex justify-between items-center p-4 border-b border-[#130032]/10">
                <h2 className="font-medium text-[#130032] truncate max-w-[200px]">{doc.name}</h2>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-[#4C00FF]"
                    onClick={() => handleExpand(doc.documentId)}
                  >
                    {expandedDocId === doc.documentId ? 'Collapse' : 'Expand'}
                  </Button>
                  <a
                    href={`/api/envelopes/${envelope.id}/documents/${doc.documentId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#4C00FF]"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </a>
                </div>
              </div>
              <div className={`relative bg-[#F8F3F0] transition-all duration-300 ease-in-out ${expandedDocId === doc.documentId ? 'aspect-[3/4]' : 'h-48'}`}>
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                  <div className={`relative w-full h-full transition-all duration-300 ease-in-out`}>
                    <PDFViewer 
                      url={`/api/envelopes/${envelope.id}/documents/${doc.documentId}`}
                      scale={expandedDocId === doc.documentId ? 1.5 : 0.35}
                      className="h-full"
                      key={`${doc.documentId}-${expandedDocId === doc.documentId}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default DocumentView; 