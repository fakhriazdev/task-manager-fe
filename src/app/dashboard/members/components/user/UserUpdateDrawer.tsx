'use client'

import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import {
    updateUserSchema,
    Role,
    Store,
    Region,
    UserUpdate,
} from '@/app/dashboard/members/schemas/schemas'
import { useEffect, useState } from 'react'
import { ErrorMessage, Field, FieldProps, Form, Formik } from 'formik'
import { useUpdateUser } from '@/lib/user/useUserAction'
import { MultiSelect } from '@/components/MultiSelect'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useRolesAction } from '@/lib/roles/useRolesAction'
import { useStoreAction } from '@/lib/store/useStoreAction'
import { useRegionAction } from '@/lib/region/useRegionAction'
import { applyRoleBasedAccessRules, validateForm } from '@/utils/validateForm'

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    children?: React.ReactNode
    currentRow: UserUpdate
}

export default function UserUpdateDrawer({ open, onOpenChange, currentRow }: Props) {
    const [roleField, setRoleField] = useState({
        fieldRegion: false,
        fieldStores: false,
        fieldHandleWeb: false,
    })
    const { data: roles, isLoading: loadingRoles } = useRolesAction()
    const { data: store, isLoading: loadingStore } = useStoreAction()
    const { data: regions, isLoading: loadingRegions } = useRegionAction()
    const { mutate: updateUser } = useUpdateUser()

    // Set field visibility berdasarkan role awal (data existing)
    useEffect(() => {
        const roleId = currentRow?.roleId

        switch (roleId) {
            case 'SUPER':
            case 'ADMIN':
            case 'STAFF':
                setRoleField({ fieldStores: false, fieldRegion: false, fieldHandleWeb: true })
                break
            case 'SC':
            case 'SPV':
            case 'SPVJ':
            case 'CASHIER':
                setRoleField({ fieldStores: true, fieldRegion: false, fieldHandleWeb: false })
                break
            case 'AC':
                setRoleField({ fieldStores: false, fieldRegion: true, fieldHandleWeb: false })
                break
            default:
                setRoleField({ fieldStores: false, fieldRegion: false, fieldHandleWeb: false })
        }
    }, [currentRow?.roleId])

    const handleRoleChange = (
        roleId: string,
        setFieldValue: (field: string, value: unknown) => void,
    ) => {
        setFieldValue('accessStoreIds', [])
        setFieldValue('accessRegionIds', [])

        switch (roleId) {
            case 'SUPER':
            case 'ADMIN':
            case 'STAFF':
                setRoleField({ fieldStores: false, fieldRegion: false, fieldHandleWeb: true })
                break
            case 'SC':
            case 'SPV':
            case 'SPVJ':
            case 'CASHIER':
                setRoleField({ fieldStores: true, fieldRegion: false, fieldHandleWeb: false })
                break
            case 'AC':
                setRoleField({ fieldStores: false, fieldRegion: true, fieldHandleWeb: false })
                break
            default:
                setRoleField({ fieldStores: false, fieldRegion: false, fieldHandleWeb: false })
        }
    }

    const initialValues: UserUpdate = {
        nik: currentRow.nik,
        nama: currentRow.nama,
        noTelp: currentRow.noTelp,
        email: currentRow.email,
        roleId: currentRow.roleId,
        accessStoreIds: currentRow.accessStoreIds ?? [],
        accessRegionIds: currentRow.accessRegionIds ?? [],
        statusActive: currentRow.statusActive ?? true,
        handleWeb: currentRow.handleWeb ?? false,
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="flex flex-col">
                <SheetHeader className="text-left">
                    <SheetTitle>Edit Profile - {currentRow.nama}</SheetTitle>
                    <SheetDescription>NIK {currentRow.nik}</SheetDescription>
                </SheetHeader>

                <Formik
                    initialValues={initialValues}
                    enableReinitialize
                    validate={validateForm(applyRoleBasedAccessRules(updateUserSchema))}
                    onSubmit={(values, actions) => {
                        updateUser(
                            {
                                nik: currentRow.nik,
                                data: values,
                            },
                            {
                                onSuccess: () => {
                                    actions.setSubmitting(false)
                                    onOpenChange(false)
                                },
                                onError: () => {
                                    actions.setSubmitting(false)
                                },
                            },
                        )
                    }}
                >
                    {({ isSubmitting, isValid, errors, dirty, touched, values, setFieldValue }) => (
                        <Form className="flex flex-col gap-4 px-4 overflow-y-auto">
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
                                                const selected = e.target.value
                                                setFieldValue('roleId', selected)
                                                handleRoleChange(selected, setFieldValue)
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
                                <ErrorMessage
                                    name="roleId"
                                    component="div"
                                    className="text-sm text-red-500 mt-1"
                                />
                            </div>

                            {/* Nama */}
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="text-sm font-medium">Nama</label>
                                    <Field
                                        name="nama"
                                        type="text"
                                        className={`mt-1 w-full rounded border px-3 py-2 text-sm ${
                                            touched.nama && errors.nama ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    <ErrorMessage
                                        name="nama"
                                        component="div"
                                        className="text-sm text-red-500 mt-1"
                                    />
                                </div>
                            </div>

                            {/* No Telp */}
                            <div>
                                <label className="text-sm font-medium">No Telepon</label>
                                <Field
                                    name="noTelp"
                                    type="text"
                                    className={`mt-1 w-full rounded border px-3 py-2 text-sm ${
                                        touched.noTelp && errors.noTelp ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                <ErrorMessage
                                    name="noTelp"
                                    component="div"
                                    className="text-sm text-red-500 mt-1"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="text-sm font-medium">Email</label>
                                <Field
                                    name="email"
                                    type="email"
                                    className={`mt-1 w-full rounded border px-3 py-2 text-sm ${
                                        touched.email && errors.email ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                <ErrorMessage
                                    name="email"
                                    component="div"
                                    className="text-sm text-red-500 mt-1"
                                />
                            </div>

                            {/* Handle Web */}
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
                                    <ErrorMessage
                                        name="handleWeb"
                                        component="div"
                                        className="text-sm text-red-500 mt-1"
                                    />
                                </div>
                            )}

                            {/* Access Stores */}
                            {roleField.fieldStores && (
                                <Field name="accessStoreIds">
                                    {({ field, form }: FieldProps<{ storeId: string }[]>) => (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Access Stores</label>
                                            <MultiSelect
                                                key={`stores-${values.roleId}`}
                                                options={
                                                    store?.map((s: Store) => ({ label: s.id, value: s.id })) || []
                                                }
                                                values={field.value.map((s) => s.storeId)}
                                                onChange={(selected) =>
                                                    form.setFieldValue(
                                                        'accessStoreIds',
                                                        selected.map((val) => ({ storeId: val })),
                                                    )
                                                }
                                                disabled={loadingStore}
                                            />
                                            <div className="flex flex-wrap gap-2">
                                                {field.value.map((val) => {
                                                    const label =
                                                        store?.find((s) => s.id === val.storeId)?.id ?? val.storeId
                                                    return (
                                                        <Badge key={val.storeId} variant="secondary">
                                                            {label}
                                                        </Badge>
                                                    )
                                                })}
                                            </div>
                                            <ErrorMessage
                                                name="accessStoreIds"
                                                component="div"
                                                className="text-sm text-red-500 mt-1"
                                            />
                                        </div>
                                    )}
                                </Field>
                            )}

                            {/* Access Regions */}
                            {roleField.fieldRegion && (
                                <Field name="accessRegionIds">
                                    {({ field, form }: FieldProps<{ regionId: string }[]>) => (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Access Regions</label>
                                            <MultiSelect
                                                key={`regions-${values.roleId}`}
                                                options={
                                                    regions?.map((r: Region) => ({ label: r.id, value: r.id })) || []
                                                }
                                                values={field.value.map((r) => r.regionId)}
                                                onChange={(selected) =>
                                                    form.setFieldValue(
                                                        'accessRegionIds',
                                                        selected.map((val) => ({ regionId: val })),
                                                    )
                                                }
                                                disabled={loadingRegions}
                                            />
                                            <div className="flex flex-wrap gap-2">
                                                {field.value.map((val) => {
                                                    const label =
                                                        regions?.find((r) => r.id === val.regionId)?.id ??
                                                        val.regionId
                                                    return (
                                                        <Badge key={val.regionId} variant="secondary">
                                                            {label}
                                                        </Badge>
                                                    )
                                                })}
                                            </div>
                                            <ErrorMessage
                                                name="accessRegionIds"
                                                component="div"
                                                className="text-sm text-red-500 mt-1"
                                            />
                                        </div>
                                    )}
                                </Field>
                            )}

                            {/* Status */}
                            <div>
                                <label htmlFor="statusActive" className="text-sm font-medium">
                                    Status
                                </label>
                                <Field name="statusActive">
                                    {({ field, form }: FieldProps<boolean>) => (
                                        <select
                                            {...field}
                                            className={`mt-1 w-full rounded border px-3 py-2 text-sm ${
                                                touched.statusActive && errors.statusActive
                                                    ? 'border-red-500'
                                                    : 'border-gray-300'
                                            }`}
                                            value={field.value ? 'true' : 'false'}
                                            onChange={(e) =>
                                                form.setFieldValue('statusActive', e.target.value === 'true')
                                            }
                                        >
                                            <option value="true">Active</option>
                                            <option value="false">Inactive</option>
                                        </select>
                                    )}
                                </Field>
                                <ErrorMessage
                                    name="statusActive"
                                    component="div"
                                    className="text-sm text-red-500 mt-1"
                                />
                            </div>

                            {/* Footer */}
                            <SheetFooter className="gap-2 mt-auto pt-4">
                                <SheetClose asChild>
                                    <Button variant="outline" type="button">
                                        Close
                                    </Button>
                                </SheetClose>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !isValid || !dirty}
                                >
                                    {isSubmitting ? 'Saving...' : 'Update'}
                                </Button>
                            </SheetFooter>
                        </Form>
                    )}
                </Formik>
            </SheetContent>
        </Sheet>
    )
}
