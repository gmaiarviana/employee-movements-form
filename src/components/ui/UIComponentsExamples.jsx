import React, { useState } from 'react';
import Container from './Container';
import Header from './Header';
import FormGroup from './FormGroup';
import Button from './Button';
import Input from './Input';
import Card from './Card';

/**
 * UI Components Examples
 * 
 * Demonstrates the usage of Container, Header and FormGroup components.
 */
const UIComponentsExamples = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  
  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
    
    // Clear error when field is edited
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: undefined
      });
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Submit form
    alert('Form submitted successfully!');
  };
  
  return (
    <div>
      {/* Header Examples */}
      <Header 
        title="Primary Header Example" 
        variant="primary"
        rightContent={<Button variant="ghost" size="small">Sign In</Button>}
      />
      
      <div style={{ height: '20px' }}></div>
      
      <Header 
        title="Secondary Header Example" 
        variant="secondary"
        leftContent={<Button variant="ghost" size="small">Menu</Button>}
        rightContent={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="ghost" size="small">Account</Button>
            <Button variant="primary" size="small">Action</Button>
          </div>
        }
      />
      
      <div style={{ height: '20px' }}></div>
      
      <Header variant="primary">
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: 'var(--font-size-h1)', margin: 0 }}>Custom Content Header</h1>
          <p style={{ margin: '8px 0 0' }}>With additional information</p>
        </div>
      </Header>
      
      <div style={{ height: '40px' }}></div>
      
      {/* Container Examples */}
      <Container size="sm" style={{ backgroundColor: 'var(--color-primary-50)', padding: '20px', marginBottom: '20px' }}>
        <h2>Small Container</h2>
        <p>Maximum width of 640px</p>
      </Container>
      
      <Container size="md" style={{ backgroundColor: 'var(--color-secondary-50)', padding: '20px', marginBottom: '20px' }}>
        <h2>Medium Container</h2>
        <p>Maximum width of 768px</p>
      </Container>
      
      <Container size="lg" style={{ backgroundColor: 'var(--color-success-50)', padding: '20px', marginBottom: '20px' }}>
        <h2>Large Container (Default)</h2>
        <p>Maximum width of 1024px</p>
      </Container>
      
      <Container size="xl" style={{ backgroundColor: 'var(--color-warning-50)', padding: '20px', marginBottom: '20px' }}>
        <h2>Extra Large Container</h2>
        <p>Maximum width of 1280px</p>
      </Container>
      
      <Container size="2xl" style={{ backgroundColor: 'var(--color-danger-50)', padding: '20px', marginBottom: '20px' }}>
        <h2>2XL Container</h2>
        <p>Maximum width of 1536px</p>
      </Container>
      
      <Container size="full" fluid style={{ backgroundColor: 'var(--color-neutral-100)', padding: '20px', marginBottom: '40px' }}>
        <h2>Full Width Fluid Container</h2>
        <p>No padding on the container itself, takes up the full viewport width</p>
      </Container>
      
      {/* FormGroup Examples */}
      <Container size="md">
        <Card variant="default">
          <Card.Header>
            <h2>FormGroup Examples</h2>
          </Card.Header>
          <Card.Content>
            <form onSubmit={handleSubmit}>
              <FormGroup 
                label="Name" 
                required
                error={errors.name}
                helperText="Enter your full name"
              >
                <Input
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange('name')}
                  required
                />
              </FormGroup>
              
              <FormGroup 
                label="Email Address" 
                required
                error={errors.email}
              >
                <Input
                  type="email"
                  placeholder="johndoe@example.com"
                  value={formData.email}
                  onChange={handleChange('email')}
                  required
                />
              </FormGroup>
              
              <FormGroup 
                label="Message" 
                helperText="Optional message to include with your submission"
              >
                <Input
                  type="textarea"
                  placeholder="Type your message here..."
                  value={formData.message}
                  onChange={handleChange('message')}
                  rows={4}
                />
              </FormGroup>
              
              <FormGroup
                label="Inline Example"
                inline
                helperText="This label and input are displayed inline"
              >
                <Input
                  type="text"
                  placeholder="Inline example"
                />
              </FormGroup>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <Button variant="ghost" type="button">Cancel</Button>
                <Button variant="primary" type="submit">Submit</Button>
              </div>
            </form>
          </Card.Content>
        </Card>
      </Container>
    </div>
  );
};

export default UIComponentsExamples;
