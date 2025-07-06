import React, { useState, useEffect } from 'react';
import api, { companyAPI } from '../../services/api';

interface Company {
  _id: string;
  name: string;
  subdomain: string;
  email: string;
  phone: string;
  plan: string;
  isActive: boolean;
  createdAt: string;
}

interface User {
  _id: string;
  id?: string; // For compatibility
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  company?: string;
  createdAt: string;
}

interface Stats {
  totalCompanies: number;
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  activeCompanies: number;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateCompany, setShowCreateCompany] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New company form
  const [newCompany, setNewCompany] = useState({
    name: '',
    subdomain: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    branding: {
      primaryColor: '#4F46E5',
      secondaryColor: '#10B981'
    },
    paymentConfig: {
      stripePublicKey: '',
      stripeSecretKey: ''
    },
    emailConfig: {
      fromEmail: '',
      fromName: ''
    }
  });

  const [companyLogoFile, setCompanyLogoFile] = useState<File | null>(null);

  useEffect(() => {
    // Check if user is authenticated and has admin role
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required. Please log in.');
      return;
    }
    
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [companiesRes, usersRes] = await Promise.all([
        companyAPI.getAll(),
        api.get('/users')
      ]);
      
      setCompanies(companiesRes.data);
      setUsers(usersRes.data.users || usersRes.data);
      
      // Calculate stats
      const totalCompanies = companiesRes.data.length;
      const activeCompanies = companiesRes.data.filter((c: Company) => c.isActive).length;
      const totalUsers = usersRes.data.length;
      
      setStats({
        totalCompanies,
        activeCompanies,
        totalUsers,
        totalBookings: 0, // TODO: Add booking count
        totalRevenue: 0   // TODO: Add revenue calculation
      });
    } catch (error: any) {
      console.error('Error loading admin data:', error);
      if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (error.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else {
        setError('Error loading data. Please try again.');
      }
    }
    setLoading(false);
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    let logoUrl = '';
    if (companyLogoFile) {
      const formData = new FormData();
      formData.append('image', companyLogoFile);
      try {
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        logoUrl = uploadData.url;
      } catch (err) {
        setError('Failed to upload logo.');
        return;
      }
    }
    try {
      await companyAPI.create({ ...newCompany, logoUrl });
      setShowCreateCompany(false);
      setNewCompany({
        name: '',
        subdomain: '',
        email: '',
        phone: '',
        address: { street: '', city: '', state: '', zipCode: '' },
        branding: { primaryColor: '#4F46E5', secondaryColor: '#10B981' },
        paymentConfig: { stripePublicKey: '', stripeSecretKey: '' },
        emailConfig: { fromEmail: '', fromName: '' }
      });
      setCompanyLogoFile(null);
      loadData();
      alert('Company created successfully!');
    } catch (error: any) {
      console.error('Error creating company:', error);
      if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (error.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else {
        setError('Error creating company: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleDeleteCompany = async (companyId: string, companyName: string) => {
    if (window.confirm(`Are you sure you want to delete "${companyName}"?`)) {
      setError(null);
      try {
        await companyAPI.delete(companyId);
        loadData();
        alert('Company deleted successfully!');
      } catch (error: any) {
        console.error('Error deleting company:', error);
        if (error.response?.status === 401) {
          setError('Authentication failed. Please log in again.');
        } else if (error.response?.status === 403) {
          setError('Access denied. Admin privileges required.');
        } else {
          setError('Error deleting company. Please try again.');
        }
      }
    }
  };

  const toggleCompanyStatus = async (companyId: string, isActive: boolean) => {
    setError(null);
    try {
      await companyAPI.update(companyId, { isActive: !isActive });
      loadData();
    } catch (error: any) {
      console.error('Error updating company status:', error);
      if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (error.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else {
        setError('Error updating company status. Please try again.');
      }
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Platform Overview</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="text-sm font-medium text-gray-500">Total Companies</div>
          <div className="text-2xl font-bold text-gray-900">{stats?.totalCompanies || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="text-sm font-medium text-gray-500">Active Companies</div>
          <div className="text-2xl font-bold text-gray-900">{stats?.activeCompanies || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
          <div className="text-sm font-medium text-gray-500">Total Users</div>
          <div className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="text-sm font-medium text-gray-500">Total Bookings</div>
          <div className="text-2xl font-bold text-gray-900">{stats?.totalBookings || 0}</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Recent Companies</h3>
        <div className="space-y-3">
          {companies.slice(0, 5).map(company => (
            <div key={company._id} className="flex items-center justify-between py-2 border-b">
              <div>
                <div className="font-medium">{company.name}</div>
                <div className="text-sm text-gray-500">{company.subdomain}.yourdomain.com</div>
              </div>
              <div className="text-right">
                <div className={`inline-block px-2 py-1 rounded text-xs ${
                  company.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {company.isActive ? 'Active' : 'Inactive'}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(company.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCompanies = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Manage Companies</h2>
        <button
          onClick={() => setShowCreateCompany(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + Add New Company
        </button>
      </div>

      {/* Companies Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subdomain
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plan
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {companies.map(company => (
              <tr key={company._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{company.name}</div>
                    <div className="text-sm text-gray-500">{company.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <a 
                    href={`http://${company.subdomain}.localhost:3000`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {company.subdomain}.yourdomain.com
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {company.plan}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => toggleCompanyStatus(company._id, company.isActive)}
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      company.isActive 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {company.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button className="text-blue-600 hover:text-blue-900">Edit</button>
                  <button 
                    onClick={() => handleDeleteCompany(company._id, company.name)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Manage Users</h2>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.role === 'admin' ? 'bg-red-100 text-red-800' :
                    user.role === 'company-admin' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {typeof user.company === 'object' && user.company !== null
                    ? (user.company as { name?: string; _id?: string }).name || (user.company as { _id?: string })._id || 'N/A'
                    : user.company || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Create Company Modal
  const renderCreateCompanyModal = () => (
    showCreateCompany && (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Create New Company</h3>
          
          <form onSubmit={handleCreateCompany} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subdomain *</label>
                <input
                  type="text"
                  value={newCompany.subdomain}
                  onChange={(e) => setNewCompany(prev => ({ ...prev, subdomain: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="company-name"
                  required
                />
                <div className="text-xs text-gray-500 mt-1">
                  Will be accessible at: {newCompany.subdomain}.yourdomain.com
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={newCompany.email}
                  onChange={(e) => setNewCompany(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  value={newCompany.phone}
                  onChange={(e) => setNewCompany(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={newCompany.address.street}
                  onChange={(e) => setNewCompany(prev => ({ 
                    ...prev, 
                    address: { ...prev.address, street: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={newCompany.address.city}
                  onChange={(e) => setNewCompany(prev => ({ 
                    ...prev, 
                    address: { ...prev.address, city: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                <input
                  type="text"
                  value={newCompany.address.state}
                  onChange={(e) => setNewCompany(prev => ({ 
                    ...prev, 
                    address: { ...prev.address, state: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code *</label>
                <input
                  type="text"
                  value={newCompany.address.zipCode}
                  onChange={(e) => setNewCompany(prev => ({ 
                    ...prev, 
                    address: { ...prev.address, zipCode: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stripe Public Key</label>
                <input
                  type="text"
                  value={newCompany.paymentConfig.stripePublicKey}
                  onChange={(e) => setNewCompany(prev => ({ 
                    ...prev, 
                    paymentConfig: { ...prev.paymentConfig, stripePublicKey: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="pk_test_..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stripe Secret Key</label>
                <input
                  type="password"
                  value={newCompany.paymentConfig.stripeSecretKey}
                  onChange={(e) => setNewCompany(prev => ({ 
                    ...prev, 
                    paymentConfig: { ...prev.paymentConfig, stripeSecretKey: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="sk_test_..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Email *</label>
                <input
                  type="email"
                  value={newCompany.emailConfig.fromEmail}
                  onChange={(e) => setNewCompany(prev => ({ 
                    ...prev, 
                    emailConfig: { ...prev.emailConfig, fromEmail: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Name *</label>
                <input
                  type="text"
                  value={newCompany.emailConfig.fromName}
                  onChange={(e) => setNewCompany(prev => ({ 
                    ...prev, 
                    emailConfig: { ...prev.emailConfig, fromName: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Logo</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setCompanyLogoFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateCompany(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Company
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );

  // Simple fallback render to test if component is working
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600">{error}</p>
            <button 
              onClick={() => window.location.href = '/login'}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Platform Admin</h1>
            <div className="text-sm text-gray-500">
              Welcome, Super Admin
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'companies', name: 'Companies' },
              { id: 'users', name: 'Users' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-lg text-gray-600">Loading...</div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'companies' && renderCompanies()}
            {activeTab === 'users' && renderUsers()}
          </>
        )}
      </div>

      {/* Modals */}
      {renderCreateCompanyModal()}
    </div>
  );
};

export default AdminDashboard;