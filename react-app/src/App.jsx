import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import FraudDetection from './pages/FraudDetection';
import DriverSafety from './pages/DriverSafety';
import PredictiveMaintenance from './pages/PredictiveMaintenance';
import ViewCustomizationUser from './pages/ViewCustomizationUser';
import ViewCustomizationAdmin from './pages/ViewCustomizationAdmin';
import Monitoring from './pages/Monitoring';
import Drivers from './pages/Drivers';
import FleetManagement from './pages/FleetManagement';
import VehiclesOverview from './pages/VehiclesOverview';
import VehicleParts from './pages/VehicleParts';
import VehicleTires from './pages/VehicleTires';
import FuelAnalysis from './pages/FuelAnalysis';
import RoadTolls from './pages/RoadTolls';
import { ViewCustomizationProvider } from './context/ViewCustomizationContext';

/**
 * Main App component that sets up routing and context providers
 * @returns {JSX.Element} App component
 */
function App() {
  return (
    <ViewCustomizationProvider>
      <Router>
        <Routes>
          <Route path="/" element={
            <Layout>
              <Dashboard />
            </Layout>
          } />
          <Route path="/monitoring" element={
            <Layout>
              <Monitoring />
            </Layout>
          } />
          <Route path="/fraud-detection" element={
            <Layout>
              <FraudDetection />
            </Layout>
          } />
          <Route path="/driver-safety" element={
            <Layout>
              <DriverSafety />
            </Layout>
          } />
          <Route path="/drivers" element={
            <Layout>
              <Drivers />
            </Layout>
          } />
          <Route path="/fleet-management" element={
            <Layout>
              <FleetManagement />
            </Layout>
          } />
          <Route path="/vehicles/overview" element={
            <Layout>
              <VehiclesOverview />
            </Layout>
          } />
          <Route path="/vehicles/parts" element={
            <Layout>
              <VehicleParts />
            </Layout>
          } />
          <Route path="/vehicles/tires" element={
            <Layout>
              <VehicleTires />
            </Layout>
          } />
          <Route path="/predictive-maintenance" element={
            <Layout>
              <PredictiveMaintenance />
            </Layout>
          } />
          <Route path="/customize-view" element={
            <Layout>
              <ViewCustomizationUser />
            </Layout>
          } />
          <Route path="/admin/view-customization" element={
            <Layout>
              <ViewCustomizationAdmin />
            </Layout>
          } />
          <Route path="/fuel-analysis" element={
            <Layout>
              <FuelAnalysis />
            </Layout>
          } />
          <Route path="/road-tolls" element={
            <Layout>
              <RoadTolls />
            </Layout>
          } />
          {/* Fallback route for any unmatched paths */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ViewCustomizationProvider>
  );
}

export default App;
