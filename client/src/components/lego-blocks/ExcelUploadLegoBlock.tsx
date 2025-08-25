import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ImportResult {
  success: boolean;
  importedCount: number;
  updatedCount: number;
  errors: string[];
  isValid?: boolean;
  summary: {
    strategic: number;
    aiInventory: number;
    industry: number;
  };
}

interface ExcelUploadLegoBlockProps {
  className?: string;
  onImportComplete?: (result: ImportResult) => void;
}

/**
 * LEGO Block for Excel Use Case Upload
 * Handles file selection, validation, and import with progress tracking
 */
export default function ExcelUploadLegoBlock({ 
  className = '',
  onImportComplete 
}: ExcelUploadLegoBlockProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [validationResult, setValidationResult] = useState<ImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please select an Excel file (.xlsx or .xls)",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setValidationResult(null);

    // Auto-validate file
    validateFile(file);
  };

  const validateFile = async (file: File) => {
    if (!file) return;

    setIsValidating(true);
    setValidationResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/import/excel/validate', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setValidationResult(result);
        
        if (result.isValid) {
          toast({
            title: "File Validated Successfully",
            description: `Found ${result.importedCount + result.updatedCount} valid use cases`,
          });
        } else {
          toast({
            title: "Validation Issues Found",
            description: `${result.errors.length} errors detected. Review before importing.`,
            variant: "destructive",
          });
        }
      } else {
        throw new Error(result.error || 'Validation failed');
      }

    } catch (error) {
      console.error('Validation error:', error);
      toast({
        title: "Validation Failed",
        description: error instanceof Error ? error.message : "Unable to validate file",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !validationResult?.isValid) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('mode', importMode);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const response = await fetch('/api/import/excel/use-cases', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Import Completed",
          description: `${result.importedCount} use cases imported, ${result.updatedCount} updated`,
        });

        // Reset state
        setSelectedFile(null);
        setValidationResult(null);
        
        // Notify parent component
        onImportComplete?.(result);

      } else {
        throw new Error(result.error || 'Import failed');
      }

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Unable to import file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const renderValidationResults = () => {
    if (!validationResult) return null;

    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          {validationResult.isValid ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600" />
          )}
          <span className="font-medium">
            {validationResult.isValid ? 'File Valid' : 'Validation Issues'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
          <div>
            <span className="text-gray-600">Strategic:</span>
            <span className="ml-2 font-medium">{validationResult.summary.strategic}</span>
          </div>
          <div>
            <span className="text-gray-600">AI Inventory:</span>
            <span className="ml-2 font-medium">{validationResult.summary.aiInventory}</span>
          </div>
          <div>
            <span className="text-gray-600">Industry:</span>
            <span className="ml-2 font-medium">{validationResult.summary.industry}</span>
          </div>
        </div>

        {validationResult.errors.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium text-red-600 mb-2">Errors:</p>
            <ul className="text-xs text-red-600 space-y-1 max-h-32 overflow-y-auto">
              {validationResult.errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-blue-600" />
          Excel Use Case Upload
        </CardTitle>
        <CardDescription>
          Upload Excel files with use case data using the same format as exports.
          Supports append (update existing) or replace (clear and rebuild) modes.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* File Selection */}
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            {selectedFile ? (
              <div className="space-y-2">
                <FileSpreadsheet className="h-8 w-8 mx-auto text-green-600" />
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-gray-600">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFileSelect}
                  className="mt-2"
                >
                  Choose Different File
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="h-8 w-8 mx-auto text-gray-400" />
                <div>
                  <p className="font-medium">Select Excel File</p>
                  <p className="text-sm text-gray-600">
                    Choose .xlsx or .xls file exported from RSA Framework
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleFileSelect}
                  disabled={isValidating || isUploading}
                >
                  Browse Files
                </Button>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Import Mode Selection */}
        {selectedFile && (
          <div className="space-y-3">
            <Label className="text-base font-semibold">Import Mode</Label>
            <RadioGroup
              value={importMode}
              onValueChange={(value) => setImportMode(value as 'append' | 'replace')}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="append" id="append" />
                <Label htmlFor="append" className="cursor-pointer">
                  <div>
                    <p className="font-medium">Append & Update</p>
                    <p className="text-xs text-gray-600">Add new, update existing</p>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="replace" id="replace" />
                <Label htmlFor="replace" className="cursor-pointer">
                  <div>
                    <p className="font-medium">Replace All</p>
                    <p className="text-xs text-gray-600">Clear library, rebuild</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Validation Loading */}
        {isValidating && (
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-sm font-medium">Validating file...</span>
          </div>
        )}

        {/* Validation Results */}
        {renderValidationResults()}

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Importing use cases...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" />
          </div>
        )}

        {/* Import Button */}
        {selectedFile && validationResult && (
          <Button
            onClick={handleImport}
            disabled={!validationResult.isValid || isUploading || isValidating}
            className="w-full"
            size="lg"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import {validationResult.summary.strategic + validationResult.summary.aiInventory + validationResult.summary.industry} Use Cases
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}