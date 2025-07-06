import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

interface WaiverFormProps {
  onWaiverSigned: (waiverId: string) => void;
  bookingId?: string;
  participantName?: string;
}

interface WaiverData {
  participantName: string;
  participantAge: number;
  parentGuardianName: string;
  parentGuardianEmail: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  medicalConditions: string;
  allergies: string;
  agreedTerms: boolean;
  signature: string;
  witnessName?: string;
  witnessSignature?: string;
}

const WaiverForm: React.FC<WaiverFormProps> = ({ 
  onWaiverSigned, 
  bookingId, 
  participantName: initialParticipantName = '' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const witnessCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isWitnessDrawing, setIsWitnessDrawing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [waiverTemplate, setWaiverTemplate] = useState<any>(null);
  
  const [formData, setFormData] = useState<WaiverData>({
    participantName: initialParticipantName,
    participantAge: 18,
    parentGuardianName: '',
    parentGuardianEmail: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    medicalConditions: '',
    allergies: '',
    agreedTerms: false,
    signature: '',
    witnessName: '',
    witnessSignature: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchWaiverTemplate();
  }, []);

  const fetchWaiverTemplate = async () => {
    try {
      const response = await axios.get('/api/waivers/template');
      setWaiverTemplate(response.data);
    } catch (error) {
      console.error('Error fetching waiver template:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.participantName.trim()) {
      newErrors.participantName = 'Participant name is required';
    }

    if (!formData.participantAge || formData.participantAge < 1) {
      newErrors.participantAge = 'Valid age is required';
    }

    const isMinor = formData.participantAge < 18;

    if (isMinor && !formData.parentGuardianName.trim()) {
      newErrors.parentGuardianName = 'Parent/guardian name is required for minors';
    }

    if (isMinor && !formData.parentGuardianEmail.trim()) {
      newErrors.parentGuardianEmail = 'Parent/guardian email is required for minors';
    }

    if (!formData.emergencyContactName.trim()) {
      newErrors.emergencyContactName = 'Emergency contact name is required';
    }

    if (!formData.emergencyContactPhone.trim()) {
      newErrors.emergencyContactPhone = 'Emergency contact phone is required';
    }

    if (!formData.agreedTerms) {
      newErrors.agreedTerms = 'You must agree to the terms to proceed';
    }

    if (!formData.signature) {
      newErrors.signature = 'Signature is required';
    }

    if (waiverTemplate?.settings?.requiresWitness && !formData.witnessSignature) {
      newErrors.witnessSignature = 'Witness signature is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Signature pad functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Convert canvas to base64
    const signature = canvas.toDataURL();
    setFormData(prev => ({ ...prev, signature }));
    
    // Clear signature error
    if (errors.signature) {
      setErrors(prev => ({ ...prev, signature: '' }));
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setFormData(prev => ({ ...prev, signature: '' }));
  };

  // Witness signature functions (similar to above)
  const startWitnessDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsWitnessDrawing(true);
    const canvas = witnessCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const drawWitness = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isWitnessDrawing) return;
    
    const canvas = witnessCanvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopWitnessDrawing = () => {
    if (!isWitnessDrawing) return;
    setIsWitnessDrawing(false);
    
    const canvas = witnessCanvasRef.current;
    if (!canvas) return;
    
    const witnessSignature = canvas.toDataURL();
    setFormData(prev => ({ ...prev, witnessSignature }));
  };

  const clearWitnessSignature = () => {
    const canvas = witnessCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setFormData(prev => ({ ...prev, witnessSignature: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/waivers', {
        ...formData,
        booking: bookingId
      });

      onWaiverSigned(response.data.waiver._id);
    } catch (error: any) {
      console.error('Error submitting waiver:', error);
      
      if (error.response?.data?.message) {
        setErrors({ submit: error.response.data.message });
      } else {
        setErrors({ submit: 'An error occurred while submitting the waiver' });
      }
    } finally {
      setLoading(false);
    }
  };

  const isMinor = formData.participantAge < 18;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Liability Waiver</h2>
      
      {waiverTemplate && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Waiver Agreement</h3>
          <div className="bg-gray-50 p-4 rounded-md max-h-64 overflow-y-auto">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {waiverTemplate.waiverText}
            </pre>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Participant Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Participant Name *
            </label>
            <input
              type="text"
              name="participantName"
              value={formData.participantName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.participantName ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {errors.participantName && (
              <p className="text-red-500 text-sm mt-1">{errors.participantName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Participant Age *
            </label>
            <input
              type="number"
              name="participantAge"
              value={formData.participantAge}
              onChange={handleInputChange}
              min="1"
              max="120"
              className={`w-full px-3 py-2 border rounded-md ${errors.participantAge ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {errors.participantAge && (
              <p className="text-red-500 text-sm mt-1">{errors.participantAge}</p>
            )}
          </div>
        </div>

        {/* Parent/Guardian Information (for minors) */}
        {isMinor && (
          <div className="bg-yellow-50 p-4 rounded-md">
            <h4 className="text-md font-semibold text-yellow-800 mb-4">
              Parent/Guardian Information (Required for minors)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent/Guardian Name *
                </label>
                <input
                  type="text"
                  name="parentGuardianName"
                  value={formData.parentGuardianName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors.parentGuardianName ? 'border-red-500' : 'border-gray-300'}`}
                  required={isMinor}
                />
                {errors.parentGuardianName && (
                  <p className="text-red-500 text-sm mt-1">{errors.parentGuardianName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent/Guardian Email *
                </label>
                <input
                  type="email"
                  name="parentGuardianEmail"
                  value={formData.parentGuardianEmail}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${errors.parentGuardianEmail ? 'border-red-500' : 'border-gray-300'}`}
                  required={isMinor}
                />
                {errors.parentGuardianEmail && (
                  <p className="text-red-500 text-sm mt-1">{errors.parentGuardianEmail}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Emergency Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emergency Contact Name *
            </label>
            <input
              type="text"
              name="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.emergencyContactName ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {errors.emergencyContactName && (
              <p className="text-red-500 text-sm mt-1">{errors.emergencyContactName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emergency Contact Phone *
            </label>
            <input
              type="tel"
              name="emergencyContactPhone"
              value={formData.emergencyContactPhone}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.emergencyContactPhone ? 'border-red-500' : 'border-gray-300'}`}
              required
            />
            {errors.emergencyContactPhone && (
              <p className="text-red-500 text-sm mt-1">{errors.emergencyContactPhone}</p>
            )}
          </div>
        </div>

        {/* Medical Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medical Conditions
            </label>
            <textarea
              name="medicalConditions"
              value={formData.medicalConditions}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Any medical conditions we should be aware of..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Allergies
            </label>
            <textarea
              name="allergies"
              value={formData.allergies}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Any allergies we should be aware of..."
            />
          </div>
        </div>

        {/* Signature */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isMinor ? 'Parent/Guardian Signature *' : 'Participant Signature *'}
          </label>
          <div className="border border-gray-300 rounded-md p-4">
            <canvas
              ref={canvasRef}
              width={600}
              height={200}
              className="border border-dashed border-gray-300 cursor-crosshair w-full"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={clearSignature}
                className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Clear Signature
              </button>
            </div>
          </div>
          {errors.signature && (
            <p className="text-red-500 text-sm mt-1">{errors.signature}</p>
          )}
        </div>

        {/* Witness Signature (if required) */}
        {waiverTemplate?.settings?.requiresWitness && (
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Witness Name
              </label>
              <input
                type="text"
                name="witnessName"
                value={formData.witnessName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Witness Signature *
            </label>
            <div className="border border-gray-300 rounded-md p-4">
              <canvas
                ref={witnessCanvasRef}
                width={600}
                height={200}
                className="border border-dashed border-gray-300 cursor-crosshair w-full"
                onMouseDown={startWitnessDrawing}
                onMouseMove={drawWitness}
                onMouseUp={stopWitnessDrawing}
                onMouseLeave={stopWitnessDrawing}
              />
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={clearWitnessSignature}
                  className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Clear Witness Signature
                </button>
              </div>
            </div>
            {errors.witnessSignature && (
              <p className="text-red-500 text-sm mt-1">{errors.witnessSignature}</p>
            )}
          </div>
        )}

        {/* Agreement Checkbox */}
        <div>
          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              name="agreedTerms"
              checked={formData.agreedTerms}
              onChange={handleInputChange}
              className={`mt-1 ${errors.agreedTerms ? 'border-red-500' : ''}`}
              required
            />
            <span className="text-sm text-gray-700">
              I have read, understood, and agree to the terms of this liability waiver. 
              I understand that I am giving up substantial rights by signing this agreement.
            </span>
          </label>
          {errors.agreedTerms && (
            <p className="text-red-500 text-sm mt-1">{errors.agreedTerms}</p>
          )}
        </div>

        {/* Submit Button */}
        <div>
          {errors.submit && (
            <p className="text-red-500 text-sm mb-4">{errors.submit}</p>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Sign Waiver'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WaiverForm;