import React, { useState } from 'react';
import { Search, Package, AlertTriangle, Eye } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import PageHeader from '../../components/ui/PageHeader';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/ui/Table';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';

const StaffStocksPage: React.FC = () => {
  const { stocks } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  const filteredStocks = stocks.filter(stock => 
    stock.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get low stock items (less than 10)
  const lowStockItems = stocks.filter(stock => stock.quantity < 10);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Stock Monitoring" 
        subtitle="View and monitor current inventory levels"
      />

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="border-amber-200 bg-amber-100 bg-opacity-50">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              <h2 className="text-lg font-serif font-medium text-gray-800">Low Stock Alert</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockItems.map(stock => (
                <div key={stock.id} className="flex items-center p-3 bg-white border border-amber-100 rounded-lg shadow-sm">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{stock.productName}</p>
                    <p className="text-sm text-gray-500">Only {stock.quantity} left in stock</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search bar */}
      <div className="relative max-w-md mb-4">
        <Input
          type="text"
          placeholder="Search products in stock..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      </div>

      {/* Stocks Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell>Product</TableHeaderCell>
              <TableHeaderCell>Quantity</TableHeaderCell>
              <TableHeaderCell>Price</TableHeaderCell>
              <TableHeaderCell>Added On</TableHeaderCell>
              <TableHeaderCell>Expiry Date</TableHeaderCell>
              <TableHeaderCell>Supplier</TableHeaderCell>
              <TableHeaderCell>Image</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStocks.length > 0 ? (
              filteredStocks.map((stock) => (
                <TableRow key={stock.id}>
                  <TableCell className="font-medium">{stock.productName}</TableCell>
                  <TableCell className={stock.quantity < 10 ? 'text-amber-600 font-medium' : ''}>
                    {stock.quantity}
                  </TableCell>
                  <TableCell>${stock.price.toFixed(2)}</TableCell>
                  <TableCell>{new Date(stock.dateAdded).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(stock.expiryDate).toLocaleDateString()}</TableCell>
                  <TableCell>{stock.supplierName}</TableCell>
                  <TableCell>
                    {stock.productImageUrl ? (
                      <div className="flex items-center gap-2">
                        <img 
                          src={stock.productImageUrl} 
                          alt={stock.productName} 
                          className="w-12 h-12 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80"
                          onClick={() => {
                            setSelectedImage(stock.productImageUrl!);
                            setIsImageModalOpen(true);
                          }}
                          onError={(e) => {
                            console.error('Product image failed to load:', stock.productImageUrl);
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedImage(stock.productImageUrl!);
                            setIsImageModalOpen(true);
                          }}
                        >
                          <Eye size={14} />
                        </Button>
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-gray-400">No image</span>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No stocks match your search' : 'No stocks found.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {stocks.length === 0 && (
        <div className="text-center py-8">
          <Package size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No Stock Available</h3>
          <p className="text-gray-600">
            There are no items in stock. Please contact an administrator to add inventory.
          </p>
        </div>
      )}

      {/* Image Modal */}
      <Modal
        isOpen={isImageModalOpen}
        onClose={() => {
          setIsImageModalOpen(false);
          setSelectedImage('');
        }}
        title="Product Image"
        size="lg"
      >
        <div className="flex justify-center">
          <img 
            src={selectedImage} 
            alt="Product - full size" 
            className="max-w-full max-h-96 object-contain rounded-lg"
            onError={(e) => {
              console.error('Image failed to load:', selectedImage);
            }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default StaffStocksPage;