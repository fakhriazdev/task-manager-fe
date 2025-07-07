'use client'

import { Button } from '@/components/ui/button'
import {Sheet, SheetClose, SheetContent, SheetDescription,SheetFooter, SheetHeader, SheetTitle,} from '@/components/ui/sheet'
import { Store, storeSchema } from '../../data/schemas'
import { Formik, Form, Field, ErrorMessage, FieldProps } from 'formik'
import { roleForm } from '../../data/roleForm'
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from '@/components/ui/select'
import {useRegionAction,} from '@/lib/region/useRegionAction'
import { useAddStore, useUpdateStore } from "@/lib/store/useStoreAction"
import {Region} from "@/lib/region/regionType";


interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRow?: Store
}

const schema = storeSchema.pick({
    id: true,
    brand: true,
    regionId: true,
    address: true,
    statusActive: true,
})

export default function StoreActionDrawer({ open, onOpenChange, currentRow }: Props) {
    const { mutate: updateStore } = useUpdateStore()
    const { mutate: addStore } = useAddStore()
    const isUpdate = !!currentRow
    const {
        data: regions,
        isFetching: isFetchingRegions,
    } = useRegionAction()

    const initialValues: Store = {
        id: currentRow?.id || '',
        brand: currentRow?.brand || '',
        regionId: currentRow?.regionId || '',
        address: currentRow?.address || '',
        statusActive: currentRow?.statusActive ?? false,
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className='flex flex-col'>
                <SheetHeader className='text-left'>
                    <SheetTitle>{isUpdate ? 'Update' : 'Create'} Store</SheetTitle>
                    <SheetDescription>
                        {isUpdate ? 'Update the store' : 'Add a new store'}.
                    </SheetDescription>
                </SheetHeader>

                <Formik
                    initialValues={initialValues}
                    validate={roleForm(schema)}
                    onSubmit={(values, actions) => {
                        if (isUpdate) {
                            updateStore(
                                { id: currentRow.id, data: values },
                                {
                                    onSuccess: () => {
                                        actions.setSubmitting(false)
                                        onOpenChange(false)
                                    },
                                    onError: () => {
                                        actions.setSubmitting(false)
                                    },
                                }
                            )
                        } else {
                            addStore(
                                { data: values },
                                {
                                    onSuccess: () => {
                                        actions.setSubmitting(false)
                                        onOpenChange(false)
                                    },
                                    onError: () => {
                                        actions.setSubmitting(false)
                                    },
                                }
                            )
                        }
                    }}
                >
                    {({ isSubmitting, isValid, dirty, errors, touched }) => (
                        <Form className='flex flex-col gap-4 px-4'>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor='id' className='text-sm font-medium'>Store ID</label>
                                <Field
                                    name='id'
                                    type='text'
                                    className={`mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring ${
                                        touched.id && errors.id ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                <ErrorMessage name='id' component='div' className='text-sm text-red-500 mt-1' />
                            </div>

                            <div>
                                <label htmlFor='brand' className='text-sm font-medium'>Brand</label>
                                <Field
                                    name='brand'
                                    type='text'
                                    className={`mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring ${
                                        touched.brand && errors.brand ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                <ErrorMessage name='brand' component='div' className='text-sm text-red-500 mt-1' />
                            </div>
                            </div>
                            <div>
                                <label htmlFor='address' className='text-sm font-medium'>Address</label>
                                <Field
                                    name='address'
                                    as='textarea'
                                    className={`mt-1 w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring ${
                                        touched.address && errors.address ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                <ErrorMessage name='address' component='div' className='text-sm text-red-500 mt-1' />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor='statusActive' className='text-sm font-medium'>Status</label>
                                <Field name='statusActive'>
                                    {({ field, form }: FieldProps<boolean>) => (
                                        <Select
                                            value={String(field.value)}
                                            onValueChange={(value) => form.setFieldValue('statusActive', value === 'true')}

                                        >
                                            <SelectTrigger className='mt-1 w-full'>
                                                <SelectValue placeholder='Select status' />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="true">Active</SelectItem>
                                                <SelectItem value="false">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                </Field>
                                <ErrorMessage name='statusActive' component='div' className='text-sm text-red-500 mt-1' />
                            </div>
                                <div>
                                    <label htmlFor="regionId" className="text-sm font-medium">Region</label>
                                    <Field name="regionId">
                                        {({ field, form }: FieldProps<string>) => (
                                            <Select
                                                value={field.value}
                                                onValueChange={(value) => form.setFieldValue('regionId', value)}
                                            >
                                                <SelectTrigger className="mt-1 w-full">
                                                    <SelectValue placeholder="Select region" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {isFetchingRegions && (
                                                        <SelectItem disabled value="loading">
                                                            Loading...
                                                        </SelectItem>
                                                    )}
                                                    {regions?.map((region: Region) => (
                                                        <SelectItem key={region.id} value={region.id}>
                                                            {region.id}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </Field>
                                    <ErrorMessage name="regionId" component="div" className="text-sm text-red-500 mt-1" />
                                </div>
                            </div>



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
