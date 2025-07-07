'use client'

import { Button } from '@/components/ui/button'
import {Sheet, SheetClose, SheetContent, SheetDescription,SheetFooter, SheetHeader, SheetTitle,} from '@/components/ui/sheet'
import { User, userSchema } from '../../data/schemas'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import { roleForm } from '../../data/roleForm'

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRow?: User
}

const schema = userSchema.pick({
    nik: true,
    nama: true,
    noTelp: true,
    email: true,
    roleId: true,
    accessStores: true,
    accessRegions: true,
    statusActive: true,
})

export default function UserActionDrawer({ open, onOpenChange, currentRow }: Props) {
    const isUpdate = !!currentRow
    //butuh fetch getRoles, getStores
    const initialValues: User = {
        nik: currentRow?.nik || '',
        nama: currentRow?.nama || '',
        noTelp: currentRow?.noTelp || '',
        email: currentRow?.email || '',
        roleId: currentRow?.roleId || '',
        accessStores: currentRow?.accessStores ?? [],
        accessRegions: currentRow?.accessRegions ?? [],
        statusActive: currentRow?.statusActive ?? false,

    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className='flex flex-col'>
                <SheetHeader className='text-left'>
                    <SheetTitle>{isUpdate ? 'Update' : 'Create new'} user</SheetTitle>
                    <SheetDescription>
                        {isUpdate ? 'Update the user' : 'Add a new user'}.
                    </SheetDescription>
                </SheetHeader>

                <Formik
                    initialValues={initialValues}
                    validate={roleForm(schema)}
                    onSubmit={(values, actions) => {
                        if (isUpdate) {
                            // updateStore(
                            //     { id: currentRow.id, data: values },
                            //     {
                            //         onSuccess: () => {
                            //             actions.setSubmitting(false)
                            //             onOpenChange(false)
                            //         },
                            //         onError: () => {
                            //             actions.setSubmitting(false)
                            //         },
                            //     }
                            // )
                        } else {
                            // addStore(
                            //     { data: values },
                            //     {
                            //         onSuccess: () => {
                            //             actions.setSubmitting(false)
                            //             onOpenChange(false)
                            //         },
                            //         onError: () => {
                            //             actions.setSubmitting(false)
                            //         },
                            //     }
                            // )
                        }
                    }}
                >
                    {({ isSubmitting, isValid, dirty, errors, touched }) => (
                        <Form className='flex flex-col gap-4 px-4'>
                            <div>
                                <label htmlFor='roleId' className='text-sm font-medium'>Select Role</label>
                                <Field
                                    name='roleId'
                                    type='roleId'
                                    className={`mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring ${
                                        touched.roleId && errors.roleId ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                <ErrorMessage name='roleId' component='div' className='text-sm text-red-500 mt-1' />
                            </div>
                            <div className="flex gap-2">
                                <div>
                                    <label htmlFor='nik' className='text-sm font-medium'>NIK</label>
                                    <Field
                                        name='nik'
                                        type='text'
                                        className={`mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring ${
                                            touched.nik && errors.nik ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    <ErrorMessage name='nik' component='div' className='text-sm text-red-500 mt-1' />
                                </div>
                                <div>
                                    <label htmlFor='nama' className='text-sm font-medium'>Nama</label>
                                    <Field
                                        name='nama'
                                        type='text'
                                        className={`mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring ${
                                            touched.nama && errors.nama ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    />
                                    <ErrorMessage name='nama' component='div' className='text-sm text-red-500 mt-1' />
                                </div>
                            </div>

                            <div>
                                <label htmlFor='noTelp' className='text-sm font-medium'>No Telepon</label>
                                <Field
                                    name='noTelp'
                                    type='text'
                                    className={`mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring ${
                                        touched.noTelp && errors.noTelp ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                <ErrorMessage name='noTelp' component='div' className='text-sm text-red-500 mt-1' />
                            </div>
                            <div>
                                <label htmlFor='email' className='text-sm font-medium'>Email</label>
                                <Field
                                    name='email'
                                    type='email'
                                    className={`mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring ${
                                        touched.email && errors.email ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                <ErrorMessage name='noTelp' component='div' className='text-sm text-red-500 mt-1' />
                            </div>

                            {/*nanti ganti ke role dengan status aktif*/}
                            {/*<div className='grid grid-cols-2 gap-2'>*/}
                            {/*    <div>*/}
                            {/*        <label htmlFor='province' className='text-sm font-medium'>Province</label>*/}
                            {/*        <Field name='province'>*/}
                            {/*            {({ field, form }: FieldProps<string>) => (*/}
                            {/*                <Select*/}
                            {/*                    value={field.value}*/}
                            {/*                    onValueChange={(value) => {*/}
                            {/*                        form.setFieldValue('province', value)*/}
                            {/*                        const selected = provinceDatas?.find((p) => p.name === value)*/}
                            {/*                        setSelectedProvinceCode(selected?.code || null)*/}
                            {/*                        form.setFieldValue('regency', '')*/}
                            {/*                    }}*/}
                            {/*                >*/}
                            {/*                    <SelectTrigger className='mt-1 w-full'>*/}
                            {/*                        <SelectValue placeholder='Select province' />*/}
                            {/*                    </SelectTrigger>*/}
                            {/*                    <SelectContent>*/}
                            {/*                        {provinceDatas?.map((prov:Cabang) => (*/}
                            {/*                            <SelectItem key={prov.code} value={prov.name}>*/}
                            {/*                                {prov.name}*/}
                            {/*                            </SelectItem>*/}
                            {/*                        ))}*/}
                            {/*                    </SelectContent>*/}
                            {/*                </Select>*/}
                            {/*            )}*/}
                            {/*        </Field>*/}
                            {/*        <ErrorMessage name='province' component='div' className='text-sm text-red-500 mt-1' />*/}
                            {/*    </div>*/}

                            {/*    <div>*/}
                            {/*        <label htmlFor='regency' className='text-sm font-medium'>Regency</label>*/}
                            {/*        <Field name='regency'>*/}
                            {/*            {({ field, form }: FieldProps<string>) => (*/}
                            {/*                <Select*/}
                            {/*                    value={field.value}*/}
                            {/*                    onValueChange={(value) => form.setFieldValue('regency', value)}*/}
                            {/*                    disabled={!selectedProvinceCode}*/}
                            {/*                >*/}
                            {/*                    <SelectTrigger className='mt-1 w-full'>*/}
                            {/*                        <SelectValue placeholder='Select regency' />*/}
                            {/*                    </SelectTrigger>*/}
                            {/*                    <SelectContent>*/}
                            {/*                        {regencyDatas?.map((reg:Cabang) => (*/}
                            {/*                            <SelectItem key={reg.code} value={reg.name}>*/}
                            {/*                                {reg.name}*/}
                            {/*                            </SelectItem>*/}
                            {/*                        ))}*/}
                            {/*                    </SelectContent>*/}
                            {/*                </Select>*/}
                            {/*            )}*/}
                            {/*        </Field>*/}
                            {/*        <ErrorMessage name='regency' component='div' className='text-sm text-red-500 mt-1' />*/}
                            {/*    </div>*/}
                            {/*</div>*/}
                            {/*nah ini nanti dropdown pilih store bawahnya pakai tagging dengan ada siliang kalau lepas tag store*/}
                            {/*<div>*/}
                            {/*    <label htmlFor='address' className='text-sm font-medium'>Address</label>*/}
                            {/*    <Field*/}
                            {/*        name='address'*/}
                            {/*        type='text'*/}
                            {/*        className={`mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring ${*/}
                            {/*            touched.address && errors.address ? 'border-red-500' : 'border-gray-300'*/}
                            {/*        }`}*/}
                            {/*    />*/}
                            {/*    <ErrorMessage name='address' component='div' className='text-sm text-red-500 mt-1' />*/}
                            {/*</div>*/}

                            <SheetFooter className='gap-2 mt-auto'>
                                <SheetClose asChild>
                                    <Button variant='outline' type='button'>Close</Button>
                                </SheetClose>
                                <Button
                                    type='submit'
                                    disabled={isSubmitting || !isValid || !dirty}
                                >
                                    {isSubmitting ? 'Saving...' : isUpdate ? 'Update' : 'Create'}
                                </Button>
                            </SheetFooter>
                        </Form>
                    )}
                </Formik>
            </SheetContent>
        </Sheet>
    )
}
