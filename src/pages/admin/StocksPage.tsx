import React, { useState } from 'react';
import { PlusCircle, Search, Package, Eye } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import SuccessModal from '../../components/ui/SuccessModal';

const StocksPage: React.FC = () => {
  const { products, suppliers, stocks, addStock } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 0,
    price: 0,
    dateAdded: new Date().toISOString().split('T')[0],
    expiryDate: '',
    supplierId: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const validateDates = () => {
    if (!formData.dateAdded || !formData.expiryDate) {
      return true; // Let other validation handle empty dates
    }
    
    const addedDate = new Date(formData.dateAdded);
    const expiryDate = new Date(formData.expiryDate);
    
    return addedDate < expiryDate;
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.productId) {
      setError('Please select a product');
      return;
    }
    
    if (!formData.supplierId) {
      setError('Please select a supplier');
      return;
    }
    
    if (formData.quantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }
    
    if (formData.price <= 0) {
      setError('Price must be greater than 0');
      return;
    }
    
    if (!formData.dateAdded) {
      setError('Please enter the date added');
      return;
    }
    
    if (!formData.expiryDate) {
      setError('Please enter an expiry date');
      return;
    }
    
    if (!validateDates()) {
      setError('Expiry date must be later than the added date');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      await addStock(
        formData.productId,
        formData.quantity,
        formData.price,
        formData.dateAdded,
        formData.expiryDate,
        formData.supplierId
      );
      
      // Reset form
      setFormData({
        productId: '',
        quantity: 0,
        price: 0,
        dateAdded: new Date().toISOString().split('T')[0],
        expiryDate: '',
        supplierId: '',
      });
      
      setIsModalOpen(false);
      setIsSuccessModalOpen(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const filteredStocks = stocks.filter(stock => 
    stock.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Stock Management" 
        subtitle="Manage your inventory and stock levels"
        action={
          <Button 
            onClick={() => setIsModalOpen(true)}
            variant="primary"
            disabled={products.length === 0 || suppliers.length === 0}
          >
            <PlusCircle size={18} className="mr-2" />
            Add Stock
          </Button>
        }
      />

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
                  <TableCell>{stock.quantity}</TableCell>
                  <TableCell>${Number(stock.price).toFixed(2)}</TableCell>
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
                  {searchTerm ? 'No stocks match your search' : 'No stocks found. Add some inventory to get started.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Stock Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData({
            productId: '',
            quantity: 0,
            price: 0,
            dateAdded: new Date().toISOString().split('T')[0],
            expiryDate: '',
            supplierId: '',
          });
          setError('');
        }}
        title="Add New Stock"
        size="lg"
      >
        {(products.length === 0 || suppliers.length === 0) ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-3">Cannot Add Stock</h3>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              {products.length === 0 ? 'You need to add products first before adding stock.' : 'You need to add suppliers first before adding stock.'}
            </p>
            <Button 
              variant="primary"
              size="lg"
              onClick={() => {
                setIsModalOpen(false);
                if (products.length === 0) {
                  window.location.href = '/admin/products';
                } else {
                  window.location.href = '/admin/suppliers';
                }
              }}
              className="px-8"
            >
              {products.length === 0 ? 'Go to Products' : 'Go to Suppliers'}
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm animate-fade-in">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}
            
            <form onSubmit={handleAddStock} className="space-y-8">
              {/* Product and Supplier Selection */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Package size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Product Selection</h3>
                    <p className="text-sm text-gray-600">Choose the product and supplier</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Select
                      label="Product *"
                      id="productId"
                      options={[
                        { value: '', label: 'Select a product' },
                        ...products.map(product => ({
                          value: product.id,
                          label: product.name
                        }))
                      ]}
                      value={formData.productId}
                      onChange={(value) => handleSelectChange('productId', value)}
                      fullWidth
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Select
                      label="Supplier *"
                      id="supplierId"
                      options={[
                        { value: '', label: 'Select a supplier' },
                        ...suppliers.map(supplier => ({
                          value: supplier.id,
                          label: supplier.name
                        }))
                      ]}
                      value={formData.supplierId}
                      onChange={(value) => handleSelectChange('supplierId', value)}
                      fullWidth
                    />
                  </div>
                </div>
              </div>
              
              {/* Quantity and Price */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Quantity & Pricing</h3>
                    <p className="text-sm text-gray-600">Set the stock quantity and unit price</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Input
                      label="Quantity *"
                      id="quantity"
                      name="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      placeholder="Enter quantity"
                      fullWidth
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Input
                      label="Price per Unit *"
                      id="price"
                      name="price"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      fullWidth
                    />
                  </div>
                </div>
              </div>
              
              {/* Date Fields */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Important Dates</h3>
                    <p className="text-sm text-gray-600">When was the stock received and when does it expire?</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Input
                      label="Date Added *"
                      id="dateAdded"
                      name="dateAdded"
                      type="date"
                      value={formData.dateAdded}
                      onChange={handleInputChange}
                      fullWidth
                    />
                    <p className="text-xs text-gray-500">When was this stock received?</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Input
                      label="Expiry Date *"
                      id="expiryDate"
                      name="expiryDate"
                      type="date"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      min={formData.dateAdded}
                      fullWidth
                      className={!validateDates() && formData.expiryDate ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
                    />
                    <p className="text-xs text-gray-500">Must be later than the added date</p>
                    {!validateDates() && formData.expiryDate && (
                      <p className="text-xs text-red-600 animate-fade-in flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Expiry date must be after the added date
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsModalOpen(false);
                    setFormData({
                      productId: '',
                      quantity: 0,
                      price: 0,
                      dateAdded: new Date().toISOString().split('T')[0],
                      expiryDate: '',
                      supplierId: '',
                    });
                    setError('');
                  }}
                  className="px-8"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  disabled={!validateDates()}
                  className="px-8"
                >
                  Add Stock
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>

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

      {/* Success Modal */}
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        message="Stock added successfully!"
      />
    </div>
  );
};

export default StocksPage;