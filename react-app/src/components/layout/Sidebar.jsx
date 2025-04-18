import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const SidebarContainer = styled.aside`
  width: 250px;
  background-color: #f0f2f5;
  border-right: 1px solid #e0e0e0;
  height: calc(100vh - 60px);
  overflow-y: auto;
`;

const MenuList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const MenuItem = styled.li`
  padding: 12px 20px;
  cursor: pointer;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  background-color: ${props => props.active ? '#e3e7f1' : 'transparent'};
  border-left: 4px solid ${props => props.active ? '#3f51b5' : 'transparent'};
  
  &:hover {
    background-color: #e3e7f1;
  }
`;

const SubMenuList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 0 20px;
  display: none;
`;

const SubMenuContainer = styled.div`
  & ${SubMenuList} {
    display: ${props => props.expanded ? 'block' : 'none'};
  }
`;

const SubMenuItem = styled.li`
  padding: 8px 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
  color: ${props => props.active ? '#3f51b5' : '#555'};
  
  &:hover {
    color: #3f51b5;
  }
`;

/**
 * Sidebar navigation component
 * @returns {JSX.Element} Sidebar component
 */
const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = React.useState({
    vehicles: false,
    settings: false
  });
  
  const isActive = (path) => {
    return location.pathname === path;
  };
  
  const toggleSubMenu = (menu) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };
  
  const handleNavigate = (path) => {
    navigate(path);
  };
  
  return (
    <SidebarContainer>
      <MenuList>
        <MenuItem 
          active={isActive('/')} 
          onClick={() => handleNavigate('/')}
        >
          Dashboard
        </MenuItem>
        
        <MenuItem 
          active={isActive('/monitoring')} 
          onClick={() => handleNavigate('/monitoring')}
        >
          Monitoring
        </MenuItem>
        
        <MenuItem 
          active={isActive('/fraud-detection')} 
          onClick={() => handleNavigate('/fraud-detection')}
        >
          Fraud Detection
        </MenuItem>
        
        <SubMenuContainer expanded={expandedMenus.vehicles}>
          <MenuItem 
            active={location.pathname.startsWith('/vehicles')} 
            onClick={() => toggleSubMenu('vehicles')}
          >
            Vehicles
          </MenuItem>
          <SubMenuList>
            <SubMenuItem 
              active={isActive('/vehicles/overview')} 
              onClick={() => handleNavigate('/vehicles/overview')}
            >
              Overview
            </SubMenuItem>
            <SubMenuItem 
              active={isActive('/predictive-maintenance')} 
              onClick={() => handleNavigate('/predictive-maintenance')}
            >
              Maintenance
            </SubMenuItem>
            <SubMenuItem 
              active={isActive('/vehicles/parts')} 
              onClick={() => handleNavigate('/vehicles/parts')}
            >
              Parts
            </SubMenuItem>
            <SubMenuItem 
              active={isActive('/vehicles/tires')} 
              onClick={() => handleNavigate('/vehicles/tires')}
            >
              Tires
            </SubMenuItem>
          </SubMenuList>
        </SubMenuContainer>
        
        <MenuItem 
          active={isActive('/driver-safety')} 
          onClick={() => handleNavigate('/driver-safety')}
        >
          Driver Safety
        </MenuItem>
        
        <MenuItem 
          active={isActive('/drivers')} 
          onClick={() => handleNavigate('/drivers')}
        >
          Drivers
        </MenuItem>
        
        <MenuItem 
          active={isActive('/fleet-management')} 
          onClick={() => handleNavigate('/fleet-management')}
        >
          Fleet Management
        </MenuItem>
        
        <MenuItem 
          active={isActive('/fuel-analysis')} 
          onClick={() => handleNavigate('/fuel-analysis')}
        >
          Fuel Analysis
        </MenuItem>
        
        <MenuItem 
          active={isActive('/route-optimization')} 
          onClick={() => handleNavigate('/route-optimization')}
        >
          Route Optimization
        </MenuItem>
        
        <MenuItem 
          active={isActive('/road-tolls')} 
          onClick={() => handleNavigate('/road-tolls')}
        >
          Road Tolls
        </MenuItem>
        
        <MenuItem 
          active={isActive('/ferry-bookings')} 
          onClick={() => handleNavigate('/ferry-bookings')}
        >
          Ferry Bookings
        </MenuItem>
        
        <MenuItem 
          active={isActive('/geofencing')} 
          onClick={() => handleNavigate('/geofencing')}
        >
          Geofencing
        </MenuItem>
        
        <MenuItem 
          active={isActive('/document-management')} 
          onClick={() => handleNavigate('/document-management')}
        >
          Document Management
        </MenuItem>
        
        <MenuItem 
          active={isActive('/asset-management')} 
          onClick={() => handleNavigate('/asset-management')}
        >
          Asset Management
        </MenuItem>
        
        <MenuItem 
          active={isActive('/communication')} 
          onClick={() => handleNavigate('/communication')}
        >
          Communication
        </MenuItem>
        
        <MenuItem 
          active={isActive('/integrations')} 
          onClick={() => handleNavigate('/integrations')}
        >
          Integrations
        </MenuItem>
        
        <MenuItem 
          active={isActive('/ai-automation')} 
          onClick={() => handleNavigate('/ai-automation')}
        >
          AI & Automation
        </MenuItem>
        
        <MenuItem 
          active={isActive('/statistics')} 
          onClick={() => handleNavigate('/statistics')}
        >
          Statistics
        </MenuItem>
        
        <SubMenuContainer expanded={expandedMenus.settings}>
          <MenuItem 
            active={location.pathname.startsWith('/settings')} 
            onClick={() => {
              toggleSubMenu('settings');
              handleNavigate('/settings');
            }}
          >
            Settings
          </MenuItem>
          <SubMenuList>
            <SubMenuItem 
              active={isActive('/settings/users')} 
              onClick={() => handleNavigate('/settings/users')}
            >
              Users
            </SubMenuItem>
            <SubMenuItem 
              active={isActive('/settings/roles')} 
              onClick={() => handleNavigate('/settings/roles')}
            >
              Roles
            </SubMenuItem>
            <SubMenuItem 
              active={isActive('/settings/view-customization')} 
              onClick={() => handleNavigate('/settings/view-customization')}
            >
              View Customization
            </SubMenuItem>
            <SubMenuItem 
              active={isActive('/settings/security')} 
              onClick={() => handleNavigate('/settings/security')}
            >
              Security
            </SubMenuItem>
          </SubMenuList>
        </SubMenuContainer>
      </MenuList>
    </SidebarContainer>
  );
};

export default Sidebar;
