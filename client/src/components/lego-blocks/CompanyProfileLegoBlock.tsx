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
  companyTier?: string;
  primaryMarkets?: string[];
  geographicFocus?: string;
  notes?: string;
}

interface CompanyProfileLegoBlockProps {
  questionData: {
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
  const [formData, setFormData] = useState<CompanyProfileData>(value);

  useEffect(() => {
    setFormData(value);
  }, [value]);

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
    const currentMarkets = formData.primaryMarkets || [];
    const newMarkets = checked
      ? [...currentMarkets, market]
      : currentMarkets.filter(m => m !== market);
    handleChange('primaryMarkets', newMarkets);
  };

  const tierOptions = questionData.companyTier?.options || [];
  const marketOptions = questionData.primaryMarkets?.options || [];
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
          {/* Company Name Display */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Company Name</Label>
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border rounded-md text-sm">
              {questionData.companyName || "RSA Insurance"}
            </div>
          </div>

          {/* Gross Written Premium */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
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
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Target className="h-4 w-4" />
              Company Tier
            </Label>
            <RadioGroup
              value={formData.companyTier || ''}
              onValueChange={(value) => handleChange('companyTier', value)}
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
            </RadioGroup>
          </div>

          {/* Primary Markets */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Target className="h-4 w-4" />
              Primary Markets
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {marketOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`market-${option.value}`}
                    checked={(formData.primaryMarkets || []).includes(option.value)}
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
              ))}
            </div>
          </div>

          {/* Geographic Focus */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
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
            <Label className="flex items-center gap-2 text-sm font-medium">
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