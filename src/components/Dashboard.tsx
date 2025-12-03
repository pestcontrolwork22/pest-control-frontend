import  { useState } from 'react';
import { AlertTriangle, Calendar, FileText, Bell, CheckCircle, XCircle } from 'lucide-react';

interface Contract {
  id: string;
  client: string;
  expiry: string;
  status: 'expired' | 'expiring';
}

interface Schedule {
  id: string;
  client: string;
  service: string;
  dueDate: string;
  daysOverdue: number;
}

const PestControlDashboard = () => {
  const [activeTab, setActiveTab] = useState<'actions' | 'reminders'>('actions');

  const expiredContracts: Contract[] = [
    { id: 'C001', client: 'Blue Ocean Restaurant', expiry: '2024-11-15', status: 'expired' },
    { id: 'C002', client: 'Green Valley Hotel', expiry: '2024-10-28', status: 'expired' },
    { id: 'C003', client: 'Sunrise Apartments', expiry: '2024-11-01', status: 'expired' }
  ];

  const overdueSchedules: Schedule[] = [
    { id: 'S001', client: 'Metro Shopping Mall', service: 'Rodent Control', dueDate: '2024-11-25', daysOverdue: 8 },
    { id: 'S002', client: 'City Hospital', service: 'Termite Inspection', dueDate: '2024-11-20', daysOverdue: 13 },
    { id: 'S003', client: 'Oakwood School', service: 'General Pest Treatment', dueDate: '2024-11-28', daysOverdue: 5 }
  ];

  const expiringContracts: Contract[] = [
    { id: 'C004', client: 'Riverside Cafe', expiry: '2024-12-15', status: 'expiring' },
    { id: 'C005', client: 'Harbor Warehouse', expiry: '2024-12-20', status: 'expiring' },
    { id: 'C006', client: 'Mountain View Resort', expiry: '2024-12-10', status: 'expiring' },
    { id: 'C007', client: 'Downtown Office Complex', expiry: '2024-12-25', status: 'expiring' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white p-2 rounded-lg">
                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Pest Control</h1>
                <p className="text-blue-100 text-sm">Professional Pest Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition">
                Dashboard
              </button>
              <button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition">
                Settings
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back!</h2>
          <p className="text-gray-600">Here's what needs your attention today</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('actions')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'actions'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-blue-50'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
            <span>Recommended Actions</span>
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'reminders'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-blue-50'
            }`}
          >
            <Bell className="w-5 h-5" />
            <span>Recommended Reminders</span>
          </button>
        </div>

        {/* Recommended Actions Tab */}
        {activeTab === 'actions' && (
          <div className="space-y-6">
            {/* Expired Contracts */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-red-500 text-white px-6 py-4 flex items-center space-x-3">
                <XCircle className="w-6 h-6" />
                <h3 className="text-xl font-bold">Expired Contracts</h3>
                <span className="bg-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                  {expiredContracts.length}
                </span>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {expiredContracts.map((contract) => (
                    <div key={contract.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center space-x-4">
                        <FileText className="w-8 h-8 text-red-600" />
                        <div>
                          <p className="font-semibold text-gray-800">{contract.client}</p>
                          <p className="text-sm text-gray-600">Contract ID: {contract.id}</p>
                          <p className="text-sm text-red-600 font-medium">Expired: {contract.expiry}</p>
                        </div>
                      </div>
                      <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition">
                        Renew Now
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Overdue Schedule Plans */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-orange-500 text-white px-6 py-4 flex items-center space-x-3">
                <Calendar className="w-6 h-6" />
                <h3 className="text-xl font-bold">Overdue Schedule Plans</h3>
                <span className="bg-orange-600 px-3 py-1 rounded-full text-sm font-semibold">
                  {overdueSchedules.length}
                </span>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {overdueSchedules.map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center space-x-4">
                        <Calendar className="w-8 h-8 text-orange-600" />
                        <div>
                          <p className="font-semibold text-gray-800">{schedule.client}</p>
                          <p className="text-sm text-gray-600">{schedule.service}</p>
                          <p className="text-sm text-orange-600 font-medium">
                            Due: {schedule.dueDate} ({schedule.daysOverdue} days overdue)
                          </p>
                        </div>
                      </div>
                      <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition">
                        Schedule Now
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recommended Reminders Tab */}
        {activeTab === 'reminders' && (
          <div className="space-y-6">
            {/* Expiring Contracts */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-yellow-500 text-white px-6 py-4 flex items-center space-x-3">
                <Bell className="w-6 h-6" />
                <h3 className="text-xl font-bold">Expiring Contracts</h3>
                <span className="bg-yellow-600 px-3 py-1 rounded-full text-sm font-semibold">
                  {expiringContracts.length}
                </span>
              </div>
              <div className="p-6">
                <p className="text-gray-600 mb-4">These contracts will expire soon. Consider reaching out to clients for renewal.</p>
                <div className="space-y-4">
                  {expiringContracts.map((contract) => (
                    <div key={contract.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center space-x-4">
                        <FileText className="w-8 h-8 text-yellow-600" />
                        <div>
                          <p className="font-semibold text-gray-800">{contract.client}</p>
                          <p className="text-sm text-gray-600">Contract ID: {contract.id}</p>
                          <p className="text-sm text-yellow-600 font-medium">Expiring: {contract.expiry}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">
                          Contact Client
                        </button>
                        <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition">
                          Send Reminder
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Active Contracts</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">47</p>
              </div>
              <CheckCircle className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Scheduled This Week</p>
                <p className="text-3xl font-bold text-green-600 mt-2">23</p>
              </div>
              <Calendar className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Action Required</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{expiredContracts.length + overdueSchedules.length}</p>
              </div>
              <AlertTriangle className="w-12 h-12 text-red-600" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PestControlDashboard;