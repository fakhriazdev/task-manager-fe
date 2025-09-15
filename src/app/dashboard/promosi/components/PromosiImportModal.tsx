'use client';

import React, { useState, useEffect } from 'react';
import { read, utils } from 'xlsx';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from '@/components/ui/select';
import {
    FileSpreadsheet,
    Upload,
    AlertCircle,
    CheckCircle,
    XCircle,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

interface PromosiImportModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onImportComplete?: (data: any) => void;
}

interface ValidationResult {
    isValid: boolean;
    errors: string[];
    validRows: number;
    totalRows: number;
    missingFields: string[];
}

const PARSING_RULES: Record<string, {
    requiredFields: string[];
    description: string;
    example: Record<string, string>;
}> = {
    'seasonal': {
        requiredFields: ['product_code', 'discount', 'start_date', 'end_date'],
        description: 'Seasonal promotions with time-based discounts',
        example: {
            product_code: 'PROD001',
            discount: '15',
            start_date: '2024-01-01',
            end_date: '2024-01-31'
        }
    },
    'flash-sale': {
        requiredFields: ['sku', 'price', 'flash_start', 'flash_end'],
        description: 'Time-limited flash sales with special pricing',
        example: {
            sku: 'SKU001',
            price: '99.99',
            flash_start: '2024-01-15 10:00',
            flash_end: '2024-01-15 18:00'
        }
    },
    'regular': {
        requiredFields: ['product_code', 'price'],
        description: 'Regular price updates without time constraints',
        example: {
            product_code: 'PROD001',
            price: '149.99'
        }
    },
    'clearance': {
        requiredFields: ['product_code', 'clearance_price', 'clearance_reason'],
        description: 'Clearance items with discounted pricing',
        example: {
            product_code: 'PROD001',
            clearance_price: '49.99',
            clearance_reason: 'End of season'
        }
    },
};

function validateExcelData(category: string, rawData: any[]): ValidationResult {
    const rules = PARSING_RULES[category];
    if (!rules) {
        return {
            isValid: false,
            errors: ['Invalid category selected'],
            validRows: 0,
            totalRows: 0,
            missingFields: []
        };
    }

    const errors: string[] = [];
    const missingFields = new Set<string>();
    let validRows = 0;

    if (!rawData || rawData.length === 0) {
        return {
            isValid: false,
            errors: ['No data found in Excel file'],
            validRows: 0,
            totalRows: 0,
            missingFields: []
        };
    }

    const availableColumns = Object.keys(rawData[0] || {});
    const missingRequiredFields = rules.requiredFields.filter(
        field => !availableColumns.includes(field)
    );

    if (missingRequiredFields.length > 0) {
        errors.push(`Missing required columns: ${missingRequiredFields.join(', ')}`);
        missingRequiredFields.forEach(field => missingFields.add(field));
    }

    for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i];
        let rowValid = true;
        const rowErrors: string[] = [];

        for (const field of rules.requiredFields) {
            const value = row[field];
            if (value === undefined || value === null || value === '') {
                rowErrors.push(`Row ${i + 1}: Missing value for '${field}'`);
                missingFields.add(field);
                rowValid = false;
            }
        }

        if (rowErrors.length > 0) {
            errors.push(...rowErrors);
        }

        if (rowValid) {
            validRows++;
        }
    }

    return {
        isValid: validRows > 0 && missingRequiredFields.length === 0,
        errors,
        validRows,
        totalRows: rawData.length,
        missingFields: Array.from(missingFields)
    };
}

function parseExcelData(category: string, rawData: any[]): {
    parsed: any[];
    columns: string[];
    validation: ValidationResult;
} {
    const rules = PARSING_RULES[category];
    const validation = validateExcelData(category, rawData);

    if (!rules || !validation.isValid) {
        return {
            parsed: [],
            columns: rules?.requiredFields || [],
            validation
        };
    }

    const parsed: any[] = [];

    for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i];
        const parsedRow: Record<string, any> = {};

        let valid = true;
        for (const field of rules.requiredFields) {
            const value = row[field];
            if (value === undefined || value === null || value === '') {
                valid = false;
                break;
            }
            parsedRow[field] = value;
        }

        if (valid) {
            parsed.push(parsedRow);
        }
    }

    return {
        parsed,
        columns: rules.requiredFields,
        validation: {
            ...validation,
            validRows: parsed.length
        }
    };
}

