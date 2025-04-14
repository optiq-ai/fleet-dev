import React from 'react';
import styled from 'styled-components';
import { useViewCustomization } from '../context/ViewCustomizationContext';
import { View } from '../types';

const ViewSelectorContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const CurrentView = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background-color: #e0e0e0;
  }
  
  svg {
    width: 16px;
    height: 16px;
    fill: #666;
  }
`;

const Dropdown = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  width: 280px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
  display: ${props => props.isOpen ? 'block' : 'none'};
  margin-top: 4px;
  max-height: 400px;
  overflow-y: auto;
`;

const DropdownHeader = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
  font-weight: 500;
`;

const DropdownSection = styled.div`
  padding: 8px 0;
`;

const SectionTitle = styled.div`
  padding: 8px 16px;
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ViewItem = styled.div<{ active: boolean }>`
  padding: 8px 16px;
  cursor: pointer;
  background-color: ${props => props.active ? '#f0f7ff' : 'transparent'};
  
  &:hover {
    background-color: ${props => props.active ? '#f0f7ff' : '#f5f5f5'};
  }
`;

const ViewTitle = styled.div`
  font-weight: 500;
  margin-bottom: 2px;
`;

const ViewDescription = styled.div`
  font-size: 12px;
  color: #666;
`;

const ActionButton = styled.button`
  display: block;
  width: 100%;
  padding: 8px 16px;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
  color: #3f51b5;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const ViewSelector: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  
  const { 
    views, 
    currentView, 
    setCurrentView, 
    userViews, 
    defaultViews 
  } = useViewCustomization();
  
  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Get current view details
  const getCurrentViewName = () => {
    const view = views.find(v => v.id === currentView);
    return view ? view.name : 'Domyślny widok';
  };
  
  return (
    <ViewSelectorContainer ref={dropdownRef}>
      <CurrentView onClick={() => setIsOpen(!isOpen)}>
        <span>{getCurrentViewName()}</span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </CurrentView>
      
      <Dropdown isOpen={isOpen}>
        <DropdownHeader>Wybierz widok</DropdownHeader>
        
        <DropdownSection>
          <SectionTitle>Moje widoki:</SectionTitle>
          {userViews.map((view: View) => (
            <ViewItem 
              key={view.id}
              active={view.id === currentView}
              onClick={() => {
                setCurrentView(view.id);
                setIsOpen(false);
              }}
            >
              <ViewTitle>{view.name}</ViewTitle>
              <ViewDescription>{view.description}</ViewDescription>
            </ViewItem>
          ))}
        </DropdownSection>
        
        <DropdownSection>
          <SectionTitle>Widoki domyślne:</SectionTitle>
          {defaultViews.map((view: View) => (
            <ViewItem 
              key={view.id}
              active={view.id === currentView}
              onClick={() => {
                setCurrentView(view.id);
                setIsOpen(false);
              }}
            >
              <ViewTitle>{view.name}</ViewTitle>
              <ViewDescription>{view.description}</ViewDescription>
            </ViewItem>
          ))}
        </DropdownSection>
        
        <DropdownSection>
          <ActionButton onClick={() => {
            // In a real app, this would open a view customization modal
            setIsOpen(false);
          }}>
            + Utwórz nowy widok
          </ActionButton>
        </DropdownSection>
      </Dropdown>
    </ViewSelectorContainer>
  );
};

export default ViewSelector;
