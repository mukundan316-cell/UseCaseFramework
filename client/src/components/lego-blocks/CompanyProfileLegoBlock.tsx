import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, DollarSign, Target, Globe, FileText } from "lucide-react";

interface CompanyProfileData {
  companyName?: string;
  gwp?: {
    amount?: string;
    currency?: string;
  };
  companyTier?: string | { selected: string; other: string };
  primaryMarkets?: string[] | { selected: string[]; other: string };
  geographicFocus?: string;
  notes?: string;
}

interface CompanyProfileLegoBlockProps {
  questionData: {
    // Support both old interface and new fields-based structure
    fields?: Array<{
      id: string;
      type: string;
      label: string;
      required?: boolean;
      defaultValue?: string;
      placeholder?: string;
      currency?: string;
      options?: Array<{ label: string; value: string }>;
    }>;
    allowNotes?: boolean;
    notesPrompt?: string;
    // Legacy structure for backward compatibility
    companyName?: string;
    gwp?: {
      placeholder?: string;
      currencies?: string[];
      defaultCurrency?: string;
    };
    companyTier?: {
      options?: Array<{ value: string; label: string }>;
    };
    primaryMarkets?: {
      options?: Array<{ value: string; label: string }>;
    };
    geographicFocus?: {
      placeholder?: string;
    };
    notes?: {
      placeholder?: string;
    };
  };
  value?: CompanyProfileData;
  onChange: (value: CompanyProfileData) => void;
  disabled?: boolean;
}

