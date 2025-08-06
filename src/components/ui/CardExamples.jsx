import React from 'react';
import Card, { CardHeader, CardContent, CardFooter } from './Card';
import Button from './Button';

/**
 * Card Examples Component
 * 
 * Demonstrates the usage of different Card component variants and subcomponents.
 */
const CardExamples = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Card Component Examples</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        {/* Default Card */}
        <Card variant="default">
          <CardHeader>
            <h3>Default Card</h3>
          </CardHeader>
          <CardContent>
            <p>This is a default card with header, content, and footer.</p>
            <p>Use this card for general content display.</p>
          </CardContent>
          <CardFooter>
            <Button variant="primary" size="small">Primary Action</Button>
            <Button variant="ghost" size="small">Secondary</Button>
          </CardFooter>
        </Card>
        
        {/* Elevated Card */}
        <Card variant="elevated">
          <CardHeader>
            <h3>Elevated Card</h3>
          </CardHeader>
          <CardContent>
            <p>This card has an elevated design with stronger shadow effects.</p>
            <p>Use this card to highlight important information.</p>
          </CardContent>
          <CardFooter>
            <Button variant="primary" size="small">Learn More</Button>
          </CardFooter>
        </Card>
        
        {/* Outlined Card */}
        <Card variant="outlined">
          <CardHeader>
            <h3>Outlined Card</h3>
          </CardHeader>
          <CardContent>
            <p>This card has a distinct outline border without shadow effects.</p>
            <p>Use this card when you want to emphasize the boundary.</p>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" size="small">View Details</Button>
          </CardFooter>
        </Card>
        
        {/* Employee Card Example */}
        <Card variant="default" className="card--employee">
          <CardHeader>
            <h3>Employee Card</h3>
          </CardHeader>
          <CardContent>
            <div className="card__data-row">
              <span className="card__data-label">Name:</span>
              <span className="card__data-value">John Doe</span>
            </div>
            <div className="card__data-row">
              <span className="card__data-label">ID:</span>
              <span className="card__data-value">EMP-12345</span>
            </div>
            <div className="card__data-row">
              <span className="card__data-label">Department:</span>
              <span className="card__data-value">Engineering</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="primary" size="small">View Profile</Button>
          </CardFooter>
        </Card>
        
        {/* Summary Card Example */}
        <Card variant="outlined" className="card--summary">
          <CardHeader>
            <h3>Summary Card</h3>
          </CardHeader>
          <CardContent>
            <div className="card__data-row">
              <span className="card__data-label">Total Entries:</span>
              <span className="card__data-value">48</span>
            </div>
            <div className="card__data-row">
              <span className="card__data-label">Total Exits:</span>
              <span className="card__data-value">32</span>
            </div>
            <div className="card__data-row">
              <span className="card__data-label">Active Employees:</span>
              <span className="card__data-value">126</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Dashboard Panel Example */}
        <Card variant="elevated" className="card--dashboard">
          <CardHeader>
            <h3>Dashboard Panel</h3>
          </CardHeader>
          <CardContent>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--color-primary-500)' }}>125</h2>
              <p>Active Employees</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Card with only content */}
        <Card variant="default">
          <CardContent>
            <h3>Content Only</h3>
            <p>This card only has content without header or footer.</p>
            <p>Useful for simple message display.</p>
          </CardContent>
        </Card>
        
        {/* Compact Card */}
        <Card variant="outlined" className="card--compact">
          <CardHeader>
            <h4>Compact Card</h4>
          </CardHeader>
          <CardContent>
            <p>A compact card with reduced padding for denser UI layouts.</p>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="small">Close</Button>
          </CardFooter>
        </Card>
        
        {/* Loading Card */}
        <Card variant="default" className="card--loading">
          <CardHeader>
            <h3>Loading Card</h3>
          </CardHeader>
          <CardContent style={{ minHeight: '100px' }}>
            <p>Content is loading...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CardExamples;
