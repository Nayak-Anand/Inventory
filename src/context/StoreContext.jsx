import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../api/client';

const StoreContext = createContext();

const defaultSettings = {
  businessName: 'My Business',
  address: 'Your Address',
  gstin: '',
  state: 'State',
  stateCode: '01',
  logo: '',
  watermarkImage: '',
};

export function StoreProvider({ children }) {
  const { token, user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(false);

  // Fetch from API when logged in
  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [itemsRes, categoriesRes, customersRes, invoicesRes, suppliersRes, settingsRes] = await Promise.all([
        api.get('/items?limit=500'),
        api.get('/categories').catch(() => ({ data: [] })),
        api.get('/sales/customers'),
        api.get('/sales/invoices'),
        api.get('/suppliers').catch(() => ({ data: [] })),
        api.get('/settings').catch(() => ({ data: null })),
      ]);
      setCategories((categoriesRes.data || []).map((c) => ({ id: c.id || c._id, name: c.name })));
      setProducts((itemsRes.data?.data || itemsRes.data || []).map((p) => ({
        id: p.id || p._id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        price: p.price || 0,
        stock: p.stock || 0,
        minStock: p.reorderLevel || 5,
        unit: 'pcs',
        gstRate: p.gstRate ?? 18,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })));
      setCustomers((customersRes.data || []).map((c) => ({
        id: c.id || c._id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        address: c.address,
        gstin: c.gstin,
        creditLimit: c.creditLimit || 0,
        avatar: c.avatar,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })));
      setInvoices((invoicesRes.data || []).map((inv) => ({
        id: inv.id || inv._id,
        invoiceNumber: inv.invoiceNumber,
        customer: inv.customer,
        customerId: inv.customerId,
        date: inv.date,
        dueDate: inv.dueDate,
        paymentStatus: inv.paymentStatus === 'paid' ? 'received' : 'pending',
        receivedDate: inv.paymentReceivedAt,
        markedByUserId: inv.markedByUserId,
        markedByName: inv.markedByName,
        grandTotal: inv.grandTotal,
        subtotal: inv.subtotal,
        cgst: inv.cgst,
        sgst: inv.sgst,
        igst: inv.igst,
        gstType: inv.gstType,
        lines: inv.lines,
        createdAt: inv.createdAt,
      })));
      setSuppliers((suppliersRes.data || []).map((s) => ({
        id: s.id || s._id,
        name: s.name,
        phone: s.phone,
        email: s.email,
        address: s.address,
        gstin: s.gstin,
      })));
      if (settingsRes.data) {
        setSettings({
          ...defaultSettings,
          ...settingsRes.data,
        });
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addProduct = async (product) => {
    if (!token) return null;
    const { data } = await api.post('/items', {
      name: product.name,
      sku: product.sku || undefined,
      category: product.category || undefined,
      price: product.price || 0,
      gstRate: product.gstRate ?? 18,
      reorderLevel: product.minStock || 5,
      initialStock: parseInt(product.stock) || 0,
    });
    const id = data.id || data._id;
    setProducts((prev) => [...prev, {
      id,
      ...product,
      stock: product.stock || 0,
      gstRate: product.gstRate ?? 18,
    }]);
    return id;
  };

  const updateProduct = async (id, updates) => {
    if (!token) return;
    await api.put(`/items/${id}`, {
      name: updates.name,
      sku: updates.sku,
      category: updates.category,
      price: updates.price,
      gstRate: updates.gstRate,
      reorderLevel: updates.minStock,
    });
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProduct = async (id) => {
    if (!token) return;
    await api.delete(`/items/${id}`);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const addCustomer = async (customer) => {
    if (!token) return null;
    const { data } = await api.post('/sales/customers', customer);
    const id = data.id || data._id;
    setCustomers((prev) => [...prev, { ...data, id }]);
    return id;
  };

  const updateCustomer = async (id, updates) => {
    if (!token) return;
    await api.put(`/sales/customers/${id}`, updates);
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const deleteCustomer = async (id) => {
    if (!token) return;
    await api.delete(`/sales/customers/${id}`);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  const addSupplier = async (supplier) => {
    if (!token) return null;
    const { data } = await api.post('/suppliers', supplier);
    const id = data.id || data._id;
    setSuppliers((prev) => [...prev, { ...supplier, id }]);
    return id;
  };

  const updateSupplier = async (id, updates) => {
    if (!token) return;
    await api.put(`/suppliers/${id}`, updates);
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const deleteSupplier = async (id) => {
    if (!token) return;
    await api.delete(`/suppliers/${id}`);
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  const saveSettings = async (newSettings) => {
    if (!token) return;
    await api.put('/settings', newSettings);
    setSettings(newSettings);
  };

  const createInvoice = async (invoiceData) => {
    if (!token) return null;
    const items = invoiceData.items.map((i) => ({
      itemId: i.productId,
      itemName: i.name || i.product?.name,
      quantity: parseInt(i.quantity) || 0,
      rate: parseFloat(i.rate) || 0,
      unit: i.unit || 'pcs',
    }));
    const { data } = await api.post('/sales/invoices', {
      customerId: invoiceData.customer?.id || invoiceData.customerId,
      date: invoiceData.date,
      dueDate: invoiceData.dueDate ?? null,
      gstType: invoiceData.gstType || 'cgst_sgst',
      gstRate: invoiceData.gstRate ?? 18,
      items,
    });
    const inv = {
      id: data.id || data._id,
      invoiceNumber: data.invoiceNumber,
      customer: invoiceData.customer,
      date: data.date,
      dueDate: data.dueDate,
      paymentStatus: 'pending',
      grandTotal: data.grandTotal,
      subtotal: data.subtotal,
      cgst: data.cgst,
      sgst: data.sgst,
      igst: data.igst,
      gstType: data.gstType,
      lines: data.lines,
      createdAt: data.createdAt,
    };
    setInvoices((prev) => [inv, ...prev]);
    return inv;
  };

  const getProductById = (id) => products.find((p) => p.id === id);

  const updateInvoice = async (id, updates) => {
    if (!token) return;
    let paidResponse = null;
    if (updates.paymentStatus === 'received') {
      const { data } = await api.put(`/sales/invoices/${id}/paid`);
      paidResponse = data;
    }
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? {
              ...inv,
              ...updates,
              paymentStatus: updates.paymentStatus || inv.paymentStatus,
              receivedDate: paidResponse?.paymentReceivedAt ?? updates.receivedDate ?? inv.receivedDate,
              ...(updates.paymentStatus === 'received' && user?.name && { markedByName: user.name }),
            }
          : inv
      )
    );
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        customers,
        suppliers,
        invoices,
        settings,
        setSettings,
        saveSettings,
        loading,
        fetchData,
        addProduct,
        updateProduct,
        deleteProduct,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        createInvoice,
        updateInvoice,
        getProductById,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
}