export default function CompanyProfileLegoBlock({
  questionData,
  value = {},
  onChange,
  disabled = false
}: CompanyProfileLegoBlockProps) {
  // Initialize formData with default values from field configuration
  const initializeWithDefaults = (initialValue: CompanyProfileData): CompanyProfileData => {
    const result = { ...initialValue };
    
    // Check if questionData has fields array (from database schema)
    if (questionData && typeof questionData === 'object' && 'fields' in questionData) {
      const fields = questionData.fields;
      if (Array.isArray(fields)) {
        fields.forEach((field) => {
          // Set default value if field is empty OR if it's undefined
          if (field.defaultValue && (!result[field.id as keyof CompanyProfileData] || result[field.id as keyof CompanyProfileData] === '')) {
            (result as any)[field.id] = field.defaultValue;
          }
        });
      }
    }
    return result;
  };

  const [formData, setFormData] = useState<CompanyProfileData>(() => initializeWithDefaults(value));

  useEffect(() => {
    const initializedValue = initializeWithDefaults(value);
    setFormData(initializedValue);
    
    // If we added default values, notify parent immediately
    if (JSON.stringify(initializedValue) !== JSON.stringify(value)) {
      onChange(initializedValue);
    }
  }, [value, questionData]);

  const handleChange = (field: keyof CompanyProfileData, fieldValue: any) => {
    const newData = { ...formData, [field]: fieldValue };
    setFormData(newData);
    onChange(newData);
  };

  const handleGWPChange = (field: 'amount' | 'currency', fieldValue: string) => {
    const newGWP = { ...formData.gwp, [field]: fieldValue };
    handleChange('gwp', newGWP);
  };

  const handleMarketToggle = (market: string, checked: boolean) => {
    const isComplexValue = typeof formData.primaryMarkets === 'object' && formData.primaryMarkets !== null && 'selected' in formData.primaryMarkets;
    const currentMarkets = isComplexValue ? (formData.primaryMarkets as any).selected : (formData.primaryMarkets || []);
    const otherText = isComplexValue ? (formData.primaryMarkets as any).other : '';
    
    const newMarkets = checked
      ? [...currentMarkets, market]
      : currentMarkets.filter((m: string) => m !== market);
    
    if (isComplexValue) {
      handleChange('primaryMarkets', { selected: newMarkets, other: otherText });
    } else {
      handleChange('primaryMarkets', newMarkets);
    }
  };

  // Default tier options if not provided in questionData
  const defaultTierOptions = [
    { value: 'small', label: 'Small (<£100M)' },
    { value: 'mid', label: 'Mid (£100M-£3B)' },
    { value: 'large', label: 'Large (>£3B)' }
  ];
  
  // Default market options if not provided in questionData
  const defaultMarketOptions = [
    { value: 'personal_lines', label: 'Personal Lines' },
    { value: 'commercial_lines', label: 'Commercial Lines' },
    { value: 'specialty_lines', label: 'Specialty Lines' },
    { value: 'reinsurance', label: 'Reinsurance' }
  ];

  const tierOptions = questionData.companyTier?.options || defaultTierOptions;
  const marketOptions = questionData.primaryMarkets?.options || defaultMarketOptions;
  const currencies = questionData.gwp?.currencies || ['GBP', 'USD', 'EUR'];

  return (
    <div className="space-y-6">
      {/* Company Name - Read-only display */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5" />
            Company Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Company Name Input */}
          <div className="space-y-2">
            <Label className="text-base font-semibold text-gray-900">Company Name</Label>
            <Input
              value={formData.companyName || ''}
              onChange={(e) => handleChange('companyName', e.target.value)}
              disabled={disabled}
              placeholder="Enter company name"
              className="w-full"
            />
          </div>

          {/* Gross Written Premium */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-semibold text-gray-900">
              <DollarSign className="h-4 w-4" />
              Gross Written Premium (GWP)
            </Label>
            <div className="flex gap-2">
              <Select
                value={formData.gwp?.currency || questionData.gwp?.defaultCurrency || 'GBP'}
                onValueChange={(currency) => handleGWPChange('currency', currency)}
                disabled={disabled}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder={questionData.gwp?.placeholder || "e.g., £850M"}
                value={formData.gwp?.amount || ''}
                onChange={(e) => handleGWPChange('amount', e.target.value)}
                disabled={disabled}
                className="flex-1"
              />
            </div>
          </div>

          {/* Company Tier */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-semibold text-gray-900">
              <Target className="h-4 w-4" />
              Company Tier
            </Label>
            <RadioGroup
              value={typeof formData.companyTier === 'object' ? formData.companyTier.selected : (formData.companyTier || '')}
              onValueChange={(value) => {
                if (value === '__other__') {
                  handleChange('companyTier', { selected: '__other__', other: '' });
                } else if (typeof formData.companyTier === 'object') {
                  handleChange('companyTier', { selected: value, other: formData.companyTier.other });
                } else {
                  handleChange('companyTier', value);
                }
              }}
              disabled={disabled}
              className="grid grid-cols-1 gap-2"
            >
              {tierOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`tier-${option.value}`} />
                  <Label 
                    htmlFor={`tier-${option.value}`} 
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
              
              {/* Other option */}
              <div className="space-y-2 border-t pt-2 mt-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="__other__" id="tier-other" />
                  <Label htmlFor="tier-other" className="text-sm font-normal cursor-pointer">
                    Other (please specify)
                  </Label>
                </div>
                {(typeof formData.companyTier === 'object' && formData.companyTier.selected === '__other__') && (
                  <div className="ml-6">
                    <Input
                      placeholder="Please specify..."
                      value={formData.companyTier.other}
                      onChange={(e) => handleChange('companyTier', { selected: '__other__', other: e.target.value })}
                      disabled={disabled}
                      className="text-sm"
                    />
                  </div>
                )}
              </div>
            </RadioGroup>
          </div>

          {/* Primary Markets */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-semibold text-gray-900">
              <Target className="h-4 w-4" />
              Primary Markets
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {marketOptions.map((option) => {
                const isComplexValue = typeof formData.primaryMarkets === 'object' && formData.primaryMarkets !== null && 'selected' in formData.primaryMarkets;
                const currentMarkets = isComplexValue ? (formData.primaryMarkets as any).selected : (formData.primaryMarkets || []);
                
                return (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`market-${option.value}`}
                      checked={currentMarkets.includes(option.value)}
                      onCheckedChange={(checked) => 
                        handleMarketToggle(option.value, checked as boolean)
                      }
                      disabled={disabled}
                    />
                    <Label 
                      htmlFor={`market-${option.value}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                );
              })}
              
              {/* Other option for markets */}
              <div className="col-span-2 space-y-2 border-t pt-2 mt-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="market-other"
                    checked={typeof formData.primaryMarkets === 'object' && formData.primaryMarkets !== null && 'other' in formData.primaryMarkets}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        const currentMarkets = Array.isArray(formData.primaryMarkets) ? formData.primaryMarkets : [];
                        handleChange('primaryMarkets', { selected: currentMarkets, other: '' });
                      } else {
                        const isComplexValue = typeof formData.primaryMarkets === 'object' && formData.primaryMarkets !== null && 'selected' in formData.primaryMarkets;
                        if (isComplexValue) {
                          handleChange('primaryMarkets', (formData.primaryMarkets as any).selected);
                        }
                      }
                    }}
                    disabled={disabled}
                  />
                  <Label htmlFor="market-other" className="text-sm font-normal cursor-pointer">
                    Other (please specify)
                  </Label>
                </div>
                {(typeof formData.primaryMarkets === 'object' && formData.primaryMarkets !== null && 'other' in formData.primaryMarkets) && (
                  <div className="ml-6">
                    <Input
                      placeholder="Please specify other markets..."
                      value={(formData.primaryMarkets as any).other}
                      onChange={(e) => {
                        const currentMarkets = (formData.primaryMarkets as any).selected || [];
                        handleChange('primaryMarkets', { selected: currentMarkets, other: e.target.value });
                      }}
                      disabled={disabled}
                      className="text-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Geographic Focus */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-semibold text-gray-900">
              <Globe className="h-4 w-4" />
              Geographic Focus
            </Label>
            <Input
              placeholder={questionData.geographicFocus?.placeholder || "e.g., UK, Europe, North America"}
              value={formData.geographicFocus || ''}
              onChange={(e) => handleChange('geographicFocus', e.target.value)}
              disabled={disabled}
            />
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-base font-semibold text-gray-900">
              <FileText className="h-4 w-4" />
              Additional Context & Notes
            </Label>
            <Textarea
              placeholder={questionData.notes?.placeholder || "Additional context about RSA's market position, strategy, or business profile..."}
              value={formData.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              disabled={disabled}
              rows={4}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}