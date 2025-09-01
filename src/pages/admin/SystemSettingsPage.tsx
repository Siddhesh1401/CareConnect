import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  Database, 
  Mail, 
  Shield, 
  Globe,
  Bell,
  Users,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const SystemSettingsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'CareConnect',
    siteDescription: 'Connecting volunteers with NGOs for meaningful impact',
    contactEmail: 'admin@careconnect.com',
    supportPhone: '+91 98765 43210',
    maintenanceMode: false,
    registrationEnabled: true
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUsername: 'noreply@careconnect.com',
    smtpPassword: '',
    fromEmail: 'noreply@careconnect.com',
    fromName: 'CareConnect Team'
  });

  const [securitySettings, setSecuritySettings] = useState({
    passwordMinLength: 8,
    requireSpecialChars: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    twoFactorRequired: false,
    ipWhitelist: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    adminAlerts: true,
    systemAlerts: true,
    maintenanceAlerts: true
  });

  const handleGeneralChange = (field: string, value: string | boolean) => {
    setGeneralSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleEmailChange = (field: string, value: string) => {
    setEmailSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSecurityChange = (field: string, value: string | boolean | number) => {
    setSecuritySettings(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    setSaveStatus('idle');

    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const settingsData = {
        general: generalSettings,
        email: emailSettings,
        security: securitySettings,
        notifications: notificationSettings
      };

      console.log('Saving system settings:', settingsData);
      
      // In a real app, this would be an API call
      // await api.saveSystemSettings(settingsData);
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const testEmailConnection = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Testing email connection with:', emailSettings);
      alert('Email connection test successful!');
    } catch (error) {
      alert('Email connection test failed!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full"></div>
          
          <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Settings className="w-8 h-8" />
                </div>
                <span>System Settings</span>
              </h1>
              <p className="text-blue-100 mt-2">Configure platform settings and preferences</p>
            </div>
            <div className="flex space-x-3">
              <Button 
                onClick={handleSaveSettings}
                isLoading={isLoading}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30 text-white"
              >
                <Save className="mr-2 w-4 h-4" />
                Save All Settings
              </Button>
              {saveStatus === 'success' && (
                <div className="flex items-center space-x-2 bg-green-500/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm">Settings saved successfully</span>
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="flex items-center space-x-2 bg-red-500/20 px-4 py-2 rounded-lg backdrop-blur-sm">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-sm">Failed to save settings</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* General Settings */}
          <Card className="p-6 bg-white/70 backdrop-blur-sm border border-blue-200/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-gray-900">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span>General Settings</span>
            </h3>
            
            <div className="space-y-4">
              <Input
                label="Site Name"
                value={generalSettings.siteName}
                onChange={(e) => handleGeneralChange('siteName', e.target.value)}
                placeholder="CareConnect"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Description
                </label>
                <textarea
                  value={generalSettings.siteDescription}
                  onChange={(e) => handleGeneralChange('siteDescription', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Platform description"
                />
              </div>
              
              <Input
                label="Contact Email"
                type="email"
                value={generalSettings.contactEmail}
                onChange={(e) => handleGeneralChange('contactEmail', e.target.value)}
                placeholder="admin@careconnect.com"
              />
              
              <Input
                label="Support Phone"
                value={generalSettings.supportPhone}
                onChange={(e) => handleGeneralChange('supportPhone', e.target.value)}
                placeholder="+91 98765 43210"
              />
              
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={generalSettings.maintenanceMode}
                    onChange={(e) => handleGeneralChange('maintenanceMode', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Maintenance Mode</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={generalSettings.registrationEnabled}
                    onChange={(e) => handleGeneralChange('registrationEnabled', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">User Registration Enabled</span>
                </label>
              </div>
            </div>
          </Card>

          {/* Email Settings */}
          <Card className="p-6 bg-white/70 backdrop-blur-sm border border-blue-200/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-gray-900">
              <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <span>Email Settings</span>
            </h3>
            
            <div className="space-y-4">
              <Input
                label="SMTP Host"
                value={emailSettings.smtpHost}
                onChange={(e) => handleEmailChange('smtpHost', e.target.value)}
                placeholder="smtp.gmail.com"
              />
              
              <Input
                label="SMTP Port"
                value={emailSettings.smtpPort}
                onChange={(e) => handleEmailChange('smtpPort', e.target.value)}
                placeholder="587"
              />
              
              <Input
                label="SMTP Username"
                value={emailSettings.smtpUsername}
                onChange={(e) => handleEmailChange('smtpUsername', e.target.value)}
                placeholder="username@domain.com"
              />
              
              <Input
                label="SMTP Password"
                type="password"
                value={emailSettings.smtpPassword}
                onChange={(e) => handleEmailChange('smtpPassword', e.target.value)}
                placeholder="••••••••"
              />
              
              <Input
                label="From Email"
                type="email"
                value={emailSettings.fromEmail}
                onChange={(e) => handleEmailChange('fromEmail', e.target.value)}
                placeholder="noreply@careconnect.com"
              />
              
              <Input
                label="From Name"
                value={emailSettings.fromName}
                onChange={(e) => handleEmailChange('fromName', e.target.value)}
                placeholder="CareConnect Team"
              />
              
              <Button 
                variant="outline" 
                onClick={testEmailConnection}
                isLoading={isLoading}
                className="w-full"
              >
                Test Email Connection
              </Button>
            </div>
          </Card>

          {/* Security Settings */}
          <Card className="p-6 bg-white/70 backdrop-blur-sm border border-blue-200/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-gray-900">
              <div className="p-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span>Security Settings</span>
            </h3>
            
            <div className="space-y-4">
              <Input
                label="Minimum Password Length"
                type="number"
                value={securitySettings.passwordMinLength.toString()}
                onChange={(e) => handleSecurityChange('passwordMinLength', parseInt(e.target.value))}
                min="6"
                max="20"
              />
              
              <Input
                label="Session Timeout (minutes)"
                type="number"
                value={securitySettings.sessionTimeout.toString()}
                onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
                min="5"
                max="120"
              />
              
              <Input
                label="Max Login Attempts"
                type="number"
                value={securitySettings.maxLoginAttempts.toString()}
                onChange={(e) => handleSecurityChange('maxLoginAttempts', parseInt(e.target.value))}
                min="3"
                max="10"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IP Whitelist (comma-separated)
                </label>
                <textarea
                  value={securitySettings.ipWhitelist}
                  onChange={(e) => handleSecurityChange('ipWhitelist', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="192.168.1.1, 10.0.0.1"
                />
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={securitySettings.requireSpecialChars}
                    onChange={(e) => handleSecurityChange('requireSpecialChars', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Require Special Characters in Password</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={securitySettings.twoFactorRequired}
                    onChange={(e) => handleSecurityChange('twoFactorRequired', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Require Two-Factor Authentication</span>
                </label>
              </div>
            </div>
          </Card>

          {/* Notification Settings */}
          <Card className="p-6 bg-white/70 backdrop-blur-sm border border-blue-200/50 shadow-xl hover:shadow-2xl transition-all duration-300">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-gray-900">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <span>Notification Settings</span>
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">User Notifications</h4>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={notificationSettings.emailNotifications}
                    onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Email Notifications</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={notificationSettings.pushNotifications}
                    onChange={(e) => handleNotificationChange('pushNotifications', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Push Notifications</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={notificationSettings.smsNotifications}
                    onChange={(e) => handleNotificationChange('smsNotifications', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">SMS Notifications</span>
                </label>
              </div>
              
              <div className="space-y-3 pt-4 border-t border-blue-100">
                <h4 className="font-medium text-gray-900">System Alerts</h4>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={notificationSettings.adminAlerts}
                    onChange={(e) => handleNotificationChange('adminAlerts', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Admin Alerts</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={notificationSettings.systemAlerts}
                    onChange={(e) => handleNotificationChange('systemAlerts', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">System Performance Alerts</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={notificationSettings.maintenanceAlerts}
                    onChange={(e) => handleNotificationChange('maintenanceAlerts', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Maintenance Alerts</span>
                </label>
              </div>
            </div>
          </Card>
        </div>

        {/* Database Status */}
        <Card className="p-6 bg-blue-50 border border-blue-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 text-gray-900">
            <Database className="w-5 h-5 text-blue-600" />
            <span>System Status</span>
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">Online</div>
              <div className="text-sm text-gray-600">Database Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">98.5%</div>
              <div className="text-sm text-gray-600">System Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">245</div>
              <div className="text-sm text-gray-600">Active Sessions</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};