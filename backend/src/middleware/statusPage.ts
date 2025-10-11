import { Request, Response } from 'express';

// Status page data interface
interface StatusPageData {
  status: 'operational' | 'degraded' | 'major_outage' | 'maintenance';
  uptime: {
    percentage: number;
    last24h: number;
    last7d: number;
    last30d: number;
  };
  services: {
    api: ServiceStatus;
    database: ServiceStatus;
    cache: ServiceStatus;
    email: ServiceStatus;
  };
  incidents: Incident[];
  lastUpdated: string;
}

interface ServiceStatus {
  status: 'operational' | 'degraded' | 'outage' | 'maintenance';
  name: string;
  description: string;
  lastChecked: string;
}

interface Incident {
  id: string;
  title: string;
  description: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  impact: 'none' | 'minor' | 'major' | 'critical';
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

// In-memory status tracking (can be replaced with database)
class StatusPage {
  private statusData: StatusPageData;
  private incidents: Incident[] = [];
  private uptimeHistory: boolean[] = []; // Last 30 days of hourly checks
  private maxHistoryDays = 30;

  constructor() {
    this.statusData = {
      status: 'operational',
      uptime: {
        percentage: 100,
        last24h: 100,
        last7d: 100,
        last30d: 100
      },
      services: {
        api: {
          status: 'operational',
          name: 'API Service',
          description: 'Main REST API endpoints',
          lastChecked: new Date().toISOString()
        },
        database: {
          status: 'operational',
          name: 'Database',
          description: 'MongoDB database connection',
          lastChecked: new Date().toISOString()
        },
        cache: {
          status: 'operational',
          name: 'Response Cache',
          description: 'In-memory response caching',
          lastChecked: new Date().toISOString()
        },
        email: {
          status: 'operational',
          name: 'Email Service',
          description: 'Government notification emails',
          lastChecked: new Date().toISOString()
        }
      },
      incidents: [],
      lastUpdated: new Date().toISOString()
    };

    // Initialize uptime history with all successful checks
    this.uptimeHistory = new Array(this.maxHistoryDays * 24).fill(true);
  }

  // Update service status
  updateServiceStatus(service: keyof StatusPageData['services'], status: ServiceStatus['status'], description?: string): void {
    this.statusData.services[service].status = status;
    this.statusData.services[service].lastChecked = new Date().toISOString();
    if (description) {
      this.statusData.services[service].description = description;
    }
    this.updateOverallStatus();
    this.statusData.lastUpdated = new Date().toISOString();
  }

  // Record uptime check
  recordUptimeCheck(success: boolean): void {
    this.uptimeHistory.push(success);

    // Keep only last 30 days
    if (this.uptimeHistory.length > this.maxHistoryDays * 24) {
      this.uptimeHistory = this.uptimeHistory.slice(-this.maxHistoryDays * 24);
    }

    this.calculateUptime();
  }

  // Calculate uptime percentages
  private calculateUptime(): void {
    const total = this.uptimeHistory.length;
    if (total === 0) return;

    const successful = this.uptimeHistory.filter(Boolean).length;
    const overallPercentage = (successful / total) * 100;

    // Last 24 hours (24 checks)
    const last24h = this.uptimeHistory.slice(-24);
    const last24hSuccessful = last24h.filter(Boolean).length;
    const last24hPercentage = last24h.length > 0 ? (last24hSuccessful / last24h.length) * 100 : 100;

    // Last 7 days (168 checks)
    const last7d = this.uptimeHistory.slice(-168);
    const last7dSuccessful = last7d.filter(Boolean).length;
    const last7dPercentage = last7d.length > 0 ? (last7dSuccessful / last7d.length) * 100 : 100;

    // Last 30 days (720 checks)
    const last30dSuccessful = successful;
    const last30dPercentage = overallPercentage;

    this.statusData.uptime = {
      percentage: Math.round(overallPercentage * 100) / 100,
      last24h: Math.round(last24hPercentage * 100) / 100,
      last7d: Math.round(last7dPercentage * 100) / 100,
      last30d: Math.round(last30dPercentage * 100) / 100
    };
  }

  // Update overall status based on services
  private updateOverallStatus(): void {
    const services = Object.values(this.statusData.services);
    const hasOutage = services.some(s => s.status === 'outage');
    const hasDegraded = services.some(s => s.status === 'degraded');
    const hasMaintenance = services.some(s => s.status === 'maintenance');

    if (hasOutage) {
      this.statusData.status = 'major_outage';
    } else if (hasMaintenance) {
      this.statusData.status = 'maintenance';
    } else if (hasDegraded) {
      this.statusData.status = 'degraded';
    } else {
      this.statusData.status = 'operational';
    }
  }

