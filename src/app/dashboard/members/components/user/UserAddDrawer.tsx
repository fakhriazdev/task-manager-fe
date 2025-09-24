'use client';

import { Button } from '@/components/ui/button';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import {createUserSchema, Region, Role, Store} from '@/app/dashboard/members/schemas/schemas';
import { Formik, Form, Field, ErrorMessage, FieldProps } from 'formik';
import { useRolesAction } from '@/lib/roles/useRolesAction';
import { useStoreAction } from '@/lib/store/useStoreAction';
import { useRegionAction } from '@/lib/region/useRegionAction';
import { useState } from 'react';
import { applyRoleBasedAccessRules, validateForm } from '@/utils/validateForm';
import { useAddUser } from '@/lib/user/useUserAction';
import { MultiSelect } from '@/components/MultiSelect';
import {Badge} from '@/components/ui/badge';
import {NewUser} from "@/lib/user/userType";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function UserAddDrawer({ open, onOpenChange }: Props) {
    const { data: roles, isLoading: loadingRoles } = useRolesAction();
    const { data: stores, isLoading: loadingStore } = useStoreAction();
    const { data: regions, isLoading: loadingRegions } = useRegionAction();
    const { mutate: addUser } = useAddUser();

    const [roleField, setRoleField] = useState({
        fieldRegion: false,
        fieldStores: false,
        fieldHandleWeb:false
    });

    const initialValues: NewUser = {
        nik: '',
        nama: '',
        noTelp: '',
        email: '',
        password: '',
        roleId: '',
        accessStoreIds: [],
        accessRegionIds: [],
        statusActive: false,
        handleWeb: false,
    };

    const handleRoleChange = (
        roleId: string,
        setFieldValue: (field: string, value: []) => void
    ) => {
        setFieldValue('accessStoreIds', []);
        setFieldValue('accessRegionIds', []);

        switch (roleId) {
            case 'SUPER':
                setRoleField({ fieldStores: false, fieldRegion: false, fieldHandleWeb: true });
                break
            case 'ADMIN':
                setRoleField({ fieldStores: false, fieldRegion: false, fieldHandleWeb: true });
                break
            case 'SC':
            case 'SPV':
            case 'SPVJ':
            case 'CASHIER':
                setRoleField({ fieldStores: true, fieldRegion: false, fieldHandleWeb: false });
                break;
            case 'AC':
                setRoleField({ fieldStores: false, fieldRegion: true, fieldHandleWeb: false  });
                break;
            default:
                setRoleField({ fieldStores: false, fieldRegion: false, fieldHandleWeb: false  });
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="flex flex-col">
                <SheetHeader className="text-left">
                    <SheetTitle>Create new user</SheetTitle>
                    <SheetDescription>Add a new user.</SheetDescription>
                </SheetHeader>

                <Formik
                    initialValues={initialValues}
                    enableReinitialize
                    validate={validateForm(applyRoleBasedAccessRules(createUserSchema))}
                    onSubmit={(values, actions) => {
                        addUser(values, {
                            onSuccess: () => {
                                actions.setSubmitting(false);
                                onOpenChange(false);
                            },
                            onError: () => {
                                actions.setSubmitting(false);
                            },
                        });
                    }}
                >
                    {({ isSubmitting, touched, isValid, setFieldValue, values }) => {
                        console.log(values)
                        return(
                        <Form className="flex flex-col gap-2 px-4 overflow-y-auto">

                            {/* Role */}
                            <div>
                                <label className="text-sm font-medium">Role</label>
                                <Field name="roleId">
                                    {({ field }: FieldProps<string>) => (
                                        <select
                                            className="mt-1 w-full rounded border px-3 py-2 text-sm"
                                            value={field.value}
                                            disabled={loadingRoles}
                                            onChange={(e) => {
                                                const selected = e.target.value;
                                                setFieldValue('roleId', selected);
                                                handleRoleChange(selected, setFieldValue);
                                            }}
                                        >
                                            <option value="">Select role</option>
                                            {roles?.map((role: Role) => (
                                                <option key={role.id} value={role.id}>
                                                    {role.nama}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </Field>
                                <ErrorMessage name="roleId" component="div" className="text-sm text-red-500 mt-1" />
                            </div>

                            {/* NIK */}
                            <div>
                                <label className="text-sm font-normal">NIK</label>
                                <Field name="nik">
                                    {({ field }: FieldProps) => (
                                        <input {...field} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
                                    )}
                                </Field>
                                <ErrorMessage name="nik" component="div" className="text-sm text-red-500 mt-1" />
                            </div>

                            {/* Nama */}
                            <div>
                                <label className="text-sm font-normal">Nama</label>
                                <Field name="nama">
                                    {({ field }: FieldProps) => (
                                        <input {...field} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
                                    )}
                                </Field>
                                <ErrorMessage name="nama" component="div" className="text-sm text-red-500 mt-1" />
                            </div>

                            {/* No Telepon */}
                            <div>
                                <label className="text-sm font-normal">No Telepon</label>
                                <Field name="noTelp">
                                    {({ field }: FieldProps) => (
                                        <input {...field} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
                                    )}
                                </Field>
                                <ErrorMessage name="noTelp" component="div" className="text-sm text-red-500 mt-1" />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="text-sm font-normal">Email</label>
                                <Field name="email">
                                    {({ field }: FieldProps) => (
                                        <input {...field} type="email" className="mt-1 w-full rounded border px-3 py-2 text-sm" />
                                    )}
                                </Field>
                                <ErrorMessage name="email" component="div" className="text-sm text-red-500 mt-1" />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="text-sm font-normal">Password</label>
                                <Field name="password">
                                    {({ field }: FieldProps) => (
                                        <input {...field} type="password" className="mt-1 w-full rounded border px-3 py-2 text-sm" />
                                    )}
                                </Field>
                                <ErrorMessage name="password" component="div" className="text-sm text-red-500 mt-1" />
                            </div>

                            {roleField.fieldHandleWeb && (
                                <div>
                                    <label className="text-sm font-medium">Handle Web</label>
                                    <Field name="handleWeb">
                                        {({ field }: FieldProps<boolean>) => (
                                            <select
                                                {...field}
                                                className="mt-1 w-full rounded border px-3 py-2 text-sm"
                                                value={field.value ? 'true' : 'false'}
                                                onChange={(e) => setFieldValue('handleWeb', e.target.value === 'true')}
                                            >
                                                <option value="true">YES</option>
                                                <option value="false">NO</option>
                                            </select>
                                        )}
                                    </Field>
                                    <ErrorMessage name="handleWeb" component="div" className="text-sm text-red-500 mt-1" />
                                </div>
                            )}

                            {/* Status */}
                            <div>
                                <label className="text-sm font-medium">Status</label>
                                <Field name="statusActive">
                                    {({ field }: FieldProps<boolean>) => (
                                        <select
                                            {...field}
                                            className="mt-1 w-full rounded border px-3 py-2 text-sm"
                                            value={field.value ? 'true' : 'false'}
                                            onChange={(e) => setFieldValue('statusActive', e.target.value === 'true')}
                                        >
                                            <option value="true">Active</option>
                                            <option value="false">Inactive</option>
                                        </select>
                                    )}
                                </Field>
                                <ErrorMessage name="statusActive" component="div" className="text-sm text-red-500 mt-1" />
                            </div>

                            {/* Access Stores */}
                            {roleField.fieldStores && (
                                <Field name="accessStoreIds">
                                    {({ field, form, meta }: FieldProps<{ storeId: string }[]>) => (
                                        <div className="space-y-2">
                                            <label className="text-sm font-normal">Access Stores</label>
                                            <MultiSelect
                                                key={`stores-${values.roleId}`}
                                                options={stores?.map((s: Store) => ({ label: s.id, value: s.id })) || []}
                                                values={field.value.map((s) => s.storeId)}
                                                onChange={(selected) =>
                                                    form.setFieldValue(
                                                        'accessStoreIds',
                                                        selected.map((val) => ({ storeId: val }))
                                                    )
                                                }
                                                disabled={loadingStore}
                                            />
                                            <div className="flex flex-wrap gap-2">
                                                {field.value.map((val) => {
                                                    const label = stores?.find((s) => s.id === val.storeId)?.id ?? val.storeId;
                                                    return (
                                                        <Badge key={val.storeId} variant="secondary">
                                                            {label}
                                                        </Badge>
                                                    );
                                                })}
                                            </div>
                                            {meta.touched && meta.error && (
                                                <div className="text-sm text-red-500 mt-1">{meta.error as string}</div>
                                            )}
                                        </div>
                                    )}
                                </Field>
                            )}

                            {/* Access Regions */}
                            {roleField.fieldRegion && (
                                <Field name="accessRegionIds">
                                    {({ field, form, meta }: FieldProps<{ regionId: string }[]>) => (
                                        <div className="space-y-2">
                                            <label className="text-sm font-normal">Access Regions</label>
                                            <MultiSelect
                                                key={`regions-${values.roleId}`}
                                                options={regions?.map((r: Region) => ({ label: r.id, value: r.id })) || []}
                                                values={field.value.map((r) => r.regionId)}
                                                onChange={(selected) =>
                                                    form.setFieldValue(
                                                        'accessRegionIds',
                                                        selected.map((val) => ({ regionId: val }))
                                                    )
                                                }
                                                disabled={loadingRegions}
                                            />
                                            <div className="flex flex-wrap gap-2">
                                                {field.value.map((val) => {
                                                    const label = regions?.find((r) => r.id === val.regionId)?.id ?? val.regionId;
                                                    return (
                                                        <Badge key={val.regionId} variant="secondary">
                                                            {label}
                                                        </Badge>
                                                    );
                                                })}
                                            </div>
                                            {meta.touched && meta.error && (
                                                <div className="text-sm text-red-500 mt-1">{meta.error as string}</div>
                                            )}
                                        </div>
                                    )}
                                </Field>
                            )}


                            <SheetFooter className="gap-2 mt-auto pt-4">
                                <SheetClose asChild>
                                    <Button variant="outline" type="button">
                                        Close
                                    </Button>
                                </SheetClose>
                                <Button type="submit" disabled={isSubmitting || !isValid || Object.keys(touched).length === 0}>
                                    {isSubmitting ? 'Saving...' : 'Create'}
                                </Button>
                            </SheetFooter>
                        </Form>
                    )}}
                </Formik>
            </SheetContent>
        </Sheet>
    );
}