export default function PromosiImportModal({ open, onOpenChange, onImportComplete }: PromosiImportModalProps) {
    const [fileName, setFileName] = useState('');
    const [isPreviewOpen, setIsPreviewOpen] = useState(true);
    const [isImporting, setIsImporting] = useState(false);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const [validation, setValidation] = useState<ValidationResult | null>(null);
    const [rawData, setRawData] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        category: '',
        startDate: '',
        endDate: '',
        description: '',
        autoApprove: false,
        sendNotification: true,
    });
    const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target?.result as ArrayBuffer);
                const workbook = read(data, { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData: any[] = utils.sheet_to_json(worksheet);
                setRawData(jsonData);
                if (jsonData.length && formData.category) {
                    const { parsed, columns: cols, validation: val } = parseExcelData(formData.category, jsonData);
                    setPreviewData(parsed);
                    setColumns(cols);
                    setValidation(val);
                    setIsPreviewOpen(true);
                } else {
                    setPreviewData([]);
                    setColumns([]);
                    setValidation(null);
                }
            } catch (error) {
                console.error('Error reading Excel file:', error);
                setValidation({
                    isValid: false,
                    errors: ['Failed to read Excel file. Please ensure it\'s a valid .xlsx or .xls file.'],
                    validRows: 0,
                    totalRows: 0,
                    missingFields: []
                });
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleImport = async () => {
        if (!validation?.isValid || previewData.length === 0) return;
        setIsImporting(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            const importData = {
                fileName,
                category: formData.category,
                data: previewData,
                settings: formData,
                summary: {
                    totalRows: validation.totalRows,
                    validRows: validation.validRows,
                    importedRows: previewData.length
                }
            };
            console.log('Import completed:', importData);
            onImportComplete?.(importData);
            onOpenChange(false);
            setFileName('');
            setPreviewData([]);
            setColumns([]);
            setValidation(null);
            setRawData([]);
            setFormData({
                category: '',
                startDate: '',
                endDate: '',
                description: '',
                autoApprove: false,
                sendNotification: true,
            });
        } catch (err) {
            console.error('Import failed:', err);
            setValidation(prev => prev ? {
                ...prev,
                errors: [...prev.errors, 'Import failed. Please try again.']
            } : null);
        } finally {
            setIsImporting(false);
        }
    };

    useEffect(() => {
        if (rawData.length > 0 && formData.category) {
            const { parsed, columns: cols, validation: val } = parseExcelData(formData.category, rawData);
            setPreviewData(parsed);
            setColumns(cols);
            setValidation(val);
        } else {
            setPreviewData([]);
            setColumns([]);
            setValidation(null);
        }
    }, [formData.category, rawData]);

    useEffect(() => {
        if (!open) {
            setFileName('');
            setPreviewData([]);
            setColumns([]);
            setValidation(null);
            setRawData([]);
            setIsPreviewOpen(true);
        }
    }, [open]);

    const selectedRule = formData.category ? PARSING_RULES[formData.category] : null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="min-w-full h-full p-0">
                <div className="flex h-full w-full">
                    <div className="flex-1 border-r relative">
                        <div className="h-full">
                            {/* LEFT PANEL CONTENT (file preview, validation, table, etc.) */}
                            <div className="p-4 border-b bg-background">
                                <h3 className="font-medium flex items-center gap-2">
                                    <FileSpreadsheet className="h-4 w-4" /> File Preview
                                </h3>
                            </div>
                            {/* Preview Table */}
                            {isPreviewOpen && previewData.length > 0 && (
                                <div className="flex-1 overflow-scroll w-full">
                                    <div className="p-4">
                                        <div className="border rounded-lg overflow-hidden">
                                            <table className="w-full text-sm min-w-max">
                                                <thead className="bg-muted">
                                                <tr>
                                                    {columns.map((col) => (
                                                        <th key={col} className="px-4 py-3 text-left font-medium whitespace-nowrap">
                                                            {col}
                                                        </th>
                                                    ))}
                                                </tr>
                                                </thead>
                                                <tbody className="bg-white">
                                                {previewData.slice(0, 100).map((row, idx) => (
                                                    <tr key={idx} className="border-t hover:bg-accent/50">
                                                        {columns.map((col) => (
                                                            <td key={col} className="px-4 py-3 whitespace-nowrap">
                                                                {String(row[col] ?? '')}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                                            <span>{previewData.length} valid records found</span>
                                            {previewData.length > 100 && (
                                                <span>Showing first 100 rows</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* File Upload Area */}
                            {!fileName && (
                                <div className="h-full flex flex-col my-auto items-center justify-center">
                                    <div className="border-2 border-dashed rounded-lg p-12 text-center max-w-md">
                                        <Upload className="mx-auto mb-4 w-12 h-12 text-muted-foreground" />
                                        <p className="mb-4 font-medium">Upload Excel File</p>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Select a .xlsx or .xls file to import promotion data
                                        </p>
                                        <Input
                                            type="file"
                                            accept=".xls,.xlsx"
                                            onChange={handleFileChange}
                                            className="max-w-xs"
                                        />
                                    </div>
                                </div>
                            )}

                            {fileName && !previewData.length && !validation?.isValid && (
                                <div className="h-full flex flex-col my-auto items-center justify-center">
                                    <div className="text-center max-w-md">
                                        <AlertCircle className="mx-auto mb-4 w-12 h-12 text-yellow-500" />
                                        <p className="mb-2 font-medium">File uploaded: {fileName}</p>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Please select a category to validate and preview the data
                                        </p>
                                        <Button
                                            variant="outline"
                                            onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                                        >
                                            Choose Different File
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className={`transition-all duration-300 ${isSidebarMinimized ? 'w-18' : 'w-96'} bg-background flex flex-col border-l relative`}>
                        <button
                            onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
                            className="absolute -left-5 top-4 z-20 bg-background border rounded-full p-1 shadow"
                        >
                            {isSidebarMinimized ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                        </button>
                        {!isSidebarMinimized && (
                            <div className="h-full">
                                {/* RIGHT PANEL FORM CONTENT */}
                                <div className="p-6 flex flex-col justify-between h-full">
                                    <DialogHeader className="mb-6">
                                        <DialogTitle>Import Promosi</DialogTitle>
                                        <DialogDescription>
                                            Upload file Excel dan lengkapi pengaturan import
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="flex-1 overflow-y-scroll">
                                        <div className="w-full pace-y-2">
                                            <div className="space-y-2">
                                                <Label>Category *</Label>
                                                <Select
                                                    value={formData.category}
                                                    onValueChange={(val) =>
                                                        setFormData((f) => ({ ...f, category: val }))
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih kategori promosi" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="seasonal">Seasonal</SelectItem>
                                                        <SelectItem value="flash-sale">Flash Sale</SelectItem>
                                                        <SelectItem value="regular">Regular</SelectItem>
                                                        <SelectItem value="clearance">Clearance</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {selectedRule && (
                                                    <div className="p-3 bg-blue-50 rounded-md border mb-6">
                                                        <p className="text-sm font-medium text-blue-900">
                                                            Required Excel Columns:
                                                        </p>
                                                        <div className="flex flex-wrap gap-1">
                                                        </div>
                                                        <div className="mt-3 text-xs text-blue-700">
                                                            <p className="font-medium mb-1">Example row:</p>
                                                            {Object.entries(selectedRule.example).map(([key, value]) => (
                                                                <div key={key} className="flex justify-between">
                                                                    <span className="font-mono">{key}:</span>
                                                                    <span className="font-mono text-blue-600">{value}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-6">
                                                <div className="space-y-2">
                                                    <Label>Start Date</Label>
                                                    <Input
                                                        type="date"
                                                        value={formData.startDate}
                                                        onChange={(e) =>
                                                            setFormData((f) => ({ ...f, startDate: e.target.value }))
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>End Date</Label>
                                                    <Input
                                                        type="date"
                                                        value={formData.endDate}
                                                        onChange={(e) =>
                                                            setFormData((f) => ({ ...f, endDate: e.target.value }))
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Section */}
                                    {fileName && validation && (
                                        <div className={`border-t px-6 py-4 ${
                                            validation.isValid ? 'bg-green-50' : 'bg-red-50'
                                        }`}>
                                            <div className="flex items-start gap-3">
                                                {validation.isValid ? (
                                                    <CheckCircle className="w-5 h-5 mt-0.5 text-green-600" />
                                                ) : (
                                                    <XCircle className="w-5 h-5 mt-0.5 text-red-600" />
                                                )}
                                                <div className="flex-1">
                                                    <p className={`font-medium text-sm ${
                                                        validation.isValid ? 'text-green-800' : 'text-red-800'
                                                    }`}>
                                                        {validation.isValid ? 'Ready to Import' : 'Validation Failed'}
                                                    </p>
                                                    <div className={`mt-1 text-xs ${
                                                        validation.isValid ? 'text-green-700' : 'text-red-700'
                                                    }`}>
                                                        <p>File: {fileName}</p>
                                                        <p>Valid rows: {validation.validRows} of {validation.totalRows}</p>
                                                        <p>Category: {formData.category}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {/* Action Buttons */}
                                    <div className="p-2 border-t flex gap-1">
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => onOpenChange(false)}
                                            disabled={isImporting}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            className="flex-1"
                                            onClick={handleImport}
                                            disabled={!validation?.isValid || !formData.category || isImporting}
                                        >
                                            {isImporting ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
                                                    Importing...
                                                </div>
                                            ) : (
                                                `Import ${previewData.length} Records`
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