  // Create new incident
  createIncident(title: string, description: string, impact: Incident['impact'] = 'minor'): string {
    const incident: Incident = {
      id: `inc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      description,
      status: 'investigating',
      impact,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.incidents.unshift(incident); // Add to beginning
    this.statusData.incidents = this.incidents.slice(0, 10); // Keep only recent 10
    this.updateOverallStatus();

    return incident.id;
  }

  // Update incident status
  updateIncident(id: string, status: Incident['status'], description?: string): boolean {
    const incident = this.incidents.find(i => i.id === id);
    if (!incident) return false;

    incident.status = status;
    incident.updatedAt = new Date().toISOString();

    if (status === 'resolved') {
      incident.resolvedAt = new Date().toISOString();
    }

    if (description) {
      incident.description = description;
    }

    this.statusData.incidents = this.incidents.slice(0, 10);
    this.updateOverallStatus();

    return true;
  }

  // Get status page data
  getStatusData(): StatusPageData {
    return {
      ...this.statusData,
      incidents: this.incidents.slice(0, 10)
    };
  }

  // Get incidents
  getIncidents(limit: number = 10): Incident[] {
    return this.incidents.slice(0, limit);
  }

  // Get uptime history
  getUptimeHistory(days: number = 7): { date: string; uptime: number }[] {
    const hours = days * 24;
    const history = this.uptimeHistory.slice(-hours);

    const result = [];
    for (let i = 0; i < history.length; i += 24) {
      const dayData = history.slice(i, i + 24);
      const successful = dayData.filter(Boolean).length;
      const uptime = (successful / dayData.length) * 100;

      const date = new Date();
      date.setDate(date.getDate() - (days - Math.floor(i / 24) - 1));

      result.push({
        date: date.toISOString().split('T')[0],
        uptime: Math.round(uptime * 100) / 100
      });
    }

    return result;
  }
}

// Export singleton instance
export const statusPage = new StatusPage();

// Status page HTML template
export const getStatusPageHTML = (data: StatusPageData): string => {
  const statusColors = {
    operational: '#10b981',
    degraded: '#f59e0b',
    major_outage: '#ef4444',
    maintenance: '#8b5cf6'
  };

  const statusText = {
    operational: 'All Systems Operational',
    degraded: 'Degraded Performance',
    major_outage: 'Major Outage',
    maintenance: 'Under Maintenance'
  };

  const serviceStatusColors = {
    operational: '#10b981',
    degraded: '#f59e0b',
    outage: '#ef4444',
    maintenance: '#8b5cf6'
  };

  const incidentStatusColors = {
    investigating: '#f59e0b',
    identified: '#ef4444',
    monitoring: '#f59e0b',
    resolved: '#10b981'
  };

  const impactColors = {
    none: '#6b7280',
    minor: '#f59e0b',
    major: '#ef4444',
    critical: '#7f1d1d'
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CareConnect API Status</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f8fafc;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 40px 0;
            background: white;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 14px;
            color: white;
            background: ${statusColors[data.status]};
        }

        .status-indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: currentColor;
        }

        .uptime-section {
            background: white;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .uptime-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }

        .uptime-card {
            text-align: center;
            padding: 20px;
            background: #f8fafc;
            border-radius: 8px;
        }

        .uptime-percentage {
            font-size: 32px;
            font-weight: bold;
            color: #10b981;
            margin-bottom: 5px;
        }

        .services-section {
            background: white;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .service-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 15px 0;
            border-bottom: 1px solid #e5e7eb;
        }

        .service-item:last-child {
            border-bottom: none;
        }

        .service-info {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .service-status {
            width: 12px;
            height: 12px;
            border-radius: 50%;
        }

        .incidents-section {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .incident-item {
            padding: 20px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            margin-bottom: 15px;
        }

        .incident-item:last-child {
            margin-bottom: 0;
        }

        .incident-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 10px;
        }

        .incident-title {
            font-weight: 600;
            margin-bottom: 5px;
        }

        .incident-meta {
            display: flex;
            gap: 10px;
            font-size: 12px;
            color: #6b7280;
        }

        .footer {
            text-align: center;
            margin-top: 40px;
            color: #6b7280;
            font-size: 14px;
        }

        @media (max-width: 768px) {
            .container {
                padding: 10px;
            }

            .uptime-grid {
                grid-template-columns: 1fr;
            }

            .incident-header {
                flex-direction: column;
                gap: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>CareConnect API Status</h1>
            <p>Real-time status and uptime monitoring</p>
            <div class="status-badge">
                <div class="status-indicator"></div>
                ${statusText[data.status]}
            </div>
            <p style="margin-top: 10px; color: #6b7280; font-size: 14px;">
                Last updated: ${new Date(data.lastUpdated).toLocaleString()}
            </p>
        </div>

        <div class="uptime-section">
            <h2>Uptime Statistics</h2>
            <div class="uptime-grid">
                <div class="uptime-card">
                    <div class="uptime-percentage">${data.uptime.percentage}%</div>
                    <div>Overall (30 days)</div>
                </div>
                <div class="uptime-card">
                    <div class="uptime-percentage">${data.uptime.last7d}%</div>
                    <div>Last 7 days</div>
                </div>
                <div class="uptime-card">
                    <div class="uptime-percentage">${data.uptime.last24h}%</div>
                    <div>Last 24 hours</div>
                </div>
            </div>
        </div>

        <div class="services-section">
            <h2>Services</h2>
            ${Object.values(data.services).map(service => `
                <div class="service-item">
                    <div class="service-info">
                        <div class="service-status" style="background: ${serviceStatusColors[service.status]}"></div>
                        <div>
                            <div style="font-weight: 600;">${service.name}</div>
                            <div style="font-size: 14px; color: #6b7280;">${service.description}</div>
                        </div>
                    </div>
                    <div style="font-size: 14px; color: #6b7280;">
                        ${service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                    </div>
                </div>
            `).join('')}
        </div>

        <div class="incidents-section">
            <h2>Recent Incidents</h2>
            ${data.incidents.length > 0 ? data.incidents.map(incident => `
                <div class="incident-item">
                    <div class="incident-header">
                        <div>
                            <div class="incident-title">${incident.title}</div>
                            <div style="color: #6b7280; margin-bottom: 10px;">${incident.description}</div>
                        </div>
                        <div class="incident-meta">
                            <span style="color: ${incidentStatusColors[incident.status]}">${incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}</span>
                            <span style="color: ${impactColors[incident.impact]}">${incident.impact.charAt(0).toUpperCase() + incident.impact.slice(1)} Impact</span>
                        </div>
                    </div>
                    <div style="font-size: 12px; color: #6b7280;">
                        Created: ${new Date(incident.createdAt).toLocaleString()}
                        ${incident.resolvedAt ? ` • Resolved: ${new Date(incident.resolvedAt).toLocaleString()}` : ''}
                    </div>
                </div>
            `).join('') : '<p style="color: #6b7280; text-align: center; padding: 40px;">No recent incidents</p>'}
        </div>

        <div class="footer">
            <p>© 2025 CareConnect. This status page is updated automatically.</p>
            <p>For support, contact <a href="mailto:support@careconnect.org">support@careconnect.org</a></p>
        </div>
    </div>
</body>
</html>`;
};

// Status page endpoint handler
export const getStatusPage = (req: Request, res: Response) => {
  try {
    const data = statusPage.getStatusData();

    // Check if client accepts HTML
    const acceptsHTML = req.headers.accept && req.headers.accept.includes('text/html');

    if (acceptsHTML) {
      // Return HTML status page
      const html = getStatusPageHTML(data);
      res.set('Content-Type', 'text/html');
      res.status(200).send(html);
    } else {
      // Return JSON API response
      res.status(200).json({
        success: true,
        message: 'Status page data retrieved successfully',
        data,
        apiVersion: 'v1',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve status page',
      error: error instanceof Error ? error.message : 'Unknown error',
      apiVersion: 'v1',
      timestamp: new Date().toISOString()
    });
  }
};

// Incident management endpoints
export const createIncident = (req: Request, res: Response): void => {
  try {
    const { title, description, impact } = req.body;

    if (!title || !description) {
      res.status(400).json({
        success: false,
        message: 'Title and description are required',
        apiVersion: 'v1',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const incidentId = statusPage.createIncident(title, description, impact);

    res.status(201).json({
      success: true,
      message: 'Incident created successfully',
      data: { incidentId },
      apiVersion: 'v1',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create incident',
      error: error instanceof Error ? error.message : 'Unknown error',
      apiVersion: 'v1',
      timestamp: new Date().toISOString()
    });
  }
};

export const updateIncident = (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const { status, description } = req.body;

    if (!status) {
      res.status(400).json({
        success: false,
        message: 'Status is required',
        apiVersion: 'v1',
        timestamp: new Date().toISOString()
      });
      return;
    }

    const updated = statusPage.updateIncident(id, status, description);

    if (!updated) {
      res.status(404).json({
        success: false,
        message: 'Incident not found',
        apiVersion: 'v1',
        timestamp: new Date().toISOString()
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Incident updated successfully',
      apiVersion: 'v1',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update incident',
      error: error instanceof Error ? error.message : 'Unknown error',
      apiVersion: 'v1',
      timestamp: new Date().toISOString()
    });
  }
};

export const getIncidents = (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const incidents = statusPage.getIncidents(limit);

    res.status(200).json({
      success: true,
      message: 'Incidents retrieved successfully',
      data: incidents,
      apiVersion: 'v1',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve incidents',
      error: error instanceof Error ? error.message : 'Unknown error',
      apiVersion: 'v1',
      timestamp: new Date().toISOString()
    });
  }
};