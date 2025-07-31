'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FileSpreadsheet, Upload, AlertCircle } from "lucide-react";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    status: "Active" | "Inactive";
}

interface PromosiImportModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function PromosiImportModal({ open, onOpenChange }: PromosiImportModalProps) {
    const [fileName, setFileName] = useState('');
    const [isPreviewOpen, setIsPreviewOpen] = useState(true);
    const [previewData, setPreviewData] = useState<User[]>([]);
    const [formData, setFormData] = useState({
        category: '',
        startDate: '',
        endDate: '',
        description: '',
        autoApprove: false,
        sendNotification: true,
    });

    const mockPreviewData: User[] = [
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Manager', status: 'Active' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Staff', status: 'Active' },
        { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'Admin', status: 'Inactive' },
        { id: '4', name: 'Alice Brown', email: 'alice@example.com', role: 'Staff', status: 'Active' },
        { id: '5', name: 'Charlie Wilson', email: 'charlie@example.com', role: 'Manager', status: 'Active' },
    ];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            setPreviewData(mockPreviewData);
            setIsPreviewOpen(true);
        }
    };

    const handleImport = () => {
        console.log('Importing with data:', { fileName, formData, previewData });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="min-w-full h-full p-0">
                <div className="flex h-full w-full">
                    <div className="flex-1 border-r bg-muted overflow-hidden flex flex-col">
                        <div className="p-2 border-b bg-background">
                            <h3 className="font-medium mb-3 flex items-center gap-2">
                                <FileSpreadsheet className="h-4 w-4" />
                                File Preview
                            </h3>
                        </div>
                        {isPreviewOpen && previewData.length > 0 && (
                            <div className="p-6 overflow-auto">
                                <table className="w-full text-sm border">
                                    <thead className="sticky top-0 bg-muted text-xs text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-2 text-left">ID</th>
                                        <th className="px-4 py-2 text-left">Name</th>
                                        <th className="px-4 py-2 text-left">Email</th>
                                        <th className="px-4 py-2 text-left">Role</th>
                                        <th className="px-4 py-2 text-center">Status</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {previewData.map((user) => (
                                        <tr key={user.id} className="border-t hover:bg-accent">
                                            <td className="px-4 py-2">{user.id}</td>
                                            <td className="px-4 py-2">{user.name}</td>
                                            <td className="px-4 py-2">{user.email}</td>
                                            <td className="px-4 py-2">{user.role}</td>
                                            <td className="px-4 py-2 text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{user.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                                <p className="mt-2 text-xs text-muted-foreground">{previewData.length} records found</p>
                            </div>
                        )}
                        <div className={"my-auto p-4"}>
                            {isPreviewOpen && (
                                <div className=" border-2 border-dashed rounded-md p-8 text-center text-sm text-muted-foreground">
                                    <Upload className="mx-auto mb-3 w-8 h-8" />
                                    <p className="mb-2">Pilih file Excel (.xls/.xlsx)</p>
                                    <Input type="file" accept=".xls,.xlsx" onChange={handleFileChange} />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="w-80 bg-background flex flex-col justify-between">
                        <div className="p-6">
                            <DialogHeader>
                                <DialogTitle>Import Promosi</DialogTitle>
                                <DialogDescription className="text-xs">
                                    Upload file Excel dan lengkapi pengaturan
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                                <div className="space-y-1">
                                    <Label>Category</Label>
                                    <Select value={formData.category} onValueChange={(val) => setFormData(f => ({ ...f, category: val }))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih kategori" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="seasonal">Seasonal</SelectItem>
                                            <SelectItem value="flash-sale">Flash Sale</SelectItem>
                                            <SelectItem value="regular">Regular</SelectItem>
                                            <SelectItem value="clearance">Clearance</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label>Start Date</Label>
                                    <Input type="date" value={formData.startDate} onChange={(e) => setFormData(f => ({ ...f, startDate: e.target.value }))} />
                                </div>
                                <div className="space-y-1">
                                    <Label>End Date</Label>
                                    <Input type="date" value={formData.endDate} onChange={(e) => setFormData(f => ({ ...f, endDate: e.target.value }))} />
                                </div>
                                <div className="space-y-1">
                                    <Label>Description</Label>
                                    <Textarea rows={3} placeholder="Optional description..." value={formData.description} onChange={(e) => setFormData(f => ({ ...f, description: e.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Checkbox checked={formData.autoApprove} onCheckedChange={(val) => setFormData(f => ({ ...f, autoApprove: !!val }))} />
                                        <Label className="text-sm">Auto-approve imports</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Checkbox checked={formData.sendNotification} onCheckedChange={(val) => setFormData(f => ({ ...f, sendNotification: !!val }))} />
                                        <Label className="text-sm">Send notification</Label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {fileName && (
                            <div className="bg-yellow-50 border-t px-4 py-3 text-sm flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 mt-0.5 text-yellow-600" />
                                <div>
                                    <p className="font-medium text-yellow-800">Validation</p>
                                    <ul className="mt-1 text-yellow-700 space-y-1">
                                        <li>• {previewData.length} records ready to import</li>
                                        <li>• All fields valid</li>
                                        <li>• No duplicates found</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        <div className="p-6 border-t flex gap-2">
                            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button className="flex-1" onClick={handleImport} disabled={!previewData.length || !formData.category}>Import</Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}