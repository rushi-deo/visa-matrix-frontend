import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Stepper from '../components/features/Stepper';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import FileUploader from '../components/features/FileUploader';
import { getAllCountries } from '../data/countries';
import './Application.css?test=123';

const Application = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { countryCode } = useParams();

    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        nationality: '',
        destinationCountry: '',
        visaType: 'Tourist',
        travelDate: '',
        duration: ''
    });

    /* Populate destination country from navigation state or URL */
    useEffect(() => {
        if (location.state?.selectedCountry) {
            setFormData(prev => ({
                ...prev,
                destinationCountry: location.state.selectedCountry
            }));
            return;
        }

        if (countryCode) {
            const code = countryCode.toUpperCase();
            const countries = getAllCountries();
            const country = countries.find(
                c => c.country_code === code || c.code === code
            );

            if (country) {
                setFormData(prev => ({
                    ...prev,
                    destinationCountry: country.name
                }));
            }
        }
    }, [location.state, countryCode]);

    /* ✅ NEW: Auto-select nationality based on user location */
    useEffect(() => {
        if (formData.nationality) return; // do not override user selection

        const userLang = navigator.language || navigator.userLanguage;

        if (userLang?.includes('en-IN')) {
            setFormData(prev => ({ ...prev, nationality: 'India' }));
        } else if (userLang?.includes('en-US')) {
            setFormData(prev => ({ ...prev, nationality: 'United States' }));
        } else if (userLang?.includes('en-GB')) {
            setFormData(prev => ({ ...prev, nationality: 'United Kingdom' }));
        }
    }, []);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const steps = [
        'Personal Details',
        'Travel Info',
        'Documents',
        'Review',
        'Payment'
    ];

    const handleNext = () => {
        if (currentStep === 0) {
            if (!formData.fullName || !formData.email || !formData.phone) {
                alert('Please fill in all required fields.');
                return;
            }
        }
        if (currentStep === 1) {
            if (!formData.destinationCountry || !formData.travelDate) {
                alert('Please select destination and travel date.');
                return;
            }
        }

        if (currentStep < steps.length - 1) {
            setCurrentStep(curr => curr + 1);
        } else {
            alert('Application Submitted Successfully!');
            navigate('/');
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(curr => curr - 1);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Full Name *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.fullName}
                                onChange={(e) => handleInputChange('fullName', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Email Address *</label>
                            <input
                                type="email"
                                className="form-input"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Phone Number *</label>
                            <input
                                type="tel"
                                className="form-input"
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Nationality</label>
                            <select
                                className="form-input"
                                value={formData.nationality}
                                onChange={(e) => handleInputChange('nationality', e.target.value)}
                            >
                                <option value="">Select Nationality</option>
                                <option value="United States">United States</option>
                                <option value="India">India</option>
                                <option value="United Kingdom">United Kingdom</option>
                            </select>
                        </div>
                    </div>
                );

            case 1:
                return (
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Destination Country *</label>
                            <select
                                className="form-input"
                                value={formData.destinationCountry}
                                onChange={(e) => handleInputChange('destinationCountry', e.target.value)}
                            >
                                <option value="">Select Country</option>
                                {getAllCountries().map(c => (
                                    <option key={c.country_code} value={c.name}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Visa Type</label>
                            <select
                                className="form-input"
                                value={formData.visaType}
                                onChange={(e) => handleInputChange('visaType', e.target.value)}
                            >
                                <option>Tourist</option>
                                <option>Business</option>
                                <option>Family Visit</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Intended Date of Travel *</label>
                            <input
                                type="date"
                                className="form-input"
                                value={formData.travelDate}
                                onChange={(e) => handleInputChange('travelDate', e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Duration of Stay (Days)</label>
                            <input
                                type="number"
                                className="form-input"
                                value={formData.duration}
                                onChange={(e) => handleInputChange('duration', e.target.value)}
                            />
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="documents-section">
                        <FileUploader label="Passport Front Page" required />
                        <FileUploader label="Passport Back Page" />
                        <FileUploader label="Passport Photo" required />
                        <FileUploader label="Bank Statement (Last 3 months)" required />
                    </div>
                );

            case 3:
                return (
                    <div className="review-section">
                        <h3>Review Your Application</h3>
                        <div className="review-grid">
                            <div><strong>Full Name:</strong> {formData.fullName || '-'}</div>
                            <div><strong>Email:</strong> {formData.email || '-'}</div>
                            <div><strong>Phone:</strong> {formData.phone || '-'}</div>
                            <div><strong>Nationality:</strong> {formData.nationality || '-'}</div>
                            <div><strong>Destination Country:</strong> {formData.destinationCountry || '-'}</div>
                            <div><strong>Visa Type:</strong> {formData.visaType || '-'}</div>
                            <div><strong>Travel Date:</strong> {formData.travelDate || '-'}</div>
                            <div><strong>Duration (Days):</strong> {formData.duration || '-'}</div>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="payment-section">
                        <Button size="lg" onClick={handleNext}>
                            Pay & Submit
                        </Button>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="container page-content application-container">
            <h1 className="text-center mb-xl">Visa Application</h1>
            <Stepper steps={steps} currentStep={currentStep} />

            <Card className="step-card">
                {renderStepContent()}

                <div className="step-actions">
                    <Button variant="secondary" onClick={handleBack} disabled={currentStep === 0}>
                        Back
                    </Button>
                    {currentStep < steps.length - 1 && (
                        <Button onClick={handleNext}>Next Step</Button>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default Application;
