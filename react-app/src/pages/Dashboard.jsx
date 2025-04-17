import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import Card from '../components/common/Card';
import KPICard from '../components/common/KPICard';
import Table from '../components/common/Table';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import dashboardService from '../services/api/dashboardService';
import mockDashboardService from '../services/api/mockDashboardService';
import mockDashboardChartsService from '../services/api/mockDashboardChartsService';

/**
 * @typedef {Object} KPIData
 * @property {number} activeVehicles - Number of active vehicles
 * @property {number} activeDrivers - Number of active drivers
 * @property {number} dailyCosts - Daily costs
 * @property {number} potentialSavings - Potential savings
 * @property {number} safetyIndex - Safety index
 * @property {number} maintenanceForecast - Maintenance forecast
 * @property {number} fraudAlerts - Number of fraud alerts
 */

/**
 * @typedef {Object} Alert
 * @property {string} id - Alert ID
 * @property {string} priority - Alert priority
 * @property {string} description - Alert description
 * @property {string} vehicle - Vehicle ID
 * @property {string} date - Alert date
 * @property {string} status - Alert status
 */

/**
 * @typedef {Object} MapData
 * @property {Array} points - Map points
 */

/**
 * @typedef {Object} FleetStatistics
 * @property {Object} fuelConsumption - Fuel consumption data
 * @property {Object} driverEfficiency - Driver efficiency data
 * @property {Object} operationalCosts - Operational costs data
 * @property {Object} routeCompletion - Route completion data
 */

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 500;
  color: #333;
  margin: 0 0 16px 0;
`;

const GridSection = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MapContainer = styled.div`
  height: 400px;
  background-color: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
`;

const MapPlaceholder = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #666;
`;

const MapPoint = styled.div`
  position: absolute;
  top: ${props => props.y}%;
  left: ${props => props.x}%;
  width: 12px;
  height: 12px;
  background-color: ${props => props.color};
  border-radius: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  
  &:hover {
    width: 16px;
    height: 16px;
    z-index: 10;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 24px;
    height: 24px;
    background-color: ${props => props.color}33;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    z-index: -1;
  }
`;

const MapTooltip = styled.div`
  position: absolute;
  background-color: white;
  border-radius: 4px;
  padding: 8px 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 100;
  display: ${props => props.visible ? 'block' : 'none'};
  max-width: 200px;
`;

const LoadingIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  color: #666;
`;

const ErrorMessage = styled.div`
  color: #d32f2f;
  padding: 16px;
  background-color: #ffebee;
  border-radius: 4px;
  margin-bottom: 20px;
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 20px;
`;

const Tab = styled.div`
  padding: 12px 24px;
  cursor: pointer;
  font-weight: ${props => props.active ? '500' : 'normal'};
  color: ${props => props.active ? '#3f51b5' : '#666'};
  border-bottom: 2px solid ${props => props.active ? '#3f51b5' : 'transparent'};
  transition: all 0.3s ease;
  
  &:hover {
    color: #3f51b5;
    background-color: #f5f5f5;
  }
`;

const ViewAllButton = styled.button`
  background-color: transparent;
  border: none;
  color: #3f51b5;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  text-align: center;
  display: block;
  margin: 16px auto 0;
  
  &:hover {
    text-decoration: underline;
    background-color: #f5f5f5;
    border-radius: 4px;
  }
`;

const ChartContainer = styled.div`
  height: 250px;
  background-color: #f9f9f9;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #666;
  margin-top: 12px;
`;

const RankingContainer = styled.div`
  margin-top: 12px;
`;

const RankingItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const RankingName = styled.div`
  font-weight: ${props => props.highlighted ? '500' : 'normal'};
`;

const RankingValue = styled.div`
  color: ${props => props.positive ? '#4caf50' : props.negative ? '#f44336' : '#666'};
  font-weight: 500;
`;

const DataSourceToggle = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const ToggleLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
`;

