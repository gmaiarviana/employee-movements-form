import React, { useState } from 'react';
import Button from './Button.jsx';

/**
 * Button Component Examples
 * 
 * This file demonstrates the usage of the Button component
 * with different variants, sizes, and states.
 */
const ButtonExamples = () => {
  const [loading, setLoading] = useState({});

  const handleLoadingDemo = (buttonId) => {
    setLoading(prev => ({ ...prev, [buttonId]: true }));
    setTimeout(() => {
      setLoading(prev => ({ ...prev, [buttonId]: false }));
    }, 2000);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'var(--font-family-sans)' }}>
      <h1>Button Component Examples</h1>
      
      {/* Variants */}
      <section style={{ marginBottom: '2rem' }}>
        <h2>Variants</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <Button variant="primary">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="danger">Danger Button</Button>
          <Button variant="ghost">Ghost Button</Button>
        </div>
      </section>

      {/* Sizes */}
      <section style={{ marginBottom: '2rem' }}>
        <h2>Sizes</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
          <Button variant="primary" size="small">Small</Button>
          <Button variant="primary" size="medium">Medium</Button>
          <Button variant="primary" size="large">Large</Button>
        </div>
      </section>

      {/* States */}
      <section style={{ marginBottom: '2rem' }}>
        <h2>States</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <Button variant="primary">Normal</Button>
          <Button variant="primary" disabled>Disabled</Button>
          <Button 
            variant="primary" 
            loading={loading.demo1}
            onClick={() => handleLoadingDemo('demo1')}
          >
            {loading.demo1 ? 'Loading...' : 'Click for Loading'}
          </Button>
        </div>
      </section>

      {/* Loading States for Different Variants */}
      <section style={{ marginBottom: '2rem' }}>
        <h2>Loading States</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <Button 
            variant="primary" 
            loading={loading.primary}
            onClick={() => handleLoadingDemo('primary')}
          >
            Primary Loading
          </Button>
          <Button 
            variant="secondary" 
            loading={loading.secondary}
            onClick={() => handleLoadingDemo('secondary')}
          >
            Secondary Loading
          </Button>
          <Button 
            variant="danger" 
            loading={loading.danger}
            onClick={() => handleLoadingDemo('danger')}
          >
            Danger Loading
          </Button>
          <Button 
            variant="ghost" 
            loading={loading.ghost}
            onClick={() => handleLoadingDemo('ghost')}
          >
            Ghost Loading
          </Button>
        </div>
      </section>

      {/* Custom onClick Handler */}
      <section style={{ marginBottom: '2rem' }}>
        <h2>Interactive Examples</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <Button 
            variant="primary"
            onClick={() => alert('Primary button clicked!')}
          >
            Click Me
          </Button>
          <Button 
            variant="ghost"
            onClick={() => console.log('Ghost button clicked!')}
          >
            Log to Console
          </Button>
        </div>
      </section>

      {/* Custom CSS Classes */}
      <section style={{ marginBottom: '2rem' }}>
        <h2>With Custom Classes</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <Button 
            variant="primary"
            className="custom-button-class"
            style={{ textTransform: 'uppercase' }}
          >
            Custom Styled
          </Button>
        </div>
      </section>
    </div>
  );
};

export default ButtonExamples;
