import React, { useState } from 'react';
import Input from './Input';

/**
 * Input Examples Component
 * 
 * Demonstrates the usage of different Input component variants and states.
 */
const InputExamples = () => {
  const [formData, setFormData] = useState({
    text: '',
    email: '',
    password: '',
    date: '',
    select: '',
    textarea: '',
    errorField: '',
    disabledField: 'Cannot edit this'
  });

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const selectOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' }
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Input Component Examples</h1>
      
      <div style={{ display: 'grid', gap: '2rem', marginTop: '2rem' }}>
        {/* Text Input */}
        <div>
          <h3>Text Input</h3>
          <Input
            type="text"
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.text}
            onChange={handleInputChange('text')}
            required
          />
        </div>

        {/* Email Input */}
        <div>
          <h3>Email Input</h3>
          <Input
            type="email"
            label="Email Address"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange('email')}
            required
          />
        </div>

        {/* Password Input */}
        <div>
          <h3>Password Input</h3>
          <Input
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleInputChange('password')}
            required
          />
        </div>

        {/* Date Input */}
        <div>
          <h3>Date Input</h3>
          <Input
            type="date"
            label="Birth Date"
            value={formData.date}
            onChange={handleInputChange('date')}
          />
        </div>

        {/* Select Input */}
        <div>
          <h3>Select Input</h3>
          <Input
            type="select"
            label="Choose an Option"
            placeholder="Select an option"
            value={formData.select}
            onChange={handleInputChange('select')}
            options={selectOptions}
            required
          />
        </div>

        {/* Textarea Input */}
        <div>
          <h3>Textarea Input</h3>
          <Input
            type="textarea"
            label="Comments"
            placeholder="Enter your comments here..."
            value={formData.textarea}
            onChange={handleInputChange('textarea')}
            rows={4}
          />
        </div>

        {/* Error State */}
        <div>
          <h3>Input with Error</h3>
          <Input
            type="text"
            label="Field with Error"
            placeholder="This field has an error"
            value={formData.errorField}
            onChange={handleInputChange('errorField')}
            error="This field is required and must contain at least 3 characters"
            required
          />
        </div>

        {/* Disabled State */}
        <div>
          <h3>Disabled Input</h3>
          <Input
            type="text"
            label="Disabled Field"
            placeholder="Cannot edit"
            value={formData.disabledField}
            onChange={handleInputChange('disabledField')}
            disabled
          />
        </div>

        {/* Without Label */}
        <div>
          <h3>Input without Label</h3>
          <Input
            type="text"
            placeholder="This input has no label"
            value=""
            onChange={handleInputChange('text')}
          />
        </div>

        {/* Form Values Display */}
        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px' 
        }}>
          <h4>Current Form Values:</h4>
          <pre style={{ fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default InputExamples;