const ToggleSwitch = styled.div`
  position: relative;
  width: 50px;
  height: 24px;
  background-color: ${props => props.checked ? '#3f51b5' : '#ccc'};
  border-radius: 12px;
  margin: 0 8px;
  transition: background-color 0.3s;
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.checked ? '26px' : '2px'};
    width: 20px;
    height: 20px;
    background-color: white;
    border-radius: 50%;
    transition: left 0.3s;
  }
`;

/**
 * Dashboard component displaying KPIs, alerts, fleet statistics, and fleet map
 * @returns {JSX.Element} Dashboard component
 */
const Dashboard = () => {
  // Stan dla danych KPI
  const [kpiData, setKpiData] = useState(null);
  
  // Stan dla alertów
  const [alerts, setAlerts] = useState(null);
  
  // Stan dla danych mapy
  const [mapData, setMapData] = useState(null);
  
  // Stan dla statystyk floty
  const [fleetStats, setFleetStats] = useState(null);
  
  // Stan dla aktywnej zakładki alertów
  const [activeAlertTab, setActiveAlertTab] = useState('fraud');
  
  // Stan dla aktywnej zakładki mapy
  const [activeMapTab, setActiveMapTab] = useState('vehicles');
  
  // Stan dla tooltipa mapy
  const [tooltip, setTooltip] = useState({
    visible: false,
    content: '',
    x: 0,
    y: 0
  });
  
  // Stany dla danych wykresów
  const [fraudRiskData, setFraudRiskData] = useState(null);
  const [fuelConsumptionData, setFuelConsumptionData] = useState(null);
  const [operationalCostsData, setOperationalCostsData] = useState(null);
  
  // Stany ładowania i błędów
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Stan dla przełącznika źródła danych (API vs Mock)
  const [useMockData, setUseMockData] = useState(true);
  
  // Rejestracja komponentów Chart.js
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
  );
  
  // Wybór serwisu danych na podstawie stanu przełącznika
  const dataService = useMockData ? mockDashboardService : dashboardService;
  
  // Pobieranie danych przy montowaniu komponentu lub zmianie źródła danych
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Pobieranie danych KPI
        const kpiResponse = await dataService.getKPIData();
        setKpiData(kpiResponse);
        
        // Pobieranie alertów
        const alertsResponse = await dataService.getAlerts();
        setAlerts(alertsResponse);
        
        // Pobieranie danych mapy
        const mapResponse = await dataService.getMapData('vehicles');
        setMapData(mapResponse);
        
        // Pobieranie danych wykresów
        const fraudRiskResponse = await mockDashboardChartsService.getFraudRiskData();
        setFraudRiskData(fraudRiskResponse);
        
        const fuelConsumptionResponse = await mockDashboardChartsService.getFuelConsumptionData();
        setFuelConsumptionData(fuelConsumptionResponse);
        
        const operationalCostsResponse = await mockDashboardChartsService.getOperationalCostsData();
        setOperationalCostsData(operationalCostsResponse);
        
        // Pobieranie statystyk floty (symulacja - w rzeczywistości byłoby to z API)
        setFleetStats({
          fuelConsumption: {
            current: fuelConsumptionResponse.current,
            previous: fuelConsumptionResponse.previous,
            trend: 'down',
            trendValue: `${Math.abs(fuelConsumptionResponse.change).toFixed(1)}%`,
            chartData: fuelConsumptionResponse.trend.map(item => item.value)
          },
          driverEfficiency: {
            drivers: [
              { id: 'D001', name: 'Jan Kowalski', score: 92, trend: 'up' },
              { id: 'D002', name: 'Anna Nowak', score: 88, trend: 'up' },
              { id: 'D003', name: 'Piotr Wiśniewski', score: 85, trend: 'down' },
              { id: 'D004', name: 'Katarzyna Dąbrowska', score: 82, trend: 'up' },
              { id: 'D005', name: 'Tomasz Lewandowski', score: 78, trend: 'down' }
            ]
          },
          operationalCosts: {
            total: operationalCostsResponse.total,
            breakdown: operationalCostsResponse.breakdown
          },
          routeCompletion: {
            completed: 87,
            onTime: 82,
            delayed: 5,
            cancelled: 13
          }
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Nie udało się pobrać danych dashboardu. Spróbuj odświeżyć stronę.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [dataService, useMockData]);
  
  // Obsługa zmiany typu danych mapy
  const handleMapTypeChange = async (type) => {
    try {
      setIsLoading(true);
      setActiveMapTab(type);
      const mapResponse = await dataService.getMapData(type);
      setMapData(mapResponse);
    } catch (err) {
      console.error('Error fetching map data:', err);
      setError('Nie udało się pobrać danych mapy.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Obsługa pokazywania tooltipa na mapie
  const handleMapPointHover = (point, event) => {
    const rect = event.target.getBoundingClientRect();
    setTooltip({
      visible: true,
      content: `${point.label} (${point.type})`,
      x: rect.left,
      y: rect.top - 30
    });
  };
  
  // Obsługa ukrywania tooltipa na mapie
  const handleMapPointLeave = () => {
    setTooltip({
      ...tooltip,
      visible: false
    });
  };
  
  // Obsługa przełączania źródła danych
  const handleToggleDataSource = () => {
    setUseMockData(!useMockData);
  };
  
  // Renderowanie sekcji KPI
  const renderKPISection = () => {
    if (!kpiData) return null;
    
    return (
      <>
        <SectionTitle>KLUCZOWE WSKAŹNIKI</SectionTitle>
        <GridSection>
          <KPICard 
            title="Aktywne pojazdy" 
            value={kpiData.activeVehicles.toString()} 
            icon="🚚"
            trend="up"
            trendValue="5%"
          />
          <KPICard 
            title="Aktywni kierowcy" 
            value={kpiData.activeDrivers.toString()} 
            icon="👤"
            trend="up"
            trendValue="3%"
          />
          <KPICard 
            title="Dzienne koszty" 
            value={`${kpiData.dailyCosts.toLocaleString()} zł`} 
            icon="💰"
            trend="down"
            trendValue="2%"
            trendPositive
          />
          <KPICard 
            title="Potencjalne oszczędności" 
            value={`${kpiData.potentialSavings.toLocaleString()} zł`} 
            icon="💹"
            trend="up"
            trendValue="8%"
            trendPositive
          />
          <KPICard 
            title="Indeks bezpieczeństwa" 
            value={`${kpiData.safetyIndex}/100`} 
            icon="🛡️"
            trend="up"
            trendValue="4%"
            trendPositive
          />
          <KPICard 
            title="Alerty o oszustwach" 
            value={alerts ? alerts.fraudAlerts.length.toString() : "0"} 
            icon="⚠️"
            trend="down"
            trendValue="15%"
            trendPositive
          />
        </GridSection>
      </>
    );
  };
  
  // Renderowanie sekcji alertów
  const renderAlertsSection = () => {
    if (!alerts) return null;
    
    const getAlertsByType = () => {
      switch (activeAlertTab) {
        case 'fraud':
          return alerts.fraudAlerts;
        case 'safety':
          return alerts.safetyAlerts;
        case 'maintenance':
          return alerts.maintenanceAlerts;
        default:
          return alerts.fraudAlerts;
      }
    };
    
    const currentAlerts = getAlertsByType();
    
    return (
      <>
        <SectionTitle>WYKRYWANIE OSZUSTW</SectionTitle>
        <Card fullWidth>
          <TabsContainer>
            <Tab 
              active={activeAlertTab === 'fraud'} 
              onClick={() => setActiveAlertTab('fraud')}
            >
              Oszustwa ({alerts.fraudAlerts.length})
            </Tab>
            <Tab 
              active={activeAlertTab === 'safety'} 
              onClick={() => setActiveAlertTab('safety')}
            >
              Bezpieczeństwo ({alerts.safetyAlerts.length})
            </Tab>
            <Tab 
              active={activeAlertTab === 'maintenance'} 
              onClick={() => setActiveAlertTab('maintenance')}
            >
              Konserwacja ({alerts.maintenanceAlerts.length})
            </Tab>
          </TabsContainer>
          
          <Table 
            headers={['Priorytet', 'Opis', 'Pojazd', 'Data', 'Status']}
            data={currentAlerts.slice(0, 5).map(alert => [
              alert.priority,
              alert.description,
              alert.vehicle,
              alert.date,
              alert.status
            ])}
            onRowClick={(index) => console.log('Clicked row:', currentAlerts[index])}
          />
          
          <ViewAllButton onClick={() => console.log('View all alerts')}>
            Zobacz wszystkie alerty
          </ViewAllButton>
        </Card>
        
        <GridSection>
          <Card title="Mapa fraudów">
            <MapContainer style={{ height: '200px' }}>
              <MapPlaceholder>Mapa Polski z oznaczeniami fraudów</MapPlaceholder>
            </MapContainer>
          </Card>
          
          <Card title="Wskaźnik ryzyka oszustw">
            <div>
              <strong>Aktualny poziom ryzyka: </strong> 
              {fraudRiskData?.current}
              <span style={{ 
                color: fraudRiskData?.change < 0 ? '#4caf50' : '#f44336',
                marginLeft: '8px'
              }}>
                {fraudRiskData?.change < 0 ? '↓' : '↑'} {Math.abs(fraudRiskData?.change).toFixed(1)}%
              </span>
            </div>
            <ChartContainer>
              {fraudRiskData && (
                <Line
                  data={{
                    labels: fraudRiskData.trend.map(item => item.date),
                    datasets: [
                      {
                        label: 'Poziom ryzyka',
                        data: fraudRiskData.trend.map(item => item.value),
                        borderColor: '#f44336',
                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: fraudRiskData.trend.map(item => {
                          if (item.value < fraudRiskData.categories.low.max) return fraudRiskData.categories.low.color;
                          if (item.value < fraudRiskData.categories.medium.max) return fraudRiskData.categories.medium.color;
                          return fraudRiskData.categories.high.color;
                        }),
                        pointRadius: 4,
                        pointHoverRadius: 6
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const value = context.raw;
                            let category = 'Niskie';
                            if (value >= fraudRiskData.categories.medium.min) category = 'Średnie';
                            if (value >= fraudRiskData.categories.high.min) category = 'Wysokie';
                            return `Poziom ryzyka: ${value} (${category})`;
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                          color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                          callback: (value) => `${value}%`
                        }
                      },
                      x: {
                        grid: {
                          display: false
                        }
                      }
                    }
                  }}
                />
              )}
            </ChartContainer>
          </Card>
        </GridSection>
      </>
    );
  };
  
  // Renderowanie sekcji statystyk floty
  const renderFleetStatsSection = () => {
    if (!fleetStats) return null;
    
    return (
      <>
        <SectionTitle>STATYSTYKI FLOTY</SectionTitle>
        <GridSection>
          <Card title="Zużycie paliwa">
            <div>
              <strong>Średnie zużycie: </strong> 
              {fleetStats?.fuelConsumption?.current} {fuelConsumptionData?.unit}
              <span style={{ 
                color: fuelConsumptionData?.change < 0 ? '#4caf50' : '#f44336',
                marginLeft: '8px'
              }}>
                {fuelConsumptionData?.change < 0 ? '↓' : '↑'} {Math.abs(fuelConsumptionData?.change).toFixed(1)}%
              </span>
            </div>
            <ChartContainer>
              {fuelConsumptionData && (
                <Line
                  data={{
                    labels: fuelConsumptionData.trend.map(item => item.date),
                    datasets: [
                      {
                        label: 'Zużycie paliwa',
                        data: fuelConsumptionData.trend.map(item => item.value),
                        borderColor: '#2196f3',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#2196f3',
                        pointRadius: 4,
                        pointHoverRadius: 6
                      },
                      {
                        label: 'Cel',
                        data: Array(fuelConsumptionData.trend.length).fill(fuelConsumptionData.target),
                        borderColor: '#4caf50',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false,
                        pointRadius: 0
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: true,
                        position: 'top',
                        labels: {
                          boxWidth: 12,
                          usePointStyle: true
                        }
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            if (context.dataset.label === 'Cel') {
                              return `Cel: ${context.raw} ${fuelConsumptionData.unit}`;
                            }
                            return `Zużycie: ${context.raw} ${fuelConsumptionData.unit}`;
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: false,
                        min: Math.min(fuelConsumptionData.target * 0.9, ...fuelConsumptionData.trend.map(item => item.value)) * 0.95,
                        max: Math.max(fuelConsumptionData.target * 1.1, ...fuelConsumptionData.trend.map(item => item.value)) * 1.05,
                        grid: {
                          color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                          callback: (value) => `${value} ${fuelConsumptionData.unit}`
                        }
                      },
                      x: {
                        grid: {
                          display: false
                        }
                      }
                    }
                  }}
                />
              )}
            </ChartContainer>
          </Card>
          
          <Card title="Efektywność kierowców">
            <RankingContainer>
              {fleetStats.driverEfficiency.drivers.map((driver, index) => (
                <RankingItem key={driver.id}>
                  <RankingName highlighted={index < 3}>
                    {index + 1}. {driver.name}
                  </RankingName>
                  <RankingValue positive={driver.trend === 'up'} negative={driver.trend === 'down'}>
                    {driver.score} {driver.trend === 'up' ? '↑' : driver.trend === 'down' ? '↓' : ''}
                  </RankingValue>
                </RankingItem>
              ))}
            </RankingContainer>
          </Card>
          
          <Card title="Koszty operacyjne">
            <div>
              <strong>Całkowite koszty: </strong> 
              {operationalCostsData?.total.toLocaleString()} {operationalCostsData?.unit}
              <span style={{ 
                color: operationalCostsData?.change < 0 ? '#4caf50' : '#f44336',
                marginLeft: '8px'
              }}>
                {operationalCostsData?.change < 0 ? '↓' : '↑'} {Math.abs(operationalCostsData?.change).toFixed(1)}%
              </span>
            </div>
            <ChartContainer>
              {operationalCostsData && (
                <Pie
                  data={{
                    labels: operationalCostsData.breakdown.map(item => item.category),
                    datasets: [
                      {
                        data: operationalCostsData.breakdown.map(item => item.value),
                        backgroundColor: operationalCostsData.breakdown.map(item => item.color),
                        borderColor: 'white',
                        borderWidth: 2,
                        hoverOffset: 10
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                        labels: {
                          boxWidth: 12,
                          padding: 15,
                          font: {
                            size: 11
                          }
                        }
                      },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${context.label}: ${value.toLocaleString()} ${operationalCostsData.unit} (${percentage}%)`;
                          }
                        }
                      }
                    }
                  }}
                />
              )}
            </ChartContainer>
          </Card>
          
          <Card title="Realizacja tras">
            <div style={{ marginBottom: '12px' }}>
              <strong>Ukończone trasy: </strong> 
              {fleetStats.routeCompletion.completed}%
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ width: '100px' }}>Na czas:</div>
                <div style={{ flex: 1, height: '20px', backgroundColor: '#f0f0f0', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ width: `${fleetStats.routeCompletion.onTime}%`, height: '100%', backgroundColor: '#4caf50' }}></div>
                </div>
                <div style={{ marginLeft: '8px' }}>{fleetStats.routeCompletion.onTime}%</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ width: '100px' }}>Opóźnione:</div>
                <div style={{ flex: 1, height: '20px', backgroundColor: '#f0f0f0', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ width: `${fleetStats.routeCompletion.delayed}%`, height: '100%', backgroundColor: '#ff9800' }}></div>
                </div>
                <div style={{ marginLeft: '8px' }}>{fleetStats.routeCompletion.delayed}%</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '100px' }}>Anulowane:</div>
                <div style={{ flex: 1, height: '20px', backgroundColor: '#f0f0f0', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ width: `${fleetStats.routeCompletion.cancelled}%`, height: '100%', backgroundColor: '#f44336' }}></div>
                </div>
                <div style={{ marginLeft: '8px' }}>{fleetStats.routeCompletion.cancelled}%</div>
              </div>
            </div>
          </Card>
        </GridSection>
      </>
    );
  };
  
  // Renderowanie sekcji mapy
  const renderMapSection = () => {
    if (!mapData) return null;
    
    // Funkcja do generowania pseudolosowych współrzędnych na podstawie id punktu
    const getCoordinates = (id) => {
      const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return {
        x: (hash % 80) + 10, // 10-90%
        y: ((hash * 13) % 80) + 10 // 10-90%
      };
    };
    
    // Funkcja do określania koloru punktu na podstawie typu
    const getPointColor = (type) => {
      switch (type) {
        case 'vehicle':
          return '#4caf50';
        case 'fraud':
          return '#f44336';
        case 'safety':
          return '#ff9800';
        default:
          return '#2196f3';
      }
    };
    
    return (
      <>
        <SectionTitle>MONITORING POJAZDÓW</SectionTitle>
        <Card fullWidth>
          <TabsContainer>
            <Tab 
              active={activeMapTab === 'vehicles'} 
              onClick={() => handleMapTypeChange('vehicles')}
            >
              Pojazdy
            </Tab>
            <Tab 
              active={activeMapTab === 'fraud'} 
              onClick={() => handleMapTypeChange('fraud')}
            >
              Oszustwa
            </Tab>
            <Tab 
              active={activeMapTab === 'safety'} 
              onClick={() => handleMapTypeChange('safety')}
            >
              Bezpieczeństwo
            </Tab>
          </TabsContainer>
          
          <MapContainer>
            {mapData.points.length === 0 ? (
              <MapPlaceholder>Brak danych do wyświetlenia na mapie</MapPlaceholder>
            ) : (
              <>
                {mapData.points.map(point => {
                  const coords = getCoordinates(point.id);
                  return (
                    <MapPoint 
                      key={point.id}
                      x={coords.x}
                      y={coords.y}
                      color={getPointColor(point.type)}
                      onMouseEnter={(e) => handleMapPointHover(point, e)}
                      onMouseLeave={handleMapPointLeave}
                    />
                  );
                })}
                <MapTooltip 
                  visible={tooltip.visible}
                  style={{ top: tooltip.y, left: tooltip.x }}
                >
                  {tooltip.content}
                </MapTooltip>
              </>
            )}
          </MapContainer>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
            <div style={{ flex: 1, textAlign: 'center', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px', margin: '0 8px' }}>
              <div style={{ fontWeight: 500 }}>W trasie</div>
              <div style={{ fontSize: '20px', marginTop: '4px' }}>78</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px', margin: '0 8px' }}>
              <div style={{ fontWeight: 500 }}>Postój</div>
              <div style={{ fontSize: '20px', marginTop: '4px' }}>32</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px', margin: '0 8px' }}>
              <div style={{ fontWeight: 500 }}>Serwis</div>
              <div style={{ fontSize: '20px', marginTop: '4px' }}>12</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px', margin: '0 8px' }}>
              <div style={{ fontWeight: 500 }}>Inne</div>
              <div style={{ fontSize: '20px', marginTop: '4px' }}>3</div>
            </div>
          </div>
        </Card>
      </>
    );
  };
  
  if (isLoading) {
    return (
      <PageContainer>
        <LoadingIndicator>Ładowanie danych dashboardu...</LoadingIndicator>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer>
      <DataSourceToggle>
        <ToggleLabel>
          API
          <ToggleSwitch checked={useMockData} onClick={handleToggleDataSource} />
          Dane mockowe
        </ToggleLabel>
      </DataSourceToggle>
      
      {error ? (
        <ErrorMessage>{error}</ErrorMessage>
      ) : (
        <>
          {renderKPISection()}
          {renderAlertsSection()}
          {renderFleetStatsSection()}
          {renderMapSection()}
        </>
      )}
    </PageContainer>
  );
};

export default Dashboard;
