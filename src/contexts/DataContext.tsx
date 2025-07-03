import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useAuth } from './AuthContext';
import {
  Product,
  Supplier,
  Stock,
  Transaction,
  ProductStatus,
  ActivityLog,
  Notification,
  DataContextType,
  DashboardStats,
  User,
  AttendanceRecord,
} from '../types';

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [productStatuses, setProductStatuses] = useState<ProductStatus[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadData = () => {
      const productsJSON = localStorage.getItem('products');
      const suppliersJSON = localStorage.getItem('suppliers');
      const stocksJSON = localStorage.getItem('stocks');
      const transactionsJSON = localStorage.getItem('transactions');
      const productStatusesJSON = localStorage.getItem('productStatuses');
      const activityLogsJSON = localStorage.getItem('activityLogs');
      const notificationsJSON = localStorage.getItem('notifications');
      const attendanceJSON = localStorage.getItem('attendanceRecords');

      if (productsJSON) setProducts(JSON.parse(productsJSON));
      if (suppliersJSON) setSuppliers(JSON.parse(suppliersJSON));
      if (stocksJSON) setStocks(JSON.parse(stocksJSON));
      if (transactionsJSON) setTransactions(JSON.parse(transactionsJSON));
      if (productStatusesJSON) setProductStatuses(JSON.parse(productStatusesJSON));
      if (activityLogsJSON) setActivityLogs(JSON.parse(activityLogsJSON));
      if (notificationsJSON) setNotifications(JSON.parse(notificationsJSON));
      if (attendanceJSON) setAttendanceRecords(JSON.parse(attendanceJSON));
    };

    loadData();
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('stocks', JSON.stringify(stocks));
  }, [stocks]);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('productStatuses', JSON.stringify(productStatuses));
  }, [productStatuses]);

  useEffect(() => {
    localStorage.setItem('activityLogs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  const addProduct = async (name: string, imageUrl?: string): Promise<Product> => {
    if (!currentUser) throw new Error('User not authenticated');

    const newProduct: Product = {
      id: uuidv4(),
      name,
      imageUrl,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.id,
    };

    setProducts((prev) => [...prev, newProduct]);
    await addActivityLog('Added new product', `Added product: ${name}`);
    return newProduct;
  };

  const addSupplier = async (name: string, contactNumber: string): Promise<Supplier> => {
    if (!currentUser) throw new Error('User not authenticated');
    
    if (contactNumber.length !== 11 || !/^\d+$/.test(contactNumber)) {
      throw new Error('Contact number must be 11 digits');
    }

    const newSupplier: Supplier = {
      id: uuidv4(),
      name,
      contactNumber,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.id,
    };

    setSuppliers((prev) => [...prev, newSupplier]);
    await addActivityLog('Added new supplier', `Added supplier: ${name}`);
    return newSupplier;
  };

  const addStock = async (
    productId: string,
    quantity: number,
    price: number,
    dateAdded: string,
    expiryDate: string,
    supplierId: string
  ): Promise<Stock> => {
    if (!currentUser) throw new Error('User not authenticated');

    const product = products.find((p) => p.id === productId);
    if (!product) throw new Error('Product not found');

    const supplier = suppliers.find((s) => s.id === supplierId);
    if (!supplier) throw new Error('Supplier not found');

    const numericPrice = Number(price);
    if (isNaN(numericPrice)) {
      throw new Error('Invalid price value');
    }

    const newStock: Stock = {
      id: uuidv4(),
      productId,
      productName: product.name,
      productImageUrl: product.imageUrl,
      quantity: Number(quantity),
      price: numericPrice,
      dateAdded,
      expiryDate,
      supplierId,
      supplierName: supplier.name,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.id,
    };

    setStocks((prev) => [...prev, newStock]);
    await addActivityLog(
      'Added new stock',
      `Added ${quantity} units of ${product.name}`
    );
    return newStock;
  };

  const addTransaction = async (
    productId: string,
    quantity: number,
    price: number
  ): Promise<Transaction> => {
    if (!currentUser) throw new Error('User not authenticated');

    const product = products.find((p) => p.id === productId);
    if (!product) throw new Error('Product not found');

    const productStock = stocks.find((s) => s.productId === productId);
    if (!productStock || productStock.quantity < quantity) {
      throw new Error('Not enough stock available');
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice)) {
      throw new Error('Invalid price value');
    }

    setStocks((prev) =>
      prev.map((stock) =>
        stock.productId === productId
          ? { ...stock, quantity: stock.quantity - quantity }
          : stock
      )
    );

    const newTransaction: Transaction = {
      id: uuidv4(),
      productId,
      productName: product.name,
      quantity: Number(quantity),
      price: numericPrice,
      totalPrice: numericPrice * Number(quantity),
      date: new Date().toISOString(),
      createdBy: currentUser.id,
      createdByUsername: currentUser.username,
    };

    setTransactions((prev) => [...prev, newTransaction]);
    await addActivityLog(
      'New transaction',
      `Sold ${quantity} units of ${product.name}`
    );
    return newTransaction;
  };

  const addProductStatus = async (
    productId: string,
    type: 'expired' | 'damaged',
    quantity: number,
    notes: string,
    imageUrl?: string
  ): Promise<ProductStatus> => {
    if (!currentUser) throw new Error('User not authenticated');

    const product = products.find((p) => p.id === productId);
    if (!product) throw new Error('Product not found');

    const productStock = stocks.find((s) => s.productId === productId);
    if (!productStock || productStock.quantity < quantity) {
      throw new Error('Not enough stock available');
    }

    const newStatus: ProductStatus = {
      id: uuidv4(),
      productId,
      productName: product.name,
      type,
      quantity: Number(quantity),
      notes,
      imageUrl,
      status: 'pending',
      reportedBy: currentUser.id,
      reportedByUsername: currentUser.username,
      reportedAt: new Date().toISOString(),
    };

    setProductStatuses((prev) => [...prev, newStatus]);
    
    // Add activity log
    await addActivityLog(
      `Reported ${type} product`,
      `${product.name} - ${quantity} units`
    );

    // Notify admins
    const admins = JSON.parse(localStorage.getItem('users') || '[]')
      .filter((user: any) => user.role === 'admin');

    for (const admin of admins) {
      await addNotification(
        admin.id,
        `New ${type} Product Report`,
        `${currentUser.username} reported ${quantity} units of ${product.name} as ${type}`
      );
    }

    return newStatus;
  };

  const editProductStatus = async (
    statusId: string,
    notes: string,
    imageUrl?: string
  ): Promise<ProductStatus> => {
    if (!currentUser) throw new Error('User not authenticated');

    const status = productStatuses.find(ps => ps.id === statusId);
    if (!status) throw new Error('Status not found');

    if (status.reportedBy !== currentUser.id) {
      throw new Error('You can only edit your own reports');
    }

    // Store the previous version in history
    const previousVersion = {
      notes: status.notes,
      imageUrl: status.imageUrl,
      reviewNotes: status.reviewNotes,
      status: status.status as 'rejected',
      timestamp: new Date().toISOString(),
    };

    const updatedStatus: ProductStatus = {
      ...status,
      notes,
      imageUrl,
      status: 'pending',
      editedAt: new Date().toISOString(),
      previousReports: [
        ...(status.previousReports || []),
        previousVersion
      ],
    };

    setProductStatuses(prev =>
      prev.map(ps => ps.id === statusId ? updatedStatus : ps)
    );

    // Add activity log
    await addActivityLog(
      'Edited product status report',
      `${status.productName} - Updated report after rejection`
    );

    // Notify admins about the edit
    const admins = JSON.parse(localStorage.getItem('users') || '[]')
      .filter((user: any) => user.role === 'admin');

    for (const admin of admins) {
      await addNotification(
        admin.id,
        'Product Report Updated',
        `${currentUser.username} has updated their ${status.type} product report for ${status.productName}`
      );
    }

    return updatedStatus;
  };

  const addActivityLog = async (action: string, details: string): Promise<ActivityLog> => {
    if (!currentUser) throw new Error('User not authenticated');

    const newLog: ActivityLog = {
      id: uuidv4(),
      userId: currentUser.id,
      username: currentUser.username,
      userRole: currentUser.role,
      action,
      details,
      timestamp: new Date().toISOString(),
    };

    setActivityLogs((prev) => [...prev, newLog]);
    return newLog;
  };

  const addNotification = async (
    userId: string,
    title: string,
    message: string
  ): Promise<Notification> => {
    const newNotification: Notification = {
      id: uuidv4(),
      userId,
      title,
      message,
      read: false,
      createdAt: new Date().toISOString(),
    };

    setNotifications((prev) => [...prev, newNotification]);
    return newNotification;
  };

  const markNotificationAsRead = async (id: string): Promise<void> => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const updateProductStatus = async (
    statusId: string,
    status: 'approved' | 'rejected',
    reviewNotes: string
  ): Promise<ProductStatus> => {
    if (!currentUser) throw new Error('User not authenticated');
    if (currentUser.role !== 'admin') throw new Error('Unauthorized');

    const productStatus = productStatuses.find((ps) => ps.id === statusId);
    if (!productStatus) throw new Error('Status not found');

    if (status === 'approved') {
      // Update stock quantity
      setStocks((prev) =>
        prev.map((stock) =>
          stock.productId === productStatus.productId
            ? { ...stock, quantity: stock.quantity - productStatus.quantity }
            : stock
        )
      );

      // Add activity log
      await addActivityLog(
        `Approved ${productStatus.type} product`,
        `${productStatus.productName} - ${productStatus.quantity} units`
      );

      // Notify staff
      await addNotification(
        productStatus.reportedBy,
        'Report Approved',
        `Your ${productStatus.type} product report for ${productStatus.productName} has been approved.`
      );
    } else {
      // Add activity log for rejection
      await addActivityLog(
        `Rejected ${productStatus.type} product`,
        `${productStatus.productName} - ${productStatus.quantity} units`
      );

      // Notify staff
      await addNotification(
        productStatus.reportedBy,
        'Report Rejected',
        `Your ${productStatus.type} product report for ${productStatus.productName} has been rejected.`
      );
    }

    const updatedStatus: ProductStatus = {
      ...productStatus,
      status,
      reviewNotes,
      reviewedBy: currentUser.id,
      reviewedByUsername: currentUser.username,
      reviewedAt: new Date().toISOString(),
    };

    setProductStatuses((prev) =>
      prev.map((ps) => (ps.id === statusId ? updatedStatus : ps))
    );

    return updatedStatus;
  };

  const exportProductStatusReport = async (type: 'excel' | 'pdf'): Promise<void> => {
    if (type === 'excel') {
      const worksheet = XLSX.utils.json_to_sheet(productStatuses);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Product Status Report');
      XLSX.writeFile(workbook, 'product-status-report.xlsx');
    } else {
      const doc = new jsPDF();
      (doc as any).autoTable({
        head: [['Product', 'Type', 'Quantity', 'Status', 'Reported By', 'Date']],
        body: productStatuses.map((status) => [
          status.productName,
          status.type,
          status.quantity,
          status.status,
          status.reportedByUsername,
          new Date(status.reportedAt).toLocaleDateString(),
        ]),
      });
      doc.save('product-status-report.pdf');
    }
  };

  const clockIn = async (userId: string): Promise<void> => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    // Check if user already clocked in today
    const existingRecord = attendanceRecords.find(
      record => record.userId === userId && record.date === today && !record.timeOut
    );

    if (existingRecord) {
      throw new Error('User already clocked in today');
    }

    const newRecord: AttendanceRecord = {
      id: uuidv4(),
      userId,
      timeIn: now,
      date: today,
    };

    setAttendanceRecords(prev => [...prev, newRecord]);

    // Update user status
    const users = getAllUsers();
    const updatedUsers = users.map(user => 
      user.id === userId 
        ? { ...user, isActive: true, lastTimeIn: now }
        : user
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const clockOut = async (userId: string): Promise<void> => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    // Find today's attendance record
    const recordIndex = attendanceRecords.findIndex(
      record => record.userId === userId && record.date === today && !record.timeOut
    );

    if (recordIndex === -1) {
      throw new Error('No active clock-in record found for today');
    }

    const record = attendanceRecords[recordIndex];
    const timeIn = new Date(record.timeIn);
    const timeOut = new Date(now);
    const duration = Math.floor((timeOut.getTime() - timeIn.getTime()) / (1000 * 60)); // in minutes

    const updatedRecord: AttendanceRecord = {
      ...record,
      timeOut: now,
      duration,
    };

    setAttendanceRecords(prev => 
      prev.map((r, index) => index === recordIndex ? updatedRecord : r)
    );

    // Update user status
    const users = getAllUsers();
    const updatedUsers = users.map(user => 
      user.id === userId 
        ? { ...user, isActive: false, lastTimeOut: now }
        : user
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const getActiveStaff = (): User[] => {
    const users = getAllUsers();
    return users.filter(user => user.role === 'staff' && user.isActive);
  };

  const getTodayAttendance = (): AttendanceRecord[] => {
    const today = new Date().toISOString().split('T')[0];
    return attendanceRecords.filter(record => record.date === today);
  };

  const getDashboardStats = (): DashboardStats => {
    const today = new Date().toISOString().split('T')[0];
    
    const todayTransactions = transactions.filter(
      (t) => t.date.split('T')[0] === today
    );
    
    const totalSalesToday = todayTransactions.length;
    const totalSalesAmount = todayTransactions.reduce(
      (sum, t) => sum + t.totalPrice,
      0
    );
    
    const lowStockThreshold = 10;
    const lowStockItems = stocks.filter((s) => s.quantity < lowStockThreshold).length;

    const allUsers = getAllUsers();
    const staffUsers = allUsers.filter(user => user.role === 'staff');
    const activeStaff = getActiveStaff();

    return {
      totalProducts: products.length,
      totalStock: stocks.reduce((sum, s) => sum + s.quantity, 0),
      lowStockItems,
      totalSalesToday,
      totalSalesAmount,
      activeStaff: activeStaff.length,
      totalStaff: staffUsers.length,
    };
  };

  const getTodayTransactions = (): Transaction[] => {
    const today = new Date().toISOString().split('T')[0];
    return transactions.filter((t) => t.date.split('T')[0] === today);
  };

  const getProductById = (id: string): Product | undefined => {
    return products.find((p) => p.id === id);
  };

  const getSupplierById = (id: string): Supplier | undefined => {
    return suppliers.find((s) => s.id === id);
  };

  const getStockByProductId = (productId: string): Stock | undefined => {
    return stocks.find((s) => s.productId === productId);
  };

  const getUnreadNotificationsCount = (): number => {
    if (!currentUser) return 0;
    return notifications.filter(
      (notification) => notification.userId === currentUser.id && !notification.read
    ).length;
  };

  const getAllUsers = (): User[] => {
    const usersJSON = localStorage.getItem('users');
    return usersJSON ? JSON.parse(usersJSON) : [];
  };

  const deleteUser = async (userId: string): Promise<void> => {
    if (!currentUser) throw new Error('User not authenticated');
    if (currentUser.role !== 'admin') throw new Error('Unauthorized');

    const users = getAllUsers();
    const userToDelete = users.find(u => u.id === userId);
    
    if (!userToDelete) throw new Error('User not found');
    if (userToDelete.role === 'admin') throw new Error('Cannot delete admin users');

    const updatedUsers = users.filter(u => u.id !== userId);
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    // Add activity log
    await addActivityLog(
      'Deleted staff account',
      `Deleted account: ${userToDelete.username}`
    );
  };

  const value: DataContextType = {
    products,
    suppliers,
    stocks,
    transactions,
    productStatuses,
    activityLogs,
    notifications,
    addProduct,
    addSupplier,
    addStock,
    addTransaction,
    addProductStatus,
    updateProductStatus,
    editProductStatus,
    addActivityLog,
    addNotification,
    markNotificationAsRead,
    exportProductStatusReport,
    getDashboardStats,
    getTodayTransactions,
    getProductById,
    getSupplierById,
    getStockByProductId,
    getUnreadNotificationsCount,
    getAllUsers,
    deleteUser,
    clockIn,
    clockOut,
    getActiveStaff,
    getTodayAttendance,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};