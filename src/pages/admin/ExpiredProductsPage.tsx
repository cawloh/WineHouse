import React, { useState } from 'react';
import { Search, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import PageHeader from '../../components/ui/PageHeader';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/ui/Table';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import SuccessModal from '../../components/ui/SuccessModal';

const ExpiredProductsPage: React.FC = () => {
  const { productStatuses, updateProductStatus } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ProductStatus | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Filter expired products
  const expiredProducts = productStatuses.filter(
    status => status.type === 'expired'
  );

  const filteredProducts = expiredProducts.filter(
    status => 
      status.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      status.reportedByUsername.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReview = async (action: 'approved' | 'rejected') => {
    if (!selectedStatus) return;
    
    setLoading(true);
    setError('');

    try {
      await updateProductStatus(selectedStatus.id, action, reviewNotes);
      setIsReviewModalOpen(false);
      setSuccessMessage(`Report ${action} successfully`);
      setIsSuccessModalOpen(true);
      setReviewNotes('');
      setSelectedStatus(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock size={12} className="mr-1" />
            Pending Review
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle size={12} className="mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle size={12} className="mr-1" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Expired Products" 
        subtitle="Review and manage expired product reports"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-yellow-50 border-yellow-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Pending Review</p>
                <p className="text-2xl font-semibold text-yellow-700">
                  {expiredProducts.filter(p => p.status === 'pending').length}
                </p>
              </div>
              <Clock className="text-yellow-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Approved</p>
                <p className="text-2xl font-semibold text-green-700">
                  {expiredProducts.filter(p => p.status === 'approved').length}
                </p>
              </div>
              <CheckCircle className="text-green-500" size={24} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border-red-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Rejected</p>
                <p className="text-2xl font-semibold text-red-700">
                  {expiredProducts.filter(p => p.status === 'rejected').length}
                </p>
              </div>
              <XCircle className="text-red-500" size={24} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search bar */}
      <div className="relative max-w-md mb-4">
        <Input
          type="text"
          placeholder="Search expired products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Product</TableHeaderCell>
              <TableHeaderCell>Quantity</TableHeaderCell>
              <TableHeaderCell>Reported By</TableHeaderCell>
              <TableHeaderCell>Reported On</TableHeaderCell>
              <TableHeaderCell>Notes</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.productName}</TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell>{product.reportedByUsername}</TableCell>
                  <TableCell>{new Date(product.reportedAt).toLocaleDateString()}</TableCell>
                  <TableCell>{product.notes}</TableCell>
                  <TableCell>{getStatusBadge(product.status)}</TableCell>
                  <TableCell>
                    {product.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setSelectedStatus(product);
                            setIsReviewModalOpen(true);
                          }}
                        >
                          Review
                        </Button>
                      </div>
                    )}
                    {product.status !== 'pending' && (
                      <span className="text-sm text-gray-500">
                        {product.reviewNotes}
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No expired products match your search' : 'No expired products reported.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setSelectedStatus(null);
          setReviewNotes('');
          setError('');
        }}
        title="Review Expired Product Report"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsReviewModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => handleReview('rejected')}
              loading={loading}
            >
              Reject
            </Button>
            <Button
              variant="primary"
              onClick={() => handleReview('approved')}
              loading={loading}
            >
              Approve
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">Report Details</h3>
            <dl className="space-y-2">
              <div>
                <dt className="text-sm text-gray-500">Product</dt>
                <dd className="text-gray-800">{selectedStatus?.productName}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Quantity</dt>
                <dd className="text-gray-800">{selectedStatus?.quantity}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Reported By</dt>
                <dd className="text-gray-800">{selectedStatus?.reportedByUsername}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Notes</dt>
                <dd className="text-gray-800">{selectedStatus?.notes}</dd>
              </div>
            </dl>
          </div>

          <div>
            <Input
              label="Review Notes"
              id="reviewNotes"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Add your remarks about this report"
              fullWidth
            />
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        message={successMessage}
      />
    </div>
  );
};

export default ExpiredProductsPage;